<template>
  <view class="page-container">
    <view class="header">
      <view class="back-btn pressable" @click="goBack">
        <text class="back-icon">‹</text>
      </view>
      <text class="header-title">{{ node?.label || '节点详情' }}</text>
      <view style="width: 80rpx;" />
    </view>

    <view v-if="node" class="content">
      <!-- Source badge -->
      <view class="source-bar">
        <text class="source-badge" :class="'badge-' + node.sourceType">{{ sourceLabel }}</text>
        <text v-if="node.delta !== undefined" class="delta-badge">δ {{ node.delta }}</text>
      </view>

      <!-- ── 织记 · 思考链节点 ── -->
      <template v-if="node.sourceType === 'zhiji'">
        <view class="status-area">
          <view class="node-visual" :class="'node-' + (node.status || 'completed')">
            <text class="node-emoji">{{ statusEmoji }}</text>
          </view>
          <text class="status-text">{{ statusLabel }}</text>
        </view>

        <view class="section">
          <text class="section-title">思考链回顾</text>
          <view v-if="chainSteps.length" class="chain-steps">
            <view v-for="(step, i) in chainSteps" :key="i" class="step-row">
              <view class="step-dot" :class="'dot-' + (i === chainSteps.length - 1 ? 'last' : 'mid')" />
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
        <view class="status-area">
          <view class="node-visual node-xinbao">
            <text class="node-emoji">🌿</text>
          </view>
          <text class="status-text">心宝对话 · 已归档</text>
        </view>

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
        <view class="status-area">
          <view class="node-visual" :class="'node-' + (node.status || 'completed')">
            <text class="node-emoji">{{ statusEmoji }}</text>
          </view>
          <text class="status-text">{{ statusLabel }}</text>
        </view>
      </template>

      <!-- Connected nodes (common) -->
      <view class="section">
        <text class="section-title">连接节点</text>
        <view v-if="connectedNodes.length" class="conn-list">
          <text
            v-for="cn in connectedNodes"
            :key="cn.id"
            class="conn-chip"
          >{{ cn.label }}</text>
        </view>
        <text v-else class="empty-text">孤立的节点</text>
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

const node = ref(null)

onLoad((options) => {
  if (options && options.id) {
    node.value = xinwangState.nodes.find(n => n.id === options.id)
  }
})

// ── common ──

const sourceLabel = computed(() => {
  const map = { 'zhiji': '思考链', 'xinbao': '心宝对话' }
  return map[node.value?.sourceType] || '心网节点'
})

const statusEmoji = computed(() => {
  const map = { 'completed': '●', 'in-progress': '◌', 'suspended': '○' }
  return map[node.value?.status] || '○'
})

const statusLabel = computed(() => {
  const map = { 'completed': '已闭合', 'in-progress': '进行中', 'suspended': '已悬置' }
  return map[node.value?.status] || '未知'
})

const connectedNodes = computed(() => {
  if (!node.value) return []
  const nodeEdges = xinwangState.edges.filter(
    e => e.from === node.value.id || e.to === node.value.id
  )
  const ids = nodeEdges.map(e => e.from === node.value.id ? e.to : e.from)
  return xinwangState.nodes.filter(n => ids.includes(n.id))
})

// ── zhiji: parse thinking-chain steps from linked record ──

const record = computed(() => {
  if (!node.value) return null
  return zhijiState.records.find(r => r.id === node.value.sourceId)
})

const chainSteps = computed(() => {
  if (!record.value || record.value.type !== 'thinking-chain') return []
  const content = record.value.content || ''
  // Content format: 【觉察】\n...\n\n【拆解】\n...\n\n...
  const blocks = content.split(/\n\n(?=【)/)
  return blocks.map(b => {
    const match = b.match(/【(.+?)】\n(.+)/s)
    return match ? { label: match[1], content: match[2].trim() } : null
  }).filter(Boolean)
})

// ── xinbao: fetch archived conversation ──

const conversation = computed(() => {
  if (!node.value) return null
  return xinbaoState.history.find(h => h.id === node.value.sourceId)
})

const conversationPreview = computed(() => {
  if (!conversation.value) return []
  const msgs = conversation.value.messages || []
  // Show up to 6 most recent messages as preview
  return msgs.slice(-6).filter(m => m.role === 'user' || m.role === 'xinbao')
})

function goConversation() {
  if (!conversation.value) return
  // Navigate to xinbao history with this conversation open
  // Simplified: navigate to history page; user taps to view
}

// ── navigation ──

function goBack() {
  uni.navigateBack({ delta: 1 })
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
  background-color: $color-background;
}

.back-btn {
  width: 80rpx;
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.back-icon { font-size: 48rpx; color: $color-primary; font-weight: 300; }

.header-title {
  font-size: $fs-headline-sm;
  font-weight: 600;
  color: $color-primary;
}

.content { padding: 0 $sp-page-margin; }

// Source bar
.source-bar {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-bottom: 32rpx;
}

.source-badge {
  padding: 8rpx 24rpx;
  border-radius: $radius-full;
  font-size: $fs-label-sm;
  font-weight: 600;
}

.badge-zhiji { background-color: rgba($color-primary-container, 0.3); color: $color-on-primary-container; }
.badge-xinbao { background-color: rgba($color-secondary-container, 0.3); color: $color-on-secondary-container; }

.delta-badge {
  padding: 8rpx 20rpx;
  border-radius: $radius-full;
  font-size: $fs-label-sm;
  background-color: rgba($color-primary, 0.08);
  color: $color-primary;
  font-weight: 600;
}

// Status
.status-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60rpx 0 40rpx;
}

.node-visual {
  width: 160rpx;
  height: 160rpx;
  border-radius: $radius-full;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24rpx;
}

.node-emoji { font-size: 80rpx; }

.node-completed { background-color: $color-primary-container; }
.node-in-progress { border: 6rpx dashed $color-primary; }
.node-suspended { background-color: $color-tertiary-fixed-dim; opacity: 0.5; }
.node-xinbao { background-color: rgba($color-secondary-container, 0.3); }

.status-text {
  font-size: $fs-body-lg;
  color: $color-on-surface-variant;
}

// Section
.section { margin-bottom: $sp-module-gap; }

.section-title {
  display: block;
  font-size: $fs-headline-sm;
  font-weight: 600;
  color: $color-on-surface;
  margin-bottom: 24rpx;
}

.section-summary {
  display: block;
  font-size: $fs-body-md;
  color: $color-on-surface-variant;
  margin-bottom: 24rpx;
  line-height: 1.6;
}

// Chain steps
.chain-steps {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.step-row {
  display: flex;
  gap: 24rpx;
  padding-bottom: 32rpx;
}

.step-dot {
  flex-shrink: 0;
  width: 16rpx;
  height: 16rpx;
  border-radius: $radius-full;
  margin-top: 8rpx;
  position: relative;
}

.dot-mid { background-color: $color-primary; }
.dot-last { background-color: $color-primary; box-shadow: 0 0 0 6rpx rgba($color-primary-container, 0.3); }

.step-body {
  flex: 1;
}

.step-label {
  display: block;
  font-size: $fs-label-sm;
  font-weight: 600;
  color: $color-primary;
  margin-bottom: 8rpx;
}

.step-text {
  font-size: $fs-body-md;
  color: $color-on-surface;
  line-height: 1.6;
}

// Conversation preview
.convo-preview {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  margin-bottom: 24rpx;
}

.c-msg {
  display: flex;
  gap: 12rpx;
  padding: 20rpx 24rpx;
  border-radius: $radius-default;
}

.c-user { background-color: rgba($color-primary-container, 0.15); }
.c-xinbao { background-color: $color-surface-container-lowest; }

.c-role { font-size: 28rpx; flex-shrink: 0; width: 40rpx; }
.c-content { font-size: $fs-body-md; color: $color-on-surface; @include text-truncate(2); }

.view-full-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  padding: 24rpx;
  background-color: $color-surface-container-low;
  border-radius: $radius-default;
}

.view-full-text { font-size: $fs-label-md; color: $color-primary; font-weight: 600; }
.view-full-arrow { font-size: 36rpx; color: $color-primary; }

// Connected nodes
.conn-list {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.conn-chip {
  padding: 16rpx 32rpx;
  border-radius: $radius-full;
  font-size: $fs-label-md;
  background-color: rgba($color-primary-container, 0.2);
  color: $color-on-primary-container;
}

.empty-text {
  font-size: $fs-body-md;
  color: rgba($color-on-surface-variant, 0.5);
}
</style>
