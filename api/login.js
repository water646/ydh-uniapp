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

/** POST user/update 更新用户资料（传哪些字段就保存哪些，未传字段不动）Body{nickName?, name?, avatar?...} */
export const updateUser = (data) => request({ url: 'user/update', method: 'POST', data })

/** POST user/phone 校验新手机号验证码，通过后后端自动更新手机号 Body{phone, code} */
export const verifyPhone = (phone, code) => request({ url: 'user/phone', method: 'POST', data: { phone, code } })

/** GET statistics/page 同步统计数据（分页）query{gameId, pageNo} */
export const synchr = (gameId, pageNo) => request({ url: 'statistics/page', query: { gameId, pageNo } })
