<template>
  <view class="page-container">
    <!-- #ifdef H5 -->
    <view class="h5-safe-top" />
    <!-- #endif -->

    <view class="header">
      <view class="back-btn pressable" @click="goBack">
        <text class="back-icon">‹</text>
      </view>
      <text class="header-title">我的收藏</text>
      <view style="width:80rpx" />
    </view>

    <view v-if="favPosts.length" class="feed-list">
      <view
        v-for="post in favPosts"
        :key="post.id"
        class="post-card card pressable-subtle"
        @click="goDetail(post.id)"
      >
        <view class="post-header">
          <text class="author-name">{{ post.anonymous ? '匿名织者' : post.author }}</text>
          <text class="post-time">{{ post.time }}</text>
        </view>
        <text class="post-content">{{ post.content }}</text>
        <view class="post-footer">
          <view class="post-tags">
            <text v-for="tag in post.tags" :key="tag" class="post-tag">{{ tag }}</text>
          </view>
          <view class="resonance-btn pressable" @click.stop="onResonance(post)">
            <text class="resonance-icon resonated">♥</text>
            <text class="resonance-text r-text-active">{{ post.resonatedCount || 0 }}</text>
          </view>
        </view>
      </view>
    </view>

    <EmptyState
      v-else
      emoji="♡"
      text="还没有收藏"
      hint="在织光里看到触动你的分享，点下那颗心，它就会出现在这里"
    />
  </view>
</template>

<script setup>
import { computed } from 'vue'
import { getFavorites, toggleResonance } from '../../store/useZhiguangStore.js'
import EmptyState from '../../components/EmptyState.vue'

const favPosts = computed(() => getFavorites())

function goBack() {
  uni.navigateBack({ delta: 1 })
}

function goDetail(id) {
  uni.navigateTo({ url: '/pages/zhiguang/detail?id=' + id })
}

function onResonance(post) {
  toggleResonance(post.id)
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

.back-btn { width: 80rpx; height: 80rpx; display: flex; align-items: center; justify-content: center; }
.back-icon { font-size: 48rpx; color: $color-primary; font-weight: 300; }
.header-title { font-size: $fs-headline-md; font-weight: 600; color: $color-primary; }

.feed-list {
  padding: 0 $sp-page-margin;
  display: flex; flex-direction: column; gap: 56rpx;
}

.post-card { padding: 48rpx; overflow: hidden; }

.post-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24rpx; }
.author-name { font-size: $fs-body-sm; font-weight: 600; color: $color-primary; }
.post-time { font-size: $fs-label-sm; color: rgba($color-on-surface-variant, 0.6); }

.post-content {
  display: block; font-size: $fs-body-lg; line-height: 1.6;
  color: $color-on-surface-variant; margin-bottom: 32rpx;
}

.post-footer { display: flex; justify-content: space-between; align-items: center; }

.post-tags { display: flex; gap: 16rpx; }
.post-tag {
  font-size: $fs-label-sm; padding: 8rpx 24rpx; border-radius: $radius-full;
  background-color: rgba($color-secondary-container, 0.3); color: $color-on-secondary-container;
}

.resonance-btn { display: flex; align-items: center; gap: 8rpx; padding: 8rpx 16rpx; }
.resonance-icon { font-size: 44rpx; }
.resonance-icon.resonated { color: #ba1a1a; }
.resonance-text { font-size: $fs-body-sm; color: rgba($color-on-surface-variant, 0.4); }
.r-text-active { color: #ba1a1a; }

.card {
  background-color: $color-surface-container-lowest;
  border-radius: $radius-md;
}

.pressable:active, .pressable-subtle:active { opacity: 0.7; }
</style>
