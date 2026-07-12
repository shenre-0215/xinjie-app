<template>
  <view class="page-container">
    <!-- #ifdef H5 -->
    <view class="h5-safe-top" />
    <!-- #endif -->

    <view class="header">
      <view class="back-btn pressable" @click="goBack">
        <text class="back-icon">‹</text>
      </view>
      <text class="header-title">关于心解</text>
      <view style="width:80rpx" />
    </view>

    <scroll-view scroll-y class="scroll-area">
      <!-- Logo -->
      <view class="logo-section">
        <view class="logo-ring">
          <text class="logo-text">心</text>
        </view>
        <text class="app-name">心解</text>
        <text class="app-version">v1.0.0</text>
      </view>

      <!-- 描述卡片 -->
      <view class="desc-card card">
        <text class="desc-text">
          心解是一份温柔的精神角落。
          在这里，你不需要成为任何人，
          只是记录、感受、与自己的内心对话。
        </text>
        <view class="desc-divider" />
        <text class="desc-text">
          从"织记"里写下每日的思绪，
          用"思考链"梳理缠绕的念头，
          在"织光"中与同路人分享光亮，
          让"心网"映照你内心的版图。
        </text>
      </view>

      <!-- 核心理念 -->
      <view class="section">
        <text class="section-title">核心理念</text>

        <view class="concept-card card">
          <view class="concept-row">
            <view class="concept-dot" />
            <text class="concept-label">悬置</text>
          </view>
          <text class="concept-body">有些事不需要立刻解决。暂时放一放，让时间给出答案。</text>
        </view>

        <view class="concept-card card">
          <view class="concept-row">
            <view class="concept-dot concept-dot-delta" />
            <text class="concept-label">δ(C) 闭合质量</text>
          </view>
          <text class="concept-body">不是强硬地"解决问题"，而是在拆解中观察、理解、生长。</text>
        </view>

        <view class="concept-card card">
          <view class="concept-row">
            <view class="concept-dot concept-dot-warm" />
            <text class="concept-label">织网</text>
          </view>
          <text class="concept-body">每一次自我认知都是一束光，它们连接起来，织成你内心的网。</text>
        </view>
      </view>

      <!-- 技术栈 -->
      <view class="section">
        <text class="section-title">技术信息</text>
        <view class="tech-card card">
          <view class="tech-row">
            <text class="tech-label">框架</text>
            <text class="tech-value">uni-app (Vue 3)</text>
          </view>
          <view class="tech-row">
            <text class="tech-label">平台</text>
            <text class="tech-value">微信小程序 / H5</text>
          </view>
          <view class="tech-row">
            <text class="tech-label">后台</text>
            <text class="tech-value">uniCloud</text>
          </view>
        </view>
      </view>

      <!-- 致谢 -->
      <view class="thanks">
        <text class="thanks-text">感谢你正在认真地对待自己的内心</text>
        <text class="thanks-emoji">🌿</text>
      </view>

      <view class="bottom-spacer" />
    </scroll-view>
  </view>
</template>

<script setup>
function goBack() {
  uni.navigateBack({ delta: 1 })
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

.scroll-area { height: 100vh; padding-bottom: 180rpx; box-sizing: border-box; }

// ── logo ──
.logo-section {
  display: flex; flex-direction: column; align-items: center;
  padding: 80rpx 0 64rpx;
}

.logo-ring {
  width: 192rpx; height: 192rpx; border-radius: $radius-full;
  background: linear-gradient(135deg, rgba($color-primary-container, 0.4), rgba($color-secondary-container, 0.3));
  display: flex; align-items: center; justify-content: center;
  margin-bottom: 32rpx;
  box-shadow: $shadow-healing;
}

.logo-text {
  font-family: $font-headline;
  font-size: 72rpx;
  color: $color-primary;
  font-weight: 700;
}

.app-name {
  font-family: $font-headline;
  font-size: $fs-headline-xl;
  font-weight: 700;
  color: $color-primary;
  margin-bottom: 12rpx;
}

.app-version {
  font-size: $fs-body-sm;
  color: rgba($color-on-surface-variant, 0.5);
}

// ── desc card ──
.desc-card {
  margin: 0 $sp-page-margin 56rpx;
  padding: 48rpx;
  display: flex; flex-direction: column; gap: 32rpx;
}
.desc-text { font-size: $fs-body-lg; color: $color-on-surface-variant; line-height: 1.8; }
.desc-divider { height: 2rpx; background-color: rgba($color-on-surface, 0.06); }

// ── section ──
.section { margin: 0 $sp-page-margin 56rpx; }

.section-title {
  font-size: $fs-headline-sm; font-weight: 600; color: $color-on-surface;
  margin-bottom: 32rpx; display: block;
}

// ── concept cards ──
.concept-card {
  padding: 40rpx; margin-bottom: 16rpx;
  display: flex; flex-direction: column; gap: 16rpx;
}

.concept-row { display: flex; align-items: center; gap: 16rpx; }
.concept-dot {
  width: 16rpx; height: 16rpx; border-radius: $radius-full;
  background-color: $color-primary-container;
}
.concept-dot-delta { background-color: $color-secondary-container; }
.concept-dot-warm { background-color: $color-tertiary-container; }

.concept-label { font-size: $fs-body-md; font-weight: 600; color: $color-on-surface; }
.concept-body { font-size: $fs-body-md; color: rgba($color-on-surface-variant, 0.8); line-height: 1.7; }

// ── tech card ──
.tech-card {
  padding: 40rpx; display: flex; flex-direction: column; gap: 0;
}
.tech-row {
  display: flex; justify-content: space-between; align-items: center;
  padding: 24rpx 0;
  border-bottom: 2rpx solid rgba($color-on-surface, 0.04);
}
.tech-row:last-child { border-bottom: none; }
.tech-label { font-size: $fs-body-md; color: rgba($color-on-surface-variant, 0.7); }
.tech-value { font-size: $fs-body-md; color: $color-on-surface; }

// ── thanks ──
.thanks {
  display: flex; flex-direction: column; align-items: center;
  padding: 80rpx 32rpx;
}
.thanks-text {
  font-size: $fs-body-md;
  color: rgba($color-on-surface-variant, 0.5);
  margin-bottom: 16rpx;
}
.thanks-emoji { font-size: 64rpx; }

.bottom-spacer { height: 80rpx; }

.card {
  background-color: $color-surface-container-lowest;
  border-radius: $radius-md;
}

.pressable:active { opacity: 0.7; }
</style>
