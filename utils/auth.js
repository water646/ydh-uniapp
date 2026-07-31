/**
 * 登录态/鉴权（对应 Global.authentication + SPUtils SP_AUTHENTICATION='n' + MyPreference token/userId）
 * 两套 SP 合并为 uni.storage，单字符 key 改为语义化命名
 */
const KEY_TOKEN = 'auth_token'
const KEY_USER_ID = 'auth_user_id'

export function getToken() {
  return uni.getStorageSync(KEY_TOKEN) || ''
}

export function setToken(token) {
  uni.setStorageSync(KEY_TOKEN, token || '')
}

export function getUserId() {
  return uni.getStorageSync(KEY_USER_ID) || ''
}

export function setUserId(id) {
  uni.setStorageSync(KEY_USER_ID, id)
}

export function isLogin() {
  return !!getToken()
}

/** 清空鉴权信息（对应 Global.logOut） */
export function clearAuth() {
  uni.removeStorageSync(KEY_TOKEN)
  uni.removeStorageSync(KEY_USER_ID)
}
