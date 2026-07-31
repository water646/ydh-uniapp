/**
 * 登录与用户接口（对应 LoginService）
 */
import { request } from './request'

/** POST sms/login 获取短信验证码 Body{phone} */
export const getNote = (phone) => request({ url: 'sms/login', method: 'POST', data: { phone } })

/** POST user/login 验证码登录 Body{phone, code} */
export const validateLogin = (phone, code) => request({ url: 'user/login', method: 'POST', data: { phone, code } })

/** GET user/info 获取个人信息 */
export const getUserInfo = () => request({ url: 'user/info' })

/** GET statistics/page 同步统计数据（分页）query{gameId, pageNo} */
export const synchr = (gameId, pageNo) => request({ url: 'statistics/page', query: { gameId, pageNo } })
