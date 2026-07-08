<template>
  <view class="page-container">
    <view class="header">
      <view class="back-btn pressable" @click="goBack">
        <text class="back-icon">‹</text>
      </view>
      <text class="header-title">关于心解</text>
      <view style="width: 80rpx;" />
    </view>

    <swiper
      class="card-swiper"
      :current="currentIndex"
      @change="onSwipe"
      indicator-dots
      indicator-color="rgba(61,103,81,0.15)"
      indicator-active-color="#3d6751"
      :style="{ height: swiperHeight + 'px' }"
    >
      <swiper-item v-for="(card, i) in cards" :key="i">
        <view class="slide-inner">
          <text v-if="card.emoji" class="card-emoji">{{ card.emoji }}</text>
          <view v-if="card.icon" class="slide-icon-wrap" :class="'icon-' + card.icon">
            <text class="slide-icon">{{ card.iconChar }}</text>
          </view>
          <text v-if="card.section" class="slide-section">{{ card.section }}</text>
          <text class="card-title">{{ card.title }}</text>
          <text v-if="card.titleLine2" class="card-title">{{ card.titleLine2 }}</text>
          <view class="card-body-list">
            <text
              v-for="(p, j) in card.paragraphs"
              :key="j"
              class="card-para"
            >{{ p }}</text>
          </view>
          <text v-if="card.footer" class="card-footer">{{ card.footer }}</text>
        </view>
      </swiper-item>
    </swiper>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const currentIndex = ref(0)
const swiperHeight = ref(600)

onMounted(() => {
  try {
    const info = uni.getSystemInfoSync()
    if (info && info.windowHeight) {
      // 160rpx header ≈ 80px on 750 width
      const rpxToPx = info.windowWidth / 750
      swiperHeight.value = info.windowHeight - (160 * rpxToPx)
    }
  } catch (e) {
    swiperHeight.value = 500
  }
})

function onSwipe(e) {
  currentIndex.value = e.detail.current
}

function goBack() {
  uni.navigateBack({ delta: 1 })
}

const cards = [
  {
    emoji: '◎',
    title: '我在确认自己，',
    titleLine2: '也始终在成为自己',
    footer: '——创作者小语',
    paragraphs: [
      '这世上从不缺现成的答案与自洽的人生模板。我曾经以为，取用他人的体悟能让自己走得更快。但后来我明白，每一种通透的秩序，都是另一个人从他独有的境遇、选择与生命重量中亲手织出的——它对我而言始终是外部参考，而不是我内心的唯一答案。',
      '真正属于我的秩序，需要我自己来建。',
      '成长，不是用别人的图纸修缮自己，而是从向外求索，转向向内建构。我需要亲自甄别信息的真伪，分辨价值的归属，一点点剥离那些来自外界的声音——那些并不是我的。然后，一砖一瓦地搭建只契合自己的精神世界。这件事无人能代劳，也没有捷径。其中必有摇摆，必有混沌。',
      '所以我慢慢理解：迷茫不是缺陷。它是旧的认知松动、新的秩序尚未成型的过渡阶段。它是我在脱离外部标尺时，必然会经历的空白。而这恰恰让我回到了自己身边，开始用自己的目光锚定生活的意义。',
      '这里便是那片属于我的建构之地。没有统一蓝图，没有进度评比，没有催促。我能写下自己的思绪，叩问自己的本心，一点点拆解、沉淀、闭合。我只需要按自己的节奏前行。',
      '因为每一次确认，都是在成为自己。'
    ]
  },
  {
    icon: 'zhiji', iconChar: '✿', section: '织记',
    title: '写下来，亲手拆开',
    paragraphs: [
      '一团乱麻的时候，光在心里转是转不出去的。',
      '写下此刻真实的感受，不是为了写得漂亮，是为了让那个模糊的东西先落到纸上。然后启动思考链——觉察、拆解、破局、实践、复盘——五步走下来，把一团乱麻拆成看得清的线头。',
      '暂时不想碰的，标记悬置，放一放。等有了新的感受，再回来。按你舒服的节奏来。'
    ]
  },
  {
    icon: 'xinbao', iconChar: '♡', section: '心宝',
    title: '你还敢问，就还没有被收编',
    paragraphs: [
      '一个还在提问的人，雷达是开着的。她没有把自己交出去。',
      '把那些说不清的困惑扔进对话框。心宝不替你回答——它把问题换个角度，轻轻推回来。像一面不那么刺眼的镜子。',
      '镜子不给你答案，但它让你看清楚：原来卡在这里的那个矛盾，长这个样子。',
      '答案是你自己的。你只是借了一个追问的声音。'
    ]
  },
  {
    icon: 'xinwang', iconChar: '⊛', section: '心网',
    title: '每一次确认，都留下印记',
    paragraphs: [
      '每闭合一条思考链，每存档一段对话，心网上就长出一个新的节点。节点之间会自己连起来——你会发现，原来勇气、自我、关系这些事情，在你的生活里是串在一起的。',
      '这不是在证明什么。是你在一次次把自己收回来的路上，留下的记号。攒多了你会看到：不是我变成了什么，而是我一直在做这件事。'
    ]
  },
  {
    icon: 'worldview', iconChar: '◎', section: '内心世界 · 织光',
    title: '长出属于自己的形状',
    paragraphs: [
      '世相、我行、心秤——你怎么看待世界，你想怎么活，什么在你心里最重。',
      '一条条细碎的思考，慢慢拼出只属于你的形状。不是套别人的框架，是你自己一砖一瓦砌出来的内心秩序。',
      '织光广场上，安静地看别人在经历什么，也可以匿名分享自己的光。共鸣就好，不用社交。'
    ]
  },
  {
    emoji: '🌿',
    title: '按自己的节奏来',
    paragraphs: [
      '这里是一块你主动擦拭自己的布。不往里塞东西，只是帮你把灵敏度调回来——清晰、安静、不被噪音淹没。',
      '每一次确认，都是在成为自己。',
      '没有进度条，没有统一蓝图。按你舒服的节奏来。'
    ]
  }
]
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';
@import '@/styles/mixins.scss';

.page-container {
  @include page-container;
  padding-top: calc(env(safe-area-inset-top) + 88rpx);
}

.header {
  position: fixed; top: 0; left: 0; right: 0; z-index: 100;
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 $sp-page-margin;
  padding-top: constant(safe-area-inset-top);
  padding-top: env(safe-area-inset-top);
  padding-bottom: 16rpx;
  background-color: rgba($color-background, 0.9);
  backdrop-filter: blur(20rpx);
}

.back-btn { width: 80rpx; height: 80rpx; display: flex; align-items: center; justify-content: center; }
.back-icon { font-size: 48rpx; color: $color-primary; font-weight: 300; }
.header-title { font-size: $fs-headline-sm; font-weight: 600; color: $color-primary; }

.card-swiper {
  position: fixed;
  top: 160rpx;
  left: 0;
  right: 0;
}

.slide-inner {
  padding: 48rpx 48rpx 120rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
  box-sizing: border-box;
  overflow-y: auto;
}

.card-emoji { font-size: 72rpx; margin-bottom: 32rpx; }

.slide-icon-wrap {
  width: 80rpx; height: 80rpx;
  border-radius: $radius-full;
  display: flex; align-items: center; justify-content: center;
  margin-bottom: 24rpx;
}
.icon-zhiji { background-color: rgba($color-primary-container, 0.35); }
.icon-xinbao { background-color: rgba($color-secondary-container, 0.35); }
.icon-xinwang { background-color: rgba($color-tertiary-container, 0.3); }
.icon-worldview { background-color: rgba($color-primary-container, 0.2); }
.slide-icon { font-size: 40rpx; }

.slide-section {
  font-size: $fs-label-md;
  font-weight: 600;
  color: $color-on-surface-variant;
  letter-spacing: 0.15em;
  margin-bottom: 16rpx;
}

.card-title {
  font-size: $fs-headline-sm;
  font-weight: 700;
  color: $color-primary;
  line-height: 1.5;
  margin-bottom: 8rpx;
  max-width: 500rpx;
  text-align: center;
}

.card-footer {
  font-size: $fs-label-md;
  color: rgba($color-on-surface-variant, 0.5);
  margin-top: 32rpx;
  text-align: center;
}

.card-body-list {
  width: 100%;
  max-width: 520rpx;
  display: flex;
  flex-direction: column;
  gap: 24rpx;
  padding-bottom: 40rpx;
}

.card-para {
  font-size: $fs-body-md;
  color: $color-on-surface-variant;
  line-height: 1.8;
  display: block;
}
</style>
