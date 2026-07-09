<template>
  <view class="page-container">
    <!-- #ifdef H5 -->
    <view class="h5-safe-top" />
    <!-- #endif -->
    <view class="header">
      <view class="header-left">
        <view class="avatar-circle">
          <text class="avatar-emoji">♡</text>
        </view>
        <text class="header-title">心宝</text>
      </view>
      <view class="header-actions">
        <view class="icon-btn pressable" @click="goHistory">
          <text class="icon-text">◷</text>
        </view>
        <view class="icon-btn pressable" @click="goSettings">
          <text class="icon-text">⋯</text>
        </view>
      </view>
    </view>

    <scroll-view class="scroll-area" scroll-y :scroll-top="scrollTop">
      <view class="content-area">
        <view class="welcome-card card">
          <view class="welcome-icon-wrap">
            <text class="welcome-emoji">🌿</text>
          </view>
          <text class="welcome-title">有什么想聊的吗？</text>
          <text class="welcome-desc">把心里的事说出来，我们一起理一理</text>
          <view class="start-btn pressable" @click="startChat">
            <text class="start-btn-text">开始对话</text>
            <text class="start-btn-arrow">→</text>
          </view>
        </view>

        <view v-if="suspendedItems.length > 0" class="suspend-section card">
          <view class="section-header">
            <text class="section-icon">⏳</text>
            <text class="section-title">待拆解</text>
          </view>
          
          <view v-for="item in suspendedItems" :key="item.id" class="suspend-item">
            <view class="suspend-content pressable" @click="continueSuspended(item)">
              <text class="suspend-emotion">{{ item.emotion }}</text>
              <text class="suspend-hint">{{ item.hint }}</text>
            </view>
            <view class="suspend-actions">
              <text class="suspend-action pressable" @click="continueSuspended(item)">继续拆解 →</text>
              <view class="suspend-delete-btn pressable" @click="deleteSuspendedItem(item)">
                <text class="delete-icon">×</text>
              </view>
            </view>
          </view>
        </view>

        <view v-if="recentConversations.length > 0" class="recent-section card">
          <view class="section-header">
            <text class="section-icon">🔍</text>
            <text class="section-title">最近拆解</text>
          </view>
          
          <view v-for="conv in recentConversations" :key="conv.id" class="recent-item pressable" @click="showHistoryDetail(conv)">
            <view class="recent-info">
              <text class="recent-title">{{ conv.title }}</text>
              <text class="recent-summary">{{ conv.summary }}</text>
            </view>
            <text class="recent-arrow">→</text>
          </view>
        </view>
      </view>
    </scroll-view>

    <view v-if="showChat" class="chat-overlay" @click="handleOverlayClick">
      <view class="chat-panel" @click.stop>
        <view class="chat-header">
          <text class="chat-title">与心宝对话</text>
          <view class="chat-actions">
            <view class="icon-btn pressable" @click="goHistory">
              <text class="icon-text">◷</text>
            </view>
            <view class="chat-close-btn pressable" @click="handleClose">
              <text class="close-icon">✕</text>
            </view>
          </view>
        </view>
        
        <scroll-view class="chat-body" scroll-y :scroll-top="chatScrollTop">
          <view class="chat-list">
            <view
              v-for="msg in xinbaoState.messages"
              :key="msg.id"
              :id="'msg-' + msg.id"
              class="msg-row"
              :class="msg.role === 'user' ? 'msg-user' : 'msg-bot'"
            >
              <view v-if="msg.role === 'xinbao'" class="msg-avatar">
                <text class="avatar-small">🌿</text>
              </view>
              <view class="msg-bubble" :class="'bubble-' + msg.role">
                <text class="msg-text">{{ msg.content }}</text>
                <text v-if="msg.role === 'user'" class="msg-time">{{ msg.time }}</text>
              </view>
            </view>
            <view v-if="xinbaoState.isLoading" class="loading-row">
              <view class="msg-avatar">
                <text class="avatar-small">🌿</text>
              </view>
              <view class="loading-bubble">
                <text class="loading-dot">.</text>
                <text class="loading-dot">.</text>
                <text class="loading-dot">.</text>
              </view>
            </view>
          </view>
        </scroll-view>

        <view v-if="!xinbaoState.messages.some(m => m.role === 'user') && !xinbaoState.isLoading" class="emotion-suggestion">
          <text class="emotion-label">💡 先说说你现在的感觉（可选）：</text>
          <view class="emotion-tags">
            <view
              v-for="emotion in presetEmotions"
              :key="emotion.key"
              class="emotion-tag pressable"
              @click="selectEmotion(emotion)"
            >
              <text class="tag-emoji">{{ emotion.emoji }}</text>
              <text class="tag-text">{{ emotion.text }}</text>
            </view>
          </view>
          <view class="custom-emotion-tag pressable" @click="showCustomEmotionModal = true">
            <text class="tag-icon">+</text>
            <text class="tag-text">自定义感受</text>
          </view>
        </view>

        <view class="input-bar">
          <view class="input-field">
            <input
              v-model="inputText"
              class="chat-input"
              placeholder="说说你的想法..."
              placeholder-style="color: rgba(65, 73, 67, 0.3);"
              :adjust-position="true"
              :cursor-spacing="20"
              confirm-type="send"
              @confirm="sendMsg"
            />
          </view>
          <view class="send-btn pressable" :class="{ 'send-active': inputText.trim() }" @click="sendMsg">
            <text class="send-icon">→</text>
          </view>
        </view>
      </view>
    </view>

    <view v-if="showCustomEmotionModal" class="modal-overlay" @click="showCustomEmotionModal = false">
      <view class="modal-content" @click.stop>
        <text class="modal-title">你现在是什么感觉？</text>
        <input
          v-model="customEmotionText"
          class="modal-input"
          placeholder="（在这里写下你的感受...）"
          :adjust-position="true"
          focus
        />
        <text class="modal-hint">一些灵感："被卡住了" / "心里空落落的" / "很平静"</text>
        <view class="modal-actions">
          <view class="modal-btn cancel-btn pressable" @click="showCustomEmotionModal = false">
            <text class="btn-text">取消</text>
          </view>
          <view class="modal-btn confirm-btn pressable" @click="confirmCustomEmotion">
            <text class="btn-text">确定</text>
          </view>
        </view>
      </view>
    </view>

    <view v-if="showResult" class="result-overlay" @click="closeResult">
      <view class="result-panel" @click.stop>
        <text class="result-title">🔍 你这次的发现</text>
        <text class="result-divider">────────────────</text>
        
        <view class="result-before">
          <text class="result-label">你来时说：</text>
          <text class="result-emotion">{{ currentEmotion || '未命名' }}</text>
        </view>
        
        <text class="result-arrow">↓ 对话过程 ↓</text>
        
        <view class="result-after">
          <text class="result-label">你后来说到：</text>
          <view v-for="(phrase, index) in keyPhrases" :key="index" class="result-phrase">
            <text class="phrase-text">{{ phrase }}</text>
          </view>
          <view v-if="coreConflict" class="result-core">
            <text class="core-label">🔑 你真正在意的是：</text>
            <text class="core-text">{{ coreConflict }}</text>
          </view>
        </view>
        
        <view class="result-clues">
          <text class="clues-label">你提到的几个线索：</text>
          <view v-for="(clue, index) in clues" :key="index" class="clue-item">
            <text class="clue-dot">○</text>
            <text class="clue-text">{{ clue }}</text>
          </view>
        </view>
        
        <view class="result-actions">
          <view class="result-btn pressable" @click="continueChat">
            <text class="btn-text">继续拆解</text>
          </view>
          <view class="result-btn suspend-btn pressable" @click="suspendConversation">
            <text class="btn-text">先放一放</text>
          </view>
          <view class="result-btn pressable" @click="goToXinwang">
            <text class="btn-text">查看心网</text>
          </view>
        </view>
      </view>
    </view>

    <view class="tabbar-spacer" />
    <TabBar current="xinbao" @change="onTabChange" />
  </view>

  <view v-if="showHistoryDetailModal && selectedHistory" class="modal-overlay" @click="closeHistoryDetail">
    <view class="history-detail-modal" @click.stop>
      <view class="modal-header">
        <text class="modal-title">🔍 {{ selectedHistory.title }}</text>
        <view class="modal-close-btn pressable" @click="closeHistoryDetail">
          <text class="close-icon">×</text>
        </view>
      </view>
      
      <view class="history-detail-body">
        <view class="detail-section">
          <text class="detail-label">对话时间</text>
          <text class="detail-value">{{ selectedHistory.date }} {{ selectedHistory.time }}</text>
        </view>
        
        <view class="detail-section">
          <text class="detail-label">对话记录</text>
          <view class="message-list">
            <view 
              v-for="msg in (selectedHistory.messages || [])" 
              :key="msg.id" 
              class="msg-row"
              :class="msg.role === 'user' ? 'msg-user' : 'msg-bot'"
            >
              <view v-if="msg.role === 'xinbao'" class="msg-avatar">
                <text class="avatar-small">🌿</text>
              </view>
              <view class="msg-bubble" :class="'bubble-' + msg.role">
                <text class="msg-text">{{ msg.content }}</text>
                <text v-if="msg.role === 'user'" class="msg-time">{{ msg.time }}</text>
              </view>
            </view>
          </view>
        </view>
        
        <view class="detail-section">
          <text class="detail-label">对话深度</text>
          <view class="delta-bar">
            <view class="delta-fill" :style="{ width: (selectedHistory.delta || 0) * 100 + '%' }"></view>
            <text class="delta-text">{{ selectedHistory.delta || 0 }}</text>
          </view>
        </view>
        
        <view class="detail-section" v-if="selectedHistory.status">
          <text class="detail-label">状态</text>
          <text class="detail-value" :class="selectedHistory.status === 'closed' ? 'status-closed' : 'status-archived'">
            {{ selectedHistory.status === 'closed' ? '已闭合' : '已归档' }}
          </text>
        </view>
      </view>
      
      <view class="modal-actions">
        <view class="modal-btn confirm-btn pressable" @click="continueHistory(selectedHistory)">
          <text class="btn-text">继续拆解</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue'
import { xinbaoState, sendMessage, startNewChat, calcXinbaoDelta, addCustomEmotion, deleteSuspendedConversation, archiveConversation } from '../../store/useXinbaoStore.js'
import { zhijiState, addRecord, deleteSuspended } from '../../store/useZhijiStore.js'
import { switchTab } from '../../store/useAppStore.js'
import TabBar from '../../components/TabBar.vue'

const inputText = ref('')
const showChat = ref(false)
const showCustomEmotionModal = ref(false)
const showResult = ref(false)
const showHistoryDetailModal = ref(false)
const customEmotionText = ref('')
const currentEmotion = ref('')
const keyPhrases = ref([])
const coreConflict = ref('')
const clues = ref([])
const scrollTop = ref(0)
const chatScrollTop = ref(0)
const selectedHistory = ref(null)

const presetEmotions = [
  { emoji: '🧠', text: '脑子里转个不停', key: 'circling' },
  { emoji: '🤔', text: '不知道该往哪走', key: 'lost' },
  { emoji: '😰', text: '心里慌慌的', key: 'anxious' },
  { emoji: '😤', text: '有点烦', key: 'annoyed' },
  { emoji: '😔', text: '提不起劲', key: 'low' },
  { emoji: '🧘', text: '还好，想聊聊', key: 'calm' }
]

const suspendedItems = computed(() => {
  const xinbaoSuspended = ((xinbaoState.suspendedConversations || [])).map(item => ({
    ...item,
    source: 'xinbao',
    hint: (item.suspendedDays || 0) < 3 
      ? '你上次说到一半，现在有新想法了吗？'
      : (item.suspendedDays || 0) <= 7 
        ? '已经搁置几天了，要不要再看看？'
        : '该回来了吧'
  }))
  
  const zhijiSuspended = ((zhijiState.suspended || [])).filter(item => item && item.source === 'xinbao').map(item => ({
    id: item.id,
    recordId: item.recordId,
    emotion: (item.content || '').substring(0, 10) + '...',
    summary: item.content || '',
    suspendedDays: item.suspendedDays || 0,
    source: 'zhiji',
    hint: (item.suspendedDays || 0) < 3 
      ? '你上次说到一半，现在有新想法了吗？'
      : (item.suspendedDays || 0) <= 7 
        ? '已经搁置几天了，要不要再看看？'
        : '该回来了吧'
  }))
  
  return [...xinbaoSuspended, ...zhijiSuspended].slice(0, 5)
})

const recentConversations = computed(() => {
  return ((xinbaoState.history || [])).slice(0, 3).map(conv => {
    const userMsgs = conv.messages ? conv.messages.filter(m => m && m.role === 'user') : []
    const lastUserMsg = userMsgs.length > 0 ? userMsgs[userMsgs.length - 1] : null
    const summary = lastUserMsg && lastUserMsg.content ? lastUserMsg.content.substring(0, 50) + '...' : ''
    return {
      ...conv,
      summary
    }
  })
})

function startChat() {
  currentEmotion.value = ''
  xinbaoState.currentEmotion = ''
  startNewChat()
  showChat.value = true
}

async function selectEmotion(emotion) {
  currentEmotion.value = emotion.text
  xinbaoState.currentEmotion = emotion.text
  
  if (emotion.isCustom) {
    addCustomEmotion(emotion.text)
  }
  
  await sendMessage('我现在' + emotion.text)
  await nextTick()
  scrollToBottom()
}

function confirmCustomEmotion() {
  const text = customEmotionText.value.trim()
  if (!text) {
    uni.showToast({ title: '请输入你的感受', icon: 'none' })
    return
  }
  
  addCustomEmotion(text)
  selectEmotion({ emoji: '✨', text, key: 'custom-new', isCustom: true })
  customEmotionText.value = ''
  showCustomEmotionModal.value = false
}

async function sendMsg() {
  const text = inputText.value.trim()
  if (!text) return
  
  inputText.value = ''
  const result = await sendMessage(text)
  
  await nextTick()
  scrollToBottom()
  
  if (result && result.hasSuspendSuggestion) {
    uni.showModal({
      title: '感觉你在绕圈了',
      content: '心宝觉得继续聊下去可能不会有新的进展。要不要先把这个问题放一放？',
      confirmText: '放一放',
      cancelText: '继续聊',
      success: (res) => {
        if (res.confirm) {
          suspendConversation()
        }
      }
    })
  }
}

function scrollToBottom() {
  nextTick(() => {
    chatScrollTop.value = 99999
  })
}

function handleOverlayClick() {
  handleClose()
}

function handleClose() {
  const userMsgs = xinbaoState.messages.filter(m => m.role === 'user')
  
  if (userMsgs.length === 0) {
    showChat.value = false
    startNewChat()
    return
  }
  
  const delta = calcXinbaoDelta(xinbaoState.messages, currentEmotion.value)
  
  if (userMsgs.length < 3 && delta < 0.3) {
    uni.showModal({
      title: '还没聊完？',
      content: '要不再说两句？现在结束的话，这次对话会存到历史记录里。',
      confirmText: '结束',
      cancelText: '继续聊',
      success: (res) => {
        if (res.confirm) {
          saveToHistory()
          showChat.value = false
          startNewChat()
        }
      }
    })
  } else {
    showChat.value = false
    showResult.value = true
    generateResult()
  }
}

function saveToHistory() {
  archiveConversation()
}

function generateResult() {
  const userMsgs = xinbaoState.messages.filter(m => m.role === 'user')
  const aiMsgs = xinbaoState.messages.filter(m => m.role === 'xinbao')
  
  if (userMsgs.length > 0) {
    keyPhrases.value = userMsgs.slice(-3).map(m => m.content)
  } else {
    keyPhrases.value = []
  }
  
  coreConflict.value = ''
  for (let i = aiMsgs.length - 1; i >= 0; i--) {
    const keywordMatch = aiMsgs[i].content.match(/【#(.+?)】/)
    if (keywordMatch) {
      coreConflict.value = keywordMatch[1]
      break
    }
  }
  
  clues.value = extractClues(userMsgs, aiMsgs)
}

function extractClues(userMsgs, aiMsgs) {
  const clueSet = new Set()
  
  const clueKeywords = ['觉得', '在意', '担心', '害怕', '希望', '想要', '需要', '重要', '关键', '其实']
  userMsgs.forEach(msg => {
    clueKeywords.forEach(keyword => {
      if (msg.content.includes(keyword)) {
        const parts = msg.content.split(keyword)
        if (parts.length > 1) {
          const clue = parts[1].trim().replace(/[，。！？\s]+$/, '').substring(0, 20)
          if (clue.length > 2) {
            clueSet.add(keyword + clue)
          }
        }
      }
    })
  })
  
  aiMsgs.forEach(msg => {
    const questionMatch = msg.content.match(/(听起来你|是不是|你觉得|其实你)(.+?)(对吗|是吗|\？)/)
    if (questionMatch && questionMatch[2]) {
      clueSet.add(questionMatch[2].trim().substring(0, 20))
    }
  })
  
  const result = Array.from(clueSet).slice(0, 5)
  return result.length > 0 ? result : ['工作与生活的平衡', '自我认知与外界评价', '短期目标与长期规划']
}

function closeResult() {
  saveToHistory()
  showResult.value = false
  showChat.value = false
  startNewChat()
}

function continueChat() {
  showResult.value = false
}

function suspendConversation() {
  const userMsgs = xinbaoState.messages.filter(m => m.role === 'user')
  const summary = userMsgs.slice(-3).map(m => m.content.substring(0, 30)).join(' | ')
  
  addRecord({
    type: 'diary',
    status: 'suspended',
    content: summary,
    tags: ['心宝'],
    source: 'xinbao'
  })
  
  closeResult()
  uni.navigateTo({ url: '/pages/zhiji/suspend-list' })
}

function continueSuspended(item) {
  currentEmotion.value = item.emotion
  xinbaoState.currentEmotion = item.emotion
  startNewChat()
  showChat.value = true
  sendMessage(item.summary)
}

function deleteSuspendedItem(item) {
  uni.showModal({
    title: '删除待拆解',
    content: '确定要删除这条待拆解记录吗？',
    confirmText: '删除',
    confirmColor: '#ba1a1a',
    cancelText: '取消',
    success: (res) => {
      if (res.confirm) {
        if (item.source === 'xinbao') {
          deleteSuspendedConversation(item.id)
        } else {
          deleteSuspended(item.id)
        }
        uni.showToast({ title: '已删除', icon: 'success' })
      }
    }
  })
}

function showHistoryDetail(conv) {
  selectedHistory.value = conv
  showHistoryDetailModal.value = true
}

function closeHistoryDetail() {
  showHistoryDetailModal.value = false
  selectedHistory.value = null
}

function continueHistory(conv) {
  closeHistoryDetail()
  currentEmotion.value = conv.title
  xinbaoState.currentEmotion = conv.title
  startNewChat()
  showChat.value = true
  
  const userMsgs = (conv.messages || []).filter(m => m.role === 'user')
  if (userMsgs.length > 0) {
    const lastMsg = userMsgs[userMsgs.length - 1]
    sendMessage('继续上次的话题：' + lastMsg.content.substring(0, 50))
  }
}

function goToXinwang() {
  closeResult()
  switchTab('xinwang')
  uni.switchTab({ url: '/pages/xinwang/index' })
}

function goHistory() {
  uni.navigateTo({ url: '/pages/xinbao/history' })
}

function goSettings() {
  uni.navigateTo({ url: '/pages/xinbao/settings' })
}

function onTabChange(tab) {
  startNewChat()
  switchTab(tab)
  const routes = {
    zhiji: '/pages/zhiji/index',
    xinbao: '/pages/xinbao/index',
    xinwang: '/pages/xinwang/index',
    zhiguang: '/pages/zhiguang/index',
    mine: '/pages/mine/index'
  }
  uni.switchTab({ url: routes[tab] })
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';
@import '@/styles/mixins.scss';

.page-container {
  height: 100vh;
  background-color: $color-background;
  box-sizing: border-box;
  padding-top: calc(env(safe-area-inset-top) + 88rpx);
}

.header {
  position: fixed; top: 0; left: 0; right: 0; z-index: 100;
  padding: 0 32rpx;
  padding-top: constant(safe-area-inset-top);
  padding-top: env(safe-area-inset-top);
  padding-bottom: 16rpx;
  display: flex; align-items: center; justify-content: space-between;
  background-color: rgba($color-background, 0.85);
  backdrop-filter: blur(20rpx);
}

.header-left { display: flex; align-items: center; gap: 20rpx; }
.avatar-circle { width: 56rpx; height: 56rpx; border-radius: 50%; background: rgba($color-primary, 0.1); display: flex; align-items: center; justify-content: center; }
.avatar-emoji { font-size: 28rpx; color: $color-primary; }
.header-title { font-family: $font-headline; font-size: $fs-headline-md; font-weight: 600; color: $color-primary; }

.header-actions { display: flex; align-items: center; gap: 24rpx; }
.icon-btn { width: 64rpx; height: 64rpx; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: rgba($color-surface, 0.5); }
.icon-text { font-size: 28rpx; color: $color-on-surface-variant; }

.scroll-area {
  height: 100vh;
  padding-bottom: 180rpx;
  box-sizing: border-box;
}

.content-area { padding: $sp-page-margin; }

.welcome-card {
  text-align: center;
  padding: 60rpx 40rpx;
  background: linear-gradient(135deg, rgba($color-primary-container, 0.15) 0%, rgba($color-primary-container, 0.05) 100%);
  border-radius: $radius-xl;
  margin-bottom: $sp-module-gap;
  width: 100%;
  box-sizing: border-box;
}

.welcome-icon-wrap {
  width: 120rpx; height: 120rpx;
  margin: 0 auto $sp-stack-gap;
  border-radius: 50%;
  background: rgba($color-primary, 0.1);
  display: flex; align-items: center; justify-content: center;
}

.welcome-emoji { font-size: 56rpx; }
.welcome-title { display: block; font-size: $fs-headline-sm; font-weight: 600; color: $color-primary; margin-bottom: 16rpx; }
.welcome-desc { display: block; font-size: $fs-body-sm; color: $color-on-surface-variant; margin-bottom: 40rpx; }

.start-btn {
  display: flex; align-items: center; justify-content: center; gap: 16rpx;
  padding: 24rpx 48rpx;
  background: $color-primary;
  border-radius: $radius-full;
  margin: 0 auto;
  width: fit-content;
}

.start-btn-text { font-size: $fs-body-md; font-weight: 500; color: #fff; }
.start-btn-arrow { font-size: $fs-body-md; color: #fff; }

.section-header { display: flex; align-items: center; gap: 16rpx; margin-bottom: 24rpx; }
.section-icon { font-size: 32rpx; }
.section-title { font-size: $fs-headline-sm; font-weight: 600; color: $color-on-surface; }

.suspend-section, .recent-section {
  padding: 32rpx;
  background: $color-surface;
  border-radius: $radius-lg;
  margin-bottom: $sp-module-gap;
}

.suspend-item {
  display: flex; align-items: center; justify-content: space-between;
  padding: 24rpx 0;
  border-bottom: 1px solid rgba($color-outline, 0.1);
  
  &:last-child { border-bottom: none; }
}

.suspend-content { flex: 1; }
.suspend-emotion { display: block; font-size: $fs-body-md; font-weight: 500; color: $color-on-surface; margin-bottom: 8rpx; }
.suspend-hint { display: block; font-size: $fs-body-sm; color: $color-on-surface-variant; }
.suspend-action { font-size: $fs-body-sm; color: $color-primary; }

.recent-item {
  padding: 20rpx 0;
  border-bottom: 1px solid rgba($color-outline, 0.1);
  
  &:last-child { border-bottom: none; }
}

.recent-title { display: block; font-size: $fs-body-md; font-weight: 500; color: $color-on-surface; margin-bottom: 8rpx; }
.recent-summary { display: block; font-size: $fs-body-sm; color: $color-on-surface-variant; }

.chat-overlay {
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex; align-items: flex-end;
}

.chat-panel {
  width: 100%;
  max-height: 85vh;
  background: $color-surface;
  border-radius: $radius-xl $radius-xl 0 0;
  display: flex; flex-direction: column;
  overflow: hidden;
}

.chat-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 24rpx 32rpx;
  padding-top: calc(env(safe-area-inset-top) + 24rpx);
  background: rgba($color-background, 0.9);
  backdrop-filter: blur(20rpx);
}

.chat-title { font-size: $fs-headline-sm; font-weight: 600; color: $color-on-surface; }

.chat-actions { display: flex; align-items: center; gap: 16rpx; }

.chat-close-btn {
  width: 64rpx; height: 64rpx;
  border-radius: 50%;
  background: rgba($color-error, 0.1);
  display: flex; align-items: center; justify-content: center;
}

.close-icon { font-size: 24rpx; color: $color-error; }

.chat-body {
  flex: 1;
  padding: 32rpx;
  overflow-y: auto;
}

.chat-list { display: flex; flex-direction: column; gap: 24rpx; }

.msg-row { display: flex; gap: 16rpx; }

.msg-user { justify-content: flex-end; }

.msg-bot { justify-content: flex-start; }

.msg-avatar {
  width: 64rpx; height: 64rpx;
  border-radius: 50%;
  background: rgba($color-primary, 0.1);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}

.avatar-small { font-size: 28rpx; }

.msg-bubble {
  max-width: 75%;
  padding: 24rpx 32rpx;
  border-radius: $radius-lg;
}

.bubble-xinbao {
  background: rgba($color-primary-container, 0.3);
  border-radius: $radius-lg $radius-lg $radius-lg 8rpx;
}

.bubble-user {
  background: $color-primary;
  border-radius: $radius-lg $radius-lg 8rpx $radius-lg;
}

.msg-text { font-size: $fs-body-md; line-height: 1.6; }

.bubble-xinbao .msg-text { color: $color-on-primary-container; }
.bubble-user .msg-text { color: #fff; }

.msg-time {
  display: block;
  font-size: $fs-label-sm;
  text-align: right;
  margin-top: 8rpx;
  opacity: 0.6;
}

.bubble-user .msg-time { color: #fff; }

.loading-row { display: flex; gap: 16rpx; }

.loading-bubble {
  padding: 24rpx 32rpx;
  background: rgba($color-primary-container, 0.3);
  border-radius: $radius-lg $radius-lg $radius-lg 8rpx;
  display: flex; align-items: center; gap: 8rpx;
}

.loading-dot {
  font-size: 24rpx;
  color: $color-on-primary-container;
  animation: loading 1.4s infinite ease-in-out both;
  
  &:nth-child(1) { animation-delay: -0.32s; }
  &:nth-child(2) { animation-delay: -0.16s; }
}

@keyframes loading {
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1); }
}

.emotion-suggestion {
  padding: 24rpx 32rpx;
  background: rgba($color-primary-container, 0.05);
  border-top: 1px solid rgba($color-outline, 0.1);
}

.emotion-label {
  display: block;
  font-size: $fs-body-sm;
  color: $color-on-surface-variant;
  margin-bottom: 16rpx;
}

.emotion-tags {
  display: flex; flex-wrap: wrap; gap: 16rpx;
  margin-bottom: 16rpx;
}

.emotion-tag {
  display: flex; align-items: center; gap: 8rpx;
  padding: 12rpx 20rpx;
  background: $color-surface;
  border-radius: $radius-full;
  border: 1px solid rgba($color-outline, 0.2);
}

.tag-emoji { font-size: 24rpx; }
.tag-text { font-size: $fs-body-sm; color: $color-on-surface-variant; }

.custom-emotion-tag {
  display: inline-flex; align-items: center; gap: 8rpx;
  padding: 12rpx 20rpx;
  background: rgba($color-primary, 0.05);
  border-radius: $radius-full;
  border: 1px dashed rgba($color-primary, 0.3);
}

.tag-icon { font-size: 24rpx; color: $color-primary; }

.input-bar {
  display: flex; align-items: center; gap: 16rpx;
  padding: 20rpx 32rpx;
  padding-bottom: calc(env(safe-area-inset-bottom) + 20rpx);
  background: $color-surface;
  border-top: 1px solid rgba($color-outline, 0.1);
}

.input-field { flex: 1; }

.chat-input {
  width: 100%;
  height: 80rpx;
  padding: 0 24rpx;
  background: rgba($color-surface-variant, 0.3);
  border-radius: $radius-full;
  font-size: $fs-body-md;
  color: $color-on-surface;
}

.send-btn {
  width: 80rpx; height: 80rpx;
  border-radius: 50%;
  background: rgba($color-surface-variant, 0.3);
  display: flex; align-items: center; justify-content: center;
  transition: all 0.2s;
  
  &.send-active {
    background: $color-primary;
  }
}

.send-icon { font-size: 28rpx; color: $color-on-surface-variant; }

.send-active .send-icon { color: #fff; }

.modal-overlay {
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1100;
  display: flex; align-items: center; justify-content: center;
}

.modal-content {
  width: 85%;
  padding: 40rpx;
  background: $color-surface;
  border-radius: $radius-xl;
}

.modal-title {
  display: block;
  font-size: $fs-headline-sm;
  font-weight: 600;
  color: $color-on-surface;
  text-align: center;
  margin-bottom: 32rpx;
}

.modal-input {
  width: 100%;
  height: 100rpx;
  padding: 0 24rpx;
  background: rgba($color-surface-variant, 0.2);
  border-radius: $radius-lg;
  font-size: $fs-body-md;
  color: $color-on-surface;
  margin-bottom: 16rpx;
}

.modal-hint {
  display: block;
  font-size: $fs-body-sm;
  color: $color-on-surface-variant;
  text-align: center;
  margin-bottom: 40rpx;
}

.modal-actions {
  display: flex; gap: 24rpx;
}

.modal-btn {
  flex: 1;
  padding: 24rpx;
  border-radius: $radius-lg;
  text-align: center;
}

.cancel-btn { background: rgba($color-surface-variant, 0.2); }
.cancel-btn .btn-text { color: $color-on-surface-variant; }

.confirm-btn { background: $color-primary; }
.confirm-btn .btn-text { color: #fff; }

.result-overlay {
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  z-index: 1100;
  display: flex; align-items: center; justify-content: center;
}

.result-panel {
  width: 90%;
  max-height: 80vh;
  padding: 40rpx;
  background: $color-surface;
  border-radius: $radius-xl;
  overflow-y: auto;
}

.result-title {
  display: block;
  font-size: $fs-headline-sm;
  font-weight: 600;
  color: $color-primary;
  text-align: center;
  margin-bottom: 24rpx;
}

.result-divider {
  display: block;
  text-align: center;
  font-size: $fs-body-sm;
  color: rgba($color-outline, 0.3);
  margin-bottom: 32rpx;
}

.result-before, .result-after {
  margin-bottom: 24rpx;
}

.result-label {
  display: block;
  font-size: $fs-body-sm;
  color: $color-on-surface-variant;
  margin-bottom: 12rpx;
}

.result-emotion {
  display: block;
  font-size: $fs-headline-sm;
  font-weight: 600;
  color: $color-primary;
}

.result-arrow {
  display: block;
  text-align: center;
  font-size: $fs-body-sm;
  color: rgba($color-outline, 0.3);
  margin: 24rpx 0;
}

.result-phrase {
  padding: 16rpx 24rpx;
  background: rgba($color-primary-container, 0.1);
  border-radius: $radius-default;
  margin-bottom: 12rpx;
}

.phrase-text { font-size: $fs-body-md; color: $color-on-surface; }

.result-core {
  padding: 20rpx 24rpx;
  background: rgba($color-primary, 0.1);
  border-radius: $radius-default;
  margin-top: 16rpx;
}

.core-label {
  display: block;
  font-size: $fs-body-sm;
  color: $color-primary;
  margin-bottom: 8rpx;
}

.core-text {
  font-size: $fs-body-md;
  font-weight: 500;
  color: $color-primary;
}

.result-clues {
  margin: 32rpx 0;
}

.clues-label {
  display: block;
  font-size: $fs-body-sm;
  color: $color-on-surface-variant;
  margin-bottom: 16rpx;
}

.clue-item {
  display: flex; align-items: flex-start; gap: 12rpx;
  padding: 12rpx 0;
}

.clue-dot { font-size: 16rpx; color: $color-primary; }
.clue-text { font-size: $fs-body-sm; color: $color-on-surface; flex: 1; }

.result-actions {
  display: flex; gap: 20rpx;
  margin-top: 32rpx;
}

.result-btn {
  flex: 1;
  padding: 24rpx;
  border-radius: $radius-lg;
  text-align: center;
  background: rgba($color-primary-container, 0.2);
}

.result-btn .btn-text { font-size: $fs-body-md; color: $color-on-primary-container; }

.suspend-btn { background: rgba($color-secondary, 0.2); }
.suspend-btn .btn-text { color: $color-on-secondary-container; }

.btn-text { font-size: $fs-body-md; }

.tabbar-spacer { height: 136rpx; }

.pressable:active { opacity: 0.7; }

.suspend-item {
  display: flex; align-items: center; justify-content: space-between;
  padding: 24rpx 0;
  border-bottom: 1px solid rgba($color-outline, 0.1);
  
  &:last-child { border-bottom: none; }
}

.suspend-content { flex: 1; }

.suspend-actions {
  display: flex; align-items: center; gap: 16rpx;
}

.suspend-delete-btn {
  width: 56rpx; height: 56rpx;
  border-radius: 50%;
  background: rgba($color-error, 0.1);
  display: flex; align-items: center; justify-content: center;
}

.delete-icon { font-size: 28rpx; color: $color-error; }

.recent-item {
  display: flex; align-items: center; justify-content: space-between;
  padding: 20rpx 0;
  border-bottom: 1px solid rgba($color-outline, 0.1);
  
  &:last-child { border-bottom: none; }
}

.recent-info { flex: 1; }

.recent-arrow { font-size: $fs-body-md; color: $color-on-surface-variant; }

.history-detail-modal {
  width: 90%;
  max-height: 85vh;
  background: $color-surface;
  border-radius: $radius-xl;
  overflow: hidden;
  display: flex; flex-direction: column;
}

.modal-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 24rpx 32rpx;
  padding-top: calc(env(safe-area-inset-top) + 24rpx);
  background: rgba($color-background, 0.9);
  border-bottom: 1px solid rgba($color-outline, 0.1);
}

.modal-close-btn {
  width: 56rpx; height: 56rpx;
  border-radius: 50%;
  background: rgba($color-error, 0.1);
  display: flex; align-items: center; justify-content: center;
}

.history-detail-body {
  flex: 1;
  padding: 32rpx;
  overflow-y: auto;
}

.detail-section {
  margin-bottom: 32rpx;
}

.detail-label {
  display: block;
  font-size: $fs-body-sm;
  color: $color-on-surface-variant;
  margin-bottom: 12rpx;
}

.detail-value {
  font-size: $fs-body-md;
  color: $color-on-surface;
}

.message-list {
  display: flex; flex-direction: column; gap: 16rpx;
  max-height: 400rpx;
  overflow-y: auto;
}

.delta-bar {
  position: relative;
  height: 24rpx;
  background: rgba($color-surface-variant, 0.3);
  border-radius: $radius-full;
  overflow: hidden;
}

.delta-fill {
  height: 100%;
  background: linear-gradient(90deg, $color-primary-container, $color-primary);
  border-radius: $radius-full;
  transition: width 0.3s;
}

.delta-text {
  position: absolute;
  right: 12rpx;
  top: 50%;
  transform: translateY(-50%);
  font-size: $fs-label-sm;
  color: $color-on-surface-variant;
}

.status-closed { color: $color-primary; }
.status-archived { color: $color-on-surface-variant; }
</style>
