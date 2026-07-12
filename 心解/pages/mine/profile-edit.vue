<template>
  <view class="page-container">
    <!-- #ifdef H5 -->
    <view class="h5-safe-top" />
    <!-- #endif -->

    <view class="header">
      <view class="back-btn pressable" @click="goBack">
        <text class="back-icon">‹</text>
      </view>
      <text class="header-title">编辑资料</text>
      <view class="save-btn pressable" @click="doSave">
        <text class="save-text">保存</text>
      </view>
    </view>

    <view class="form-section">
      <!-- 头像 -->
      <view class="form-item" @click="pickAvatar">
        <text class="form-label">头像</text>
        <view class="avatar-preview">
          <image class="avatar-img" :src="avatar" mode="aspectFill" />
          <text class="avatar-change">›</text>
        </view>
      </view>

      <!-- 昵称 -->
      <view class="form-item">
        <text class="form-label">昵称</text>
        <input
          v-model="nicknameVal"
          class="form-input"
          placeholder="你的名字"
          maxlength="20"
        />
      </view>

      <!-- 身份标签 -->
      <view class="form-item">
        <text class="form-label">身份标签</text>
        <view class="tag-options">
          <text
            v-for="tag in identityTags"
            :key="tag"
            class="tag-option pressable"
            :class="{ 'tag-selected': identityTag === tag }"
            @click="identityTag = tag"
          >{{ tag }}</text>
        </view>
      </view>

      <!-- 简介 -->
      <view class="form-item">
        <text class="form-label">简介</text>
        <textarea
          v-model="bio"
          class="form-textarea"
          placeholder="写一句关于自己的话..."
          maxlength="100"
        />
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { appState, updateProfile } from '../../store/useAppStore.js'

const nicknameVal = ref(appState.user.nickname)
const identityTag = ref(appState.user.identityTag || '织网者')
const avatar = ref(appState.user.avatar)

const identityTags = ['织网者', '探索者', '治愈者', '观察者', '守护者']
const bio = ref('')

function goBack() {
  uni.navigateBack({ delta: 1 })
}

function pickAvatar() {
  uni.chooseImage({
    count: 1,
    success: (res) => {
      avatar.value = res.tempFilePaths[0]
    }
  })
}

function doSave() {
  updateProfile({
    nickname: nicknameVal.value.trim() || appState.user.nickname,
    identityTag: identityTag.value
  })
  uni.showToast({ title: '已保存', icon: 'success' })
  setTimeout(() => uni.navigateBack({ delta: 1 }), 600)
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';
@import '@/styles/mixins.scss';

.page-container {
  min-height: 100vh;
  background-color: $color-background;
  padding-bottom: 160rpx;
  padding-top: calc(env(safe-area-inset-top) + 88rpx);
}

.header {
  position: fixed; top: 0; left: 0; right: 0; z-index: 100;
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 32rpx;
  padding-top: constant(safe-area-inset-top);
  padding-top: env(safe-area-inset-top);
  padding-bottom: 16rpx;
  background-color: $color-background;
}

.back-btn {
  width: 80rpx; height: 80rpx;
  display: flex; align-items: center; justify-content: center;
}
.back-icon { font-size: 48rpx; color: $color-primary; font-weight: 300; }
.header-title { font-size: $fs-headline-md; font-weight: 600; color: $color-primary; }

.save-btn {
  padding: 12rpx 40rpx; border-radius: $radius-full;
  background-color: rgba($color-primary-container, 0.2);
}
.save-text { font-size: $fs-body-sm; color: $color-primary; font-weight: 600; }

.form-section { padding: 0 $sp-page-margin; }

.form-item {
  display: flex; align-items: center; justify-content: space-between;
  padding: 40rpx 0; border-bottom: 2rpx solid rgba($color-on-surface, 0.06);
  flex-wrap: wrap;
}
.form-label { font-size: $fs-body-lg; color: $color-on-surface; width: 160rpx; }

.avatar-preview { display: flex; align-items: center; gap: 24rpx; }
.avatar-img { width: 128rpx; height: 128rpx; border-radius: $radius-full; }
.avatar-change { font-size: 48rpx; color: rgba($color-on-surface-variant, 0.4); }

.form-input {
  flex: 1; text-align: right;
  font-size: $fs-body-lg; color: $color-on-surface;
}

.tag-options {
  display: flex; flex-wrap: wrap; gap: 16rpx; flex: 1; justify-content: flex-end;
}
.tag-option {
  padding: 12rpx 24rpx; border-radius: $radius-full; font-size: $fs-body-sm;
  background-color: rgba($color-on-surface, 0.04); color: $color-on-surface-variant;
}
.tag-selected { background-color: $color-primary; color: $color-on-primary; }

.form-textarea {
  flex: 1; text-align: right; font-size: $fs-body-md; color: $color-on-surface;
  min-height: 80rpx; padding: 16rpx 0;
}

.pressable:active { opacity: 0.7; }
</style>
