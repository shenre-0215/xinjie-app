/* ===== 心宝 Store - Chat Messages =====
 *  Cloud model: per-conversation document (archived only)
 *  Active messages live in local until archived.
 */
import { reactive } from 'vue'
import { chatHistory } from '../mock/data.js'
import { addNodeAutoConnect, removeNodeBySource } from './useXinwangStore.js'
import { getStoreKey, getCloudDB, authState } from './useAuthStore.js'

const BASE_KEY = 'xinjie_xinbao'
const CLOUD_TABLE = 'xinbao_conversations'

const INITIAL_GREETING = [{
  id: 'm0',
  role: 'xinbao',
  content: '我是心宝。你有想不通的事，说出来，我帮你理一理——它卡在哪、该现在解决还是先放一放。',
  time: '',
  hasChoices: false
}]

const emotionWords = {
  positive: ['开心', '放松', '平静', '安心', '释然', '清晰', '明白', '舒服', '轻松', '快乐', '愉快', '喜悦', '满足', '幸福'],
  negative: ['焦虑', '迷茫', '纠结', '烦躁', '难过', '担心', '害怕', '紧张', '不安', '压力', '烦', '累', '疲惫', '郁闷']
}

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
  if (!authState.uid) return true
  try { return !uni.getStorageSync(getStoreKey(BASE_KEY)) } catch (e) { return true }
}

const local = loadLocal()

export const xinbaoState = reactive({
  messages: local?.messages || [...INITIAL_GREETING],
  history: local?.history || (_isFirstUser() ? [] : [...chatHistory]),
  currentConversationId: local?.currentConversationId || 'conv1',
  currentEmotion: local?.currentEmotion || '',
  isLoading: false,

  customEmotions: local?.customEmotions || [],
  suspendedConversations: local?.suspendedConversations || [],

  settings: local?.settings || {
    depth: 'standard',
    suspendBias: 'balanced',
    voiceEnabled: false
  }
})

export function reloadLocal() {
  const data = loadLocal()
  xinbaoState.messages = data?.messages || [...INITIAL_GREETING]
  xinbaoState.history = data?.history || []
  xinbaoState.currentConversationId = data?.currentConversationId || 'conv1'
  xinbaoState.currentEmotion = data?.currentEmotion || ''
  xinbaoState.customEmotions = data?.customEmotions || []
  xinbaoState.suspendedConversations = data?.suspendedConversations || []
  xinbaoState.settings = data?.settings || { depth: 'standard', suspendBias: 'balanced', voiceEnabled: false }
  xinbaoState.isLoading = false
}

function _saveLocal() {
  saveLocal({
    messages: xinbaoState.messages,
    history: xinbaoState.history,
    currentConversationId: xinbaoState.currentConversationId,
    currentEmotion: xinbaoState.currentEmotion,
    customEmotions: xinbaoState.customEmotions,
    suspendedConversations: xinbaoState.suspendedConversations,
    settings: xinbaoState.settings,
    _deletedIds: xinbaoState._deletedIds || []
  })
}

async function _cloudAddConversation(conv) {
  const db = getCloudDB()
  if (!db || !authState.uid) return
  try {
    await db.collection(CLOUD_TABLE).add({
      uid: authState.uid,
      id: conv.id,
      title: conv.title,
      messageCount: conv.messageCount,
      messages: conv.messages,
      time: conv.time,
      date: conv.date,
      delta: conv.delta,
      status: conv.status,
      createdAt: new Date()
    })
  } catch (e) {
    console.error('[xinbao] Cloud add conversation failed:', e.message || e)
  }
}

async function _cloudDeleteConversation(id) {
  const db = getCloudDB()
  if (!db || !authState.uid) return
  try {
    await db.collection(CLOUD_TABLE).where({ uid: authState.uid, id }).remove()
  } catch (e) {
    console.error('[xinbao] Cloud delete conversation failed:', e.message || e)
  }
}

export async function syncFromCloud(uid) {
  const db = getCloudDB()
  if (!db) return
  try {
    const res = await db.collection(CLOUD_TABLE)
      .where({ uid })
      .orderBy('createdAt', 'desc')
      .limit(100)
      .get()

    if (res.data && res.data.length > 0) {
      const deletedSet = new Set(xinbaoState._deletedIds || [])
      xinbaoState.history = res.data
        .filter(doc => !deletedSet.has(doc.id))
        .map(doc => ({
        id: doc.id,
        title: doc.title || '新的对话',
        messageCount: doc.messageCount || 0,
        messages: doc.messages || [],
        time: doc.time || '',
        date: doc.date || '',
        delta: doc.delta || 0,
        status: doc.status || 'archived'
      }))
      _saveLocal()
    }
  } catch (e) {
    console.error('[xinbao] Cloud sync failed:', e.message || e)
  }
}

function buildApiMessages() {
  return xinbaoState.messages
    .slice(-20)
    .filter(m => !m.hasChoices)
    .map(m => ({
      role: m.role === 'xinbao' ? 'assistant' : 'user',
      content: m.content
    }))
}

function _extractInsight(msgs) {
  const botMsgs = msgs.filter(m => m.role === 'xinbao')
  for (let i = botMsgs.length - 1; i >= 0; i--) {
    const m = botMsgs[i].content
    const match = m.match(/【#(.+?)】/)
    if (match && match[1].length >= 2 && match[1].length <= 8) {
      return match[1]
    }
  }
  const user = msgs.find(m => m.role === 'user')
  if (user) {
    const t = user.content.replace(/[，。！？\s]/g, '').substring(0, 8)
    if (t.length >= 2) return t
  }
  return '新的对话'
}

function calcEmotionScore(text) {
  if (!text) return 0
  let score = 0
  emotionWords.positive.forEach(word => {
    if (text.includes(word)) score += 1
  })
  emotionWords.negative.forEach(word => {
    if (text.includes(word)) score -= 1
  })
  return score
}

function calcEmotionShift(initialEmotion, messages) {
  const initialScore = calcEmotionScore(initialEmotion)
  const userMsgs = messages.filter(m => m.role === 'user')
  const recentMsgs = userMsgs.slice(-3)
  
  if (recentMsgs.length === 0) return 1
  
  const recentScore = recentMsgs.reduce((sum, m) => sum + calcEmotionScore(m.content), 0) / recentMsgs.length
  const shift = Math.abs(recentScore - initialScore)
  
  return Math.max(0.8, 1 + shift * 0.2)
}

export function calcXinbaoDelta(messages, initialEmotion) {
  const userMsgs = messages.filter(m => m.role === 'user')
  const aiMsgs = messages.filter(m => m.role === 'xinbao')
  
  const N_trials = userMsgs.length
  const N_closed = xinbaoState.history.filter(h => h.status === 'closed').length || 0
  const totalLen = userMsgs.reduce((s, m) => s + m.content.length, 0)
  const completeness = Math.min(1, totalLen / 500)
  const hasKeyword = aiMsgs.some(m => m.content.includes('【#'))
  const keywordBonus = hasKeyword ? 1.2 : 1
  const emotionShift = calcEmotionShift(initialEmotion, messages)
  
  const value = (N_trials / 10) * Math.min(1, (N_closed + 1) / 10) * completeness * keywordBonus * emotionShift
  return Math.round(value * 100) / 100
}

export function addCustomEmotion(emotion) {
  if (!xinbaoState.customEmotions) {
    xinbaoState.customEmotions = []
  }
  if (!xinbaoState.customEmotions.includes(emotion)) {
    xinbaoState.customEmotions.unshift(emotion)
    if (xinbaoState.customEmotions.length > 10) {
      xinbaoState.customEmotions = xinbaoState.customEmotions.slice(0, 10)
    }
    _saveLocal()
  }
}

export async function sendMessage(content) {
  const userMsg = {
    id: `m${Date.now()}`,
    role: 'user',
    content,
    time: formatTime(new Date()),
    hasChoices: false
  }
  xinbaoState.messages.push(userMsg)
  xinbaoState.isLoading = true
  _saveLocal()

  const apiMessages = buildApiMessages()
  
  const delta = calcXinbaoDelta(xinbaoState.messages, xinbaoState.currentEmotion)

  let hasSuspendSuggestion = false
  let replyContent = ''

  const useMock = true

  try {
    if (useMock) {
      replyContent = getMockReply(content)
    } else {
      try {
        const res = await uniCloud.callFunction({
          name: 'chat-api',
          data: { 
            messages: apiMessages, 
            suspendBias: xinbaoState.settings.suspendBias,
            delta 
          }
        })

        const rawReply = res.result?.reply || '我好像走神了…再说一次好吗？'
        if (rawReply.includes('[SUSPEND]')) {
          hasSuspendSuggestion = true
        }
        replyContent = rawReply.replace(/\[SUSPEND\]/g, '').replace(/【#.+?】/g, '').trim()
      } catch (e) {
        console.warn('[xinbao] Cloud API unavailable, using mock reply:', e.message || e)
        replyContent = getMockReply(content)
      }
    }

    await new Promise(resolve => setTimeout(resolve, 800))

    xinbaoState.messages.push({
      id: `m${Date.now()}`,
      role: 'xinbao',
      content: replyContent,
      time: formatTime(new Date()),
      hasChoices: false
    })
  } catch (e) {
    console.error('[xinbao] sendMessage error:', e.message || e)
    xinbaoState.messages.push({
      id: `m${Date.now()}`,
      role: 'xinbao',
      content: '抱歉，我刚才走神了，请再说一次好吗？',
      time: formatTime(new Date()),
      hasChoices: false
    })
  } finally {
    xinbaoState.isLoading = false
    _saveLocal()
  }

  return { userMsg, hasSuspendSuggestion, delta }
}

function getMockReply(content) {
  const replies = [
    '我理解你的感受。能具体说说发生了什么吗？',
    '听起来你现在的心情有点复杂，愿意和我详细聊聊吗？',
    '我在听呢，继续说吧~',
    '嗯，我明白了。你觉得这件事最让你困扰的是什么？',
    '谢谢你愿意和我分享这些，我在这里陪着你。',
    '我感受到你现在的情绪了，这很正常。我们一起理一理好吗？',
    '你说的这些我都听到了，你想从哪个方面开始梳理呢？',
    '有时候把事情说出来，就已经是一种释放了。',
    '我注意到你提到了几个关键点，你觉得哪个是最核心的？',
    '好的，我了解了。你现在希望怎么处理这件事呢？'
  ]
  
  if (content.includes('烦') || content.includes('累') || content.includes('焦虑')) {
    return '我感受到你的疲惫了。有时候停下来休息一下，也是很重要的。你愿意和我说说是什么让你觉得这么累吗？'
  }
  
  if (content.includes('开心') || content.includes('高兴') || content.includes('快乐')) {
    return '太好了！听到你这么开心，我也很替你高兴。能和我分享一下是什么让你这么开心吗？'
  }
  
  if (content.includes('我现在')) {
    return '我了解你的感受了。你愿意和我详细说说你现在的状态吗？'
  }
  
  return replies[Math.floor(Math.random() * replies.length)]
}

export function importZhijiRecords(recordIds) {
  const imported = recordIds.map(id => `[从织记导入] 记录 #${id}`)
  imported.forEach(content => sendMessage(content))
}

export function archiveConversation() {
  const userMsgs = xinbaoState.messages.filter(m => m.role === 'user')
  if (userMsgs.length === 0) return

  const keyword = _extractInsight(xinbaoState.messages)
  const title = keyword || userMsgs[0]?.content?.substring(0, 40) || '新的对话'
  
  const delta = calcXinbaoDelta(xinbaoState.messages, xinbaoState.currentEmotion)

  const now = new Date()

  const conv = {
    id: `h${Date.now()}`,
    title,
    messageCount: xinbaoState.messages.length,
    messages: [...xinbaoState.messages],
    time: formatTime(now),
    date: formatDate(now),
    delta,
    status: delta >= 0.6 ? 'closed' : 'archived'
  }

  xinbaoState.history.unshift(conv)

  if (keyword && userMsgs.length >= 3 && delta >= 0.6) {
    addNodeAutoConnect({
      label: keyword,
      status: 'completed',
      from: 'xinbao',
      sourceId: conv.id,
      sourceType: 'xinbao'
    })
  }

  _saveLocal()
  _cloudAddConversation(conv)
}

export function deleteHistory(id) {
  xinbaoState.history = xinbaoState.history.filter(h => h.id !== id)
  if (!xinbaoState._deletedIds) xinbaoState._deletedIds = []
  xinbaoState._deletedIds.push(id)
  _saveLocal()
  _cloudDeleteConversation(id)
  removeNodeBySource(id)
}

export function deleteSuspendedConversation(id) {
  if (!xinbaoState.suspendedConversations) {
    xinbaoState.suspendedConversations = []
  }
  const initialLength = xinbaoState.suspendedConversations.length
  xinbaoState.suspendedConversations = xinbaoState.suspendedConversations.filter(s => s.id !== id)
  if (xinbaoState.suspendedConversations.length !== initialLength) {
    _saveLocal()
    return true
  }
  return false
}

export function startNewChat() {
  if (xinbaoState.messages.filter(m => m.role === 'user').length > 0) {
    archiveConversation()
  }
  if (xinbaoState.history.length > 30) {
    xinbaoState.history = xinbaoState.history.slice(0, 30)
  }
  xinbaoState.messages = [...INITIAL_GREETING]
  _saveLocal()
}

export function clearAllHistory() {
  xinbaoState.messages = [...INITIAL_GREETING]
  xinbaoState.history = []
  xinbaoState.customEmotions = []
  xinbaoState.suspendedConversations = []
  _saveLocal()
}

export function updateXinbaoSettings(key, value) {
  xinbaoState.settings[key] = value
  _saveLocal()
}

function formatTime(date) {
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

function formatDate(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}