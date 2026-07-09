<template>
  <view class="top-bar" :class="{ 'top-bar-scrolled': scrolled }">
    <!-- #ifdef H5 -->
    <view class="h5-safe-top" />
    <!-- #endif -->
    <view class="top-bar-content">
      <view class="top-bar-left">
        <view v-if="showBack" class="back-btn pressable" @click="goBack">
          <text class="back-icon">‹</text>
        </view>
        <text class="top-bar-title">{{ title }}</text>
      </view>
      <view class="top-bar-right">
        <slot name="actions" />
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  title: { type: String, default: '心解' },
  showBack: { type: Boolean, default: false }
})

const scrolled = ref(false)

function goBack() {
  uni.navigateBack({ delta: 1 })
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.top-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  display: flex;
  flex-direction: column;
  padding: 0 $sp-page-margin;
  padding-top: constant(safe-area-inset-top);
  padding-top: env(safe-area-inset-top);
  height: 160rpx;
  background-color: $color-background;
  transition: all $transition-screen;
}

.top-bar-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex: 1;
}

/* #ifdef H5 */
.top-bar {
  padding-top: 0;
}

.top-bar .h5-safe-top {
  flex-shrink: 0;
  height: var(--safe-area-inset-top, 0px);
}
/* #endif */

.top-bar-scrolled {
  background-color: rgba($color-surface-container-lowest, 0.9);
  box-shadow: $shadow-healing;
}

.top-bar-left {
  display: flex;
  align-items: center;
  gap: $sp-inline-gap;
}

.back-btn {
  width: 80rpx;
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: $radius-full;
  background-color: rgba($color-surface-container-lowest, 0.5);
}

.back-icon {
  font-size: 48rpx;
  color: $color-on-surface-variant;
  font-weight: 300;
  line-height: 1;
}

.top-bar-title {
  font-family: $font-headline;
  font-size: $fs-headline-sm;
  font-weight: 600;
  color: $color-primary;
}

.top-bar-right {
  display: flex;
  align-items: center;
  gap: $sp-inline-gap;
}
</style>
