<template>
  <view class="page-container">
    <!-- Header -->
    <view class="header">
      <view class="back-btn pressable" @click="goBack">
        <text class="back-icon">‹</text>
      </view>
      <view class="header-center">
        <text class="header-title">分享到织光</text>
        <view class="publish-btn pressable" :class="{ 'btn-active': content.trim() }" @click="doPublish">
          <text class="publish-text">发布</text>
        </view>
      </view>
      <view class="header-spacer" />
    </view>

    <!-- Editor body -->
    <view class="editor-body">
      <textarea
        v-model="content"
        class="content-input"
        placeholder="此刻想分享什么感受？..."
        placeholder-style="color: rgba(65, 73, 67, 0.3); font-size: 34rpx;"
        :adjust-position="true"
        :show-confirm-bar="false"
        :cursor-spacing="24"
        :maxlength="2000"
      />

      <!-- Image section -->
      <view class="image-section">
        <view v-if="imagePath" class="image-preview-wrap">
          <image :src="imagePath" mode="widthFix" class="image-preview" />
          <view class="image-remove-btn pressable" @click="removeImage">
            <text class="remove-icon">✕</text>
          </view>
          <view v-if="uploading" class="upload-mask">
            <text class="upload-text">上传中...</text>
          </view>
        </view>
        <view v-else class="image-picker-btn pressable" @click="pickImage">
          <text class="image-picker-icon">📷</text>
          <text class="image-picker-text">添加图片</text>
        </view>
      </view>

      <!-- Tags section -->
      <view class="tags-section">
        <view class="tags-row">
          <view class="add-tag-btn pressable" @click="showTagPanel = true">
            <text class="tag-add-icon">＋</text>
            <text>添加标签</text>
          </view>
          <text
            v-for="tag in tags"
            :key="tag"
            class="tag-chip pressable"
            @click="removeTag(tag)"
          >#{{ tag }}</text>
        </view>

        <view class="cat-row">
          <text class="cat-label">分类</text>
          <scroll-view class="cat-scroll" scroll-x :show-scrollbar="false">
            <text
              v-for="cat in categories"
              :key="cat"
              class="cat-option pressable"
              :class="{ 'cat-selected': category === cat }"
              @click="category = cat"
            ># {{ cat }}</text>
          </scroll-view>
        </view>
      </view>

      <!-- Settings -->
      <view class="settings-bar">
        <view class="setting-row">
          <text class="setting-label">匿名发布</text>
          <view class="toggle" :class="{ 'toggle-on': anonymous }" @click="anonymous = !anonymous">
            <view class="toggle-knob" />
          </view>
        </view>
        <view class="setting-row pressable" @click="importFromZhiji">
          <text class="setting-label">从织记导入</text>
          <text class="setting-arrow">›</text>
        </view>
      </view>
    </view>

    <!-- Tag bottom panel -->
    <view v-if="showTagPanel" class="mask" @click="showTagPanel = false">
      <view class="tag-panel" @click.stop>
        <input
          v-model="tagInput"
          class="tag-input"
          placeholder="输入标签"
          :focus="true"
          @confirm="addTag"
        />
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { addPost } from '../../store/useZhiguangStore.js'

const content = ref('')
const tags = ref([])
const category = ref('宁静')
const anonymous = ref(false)
const showTagPanel = ref(false)
const tagInput = ref('')
const imagePath = ref('')
const cloudFileID = ref('')
const uploading = ref(false)

const categories = ['宁静', '觉察', '释然', '温暖', '陪伴', '感恩', '成长']

onLoad((options) => {
  if (options && options.content) {
    content.value = decodeURIComponent(options.content)
  }
})

// ── actions ──

function goBack() {
  if (content.value.trim() || imagePath.value) {
    uni.showModal({
      title: '放弃编辑？',
      content: '内容不会保存',
      success: (res) => {
        if (res.confirm) uni.navigateBack({ delta: 1 })
      }
    })
  } else {
    uni.navigateBack({ delta: 1 })
  }
}

function doPublish() {
  if (!content.value.trim()) {
    uni.showToast({ title: '写点什么吧', icon: 'none' })
    return
  }
  addPost({
    content: content.value.trim(),
    tags: [...tags.value],
    category: category.value,
    anonymous: anonymous.value,
    image: cloudFileID.value || imagePath.value
  })
  uni.showToast({ title: '分享成功 ✨', icon: 'success' })
  setTimeout(() => uni.navigateBack({ delta: 1 }), 600)
}

async function pickImage() {
  try {
    const res = await uni.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera']
    })
    if (res.tempFilePaths && res.tempFilePaths.length > 0) {
      imagePath.value = res.tempFilePaths[0]
      await uploadToCloud(res.tempFilePaths[0])
    }
  } catch (e) {
    if (e.errMsg && e.errMsg.includes('cancel')) return
    console.error('[publish] chooseImage failed:', e.errMsg || e)
    uni.showToast({ title: '无法选择图片', icon: 'none' })
  }
}

async function uploadToCloud(filePath) {
  uploading.value = true
  try {
    // #ifdef MP-WEIXIN
    if (typeof uniCloud !== 'undefined' && uniCloud.uploadFile) {
      const ext = filePath.split('.').pop() || 'jpg'
      const cloudPath = `zhiguang/${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`
      const result = await uniCloud.uploadFile({ filePath, cloudPath })
      if (result.fileID) {
        cloudFileID.value = result.fileID
        console.log('[publish] Image uploaded:', result.fileID)
      }
    }
    // #endif
  } catch (e) {
    console.warn('[publish] Cloud upload failed, keeping local path:', e.errMsg || e)
  } finally {
    uploading.value = false
  }
}

function removeImage() {
  imagePath.value = ''
  cloudFileID.value = ''
  uploading.value = false
}

function addTag() {
  const val = tagInput.value.trim()
  if (val && !tags.value.includes(val)) {
    tags.value.push(val)
  }
  tagInput.value = ''
  showTagPanel.value = false
}

function removeTag(tag) {
  tags.value = tags.value.filter(t => t !== tag)
}

function importFromZhiji() {
  uni.showToast({ title: '开发中...', icon: 'none' })
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';
@import '@/styles/mixins.scss';

.page-container {
  min-height: 100vh;
  background-color: $color-background;
  padding-bottom: 160rpx;
  display: flex; flex-direction: column; overflow-y: auto;
}

// ── header ──
.header {
  flex-shrink: 0;
  display: flex; align-items: center;
  padding: 0 32rpx;
  padding-top: constant(safe-area-inset-top);
  padding-top: env(safe-area-inset-top);
  padding-bottom: 16rpx;
  background-color: $color-background;
}

.back-btn {
  width: 64rpx; height: 64rpx;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.back-icon { font-size: 48rpx; color: $color-on-surface-variant; font-weight: 300; }

.header-center {
  flex: 1; display: flex; align-items: center; justify-content: center; gap: 28rpx;
}

.header-title { font-size: $fs-headline-md; font-weight: 600; color: $color-on-surface; }

.publish-btn {
  padding: 8rpx 36rpx; border-radius: $radius-full;
  background-color: rgba($color-primary-container, 0.2); flex-shrink: 0;
}
.btn-active { background-color: $color-primary; }

.publish-text { font-size: $fs-body-sm; color: $color-primary; font-weight: 600; }
.btn-active .publish-text { color: $color-on-primary; }

.header-spacer { width: 64rpx; flex-shrink: 0; }

// ── editor body ──
.editor-body { padding: 0 $sp-page-margin; }

.content-input {
  width: 100%; min-height: 400rpx;
  font-size: $fs-body-lg; line-height: 1.8; color: $color-on-surface;
  padding: 0; margin-bottom: 24rpx;
}

// ── image ──
.image-section { margin-bottom: 56rpx; }

.image-picker-btn {
  display: flex; align-items: center; gap: 12rpx;
  padding: 28rpx 32rpx; border-radius: $radius-md;
  background-color: rgba($color-on-surface, 0.03);
  border: 2rpx dashed rgba($color-on-surface-variant, 0.2);
  &:active { opacity: 0.7; }
}
.image-picker-icon { font-size: 36rpx; }
.image-picker-text { font-size: $fs-body-sm; color: $color-on-surface-variant; }

.image-preview-wrap {
  position: relative; border-radius: $radius-md; overflow: hidden;
  background-color: rgba($color-on-surface, 0.03);
}
.image-preview { width: 100%; display: block; }

.image-remove-btn {
  position: absolute; top: 12rpx; right: 12rpx;
  width: 56rpx; height: 56rpx; border-radius: $radius-full;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex; align-items: center; justify-content: center;
}
.remove-icon { color: #fff; font-size: 28rpx; font-weight: 700; }

.upload-mask {
  position: absolute; inset: 0;
  background-color: rgba(0, 0, 0, 0.3);
  display: flex; align-items: center; justify-content: center;
}
.upload-text {
  color: #fff; font-size: $fs-body-md;
  padding: 16rpx 32rpx; background-color: rgba(0, 0, 0, 0.5);
  border-radius: $radius-full;
}

// ── tags ──
.tags-section { margin-bottom: 56rpx; }

.tags-row { display: flex; flex-wrap: wrap; gap: 16rpx; margin-bottom: 32rpx; }

.add-tag-btn {
  display: flex; align-items: center; gap: 8rpx;
  padding: 12rpx 32rpx 12rpx 24rpx; border-radius: $radius-full;
  font-size: $fs-body-sm; background-color: rgba($color-on-surface, 0.04);
  color: $color-on-surface-variant;
}

.tag-add-icon { font-size: 32rpx; }

.tag-chip {
  padding: 12rpx 28rpx; border-radius: $radius-full; font-size: $fs-body-sm;
  background-color: rgba($color-secondary-container, 0.3); color: $color-on-secondary-container;
}

.cat-row { display: flex; align-items: center; gap: 24rpx; }
.cat-label { font-size: $fs-body-sm; color: $color-on-surface-variant; flex-shrink: 0; }

.cat-scroll { display: flex; flex: 1; overflow-x: auto; }

.cat-option {
  padding: 8rpx 24rpx; margin-right: 16rpx; border-radius: $radius-full;
  font-size: $fs-body-sm; background-color: rgba($color-on-surface, 0.04);
  color: $color-on-surface-variant; white-space: nowrap;
}
.cat-selected { background-color: rgba($color-primary-container, 0.3); color: $color-primary; }

// ── settings ──
.settings-bar { padding: 0 $sp-page-margin; }

.setting-row {
  display: flex; align-items: center; justify-content: space-between;
  padding: 32rpx 0; border-top: 1rpx solid rgba($color-on-surface, 0.06);
}
.setting-label { font-size: $fs-body-md; color: $color-on-surface; }

// ── toggle ──
.toggle {
  width: 96rpx; height: 56rpx; border-radius: 28rpx;
  background-color: rgba($color-on-surface, 0.1); position: relative;
  transition: background-color 0.2s;
}
.toggle-on { background-color: $color-primary; }

.toggle-knob {
  width: 44rpx; height: 44rpx; border-radius: $radius-full;
  background-color: $color-on-primary;
  position: absolute; top: 6rpx; left: 6rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
}
.toggle-on .toggle-knob { transform: translateX(40rpx); }

.setting-arrow { font-size: 48rpx; color: rgba($color-on-surface-variant, 0.4); }

// ── mask + tag panel ──
.mask {
  position: fixed; inset: 0; background-color: rgba(0, 0, 0, 0.3); z-index: 200;
  display: flex; align-items: flex-end;
}

.tag-panel {
  width: 100%; padding: 48rpx $sp-page-margin 80rpx;
  background-color: $color-surface-container-lowest;
  border-radius: $radius-lg $radius-lg 0 0;
}

.tag-input {
  height: 88rpx; background-color: rgba($color-on-surface, 0.04);
  border-radius: $radius-md; padding: 0 32rpx; font-size: $fs-body-md;
}

// ── misc ──
.pressable:active { opacity: 0.7; }
</style>
