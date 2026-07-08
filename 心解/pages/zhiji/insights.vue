<template>
  <view class="page-container">
    <view class="header">
      <view class="back-btn pressable" @click="goBack">
        <text class="back-icon">‹</text>
      </view>
      <text class="header-title">觉察报告</text>
      <view class="header-spacer" />
    </view>

    <view class="summary-card">
      <view class="summary-decor" />
      <view class="summary-ring">
        <view class="ring-bg" />
        <view class="ring-progress" :style="{ background: ringGradient }" />
        <view class="ring-center">
          <text class="ring-value">{{ insights.insightValue }}</text>
          <text class="ring-label">觉察值</text>
        </view>
      </view>
      <text class="summary-emoji">✨</text>
      <text class="summary-title">你的内心正在发光</text>
      <text class="summary-desc">通过记录和梳理，你对自己的觉察正在稳步提升</text>
    </view>

    <view class="stats-row">
      <view class="stat-card">
        <view class="stat-icon-wrap">
          <text class="stat-icon">💪</text>
        </view>
        <text class="stat-value">{{ insights.resilienceValue }}</text>
        <text class="stat-label">韧性值</text>
      </view>
      <view class="stat-card">
        <view class="stat-icon-wrap">
          <text class="stat-icon">📈</text>
        </view>
        <text class="stat-value">{{ insights.confidenceChange }}</text>
        <text class="stat-label">信心趋势</text>
      </view>
      <view class="stat-card">
        <view class="stat-icon-wrap">
          <text class="stat-icon">📝</text>
        </view>
        <text class="stat-value">{{ stats.totalRecords }}</text>
        <text class="stat-label">记录数</text>
      </view>
      <view class="stat-card">
        <view class="stat-icon-wrap">
          <text class="stat-icon">🔗</text>
        </view>
        <text class="stat-value">{{ stats.completedChains }}</text>
        <text class="stat-label">闭合链</text>
      </view>
    </view>

    <view class="section-title-row">
      <text class="section-title">情绪模式</text>
      <text class="section-sub">最近7天的情绪分布</text>
    </view>

    <view class="mood-chart-card">
      <view v-for="(day, index) in moodHistory" :key="index" class="chart-bar-wrap">
        <view class="bar-label">{{ day.label }}</view>
        <view class="bar-track">
          <view class="bar-fill" :style="{ height: day.percent + '%', backgroundColor: day.color }" />
        </view>
        <text class="bar-emoji">{{ day.emoji }}</text>
      </view>
    </view>

    <view class="section-title-row">
      <text class="section-title">模式发现</text>
      <text class="section-sub">我们发现了你的独特节奏</text>
    </view>

    <view class="patterns-list">
      <view v-for="(pattern, index) in patterns" :key="index" class="pattern-card" :class="`pattern-${pattern.color}`">
        <view class="pattern-icon">{{ pattern.icon }}</view>
        <view class="pattern-content">
          <text class="pattern-title">{{ pattern.title }}</text>
          <text class="pattern-desc">{{ pattern.desc }}</text>
        </view>
      </view>
    </view>

    <view class="section-title-row">
      <text class="section-title">智能建议</text>
      <text class="section-sub">基于你的记录给出的建议</text>
    </view>

    <view class="advice-list">
      <view v-for="(advice, index) in advices" :key="index" class="advice-card">
        <view class="advice-number">{{ index + 1 }}</view>
        <text class="advice-text">{{ advice }}</text>
      </view>
    </view>

    <view class="bottom-spacer" />
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { zhijiState } from '../../store/useZhijiStore.js'

const insights = ref({
  insightValue: 86,
  resilienceValue: 72,
  confidenceTrend: '稳步上升',
  confidenceChange: '+12%'
})

const stats = computed(() => {
  const records = zhijiState.records
  const chains = records.filter(r => r.type === 'thinking-chain' && r.status === 'closed')
  return {
    totalRecords: records.length,
    completedChains: chains.length
  }
})

const moodHistory = ref([
  { label: '周一', percent: 60, color: '#4caf50', emoji: '😊' },
  { label: '周二', percent: 45, color: '#f9a825', emoji: '😌' },
  { label: '周三', percent: 30, color: '#2196f3', emoji: '😔' },
  { label: '周四', percent: 55, color: '#4caf50', emoji: '😊' },
  { label: '周五', percent: 80, color: '#4caf50', emoji: '😄' },
  { label: '周六', percent: 70, color: '#4caf50', emoji: '😊' },
  { label: '周日', percent: 50, color: '#f9a825', emoji: '😌' }
])

const patterns = ref([
  {
    icon: '🌅',
    title: '晨间记录者',
    desc: '你倾向于在早晨进行记录，这有助于开启美好的一天',
    color: 'green'
  },
  {
    icon: '💡',
    title: '破局能力强',
    desc: '你在思考链的破局步骤中表现出色，善于找到新视角',
    color: 'yellow'
  },
  {
    icon: '🎯',
    title: '实践派',
    desc: '你通常会将思考转化为具体行动，执行力很强',
    color: 'blue'
  }
])

const advices = ref([
  '继续保持晨间记录的习惯，这有助于提升你的觉察力',
  '尝试在悬置清单中关注那些"含苞待放"的条目，它们可能很快就会有新突破',
  '本周你的信心在稳步提升，可以尝试挑战一些之前不敢做的事情',
  '注意周三的情绪低谷，提前做好心理准备'
])

const ringGradient = computed(() => {
  const value = insights.value.insightValue
  if (value >= 80) return `conic-gradient(#4caf50 ${value * 3.6}deg, rgba(0,0,0,0.1) ${value * 3.6}deg)`
  if (value >= 60) return `conic-gradient(#f9a825 ${value * 3.6}deg, rgba(0,0,0,0.1) ${value * 3.6}deg)`
  return `conic-gradient(#2196f3 ${value * 3.6}deg, rgba(0,0,0,0.1) ${value * 3.6}deg)`
})

function goBack() {
  uni.navigateBack({ delta: 1 })
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

.header-spacer { width: 80rpx; }

.summary-card {
  margin: 0 $sp-page-margin;
  padding: 64rpx 48rpx;
  border-radius: $radius-lg;
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

.summary-decor {
  position: absolute;
  top: -80rpx;
  right: -80rpx;
  width: 240rpx;
  height: 240rpx;
  border-radius: $radius-full;
  background-color: rgba($color-primary-container, 0.2);
  pointer-events: none;
}

.summary-ring {
  width: 240rpx;
  height: 240rpx;
  position: relative;
  margin-bottom: 32rpx;
}

.ring-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: $radius-full;
  background-color: rgba($color-on-surface, 0.08);
}

.ring-progress {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: $radius-full;
  transition: all 1s ease;
}

.ring-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 180rpx;
  height: 180rpx;
  border-radius: $radius-full;
  background-color: $color-background;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.ring-value {
  font-size: 64rpx;
  font-weight: 700;
  color: $color-primary;
}

.ring-label {
  font-size: $fs-label-md;
  color: rgba($color-on-surface, 0.5);
}

.summary-emoji {
  font-size: 48rpx;
  margin-bottom: 16rpx;
}

.summary-title {
  font-size: $fs-headline-md;
  font-weight: 600;
  color: $color-on-surface;
  margin-bottom: 12rpx;
}

.summary-desc {
  font-size: $fs-body-md;
  color: $color-on-surface-variant;
  line-height: 1.6;
}

.stats-row {
  display: flex;
  justify-content: space-between;
  padding: 0 $sp-page-margin;
  margin-bottom: $sp-module-gap;
}

.stat-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32rpx 16rpx;
  background-color: $color-surface-container-lowest;
  border-radius: $radius-default;
  margin-right: 16rpx;
}

.stat-card:last-child {
  margin-right: 0;
}

.stat-icon-wrap {
  width: 64rpx;
  height: 64rpx;
  border-radius: $radius-full;
  background-color: rgba($color-primary-container, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16rpx;
}

.stat-icon {
  font-size: 32rpx;
}

.stat-value {
  font-size: $fs-headline-md;
  font-weight: 700;
  color: $color-on-surface;
  margin-bottom: 8rpx;
}

.stat-label {
  font-size: $fs-label-sm;
  color: rgba($color-on-surface, 0.5);
}

.section-title-row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  padding: 0 $sp-page-margin;
  margin-bottom: 24rpx;
}

.section-title {
  font-size: $fs-headline-sm;
  font-weight: 600;
  color: $color-on-surface;
}

.section-sub {
  font-size: $fs-label-md;
  color: rgba($color-on-surface, 0.5);
}

.mood-chart-card {
  margin: 0 $sp-page-margin;
  padding: 40rpx;
  background-color: $color-surface-container-lowest;
  border-radius: $radius-default;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  height: 320rpx;
  margin-bottom: $sp-module-gap;
}

.chart-bar-wrap {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12rpx;
}

.bar-label {
  font-size: $fs-label-sm;
  color: rgba($color-on-surface, 0.5);
}

.bar-track {
  width: 40rpx;
  height: 200rpx;
  background-color: rgba($color-on-surface, 0.06);
  border-radius: $radius-full;
  display: flex;
  align-items: flex-end;
  overflow: hidden;
}

.bar-fill {
  width: 100%;
  border-radius: $radius-full;
  transition: height 0.5s ease;
}

.bar-emoji {
  font-size: 28rpx;
}

.patterns-list {
  padding: 0 $sp-page-margin;
  display: flex;
  flex-direction: column;
  gap: 24rpx;
  margin-bottom: $sp-module-gap;
}

.pattern-card {
  display: flex;
  align-items: flex-start;
  gap: 24rpx;
  padding: 32rpx;
  background-color: $color-surface-container-lowest;
  border-radius: $radius-default;
  border-left: 6rpx solid;
}

.pattern-green {
  border-left-color: #4caf50;
}

.pattern-yellow {
  border-left-color: #f9a825;
}

.pattern-blue {
  border-left-color: #2196f3;
}

.pattern-icon {
  font-size: 40rpx;
}

.pattern-content {
  flex: 1;
}

.pattern-title {
  display: block;
  font-size: $fs-headline-sm;
  font-weight: 600;
  color: $color-on-surface;
  margin-bottom: 8rpx;
}

.pattern-desc {
  font-size: $fs-body-md;
  color: $color-on-surface-variant;
  line-height: 1.5;
}

.advice-list {
  padding: 0 $sp-page-margin;
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.advice-card {
  display: flex;
  align-items: flex-start;
  gap: 20rpx;
  padding: 28rpx 32rpx;
  background-color: rgba($color-primary-container, 0.08);
  border-radius: $radius-default;
}

.advice-number {
  width: 48rpx;
  height: 48rpx;
  border-radius: $radius-full;
  background-color: $color-primary-container;
  color: $color-on-primary-container;
  font-size: $fs-label-md;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.advice-text {
  font-size: $fs-body-md;
  color: $color-on-surface-variant;
  line-height: 1.6;
}

.bottom-spacer {
  height: 200rpx;
}
</style>