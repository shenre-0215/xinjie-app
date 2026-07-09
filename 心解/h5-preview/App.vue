<template>
  <div class="app-wrapper">
    <transition name="page" mode="out-in">
      <component :is="currentComponent" v-if="currentComponent" :key="currentPath" />
      <div v-else class="loading">
        <p>🌿</p>
        <p>加载中...</p>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, shallowRef, onMounted, onUnmounted } from 'vue'
import { findRoute, getDefaultRoute } from './routes.js'

const currentComponent = shallowRef(null)
const currentPath = ref('')

function getPath() {
  const hash = window.location.hash
  if (!hash || hash === '#/' || hash === '#') {
    return getDefaultRoute().path
  }
  return hash.replace(/^#\/?/, '/').replace(/^\/+/, '/')
}

async function navigate(path) {
  if (path === currentPath.value) return
  currentPath.value = path
  let route = findRoute(path)
  if (!route) route = findRoute(getDefaultRoute().path)
  try {
    const mod = await route.component()
    currentComponent.value = mod.default
  } catch (e) {
    console.error('[router] Failed to load:', path, e)
  }
}

function handleInputFocus(e) {
  setTimeout(() => {
    const target = e.target
    const rect = target.getBoundingClientRect()
    const windowHeight = window.innerHeight
    const keyboardHeight = windowHeight * 0.4
    const visibleBottom = windowHeight - keyboardHeight
    
    if (rect.bottom > visibleBottom) {
      const scrollAmount = rect.bottom - visibleBottom + 20
      window.scrollTo({ top: window.scrollY + scrollAmount, behavior: 'smooth' })
    }
  }, 300)
}

function handleInputBlur() {
  setTimeout(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, 200)
}

function handleHashChange() {
  navigate(getPath())
}

function handlePopState() {
  navigate(getPath())
}

window.addEventListener('hashchange', handleHashChange)
window.addEventListener('popstate', handlePopState)
document.addEventListener('focusin', handleInputFocus)
document.addEventListener('focusout', handleInputBlur)

onMounted(() => navigate(getPath()))

onUnmounted(() => {
  window.removeEventListener('hashchange', handleHashChange)
  window.removeEventListener('popstate', handlePopState)
  document.removeEventListener('focusin', handleInputFocus)
  document.removeEventListener('focusout', handleInputBlur)
})
</script>

<style>
.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  color: #3d6751;
  font-size: 16px;
  gap: 12px;
  font-family: 'PingFang SC', -apple-system, sans-serif;
  background: #f9faf6;
}
.loading p:first-child { font-size: 48px; }

.page-enter-active {
  transition: opacity 0.3s ease-out, transform 0.3s ease-out;
}

.page-leave-active {
  transition: opacity 0.2s ease-in, transform 0.2s ease-in;
}

.page-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.page-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
