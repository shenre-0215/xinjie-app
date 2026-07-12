<template>
  <view class="page-container">
    <!-- #ifdef H5 -->
    <view class="h5-safe-top" />
    <!-- #endif -->

    <!-- Fixed header -->
    <view class="header" :class="{ 'header-scrolled': scrolled }">
      <view class="back-btn pressable" @click="goBack">
        <text class="back-icon">‹</text>
      </view>
      <view class="share-btn pressable" @click="doShare">
        <text class="share-icon">↗</text>
      </view>
    </view>

    <scroll-view
      v-if="post"
      scroll-y
      class="content-scroll"
      @scroll="onScroll"
    >
      <!-- Author section -->
      <view class="author-section">
        <view class="author-avatar">
          <text class="avatar-text">{{ post.anonymous ? '?' : post.author.charAt(0) }}</text>
        </view>
        <view class="author-info">
          <text class="author-name">{{ post.anonymous ? '匿名织者' : post.author }}</text>
          <text class="author-time">{{ post.time }}{{ post.anonymous ? ' · 已开启匿名' : '' }}</text>
        </view>
      </view>

      <!-- Post body card -->
      <view class="post-body card">
        <text class="post-text">{{ post.content }}</text>
        <view v-if="post.image" class="post-image-wrap">
          <image :src="post.image" mode="widthFix" class="post-image" />
        </view>
        <view class="post-tags">
          <text v-for="tag in post.tags" :key="tag" class="post-tag"># {{ tag }}</text>
        </view>
      </view>

      <!-- Comments section -->
      <view class="comments-section">
        <view class="comments-header">
          <text class="comments-title">共鸣的声音（{{ post.comments.length }}）</text>
        </view>

        <view
          v-for="comment in post.comments"
          :key="comment.id"
          class="comment-item"
        >
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

      <view style="height:200rpx" />
    </scroll-view>

    <EmptyState
      v-else
      emoji="✧"
      text="分享不存在"
      hint="该分享可能已被删除"
    />

    <!-- Bottom bar -->
    <view v-if="post" class="bottom-bar">
      <view class="resonance-btn pressable" @click="onResonance">
        <text class="resonance-icon" :class="{ resonated: post.resonated }">
          {{ post.resonated ? '♥' : '♡' }}
        </text>
        <text class="resonance-label" :class="{ resonated: post.resonated }">
          {{ post.resonatedCount || 0 }}
        </text>
      </view>

      <view class="comment-input-wrap">
        <text class="comment-input-icon">✎</text>
        <input
          v-model="commentText"
          class="comment-input"
          placeholder="留下你的共鸣..."
          placeholder-style="color: rgba(65,73,67,0.3);"
          :confirm-type="'send'"
          @confirm="sendComment"
        />
      </view>

      <view class="bring-btn pressable" @click="bringToZhiji">
        <text class="bring-text">织入</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { zhiguangState, toggleResonance, addComment } from '../../store/useZhiguangStore.js'
import EmptyState from '../../components/EmptyState.vue'

const post = ref(null)
const commentText = ref('')
const scrolled = ref(false)

onLoad((options) => {
  if (options && options.id) {
    post.value = zhiguangState.posts.find(p => p.id === options.id)
  }
})

// ── actions ──

function goBack() {
  uni.navigateBack({ delta: 1 })
}

function onScroll(e) {
  scrolled.value = (e.detail.scrollTop || 0) > 10
}

function onResonance() {
  if (post.value) toggleResonance(post.value.id)
}

function sendComment() {
  const text = commentText.value.trim()
  if (!text || !post.value) return
  addComment(post.value.id, text)
  commentText.value = ''
}

function doShare() {
  // #ifdef MP-WEIXIN
  uni.showShareMenu({ withShareTicket: true })
  // #endif
  uni.showToast({ title: '开发中...', icon: 'none' })
}

function bringToZhiji() {
  if (post.value?.content) {
    const text = post.value.content.substring(0, 150)
    uni.navigateTo({ url: '/pages/zhiji/diary-edit?content=' + encodeURIComponent(text) })
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

// ── header ──
.header {
  position: fixed; top: 0; left: 0; right: 0; z-index: 100;
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 32rpx;
  padding-top: constant(safe-area-inset-top);
  padding-top: env(safe-area-inset-top);
  padding-bottom: 16rpx;
  background-color: rgba($color-background, 0.85);
  backdrop-filter: blur(20rpx);
  transition: box-shadow 0.3s;
}
.header-scrolled { box-shadow: 0 8rpx 40rpx rgba($color-primary-container, 0.08); }

.back-btn, .share-btn {
  width: 80rpx; height: 80rpx;
  display: flex; align-items: center; justify-content: center;
}
.back-icon, .share-icon { font-size: 48rpx; color: $color-on-surface-variant; font-weight: 300; }

// ── scroll ──
.content-scroll { padding-top: 0; padding-bottom: 200rpx; }

// ── author ──
.author-section {
  display: flex; align-items: center; gap: 32rpx;
  padding: 0 $sp-page-margin; margin-bottom: 56rpx;
}

.author-avatar {
  width: 112rpx; height: 112rpx; border-radius: $radius-full;
  background-color: rgba($color-primary-container, 0.3);
  display: flex; align-items: center; justify-content: center;
  border: 4rpx solid $color-surface-container-lowest;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}
.avatar-text { font-size: 40rpx; color: $color-primary; }

.author-name { display: block; font-size: $fs-headline-sm; font-weight: 600; color: $color-on-surface; }
.author-time { font-size: $fs-body-sm; color: rgba($color-on-surface-variant, 0.6); }

// ── post body card ──
.card {
  background-color: $color-surface-container-lowest;
  border-radius: $radius-md;
}

.post-body {
  margin: 0 $sp-page-margin 56rpx;
  padding: 48rpx;
}

.post-text {
  font-size: $fs-body-lg; line-height: 1.8; color: $color-on-surface;
  white-space: pre-wrap;
}

.post-image-wrap { margin-top: 48rpx; border-radius: $radius-md; overflow: hidden; }
.post-image { width: 100%; }

.post-tags { display: flex; flex-wrap: wrap; gap: 16rpx; margin-top: 32rpx; }
.post-tag {
  padding: 12rpx 32rpx; border-radius: $radius-full; font-size: $fs-body-sm;
  background-color: rgba($color-primary-container, 0.1); color: $color-primary;
}

// ── comments ──
.comments-section { padding: 0 $sp-page-margin; }

.comments-header {
  padding-bottom: 32rpx; border-bottom: 1rpx solid rgba($color-on-surface, 0.06);
  margin-bottom: 32rpx;
}
.comments-title { font-size: $fs-headline-sm; font-weight: 600; color: $color-on-surface; }

.comment-item { display: flex; gap: 32rpx; margin-bottom: 48rpx; }

.comment-avatar {
  width: 80rpx; height: 80rpx; border-radius: $radius-full;
  background-color: rgba($color-secondary-container, 0.3);
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  border: 2rpx solid $color-surface-container-lowest;
}
.comment-avatar-text { font-size: 28rpx; }

.comment-body { flex: 1; }
.comment-top { display: flex; justify-content: space-between; margin-bottom: 8rpx; }
.comment-author { font-size: $fs-body-sm; font-weight: 600; color: $color-primary; }
.comment-time { font-size: $fs-label-sm; color: rgba($color-on-surface-variant, 0.4); }
.comment-content { font-size: $fs-body-md; color: $color-on-surface-variant; line-height: 1.6; }

// ── bottom bar ──
.bottom-bar {
  position: fixed; bottom: 0; left: 0; right: 0;
  display: flex; align-items: center; gap: 24rpx;
  padding: 24rpx 32rpx;
  padding-bottom: constant(safe-area-inset-bottom);
  padding-bottom: env(safe-area-inset-bottom);
  background-color: rgba($color-surface-container-lowest, 0.9);
  backdrop-filter: blur(20rpx);
  box-shadow: 0 -8rpx 40rpx rgba($color-primary-container, 0.08);
}

.resonance-btn {
  display: flex; flex-direction: column; align-items: center; flex-shrink: 0;
}

.resonance-icon {
  font-size: 48rpx; color: $color-on-surface-variant; transition: all 0.3s;
  &.resonated { color: #ba1a1a; transform: scale(1.1); }
}
.resonance-label {
  font-size: $fs-label-sm; color: rgba($color-on-surface-variant, 0.6);
  &.resonated { color: #ba1a1a; }
}

.comment-input-wrap {
  flex: 1; display: flex; align-items: center;
  padding: 0 32rpx; height: 80rpx;
  background-color: rgba($color-on-surface, 0.04);
  border-radius: $radius-full;
}
.comment-input-icon {
  font-size: 32rpx; color: rgba($color-on-surface-variant, 0.4); margin-right: 16rpx;
}
.comment-input { flex: 1; height: 100%; font-size: $fs-body-sm; background: transparent; }

.bring-btn {
  padding: 12rpx 24rpx; border-radius: $radius-full;
  background-color: rgba($color-primary-container, 0.25);
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.bring-text { font-size: $fs-label-sm; color: $color-primary; font-weight: 600; }

// ── misc ──
.pressable:active { opacity: 0.7; }
</style>
