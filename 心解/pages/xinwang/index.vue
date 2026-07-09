<template>
  <view class="page-container">
    <!-- #ifdef H5 -->
    <view class="h5-safe-top" />
    <!-- #endif -->
    <!-- Header -->
    <view class="header">
      <view class="header-left">
        <text class="header-icon">⊛</text>
        <text class="header-title">心网</text>
      </view>
      <view class="header-right">
        <view class="refresh-btn pressable" @click="refreshNetwork">
          <text class="refresh-icon">↻</text>
        </view>
      </view>
    </view>

    <scroll-view scroll-y class="scroll-area">
      <!-- Network canvas -->
      <view class="canvas-section">
      <!-- Decorative blur -->
      <view class="canvas-bg-decor" />

      <!-- SVG-like node network using positioned views -->
      <view
        class="canvas-area"
        :style="canvasTransform"
        @touchstart="onTouchStart"
        @touchmove="onTouchMove"
        @touchend="onTouchEnd"
      >
        <!-- Connection lines (simplified as positioned elements) -->
        <view class="connections-layer">
          <view
            v-for="edge in xinwangState.edges"
            :key="edge.from + '-' + edge.to"
            class="connection-line"
            :style="getLineStyle(edge)"
          />
        </view>

        <!-- Nodes -->
        <view
          v-for="node in xinwangState.nodes"
          :key="node.id"
          class="network-node"
          :class="['node-' + node.status, 'node-' + node.type]"
          :style="getNodeStyle(node)"
          @touchstart.stop="onNodeTouchStart($event, node)"
          @touchmove.stop="onNodeTouchMove($event, node)"
          @touchend.stop="onNodeTouchEnd($event, node)"
        >
          <text class="node-label-text">{{ node.label }}</text>
          <text v-if="node.delta !== undefined" class="node-delta-text">δ {{ node.delta }}</text>
        </view>
      </view>

      <!-- Floating stat label -->
      <view class="float-label">
        <text class="float-text">已建立 {{ xinwangState.nodes.length }} 个节点</text>
      </view>

      <!-- Zoom controls -->
      <view class="zoom-controls">
        <view class="zoom-btn pressable" @click="zoomIn">
          <text class="zoom-icon">＋</text>
        </view>
        <view class="zoom-btn pressable" @click="zoomOut">
          <text class="zoom-icon">−</text>
        </view>
        <view class="zoom-btn pressable" @click="zoomReset" :class="{ 'zoom-dim': scale === 1 }">
          <text class="zoom-icon zoom-reset-icon">◎</text>
        </view>
      </view>
    </view>

    <!-- Stats section -->
    <view class="stats-section">
      <view class="stats-header">
        <text class="stats-title">内在生长状态</text>
        <text class="stats-subtitle">更新于 {{ nowLabel }}</text>
      </view>

      <view class="stats-grid">
        <view class="stat-card card">
          <text class="stat-label-sm">心网密度</text>
          <text class="stat-value text-primary">{{ densityLabel }}</text>
          <view class="stat-bar">
            <view class="stat-bar-fill" :style="{ width: densityPercent + '%' }" />
          </view>
        </view>
        <view class="stat-card card">
          <text class="stat-label-sm">连接强度</text>
          <text class="stat-value text-tertiary">{{ connectionLabel }}</text>
          <view class="dot-indicators">
            <view class="dot" :class="dotClass(0)" />
            <view class="dot" :class="dotClass(1)" />
            <view class="dot" :class="dotClass(2)" />
          </view>
        </view>
      </view>

      <!-- 内心世界入口 -->
      <view class="worldview-card pressable-subtle" @click="goWorldview">
        <view class="wv-left">
          <text class="wv-icon">◎</text>
          <view class="wv-body">
            <text class="wv-title">我 · 内心世界</text>
            <text class="wv-desc">世相 · 我行 · 心秤 — 你精神世界的根基</text>
          </view>
        </view>
        <text class="wv-arrow">›</text>
      </view>

      <!-- Inspirational card -->
      <view class="inspire-card">
        <view class="inspire-body">
          <text class="inspire-title">{{ xinwangState.nodes.length ? '新的枝桠正在伸展' : '你的心网还是一片土壤' }}</text>
          <text class="inspire-text">{{ xinwangState.nodes.length ? latestInsight : '打开心宝聊一聊，或完成一条思考链，这里会开始生长。' }}</text>
        </view>
        <view class="inspire-decor">
          <text class="inspire-mascot">🌿</text>
        </view>
      </view>
    </view>

    <!-- Empty state for no nodes -->
      <EmptyState
        v-if="!xinwangState.nodes.length"
        emoji="◎"
        text="还没有心网节点"
        hint="完成思考链后会生成节点，连接你的内心世界"
      />
    </scroll-view>

    <TabBar current="xinwang" @change="onTabChange" />
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { xinwangState, updateNode, syncFromCloud } from '../../store/useXinwangStore.js'
import { authState } from '../../store/useAuthStore.js'
import { switchTab } from '../../store/useAppStore.js'
import TabBar from '../../components/TabBar.vue'
import EmptyState from '../../components/EmptyState.vue'

// Dynamic stats
const densityPercent = computed(() => Math.min(100, xinwangState.nodes.length * 5))
const densityLabel = computed(() => {
  const p = densityPercent.value
  return p <= 25 ? '萌芽' : p <= 50 ? '生长' : p <= 75 ? '繁茂' : '成林'
})
const connectionLabel = computed(() => xinwangState.edges.length <= 3 ? '初始' : xinwangState.edges.length <= 8 ? '扩展' : '交织')
function dotClass(i) {
  const e = xinwangState.edges.length
  return e > i * 4 ? 'active' : e > i * 4 - 2 ? 'half' : 'dim'
}

const nowLabel = computed(() => {
  const d = new Date()
  const h = d.getHours()
  const hh = String(h).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  const period = h < 6 ? '凌晨' : h < 9 ? '清晨' : h < 12 ? '上午' : h < 14 ? '午后' : h < 18 ? '下午' : h < 21 ? '傍晚' : '夜晚'
  return `${d.getMonth() + 1}月${d.getDate()}日 ${period} ${hh}:${mm}`
})

const latestInsight = computed(() => {
  const recent = [...xinwangState.nodes].sort((a, b) => b.id.localeCompare(a.id)).slice(0, 3)
  if (!recent.length) return null
  const labels = recent.map(n => `"${n.label}"`).join('、')
  return `最近的思考围绕 ${labels} 展开。你的心网正在自然生长。`
})

// Pan/zoom state
const panX = ref(0)
const panY = ref(0)
const scale = ref(1)

const canvasTransform = computed(() => ({
  transform: `translate(${panX.value}px, ${panY.value}px) scale(${scale.value})`,
  transformOrigin: 'center center',
  transition: 'transform 0.1s ease-out'
}))

function zoomIn() {
  scale.value = Math.min(2.5, scale.value + 0.25)
}
function zoomOut() {
  scale.value = Math.max(0.5, scale.value - 0.25)
}
function zoomReset() {
  panX.value = 0
  panY.value = 0
  scale.value = 1
}

// Touch handlers for pan + pinch zoom
let sX = 0, sY = 0, sD = 0, spX = 0, spY = 0, sS = 1
function onTouchStart(e) {
  if (e.touches.length === 1) {
    sX = e.touches[0].clientX; sY = e.touches[0].clientY
    spX = panX.value; spY = panY.value
  } else if (e.touches.length === 2) {
    sD = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY)
    sS = scale.value
  }
}
function onTouchMove(e) {
  if (e.touches.length === 1) {
    panX.value = spX + e.touches[0].clientX - sX
    panY.value = spY + e.touches[0].clientY - sY
  } else if (e.touches.length === 2) {
    const d = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY)
    scale.value = Math.min(2.5, Math.max(0.5, sS * (d / sD)))
  }
}
function onTouchEnd() {}

function getNodeStyle(node) {
  const isHub = node.type === 'hub'
  const size = isHub ? 72 : 48
  return {
    left: (node.x * 0.7 + 40) + 'rpx',
    top: (node.y * 0.7 + 20) + 'rpx',
    width: size + 'rpx',
    height: size + 'rpx'
  }
}

function getNodeCenter(node) {
  const isHub = node.type === 'hub'
  const size = isHub ? 72 : 48
  return {
    x: node.x * 0.7 + 40 + size / 2,
    y: node.y * 0.7 + 20 + size / 2
  }
}

function getLineStyle(edge) {
  const fromNode = xinwangState.nodes.find(n => n.id === edge.from)
  const toNode = xinwangState.nodes.find(n => n.id === edge.to)
  if (!fromNode || !toNode) return { display: 'none' }

  const from = getNodeCenter(fromNode)
  const to = getNodeCenter(toNode)
  const dx = to.x - from.x
  const dy = to.y - from.y
  const length = Math.sqrt(dx * dx + dy * dy)
  const angle = Math.atan2(dy, dx) * 180 / Math.PI

  return {
    left: from.x + 'rpx',
    top: from.y + 'rpx',
    width: length + 'rpx',
    transform: `rotate(${angle}deg)`,
    transformOrigin: '0 50%'
  }
}

// Per-node drag: short tap = detail, drag = reposition
let dragNode = null, ndSX = 0, ndSY = 0, dragged = false
function onNodeTouchStart(e, node) { dragNode = node; dragged = false; ndSX = e.touches[0].clientX; ndSY = e.touches[0].clientY }
function onNodeTouchMove(e, node) {
  if (!dragNode) return
  const dx = (e.touches[0].clientX - ndSX) / scale.value, dy = (e.touches[0].clientY - ndSY) / scale.value
  if (Math.abs(dx) > 3 || Math.abs(dy) > 3) dragged = true
  if (dragged) {
    const newX = node.x + dx * 0.5, newY = node.y + dy * 0.5
    // [🔥] Clamp within canvas bounds (600rpx × 600rpx, minus node size)
    const size = node.type === 'hub' ? 72 : 48
    const clampedX = Math.max(0, Math.min(600 - size, newX))
    const clampedY = Math.max(0, Math.min(600 - size, newY))
    updateNode(node.id, { x: clampedX, y: clampedY })
    ndSX = e.touches[0].clientX; ndSY = e.touches[0].clientY
  }
}
function onNodeTouchEnd(e, node) { if (!dragged) showNodePreview(node); dragNode = null; dragged = false }

function showNodePreview(node) {
  uni.navigateTo({ url: '/pages/xinwang/node-detail?id=' + node.id })
}

async function refreshNetwork() {
  if (!authState.uid) {
    uni.showToast({ title: '请先登录', icon: 'none' })
    return
  }
  uni.showLoading({ title: '同步中...' })
  await syncFromCloud(authState.uid)
  uni.hideLoading()
  uni.showToast({ title: '已刷新', icon: 'success' })
}


function goWorldview() {
  uni.navigateTo({ url: '/pages/xinwang/worldview' })
}

function onTabChange(tab) {
  switchTab(tab)
  const routes = {
    zhiji: '/pages/zhiji/index',
    xinbao: '/pages/xinbao/index',
    xinwang: '/pages/xinwang/index',
    zhiguang: '/pages/zhiguang/index',
    mine: '/pages/mine/index'
  }
  uni.switchTab({ url: routes[tab] })
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';
@import '@/styles/mixins.scss';

.page-container { @include page-container; padding-top: calc(env(safe-area-inset-top) + 88rpx); @include fade-in; }

.header {
  position: fixed; top: 0; left: 0; right: 0; z-index: 100;
  padding: 0 32rpx;
  padding-top: constant(safe-area-inset-top);
  padding-top: env(safe-area-inset-top);
  padding-bottom: 16rpx;
  display: flex; align-items: center;
  background-color: $color-background;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.header-icon {
  font-size: 40rpx;
  color: $color-primary;
}

.header-title {
  font-family: $font-headline;
  font-size: $fs-headline-md;
  font-weight: 600;
  color: $color-primary;
}

.header-right { display: flex; align-items: center; }
.refresh-btn { width: 64rpx; height: 64rpx; display: flex; align-items: center; justify-content: center; border-radius: $radius-full; background-color: $color-surface-container-low; }
.refresh-icon { font-size: 40rpx; color: $color-primary; font-weight: 700; }

.canvas-section {
  position: relative; width: 100%; height: 640rpx;
  display: flex; align-items: center; justify-content: center;
  overflow: hidden !important;
}
.canvas-bg-decor {
  position: absolute; width: 512rpx; height: 512rpx; border-radius: $radius-full;
  background-color: rgba($color-primary-container, 0.4); filter: blur(80rpx); opacity: 0.3;
}
.canvas-area { position: relative; width: 600rpx; height: 600rpx; overflow: hidden; }
.connections-layer { position: absolute; inset: 0; }
.connection-line {
  position: absolute; height: 4rpx;
  background-color: rgba($color-primary, 0.15); transform-origin: left center;
}

.network-node {
  position: absolute;
  border-radius: $radius-full;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform $transition-press;
  animation: nodeIn 0.4s ease-out both;

  &:active {
    transform: scale(1.15);
  }
}

@keyframes nodeIn {
  from { transform: scale(0); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

.node-completed { background-color: $color-primary-container; }
.node-in-progress { border: 3rpx dashed $color-primary; background-color: transparent; }
.node-suspended { background-color: $color-tertiary-fixed-dim; opacity: 0.4; }
.node-hub {
  width: 88rpx !important; height: 88rpx !important;
  background-color: $color-primary !important;
  box-shadow: 0 0 0 16rpx rgba($color-primary-container, 0.2);
}
.node-label-text { font-size: 18rpx; color: $color-primary; font-weight: 600; }
.node-delta-text { font-size: 14rpx; color: rgba($color-primary, 0.55); font-weight: 500; margin-top: 4rpx; }
.node-hub .node-label-text { color: $color-on-primary; font-size: 22rpx; }
.node-suspended .node-label-text { color: $color-tertiary; }

.zoom-controls {
  position: absolute; bottom: 16rpx; right: 16rpx; z-index: 20;
  display: flex; flex-direction: column; gap: 12rpx;
}
.zoom-btn {
  width: 64rpx; height: 64rpx; border-radius: $radius-full;
  background-color: rgba($color-surface-container-lowest, 0.85);
  backdrop-filter: blur(10rpx); box-shadow: $shadow-healing;
  display: flex; align-items: center; justify-content: center;
}
.zoom-icon { font-size: 36rpx; color: $color-primary; font-weight: 600; }
.zoom-reset-icon { font-size: 28rpx; }
.zoom-dim { opacity: 0.35; }

.float-label {
  position: absolute;
  top: 16rpx; right: 16rpx; z-index: 15;
  background-color: rgba($color-surface-container-lowest, 0.85);
  padding: 12rpx 28rpx; border-radius: $radius-full;
  box-shadow: $shadow-healing;
  backdrop-filter: blur(10rpx);
}
.float-text { font-size: $fs-label-sm; color: $color-primary; font-weight: 600; }

.stats-section {
  padding: 0 $sp-page-margin;
}

.stats-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32rpx;
}

.stats-title {
  font-size: $fs-headline-sm;
  font-weight: 600;
  color: $color-on-surface;
}

.stats-subtitle {
  font-size: $fs-label-md;
  color: rgba($color-on-surface-variant, 0.6);
}

.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32rpx;
  margin-bottom: 32rpx;
}

.stat-card {
  padding: 40rpx;
}

.stat-label-sm {
  display: block;
  font-size: $fs-label-sm;
  color: rgba($color-on-surface-variant, 0.5);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-bottom: 8rpx;
}

.stat-value {
  display: block;
  font-size: $fs-headline-md;
  font-weight: 600;
  margin-bottom: 24rpx;
}

.text-primary { color: $color-primary; }
.text-tertiary { color: $color-tertiary; }

.stat-bar {
  width: 100%;
  height: 8rpx;
  background-color: $color-surface-container;
  border-radius: $radius-full;
  overflow: hidden;
}

.stat-bar-fill {
  height: 100%;
  background-color: $color-primary-container;
  border-radius: $radius-full;
}

.dot-indicators {
  display: flex;
  gap: 8rpx;
}

.dot {
  width: 16rpx;
  height: 16rpx;
  border-radius: $radius-full;
}

.dot.active { background-color: $color-tertiary; }
.dot.half { background-color: rgba($color-tertiary, 0.4); }
.dot.dim { background-color: rgba($color-tertiary, 0.2); }

.inspire-card {
  display: flex;
  padding: 48rpx;
  background-color: rgba($color-secondary-container, 0.3);
  border-radius: $radius-default;
  position: relative;
  overflow: hidden;
  margin-bottom: $sp-module-gap;
}

.inspire-body { flex: 1; z-index: 1; }

.inspire-title {
  display: block;
  font-size: $fs-headline-sm;
  font-weight: 600;
  color: $color-secondary;
  margin-bottom: 16rpx;
}

.inspire-text {
  font-size: $fs-body-md;
  color: rgba($color-on-secondary-container, 0.8);
  max-width: 480rpx;
}

.inspire-decor {
  position: absolute;
  bottom: -16rpx;
  right: -16rpx;
  opacity: 0.2;
}

.inspire-mascot { font-size: 256rpx; }

.worldview-card {
  display: flex; align-items: center; justify-content: space-between;
  margin: 0 $sp-page-margin 32rpx; padding: 36rpx 40rpx;
  background-color: $color-surface-container-lowest;
  border-radius: $radius-default; box-shadow: $shadow-healing;
}
.wv-left { display: flex; align-items: center; gap: 28rpx; }
.wv-icon { font-size: 48rpx; color: $color-primary; }
.wv-body { display: flex; flex-direction: column; gap: 8rpx; }
.wv-title { font-size: $fs-body-lg; font-weight: 600; color: $color-on-surface; }
.wv-desc { font-size: $fs-label-md; color: rgba($color-on-surface-variant, 0.6); }
.wv-arrow { font-size: 44rpx; color: rgba($color-on-surface-variant, 0.4); }

.scroll-area {
  height: 100vh;
  padding-bottom: 180rpx;
  box-sizing: border-box;
}

</style>
