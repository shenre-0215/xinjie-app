// Mock for @dcloudio/uni-app lifecycle hooks
// All pages import from this package — we provide no-op implementations

export function onLoad(fn, ...args) {
  // Called immediately in browser context
  if (typeof fn === 'function') {
    const page = getCurrentPage()
    fn.call(null, page?.options || {})
  }
}

export function onShow(fn) {
  if (typeof fn === 'function') fn()
}

export function onHide(fn) {
  // No-op in browser
}

export function onReady(fn) {
  if (typeof fn === 'function') fn()
}

export function onUnload(fn) {
  // No-op in browser
}

export function onPullDownRefresh(fn) {
  // No-op in browser
}

export function onReachBottom(fn) {
  // No-op in browser
}

export function onPageScroll(fn) {
  window.addEventListener('scroll', () => fn({ scrollTop: window.scrollY }))
}

function getCurrentPage() {
  return { options: parseRouteParams() }
}

function parseRouteParams() {
  const hash = window.location.hash.replace('#/', '')
  const [path, query] = hash.split('?')
  const options = {}
  if (query) {
    query.split('&').forEach(pair => {
      const [k, v] = pair.split('=')
      options[decodeURIComponent(k)] = decodeURIComponent(v || '')
    })
  }
  options.path = path || ''
  return options
}
