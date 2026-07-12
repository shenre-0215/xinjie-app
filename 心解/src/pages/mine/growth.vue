<template>
  <view class="page-container">
    <!-- #ifdef H5 -->
    <view class="h5-safe-top" />
    <!-- #endif -->

    <view class="header">
      <view class="back-btn pressable" @click="goBack">
        <text class="back-icon">‹</text>
      </view>
      <text class="header-title">成长档案</text>
      <view style="width:80rpx" />
    </view>

    <!-- Welcome -->
    <view class="welcome-row">
      <view class="welcome-text">
        <text class="welcome-title">成长档案</text>
        <text class="welcome-sub">每一条记录都是你往前走的证据</text>
      </view>
      <text class="mascot-emoji">🌿</text>
    </view>

    <!-- Milestones -->
    <view class="section">
      <view class="section-header">
        <text class="section-icon">★</text>
        <text class="section-title">成长里程碑</text>
      </view>
      <scroll-view class="milestone-scroll" scroll-x :show-scrollbar="false">
        <view
          v-for="ms in milestones"
          :key="ms.title"
          class="milestone-card"
        >
          <view class="ms-circle" :class="'ms-' + ms.type">
            <text class="ms-emoji">{{ ms.icon }}</text>
          </view>
          <text class="ms-title" :class="{ 'ms-dim': ms.type === 'locked' }">{{ ms.title }}</text>
          <text class="ms-date" :class="{ 'ms-dim': ms.type === 'locked' }">{{ ms.date }}</text>
        </view>
      </scroll-view>
    </view>

    <!-- Insights -->
    <view class="section">
      <view class="section-header">
        <text class="section-icon">📊</text>
        <text class="section-title">成长洞察</text>
      </view>
      <view class="insights-grid">
        <view class="insight-card card">
          <text class="insight-icon">🧠</text>
          <text class="insight-label-sm">洞察值</text>
          <text class="insight-number">{{ insightScore }}</text>
          <view class="insight-bar">
            <view class="insight-fill" :style="{ width: insightScore + '%' }" />
          </view>
        </view>
        <view class="insight-card card">
          <text class="insight-icon">🛡</text>
          <text class="insight-label-sm">韧性值</text>
          <text class="insight-number">{{ resilienceScore }}</text>
          <view class="insight-bar">
            <view class="insight-fill-secondary" :style="{ width: resilienceScore + '%' }" />
          </view>
        </view>
        <view class="insight-card insight-card-wide card">
          <view class="insight-wide-text">
            <text class="insight-label-sm">确信值趋势</text>
            <text class="insight-number-small">{{ certTrend }}</text>
            <text class="insight-desc">心网节点较上周{{ certChange }}</text>
          </view>
          <view class="mini-chart">
            <view class="chart-bar" style="height:40%" />
            <view class="chart-bar" style="height:50%" />
            <view class="chart-bar" style="height:65%" />
            <view class="chart-bar" style="height:85%" />
            <view class="chart-bar" style="height:100%" />
          </view>
        </view>
      </view>
    </view>

    <!-- Timeline -->
    <view class="section">
      <view class="section-header">
        <text class="section-icon">◎</text>
        <text class="section-title">织网足迹</text>
      </view>
      <view v-if="recentRecords.length" class="timeline-list">
        <view class="tl-vertical-line" />
        <view
          v-for="record in recentRecords"
          :key="record.id"
          class="tl-item"
        >
          <view class="tl-node">
            <text class="tl-node-icon">{{ record.type === 'thinking-chain' ? '◎' : record.type === 'diary' ? '✎' : '◇' }}</text>
          </view>
          <view class="tl-card card">
            <view class="tl-card-top">
              <text class="tl-card-title">{{ record.type === 'thinking-chain' ? '思考链' : '日记' }}</text>
              <text class="tl-card-time">{{ record.date }} {{ record.time }}</text>
            </view>
            <text class="tl-card-desc">{{ truncate(record.content) }}</text>
          </view>
        </view>
      </view>
      <EmptyState
        v-else
        emoji="◎"
        text="还没有足迹"
        hint="开始写日记或完成思考链，每一步都会留下印记"
      />
    </view>
  </view>
</template>

<script setup>
import { computed } from 'vue'
import { zhijiState } from '../../store/useZhijiStore.js'
import { xinwangState } from '../../store/useXinwangStore.js'
import EmptyState from '../../components/EmptyState.vue'

const closedCount = computed(() => zhijiState.records.filter(r => r.status === 'closed').length)

const milestones = computed(() => [
  { title: '开启旅程', date: '从这里开始', type: 'completed', icon: '🌱' },
  { title: '初次闭合', date: closedCount.value >= 1 ? '已完成' : '未解锁', type: closedCount.value >= 1 ? 'completed' : 'locked', icon: closedCount.value >= 1 ? '✨' : '🔒' },
  { title: '织网生长', date: closedCount.value >= 3 ? '已完成' : '未解锁', type: closedCount.value >= 3 ? 'completed' : 'locked', icon: closedCount.value >= 3 ? '🌿' : '🔒' },
  { title: '向内扎根', date: closedCount.value >= 8 ? '已完成' : '未解锁', type: closedCount.value >= 8 ? 'active' : 'locked', icon: closedCount.value >= 8 ? '❤️' : '🔒' }
])

const insightScore = computed(() => {
  const e = xinwangState.worldview
  return Math.min(100, (e.shixiang.length + e.woxing.length + e.xincheng.length) * 10)
})

const resilienceScore = computed(() => Math.min(100, Math.max(0, (zhijiState.records.length - 3) * 10)))

const certTrend = computed(() => {
  const n = xinwangState.nodes.length
  if (n <= 5) return '初始积累'
  if (n <= 10) return '稳步上升'
  return '持续生长'
})

const certChange = computed(() => {
  const n = xinwangState.nodes.length
  if (n <= 5) return '开始萌芽'
  return `新增 ${n} 个节点`
})

const recentRecords = computed(() =>
  [...zhijiState.records]
    .sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time))
    .slice(0, 10)
)

function truncate(text) {
  const t = (text || '').substring(0, 80)
  return t.length >= 80 ? t + '...' : t
}

function goBack() {
  uni.navigateBack({ delta: 1 })
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';
@import '@/styles/mixins.scss';

.page-container {
  min-height: 100vh;
  background-color: $color-background;
  padding-bottom: 160rpx;
  padding-top: calc(env(safe-area-inset-top) + 88rpx);
}

.header {
  position: fixed; top: 0; left: 0; right: 0; z-index: 100;
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 32rpx;
  padding-top: constant(safe-area-inset-top);
  padding-top: env(safe-area-inset-top);
  padding-bottom: 16rpx;
  background-color: $color-background;
}

.back-btn { width: 80rpx; height: 80rpx; display: flex; align-items: center; justify-content: center; }
.back-icon { font-size: 48rpx; color: $color-primary; font-weight: 300; }
.header-title { font-size: $fs-headline-md; font-weight: 600; color: $color-primary; }

// ── welcome ──
.welcome-row { display: flex; align-items: center; gap: 24rpx; padding: 0 $sp-page-margin; margin-bottom: 56rpx; }
.welcome-text { flex: 1; }
.welcome-title { display: block; font-size: 44rpx; font-weight: 600; color: $color-on-surface; margin-bottom: 12rpx; }
.welcome-sub { font-size: $fs-body-md; color: rgba($color-on-surface-variant, 0.6); }
.mascot-emoji { font-size: 128rpx; }

// ── section ──
.section { margin-bottom: 56rpx; }
.section-header { display: flex; align-items: center; gap: 16rpx; padding: 0 $sp-page-margin; margin-bottom: 32rpx; }
.section-icon { font-size: 40rpx; }
.section-title { font-size: $fs-headline-sm; font-weight: 600; color: $color-primary; }

// ── milestones ──
.milestone-scroll { padding-left: $sp-page-margin; white-space: nowrap; }
.milestone-card {
  display: inline-flex; flex-direction: column; align-items: center;
  width: 160rpx; margin-right: 48rpx; white-space: normal;
}

.ms-circle {
  width: 128rpx; height: 128rpx; border-radius: $radius-full;
  display: flex; align-items: center; justify-content: center;
  margin-bottom: 24rpx; box-shadow: $shadow-healing;
}
.ms-completed { background-color: $color-primary-container; }
.ms-active {
  width: 160rpx; height: 160rpx;
  border: 8rpx solid rgba($color-primary-container, 0.5);
  background-color: $color-primary;
}
.ms-locked { background-color: rgba($color-on-surface, 0.08); }
.ms-emoji { font-size: 56rpx; }
.ms-title { font-size: $fs-body-sm; color: $color-on-surface; font-weight: 600; }
.ms-date { font-size: $fs-label-sm; color: rgba($color-on-surface-variant, 0.6); }
.ms-dim { opacity: 0.4; }

// ── insights grid ──
.insights-grid { padding: 0 $sp-page-margin; display: grid; grid-template-columns: 1fr 1fr; gap: $sp-stack-gap; }
.insight-card {
  padding: 40rpx; display: flex; flex-direction: column; align-items: center;
}
.insight-card-wide { grid-column: span 2; flex-direction: row; justify-content: space-between; align-items: center; }
.insight-icon { font-size: 48rpx; margin-bottom: 16rpx; }
.insight-label-sm { font-size: $fs-label-sm; color: rgba($color-on-surface-variant, 0.7); text-transform: uppercase; }
.insight-number { font-size: 56rpx; font-weight: 700; color: $color-on-surface; margin: 16rpx 0; }
.insight-number-small { display: block; font-size: 44rpx; font-weight: 600; color: $color-on-surface; margin: 8rpx 0; }
.insight-desc { font-size: $fs-body-sm; color: rgba($color-on-surface-variant, 0.7); }

.insight-bar { width: 100%; height: 8rpx; background-color: rgba($color-on-surface, 0.06); border-radius: 4rpx; overflow: hidden; margin-top: 24rpx; }
.insight-fill { height: 100%; border-radius: 4rpx; background-color: $color-primary; }
.insight-fill-secondary { height: 100%; border-radius: 4rpx; background-color: $color-secondary; }

.mini-chart { display: flex; align-items: flex-end; gap: 6rpx; height: 120rpx; }
.chart-bar { width: 20rpx; border-radius: 4rpx 4rpx 0 0; background-color: $color-tertiary; }
.chart-bar:nth-child(1) { opacity: 0.4; }
.chart-bar:nth-child(2) { opacity: 0.55; }
.chart-bar:nth-child(3) { opacity: 0.7; }
.chart-bar:nth-child(4) { opacity: 0.85; }

// ── timeline ──
.timeline-list { padding: 0 $sp-page-margin; position: relative; }
.tl-vertical-line {
  position: absolute; left: 22rpx; top: 16rpx; bottom: 32rpx; width: 4rpx;
  background: linear-gradient(to bottom, rgba($color-primary, 0.3), rgba($color-primary, 0.1), transparent);
  border-radius: 2rpx;
}
.tl-item { position: relative; padding-left: 60rpx; margin-bottom: 48rpx; }
.tl-node {
  position: absolute; left: 0; top: 8rpx;
  width: 48rpx; height: 48rpx; border-radius: $radius-full;
  display: flex; align-items: center; justify-content: center;
  background-color: $color-primary-container; z-index: 1;
}
.tl-node-icon { font-size: 28rpx; }

.tl-card { padding: 32rpx; }
.tl-card-top { display: flex; justify-content: space-between; margin-bottom: 8rpx; }
.tl-card-title { font-size: $fs-body-md; font-weight: 600; color: $color-on-surface; }
.tl-card-time { font-size: $fs-label-sm; color: rgba($color-on-surface-variant, 0.5); }
.tl-card-desc { font-size: $fs-body-sm; color: rgba($color-on-surface-variant, 0.8); }

.card {
  background-color: $color-surface-container-lowest;
  border-radius: $radius-md;
}

.pressable:active { opacity: 0.7; }
</style>
