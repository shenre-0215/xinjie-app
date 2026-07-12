<template>
  <view class="page-container" :class="'mood-' + mood">
    <!-- Header -->
    <view class="header">
      <view class="header-back pressable" @click="goBack">
        <text class="back-icon">‹</text>
      </view>
      <text class="header-title">记录当下</text>
      <view class="header-save pressable" @click="saveDiary">
        <text class="save-text">保存</text>
      </view>
    </view>

    <!-- Decorative orbs -->
    <view class="decor-top" />
    <view class="decor-bottom" />

    <!-- Editor body -->
    <view class="editor-body">
      <!-- Date -->
      <view class="date-display">
        <text class="date-text">{{ dateLabel }}</text>
      </view>

      <!-- Writing guide -->
      <view v-if="!content && !editingId" class="writing-guide">
        <text class="guide-text">{{ guideText }}</text>
        <view class="guide-decor">
          <text>{{ moodEmoji }}</text>
        </view>
      </view>

      <!-- Textarea -->
      <textarea
        class="editor-textarea"
        v-model="content"
        :placeholder="guideText"
        placeholder-style="color: rgba(65, 73, 67, 0.3); font-size: 34rpx;"
        :adjust-position="true"
        :show-confirm-bar="false"
        :cursor-spacing="40"
        maxlength="5000"
      />
    </view>

    <!-- Toolbar -->
    <view class="toolbar">
      <view class="toolbar-inner">
        <!-- Tags -->
        <view class="tags-row">
          <view class="add-tag-btn pressable" @click="showTagModal = true">
            <text class="add-tag-icon">＋</text>
            <text class="add-tag-label">添加标签</text>
          </view>
          <view v-for="tag in tags" :key="tag" class="tag-item">
            <text># {{ tag }}</text>
          </view>
        </view>

        <!-- Worldview ref -->
        <view class="wv-ref-section">
          <view class="wv-ref-trigger pressable" @click="showWorldviewRef = !showWorldviewRef">
            <text class="wv-ref-icon">◎</text>
            <text class="wv-ref-label">引用内心世界</text>
            <text class="wv-ref-arrow">{{ showWorldviewRef ? '∨' : '›' }}</text>
          </view>
          <view v-if="showWorldviewRef" class="wv-ref-pills">
            <view
              v-for="item in worldviewItems"
              :key="item.id"
              class="wv-ref-pill pressable"
              @click="insertWorldviewRef(item)"
            >
              <text class="wv-ref-pill-icon">{{ catIcon(item._cat) }}</text>
              <text class="wv-ref-pill-text">{{ item.content }}</text>
            </view>
            <text v-if="!worldviewItems.length" class="wv-ref-empty">内心世界还是空的，去三观体系添加一些吧</text>
          </view>
        </view>

        <!-- Echo / 时光回响 -->
        <view class="echo-section">
          <view class="echo-trigger pressable" @click="showEchoModal = true">
            <text class="echo-icon">⏳</text>
            <text class="echo-label">{{ echoLabel }}</text>
          </view>
        </view>

        <!-- Mood picker -->
        <view class="actions-row">
          <MoodPicker v-model="mood" />
        </view>
      </view>
    </view>

    <!-- Tag modal -->
    <view v-if="showTagModal" class="modal-mask" @click="showTagModal = false">
      <view class="tag-modal" @click.stop>
        <text class="modal-title">添加标签</text>
        <input class="tag-input" v-model="tagInput" placeholder="输入标签名" focus @confirm="addTag" />
        <view class="tag-suggestions">
          <text
            v-for="s in tagSuggestions"
            :key="s"
            class="tag-suggestion pressable"
            @click="addSuggestion(s)"
          >#{{ s }}</text>
        </view>
      </view>
    </view>

    <!-- Echo modal -->
    <view v-if="showEchoModal" class="modal-mask" @click="showEchoModal = false">
      <view class="echo-modal" @click.stop>
        <view class="echo-header">
          <text class="echo-title">设置时光回响</text>
          <text class="echo-desc">选择一个时间，让心解在未来提醒你回顾此刻</text>
        </view>
        <view class="echo-options">
          <view
            v-for="opt in echoOptions"
            :key="opt.value"
            class="echo-option pressable"
            :class="{ active: echoTime === opt.value }"
            @click="echoTime = opt.value"
          >
            <text class="echo-opt-icon">{{ opt.icon }}</text>
            <text class="echo-opt-label">{{ opt.label }}</text>
            <view v-if="echoTime === opt.value" class="echo-check">✓</view>
          </view>
        </view>
        <view class="echo-no-set pressable" :class="{ active: echoTime === 'none' }" @click="echoTime = 'none'">
          <text class="echo-opt-icon">✕</text>
          <text class="echo-opt-label">不设置</text>
        </view>
        <view class="echo-confirm pressable" @click="showEchoModal = false">
          <text class="echo-confirm-text">确定</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { xinwangState } from '../../store/useXinwangStore.js'
import { addRecord, updateRecord, getRecord, saveDraft, getDraft } from '../../store/useZhijiStore.js'
import MoodPicker from './MoodPicker.vue'

const content = ref('')
const mood = ref('')
const tags = ref([])
const tagInput = ref('')
const showTagModal = ref(false)
const showEchoModal = ref(false)
const showWorldviewRef = ref(false)
const echoTime = ref('none')
const editingId = ref('')

const echoOptions = [
  { value: '1day',   label: '1天后', icon: '🌙' },
  { value: '1week',  label: '1周后', icon: '📅' },
  { value: '1month', label: '1月后', icon: '🌕' },
  { value: '3month', label: '3月后', icon: '🌸' },
  { value: '1year',  label: '1年后', icon: '🎂' }
]

const echoLabel = computed(() => {
  const found = echoOptions.find(e => e.value === echoTime.value)
  return found ? found.label : '设置时光回响'
})

const tagSuggestions = ['宁静', '觉察', '温暖', '释然', '感恩', '成长', '冥想']

// Date
const dateLabel = computed(() => {
  const d = new Date()
  const weekDays = ['日','一','二','三','四','五','六']
  return `${d.getFullYear()}年${d.getMonth()+1}月${d.getDate()}日 · 周${weekDays[d.getDay()]} · ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`
})

// Guide text — changes based on mood and time
const moodEmoji = computed(() => {
  const map = { 'very-happy':'☀️','happy':'⛅','neutral':'☁️','sad':'🌧️','very-sad':'⛈️' }
  return map[mood.value] || '💭'
})

const guideText = computed(() => {
  const guides = {
    'very-happy': ['阳光明媚的一天，记录下这份灿烂吧~','今天心情超好，把这份快乐写下来！','像太阳一样闪耀，记录此刻的好心情'],
    happy: ['心情多云转晴，记录下这份轻松~','今天感觉不错，写点什么吧','云淡风轻，记录此刻的小美好'],
    neutral: ['阴天的心情，也是一种真实的存在','平平淡淡的一天，记录一下也挺好','内心宁静如水，写下此刻的感受'],
    sad: ['下雨了，让文字陪你一起流泪','难过的时候，写出来会好受一些','雨滴落下，带走一些烦恼吧'],
    'very-sad': ['暴风雨过后会有彩虹，记录下此刻的感受','狂风暴雨中，让文字成为你的避风港','情绪汹涌，写下来让它慢慢平息']
  }
  const arr = guides[mood.value]
  if (arr) return arr[Math.floor(Math.random() * arr.length)]
  return '此刻的心情是...'
})

// Worldview
const worldviewItems = computed(() => {
  const items = []
  ;(xinwangState.worldview.shixiang || []).forEach(e => items.push({ ...e, _cat: 'shixiang' }))
  ;(xinwangState.worldview.woxing || []).forEach(e => items.push({ ...e, _cat: 'woxing' }))
  ;(xinwangState.worldview.xincheng || []).forEach(e => items.push({ ...e, _cat: 'xincheng' }))
  return items
})

function catIcon(cat) {
  return { shixiang: '☁', woxing: '🌳', xincheng: '⚖' }[cat] || ''
}

function insertWorldviewRef(item) {
  content.value = (content.value || '') + `\n"${item.content}"——\n`
  showWorldviewRef.value = false
}

// Tags
function addTag() {
  const t = tagInput.value.trim()
  if (t && !tags.value.includes(t)) tags.value.push(t)
  tagInput.value = ''
  showTagModal.value = false
}

function addSuggestion(s) {
  if (!tags.value.includes(s)) tags.value.push(s)
  showTagModal.value = false
}

// Lifecycle
onLoad((options) => {
  if (options && options.id) {
    editingId.value = options.id
    const rec = getRecord(options.id)
    if (rec) {
      content.value = rec.content || ''
      if (rec.tags) tags.value = [...rec.tags]
      if (rec.mood) mood.value = rec.mood
      if (rec.echoTime) echoTime.value = rec.echoTime
    }
  } else if (options && options.content) {
    content.value = decodeURIComponent(options.content) + '\n\n——\n'
  }
})

function goBack() {
  if (content.value) saveDraft('diary', content.value)
  uni.navigateBack({ delta: 1 })
}

function saveDiary() {
  if (!content.value.trim()) {
    uni.showToast({ title: '写点什么吧', icon: 'none' })
    return
  }
  const data = {
    content: content.value.trim(),
    tags: [...tags.value],
    mood: mood.value,
    echoTime: echoTime.value !== 'none' ? echoTime.value : null
  }
  if (editingId.value) {
    updateRecord(editingId.value, { ...data, status: 'closed' })
    uni.showToast({ title: '已更新', icon: 'success' })
  } else {
    addRecord({ type: 'diary', ...data })
    uni.showToast({ title: '已保存', icon: 'success' })
  }
  setTimeout(() => uni.navigateBack({ delta: 1 }), 600)
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.page-container {
  min-height: 100vh;
  background-color: #f9faf6;
  display: flex; flex-direction: column;
  padding-top: calc(env(safe-area-inset-top) + 88rpx);
  transition: background-color 0.4s ease;
}

.header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 32rpx; padding-top: constant(safe-area-inset-top);
  padding-top: env(safe-area-inset-top); padding-bottom: 16rpx; z-index: 10;
}
.header-back { width: 80rpx; height: 80rpx; display: flex; align-items: center; justify-content: center; border-radius: 9999rpx; background-color: rgba(255,255,255,0.5); }
.back-icon { font-size: 52rpx; color: #414943; font-weight: 300; }
.header-title { font-size: 36rpx; font-weight: 600; color: rgba(26,28,26,0.8); }
.header-save { padding: 12rpx 40rpx; border-radius: 9999rpx; background-color: rgba(168,213,186,0.2); }
.save-text { font-size: 26rpx; font-weight: 600; color: #3d6751; }

.editor-body { flex: 1; padding: 32rpx 64rpx; overflow-y: auto; }
.date-display { margin-bottom: 48rpx; opacity: 0.4; }
.date-text { font-size: 26rpx; color: #1a1c1a; }

.writing-guide {
  position: relative; margin-bottom: 48rpx; padding: 40rpx;
  background-color: rgba(255,255,255,0.6); border-radius: 32rpx;
  backdrop-filter: blur(5rpx); animation: fadeInUp 0.35s ease-out;
}
.guide-text { font-size: 34rpx; color: rgba(26,28,26,0.5); line-height: 1.6; }
.guide-decor { position: absolute; right: 24rpx; bottom: 24rpx; font-size: 48rpx; opacity: 0.4; animation: float 3s ease-in-out infinite; }
@keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-10rpx); } }
@keyframes fadeInUp { from { opacity: 0; transform: translateY(20rpx); } to { opacity: 1; transform: translateY(0); } }

.editor-textarea { flex: 1; width: 100%; min-height: 600rpx; background: transparent; border: none; font-size: 34rpx; line-height: 1.8; color: #1a1c1a; padding: 0; }

.toolbar { padding: 0 64rpx 80rpx; z-index: 50; }
.toolbar-inner {
  background-color: rgba(255,255,255,0.9); border-radius: 16rpx;
  padding: 48rpx; box-shadow: 0 4rpx 20rpx rgba(168,213,186,0.08);
  backdrop-filter: blur(10rpx); display: flex; flex-direction: column; gap: 48rpx;
}
.tags-row { display: flex; flex-wrap: wrap; gap: 24rpx; align-items: center; }
.add-tag-btn { display: flex; align-items: center; gap: 8rpx; padding: 12rpx 32rpx; border-radius: 9999rpx; background-color: #f3f4f0; }
.add-tag-icon { font-size: 32rpx; color: #414943; }
.add-tag-label { font-size: 26rpx; color: #414943; }
.tag-item { font-size: 26rpx; padding: 12rpx 28rpx; border-radius: 9999rpx; background-color: rgba(237,223,184,0.3); color: #6c6243; }

.wv-ref-trigger { display: flex; align-items: center; gap: 12rpx; padding: 16rpx 0; }
.wv-ref-icon { font-size: 32rpx; color: #3d6751; }
.wv-ref-label { font-size: 26rpx; color: #3d6751; font-weight: 600; }
.wv-ref-arrow { font-size: 32rpx; color: rgba(65,73,67,0.5); margin-left: auto; }
.wv-ref-pills { display: flex; flex-wrap: wrap; gap: 12rpx; padding-bottom: 8rpx; }
.wv-ref-pill { display: flex; align-items: center; gap: 10rpx; padding: 16rpx 28rpx; border-radius: 9999rpx; background-color: #f3f4f0; box-shadow: 0 1rpx 8rpx rgba(0,0,0,0.03); font-size: 30rpx; color: #1a1c1a; transition: all 0.15s; }
.wv-ref-pill:active { transform: scale(0.96); background-color: rgba(168,213,186,0.3); }
.wv-ref-pill-icon { font-size: 26rpx; opacity: 0.6; }
.wv-ref-pill-text { font-size: 30rpx; color: #1a1c1a; }
.wv-ref-empty { font-size: 22rpx; color: rgba(65,73,67,0.35); padding: 8rpx 0; }

.echo-trigger { display: flex; align-items: center; gap: 12rpx; padding: 16rpx 0; }
.echo-icon { font-size: 32rpx; color: #675e3f; }
.echo-label { font-size: 26rpx; color: #675e3f; font-weight: 500; }
.actions-row { display: flex; align-items: center; justify-content: center; }

// Modals
.modal-mask { position: fixed; top: 0; right: 0; bottom: 0; left: 0; background-color: rgba(0,0,0,0.3); z-index: 150; display: flex; align-items: flex-end; }
.tag-modal { background-color: #fff; border-radius: 32rpx 32rpx 0 0; padding: 48rpx 64rpx 80rpx; width: 100%; }
.modal-title { display: block; font-size: 36rpx; font-weight: 600; color: #1a1c1a; margin-bottom: 32rpx; }
.tag-input { height: 88rpx; background-color: #f3f4f0; border-radius: 16rpx; padding: 0 32rpx; font-size: 30rpx; margin-bottom: 32rpx; }
.tag-suggestions { display: flex; flex-wrap: wrap; gap: 16rpx; }
.tag-suggestion { font-size: 26rpx; padding: 16rpx 32rpx; border-radius: 9999rpx; background-color: rgba(237,223,184,0.3); color: #6c6243; }

.echo-modal { background-color: #fff; border-radius: 32rpx 32rpx 0 0; padding: 48rpx 64rpx calc(80rpx + env(safe-area-inset-bottom)); width: 100%; }
.echo-header { margin-bottom: 48rpx; }
.echo-title { display: block; font-size: 36rpx; font-weight: 600; color: #1a1c1a; margin-bottom: 16rpx; }
.echo-desc { display: block; font-size: 30rpx; color: rgba(26,28,26,0.5); }
.echo-options { display: flex; flex-direction: column; gap: 16rpx; margin-bottom: 32rpx; }
.echo-option { display: flex; align-items: center; gap: 24rpx; padding: 36rpx 32rpx; background-color: #f3f4f0; border-radius: 16rpx; border: 2rpx solid transparent; transition: all 0.2s; }
.echo-option.active { border-color: #a8d5ba; background-color: rgba(168,213,186,0.1); }
.echo-opt-icon { font-size: 44rpx; }
.echo-opt-label { flex: 1; font-size: 30rpx; color: #1a1c1a; }
.echo-check { width: 48rpx; height: 48rpx; border-radius: 9999rpx; background-color: #a8d5ba; color: #345d48; font-size: 22rpx; display: flex; align-items: center; justify-content: center; font-weight: 600; }
.echo-no-set { display: flex; align-items: center; gap: 24rpx; padding: 24rpx 32rpx; border-radius: 16rpx; border: 2rpx dashed rgba(26,28,26,0.1); margin-bottom: 48rpx; transition: all 0.2s; }
.echo-no-set.active { border-color: rgba(26,28,26,0.3); background-color: rgba(26,28,26,0.02); }
.echo-confirm { padding: 32rpx; background-color: #a8d5ba; border-radius: 16rpx; text-align: center; }
.echo-confirm-text { font-size: 30rpx; font-weight: 600; color: #345d48; }

// Decorative orbs
.decor-top { position: fixed; top: 25%; left: -96rpx; width: 256rpx; height: 256rpx; background-color: rgba(168,213,186,0.1); border-radius: 9999rpx; filter: blur(80rpx); pointer-events: none; z-index: 0; transition: all 0.4s ease; }
.decor-bottom { position: fixed; bottom: 25%; right: -96rpx; width: 192rpx; height: 192rpx; background-color: rgba(237,223,184,0.15); border-radius: 9999rpx; filter: blur(60rpx); pointer-events: none; z-index: 0; transition: all 0.4s ease; }

.pressable:active { opacity: 0.7; }
</style>
