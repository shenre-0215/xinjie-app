<template>
  <view class="page-container">
    <view class="header">
      <view class="back-btn pressable" @click="goBack">
        <text class="back-icon">‹</text>
      </view>
      <text class="header-title">内心世界</text>
      <view style="width: 80rpx;" />
    </view>

    <view class="content">
      <view class="intro">
        <text class="intro-title">你正在成为你自己</text>
        <text class="intro-subtitle">一条条细碎的思考，慢慢长出了独属于你的形状</text>
      </view>

      <view class="columns">
        <!-- 世相 -->
        <view class="column-card">
          <view class="card-head">
            <view class="card-head-left">
              <view class="col-icon col-icon-primary"><text>☁</text></view>
              <view class="col-title-wrap">
                <text class="col-title">世相 · 世界观</text>
              </view>
            </view>
            <view class="card-menu pressable" @click="openMenu('shixiang')">
              <text class="menu-dots">⋯</text>
            </view>
          </view>
          <view class="card-desc">
            <text class="desc-text">我们望向世界的每一眼，最终都落回了自己身上。万物是内心的投影，世界是照见灵魂的镜子。</text>
          </view>
          <view class="card-body">
            <view
              v-for="item in worldview.shixiang"
              :key="item.id"
              class="body-item"
              :class="{ 'item-anchor': item.isAnchor }"
              @click="toggleAnchor('shixiang', item.id)"
            >
              <text class="item-text">{{ item.content }}</text>
              <text v-if="item.date" class="item-date">{{ item.date }}</text>
              <text v-if="item.isAnchor" class="anchor-tag">锚点</text>
            </view>
            <view v-if="!worldview.shixiang.length" class="body-empty">还没有条目</view>
          </view>
        </view>

        <!-- 我行 -->
        <view class="column-card">
          <view class="card-head">
            <view class="card-head-left">
              <view class="col-icon col-icon-secondary"><text>🌳</text></view>
              <view class="col-title-wrap">
                <text class="col-title">我行 · 人生观</text>
              </view>
            </view>
            <view class="card-menu pressable" @click="openMenu('woxing')">
              <text class="menu-dots">⋯</text>
            </view>
          </view>
          <view class="card-desc">
            <text class="desc-text">不必等找到答案再启程。往前走的每一步里，你正慢慢活成自己的答案。</text>
          </view>
          <view class="card-body">
            <view
              v-for="item in worldview.woxing"
              :key="item.id"
              class="body-item"
              :class="{ 'item-anchor': item.isAnchor }"
              @click="toggleAnchor('woxing', item.id)"
            >
              <text class="item-text">{{ item.content }}</text>
              <text v-if="item.date" class="item-date">{{ item.date }}</text>
              <text v-if="item.isAnchor" class="anchor-tag">锚点</text>
            </view>
            <view v-if="!worldview.woxing.length" class="body-empty">还没有条目</view>
          </view>
        </view>

        <!-- 心秤 -->
        <view class="column-card">
          <view class="card-head">
            <view class="card-head-left">
              <view class="col-icon col-icon-tertiary"><text>⚖</text></view>
              <view class="col-title-wrap">
                <text class="col-title">心秤 · 价值观</text>
              </view>
            </view>
            <view class="card-menu pressable" @click="openMenu('xincheng')">
              <text class="menu-dots">⋯</text>
            </view>
          </view>
          <view class="card-desc">
            <text class="desc-text">你反复做出的选择，就是心秤上最重的砝码。价值从不在头脑的道理里，只藏在每一次真实的取舍之间。</text>
          </view>
          <view class="card-body">
            <view
              v-for="item in worldview.xincheng"
              :key="item.id"
              class="body-item"
              :class="{ 'item-anchor': item.isAnchor }"
              @click="toggleAnchor('xincheng', item.id)"
            >
              <text class="item-text">{{ item.content }}</text>
              <text v-if="item.date" class="item-date">{{ item.date }}</text>
              <text v-if="item.isAnchor" class="anchor-tag">锚点</text>
            </view>
            <view v-if="!worldview.xincheng.length" class="body-empty">还没有条目</view>
          </view>
        </view>
      </view>

      <view class="recommendations">
        <view class="rec-header">
          <text class="rec-title">灵感启迪</text>
          <text class="rec-icon">✨</text>
        </view>
        <scroll-view class="rec-scroll" scroll-x :show-scrollbar="false">
          <view
            v-for="rec in xinwangState.recommendations"
            :key="rec.title"
            class="rec-card pressable"
            @click="acceptRecommendation(rec)"
          >
            <text class="rec-card-title">"{{ rec.title }}"</text>
            <text class="rec-card-desc">{{ rec.desc }}</text>
          </view>
        </scroll-view>
      </view>
    </view>

    <!-- FAB -->
    <view class="fab pressable" @click="showAddDialog = true">
      <text class="fab-icon">＋</text>
    </view>

    <!-- Add dialog -->
    <view v-if="showAddDialog" class="dialog-mask" @click="showAddDialog = false">
      <view class="dialog-panel" @click.stop>
        <text class="dialog-title">添加三观条目</text>
        <view class="dialog-cats">
          <text v-for="cat in cats" :key="cat.key" class="dialog-cat pressable"
            :class="{ 'cat-active': addCat === cat.key }"
            @click="addCat = cat.key">{{ cat.label }}</text>
        </view>
        <input class="dialog-input" v-model="addContent" placeholder="写下你的想法..." @confirm="addItem" />
        <view class="dialog-btn pressable" @click="addItem">
          <text class="dialog-btn-text">确认加入</text>
        </view>
      </view>
    </view>

    <!-- Column menu -->
    <view v-if="menuCat" class="menu-mask" @click="menuCat = ''">
      <view class="menu-panel" @click.stop>
        <text class="menu-title">管理条目</text>
        <view class="menu-items">
          <view
            v-for="item in worldview[menuCat]"
            :key="item.id"
            class="menu-row"
          >
            <text class="menu-item-text">{{ item.content }}</text>
            <view class="menu-remove pressable" @click="removeItem(menuCat, item)">
              <text class="remove-text">移除</text>
            </view>
          </view>
          <view v-if="!worldview[menuCat] || !worldview[menuCat].length" class="menu-empty">还没有条目</view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { xinwangState, addWorldviewItem, toggleAnchor, removeWorldviewItem, refreshRecommendations } from '../../store/useXinwangStore.js'

const worldview = xinwangState.worldview
const showAddDialog = ref(false)
const addCat = ref('shixiang')
const addContent = ref('')

onMounted(() => { refreshRecommendations() })
const menuCat = ref('')

const cats = [
  { key: 'shixiang', label: '世相' },
  { key: 'woxing', label: '我行' },
  { key: 'xincheng', label: '心秤' }
]

function goBack() { uni.navigateBack({ delta: 1 }) }

function openMenu(cat) { menuCat.value = cat }

function addItem() {
  const c = addContent.value.trim()
  if (!c) return
  addWorldviewItem(addCat.value, c)
  addContent.value = ''
  showAddDialog.value = false
  uni.showToast({ title: '已加入', icon: 'success' })
}

function removeItem(cat, item) {
  removeWorldviewItem(cat, item.id)
  uni.showToast({ title: '已移除', icon: 'success' })
}

function acceptRecommendation(rec) {
  const catNames = { shixiang: '世相·世界观', woxing: '我行·人生观', xincheng: '心秤·价值观' }
  const catName = catNames[rec.cat] || '三观体系'
  uni.showModal({
    title: '加入三观体系？',
    content: `将"${rec.title}"加入${catName}？`,
    success: (res) => {
      if (res.confirm) {
        addWorldviewItem(rec.cat || 'shixiang', rec.title)
        uni.showToast({ title: '已加入', icon: 'success' })
      }
    }
  })
}
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
  background-color: rgba($color-background, 0.85); backdrop-filter: blur(20rpx);
}
.back-btn { width: 80rpx; height: 80rpx; display: flex; align-items: center; justify-content: center; }
.back-icon { font-size: 48rpx; color: $color-primary; font-weight: 300; }
.header-title { font-size: $fs-headline-sm; font-weight: 600; color: $color-primary; }

.content { padding: 0 $sp-page-margin; padding-bottom: 200rpx; }
.intro { margin-bottom: $sp-module-gap; padding-top: 16rpx; }
.intro-title {
  display: block; font-family: $font-headline;
  font-size: 52rpx; font-weight: 700; color: $color-primary;
  letter-spacing: 0.03em; margin-bottom: 16rpx; line-height: 1.3;
}
.intro-subtitle { font-size: $fs-label-md; color: rgba($color-on-surface-variant, 0.55); letter-spacing: 0.02em; }

.columns { display: flex; flex-direction: column; gap: 48rpx; margin-bottom: $sp-module-gap; }

/* Column card */
.column-card {
  background-color: $color-surface-container-lowest; border-radius: $radius-lg; box-shadow: $shadow-healing; overflow: hidden;
}
.card-head {
  display: flex; align-items: center; justify-content: space-between;
  padding: 40rpx 40rpx 16rpx;
}
.card-head-left { display: flex; align-items: center; gap: 24rpx; }

.col-icon {
  width: 88rpx; height: 88rpx; border-radius: $radius-full;
  display: flex; align-items: center; justify-content: center; font-size: 40rpx;
}
.col-icon-primary { background-color: rgba($color-primary-container, 0.3); }
.col-icon-secondary { background-color: rgba($color-secondary-container, 0.3); }
.col-icon-tertiary { background-color: rgba($color-tertiary-container, 0.3); }

.col-title-wrap { display: flex; flex-direction: column; gap: 4rpx; }
.col-title { font-size: $fs-headline-sm; font-weight: 600; color: $color-on-surface; }

.card-menu { width: 72rpx; height: 72rpx; display: flex; align-items: center; justify-content: center; border-radius: $radius-full; }
.menu-dots { font-size: 44rpx; color: $color-on-surface-variant; font-weight: 700; letter-spacing: 2rpx; }

.card-desc { padding: 4rpx 40rpx 28rpx; }
.desc-text { font-size: 26rpx; color: rgba($color-on-surface-variant, 0.5); line-height: 1.8; display: block; }

.card-body { padding: 0 40rpx 32rpx; display: flex; flex-wrap: wrap; gap: 16rpx; }
.body-item {
  display: flex; align-items: center; gap: 12rpx;
  padding: 16rpx 28rpx; border-radius: $radius-full;
  background-color: $color-surface-container-low;
}
.item-anchor {
  background-color: rgba($color-secondary-container, 0.35); border: 2rpx solid rgba($color-secondary-fixed, 0.5);
}
.item-text { font-size: $fs-body-md; color: $color-on-surface; }
.anchor-tag { font-size: $fs-label-sm; font-weight: 600; color: $color-secondary; }
.item-date { font-size: 20rpx; color: rgba($color-on-surface-variant, 0.35); margin-left: auto; }
.body-empty { font-size: $fs-label-md; color: rgba($color-on-surface-variant, 0.35); padding: 16rpx 0; }

.recommendations { margin-bottom: $sp-module-gap; }
.rec-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 32rpx; }
.rec-title { font-size: $fs-headline-sm; font-weight: 600; color: $color-on-surface; }
.rec-icon { font-size: 40rpx; }
.rec-scroll { display: flex; white-space: nowrap; }
.rec-card {
  display: inline-flex; flex-direction: column; gap: 16rpx; min-width: 480rpx;
  padding: 40rpx; background-color: rgba($color-primary-container, 0.2);
  border-radius: $radius-default; margin-right: 24rpx;
}
.rec-card-title { font-size: $fs-headline-sm; font-weight: 600; color: $color-primary; }
.rec-card-desc { font-size: $fs-label-md; color: $color-on-surface-variant; }

.fab {
  position: fixed; right: $sp-page-margin; bottom: 200rpx;
  width: 112rpx; height: 112rpx; border-radius: $radius-full;
  background-color: $color-primary; display: flex; align-items: center; justify-content: center;
  box-shadow: $shadow-btn; z-index: 50;
}
.fab-icon { font-size: 56rpx; color: $color-on-primary; }

/* Add dialog */
.dialog-mask { position: fixed; inset: 0; background-color: rgba(0,0,0,0.3); z-index: 200; display: flex; align-items: flex-end; }
.dialog-panel { width: 100%; padding: 48rpx $sp-page-margin 80rpx; background-color: $color-surface-container-lowest; border-radius: $radius-lg $radius-lg 0 0; }
.dialog-title { display: block; font-size: $fs-headline-sm; font-weight: 600; color: $color-on-surface; margin-bottom: 32rpx; }
.dialog-cats { display: flex; gap: 24rpx; margin-bottom: 32rpx; }
.dialog-cat { padding: 16rpx 40rpx; border-radius: $radius-full; font-size: $fs-label-md; background-color: $color-surface-container-low; color: $color-on-surface-variant; }
.cat-active { background-color: $color-primary; color: $color-on-primary; }
.dialog-input { height: 88rpx; background-color: $color-surface-container-low; border-radius: $radius-default; padding: 0 32rpx; font-size: $fs-body-md; margin-bottom: 32rpx; width: 100%; }
.dialog-btn { padding: 28rpx; background-color: $color-primary; border-radius: $radius-full; text-align: center; }
.dialog-btn-text { font-size: $fs-headline-sm; font-weight: 600; color: $color-on-primary; }

/* Menu panel */
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
