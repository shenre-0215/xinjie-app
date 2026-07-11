<template>
  <view class="step-editor">
    <view class="step-card card">
      <view class="mascot-decor"><text class="mascot-emoji">🌿</text></view>
      <view class="step-info">
        <view class="step-header">
          <text class="step-badge">步骤 {{ stepIndex + 1 }} / {{ totalSteps }}</text>
          <view class="delta-badge" :class="'delta-' + delta.color">
            <text class="delta-emoji">{{ delta.emoji }}</text>
            <text class="delta-value">δ={{ delta.value }}</text>
          </view>
        </view>
        <text class="step-question">{{ step.question }}</text>
        <text class="step-hint">{{ step.hint }}</text>
      </view>
      <textarea class="step-textarea" :value="modelValue" @input="$emit('update:modelValue', $event.target.value)" :placeholder="'在这里写下你的真实' + step.label + '...'" placeholder-style="color: rgba(65, 73, 67, 0.3); font-size: 34rpx;" :adjust-position="true" :show-confirm-bar="false" maxlength="2000" />
      <view class="quick-tags">
        <text v-for="tag in step.quickTags" :key="tag" class="quick-tag pressable" @click="$emit('appendTag', tag)">#{{ tag }}</text>
      </view>
    </view>
    <view class="tip-card">
      <text class="tip-icon">💡</text>
      <view class="tip-body">
        <text class="tip-title">小贴士</text>
        <text class="tip-text">{{ step.tip }}</text>
      </view>
    </view>
  </view>
</template>

<script setup>
defineProps({
  modelValue: { type: String, default: '' },
  step:       { type: Object, required: true },
  stepIndex:  { type: Number, required: true },
  totalSteps: { type: Number, required: true },
  delta:      { type: Object, required: true }
})
defineEmits(['update:modelValue', 'appendTag'])
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';
.step-editor { }
.step-card { padding: 48rpx; position: relative; overflow: hidden; margin-bottom: $sp-module-gap; }
.mascot-decor { position: absolute; top: 32rpx; right: 32rpx; opacity: 0.2; }
.mascot-emoji { font-size: 128rpx; }
.step-info { margin-bottom: 48rpx; }
.step-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24rpx; }
.step-badge { display: inline-block; padding: 8rpx 24rpx; border-radius: $radius-full; font-size: $fs-label-md; font-weight: 600; background-color: $color-tertiary-container; color: $color-on-tertiary-container; }
.delta-badge { display: flex; align-items: center; gap: 8rpx; padding: 8rpx 20rpx; border-radius: $radius-full; font-weight: 600; }
.delta-gray  { background-color: rgba($color-on-surface, 0.1); .delta-value { color: rgba($color-on-surface, 0.6); } }
.delta-blue  { background-color: rgba(66, 133, 244, 0.15); .delta-value { color: #4285f4; } }
.delta-yellow{ background-color: rgba(249, 168, 37, 0.15); .delta-value { color: #c17900; } }
.delta-orange{ background-color: rgba(255, 152, 0, 0.15); .delta-value { color: #ff9800; } }
.delta-green { background-color: rgba(76, 175, 80, 0.15); .delta-value { color: #388e3c; } }
.delta-emoji { font-size: 28rpx; }
.delta-value { font-size: $fs-label-md; }
.step-question { display: block; font-size: $fs-headline-md; font-weight: 600; color: $color-on-surface; margin-bottom: 16rpx; }
.step-hint { display: block; font-size: $fs-body-md; color: $color-on-surface-variant; opacity: 0.7; }
.step-textarea { width: 100%; min-height: 360rpx; background-color: $color-surface-container-low; border-radius: $radius-default; padding: 40rpx; font-size: $fs-body-lg; color: $color-on-surface; border: none; box-sizing: border-box; }
.quick-tags { display: flex; flex-wrap: wrap; gap: 16rpx; margin-top: 32rpx; }
.quick-tag { padding: 12rpx 24rpx; border-radius: $radius-full; font-size: $fs-label-md; background-color: rgba($color-secondary-container, 0.3); color: $color-on-secondary-container; }
.tip-card { display: flex; gap: 32rpx; padding: 40rpx; background-color: rgba($color-primary-container, 0.1); border: 2rpx solid rgba($color-primary-container, 0.2); border-radius: $radius-default; margin-bottom: $sp-module-gap; }
.tip-icon { font-size: 40rpx; }
.tip-body { flex: 1; }
.tip-title { display: block; font-size: $fs-label-md; font-weight: 600; color: $color-on-primary-container; margin-bottom: 8rpx; }
.tip-text { font-size: $fs-body-md; color: rgba($color-on-primary-container, 0.8); }
.pressable:active { opacity: 0.7; }
</style>
