/**
 * 后处理 uni-app H5 构建产物：将 #app 包裹在手机框 #phone 中
 * 桌面端显示 iPhone 框 + 刘海，移动端自动全屏
 *
 * Usage: node scripts/wrap-phone-frame.js [buildDir]
 *   buildDir 默认为 dist/build/h5
 */
const fs = require('fs')
const path = require('path')

const buildDir = process.argv[2] || path.join(__dirname, '..', '心解', 'dist')
const indexPath = path.join(buildDir, 'index.html')

if (!fs.existsSync(indexPath)) {
  console.error(`index.html not found at: ${indexPath}`)
  console.error('Run "npm run build:h5" first.')
  process.exit(0)
}

let html = fs.readFileSync(indexPath, 'utf-8')

// ── Phone frame CSS (injects into <head>) ──
const phoneCSS = `
<style id="phone-frame-css">
  * { margin: 0; padding: 0; box-sizing: border-box; }

  html, body {
    width: 100%; height: 100%;
    background: linear-gradient(135deg, #e8f0e9 0%, #f0f4f1 100%);
    display: flex; align-items: center; justify-content: center;
    overflow: hidden;
    font-family: 'PingFang SC', -apple-system, sans-serif;
    -webkit-tap-highlight-color: transparent;
    user-select: none;
  }

  #phone {
    width: 375px; height: 812px;
    background: #f9faf6;
    border-radius: 40px;
    overflow: hidden;
    box-shadow: 0 20px 60px rgba(0,0,0,0.25), 0 0 0 3px rgba(255,255,255,0.3), inset 0 0 0 2px rgba(0,0,0,0.05);
    position: relative;
  }

  .phone-notch {
    display: block;
    position: absolute; top: 0; left: 50%;
    transform: translateX(-50%);
    width: 140px; height: 24px;
    background: #1a1c1a;
    border-radius: 0 0 20px 20px;
    z-index: 1000;
  }

  .install-hint {
    display: none;
    position: fixed; bottom: 30px; left: 50%;
    transform: translateX(-50%);
    background: rgba(61, 103, 81, 0.95);
    color: white;
    padding: 16px 24px;
    border-radius: 30px;
    font-size: 14px;
    box-shadow: 0 10px 30px rgba(61, 103, 81, 0.3);
    z-index: 100;
    animation: slideUp 0.3s ease-out;
  }

  @media (max-width: 420px) {
    #phone {
      width: 100vw; height: 100dvh;
      border-radius: 0; box-shadow: none;
    }
    .phone-notch { display: none; }
    html, body {
      background: #f9faf6;
      align-items: flex-start;
      justify-content: flex-start;
    }
    .install-hint { display: block; }
  }

  @keyframes slideUp {
    from { opacity: 0; transform: translateX(-50%) translateY(20px); }
    to { opacity: 1; transform: translateX(-50%) translateY(0); }
  }
</style>`

// Inject phone CSS before </head>
html = html.replace('</head>', phoneCSS + '\n</head>')

// Wrap <div id="app"> in phone frame
const phoneWrap = `
<div id="phone">
  <div class="phone-notch"></div>
  <div id="app">`

html = html.replace('<div id="app">', phoneWrap)

// Close phone div before </body>
html = html.replace('</body>', '</div>\n<div class="install-hint">💡 在手机浏览器中点击菜单 → 添加到主屏幕，体验原生APP效果</div>\n</body>')

fs.writeFileSync(indexPath, html, 'utf-8')
console.log('✅ Phone frame wrapper applied to', indexPath)
