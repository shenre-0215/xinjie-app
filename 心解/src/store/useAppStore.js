/* ===== 心解 Global App Store ===== */
import { reactive } from 'vue'
import { userProfile } from '../mock/data.js'
import { getStoreKey, authState } from './useAuthStore.js'

const BASE_KEY = 'xinjie_app'

function loadState() {
  try {
    const saved = uni.getStorageSync(getStoreKey(BASE_KEY))
    if (saved) return JSON.parse(saved)
  } catch (e) { /* ignore */ }
  return null
}

function saveState(state) {
  try {
    uni.setStorageSync(getStoreKey(BASE_KEY), JSON.stringify(state))
  } catch (e) { /* ignore */ }
}

const saved = loadState()

function _defaultUser() {
  if (!authState.uid) return { nickname: '', avatar: '', stats: { closedChains: 0, totalNodes: 0, worldviewItems: 0 } }
  return saved?.user || { ...userProfile }
}

export const appState = reactive({
  // User
  user: _defaultUser(),

  // Current tab
  currentTab: saved?.currentTab || 'zhiji',

  // App settings
  settings: saved?.settings || {
    voiceEnabled: false,
    privacyMode: false,
    reminderEnabled: false,
    anonymousDefault: false
  }
})

export function reloadLocal() {
  const data = loadState()
  appState.user = data?.user || _defaultUser()
  appState.currentTab = data?.currentTab || 'zhiji'
  appState.settings = data?.settings || {
    voiceEnabled: false,
    privacyMode: false,
    reminderEnabled: false,
    anonymousDefault: false
  }
}

// Auto-save on changes (called manually after significant updates)
export function persistAppState() {
  saveState({
    user: appState.user,
    currentTab: appState.currentTab,
    settings: appState.settings
  })
}

// Tab switching
export function switchTab(tab) {
  appState.currentTab = tab
  persistAppState()
}

// Update user profile
export function updateProfile(data) {
  Object.assign(appState.user, data)
  persistAppState()
}

// Update setting
export function updateSetting(key, value) {
  appState.settings[key] = value
  persistAppState()
}
