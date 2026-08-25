/**
 * 订单接口（rest/userServiceOrder/*，派单/接单相关）
 */
import { request } from './request'

/**
 * 订单列表 GET rest/userServiceOrder/list query{pageNo, status}
 * 返回 data:{ totalCount, pageSize, totalPage, pageNo, nextPage, list }
 * list 单条：{ id, orderNumber, assignTime, createTime, serviceMatch, serviceMatchId,
 *   serviceStartTime, servicePerson, servicePersonId, serviceRole,
 *   amountDue, status, isPaid, paymentResult?, paymentTime? }
 */
export const getOrderList = (params) => request({ url: 'rest/userServiceOrder/list', query: params, hideError: false })

/**
 * 收入明细（历史订单） GET rest/userServiceOrder/history query{pageNo}
 * 返回壳与 list 相同：data:{ totalCount, pageSize, totalPage, pageNo, nextPage, list }
 * list 单条字段同订单对象；空结果时 data 里无 list 键
 */
export const getOrderHistory = (params) => request({ url: 'rest/userServiceOrder/history', query: params })

/**
 * 订单编辑 POST rest/userServiceOrder/edit
 * 请求体：整个订单对象（status 已置为目标状态号），后端按请求体原样更新
 */
export const editOrder = (data) => request({ url: 'rest/userServiceOrder/edit', method: 'POST', data })
