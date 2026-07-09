// Mock uni API surface for browser preview
// Injected via Vite plugin or loaded as a script in index.html

function noop() {}

window.uni = {
  // Navigation
  navigateTo({ url, success = noop, fail = noop, complete = noop }) {
    if (!url) {
      fail({ errMsg: 'navigateTo:fail url is required' })
      return Promise.reject({ errMsg: 'navigateTo:fail url is required' })
    }
    const hash = url.startsWith('/') ? '#/' + url.slice(1) : '#/' + url
    window.location.hash = hash
    const res = { errMsg: 'navigateTo:ok' }
    success(res)
    complete(res)
    return Promise.resolve(res)
  },
  navigateBack({ delta = 1, success = noop, fail = noop, complete = noop } = {}) {
    window.history.go(-delta)
    const res = { errMsg: 'navigateBack:ok' }
    success(res)
    complete(res)
    return Promise.resolve(res)
  },
  switchTab({ url, success = noop, fail = noop, complete = noop }) {
    if (!url) {
      fail({ errMsg: 'switchTab:fail url is required' })
      return Promise.reject({ errMsg: 'switchTab:fail url is required' })
    }
    window.location.hash = '#/' + url.replace(/^\//, '')
    const res = { errMsg: 'switchTab:ok' }
    success(res)
    complete(res)
    return Promise.resolve(res)
  },
  redirectTo({ url, success = noop, fail = noop, complete = noop }) {
    window.location.hash = '#/' + url.replace(/^\//, '')
    const res = { errMsg: 'redirectTo:ok' }
    success(res)
    complete(res)
    return Promise.resolve(res)
  },
  reLaunch({ url, success = noop, fail = noop, complete = noop }) {
    window.location.hash = '#/' + url.replace(/^\//, '')
    const res = { errMsg: 'reLaunch:ok' }
    success(res)
    complete(res)
    return Promise.resolve(res)
  },

  // UI
  showToast({ title, icon = 'none', duration = 2000, success = noop, fail = noop, complete = noop }) {
    const toast = document.createElement('div')
    toast.style.cssText = `
      position: fixed; top: 80px; left: 50%; transform: translateX(-50%);
      background: rgba(26, 28, 26, 0.85); color: #fff; padding: 12px 24px;
      border-radius: 999px; font-size: 14px; z-index: 99999;
      backdrop-filter: blur(10px); transition: opacity 0.3s;
      font-family: 'PingFang SC', sans-serif; pointer-events: none;
    `
    toast.textContent = title
    document.body.appendChild(toast)
    setTimeout(() => {
      toast.style.opacity = '0'
      setTimeout(() => toast.remove(), 300)
    }, duration)
    const res = { errMsg: 'showToast:ok' }
    success(res)
    complete(res)
    return Promise.resolve(res)
  },
  showModal({ title, content, success = noop, fail = noop, complete = noop }) {
    const ok = window.confirm(title + '\n\n' + content)
    const res = { confirm: ok, cancel: !ok, errMsg: 'showModal:ok' }
    if (ok) {
      success(res)
    } else {
      fail({ errMsg: 'showModal:fail cancel' })
    }
    complete(res)
    return Promise.resolve(res)
  },
  showActionSheet({ itemList, success = noop, fail = noop, complete = noop }) {
    const choice = window.prompt(itemList.map((item, i) => `${i}: ${item}`).join('\n'), '')
    if (choice !== null) {
      const tapIndex = parseInt(choice)
      if (!isNaN(tapIndex) && tapIndex >= 0 && tapIndex < itemList.length) {
        const res = { tapIndex, errMsg: 'showActionSheet:ok' }
        success(res)
        complete(res)
        return Promise.resolve(res)
      }
    }
    fail({ errMsg: 'showActionSheet:fail cancel' })
    complete({ errMsg: 'showActionSheet:fail cancel' })
    return Promise.reject({ errMsg: 'showActionSheet:fail cancel' })
  },
  showLoading({ title = '加载中...' } = {}) {
    console.log('[uni] loading:', title)
  },
  hideLoading() {},

  // Image
  chooseImage({ success = noop, fail = noop, complete = noop } = {}) {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = (e) => {
      const file = e.target.files[0]
      if (file) {
        const res = { tempFilePaths: [URL.createObjectURL(file)], errMsg: 'chooseImage:ok' }
        success(res)
        complete(res)
      }
    }
    input.click()
    return Promise.resolve({ errMsg: 'chooseImage:ok' })
  },

  // Storage
  getStorageSync(key) {
    try {
      const raw = localStorage.getItem(key)
      return raw ? JSON.parse(raw) : null
    } catch { return null }
  },
  setStorageSync(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch { /* ignore */ }
  },
  removeStorageSync(key) {
    localStorage.removeItem(key)
  },
  clearStorageSync() {
    localStorage.clear()
  },

  // System info
  getSystemInfoSync() {
    const safeTop = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--safe-area-inset-top')) || 0
    const safeBottom = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--safe-area-inset-bottom')) || 0
    return {
      platform: 'h5',
      screenWidth: window.innerWidth,
      screenHeight: window.innerHeight,
      windowWidth: window.innerWidth,
      windowHeight: window.innerHeight - safeTop - safeBottom,
      safeArea: {
        top: safeTop, bottom: safeBottom, left: 0, right: 0,
        width: window.innerWidth, height: window.innerHeight - safeTop - safeBottom
      }
    }
  }
}

// uniCloud mock — for H5 preview, call DeepSeek API via Vite proxy
// API key is injected server-side by the Vite proxy (see vite.config.mjs)
// Storage mock: images stored as base64 data URLs in sessionStorage
window._h5Storage = {}

window.uniCloud = {
  async callFunction({ name, data }) {
    if (name === 'chat-api') {
      // Recommend mode: generate 3 worldview prompts
      if (data.mode === 'recommend') {
        const prompt = `用户已有三观条目：\n${(data.worldview||[]).map(e=>'- '+e).join('\n')}\n\n推荐3个可探索方向，每条2-8字标题+10-20字描述+cat(shixiang/woxing/xincheng)。返回纯JSON数组：[{"title":"...","desc":"...","cat":"shixiang"},...]`
        try {
          const r = await fetch('/api/deepseek/chat/completions', {
            method:'POST', headers:{'Content-Type':'application/json'},
            body:JSON.stringify({model:'deepseek-chat',messages:[{role:'user',content:prompt}],temperature:0.9,max_tokens:400})
          })
          const j = await r.json()
          if (j.choices?.length) {
            const text = j.choices[0].message.content.trim().replace(/```json|```/g,'').trim()
            return { result: { code: 0, recs: JSON.parse(text) } }
          }
        } catch(e) { return { result: { code: 500, recs: null } } }
        return { result: { code: 500, recs: null } }
      }

      const systemMsg = {
        role: 'system',
        content: `你是"心宝"，帮用户看清自己困惑的思考搭档。你的工作不是替用户安排，而是帮用户发现ta自己早就知道但还没说出来的东西。每次回复只做一件事：把一个模糊的感觉变成更清晰的问题。具体问题是用户自己回答的。好的回复是"听起来你在意的好像是……对吗？"而不是"你应该先做X"。当用户反复说同一件事没有推进，温和地问一句：你觉得现在继续想下去有帮助吗？不说"辛苦了""你可以的""你需要"这类话。不讲道理不灌鸡汤。回复尽量短，100字以内。当用户表达了明确的核心矛盾或对话进行了5轮以上，在回复末尾附加一行【#关键词】——关键词是2-4个字，精炼概括这段对话的本质矛盾点，例如：时间焦虑、完美标准。`
      }

      try {
        const res = await fetch('/api/deepseek/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'deepseek-chat',
            messages: [systemMsg, ...data.messages],
            temperature: 0.8,
            max_tokens: 600
          })
        })

        const json = await res.json()
        if (json.choices?.length) {
          return { result: { code: 0, reply: json.choices[0].message.content.trim() } }
        }
        return { result: { code: 500, reply: '我的思绪飘了一会儿…我们继续吧。🌿' } }
      } catch (e) {
        console.error('[uniCloud mock] DeepSeek error:', e)
        return { result: { code: 500, reply: '我好像走神了，再说一次好吗？' } }
      }
    }
    return { result: { code: 404, reply: '未知云函数' } }
  },

  // File upload mock — stores as data URL in memory, returns fake fileID
  async uploadFile({ filePath }) {
    // For H5 preview, filePath is already a blob URL from chooseImage.
    // We keep it as-is since it's just for local preview.
    const fakeID = `h5_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
    window._h5Storage[fakeID] = filePath
    console.log('[uniCloud mock] uploadFile:', fakeID)
    return { fileID: filePath } // return blob URL directly for <image> display
  },

  // Get temp file URL — for H5, return the stored path
  async getTempFileURL({ fileList }) {
    const result = (fileList || []).map(f => ({
      fileID: f,
      tempFileURL: window._h5Storage[f] || f
    }))
    return { fileList: result }
  },

  // Database mock (minimal — for zhiguang store to not crash)
  database() {
    console.warn('[uniCloud mock] database() called — no real DB in H5 preview')
    return null
  }
}

function getSafeAreaInsets() {
  const isMobile = window.innerWidth <= 420
  if (!isMobile) {
    return { top: 0, bottom: 0 }
  }
  
  let safeTop = 0
  let safeBottom = 0
  
  if (typeof window.visualViewport !== 'undefined') {
    safeTop = window.visualViewport.offsetTop || 0
    safeBottom = window.innerHeight - window.visualViewport.offsetTop - window.visualViewport.height
  }
  
  const envTop = parseInt(window.getComputedStyle(document.documentElement).getPropertyValue('safe-area-inset-top')) || 0
  const envBottom = parseInt(window.getComputedStyle(document.documentElement).getPropertyValue('safe-area-inset-bottom')) || 0
  
  safeTop = Math.max(safeTop, envTop)
  safeBottom = Math.max(safeBottom, envBottom)
  
  if (safeTop === 0 && envTop === 0 && 'ontouchstart' in window) {
    safeTop = 44
  }
  
  if (safeBottom === 0 && envBottom === 0 && 'ontouchstart' in window) {
    safeBottom = 34
  }
  
  return { top: safeTop, bottom: safeBottom }
}

function setAppHeight() {
  const phone = document.getElementById('phone')
  const isMobile = window.innerWidth <= 420
  let appHeight = phone ? phone.clientHeight : window.innerHeight
  
  const safeArea = getSafeAreaInsets()
  
  if (isMobile) {
    appHeight = window.innerHeight
  }
  
  const vh = appHeight * 0.01
  
  document.documentElement.style.setProperty('--vh', vh + 'px')
  document.documentElement.style.setProperty('--app-height', appHeight + 'px')
  document.documentElement.style.setProperty('--safe-area-inset-top', safeArea.top + 'px')
  document.documentElement.style.setProperty('--safe-area-inset-bottom', safeArea.bottom + 'px')
  
  let existingStyle = document.getElementById('h5-preview-styles')
  if (existingStyle) existingStyle.remove()
  
  const style = document.createElement('style')
  style.id = 'h5-preview-styles'
  style.textContent = `
    :root {
      --safe-area-inset-top: ${safeArea.top}px;
      --safe-area-inset-bottom: ${safeArea.bottom}px;
    }
    scroll-view[scroll-y] {
      display: block;
      overflow-y: auto !important;
      -webkit-overflow-scrolling: touch;
    }
    scroll-view[scroll-x] {
      display: block;
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
    }
    body {
      height: ${appHeight}px !important;
      max-height: ${appHeight}px !important;
      min-height: ${appHeight}px !important;
      overflow: hidden;
    }
    .page-container {
      height: calc(var(--vh) * 100) !important;
      max-height: calc(var(--vh) * 100) !important;
      min-height: calc(var(--vh) * 100) !important;
    }
    .scroll-area {
      height: calc(var(--vh) * 100) !important;
      max-height: calc(var(--vh) * 100) !important;
      min-height: 0;
    }
    .h5-safe-top {
      height: ${safeArea.top}px;
      flex-shrink: 0;
      background-color: #f9faf6;
    }
    .h5-safe-bottom {
      height: ${safeArea.bottom}px;
      flex-shrink: 0;
      background-color: #f9faf6;
    }
  `
  document.head.appendChild(style)
}

function handleOrientationChange() {
  setTimeout(setAppHeight, 100)
  setTimeout(setAppHeight, 500)
}

function handleResize() {
  setAppHeight()
}

function handleVisualViewportResize() {
  setAppHeight()
}

setTimeout(setAppHeight, 100)
setTimeout(setAppHeight, 500)
window.addEventListener('resize', handleResize)
window.addEventListener('orientationchange', handleOrientationChange)
if (window.visualViewport) {
  window.visualViewport.addEventListener('resize', handleVisualViewportResize)
  window.visualViewport.addEventListener('scroll', handleVisualViewportResize)
}
