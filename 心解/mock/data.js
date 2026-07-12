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

export const zhijiRecords = [
  {
    id: 'r001',
    type: 'diary',
    status: 'none',
    content: '今天下午在公园走了很久，看到一只小松鼠在树枝间跳来跳去。突然觉得，它从来不想"我下一跳会不会掉下去"，它只是跳。也许我也可以这样？\n\n晚上回家煮了热茶，静静坐了一会儿。这样的时刻，就是生活吧。',
    tags: ['觉察', '宁静', '生活'],
    mood: 'happy',
    date: '2026-07-12',
    time: '18:30',
    echoTime: '1week'
  },
  {
    id: 'r002',
    type: 'thinking-chain',
    status: 'in-progress',
    title: '为什么总觉得自己不够好',
    delta: 0.65,
    content: '在思考「我不够好」这个念头到底是从哪里来的。拆解后发现它来自三个地方...',
    tags: ['自我成长', '觉察'],
    step: 3,
    totalSteps: 5,
    stepsContent: ['这个念头最早出现在初中，那时候数学考了78分，妈妈说"怎么才这点分"。从此每次我没达到预期，这个声音就出现。', '现在我可以看到，这个标准是外部的。78分可能确实不高，但"不够好"这个标签是我自己贴上的。外部事件 → 内部叙事 → 情绪反应。', '如果我允许自己"不够好"呢？如果我接受现在的自己就是完整的，不需要成为任何人眼中的"够好"？试着把这个权力收回来。'],
    date: '2026-07-12',
    time: '14:15',
    echoTime: '1day'
  },
  {
    id: 'r003',
    type: 'diary',
    status: 'suspended',
    content: '今天跟朋友聊到未来的计划，突然觉得很焦虑。不知道自己在焦虑什么，但就是有一种悬着的感觉。先记下来，明天再看看。',
    tags: ['焦虑', '未来'],
    mood: 'sad',
    date: '2026-07-12',
    time: '09:00'
  },
  {
    id: 'r004',
    type: 'diary',
    status: 'none',
    content: '昨天做的那个梦好奇怪，梦到自己在飞，但是飞得很低，脚总是快要碰到水面。醒来后一直想着这个意象：想飞但又不敢飞太高？\n\n也许这就是最近的状态吧——想要突破，但还有一丝害怕。没关系，至少已经在飞了。',
    tags: ['梦境', '觉察', '释然'],
    mood: 'neutral',
    date: '2026-07-11',
    time: '22:40',
    echoTime: '1month'
  },
  {
    id: 'r005',
    type: 'thinking-chain',
    status: 'closed',
    title: '工作中被批评后如何处理情绪',
    delta: 0.82,
    content: '被领导当众批评后，花了三天时间拆解整个事件...',
    tags: ['职场', '情绪'],
    step: 5,
    totalSteps: 5,
    stepsContent: [
      '事件还原：周五会议上，领导说我的方案"不成熟"。当时感觉脸发热，想反驳但忍住了。回家路上一直重复这句话。',
      '拆解批评的内容：他说的是方案"不成熟"，不是"你不行"。把人和事分开。方案的确实有些地方可以优化——他提的三个点都是对的。',
      '为什么我会这么难受？因为我把"方案不行"等同于"我不行"。这是核心的认知扭曲。',
      '行动方案：周一找他单独聊，先感谢指正，再请教他具体的优化建议。把他从"批评者"变成"导师"。',
      '复盘：聊完之后发现他真的只是在讲方案。他说"你的思路其实很好，就是还缺一些落地的细节"。我花了三天难受，其实三分钟沟通就能解开。下次：批评=信息，不是人格攻击。'
    ],
    date: '2026-07-10',
    time: '16:00',
    echoTime: '3month'
  },
  {
    id: 'r006',
    type: 'diary',
    status: 'none',
    content: '早上在菜市场看到一个老奶奶在认真地挑选青菜，一片叶子一片叶子地看。那种专注让我想起外婆。老了之后，时间变慢了，每一件小事都值得认真对待。\n\n我是不是活得太赶了？总是在焦虑下一个 deadline，忘记了其实此刻就是生活本身。',
    tags: ['温暖', '慢生活'],
    mood: 'very-happy',
    date: '2026-07-09',
    time: '08:20',
    echoTime: '1week'
  }
]

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