<template>
  <view class="page-container">
    <view class="header">
      <view class="back-btn pressable" @click="goBack">
        <text class="back-icon">‹</text>
      </view>
      <text class="header-title">成长档案</text>
      <view style="width: 80rpx;" />
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
        <view v-for="ms in milestones" :key="ms.title" class="milestone-card">
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
          <text class="insight-number">{{ insightValue }}</text>
          <view class="insight-bar">
            <view class="insight-fill" :style="{ width: insightValue + '%' }" />
          </view>
        </view>
        <view class="insight-card card">
          <text class="insight-icon">🛡</text>
          <text class="insight-label-sm">韧性值</text>
          <text class="insight-number">{{ resilienceValue }}</text>
          <view class="insight-bar">
            <view class="insight-fill-secondary" :style="{ width: resilienceValue + '%' }" />
          </view>
        </view>
        <view class="insight-card insight-card-wide card">
          <view class="insight-wide-text">
            <text class="insight-label-sm">确信值趋势</text>
            <text class="insight-number-small">{{ confidenceTrend }}</text>
            <text class="insight-desc">心网节点较上周{{ confidenceChange }}</text>
          </view>
          <view class="mini-chart">
            <view class="chart-bar" style="height: 40%;" />
            <view class="chart-bar" style="height: 50%;" />
            <view class="chart-bar" style="height: 65%;" />
            <view class="chart-bar" style="height: 85%;" />
            <view class="chart-bar" style="height: 100%;" />
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
      <view v-if="timeline.length" class="timeline-list">
        <view class="tl-vertical-line" />
        <view v-for="item in timeline" :key="item.id" class="tl-item">
          <view class="tl-node">
            <text class="tl-node-icon">{{ item.type === 'thinking-chain' ? '◎' : item.type === 'diary' ? '✎' : '◇' }}</text>
          </view>
          <view class="tl-card card">
            <view class="tl-card-top">
              <text class="tl-card-title">{{ item.type === 'thinking-chain' ? '思考链' : '日记' }}</text>
              <text class="tl-card-time">{{ item.date }} {{ item.time }}</text>
            </view>
            <text class="tl-card-desc">{{ formatDesc(item) }}</text>
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

const closedChains = computed(() => zhijiState.records.filter(r => r.status === 'closed').length)

// Milestones — unlock based on closed chain count
const milestones = computed(() => [
  { title: '开启旅程', date: '从这里开始', type: 'completed', icon: '🌱' },
  { title: '初次闭合', date: closedChains.value >= 1 ? '已完成' : '未解锁', type: closedChains.value >= 1 ? 'completed' : 'locked', icon: closedChains.value >= 1 ? '✨' : '🔒' },
  { title: '织网生长', date: closedChains.value >= 3 ? '已完成' : '未解锁', type: closedChains.value >= 3 ? 'completed' : 'locked', icon: closedChains.value >= 3 ? '🌿' : '🔒' },
  { title: '向内扎根', date: closedChains.value >= 8 ? '已完成' : '未解锁', type: closedChains.value >= 8 ? 'active' : 'locked', icon: closedChains.value >= 8 ? '❤️' : '🔒' }
])

// 洞察值 — total worldview entries, max 100
const insightValue = computed(() => {
  const w = xinwangState.worldview
  const total = w.shixiang.length + w.woxing.length + w.xincheng.length
  return Math.min(100, total * 10)
})

// 韧性值 — based on total records beyond the first 3, max 100
const resilienceValue = computed(() => Math.min(100, Math.max(0, (zhijiState.records.length - 3) * 10)))

// 确信值趋势 — node count as proxy
const confidenceTrend = computed(() => {
  const n = xinwangState.nodes.length
  if (n <= 5) return '初始积累'
  if (n <= 10) return '稳步上升'
  return '持续生长'
})
const confidenceChange = computed(() => {
  const n = xinwangState.nodes.length
  if (n <= 5) return '开始萌芽'
  return `新增 ${n} 个节点`
})

// Timeline — latest 10 records from zhiji
const timeline = computed(() => {
  return [...zhijiState.records]
    .sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time))
    .slice(0, 10)
})

function formatDesc(item) {
  const preview = (item.content || '').substring(0, 80)
  return preview.length >= 80 ? preview + '...' : preview
}

function goBack() { uni.navigateBack({ delta: 1 }) }
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';
@import '@/styles/mixins.scss';

.page-container { @include page-container; padding-top: calc(env(safe-area-inset-top) + 88rpx); }

.header {
  position: fixed; top: 0; left: 0; right: 0; z-index: 100;
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 $sp-page-margin;
  padding-top: constant(safe-area-inset-top);
  padding-top: env(safe-area-inset-top); padding-bottom: 16rpx;
  background-color: $color-background;
}
.back-btn { width: 80rpx; height: 80rpx; display: flex; align-items: center; justify-content: center; }
.back-icon { font-size: 48rpx; color: $color-primary; font-weight: 300; }
.header-title { font-size: $fs-headline-sm; font-weight: 600; color: $color-primary; }

.welcome-row { display: flex; align-items: center; gap: 24rpx; padding: 0 $sp-page-margin; margin-bottom: $sp-module-gap; }
.welcome-text { flex: 1; }
.welcome-title { display: block; font-size: $fs-headline-md; font-weight: 600; color: $color-on-surface; margin-bottom: 12rpx; }
.welcome-sub { font-size: $fs-body-md; color: rgba($color-on-surface-variant, 0.6); }
.mascot-emoji { font-size: 128rpx; }

.section { margin-bottom: $sp-module-gap; }
.section-header { display: flex; align-items: center; gap: 16rpx; padding: 0 $sp-page-margin; margin-bottom: 32rpx; }
.section-icon { font-size: 40rpx; }
.section-title { font-size: $fs-headline-sm; font-weight: 600; color: $color-primary; }

.milestone-scroll { padding-left: $sp-page-margin; }
.milestone-card { display: inline-flex; flex-direction: column; align-items: center; width: 160rpx; margin-right: 48rpx; position: relative; }
.ms-circle { width: 128rpx; height: 128rpx; border-radius: $radius-full; display: flex; align-items: center; justify-content: center; margin-bottom: 24rpx; box-shadow: $shadow-healing; }
.ms-completed { background-color: $color-primary-container; }
.ms-active { width: 160rpx; height: 160rpx; border: 8rpx solid rgba($color-primary-container, 0.5); background-color: $color-primary; }
.ms-locked { background-color: $color-surface-container-highest; }
.ms-emoji { font-size: 56rpx; }
.ms-title { font-size: $fs-label-md; color: $color-on-surface; font-weight: 600; }
.ms-date { font-size: $fs-label-sm; color: rgba($color-on-surface-variant, 0.6); }
.ms-dim { opacity: 0.4; }

.insights-grid { padding: 0 $sp-page-margin; display: grid; grid-template-columns: 1fr 1fr; gap: 32rpx; }
.insight-card { padding: 40rpx; display: flex; flex-direction: column; align-items: center; }
.insight-card-wide { grid-column: span 2; flex-direction: row; justify-content: space-between; align-items: center; }
.insight-icon { font-size: 48rpx; margin-bottom: 16rpx; }
.insight-label-sm { font-size: $fs-label-sm; color: rgba($color-on-surface-variant, 0.7); text-transform: uppercase; }
.insight-number { font-size: $fs-display-lg; font-weight: 700; color: $color-on-surface; margin: 16rpx 0; }
.insight-number-small { display: block; font-size: $fs-headline-md; font-weight: 600; color: $color-on-surface; margin: 8rpx 0; }
.insight-desc { font-size: $fs-label-md; color: rgba($color-on-surface-variant, 0.7); }
.insight-bar { width: 100%; height: 8rpx; background-color: $color-surface-container; border-radius: 4rpx; overflow: hidden; margin-top: 24rpx; }
.insight-fill { height: 100%; border-radius: 4rpx; background-color: $color-primary; }
.insight-fill-secondary { height: 100%; border-radius: 4rpx; background-color: $color-secondary; }

.mini-chart { display: flex; align-items: flex-end; gap: 6rpx; height: 120rpx; }
.chart-bar { width: 20rpx; border-radius: 4rpx 4rpx 0 0; background-color: $color-tertiary; }
.chart-bar:nth-child(1) { opacity: 0.4; }
.chart-bar:nth-child(2) { opacity: 0.55; }
.chart-bar:nth-child(3) { opacity: 0.7; }
.chart-bar:nth-child(4) { opacity: 0.85; }

.timeline-list { padding: 0 $sp-page-margin; position: relative; }
.tl-vertical-line { position: absolute; left: 22rpx; top: 16rpx; bottom: 32rpx; width: 4rpx; background: linear-gradient(to bottom, rgba($color-primary, 0.3), rgba($color-primary, 0.1), transparent); border-radius: 2rpx; }
.tl-item { position: relative; padding-left: 60rpx; margin-bottom: 48rpx; }
.tl-node { position: absolute; left: 0; top: 8rpx; width: 48rpx; height: 48rpx; border-radius: $radius-full; display: flex; align-items: center; justify-content: center; background-color: $color-primary-container; z-index: 1; }
.tl-node-icon { font-size: 28rpx; }
.tl-card { padding: 32rpx; }
.tl-card-top { display: flex; justify-content: space-between; margin-bottom: 8rpx; }
.tl-card-title { font-size: 32rpx; font-weight: 600; color: $color-on-surface; }
.tl-card-time { font-size: $fs-label-sm; color: rgba($color-on-surface-variant, 0.5); }
.tl-card-desc { font-size: $fs-label-md; color: rgba($color-on-surface-variant, 0.8); }
</style>
