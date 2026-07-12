<template>
  <view class="page-container">
    <view class="header">
      <view class="back-btn pressable" @click="goBack">
        <text class="back-icon">←</text>
      </view>
      <text class="header-title">{{ node && node.label || '节点详情' }}</text>
      <view style="width: 80rpx;" />
    </view>

    <view v-if="node" class="content">
      <NodeHeroCard :node="node" :connectedCount="connectedNodes.length" />

      <!-- ── 织记 · 思考链节点 ── -->
      <template v-if="node.sourceType === 'zhiji'">
        <view class="section">
          <text class="section-title">思考链回顾</text>
          <view v-if="chainTotal > 0" class="chain-steps">
            <view v-for="(step, i) in chainSteps" :key="i" class="step-row">
              <view class="step-dot" :class="'dot-' + (i === chainTotal - 1 ? 'last' : 'mid')" />
              <view class="step-line" v-if="i < chainTotal - 1" />
              <view class="step-body">
                <text class="step-label">{{ step.label }}</text>
                <text class="step-text">{{ step.content }}</text>
              </view>
            </view>
          </view>
          <EmptyState v-else emoji="◎" text="暂无法加载思考链内容" />
        </view>
      </template>

      <!-- ── 心宝 · 对话节点 ── -->
      <template v-else-if="node.sourceType === 'xinbao'">
        <view class="section" v-if="conversation">
          <text class="section-summary">共 {{ conversation.messageCount }} 条对话，聚焦于「{{ node.label }}」</text>
          <view class="convo-preview">
            <view v-for="msg in conversationPreview" :key="msg.id" class="c-msg" :class="'c-' + msg.role">
              <text class="c-role">{{ msg.role === 'user' ? '💬' : '🌿' }}</text>
              <text class="c-content">{{ msg.content }}</text>
            </view>
          </view>
          <view class="view-full-btn pressable" @click="goConversation">
            <text class="view-full-text">查看完整对话</text>
            <text class="view-full-arrow">›</text>
          </view>
        </view>
        <EmptyState v-else emoji="◎" text="对话已被删除" />
      </template>

      <!-- ── 其他 / 旧数据 ── -->
      <template v-else>
        <view class="section">
          <text class="section-title">节点信息</text>
          <view class="info-card">
            <view class="info-row">
              <text class="info-label">类型</text>
              <text class="info-value">{{ sourceLabel }}</text>
            </view>
            <view class="info-row">
              <text class="info-label">状态</text>
              <text class="info-value">{{ statusLabel }}</text>
            </view>
            <view v-if="node.delta !== undefined" class="info-row">
              <text class="info-label">闭合度</text>
              <text class="info-value">δ={{ node.delta }}</text>
            </view>
          </view>
        </view>
      </template>

      <!-- Connected nodes -->
      <view class="section">
        <text class="section-title">连接节点</text>
        <view v-if="connectedNodes.length" class="conn-list">
          <view v-for="cn in connectedNodes" :key="cn.id" class="conn-chip pressable" @click="goNodeDetail(cn.id)">
            <view class="conn-dot" :class="getConnClass(cn)" />
            <text>{{ cn.label }}</text>
          </view>
        </view>
        <text v-else class="empty-text">暂无连接节点</text>
      </view>
    </view>

    <EmptyState v-else emoji="◎" text="节点不存在" />
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { xinwangState } from '../../store/useXinwangStore.js'
import { zhijiState } from '../../store/useZhijiStore.js'
import { xinbaoState } from '../../store/useXinbaoStore.js'
import EmptyState from '../../components/EmptyState.vue'
import NodeHeroCard from './NodeHeroCard.vue'
import { getConnDotClass } from '../../utils/emotionColors.js'

const node = ref(null)

onLoad((options) => {
  if (options && options.id) {
    node.value = xinwangState.nodes.find(n => n.id === options.id)
  }
})

const sourceLabel = computed(() => {
  const map = { 'zhiji': '思考链', 'xinbao': '心宝对话' }
  return map[node.value && node.value.sourceType] || '心网节点'
})

const statusLabel = computed(() => {
  const map = { 'completed': '已闭合', 'in-progress': '进行中', 'suspended': '已悬置' }
  return map[node.value && node.value.status] || '未知'
})

function getConnClass(n) {
  return getConnDotClass(n)
}

const connectedNodes = computed(() => {
  if (!node.value) return []
  const nodeEdges = xinwangState.edges.filter(e => e.from === node.value.id || e.to === node.value.id)
  const ids = nodeEdges.map(e => e.from === node.value.id ? e.to : e.from)
  return xinwangState.nodes.filter(n => ids.includes(n.id))
})

// ── zhiji: parse thinking-chain steps ──
const record = computed(() => {
  if (!node.value) return null
  return zhijiState.records.find(r => r.id === node.value.sourceId)
})

const chainSteps = computed(() => {
  if (!record.value || record.value.type !== 'thinking-chain') return []
  const content = record.value.content || ''
  const blocks = content.split(/\n\n(?=【)/)
  return blocks.map(b => {
    const match = b.match(/【(.+?)】\n(.+)/s)
    return match ? { label: match[1], content: match[2].trim() } : null
  }).filter(Boolean)
})

const chainTotal = computed(() => chainSteps.value.length)

// ── xinbao: fetch archived conversation ──
const conversation = computed(() => {
  if (!node.value) return null
  return xinbaoState.history.find(h => h.id === node.value.sourceId)
})

const conversationPreview = computed(() => {
  if (!conversation.value) return []
  const msgs = conversation.value.messages || []
  return msgs.slice(-6).filter(m => m.role === 'user' || m.role === 'xinbao')
})

function goConversation() { /* navigate to conversation detail */ }

function goNodeDetail(nodeId) {
  uni.redirectTo({ url: '/pages/xinwang/node-detail?id=' + nodeId })
}

function goBack() { uni.navigateBack({ delta: 1 }) }
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';
@import '@/styles/mixins.scss';

.page-container { @include page-container; padding-top: calc(env(safe-area-inset-top) + 88rpx); }

.header {
  position: fixed; top: 0; left: 0; right: 0; z-index: 100;
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 $sp-page-margin; padding-top: constant(safe-area-inset-top);
  padding-top: env(safe-area-inset-top); padding-bottom: 16rpx;
  background: rgba($color-background, 0.8); backdrop-filter: blur(20rpx);
}

.back-btn { width: 80rpx; height: 80rpx; display: flex; align-items: center; justify-content: center; }
.back-icon { font-size: 48rpx; color: $color-primary; }
.header-title { font-size: $fs-headline-sm; font-weight: 600; color: $color-primary; }

.content { padding: 0 $sp-page-margin; }

// Section common
.section { margin-bottom: $sp-module-gap; }
.section-title { display: block; font-size: $fs-headline-sm; font-weight: 600; color: $color-on-surface; margin-bottom: 24rpx; }
.section-summary { display: block; font-size: $fs-body-md; color: $color-on-surface-variant; margin-bottom: 24rpx; line-height: 1.6; }

// Chain steps
.chain-steps { display: flex; flex-direction: column; gap: 0; }
.step-row { display: flex; gap: 24rpx; padding-bottom: 32rpx; position: relative; }
.step-dot { flex-shrink: 0; width: 16rpx; height: 16rpx; border-radius: $radius-full; margin-top: 8rpx; position: relative; z-index: 1; }
.dot-mid { background-color: $color-primary; }
.dot-last { background-color: $color-primary; box-shadow: 0 0 0 6rpx rgba($color-primary-container, 0.3); }
.step-line { position: absolute; left: 7rpx; top: 24rpx; width: 2rpx; height: calc(100% + 32rpx); background: rgba($color-primary, 0.2); }
.step-body { flex: 1; }
.step-label { display: block; font-size: $fs-label-sm; font-weight: 600; color: $color-primary; margin-bottom: 8rpx; }
.step-text { font-size: $fs-body-md; color: $color-on-surface; line-height: 1.6; }

// Conversation preview
.convo-preview { display: flex; flex-direction: column; gap: 16rpx; margin-bottom: 24rpx; }
.c-msg { display: flex; gap: 12rpx; padding: 20rpx 24rpx; border-radius: $radius-default; }
.c-user { background-color: rgba($color-primary-container, 0.15); }
.c-xinbao { background-color: $color-surface-container-lowest; }
.c-role { font-size: 28rpx; flex-shrink: 0; width: 40rpx; }
.c-content { font-size: $fs-body-md; color: $color-on-surface; @include text-truncate(2); }

.view-full-btn { display: flex; align-items: center; justify-content: center; gap: 8rpx; padding: 24rpx; background-color: $color-surface-container-low; border-radius: $radius-default; }
.view-full-text { font-size: $fs-label-md; color: $color-primary; font-weight: 600; }
.view-full-arrow { font-size: 36rpx; color: $color-primary; }

// Connected nodes
.conn-list { display: flex; flex-wrap: wrap; gap: 16rpx; }
.conn-chip { display: flex; align-items: center; gap: 12rpx; padding: 16rpx 24rpx; border-radius: $radius-full; font-size: $fs-label-md; background-color: rgba($color-surface-container-low, 0.8); color: $color-on-surface-variant; transition: all $transition-press;
  &:active { transform: scale(0.95); background-color: rgba($color-primary-container, 0.3); } }
.conn-dot { width: 12rpx; height: 12rpx; border-radius: $radius-full; }
.conn-hub { background: $color-primary; }
.conn-default { background: $color-on-surface-variant; }
.conn-blue { background: $color-secondary; }
.conn-green { background: $color-tertiary; }
.conn-purple { background: #a855f7; }
.conn-orange { background: #fb923c; }
.conn-gold { background: #facc15; }

.empty-text { font-size: $fs-body-md; color: rgba($color-on-surface-variant, 0.5); }

// Info card
.info-card { background: $color-surface-container-lowest; border-radius: $radius-default; padding: 24rpx; }
.info-row { display: flex; justify-content: space-between; padding: 16rpx 0; border-bottom: 1rpx solid rgba($color-on-surface-variant, 0.1);
  &:last-child { border-bottom: none; } }
.info-label { font-size: $fs-body-md; color: rgba($color-on-surface-variant, 0.6); }
.info-value { font-size: $fs-body-md; font-weight: 600; color: $color-on-surface; }

.pressable:active { opacity: 0.7; }
</style>
