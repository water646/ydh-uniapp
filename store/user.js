/**
 * 用户状态（对应 Global + MyPreference）
 * token、userId、用户信息、Global.s（secret 的 MD5）
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getToken, setToken, clearAuth, getUserId, setUserId } from '@/utils/auth'
import { md5Encode } from '@/utils/md5'
import { config } from '@/config'

export const useUserStore = defineStore('user', () => {
  const token = ref(getToken())
  const userId = ref(getUserId())
  const userInfo = ref(null)
  const secretMd5 = ref('') // 对应 Global.s = MD5(secret)
  const isLogin = computed(() => !!token.value)

  /** 对应 Global.init */
  function init() {
    token.value = getToken()
    userId.value = getUserId()
    if (!secretMd5.value) {
      secretMd5.value = md5Encode(config.secret)
    }
  }

  /** 登录成功设置鉴权（对应 Global.setAuthentication） */
  function setAuth(t, uid) {
    token.value = t
    setToken(t)
    if (uid) {
      userId.value = uid
      setUserId(uid)
    }
  }

  function setUserInfo(info) {
    userInfo.value = info
  }

  /** 退出登录（对应 Global.logOut） */
  function logout() {
    clearAuth()
    token.value = ''
    userId.value = ''
    userInfo.value = null
  }

  return { token, userId, userInfo, secretMd5, isLogin, init, setAuth, setUserInfo, logout }
})
