<template>
  <view class="page-container">
    <view class="header">
      <view class="back-btn pressable" @click="goBack">
        <text class="back-icon">‹</text>
      </view>
      <text class="header-title">设置</text>
      <view style="width: 80rpx;" />
    </view>

    <view class="settings-list">
      <!-- 账户 -->
      <view class="setting-group">
        <text class="group-title">账户</text>
        <view v-if="authState.isLoggedIn" class="setting-item pressable" @click="doLogout">
          <view class="setting-info">
            <text class="setting-label">退出登录</text>
            <text class="setting-desc">当前账号：{{ authState.nickname }}</text>
          </view>
          <text class="setting-arrow">›</text>
        </view>
        <view v-else class="setting-item pressable" @click="goLogin">
          <text class="setting-label">登录 / 注册</text>
          <text class="setting-arrow">›</text>
        </view>
      </view>

      <!-- 通用 -->
      <view class="setting-group">
        <text class="group-title">通用</text>
        <view class="setting-item pressable" @click="toggle('anonymousDefault')">
          <view class="setting-info">
            <text class="setting-label">默认匿名发布</text>
            <text class="setting-desc">在织光发布时默认匿名</text>
          </view>
          <view class="toggle" :class="{ 'toggle-on': appState.settings.anonymousDefault }">
            <view class="toggle-knob" />
          </view>
        </view>
        <view class="setting-item pressable" @click="clearCache">
          <text class="setting-label">清除缓存</text>
          <text class="setting-arrow">›</text>
        </view>
      </view>

      <!-- 关于 -->
      <view class="setting-group">
        <text class="group-title">关于</text>
        <view class="setting-item pressable" @click="goFeedback">
          <text class="setting-label">反馈与帮助</text>
          <text class="setting-arrow">›</text>
        </view>
        <view class="setting-item">
          <text class="setting-label">版本</text>
          <text class="setting-value">1.0.0</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { appState, updateSetting } from '../../store/useAppStore.js'
import { authState, logout } from '../../store/useAuthStore.js'

function goBack() { uni.navigateBack({ delta: 1 }) }

function toggle(key) {
  updateSetting(key, !appState.settings[key])
}

function doLogout() {
  uni.showModal({
    title: '退出登录？',
    content: '你的本地数据会保留，重新登录后恢复。',
    success: (res) => {
      if (res.confirm) {
        logout()
        uni.showToast({ title: '已退出', icon: 'success' })
      }
    }
  })
}

function goLogin() {
  uni.navigateTo({ url: '/pages/mine/login' })
}

function clearCache() {
  uni.showModal({
    title: '清除缓存？',
    content: '将清除所有本地存储数据，包括对话记录和织记内容。',
    success: (res) => {
      if (res.confirm) {
        uni.clearStorageSync()
        uni.showToast({ title: '已清除', icon: 'success' })
      }
    }
  })
}

function goFeedback() {
  uni.navigateTo({ url: '/pages/mine/feedback' })
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';
@import '@/styles/mixins.scss';

.page-container { @include page-container; padding-top: calc(env(safe-area-inset-top) + 88rpx); }

.header {
  position: fixed; top: 0; left: 0; right: 0; z-index: 100;
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 32rpx;
  padding-top: constant(safe-area-inset-top);
  padding-top: env(safe-area-inset-top);
  padding-bottom: 16rpx;
  background-color: $color-background;
}
.back-btn { width: 80rpx; height: 80rpx; display: flex; align-items: center; justify-content: center; }
.back-icon { font-size: 48rpx; color: $color-primary; font-weight: 300; }
.header-title { font-family: $font-headline; font-size: $fs-headline-sm; font-weight: 600; color: $color-primary; }

.settings-list { padding: 0 $sp-page-margin; }
.setting-group { margin-bottom: $sp-module-gap; }

.group-title {
  display: block; font-size: $fs-label-sm;
  color: rgba($color-on-surface-variant, 0.5);
  text-transform: uppercase; letter-spacing: 0.1em;
  margin-bottom: 24rpx; padding-left: 16rpx;
}

.setting-item {
  display: flex; align-items: center; justify-content: space-between;
  padding: 40rpx 32rpx; background-color: $color-surface-container-lowest;
  border-radius: $radius-default; box-shadow: $shadow-healing; margin-bottom: 16rpx;
}

.setting-info { flex: 1; }
.setting-label { display: block; font-size: $fs-body-lg; color: $color-on-surface; margin-bottom: 8rpx; }
.setting-desc { font-size: $fs-label-md; color: rgba($color-on-surface-variant, 0.6); }

.toggle {
  width: 96rpx; height: 56rpx; border-radius: 28rpx;
  background-color: $color-surface-container-highest;
  position: relative; transition: background-color 0.2s; flex-shrink: 0;
}
.toggle-on { background-color: $color-primary; }
.toggle-knob {
  width: 44rpx; height: 44rpx; border-radius: $radius-full;
  background-color: $color-surface-container-lowest;
  position: absolute; top: 6rpx; left: 6rpx;
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.1); transition: transform 0.2s;
}
.toggle-on .toggle-knob { transform: translateX(40rpx); }
.setting-arrow { font-size: 48rpx; color: rgba($color-on-surface-variant, 0.4); }
.setting-value { font-size: $fs-body-md; color: rgba($color-on-surface-variant, 0.6); }
</style>
