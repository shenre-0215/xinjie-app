<script>
import { authState, syncAllFromCloud } from './store/useAuthStore.js'

export default {
  onLaunch: function() {
    console.log('心解 App Launch')
    this.initStorage()
    // Sync cloud data if already logged in
    if (authState.isLoggedIn) {
      syncAllFromCloud()
    }
  },
  onShow: function() {
    console.log('心解 App Show')
  },
  onHide: function() {
    console.log('心解 App Hide')
  },
  methods: {
    initStorage() {
      const launched = uni.getStorageSync('_app_launched')
      if (!launched) {
        uni.setStorageSync('_app_launched', true)
      }
    }
  }
}
</script>

<style lang="scss">
@import '@/styles/variables.scss';
@import '@/styles/global.scss';

/* Global page transition */
page {
  background-color: $color-background;
  font-family: $font-body;
  font-size: $fs-body-md;
  color: $color-on-surface;
  -webkit-tap-highlight-color: transparent;
}

/* Fade transition for page switches */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Slide up transition for modals */
.slide-up-enter-active {
  transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.slide-up-leave-active {
  transition: transform 0.25s ease;
}
.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
}
</style>
