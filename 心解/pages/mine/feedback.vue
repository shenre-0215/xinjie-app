<template>
  <view class="page-container">
    <!-- #ifdef H5 -->
    <view class="h5-safe-top" />
    <!-- #endif -->

    <view class="header">
      <view class="back-btn pressable" @click="goBack">
        <text class="back-icon">‹</text>
      </view>
      <text class="header-title">反馈与帮助</text>
      <view style="width:80rpx" />
    </view>

    <view class="content">
      <!-- Feedback form -->
      <view class="form-section">
        <text class="section-label">你的声音很重要</text>
        <textarea
          v-model="feedbackText"
          class="feedback-textarea"
          placeholder="写下你的建议、感受或遇到的问题..."
          placeholder-style="color: rgba(65,73,67,0.3);"
          maxlength="500"
        />
        <view class="submit-btn pressable" @click="doSubmit">
          <text class="submit-text">发送反馈</text>
        </view>
      </view>

      <!-- FAQ -->
      <view class="help-section">
        <text class="section-label">常见问题</text>
        <view
          v-for="item in faqList"
          :key="item.q"
          class="help-card card pressable-subtle"
          @click="toggleFaq(item.q)"
        >
          <view class="help-header">
            <text class="help-q">{{ item.q }}</text>
            <text class="help-arrow">{{ expanded === item.q ? '∨' : '›' }}</text>
          </view>
          <text v-if="expanded === item.q" class="help-a">{{ item.a }}</text>
        </view>
      </view>

      <!-- App info -->
      <view class="about-section">
        <text class="about-name">心解</text>
        <text class="about-version">版本 1.0.0</text>
        <text class="about-desc">一个温柔的精神角落</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'

const feedbackText = ref('')
const expanded = ref('')

const faqList = [
  {
    q: '什么是思考链？',
    a: '思考链是一个结构化的自我反思工具，通过觉察→拆解→破局→实践→复盘五个步骤，帮助你梳理情绪和思维。'
  },
  {
    q: '心宝会记住我的对话吗？',
    a: '对话保存在你的设备本地，不会上传到云端。你可以随时在设置中清空对话记录。'
  },
  {
    q: '如何删除已发布的内容？',
    a: '在你的分享详情页中，点击右上角更多菜单即可找到删除选项。'
  },
  {
    q: '心网的节点代表什么？',
    a: '节点代表你在成长过程中形成的内在信念和认知单元，它们相互连接构成你的心网地图。'
  }
]

function goBack() {
  uni.navigateBack({ delta: 1 })
}

function toggleFaq(q) {
  expanded.value = expanded.value === q ? '' : q
}

function doSubmit() {
  if (!feedbackText.value.trim()) {
    uni.showToast({ title: '请先写点什么', icon: 'none' })
    return
  }
  uni.showToast({ title: '感谢你的反馈 🌿', icon: 'success' })
  feedbackText.value = ''
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

.back-btn {
  width: 80rpx; height: 80rpx;
  display: flex; align-items: center; justify-content: center;
}
.back-icon { font-size: 48rpx; color: $color-primary; font-weight: 300; }
.header-title { font-size: $fs-headline-md; font-weight: 600; color: $color-primary; }

.content { padding: 0 $sp-page-margin; }

.form-section { margin-bottom: 56rpx; }

.section-label {
  display: block; font-size: $fs-headline-sm; font-weight: 600;
  color: $color-on-surface; margin-bottom: 32rpx;
}

.feedback-textarea {
  width: 100%; min-height: 300rpx;
  padding: 40rpx;
  background-color: $color-surface-container-lowest;
  border-radius: $radius-md;
  font-size: $fs-body-md; color: $color-on-surface;
  box-shadow: $shadow-healing;
  margin-bottom: 32rpx;
  box-sizing: border-box;
}

.submit-btn {
  padding: 28rpx; background-color: $color-primary;
  border-radius: $radius-full; text-align: center;
}
.submit-text { font-size: $fs-headline-sm; font-weight: 600; color: $color-on-primary; }

.help-section { margin-bottom: 56rpx; }

.help-card {
  padding: 40rpx; margin-bottom: 16rpx;
  background-color: $color-surface-container-lowest;
  border-radius: $radius-md;
}

.help-header { display: flex; justify-content: space-between; align-items: center; }
.help-q { font-size: $fs-body-md; color: $color-on-surface; flex: 1; }
.help-arrow { font-size: 40rpx; color: rgba($color-on-surface-variant, 0.4); }

.help-a {
  display: block; font-size: $fs-body-md; color: $color-on-surface-variant;
  margin-top: 24rpx; padding-top: 24rpx;
  border-top: 2rpx solid rgba($color-on-surface, 0.06);
  line-height: 1.6;
}

.about-section {
  display: flex; flex-direction: column; align-items: center;
  padding: 80rpx 0; opacity: 0.5;
}
.about-name { font-size: 44rpx; font-weight: 600; color: $color-primary; margin-bottom: 8rpx; }
.about-version { font-size: $fs-body-sm; color: $color-on-surface-variant; margin-bottom: 8rpx; }
.about-desc { font-size: $fs-body-md; color: $color-on-surface-variant; }

.card { border-radius: $radius-md; }
.pressable:active, .pressable-subtle:active { opacity: 0.7; }
</style>
