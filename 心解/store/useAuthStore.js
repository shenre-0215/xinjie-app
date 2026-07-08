/* ===== Auth Store — uni-id login/register ===== */
import { reactive } from 'vue'

const STORAGE_KEY = 'xinjie_auth'
const USERS_KEY = 'xinjie_local_users'

function loadState() {
  try {
    const saved = uni.getStorageSync(STORAGE_KEY)
    if (saved) return JSON.parse(saved)
  } catch (e) { /* ignore */ }
  return null
}

function saveState(state) {
  try {
    uni.setStorageSync(STORAGE_KEY, JSON.stringify(state))
  } catch (e) { /* ignore */ }
}

const saved = loadState()

export const authState = reactive({
  uid: saved?.uid || '',
  token: saved?.token || '',
  tokenExpired: saved?.tokenExpired || 0,
  nickname: saved?.nickname || '',
  email: saved?.email || '',
  avatar: saved?.avatar || '',
  isLoggedIn: saved?.isLoggedIn || false,
  hasCloudAuth: saved?.hasCloudAuth || false
})

function _save() {
  saveState({
    uid: authState.uid,
    token: authState.token,
    tokenExpired: authState.tokenExpired,
    nickname: authState.nickname,
    email: authState.email,
    avatar: authState.avatar,
    isLoggedIn: authState.isLoggedIn,
    hasCloudAuth: authState.hasCloudAuth
  })
}

// Generate uid from email
function makeUid(email) {
  return 'u_' + email.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 40)
}

// ========== Storage key isolation per user ==========
export function getStoreKey(baseName) {
  return authState.uid ? `${baseName}_${authState.uid}` : baseName
}

// ========== Cloud DB helpers ==========

/**
 * Get uniCloud database instance (clientDB).
 * Returns null if uniCloud is not available.
 */
export function getCloudDB() {
  try {
    // uniCloud.database() is the clientDB API in uni-app client
    if (typeof uniCloud !== 'undefined' && uniCloud.database) {
      return uniCloud.database()
    }
  } catch (e) { /* cloud not available */ }
  return null
}

/**
 * Check if cloud sync is available (logged in + uniCloud ready).
 */
export function cloudAvailable() {
  return authState.isLoggedIn && getCloudDB() !== null
}

// ========== Cloud sync orchestration ==========

/**
 * Reload all stores from new user's localStorage.
 * Must be called BEFORE syncAllFromCloud when uid changes.
 */
export async function reloadAllStoresLocal() {
  try {
    const stores = await Promise.all([
      import('./useZhijiStore.js'),
      import('./useXinbaoStore.js'),
      import('./useXinwangStore.js'),
      import('./useZhiguangStore.js'),
      import('./useAppStore.js')
    ])
    for (const store of stores) {
      if (store.reloadLocal) store.reloadLocal()
    }
    console.log('[auth] Local reload complete for', authState.uid)
  } catch (e) {
    console.error('[auth] Local reload failed:', e.message || e)
  }
}

/**
 * Pull all user data from cloud after login.
 */
export async function syncAllFromCloud() {
  if (!cloudAvailable()) return

  const uid = authState.uid
  try {
    // Dynamic imports break circular deps
    const stores = await Promise.all([
      import('./useZhijiStore.js'),
      import('./useXinbaoStore.js'),
      import('./useXinwangStore.js'),
      import('./useZhiguangStore.js')
    ])

    for (const store of stores) {
      if (store.syncFromCloud) {
        await store.syncFromCloud(uid)
      }
    }
    console.log('[auth] Cloud sync complete for', uid)
  } catch (e) {
    console.error('[auth] Cloud sync failed:', e.message || e)
  }
}

// ========== Local users ==========
function getLocalUsers() {
  try {
    const raw = uni.getStorageSync(USERS_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch (e) { return {} }
}

function saveLocalUsers(users) {
  try {
    uni.setStorageSync(USERS_KEY, JSON.stringify(users))
  } catch (e) { /* ignore */ }
}

// ========== Register ==========
export async function register(nickname, email, password) {
  // Try cloud uni-id first
  try {
    if (typeof uniCloud !== 'undefined' && uniCloud.callFunction) {
      const res = await uniCloud.callFunction({
        name: 'uni-id',
        data: { action: 'register', params: { email, password, nickname } }
      })
      if (res.result?.code === 0) {
        authState.uid = res.result.uid
        authState.token = res.result.token
        authState.nickname = nickname
        authState.email = email
        authState.isLoggedIn = true
        authState.hasCloudAuth = true
        _save()
        reloadAllStoresLocal().then(() => syncAllFromCloud())
        return { ok: true }
      }
      // Account exists or other cloud error → fall through to local
      if (res.result?.code !== -1 || res.result?.msg?.includes('网络')) {
        return { ok: false, msg: res.result?.msg || '注册失败' }
      }
    }
  } catch (e) {
    // Cloud unavailable → fall back to localStorage
    console.log('[auth] Cloud register unavailable, using local storage')
  }

  // Local fallback
  const users = getLocalUsers()
  if (users[email]) {
    return { ok: false, msg: '这个邮箱已被注册' }
  }
  const uid = makeUid(email)
  users[email] = { password, nickname, uid, createdAt: new Date().toISOString() }
  saveLocalUsers(users)

  authState.uid = uid
  authState.nickname = nickname
  authState.email = email
  authState.isLoggedIn = true
  _save()
  reloadAllStoresLocal().then(() => syncAllFromCloud())
  return { ok: true }
}

// ========== Login ==========
export async function login(email, password) {
  // Try cloud uni-id first
  try {
    if (typeof uniCloud !== 'undefined' && uniCloud.callFunction) {
      const res = await uniCloud.callFunction({
        name: 'uni-id',
        data: { action: 'login', params: { email, password } }
      })
      if (res.result?.code === 0) {
        authState.uid = res.result.uid
        authState.token = res.result.token
        authState.nickname = email.split('@')[0]
        authState.email = email
        authState.isLoggedIn = true
        authState.hasCloudAuth = true
        _save()
        reloadAllStoresLocal().then(() => syncAllFromCloud())
        return { ok: true }
      }
      return { ok: false, msg: res.result?.msg || '登录失败' }
    }
  } catch (e) {
    console.log('[auth] Cloud login unavailable, using local storage')
  }

  // Local fallback
  const users = getLocalUsers()
  const user = users[email]
  if (!user || user.password !== password) {
    return { ok: false, msg: '邮箱或密码不正确' }
  }
  authState.uid = user.uid || makeUid(email)
  authState.nickname = user.nickname || email.split('@')[0]
  authState.email = email
  authState.isLoggedIn = true
  _save()
  reloadAllStoresLocal().then(() => syncAllFromCloud())
  return { ok: true }
}

// ========== WeChat login ==========
export async function wechatLogin() {
  try {
    const loginRes = await uni.login({ provider: 'weixin' })
    if (!loginRes.code) {
      return { ok: false, msg: '获取微信授权失败' }
    }
    const res = await uniCloud.callFunction({
      name: 'uni-id',
      data: { action: 'loginByWeixin', params: { code: loginRes.code } }
    })
    if (res.result?.code === 0) {
      authState.uid = res.result.uid
      authState.token = res.result.token
      authState.tokenExpired = res.result.tokenExpired || 0
      authState.nickname = res.result.nickname || '微信用户'
      authState.avatar = res.result.avatar || ''
      authState.isLoggedIn = true
      authState.hasCloudAuth = true
      _save()
      reloadAllStoresLocal().then(() => syncAllFromCloud())
      return { ok: true }
    }
    return { ok: false, msg: res.result?.msg || '微信登录失败' }
  } catch (e) {
    console.error('[auth] WeChat login error:', e.message || e)
    return { ok: false, msg: '微信登录暂不可用' }
  }
}

export function logout() {
  // Try cloud logout (fire-and-forget)
  if (authState.token && typeof uniCloud !== 'undefined' && uniCloud.callFunction) {
    uniCloud.callFunction({
      name: 'uni-id',
      data: { action: 'logout', params: { token: authState.token } }
    }).catch(() => { /* ignore */ })
  }
  authState.uid = ''
  authState.token = ''
  authState.tokenExpired = 0
  authState.isLoggedIn = false
  authState.hasCloudAuth = false
  _save()
  reloadAllStoresLocal()
}
