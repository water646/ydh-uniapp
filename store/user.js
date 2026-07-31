/**
 * 用户状态（对应 Global + MyPreference）
 * token、userId、用户信息、Global.s（secret 的 MD5）
 */
import { defineStore } from 'pinia'
import { getToken, setToken, clearAuth, isLogin, getUserId, setUserId } from '@/utils/auth'
import { md5Encode } from '@/utils/md5'
import { config } from '@/config'

export const useUserStore = defineStore('user', {
  state: () => ({
    token: getToken(),
    userId: getUserId(),
    userInfo: null,
    secretMd5: '' // 对应 Global.s = MD5(secret)
  }),
  getters: {
    isLogin: () => isLogin()
  },
  actions: {
    /** 对应 Global.init */
    init() {
      this.token = getToken()
      this.userId = getUserId()
      if (!this.secretMd5) {
        this.secretMd5 = md5Encode(config.secret)
      }
    },
    /** 登录成功设置鉴权（对应 Global.setAuthentication） */
    setAuth(token, userId) {
      this.token = token
      setToken(token)
      if (userId) {
        this.userId = userId
        setUserId(userId)
      }
    },
    setUserInfo(info) {
      this.userInfo = info
    },
    /** 退出登录（对应 Global.logOut） */
    logout() {
      clearAuth()
      this.token = ''
      this.userId = ''
      this.userInfo = null
    }
  }
})
