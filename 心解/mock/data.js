export const networkNodes = [
  { id: 'hub-0', label: '内心世界', type: 'hub', status: 'completed', x: 300, y: 300 },
  { id: 'node-1', label: '放下执念', subtitle: '自我接纳', emotion: '释然', delta: 0.82, type: 'thinking', status: 'completed', x: 180, y: 180 },
  { id: 'node-2', label: '接纳不完美', subtitle: '成长心态', emotion: '喜悦', delta: 0.75, type: 'thinking', status: 'completed', x: 420, y: 150 },
  { id: 'node-3', label: '焦虑的根源', subtitle: '觉察', emotion: '焦虑', delta: 0.65, type: 'thinking', status: 'completed', x: 120, y: 350 },
  { id: 'node-4', label: '探索自我', subtitle: '发现', emotion: '探索', delta: 0.71, type: 'thinking', status: 'completed', x: 480, y: 320 },
  { id: 'node-5', label: '悲伤的力量', subtitle: '疗愈', emotion: '悲伤', delta: 0.58, type: 'thinking', status: 'completed', x: 250, y: 450 },
  { id: 'node-6', label: '愤怒背后', subtitle: '转化', emotion: '愤怒', delta: 0.63, type: 'thinking', status: 'completed', x: 380, y: 480 },
  { id: 'node-7', label: '迷茫中的光', subtitle: '希望', emotion: '迷茫', delta: 0.55, type: 'thinking', status: 'completed', x: 150, y: 260 },
  { id: 'node-8', label: '平静时刻', subtitle: '正念', emotion: '平静', delta: 0.78, type: 'thinking', status: 'completed', x: 450, y: 220 },
  { id: 'node-9', label: '等待拆解', emotion: '焦虑', type: 'thinking', status: 'suspended', x: 300, y: 520 }
]

export const networkEdges = [
  { from: 'hub-0', to: 'node-1' },
  { from: 'hub-0', to: 'node-2' },
  { from: 'hub-0', to: 'node-3' },
  { from: 'hub-0', to: 'node-4' },
  { from: 'hub-0', to: 'node-5' },
  { from: 'hub-0', to: 'node-6' },
  { from: 'hub-0', to: 'node-7' },
  { from: 'hub-0', to: 'node-8' },
  { from: 'hub-0', to: 'node-9' },
  { from: 'node-1', to: 'node-2' },
  { from: 'node-1', to: 'node-8' },
  { from: 'node-2', to: 'node-4' },
  { from: 'node-3', to: 'node-6' },
  { from: 'node-3', to: 'node-7' },
  { from: 'node-4', to: 'node-8' },
  { from: 'node-5', to: 'node-6' },
  { from: 'node-7', to: 'node-1' },
  { from: 'node-9', to: 'node-3' }
]

export const userProfile = {
  nickname: '',
  avatar: '',
  stats: { closedChains: 0, totalNodes: 0, worldviewItems: 0 }
}

export const chatHistory = []

export const zhijiRecords = []

export const suspendedItems = []

export const zhiguangPosts = []

export const worldviewData = {
  shixiang: [
    { id: 'w1', content: '允许一切发生', isAnchor: true, date: '2026-07-10' },
    { id: 'w2', content: '世界是不确定的', isAnchor: false, date: '2026-07-09' },
    { id: 'w3', content: '万物皆有裂痕，那是光照进来的地方', isAnchor: true, date: '2026-07-08' },
    { id: 'w4', content: '无常是唯一的常', isAnchor: false, date: '2026-07-07' }
  ],
  woxing: [
    { id: 'w5', content: '我是独特的存在', isAnchor: true, date: '2026-07-10' },
    { id: 'w6', content: '我的价值不由他人定义', isAnchor: false, date: '2026-07-09' },
    { id: 'w7', content: '每一天都是新的开始', isAnchor: false, date: '2026-07-08' },
    { id: 'w8', content: '我可以改变', isAnchor: true, date: '2026-07-06' }
  ],
  xincheng: [
    { id: 'w9', content: '善良是最高的智慧', isAnchor: true, date: '2026-07-10' },
    { id: 'w10', content: '爱自己是终身浪漫的开始', isAnchor: false, date: '2026-07-09' },
    { id: 'w11', content: '慢即是快', isAnchor: false, date: '2026-07-07' },
    { id: 'w12', content: '内心的平静是最大的财富', isAnchor: true, date: '2026-07-05' }
  ]
}