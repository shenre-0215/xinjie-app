<template>
  <view v-if="modelValue" class="overlay" @click="$emit('update:modelValue', false)">
    <view class="prompt-card" @click.stop>
      <view class="prompt-icon">🌱</view>
      <text class="prompt-title">需要暂停一下吗？</text>
      <text class="prompt-desc">你在这一步停留了一段时间，也许需要先放一放，让思绪自然生长。</text>
      <view class="prompt-btns">
        <view class="prompt-btn-cancel pressable" @click="$emit('update:modelValue', false)">
          <text class="prompt-btn-text">继续思考</text>
        </view>
        <view class="prompt-btn-suspend pressable" @click="$emit('suspend')">
          <text class="prompt-btn-text">标记悬置</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
defineProps({ modelValue: { type: Boolean, default: false } })
defineEmits(['update:modelValue', 'suspend'])
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';
.overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background-color: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; z-index: 200; animation: fadeIn 0.3s ease; }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
.prompt-card { width: 600rpx; padding: 64rpx 48rpx; background-color: $color-background; border-radius: $radius-lg; text-align: center; animation: slideUp 0.3s ease; }
@keyframes slideUp { from { opacity: 0; transform: translateY(40rpx); } to { opacity: 1; transform: translateY(0); } }
.prompt-icon { font-size: 96rpx; margin-bottom: 32rpx; }
.prompt-title { display: block; font-size: $fs-headline-md; font-weight: 600; color: $color-on-surface; margin-bottom: 16rpx; }
.prompt-desc { display: block; font-size: $fs-body-md; color: $color-on-surface-variant; line-height: 1.6; margin-bottom: 48rpx; }
.prompt-btns { display: flex; gap: 24rpx; }
.prompt-btn-cancel { flex: 1; padding: 28rpx; border-radius: $radius-default; background-color: $color-surface-container-high; }
.prompt-btn-suspend { flex: 1; padding: 28rpx; border-radius: $radius-default; background-color: $color-primary; }
.prompt-btn-text { font-size: $fs-headline-sm; font-weight: 600; }
.prompt-btn-cancel .prompt-btn-text { color: $color-on-surface-variant; }
.prompt-btn-suspend .prompt-btn-text { color: $color-on-primary; }
.pressable:active { opacity: 0.7; }
</style>
