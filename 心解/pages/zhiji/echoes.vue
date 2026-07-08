<template>
  <view class="page-container">
    <view class="header">
      <view class="back-btn pressable" @click="goBack">
        <text class="back-icon">‹</text>
      </view>
      <text class="header-title">时光回响</text>
      <view style="width: 80rpx;" />
    </view>

    <view v-if="pendingEchoes.length > 0" class="pending-section">
      <view class="section-header">
        <text class="section-title">即将回响</text>
        <text class="section-sub">{{ pendingEchoes.length }} 条待回顾</text>
      </view>
      <view v-for="echo in pendingEchoes" :key="echo.id" class="echo-card card pressable" @click="viewEcho(echo)">
        <view class="echo-countdown">
          <view class="countdown-ring">
            <view class="countdown-progress" :style="{ background: getCountdownGradient(echo) }" />
            <view class="countdown-center">
              <text class="countdown-value">{{ getCountdownText(echo) }}</text>
              <text class="countdown-label">后回响</text>
            </view>
          </view>
        </view>
        <view class="echo-content">
          <text class="echo-preview">{{ echo.content.substring(0, 50) }}...</text>
          <text class="echo-date">记录于 {{ echo.date }}</text>
        </view>
        <view class="echo-arrow">›</view>
      </view>
    </view>

    <view class="empty-section" v-else>
      <text class="empty-emoji">🌙</text>
      <text class="empty-title">暂无待回响的记录</text>
      <text class="empty-desc">在写随记时设置时光回响，让未来的自己与此刻对话</text>
    </view>

    <view v-if="completedEchoes.length > 0" class="completed-section">
      <view class="section-header">
        <text class="section-title">已完成回响</text>
        <text class="section-sub">{{ completedEchoes.length }} 条已回顾</text>
      </view>
      <view v-for="echo in completedEchoes" :key="echo.id" class="completed-card card">
        <view class="completed-header">
          <text class="completed-emoji">{{ getDeltaEmoji(echo.delta) }}</text>
          <text class="completed-delta">δ={{ echo.delta || 0 }}</text>
        </view>
        <text class="completed-preview">{{ echo.content.substring(0, 60) }}...</text>
        <view class="completed-footer">
          <text class="completed-date">记录于 {{ echo.date }}</text>
          <text class="completed-review-date">回顾于 {{ echo.reviewDate }}</text>
        </view>
      </view>
    </view>

    <view class="bottom-spacer" />
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { zhijiState } from '../../store/useZhijiStore.js'

const pendingEchoes = computed(() => {
  return zhijiState.records
    .filter(r => r.echoTime && !r.echoReviewed)
    .sort((a, b) => new Date(a.echoTime) - new Date(b.echoTime))
})

const completedEchoes = computed(() => {
  return zhijiState.records
    .filter(r => r.echoReviewed)
    .sort((a, b) => new Date(b.reviewDate) - new Date(a.reviewDate))
})

function goBack() {
  uni.navigateBack({ delta: 1 })
}

function getCountdownText(echo) {
  const now = new Date().getTime()
  const target = new Date(echo.echoTime).getTime()
  const diff = target - now
  
  if (diff < 0) return '现在'
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  
  if (days > 0) return `${days}天`
  if (hours > 0) return `${hours}小时`
  return `${minutes}分钟`
}

function getCountdownGradient(echo) {
  const now = new Date().getTime()
  const target = new Date(echo.echoTime).getTime()
  const recordTime = new Date(`${echo.date} ${echo.time}`).getTime()
  const total = target - recordTime
  const elapsed = now - recordTime
  const percent = Math.min(100, (elapsed / total) * 100)
  
  return `conic-gradient(#4caf50 ${percent * 3.6}deg, rgba(0,0,0,0.1) ${percent * 3.6}deg)`
}

function getDeltaEmoji(delta) {
  const d = delta || 0
  if (d >= 80) return '🌟'
  if (d >= 60) return '✨'
  if (d >= 40) return '💫'
  return '💭'
}

function viewEcho(echo) {
  uni.navigateTo({ url: '/pages/zhiji/record-detail?id=' + echo.id })
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

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
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

.card {
  background-color: $color-surface-container-lowest;
  border-radius: $radius-default;
}

.pending-section {
  margin-bottom: $sp-module-gap;
}

.echo-card {
  display: flex;
  align-items: center;
  gap: 24rpx;
  padding: 32rpx;
  margin: 0 $sp-page-margin $sp-module-gap;
}

.echo-countdown {
  flex-shrink: 0;
}

.countdown-ring {
  width: 120rpx;
  height: 120rpx;
  position: relative;
}

.countdown-progress {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: $radius-full;
  transition: all 0.5s ease;
}

.countdown-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 90rpx;
  height: 90rpx;
  border-radius: $radius-full;
  background-color: $color-background;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.countdown-value {
  font-size: $fs-headline-sm;
  font-weight: 700;
  color: $color-primary;
}

.countdown-label {
  font-size: 20rpx;
  color: rgba($color-on-surface, 0.5);
}

.echo-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.echo-preview {
  font-size: $fs-body-md;
  color: $color-on-surface;
  line-height: 1.5;
}

.echo-date {
  font-size: $fs-label-sm;
  color: rgba($color-on-surface, 0.5);
}

.echo-arrow {
  font-size: 48rpx;
  color: rgba($color-on-surface, 0.3);
}

.empty-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx $sp-page-margin;
  text-align: center;
}

.empty-emoji {
  font-size: 96rpx;
  margin-bottom: 32rpx;
}

.empty-title {
  font-size: $fs-headline-md;
  font-weight: 600;
  color: $color-on-surface;
  margin-bottom: 16rpx;
}

.empty-desc {
  font-size: $fs-body-md;
  color: $color-on-surface-variant;
  line-height: 1.6;
}

.completed-section {
  margin-bottom: $sp-module-gap;
}

.completed-card {
  padding: 32rpx;
  margin: 0 $sp-page-margin 20rpx;
  border-left: 6rpx solid $color-primary-container;
}

.completed-header {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 16rpx;
}

.completed-emoji {
  font-size: 32rpx;
}

.completed-delta {
  font-size: $fs-label-md;
  color: $color-primary;
  font-weight: 600;
}

.completed-preview {
  font-size: $fs-body-md;
  color: $color-on-surface-variant;
  line-height: 1.6;
  margin-bottom: 20rpx;
}

.completed-footer {
  display: flex;
  justify-content: space-between;
}

.completed-date, .completed-review-date {
  font-size: $fs-label-sm;
  color: rgba($color-on-surface, 0.5);
}

.bottom-spacer {
  height: 200rpx;
}
</style>