<template>
  <view class="empty-state">
    <text class="empty-emoji">{{ emoji }}</text>
    <text class="empty-text">{{ text }}</text>
    <text v-if="hint" class="empty-hint">{{ hint }}</text>
    <view v-if="showAction" class="empty-action pressable" @click="$emit('action')">
      <text class="action-text">{{ actionText }}</text>
    </view>
  </view>
</template>

<script setup>
defineProps({
  emoji:      { type: String, default: '◎' },
  text:       { type: String, required: true },
  hint:       { type: String, default: '' },
  showAction: { type: Boolean, default: false },
  actionText: { type: String, default: '开始' }
})

defineEmits(['action'])
</script>

<style lang="scss" scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80rpx 40rpx;
}

.empty-emoji {
  font-size: 64rpx;
  opacity: 0.35;
  margin-bottom: 24rpx;
}

.empty-text {
  font-size: 28rpx;
  color: rgba(51, 51, 51, 0.45);
  margin-bottom: 12rpx;
}

.empty-hint {
  font-size: 24rpx;
  color: rgba(51, 51, 51, 0.3);
  text-align: center;
  max-width: 400rpx;
  line-height: 1.5;
}

.empty-action {
  margin-top: 32rpx;
  padding: 16rpx 48rpx;
  background-color: #3d6751;
  border-radius: 9999rpx;
}

.action-text {
  font-size: 28rpx;
  color: #ffffff;
  font-weight: 600;
}

.pressable:active { opacity: 0.7; }
</style>
