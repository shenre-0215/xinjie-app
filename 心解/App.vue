<script setup>
import { onLaunch, onShow, onHide } from '@dcloudio/uni-app'

onLaunch(() => {
  console.log('心解 App Launch')
})

onShow(() => {
  console.log('心解 App Show')
})

onHide(() => {
  console.log('心解 App Hide')
})
</script>

<style>
page, view, text, button, input, textarea, scroll-view, image, navigator {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

page {
  font-family: 'PingFang SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background-color: #f9faf6;
  color: #333333;
  min-height: 100vh;
}

view, text {
  box-sizing: border-box;
}

button {
  margin: 0;
  padding: 0;
  background: transparent;
  border: none;
  outline: none;
}

button::after {
  border: none;
}
</style>
