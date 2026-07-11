<template>
  <view class="tab-bar">
    <!-- #ifdef H5 -->
    <view class="h5-safe-bottom" />
    <!-- #endif -->
    <view
      v-for="tab in tabs"
      :key="tab.key"
      class="tab-item"
      :class="{ 'tab-active': currentTab === tab.key }"
      @click="switchTab(tab)"
    >
      <view class="tab-icon-wrap" :class="{ 'icon-active': currentTab === tab.key, 'icon-bounce': bounceTab === tab.key }">
        <text class="tab-icon">{{ tab.icon }}</text>
      </view>
      <text class="tab-label" :class="{ 'label-bounce': bounceTab === tab.key }">{{ tab.label }}</text>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  current: { type: String, default: 'zhiji' }
})

const emit = defineEmits(['change'])

const bounceTab = ref('')

const tabs = [
  { key: 'zhiji', label: '织记', icon: '✿' },
  { key: 'xinbao', label: '心宝', icon: '♡' },
  { key: 'xinwang', label: '心网', icon: '⊛' },
  { key: 'zhiguang', label: '织光', icon: '☆' },
  { key: 'mine', label: '我的', icon: '◈' }
]

const currentTab = computed(() => props.current)

function switchTab(tab) {
  if (tab.key === currentTab.value) return
  bounceTab.value = tab.key
  emit('change', tab.key)
  setTimeout(() => {
    bounceTab.value = ''
  }, 400)
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.tab-bar {
  position: fixed; bottom: 0; left: 0; right: 0; z-index: 200;
  display: flex; justify-content: space-around; align-items: center;
  padding: 0 16rpx;
  padding-bottom: constant(safe-area-inset-bottom);
  padding-bottom: env(safe-area-inset-bottom);
  height: 136rpx;
  background-color: $color-surface-container-lowest;
  box-shadow: $shadow-nav;
  border-radius: $radius-default $radius-default 0 0;
}

/* #ifdef H5 */
.tab-bar {
  padding-bottom: 0;
}

.tab-bar .h5-safe-bottom {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: var(--safe-area-inset-bottom, 0px);
}
/* #endif */

.tab-item {
  display: flex; flex-direction: column; align-items: center;
  padding: 8rpx 24rpx; border-radius: $radius-lg;
  transition: all $transition-press;
  gap: 4rpx;

  &:active { transform: scale(0.95); }
}

.tab-icon-wrap {
  width: 68rpx; height: 68rpx; border-radius: $radius-full;
  display: flex; align-items: center; justify-content: center;
  background-color: transparent;
  transition: all 0.25s ease;
}

.tab-icon {
  font-size: 36rpx; line-height: 1;
  color: $color-primary; opacity: 0.55;
  transition: all 0.25s ease;
}

.tab-label {
  font-size: 22rpx; font-weight: 600;
  color: $color-primary; opacity: 0.55;
  transition: all 0.25s ease;
}

.tab-active {
  .tab-icon-wrap { background-color: $color-primary; }
  .tab-icon { color: $color-on-primary; opacity: 1; }
  .tab-label { color: $color-primary; opacity: 1; font-weight: 700; }
}

.icon-bounce {
  animation: tab-bounce 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.label-bounce {
  animation: label-bounce 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes tab-bounce {
  0% { transform: scale(0.8); }
  50% { transform: scale(1.25); }
  100% { transform: scale(1); }
}

@keyframes label-bounce {
  0% { transform: translateY(4rpx); opacity: 0.6; }
  50% { transform: translateY(-8rpx); opacity: 1; }
  100% { transform: translateY(0); opacity: 1; }
}
</style>
