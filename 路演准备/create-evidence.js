const fs = require("fs");
const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
        AlignmentType, HeadingLevel, BorderStyle, WidthType, ShadingType } = require("docx");

const CW = 9026;
const MARGIN = 1440;

const doc = new Document({
  styles: {
    default: { document: { run: { font: "Calibri", size: 22 } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 32, bold: true, font: "Georgia", color: "2A4A3A" },
        paragraph: { spacing: { before: 360, after: 120 }, outlineLevel: 0 } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 24, bold: true, font: "Calibri", color: "3D6751" },
        paragraph: { spacing: { before: 200, after: 80 }, outlineLevel: 1 } },
    ]
  },
  sections: [{
    properties: {
      page: {
        size: { width: 11906, height: 16838 },
        margin: { top: 1080, right: 1440, bottom: 1080, left: 1440 }
      }
    },
    children: [

      // ── Title ──
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 40 },
        children: [new TextRun({ text: "心解 — 过程证据材料", size: 36, font: "Georgia", bold: true, color: "3D6751" })] }),
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 200 },
        children: [new TextRun({ text: "Trist | AI+X Vibe Coding 实践班（一期）| 2026 年 6 月", size: 18, color: "777777" })] }),

      // ═══════════ 1. 开发任务书 ═══════════
      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("一、开发任务书")] }),
      ...[
        ["项目名称", "心解"],
        ["一句话描述", "一个为正在经历不确定期的年轻人设计的内心建构工具"],
        ["目标用户", "18-28 岁面临不确定性、需要建构自我认知的年轻人"],
        ["核心功能", "织记（日记+思考链）、心宝（AI 苏格拉底式追问）、心网（思维网络可视化）、内心世界（三观体系）、织光（社区广场）"],
        ["技术选型", "uni-app (Vue 3) + uniCloud 阿里云 + DeepSeek API + HBuilder X + 微信开发者工具"],
        ["开发工具", "VS Code + Claude Code（AI 辅助编码）"],
        ["目标平台", "微信小程序（第一目标）"],
        ["开发周期", "2026 年 6 月（第一阶段密集开发）"],
      ].map(([k, v]) => new Paragraph({
        spacing: { after: 60 },
        children: [
          new TextRun({ text: k + "：", size: 21, bold: true, color: "2A4A3A" }),
          new TextRun({ text: v, size: 21, color: "2C2C2C" }),
        ]
      })),

      // ═══════════ 2. 迭代记录 ═══════════
      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("二、迭代记录")] }),

      ...[
        {
          title: "阶段一：数据底座（6 月 22 日）",
          items: [
            "实现 uid 隔离：每个用户独立 localStorage key，不同账号数据互不干扰",
            "设计 7 张表 DB Schema：zhiji_records / xinbao_conversations / xinwang_nodes / worldview_entries / xinwang_recommendations / zhiguang_posts / zhiguang_userdata",
            "将 6 个 store 从纯 localStorage 改造为 cloud 优先 + 本地 fallback 模式",
            "登录/注册后自动触发 syncAllFromCloud() 拉取云端数据",
          ]
        },
        {
          title: "阶段二：AI 行为约束（6 月 22-23 日）",
          items: [
            "心宝 system prompt 打磨为苏格拉底式追问规则：不回答、不哄人、不给答案、只追问",
            "实现 [SUSPEND] 绕圈检测机制：AI 判断用户是否反复描述同一困境 → 回复末尾夹标记 → 前端弹温和提醒",
            "新增 summarize 模式：思考链闭合时将 5 步内容发给 AI，返回 2-6 字关键词",
            "新增 recommend 模式：AI 读取用户三观条目，每日推荐 3 条探索方向",
            "设定节点生成门槛：须满足「≥3 条用户消息 + AI 返回关键词」，避免「你好」也生成节点",
            "实现 δ(C) 闭合质量值：基于完成步数、历史闭合数、内容完整性三个信号计算闭环质量",
            "实现 G(a_suspend) 悬置复查建议：根据悬置天数 + 历史闭合率动态给出复查时间建议",
          ]
        },
        {
          title: "阶段三：数据架构升级（6 月 23 日）",
          items: [
            "将 zhiji_records 和 xinbao_conversations 从「一个用户一个文档内嵌套数组」重构为 record-per-doc 模型",
            "每条日记、每条思考链、每条对话都是独立的云文档——避免单文档膨胀、并发写入冲突问题",
            "实现 _deletedIds 小黑本机制：删除记录后云端同步不再拉回",
          ]
        },
        {
          title: "阶段四：体验闭环与稳定打磨（6 月 23 日）",
          items: [
            "思考链闭合 → AI 自动总结关键词 → 同步写入心网节点 + 织记记录标题",
            "悬置恢复时完整还原各步骤内容（新增 stepsContent 字段）",
            "节点详情按来源区分设计：织记节点回放思考链 5 步内容 / 心宝节点预览对话片段 + 查看完整对话",
            "关于心解介绍页：6 张 swiper 滑动卡片，包含产品理念和功能说明",
            "各项 UI/逻辑修复见「三、测试记录」",
          ]
        },
      ].flatMap(s => [
        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun(s.title)] }),
        ...s.items.map(t => new Paragraph({
          spacing: { after: 40 },
          indent: { left: 360 },
          children: [new TextRun({ text: "• " + t, size: 20, color: "2C2C2C" })]
        })),
        new Paragraph({ spacing: { after: 40 }, children: [] }),
      ]),

      // ═══════════ 3. 测试记录 ═══════════
      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("三、测试记录")] }),
      new Paragraph({
        spacing: { after: 120 },
        children: [new TextRun({ text: "所有测试均通过微信开发者工具模拟器和真机预览完成。以下是迭代中发现并修复的代表性问题：", size: 20, color: "777777" })]
      }),

      (() => {
        const border = { style: BorderStyle.SINGLE, size: 1, color: "D0D0D0" };
        const borders = { top: border, bottom: border, left: border, right: border };
        const hdr = (t, w) => new TableCell({
          borders, width: { size: w, type: WidthType.DXA },
          shading: { fill: "3D6751", type: ShadingType.CLEAR },
          margins: { top: 60, bottom: 60, left: 100, right: 100 },
          children: [new Paragraph({ children: [new TextRun({ text: t, size: 19, bold: true, color: "FFFFFF" })] })]
        });
        const cell = (t, w) => new TableCell({
          borders, width: { size: w, type: WidthType.DXA },
          margins: { top: 50, bottom: 50, left: 100, right: 100 },
          children: [new Paragraph({ children: [new TextRun({ text: t, size: 18, color: "2C2C2C" })] })]
        });
        const rows = [
          ["问题描述", 2200], ["发现方式", 1000], ["修复方案", 2800], ["验证结果", 1800],
          ["切换账号后数据不刷新", "模拟器切换账号测试", "每个 store 新增 reloadLocal() 方法；login/logout 触发", "两个账号各写日记，切换后互不干扰"],
          ["悬置恢复后填写内容丢失", "走一遍完整流程（悬置→再打开）", "新增 stepsContent 字段存储每步完整内容", "悬置后恢复，5步内容完整还原"],
          ["删除记录后云端同步拉回", "删除→云端 sync→刷新页面", "新增 _deletedIds 小黑本机制，sync 时过滤", "删除后刷新和切换设备，记录不再出现"],
          ["退出思考链弹窗误写'已保存'", "操作路径验证", "修改 goBack 文案为「已填写的内容不会保存」", "弹窗内容与实际行为一致"],
          ["心宝说'你好'也生成心网节点", "正常对话测试", "设门槛：≥3 条用户消息 + AI 关键词", "短对话存档不出节点，有实质对话才生成"],
          ["未登录状态显示 mock 数据", "退出登录验证", "_isFirstUser() 先判断 authState.uid", "未登录各模块显示空状态"],
          ["节点详情不管来源都显示'已闭合'", "点开心宝节点详情", "按 sourceType 区分展示：织记回放/心宝预览", "心宝节点显示对话预览+归档标签"],
          ["心网节点拖拽越界", "拖拽节点到边缘", "onNodeTouchMove 加 clamp 限制坐标；新节点生成也 clamp", "拖到边缘无法超出600rpx范围"],
          ["心网刷新恢复已删除节点", "删除后点心网刷新↻", "_deletedNodeIds 持久化→syncFromCloud 过滤→cloud 同步", "删除后刷新不会恢复"],
          ["悬置清单不区分来源", "心宝悬置+思考链悬置混排", "新增 source 字段（zhiji/xinbao），列表显示来源标签", "心宝来源的条目显示💬心宝标签"],
          ["二级页面 header 过长", "对比各页面 header 高度", "13 个页面 header 从 height:160rpx 改为 padding-bottom:16rpx", "全部二级页面 header 高度统一"],
          ["真机心宝无法对话", "真机微信扫码测试", "排查为域名白名单问题，添加 api.bspapp.com", "开启调试模式后正常（白名单已提交）"],
        ];
        return new Table({
          width: { size: CW, type: WidthType.DXA },
          columnWidths: [2200, 1000, 2800, 1800],
          rows: [
            new TableRow({ children: [hdr(rows[0][0], 2200), hdr(rows[0][1], 1000), hdr(rows[0][2], 2800), hdr(rows[0][3], 1800)] }),
            ...rows.slice(1).map(r => new TableRow({
              children: [cell(r[0], 2200), cell(r[1], 1000), cell(r[2], 2800), cell(r[3], 1800)]
            }))
          ]
        });
      })(),

      // ═══════════ 4. 红队反馈 ═══════════
      new Paragraph({ heading: HeadingLevel.HEADING_1, spacing: { before: 360 }, children: [new TextRun("四、红队反馈")] }),
      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("关键质疑")] }),
      new Paragraph({
        spacing: { after: 80 },
        children: [new TextRun({ text: "“心理方向需要专业能力吗？”", size: 21, color: "6F5862", italics: true, bold: true })]
      }),
      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("回应与改进")] }),
      ...[
        "此质疑促使我重新审视并明确产品边界：心解不是心理诊断或治疗工具——没有量表、没有诊断标签、不贴抑郁焦虑的标签。",
        "心解提供的是一个结构——思考链 5 步拆解 + AI 苏格拉底式追问 + 心网可视化轨迹——让用户借这个结构来分析自己、建构自己。",
        "边界一清楚，产品定位反而更扎实：从“帮你想”退到“你自己来”，从“我们解决”退到“你主动建构”。",
      ].map(t => new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        spacing: { after: 40 },
        children: [new TextRun({ text: t, size: 20, color: "2C2C2C" })]
      })),

      // ═══════════ 5. 用户反馈 ═══════════
      new Paragraph({ heading: HeadingLevel.HEADING_1, spacing: { before: 360 }, children: [new TextRun("五、用户反馈")] }),
      new Paragraph({
        spacing: { after: 80 },
        children: [new TextRun({ text: "当前尚未开展大规模用户测试。以下为用户洞察来源：", size: 20, color: "777777" })]
      }),
      ...[
        "开发者自身作为目标用户——长期实践并验证了思考链流程的有效性",
        "身边同龄人群的日常观察——普遍存在信息焦虑、参照系松动、自我认同困惑",
        "引用的第三方权威数据：中科院心理所蓝皮书（2025，17 万样本）、Z 世代职场心理健康报告（2024）、UCLA Z 世代价值观研究（2024）",
        "下一步将招募 10-20 位种子用户进行结构化反馈采集",
      ].map(t => new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        spacing: { after: 40 },
        children: [new TextRun({ text: t, size: 20, color: "2C2C2C" })]
      })),

      // ── Footer ──
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 300 },
        border: { top: { style: BorderStyle.SINGLE, size: 4, color: "CCCCCC", space: 8 } },
        children: [new TextRun({ text: "Trist | xfj@sias.edu.cn | 2026 年 6 月", size: 16, color: "AAAAAA" })] }),
    ]
  }],
  numbering: {
    config: [{
      reference: "bullets",
      levels: [{ level: 0, format: "bullet", text: "•", alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 540, hanging: 240 } } } }]
    }]
  },
});

Packer.toBuffer(doc).then(buf => {
  fs.writeFileSync("D:/心解-app/路演准备/心解-过程证据材料.docx", buf);
  console.log("过程证据材料已生成");
});
