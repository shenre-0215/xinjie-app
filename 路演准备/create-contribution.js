const fs = require("fs");
const { Document, Packer, Paragraph, TextRun, AlignmentType, HeadingLevel, BorderStyle } = require("docx");

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
  numbering: {
    config: [{
      reference: "bullets",
      levels: [{ level: 0, format: "bullet", text: "•", alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 540, hanging: 240 } } } }]
    }]
  },
  sections: [{
    properties: {
      page: {
        size: { width: 11906, height: 16838 },
        margin: { top: 1080, right: 1440, bottom: 1080, left: 1440 }
      }
    },
    children: [
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 40 },
        children: [new TextRun({ text: "个人贡献说明", size: 36, font: "Georgia", bold: true, color: "3D6751" })] }),
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 200 },
        children: [new TextRun({ text: "项目：心解 | Trist | 2026 年 6 月", size: 18, color: "777777" })] }),

      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("项目角色")] }),
      ...[
        "单人独立完成全流程开发：产品定位、架构设计、前后端编码、AI 系统设计、云端部署、调试与迭代",
        "项目类型：个人创新项目",
      ].map(t => new Paragraph({ numbering: { reference: "bullets", level: 0 }, spacing: { after: 40 },
        children: [new TextRun({ text: t, size: 21, color: "2C2C2C" })] })),

      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("产品与设计")] }),
      ...[
        "独立完成产品定位：不教育、不评估、不替用户感受——强调用户主动建构的主体性",
        "设计 5 步思考链流程：觉察 → 拆解 → 破局 → 实践 → 复盘，源于自身实践验证",
        "设计 δ(C) 闭合质量、悬置检测、复查建议等体验反馈机制",
        "设计 AI 在 App 中的行为边界：苏格拉底式追问 + 不给答案 + 不做心理诊断",
        "撰写全部产品文案（关于心解、功能说明等）",
      ].map(t => new Paragraph({ numbering: { reference: "bullets", level: 0 }, spacing: { after: 40 },
        children: [new TextRun({ text: t, size: 21, color: "2C2C2C" })] })),

      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("架构与技术决策")] }),
      ...[
        "技术选型：uni-app (Vue 3) + uniCloud 阿里云 + DeepSeek API",
        "设计 7 张表 DB Schema，采用 record-per-doc 数据模型（每条记录独立文档）",
        "实现 uid 隔离 + localStorage → uniCloud 云端同步架构",
        "设计 AI 三模式：苏格拉底追问 / summarize 关键词提取 / recommend 内心世界推荐",
        "设计 [SUSPEND] 绕圈检测机制，将判断权交给 AI 而非前端硬编码",
      ].map(t => new Paragraph({ numbering: { reference: "bullets", level: 0 }, spacing: { after: 40 },
        children: [new TextRun({ text: t, size: 21, color: "2C2C2C" })] })),

      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("代码开发")] }),
      ...[
        "编写全部前端代码：5 个 Tab 页面 + 18 个二级页面 + 6 个公共组件 + 6 个 store",
        "编写全部后端代码：chat-api 云函数（三模式 + prompt 设计）",
        "编写 7 张表 DB Schema 文件",
        "将网页版原型重构为 uni-app 微信小程序（全量代码重写）",
        "所有代码控制在 ≤500 行/文件（CLAUDE.md 规范）",
      ].map(t => new Paragraph({ numbering: { reference: "bullets", level: 0 }, spacing: { after: 40 },
        children: [new TextRun({ text: t, size: 21, color: "2C2C2C" })] })),

      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("AI 协作方式")] }),
      ...[
        "使用 Claude Code（VS Code 插件）作为 AI 编程助手",
        "AI 负责：代码生成、架构方案讨论、Bug 排查、文档资料检索、数据搜集",
        "自己负责：产品方向判断、架构决策、设计评审、全量测试验证、文案撰写",
        "协作模式：自己做决策和验证，AI 辅助加速执行和迭代",
      ].map(t => new Paragraph({ numbering: { reference: "bullets", level: 0 }, spacing: { after: 40 },
        children: [new TextRun({ text: t, size: 21, color: "2C2C2C" })] })),

      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("测试与质量保障")] }),
      ...[
        "每个功能改动均在微信开发者工具模拟器中验证",
        "真机扫码预览测试（域名白名单配置）",
        "发现并修复 20+ 项功能/UI 问题（详见过程证据材料·测试记录）",
        "采用 suspension-mode 进行设计决策审查",
      ].map(t => new Paragraph({ numbering: { reference: "bullets", level: 0 }, spacing: { after: 40 },
        children: [new TextRun({ text: t, size: 21, color: "2C2C2C" })] })),

      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("路演材料")] }),
      ...[
        "独立完成 3 分钟路演 PPT（6 页，内容 + 设计）",
        "完成项目一页纸介绍、过程证据材料、个人贡献说明",
      ].map(t => new Paragraph({ numbering: { reference: "bullets", level: 0 }, spacing: { after: 40 },
        children: [new TextRun({ text: t, size: 21, color: "2C2C2C" })] })),

      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 300 },
        border: { top: { style: BorderStyle.SINGLE, size: 4, color: "CCCCCC", space: 8 } },
        children: [new TextRun({ text: "Trist | xfj@sias.edu.cn | 2026 年 6 月", size: 16, color: "AAAAAA" })] }),
    ]
  }]
});

Packer.toBuffer(doc).then(buf => {
  fs.writeFileSync("D:/心解-app/路演准备/心解-个人贡献说明.docx", buf);
  console.log("个人贡献说明已生成");
});
