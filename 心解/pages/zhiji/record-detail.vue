<template>
  <view class="page-container">
    <view class="header">
      <view class="back-btn pressable" @click="goBack">
        <text class="back-icon">‹</text>
      </view>
      <text class="header-title">记录详情</text>
      <view style="width: 80rpx;" />
    </view>

    <view v-if="record" class="detail-scroll">
      <view class="summary-card card">
        <view class="summary-header">
          <view class="meta-row">
            <text class="type-badge">{{ typeLabel }}</text>
            <text v-if="record.status !== 'none'" class="status-badge" :class="'status-' + record.status">
              {{ statusLabel }}
            </text>
            <view v-if="record.delta" class="delta-badge">
              <text class="delta-emoji">{{ deltaEmoji }}</text>
              <text class="delta-value">δ={{ record.delta }}</text>
            </view>
          </view>
          <view v-if="record.type === 'thinking-chain' && record.status === 'closed'" class="delta-label">
            闭合质量：{{ deltaLabel }}
          </view>
        </view>

        <view v-if="record.tags.length" class="tags-row">
          <text v-for="tag in record.tags" :key="tag" class="tag-item">#{{ tag }}</text>
        </view>

        <view class="time-row">
          <text class="time-icon">🕐</text>
          <text class="time-value">{{ record.date }} {{ record.time }}</text>
        </view>
      </view>

      <view v-if="record.type === 'thinking-chain' && record.stepsContent" class="steps-section">
        <view class="section-header">
          <text class="section-title">思考链</text>
          <text class="section-sub">{{ record.step }} / {{ record.totalSteps }} 步</text>
        </view>
        <view class="steps-bar">
          <view class="steps-fill" :style="{ width: (record.step / record.totalSteps * 100) + '%' }" />
        </view>
        <view v-for="(stepContent, index) in stepsList" :key="index" class="step-card card">
          <view class="step-header">
            <view class="step-number">{{ index + 1 }}</view>
            <text class="step-label">{{ steps[index]?.label || '步骤' }}</text>
          </view>
          <text class="step-content">{{ stepContent }}</text>
        </view>
      </view>

      <view v-else class="content-card card">
        <text class="content-text">{{ record.content }}</text>
      </view>

      <view v-if="record.type === 'diary' && record.mood" class="mood-card card">
        <view class="mood-header">
          <text class="mood-label">心情</text>
          <text class="mood-emoji">{{ moodEmoji }}</text>
        </view>
        <view class="mood-bar">
          <view class="mood-fill" :style="{ width: moodPercent + '%', backgroundColor: moodColor }" />
        </view>
      </view>

      <view v-if="relatedRecords.length > 0" class="related-section">
        <view class="section-header">
          <text class="section-title">关联记录</text>
          <text class="section-sub">{{ relatedRecords.length }} 条</text>
        </view>
        <view v-for="rel in relatedRecords" :key="rel.id" class="related-card card pressable" @click="goRecordDetail(rel.id)">
          <view class="related-icon">{{ rel.type === 'diary' ? '📝' : '🔗' }}</view>
          <view class="related-content">
            <text class="related-title">{{ rel.title || rel.content.substring(0, 20) + '...' }}</text>
            <text class="related-time">{{ rel.date }}</text>
          </view>
          <text class="related-arrow">›</text>
        </view>
      </view>

      <view class="bottom-spacer" />
    </view>

    <EmptyState
      v-else
      emoji="✧"
      text="记录不存在"
      hint="该记录可能已被删除"
    />

    <view v-if="record" class="action-bar">
      <view class="action-btn pressable" @click="editRecord">
        <text class="action-icon">✎</text>
        <text class="action-label">编辑</text>
      </view>
      <view class="action-btn pressable" @click="chatWithXinbao">
        <text class="action-icon">◇</text>
        <text class="action-label">找心宝聊聊</text>
      </view>
      <view class="action-btn pressable" @click="shareToGuang">
        <text class="action-icon">❋</text>
        <text class="action-label">分享到织光</text>
      </view>
      <view class="action-btn pressable" @click="showMore">
        <text class="action-icon">⋯</text>
        <text class="action-label">更多</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getRecord, deleteRecord, zhijiState } from '../../store/useZhijiStore.js'
import { sendMessage } from '../../store/useXinbaoStore.js'
import EmptyState from '../../components/EmptyState.vue'

const record = ref(null)

const steps = [
  { label: '觉察', icon: '🔍' },
  { label: '拆解', icon: '🔧' },
  { label: '破局', icon: '💡' },
  { label: '实践', icon: '🚀' },
  { label: '复盘', icon: '🏆' }
]

onLoad((options) => {
  if (options && options.id) {
    record.value = getRecord(options.id)
  }
})

const typeLabel = computed(() => {
  return record.value?.type === 'diary' ? '日记' : '思考链'
})

const statusLabel = computed(() => {
  const map = { 'in-progress': '进行中', 'suspended': '已悬置', 'closed': '已闭合' }
  return map[record.value?.status] || ''
})

const moodEmoji = computed(() => {
  const map = { 'very-happy': '☀️', 'happy': '⛅', 'neutral': '☁️', 'sad': '🌧️', 'very-sad': '⛈️' }
  return map[record.value?.mood] || ''
})

const moodPercent = computed(() => {
  const map = { 'very-happy': 100, 'happy': 75, 'neutral': 50, 'sad': 25, 'very-sad': 0 }
  return map[record.value?.mood] || 50
})

const moodColor = computed(() => {
  const map = { 
    'very-happy': '#4caf50', 
    'happy': '#f9a825', 
    'neutral': '#9e9e9e', 
    'sad': '#2196f3', 
    'very-sad': '#9c27b0' 
  }
  return map[record.value?.mood] || '#9e9e9e'
})

const deltaEmoji = computed(() => {
  const delta = record.value?.delta || 0
  if (delta >= 80) return '🌟'
  if (delta >= 60) return '✨'
  if (delta >= 40) return '💫'
  return '💭'
})

const deltaLabel = computed(() => {
  const delta = record.value?.delta || 0
  if (delta >= 80) return '卓越'
  if (delta >= 60) return '优秀'
  if (delta >= 40) return '良好'
  return '继续努力'
})

const stepsList = computed(() => {
  const stepsContent = record.value?.stepsContent
  if (!stepsContent) return []
  return typeof stepsContent === 'string' ? JSON.parse(stepsContent) : stepsContent
})

const relatedRecords = computed(() => {
  if (!record.value) return []
  return zhijiState.records.filter(r => 
    r.id !== record.value.id && 
    r.date === record.value.date &&
    r.type !== record.value.type
  ).slice(0, 3)
})

function goBack() {
  uni.navigateBack({ delta: 1 })
}

function goRecordDetail(id) {
  uni.navigateTo({ url: '/pages/zhiji/record-detail?id=' + id })
}

function editRecord() {
  if (!record.value) return
  const content = encodeURIComponent(record.value.content || '')
  if (record.value.type === 'thinking-chain') {
    uni.navigateTo({ url: '/pages/zhiji/thinking-chain?content=' + content })
  } else {
    uni.navigateTo({ url: '/pages/zhiji/diary-edit?content=' + content + '&id=' + record.value.id })
  }
}

function chatWithXinbao() {
  if (record.value?.content) {
    sendMessage('【来自织记】' + record.value.content.substring(0, 300))
  }
  uni.switchTab({ url: '/pages/xinbao/index' })
}

function shareToGuang() {
  if (record.value?.content) {
    const preview = record.value.content.substring(0, 200)
    uni.navigateTo({ url: '/pages/zhiguang/publish?content=' + encodeURIComponent(preview) })
  } else {
    uni.navigateTo({ url: '/pages/zhiguang/publish' })
  }
}

function showMore() {
  uni.showActionSheet({
    itemList: ['删除记录', '标记悬置', '导出文字'],
    success: (res) => {
      if (res.tapIndex === 0) {
        uni.showModal({
          title: '确认删除？',
          content: '删除后无法恢复',
          success: (r) => {
            if (r.confirm) {
              deleteRecord(record.value.id)
              uni.showToast({ title: '已删除', icon: 'success' })
              setTimeout(() => uni.navigateBack({ delta: 1 }), 600)
            }
          }
        })
      }
    }
  })
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
  padding-top: env(safe-area-inset-top);
  padding-bottom: 16rpx;
  background-color: rgba($color-background, 0.85);
  backdrop-filter: blur(20rpx);
}

.back-btn {
  width: 80rpx;
  height: 80rpx;
  border-radius: $radius-full;
  display: flex;
  align-items: center;
  justify-content: center;
}

.back-icon {
  font-size: 48rpx;
  color: $color-on-surface-variant;
  font-weight: 300;
}

.header-title {
  font-size: $fs-headline-sm;
  font-weight: 600;
  color: rgba($color-on-surface, 0.8);
}

.detail-scroll {
  padding: 0 $sp-page-margin;
}

.card {
  background-color: $color-surface-container-lowest;
  border-radius: $radius-default;
  padding: 32rpx;
  margin-bottom: $sp-module-gap;
}

.summary-card {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.summary-header {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.meta-row {
  display: flex;
  align-items: center;
  gap: 16rpx;
  flex-wrap: wrap;
}

.type-badge {
  font-size: $fs-label-sm;
  padding: 8rpx 24rpx;
  border-radius: $radius-full;
  background-color: rgba($color-primary-fixed, 0.3);
  color: $color-on-primary-fixed-variant;
}

.status-badge {
  font-size: $fs-label-sm;
  padding: 8rpx 24rpx;
  border-radius: $radius-full;
}

.status-in-progress {
  background-color: rgba($color-secondary-container, 0.3);
  color: $color-on-secondary-container;
}

.status-suspended {
  background-color: rgba($color-tertiary-container, 0.3);
  color: $color-on-tertiary-container;
}

.status-closed {
  background-color: rgba($color-primary-container, 0.3);
  color: $color-on-primary-container;
}

.delta-badge {
  display: flex;
  align-items: center;
  gap: 8rpx;
  font-size: $fs-label-sm;
  padding: 8rpx 20rpx;
  border-radius: $radius-full;
  background-color: rgba($color-tertiary-fixed, 0.3);
}

.delta-emoji {
  font-size: 24rpx;
}

.delta-value {
  color: $color-primary;
  font-weight: 600;
}

.delta-label {
  font-size: $fs-label-md;
  color: $color-primary;
  font-weight: 500;
}

.tags-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}

.tag-item {
  font-size: $fs-label-sm;
  padding: 8rpx 20rpx;
  border-radius: 8rpx;
  background-color: rgba($color-tertiary-fixed, 0.3);
  color: $color-on-tertiary-fixed-variant;
}

.time-row {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.time-icon {
  font-size: 28rpx;
}

.time-value {
  font-size: $fs-body-md;
  color: $color-on-surface-variant;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.section-title {
  font-size: $fs-headline-sm;
  font-weight: 600;
  color: $color-on-surface;
}

.section-sub {
  font-size: $fs-label-md;
  color: rgba($color-on-surface, 0.5);
}

.steps-section {
  margin-bottom: $sp-module-gap;
}

.steps-bar {
  height: 8rpx;
  background-color: $color-surface-container;
  border-radius: $radius-full;
  overflow: hidden;
  margin-bottom: 24rpx;
}

.steps-fill {
  height: 100%;
  background-color: $color-primary-container;
  border-radius: $radius-full;
  transition: width 0.3s ease;
}

.step-card {
  margin-bottom: 16rpx;
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.step-card:last-child {
  margin-bottom: 0;
}

.step-header {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.step-number {
  width: 48rpx;
  height: 48rpx;
  border-radius: $radius-full;
  background-color: $color-primary-container;
  color: $color-on-primary-container;
  font-size: $fs-label-md;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
}

.step-label {
  font-size: $fs-headline-sm;
  font-weight: 600;
  color: $color-on-surface;
}

.step-content {
  font-size: $fs-body-md;
  line-height: 1.7;
  color: $color-on-surface-variant;
  padding-left: 64rpx;
}

.content-card {
  display: flex;
  flex-direction: column;
}

.content-text {
  font-size: $fs-body-lg;
  line-height: 1.8;
  color: $color-on-surface;
  white-space: pre-line;
  word-break: break-word;
}

.mood-card {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.mood-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.mood-label {
  font-size: $fs-label-md;
  color: $color-on-surface-variant;
}

.mood-emoji {
  font-size: 56rpx;
}

.mood-bar {
  height: 12rpx;
  background-color: rgba($color-on-surface, 0.08);
  border-radius: $radius-full;
  overflow: hidden;
}

.mood-fill {
  height: 100%;
  border-radius: $radius-full;
  transition: width 0.5s ease;
}

.related-section {
  margin-bottom: $sp-module-gap;
}

.related-card {
  display: flex;
  align-items: center;
  gap: 20rpx;
  padding: 28rpx 32rpx;
}

.related-icon {
  font-size: 36rpx;
}

.related-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.related-title {
  font-size: $fs-body-md;
  color: $color-on-surface;
}

.related-time {
  font-size: $fs-label-sm;
  color: rgba($color-on-surface, 0.5);
}

.related-arrow {
  font-size: 40rpx;
  color: rgba($color-on-surface, 0.3);
}

.bottom-spacer {
  height: 240rpx;
}

.action-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-around;
  padding: 24rpx $sp-page-margin;
  padding-bottom: constant(safe-area-inset-bottom);
  padding-bottom: env(safe-area-inset-bottom);
  background-color: $color-surface-container-lowest;
  box-shadow: $shadow-nav;
}

.action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
  padding: 16rpx;
}

.action-icon {
  font-size: 44rpx;
}

.action-label {
  font-size: 20rpx;
  color: $color-on-surface-variant;
}
</style>
