<template>
  <view v-if="visible" class="sheet-mask" @click="$emit('close')">
    <view class="sheet-panel" @click.stop>
      <view class="sheet-handle" />
      <text class="sheet-title">导入织记内容</text>
      <scroll-view class="sheet-list" scroll-y :show-scrollbar="false">
        <view
          v-for="record in records"
          :key="record.id"
          class="sheet-item pressable"
          @click="toggleSelect(record.id)"
        >
          <view class="sheet-checkbox" :class="{ checked: selectedIds.includes(record.id) }">
            <text v-if="selectedIds.includes(record.id)" class="check-mark">✓</text>
          </view>
          <text class="sheet-item-text">{{ truncate(record.content, 60) }}</text>
        </view>
      </scroll-view>
      <view class="sheet-confirm pressable" @click="confirm">
        <text class="confirm-text">确认导入 ({{ selectedIds.length }})</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  visible: { type: Boolean, default: false },
  records: { type: Array, default: () => [] }
})

const emit = defineEmits(['close', 'import'])

const selectedIds = ref([])

watch(() => props.visible, (v) => {
  if (!v) selectedIds.value = []
})

function truncate(text, max) {
  if (!text) return ''
  return text.length > max ? text.substring(0, max) + '...' : text
}

function toggleSelect(id) {
  const idx = selectedIds.value.indexOf(id)
  if (idx !== -1) {
    selectedIds.value.splice(idx, 1)
  } else {
    selectedIds.value.push(id)
  }
}

function confirm() {
  if (selectedIds.value.length) {
    emit('import', [...selectedIds.value])
  }
  emit('close')
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.sheet-mask {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.3);
  z-index: 300;
  display: flex;
  align-items: flex-end;
}

.sheet-panel {
  width: 100%;
  max-height: 60vh;
  background-color: $color-surface-container-lowest;
  border-radius: $radius-lg $radius-lg 0 0;
  padding: 32rpx $sp-page-margin 80rpx;
  display: flex;
  flex-direction: column;
}

.sheet-handle {
  width: 80rpx;
  height: 8rpx;
  background-color: $color-outline-variant;
  border-radius: $radius-full;
  margin: 0 auto 32rpx;
}

.sheet-title {
  font-size: $fs-headline-sm;
  font-weight: 600;
  color: $color-on-surface;
  margin-bottom: 32rpx;
}

.sheet-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  margin-bottom: 32rpx;
  max-height: 400rpx;
}

.sheet-item {
  display: flex;
  align-items: center;
  gap: 24rpx;
  padding: 24rpx;
  border-radius: $radius-default;
  background-color: $color-surface-container-low;
}

.sheet-checkbox {
  width: 40rpx;
  height: 40rpx;
  border: 3rpx solid $color-outline-variant;
  border-radius: 8rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.sheet-checkbox.checked {
  background-color: $color-primary;
  border-color: $color-primary;
}

.check-mark {
  font-size: 24rpx;
  color: $color-on-primary;
}

.sheet-item-text {
  flex: 1;
  font-size: $fs-body-md;
  color: $color-on-surface;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sheet-confirm {
  padding: 28rpx;
  background-color: $color-primary;
  border-radius: $radius-full;
  text-align: center;
}

.confirm-text {
  font-size: $fs-headline-sm;
  font-weight: 600;
  color: $color-on-primary;
}
</style>
