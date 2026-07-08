<template>
  <component :is="currentComponent" v-if="currentComponent" :key="currentPath" />
  <div v-else class="loading">
    <p>🌿</p>
    <p>加载中...</p>
  </div>
</template>

<script setup>
import { ref, shallowRef, onMounted } from 'vue'
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

window.addEventListener('hashchange', () => navigate(getPath()))
window.addEventListener('popstate', () => navigate(getPath()))
onMounted(() => navigate(getPath()))
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
</style>
