/* ===== 心网 Store - Network Nodes & Worldview ===== */
import { reactive } from 'vue'
import { networkNodes, networkEdges, worldviewData } from '../mock/data.js'
import { getStoreKey, getCloudDB, authState } from './useAuthStore.js'

const BASE_KEY = 'xinjie_xinwang'
const CLOUD_NODES = 'xinwang_nodes'
const CLOUD_EDGES = 'xinwang_edges'
const CLOUD_WORLDVIEW = 'worldview_entries'
const CLOUD_RECS = 'xinwang_recommendations'

function loadState() {
  try {
    const saved = uni.getStorageSync(getStoreKey(BASE_KEY))
    if (saved) return JSON.parse(saved)
  } catch (e) { /* ignore */ }
  return null
}

function saveState(state) {
  try {
    uni.setStorageSync(getStoreKey(BASE_KEY), JSON.stringify(state))
  } catch (e) { /* ignore */ }
}

function _isFirstUser() {
  if (!authState.uid) return true // logged out → empty
  try { return !uni.getStorageSync(getStoreKey(BASE_KEY)) } catch (e) { return true }
}

const saved = loadState()

export const xinwangState = reactive({
  nodes: saved?.nodes?.length ? saved.nodes : (_isFirstUser() ? [] : [...networkNodes]),
  edges: saved?.edges?.length ? saved.edges : (_isFirstUser() ? [] : [...networkEdges]),
  worldview: saved?.worldview || (_isFirstUser()
    ? { shixiang: [], woxing: [], xincheng: [] }
    : { shixiang: [...worldviewData.shixiang], woxing: [...worldviewData.woxing], xincheng: [...worldviewData.xincheng] }
  ),
  currentDimension: 'overview',
  recommendations: saved?.recommendations || (_isFirstUser() ? [] : [
    { title: '允许一切发生', desc: '关于包容与流动的世界观' },
    { title: '极简主义生活', desc: '减少依赖，回归本质' },
    { title: '长期主义者', desc: '在变化中寻找恒定价值' }
  ]),
  recommendationsDate: saved?.recommendationsDate || ''
})

export function reloadLocal() {
  const data = loadState()
  xinwangState.nodes = data?.nodes?.length ? data.nodes : (_isFirstUser() ? [] : [...networkNodes])
  xinwangState.edges = data?.edges?.length ? data.edges : (_isFirstUser() ? [] : [...networkEdges])
  xinwangState.worldview = data?.worldview || (_isFirstUser()
    ? { shixiang: [], woxing: [], xincheng: [] }
    : { shixiang: [...worldviewData.shixiang], woxing: [...worldviewData.woxing], xincheng: [...worldviewData.xincheng] })
  xinwangState.currentDimension = 'overview'
  xinwangState.recommendations = data?.recommendations || (_isFirstUser() ? [] : [
    { title: '允许一切发生', desc: '关于包容与流动的世界观' },
    { title: '极简主义生活', desc: '减少依赖，回归本质' },
    { title: '长期主义者', desc: '在变化中寻找恒定价值' }
  ])
  xinwangState.recommendationsDate = data?.recommendationsDate || ''
  xinwangState._deletedNodeIds = data?._deletedNodeIds || []
}

function _save() {
  saveState({
    nodes: xinwangState.nodes,
    edges: xinwangState.edges,
    worldview: xinwangState.worldview,
    recommendations: xinwangState.recommendations,
    recommendationsDate: xinwangState.recommendationsDate,
    _deletedNodeIds: xinwangState._deletedNodeIds || []
  })
  saveToCloud()
}

// ========== Cloud sync ==========

async function saveToCloud() {
  const db = getCloudDB()
  if (!db || !authState.uid) return
  const uid = authState.uid

  // Helper: upsert one doc per user per collection
  async function upsert(collection, data) {
    try {
      const coll = db.collection(collection)
      const res = await coll.where({ uid }).get()
      if (res.data && res.data.length > 0) {
        await coll.doc(res.data[0]._id).update({ ...data, updatedAt: new Date() })
      } else {
        await coll.add({ ...data, uid, createdAt: new Date() })
      }
    } catch (e) {
      console.error(`[xinwang] Cloud save ${collection} failed:`, e.message || e)
    }
  }

  await Promise.all([
    upsert(CLOUD_NODES, { nodes: xinwangState.nodes, edges: xinwangState.edges, _deletedNodeIds: xinwangState._deletedNodeIds || [] }),
    upsert(CLOUD_WORLDVIEW, { worldview: xinwangState.worldview }),
    upsert(CLOUD_RECS, { recommendations: xinwangState.recommendations, recommendationsDate: xinwangState.recommendationsDate })
  ])
}

export async function syncFromCloud(uid) {
  const db = getCloudDB()
  if (!db) return

  async function pull(collection) {
    try {
      const res = await db.collection(collection).where({ uid }).get()
      return (res.data && res.data.length > 0) ? res.data[0] : null
    } catch (e) {
      console.error(`[xinwang] Cloud pull ${collection} failed:`, e.message || e)
      return null
    }
  }

  try {
    const [nodesDoc, worldviewDoc, recsDoc] = await Promise.all([
      pull(CLOUD_NODES),
      pull(CLOUD_WORLDVIEW),
      pull(CLOUD_RECS)
    ])

    if (nodesDoc) {
      // Restore deleted IDs from cloud so they survive across sessions
      if (nodesDoc._deletedNodeIds?.length) {
        xinwangState._deletedNodeIds = nodesDoc._deletedNodeIds
      }
      const deletedSet = new Set(xinwangState._deletedNodeIds || [])
      if (nodesDoc.nodes?.length) {
        xinwangState.nodes = nodesDoc.nodes.filter(n => !deletedSet.has(n.id))
      }
      if (nodesDoc.edges?.length) {
        xinwangState.edges = nodesDoc.edges.filter(e => !deletedSet.has(e.from) && !deletedSet.has(e.to))
      }
    }
    if (worldviewDoc?.worldview) {
      xinwangState.worldview = worldviewDoc.worldview
    }
    if (recsDoc) {
      if (recsDoc.recommendations?.length) xinwangState.recommendations = recsDoc.recommendations
      if (recsDoc.recommendationsDate) xinwangState.recommendationsDate = recsDoc.recommendationsDate
    }

    // Persist to local cache
    saveState({
      nodes: xinwangState.nodes,
      edges: xinwangState.edges,
      worldview: xinwangState.worldview,
      recommendations: xinwangState.recommendations,
      recommendationsDate: xinwangState.recommendationsDate,
      _deletedNodeIds: xinwangState._deletedNodeIds || []
    })
  } catch (e) {
    console.error('[xinwang] Cloud sync failed:', e.message || e)
  }
}

// --- Nodes ---
export function addNode(node) {
  const size = (node.type === 'hub') ? 72 : 48
  xinwangState.nodes.push({
    id: `n${Date.now()}`,
    label: node.label,
    x: clampX(node.x || 60 + Math.random() * 480, size),
    y: clampY(node.y || 40 + Math.random() * 440, size),
    type: node.type || 'normal',
    status: node.status || 'in-progress',
    from: node.from || ''
  })
  _save()
}

// [🔥] Canvas boundary helpers — 600rpx × 600rpx
function clampX(x, size) { return Math.max(0, Math.min(600 - (size || 48), x)) }
function clampY(y, size) { return Math.max(0, Math.min(600 - (size || 48), y)) }

export function addNodeAutoConnect(node) {
  const size = (node.type === 'hub') ? 72 : 48
  const newNode = {
    id: `n${Date.now()}`,
    label: node.label,
    x: clampX(node.x || 60 + Math.random() * 480, size),
    y: clampY(node.y || 40 + Math.random() * 440, size),
    type: node.type || 'normal',
    status: node.status || 'in-progress',
    from: node.from || '',
    delta: node.delta,
    sourceId: node.sourceId || '',
    sourceType: node.sourceType || ''
  }
  xinwangState.nodes.push(newNode)
  _autoConnect(newNode)
  _save()
  return newNode
}

// Internal: connect new node to similar existing nodes and hub
function _autoConnect(newNode) {
  const existing = xinwangState.nodes.filter(n => n.id !== newNode.id)
  existing.forEach(n => {
    const overlap = [...newNode.label].filter(c => n.label.includes(c) && c.length > 0)
    if (overlap.length >= 2 || newNode.label.includes(n.label) || n.label.includes(newNode.label)) {
      if (!xinwangState.edges.find(e =>
        (e.from === newNode.id && e.to === n.id) || (e.from === n.id && e.to === newNode.id)
      )) {
        xinwangState.edges.push({ from: newNode.id, to: n.id })
      }
    }
  })

  const hub = xinwangState.nodes.find(n => n.type === 'hub')
  if (hub && hub.id !== newNode.id) {
    if (!xinwangState.edges.find(e =>
      (e.from === newNode.id && e.to === hub.id) || (e.from === hub.id && e.to === newNode.id)
    )) {
      xinwangState.edges.push({ from: hub.id, to: newNode.id })
    }
  }
}

// Cascade delete: remove node by its source record/conversation ID
export function removeNodeBySource(sourceId) {
  if (!sourceId) return
  const nodeIdx = xinwangState.nodes.findIndex(n => n.sourceId === sourceId)
  if (nodeIdx !== -1) {
    const nodeId = xinwangState.nodes[nodeIdx].id
    xinwangState.nodes.splice(nodeIdx, 1)
    xinwangState.edges = xinwangState.edges.filter(e => e.from !== nodeId && e.to !== nodeId)
    // Track deleted so syncFromCloud won't restore it
    if (!xinwangState._deletedNodeIds) xinwangState._deletedNodeIds = []
    xinwangState._deletedNodeIds.push(nodeId)
    _save()
  }
}

export function updateNode(id, data) {
  const node = xinwangState.nodes.find(n => n.id === id)
  if (node) {
    Object.assign(node, data)
    _save()
  }
}

export function connectNodes(fromId, toId) {
  if (!xinwangState.edges.find(e =>
    (e.from === fromId && e.to === toId) || (e.from === toId && e.to === fromId)
  )) {
    xinwangState.edges.push({ from: fromId, to: toId })
    _save()
  }
}

export function setDimension(dim) {
  xinwangState.currentDimension = dim
}

// --- Worldview ---
export function addWorldviewItem(category, content) {
  const now = new Date()
  const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
  xinwangState.worldview[category].push({
    id: `w${Date.now()}`,
    content,
    isAnchor: false,
    date: dateStr
  })
  _save()
}

export function removeWorldviewItem(category, id) {
  xinwangState.worldview[category] = xinwangState.worldview[category].filter(w => w.id !== id)
  _save()
}

export function toggleAnchor(category, id) {
  const item = xinwangState.worldview[category].find(w => w.id === id)
  if (item) {
    item.isAnchor = !item.isAnchor
    _save()
  }
}

export function acceptRecommendation(rec) {
  addWorldviewItem(rec.cat || 'shixiang', rec.title)
}

const DEFAULT_RECS = [
  { title: '允许一切发生', desc: '关于包容与流动的世界观', cat: 'shixiang' },
  { title: '极简主义生活', desc: '减少依赖，回归本质', cat: 'woxing' },
  { title: '长期主义者', desc: '在变化中寻找恒定价值', cat: 'xincheng' }
]

export async function refreshRecommendations() {
  const today = new Date()
  const ds = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`
  if (xinwangState.recommendationsDate === ds) return

  const all = [
    ...xinwangState.worldview.shixiang.map(i => `[世相] ${i.content}`),
    ...xinwangState.worldview.woxing.map(i => `[我行] ${i.content}`),
    ...xinwangState.worldview.xincheng.map(i => `[心秤] ${i.content}`)
  ]

  try {
    const res = await uniCloud.callFunction({
      name: 'chat-api',
      data: {
        mode: 'recommend',
        worldview: all
      }
    })

    if (res.result?.code === 0 && res.result?.recs?.length) {
      xinwangState.recommendations = res.result.recs
      xinwangState.recommendationsDate = ds
      _save()
    }
  } catch (e) {
    if (!xinwangState.recommendationsDate) {
      xinwangState.recommendations = [...DEFAULT_RECS]
    }
  }
}
