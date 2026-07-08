<template>
  <view class="page-container" :class="`mood-${mood}`">
    <view class="header">
      <view class="header-back pressable" @click="goBack">
        <text class="back-icon">‹</text>
      </view>
      <text class="header-title">记录当下</text>
      <view class="header-save pressable" @click="saveDiary">
        <text class="save-text">保存</text>
      </view>
    </view>

    <view class="decor-top" :class="`mood-${mood}`" />
    <view class="decor-bottom" :class="`mood-${mood}`" />

    <view class="editor-body">
      <view class="date-display">
        <text class="date-text">{{ currentDate }}</text>
      </view>

      <view class="writing-guide" v-if="!content && !editId">
        <text class="guide-text">{{ guideText }}</text>
        <view class="guide-decor">{{ moodIcon }}</view>
      </view>

      <textarea
        class="editor-textarea"
        v-model="content"
        :placeholder="placeholder"
        placeholder-style="color: rgba(65, 73, 67, 0.3); font-size: 34rpx;"
        :auto-height="false"
        :adjust-position="true"
        :show-confirm-bar="false"
        :cursor-spacing="40"
        maxlength="5000"
      />
    </view>

    <view class="toolbar">
      <view class="toolbar-inner">
        <view class="tags-row">
          <view class="add-tag-btn pressable" @click="showTagInput = true">
            <text class="add-tag-icon">＋</text>
            <text class="add-tag-label">添加标签</text>
          </view>
          <view v-for="tag in tags" :key="tag" class="tag-item">
            <text># {{ tag }}</text>
          </view>
        </view>

        <view class="worldview-ref-section">
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
              @click="insertWorldview(item)"
            >
              <text class="wv-ref-pill-icon">{{ catLabel(item._cat) }}</text>
              <text class="wv-ref-pill-text">{{ item.content }}</text>
            </view>
            <text v-if="!worldviewItems.length" class="wv-ref-empty">内心世界还是空的，去三观体系添加一些吧</text>
          </view>
        </view>

        <view class="echo-section">
          <view class="echo-trigger pressable" @click="showEchoModal = true">
            <text class="echo-icon">⏳</text>
            <text class="echo-label">{{ echoText }}</text>
          </view>
        </view>

        <view class="actions-row">
          <MoodPicker v-model="mood" />
        </view>
      </view>
    </view>

    <view v-if="showTagInput" class="tag-modal-mask" @click="showTagInput = false">
      <view class="tag-modal" @click.stop>
        <text class="tag-modal-title">添加标签</text>
        <input
          class="tag-input"
          v-model="newTag"
          placeholder="输入标签名"
          :focus="true"
          @confirm="addTag"
        />
        <view class="tag-suggestions">
          <text
            v-for="s in suggestedTags"
            :key="s"
            class="tag-suggestion pressable"
            @click="addTagSuggestion(s)"
          >#{{ s }}</text>
        </view>
      </view>
    </view>

    <view v-if="showEchoModal" class="echo-modal-mask" @click="showEchoModal = false">
      <view class="echo-modal" @click.stop>
        <view class="echo-modal-header">
          <text class="echo-modal-title">设置时光回响</text>
          <text class="echo-modal-desc">选择一个时间，让心解在未来提醒你回顾此刻</text>
        </view>
        
        <view class="echo-options">
          <view
            v-for="option in echoOptions.slice(1)"
            :key="option.value"
            class="echo-option pressable"
            :class="{ active: echoTime === option.value }"
            @click="echoTime = option.value"
          >
            <text class="echo-option-icon">{{ option.icon }}</text>
            <text class="echo-option-label">{{ option.label }}</text>
            <view v-if="echoTime === option.value" class="echo-option-check">✓</view>
          </view>
        </view>

        <view class="echo-option-no-set pressable" :class="{ active: echoTime === 'none' }" @click="echoTime = 'none'">
          <text class="echo-option-icon">✕</text>
          <text class="echo-option-label">不设置</text>
        </view>

        <view class="echo-modal-confirm pressable" @click="confirmEcho">
          <text class="echo-modal-confirm-text">确定</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { xinwangState } from '../../store/useXinwangStore.js'
import { addRecord, getRecord, updateRecord } from '../../store/useZhijiStore.js'
import MoodPicker from '../../components/MoodPicker.vue'

const content = ref('')
const editId = ref('')
const showWorldviewRef = ref(false)
const mood = ref('')
const tags = ref([])
const newTag = ref('')
const showTagInput = ref(false)
const placeholder = ref('此刻的心情是...')
const showEchoModal = ref(false)
const echoTime = ref('none')

const suggestedTags = ['宁静', '觉察', '温暖', '释然', '感恩', '成长', '冥想']

const echoOptions = [
  { value: 'none', label: '不设置', icon: '✕' },
  { value: '1day', label: '1天后', icon: '🌙' },
  { value: '1week', label: '1周后', icon: '📅' },
  { value: '1month', label: '1月后', icon: '🌕' },
  { value: '3month', label: '3月后', icon: '🌸' },
  { value: '1year', label: '1年后', icon: '🎂' }
]

const echoText = computed(() => {
  const option = echoOptions.find(o => o.value === echoTime.value)
  return option?.label || '设置时光回响'
})

const moodIcon = computed(() => {
  const map = {
    'very-happy': '☀️',
    happy: '⛅',
    neutral: '☁️',
    sad: '🌧️',
    'very-sad': '⛈️',
    calm: '🌿',
    angry: '🔥',
    anxious: '🌪',
    tired: '🌙'
  }
  return map[mood.value] || '💭'
})

const guideText = computed(() => {
  const hour = new Date().getHours()
  const timePhase = hour < 6 ? '深夜' : hour < 12 ? '早晨' : hour < 14 ? '中午' : hour < 18 ? '下午' : '晚上'
  
  const moodGuides = {
    'very-happy': [
      '阳光明媚的一天，记录下这份灿烂吧~',
      '今天心情超好，把这份快乐写下来！',
      '像太阳一样闪耀，记录此刻的好心情',
      '晴空万里，写下你今天的小确幸',
      '心情晴朗，把美好的瞬间定格在这里'
    ],
    happy: [
      '心情多云转晴，记录下这份轻松~',
      '今天感觉不错，写点什么吧',
      '云淡风轻，记录此刻的小美好',
      '心情像多云天气一样舒适',
      '有点开心，把这份感觉记录下来'
    ],
    neutral: [
      '阴天的心情，也是一种真实的存在',
      '平平淡淡的一天，记录一下也挺好',
      '内心宁静如水，写下此刻的感受',
      '阴天也有阴天的温柔，记录下来',
      '心情像阴天一样平静，写点什么吧'
    ],
    sad: [
      '下雨了，让文字陪你一起流泪',
      '难过的时候，写出来会好受一些',
      '雨滴落下，带走一些烦恼吧',
      '心情有点低落，把它写下来',
      '雨天适合倾诉，记录你的心事'
    ],
    'very-sad': [
      '暴风雨过后会有彩虹，记录下此刻的感受',
      '狂风暴雨中，让文字成为你的避风港',
      '情绪汹涌，写下来让它慢慢平息',
      '暴雨来袭，记录你的内心风暴',
      '难过到极点，把它写出来会好受些'
    ],
    calm: [
      '内心平静如水，写下此刻的感受...',
      '心如止水，记录当下的宁静',
      '平静的时刻，值得被记录',
      '内心平和，写点什么吧',
      '此刻很平静，记录这份安宁'
    ],
    angry: [
      '愤怒需要被看见，写下它让它流动',
      '怒火中烧，写下来释放一下',
      '生气的时候，让文字帮你降温',
      '愤怒也是一种力量，记录下来',
      '火气有点大，写出来消消气'
    ],
    anxious: [
      '焦虑的时候，试着把它写下来',
      '心乱如麻，让文字帮你梳理',
      '焦虑像龙卷风，写下来让它平息',
      '有点紧张不安，记录一下吧',
      '焦虑的时刻，让文字陪伴你'
    ],
    tired: [
      '累了就歇会儿，记录下这份疲惫',
      '身心俱疲，写下来放松一下',
      '疲惫的时候，给自己一点空间',
      '累了，记录这份疲惫然后休息',
      '身心疲惫，让文字帮你卸下负担'
    ]
  }
  
  const timeGuides = {
    '深夜': [
      '夜深了，今天发生了什么值得记录的事？',
      '万籁俱寂，倾听内心的声音',
      '深夜适合思考，记录你的感悟',
      '夜深人静，写下今天的故事',
      '夜晚的思绪，值得被记录'
    ],
    '早晨': [
      '新的一天开始了，写下今天的期待吧',
      '晨光熹微，记录新一天的开始',
      '早安，写下今天想做的事',
      '清晨的阳光，记录你的心情',
      '新的一天，从记录开始'
    ],
    '中午': [
      '午休时间，整理一下上午的思绪',
      '午后时光，记录此刻的感受',
      '中午好，写下上午的收获',
      '阳光正好，记录你的午间心情',
      '午休时刻，给自己一点记录时间'
    ],
    '下午': [
      '下午好，记录此刻的想法',
      '午后时光，记录你的思考',
      '下午的阳光，记录你的心情',
      '下午好，写点什么吧',
      '午后的思绪，值得被记录'
    ],
    '晚上': [
      '忙碌了一天，回顾一下今天的收获',
      '夜幕降临，记录今天的故事',
      '晚上好，回顾一下今天的经历',
      '一天结束了，写下今天的感悟',
      '夜晚来临，记录你的一天'
    ]
  }
  
  if (mood.value && moodGuides[mood.value]) {
    const guides = moodGuides[mood.value]
    return guides[Math.floor(Math.random() * guides.length)]
  }
  if (timeGuides[timePhase]) {
    const guides = timeGuides[timePhase]
    return guides[Math.floor(Math.random() * guides.length)]
  }
  return '此刻的心情是...'
})

const worldviewItems = computed(() => {
  const all = []
  xinwangState.worldview.shixiang.forEach(i => all.push({ ...i, _cat: 'shixiang' }))
  xinwangState.worldview.woxing.forEach(i => all.push({ ...i, _cat: 'woxing' }))
  xinwangState.worldview.xincheng.forEach(i => all.push({ ...i, _cat: 'xincheng' }))
  return all
})

function catLabel(cat) {
  const map = { shixiang: '☁', woxing: '🌳', xincheng: '⚖' }
  return map[cat] || ''
}

function insertWorldview(item) {
  content.value = (content.value || '') + '\n"' + item.content + '"——\n'
  showWorldviewRef.value = false
}

const currentDate = computed(() => {
  const now = new Date()
  const weekdays = ['日', '一', '二', '三', '四', '五', '六']
  return `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日 · 周${weekdays[now.getDay()]} · ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
})

function goBack() {
  if (content.value) {
    saveDraft('diary', content.value)
  }
  uni.navigateBack({ delta: 1 })
}

function confirmEcho() {
  showEchoModal.value = false
}

function saveDiary() {
  if (!content.value.trim()) {
    uni.showToast({ title: '写点什么吧', icon: 'none' })
    return
  }
  const recordData = {
    content: content.value.trim(),
    tags: [...tags.value],
    mood: mood.value,
    echoTime: echoTime.value !== 'none' ? echoTime.value : null
  }
  if (editId.value) {
    updateRecord(editId.value, {
      ...recordData,
      status: recordStatus(editId.value)
    })
    uni.showToast({ title: '已更新', icon: 'success' })
  } else {
    addRecord({
      type: 'diary',
      ...recordData
    })
    uni.showToast({ title: '已保存', icon: 'success' })
  }
  setTimeout(() => uni.navigateBack({ delta: 1 }), 600)
}

function recordStatus(id) {
  const rec = getRecord(id)
  return rec?.status || 'none'
}

function addTag() {
  const t = newTag.value.trim()
  if (t && !tags.value.includes(t)) {
    tags.value.push(t)
  }
  newTag.value = ''
  showTagInput.value = false
}

function addTagSuggestion(s) {
  if (!tags.value.includes(s)) {
    tags.value.push(s)
  }
  showTagInput.value = false
}

watch(mood, () => {
  placeholder.value = guideText.value
})

onLoad((options) => {
  if (!options) return
  if (options.id) {
    editId.value = options.id
    const rec = getRecord(options.id)
    if (rec) {
      content.value = rec.content || ''
      if (rec.tags) tags.value = [...rec.tags]
      if (rec.mood) mood.value = rec.mood
      if (rec.echoTime) echoTime.value = rec.echoTime
    }
  } else if (options.content) {
    content.value = decodeURIComponent(options.content) + '\n\n——\n'
  }
})
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';
@import '@/styles/mixins.scss';

.page-container {
  @include page-container;
  display: flex;
  flex-direction: column;
  padding-top: calc(env(safe-area-inset-top) + 88rpx);
  transition: background-color 0.4s ease;
}

.page-container.mood-very-happy {
  background: linear-gradient(135deg, #fef3c7 0%, #fef9c3 100%);
}

.page-container.mood-happy {
  background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
}

.page-container.mood-neutral {
  background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
}

.page-container.mood-sad {
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
}

.page-container.mood-very-sad {
  background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
}

.page-container.mood-calm {
  background: linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%);
}

.page-container.mood-angry {
  background: linear-gradient(135deg, #fee2e2 0%, #fca5a5 100%);
}

.page-container.mood-anxious {
  background: linear-gradient(135deg, #fce7f3 0%, #f9a8d4 100%);
}

.page-container.mood-tired {
  background: linear-gradient(135deg, #f3f4f6 0%, #d1d5db 100%);
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 32rpx;
  padding-top: constant(safe-area-inset-top);
  padding-top: env(safe-area-inset-top);
  padding-bottom: 16rpx;
  z-index: 10;
}

.header-back {
  width: 80rpx;
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: $radius-full;
  background-color: rgba($color-surface-container-lowest, 0.5);
}

.back-icon {
  font-size: 52rpx;
  color: $color-on-surface-variant;
  font-weight: 300;
}

.header-title {
  font-size: $fs-headline-sm;
  font-weight: 600;
  color: rgba($color-on-surface, 0.8);
}

.header-save {
  padding: 12rpx 40rpx;
  border-radius: $radius-full;
  background-color: rgba($color-primary-container, 0.2);
}

.save-text {
  font-size: $fs-label-md;
  font-weight: 600;
  color: $color-primary;
}

.editor-body {
  flex: 1;
  padding: 32rpx $sp-page-margin;
  overflow-y: auto;
}

.date-display {
  margin-bottom: 48rpx;
  opacity: 0.4;
}

.date-text {
  font-size: $fs-label-md;
  color: $color-on-surface;
}

.writing-guide {
  position: relative;
  margin-bottom: 48rpx;
  padding: 40rpx;
  background-color: rgba($color-surface-container-lowest, 0.6);
  border-radius: $radius-lg;
  backdrop-filter: blur(10rpx);
  @include fade-in;
}

.guide-text {
  font-size: $fs-body-lg;
  color: rgba($color-on-surface, 0.5);
  line-height: 1.6;
}

.guide-decor {
  position: absolute;
  right: 24rpx;
  bottom: 24rpx;
  font-size: 48rpx;
  opacity: 0.4;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10rpx); }
}

.editor-textarea {
  flex: 1;
  width: 100%;
  min-height: 600rpx;
  background: transparent;
  border: none;
  font-size: $fs-body-lg;
  line-height: 1.8;
  color: $color-on-surface;
  caret-color: $color-primary-container;
  padding: 0;
}

.toolbar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 0 $sp-page-margin;
  padding-bottom: 80rpx;
  z-index: 50;
}

.toolbar-inner {
  background-color: rgba($color-surface-container-lowest, 0.9);
  border-radius: $radius-default;
  padding: 48rpx;
  box-shadow: $shadow-healing;
  backdrop-filter: blur(20rpx);
  display: flex;
  flex-direction: column;
  gap: 48rpx;
}

.tags-row {
  display: flex;
  flex-wrap: wrap;
  gap: $sp-inline-gap;
  align-items: center;
}

.add-tag-btn {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 12rpx 32rpx;
  border-radius: $radius-full;
  background-color: $color-surface-container-low;
}

.add-tag-icon {
  font-size: 32rpx;
  color: $color-on-surface-variant;
}

.add-tag-label {
  font-size: $fs-label-md;
  color: $color-on-surface-variant;
}

.tag-item {
  font-size: $fs-label-md;
  padding: 12rpx 28rpx;
  border-radius: $radius-full;
  background-color: rgba($color-secondary-container, 0.3);
  color: $color-on-secondary-container;
}

.worldview-ref-section { margin-bottom: 32rpx; }
.wv-ref-trigger { display: flex; align-items: center; gap: 12rpx; padding: 16rpx 0; }
.wv-ref-icon { font-size: 32rpx; color: $color-primary; }
.wv-ref-label { font-size: $fs-label-md; color: $color-primary; font-weight: 600; }
.wv-ref-arrow { font-size: 32rpx; color: rgba($color-on-surface-variant, 0.5); margin-left: auto; }
.wv-ref-pills { display: flex; flex-wrap: wrap; gap: 12rpx; padding-bottom: 8rpx; }
.wv-ref-pill {
  display: flex; align-items: center; gap: 10rpx;
  padding: 16rpx 28rpx; border-radius: $radius-full;
  background-color: $color-surface-container-low;
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.03);
  font-size: $fs-body-md; color: $color-on-surface;
  transition: all 0.15s;
  &:active { transform: scale(0.96); background-color: rgba($color-primary-container, 0.3); }
}
.wv-ref-pill-icon { font-size: 26rpx; opacity: 0.6; flex-shrink: 0; }
.wv-ref-pill-text { font-size: $fs-body-md; color: $color-on-surface; }
.wv-ref-empty { font-size: $fs-label-sm; color: rgba($color-on-surface-variant, 0.35); padding: 8rpx 0; }

.echo-section {
  margin-top: 16rpx;
}

.echo-trigger {
  display: flex;
  align-items: center;
  gap: 12rpx;
  padding: 16rpx 0;
}

.echo-icon {
  font-size: 32rpx;
  color: $color-secondary;
}

.echo-label {
  font-size: $fs-label-md;
  color: $color-secondary;
  font-weight: 500;
}

.actions-row {
  display: flex;
  align-items: center;
  justify-content: center;
}

.tag-modal-mask {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.3);
  z-index: 150;
  display: flex;
  align-items: flex-end;
}

.tag-modal {
  background-color: $color-surface-container-lowest;
  border-radius: $radius-lg $radius-lg 0 0;
  padding: 48rpx $sp-page-margin 80rpx;
  width: 100%;
}

.tag-modal-title {
  font-size: $fs-headline-sm;
  font-weight: 600;
  color: $color-on-surface;
  margin-bottom: 32rpx;
}

.tag-input {
  height: 88rpx;
  background-color: $color-surface-container-low;
  border-radius: $radius-default;
  padding: 0 32rpx;
  font-size: $fs-body-md;
  margin-bottom: 32rpx;
}

.tag-suggestions {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.tag-suggestion {
  font-size: $fs-label-md;
  padding: 16rpx 32rpx;
  border-radius: $radius-full;
  background-color: rgba($color-secondary-container, 0.3);
  color: $color-on-secondary-container;
}

.echo-modal-mask {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.3);
  z-index: 150;
  display: flex;
  align-items: flex-end;
}

.echo-modal {
  background-color: $color-surface-container-lowest;
  border-radius: $radius-lg $radius-lg 0 0;
  padding: 48rpx $sp-page-margin;
  padding-bottom: calc(80rpx + env(safe-area-inset-bottom));
  width: 100%;
}

.echo-modal-header {
  margin-bottom: 48rpx;
}

.echo-modal-title {
  display: block;
  font-size: $fs-headline-sm;
  font-weight: 600;
  color: $color-on-surface;
  margin-bottom: 16rpx;
}

.echo-modal-desc {
  display: block;
  font-size: $fs-body-md;
  color: rgba($color-on-surface, 0.5);
}

.echo-options {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  margin-bottom: 32rpx;
}

.echo-option {
  display: flex;
  align-items: center;
  gap: 24rpx;
  padding: 36rpx 32rpx;
  background-color: $color-surface-container-low;
  border-radius: $radius-default;
  border: 2rpx solid transparent;
  transition: all 0.2s;
}

.echo-option.active {
  border-color: $color-primary-container;
  background-color: rgba($color-primary-container, 0.1);
}

.echo-option-icon {
  font-size: 44rpx;
}

.echo-option-label {
  flex: 1;
  font-size: $fs-body-md;
  color: $color-on-surface;
}

.echo-option-check {
  width: 48rpx;
  height: 48rpx;
  border-radius: $radius-full;
  background-color: $color-primary-container;
  color: $color-on-primary-container;
  font-size: $fs-label-sm;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
}

.echo-option-no-set {
  display: flex;
  align-items: center;
  gap: 24rpx;
  padding: 24rpx 32rpx;
  border-radius: $radius-default;
  border: 2rpx dashed rgba($color-on-surface, 0.1);
  margin-bottom: 48rpx;
  transition: all 0.2s;
}

.echo-option-no-set.active {
  border-color: rgba($color-on-surface, 0.3);
  background-color: rgba($color-on-surface, 0.02);
}

.echo-modal-confirm {
  padding: 32rpx;
  background-color: $color-primary-container;
  border-radius: $radius-default;
  text-align: center;
}

.echo-modal-confirm-text {
  font-size: $fs-body-md;
  font-weight: 600;
  color: $color-on-primary-container;
}

.decor-top {
  position: fixed;
  top: 25%;
  left: -96rpx;
  width: 256rpx;
  height: 256rpx;
  background-color: rgba($color-primary-container, 0.1);
  border-radius: $radius-full;
  filter: blur(80rpx);
  pointer-events: none;
  z-index: 0;
  transition: all 0.4s ease;
}

.decor-bottom {
  position: fixed;
  bottom: 25%;
  right: -96rpx;
  width: 192rpx;
  height: 192rpx;
  background-color: rgba($color-secondary-container, 0.15);
  border-radius: $radius-full;
  filter: blur(60rpx);
  pointer-events: none;
  z-index: 0;
  transition: all 0.4s ease;
}

.page-container.mood-very-happy .decor-top { background-color: rgba(251, 191, 36, 0.2); }
.page-container.mood-very-happy .decor-bottom { background-color: rgba(253, 224, 71, 0.25); }

.page-container.mood-happy .decor-top { background-color: rgba(34, 197, 94, 0.2); }
.page-container.mood-happy .decor-bottom { background-color: rgba(74, 222, 128, 0.25); }

.page-container.mood-neutral .decor-top { background-color: rgba(156, 163, 175, 0.2); }
.page-container.mood-neutral .decor-bottom { background-color: rgba(199, 210, 254, 0.25); }

.page-container.mood-sad .decor-top { background-color: rgba(59, 130, 246, 0.2); }
.page-container.mood-sad .decor-bottom { background-color: rgba(96, 165, 250, 0.25); }

.page-container.mood-very-sad .decor-top { background-color: rgba(239, 68, 68, 0.2); }
.page-container.mood-very-sad .decor-bottom { background-color: rgba(220, 38, 38, 0.25); }

.page-container.mood-calm .decor-top { background-color: rgba(14, 165, 233, 0.2); }
.page-container.mood-calm .decor-bottom { background-color: rgba(56, 189, 248, 0.25); }

.page-container.mood-angry .decor-top { background-color: rgba(239, 68, 68, 0.2); }
.page-container.mood-angry .decor-bottom { background-color: rgba(248, 113, 113, 0.25); }

.page-container.mood-anxious .decor-top { background-color: rgba(236, 72, 153, 0.2); }
.page-container.mood-anxious .decor-bottom { background-color: rgba(244, 114, 182, 0.25); }

.page-container.mood-tired .decor-top { background-color: rgba(107, 114, 128, 0.2); }
.page-container.mood-tired .decor-bottom { background-color: rgba(156, 163, 175, 0.25); }
</style>
