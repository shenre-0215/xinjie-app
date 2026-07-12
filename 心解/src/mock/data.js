export const networkNodes = [
  // ── Hub ──
  { id: 'hub-0', label: '内心世界', type: 'hub', status: 'completed', x: 300, y: 300 },

  // ── Original 9 ──
  { id: 'node-1', label: '放下执念', subtitle: '自我接纳', emotion: '释然', delta: 0.82, type: 'thinking', status: 'completed', x: 180, y: 180, sourceId: 'r001', sourceType: 'zhiji' },
  { id: 'node-2', label: '接纳不完美', subtitle: '成长心态', emotion: '喜悦', delta: 0.75, type: 'thinking', status: 'completed', x: 420, y: 150, sourceId: 'r002', sourceType: 'zhiji' },
  { id: 'node-3', label: '焦虑的根源', subtitle: '觉察', emotion: '焦虑', delta: 0.65, type: 'thinking', status: 'completed', x: 120, y: 350, sourceId: 'r003', sourceType: 'zhiji' },
  { id: 'node-4', label: '探索自我', subtitle: '发现', emotion: '探索', delta: 0.71, type: 'thinking', status: 'completed', x: 480, y: 320, sourceId: 'r004', sourceType: 'zhiji' },
  { id: 'node-5', label: '悲伤的力量', subtitle: '疗愈', emotion: '悲伤', delta: 0.58, type: 'thinking', status: 'completed', x: 250, y: 450, sourceId: 'r005', sourceType: 'zhiji' },
  { id: 'node-6', label: '愤怒背后', subtitle: '转化', emotion: '愤怒', delta: 0.63, type: 'thinking', status: 'completed', x: 380, y: 480, sourceId: 'r006', sourceType: 'zhiji' },
  { id: 'node-7', label: '迷茫中的光', subtitle: '希望', emotion: '迷茫', delta: 0.55, type: 'thinking', status: 'completed', x: 150, y: 260 },
  { id: 'node-8', label: '平静时刻', subtitle: '正念', emotion: '平静', delta: 0.78, type: 'thinking', status: 'completed', x: 450, y: 220 },
  { id: 'node-9', label: '等待拆解', subtitle: '未完成', emotion: '焦虑', delta: 0.34, type: 'thinking', status: 'suspended', x: 300, y: 520 },

  // ── 新增 6 个 ──
  { id: 'node-10', label: '工作的意义', subtitle: '职业探索', emotion: '探索', delta: 0.68, type: 'thinking', status: 'completed', x: 80, y: 120 },
  { id: 'node-11', label: '和家人的关系', subtitle: '亲密连接', emotion: '释然', delta: 0.72, type: 'thinking', status: 'completed', x: 520, y: 80 },
  { id: 'node-12', label: '对未来的恐惧', subtitle: '不确定性', emotion: '焦虑', delta: 0.51, type: 'thinking', status: 'in-progress', x: 560, y: 440 },
  { id: 'node-13', label: '孤独与独处', subtitle: '自我相处', emotion: '平静', delta: 0.77, type: 'thinking', status: 'completed', x: 500, y: 520 },
  { id: 'node-14', label: '童年的记忆', subtitle: '溯源', emotion: '悲伤', delta: 0.62, type: 'thinking', status: 'completed', x: 80, y: 480 },
  { id: 'node-15', label: '想要被认可', subtitle: '外部认同', emotion: '迷茫', delta: 0.45, type: 'thinking', status: 'in-progress', x: 60, y: 420 }
]

export const networkEdges = [
  // Hub connections
  { from: 'hub-0', to: 'node-1' },
  { from: 'hub-0', to: 'node-2' },
  { from: 'hub-0', to: 'node-3' },
  { from: 'hub-0', to: 'node-4' },
  { from: 'hub-0', to: 'node-5' },
  { from: 'hub-0', to: 'node-6' },
  { from: 'hub-0', to: 'node-7' },
  { from: 'hub-0', to: 'node-8' },
  { from: 'hub-0', to: 'node-9' },
  { from: 'hub-0', to: 'node-10' },
  { from: 'hub-0', to: 'node-11' },
  { from: 'hub-0', to: 'node-12' },
  { from: 'hub-0', to: 'node-13' },
  { from: 'hub-0', to: 'node-14' },
  { from: 'hub-0', to: 'node-15' },
  // Cross connections (original)
  { from: 'node-1', to: 'node-2' },
  { from: 'node-1', to: 'node-8' },
  { from: 'node-2', to: 'node-4' },
  { from: 'node-3', to: 'node-6' },
  { from: 'node-3', to: 'node-7' },
  { from: 'node-4', to: 'node-8' },
  { from: 'node-5', to: 'node-6' },
  { from: 'node-7', to: 'node-1' },
  { from: 'node-9', to: 'node-3' },
  // Cross connections (new)
  { from: 'node-10', to: 'node-3' },
  { from: 'node-11', to: 'node-1' },
  { from: 'node-12', to: 'node-7' },
  { from: 'node-13', to: 'node-8' },
  { from: 'node-14', to: 'node-5' },
  { from: 'node-15', to: 'node-2' },
  { from: 'node-10', to: 'node-14' },
  { from: 'node-13', to: 'node-4' }
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

export const zhiguangPosts = [
  {
    id: 'p001',
    author: '林间小路',
    time: '3小时前',
    anonymous: false,
    category: '觉察',
    content: '今天终于明白了：焦虑不是因为事情多，是因为我在意结果。当我允许自己"做不好也没关系"的时候，那种紧绷感自然就松了。\n\n分享给所有正在拧紧的人。',
    tags: ['觉察', '焦虑', '自我接纳'],
    resonated: false,
    resonatedCount: 24,
    comments: [
      { id: 'cmt1', author: '远方的星', content: '深有同感，允许一切发生的那一刻，一切都变了', time: '2小时前' },
      { id: 'cmt2', author: '静水深流', content: '"做不好也没关系"——这句话我要记下来贴在桌面上', time: '1小时前' }
    ]
  },
  {
    id: 'p002',
    author: '匿名织者',
    time: '6小时前',
    anonymous: true,
    category: '释然',
    content: '今天做了一个决定：不再跟那个总是挑剔我的人解释自己。不是逃避，是终于明白，有些人的评价只是他们内心的投射。我只需要对自己诚实。\n\n匿名发，因为还在学习不被别人的看法左右。',
    tags: ['释然', '边界', '自我'],
    resonated: false,
    resonatedCount: 47,
    comments: [
      { id: 'cmt3', author: '清风', content: '边界感是保护自己内心花园的篱笆，不是墙', time: '5小时前' },
      { id: 'cmt4', author: '月亮上的兔子', content: '勇敢的选择！匿名也没关系，这份力量是真实的', time: '3小时前' },
      { id: 'cmt5', author: '听风的人', content: '我也在学习这件事，一起加油', time: '1小时前' }
    ]
  },
  {
    id: 'p003',
    author: '旭日东升',
    time: '昨天',
    anonymous: false,
    category: '成长',
    content: '做觉察练习第 30 天了。从刚开始连自己的情绪都叫不出名字，到现在能清晰地分辨"这个是焦虑""那个是疲惫""这个是期待"。\n\n最大的收获：情绪不是我，它们只是路过我。\n\n继续。⛅',
    tags: ['觉察', '成长', '30天'],
    resonated: false,
    resonatedCount: 63,
    comments: [
      { id: 'cmt6', author: '银河列车', content: '30天不容易！"情绪只是路过"说得太好了', time: '20小时前' }
    ]
  },
  {
    id: 'p004',
    author: '溪水潺潺',
    time: '2天前',
    anonymous: false,
    category: '温暖',
    content: '今天在地铁上看到一个陌生人偷偷在哭。我没有说话，只是递了一包纸巾过去。她愣了一下，然后轻轻点了点头。\n\n希望她知道，这个世界有人在默默地、温柔地注视着她。',
    tags: ['温暖', '陌生人', '善意'],
    resonated: false,
    resonatedCount: 112,
    comments: []
  }
]

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