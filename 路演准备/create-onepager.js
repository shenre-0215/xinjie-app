const fs = require("fs");
const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
        AlignmentType, HeadingLevel, BorderStyle, WidthType, ShadingType } = require("docx");

// A4: 11906 x 16838 DXA
const CW = 9026; // content width with 1" margins
const MARGIN = 1440;

const doc = new Document({
  styles: {
    default: { document: { run: { font: "Calibri", size: 21 } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 36, bold: true, font: "Georgia", color: "2A4A3A" },
        paragraph: { spacing: { before: 0, after: 80 }, outlineLevel: 0 } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 24, bold: true, font: "Calibri", color: "3D6751" },
        paragraph: { spacing: { before: 160, after: 60 }, outlineLevel: 1 } },
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

      // ── Title block (centered) ──
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 60 },
        children: [new TextRun({ text: "心解", size: 44, font: "Georgia", bold: true, color: "3D6751" })]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 40 },
        children: [new TextRun({ text: "一片属于你自己的建构之地", size: 22, font: "Calibri", color: "675E3F", italics: true })]
      }),
      // Thin rule
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 80 },
        border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: "3D6751", space: 8 } },
        children: []
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
        children: [new TextRun({ text: "AI+X Vibe Coding 实践班（一期）结项项目 | Trist | 2026 年 6 月", size: 18, color: "777777" })]
      }),

      // ── Section: 项目概述 ──
      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("项目概述")] }),
      new Paragraph({
        spacing: { after: 160 },
        children: [new TextRun({
          text: "心解是一个为正在经历不确定期的年轻人设计的内心建构工具。不是心理咨询、不是心灵鸡汤、不给答案——它提供的是一个安静的空间，让用户自己动手拆解困惑、追问本质、建构属于自己的内心秩序。外界的信息、内心的感受，都是搭建自洽世界的材料。主语是用户自己。",
          size: 20, color: "2C2C2C"
        })]
      }),

      // ── Section: 目标用户与痛点 ──
      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("目标用户与痛点")] }),

      (() => {
        const colW2 = CW / 2;
        const border = { style: BorderStyle.NONE, size: 0 };
        const hdrBorders = { top: border, bottom: { style: BorderStyle.SINGLE, size: 5, color: "3D6751", space: 3 }, left: border, right: border };
        const cellBorders = { top: border, bottom: border, left: border, right: border };
        const cellMargins = { top: 50, bottom: 50, left: 120, right: 120 };

        function hdrCell(t) { return new TableCell({
          borders: hdrBorders, width: { size: colW2, type: WidthType.DXA },
          shading: { fill: "F9FAF6", type: ShadingType.CLEAR }, margins: cellMargins,
          children: [new Paragraph({ children: [new TextRun({ text: t, size: 19, bold: true, color: "3D6751" })] })]
        });}
        function bodyCell(rows) { return new TableCell({
          borders: cellBorders, width: { size: colW2, type: WidthType.DXA }, margins: cellMargins,
          children: rows.map(r => new Paragraph({ spacing: { after: 30 }, children: [new TextRun({ text: r, size: 18, color: "2C2C2C" })] }))
        });}
        return new Table({
          width: { size: CW, type: WidthType.DXA }, columnWidths: [colW2, colW2],
          rows: [
            new TableRow({ children: [hdrCell("目标用户"), hdrCell("核心痛点")] }),
            new TableRow({ children: [
              bodyCell([
                "18-28 岁，正在经历迷茫期、不确定期的年轻人",
                "大量信息涌入，旧的参照系松动，新的还没建立",
                "对自我有探索意识，但不知道从哪里开始",
              ]),
              bodyCell([
                "信息过载——别人的活法和标准看得越多，心里越没底",
                "日常情绪和困惑没有出口——心理咨询太重，鸡汤太轻",
                "缺乏一个自己主动拆解、追问、建构的结构和空间",
              ]),
            ]}),
          ]
        });
      })(),

      // ── Section: 为什么值得解决 ──
      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("为什么值得解决")] }),
      new Paragraph({
        spacing: { after: 160 },
        children: [new TextRun({
          text: "心理咨询对大多数人来说，门槛太高、话题太重，甚至让人觉得「我没有这个需求」。但特别是在准备进入社会或刚进入社会这个阶段——我们每天都在和巨大的不确定性共存。那些真实的烦恼、焦虑、自我否定，不是「想开点」就能消解的。它们真实地影响着我们的生活、选择和自我判断。",
          size: 20, color: "2C2C2C"
        })]
      }),
      new Paragraph({
        spacing: { after: 80 },
        children: [new TextRun({
          text: "但这个阶段虽然充满了迷茫和恐惧，它恰恰也是我们快速构建自我世界最重要的窗口期。因为我们在探索自己想要什么，在发现自己不喜欢什么，在一点点剥离外界的声音，在构建那个真实的、属于自己的坐标。这个过程中，我们需要一个地方——一个可以和自己对话、可以记录混乱、可以构建自己的内心世界、可以培养主体性的空间。",
          size: 20, color: "2C2C2C"
        })]
      }),
      new Paragraph({
        spacing: { after: 160 },
        children: [new TextRun({
          text: "数据也印证了这一点：据中科院心理所蓝皮书（2025），18-24 岁抑郁水平为全年龄段峰值；约 70% 的年轻人曾因职场问题产生心理困扰；80% 知道学校有免费心理咨询的人中仅 2.8% 使用过。日常困惑需要的是一个更轻、更自主的空间。尤其在 AI 时代，答案越来越廉价，但一个人内心的自洽秩序——那个只属于你的感知端口——是任何技术都无法替你建构的。",
          size: 20, color: "2C2C2C"
        })]
      }),

      // ── Section: 核心功能 (4-column table) ──
      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("核心功能")] }),
      (() => {
        const colW = CW / 4;
        const border = { style: BorderStyle.NONE, size: 0 };
        const hdrOpts = {
          borders: { top: border, bottom: { style: BorderStyle.SINGLE, size: 6, color: "3D6751", space: 4 }, left: border, right: border },
          shading: { fill: "F9FAF6", type: ShadingType.CLEAR },
          margins: { top: 60, bottom: 60, left: 100, right: 100 }
        };
        const cellOpts = {
          borders: { top: border, bottom: border, left: border, right: border },
          margins: { top: 40, bottom: 40, left: 100, right: 100 }
        };
        const headerColors = ["3D6751", "675E3F", "6F5862", "5A8F6E"];

        function hdrCell(text, color) {
          return new TableCell({
            ...hdrOpts, width: { size: colW, type: WidthType.DXA },
            children: [new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ text, size: 20, bold: true, font: "Calibri", color })]
            })]
          });
        }
        function bodyCell(icon, title, ...lines) {
          const children = [
            new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 40 },
              children: [new TextRun({ text: icon, size: 28 })] }),
            new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 60 },
              children: [new TextRun({ text: title, size: 19, bold: true, color: "2A4A3A" })] }),
          ];
          lines.forEach(l => {
            children.push(new Paragraph({
              spacing: { after: 40 },
              children: [new TextRun({ text: l, size: 17, color: "2C2C2C" })]
            }));
          });
          return new TableCell({
            ...cellOpts,
            shading: { fill: "FAFAFA", type: ShadingType.CLEAR },
            width: { size: colW, type: WidthType.DXA },
            children
          });
        }

        return new Table({
          width: { size: CW, type: WidthType.DXA },
          columnWidths: [colW, colW, colW, colW],
          rows: [
            new TableRow({ children: [
              hdrCell("✿ 织记", headerColors[0]),
              hdrCell("♡ 心宝", headerColors[1]),
              hdrCell("⊛ 心网", headerColors[2]),
              hdrCell("◎ 内心世界 · ☆ 织光", headerColors[3]),
            ]}),
            new TableRow({ children: [
              bodyCell("✿", "织记",
                "日记 + 心情标记 + 日期分组",
                "5步思考链：觉察→拆解→破局→实践→复盘",
                "闭合质量反馈，客观可感",
                "暂不想做 → 标记悬置",
                "AI 自动总结 2-6 字关键词"),
              bodyCell("♡", "心宝",
                "苏格拉底式追问——不回答、不哄人",
                "反问你真正在意的是什么",
                "检测绕圈 → 轻轻提醒放一放",
                "对话结束自动存档 → 生成心网节点"),
              bodyCell("⊛", "心网",
                "思考链 + 对话 → 各生成节点",
                "节点自动连线，可拖拽缩放",
                "攒多了，看见自己走过的轨迹",
                "按来源查看详情（思考链回顾 / 对话预览）"),
              bodyCell("◎", "内心世界 + 织光",
                "世相 · 我行 · 心秤三列分装信念",
                "AI 每日推荐 3 条探索方向",
                "长年累月砌出只属于你的形状",
                "织光广场匿名分享 + 共鸣即好"),
            ]}),
          ]
        });
      })(),

      // ── Section: AI 协同 ──
      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("AI 协同")] }),
      new Paragraph({
        spacing: { after: 80 },
        children: [new TextRun({
          text: "心解里的 AI 不是功能点，是被严格约束的角色。",
          size: 20, color: "2C2C2C", bold: true
        })]
      }),
      new Paragraph({
        spacing: { after: 40 },
        children: [new TextRun({
          text: "边界：不替用户感受 · 不替用户决定 · 不给答案 · 不做心理诊断",
          size: 19, color: "6F5862"
        })]
      }),
      new Paragraph({
        spacing: { after: 40 },
        children: [new TextRun({
          text: "三模式：苏格拉底式追问 + 思考链关键词总结 + 内心世界每日推荐",
          size: 19, color: "2C2C2C"
        })]
      }),
      new Paragraph({
        spacing: { after: 160 },
        children: [new TextRun({
          text: "技术选型：uni-app (Vue 3) + uniCloud 阿里云 + DeepSeek API + Claude Code 辅助开发 + HBuilder X + 微信开发者工具",
          size: 19, color: "2C2C2C"
        })]
      }),

      // ── Section: 当前成果与下一步 ──
      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("当前成果与下一步")] }),
      new Paragraph({
        spacing: { after: 60 },
        children: [new TextRun({
          text: "当前成果：",
          size: 20, color: "2A4A3A", bold: true
        })]
      }),
      ...[
        "五个 Tab 页面完整功能闭环 —— 织记 / 心宝 / 心网 / 内心世界 / 织光",
        "uniCloud 云端数据同步（7 张表）+ uid 隔离 + record-per-doc 数据模型",
        "AI 三模式联调上线（追问 / 关键词总结 / 每日推荐）+ 悬置绕圈检测",
        "20+ 轮迭代修复，覆盖数据底座、AI 行为、体验闭环、稳定打磨四个层面"
      ].map(t => new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        spacing: { after: 30 },
        children: [new TextRun({ text: t, size: 19, color: "2C2C2C" })]
      })),
      new Paragraph({
        spacing: { before: 60, after: 60 },
        children: [new TextRun({
          text: "下一步：",
          size: 20, color: "2A4A3A", bold: true
        })]
      }),
      ...[
        "招募 10-20 位种子用户进行真实场景测试，验证定位和体验",
        "完善微信小程序审核流程，正式上线",
        "对接心理 / 教育领域老师和机构，持续完善边界与定位"
      ].map(t => new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        spacing: { after: 30 },
        children: [new TextRun({ text: t, size: 19, color: "2C2C2C" })]
      })),

      // ── Footer ──
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 200 },
        border: { top: { style: BorderStyle.SINGLE, size: 4, color: "CCCCCC", space: 8 } },
        children: [new TextRun({ text: "Trist | xfj@sias.edu.cn | 2026 年 6 月", size: 16, color: "AAAAAA" })]
      }),
    ]
  }]
});

Packer.toBuffer(doc).then(buf => {
  fs.writeFileSync("D:/心解-app/路演准备/心解-一页纸介绍.docx", buf);
  console.log("一页纸介绍已生成");
});
