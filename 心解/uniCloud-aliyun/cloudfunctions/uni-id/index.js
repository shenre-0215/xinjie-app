'use strict'

/**
 * 心解 uni-id 云函数 — 用户认证
 *
 * 自包含实现，不依赖 uni-id-common。
 * JWT 签发/校验/刷新直接用 Node crypto（HMAC-SHA256）。
 *
 * 支持的 action:
 *   register       — 邮箱注册
 *   login          — 邮箱登录
 *   loginByWeixin  — 微信小程序登录（code → openid → 自动注册/登录）
 *   checkToken     — token 校验
 *   refreshToken   — token 刷新
 *   logout         — 登出
 *   updateProfile  — 更新昵称/头像
 */
const crypto = require('crypto')

// ═══════════════════════════════════════════
// 配置
// ═══════════════════════════════════════════
let _config = null
function getConfig() {
  if (_config) return _config
  try {
    _config = require('./config.json')
    console.log('[uni-id] Config loaded')
  } catch (e) {
    _config = {}
  }
  return _config
}

// ═══════════════════════════════════════════
// JWT 工具（HMAC-SHA256）
// ═══════════════════════════════════════════
function base64UrlEncode(str) {
  return Buffer.from(str).toString('base64')
    .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
}

function base64UrlDecode(str) {
  str = str.replace(/-/g, '+').replace(/_/g, '/')
  while (str.length % 4) str += '='
  return Buffer.from(str, 'base64').toString('utf8')
}

function jwtSign(payload, secret, expiresIn) {
  const header = { alg: 'HS256', typ: 'JWT' }
  const now = Math.floor(Date.now() / 1000)
  const body = { ...payload, iat: now, exp: now + expiresIn }

  const h = base64UrlEncode(JSON.stringify(header))
  const p = base64UrlEncode(JSON.stringify(body))
  const sig = crypto.createHmac('sha256', secret).update(h + '.' + p).digest('base64')
    .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')

  return h + '.' + p + '.' + sig
}

function jwtVerify(token, secret) {
  if (!token || typeof token !== 'string') return null

  const parts = token.split('.')
  if (parts.length !== 3) return null

  const [h, p, sig] = parts
  const expectedSig = crypto.createHmac('sha256', secret).update(h + '.' + p).digest('base64')
    .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')

  if (sig !== expectedSig) return null

  let payload
  try { payload = JSON.parse(base64UrlDecode(p)) }
  catch (e) { return null }

  if (payload.exp && payload.exp * 1000 < Date.now()) return null
  return payload
}

// ═══════════════════════════════════════════
// Token 业务方法
// ═══════════════════════════════════════════
const MAX_TOKENS = 10

function tokenSecret() {
  return getConfig().tokenSecret || 'xinjie-token-secret-key-2026'
}

function tokenExpiry() {
  return getConfig().tokenExpiresIn || 7200
}

function tokenThreshold() {
  return getConfig().tokenExpiresThreshold || 1200
}

// 签发新 token，写入用户记录
async function createToken(usersColl, dbCmd, uid) {
  const secret = tokenSecret()
  const expiresIn = tokenExpiry()
  const token = jwtSign({ uid }, secret, expiresIn)
  const tokenExpired = Date.now() + expiresIn * 1000

  // 写入用户的 token 列表（保留最近 MAX_TOKENS 条）
  try {
    const res = await usersColl.doc(uid).get()
    if (res.data && res.data.length > 0) {
      const tokens = (res.data[0].token || []).slice(-(MAX_TOKENS - 1))
      tokens.push(token)
      await usersColl.doc(uid).update({
        token: tokens,
        last_login_date: new Date()
      })
    }
  } catch (e) {
    console.error('[uni-id] createToken DB update failed:', e.message)
    // 签发 token 不因 DB 写入失败而中断
  }

  return { token, tokenExpired }
}

// 校验 token，可选自动刷新
async function verifyToken(usersColl, token, autoRefresh) {
  const secret = tokenSecret()
  const payload = jwtVerify(token, secret)
  if (!payload) return { errCode: -1, errMsg: 'token 无效或已过期' }

  const result = { errCode: 0, uid: payload.uid, role: payload.role || [] }

  // 自动刷新：剩余有效期 < threshold 时发放新 token
  if (autoRefresh !== false) {
    const remaining = (payload.exp * 1000) - Date.now()
    if (remaining < tokenThreshold() * 1000) {
      const { token: newToken, tokenExpired } = await createToken(usersColl, null, payload.uid)
      result.token = newToken
      result.tokenExpired = tokenExpired
    }
  }

  return result
}

// ═══════════════════════════════════════════
// 辅助
// ═══════════════════════════════════════════
function hashPassword(password, secret) {
  return crypto.createHmac('sha256', secret).update(password).digest('hex')
}

function makeUid() {
  const ts = Date.now().toString(36)
  const rand = crypto.randomBytes(4).toString('hex')
  return (ts + rand).slice(0, 16)
}

async function wxCode2Session(appid, secret, code) {
  const url = `https://api.weixin.qq.com/sns/jscode2session?appid=${appid}&secret=${secret}&js_code=${code}&grant_type=authorization_code`
  try {
    const res = await uniCloud.httpclient.request(url, {
      method: 'GET', dataType: 'json', timeout: 10000
    })
    const body = res.data || res
    if (body.errcode) {
      console.error('[uni-id] WeChat API error:', body)
      return { err: body.errmsg || '微信接口返回错误' }
    }
    return { openid: body.openid, unionid: body.unionid || '' }
  } catch (e) {
    console.error('[uni-id] wxCode2Session failed:', e.message)
    return { err: '连接微信服务器失败' }
  }
}

// ═══════════════════════════════════════════
// 主入口
// ═══════════════════════════════════════════

exports.main = async (event, context) => {
  const config = getConfig()
  const db = uniCloud.database()
  const dbCmd = db.command
  const usersColl = db.collection('uni-id-users')
  const { action, params } = event || {}

  try {

    // ─── 邮箱注册 ──────────────────────────
    if (action === 'register') {
      const { email, password, nickname } = params || {}
      if (!email || !password) return { code: -1, msg: '邮箱和密码不能为空' }

      const existRes = await usersColl.where({ email }).get()
      if (existRes.data && existRes.data.length > 0) {
        return { code: -1, msg: '此邮箱已被注册' }
      }

      const pwSecret = config.passwordSecret || 'xinjie-salt-2026'
      const uid = makeUid()
      await usersColl.add({
        _id: uid,
        email,
        password: hashPassword(password, pwSecret),
        nickname: nickname || email.split('@')[0],
        role: [],
        status: 0,
        token: [],
        register_date: new Date(),
        register_ip: context.CLIENTIP || ''
      })

      const { token, tokenExpired } = await createToken(usersColl, dbCmd, uid)
      return { code: 0, uid, token, tokenExpired, msg: '注册成功' }
    }

    // ─── 邮箱登录 ──────────────────────────
    if (action === 'login') {
      const { email, password } = params || {}
      if (!email || !password) return { code: -1, msg: '邮箱和密码不能为空' }

      const existRes = await usersColl.where({ email }).get()
      if (!existRes.data || existRes.data.length === 0) {
        return { code: -1, msg: '邮箱未注册' }
      }
      const user = existRes.data[0]
      if (user.status === 1) return { code: -1, msg: '账号已被封禁' }

      const pwSecret = config.passwordSecret || 'xinjie-salt-2026'
      if (user.password !== hashPassword(password, pwSecret)) {
        return { code: -1, msg: '密码不正确' }
      }

      const { token, tokenExpired } = await createToken(usersColl, dbCmd, user._id)
      return {
        code: 0, uid: user._id, token, tokenExpired,
        nickname: user.nickname || '', avatar: user.avatar || '',
        msg: '登录成功'
      }
    }

    // ─── 微信小程序登录 ───────────────────
    if (action === 'loginByWeixin') {
      const { code } = params || {}
      if (!code) return { code: -1, msg: '缺少微信登录 code' }

      const wxConfig = ((config['mp-weixin'] || {}).oauth || {}).weixin || {}
      const appid = wxConfig.appid || ''
      const appsecret = wxConfig.appsecret || ''

      if (!appid || !appsecret) {
        return { code: -1, msg: !appsecret ? '请填写微信 appsecret' : '微信配置不完整' }
      }

      const wxRes = await wxCode2Session(appid, appsecret, code)
      if (wxRes.err) return { code: -1, msg: wxRes.err }

      const existRes = await usersColl.where({ 'wx_openid.mp-weixin': wxRes.openid }).get()
      let user
      if (existRes.data && existRes.data.length > 0) {
        user = existRes.data[0]
      } else {
        const uid = makeUid()
        user = {
          _id: uid,
          nickname: '微信用户',
          wx_openid: { 'mp-weixin': wxRes.openid },
          role: [],
          status: 0,
          token: [],
          register_date: new Date(),
          register_ip: context.CLIENTIP || ''
        }
        await usersColl.add(user)
      }
      if (user.status === 1) return { code: -1, msg: '账号已被封禁' }

      const { token, tokenExpired } = await createToken(usersColl, dbCmd, user._id)
      return {
        code: 0, uid: user._id, token, tokenExpired,
        nickname: user.nickname || '微信用户', avatar: user.avatar || '',
        msg: '登录成功'
      }
    }

    // ─── Token 校验 ────────────────────────
    if (action === 'checkToken') {
      const { token } = params || {}
      if (!token) return { code: -1, msg: 'token 不能为空' }
      const res = await verifyToken(usersColl, token, true)
      if (res.errCode === 0) {
        return { code: 0, uid: res.uid, token: res.token || token, tokenExpired: res.tokenExpired || 0, role: res.role }
      }
      return { code: -1, msg: res.errMsg || 'token 无效' }
    }

    // ─── Token 刷新 ────────────────────────
    if (action === 'refreshToken') {
      const { token } = params || {}
      if (!token) return { code: -1, msg: 'token 不能为空' }

      const secret = tokenSecret()
      const payload = jwtVerify(token, secret)
      if (!payload) return { code: -1, msg: 'token 无效或已过期' }

      const { token: newToken, tokenExpired } = await createToken(usersColl, dbCmd, payload.uid)
      return { code: 0, token: newToken, tokenExpired }
    }

    // ─── 登出 ──────────────────────────────
    if (action === 'logout') {
      const { token, uid: reqUid } = params || {}
      if (!reqUid && !token) return { code: 0, msg: '已登出' }

      let targetUid = reqUid
      if (!targetUid && token) {
        const payload = jwtVerify(token, tokenSecret())
        if (payload) targetUid = payload.uid
      }

      if (targetUid && token) {
        try {
          await usersColl.doc(targetUid).update({ token: dbCmd.pull(token) })
        } catch (e) {
          console.error('[uni-id] logout cleanup failed:', e.message)
        }
      }
      return { code: 0, msg: '已登出' }
    }

    // ─── 更新用户信息 ─────────────────────
    if (action === 'updateProfile') {
      const { token, nickname, avatar } = params || {}
      if (!token) return { code: -1, msg: 'token 不能为空' }

      const payload = jwtVerify(token, tokenSecret())
      if (!payload) return { code: -1, msg: 'token 已过期，请重新登录' }

      const updateData = {}
      if (nickname !== undefined) updateData.nickname = nickname
      if (avatar !== undefined) updateData.avatar = avatar
      if (Object.keys(updateData).length === 0) {
        return { code: -1, msg: '没有需要更新的字段' }
      }

      await usersColl.doc(payload.uid).update(updateData)
      return { code: 0, msg: '更新成功' }
    }

    return { code: -1, msg: `未知操作: ${action}` }

  } catch (e) {
    console.error('[uni-id] error:', e.message || String(e))
    return { code: -1, msg: e.message || '服务端错误' }
  }
}
