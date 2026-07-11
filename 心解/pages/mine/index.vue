<template>
  <view class="page-container">
    <!-- #ifdef H5 -->
    <view class="h5-safe-top" />
    <!-- #endif -->
    <!-- Header -->
    <view class="header">
      <view class="header-left">
        <text class="header-icon">◈</text>
        <text class="header-title">我的</text>
      </view>
      <view class="menu-btn pressable" @click="showMenu">
        <text class="menu-icon">☰</text>
      </view>
    </view>

    <scroll-view scroll-y class="scroll-area">
      <!-- Profile -->
      <view class="profile-section">
      <view class="profile-decor" />
      <!-- Logged in -->
      <view v-if="authState.isLoggedIn" class="profile-inner" @click="goPage('profile-edit')">
        <view class="avatar-wrap">
          <image class="avatar-img" :src="appState.user.avatar" mode="aspectFill" />
        </view>
        <text class="profile-name">{{ appState.user.nickname }}</text>
        <view class="identity-tag">
          <text class="identity-text">{{ appState.user.identityTag }}</text>
        </view>
      </view>
      <!-- Not logged in -->
      <view v-else class="profile-inner" @click="goLogin">
        <view class="avatar-wrap avatar-dim">
          <text class="avatar-placeholder">◎</text>
        </view>
        <text class="profile-name profile-name-dim">点击登录</text>
        <view class="identity-tag identity-tag-dim">
          <text class="identity-text-dim">未登录</text>
        </view>
      </view>
    </view>

    <!-- Stats — live from stores -->
    <view class="stats-section">
      <view class="stats-grid">
        <view class="stat-card">
          <text class="stat-number">{{ statClosed }}</text>
          <text class="stat-label">已闭合链</text>
        </view>
        <view class="stat-card">
          <text class="stat-number">{{ statNodes }}</text>
          <text class="stat-label">心网节点</text>
        </view>
        <view class="stat-card">
          <text class="stat-number">{{ statWorldview }}</text>
          <text class="stat-label">三观条目</text>
        </view>
      </view>
    </view>

    <!-- Menu -->
    <view class="menu-section">
      <view class="menu-card card">
        <view class="menu-item pressable-subtle" @click="goPage('growth')">
          <view class="menu-icon-wrap menu-icon-primary">
            <text class="menu-icon-text">📖</text>
          </view>
          <text class="menu-label">成长档案</text>
          <text class="menu-arrow">›</text>
        </view>
        <view class="menu-item pressable-subtle" @click="goPage('worldview')">
          <view class="menu-icon-wrap menu-icon-tertiary">
            <text class="menu-icon-text">◎</text>
          </view>
          <text class="menu-label">内心世界</text>
          <text class="menu-arrow">›</text>
        </view>
        <view class="menu-item pressable-subtle" @click="goFavorites">
          <view class="menu-icon-wrap menu-icon-secondary">
            <text class="menu-icon-text">♡</text>
          </view>
          <text class="menu-label">我的收藏</text>
          <text class="menu-arrow">›</text>
        </view>
        <view class="menu-item pressable-subtle" @click="goPage('settings')">
          <view class="menu-icon-wrap menu-icon-gray">
            <text class="menu-icon-text">⚙</text>
          </view>
          <text class="menu-label">系统设置</text>
          <text class="menu-arrow">›</text>
        </view>
        <view class="menu-item pressable-subtle" @click="goPage('feedback')">
          <view class="menu-icon-wrap menu-icon-gray">
            <text class="menu-icon-text">✉</text>
          </view>
          <text class="menu-label">意见反馈</text>
          <text class="menu-arrow">›</text>
        </view>
        <view class="menu-item pressable-subtle" @click="goPage('about')">
          <view class="menu-icon-wrap menu-icon-gray">
            <text class="menu-icon-text">◎</text>
          </view>
          <text class="menu-label">关于心解</text>
          <text class="menu-arrow">›</text>
        </view>
      </view>
    </view>
    </scroll-view>

    <TabBar current="mine" @change="onTabChange" />
  </view>
</template>

<script setup>
import { computed } from 'vue'
import { appState } from '../../store/useAppStore.js'
import { switchTab } from '../../store/useAppStore.js'
import { zhijiState } from '../../store/useZhijiStore.js'
import { xinwangState } from '../../store/useXinwangStore.js'
import { authState } from '../../store/useAuthStore.js'
import TabBar from '../../components/TabBar.vue'

const statClosed = computed(() =>
  zhijiState.records.filter(r => r.status === 'closed').length
)
const statNodes = computed(() => xinwangState.nodes.length)
const statWorldview = computed(() =>
  xinwangState.worldview.shixiang.length +
  xinwangState.worldview.woxing.length +
  xinwangState.worldview.xincheng.length
)

function showMenu() {
  uni.showActionSheet({
    itemList: ['系统设置', '反馈与帮助', '关于心解'],
    success: (res) => {
      uni.showToast({ title: '功能开发中', icon: 'none' })
    }
  })
}

function goLogin() {
  uni.showToast({ title: '功能开发中', icon: 'none' })
}

function goPage(page) {
  uni.showToast({ title: '功能开发中', icon: 'none' })
}

function goFavorites() {
  uni.showToast({ title: '功能开发中', icon: 'none' })
}

function onTabChange(tab) {
  switchTab(tab)
  const routes = {
    zhiji: '/pages/zhiji/index',
    xinbao: '/pages/xinbao/index',
    xinwang: '/pages/xinwang/index',
    zhiguang: '/pages/zhiguang/index',
    mine: '/pages/mine/index'
  }
  uni.switchTab({ url: routes[tab] })
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';
@import '@/styles/mixins.scss';

.page-container {
  @include page-container;
  padding-top: calc(env(safe-area-inset-top) + 88rpx);
  animation: page-fade-in 0.4s ease-out;
}

.header {
  position: fixed; top: 0; left: 0; right: 0; z-index: 100;
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 32rpx; padding-right: 200rpx;
  padding-top: constant(safe-area-inset-top);
  padding-top: env(safe-area-inset-top);
  padding-bottom: 16rpx; background-color: $color-background;
}

.header-left { display: flex; align-items: center; gap: 20rpx; }
.header-icon { font-size: 40rpx; color: $color-primary; }
.header-title { font-family: $font-headline; font-size: $fs-headline-md; font-weight: 600; color: $color-primary; }
.menu-icon { font-size: 48rpx; color: $color-primary; }

.profile-section { position: relative; padding: 48rpx $sp-page-margin $sp-module-gap; overflow: hidden; }
.profile-decor {
  position: absolute; top: -80rpx; right: -80rpx;
  width: 384rpx; height: 384rpx; border-radius: $radius-full;
  background-color: rgba($color-primary-container, 0.1); filter: blur(60rpx);
}
.profile-inner { position: relative; display: flex; flex-direction: column; align-items: center; }

.avatar-wrap {
  width: 192rpx; height: 192rpx; border-radius: $radius-full; padding: 8rpx;
  background-color: $color-surface-container-lowest; box-shadow: $shadow-healing; margin-bottom: 32rpx;
}
.avatar-img { width: 100%; height: 100%; border-radius: $radius-full; }
.avatar-dim { opacity: 0.5; }
.avatar-placeholder { font-size: 64rpx; color: $color-primary-container; }
.profile-name-dim { color: rgba($color-on-surface-variant, 0.5); }
.identity-tag-dim { background-color: $color-surface-container-highest; }
.identity-text-dim { font-size: $fs-label-md; font-weight: 600; color: rgba($color-on-surface-variant, 0.4); }

.profile-name { font-size: $fs-headline-md; font-weight: 600; color: $color-on-surface; margin-bottom: 16rpx; }
.identity-tag { padding: 8rpx 32rpx; border-radius: $radius-full; background-color: $color-primary-fixed; }
.identity-text { font-size: $fs-label-md; font-weight: 600; color: $color-on-primary-fixed-variant; }

.stats-section { padding: 0 16rpx; margin-bottom: $sp-module-gap; }
.stats-grid { display: flex; justify-content: space-between; width: 100%; gap: 8rpx; }
.stat-card { width: 33%; padding: 24rpx 4rpx; display: flex; flex-direction: column; align-items: center; justify-content: center; }
.stat-number { font-size: $fs-headline-md; font-weight: 600; color: $color-primary; margin-bottom: 8rpx; }
.stat-label { font-size: 20rpx; color: rgba($color-on-surface-variant, 0.7); white-space: nowrap; text-align: center; }

.menu-section { padding: 0 $sp-page-margin; margin-bottom: $sp-module-gap; }
.menu-card { overflow: hidden; }
.menu-item { display: flex; align-items: center; padding: 40rpx; gap: 32rpx; border-bottom: 2rpx solid rgba($color-surface-container, 0.5); }
.menu-item:last-child { border-bottom: none; }

.menu-icon-wrap { width: 80rpx; height: 80rpx; border-radius: $radius-full; display: flex; align-items: center; justify-content: center; }
.menu-icon-primary { background-color: rgba($color-primary-fixed, 0.3); }
.menu-icon-secondary { background-color: rgba($color-secondary-fixed, 0.3); }
.menu-icon-tertiary { background-color: rgba($color-tertiary-fixed, 0.3); }
.menu-icon-gray { background-color: $color-surface-container-highest; }
.menu-icon-text { font-size: 40rpx; }

.menu-label { flex: 1; font-size: $fs-body-lg; color: $color-on-surface; }
.menu-arrow { font-size: 48rpx; color: rgba($color-on-surface-variant, 0.4); }

@keyframes page-fade-in {
  0% { opacity: 0; transform: translateY(30rpx); }
  100% { opacity: 1; transform: translateY(0); }
}

.scroll-area {
  height: 100vh;
  padding-bottom: 180rpx;
  box-sizing: border-box;
}
</style>
