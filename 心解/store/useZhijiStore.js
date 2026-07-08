/* ===== 织记 Store - Journals & Thinking Chains =====
 *  Cloud model: per-record document (industry standard)
 *  Local: localStorage per-user key for fast reads
 */
import { reactive } from 'vue'
import { zhijiRecords, suspendedItems } from '../mock/data.js'
import { getStoreKey, getCloudDB, authState } from './useAuthStore.js'
import { removeNodeBySource } from './useXinwangStore.js'

const BASE_KEY = 'xinjie_zhiji'
const CLOUD_TABLE = 'zhiji_records'

// ── local persistence ──

function loadLocal() {
  try {
    const saved = uni.getStorageSync(getStoreKey(BASE_KEY))
    if (saved) return JSON.parse(saved)
  } catch (e) { /* ignore */ }
  return null
}

function saveLocal(state) {
  try {
    uni.setStorageSync(getStoreKey(BASE_KEY), JSON.stringify(state))
  } catch (e) { /* ignore */ }
}

function _isFirstUser() {
  if (!authState.uid) return true // logged out → empty
  try { return !uni.getStorageSync(getStoreKey(BASE_KEY)) } catch (e) { return true }
}

function _deriveSuspended(records) {
  return records
    .filter(r => r.status === 'suspended')
    .map(r => ({
      id: `s_${r.id}`,
      content: (r.content || '').substring(0, 100),
      tags: r.tags || [],
      suspendedDays: r.suspendedDays || 0,
      recordId: r.id,
      stepIndex: r.stepIndex,
      source: r.source || ''
    }))
    .sort((a, b) => b.suspendedDays - a.suspendedDays)
}

const local = loadLocal()

export const zhijiState = reactive({
  records: local?.records?.length ? local.records : [...zhijiRecords],
  suspended: local?.suspended?.length ? local.suspended
    : _deriveSuspended(local?.records?.length ? local.records : [...zhijiRecords]),
  drafts: local?.drafts || {}
})

// Reload state from new user's localStorage after login/logout
export function reloadLocal() {
  const data = loadLocal()
  if (data?.records?.length) {
    zhijiState.records = data.records
    zhijiState.suspended = data.suspended || _deriveSuspended(data.records)
    zhijiState.drafts = data.drafts || {}
  } else {
    zhijiState.records = []
    zhijiState.suspended = []
    zhijiState.drafts = {}
  }
}

// ── internal helpers ──

function _saveLocal() {
  saveLocal({
    records: zhijiState.records,
    suspended: zhijiState.suspended,
    drafts: zhijiState.drafts
  })
}

function _syncSuspended() {
  zhijiState.suspended = _deriveSuspended(zhijiState.records)
}

// ── cloud CRUD (fire-and-forget, never blocks UI) ──

async function _cloudAdd(record) {
  const db = getCloudDB()
  if (!db || !authState.uid) return
  try {
    await db.collection(CLOUD_TABLE).add({
      uid: authState.uid,
      id: record.id,
      type: record.type,
      status: record.status,
      content: record.content,
      tags: record.tags || [],
      mood: record.mood || '',
      date: record.date,
      time: record.time,
      step: record.step || 0,
      totalSteps: record.totalSteps || 5,
      title: record.title || '',
      suspendedDays: record.suspendedDays || 0,
      stepIndex: record.stepIndex,
      delta: record.delta,
      source: record.source || '',
      stepsContent: record.stepsContent || [],
      createdAt: new Date()
    })
  } catch (e) {
    console.error('[zhiji] Cloud add failed:', e.message || e)
  }
}

async function _cloudUpdate(id, data) {
  const db = getCloudDB()
  if (!db || !authState.uid) return
  try {
    await db.collection(CLOUD_TABLE).where({ uid: authState.uid, id }).update(data)
  } catch (e) {
    console.error('[zhiji] Cloud update failed:', e.message || e)
  }
}

async function _cloudDelete(id) {
  const db = getCloudDB()
  if (!db || !authState.uid) return
  try {
    await db.collection(CLOUD_TABLE).where({ uid: authState.uid, id }).remove()
  } catch (e) {
    console.error('[zhiji] Cloud delete failed:', e.message || e)
  }
}

// ── Cloud sync (pull all → hydrate local) ──

export async function syncFromCloud(uid) {
  const db = getCloudDB()
  if (!db) return
  try {
    const res = await db.collection(CLOUD_TABLE)
      .where({ uid })
      .orderBy('createdAt', 'desc')
      .limit(500)
      .get()

    if (res.data && res.data.length > 0) {
      const deletedSet = new Set(zhijiState._deletedIds || [])
      zhijiState.records = res.data
        .filter(doc => !deletedSet.has(doc.id)) // skip locally deleted records
        .map(doc => ({
          id: doc.id,
          type: doc.type || 'diary',
          status: doc.status || 'none',
          content: doc.content || '',
          tags: doc.tags || [],
          mood: doc.mood || '',
          date: doc.date || '',
          time: doc.time || '',
          step: doc.step || 0,
          totalSteps: doc.totalSteps || 5,
          title: doc.title || '',
          suspendedDays: doc.suspendedDays || 0,
          stepIndex: doc.stepIndex,
          delta: doc.delta,
          source: doc.source || '',
          stepsContent: doc.stepsContent || []
        }))
      _syncSuspended()
      _saveLocal()
    }
  } catch (e) {
    console.error('[zhiji] Cloud sync failed:', e.message || e)
  }
}

// ── Records (public API — same signatures as before) ──

export function addRecord(record) {
  const now = new Date()
  const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
  const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`

  const newRecord = {
    id: `r${Date.now()}`,
    type: record.type || 'diary',
    status: record.status || 'none',
    content: record.content || '',
    tags: record.tags || [],
    mood: record.mood || '',
    date: record.date || dateStr,
    time: record.time || timeStr,
    step: record.step || 0,
    totalSteps: record.totalSteps || 5,
    title: record.title || '',
    stepIndex: record.stepIndex,
    suspendedDays: 0,
    delta: record.delta,
    source: record.source || '',
    stepsContent: record.stepsContent || []
  }

  zhijiState.records.unshift(newRecord)

  // If suspended, add to suspended view
  if (newRecord.status === 'suspended') {
    zhijiState.suspended.unshift({
      id: `s_${newRecord.id}`,
      content: newRecord.content.substring(0, 100),
      tags: newRecord.tags,
      suspendedDays: 0,
      recordId: newRecord.id,
      stepIndex: record.stepIndex,
      source: record.source || ''
    })
  }

  _saveLocal()
  _cloudAdd(newRecord)
  return newRecord
}

export function updateRecord(id, data) {
  const idx = zhijiState.records.findIndex(r => r.id === id)
  if (idx === -1) return

  const prev = zhijiState.records[idx]
  Object.assign(zhijiState.records[idx], data)

  // If status changed to/from suspended, rebuild suspended view
  if (data.status !== undefined && data.status !== prev.status) {
    _syncSuspended()
  }

  _saveLocal()
  _cloudUpdate(id, data)
}

export function deleteRecord(id) {
  zhijiState.records = zhijiState.records.filter(r => r.id !== id)
  zhijiState.suspended = zhijiState.suspended.filter(s => s.recordId !== id)
  // Track deleted IDs so syncFromCloud won't restore them
  if (!zhijiState._deletedIds) zhijiState._deletedIds = []
  zhijiState._deletedIds.push(id)
  _saveLocal()
  _cloudDelete(id)
  // Cascade delete the xinwang node linked to this record
  removeNodeBySource(id)
}

export function deleteSuspended(id) {
  const suspendedItem = zhijiState.suspended.find(s => s.id === id)
  if (suspendedItem) {
    if (suspendedItem.recordId) {
      zhijiState.records = zhijiState.records.filter(r => r.id !== suspendedItem.recordId)
      if (!zhijiState._deletedIds) zhijiState._deletedIds = []
      zhijiState._deletedIds.push(suspendedItem.recordId)
      _cloudDelete(suspendedItem.recordId)
      removeNodeBySource(suspendedItem.recordId)
    }
    zhijiState.suspended = zhijiState.suspended.filter(s => s.id !== id)
    _saveLocal()
  }
}

export function getRecord(id) {
  return zhijiState.records.find(r => r.id === id)
}

// ── Records grouped by date ──

export function getRecordsByDate() {
  const groups = {}
  const now = new Date()
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`

  // [💡] Exclude suspended records — they only appear in suspend-list
  zhijiState.records.filter(r => r.status !== 'suspended').forEach(r => {
    let label
    if (r.date === today) label = '今天'
    else if (r.date === yesterdayStr) label = '昨日'
    else label = r.date

    if (!groups[label]) groups[label] = []
    groups[label].push(r)
  })
  return groups
}

// ── Suspended items ──

export function suspendRecord(recordId) {
  const record = getRecord(recordId)
  if (!record) return
  updateRecord(recordId, { status: 'suspended', suspendedDays: 0 })
}

export function unsuspendRecord(suspendId) {
  const item = zhijiState.suspended.find(s => s.id === suspendId)
  if (!item) return
  updateRecord(item.recordId, { status: 'in-progress' })
  zhijiState.suspended = zhijiState.suspended.filter(s => s.id !== suspendId)
  _saveLocal()
}

// ── δ(C) — Closure quality ──
// [💡] Formula from suspension framework: δ = (N_trials/5) × min(1, N_closed/10) × completeness
export function calcDelta(stepContents) {
  const closedUnits = stepContents.filter(c => c && c.trim()).length
  const N_trials = closedUnits
  const N_closed = zhijiState.records.filter(r => r.status === 'closed').length
  const avgLen = closedUnits > 0
    ? stepContents.filter(c => c && c.trim()).reduce((s, c) => s + c.length, 0) / closedUnits
    : 0
  const completeness = Math.min(1, avgLen / 200)
  const value = (N_trials / 5) * Math.min(1, (N_closed + 1) / 10) * completeness
  const rounded = Math.round(value * 100) / 100

  let label, emoji
  if (rounded < 0.2)      { label = '初探'; emoji = '🌱' }
  else if (rounded < 0.5) { label = '成⻓中'; emoji = '🌿' }
  else if (rounded < 0.8) { label = '深入'; emoji = '🌳' }
  else                    { label = '扎实'; emoji = '✨' }

  return { value: rounded, label, emoji }
}

// ── G(a_suspend) — Review advice for suspended items ──
// [💡] Simplified from NLP-based formula: uses suspendedDays + closeRate
export function calcReviewAdvice(suspendedDays) {
  const closedCount = zhijiState.records.filter(r => r.status === 'closed').length
  const suspendedCount = zhijiState.records.filter(r => r.status === 'suspended').length
  const closeRate = (closedCount + suspendedCount) === 0
    ? 0.5
    : closedCount / (closedCount + suspendedCount)

  if (suspendedDays < 3)  return { days: 3, label: '再想想', color: 'green' }
  if (suspendedDays <= 7) return closeRate > 0.4
    ? { days: 0, label: '差不多可以了', color: 'green' }
    : { days: 5, label: '再放几天', color: 'yellow' }
  if (suspendedDays <= 14) return { days: 7, label: '找个安静的时间', color: 'yellow' }
  if (closeRate < 0.2) return { days: null, label: '或许该放掉了', color: 'gray' }
  return { days: 10, label: '该回来了吧', color: 'yellow' }
}

// ── Drafts (local-only) ──

export function saveDraft(key, content) {
  zhijiState.drafts[key] = content
  _saveLocal()
}

export function getDraft(key) {
  return zhijiState.drafts[key] || ''
}

export function clearDraft(key) {
  delete zhijiState.drafts[key]
  _saveLocal()
}
