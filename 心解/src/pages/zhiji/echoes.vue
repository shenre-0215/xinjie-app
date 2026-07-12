<template>
  <view class="page-container">
    <!-- #ifdef H5 -->
    <view class="h5-safe-top" />
    <!-- #endif -->

    <view class="header">
      <view class="back-btn pressable" @click="goBack">
        <text class="back-icon">‹</text>
      </view>
      <text class="header-title">时光回响</text>
      <view style="width:80rpx" />
    </view>

    <scroll-view scroll-y class="body-scroll">
      <!-- ── 介绍卡片 ── -->
      <view class="intro-card">
        <view class="intro-decor" />
        <text class="intro-emoji">⏳</text>
        <text class="intro-heading">让过去的自己，与现在的你对话</text>
        <text class="intro-sub">当时光的回响响起，看看那时的你在想什么</text>
      </view>

      <!-- ── 到期回响 ── -->
      <view v-if="dueEchoes.length" class="section">
        <view class="section-label">
          <text class="label-dot label-dot-due" />
          <text class="label-text">已到期的回响</text>
          <text class="label-count">{{ dueEchoes.length }}</text>
        </view>

        <view
          v-for="echo in dueEchoes"
          :key="echo.id"
          class="echo-card card pressable"
          @click="goRecordDetail(echo.id)"
        >
          <view class="echo-corner" />
          <view class="echo-header">
            <view class="echo-meta">
              <text class="echo-badge">{{ echoTypeLabel(echo.type) }}</text>
              <text class="echo-badge echo-badge-time">{{ echoGapLabel(echo.date) }}</text>
            </view>
            <text v-if="echo.mood" class="echo-mood">{{ moodEmoji(echo.mood) }}</text>
          </view>

          <text class="echo-content">{{ echo.content }}</text>

          <view class="echo-footer">
            <view class="echo-tags">
              <text v-for="tag in (echo.tags || [])" :key="tag" class="echo-tag">#{{ tag }}</text>
            </view>
            <text class="echo-date">{{ echo.date }}</text>
          </view>

          <view class="echo-reply-hint">
            <text class="echo-reply-icon">✎</text>
            <text class="echo-reply-text">写个回信给那时的自己</text>
          </view>
        </view>
      </view>

      <!-- ── 即将到来的回响 ── -->
      <view v-if="upcomingEchoes.length" class="section">
        <view class="section-label">
          <text class="label-dot label-dot-upcoming" />
          <text class="label-text">即将到来</text>
          <text class="label-count label-count-dim">{{ upcomingEchoes.length }}</text>
        </view>

        <view
          v-for="echo in upcomingEchoes"
          :key="echo.id"
          class="echo-card echo-card-upcoming card"
        >
          <view class="echo-header">
            <view class="echo-meta">
              <text class="echo-badge echo-badge-upcoming">{{ echoTypeLabel(echo.type) }}</text>
              <text class="echo-badge echo-badge-countdown">{{ echoCountdown(echo.date, echo.echoTime) }}</text>
            </view>
            <text v-if="echo.mood" class="echo-mood">{{ moodEmoji(echo.mood) }}</text>
          </view>

          <text class="echo-content echo-content-blur">{{ echo.content.substring(0, 60) }}...</text>

          <view class="echo-date">{{ echo.date }}</view>
        </view>
      </view>

      <EmptyState
        v-if="!hasEchoes"
        emoji="⏳"
        text="还没有时光回响"
        hint="在随记时点击「设置时光回响」，让未来的自己收到今天的信"
        :show-action="true"
        action-text="去写随记"
        @action="goDiaryEdit"
      />

      <view class="bottom-spacer" />
    </scroll-view>
  </view>
</template>

<script setup>
import { computed } from 'vue'
import { zhijiState } from '../../store/useZhijiStore.js'
import EmptyState from '../../components/EmptyState.vue'

const ECHO_DURATIONS = {
  '1day': 1,
  '1week': 7,
  '1month': 30,
  '3month': 90,
  '1year': 365
}

function getEchoDate(recordDate, echoTime) {
  const days = ECHO_DURATIONS[echoTime] || 0
  if (!days || !recordDate) return null
  const d = new Date(recordDate)
  d.setDate(d.getDate() + days)
  return d
}

function isEchoDue(recordDate, echoTime) {
  const echoDate = getEchoDate(recordDate, echoTime)
  if (!echoDate) return false
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return echoDate <= today
}

// All records with echoTime set
const echoRecords = computed(() =>
  zhijiState.records.filter(r => r.echoTime && r.echoTime !== 'none')
)

// Due echoes
const dueEchoes = computed(() =>
  echoRecords.value.filter(r => isEchoDue(r.date, r.echoTime))
    .sort((a, b) => new Date(b.date) - new Date(a.date))
)

// Upcoming (not yet due)
const upcomingEchoes = computed(() =>
  echoRecords.value.filter(r => !isEchoDue(r.date, r.echoTime))
    .sort((a, b) => {
      const da = getEchoDate(a.date, a.echoTime)
      const db = getEchoDate(b.date, b.echoTime)
      return (da || 0) - (db || 0)
    })
)

const hasEchoes = computed(() => echoRecords.value.length > 0)

// ── labels ──

function echoTypeLabel(type) {
  return type === 'thinking-chain' ? '思考链' : '日记'
}

function echoGapLabel(recordDate) {
  if (!recordDate) return ''
  const rd = new Date(recordDate)
  const today = new Date()
  const diffDays = Math.floor((today - rd) / (1000 * 60 * 60 * 24))
  if (diffDays <= 1) return '昨天写的'
  if (diffDays <= 7) return `${diffDays} 天前`
  if (diffDays <= 30) return `${Math.floor(diffDays / 7)} 周前`
  if (diffDays <= 365) return `${Math.floor(diffDays / 30)} 个月前`
  return `${Math.floor(diffDays / 365)} 年前`
}

function echoCountdown(recordDate, echoTime) {
  const echoDate = getEchoDate(recordDate, echoTime)
  if (!echoDate) return ''
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const diffDays = Math.ceil((echoDate - today) / (1000 * 60 * 60 * 24))
  if (diffDays <= 1) return '明天'
  if (diffDays <= 7) return `${diffDays} 天后`
  if (diffDays <= 30) return `${Math.floor(diffDays / 7)} 周后`
  return `${Math.floor(diffDays / 30)} 个月后`
}

function moodEmoji(mood) {
  const map = { 'very-happy': '☀️', 'happy': '⛅', 'neutral': '☁️', 'sad': '🌧️', 'very-sad': '⛈️' }
  return map[mood] || ''
}

// ── actions ──

function goBack() {
  uni.navigateBack({ delta: 1 })
}

function goRecordDetail(id) {
  uni.navigateTo({ url: '/pages/zhiji/record-detail?id=' + id })
}

function goDiaryEdit() {
  uni.navigateTo({ url: '/pages/zhiji/diary-edit' })
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';
@import '@/styles/mixins.scss';

.page-container {
  min-height: 100vh;
  background-color: $color-background;
  padding-top: calc(env(safe-area-inset-top) + 88rpx);
  padding-bottom: 160rpx;
}

.header {
  position: fixed; top: 0; left: 0; right: 0; z-index: 100;
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 32rpx;
  padding-top: constant(safe-area-inset-top);
  padding-top: env(safe-area-inset-top);
  padding-bottom: 16rpx;
  background-color: rgba($color-background, 0.85);
  backdrop-filter: blur(20rpx);
}

.back-btn {
  width: 80rpx; height: 80rpx; border-radius: $radius-full;
  display: flex; align-items: center; justify-content: center;
}
.back-icon { font-size: 48rpx; color: $color-on-surface-variant; font-weight: 300; }
.header-title { font-size: $fs-headline-md; font-weight: 600; color: rgba($color-on-surface, 0.8); }

.body-scroll { padding: 0 $sp-page-margin; }

// ── intro ──
.intro-card {
  position: relative;
  padding: 48rpx 40rpx;
  margin-bottom: 48rpx;
  border-radius: $radius-lg;
  background: linear-gradient(135deg, rgba($color-tertiary-container, 0.2) 0%, transparent 100%);
  display: flex; flex-direction: column; align-items: center; gap: 16rpx;
  overflow: hidden;
}
.intro-decor {
  position: absolute; top: -60rpx; right: -40rpx;
  width: 200rpx; height: 200rpx; border-radius: $radius-full;
  background-color: rgba($color-tertiary-container, 0.15);
  filter: blur(30rpx);
}
.intro-emoji { font-size: 64rpx; position: relative; z-index: 1; }
.intro-heading {
  font-size: $fs-headline-sm; font-weight: 600; color: $color-on-surface;
  position: relative; z-index: 1; text-align: center;
}
.intro-sub {
  font-size: $fs-body-sm; color: rgba($color-on-surface-variant, 0.7);
  position: relative; z-index: 1; text-align: center;
}

// ── section ──
.section { margin-bottom: 48rpx; }

.section-label {
  display: flex; align-items: center; gap: 16rpx;
  margin-bottom: 32rpx;
}
.label-dot { width: 16rpx; height: 16rpx; border-radius: $radius-full; }
.label-dot-due { background-color: $color-tertiary; }
.label-dot-upcoming { background-color: rgba($color-on-surface-variant, 0.3); }
.label-text { font-size: $fs-headline-sm; font-weight: 600; color: $color-on-surface-variant; }
.label-count {
  font-size: $fs-label-sm; font-weight: 600;
  padding: 4rpx 16rpx; border-radius: $radius-full;
  background-color: $color-tertiary; color: $color-on-tertiary;
}
.label-count-dim { background-color: rgba($color-on-surface-variant, 0.1); color: rgba($color-on-surface-variant, 0.5); }

// ── echo cards ──
.card {
  background-color: $color-surface-container-lowest;
  border-radius: $radius-md;
}

.echo-card {
  padding: 40rpx;
  margin-bottom: 24rpx;
  position: relative;
  overflow: hidden;
  transition: transform 0.2s ease;
  &:active { transform: scale(0.98); }
}

.echo-corner {
  position: absolute; top: 0; right: 0;
  width: 0; height: 0;
  border-style: solid;
  border-width: 48rpx 48rpx 0 0;
  border-color: rgba($color-tertiary-container, 0.2) transparent transparent transparent;
}

.echo-card-upcoming { opacity: 0.6; }

.echo-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 20rpx; }
.echo-meta { display: flex; gap: 12rpx; }

.echo-badge {
  font-size: $fs-label-sm; padding: 4rpx 16rpx; border-radius: $radius-full;
  background-color: rgba($color-primary-container, 0.3); color: $color-on-primary-container;
}
.echo-badge-time { background-color: rgba($color-tertiary-container, 0.3); color: $color-on-tertiary-fixed-variant; }
.echo-badge-upcoming { background-color: rgba($color-on-surface-variant, 0.08); color: rgba($color-on-surface-variant, 0.5); }
.echo-badge-countdown { background-color: rgba($color-secondary-container, 0.2); color: $color-on-secondary-container; }

.echo-mood { font-size: 40rpx; }

.echo-content {
  font-size: $fs-body-md; line-height: $lh-body-md; color: $color-on-surface;
  @include text-truncate(4);
  margin-bottom: 20rpx;
}
.echo-content-blur { color: rgba($color-on-surface-variant, 0.5); }

.echo-footer { display: flex; align-items: center; justify-content: space-between; }

.echo-tags { display: flex; flex-wrap: wrap; gap: 12rpx; }
.echo-tag {
  font-size: $fs-label-sm; padding: 4rpx 16rpx; border-radius: 8rpx;
  background-color: rgba($color-tertiary-fixed, 0.2); color: $color-on-tertiary-fixed-variant;
}

.echo-date { font-size: $fs-label-sm; color: rgba($color-on-surface-variant, 0.5); }

// ── reply hint ──
.echo-reply-hint {
  display: flex; align-items: center; gap: 8rpx;
  margin-top: 24rpx; padding-top: 24rpx;
  border-top: 1rpx solid rgba($color-on-surface, 0.05);
}
.echo-reply-icon { font-size: 28rpx; color: $color-primary; }
.echo-reply-text { font-size: $fs-body-sm; color: $color-primary; }

// ── empty ──
.bottom-spacer { height: 80rpx; }

.pressable:active { opacity: 0.7; }
</style>
