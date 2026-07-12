<template>
  <view class="page-container">
    <!-- #ifdef H5 -->
    <view class="h5-safe-top" />
    <!-- #endif -->

    <view class="header">
      <view class="header-left">
        <text class="header-icon">⊛</text>
        <text class="header-title">心网</text>
      </view>
      <view class="header-right pressable" @click="refreshNetwork">
        <text class="refresh-icon">↻</text>
      </view>
    </view>

    <scroll-view scroll-y class="scroll-area">
      <!-- Starfield canvas -->
      <view
        class="canvas-section"
        @touchstart="onTouchStart"
        @touchmove="onTouchMove"
        @touchend="onTouchEnd"
      >
        <view class="canvas-bg" />
        <view class="bg-stars" />

        <view class="canvas-area" :style="canvasTransform">
          <!-- Connection lines -->
          <view class="connections-layer">
            <view
              v-for="edge in xinwangState.edges"
              :key="edge.from + '-' + edge.to"
              class="connection-line"
              :style="getLineStyle(edge)"
            />
          </view>

          <!-- Star nodes -->
          <view
            v-for="node in xinwangState.nodes"
            :key="node.id"
            class="star-node"
            :class="[statusClass(node)]"
            :style="getNodeStyle(node)"
            @touchstart.stop="onNodeTouchStart($event, node)"
            @touchmove.stop.prevent="onNodeTouchMove($event, node)"
            @touchend.stop="onNodeTap($event, node)"
          >
            <view class="star-core" :style="getStarCoreStyle(node)" />
          </view>
        </view>

        <!-- Float label -->
        <view class="float-label">
          <text>已建立 {{ xinwangState.nodes.length }} 个节点</text>
        </view>

        <!-- Zoom controls -->
        <view class="zoom-ctrls">
          <view class="zoom-btn pressable" @click="zoomIn"><text>+</text></view>
          <view class="zoom-btn pressable" @click="zoomOut"><text>-</text></view>
          <view class="zoom-btn pressable" @click="zoomReset"><text>O</text></view>
        </view>

        <!-- Full-view entry -->
        <view class="fullview-btn pressable" @click="goFullView">
          <text class="fullview-text">全览</text>
        </view>
      </view>

      <!-- Stats -->
      <view class="stats-section">
        <view class="stats-header">
          <text class="stats-title">内在生长状态</text>
          <text class="stats-time">{{ nowLabel }}</text>
        </view>
        <view class="stats-grid">
          <view class="stat-card">
            <text class="stat-number">{{ densityPercent }}%</text>
            <text class="stat-label">心网密度 · {{ densityLabel }}</text>
            <view class="stat-bar"><view class="stat-fill" :style="{ width: densityPercent + '%' }" /></view>
          </view>
          <view class="stat-card">
            <text class="stat-number">{{ connectionLabel }}</text>
            <text class="stat-label">连接强度</text>
            <view class="stat-dots">
              <view v-for="i in 3" :key="i" class="stat-dot" :class="dotClass(i - 1)" />
            </view>
          </view>
        </view>
      </view>

      <!-- Worldview entry -->
      <view class="section">
        <view class="entry-card pressable-subtle" @click="goWorldview">
          <text class="entry-icon">◎</text>
          <view class="entry-info">
            <text class="entry-title">我 · 内心世界</text>
            <text class="entry-hint">三观体系 {{ worldviewCount }} 条目</text>
          </view>
          <text class="entry-arrow">›</text>
        </view>
      </view>

      <!-- Latest insight -->
      <view v-if="latestInsight" class="section">
        <view class="insight-card">
          <view class="insight-header">
            <text class="insight-emoji">🌿</text>
            <text class="insight-title">{{ xinwangState.nodes.length ? '今天在想什么' : '开始你的心网' }}</text>
          </view>
          <text class="insight-text">{{ latestInsight }}</text>
        </view>
      </view>

      <EmptyState
        v-if="!xinwangState.nodes.length"
        emoji="◎"
        text="还没有心网节点"
        hint="完成思考链后会生成节点，连接你的内心世界"
      />

      <view class="bottom-spacer" />
    </scroll-view>

    <TabBar current="xinwang" @change="onTabChange" />
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { xinwangState, updateNode, syncFromCloud } from '../../store/useXinwangStore.js'
import { switchTab } from '../../store/useAppStore.js'
import { getNodeGlowStyle, getEdgeGlowStyle, getNodeSize, getEmotionColorKey } from '../../utils/emotionColors.js'
import TabBar from '../../components/TabBar.vue'
import EmptyState from '../../components/EmptyState.vue'

// Stats
const densityPercent = computed(() => Math.min(100, xinwangState.nodes.length * 5))
const densityLabel = computed(() => {
  const p = densityPercent.value
  return p <= 25 ? '萌芽' : p <= 50 ? '生长' : p <= 75 ? '繁茂' : '成林'
})
const connectionLabel = computed(() =>
  xinwangState.edges.length <= 3 ? '初始' : xinwangState.edges.length <= 8 ? '扩展' : '交织'
)
function dotClass(i) {
  const e = xinwangState.edges.length
  return e > i * 4 ? 'active' : e > i * 4 - 2 ? 'half' : 'dim'
}

const worldviewCount = computed(() =>
  xinwangState.worldview.shixiang.length +
  xinwangState.worldview.woxing.length +
  xinwangState.worldview.xincheng.length
)

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

// Pan / zoom
const panX = ref(0)
const panY = ref(0)
const scaleVal = ref(1)
const canvasTransform = computed(() => ({
  transform: `translate(${panX.value}px, ${panY.value}px) scale(${scaleVal.value})`,
  transformOrigin: 'center center',
  transition: 'transform 0.15s ease-out'
}))

function zoomIn() { scaleVal.value = Math.min(2.5, scaleVal.value + 0.2) }
function zoomOut() { scaleVal.value = Math.max(0.5, scaleVal.value - 0.2) }
function zoomReset() { scaleVal.value = 1; panX.value = 0; panY.value = 0 }

// Touch state
let touchStartDist = 0
let touchStartScale = 1
let touchStartPan = { x: 0, y: 0 }
let isDraggingNode = false
let dragNodeId = null

function onTouchStart(e) {
  if (e.touches.length === 2) {
    touchStartDist = Math.hypot(
      e.touches[0].clientX - e.touches[1].clientX,
      e.touches[0].clientY - e.touches[1].clientY
    )
    touchStartScale = scaleVal.value
  } else if (e.touches.length === 1 && !isDraggingNode) {
    touchStartPan = { x: e.touches[0].clientX - panX.value, y: e.touches[0].clientY - panY.value }
  }
}

function onTouchMove(e) {
  if (e.touches.length === 2) {
    const dist = Math.hypot(
      e.touches[0].clientX - e.touches[1].clientX,
      e.touches[0].clientY - e.touches[1].clientY
    )
    scaleVal.value = Math.min(2.5, Math.max(0.5, touchStartScale * (dist / touchStartDist)))
  } else if (e.touches.length === 1 && !isDraggingNode) {
    panX.value = e.touches[0].clientX - touchStartPan.x
    panY.value = e.touches[0].clientY - touchStartPan.y
  }
}

function onTouchEnd() { /* handled by per-node */ }

function onNodeTouchStart(e, node) {
  if (e.touches.length === 1) {
    isDraggingNode = false
    dragNodeId = node.id
    touchStartPan = { x: e.touches[0].clientX, y: e.touches[0].clientY }
  }
}

function onNodeTouchMove(e, node) {
  if (e.touches.length === 1 && dragNodeId === node.id) {
    const dx = e.touches[0].clientX - touchStartPan.x
    const dy = e.touches[0].clientY - touchStartPan.y
    if (Math.abs(dx) > 5 || Math.abs(dy) > 5) isDraggingNode = true
    if (isDraggingNode) {
      const nx = Math.min(600, Math.max(0, node.x + dx / scaleVal.value))
      const ny = Math.min(600, Math.max(0, node.y + dy / scaleVal.value))
      updateNode(node.id, { x: Math.round(nx), y: Math.round(ny) })
      touchStartPan = { x: e.touches[0].clientX, y: e.touches[0].clientY }
    }
  }
}

function onNodeTap(e, node) {
  if (!isDraggingNode) {
    uni.navigateTo({ url: '/pages/xinwang/node-detail?id=' + node.id })
  }
  isDraggingNode = false
}

// Node styling
function getNodeStyle(node) {
  const size = getNodeSize(node)
  const px = node.x * 0.7 + 40
  const py = node.y * 0.7 + 20
  return {
    left: px + 'rpx',
    top: py + 'rpx',
    width: size + 'rpx',
    height: size + 'rpx'
  }
}

function getStarCoreStyle(node) {
  return getNodeGlowStyle(node)
}

function statusClass(node) {
  if (node.status === 'suspended') return 'star-suspended'
  if (node.type === 'hub') return 'star-hub'
  return ''
}

function getLineStyle(edge) {
  const fromNode = xinwangState.nodes.find(n => n.id === edge.from)
  const toNode = xinwangState.nodes.find(n => n.id === edge.to)
  if (!fromNode || !toNode) return {}

  const cx1 = fromNode.x * 0.7 + 40
  const cy1 = fromNode.y * 0.7 + 20
  const cx2 = toNode.x * 0.7 + 40
  const cy2 = toNode.y * 0.7 + 20
  const dx = cx2 - cx1
  const dy = cy2 - cy1
  const length = Math.sqrt(dx * dx + dy * dy)
  const angle = Math.atan2(dy, dx) * (180 / Math.PI)

  const glowStyle = getEdgeGlowStyle(fromNode, toNode)

  return {
    left: cx1 + 'rpx',
    top: cy1 + 'rpx',
    width: length + 'rpx',
    transform: `rotate(${angle}deg)`,
    transformOrigin: '0 50%',
    ...glowStyle
  }
}

// Navigation
function goFullView() { uni.navigateTo({ url: '/pages/xinwang/full-view' }) }
function goWorldview() { uni.navigateTo({ url: '/pages/xinwang/worldview' }) }

async function refreshNetwork() {
  uni.showLoading({ title: '同步中...' })
  try { await syncFromCloud() } catch (e) { /* ignore */ }
  uni.hideLoading()
}

function onTabChange(tab) {
  switchTab(tab)
  const routes = {
    zhiji: '/pages/zhiji/index', xinbao: '/pages/xinbao/index',
    xinwang: '/pages/xinwang/index', zhiguang: '/pages/zhiguang/index',
    mine: '/pages/mine/index'
  }
  uni.switchTab({ url: routes[tab] })
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
  position: fixed; top: 0; left: 0; right: 0; z-index: 100;
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 32rpx;
  padding-top: constant(safe-area-inset-top);
  padding-top: env(safe-area-inset-top);
  padding-bottom: 16rpx;
  background-color: #0a0f1a;
}
.header-left { display: flex; align-items: center; gap: 20rpx; }
.header-icon { font-size: 40rpx; color: rgba($color-primary, 0.8); }
.header-title { font-family: $font-headline; font-size: $fs-headline-md; font-weight: 600; color: rgba(255,255,255,0.9); }
.refresh-icon { font-size: 44rpx; color: rgba(255,255,255,0.5); padding: 8rpx 16rpx; }

// ── Canvas section ──
.canvas-section {
  position: relative; height: 640rpx; overflow: hidden;
  background: linear-gradient(180deg, #0a0f1a 0%, #121826 50%, #0f131e 100%);
}
.canvas-bg {
  position: absolute; top: 50%; left: 50%;
  width: 500rpx; height: 500rpx;
  margin-left: -250rpx; margin-top: -250rpx;
  border-radius: $radius-full;
  background: radial-gradient(circle, rgba($color-primary, 0.06) 0%, transparent 70%);
  pointer-events: none;
}
.bg-stars {
  position: absolute; inset: 0; pointer-events: none;
  &::after {
    content: ''; position: absolute; width: 2rpx; height: 2rpx; background: white; border-radius: $radius-full;
    box-shadow:
      30rpx 60rpx 0 rgba(255,255,255,0.7), 120rpx 30rpx 0 rgba(255,255,255,0.5),
      200rpx 80rpx 0 rgba(255,255,255,0.6), 280rpx 50rpx 0 rgba(255,255,255,0.4),
      350rpx 120rpx 0 rgba(255,255,255,0.7), 450rpx 40rpx 0 rgba(255,255,255,0.5),
      520rpx 90rpx 0 rgba(255,255,255,0.3), 580rpx 60rpx 0 rgba(255,255,255,0.6),
      80rpx 160rpx 0 rgba(255,255,255,0.4), 160rpx 140rpx 0 rgba(255,255,255,0.6),
      240rpx 200rpx 0 rgba(255,255,255,0.3), 400rpx 180rpx 0 rgba(255,255,255,0.5),
      500rpx 200rpx 0 rgba(255,255,255,0.4), 60rpx 280rpx 0 rgba(255,255,255,0.5),
      180rpx 300rpx 0 rgba(255,255,255,0.3), 320rpx 280rpx 0 rgba(255,255,255,0.6),
      460rpx 300rpx 0 rgba(255,255,255,0.4), 560rpx 260rpx 0 rgba(255,255,255,0.5),
      100rpx 380rpx 0 rgba(255,255,255,0.4), 260rpx 400rpx 0 rgba(255,255,255,0.3),
      380rpx 350rpx 0 rgba(255,255,255,0.5), 520rpx 380rpx 0 rgba(255,255,255,0.4);
  }
}

.canvas-area {
  position: absolute; inset: 0; transition: transform 0.15s ease-out;
}

// ── Connection lines ──
.connections-layer { position: absolute; inset: 0; pointer-events: none; }
.connection-line {
  position: absolute; height: 2rpx; border-radius: 1rpx;
  opacity: 0.4;
  animation: edgePulse 4s ease-in-out infinite;
}

// ── Star nodes ──
.star-node {
  position: absolute; border-radius: $radius-full;
  transition: transform 0.2s ease, box-shadow 0.3s ease;
  &.star-hub {
    animation: hubGlow 3s ease-in-out infinite;
  }
  &.star-suspended {
    opacity: 0.25; filter: grayscale(0.6);
  }
}
.star-core {
  width: 100%; height: 100%; border-radius: $radius-full;
  animation: twinkle 4s ease-in-out infinite;
}
.star-node:nth-child(2n) .star-core { animation-delay: 0.5s; animation-duration: 3.5s; }
.star-node:nth-child(3n) .star-core { animation-delay: 1.2s; animation-duration: 4.5s; }
.star-node:nth-child(5n) .star-core { animation-delay: 2s; animation-duration: 3s; }

// ── Float / Zoom / Fullview ──
.float-label {
  position: absolute; top: 24rpx; right: 24rpx;
  padding: 8rpx 20rpx; border-radius: $radius-full;
  background: rgba(255,255,255,0.08);
  backdrop-filter: blur(10rpx);
  font-size: $fs-label-sm; color: rgba(255,255,255,0.6);
}

.zoom-ctrls {
  position: absolute; bottom: 20rpx; right: 20rpx; display: flex; gap: 12rpx; z-index: 10;
}
.zoom-btn {
  width: 64rpx; height: 64rpx; border-radius: $radius-full;
  background: rgba(255,255,255,0.08);
  backdrop-filter: blur(10rpx);
  display: flex; align-items: center; justify-content: center;
  font-size: $fs-body-md; color: rgba(255,255,255,0.6);
  &:active { background: rgba(255,255,255,0.15); }
}

.fullview-btn {
  position: absolute; top: 24rpx; right: 200rpx;
  padding: 8rpx 20rpx; border-radius: $radius-full;
  background: rgba($color-primary, 0.3);
  backdrop-filter: blur(10rpx);
  &:active { background: rgba($color-primary, 0.5); }
}
.fullview-text { font-size: $fs-label-sm; color: rgba(255,255,255,0.85); font-weight: 600; }

// ── Stats ──
.stats-section { padding: 32rpx $sp-page-margin; background: #0a0f1a; }
.stats-header { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 24rpx; }
.stats-title { font-size: $fs-headline-sm; font-weight: 600; color: rgba(255,255,255,0.9); }
.stats-time { font-size: $fs-label-sm; color: rgba(255,255,255,0.4); }
.stats-grid { display: flex; gap: $sp-stack-gap; }
.stat-card { flex: 1; padding: 28rpx; border-radius: $radius-md; background: rgba(255,255,255,0.04); }
.stat-number { font-size: $fs-headline-md; font-weight: 700; color: rgba($color-primary, 0.9); }
.stat-label { display: block; font-size: $fs-label-sm; color: rgba(255,255,255,0.5); margin-top: 8rpx; }
.stat-bar { height: 6rpx; background: rgba(255,255,255,0.08); border-radius: 3rpx; overflow: hidden; margin-top: 16rpx; }
.stat-fill { height: 100%; background: rgba($color-primary, 0.6); border-radius: 3rpx; transition: width 0.5s ease; }
.stat-dots { display: flex; gap: 16rpx; margin-top: 12rpx; }
.stat-dot { width: 24rpx; height: 24rpx; border-radius: $radius-full; }
.stat-dot.active { background: rgba($color-primary, 0.7); }
.stat-dot.half { background: rgba($color-primary, 0.3); }
.stat-dot.dim { background: rgba(255,255,255,0.08); }

// ── Cards ──
.section { padding: 0 $sp-page-margin; margin-bottom: $sp-module-gap; }
.entry-card {
  display: flex; align-items: center; gap: 24rpx;
  padding: 36rpx; border-radius: $radius-md;
  background: rgba(255,255,255,0.04);
  &:active { transform: scale(0.98); }
}
.entry-icon { font-size: 48rpx; }
.entry-info { flex: 1; }
.entry-title { display: block; font-size: $fs-body-lg; color: rgba(255,255,255,0.85); }
.entry-hint { font-size: $fs-label-sm; color: rgba(255,255,255,0.4); }
.entry-arrow { font-size: 48rpx; color: rgba(255,255,255,0.3); }

.insight-card {
  padding: 36rpx; border-radius: $radius-md;
  background: linear-gradient(135deg, rgba($color-primary-container, 0.08) 0%, rgba($color-secondary-container, 0.06) 100%);
}
.insight-header { display: flex; align-items: center; gap: 12rpx; margin-bottom: 16rpx; }
.insight-emoji { font-size: 36rpx; }
.insight-title { font-size: $fs-body-md; font-weight: 600; color: rgba(255,255,255,0.7); }
.insight-text { font-size: $fs-body-md; color: rgba(255,255,255,0.5); line-height: 1.6; }

.bottom-spacer { height: 200rpx; }

// ── Animations ──
@keyframes twinkle {
  0%, 100% { opacity: 1; transform: scale(1); }
  30% { opacity: 0.55; transform: scale(0.94); }
  60% { opacity: 0.85; transform: scale(1.03); }
  80% { opacity: 1; transform: scale(1); }
}
@keyframes edgePulse {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 0.55; }
}
@keyframes hubGlow {
  0%, 100% { filter: brightness(1); }
  50% { filter: brightness(1.2); }
}

.scroll-area { height: 100vh; padding-bottom: 180rpx; box-sizing: border-box; }
.pressable:active, .pressable-subtle:active { opacity: 0.7; }
</style>
