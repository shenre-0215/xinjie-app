<template>
  <view class="hero-card" :class="heroClass">
    <view class="hero-icon">
      <text class="icon-emoji">{{ nodeEmoji }}</text>
    </view>
    <view class="hero-info">
      <text class="hero-title">{{ node.label }}</text>
      <text v-if="node.subtitle" class="hero-subtitle">{{ node.subtitle }}</text>
      <view class="hero-tags">
        <text v-if="node.emotion" class="hero-tag tag-emotion">{{ node.emotion }}</text>
        <view v-if="node.delta !== undefined" class="hero-tag tag-delta-wrap">
          <view class="delta-ring" :style="deltaRingStyle" />
          <text class="tag-delta">δ={{ node.delta }}</text>
        </view>
        <text v-if="connectedCount > 0" class="hero-tag tag-conn">🔗 {{ connectedCount }} 个连接</text>
      </view>
    </view>
    <view class="hero-status" :class="'status-' + (node.status || 'completed')">
      <text>{{ statusLabel }}</text>
    </view>
  </view>
</template>

<script setup>
import { computed } from 'vue'
import { getEmotionEmoji, getHeroClass, getEmotionColorKey, getColorDef } from '../../utils/emotionColors.js'

const props = defineProps({
  node: { type: Object, required: true },
  connectedCount: { type: Number, default: 0 }
})

const statusLabel = computed(() => {
  const map = { 'completed': '已闭合', 'in-progress': '进行中', 'suspended': '已悬置' }
  return map[props.node.status] || '未知'
})

const nodeEmoji = computed(() => getEmotionEmoji(props.node))

const heroClass = computed(() => getHeroClass(props.node))

const deltaRingStyle = computed(() => {
  const d = props.node.delta || 0
  const key = props.node.type === 'hub' ? 'primary' : (getEmotionColorKey(props.node.emotion) || 'primary')
  const c = getColorDef(key)
  return {
    background: `conic-gradient(${c.hex} ${d * 360}deg, transparent ${d * 360}deg)`
  }
})
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.hero-card {
  display: flex; align-items: center; gap: 24rpx;
  padding: 40rpx; border-radius: $radius-default;
  margin-bottom: $sp-module-gap;
  background: linear-gradient(135deg, rgba($color-primary-container, 0.3), rgba($color-secondary-container, 0.1));
}
.hero-hub   { background: linear-gradient(135deg, rgba($color-primary, 0.15), rgba($color-primary-container, 0.3)); }
.hero-blue  { background: linear-gradient(135deg, rgba($color-secondary, 0.15), rgba($color-secondary-container, 0.3)); }
.hero-amber { background: linear-gradient(135deg, rgba($color-tertiary, 0.15), rgba($color-tertiary-container, 0.3)); }
.hero-purple{ background: linear-gradient(135deg, rgba(168,85,247,0.15), rgba(168,85,247,0.25)); }
.hero-orange{ background: linear-gradient(135deg, rgba(251,146,60,0.15), rgba(251,146,60,0.25)); }
.hero-gold  { background: linear-gradient(135deg, rgba(250,204,21,0.15), rgba(250,204,21,0.25)); }

.hero-icon { width: 100rpx; height: 100rpx; display: flex; align-items: center; justify-content: center; background: rgba(255,255,255,0.8); border-radius: $radius-full; box-shadow: 0 8rpx 24rpx rgba(0,0,0,0.08); }
.icon-emoji { font-size: 48rpx; }
.hero-info { flex: 1; display: flex; flex-direction: column; gap: 8rpx; }
.hero-title { font-size: $fs-headline-md; font-weight: 700; color: $color-on-surface; }
.hero-subtitle { font-size: $fs-body-md; color: rgba($color-on-surface-variant, 0.7); }
.hero-tags { display: flex; gap: 12rpx; margin-top: 8rpx; flex-wrap: wrap; }
.hero-tag { padding: 6rpx 16rpx; border-radius: $radius-full; font-size: $fs-label-sm; font-weight: 600; }
.tag-emotion { background: rgba($color-surface-container-lowest, 0.8); color: $color-on-surface-variant; }
.tag-delta { background: rgba($color-primary, 0.1); color: $color-primary; }
.tag-delta-wrap { display: flex; align-items: center; gap: 8rpx; background: rgba($color-primary, 0.08); }
.tag-conn { background: rgba($color-secondary, 0.1); color: $color-secondary; }

.delta-ring {
  width: 28rpx; height: 28rpx; border-radius: $radius-full;
  position: relative;
  &::after {
    content: ''; position: absolute; inset: 4rpx; border-radius: $radius-full;
    background: rgba($color-primary, 0.2);
  }
}

.hero-status { padding: 8rpx 20rpx; border-radius: $radius-full; font-size: $fs-label-sm; font-weight: 600; }
.status-completed { background: rgba($color-tertiary, 0.15); color: $color-tertiary; }
.status-in-progress { background: rgba($color-secondary, 0.15); color: $color-secondary; }
.status-suspended { background: rgba($color-tertiary-fixed-dim, 0.15); color: $color-tertiary-fixed-dim; }
</style>
