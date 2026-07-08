<template>
  <view class="page-container">
    <view class="header">
      <view class="back-btn pressable" @click="goBack">
        <text class="back-icon">‹</text>
      </view>
      <text class="header-title">我的收藏</text>
      <view style="width: 80rpx;" />
    </view>

    <view v-if="favorites.length" class="feed-list">
      <view
        v-for="post in favorites"
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
          <view class="resonance-btn pressable" @click.stop="unfave(post)">
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
import { zhiguangState, getFavorites, toggleResonance } from '../../store/useZhiguangStore.js'
import EmptyState from '../../components/EmptyState.vue'

const favorites = computed(() => getFavorites())

function goBack() { uni.navigateBack({ delta: 1 }) }

function goDetail(id) {
  uni.navigateTo({ url: `/pages/zhiguang/detail?id=${id}` })
}

function unfave(post) {
  toggleResonance(post.id)
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';
@import '@/styles/mixins.scss';

.page-container { @include page-container; padding-top: calc(env(safe-area-inset-top) + 88rpx); }

.header {
  position: fixed; top: 0; left: 0; right: 0; z-index: 100;
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 $sp-page-margin;
  padding-top: constant(safe-area-inset-top);
  padding-top: env(safe-area-inset-top); padding-bottom: 16rpx;
  background-color: $color-background;
}
.back-btn { width: 80rpx; height: 80rpx; display: flex; align-items: center; justify-content: center; }
.back-icon { font-size: 48rpx; color: $color-primary; font-weight: 300; }
.header-title { font-family: $font-headline; font-size: $fs-headline-sm; font-weight: 600; color: $color-primary; }

.feed-list { padding: 0 $sp-page-margin; display: flex; flex-direction: column; gap: $sp-module-gap; }
.post-card { padding: 48rpx; overflow: hidden; }
.post-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24rpx; }
.author-name { font-size: $fs-label-md; font-weight: 600; color: $color-primary; }
.post-time { font-size: 22rpx; color: rgba($color-on-surface-variant, 0.6); }
.post-content { display: block; font-size: $fs-body-lg; line-height: 1.6; color: $color-on-surface-variant; margin-bottom: 32rpx; }
.post-footer { display: flex; justify-content: space-between; align-items: center; }
.post-tags { display: flex; gap: 16rpx; }
.post-tag { font-size: 22rpx; padding: 8rpx 24rpx; border-radius: $radius-full; background-color: rgba($color-secondary-fixed, 0.3); color: $color-on-secondary-fixed-variant; }
.resonance-btn { display: flex; align-items: center; gap: 8rpx; padding: 8rpx 16rpx; }
.resonance-icon { font-size: 44rpx; }
.resonance-icon.resonated { color: $color-error; }
.resonance-text { font-size: $fs-label-md; color: rgba($color-on-surface-variant, 0.4); }
.r-text-active { color: $color-error; }
</style>
