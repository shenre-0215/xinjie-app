// Route map from pages.json
export const routes = [
  // Tab pages
  { path: '/pages/zhiji/index',      component: () => import('../pages/zhiji/index.vue'),     tab: 'zhiji' },
  { path: '/pages/xinbao/index',     component: () => import('../pages/xinbao/index.vue'),    tab: 'xinbao' },
  { path: '/pages/xinwang/index',    component: () => import('../pages/xinwang/index.vue'),   tab: 'xinwang' },
  { path: '/pages/zhiguang/index',   component: () => import('../pages/zhiguang/index.vue'),  tab: 'zhiguang' },
  { path: '/pages/mine/index',       component: () => import('../pages/mine/index.vue'),      tab: 'mine' },

  // Sub pages - zhiji
  { path: '/pages/zhiji/diary-edit',     component: () => import('../pages/zhiji/diary-edit.vue') },
  { path: '/pages/zhiji/thinking-chain', component: () => import('../pages/zhiji/thinking-chain.vue') },
  { path: '/pages/zhiji/suspend-list',   component: () => import('../pages/zhiji/suspend-list.vue') },
  { path: '/pages/zhiji/record-detail',  component: () => import('../pages/zhiji/record-detail.vue') },

  // Sub pages - xinbao
  { path: '/pages/xinbao/history',   component: () => import('../pages/xinbao/history.vue') },
  { path: '/pages/xinbao/settings',  component: () => import('../pages/xinbao/settings.vue') },

  // Sub pages - xinwang
  { path: '/pages/xinwang/worldview',    component: () => import('../pages/xinwang/worldview.vue') },
  { path: '/pages/xinwang/node-detail',  component: () => import('../pages/xinwang/node-detail.vue') },

  // Sub pages - zhiguang
  { path: '/pages/zhiguang/publish', component: () => import('../pages/zhiguang/publish.vue') },
  { path: '/pages/zhiguang/detail',  component: () => import('../pages/zhiguang/detail.vue') },

  // Sub pages - mine
  { path: '/pages/mine/profile-edit', component: () => import('../pages/mine/profile-edit.vue') },
  { path: '/pages/mine/growth',       component: () => import('../pages/mine/growth.vue') },
  { path: '/pages/mine/settings',     component: () => import('../pages/mine/settings.vue') },
  { path: '/pages/mine/favorites',   component: () => import('../pages/mine/favorites.vue') },
  { path: '/pages/mine/feedback',     component: () => import('../pages/mine/feedback.vue') },
  { path: '/pages/mine/login',        component: () => import('../pages/mine/login.vue') },
]

export const tabRoutes = routes.filter(r => r.tab)

export function getDefaultRoute() {
  return routes[0]
}

export function findRoute(path) {
  // Normalize path
  let p = path.startsWith('/') ? path : '/' + path
  // Handle hash-based URLs
  if (p.startsWith('#/')) p = p.slice(1)
  // Strip query string and hash
  p = p.split('?')[0].split('#')[0]
  return routes.find(r => r.path === p) || getDefaultRoute()
}
