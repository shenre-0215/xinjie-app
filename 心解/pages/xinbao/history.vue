<template>
  <view class="page-container">
    <view class="header">
      <view class="back-btn pressable" @click="goBack">
        <text class="back-icon">‹</text>
      </view>
      <text class="header-title">对话记录</text>
      <view class="menu-btn pressable" @click="openMenu">
        <text class="menu-icon">⋯</text>
      </view>
    </view>

    <!-- List of conversations -->
    <view v-if="xinbaoState.history.length && !viewingChat" class="history-list">
      <view
        v-for="chat in xinbaoState.history"
        :key="chat.id"
        class="history-card pressable-subtle"
        @click="viewChat(chat)"
      >
        <text class="chat-title">{{ chat.title }}</text>
        <view class="chat-meta">
          <text class="chat-date">{{ chat.date }}</text>
          <text class="chat-msgs">{{ chat.messageCount || '?' }} 条对话</text>
          <text class="chat-arrow">›</text>
        </view>
      </view>
    </view>

    <!-- Single chat detail view -->
    <view v-if="viewingChat" class="chat-detail">
      <view class="detail-header">
        <text class="detail-back" @click="viewingChat = null">‹ 返回</text>
        <text class="detail-title">{{ viewingChat.title }}</text>
      </view>
      <view class="detail-messages">
        <view
          v-for="msg in viewingChat.messages"
          :key="msg.id"
          class="d-msg"
          :class="'d-' + msg.role"
        >
          <text class="d-content">{{ msg.content }}</text>
        </view>
      </view>
    </view>

    <!-- Empty -->
    <EmptyState
      v-if="!xinbaoState.history.length && !viewingChat"
      emoji="◎"
      text="还没有对话记录"
      hint="和心宝聊完，记录会自动保存在这里"
    />

    <!-- Delete menu -->
    <view v-if="showMenu" class="menu-mask" @click="showMenu = false">
      <view class="menu-panel" @click.stop>
        <text class="menu-title">管理对话记录</text>
        <view class="menu-items">
          <view
            v-for="chat in xinbaoState.history"
            :key="chat.id"
            class="menu-row"
          >
            <text class="menu-item-text">{{ chat.title }}</text>
            <view class="menu-remove pressable" @click="removeChat(chat)">
              <text class="remove-text">删除</text>
            </view>
          </view>
          <view v-if="!xinbaoState.history.length" class="menu-empty">还没有对话记录</view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { xinbaoState, deleteHistory } from '../../store/useXinbaoStore.js'
import EmptyState from '../../components/EmptyState.vue'

const viewingChat = ref(null)
const showMenu = ref(false)

function goBack() {
  if (viewingChat.value) { viewingChat.value = null; return }
  uni.navigateBack({ delta: 1 })
}

function openMenu() { showMenu.value = true }

function viewChat(chat) { viewingChat.value = chat }

function removeChat(chat) {
  if (viewingChat.value?.id === chat.id) viewingChat.value = null
  deleteHistory(chat.id)
  uni.showToast({ title: '已删除', icon: 'success' })
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';
@import '@/styles/mixins.scss';

.page-container { @include page-container; padding-top: calc(env(safe-area-inset-top) + 88rpx); }

.header {
  position: fixed; top: 0; left: 0; right: 0; z-index: 100;
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 32rpx; padding-right: 200rpx;
  padding-top: constant(safe-area-inset-top);
  padding-top: env(safe-area-inset-top);
  padding-bottom: 16rpx; background-color: $color-background;
}
.back-btn { width: 80rpx; height: 80rpx; display: flex; align-items: center; justify-content: center; }
.back-icon { font-size: 48rpx; color: $color-primary; font-weight: 300; }
.header-title { font-family: $font-headline; font-size: $fs-headline-sm; font-weight: 600; color: $color-primary; }
.menu-btn { width: 64rpx; height: 64rpx; display: flex; align-items: center; justify-content: center; }
.menu-icon { font-size: 40rpx; color: $color-on-surface-variant; font-weight: 700; }

.history-list { padding: 0 $sp-page-margin; display: flex; flex-direction: column; gap: 16rpx; }
.history-card { padding: 36rpx 40rpx; background-color: $color-surface-container-lowest; border-radius: $radius-default; box-shadow: $shadow-healing; }
.chat-title { display: block; font-size: $fs-body-md; font-weight: 600; color: $color-on-surface; @include text-truncate(2); margin-bottom: 12rpx; line-height: 1.5; }
.chat-meta { display: flex; align-items: center; gap: 20rpx; }
.chat-date { font-size: $fs-label-sm; color: $color-outline; }
.chat-msgs { font-size: $fs-label-sm; color: rgba($color-on-surface-variant, 0.4); }
.chat-arrow { font-size: 28rpx; color: rgba($color-on-surface-variant, 0.4); margin-left: auto; }

.chat-detail { padding: 0 $sp-page-margin; }
.detail-header { display: flex; align-items: center; gap: 24rpx; padding: 24rpx 0; margin-bottom: 24rpx; border-bottom: 2rpx solid $color-surface-container; }
.detail-back { font-size: $fs-body-md; color: $color-primary; font-weight: 600; }
.detail-title { font-size: $fs-label-md; color: $color-on-surface-variant; @include text-truncate(1); }
.detail-messages { display: flex; flex-direction: column; gap: 32rpx; padding-bottom: 120rpx; }
.d-msg { max-width: 85%; padding: 32rpx 36rpx; border-radius: $radius-default; line-height: 1.6; }
.d-user { align-self: flex-end; background-color: rgba($color-primary-container, 0.4); border-bottom-right-radius: 8rpx; }
.d-xinbao { align-self: flex-start; background-color: $color-surface-container-low; border-bottom-left-radius: 8rpx; box-shadow: $shadow-healing; }
.d-content { font-size: $fs-body-md; color: $color-on-surface; white-space: pre-line; word-break: break-word; }

/* Delete menu panel */
.menu-mask { position: fixed; inset: 0; background-color: rgba(0,0,0,0.3); z-index: 200; display: flex; align-items: flex-end; }
.menu-panel { width: 100%; padding: 40rpx $sp-page-margin 80rpx; background-color: $color-surface-container-lowest; border-radius: $radius-lg $radius-lg 0 0; }
.menu-title { display: block; font-size: $fs-headline-sm; font-weight: 600; color: $color-on-surface; margin-bottom: 28rpx; }
.menu-items { display: flex; flex-direction: column; gap: 12rpx; max-height: 560rpx; overflow-y: auto; }
.menu-row { display: flex; align-items: center; justify-content: space-between; padding: 28rpx 32rpx; background-color: $color-surface-container-low; border-radius: $radius-default; }
.menu-item-text { font-size: $fs-body-md; color: $color-on-surface; flex: 1; @include text-truncate(1); }
.menu-remove { padding: 12rpx 28rpx; border-radius: $radius-full; background-color: rgba($color-error-container, 0.4); }
.remove-text { font-size: $fs-label-sm; color: $color-error; font-weight: 600; }
.menu-empty { font-size: $fs-body-md; color: rgba($color-on-surface-variant, 0.35); text-align: center; padding: 40rpx 0; }
</style>
