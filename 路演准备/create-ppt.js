const pptxgen = require("pptxgenjs");

const pres = new pptxgen();
pres.layout = "LAYOUT_16x9";
pres.author = "Trist";
pres.title = "心解 — 结项路演";

// ── Color Palette ──
const C = {
  primary:   "3D6751",  // Grass Milk Green
  primaryL:  "5A8F6E",  // lighter variant
  primaryD:  "2A4A3A",  // darker variant
  secondary: "675E3F",  // Warm Amber
  accent:    "6F5862",  // Muted Mauve
  bg:        "F9FAF6",  // Milk Apricot White
  card:      "F0EDE5",  // warm card bg
  cardDark:  "E8E3D9",
  text:      "2C2C2C",
  textMuted: "777777",
  textLight: "AAAAAA",
  white:     "FFFFFF",
  darkBg:    "2A3A2E",  // deep green for cover
};

// ── Helpers ──
const FONT_TITLE = "Georgia";
const FONT_BODY = "Calibri";
const MARGIN = 0.7;
const SLIDE_W = 10;
const SLIDE_H = 5.625;

function makeShadow() {
  return { type: "outer", color: "000000", blur: 4, offset: 2, angle: 135, opacity: 0.08 };
}

// ============================================================
// SLIDE 1 — Cover
// ============================================================
(() => {
  const s = pres.addSlide();
  s.background = { color: C.darkBg };

  // Decorative circle top-right
  s.addShape(pres.shapes.OVAL, {
    x: 7.5, y: -1.5, w: 4.5, h: 4.5,
    fill: { color: C.primary, transparency: 60 }
  });
  // Decorative circle bottom-left
  s.addShape(pres.shapes.OVAL, {
    x: -1.5, y: 3.5, w: 4, h: 4,
    fill: { color: C.secondary, transparency: 75 }
  });

  s.addText("心解", {
    x: 1, y: 1.2, w: 8, h: 1.5, align: "center",
    fontSize: 64, fontFace: FONT_TITLE, color: C.white, bold: true,
    margin: 0
  });
  s.addText("一片属于你自己的建构之地", {
    x: 1, y: 2.7, w: 8, h: 0.6, align: "center",
    fontSize: 18, fontFace: FONT_BODY, color: C.cardDark,
    margin: 0
  });

  // Divider line
  s.addShape(pres.shapes.LINE, {
    x: 3.5, y: 3.6, w: 3, h: 0,
    line: { color: C.primaryL, width: 1 }
  });

  s.addText("Trist · 2026年6月 · AI+X Vibe Coding 实践班结项路演", {
    x: 1, y: 4.1, w: 8, h: 0.5, align: "center",
    fontSize: 12, fontFace: FONT_BODY, color: C.textLight,
    margin: 0
  });
})();

// ============================================================
// SLIDE 2 — Problem & Positioning (5-step narrative flow)
// ============================================================
(() => {
  const s = pres.addSlide();
  s.background = { color: C.bg };
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.06, fill: { color: C.primary } });

  // Top banner: one-liner
  s.addShape(pres.shapes.RECTANGLE, { x: MARGIN, y: 0.2, w: 8.6, h: 0.38, fill: { color: C.primary } });
  s.addText('心解 — 一个让你自己动手拆解、追问、建构内心秩序的安静工具', {
    x: MARGIN + 0.3, y: 0.2, w: 8.0, h: 0.38, valign: 'middle',
    fontSize: 12, fontFace: FONT_BODY, color: C.white, margin: 0
  });

  const lx = MARGIN;
  const rx = 5.85;  // right column start
  const indent = 0.18;
  const lineW = 0.08;

  // ── LEFT: ① Era ── ② Data ── ③ Gap ──
  s.addShape(pres.shapes.RECTANGLE, { x: lx, y: 0.78, w: lineW, h: 0.24, fill: { color: C.primaryL } });
  s.addText('1. 一个不确定的时代', { x: lx + indent, y: 0.76, w: 4.5, h: 0.28, fontSize: 13, fontFace: FONT_BODY, color: C.primaryD, bold: true, margin: 0 });
  s.addText('旧的参照系在松动——学校的标准、家庭的期待、社会的活法——都不再是唯一的答案。信息涌进来，看得越多心里越没底。这不是个别人的问题，是整个时代的不确定性落到了一代人身上。', {
    x: lx + indent, y: 1.06, w: 5.0, h: 0.46, fontSize: 10, fontFace: FONT_BODY, color: C.text, margin: 0, valign: 'top'
  });

  s.addShape(pres.shapes.RECTANGLE, { x: lx, y: 1.68, w: lineW, h: 0.24, fill: { color: C.primaryL } });
  s.addText('2. 数据告诉我们的', { x: lx + indent, y: 1.66, w: 4, h: 0.28, fontSize: 13, fontFace: FONT_BODY, color: C.primaryD, bold: true, margin: 0 });
  const dataCards = [
    { num: '18-24岁', label: '抑郁水平达峰值', src: '中科院蓝皮书 2025\n17 万样本' },
    { num: '≈70%', label: '曾因职场心理困扰', src: 'Z 世代职场报告 2024\n3,956 人' },
    { num: '2.8%', label: '实际用过心理咨询', src: '而 80% 知道\n有这项服务' },
  ];
  dataCards.forEach((d, i) => {
    const dx = lx + indent + i * 1.78;
    s.addShape(pres.shapes.RECTANGLE, { x: dx, y: 2.0, w: 1.62, h: 1.3, fill: { color: C.white }, shadow: makeShadow() });
    s.addText(d.num, { x: dx, y: 2.04, w: 1.62, h: 0.4, align: 'center', fontSize: 24, fontFace: FONT_TITLE, color: C.primary, bold: true, margin: 0 });
    s.addText(d.label, { x: dx + 0.08, y: 2.44, w: 1.46, h: 0.3, align: 'center', fontSize: 10, fontFace: FONT_BODY, color: C.text, bold: true, margin: 0 });
    s.addText(d.src, { x: dx + 0.08, y: 2.74, w: 1.46, h: 0.48, align: 'center', fontSize: 8, fontFace: FONT_BODY, color: C.textMuted, margin: 0 });
  });

  s.addShape(pres.shapes.RECTANGLE, { x: lx, y: 3.48, w: lineW, h: 0.24, fill: { color: C.primaryL } });
  s.addText('3. 存在一个缺口', { x: lx + indent, y: 3.46, w: 4, h: 0.28, fontSize: 13, fontFace: FONT_BODY, color: C.primaryD, bold: true, margin: 0 });
  s.addText('80% 知道学校有免费心理咨询，仅 2.8% 用过。不是心理咨询不好——是对大多数人的日常困惑来说，它太重、太远、太有心理门槛。日常困惑需要的是一个随时可以打开、自己动手梳理的轻量空间。', {
    x: lx + indent, y: 3.76, w: 5.0, h: 0.55, fontSize: 10, fontFace: FONT_BODY, color: C.text, margin: 0, valign: 'top'
  });

  // ── RIGHT: ④ Core insight ── ⑤ Our answer ──
  s.addShape(pres.shapes.RECTANGLE, { x: rx, y: 0.78, w: lineW, h: 0.24, fill: { color: C.primary } });
  s.addText('4. 我们的核心判断', { x: rx + indent, y: 0.76, w: 3, h: 0.28, fontSize: 13, fontFace: FONT_BODY, color: C.primaryD, bold: true, margin: 0 });
  // Insight card
  s.addShape(pres.shapes.RECTANGLE, { x: rx, y: 1.08, w: 3.45, h: 2.2, fill: { color: C.white }, shadow: makeShadow() });
  s.addShape(pres.shapes.RECTANGLE, { x: rx, y: 1.08, w: 3.45, h: 0.04, fill: { color: C.primary } });
  s.addText([
    { text: '面对不确定性、建构内心秩序——不是靠“想通”一次就能解决的。它是一种日常实践。', options: { breakLine: true, fontSize: 10, color: C.text, paraSpaceAfter: 8 } },
    { text: '你每天接收到的信息、产生的情绪、做出的选择——都是搭建自洽世界的材料。', options: { breakLine: true, fontSize: 10, color: C.text, paraSpaceAfter: 8 } },
    { text: '关键在于，谁来处理这些材料？\n是被动地被外界声音淹没，还是主动地去分辨、拆解、筛选，一砖一瓦地搭建。', options: { breakLine: true, fontSize: 10, color: C.text, paraSpaceAfter: 8 } },
    { text: '在 AI 时代，答案越来越廉价。但一个人内心的自洽秩序——那个只属于你的感知端口——是任何技术都无法替你建构的。这是人最珍贵的边界。', options: { fontSize: 10, color: C.text } },
  ], { x: rx + 0.2, y: 1.2, w: 3.05, h: 2.0, valign: 'top', margin: 0 });

  // Answer
  s.addShape(pres.shapes.RECTANGLE, { x: rx, y: 3.48, w: lineW, h: 0.24, fill: { color: C.primary } });
  s.addText('5. 所以我们做了心解', { x: rx + indent, y: 3.46, w: 3, h: 0.28, fontSize: 13, fontFace: FONT_BODY, color: C.primaryD, bold: true, margin: 0 });
  s.addShape(pres.shapes.RECTANGLE, { x: rx, y: 3.8, w: 3.45, h: 1.15, fill: { color: C.primary } });
  s.addText([
    { text: '不是心理咨询，不是心灵鸡汤，不是一个给你答案的地方。', options: { breakLine: true, fontSize: 10, color: C.cardDark, paraSpaceAfter: 5 } },
    { text: '它是一个安静的建构空间。主语是你——你来拆、你来问、你来建。', options: { breakLine: true, fontSize: 10, color: C.white, bold: true, paraSpaceAfter: 5 } },
    { text: '织记拆解情绪，心宝追问本质，心网看见轨迹。', options: { fontSize: 10, color: C.cardDark } },
  ], { x: rx + 0.2, y: 3.85, w: 3.05, h: 1.05, valign: 'top', margin: 0 });

  // Bottom quote
  s.addShape(pres.shapes.RECTANGLE, { x: MARGIN, y: 5.15, w: 8.6, h: 0.015, fill: { color: C.cardDark } });
  s.addText('外界的信息、内心的感受——都是砖。你是那个砌墙的人。迷茫不是故障，是你正在从旧的壳里蜕出来。', {
    x: MARGIN, y: 5.22, w: 8.6, h: 0.3, fontSize: 11, fontFace: FONT_TITLE, color: C.primary, italic: true, margin: 0
  });
})();

// ============================================================
// SLIDE 3 — Architecture (5 columns)
// ============================================================
(() => {
  const s = pres.addSlide();
  s.background = { color: C.bg };

  s.addShape(pres.shapes.RECTANGLE, {
    x: 0, y: 0, w: 10, h: 0.06, fill: { color: C.primary }
  });

  s.addText("把正在探索的路，铺成可以走的形式", {
    x: MARGIN, y: 0.3, w: 8.6, h: 0.55, fontSize: 26, fontFace: FONT_TITLE,
    color: C.primaryD, bold: true, margin: 0
  });

  const cols = [
    { icon: "✿", title: "织记", items: [
      "5步拆解：觉察→拆解→破局→实践→复盘",
      "闭合反馈，客观衡量",
      "暂时不想做 → 标记悬置",
      "AI总结 2-6 字关键词"
    ]},
    { icon: "♡", title: "心宝", items: [
      "说出困惑，它不回答",
      "反过来问「听起来你在意的是…？」",
      "发现绕圈 → 轻轻提醒",
      "对话结束自动存档"
    ]},
    { icon: "⊛", title: "心网", items: [
      "思考链 + 对话 → 各生成节点",
      "节点自动连线",
      "可拖拽、可缩放",
      "攒多了，看见自己的轨迹"
    ]},
    { icon: "◎", title: "内心世界", items: [
      "世相 · 我行 · 心秤",
      "三列分装信念和判断",
      "标记锚点，AI每日推荐3条",
      "长年累月，砌出形状"
    ]},
    { icon: "☆", title: "织光", items: [
      "看别人在经历什么",
      "共鸣 → 点 ♥",
      "不做社交",
      "匿名分享，没有压力"
    ]},
  ];

  const colW = 1.66;
  const gap = 0.07;
  const startX = MARGIN;

  cols.forEach((col, i) => {
    const x = startX + i * (colW + gap);
    // Card bg
    s.addShape(pres.shapes.RECTANGLE, {
      x, y: 1.05, w: colW, h: 3.7,
      fill: { color: C.white }, shadow: makeShadow()
    });
    // Top color bar
    const barColors = [C.primary, C.secondary, C.accent, C.primaryD, C.primaryL];
    s.addShape(pres.shapes.RECTANGLE, {
      x, y: 1.05, w: colW, h: 0.06, fill: { color: barColors[i] }
    });
    // Icon
    s.addText(col.icon, {
      x, y: 1.25, w: colW, h: 0.5, align: "center",
      fontSize: 22, fontFace: FONT_BODY, color: C.primary, margin: 0
    });
    // Title
    s.addText(col.title, {
      x, y: 1.7, w: colW, h: 0.3, align: "center",
      fontSize: 13, fontFace: FONT_BODY, color: C.primaryD, bold: true, margin: 0
    });
    // Separator
    s.addShape(pres.shapes.LINE, {
      x: x + 0.2, y: 2.1, w: colW - 0.4, h: 0,
      line: { color: C.cardDark, width: 0.5 }
    });
    // Items
    const itemTexts = col.items.map((item, j) => ({
      text: item,
      options: { bullet: true, breakLine: true, fontSize: 9, color: C.text, fontFace: FONT_BODY, paraSpaceAfter: 6 }
    }));
    s.addText(itemTexts, {
      x: x + 0.1, y: 2.2, w: colW - 0.2, h: 2.4,
      valign: "top", margin: [0, 4, 0, 4]
    });
  });

  // Bottom closing
  s.addShape(pres.shapes.RECTANGLE, {
    x: MARGIN, y: 4.95, w: 8.6, h: 0.02, fill: { color: C.cardDark }
  });
  s.addText("每一次确认，都是在成为自己。", {
    x: MARGIN, y: 5.05, w: 8.6, h: 0.35, fontSize: 12, fontFace: FONT_TITLE,
    color: C.primary, italic: true, margin: 0
  });
})();

// ============================================================
// SLIDE 4 — AI Collaboration (two columns)
// ============================================================
(() => {
  const s = pres.addSlide();
  s.background = { color: C.bg };

  s.addShape(pres.shapes.RECTANGLE, {
    x: 0, y: 0, w: 10, h: 0.06, fill: { color: C.primary }
  });

  s.addText("AI 在产品和开发中，各守各的边界", {
    x: MARGIN, y: 0.3, w: 8.6, h: 0.55, fontSize: 26, fontFace: FONT_TITLE,
    color: C.primaryD, bold: true, margin: 0
  });

  // LEFT: AI in App
  const lx = MARGIN;
  s.addShape(pres.shapes.RECTANGLE, {
    x: lx, y: 1.05, w: 4.1, h: 3.65, fill: { color: C.white }, shadow: makeShadow()
  });
  s.addText("AI 在 App 里的角色", {
    x: lx + 0.25, y: 1.15, w: 3.6, h: 0.35, fontSize: 14, fontFace: FONT_BODY,
    color: C.primaryD, bold: true, margin: 0
  });

  const leftItems = [
    { text: "做什么", options: { fontSize: 11, color: C.primary, bold: true, breakLine: true, paraSpaceAfter: 4 } },
    { text: "反问你真正在意什么", options: { bullet: true, breakLine: true, fontSize: 10, color: C.text, paraSpaceAfter: 2 } },
    { text: "把困惑拆成更清晰的问题", options: { bullet: true, breakLine: true, fontSize: 10, color: C.text, paraSpaceAfter: 2 } },
    { text: "2-6 字概括思考链主题", options: { bullet: true, breakLine: true, fontSize: 10, color: C.text, paraSpaceAfter: 2 } },
    { text: "发现绕圈时轻轻提醒", options: { bullet: true, breakLine: true, fontSize: 10, color: C.text, paraSpaceAfter: 8 } },
    { text: "不做什么", options: { fontSize: 11, color: C.accent, bold: true, breakLine: true, paraSpaceAfter: 4 } },
    { text: "不给你答案 · 不替你感受", options: { bullet: true, breakLine: true, fontSize: 10, color: C.text, paraSpaceAfter: 2 } },
    { text: "不替你做决定 · 不评价你", options: { bullet: true, fontSize: 10, color: C.text } },
  ];
  s.addText(leftItems, {
    x: lx + 0.25, y: 1.55, w: 3.6, h: 3, valign: "top", margin: 0
  });

  // RIGHT: Dev collaboration
  const rx = 5.2;
  s.addShape(pres.shapes.RECTANGLE, {
    x: rx, y: 1.05, w: 4.1, h: 3.65, fill: { color: C.white }, shadow: makeShadow()
  });
  s.addText("我 + AI 协作开发", {
    x: rx + 0.25, y: 1.15, w: 3.6, h: 0.35, fontSize: 14, fontFace: FONT_BODY,
    color: C.primaryD, bold: true, margin: 0
  });

  const rightItems = [
    { text: "工具", options: { fontSize: 11, color: C.primary, bold: true, breakLine: true, paraSpaceAfter: 4 } },
    { text: "VS Code + Claude Code", options: { bullet: true, breakLine: true, fontSize: 10, color: C.text, paraSpaceAfter: 1 } },
    { text: "uni-app + uniCloud", options: { bullet: true, breakLine: true, fontSize: 10, color: C.text, paraSpaceAfter: 1 } },
    { text: "DeepSeek API", options: { bullet: true, breakLine: true, fontSize: 10, color: C.text, paraSpaceAfter: 8 } },
    { text: "AI 负责", options: { fontSize: 11, color: C.primary, bold: true, breakLine: true, paraSpaceAfter: 4 } },
    { text: "写代码 · 出方案 · 查资料 · 排查 bug", options: { bullet: true, breakLine: true, fontSize: 10, color: C.text, paraSpaceAfter: 8 } },
    { text: "我负责", options: { fontSize: 11, color: C.primary, bold: true, breakLine: true, paraSpaceAfter: 4 } },
    { text: "定方向 · 判架构 · 验证 · 修正", options: { bullet: true, breakLine: true, fontSize: 10, color: C.text, paraSpaceAfter: 2 } },
    { text: "悬置恢复丢内容、删除后云端拉回、门槛太低…每个改动跑一遍，发现 → 修正 → 再验证", options: { bullet: true, fontSize: 9, color: C.textMuted } },
  ];
  s.addText(rightItems, {
    x: rx + 0.25, y: 1.55, w: 3.6, h: 3, valign: "top", margin: 0
  });

  // Bottom
  s.addShape(pres.shapes.RECTANGLE, {
    x: MARGIN, y: 4.95, w: 8.6, h: 0.02, fill: { color: C.cardDark }
  });
  s.addText("我决定方向和边界，AI 加速执行和迭代。", {
    x: MARGIN, y: 5.05, w: 8.6, h: 0.35, fontSize: 12, fontFace: FONT_TITLE,
    color: C.primary, italic: true, margin: 0
  });
})();

// ============================================================
// SLIDE 5 — Iteration Journey (timeline)
// ============================================================
(() => {
  const s = pres.addSlide();
  s.background = { color: C.bg };

  s.addShape(pres.shapes.RECTANGLE, {
    x: 0, y: 0, w: 10, h: 0.06, fill: { color: C.primary }
  });

  s.addText("从自己也还在这个过程中，到把它铺成可以走的形式", {
    x: MARGIN, y: 0.3, w: 8.6, h: 0.55, fontSize: 22, fontFace: FONT_TITLE,
    color: C.primaryD, bold: true, margin: 0
  });

  // Timeline vertical line
  s.addShape(pres.shapes.LINE, {
    x: 1.35, y: 1.1, w: 0, h: 4.1,
    line: { color: C.primaryL, width: 2, dashType: "solid" }
  });

  const stages = [
    {
      label: "起点",
      content: "如何与情绪共处、找到主体性、搭建稳定内核——这些我也还在摸索。过程中形成了拆解、追问、写下来、没想通就先悬置的方法。这个 app，就是这套方法的映射。不是什么标准答案，只是一个正在经历的人，把觉得有用的流程做成了工具。"
    },
    {
      label: "第一轮 · 网页版原型",
      content: "把功能跑通，发现方向不对——这不是一个「打开看看」的东西，需要随时在手边。→ 重构为微信小程序。"
    },
    {
      label: "第二轮 · 红队反馈",
      content: "「心理方向需要专业能力吗？」→ 让我更清楚自己的边界：不是提供心理诊断，是提供一个结构让你借它分析自己。边界一清楚，定位反而更扎实。"
    },
    {
      label: "第三轮 · 密集迭代",
      content: "数据底座 → AI 行为约束 → 体验闭环。每个改动自己跑一遍，发现 → 修正 → 再验证。"
    },
    {
      label: "现在",
      content: "一个可以用的工具。不是「我帮你想」，是你借这个流程自己拆、自己想、自己建构。我跟你一样还在路上。"
    },
  ];

  stages.forEach((st, i) => {
    const y = 1.05 + i * 0.85;
    // Dot
    s.addShape(pres.shapes.OVAL, {
      x: 1.24, y: y + 0.06, w: 0.22, h: 0.22,
      fill: { color: i === 0 ? C.secondary : i === 4 ? C.primary : C.primaryL }
    });
    // Label
    s.addText(st.label, {
      x: 1.7, y, w: 1.6, h: 0.28, fontSize: 10, fontFace: FONT_BODY,
      color: C.primaryD, bold: true, margin: 0
    });
    // Content
    s.addText(st.content, {
      x: 1.7, y: y + 0.3, w: 7.3, h: 0.48, fontSize: 9.5, fontFace: FONT_BODY,
      color: C.text, margin: 0, valign: "top"
    });
  });
})();

// ============================================================
// SLIDE 6 — Next Steps + Closing
// ============================================================
(() => {
  const s = pres.addSlide();
  s.background = { color: C.darkBg };

  // Decorative
  s.addShape(pres.shapes.OVAL, {
    x: 8, y: -2, w: 5, h: 5,
    fill: { color: C.primary, transparency: 70 }
  });

  s.addText("下一步", {
    x: MARGIN, y: 0.5, w: 8.6, h: 0.65, fontSize: 32, fontFace: FONT_TITLE,
    color: C.white, bold: true, margin: 0
  });

  const cards = [
    { title: "种子用户测试", desc: "10-20 位目标用户真实反馈，验证定位和体验" },
    { title: "上线支持", desc: "微信小程序审核、发布流程指导" },
    { title: "方向合作", desc: "心理 / 教育领域老师和机构，帮忙判断边界和定位" },
  ];

  cards.forEach((c, i) => {
    const y = 1.4 + i * 0.82;
    s.addShape(pres.shapes.RECTANGLE, {
      x: MARGIN, y, w: 5.5, h: 0.66,
      fill: { color: "FFFFFF", transparency: 40 }
    });
    s.addText(c.title, {
      x: MARGIN + 0.3, y: y + 0.08, w: 4.9, h: 0.28,
      fontSize: 14, fontFace: FONT_BODY, color: C.white, bold: true, margin: 0
    });
    s.addText(c.desc, {
      x: MARGIN + 0.3, y: y + 0.36, w: 4.9, h: 0.24,
      fontSize: 10, fontFace: FONT_BODY, color: C.cardDark, margin: 0
    });
  });

  // Big closing text
  s.addText("每一次确认，都是在成为自己。", {
    x: 1, y: 4.0, w: 8, h: 0.7, align: "center",
    fontSize: 22, fontFace: FONT_TITLE, color: C.white, italic: true, margin: 0
  });
  s.addText("谢谢 · Trist · xfj@sias.edu.cn", {
    x: 1, y: 4.85, w: 8, h: 0.4, align: "center",
    fontSize: 11, fontFace: FONT_BODY, color: C.textLight, margin: 0
  });
})();

// ── Output ──
pres.writeFile({ fileName: "D:/心解-app/路演准备/心解-结项路演.pptx" })
  .then(() => console.log("PPT 已生成：D:/心解-app/路演准备/心解-结项路演.pptx"))
  .catch(err => console.error(err));
