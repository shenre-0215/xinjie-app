<template>
  <view class="empty-state">
    <view class="empty-bg" />
    <view class="empty-illustration">
      <text class="empty-emoji float-emoji">{{ emoji }}</text>
    </view>
    <text class="empty-text fade-text">{{ text }}</text>
    <text v-if="hint" class="empty-hint fade-text-delay">{{ hint }}</text>
    <view v-if="showAction" class="empty-action pressable bounce-btn" @click="$emit('action')">
      <text class="action-text">{{ actionText }}</text>
    </view>
  </view>
</template>

<script setup>
defineProps({
  emoji: { type: String, default: '🌿' },
  text: { type: String, default: '这里还是空的呢～' },
  hint: { type: String, default: '' },
  showAction: { type: Boolean, default: false },
  actionText: { type: String, default: '开始吧' }
})

defineEmits(['action'])
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx 64rpx;
  text-align: center;
  position: relative;
  overflow: hidden;
}

.empty-bg {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 600rpx;
  height: 600rpx;
  border-radius: $radius-full;
  background: radial-gradient(circle, rgba($color-primary-container, 0.1) 0%, transparent 70%);
  pointer-events: none;
}

.empty-illustration {
  width: 200rpx;
  height: 200rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 48rpx;
  border-radius: $radius-full;
  background: linear-gradient(135deg, rgba($color-primary-container, 0.2), rgba($color-secondary-container, 0.1));
  box-shadow: 0 8rpx 40rpx rgba($color-primary-container, 0.1);
}

.empty-emoji {
  font-size: 88rpx;
}

.float-emoji {
  animation: empty-float 3s ease-in-out infinite;
}

.empty-text {
  font-size: $fs-body-lg;
  color: $color-on-surface-variant;
  margin-bottom: 16rpx;
}

.empty-hint {
  font-size: $fs-body-md;
  color: rgba($color-on-surface-variant, 0.5);
  max-width: 480rpx;
}

.fade-text {
  animation: fade-in-up 0.5s ease-out;
}

.fade-text-delay {
  animation: fade-in-up 0.5s ease-out 0.15s both;
}

.empty-action {
  margin-top: 48rpx;
  padding: 24rpx 72rpx;
  background-color: $color-primary;
  border-radius: $radius-full;
  box-shadow: 0 8rpx 24rpx rgba($color-primary, 0.15);
  transition: all 0.2s ease;
  
  &:active {
    transform: scale(0.95);
    box-shadow: 0 4rpx 12rpx rgba($color-primary, 0.2);
  }
}

.bounce-btn {
  animation: fade-in-up 0.5s ease-out 0.3s both;
}

.action-text {
  color: $color-on-primary;
  font-size: $fs-headline-sm;
  font-weight: 600;
}

@keyframes empty-float {
  0%, 100% { transform: translateY(0) rotate(-3deg); }
  50% { transform: translateY(-16rpx) rotate(3deg); }
}

@keyframes fade-in-up {
  0% { opacity: 0; transform: translateY(24rpx); }
  100% { opacity: 1; transform: translateY(0); }
}
</style>
