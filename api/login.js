/**
 * 登录与用户接口（对应 LoginService）
 */
import { request } from './request'

/** POST sms/login 获取短信验证码 Body{phone} */
export const getNote = (phone) => request({ url: 'sms/login', method: 'POST', data: { phone } })

/** POST user/login 验证码登录 Body{phone, code} */
export const validateLogin = (phone, code) => request({ url: 'user/login', method: 'POST', data: { phone, code } })

/** POST user/wechat-login 微信登录 Body{code}（uni.login 取的微信 code 换 token，后端接口待提供） */
export const wechatLogin = (code) => request({ url: 'user/wechat-login', method: 'POST', data: { code } })

/** GET user/info 获取个人信息 */
export const getUserInfo = () => request({ url: 'user/info' })

/** POST user/update 更新用户资料（传哪些字段就保存哪些，未传字段不动）Body{nickName?, name?, avatar?...} */
export const updateUser = (data) => request({ url: 'user/update', method: 'POST', data })

/** POST user/phone 校验新手机号验证码，通过后后端自动更新手机号 Body{phone, code} */
export const verifyPhone = (phone, code) => request({ url: 'user/phone', method: 'POST', data: { phone, code } })

/** GET user/feedback/list 意见反馈记录 query{pageNo} */
export const getFeedbackList = (pageNo) => request({ url: 'user/feedback/list', query: { pageNo } })

/** POST user/feedback 提交意见反馈 Body{content, tag}（tag：建议/积极评价） */
export const submitFeedback = (content, tag) => request({ url: 'user/feedback', method: 'POST', data: { content, tag } })

/** POST user/authCard 实名认证（姓名+身份证核验），通过后进人脸识别 Body{actualName, idNumber} */
export const authCard = (actualName, idNumber) => request({ url: 'user/authCard', method: 'POST', data: { actualName, idNumber } })

/** GET statistics/page 同步统计数据（分页）query{gameId, pageNo} */
export const synchr = (gameId, pageNo) => request({ url: 'statistics/page', query: { gameId, pageNo } })
