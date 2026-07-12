<template>
  <view class="page">
    <!-- 顶部导航栏 -->
    <view class="nav">
      <view class="nav-back pressable" @click="goBack">
        <text class="nav-back-icon">‹</text>
      </view>
      <text class="nav-title">觉察报告</text>
      <view class="nav-actions">
        <view class="nav-dots pressable">
          <text class="nav-dots-icon">⋯</text>
        </view>
        <view class="nav-circle pressable">
          <text class="nav-circle-inner">◎</text>
        </view>
      </view>
    </view>

    <scroll-view scroll-y class="body">

      <!-- ── 区块 2：核心觉察总分卡片 ── -->
      <view class="hero-card">
        <!-- 环形进度仪表盘 -->
        <view class="ring-wrap">
          <view class="ring-bg" />
          <view class="ring-fg" :style="ringStyle" />
          <view class="ring-inner">
            <text class="ring-number">{{ insightScore }}</text>
            <text class="ring-label">觉察值</text>
            <!-- 金色四角星装饰 -->
            <text class="star star-l">✦</text>
            <text class="star star-r">✦</text>
          </view>
        </view>
        <text class="hero-slogan">你的内心正在发光</text>
        <text class="hero-desc">通过记录和梳理，你对自己的觉察正在稳步提升</text>
      </view>

      <!-- ── 区块 3：四大核心指标四宫格 ── -->
      <view class="metrics-row">
        <view class="metric-item">
          <view class="metric-icon-bg bg-green">
            <text class="metric-icon">💪</text>
          </view>
          <text class="metric-number">72</text>
          <text class="metric-label-sm">韧性值</text>
        </view>
        <view class="metric-item">
          <view class="metric-icon-bg bg-orange">
            <text class="metric-icon">📈</text>
          </view>
          <text class="metric-number">+12%</text>
          <text class="metric-label-sm">信心趋势</text>
        </view>
        <view class="metric-item">
          <view class="metric-icon-bg bg-green">
            <text class="metric-icon">✎</text>
          </view>
          <text class="metric-number">{{ recordCount }}</text>
          <text class="metric-label-sm">记录数</text>
        </view>
        <view class="metric-item">
          <view class="metric-icon-bg bg-green">
            <text class="metric-icon">🔗</text>
          </view>
          <text class="metric-number">{{ closedCount }}</text>
          <text class="metric-label-sm">闭合链</text>
        </view>
      </view>

      <!-- ── 区块 4：情绪模式 ── -->
      <view class="section">
        <view class="section-head">
          <text class="section-title">情绪模式</text>
          <text class="section-sub">最近 7 天的情绪分布</text>
        </view>
        <view class="emotion-chart">
          <view v-if="hasMoodData" class="chart-bars">
            <view v-for="(day, di) in weekMood" :key="di" class="chart-col">
              <view class="chart-bar-wrap">
                <view class="bar-segment bar-green"  :style="{ height: day.greenPct  + '%' }" />
                <view class="bar-segment bar-orange" :style="{ height: day.orangePct + '%' }" />
                <view class="bar-segment bar-blue"   :style="{ height: day.bluePct   + '%' }" />
              </view>
              <text class="chart-emoji">{{ day.dominantEmoji }}</text>
              <text class="chart-day-label">{{ day.label }}</text>
            </view>
          </view>
          <view v-else class="chart-empty">
            <text class="chart-empty-icon">📭</text>
            <text class="chart-empty-text">暂无情绪数据，写日记时选择心情来解锁</text>
          </view>
          <view class="chart-legend">
            <view class="legend-dot legend-green" /><text class="legend-text">积极</text>
            <view class="legend-dot legend-orange" /><text class="legend-text">平和</text>
            <view class="legend-dot legend-blue" /><text class="legend-text">低落</text>
          </view>
        </view>
      </view>

      <!-- ── 区块 5：模式发现 ── -->
      <view class="section">
        <view class="section-head">
          <text class="section-title">模式发现</text>
          <text class="section-sub">我们发现了你的独特节奏</text>
        </view>
        <view class="pattern-list">
          <view class="pattern-card">
            <view class="pattern-stripe stripe-green" />
            <view class="pattern-body">
              <view class="pattern-title-row">
                <text class="pattern-emoji">🌅</text>
                <text class="pattern-title">{{ patternMorning.title }}</text>
              </view>
              <text class="pattern-desc">{{ patternMorning.desc }}</text>
            </view>
          </view>
          <view class="pattern-card">
            <view class="pattern-stripe stripe-orange" />
            <view class="pattern-body">
              <view class="pattern-title-row">
                <text class="pattern-emoji">💡</text>
                <text class="pattern-title">{{ patternBreakthrough.title }}</text>
              </view>
              <text class="pattern-desc">{{ patternBreakthrough.desc }}</text>
            </view>
          </view>
          <view class="pattern-card">
            <view class="pattern-stripe stripe-blue" />
            <view class="pattern-body">
              <view class="pattern-title-row">
                <text class="pattern-emoji">🎯</text>
                <text class="pattern-title">{{ patternAction.title }}</text>
              </view>
              <text class="pattern-desc">{{ patternAction.desc }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- ── 区块 6：智能建议 ── -->
      <view class="section">
        <view class="section-head">
          <text class="section-title">智能建议</text>
          <text class="section-sub">基于你的记录给出的建议</text>
        </view>
        <view class="tips-list">
          <view v-for="(tip, i) in tips" :key="i" class="tip-item">
            <view class="tip-num">{{ i + 1 }}</view>
            <text class="tip-text">{{ tip }}</text>
          </view>
        </view>
      </view>

      <view class="bottom-spacer" />
    </scroll-view>
  </view>
</template>

<script setup>
import { computed } from 'vue'
import { zhijiState } from '../../store/useZhijiStore.js'
import { xinwangState } from '../../store/useXinwangStore.js'

// ── real data ──
const records = computed(() => zhijiState.records.filter(r => r.status !== 'suspended'))
const closedRecords = computed(() => zhijiState.records.filter(r => r.status === 'closed'))
const diaryCount = computed(() => zhijiState.records.filter(r => r.type === 'diary' && r.status !== 'suspended').length)
const chainCount = computed(() => zhijiState.records.filter(r => r.type === 'thinking-chain' && r.status !== 'suspended').length)
const recordCount = computed(() => records.value.length)
const closedCount = computed(() => closedRecords.value.length)

const worldviewTotal = computed(() => {
  const w = xinwangState.worldview
  return (w.shixiang || []).length + (w.woxing || []).length + (w.xincheng || []).length
})

// ── 觉察值 ──
const insightScore = computed(() => Math.round(Math.min(100, worldviewTotal.value * 8 + closedCount.value * 3 + 35)))

// 环形进度：dasharray = (score / 100) * circumference, circumference ≈ 2*PI*80 ≈ 502
const ringStyle = computed(() => {
  const pct = Math.min(100, insightScore.value) / 100
  const len = Math.round(pct * 502)
  return { strokeDasharray: len + ' 502' }
})

// ── 情绪模式：近 7 天 mood 分布 ──
const emotionGroups = {
  positive: ['very-happy', 'happy'],
  neutral:  ['neutral'],
  negative: ['sad', 'very-sad']
}

const weekMood = computed(() => {
  const days = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const ds = d.toDateString()
    const dayRecords = records.value.filter(r => {
      const rd = new Date(r.date || r.createdAt)
      return rd.toDateString() === ds
    })
    let pos = 0, neu = 0, neg = 0
    dayRecords.forEach(r => {
      if (!r.mood) { neu++; return }
      if (emotionGroups.positive.includes(r.mood)) pos++
      else if (emotionGroups.negative.includes(r.mood)) neg++
      else neu++
    })
    const total = Math.max(1, pos + neu + neg)
    const emojiMap = { 0: '😐', 1: '☀️', 2: '😊', '-1': '🌧️' }
    const net = pos - neg
    const emoji = net > 0 ? '☀️' : net < 0 ? '🌧️' : '😐'
    days.push({
      label: ['日','一','二','三','四','五','六'][d.getDay()],
      greenPct: Math.round(pos / total * 100),
      orangePct: Math.round(neu / total * 100),
      bluePct: Math.round(neg / total * 100),
      dominantEmoji: emoji,
      count: pos + neu + neg
    })
  }
  return days
})

const hasMoodData = computed(() => records.value.some(r => r.mood))

// ── 模式发现 ──
const patternMorning = computed(() => {
  const morningCount = records.value.filter(r => {
    const h = parseInt((r.time || '').split(':')[0])
    return h >= 5 && h < 10
  }).length
  if (morningCount > records.value.length * 0.3) {
    return { title: '晨间记录者', desc: '你倾向于在早晨进行记录，这有助于开启美好的一天' }
  }
  return { title: '深夜思考者', desc: '你更喜欢在夜深人静时梳理思绪，这段时间最适合内省' }
})

const patternBreakthrough = computed(() => {
  if (chainCount.value > diaryCount.value * 0.5) {
    return { title: '破局能力强', desc: '你在思考链的破局步骤中表现出色，善于找到新视角' }
  }
  return { title: '情绪表达者', desc: '你擅长捕捉和记录当下情绪，共情能力在不断提升' }
})

const patternAction = computed(() => {
  if (closedCount.value > records.value.length * 0.4) {
    return { title: '实践派', desc: '你通常会将思考转化为具体行动，执行力很强' }
  }
  return { title: '觉察派', desc: '你更注重深度觉察而非急于行动——慢即是快' }
})

// ── 智能建议 ──
const tips = computed(() => {
  const list = []
  if (recordCount.value > 0 && diaryCount.value / Math.max(1, recordCount.value) > 0.7) {
    list.push('试试思考链——把感受变成可行动的洞察，而不只是记录')
  }
  const openCount = recordCount.value - closedCount.value
  if (recordCount.value > 0 && openCount / Math.max(1, recordCount.value) > 0.3) {
    list.push(`有 ${openCount} 条记录还没闭合，回来完成它们，让思绪收尾`)
  }
  if (worldviewTotal.value === 0) {
    list.push('去「内心世界」添加你的三观，让觉察更有深度和方向感')
  }
  const fallbacks = [
    '继续保持记录的习惯，这有助于提升你的觉察力',
    '尝试在悬置清单中关注那些"含苞待放"的条目，它们可能很快就会有新突破',
    '本周你的觉察在稳步提升，可以尝试挑战一些之前不敢做的事情'
  ]
  for (const fb of fallbacks) {
    if (list.length >= 3) break
    if (!list.includes(fb)) list.push(fb)
  }
  return list.slice(0, 3)
})

function goBack() { uni.navigateBack({ delta: 1 }) }
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

/* ── global ── */
.page { min-height: 100vh; background: #faf9f5; padding-top: constant(safe-area-inset-top); padding-top: env(safe-area-inset-top); }
.pressable:active { opacity: 0.7; }

/* ── 导航栏 ── */
.nav {
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 32rpx; padding-top: 96rpx; padding-bottom: 20rpx;
  background: #faf9f5;
}
.nav-back { width: 72rpx; height: 72rpx; border-radius: 9999rpx; background: rgba(0,0,0,0.04); display: flex; align-items: center; justify-content: center; }
.nav-back-icon { font-size: 44rpx; color: #5a6b5d; font-weight: 300; }
.nav-title { font-size: 38rpx; font-weight: 700; color: #3d6751; }
.nav-actions { display: flex; align-items: center; gap: 16rpx; }
.nav-dots { width: 64rpx; height: 64rpx; border-radius: 16rpx; background: #fff; display: flex; align-items: center; justify-content: center; box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.03); }
.nav-dots-icon { font-size: 36rpx; color: #999; font-weight: 700; }
.nav-circle { width: 64rpx; height: 64rpx; border-radius: 9999rpx; border: 2rpx solid #ddd; display: flex; align-items: center; justify-content: center; }
.nav-circle-inner { font-size: 20rpx; color: #999; font-weight: 700; }

/* ── 主体 ── */
.body { height: 100vh; padding-bottom: 120rpx; }

/* ── 觉察总分卡片 ── */
.hero-card {
  margin: 24rpx 32rpx 40rpx; padding: 64rpx 40rpx 48rpx;
  background: #fff; border-radius: 40rpx;
  box-shadow: 0 4rpx 24rpx rgba(0,0,0,0.03);
  display: flex; flex-direction: column; align-items: center;
}
/* 环形进度 */
.ring-wrap { position: relative; width: 240rpx; height: 240rpx; margin-bottom: 40rpx; }
.ring-bg {
  position: absolute; inset: 0; border-radius: 9999rpx;
  border: 16rpx solid #edeeeb;
}
.ring-fg {
  position: absolute; inset: 0; border-radius: 9999rpx;
  border: 16rpx solid #3d6751;
  transform: rotate(-90deg);
}
.ring-inner {
  position: absolute; inset: 16rpx; border-radius: 9999rpx;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
}
.ring-number { font-size: 80rpx; font-weight: 800; color: #1a1c1a; line-height: 1; }
.ring-label { font-size: 24rpx; color: rgba(26,28,26,0.4); margin-top: 4rpx; }
.star { position: absolute; font-size: 24rpx; color: #e2b93b; }
.star-l { left: 20rpx; top: 30rpx; }
.star-r { right: 20rpx; top: 30rpx; }

.hero-slogan { font-size: 38rpx; font-weight: 700; color: #1a1c1a; margin-bottom: 20rpx; }
.hero-desc { font-size: 26rpx; color: rgba(26,28,26,0.45); text-align: center; line-height: 1.6; max-width: 480rpx; }

/* ── 四大指标四宫格 ── */
.metrics-row { display: flex; margin: 0 32rpx 48rpx; gap: 16rpx; }
.metric-item {
  flex: 1; display: flex; flex-direction: column; align-items: center;
  background: #fff; padding: 32rpx 12rpx; border-radius: 28rpx;
  box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.02);
}
.metric-icon-bg {
  width: 72rpx; height: 72rpx; border-radius: 9999rpx;
  display: flex; align-items: center; justify-content: center; margin-bottom: 16rpx;
}
.bg-green { background: rgba(168,213,186,0.2); }
.bg-orange { background: rgba(237,223,184,0.3); }
.metric-icon { font-size: 32rpx; }
.metric-number { font-size: 44rpx; font-weight: 800; color: #1a1c1a; margin-bottom: 4rpx; }
.metric-label-sm { font-size: 22rpx; color: rgba(26,28,26,0.4); }

/* ── 板块通用 ── */
.section { margin-bottom: 48rpx; }
.section-head { display: flex; align-items: baseline; justify-content: space-between; padding: 0 32rpx; margin-bottom: 24rpx; }
.section-title { font-size: 32rpx; font-weight: 700; color: #1a1c1a; }
.section-sub { font-size: 22rpx; color: rgba(26,28,26,0.35); }

/* ── 情绪图表 ── */
.emotion-chart {
  margin: 0 32rpx; padding: 40rpx 32rpx 28rpx;
  background: #fff; border-radius: 28rpx; box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.02);
}
.chart-bars { display: flex; justify-content: space-around; align-items: flex-end; height: 260rpx; margin-bottom: 16rpx; }
.chart-col { display: flex; flex-direction: column; align-items: center; width: 64rpx; }
.chart-bar-wrap { width: 40rpx; height: 160rpx; display: flex; flex-direction: column; justify-content: flex-end; border-radius: 10rpx; overflow: hidden; }
.bar-segment { width: 100%; transition: height 0.5s ease; }
.bar-green  { background: #a8d5ba; }
.bar-orange { background: #eddfb8; }
.bar-blue   { background: #a3c4dc; }
.chart-emoji { font-size: 28rpx; margin-top: 12rpx; }
.chart-day-label { font-size: 20rpx; color: rgba(26,28,26,0.35); margin-top: 6rpx; }
.chart-empty { padding: 60rpx 0; text-align: center; }
.chart-empty-icon { display: block; font-size: 56rpx; margin-bottom: 16rpx; opacity: 0.35; }
.chart-empty-text { font-size: 24rpx; color: rgba(26,28,26,0.35); }
.chart-legend { display: flex; justify-content: center; align-items: center; gap: 8rpx; margin-top: 24rpx; }
.legend-dot { width: 16rpx; height: 16rpx; border-radius: 9999rpx; }
.legend-green  { background: #a8d5ba; }
.legend-orange { background: #eddfb8; }
.legend-blue   { background: #a3c4dc; }
.legend-text { font-size: 20rpx; color: rgba(26,28,26,0.4); margin-right: 20rpx; }

/* ── 模式发现 ── */
.pattern-list { padding: 0 32rpx; display: flex; flex-direction: column; gap: 20rpx; }
.pattern-card {
  display: flex; background: #fff; border-radius: 24rpx;
  overflow: hidden; box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.02);
}
.pattern-stripe { width: 8rpx; flex-shrink: 0; }
.stripe-green  { background: #3d6751; }
.stripe-orange { background: #c7923e; }
.stripe-blue   { background: #4a7c9b; }
.pattern-body { padding: 32rpx 28rpx; flex: 1; }
.pattern-title-row { display: flex; align-items: center; gap: 12rpx; margin-bottom: 12rpx; }
.pattern-emoji { font-size: 36rpx; }
.pattern-title { font-size: 28rpx; font-weight: 700; color: #1a1c1a; }
.pattern-desc { font-size: 24rpx; color: rgba(26,28,26,0.45); line-height: 1.6; }

/* ── 智能建议 ── */
.tips-list { padding: 0 32rpx; display: flex; flex-direction: column; gap: 16rpx; }
.tip-item {
  display: flex; align-items: flex-start; gap: 20rpx;
  padding: 28rpx 28rpx; background: rgba(168,213,186,0.08);
  border-radius: 20rpx;
}
.tip-num {
  width: 48rpx; height: 48rpx; border-radius: 9999rpx;
  background: #a8d5ba; color: #345d48; font-size: 24rpx; font-weight: 700;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.tip-text { font-size: 26rpx; color: rgba(26,28,26,0.7); line-height: 1.7; flex: 1; }

.bottom-spacer { height: 80rpx; }
</style>
