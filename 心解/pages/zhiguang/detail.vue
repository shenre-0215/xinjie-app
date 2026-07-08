<template>
  <view class="page-container">
    <!-- Header -->
    <view class="header" :class="{ 'header-scrolled': scrolled }">
      <view class="back-btn pressable" @click="goBack">
        <text class="back-icon">‹</text>
      </view>
      <view class="share-btn pressable">
        <text class="share-icon">↗</text>
      </view>
    </view>

    <view
      v-if="post"
      class="content-scroll"
    >
      <!-- Author -->
      <view class="author-section">
        <view class="author-avatar">
          <text class="avatar-text">{{ post.anonymous ? '?' : '织' }}</text>
        </view>
        <view class="author-info">
          <text class="author-name">{{ post.anonymous ? '匿名织者' : post.author }}</text>
          <text class="author-time">{{ post.time }}{{ post.anonymous ? ' · 已开启匿名' : '' }}</text>
        </view>
      </view>

      <!-- Content -->
      <view class="post-body card">
        <text class="post-text">{{ post.content }}</text>

        <!-- Image -->
        <view v-if="post.image" class="post-image-wrap">
          <image :src="post.image" mode="widthFix" class="post-image" />
        </view>

        <!-- Tags -->
        <view class="post-tags">
          <text v-for="tag in post.tags" :key="tag" class="post-tag"># {{ tag }}</text>
        </view>
      </view>

      <!-- Comments -->
      <view class="comments-section">
        <view class="comments-header">
          <text class="comments-title">共鸣的声音 ({{ post.comments.length }})</text>
        </view>
        <view v-for="comment in post.comments" :key="comment.id" class="comment-item">
          <view class="comment-avatar">
            <text class="comment-avatar-text">{{ comment.author.charAt(0) }}</text>
          </view>
          <view class="comment-body">
            <view class="comment-top">
              <text class="comment-author">{{ comment.author }}</text>
              <text class="comment-time">{{ comment.time }}</text>
            </view>
            <text class="comment-content">{{ comment.content }}</text>
          </view>
        </view>
        <EmptyState
          v-if="!post.comments.length"
          emoji="❋"
          text="还没有共鸣的声音"
          hint="做第一个温柔回应的人吧"
        />
      </view>

      <view style="height: 200rpx;" />
    </view>

    <!-- Bottom bar -->
    <view v-if="post" class="bottom-bar">
      <view class="resonance-btn pressable" @click="toggleResonance">
        <text class="resonance-icon" :class="{ resonated: post.resonated }">{{ post.resonated ? '♥' : '♡' }}</text>
        <text class="resonance-label" :class="{ resonated: post.resonated }">{{ post.resonatedCount || 0 }}</text>
      </view>
      <view class="comment-input-wrap">
        <text class="comment-input-icon">✎</text>
        <input
          class="comment-input"
          v-model="commentText"
          placeholder="留下你的共鸣..."
          placeholder-style="color: rgba(65,73,67,0.3);"
          confirm-type="send"
          @confirm="addComment"
        />
      </view>
      <view class="bring-btn pressable" @click="bringToZhiji">
        <text class="bring-text">织入</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { zhiguangState, toggleResonance as doToggleResonance, addComment as doAddComment } from '../../store/useZhiguangStore.js'
import EmptyState from '../../components/EmptyState.vue'

const post = ref(null)
const commentText = ref('')
const scrolled = ref(false)

onLoad((options) => {
  if (options && options.id) {
    post.value = zhiguangState.posts.find(p => p.id === options.id)
  }
})

function goBack() { uni.navigateBack({ delta: 1 }) }

function onScroll(e) {
  scrolled.value = e.detail.scrollTop > 40
}

function toggleResonance() {
  if (post.value) doToggleResonance(post.value.id)
}

function addComment() {
  const text = commentText.value.trim()
  if (!text || !post.value) return
  doAddComment(post.value.id, text)
  commentText.value = ''
}

function bringToZhiji() {
  if (post.value?.content) {
    const quote = post.value.content.substring(0, 150)
    uni.navigateTo({ url: '/pages/zhiji/diary-edit?content=' + encodeURIComponent(quote) })
  }
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
  background-color: rgba($color-background, 0.85);
  backdrop-filter: blur(20rpx);
  transition: box-shadow 0.3s;
}

.header-scrolled {
  box-shadow: $shadow-healing;
}

.back-btn, .share-btn {
  width: 80rpx;
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.back-icon, .share-icon {
  font-size: 48rpx;
  color: $color-on-surface-variant;
  font-weight: 300;
}

.content-scroll {
  padding-top: 160rpx;
  padding-bottom: 200rpx;
}

.author-section {
  display: flex;
  align-items: center;
  gap: 32rpx;
  padding: 0 $sp-page-margin;
  margin-bottom: $sp-module-gap;
}

.author-avatar {
  width: 112rpx;
  height: 112rpx;
  border-radius: $radius-full;
  background-color: rgba($color-primary-container, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 4rpx solid $color-surface-container-lowest;
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.05);
}

.avatar-text { font-size: 40rpx; color: $color-primary; }

.author-name {
  display: block;
  font-size: $fs-headline-sm;
  font-weight: 600;
  color: $color-on-surface;
}

.author-time {
  font-size: $fs-label-md;
  color: rgba($color-on-surface-variant, 0.6);
}

.post-body {
  margin: 0 $sp-page-margin;
  padding: 48rpx;
  margin-bottom: $sp-module-gap;
}

.post-text {
  font-size: $fs-body-lg;
  line-height: 1.8;
  color: $color-on-surface;
  white-space: pre-wrap;
}

.post-image-wrap {
  margin-top: 48rpx;
  border-radius: $radius-default;
  overflow: hidden;
}

.post-image { width: 100%; }

.post-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
  margin-top: 64rpx;
}

.post-tag {
  padding: 12rpx 32rpx;
  border-radius: $radius-full;
  font-size: $fs-label-md;
  background-color: rgba($color-primary-container, 0.1);
  color: $color-primary;
}

.comments-section {
  padding: 0 $sp-page-margin;
}

.comments-header {
  padding-bottom: 32rpx;
  border-bottom: 2rpx solid $color-surface-container-high;
  margin-bottom: 32rpx;
}

.comments-title {
  font-size: $fs-headline-sm;
  font-weight: 600;
  color: $color-on-surface;
}

.comment-item {
  display: flex;
  gap: 32rpx;
  margin-bottom: 48rpx;
}

.comment-avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: $radius-full;
  background-color: rgba($color-secondary-fixed, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border: 4rpx solid $color-surface-container-lowest;
}

.comment-avatar-text { font-size: 28rpx; }

.comment-body { flex: 1; }

.comment-top {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8rpx;
}

.comment-author {
  font-size: $fs-label-md;
  font-weight: 600;
  color: $color-primary;
}

.comment-time {
  font-size: $fs-label-sm;
  color: rgba($color-on-surface-variant, 0.4);
}

.comment-content {
  font-size: $fs-body-md;
  color: $color-on-surface-variant;
}

.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  gap: 24rpx;
  padding: 24rpx $sp-page-margin;
  padding-bottom: constant(safe-area-inset-bottom);
  padding-bottom: env(safe-area-inset-bottom);
  background-color: rgba($color-surface-container-lowest, 0.9);
  backdrop-filter: blur(20rpx);
  box-shadow: $shadow-nav;
}

.resonance-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
}

.resonance-icon {
  font-size: 48rpx;
  color: $color-on-surface-variant;
  transition: all 0.3s;
}

.resonance-icon.resonated {
  color: $color-error;
  transform: scale(1.1);
}

.resonance-label {
  font-size: $fs-label-sm;
  color: rgba($color-on-surface-variant, 0.6);
}

.comment-input-wrap {
  flex: 1;
  display: flex;
  align-items: center;
  padding: 0 32rpx;
  height: 80rpx;
  background-color: $color-surface-container-low;
  border-radius: $radius-full;
}

.comment-input-icon {
  font-size: 32rpx;
  color: rgba($color-on-surface-variant, 0.4);
  margin-right: 16rpx;
}

.comment-input {
  flex: 1;
  height: 100%;
  font-size: $fs-label-md;
  background: transparent;
}

.bring-btn {
  padding: 12rpx 24rpx; border-radius: $radius-full;
  background-color: rgba($color-primary-container, 0.25);
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.bring-text { font-size: $fs-label-sm; color: $color-primary; font-weight: 600; }
</style>
