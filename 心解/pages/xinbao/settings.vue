<template>
  <view class="page-container">
    <view class="header">
      <view class="back-btn pressable" @click="goBack">
        <text class="back-icon">‹</text>
      </view>
      <text class="header-title">心宝设置</text>
      <view style="width: 80rpx;" />
    </view>

    <view class="settings-list">
      <!-- Positioning hint -->
      <view class="positioning-hint">
        <text class="hint-text">心宝是帮你剖析困惑的工具，不是一个陪你聊天的角色。</text>
      </view>

      <view class="setting-group">
        <text class="group-title">分析偏好</text>
        <view class="setting-item">
          <view class="setting-info">
            <text class="setting-label">分析深度</text>
            <text class="setting-desc">{{ depthLabel }}</text>
          </view>
          <view class="style-options">
            <text
              v-for="s in depthOptions"
              :key="s.value"
              class="style-option pressable"
              :class="{ 'style-active': xinbaoState.settings.depth === s.value }"
              @click="updateSetting('depth', s.value)"
            >{{ s.label }}</text>
          </view>
        </view>

        <view class="setting-item">
          <view class="setting-info">
            <text class="setting-label">悬置倾向</text>
            <text class="setting-desc">{{ suspendBiasLabel }}</text>
          </view>
          <view class="style-options">
            <text
              v-for="s in biasOptions"
              :key="s.value"
              class="style-option pressable"
              :class="{ 'style-active': xinbaoState.settings.suspendBias === s.value }"
              @click="updateSetting('suspendBias', s.value)"
            >{{ s.label }}</text>
          </view>
        </view>
      </view>

      <view class="setting-group">
        <text class="group-title">通用</text>
        <view class="setting-item pressable" @click="toggleSetting('voiceEnabled')">
          <view class="setting-info">
            <text class="setting-label">语音朗读</text>
            <text class="setting-desc">心宝会读出她的回复</text>
          </view>
          <view class="toggle" :class="{ 'toggle-on': xinbaoState.settings.voiceEnabled }">
            <view class="toggle-knob" />
          </view>
        </view>
      </view>

      <view class="setting-group">
        <text class="group-title">数据</text>
        <view class="setting-item pressable" @click="clearHistory">
          <view class="setting-info">
            <text class="setting-label">清空对话记录</text>
            <text class="setting-desc">所有历史对话将被永久删除</text>
          </view>
          <text class="setting-arrow">›</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed } from 'vue'
import { xinbaoState, updateXinbaoSettings, clearAllHistory } from '../../store/useXinbaoStore.js'

const depthOptions = [
  { value: 'brief', label: '简要' },
  { value: 'standard', label: '标准' },
  { value: 'deep', label: '深入' }
]

const biasOptions = [
  { value: 'cautious', label: '偏保守' },
  { value: 'balanced', label: '均衡' },
  { value: 'aggressive', label: '偏激进' }
]

const depthLabel = computed(() => {
  const map = { brief: '快速定位主要矛盾', standard: '追问到矛盾清晰', deep: '追问至死角才罢休' }
  return map[xinbaoState.settings.depth] || ''
})

const suspendBiasLabel = computed(() => {
  const map = { cautious: '多聊几轮再议', balanced: '适时建议悬置', aggressive: '发现重复就停' }
  return map[xinbaoState.settings.suspendBias] || ''
})

function goBack() {
  uni.navigateBack({ delta: 1 })
}

function updateSetting(key, value) {
  updateXinbaoSettings(key, value)
}

function toggleSetting(key) {
  updateXinbaoSettings(key, !xinbaoState.settings[key])
}

function clearHistory() {
  uni.showModal({
    title: '确认清空？',
    content: '所有对话记录将被永久删除，无法恢复。',
    success: (res) => {
      if (res.confirm) {
        clearAllHistory()
        uni.showToast({ title: '已清空', icon: 'success' })
      }
    }
  })
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';
@import '@/styles/mixins.scss';

.page-container {
  @include page-container;
  padding-top: calc(env(safe-area-inset-top) + 88rpx);
}

.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 $sp-page-margin;
  padding-top: constant(safe-area-inset-top);
  padding-top: env(safe-area-inset-top); padding-bottom: 16rpx;
  background-color: $color-background;
}

.back-btn {
  width: 80rpx;
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.back-icon {
  font-size: 48rpx;
  color: $color-primary;
  font-weight: 300;
}

.header-title {
  font-size: $fs-headline-sm;
  font-weight: 600;
  color: $color-primary;
}

.settings-list {
  padding: 0 $sp-page-margin;
}

.positioning-hint {
  padding: 32rpx 40rpx;
  margin-bottom: $sp-module-gap;
  background-color: rgba($color-primary-container, 0.15);
  border-radius: $radius-default;
  border-left: 6rpx solid $color-primary-container;
}

.hint-text {
  font-size: $fs-label-md;
  color: $color-on-primary-container;
  line-height: 1.6;
}

.setting-group {
  margin-bottom: $sp-module-gap;
}

.group-title {
  display: block;
  font-size: $fs-label-sm;
  color: rgba($color-on-surface-variant, 0.5);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-bottom: 24rpx;
  padding-left: 16rpx;
}

.setting-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 40rpx 32rpx;
  background-color: $color-surface-container-lowest;
  border-radius: $radius-default;
  box-shadow: $shadow-healing;
  margin-bottom: 16rpx;
}

.setting-info { flex: 1; }

.setting-label {
  display: block;
  font-size: $fs-body-lg;
  color: $color-on-surface;
  margin-bottom: 8rpx;
}

.setting-desc {
  display: block;
  font-size: $fs-label-md;
  color: rgba($color-on-surface-variant, 0.6);
}

.style-options {
  display: flex;
  gap: 12rpx;
}

.style-option {
  padding: 12rpx 24rpx;
  border-radius: $radius-full;
  font-size: $fs-label-sm;
  color: $color-on-surface-variant;
  background-color: $color-surface-container-low;
}

.style-active {
  background-color: $color-primary-container;
  color: $color-on-primary-container;
  font-weight: 600;
}

.toggle {
  width: 96rpx;
  height: 56rpx;
  border-radius: 28rpx;
  background-color: $color-surface-container-highest;
  position: relative;
  transition: background-color 0.2s ease;
  flex-shrink: 0;
}

.toggle-on {
  background-color: $color-primary;
}

.toggle-knob {
  width: 44rpx;
  height: 44rpx;
  border-radius: $radius-full;
  background-color: $color-surface-container-lowest;
  position: absolute;
  top: 6rpx;
  left: 6rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease;
}

.toggle-on .toggle-knob {
  transform: translateX(40rpx);
}

.setting-arrow {
  font-size: 48rpx;
  color: rgba($color-on-surface-variant, 0.4);
}
</style>
