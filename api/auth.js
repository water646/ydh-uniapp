/**
 * 用户认证信息 rest/userAuthInfo/*
 */
import { request } from './request'

/**
 * 认证信息 GET rest/userAuthInfo/info
 * data 为认证记录数组，单条：{ id, userId, name, idCardNumber, idCardFrontImageUrl,
 *   idCardBackImageUrl, bankName, bankCardNumber, bankPhoneNumber, auditStatus }
 */
export const getAuthInfo = () => request({ url: 'rest/userAuthInfo/info' })
