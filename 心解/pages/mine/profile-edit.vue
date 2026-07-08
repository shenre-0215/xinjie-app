<template>
  <view class="page-container">
    <view class="header">
      <view class="back-btn pressable" @click="goBack">
        <text class="back-icon">‹</text>
      </view>
      <text class="header-title">编辑资料</text>
      <view class="save-btn pressable" @click="saveProfile">
        <text class="save-text">保存</text>
      </view>
    </view>

    <view class="form-section">
      <!-- Avatar -->
      <view class="form-item" @click="changeAvatar">
        <text class="form-label">头像</text>
        <view class="avatar-preview">
          <image class="avatar-img" :src="avatar" mode="aspectFill" />
          <text class="avatar-change">›</text>
        </view>
      </view>

      <!-- Nickname -->
      <view class="form-item">
        <text class="form-label">昵称</text>
        <input
          class="form-input"
          v-model="nickname"
          placeholder="你的名字"
          maxlength="20"
        />
      </view>

      <!-- Identity tag -->
      <view class="form-item">
        <text class="form-label">身份标签</text>
        <view class="tag-options">
          <text
            v-for="tag in identityOptions"
            :key="tag"
            class="tag-option pressable"
            :class="{ 'tag-selected': identityTag === tag }"
            @click="identityTag = tag"
          >{{ tag }}</text>
        </view>
      </view>

      <!-- Bio -->
      <view class="form-item">
        <text class="form-label">简介</text>
        <textarea
          class="form-textarea"
          v-model="bio"
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

const nickname = ref(appState.user.nickname)
const identityTag = ref(appState.user.identityTag)
const avatar = ref(appState.user.avatar)
const bio = ref('')

const identityOptions = ['织网者', '探索者', '治愈者', '观察者', '守护者']

function goBack() { uni.navigateBack({ delta: 1 }) }

function changeAvatar() {
  uni.chooseImage({
    count: 1,
    success: (res) => {
      avatar.value = res.tempFilePaths[0]
    }
  })
}

function saveProfile() {
  updateProfile({
    nickname: nickname.value.trim() || appState.user.nickname,
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

.back-btn { width: 80rpx; height: 80rpx; display: flex; align-items: center; justify-content: center; }
.back-icon { font-size: 48rpx; color: $color-primary; font-weight: 300; }
.header-title { font-size: $fs-headline-sm; font-weight: 600; color: $color-primary; }

.save-btn {
  padding: 12rpx 40rpx;
  border-radius: $radius-full;
  background-color: rgba($color-primary-container, 0.2);
}
.save-text { font-size: $fs-label-md; color: $color-primary; font-weight: 600; }

.form-section { padding: 0 $sp-page-margin; }

.form-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 40rpx 0;
  border-bottom: 2rpx solid $color-surface-container;
  flex-wrap: wrap;
}

.form-label {
  font-size: $fs-body-lg;
  color: $color-on-surface;
  width: 160rpx;
}

.avatar-preview {
  display: flex;
  align-items: center;
  gap: 24rpx;
}

.avatar-img {
  width: 128rpx;
  height: 128rpx;
  border-radius: $radius-full;
}

.avatar-change {
  font-size: 48rpx;
  color: rgba($color-on-surface-variant, 0.4);
}

.form-input {
  flex: 1;
  text-align: right;
  font-size: $fs-body-lg;
  color: $color-on-surface;
}

.tag-options {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
  flex: 1;
  justify-content: flex-end;
}

.tag-option {
  padding: 12rpx 24rpx;
  border-radius: $radius-full;
  font-size: $fs-label-md;
  background-color: $color-surface-container-low;
  color: $color-on-surface-variant;
}

.tag-selected {
  background-color: $color-primary;
  color: $color-on-primary;
}

.form-textarea {
  flex: 1;
  text-align: right;
  font-size: $fs-body-md;
  color: $color-on-surface;
  min-height: 80rpx;
  padding: 16rpx 0;
}
</style>
