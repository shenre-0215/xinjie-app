<template>
  <view class="page-container">
    <!-- #ifdef H5 -->
    <view class="h5-safe-top" />
    <!-- #endif -->
    <view class="decor-top" />
    <view class="decor-plant" />

    <view class="header">
      <view class="header-left">
        <text class="header-icon">✿</text>
        <text class="header-title">织记</text>
      </view>
      <view v-if="todayCount > 0" class="header-badge">
        <text class="badge-text">🌱 {{ todayCount }}条</text>
      </view>
    </view>

    <scroll-view scroll-y class="scroll-area">
      <view class="content-wrapper">
        <view class="growth-card">
          <view class="growth-icon-wrap">
            <text class="growth-emoji">🌱</text>
            <view class="growth-glow" />
          </view>
          <view class="growth-content">
            <text class="growth-title">思绪花园</text>
            <view class="growth-progress">
              <view class="progress-bar">
                <view class="progress-fill" :style="{ width: weekProgress + '%' }" />
              </view>
              <text class="progress-text">本周 {{ completedDays }}/7 天</text>
            </view>
            <text v-if="streak > 0" class="growth-streak">🔥 连续 {{ streak }} 天</text>
          </view>
        </view>

        <view class="actions-grid">
          <view class="action-card pressable" @click="goDiaryEdit">
            <view class="action-bg action-bg-primary" />
            <text class="action-icon">✎</text>
            <text class="action-label">随记</text>
            <text class="action-hint">记录当下</text>
          </view>

          <view class="action-card pressable" @click="goThinkingChain">
            <view class="action-bg action-bg-secondary" />
            <text class="action-icon">🔗</text>
            <text class="action-label">思考链</text>
            <text class="action-hint">梳理思绪</text>
          </view>

          <view class="action-card action-card-wide pressable" @click="goSuspendList">
            <view class="action-bg action-bg-tertiary" />
            <text class="action-icon">📌</text>
            <view class="action-info">
              <text class="action-label">悬置清单</text>
              <text class="action-hint">放一放也没关系</text>
            </view>
            <view v-if="suspendCount > 0" class="action-badge">{{ suspendCount }}</view>
          </view>
        </view>

        <view v-if="hasNewInsights" class="section">
          <view class="feature-card card pressable" @click="goInsights">
            <view class="feature-header">
              <text class="feature-icon">📊</text>
              <text class="feature-title">觉察报告</text>
              <view class="feature-dot" />
            </view>
            <text class="feature-preview">本周有 {{ newInsightsCount }} 条新洞察等你发现</text>
          </view>
        </view>

        <view v-if="hasPendingEchoes" class="section">
          <view class="feature-card card pressable echo-card" @click="goEchoes">
            <view class="feature-header">
              <text class="feature-icon">⏰</text>
              <text class="feature-title">时光回响</text>
              <view class="feature-badge">{{ pendingEchoes }}</view>
            </view>
            <text class="feature-preview">有 {{ pendingEchoes }} 条回响待回顾</text>
          </view>
        </view>

        <view v-for="(records, dateLabel) in recordsByDate" :key="dateLabel" class="section">
          <view class="date-header">
            <view class="date-dot" :class="dateLabel === '今天' ? 'dot-today' : 'dot-past'" />
            <text class="date-label">{{ dateLabel }}</text>
          </view>

          <view class="feed-list">
            <view
              v-for="(record, index) in records"
              :key="record.id"
              class="record-card card pressable-subtle"
              :style="{ animationDelay: index * 0.08 + 's' }"
              @click="goRecordDetail(record.id)"
            >
              <view class="record-corner" :class="record.type" />

              <view class="record-header">
                <template v-if="record.type === 'thinking-chain'">
                  <text class="record-keyword">{{ record.title || '思考链' }}</text>
                  <text v-if="record.delta !== undefined" class="record-delta">δ {{ record.delta }}</text>
                </template>
                <view v-else-if="record.mood" class="record-mood-top">
                  <text class="mood-emoji">{{ moodEmoji(record.mood) }}</text>
                </view>
              </view>

              <view v-if="record.tags && record.tags.length" class="record-tags">
                <text v-for="tag in record.tags" :key="tag" class="tag-chip">#{{ tag }}</text>
              </view>

              <text class="record-content" :class="{ 'record-content-italic': record.type === 'diary' }">
                {{ record.content }}
              </text>

              <view class="record-footer">
                <view class="record-time">
                  <text class="time-icon">◷</text>
                  <text class="time-text">{{ record.time }}</text>
                </view>
                <view v-if="record.type === 'diary' && record.mood" class="record-mood">
                  <text class="mood-tag">{{ moodEmoji(record.mood) }} {{ moodLabel(record.mood) }}</text>
                </view>
              </view>
            </view>
          </view>
        </view>

        <EmptyState
          v-if="!hasRecords"
          emoji="✧"
          text="还没有记录呢"
          hint="写下此刻的思绪，绿精灵会帮你织成网"
          :show-action="true"
          action-text="开始书写"
          @action="goDiaryEdit"
        />

        <view class="bottom-spacer" />
      </view>
    </scroll-view>

    <TabBar current="zhiji" @change="onTabChange" />
  </view>
</template>

<script setup>
import { computed } from 'vue'
import { zhijiState, getRecordsByDate } from '../../store/useZhijiStore.js'
import { switchTab } from '../../store/useAppStore.js'
import TabBar from '../../components/TabBar.vue'
import EmptyState from '../../components/EmptyState.vue'

const recordsByDate = computed(() => getRecordsByDate())
const hasRecords = computed(() => zhijiState.records.filter(r => r.status !== 'suspended').length > 0)

const today = new Date().toDateString()
const todayCount = computed(() => {
  return zhijiState.records.filter(r => {
    const d = new Date(r.date || r.createdAt)
    return d.toDateString() === today && r.status !== 'suspended'
  }).length
})

const completedDays = computed(() => {
  const weekStart = new Date()
  weekStart.setDate(weekStart.getDate() - weekStart.getDay())
  const days = new Set()
  zhijiState.records.forEach(r => {
    const d = new Date(r.date || r.createdAt)
    if (d >= weekStart && r.status !== 'suspended') {
      days.add(d.toDateString())
    }
  })
  return days.size
})

const weekProgress = computed(() => Math.round((completedDays.value / 7) * 100))

const streak = computed(() => {
  let count = 0
  const today = new Date()
  for (let i = 0; i < 365; i++) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const hasRecord = zhijiState.records.some(r => {
      const rd = new Date(r.date || r.createdAt)
      return rd.toDateString() === d.toDateString() && r.status !== 'suspended'
    })
    if (hasRecord) count++
    else if (i > 0) break
  }
  return count
})

const suspendCount = computed(() => zhijiState.suspended.length)

const hasNewInsights = computed(() => true)
const newInsightsCount = computed(() => Math.min(completedDays.value, 5))

const hasPendingEchoes = computed(() => completedDays.value >= 2)
const pendingEchoes = computed(() => Math.min(Math.floor(completedDays.value / 2), 3))

function statusLabel(status) {
  const map = { 'in-progress': '思考中', 'suspended': '已悬置', 'closed': '已闭合' }
  return map[status] || ''
}

function moodEmoji(mood) {
  const map = { 'very-happy': '☀️', 'happy': '⛅', 'neutral': '☁️', 'sad': '🌧️', 'very-sad': '⛈️' }
  return map[mood] || ''
}

function moodLabel(mood) {
  const map = { 'very-happy': '晴朗', 'happy': '多云', 'neutral': '阴天', 'sad': '下雨', 'very-sad': '暴雨' }
  return map[mood] || ''
}

function goDiaryEdit() { uni.navigateTo({ url: '/pages/zhiji/diary-edit' }) }
function goThinkingChain() { uni.navigateTo({ url: '/pages/zhiji/thinking-chain' }) }
function goSuspendList() { uni.navigateTo({ url: '/pages/zhiji/suspend-list' }) }
function goRecordDetail(id) { uni.navigateTo({ url: '/pages/zhiji/record-detail?id=' + id }) }
function goInsights() { uni.navigateTo({ url: '/pages/zhiji/insights' }) }
function goEchoes() { uni.navigateTo({ url: '/pages/zhiji/echoes' }) }

function onTabChange(tab) {
  switchTab(tab)
  const routes = { zhiji: '/pages/zhiji/index', xinbao: '/pages/xinbao/index', xinwang: '/pages/xinwang/index', zhiguang: '/pages/zhiguang/index', mine: '/pages/mine/index' }
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
.header-icon { font-size: 40rpx; color: $color-primary; }
.header-title { font-family: $font-headline; font-size: $fs-headline-md; font-weight: 600; color: $color-primary; }

.header-badge {
  padding: 8rpx 24rpx;
  border-radius: $radius-full;
  background-color: rgba($color-primary-container, 0.3);
}

.badge-text { font-size: $fs-label-sm; color: $color-on-primary-container; }

.scroll-area {
  height: 100vh;
  padding-bottom: 180rpx;
  box-sizing: border-box;
}

.content-wrapper {
  padding: 0 $sp-page-margin;
}

.growth-card {
  padding: 40rpx;
  margin-bottom: $sp-module-gap;
  border-radius: $radius-lg;
  background: linear-gradient(135deg, rgba($color-primary-container, 0.2) 0%, transparent 100%);
  display: flex;
  align-items: center;
  gap: 32rpx;
  position: relative;
  overflow: hidden;
}

.growth-icon-wrap { position: relative; }
.growth-emoji { font-size: 64rpx; position: relative; z-index: 1; }
.growth-glow {
  position: absolute; inset: -20rpx;
  background-color: rgba($color-primary-container, 0.3);
  border-radius: $radius-full;
  filter: blur(20rpx);
}

.growth-content { flex: 1; }
.growth-title { display: block; font-size: $fs-headline-sm; font-weight: 600; color: $color-primary; margin-bottom: 16rpx; }

.growth-progress { display: flex; align-items: center; gap: 20rpx; margin-bottom: 8rpx; }
.progress-bar { flex: 1; height: 12rpx; border-radius: $radius-full; background-color: rgba($color-primary, 0.1); overflow: hidden; }
.progress-fill { height: 100%; border-radius: $radius-full; background-color: $color-primary-container; transition: width 0.8s ease-out; }
.progress-text { font-size: $fs-label-sm; color: rgba($color-on-surface-variant, 0.6); }
.growth-streak { display: block; font-size: $fs-label-md; color: $color-secondary; font-weight: 500; }

.actions-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: $sp-inline-gap;
  margin-bottom: $sp-module-gap;
}

.action-card {
  position: relative;
  padding: 40rpx 24rpx;
  border-radius: $radius-lg;
  background-color: $color-surface-container-lowest;
  box-shadow: $shadow-healing;
  overflow: hidden;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  &:active { transform: scale(0.96); box-shadow: 0 4rpx 20rpx rgba(61, 103, 81, 0.1); }
}

.action-card-wide { grid-column: span 2; display: flex; align-items: center; gap: 24rpx; }
.action-bg { position: absolute; top: -40rpx; right: -40rpx; width: 120rpx; height: 120rpx; border-radius: $radius-full; opacity: 0.15; }
.action-bg-primary { background-color: $color-primary-container; }
.action-bg-secondary { background-color: $color-secondary-container; }
.action-bg-tertiary { background-color: $color-tertiary-container; }

.action-icon { display: block; font-size: 48rpx; margin-bottom: 16rpx; }
.action-label { display: block; font-size: $fs-headline-sm; font-weight: 600; color: $color-on-surface; margin-bottom: 8rpx; }
.action-hint { display: block; font-size: $fs-label-sm; color: rgba($color-on-surface-variant, 0.6); }

.action-info { flex: 1; }
.action-info .action-label { margin-bottom: 4rpx; }
.action-badge {
  width: 48rpx; height: 48rpx;
  border-radius: $radius-full;
  background-color: $color-primary;
  color: $color-on-primary;
  font-size: $fs-label-sm;
  font-weight: 600;
  display: flex; align-items: center; justify-content: center;
}

.section { margin-bottom: $sp-module-gap; }

.feature-card {
  padding: 32rpx;
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  transition: transform 0.2s ease;
  &:active { transform: scale(0.98); }
}

.echo-card { background-color: rgba($color-tertiary-container, 0.2); }

.feature-header { display: flex; align-items: center; gap: 16rpx; }
.feature-icon { font-size: 36rpx; }
.feature-title { font-size: $fs-headline-sm; font-weight: 600; color: $color-on-surface; }
.feature-dot { width: 12rpx; height: 12rpx; border-radius: $radius-full; background-color: #f9a825; }
.feature-badge {
  padding: 4rpx 16rpx;
  border-radius: $radius-full;
  background-color: $color-tertiary;
  color: $color-on-tertiary;
  font-size: $fs-label-sm;
  font-weight: 600;
}

.feature-preview { font-size: $fs-body-md; color: rgba($color-on-surface-variant, 0.8); line-height: 1.6; }

.date-header { display: flex; align-items: center; margin-bottom: 32rpx; gap: 16rpx; }
.date-dot { width: 16rpx; height: 16rpx; border-radius: $radius-full; }
.dot-today { background-color: $color-primary-container; }
.dot-past { background-color: $color-secondary-fixed; }
.date-label { font-size: $fs-headline-sm; font-weight: 600; color: $color-on-surface-variant; }

.feed-list { display: flex; flex-direction: column; gap: $sp-stack-gap; }

.record-card {
  padding: 40rpx;
  position: relative;
  overflow: hidden;
  animation: card-fade-in 0.4s ease-out backwards;
  &:active { transform: scale(0.99); }
}

.record-corner {
  position: absolute; top: 0; right: 0;
  width: 0; height: 0;
  border-style: solid;
  border-width: 60rpx 60rpx 0 0;
}

.record-corner.diary { border-color: rgba($color-primary-container, 0.3) transparent transparent transparent; }
.record-corner.thinking-chain { border-color: rgba($color-secondary-container, 0.3) transparent transparent transparent; }

.record-header { display: flex; align-items: center; gap: 16rpx; margin-bottom: 16rpx; }
.record-keyword { font-size: $fs-headline-sm; font-weight: 700; color: $color-primary; }
.record-delta { font-size: $fs-label-sm; color: rgba($color-primary, 0.5); font-weight: 500; }
.record-mood-top { margin-bottom: 8rpx; }
.mood-emoji { font-size: 40rpx; }

.record-tags { display: flex; flex-wrap: wrap; gap: 16rpx; margin-bottom: 16rpx; }
.tag-chip { font-size: $fs-label-sm; padding: 4rpx 16rpx; border-radius: 8rpx; background-color: rgba($color-tertiary-fixed, 0.3); color: $color-on-tertiary-fixed-variant; }

.record-content {
  font-size: $fs-body-md; line-height: $lh-body-md; color: $color-on-surface;
  @include text-truncate(3);
  padding-right: 96rpx;
}

.record-content-italic { font-style: italic; opacity: 0.8; }

.record-footer { display: flex; align-items: center; justify-content: space-between; margin-top: 24rpx; }
.record-time { display: flex; align-items: center; gap: 8rpx; }
.time-icon { font-size: 28rpx; color: rgba($color-on-surface-variant, 0.5); }
.time-text { font-size: $fs-label-md; color: rgba($color-on-surface-variant, 0.5); }
.mood-tag { font-size: $fs-label-sm; padding: 4rpx 16rpx; border-radius: $radius-full; background-color: rgba($color-primary-fixed, 0.2); color: $color-primary; }

.bottom-spacer { height: 120rpx; }

.decor-top {
  position: absolute; top: 0; right: 0;
  width: 256rpx; height: 256rpx;
  opacity: 0.1; background-color: $color-primary-container;
  border-radius: $radius-full; filter: blur(40rpx);
  z-index: 0; pointer-events: none;
}

.decor-plant {
  position: absolute; top: 80rpx; left: -40rpx;
  width: 192rpx; height: 192rpx;
  opacity: 0.08; background-color: $color-secondary-container;
  border-radius: $radius-full; filter: blur(30rpx);
  z-index: 0; pointer-events: none;
  transform: rotate(12deg);
  animation: float-decor 4s ease-in-out infinite;
}

@keyframes card-fade-in { 0% { opacity: 0; transform: translateY(20rpx); } 100% { opacity: 1; transform: translateY(0); } }
@keyframes float-decor { 0%, 100% { transform: rotate(12deg) translateY(0); } 50% { transform: rotate(12deg) translateY(-16rpx); } }
</style>