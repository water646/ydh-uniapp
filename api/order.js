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
 * 订单编辑 POST rest/userServiceOrder/edit
 * 请求体：整个订单对象（status 已置为目标状态号），后端按请求体原样更新
 */
export const editOrder = (data) => request({ url: 'rest/userServiceOrder/edit', method: 'POST', data })
