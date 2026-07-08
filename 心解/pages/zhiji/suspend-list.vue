<template>
  <view class="page-container">
    <view class="header">
      <view class="back-btn pressable" @click="goBack">
        <text class="back-icon">‹</text>
      </view>
      <text class="header-title">悬置清单</text>
      <view class="help-btn pressable">
        <text class="help-icon">?</text>
      </view>
    </view>

    <view class="intro-card">
      <view class="intro-decor" />
      <text class="intro-emoji">🌱</text>
      <text class="intro-heading">放一放也没关系</text>
      <text class="intro-sub">等有了新的感受，再回来就好</text>
    </view>

    <view v-if="sortedItems.length" class="list-section">
      <view
        v-for="item in sortedItems"
        :key="item.id"
        class="suspend-card card pressable-subtle"
        :class="`growth-${item.growthStage}`"
        @click="resumeItem(item)"
      >
        <view class="card-header">
          <view class="growth-indicator">
            <view class="growth-stage-icon" :class="`stage-${item.growthStage}`">
              <text class="stage-emoji">{{ item.growthEmoji }}</text>
            </view>
            <view class="growth-info">
              <text class="growth-label">{{ item.growthLabel }}</text>
              <view class="growth-meta">
                <text class="days-text">已悬置 {{ item.realDays }} 天</text>
                <text class="step-badge">停在「{{ item.stepLabel }}」</text>
              </view>
            </view>
          </view>
          <view v-if="item.source === 'xinbao'" class="source-badge">💬 心宝</view>
        </view>

        <view class="card-body">
          <text class="card-content">{{ item.content }}</text>
          <view class="card-tags">
            <text v-for="tag in item.tags" :key="tag" class="tag-item">#{{ tag }}</text>
          </view>
        </view>

        <view class="growth-bar">
          <view class="growth-fill" :style="{ width: item.growthPercent + '%' }" />
        </view>

        <view class="card-footer">
          <view class="advice-row" :class="'advice-' + item.advice.color">
            <text class="advice-icon">📌</text>
            <text class="advice-text">{{ item.advice.label }}</text>
          </view>
          <view class="resume-btn pressable" @click.stop="resumeItem(item)">
            <text class="resume-text">继续梳理</text>
            <text class="resume-arrow">›</text>
          </view>
        </view>
      </view>
    </view>

    <EmptyState
      v-else
      emoji="🌱"
      text="没有悬置的条目"
      hint="放一放也没关系，等你准备好了再回来"
    />

    <view class="bottom-mascot">
      <text class="mascot-emoji">🌿</text>
    </view>

    <view class="bottom-spacer" />
  </view>
</template>

<script setup>
import { computed } from 'vue'
import { zhijiState, calcReviewAdvice } from '../../store/useZhijiStore.js'
import EmptyState from '../../components/EmptyState.vue'

const stepLabels = ['觉察', '拆解', '破局', '实践', '复盘']

const getStepSpeedMultiplier = (stepIndex) => {
  const multipliers = [0.5, 0.7, 1.2, 1.0, 1.5]
  return multipliers[stepIndex] || 1.0
}

const getGrowthStage = (days, stepIndex) => {
  const speed = getStepSpeedMultiplier(stepIndex)
  const effectiveDays = days * speed
  
  if (effectiveDays <= 1) return { stage: 'seed', emoji: '🌰', label: '正在孕育', percent: 10 }
  if (effectiveDays <= 3) return { stage: 'sprout', emoji: '🌱', label: '开始萌芽', percent: 30 }
  if (effectiveDays <= 7) return { stage: 'grow', emoji: '🌿', label: '茁壮成长', percent: 60 }
  if (effectiveDays <= 14) return { stage: 'bloom', emoji: '🌸', label: '含苞待放', percent: 85 }
  return { stage: 'flower', emoji: '🌺', label: '盛开绽放', percent: 100 }
}

const getContinueAdvice = (stage, stepIndex) => {
  if (stage === 'seed') return { label: '让思绪先沉淀一下', color: 'gray' }
  if (stage === 'sprout') return { label: '正在积累，快有新想法了', color: 'gray' }
  if (stage === 'grow') return { label: '可以尝试从第' + stepLabels[stepIndex] + '步继续', color: 'yellow' }
  if (stage === 'bloom') return { label: '时机差不多了，回来继续吧', color: 'green' }
  return { label: '完全准备好了，从第' + stepLabels[stepIndex] + '步开始', color: 'green' }
}

const itemsWithAdvice = computed(() => {
  return zhijiState.suspended.map(item => {
    const record = zhijiState.records.find(r => r.id === item.recordId)
    let realDays = item.suspendedDays || 0
    if (record && record.date) {
      const created = new Date(record.date)
      if (!isNaN(created.getTime())) {
        realDays = Math.max(0, Math.floor((Date.now() - created.getTime()) / 86400000))
      }
    }
    
    const stepIndex = item.stepIndex || record?.stepIndex || 0
    const growth = getGrowthStage(realDays, stepIndex)
    const continueAdvice = getContinueAdvice(growth.stage, stepIndex)
    
    return { 
      ...item, 
      realDays, 
      advice: continueAdvice,
      stepIndex,
      stepLabel: stepLabels[stepIndex] || '觉察',
      ...growth 
    }
  })
})

const sortedItems = computed(() => {
  return [...itemsWithAdvice.value].sort((a, b) => {
    const stageOrder = { seed: 0, sprout: 1, grow: 2, bloom: 3, flower: 4 }
    if (stageOrder[b.growthStage] !== stageOrder[a.growthStage]) {
      return stageOrder[b.growthStage] - stageOrder[a.growthStage]
    }
    return b.realDays - a.realDays
  })
})

function goBack() {
  uni.navigateBack({ delta: 1 })
}

function resumeItem(item) {
  uni.navigateTo({ url: `/pages/zhiji/thinking-chain?recordId=${item.recordId}&step=${item.stepIndex || 0}` })
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';
@import '@/styles/mixins.scss';

.page-container {
  @include page-container;
  padding-top: calc(env(safe-area-inset-top) + 88rpx);
}

.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 $sp-page-margin;
  padding-top: constant(safe-area-inset-top);
  padding-top: env(safe-area-inset-top);
  padding-bottom: 16rpx;
  background-color: $color-background;
}

.back-btn {
  width: 80rpx;
  height: 80rpx;
  border-radius: $radius-full;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: $color-surface-container-lowest;
}

.back-icon {
  font-size: 48rpx;
  color: $color-primary;
  font-weight: 300;
}

.header-title {
  font-size: $fs-headline-md;
  font-weight: 600;
  color: $color-primary;
}

.help-btn {
  width: 80rpx;
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.help-icon {
  font-size: 40rpx;
  color: $color-primary;
  font-weight: 600;
}

.intro-card {
  margin: 0 $sp-page-margin;
  padding: 48rpx 40rpx;
  border-radius: $radius-default;
  background-color: $color-surface-container-lowest;
  box-shadow: $shadow-healing;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  position: relative;
  overflow: hidden;
  margin-bottom: $sp-module-gap;
}

.intro-decor {
  position: absolute;
  top: -40rpx;
  right: -40rpx;
  width: 160rpx;
  height: 160rpx;
  border-radius: $radius-full;
  background-color: rgba($color-primary-container, 0.15);
  pointer-events: none;
}

.intro-emoji {
  font-size: 64rpx;
  margin-bottom: 24rpx;
  position: relative;
}

.intro-heading {
  font-size: $fs-headline-md;
  font-weight: 600;
  color: $color-primary;
  margin-bottom: 12rpx;
  position: relative;
}

.intro-sub {
  font-size: $fs-body-md;
  color: rgba($color-on-surface-variant, 0.7);
  line-height: 1.6;
  position: relative;
}

.list-section {
  padding: 0 $sp-page-margin;
  display: flex;
  flex-direction: column;
  gap: $sp-stack-gap;
}

.suspend-card {
  padding: 40rpx;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
}

.suspend-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 6rpx;
  background: linear-gradient(90deg, transparent, rgba($color-primary-container, 0.3), transparent);
}

.suspend-card.growth-seed::before {
  background: linear-gradient(90deg, transparent, rgba(139, 69, 19, 0.4), transparent);
}

.suspend-card.growth-sprout::before {
  background: linear-gradient(90deg, transparent, rgba(76, 175, 80, 0.4), transparent);
}

.suspend-card.growth-grow::before {
  background: linear-gradient(90deg, transparent, rgba(67, 160, 71, 0.4), transparent);
}

.suspend-card.growth-bloom::before {
  background: linear-gradient(90deg, transparent, rgba(233, 30, 99, 0.4), transparent);
}

.suspend-card.growth-flower::before {
  background: linear-gradient(90deg, transparent, rgba(238, 130, 238, 0.4), transparent);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 32rpx;
}

.growth-indicator {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.growth-stage-icon {
  width: 88rpx;
  height: 88rpx;
  border-radius: $radius-full;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba($color-surface-container-low, 0.8);
  transition: all 0.3s ease;
}

.stage-seed {
  background-color: rgba(139, 69, 19, 0.15);
}

.stage-sprout {
  background-color: rgba(76, 175, 80, 0.15);
}

.stage-grow {
  background-color: rgba(67, 160, 71, 0.15);
}

.stage-bloom {
  background-color: rgba(233, 30, 99, 0.15);
}

.stage-flower {
  background-color: rgba(238, 130, 238, 0.15);
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

.stage-emoji {
  font-size: 44rpx;
}

.growth-info {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.growth-label {
  font-size: $fs-headline-sm;
  font-weight: 600;
  color: $color-on-surface;
}

.growth-meta {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.days-text {
  font-size: $fs-label-sm;
  color: rgba($color-on-surface, 0.4);
}

.step-badge {
  font-size: $fs-label-sm;
  padding: 4rpx 16rpx;
  border-radius: $radius-full;
  background-color: rgba($color-primary-container, 0.15);
  color: $color-primary;
  font-weight: 500;
}

.source-badge {
  font-size: $fs-label-sm;
  padding: 8rpx 16rpx;
  border-radius: $radius-full;
  background-color: rgba($color-secondary-container, 0.3);
  color: $color-on-secondary-container;
  font-weight: 500;
}

.card-body {
  margin-bottom: 28rpx;
}

.card-content {
  font-size: $fs-headline-sm;
  font-weight: 600;
  color: $color-on-surface;
  line-height: 1.5;
  margin-bottom: 20rpx;
}

.card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.tag-item {
  font-size: $fs-label-sm;
  color: $color-outline;
}

.growth-bar {
  height: 8rpx;
  background-color: rgba($color-on-surface, 0.08);
  border-radius: $radius-full;
  overflow: hidden;
  margin-bottom: 28rpx;
}

.growth-fill {
  height: 100%;
  background: linear-gradient(90deg, $color-primary-container, $color-secondary-container);
  border-radius: $radius-full;
  transition: width 0.5s ease;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.advice-row {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 12rpx;
  padding: 16rpx 24rpx;
  border-radius: $radius-full;
  margin-right: 24rpx;
}

.advice-green {
  background-color: rgba(#4caf50, 0.08);
  .advice-text { color: #388e3c; }
}

.advice-yellow {
  background-color: rgba(#f9a825, 0.08);
  .advice-text { color: #c17900; }
}

.advice-gray {
  background-color: rgba($color-surface-container-highest, 0.3);
  .advice-text { color: rgba($color-on-surface-variant, 0.5); }
}

.advice-icon {
  font-size: 24rpx;
}

.advice-text {
  font-size: $fs-label-sm;
  font-weight: 500;
}

.resume-btn {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.resume-text {
  font-size: $fs-label-md;
  color: $color-primary;
  font-weight: 600;
}

.resume-arrow {
  font-size: 36rpx;
  color: $color-primary;
}

.bottom-mascot {
  display: flex;
  justify-content: center;
  margin-top: $sp-module-gap;
  opacity: 0.4;
}

.mascot-emoji {
  font-size: 192rpx;
}

.bottom-spacer {
  height: 200rpx;
}
</style>
