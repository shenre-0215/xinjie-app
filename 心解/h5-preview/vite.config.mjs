import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const parentDir = path.resolve(__dirname, '..')

let DEEPSEEK_API_KEY = ''
try {
  const cfgPath = path.resolve(__dirname, 'local.config.json')
  if (fs.existsSync(cfgPath)) {
    const cfg = JSON.parse(fs.readFileSync(cfgPath, 'utf-8'))
    DEEPSEEK_API_KEY = cfg.deepseekApiKey || ''
  }
} catch (e) {
  console.warn('[vite] Failed to load local.config.json')
}

if (!DEEPSEEK_API_KEY) {
  console.warn('[vite] DeepSeek API key not configured')
}

function rpxToPx() {
  return {
    postcssPlugin: 'rpx-to-px',
    Declaration(decl) {
      decl.value = decl.value.replace(/(\d+(?:\.\d+)?)rpx/g, (_, val) => {
        return (parseFloat(val) / 2).toFixed(2).replace(/\.?0+$/, '') + 'px'
      })
      decl.value = decl.value.replace(/100vh/g, 'calc(var(--vh) * 100)')
    }
  }
}
rpxToPx.postcss = true

export default defineConfig({
  root: __dirname,
  base: '/xinjie-app/',
  plugins: [vue()],
  resolve: {
    alias: {
      '@': parentDir,
      '~': parentDir,
      '@dcloudio/uni-app': path.resolve(parentDir, 'mock-uni-app.js'),
    }
  },
  css: {
    postcss: {
      plugins: [rpxToPx()]
    },
    preprocessorOptions: {
      scss: {
        silenceDeprecations: ['import'],
        additionalData: `@import "@/styles/variables.scss";`
      }
    }
  },
  server: {
    port: 5173,
    host: '0.0.0.0',
    open: false,
    proxy: {
      '/api/deepseek': {
        target: 'https://api.deepseek.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/deepseek/, ''),
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq, req) => {
            if (DEEPSEEK_API_KEY) {
              proxyReq.setHeader('Authorization', `Bearer ${DEEPSEEK_API_KEY}`)
            }
          })
        }
      }
    }
  }
})