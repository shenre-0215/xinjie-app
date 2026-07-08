import { createApp } from 'vue'
import App from './App.vue'
import './uni-mock.js'

const app = createApp(App)
app.mount('#app')

// Notify parent frame of hash changes so DevNav stays in sync
function notifyParent() {
  const path = window.location.hash.replace(/^#\/?/, '/') || '/pages/zhiji/index'
  if (window.parent !== window) {
    window.parent.postMessage({ type: 'hashchange', path }, '*')
  }
}

window.addEventListener('hashchange', notifyParent)
