<template>
  <view class="page-container">
    <view class="header">
      <view class="back-btn pressable" @click="goBack">
        <text class="back-icon">‹</text>
      </view>
      <view class="header-center">
        <text class="header-title">分享到织光</text>
        <view class="publish-btn pressable" :class="{ 'btn-active': content.trim() }" @click="publish">
          <text class="publish-text">发布</text>
        </view>
      </view>
      <view class="header-spacer" />
    </view>

    <view class="editor-body">
      <!-- Content -->
      <textarea
        class="content-input"
        v-model="content"
        placeholder="此刻想分享什么感受？..."
        placeholder-style="color: rgba(65, 73, 67, 0.3); font-size: 34rpx;"
        :adjust-position="true"
        :show-confirm-bar="false"
        :cursor-spacing="24"
        maxlength="2000"
      />

      <!-- Image picker & preview -->
      <view class="image-section">
        <view v-if="imagePreview" class="image-preview-wrap">
          <image :src="imagePreview" mode="widthFix" class="image-preview" />
          <view class="image-remove-btn pressable" @click="removeImage">
            <text class="remove-icon">✕</text>
          </view>
          <view v-if="uploading" class="upload-mask">
            <text class="upload-text">上传中...</text>
          </view>
        </view>
        <view v-if="!imagePreview" class="image-picker-btn pressable" @click="pickImage">
          <text class="image-picker-icon">📷</text>
          <text class="image-picker-text">添加图片</text>
        </view>
      </view>

      <!-- Tags -->
      <view class="tags-section">
        <view class="tags-row">
          <view class="add-tag-btn pressable" @click="showTagInput = true">
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

        <!-- Category select -->
        <view class="cat-row">
          <text class="cat-label">分类</text>
          <scroll-view class="cat-scroll" scroll-x :show-scrollbar="false">
            <text
              v-for="cat in cats"
              :key="cat"
              class="cat-option pressable"
              :class="{ 'cat-selected': category === cat }"
              @click="category = cat"
            ># {{ cat }}</text>
          </scroll-view>
        </view>
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

    <!-- Tag input -->
    <view v-if="showTagInput" class="mask" @click="showTagInput = false">
      <view class="tag-panel" @click.stop>
        <input
          class="tag-input"
          v-model="newTag"
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
const showTagInput = ref(false)
const newTag = ref('')

// Image state
const imagePreview = ref('')   // local temp path for preview
const imageFileID = ref('')    // cloud file ID after upload
const uploading = ref(false)

onLoad((options) => {
  if (options && options.content) {
    content.value = decodeURIComponent(options.content)
  }
})

const cats = ['宁静', '觉察', '释然', '温暖', '陪伴', '感恩', '成长']

function goBack() {
  if (content.value.trim() || imagePreview.value) {
    uni.showModal({
      title: '放弃编辑？',
      content: '内容不会保存',
      success: (res) => { if (res.confirm) uni.navigateBack({ delta: 1 }) }
    })
  } else {
    uni.navigateBack({ delta: 1 })
  }
}

async function publish() {
  if (!content.value.trim()) {
    uni.showToast({ title: '写点什么吧', icon: 'none' })
    return
  }
  addPost({
    content: content.value.trim(),
    tags: [...tags.value],
    category: category.value,
    anonymous: anonymous.value,
    image: imageFileID.value || imagePreview.value  // prefer cloud fileID, fallback to temp path
  })
  uni.showToast({ title: '分享成功 ✨', icon: 'success' })
  setTimeout(() => uni.navigateBack({ delta: 1 }), 600)
}

// ====== Image picker & upload ======
async function pickImage() {
  try {
    const res = await uni.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera']
    })
    if (res.tempFilePaths && res.tempFilePaths.length > 0) {
      const tempPath = res.tempFilePaths[0]
      imagePreview.value = tempPath
      // Upload to uniCloud storage
      await uploadImage(tempPath)
    }
  } catch (e) {
    if (e.errMsg && e.errMsg.includes('cancel')) return
    console.error('[publish] chooseImage failed:', e.errMsg || e)
    uni.showToast({ title: '无法选择图片', icon: 'none' })
  }
}

async function uploadImage(tempPath) {
  uploading.value = true
  try {
    // Try uniCloud upload (works in mini program / app with uniCloud enabled)
    if (typeof uniCloud !== 'undefined' && uniCloud.uploadFile) {
      const ext = tempPath.split('.').pop() || 'jpg'
      const fileName = `zhiguang/${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`
      const uploadRes = await uniCloud.uploadFile({
        filePath: tempPath,
        cloudPath: fileName
      })
      if (uploadRes.fileID) {
        imageFileID.value = uploadRes.fileID
        console.log('[publish] Image uploaded:', uploadRes.fileID)
      }
    }
  } catch (e) {
    console.warn('[publish] Cloud upload failed, keeping local path:', e.errMsg || e)
    // Keep temp path as fallback (works for preview, won't persist to cloud)
  } finally {
    uploading.value = false
  }
}

function removeImage() {
  imagePreview.value = ''
  imageFileID.value = ''
  uploading.value = false
}

function addTag() {
  const t = newTag.value.trim()
  if (t && !tags.value.includes(t)) tags.value.push(t)
  newTag.value = ''
  showTagInput.value = false
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
  @include page-container;
  padding-top: 0;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.header {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  padding: 0 32rpx;
  padding-top: constant(safe-area-inset-top);
  padding-top: env(safe-area-inset-top);
  padding-bottom: 16rpx;
  background-color: $color-background;
}

.back-btn {
  width: 64rpx;
  height: 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.back-icon { font-size: 44rpx; color: $color-on-surface-variant; font-weight: 300; }

.header-center {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 28rpx;
}

.header-title {
  font-size: $fs-headline-sm;
  font-weight: 600;
  color: $color-on-surface;
}

.header-spacer {
  width: 64rpx;
  flex-shrink: 0;
}

.publish-btn {
  padding: 10rpx 36rpx;
  border-radius: $radius-full;
  background-color: rgba($color-primary-container, 0.2);
  flex-shrink: 0;
}

.btn-active { background-color: $color-primary; }

.publish-text {
  font-size: $fs-label-md;
  color: $color-primary;
  font-weight: 600;
}

.btn-active .publish-text { color: $color-on-primary; }

.editor-body {
  padding: 0 $sp-page-margin;
}

.content-input {
  width: 100%;
  min-height: 400rpx;
  font-size: $fs-body-lg;
  line-height: 1.8;
  color: $color-on-surface;
  padding: 0;
  margin-bottom: 24rpx;
}

/* Image picker */
.image-section {
  margin-bottom: $sp-module-gap;
}

.image-picker-btn {
  display: flex;
  align-items: center;
  gap: 12rpx;
  padding: 28rpx 32rpx;
  border-radius: $radius-default;
  background-color: $color-surface-container-low;
  border: 2rpx dashed $color-outline-variant;
}

.image-picker-icon { font-size: 36rpx; }

.image-picker-text {
  font-size: $fs-label-md;
  color: $color-on-surface-variant;
}

.image-preview-wrap {
  position: relative;
  border-radius: $radius-default;
  overflow: hidden;
  background-color: $color-surface-container-low;
}

.image-preview {
  width: 100%;
  display: block;
}

.image-remove-btn {
  position: absolute;
  top: 16rpx;
  right: 16rpx;
  width: 56rpx;
  height: 56rpx;
  border-radius: $radius-full;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}

.remove-icon {
  color: #fff;
  font-size: 28rpx;
  font-weight: 700;
}

.upload-mask {
  position: absolute;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
}

.upload-text {
  color: #fff;
  font-size: $fs-body-md;
  padding: 16rpx 32rpx;
  background-color: rgba(0, 0, 0, 0.5);
  border-radius: $radius-full;
}

.tags-section {
  margin-bottom: $sp-module-gap;
}

.tags-row {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
  margin-bottom: 32rpx;
}

.add-tag-btn {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 12rpx 32rpx;
  border-radius: $radius-full;
  font-size: $fs-label-md;
  background-color: $color-surface-container-low;
  color: $color-on-surface-variant;
}

.tag-add-icon { font-size: 32rpx; }

.tag-chip {
  padding: 12rpx 28rpx;
  border-radius: $radius-full;
  font-size: $fs-label-md;
  background-color: rgba($color-secondary-container, 0.3);
  color: $color-on-secondary-container;
}

.cat-row {
  display: flex;
  align-items: center;
  gap: 24rpx;
}

.cat-label {
  font-size: $fs-label-md;
  color: $color-on-surface-variant;
  flex-shrink: 0;
}

.cat-scroll { display: flex; }

.cat-option {
  padding: 8rpx 24rpx;
  margin-right: 16rpx;
  border-radius: $radius-full;
  font-size: $fs-label-md;
  background-color: $color-surface-container-low;
  color: $color-on-surface-variant;
  white-space: nowrap;
}

.cat-selected {
  background-color: rgba($color-primary-container, 0.3);
  color: $color-primary;
}

.settings-bar {
  padding: 0 $sp-page-margin;
}

.setting-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 32rpx 0;
  border-top: 2rpx solid $color-surface-container;
}

.setting-label {
  font-size: $fs-body-md;
  color: $color-on-surface;
}

.toggle {
  width: 96rpx;
  height: 56rpx;
  border-radius: 28rpx;
  background-color: $color-surface-container-highest;
  position: relative;
  transition: background-color 0.2s;
}

.toggle-on { background-color: $color-primary; }

.toggle-knob {
  width: 44rpx;
  height: 44rpx;
  border-radius: $radius-full;
  background-color: $color-surface-container-lowest;
  position: absolute;
  top: 6rpx;
  left: 6rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
}

.toggle-on .toggle-knob { transform: translateX(40rpx); }

.setting-arrow {
  font-size: 48rpx;
  color: rgba($color-on-surface-variant, 0.4);
}

.mask {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.3);
  z-index: 200;
  display: flex;
  align-items: flex-end;
}

.tag-panel {
  width: 100%;
  padding: 48rpx $sp-page-margin 80rpx;
  background-color: $color-surface-container-lowest;
  border-radius: $radius-lg $radius-lg 0 0;
}

.tag-input {
  height: 88rpx;
  background-color: $color-surface-container-low;
  border-radius: $radius-default;
  padding: 0 32rpx;
  font-size: $fs-body-md;
}
</style>
