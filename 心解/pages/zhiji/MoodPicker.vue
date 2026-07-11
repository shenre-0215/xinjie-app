<template>
  <view class="mood-picker">
    <view
      v-for="mood in moods"
      :key="mood.value"
      class="mood-item"
      :class="{ 'mood-selected': modelValue === mood.value, 'mood-bounce': bounceMood === mood.value }"
      @click="selectMood(mood)"
    >
      <view class="mood-circle" :style="{ backgroundColor: mood.bg }">
        <text class="mood-emoji">{{ mood.emoji }}</text>
        <view v-if="modelValue === mood.value" class="mood-glow" />
      </view>
      <text class="mood-label">{{ mood.label }}</text>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'

defineProps({ modelValue: { type: String, default: '' } })
const emit = defineEmits(['update:modelValue', 'change'])

const bounceMood = ref('')

const moods = [
  { value: 'very-happy', emoji: '☀️', bg: '#fceec7', label: '晴朗' },
  { value: 'happy',      emoji: '⛅', bg: 'rgba(168, 213, 186, 0.3)', label: '多云' },
  { value: 'neutral',    emoji: '☁️', bg: '#e8e8e5', label: '阴天' },
  { value: 'sad',        emoji: '🌧️', bg: 'rgba(224, 195, 207, 0.3)', label: '下雨' },
  { value: 'very-sad',   emoji: '⛈️', bg: 'rgba(255, 218, 214, 0.2)', label: '暴雨' }
]

function selectMood(mood) {
  const newVal = mood.value === props.modelValue ? '' : mood.value
  if (newVal) {
    bounceMood.value = newVal
    setTimeout(() => { bounceMood.value = '' }, 400)
  }
  emit('update:modelValue', newVal)
  emit('change', { value: newVal, mood: moods.find(m => m.value === newVal) })
}
</script>

<style lang="scss" scoped>
.mood-picker { display: flex; gap: 12rpx; justify-content: center; }
.mood-item { display: flex; flex-direction: column; align-items: center; gap: 4rpx; }
.mood-circle {
  width: 96rpx; height: 96rpx; border-radius: 9999rpx;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.4s cubic-bezier(0.34,1.56,0.64,1);
  opacity: 0.55; box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.06);
  position: relative; overflow: hidden;
  &:active { transform: scale(0.9); }
}
.mood-emoji { font-size: 48rpx; transition: transform 0.4s cubic-bezier(0.34,1.56,0.64,1); position: relative; z-index: 2; }
.mood-glow {
  position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%);
  width: 100%; height: 100%; border-radius: 9999rpx;
  background: radial-gradient(circle, rgba(168,213,186,0.4) 0%, transparent 70%);
  animation: glow-pulse 2s ease-in-out infinite;
}
@keyframes glow-pulse { 0%,100% { opacity: 0.4; transform: translate(-50%,-50%) scale(1); } 50% { opacity: 0.6; transform: translate(-50%,-50%) scale(1.1); } }
.mood-label { font-size: 22rpx; color: rgba(65,73,67,0.5); transition: all 0.2s ease; }
.mood-selected .mood-circle { opacity: 1; transform: scale(1.1); box-shadow: 0 4rpx 12rpx rgba(168,213,186,0.2); }
.mood-selected .mood-emoji { transform: scale(1.2); }
.mood-selected .mood-label { color: #3d6751; font-weight: 600; }
.mood-bounce .mood-circle { animation: mood-bounce 0.4s cubic-bezier(0.34,1.56,0.64,1); }
.mood-bounce .mood-emoji { animation: emoji-bounce 0.4s cubic-bezier(0.34,1.56,0.64,1); }
@keyframes mood-bounce { 0% { transform: scale(0.7); } 50% { transform: scale(1.25); } 100% { transform: scale(1.1); } }
@keyframes emoji-bounce { 0% { transform: scale(0.8); } 50% { transform: scale(1.4); } 100% { transform: scale(1.2); } }
</style>
