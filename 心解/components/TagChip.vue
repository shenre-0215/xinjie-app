<template>
  <view
    class="tag-chip"
    :class="[`tag-${variant}`, { 'tag-active': active }]"
    @click="$emit('click')"
  >
    <text v-if="showDot" class="tag-dot">·</text>
    <text class="tag-text">{{ label }}</text>
  </view>
</template>

<script setup>
defineProps({
  label: { type: String, default: '' },
  variant: {
    type: String,
    default: 'default', // default | primary | secondary | tertiary | outline
    validator: (v) => ['default', 'primary', 'secondary', 'tertiary', 'outline'].includes(v)
  },
  active: { type: Boolean, default: false },
  showDot: { type: Boolean, default: false }
})

defineEmits(['click'])
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.tag-chip {
  display: inline-flex;
  align-items: center;
  padding: 8rpx 24rpx;
  border-radius: $radius-full;
  transition: all $transition-press;

  &:active {
    transform: scale(0.95);
  }
}

.tag-text {
  font-size: $fs-label-sm;
  line-height: $lh-label-sm;
}

.tag-dot {
  margin-right: 4rpx;
  font-weight: bold;
}

.tag-default {
  background-color: rgba($color-secondary-container, 0.3);
  color: $color-on-secondary-container;
}

.tag-primary {
  background-color: rgba($color-primary-container, 0.2);
  color: $color-on-primary-container;
}

.tag-secondary {
  background-color: rgba($color-secondary-container, 0.3);
  color: $color-on-secondary-container;
}

.tag-tertiary {
  background-color: rgba($color-tertiary-container, 0.2);
  color: $color-on-tertiary-container;
}

.tag-outline {
  background-color: transparent;
  border: 2rpx solid $color-outline-variant;
  color: $color-outline;
}

.tag-active {
  &.tag-primary {
    background-color: $color-primary;
    color: $color-on-primary;
  }
}
</style>
