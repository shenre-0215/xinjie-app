<template>
  <view class="page-container">
    <!-- #ifdef H5 -->
    <view class="h5-safe-top" />
    <!-- #endif -->
    <!-- Header -->
    <view class="header">
      <view class="header-left">
        <text class="header-icon">☆</text>
        <text class="header-title">织光</text>
      </view>
    </view>

    <!-- Tabs: 全部 / 我的 -->
    <view class="main-tabs">
      <view
        v-for="t in mainTabs"
        :key="t.key"
        class="main-tab pressable"
        :class="{ 'main-tab-active': currentMainTab === t.key }"
        @click="switchMainTab(t.key)"
      >
        <text class="main-tab-text">{{ t.label }}</text>
        <view v-if="currentMainTab === t.key" class="main-tab-line" />
      </view>
      <view class="header-actions">
        <view class="icon-btn pressable" @click="openMenu">
          <text class="icon-menu">☰</text>
        </view>
      </view>
    </view>

    <!-- Sub-tabs under 我的 -->
    <view v-if="currentMainTab === 'mine'" class="sub-tabs">
      <text
        v-for="st in subTabs"
        :key="st.key"
        class="sub-tab pressable"
        :class="{ 'sub-tab-active': currentSubTab === st.key }"
        @click="currentSubTab = st.key"
      >{{ st.label }}</text>
    </view>

    <!-- Post feed -->
    <scroll-view scroll-y class="feed-scroll">
      <view class="feed-list">
        <view
          v-for="post in displayPosts"
          :key="post.id"
          class="post-card card pressable-subtle"
          @click="goDetail(post.id)"
        >
          <!-- Header -->
          <view class="post-header">
            <view class="post-author">
              <text class="author-name">{{ post.anonymous ? '匿名织者' : post.author }}</text>
              <text class="post-time">{{ post.time }}</text>
            </view>
            <!-- More button (only in "我发过的") -->
            <view
              v-if="currentMainTab === 'mine' && currentSubTab === 'shares'"
              class="more-btn pressable"
              @click.stop="confirmDelete(post)"
            >
              <text class="more-icon">⋯</text>
            </view>
          </view>

          <!-- Image (if any) -->
          <view v-if="post.image" class="post-image">
            <image :src="post.image" mode="aspectFill" class="post-img" />
          </view>

          <!-- Content -->
          <text class="post-content">{{ post.content }}</text>

          <!-- Tags & resonance -->
          <view class="post-footer">
            <view class="post-tags">
              <text v-for="tag in post.tags" :key="tag" class="post-tag">{{ tag }}</text>
            </view>
            <view class="resonance-btn pressable" @click.stop="toggleResonance(post)">
              <text class="resonance-icon" :class="{ resonated: post.resonated }">{{ post.resonated ? '♥' : '♡' }}</text>
              <text class="resonance-text" :class="{ 'r-text-active': post.resonated }">{{ post.resonatedCount || 0 }}</text>
            </view>
          </view>
        </view>
      </view>

      <EmptyState
        v-if="!displayPosts.length && currentMainTab !== 'mine'"
        emoji="❋"
        text="这里还没有分享"
        hint="第一个点亮织光的人，会是你吗？"
      />
      <EmptyState
        v-if="!displayPosts.length && currentMainTab === 'mine' && currentSubTab === 'shares'"
        emoji="✎"
        text="还没有发过分享"
        hint="把你想通的事情分享出去，让这束光照亮别人"
      />
      <EmptyState
        v-if="!displayPosts.length && currentMainTab === 'mine' && currentSubTab === 'liked'"
        emoji="♡"
        text="还没有赞过的分享"
        hint="看到触动你的光，点下那颗心"
      />
      <view style="height: 200rpx;" />
    </scroll-view>

    <!-- FAB -->
    <view class="fab pressable" @click="goPublish">
      <text class="fab-icon">✎</text>
    </view>

    <TabBar current="zhiguang" @change="onTabChange" />
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { zhiguangState, toggleResonance, getFavorites, deletePost } from '../../store/useZhiguangStore.js'
import { switchTab } from '../../store/useAppStore.js'
import TabBar from '../../components/TabBar.vue'
import EmptyState from '../../components/EmptyState.vue'

const currentMainTab = ref('all')
const currentSubTab = ref('shares')

const mainTabs = [
  { key: 'all', label: '全部' },
  { key: 'mine', label: '我的' }
]

const subTabs = [
  { key: 'shares', label: '我发过的' },
  { key: 'liked', label: '我赞过的' }
]

const displayPosts = computed(() => {
  if (currentMainTab.value === 'all') return zhiguangState.posts
  if (currentSubTab.value === 'shares') return zhiguangState.myShares
  return getFavorites()
})

function switchMainTab(key) {
  currentMainTab.value = key
}

function openMenu() {
  uni.showActionSheet({
    itemList: ['发布新光', '我的收藏'],
    success: (res) => {
      if (res.tapIndex === 0) goPublish()
      else if (res.tapIndex === 1) {
        currentMainTab.value = 'mine'
        currentSubTab.value = 'liked'
      }
    }
  })
}

function goDetail(id) {
  uni.navigateTo({ url: '/pages/zhiguang/detail?id=' + id })
}

function goPublish() {
  uni.navigateTo({ url: '/pages/zhiguang/publish' })
}

function confirmDelete(post) {
  uni.showModal({
    title: '删除这条分享？',
    content: '删除后不可恢复',
    confirmText: '删除',
    confirmColor: '#b44',
    success: (res) => {
      if (res.confirm) {
        const ok = deletePost(post.id)
        if (ok) {
          uni.showToast({ title: '已删除', icon: 'none' })
        }
      }
    }
  })
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
  @include fade-in;
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
  padding: 0 32rpx; padding-right: 200rpx;
  padding-top: constant(safe-area-inset-top);
  padding-top: env(safe-area-inset-top);
  padding-bottom: 16rpx;
  background-color: $color-background;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.header-icon {
  font-size: 40rpx;
  color: $color-primary;
}

.header-title {
  font-family: $font-headline;
  font-size: $fs-headline-md;
  font-weight: 600;
  color: $color-primary;
}

.main-tabs {
  display: flex; align-items: center; gap: 40rpx;
  padding: 0 $sp-page-margin; margin-bottom: 16rpx;
}
.main-tab { display: flex; flex-direction: column; align-items: center; flex-shrink: 0; }
.main-tab-text { font-size: $fs-headline-sm; font-weight: 600; color: $color-on-surface-variant; padding: 8rpx 0; }
.main-tab-active .main-tab-text { color: $color-primary; }
.main-tab-line { width: 36rpx; height: 6rpx; background-color: $color-primary; border-radius: 3rpx; }
.header-actions { margin-left: auto; display: flex; align-items: center; }
.icon-btn { width: 64rpx; height: 64rpx; display: flex; align-items: center; justify-content: center; }
.icon-menu { font-size: 40rpx; color: $color-on-surface-variant; }

.sub-tabs { display: flex; gap: 20rpx; padding: 0 $sp-page-margin; margin-bottom: 28rpx; }
.sub-tab { font-size: $fs-label-md; color: rgba($color-on-surface-variant, 0.55); padding: 8rpx 0; }
.sub-tab-active { color: $color-primary; font-weight: 600; }

.feed-scroll {
  height: 100vh;
  padding-bottom: 180rpx;
  box-sizing: border-box;
}

.feed-list {
  padding: 0 $sp-page-margin;
  display: flex;
  flex-direction: column;
  gap: $sp-module-gap;
}

.post-card {
  padding: 48rpx;
  overflow: hidden;
  animation: cardIn 0.4s ease-out both;
}

.post-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 32rpx;
}

.author-name {
  display: block;
  font-size: $fs-label-md;
  font-weight: 600;
  color: $color-primary;
}

.post-time {
  font-size: 22rpx;
  color: rgba($color-on-surface-variant, 0.6);
}

.more-btn {
  width: 56rpx;
  height: 56rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.more-icon {
  font-size: 36rpx;
  color: rgba($color-on-surface-variant, 0.35);
  font-weight: 300;
  letter-spacing: 2rpx;
}

.post-image {
  width: 100%;
  height: 384rpx;
  border-radius: $radius-default;
  overflow: hidden;
  margin-bottom: 32rpx;
}

.post-img {
  width: 100%;
  height: 100%;
}

.post-content {
  display: block;
  font-size: $fs-body-lg;
  line-height: 1.6;
  color: $color-on-surface-variant;
  margin-bottom: 48rpx;
}

.post-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.post-tags {
  display: flex;
  gap: 16rpx;
}

.post-tag {
  font-size: 22rpx;
  padding: 8rpx 24rpx;
  border-radius: $radius-full;
  background-color: rgba($color-secondary-fixed, 0.3);
  color: $color-on-secondary-fixed-variant;
}

.resonance-btn {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 8rpx 16rpx;
}

.resonance-icon {
  font-size: 44rpx;
  color: rgba($color-on-surface-variant, 0.4);
  transition: all 0.3s ease;
}

.resonance-icon.resonated {
  color: $color-error;
  transform: scale(1.1);
}

.resonance-text { font-size: $fs-label-md; color: rgba($color-on-surface-variant, 0.4); }
.r-text-active { color: $color-error; }

.fab {
  position: fixed;
  right: 48rpx;
  bottom: 260rpx;
  width: 112rpx;
  height: 112rpx;
  border-radius: $radius-full;
  background-color: $color-primary;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 28rpx rgba(61, 103, 81, 0.3);
  z-index: 50;
  @include bounce-active;
  animation: floatAnimation 3s ease-in-out infinite;

  &:active {
    transform: scale(0.9);
  }
}

.fab-icon {
  font-size: 56rpx;
  color: $color-on-primary;
}
</style>
