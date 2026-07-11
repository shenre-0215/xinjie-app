<template>
  <view class="page-container">
    <!-- #ifdef H5 -->
    <view class="h5-safe-top" />
    <!-- #endif -->
    
    <view class="header">
      <view class="back-btn pressable" @click="goBack">
        <text class="back-icon">←</text>
      </view>
      <text class="header-title">心网全览</text>
      <view class="header-right" />
    </view>

    <view class="sphere-container" 
      @touchstart="onTouchStart"
      @touchmove="onTouchMove"
      @touchend="onTouchEnd">
      
      <view class="sphere-bg" />
      
      <view class="grid-lines">
        <view class="grid-circle grid-1" />
        <view class="grid-circle grid-2" />
        <view class="grid-circle grid-3" />
        <view class="grid-horizontal grid-h1" />
        <view class="grid-horizontal grid-h2" />
        <view class="grid-horizontal grid-h3" />
      </view>

      <view class="planet-network">
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
          :class="['planet-' + node.status, 'planet-' + node.type]"
          :style="getNodeStyle(node)"
          @touchend.stop="onNodeClick(node)"
        >
          <view class="planet-label">
            <text class="label-text">{{ node.label }}</text>
          </view>
          <view class="planet-body" :class="getPlanetColorClass(node)" />
          <view class="planet-ring" :class="getPlanetColorClass(node)" />
        </view>
      </view>

      <view class="hint-text">
        <text>拖动旋转 · 双指缩放</text>
      </view>
    </view>

    <view class="nodes-list">
      <view class="list-header">
        <text class="list-title">节点列表</text>
        <text class="list-count">{{ xinwangState.nodes.length }} 个节点</text>
      </view>
      
      <view class="list-items">
        <view
          v-for="node in sortedNodes"
          :key="node.id"
          class="list-item pressable"
          @click="onNodeClick(node)"
        >
          <view class="item-dot" :class="getPlanetColorClass(node)" />
          <view class="item-info">
            <text class="item-label">{{ node.label }}</text>
            <text class="item-meta">
              {{ node.subtitle || node.type === 'hub' ? '核心' : '思考链' }}
              <text v-if="node.delta"> · δ={{ node.delta }}</text>
            </text>
          </view>
          <view class="item-arrow">›</view>
        </view>
        
        <EmptyState v-if="xinwangState.nodes.length === 0" emoji="⊛" text="暂无节点" hint="去心宝完成思考链，建立你的心网" />
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed, ref } from 'vue'
import { xinwangState } from '../../store/useXinwangStore.js'
import EmptyState from '../../components/EmptyState.vue'

const rotationX = ref(15)
const rotationY = ref(0)
const scaleVal = ref(1)

let sX = 0, sY = 0, sD = 0, srX = 0, srY = 0, sS = 1

function onTouchStart(e) {
  if (e.touches.length === 1) {
    sX = e.touches[0].clientX
    sY = e.touches[0].clientY
    srX = rotationX.value
    srY = rotationY.value
  } else if (e.touches.length === 2) {
    sD = Math.hypot(
      e.touches[0].clientX - e.touches[1].clientX,
      e.touches[0].clientY - e.touches[1].clientY
    )
    sS = scaleVal.value
  }
}

function onTouchMove(e) {
  if (e.touches.length === 1) {
    rotationY.value = srY + (e.touches[0].clientX - sX) * 0.5
    rotationX.value = Math.max(-30, Math.min(30, srX - (e.touches[0].clientY - sY) * 0.5))
  } else if (e.touches.length === 2) {
    const d = Math.hypot(
      e.touches[0].clientX - e.touches[1].clientX,
      e.touches[0].clientY - e.touches[1].clientY
    )
    scaleVal.value = Math.min(2, Math.max(0.6, sS * (d / sD)))
  }
}

function onTouchEnd() {}

const sortedNodes = computed(() => {
  return [...xinwangState.nodes].sort((a, b) => {
    if (a.type === 'hub') return -1
    if (b.type === 'hub') return 1
    return (b.delta || 0) - (a.delta || 0)
  })
})

function getNodeStyle(node) {
  const isHub = node.type === 'hub'
  const size = isHub ? 80 : (node.delta && node.delta >= 0.7 ? 56 : 44)
  return {
    left: (node.x * 0.7 + 40) + 'rpx',
    top: (node.y * 0.7 + 20) + 'rpx',
    width: size + 'rpx',
    height: size + 'rpx'
  }
}

function getPlanetColorClass(node) {
  if (node.type === 'hub') return 'planet-hub'
  if (node.status === 'suspended') return 'planet-suspended'
  if (node.emotion) {
    const emotionMap = {
      '释然': 'planet-blue', '平静': 'planet-blue', '喜悦': 'planet-green', 
      '成长': 'planet-green', '悲伤': 'planet-purple', '失落': 'planet-purple',
      '愤怒': 'planet-orange', '焦虑': 'planet-orange', '迷茫': 'planet-gold', '探索': 'planet-gold'
    }
    return emotionMap[node.emotion] || 'planet-default'
  }
  return 'planet-default'
}

function getNodeCenter(node) {
  const isHub = node.type === 'hub'
  const size = isHub ? 80 : (node.delta && node.delta >= 0.7 ? 56 : 44)
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

function onNodeClick(node) {
  uni.navigateTo({ url: '/pages/xinwang/node-detail?id=' + node.id })
}

function goBack() {
  uni.navigateBack()
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';
@import '@/styles/mixins.scss';

.page-container { 
  @include page-container; 
  padding-top: calc(env(safe-area-inset-top) + 88rpx); 
  @include fade-in;
  background: linear-gradient(180deg, rgba($color-primary-container, 0.05) 0%, $color-background 100%);
}

.header {
  position: fixed; top: 0; left: 0; right: 0; z-index: 100;
  padding: 0 32rpx;
  padding-top: constant(safe-area-inset-top);
  padding-top: env(safe-area-inset-top);
  padding-bottom: 16rpx;
  display: flex; align-items: center; justify-content: space-between;
  background: rgba($color-background, 0.8);
  backdrop-filter: blur(20rpx);
}

.back-btn { width: 64rpx; height: 64rpx; display: flex; align-items: center; justify-content: center; }
.back-icon { font-size: 48rpx; color: $color-on-surface; }

.header-title {
  font-family: $font-headline;
  font-size: $fs-headline-md;
  font-weight: 600;
  color: $color-primary;
}

.header-right { width: 64rpx; }

.sphere-container {
  position: relative;
  width: 100%;
  height: 600rpx;
  perspective: 1000rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.sphere-bg {
  position: absolute;
  width: 500rpx;
  height: 500rpx;
  border-radius: $radius-full;
  background: radial-gradient(circle at 30% 30%, 
    rgba($color-primary-container, 0.2), 
    rgba($color-primary-container, 0.05), 
    transparent
  );
}

.grid-lines {
  position: absolute;
  width: 600rpx;
  height: 600rpx;
  transform-style: preserve-3d;
  transform: rotateX(15deg) rotateY(0deg);
}

.grid-circle {
  position: absolute;
  left: 50%;
  top: 50%;
  border: 1rpx solid rgba($color-primary, 0.1);
  border-radius: $radius-full;
}
.grid-1 { width: 500rpx; height: 500rpx; margin-left: -250rpx; margin-top: -250rpx; }
.grid-2 { width: 380rpx; height: 380rpx; margin-left: -190rpx; margin-top: -190rpx; }
.grid-3 { width: 260rpx; height: 260rpx; margin-left: -130rpx; margin-top: -130rpx; }

.grid-horizontal {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 500rpx;
  height: 1rpx;
  background: rgba($color-primary, 0.1);
  margin-left: -250rpx;
}
.grid-h1 { margin-top: -120rpx; }
.grid-h2 { margin-top: 0; }
.grid-h3 { margin-top: 120rpx; }

.planet-network {
  position: relative;
  width: 600rpx;
  height: 600rpx;
  transform-style: preserve-3d;
  transition: transform 0.1s ease-out;
}

.planet-connections { position: absolute; inset: 0; }
.planet-line {
  position: absolute;
  height: 3rpx;
  background: linear-gradient(90deg, 
    rgba($color-primary, 0.2), 
    rgba($color-primary, 0.4), 
    rgba($color-primary, 0.2)
  );
  border-radius: $radius-full;
  transform-origin: left center;
}

.planet-node {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: planetFloat 4s ease-in-out infinite;
}

@keyframes planetFloat {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8rpx); }
}

.planet-label {
  position: absolute;
  top: -56rpx;
  left: 50%;
  transform: translateX(-50%);
  padding: 8rpx 20rpx;
  background: rgba($color-surface-container-lowest, 0.9);
  backdrop-filter: blur(10rpx);
  border-radius: 20rpx;
  white-space: nowrap;
  z-index: 10;
}

.label-text {
  font-size: 22rpx;
  color: $color-on-surface;
  font-weight: 600;
}

.planet-body {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: $radius-full;
}

.planet-ring {
  position: absolute;
  width: 140%;
  height: 140%;
  border-radius: $radius-full;
  border: 2rpx solid transparent;
  opacity: 0;
}

.planet-hub .planet-body { background: radial-gradient(circle at 30% 30%, rgba(255,255,255,0.9), rgba($color-primary,0.8), rgba($color-primary,0.5)); box-shadow: 0 0 20rpx rgba($color-primary,0.5), 0 0 40rpx rgba($color-primary,0.3); }
.planet-hub .planet-ring {
  border-color: rgba($color-primary, 0.3);
  opacity: 1;
  animation: ringRotate 10s linear infinite;
}

.planet-default .planet-body { background: radial-gradient(circle at 30% 30%, rgba(255,255,255,0.8), rgba($color-on-surface-variant,0.6)); }

.planet-blue .planet-body { background: radial-gradient(circle at 30% 30%, rgba(255,255,255,0.8), rgba($color-secondary,0.6)); }
.planet-green .planet-body { background: radial-gradient(circle at 30% 30%, rgba(255,255,255,0.8), rgba($color-tertiary,0.6)); }
.planet-purple .planet-body { background: radial-gradient(circle at 30% 30%, rgba(255,255,255,0.8), rgba(168,85,247,0.6)); }
.planet-orange .planet-body { background: radial-gradient(circle at 30% 30%, rgba(255,255,255,0.8), rgba(251,146,60,0.6)); }
.planet-gold .planet-body { background: radial-gradient(circle at 30% 30%, rgba(255,255,255,0.9), rgba(250,204,21,0.6)); }
.planet-suspended .planet-body { background: radial-gradient(circle at 30% 30%, rgba(255,255,255,0.4), rgba($color-tertiary-fixed-dim,0.3)); opacity: 0.6; }

@keyframes ringRotate {
  from { transform: rotateX(70deg) rotateZ(0deg); }
  to { transform: rotateX(70deg) rotateZ(360deg); }
}

.hint-text {
  position: absolute;
  bottom: 20rpx;
  left: 50%;
  transform: translateX(-50%);
  font-size: $fs-label-sm;
  color: rgba($color-on-surface-variant, 0.4);
}

.nodes-list {
  padding: 0 $sp-page-margin $sp-module-gap;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
}

.list-title {
  font-size: $fs-headline-sm;
  font-weight: 600;
  color: $color-on-surface;
}

.list-count {
  font-size: $fs-label-sm;
  color: rgba($color-on-surface-variant, 0.5);
}

.list-items {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.list-item {
  display: flex;
  align-items: center;
  padding: 24rpx;
  background: $color-surface-container-lowest;
  border-radius: $radius-default;
  gap: 20rpx;
}

.item-dot {
  width: 16rpx;
  height: 16rpx;
  border-radius: $radius-full;
  flex-shrink: 0;
}

.item-dot.planet-hub { background: $color-primary; }
.item-dot.planet-default { background: $color-on-surface-variant; }
.item-dot.planet-blue { background: $color-secondary; }
.item-dot.planet-green { background: $color-tertiary; }
.item-dot.planet-purple { background: #a855f7; }
.item-dot.planet-orange { background: #fb923c; }
.item-dot.planet-gold { background: #facc15; }
.item-dot.planet-suspended { background: $color-tertiary-fixed-dim; opacity: 0.5; }

.item-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6rpx;
}

.item-label {
  font-size: $fs-body-md;
  font-weight: 600;
  color: $color-on-surface;
}

.item-meta {
  font-size: $fs-label-sm;
  color: rgba($color-on-surface-variant, 0.5);
}

.item-arrow {
  font-size: 40rpx;
  color: rgba($color-on-surface-variant, 0.3);
}

</style>