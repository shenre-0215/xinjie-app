/* ===== 心网 · 情绪颜色工具 =====
 *  集中管理情绪→颜色/emoji/发光样式的映射
 *  替代 3 个文件中重复的内联映射
 */

// ── 情绪 → 颜色键 ──
export const EMOTION_COLOR_MAP = {
  '释然': 'blue',
  '平静': 'blue',
  '喜悦': 'amber',
  '成长': 'amber',
  '悲伤': 'purple',
  '失落': 'purple',
  '愤怒': 'orange',
  '焦虑': 'orange',
  '迷茫': 'gold',
  '探索': 'gold'
}

// ── 颜色键 → 色值定义 ──
export const COLOR_DEFS = {
  blue: {
    hex: '#4a7c9b',
    r: 74, g: 124, b: 155,
    label: '蓝 · 宁静'
  },
  amber: {
    hex: '#c7923e',
    r: 199, g: 146, b: 62,
    label: '金 · 温暖'
  },
  purple: {
    hex: '#a855f7',
    r: 168, g: 85, b: 247,
    label: '紫 · 深邃'
  },
  orange: {
    hex: '#fb923c',
    r: 251, g: 146, b: 60,
    label: '橙 · 热烈'
  },
  gold: {
    hex: '#facc15',
    r: 250, g: 204, b: 21,
    label: '黄 · 光芒'
  },
  primary: {
    hex: '#3d6751',
    r: 61, g: 103, b: 81,
    label: '心 · 绿'
  }
}

// ── 情绪 → emoji ──
const EMOTION_EMOJI = {
  '释然': '🌊', '平静': '🍃', '喜悦': '🌞', '成长': '🌱',
  '悲伤': '🌙', '失落': '🌧️', '愤怒': '🔥', '焦虑': '💫',
  '迷茫': '✨', '探索': '🔍'
}

// ── 对外 API ──

/** 获取情绪对应的 emoji（无情绪时回退到状态 emoji） */
export function getEmotionEmoji(node) {
  if (node.type === 'hub') return '⊛'
  if (node.emotion && EMOTION_EMOJI[node.emotion]) {
    return EMOTION_EMOJI[node.emotion]
  }
  const statusMap = { 'completed': '✨', 'in-progress': '💫', 'suspended': '⏳' }
  return statusMap[node.status] || '🌟'
}

/** 获取情绪对应的 CSS class 名（用于 hero 卡片/星球节点） */
export function getHeroClass(node) {
  if (node.type === 'hub') return 'hero-hub'
  if (node.emotion) {
    const key = EMOTION_COLOR_MAP[node.emotion]
    if (key) return 'hero-' + key
  }
  return 'hero-default'
}

/** 获取节点发光样式（用于星空视图）: { background, boxShadow } */
export function getNodeGlowStyle(node) {
  const key = node.type === 'hub' ? 'primary' : (EMOTION_COLOR_MAP[node.emotion] || 'primary')
  const c = COLOR_DEFS[key] || COLOR_DEFS.primary
  const size = getNodeSize(node)

  return {
    background: `radial-gradient(circle at 35% 35%,
      rgba(255,255,255,0.95),
      rgba(${c.r},${c.g},${c.b},0.7),
      rgba(${c.r},${c.g},${c.b},0.2)
    )`,
    boxShadow: [
      `0 0 ${size * 0.3}rpx rgba(${c.r},${c.g},${c.b},0.5)`,
      `0 0 ${size * 0.7}rpx rgba(${c.r},${c.g},${c.b},0.25)`,
      `0 0 ${size * 1.2}rpx rgba(${c.r},${c.g},${c.b},0.12)`
    ].join(', ')
  }
}

/** 获取连线颜色（取两个节点情感的中间色） */
export function getEdgeGlowStyle(nodeA, nodeB) {
  const keyA = nodeA.type === 'hub' ? 'primary' : (EMOTION_COLOR_MAP[nodeA.emotion] || 'primary')
  const keyB = nodeB.type === 'hub' ? 'primary' : (EMOTION_COLOR_MAP[nodeB.emotion] || 'primary')
  const ca = COLOR_DEFS[keyA] || COLOR_DEFS.primary
  const cb = COLOR_DEFS[keyB] || COLOR_DEFS.primary
  const r = Math.round((ca.r + cb.r) / 2)
  const g = Math.round((ca.g + cb.g) / 2)
  const b = Math.round((ca.b + cb.b) / 2)

  return {
    background: `linear-gradient(90deg,
      transparent 0%,
      rgba(${r},${g},${b},0.25) 20%,
      rgba(${r},${g},${b},0.45) 50%,
      rgba(${r},${g},${b},0.25) 80%,
      transparent 100%
    )`
  }
}

/** 获取节点大小（基于 delta） */
export function getNodeSize(node) {
  if (node.type === 'hub') return 80
  const delta = node.delta || 0.5
  return Math.round(16 + delta * 48) // 范围 ~40-64 rpx
}

/** 获取情绪颜色键 */
export function getEmotionColorKey(emotion) {
  return EMOTION_COLOR_MAP[emotion] || 'primary'
}

/** 获取连接节点 dot 的 CSS class */
export function getConnDotClass(node) {
  if (node.type === 'hub') return 'conn-hub'
  if (node.emotion) {
    const key = EMOTION_COLOR_MAP[node.emotion]
    if (key) return 'conn-' + key
  }
  return 'conn-default'
}

/** 获取颜色定义对象 */
export function getColorDef(key) {
  return COLOR_DEFS[key] || COLOR_DEFS.primary
}
