<template>
  <view class="page-container">
    <!-- #ifdef H5 -->
    <view class="h5-safe-top" />
    <!-- #endif -->

    <view class="header">
      <view class="back-btn pressable" @click="goBack">
        <text class="back-icon">‹</text>
      </view>
      <text class="header-title">{{ isRegister ? '注册' : '登录' }}</text>
      <view style="width:80rpx" />
    </view>

    <view class="content">
      <!-- Intro -->
      <view class="login-intro">
        <text class="intro-icon">◎</text>
        <text class="intro-text">登录后，你的数据会保存在云端</text>
      </view>

      <!-- Form -->
      <view class="form">
        <view class="input-wrap">
          <text class="input-label">邮箱</text>
          <input
            v-model="email"
            class="form-input"
            placeholder="用于登录和找回"
            maxlength="50"
          />
        </view>
        <view v-if="isRegister" class="input-wrap">
          <text class="input-label">昵称</text>
          <input
            v-model="nickname"
            class="form-input"
            placeholder="给自己取个名字"
            maxlength="20"
          />
        </view>
        <view class="input-wrap">
          <text class="input-label">密码</text>
          <input
            v-model="password"
            class="form-input"
            type="password"
            placeholder="至少 6 位"
            maxlength="30"
          />
        </view>

        <view class="submit-btn pressable" @click="doSubmit">
          <text class="submit-text">{{ isRegister ? '注册并登录' : '登录' }}</text>
        </view>

        <view class="switch-btn pressable" @click="isRegister = !isRegister">
          <text class="switch-text">{{ isRegister ? '已有账号？去登录' : '还没有账号？去注册' }}</text>
        </view>
      </view>

      <!-- Divider -->
      <view class="divider">
        <view class="divider-line" />
        <text class="divider-text">或</text>
        <view class="divider-line" />
      </view>

      <!-- WeChat -->
      <view class="wechat-btn pressable" @click="doWechatLogin">
        <text class="wechat-icon">💬</text>
        <text class="wechat-text">微信一键登录</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { register, login, wechatLogin } from '../../store/useAuthStore.js'

const isRegister = ref(true)
const email = ref('')
const nickname = ref('')
const password = ref('')

function goBack() {
  uni.navigateBack({ delta: 1 })
}

async function doSubmit() {
  if (!email.value.trim() || !email.value.includes('@')) {
    uni.showToast({ title: '请输入有效的邮箱', icon: 'none' })
    return
  }
  if (isRegister.value && !nickname.value.trim()) {
    uni.showToast({ title: '请给自己取个昵称', icon: 'none' })
    return
  }
  if (password.value.length < 6) {
    uni.showToast({ title: '密码至少 6 位', icon: 'none' })
    return
  }

  uni.showLoading({ title: '处理中...', mask: true })
  const result = isRegister.value
    ? await register(nickname.value.trim() || email.value.split('@')[0], email.value.trim(), password.value)
    : await login(email.value.trim(), password.value)
  uni.hideLoading()

  if (result.ok) {
    uni.showToast({ title: isRegister.value ? '注册成功' : '登录成功', icon: 'success' })
    setTimeout(() => uni.navigateBack({ delta: 1 }), 800)
  } else {
    uni.showToast({ title: result.msg || '操作失败', icon: 'none' })
  }
}

async function doWechatLogin() {
  uni.showLoading({ title: '拉起微信...' })
  const result = await wechatLogin()
  uni.hideLoading()
  if (result.ok) {
    uni.showToast({ title: '登录成功', icon: 'success' })
    setTimeout(() => uni.navigateBack({ delta: 1 }), 800)
  } else {
    uni.showToast({ title: result.msg || '微信登录暂不可用', icon: 'none' })
  }
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
.header-title {
  font-size: $fs-headline-md; font-weight: 600; color: $color-primary;
}

.content { padding: 0 $sp-page-margin; }

.login-intro {
  display: flex; flex-direction: column; align-items: center;
  padding: 60rpx 0 48rpx;
}
.intro-icon { font-size: 72rpx; color: $color-primary-container; margin-bottom: 20rpx; }
.intro-text { font-size: $fs-body-md; color: rgba($color-on-surface-variant, 0.6); }

.form { margin-bottom: 56rpx; }

.input-wrap { margin-bottom: 32rpx; }
.input-label {
  display: block; font-size: $fs-body-sm; color: rgba($color-on-surface-variant, 0.6);
  margin-bottom: 12rpx; padding-left: 8rpx;
}

.form-input {
  width: 100%; height: 96rpx; padding: 0 32rpx;
  font-size: $fs-body-lg; color: $color-on-surface;
  background-color: $color-surface-container-lowest;
  border-radius: $radius-md;
  box-shadow: $shadow-healing;
  border: 2rpx solid transparent;
  box-sizing: border-box;
}

.submit-btn {
  padding: 28rpx; background-color: $color-primary;
  border-radius: $radius-full; text-align: center; margin-top: 40rpx;
}

.submit-text { font-size: $fs-headline-sm; font-weight: 600; color: $color-on-primary; }

.switch-btn { text-align: center; margin-top: 24rpx; padding: 16rpx; }
.switch-text { font-size: $fs-body-sm; color: $color-primary; }

.divider { display: flex; align-items: center; gap: 20rpx; margin-bottom: 40rpx; }
.divider-line { flex: 1; height: 2rpx; background-color: rgba($color-on-surface, 0.06); }
.divider-text { font-size: $fs-label-sm; color: rgba($color-on-surface-variant, 0.4); }

.wechat-btn {
  display: flex; align-items: center; justify-content: center; gap: 16rpx;
  padding: 28rpx;
  background-color: $color-surface-container-lowest;
  border-radius: $radius-md;
  box-shadow: $shadow-healing;
}
.wechat-icon { font-size: 36rpx; }
.wechat-text { font-size: $fs-body-lg; color: $color-on-surface; }

.pressable:active { opacity: 0.7; }
</style>
