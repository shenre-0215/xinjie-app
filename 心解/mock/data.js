/* ===== 心解 Mock Seed Data ===== */

// ---------- User Profile ----------
export const userProfile = {
  nickname: 'Xin Jie 用户',
  avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDNhFPcDJPpbGizW5XujW1puDUIwtUi6nb_6g7hYs6hmlfYio_9BG3mT6l4CvG9oh7QU5nIFaWUPdpm_c3OjJG6N5bk2YmMrR2VRWxlDmV4dUFFEbDjIn9aKnTTb2XQ_W0Zpne7PDEyIl80RO5hmbskvhGTpIwCxdM8tGBG0Vu5jiPG7_bsNqzH7178CwB0uCNB8FqLXvjQCeNmGlwZn2zByHzsDrwd9tzPLvsYUQ_la6r1-Vw_Co5P0VYG07aiyKIBiqBuK3WRPXgb',
  identityTag: '织网者',
  stats: {
    closedChains: 12,
    totalNodes: 142,
    worldviewItems: 36
  }
}

// ---------- 织记 Records ----------
export const zhijiRecords = [
  {
    id: 'r1',
    type: 'thinking-chain',
    status: 'closed',
    title: '工作压力',
    content: '工作压力越来越大，需要找到释放的方式。',
    tags: ['工作', '压力'],
    mood: '',
    date: '2024-05-20',
    time: '14:20',
    step: 5,
    totalSteps: 5,
    delta: 85,
    stepsContent: [
      '最近工作压力很大，每天加班到很晚，感觉身体和心理都到了极限。',
      '压力主要来自三个方面：项目deadline临近、老板的期待很高、团队协作不够顺畅。',
      '或许可以尝试"番茄工作法"，把大任务分解成小步骤，每完成一个步骤就休息5分钟。',
      '今天尝试了一下，效果不错！下午效率提高了很多，而且感觉没那么累了。',
      '压力管理是一个持续的过程，需要定期复盘和调整。这次体验让我意识到，方法比硬扛更重要。'
    ]
  },
  {
    id: 'r2',
    type: 'diary',
    status: 'none',
    content: '晨间的风吹过窗帘的缝隙，那一刻我想到了"呼吸"这个词。\n\n阳光正好，泡了一杯茶，坐在窗边。什么都不想做，就想这样静静地感受当下。\n\n生活有时候就是这样，不需要太多的理由，只是单纯地存在着，就已经很美好了。',
    tags: ['晨间', '冥想'],
    mood: 'happy',
    date: '2024-05-20',
    time: '08:45',
    step: 0,
    totalSteps: 0
  },
  {
    id: 'r3',
    type: 'diary',
    status: 'none',
    content: '生活不是为了赶路，而是为了感受路。今天在公园长椅上坐了半小时，什么都没做，感觉从未如此清醒。\n\n看到孩子们在草地上奔跑，老人们在散步聊天，一切都那么自然和谐。',
    tags: ['读书笔记', '平静'],
    mood: 'very-happy',
    date: '2024-05-19',
    time: '17:30',
    step: 0,
    totalSteps: 0,
    echoTime: '2024-06-19'
  },
  {
    id: 'r4',
    type: 'thinking-chain',
    status: 'suspended',
    title: '职业发展',
    content: '关于最近职业发展方向的一些模糊想法，总是觉得缺少核心动力...',
    tags: ['成长', '职业'],
    mood: '',
    date: '2024-05-18',
    time: '20:30',
    step: 1,
    totalSteps: 5,
    suspendedDays: 3,
    stepIndex: 1
  },
  {
    id: 'r5',
    type: 'diary',
    status: 'none',
    content: '今天和朋友吵了一架，其实现在想想也不是什么大事。\n\n可能是最近压力太大了，情绪比较敏感。明天找个机会和朋友聊聊吧。',
    tags: ['情绪', '关系'],
    mood: 'sad',
    date: '2024-05-18',
    time: '22:15',
    step: 0,
    totalSteps: 0
  },
  {
    id: 'r6',
    type: 'thinking-chain',
    status: 'closed',
    title: '情绪管理',
    content: '学会管理自己的情绪，做情绪的主人。',
    tags: ['情绪', '自我成长'],
    mood: '',
    date: '2024-05-17',
    time: '19:00',
    step: 5,
    totalSteps: 5,
    delta: 72,
    stepsContent: [
      '最近情绪波动很大，容易因为小事生气或焦虑。',
      '情绪问题的根源可能是睡眠不足、压力积累和缺乏运动。',
      '尝试每天记录情绪日记，了解自己情绪波动的规律。',
      '已经坚持了一周，发现下午3-4点是情绪低谷期，可以提前做好准备。',
      '情绪管理不是要消除情绪，而是要学会和情绪共处。通过这一周的实践，我感觉自己进步了很多。'
    ]
  },
  {
    id: 'r7',
    type: 'diary',
    status: 'none',
    content: '深夜里突然冒出来的灵感碎片：一个关于"森林车站"的短篇小说构思。\n\n在一片古老的森林深处，有一个看不见的车站。只有迷失方向的人才能找到它。',
    tags: ['创作', '灵感'],
    mood: 'neutral',
    date: '2024-05-16',
    time: '00:45',
    step: 0,
    totalSteps: 0
  },
  {
    id: 'r8',
    type: 'diary',
    status: 'none',
    content: '今天冥想时看到的一些意象，关于"流动的生命力"。\n\n感觉身体里有一股能量在流动，从头顶到脚底，温暖而有力。',
    tags: ['冥想', '感知'],
    mood: 'very-happy',
    date: '2024-05-15',
    time: '07:30',
    step: 0,
    totalSteps: 0
  },
  {
    id: 'r9',
    type: 'thinking-chain',
    status: 'in-progress',
    title: '学习计划',
    content: '制定一个新的学习计划，提升自己的技能。',
    tags: ['学习', '成长'],
    mood: '',
    date: '2024-05-14',
    time: '15:00',
    step: 3,
    totalSteps: 5,
    stepsContent: [
      '想要学习新的编程语言，但不知道从哪里开始。',
      '目前的技能栈已经满足工作需求，但想要更进一步。',
      '决定先学习Python，因为它应用广泛，而且相对容易入门。',
      '已经开始了第一周的学习，每天坚持练习，感觉收获很大。',
      ''
    ]
  },
  {
    id: 'r10',
    type: 'diary',
    status: 'none',
    content: '今天收到了期待已久的书，开心！\n\n翻开第一页，就被前言打动了。有时候，一本书就是一扇通往新世界的大门。',
    tags: ['阅读', '喜悦'],
    mood: 'very-happy',
    date: '2024-05-13',
    time: '10:20',
    step: 0,
    totalSteps: 0,
    echoTime: '2024-06-13'
  }
]

// ---------- 悬置清单 ----------
export const suspendedItems = [
  {
    id: 's1',
    content: '关于最近职业发展方向的一些模糊想法，总是觉得缺少核心动力...',
    tags: ['成长', '职业'],
    suspendedDays: 3,
    recordId: 'r1'
  },
  {
    id: 's2',
    content: '那次和朋友争吵后的情绪复盘，还没准备好完全面对当时的那种委屈感。',
    tags: ['情绪', '关系'],
    suspendedDays: 7,
    recordId: 'r4'
  },
  {
    id: 's3宅',
    content: '深夜里突然冒出来的灵感碎片：一个关于"森林车站"的短篇小说构思。',
    tags: ['创作', '灵感'],
    suspendedDays: 12,
    recordId: 'r5'
  },
  {
    id: 's4',
    content: '今天冥想时看到的一些意象，关于"流动的生命力"。',
    tags: ['冥想', '感知'],
    suspendedDays: 1,
    recordId: 'r6'
  }
]

// ---------- 心宝 Chat ----------
export const chatMessages = [
  {
    id: 'm1',
    role: 'xinbao',
    content: '我是心宝。你有想不通的事，说出来，我帮你理一理——它卡在哪、该现在解决还是先放一放。',
    time: '14:18',
    hasChoices: false
  },
  {
    id: 'm2',
    role: 'user',
    content: '最近总是觉得有些不安，但又说不清原因。',
    time: '14:20',
    hasChoices: false
  },
  {
    id: 'm3',
    role: 'xinbao',
    content: '说不清的不安往往最消耗人。能试着给它一个名字吗？是工作上的、关系里的，还是某种对未来的模糊担忧？',
    time: '14:20',
    hasChoices: false,
    choices: []
  }
]

// ---------- Chat History ----------
export const chatHistory = [
  {
    id: 'h1',
    title: '最近总是觉得有些不安，但又说不清原因',
    messageCount: 6,
    time: '14:20',
    date: '2024-05-20'
  },
  {
    id: 'h2',
    title: '我想换工作，但不知道自己到底想要什么',
    messageCount: 12,
    time: '昨天',
    date: '2024-05-19'
  },
  {
    id: 'h3',
    title: '和朋友吵了一架，一直在想是不是我的问题',
    messageCount: 8,
    time: '周三',
    date: '2024-05-17'
  }
]

// ---------- 心网 Nodes ----------
export const networkNodes = [
  { id: 'n1', label: '核心', x: 300, y: 300, type: 'hub', status: 'completed' },
  { id: 'n2', label: '自爱', x: 160, y: 120, type: 'normal', status: 'completed' },
  { id: 'n3', label: '宽恕', x: 440, y: 100, type: 'normal', status: 'completed' },
  { id: 'n4', label: '勇气', x: 100, y: 440, type: 'normal', status: 'in-progress' },
  { id: 'n5', label: '宁静', x: 500, y: 460, type: 'normal', status: 'suspended' }
]

export const networkEdges = [
  { from: 'n1', to: 'n2' },
  { from: 'n1', to: 'n3' },
  { from: 'n1', to: 'n4' },
  { from: 'n1', to: 'n5' },
  { from: 'n2', to: 'n3' },
  { from: 'n4', to: 'n5' }
]

// ---------- 三观体系 ----------
export const worldviewData = {
  shixiang: [
    { id: 'w1', content: '世界是流动的能量', isAnchor: true, date: '2024-03-12' },
    { id: 'w2', content: '万物皆有其时', isAnchor: false, date: '2024-04-05' },
    { id: 'w3', content: '混沌中孕育秩序', isAnchor: false, date: '2024-05-18' }
  ],
  woxing: [
    { id: 'w4', content: '当下即是目的地', isAnchor: false, date: '2024-03-20' },
    { id: 'w5', content: '向内求索，向外生长', isAnchor: true, date: '2024-02-14' },
    { id: 'w6', content: '接纳不完美的自己', isAnchor: false, date: '2024-06-01' }
  ],
  xincheng: [
    { id: 'w7', content: '诚实比讨好更重要', isAnchor: false, date: '2024-01-08' },
    { id: 'w8', content: '善良是一种主动选择', isAnchor: false, date: '2024-04-22' },
    { id: 'w9', content: '自由源于自律', isAnchor: true, date: '2024-02-28' }
  ]
}

// ---------- 织光 Posts ----------
export const zhiguangPosts = [
  {
    id: 'p1', author: '织者 892', authorAvatar: '', time: '1小时前', anonymous: false,
    content: '在这个午后，我听见风穿过树梢的声音，像是在对我低语。生活并不总是需要答案，有时候，仅仅是存在着，就足够美好了。',
    tags: ['温暖'], image: '', resonated: false, resonatedCount: 3,
    comments: [{ id: 'c1', author: '织者 314', content: '同感。那些什么都不做的午后，往往是最有力量的时刻。', time: '30分钟前' }]
  },
  {
    id: 'p2', author: '织者 314', authorAvatar: '', time: '3小时前', anonymous: false,
    content: '今天我学会了原谅自己。那些过去没做好的事，就让它们像秋叶一样落下吧。大地会接纳它们，化作养分。',
    tags: ['释然'], image: '', resonated: false, resonatedCount: 7,
    comments: [{ id: 'c2', author: '织者 556', content: '这句话让我想通了很多。秋天不等于结束。', time: '1小时前' }]
  },
  {
    id: 'p3', author: '织者 556', authorAvatar: '', time: '6小时前', anonymous: false,
    content: '在这里，我感觉自己是被听见的。谢谢你们的每一份安静的陪伴，这光虽然微弱，却足以照亮我的小小角落。',
    tags: ['感恩'], image: '', resonated: false, resonatedCount: 5, comments: []
  },
  {
    id: 'p4', author: '织者 129', authorAvatar: '', time: '昨天', anonymous: true,
    content: '有些情绪说不清楚，但它确实存在。我今天选择不解释太多，只是坐下来把它写出来。写完之后，好像没那么重了。',
    tags: ['书写', '自我对话'], image: '', resonated: false, resonatedCount: 9, comments: []
  },
  {
    id: 'p5', author: '织者 703', authorAvatar: '', time: '昨天', anonymous: false,
    content: '其实最难的不是解决问题，而是决定哪些问题值得解决。今天把这个月纠结的三件事排了个序，突然轻松了很多。',
    tags: ['选择', '聚焦'], image: '', resonated: false, resonatedCount: 12,
    comments: [{ id: 'c3', author: '织者 892', content: '"决定哪些问题值得解决"这句话我会记下来。', time: '2小时前' }]
  },
  {
    id: 'p6', author: '织者 248', authorAvatar: '', time: '2天前', anonymous: false,
    content: '以前总觉得"开心"才叫正常，但这周我才意识到——平静也是一种很重要的感觉。不激动、不焦虑、不低落，只是平静地存在着，本身就很难得。',
    tags: ['平静', '自我接纳'], image: '', resonated: false, resonatedCount: 15, comments: []
  }
]

// ---------- 成长档案 ----------
export const growthData = {
  milestones: [
    { title: '开启旅程', date: '2023.10.12', type: 'completed', icon: '🌱' },
    { title: '初见光芒', date: '2023.11.05', type: 'completed', icon: '✨' },
    { title: '深度自愈', date: '今天', type: 'active', icon: '❤️' },
    { title: '???', date: '--/--', type: 'locked', icon: '🔒' }
  ],
  timeline: [
    {
      title: '完成了思考链',
      time: '14:20',
      desc: '对焦虑进行了深度解构，获得了 5 点洞察值。',
      icon: '✓'
    },
    {
      title: '情绪标记',
      time: '昨日',
      desc: '在宁静中度过了一个下午。绿精灵为你采摘了一朵云。',
      icon: '☺'
    },
    {
      title: '书写愈见',
      time: '10月28日',
      desc: '完成了一篇关于"和解"的随笔，确信值稳步提升。',
      icon: '✎'
    }
  ],
  insights: {
    insightValue: 86,
    resilienceValue: 72,
    confidenceTrend: '稳步上升',
    confidenceChange: '+12%'
  }
}

// ---------- Category Tags for 织光 ----------
export const zhiguangCategories = ['全部', '情绪疗愈', '晨间随笔', '自然回响', '梦境织锦']
