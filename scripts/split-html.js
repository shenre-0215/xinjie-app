// Split xinjie.html into individual page files for browser preview
const fs = require('fs')
const path = require('path')

const source = path.join(__dirname, '..', '心解', 'xinjie.html')
const outDir = path.join(__dirname, '..', '原型预览')

const raw = fs.readFileSync(source, 'utf-8')

// 12 pages with their DOCTYPE line numbers and titles
const pages = [
  { startLine: 1,   title: '我的 - 个人中心',   slug: 'mine' },
  { startLine: 297, title: '织记 - 首页',       slug: 'zhiji' },
  { startLine: 565, title: '织光 - 广场',       slug: 'zhiguang' },
  { startLine: 873, title: '织记 - 思考链编辑', slug: 'zhiji-thinking-chain' },
  { startLine: 1114, title: '织记 - 日记编辑',   slug: 'zhiji-diary-edit' },
  { startLine: 1383, title: '心宝 - 历史对话',   slug: 'xinbao-history' },
  { startLine: 1713, title: '心宝 - 对话页',     slug: 'xinbao-chat' },
  { startLine: 1989, title: '织光 - 分享详情',   slug: 'zhiguang-detail' },
  { startLine: 2263, title: '心网 - 可视化全景', slug: 'xinwang-network' },
  { startLine: 2585, title: '心网 - 三观体系',   slug: 'xinwang-worldview' },
  { startLine: 2872, title: '我的 - 成长档案',   slug: 'mine-growth' },
  { startLine: 3201, title: '织记 - 悬置清单',   slug: 'zhiji-suspend-list' },
]

// The page start is the comment line right before DOCTYPE
// Each page = comment line + DOCTYPE + everything until next page's comment
const lines = raw.split('\n')

// Build pages with actual line indices (0-based)
const pageInfos = pages.map((p, i) => ({
  ...p,
  lineIdx: p.startLine - 1, // 0-based
}))

// Ensure output directory exists
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true })
}

// Extract each page
const extracted = []
for (let i = 0; i < pageInfos.length; i++) {
  const startIdx = pageInfos[i].lineIdx
  const endIdx = i < pageInfos.length - 1
    ? pageInfos[i + 1].lineIdx
    : lines.length

  // Trim trailing empty lines
  let end = endIdx
  while (end > startIdx && lines[end - 1].trim() === '') {
    end--
  }

  const content = lines.slice(startIdx, end).join('\n')

  // Wrap in a proper HTML document if needed
  const wrapped = wrapPage(content, pageInfos[i].title)

  const filename = `${pageInfos[i].slug}.html`
  const filepath = path.join(outDir, filename)
  fs.writeFileSync(filepath, wrapped, 'utf-8')

  extracted.push({ slug: pageInfos[i].slug, title: pageInfos[i].title, file: filename })
  console.log(`  ✓ ${filename} (${pageInfos[i].title})`)
}

// Generate index page
const indexHtml = generateIndex(extracted)
fs.writeFileSync(path.join(outDir, 'index.html'), indexHtml, 'utf-8')
console.log(`\n  索引页: index.html`)
console.log(`  共 ${extracted.length} 个页面 → ${outDir}`)

function wrapPage(content, title) {
  // The page already starts with its own DOCTYPE, just needs to be standalone
  // Add a back-to-index link at the top
  const backBtn = `
<!-- Back to index -->
<div style="position:fixed;top:10px;left:10px;z-index:9999;background:rgba(255,255,255,0.9);border-radius:50%;width:36px;height:36px;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,0.12);">
  <a href="index.html" style="text-decoration:none;font-size:20px;color:#3d6751;" title="返回列表">☰</a>
</div>
`
  // Insert the back button after <body> tag
  const bodyIdx = content.indexOf('<body')
  const bodyTagEnd = content.indexOf('>', bodyIdx) + 1
  if (bodyTagEnd > 0) {
    return content.slice(0, bodyTagEnd) + backBtn + content.slice(bodyTagEnd)
  }
  return content
}

function generateIndex(pages) {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>心解 · 原型预览</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'PingFang SC', -apple-system, sans-serif;
      background: #f9faf6;
      color: #1a1c1a;
      min-height: 100vh;
      padding: 40px 24px;
    }
    h1 {
      font-size: 28px;
      color: #3d6751;
      margin-bottom: 8px;
    }
    .subtitle {
      font-size: 14px;
      color: #717973;
      margin-bottom: 32px;
    }
    .grid {
      display: flex;
      flex-direction: column;
      gap: 12px;
      max-width: 480px;
    }
    a.card {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 18px 20px;
      background: #ffffff;
      border-radius: 16px;
      text-decoration: none;
      color: #1a1c1a;
      box-shadow: 0 2px 12px rgba(168,213,186,0.1);
      transition: transform 0.15s ease, box-shadow 0.15s ease;
    }
    a.card:hover, a.card:active {
      transform: scale(0.98);
      box-shadow: 0 4px 20px rgba(168,213,186,0.2);
    }
    .card-num {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: rgba(168,213,186,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 13px;
      font-weight: 600;
      color: #3d6751;
      flex-shrink: 0;
    }
    .card-info {
      flex: 1;
      min-width: 0;
    }
    .card-title {
      font-size: 16px;
      font-weight: 600;
    }
    .card-tab {
      font-size: 12px;
      color: #717973;
      margin-top: 2px;
    }
    .card-arrow {
      color: #a8d5ba;
      font-size: 18px;
    }
    .section-title {
      font-size: 12px;
      font-weight: 600;
      color: #717973;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      padding: 16px 0 8px;
      border-bottom: 1px solid #edeeeb;
      margin-bottom: 4px;
    }
  </style>
</head>
<body>
  <h1>🌿 心解 · 原型预览</h1>
  <p class="subtitle">12 个页面的设计稿，点击即可查看</p>

  <div class="grid">
    <div class="section-title">织记</div>
    ${pages.filter(p => p.slug.startsWith('zhiji-')).map(p => `
    <a class="card" href="${p.file}">
      <div class="card-num">📝</div>
      <div class="card-info"><div class="card-title">${p.title}</div></div>
      <div class="card-arrow">→</div>
    </a>`).join('')}
    ${pages.filter(p => p.slug === 'zhiji')[0] ? `
    <a class="card" href="zhiji.html">
      <div class="card-num">📝</div>
      <div class="card-info"><div class="card-title">织记 - 首页</div></div>
      <div class="card-arrow">→</div>
    </a>` : ''}

    <div class="section-title">心宝</div>
    ${pages.filter(p => p.slug.startsWith('xinbao-')).map(p => `
    <a class="card" href="${p.file}">
      <div class="card-num">💬</div>
      <div class="card-info"><div class="card-title">${p.title}</div></div>
      <div class="card-arrow">→</div>
    </a>`).join('')}

    <div class="section-title">心网</div>
    ${pages.filter(p => p.slug.startsWith('xinwang-')).map(p => `
    <a class="card" href="${p.file}">
      <div class="card-num">🕸</div>
      <div class="card-info"><div class="card-title">${p.title}</div></div>
      <div class="card-arrow">→</div>
    </a>`).join('')}

    <div class="section-title">织光</div>
    ${pages.filter(p => p.slug.startsWith('zhiguang-')).map(p => `
    <a class="card" href="${p.file}">
      <div class="card-num">✨</div>
      <div class="card-info"><div class="card-title">${p.title}</div></div>
      <div class="card-arrow">→</div>
    </a>`).join('')}
    ${pages.filter(p => p.slug === 'zhiguang')[0] ? `
    <a class="card" href="zhiguang.html">
      <div class="card-num">✨</div>
      <div class="card-info"><div class="card-title">织光 - 广场</div></div>
      <div class="card-arrow">→</div>
    </a>` : ''}

    <div class="section-title">我的</div>
    ${pages.filter(p => p.slug.startsWith('mine-')).map(p => `
    <a class="card" href="${p.file}">
      <div class="card-num">👤</div>
      <div class="card-info"><div class="card-title">${p.title}</div></div>
      <div class="card-arrow">→</div>
    </a>`).join('')}
    ${pages.filter(p => p.slug === 'mine')[0] ? `
    <a class="card" href="mine.html">
      <div class="card-num">👤</div>
      <div class="card-info"><div class="card-title">我的 - 个人中心</div></div>
      <div class="card-arrow">→</div>
    </a>` : ''}
  </div>
</body>
</html>`
}
