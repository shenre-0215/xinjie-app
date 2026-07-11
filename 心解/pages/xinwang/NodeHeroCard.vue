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
        <text v-if="node.delta !== undefined" class="hero-tag tag-delta">δ={{ node.delta }}</text>
      </view>
    </view>
    <view class="hero-status" :class="'status-' + (node.status || 'completed')">
      <text>{{ statusLabel }}</text>
    </view>
  </view>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  node: { type: Object, required: true }
})

const statusLabel = computed(() => {
  const map = { 'completed': '已闭合', 'in-progress': '进行中', 'suspended': '已悬置' }
  return map[props.node.status] || '未知'
})

const nodeEmoji = computed(() => {
  const n = props.node
  if (n.type === 'hub') return '⊛'
  if (n.emotion) {
    const em = { '释然': '🌊', '平静': '🍃', '喜悦': '🌞', '成长': '🌱', '悲伤': '🌙', '失落': '🌧️', '愤怒': '🔥', '焦虑': '💫', '迷茫': '✨', '探索': '🔍' }
    return em[n.emotion] || '🌟'
  }
  const sm = { 'completed': '✨', 'in-progress': '💫', 'suspended': '⏳' }
  return sm[n.status] || '🌟'
})

const heroClass = computed(() => {
  const n = props.node
  if (n.type === 'hub') return 'hero-hub'
  if (n.emotion) {
    const em = { '释然': 'hero-blue', '平静': 'hero-blue', '喜悦': 'hero-green', '成长': 'hero-green', '悲伤': 'hero-purple', '失落': 'hero-purple', '愤怒': 'hero-orange', '焦虑': 'hero-orange', '迷茫': 'hero-gold', '探索': 'hero-gold' }
    return em[n.emotion] || 'hero-default'
  }
  return 'hero-default'
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
.hero-green { background: linear-gradient(135deg, rgba($color-tertiary, 0.15), rgba($color-tertiary-container, 0.3)); }
.hero-purple{ background: linear-gradient(135deg, rgba(168,85,247,0.15), rgba(168,85,247,0.25)); }
.hero-orange{ background: linear-gradient(135deg, rgba(251,146,60,0.15), rgba(251,146,60,0.25)); }
.hero-gold  { background: linear-gradient(135deg, rgba(250,204,21,0.15), rgba(250,204,21,0.25)); }

.hero-icon { width: 100rpx; height: 100rpx; display: flex; align-items: center; justify-content: center; background: rgba(255,255,255,0.8); border-radius: $radius-full; box-shadow: 0 8rpx 24rpx rgba(0,0,0,0.08); }
.icon-emoji { font-size: 48rpx; }
.hero-info { flex: 1; display: flex; flex-direction: column; gap: 8rpx; }
.hero-title { font-size: $fs-headline-md; font-weight: 700; color: $color-on-surface; }
.hero-subtitle { font-size: $fs-body-md; color: rgba($color-on-surface-variant, 0.7); }
.hero-tags { display: flex; gap: 12rpx; margin-top: 8rpx; }
.hero-tag { padding: 6rpx 16rpx; border-radius: $radius-full; font-size: $fs-label-sm; font-weight: 600; }
.tag-emotion { background: rgba($color-surface-container-lowest, 0.8); color: $color-on-surface-variant; }
.tag-delta { background: rgba($color-primary, 0.1); color: $color-primary; }
.hero-status { padding: 8rpx 20rpx; border-radius: $radius-full; font-size: $fs-label-sm; font-weight: 600; }
.status-completed { background: rgba($color-tertiary, 0.15); color: $color-tertiary; }
.status-in-progress { background: rgba($color-secondary, 0.15); color: $color-secondary; }
.status-suspended { background: rgba($color-tertiary-fixed-dim, 0.15); color: $color-tertiary-fixed-dim; }
</style>
