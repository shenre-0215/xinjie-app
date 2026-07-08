/* ===== 织光 Store - Community Posts & Favorites ===== */
import { reactive } from 'vue'
import { zhiguangPosts } from '../mock/data.js'
import { getStoreKey, getCloudDB, authState } from './useAuthStore.js'

const BASE_KEY = 'xinjie_zhiguang'
const CLOUD_POSTS = 'zhiguang_posts'
const CLOUD_USER = 'zhiguang_userdata'

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

function _isFirstUser() {
  if (!authState.uid) return true // logged out → empty
  try { return !uni.getStorageSync(getStoreKey(BASE_KEY)) } catch (e) { return true }
}

const saved = loadState()

export const zhiguangState = reactive({
  posts: saved?.posts?.length ? saved.posts : (_isFirstUser() ? [] : [...zhiguangPosts]),
  myShares: saved?.myShares || [],
  favorites: saved?.favorites || [],
  personalTab: 'shares'
})

export function reloadLocal() {
  const data = loadState()
  // Posts are community data — keep existing, cloud sync will refresh
  zhiguangState.myShares = data?.myShares || []
  zhiguangState.favorites = data?.favorites || []
  zhiguangState.personalTab = 'shares'
}

function _save() {
  saveState({
    posts: zhiguangState.posts,
    myShares: zhiguangState.myShares,
    favorites: zhiguangState.favorites
  })
  saveUserDataToCloud()
}

// ========== Cloud sync ==========

// Posts are shared data (public read). We sync them from cloud.
// My shares & favorites are per-user, stored in a single user doc.

async function saveUserDataToCloud() {
  const db = getCloudDB()
  if (!db || !authState.uid) return
  const uid = authState.uid
  try {
    const coll = db.collection(CLOUD_USER)
    const res = await coll.where({ uid }).get()
    const doc = {
      uid,
      myShares: zhiguangState.myShares,
      favorites: zhiguangState.favorites,
      updatedAt: new Date()
    }
    if (res.data && res.data.length > 0) {
      await coll.doc(res.data[0]._id).update(doc)
    } else {
      doc.createdAt = new Date()
      await coll.add(doc)
    }
  } catch (e) {
    console.error('[zhiguang] Cloud save failed:', e.message || e)
  }
}

export async function syncFromCloud(uid) {
  const db = getCloudDB()
  if (!db) return

  try {
    // 1. Pull shared posts (public data)
    const postsRes = await db.collection(CLOUD_POSTS)
      .orderBy('createdAt', 'desc')
      .limit(100)
      .get()
    if (postsRes.data && postsRes.data.length > 0) {
      // Map cloud posts to local format
      const cloudPosts = postsRes.data.map(p => ({
        id: p._id,
        author: p.author || '心解用户',
        time: formatRelativeTime(p.createdAt),
        anonymous: p.anonymous || false,
        category: p.category || '',
        content: p.content || '',
        tags: p.tags || [],
        image: p.image || '',
        resonated: false,
        resonatedCount: p.resonatedCount || 0,
        comments: p.comments || []
      }))
      // Merge: cloud posts + local posts not yet synced
      const cloudIds = new Set(cloudPosts.map(p => p.id))
      const localOnly = zhiguangState.posts.filter(p => !cloudIds.has(p.id) && !p.id.startsWith('p'))
      zhiguangState.posts = [...cloudPosts, ...localOnly]
    }

    // 2. Pull user data (myShares + favorites)
    const userRes = await db.collection(CLOUD_USER).where({ uid }).get()
    if (userRes.data && userRes.data.length > 0) {
      const data = userRes.data[0]
      if (data.myShares?.length) zhiguangState.myShares = data.myShares
      if (data.favorites?.length) zhiguangState.favorites = data.favorites
    }

    saveState({
      posts: zhiguangState.posts,
      myShares: zhiguangState.myShares,
      favorites: zhiguangState.favorites
    })
  } catch (e) {
    console.error('[zhiguang] Cloud sync failed:', e.message || e)
  }
}

// --- Posts ---
export function addPost(post) {
  const newPost = {
    id: `p${Date.now()}`,
    author: 'Xin Jie 用户',
    time: '刚刚',
    anonymous: post.anonymous || false,
    category: post.category || '',
    content: post.content || '',
    tags: post.tags || [],
    image: post.image || '',
    resonated: false,
    comments: []
  }
  zhiguangState.posts.unshift(newPost)
  zhiguangState.myShares.unshift(newPost)
  _save()

  // Also save to cloud posts table (shared)
  savePostToCloud(newPost)

  return newPost
}

async function savePostToCloud(post) {
  const db = getCloudDB()
  if (!db) return
  try {
    const doc = {
      uid: authState.uid || '',
      author: post.author,
      anonymous: post.anonymous,
      category: post.category,
      content: post.content,
      tags: post.tags,
      image: post.image,
      resonatedCount: 0,
      comments: [],
      createdAt: new Date()
    }
    await db.collection(CLOUD_POSTS).add(doc)
  } catch (e) {
    console.error('[zhiguang] Post cloud save failed:', e.message || e)
  }
}

// --- Delete post ---
export function deletePost(postId) {
  const idx = zhiguangState.posts.findIndex(p => p.id === postId)
  if (idx === -1) return false

  const post = zhiguangState.posts[idx]

  // 1. Remove from local posts list
  zhiguangState.posts.splice(idx, 1)

  // 2. Remove from myShares
  const shareIdx = zhiguangState.myShares.findIndex(p => p.id === postId)
  if (shareIdx !== -1) zhiguangState.myShares.splice(shareIdx, 1)

  // 3. Remove from favorites if favorited
  const favIdx = zhiguangState.favorites.indexOf(postId)
  if (favIdx !== -1) zhiguangState.favorites.splice(favIdx, 1)

  _save()

  // 4. Try delete from cloud (best-effort: match by uid + content)
  deletePostFromCloud(post).catch(() => {})

  return true
}

async function deletePostFromCloud(post) {
  const db = getCloudDB()
  if (!db || !authState.uid) return
  try {
    // Find the cloud document matching this post
    const res = await db.collection(CLOUD_POSTS)
      .where({ uid: authState.uid, content: post.content })
      .get()
    if (res.data && res.data.length > 0) {
      for (const doc of res.data) {
        await db.collection(CLOUD_POSTS).doc(doc._id).remove()
      }
      console.log('[zhiguang] Deleted', res.data.length, 'cloud post(s)')
    }
  } catch (e) {
    console.error('[zhiguang] Cloud delete failed:', e.message || e)
  }
}

export function toggleResonance(postId) {
  const post = zhiguangState.posts.find(p => p.id === postId)
  if (post) {
    post.resonated = !post.resonated
    post.resonatedCount = (post.resonatedCount || 0) + (post.resonated ? 1 : -1)
    if (post.resonated) {
      if (!zhiguangState.favorites.includes(postId)) zhiguangState.favorites.push(postId)
    } else {
      zhiguangState.favorites = zhiguangState.favorites.filter(f => f !== postId)
    }
    _save()
  }
}

export function addComment(postId, content, author = 'Xin Jie 用户') {
  const post = zhiguangState.posts.find(p => p.id === postId)
  if (post) {
    post.comments.push({
      id: `cmt${Date.now()}`,
      author,
      content,
      time: '刚刚'
    })
    _save()
  }
}

// --- Favorites ---
export function toggleFavorite(postId) {
  const idx = zhiguangState.favorites.indexOf(postId)
  if (idx !== -1) {
    zhiguangState.favorites.splice(idx, 1)
  } else {
    zhiguangState.favorites.push(postId)
  }
  _save()
}

export function isFavorited(postId) {
  return zhiguangState.favorites.includes(postId)
}

export function getFavorites() {
  return zhiguangState.posts.filter(p => zhiguangState.favorites.includes(p.id))
}

// --- Personal tab ---
export function setPersonalTab(tab) {
  zhiguangState.personalTab = tab
}

// --- Helpers ---
function formatRelativeTime(date) {
  if (!date) return ''
  const d = typeof date === 'string' ? new Date(date) : date
  if (isNaN(d.getTime())) return ''
  const now = new Date()
  const diff = now - d
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
  if (diff < 172800000) return '昨天'
  return `${Math.floor(diff / 86400000)}天前`
}
