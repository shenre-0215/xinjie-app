<template>
  <view class="page-container">
    <!-- #ifdef H5 -->
    <view class="h5-safe-top" />
    <!-- #endif -->

    <view class="header">
      <view class="back-btn pressable" @click="goBack">
        <text class="back-icon">‹</text>
      </view>
      <text class="header-title">心网全览</text>
      <view class="header-right" />
    </view>

    <view
      class="sphere-container"
      :class="{ 'auto-rotate': !touching }"
      :style="{ transform: sphereTransform }"
      @touchstart="onTouchStart"
      @touchmove="onTouchMove"
      @touchend="onTouchEnd"
    >
      <view class="sphere-bg" />
      <view class="bg-stars" />

      <!-- Wireframe grid -->
      <view class="grid-lines">
        <view class="grid-circle grid-1" />
        <view class="grid-circle grid-2" />
        <view class="grid-circle grid-3" />
        <view class="grid-meridian grid-m0" />
        <view class="grid-meridian grid-m1" />
        <view class="grid-meridian grid-m2" />
        <view class="grid-meridian grid-m3" />
        <view class="grid-meridian grid-m4" />
        <view class="grid-meridian grid-m5" />
      </view>

      <!-- Planet network -->
      <view class="planet-network" :style="{ transform: `rotateX(${rotationX}deg) rotateY(${rotationY}deg) scale(${scaleVal})` }">
        <view class="planet-connections">
          <view
            v-for="edge in xinwangState.edges"
            :key="edge.from + '-' + edge.to"
            class="planet-line"
            :style="getLineStyle(edge)"
          />
        </view>

        <view
          v-for="node in xinwangState.nodes"
          :key="node.id"
          class="planet-node"
          :class="[statusClass(node)]"
          :style="getNodeStyle(node)"
          @touchend.stop="onNodeClick(node)"
        >
          <view class="planet-label">
            <text class="label-text">{{ node.label }}</text>
          </view>
          <view class="planet-body" :style="getPlanetBodyStyle(node)" />
          <view v-if="node.type === 'hub'" class="planet-ring" />
        </view>
      </view>

      <view class="hint-text">拖动旋转 · 双指缩放</view>
    </view>

    <!-- Node list -->
    <view class="node-list-section">
      <view class="list-header">
        <text class="list-title">节点列表</text>
        <text class="list-count">{{ sortedNodes.length }}</text>
      </view>

      <view
        v-for="node in sortedNodes"
        :key="node.id"
        class="list-item pressable-subtle"
        @click="onNodeClick(node)"
      >
        <view class="list-dot" :class="getDotClass(node)" />
        <view class="list-info">
          <text class="list-label">{{ node.label }}</text>
          <text class="list-meta">
            {{ node.type === 'hub' ? '核心' : node.type === 'thinking' ? '思考节点' : '普通' }}
            <text v-if="node.delta !== undefined"> · δ={{ node.delta }}</text>
          </text>
        </view>
        <text class="list-arrow">›</text>
      </view>

      <EmptyState
        v-if="!xinwangState.nodes.length"
        emoji="◎"
        text="还没有节点"
        hint="在织记中完成思考链后，节点会出现在这里"
      />
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { xinwangState } from '../../store/useXinwangStore.js'
import { getNodeGlowStyle, getEdgeGlowStyle, getNodeSize, getConnDotClass } from '../../utils/emotionColors.js'
import EmptyState from '../../components/EmptyState.vue'

const rotationX = ref(15)
const rotationY = ref(0)
const scaleVal = ref(1)
const touching = ref(false)

let touchStart = { x: 0, y: 0, dist: 0 }
let startRotationX = 15
let startRotationY = 0

const sphereTransform = computed(() => ({
  // empty now, replaced by inner rotate
}))

const sortedNodes = computed(() =>
  [...xinwangState.nodes].sort((a, b) => {
    if (a.type === 'hub') return -1
    if (b.type === 'hub') return 1
    return (b.delta || 0) - (a.delta || 0)
  })
)

function onTouchStart(e) {
  touching.value = true
  startRotationX = rotationX.value
  startRotationY = rotationY.value
  if (e.touches.length === 2) {
    touchStart.dist = Math.hypot(
      e.touches[0].clientX - e.touches[1].clientX,
      e.touches[0].clientY - e.touches[1].clientY
    )
  } else if (e.touches.length === 1) {
    touchStart = { x: e.touches[0].clientX, y: e.touches[0].clientY, dist: 0 }
  }
}

function onTouchMove(e) {
  if (e.touches.length === 2) {
    const dist = Math.hypot(
      e.touches[0].clientX - e.touches[1].clientX,
      e.touches[0].clientY - e.touches[1].clientY
    )
    scaleVal.value = Math.min(2, Math.max(0.6, dist / touchStart.dist))
  } else if (e.touches.length === 1 && touchStart.dist === 0) {
    const dx = e.touches[0].clientX - touchStart.x
    const dy = e.touches[0].clientY - touchStart.y
    rotationY.value = startRotationY + dx * 0.3
    rotationX.value = Math.min(45, Math.max(-30, startRotationX - dy * 0.3))
  }
}

function onTouchEnd() {
  setTimeout(() => { touching.value = false }, 1500)
}

// Node styling
function getNodeStyle(node) {
  const size = getNodeSize(node)
  const px = node.x * 0.7 + 40
  const py = node.y * 0.7 + 20
  return { left: px + 'rpx', top: py + 'rpx', width: size + 'rpx', height: size + 'rpx' }
}

function getPlanetBodyStyle(node) {
  return getNodeGlowStyle(node)
}

function statusClass(node) {
  if (node.status === 'suspended') return 'planet-suspended'
  if (node.type === 'hub') return 'planet-hub'
  return ''
}

function getDotClass(node) {
  return getConnDotClass(node)
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
  return {
    left: cx1 + 'rpx', top: cy1 + 'rpx', width: length + 'rpx',
    transform: `rotate(${angle}deg)`, transformOrigin: '0 50%',
    ...getEdgeGlowStyle(fromNode, toNode)
  }
}

function onNodeClick(node) {
  uni.navigateTo({ url: '/pages/xinwang/node-detail?id=' + node.id })
}

function goBack() { uni.navigateBack({ delta: 1 }) }
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';
@import '@/styles/mixins.scss';

.page-container {
  min-height: 100vh;
  background: linear-gradient(180deg, #0a0f1a 0%, #121826 50%, #1a1f2e 100%);
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
  background-color: rgba(#0a0f1a, 0.85);
  backdrop-filter: blur(20rpx);
}
.back-btn { width: 80rpx; height: 80rpx; display: flex; align-items: center; justify-content: center; }
.back-icon { font-size: 48rpx; color: rgba(255,255,255,0.6); font-weight: 300; }
.header-title { font-size: $fs-headline-md; font-weight: 600; color: rgba(255,255,255,0.9); }
.header-right { width: 80rpx; }

// ── Sphere ──
.sphere-container {
  height: 640rpx; position: relative; overflow: hidden;
  perspective: 1000rpx;
}
.sphere-bg {
  position: absolute; top: 50%; left: 50%;
  width: 500rpx; height: 500rpx;
  margin-left: -250rpx; margin-top: -250rpx;
  border-radius: $radius-full;
  background: radial-gradient(circle, rgba($color-primary, 0.06) 0%, transparent 70%);
}
.bg-stars {
  position: absolute; inset: 0; pointer-events: none;
  &::after {
    content: ''; position: absolute; width: 2rpx; height: 2rpx; background: white; border-radius: $radius-full;
    box-shadow:
      40rpx 50rpx 0 rgba(255,255,255,0.5), 150rpx 80rpx 0 rgba(255,255,255,0.4),
      280rpx 30rpx 0 rgba(255,255,255,0.6), 350rpx 100rpx 0 rgba(255,255,255,0.3),
      480rpx 60rpx 0 rgba(255,255,255,0.5), 80rpx 180rpx 0 rgba(255,255,255,0.4),
      200rpx 200rpx 0 rgba(255,255,255,0.3), 420rpx 160rpx 0 rgba(255,255,255,0.5),
      550rpx 180rpx 0 rgba(255,255,255,0.3), 120rpx 320rpx 0 rgba(255,255,255,0.4),
      300rpx 280rpx 0 rgba(255,255,255,0.3), 500rpx 300rpx 0 rgba(255,255,255,0.4);
  }
}

// ── Grid (wireframe globe) ──
.grid-lines {
  position: absolute; top: 50%; left: 50%; width: 0; height: 0;
  transform-style: preserve-3d; pointer-events: none;
}
.grid-circle {
  position: absolute; border: 1rpx solid rgba(255,255,255,0.06); border-radius: $radius-full;
}
.grid-1 { width: 520rpx; height: 520rpx; margin-left: -260rpx; margin-top: -260rpx; }
.grid-2 { width: 380rpx; height: 380rpx; margin-left: -190rpx; margin-top: -190rpx; }
.grid-3 { width: 260rpx; height: 260rpx; margin-left: -130rpx; margin-top: -130rpx; }

// meridians
.grid-meridian {
  position: absolute;
  width: 520rpx; height: 320rpx;
  margin-left: -260rpx; margin-top: -160rpx;
  border: 1rpx solid rgba(255,255,255,0.04);
  border-radius: $radius-full;
}
.grid-m0 { transform: rotateY(0deg); }
.grid-m1 { transform: rotateY(30deg); }
.grid-m2 { transform: rotateY(60deg); }
.grid-m3 { transform: rotateY(90deg); }
.grid-m4 { transform: rotateY(120deg); }
.grid-m5 { transform: rotateY(150deg); }

// ── Planet network ──
.planet-network {
  position: absolute; top: 0; left: 0; right: 0; bottom: 0;
  transition: transform 0.1s ease-out;
}
.planet-connections { position: absolute; inset: 0; pointer-events: none; }
.planet-line {
  position: absolute; height: 2rpx; border-radius: 1rpx; opacity: 0.35;
}

.planet-node {
  position: absolute; border-radius: $radius-full;
  display: flex; align-items: center; justify-content: center;
  animation: planetFloat 3s ease-in-out infinite;
  &.planet-hub { animation: planetFloat 4s ease-in-out infinite, hubGlow 3s ease-in-out infinite; }
  &.planet-suspended { opacity: 0.3; filter: grayscale(0.6); animation: none; }
}
.planet-body {
  width: 100%; height: 100%; border-radius: $radius-full;
  animation: twinkle 4s ease-in-out infinite;
}

// Label: hidden by default, revealed on tap
.planet-label {
  position: absolute; top: -48rpx; left: 50%; transform: translateX(-50%);
  padding: 6rpx 16rpx; border-radius: $radius-full;
  background: rgba(0,0,0,0.7); backdrop-filter: blur(10rpx);
  white-space: nowrap; z-index: 5;
  opacity: 0; transition: opacity 0.2s;
}
.planet-node:active .planet-label { opacity: 1; }
.label-text { font-size: $fs-label-sm; color: rgba(255,255,255,0.85); }

.planet-ring {
  position: absolute; inset: -12rpx; border: 2rpx solid rgba($color-primary, 0.2);
  border-radius: $radius-full;
  animation: ringRotate 6s linear infinite;
}

// ── Hint ──
.hint-text {
  position: absolute; bottom: 24rpx; left: 50%; transform: translateX(-50%);
  font-size: $fs-label-sm; color: rgba(255,255,255,0.25);
}

// ── Node list ──
.node-list-section { padding: 0 $sp-page-margin; }
.list-header { display: flex; align-items: center; gap: 12rpx; margin-bottom: 32rpx; }
.list-title { font-size: $fs-headline-sm; font-weight: 600; color: rgba(255,255,255,0.9); }
.list-count {
  font-size: $fs-label-sm; padding: 4rpx 16rpx; border-radius: $radius-full;
  background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.5);
}

.list-item {
  display: flex; align-items: center; gap: 20rpx;
  padding: 28rpx; margin-bottom: 12rpx;
  border-radius: $radius-md; background: rgba(255,255,255,0.04);
  &:active { transform: scale(0.98); }
}
.list-dot {
  width: 20rpx; height: 20rpx; border-radius: $radius-full; flex-shrink: 0;
  background: rgba($color-primary, 0.5);
  &.conn-blue { background: rgba($color-secondary, 0.6); }
  &.conn-amber { background: rgba($color-tertiary, 0.6); }
  &.conn-purple { background: rgba(168,85,247,0.6); }
  &.conn-orange { background: rgba(251,146,60,0.6); }
  &.conn-gold { background: rgba(250,204,21,0.6); }
  &.conn-hub { background: rgba($color-primary, 0.7); width: 24rpx; height: 24rpx; }
}
.list-info { flex: 1; }
.list-label { display: block; font-size: $fs-body-md; color: rgba(255,255,255,0.85); }
.list-meta { font-size: $fs-label-sm; color: rgba(255,255,255,0.35); }
.list-arrow { font-size: 40rpx; color: rgba(255,255,255,0.2); }

// ── Animations ──
@keyframes planetFloat {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8rpx); }
}
@keyframes ringRotate {
  0% { transform: rotateX(70deg) rotateZ(0deg); }
  100% { transform: rotateX(70deg) rotateZ(360deg); }
}
@keyframes twinkle {
  0%, 100% { opacity: 1; transform: scale(1); }
  30% { opacity: 0.6; transform: scale(0.95); }
  60% { opacity: 0.85; transform: scale(1.02); }
}
@keyframes hubGlow {
  0%, 100% { filter: brightness(1); }
  50% { filter: brightness(1.3); }
}

.auto-rotate .planet-network {
  animation: autoSpin 30s linear infinite;
}
@keyframes autoSpin {
  0% { transform: rotateY(0deg); }
  100% { transform: rotateY(360deg); }
}

.pressable:active, .pressable-subtle:active { opacity: 0.7; }
</style>
