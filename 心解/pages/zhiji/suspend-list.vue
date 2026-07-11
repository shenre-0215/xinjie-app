<template>
  <view class="page-container">
    <view class="header">
      <view class="back-btn pressable" @click="goBack">
        <text class="back-icon">‹</text>
      </view>
      <text class="header-title">悬置清单</text>
      <view class="help-btn pressable">
        <text class="help-icon">?</text>
      </view>
    </view>

    <view class="intro-card">
      <view class="intro-decor" />
      <text class="intro-emoji">🌱</text>
      <text class="intro-heading">放一放也没关系</text>
      <text class="intro-sub">等有了新的感受，再回来就好</text>
    </view>

    <view v-if="sortedItems.length" class="list-section">
      <view
        v-for="item in sortedItems"
        :key="item.id"
        class="suspend-card card pressable-subtle"
        :class="'growth-' + item.growthStage"
        @click="goResume(item)"
      >
        <view class="card-top">
          <view class="top-left">
            <view class="growth-indicator">
              <view class="growth-stage-icon" :class="'stage-' + item.growthStage">
                <text class="stage-emoji">{{ item.growthEmoji }}</text>
              </view>
              <view class="growth-info">
                <text class="growth-label">{{ item.growthLabel }}</text>
                <view class="growth-meta">
                  <text class="days-text">已悬置 {{ item.realDays }} 天</text>
                  <text class="step-badge">停在「{{ item.stepLabel }}」</text>
                </view>
              </view>
            </view>
            <view v-if="item.source === 'xinbao'" class="source-badge">💬 心宝</view>
          </view>
        </view>
        <view class="card-body">
          <text class="card-content">{{ item.content }}</text>
          <view v-if="item.tags && item.tags.length" class="card-tags">
            <text v-for="tag in item.tags" :key="tag" class="tag-item">#{{ tag }}</text>
          </view>
        </view>
        <view class="growth-bar">
          <view class="growth-fill" :style="{ width: item.growthPercent + '%' }" />
        </view>
        <view class="card-footer">
          <view class="advice-row" :class="'advice-' + item.advice.color">
            <text class="advice-icon">📌</text>
            <text class="advice-text">{{ item.advice.label }}</text>
          </view>
          <view class="resume-btn pressable" @click.stop="goResume(item)">
            <text class="resume-text">继续梳理</text>
            <text class="resume-arrow">›</text>
          </view>
        </view>
      </view>
    </view>

    <EmptyState v-else emoji="🌱" text="没有悬置的条目" hint="放一放也没关系，等你准备好了再回来" />

    <view class="bottom-mascot">
      <text class="mascot-emoji">🌿</text>
    </view>
    <view class="bottom-spacer" />
  </view>
</template>

<script setup>
import { computed } from 'vue'
import { zhijiState } from '../../store/useZhijiStore.js'
import EmptyState from '../../components/EmptyState.vue'

const stepLabels = ['觉察', '拆解', '破局', '实践', '复盘']

const stepWeights = [0.5, 0.7, 1.2, 1, 1.5]

function calcGrowth(days, stepIndex) {
  const w = stepWeights[stepIndex] || 1
  const score = days * w
  if (score <= 1) return { stage: 'seed', emoji: '🌰', label: '正在孕育', percent: 10 }
  if (score <= 3) return { stage: 'sprout', emoji: '🌱', label: '开始萌芽', percent: 30 }
  if (score <= 7) return { stage: 'grow', emoji: '🌿', label: '茁壮成长', percent: 60 }
  if (score <= 14) return { stage: 'bloom', emoji: '🌸', label: '含苞待放', percent: 85 }
  return { stage: 'flower', emoji: '🌺', label: '盛开绽放', percent: 100 }
}

function calcAdvice(stage, stepIndex) {
  const map = {
    seed:   { label: '让思绪先沉淀一下', color: 'gray' },
    sprout: { label: '正在积累，快有新想法了', color: 'gray' },
    grow:   { label: '可以尝试从第' + stepLabels[stepIndex] + '步继续', color: 'yellow' },
    bloom:  { label: '时机差不多了，回来继续吧', color: 'green' },
    flower: { label: '完全准备好了，从第' + stepLabels[stepIndex] + '步开始', color: 'green' }
  }
  return map[stage] || map.seed
}

const sortedItems = computed(() => {
  const items = zhijiState.suspended.map(item => {
    const record = zhijiState.records.find(r => r.id === item.recordId)
    let days = item.suspendedDays || 0
    if (record && record.date) {
      const d = new Date(record.date)
      if (!isNaN(d.getTime())) {
        days = Math.max(0, Math.floor((Date.now() - d.getTime()) / 86400000))
      }
    }
    const idx = item.stepIndex || (record ? record.stepIndex : 0) || 0
    const growth = calcGrowth(days, idx)
    const advice = calcAdvice(growth.stage, idx)
    return {
      ...item, realDays: days, advice, stepIndex: idx,
      stepLabel: stepLabels[idx] || '觉察',
      growthStage: growth.stage, growthEmoji: growth.emoji,
      growthLabel: growth.label, growthPercent: growth.percent
    }
  })
  return [...items].sort((a, b) => b.realDays - a.realDays)
})

function goBack() { uni.navigateBack({ delta: 1 }) }

function goResume(item) {
  uni.navigateTo({ url: `/pages/zhiji/thinking-chain?recordId=${item.recordId}&step=${item.stepIndex || 0}` })
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.page-container { min-height: 100vh; background-color: #f9faf6; padding-top: calc(env(safe-area-inset-top) + 88rpx); }

.header { position: fixed; top: 0; left: 0; right: 0; z-index: 100; display: flex; align-items: center; justify-content: space-between; padding: 0 32rpx; padding-top: constant(safe-area-inset-top); padding-top: env(safe-area-inset-top); padding-bottom: 16rpx; background-color: #f9faf6; }
.back-btn { width: 80rpx; height: 80rpx; border-radius: 9999rpx; display: flex; align-items: center; justify-content: center; background-color: #fff; }
.back-icon { font-size: 48rpx; color: #3d6751; font-weight: 300; }
.header-title { font-size: 36rpx; font-weight: 600; color: #3d6751; }
.help-btn { width: 80rpx; height: 80rpx; display: flex; align-items: center; justify-content: center; }
.help-icon { font-size: 40rpx; color: #3d6751; font-weight: 600; }

.intro-card { margin: 0 32rpx 56rpx; padding: 48rpx 40rpx; border-radius: 16rpx; background-color: #fff; box-shadow: 0 4rpx 20rpx rgba(168,213,186,0.08); display: flex; flex-direction: column; align-items: center; text-align: center; position: relative; overflow: hidden; }
.intro-decor { position: absolute; top: -40rpx; right: -40rpx; width: 160rpx; height: 160rpx; border-radius: 9999rpx; background-color: rgba(168,213,186,0.15); pointer-events: none; }
.intro-emoji { font-size: 64rpx; margin-bottom: 24rpx; position: relative; }
.intro-heading { font-size: 36rpx; font-weight: 600; color: #3d6751; margin-bottom: 12rpx; position: relative; }
.intro-sub { font-size: 28rpx; color: rgba(65,73,67,0.7); line-height: 1.6; position: relative; }

.list-section { padding: 0 32rpx; display: flex; flex-direction: column; gap: 32rpx; }

.suspend-card { padding: 48rpx; }
.card-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32rpx; }
.top-left { display: flex; align-items: center; gap: 16rpx; flex: 1; }
.growth-indicator { display: flex; align-items: center; gap: 16rpx; flex: 1; }
.growth-stage-icon { width: 96rpx; height: 96rpx; border-radius: 9999rpx; display: flex; align-items: center; justify-content: center; background-color: rgba(168,213,186,0.15); }
.stage-emoji { font-size: 44rpx; }
.growth-info { display: flex; flex-direction: column; gap: 8rpx; }
.growth-label { font-size: 28rpx; font-weight: 600; color: #1a1c1a; }
.growth-meta { display: flex; align-items: center; gap: 16rpx; }
.days-text { font-size: 22rpx; color: rgba(65,73,67,0.5); }
.step-badge { font-size: 22rpx; padding: 4rpx 16rpx; border-radius: 9999rpx; background-color: rgba(168,213,186,0.2); color: #345d48; font-weight: 500; }
.source-badge { font-size: 22rpx; padding: 8rpx 16rpx; border-radius: 9999rpx; background-color: rgba(237,223,184,0.3); color: #6c6243; font-weight: 500; }

.card-body { margin-bottom: 24rpx; }
.card-content { font-size: 34rpx; font-weight: 600; color: #1a1c1a; line-height: 1.5; }
.card-tags { display: flex; flex-wrap: wrap; gap: 16rpx; margin-top: 16rpx; }
.tag-item { font-size: 22rpx; color: #717973; }

.growth-bar { height: 12rpx; border-radius: 9999rpx; background-color: rgba(168,213,186,0.1); overflow: hidden; margin-bottom: 24rpx; }
.growth-fill { height: 100%; border-radius: 9999rpx; background: linear-gradient(90deg, #a8d5ba, #3d6751); transition: width 0.8s ease-out; }

.card-footer { display: flex; justify-content: space-between; align-items: center; }
.advice-row { display: flex; align-items: center; gap: 12rpx; padding: 16rpx 24rpx; border-radius: 16rpx; }
.advice-green { background-color: rgba(76,175,80,0.08); }
.advice-green .advice-text { color: #388e3c; }
.advice-yellow { background-color: rgba(249,168,37,0.08); }
.advice-yellow .advice-text { color: #c17900; }
.advice-gray { background-color: rgba(226,227,223,0.3); }
.advice-gray .advice-text { color: rgba(65,73,67,0.5); }
.advice-icon { font-size: 24rpx; }
.advice-text { font-size: 22rpx; font-weight: 500; }
.resume-btn { display: flex; align-items: center; gap: 8rpx; }
.resume-text { font-size: 26rpx; color: #3d6751; font-weight: 600; }
.resume-arrow { font-size: 36rpx; color: #3d6751; }

.bottom-mascot { display: flex; justify-content: center; margin-top: 56rpx; opacity: 0.4; }
.mascot-emoji { font-size: 192rpx; }
.bottom-spacer { height: 200rpx; }

.pressable:active { opacity: 0.7; }
</style>
