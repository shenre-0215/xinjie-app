<template>
  <view class="page-container">
    <!-- Header with stepper -->
    <view class="header">
      <view class="header-row">
        <view class="close-btn pressable" @click="goBack">
          <text class="close-icon">✕</text>
        </view>
        <text class="header-title">思考链</text>
        <view class="header-spacer" />
      </view>

      <!-- Stepper -->
      <view class="stepper">
        <view class="stepper-line" />
        <view class="stepper-progress" :style="{ width: progressWidth }" />
        <view
          v-for="(step, i) in steps"
          :key="step.key"
          class="stepper-node"
          :class="{ 'node-active': i <= currentStep, 'node-done': i < currentStep }"
        >
          <view class="node-circle" />
          <text class="node-label" :class="{ 'label-active': i <= currentStep }">{{ step.label }}</text>
        </view>
      </view>
    </view>

    <!-- Editor body -->
    <view class="editor-scroll">
      <view class="editor-content">
        <!-- Step card -->
        <view class="step-card card">
          <!-- Decorative mascot -->
          <view class="mascot-decor">
            <text class="mascot-emoji">🌿</text>
          </view>

          <view class="step-info">
            <view class="step-header">
              <text class="step-badge">步骤 {{ currentStep + 1 }} / {{ steps.length }}</text>
              <view class="delta-badge" :class="`delta-${currentDelta.color}`">
                <text class="delta-emoji">{{ currentDelta.emoji }}</text>
                <text class="delta-value">δ={{ currentDelta.value }}</text>
              </view>
            </view>
            <text class="step-question">{{ steps[currentStep].question }}</text>
            <text class="step-hint">{{ steps[currentStep].hint }}</text>
          </view>

          <!-- Input -->
          <textarea
            class="step-textarea"
            v-model="stepContents[currentStep]"
            :placeholder="'在这里写下你的真实' + steps[currentStep].label + '...'"
            placeholder-style="color: rgba(65, 73, 67, 0.3); font-size: 34rpx;"
            :adjust-position="true"
            :show-confirm-bar="false"
            maxlength="2000"
          />

          <!-- Quick tags -->
          <view class="quick-tags">
            <text
              v-for="tag in steps[currentStep].quickTags"
              :key="tag"
              class="quick-tag pressable"
              @click="appendTag(tag)"
            >#{{ tag }}</text>
          </view>
        </view>

        <!-- Tip card -->
        <view class="tip-card">
          <text class="tip-icon">💡</text>
          <view class="tip-body">
            <text class="tip-title">小贴士</text>
            <text class="tip-text">{{ steps[currentStep].tip }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- Bottom bar -->
    <view class="bottom-bar">
      <view class="suspend-btn pressable" @click="markSuspended">
        <text class="suspend-icon">📌</text>
        <text class="suspend-label">标记悬置</text>
      </view>
      <view class="nav-btns">
        <view
          v-if="currentStep > 0"
          class="nav-btn pressable"
          @click="prevStep"
        >
          <text class="nav-icon">‹</text>
        </view>
        <view
          class="nav-btn nav-btn-primary pressable"
          @click="nextStep"
        >
          <text class="nav-label">{{ isLastStep ? '确认闭合' : '下一步' }}</text>
          <text v-if="isLastStep" class="nav-icon">›</text>
        </view>
      </view>
    </view>

    <!-- Suspend prompt overlay -->
    <view v-if="showSuspendPrompt" class="overlay" @click="showSuspendPrompt = false">
      <view class="prompt-card" @click.stop>
        <view class="prompt-icon">🌱</view>
        <text class="prompt-title">需要暂停一下吗？</text>
        <text class="prompt-desc">你在这一步停留了一段时间，也许需要先放一放，让思绪自然生长。</text>
        <view class="prompt-btns">
          <view class="prompt-btn-cancel pressable" @click="showSuspendPrompt = false">
            <text class="prompt-btn-text">继续思考</text>
          </view>
          <view class="prompt-btn-suspend pressable" @click="confirmSuspendFromPrompt">
            <text class="prompt-btn-text">标记悬置</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, watch, onUnmounted } from 'vue'
import { addRecord, updateRecord, getRecord, calcDelta } from '../../store/useZhijiStore.js'
import { addNodeAutoConnect } from '../../store/useXinwangStore.js'
import { onLoad } from '@dcloudio/uni-app'

function extractKeyword(stepContents) {
  const review = stepContents[4] || stepContents[stepContents.length - 1] || ''
  const patterns = ['我学到', '核心是', '本质是', '领悟到', '发现', '意识到', '我学会']
  for (const p of patterns) {
    const idx = review.indexOf(p)
    if (idx !== -1) {
      const kw = review.substring(idx + p.length).trim().replace(/[，。！？\s、了的是我]/g, '').substring(0, 8)
      if (kw.length >= 2) return kw
    }
  }
  const all = stepContents.filter(Boolean).join('')
  const clean = all.replace(/[，。！？\s、的了是我在很有去不都就也]/g, '').substring(0, 8)
  return clean.length >= 2 ? clean : '新的思考'
}

const steps = [
  {
    key: 'aware',
    label: '觉察',
    question: '此刻最强烈的感受是什么？',
    hint: '闭上眼呼吸三次，试着捕捉那个在你胸口浮动的词汇。',
    tip: '不要评判你的感受。无论是愤怒还是委屈，它们都是你当下的真实反馈。',
    quickTags: ['焦虑', '平静', '有些混乱']
  },
  {
    key: 'deconstruct',
    label: '拆解',
    question: '这种感觉由什么引起？',
    hint: '试着像解绳子一样，把情绪的线头找出来。',
    tip: '感受往往是多层的。表层可能是愤怒，底层可能是受伤或恐惧。',
    quickTags: ['工作', '关系', '自我期待']
  },
  {
    key: 'breakthrough',
    label: '破局',
    question: '有没有另一种看待它的方式？',
    hint: '如果换一个角度，这件事对你意味着什么？',
    tip: '试着用你关心的那个人的眼睛来看这件事。',
    quickTags: ['新的视角', '成长机会', '正在过去']
  },
  {
    key: 'practice',
    label: '实践',
    question: '你打算怎么做？哪怕是很小的一步。',
    hint: '行动不需要完美，只需要开始。',
    tip: '选一个你能在24小时内完成的小动作。小赢积累成大改变。',
    quickTags: ['行动计划', '小步前进', '自我关怀']
  },
  {
    key: 'review',
    label: '复盘',
    question: '走过这段思考，你学到了什么？',
    hint: '回头看时，这段旅程给了你什么礼物？',
    tip: '成长不总是舒适的。承认自己的勇气——你走完了这一程。',
    quickTags: ['新的领悟', '自我接纳', '感恩']
  }
]

const currentStep = ref(0)
const stepContents = ref(steps.map(() => ''))
const recordId = ref(null)
const lastSaveTime = ref(Date.now())
const suspendTimer = ref(null)
const showSuspendPrompt = ref(false)

const AUTO_SAVE_INTERVAL = 30000
const SUSPEND_REMIND_TIME = 120000

const getCacheKey = () => {
  return recordId.value ? `tc_${recordId.value}` : 'tc_draft'
}

const loadFromCache = () => {
  try {
    const cacheKey = getCacheKey()
    const cached = uni.getStorageSync(cacheKey)
    if (cached) {
      const data = JSON.parse(cached)
      if (data.stepIndex !== undefined) currentStep.value = data.stepIndex
      if (data.contents && data.contents.length) {
        stepContents.value = data.contents.map(s => s || '')
        while (stepContents.value.length < 5) stepContents.value.push('')
      }
      return true
    }
  } catch (e) {}
  return false
}

const saveToCache = () => {
  try {
    const cacheKey = getCacheKey()
    const data = {
      stepIndex: currentStep.value,
      contents: [...stepContents.value],
      timestamp: Date.now()
    }
    uni.setStorageSync(cacheKey, JSON.stringify(data))
    lastSaveTime.value = Date.now()
  } catch (e) {}
}

const clearCache = () => {
  try {
    const cacheKey = getCacheKey()
    uni.removeStorageSync(cacheKey)
  } catch (e) {}
}

const resetSuspendTimer = () => {
  if (suspendTimer.value) {
    clearTimeout(suspendTimer.value)
  }
  suspendTimer.value = setTimeout(() => {
    if (stepContents.value[currentStep.value].trim()) {
      showSuspendPrompt.value = true
    }
  }, SUSPEND_REMIND_TIME)
}

const calcCurrentDelta = () => {
  const completed = stepContents.value.slice(0, currentStep.value + 1).filter(c => c.trim())
  if (completed.length === 0) {
    return { value: 0, label: '开始', emoji: '🌱', color: 'gray' }
  }
  if (completed.length === 1) {
    return { value: 15, label: '觉察', emoji: '🔍', color: 'blue' }
  }
  if (completed.length === 2) {
    return { value: 35, label: '拆解', emoji: '🔧', color: 'yellow' }
  }
  if (completed.length === 3) {
    return { value: 60, label: '破局', emoji: '💡', color: 'orange' }
  }
  if (completed.length === 4) {
    return { value: 80, label: '实践', emoji: '🚀', color: 'green' }
  }
  return calcDelta(stepContents.value)
}

const currentDelta = computed(() => calcCurrentDelta())

onLoad((options) => {
  if (options && options.recordId) {
    const rec = getRecord(options.recordId)
    if (rec) {
      recordId.value = rec.id
      if (rec.stepIndex !== undefined && rec.stepIndex >= 0) {
        currentStep.value = rec.stepIndex
      }
      if (rec.stepsContent && rec.stepsContent.length) {
        stepContents.value = rec.stepsContent.map(s => s || '')
        while (stepContents.value.length < 5) stepContents.value.push('')
      }
    }
  } else if (options && options.step !== undefined) {
    const step = parseInt(options.step)
    if (!isNaN(step) && step >= 0 && step < steps.length) {
      currentStep.value = step
    }
  }
  
  loadFromCache()
  resetSuspendTimer()
})

watch(stepContents, () => {
  saveToCache()
  resetSuspendTimer()
}, { deep: true })

watch(currentStep, () => {
  saveToCache()
  resetSuspendTimer()
})

onUnmounted(() => {
  if (suspendTimer.value) {
    clearTimeout(suspendTimer.value)
  }
})

const isLastStep = computed(() => currentStep.value === steps.length - 1)
const progressWidth = computed(() => `${(currentStep.value / (steps.length - 1)) * 100}%`)

function prevStep() {
  if (currentStep.value > 0) currentStep.value--
}

function nextStep() {
  if (isLastStep.value) {
    confirmClose()
    return
  }
  if (!stepContents.value[currentStep.value].trim()) {
    uni.showToast({ title: '先写下你的想法吧', icon: 'none' })
    return
  }
  currentStep.value++
}

async function confirmClose() {
  if (!stepContents.value.every(c => c.trim())) {
    uni.showToast({ title: '请完成所有步骤', icon: 'none' })
    return
  }
  const fullContent = steps.map((s, i) =>
    `【${s.label}】\n${stepContents.value[i]}`
  ).join('\n\n')

  const delta = calcDelta(stepContents.value)
  const snippet = stepContents.value.map(c => c.trim()).filter(Boolean)

  // [💡] AI summarize — async; fall back to extractKeyword on failure
  uni.showLoading({ title: '正在总结...' })
  let keyword = extractKeyword(snippet)
  try {
    const res = await uniCloud.callFunction({
      name: 'chat-api',
      data: { mode: 'summarize', stepContents: snippet }
    })
    if (res.result?.code === 0 && res.result.keyword) {
      keyword = res.result.keyword
    }
  } catch (e) {
    // fallback to extractKeyword — already computed
  }
  uni.hideLoading()

  if (recordId.value) {
    // Continuing from suspended record
    updateRecord(recordId.value, {
      content: fullContent,
      status: 'closed',
      step: steps.length,
      stepIndex: 5,
      delta: delta.value,
      stepsContent: [...stepContents.value],
      title: keyword
    })
    addNodeAutoConnect({
      label: keyword,
      status: 'completed',
      from: 'zhiji',
      delta: delta.value,
      sourceId: recordId.value,
      sourceType: 'zhiji'
    })
  } else {
    const record = addRecord({
      type: 'thinking-chain',
      content: fullContent,
      status: 'closed',
      tags: [],
      step: steps.length,
      totalSteps: steps.length,
      title: keyword,
      delta: delta.value,
      stepsContent: [...stepContents.value]
    })
    addNodeAutoConnect({
      label: keyword,
      status: 'completed',
      from: 'zhiji',
      delta: delta.value,
      sourceId: record.id,
      sourceType: 'zhiji'
    })
  }
  uni.showToast({ title: `闭合质量：${delta.label} ${delta.emoji} δ=${delta.value}`, icon: 'success' })
  setTimeout(() => uni.navigateBack({ delta: 1 }), 800)
}

function markSuspended() {
  const content = stepContents.value.filter(Boolean).join(' | ')
  if (!content.trim()) {
    uni.showToast({ title: '至少完成一步再悬置吧', icon: 'none' })
    return
  }

  if (recordId.value) {
    updateRecord(recordId.value, {
      content,
      status: 'suspended',
      step: currentStep.value,
      stepIndex: currentStep.value,
      stepsContent: [...stepContents.value]
    })
  } else {
    addRecord({
      type: 'thinking-chain',
      content,
      status: 'suspended',
      tags: [],
      step: currentStep.value,
      totalSteps: steps.length,
      title: steps[0].label + '...',
      stepIndex: currentStep.value,
      stepsContent: [...stepContents.value]
    })
  }
  clearCache()
  uni.showToast({ title: '已悬置，随时回来', icon: 'none' })
  setTimeout(() => uni.navigateBack({ delta: 1 }), 600)
}

function confirmSuspendFromPrompt() {
  showSuspendPrompt.value = false
  markSuspended()
}

function appendTag(tag) {
  stepContents.value[currentStep.value] += (stepContents.value[currentStep.value] ? ' ' : '') + '#' + tag
}

function goBack() {
  if (stepContents.value.some(c => c.trim())) {
    uni.showModal({
      title: '确认退出？',
      content: '内容已自动保存，下次打开可继续',
      success: (res) => {
        if (res.confirm) {
          uni.navigateBack({ delta: 1 })
        }
      }
    })
  } else {
    uni.navigateBack({ delta: 1 })
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';
@import '@/styles/mixins.scss';

.page-container {
  @include page-container;
  display: flex;
  flex-direction: column;
}

.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  padding: 0 $sp-page-margin;
  padding-top: constant(safe-area-inset-top);
  padding-top: env(safe-area-inset-top);
  background-color: rgba($color-background, 0.85);
  backdrop-filter: blur(20rpx);
}

.header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 48rpx;
}

.close-btn {
  width: 80rpx;
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: $radius-full;
  background-color: $color-surface-container-low;
}

.close-icon {
  font-size: 36rpx;
  color: $color-on-surface-variant;
}

.header-title {
  font-size: $fs-headline-sm;
  font-weight: 600;
  color: $color-primary;
}

.header-spacer { width: 80rpx; }

.stepper {
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 0 8rpx;
  padding-bottom: 32rpx;
}

.stepper-line {
  position: absolute;
  top: 24rpx;
  left: 0;
  right: 0;
  height: 4rpx;
  background-color: $color-surface-container-highest;
  z-index: 0;
}

.stepper-progress {
  position: absolute;
  top: 24rpx;
  left: 0;
  height: 4rpx;
  background-color: $color-primary-container;
  z-index: 1;
  transition: width 0.5s ease;
}

.stepper-node {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16rpx;
  position: relative;
  z-index: 2;
}

.node-circle {
  width: 32rpx;
  height: 32rpx;
  border-radius: $radius-full;
  background-color: $color-surface-container-highest;
  transition: all 0.3s ease;
}

.node-active .node-circle {
  background-color: $color-primary;
  box-shadow: 0 0 0 8rpx rgba($color-primary-container, 0.3);
}

.node-done .node-circle {
  background-color: $color-primary-container;
}

.node-label {
  font-size: 20rpx;
  color: rgba($color-on-surface-variant, 0.4);
  font-weight: 600;
}

.label-active {
  color: $color-primary;
}

.editor-scroll {
  padding-top: 320rpx;
  padding-bottom: 200rpx;
}

.editor-content {
  padding: 0 $sp-page-margin;
}

.step-card {
  padding: 48rpx;
  position: relative;
  overflow: hidden;
  margin-bottom: $sp-module-gap;
}

.mascot-decor {
  position: absolute;
  top: 32rpx;
  right: 32rpx;
  opacity: 0.2;
}

.mascot-emoji {
  font-size: 128rpx;
}

.step-info {
  margin-bottom: 48rpx;
}

.step-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24rpx;
}

.step-badge {
  display: inline-block;
  padding: 8rpx 24rpx;
  border-radius: $radius-full;
  font-size: $fs-label-md;
  font-weight: 600;
  background-color: $color-tertiary-container;
  color: $color-on-tertiary-container;
}

.delta-badge {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 8rpx 20rpx;
  border-radius: $radius-full;
  font-weight: 600;
}

.delta-gray {
  background-color: rgba($color-on-surface, 0.1);
  .delta-value { color: rgba($color-on-surface, 0.6); }
}

.delta-blue {
  background-color: rgba(66, 133, 244, 0.15);
  .delta-value { color: #4285f4; }
}

.delta-yellow {
  background-color: rgba(249, 168, 37, 0.15);
  .delta-value { color: #c17900; }
}

.delta-orange {
  background-color: rgba(255, 152, 0, 0.15);
  .delta-value { color: #ff9800; }
}

.delta-green {
  background-color: rgba(76, 175, 80, 0.15);
  .delta-value { color: #388e3c; }
}

.delta-emoji {
  font-size: 28rpx;
}

.delta-value {
  font-size: $fs-label-md;
}

.step-question {
  display: block;
  font-size: $fs-headline-md;
  font-weight: 600;
  color: $color-on-surface;
  margin-bottom: 16rpx;
}

.step-hint {
  display: block;
  font-size: $fs-body-md;
  color: $color-on-surface-variant;
  opacity: 0.7;
}

.step-textarea {
  width: 100%;
  min-height: 360rpx;
  background-color: $color-surface-container-low;
  border-radius: $radius-default;
  padding: 40rpx;
  font-size: $fs-body-lg;
  color: $color-on-surface;
  border: none;
  box-sizing: border-box;
}

.quick-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
  margin-top: 32rpx;
}

.quick-tag {
  padding: 12rpx 24rpx;
  border-radius: $radius-full;
  font-size: $fs-label-md;
  background-color: rgba($color-secondary-container, 0.3);
  color: $color-on-secondary-container;
}

.tip-card {
  display: flex;
  gap: 32rpx;
  padding: 40rpx;
  background-color: rgba($color-primary-container, 0.1);
  border: 2rpx solid rgba($color-primary-container, 0.2);
  border-radius: $radius-default;
  margin-bottom: $sp-module-gap;
}

.tip-icon {
  font-size: 40rpx;
}

.tip-body {
  flex: 1;
}

.tip-title {
  display: block;
  font-size: $fs-label-md;
  font-weight: 600;
  color: $color-on-primary-container;
  margin-bottom: 8rpx;
}

.tip-text {
  font-size: $fs-body-md;
  color: rgba($color-on-primary-container, 0.8);
}

.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 32rpx $sp-page-margin;
  padding-bottom: constant(safe-area-inset-bottom);
  padding-bottom: env(safe-area-inset-bottom);
  background-color: rgba($color-background, 0.95);
  backdrop-filter: blur(20rpx);
  display: flex;
  align-items: center;
  justify-content: space-between;
  z-index: 50;
}

.suspend-btn {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 32rpx 16rpx;
}

.suspend-icon { font-size: 36rpx; }

.suspend-label {
  font-size: $fs-label-md;
  color: $color-on-surface-variant;
}

.nav-btns {
  display: flex;
  align-items: center;
  gap: $sp-inline-gap;
}

.nav-btn {
  width: 96rpx;
  height: 96rpx;
  border-radius: $radius-full;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: $color-surface-container-high;
}

.nav-btn-primary {
  width: auto;
  padding: 0 64rpx;
  height: 112rpx;
  background-color: $color-primary;
  border-radius: $radius-default;
  box-shadow: $shadow-healing;
}

.nav-icon {
  font-size: 48rpx;
  color: $color-on-surface-variant;
  font-weight: 300;
}

.nav-btn-primary .nav-icon {
  color: $color-on-primary;
}

.nav-label {
  font-size: $fs-headline-sm;
  font-weight: 600;
  color: $color-on-primary;
}

.overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.prompt-card {
  width: 600rpx;
  padding: 64rpx 48rpx;
  background-color: $color-background;
  border-radius: $radius-lg;
  text-align: center;
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from { 
    opacity: 0; 
    transform: translateY(40rpx);
  }
  to { 
    opacity: 1; 
    transform: translateY(0);
  }
}

.prompt-icon {
  font-size: 96rpx;
  margin-bottom: 32rpx;
}

.prompt-title {
  display: block;
  font-size: $fs-headline-md;
  font-weight: 600;
  color: $color-on-surface;
  margin-bottom: 16rpx;
}

.prompt-desc {
  display: block;
  font-size: $fs-body-md;
  color: $color-on-surface-variant;
  line-height: 1.6;
  margin-bottom: 48rpx;
}

.prompt-btns {
  display: flex;
  gap: 24rpx;
}

.prompt-btn-cancel {
  flex: 1;
  padding: 28rpx;
  border-radius: $radius-default;
  background-color: $color-surface-container-high;
}

.prompt-btn-suspend {
  flex: 1;
  padding: 28rpx;
  border-radius: $radius-default;
  background-color: $color-primary;
}

.prompt-btn-text {
  font-size: $fs-headline-sm;
  font-weight: 600;
}

.prompt-btn-cancel .prompt-btn-text {
  color: $color-on-surface-variant;
}

.prompt-btn-suspend .prompt-btn-text {
  color: $color-on-primary;
}
</style>
