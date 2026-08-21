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
 * 接单确认 POST rest/userServiceOrder/confirm
 * 请求体：整个订单对象（列表项原样回传）；成功后订单状态变为待服务
 */
export const confirmOrder = (data) => request({ url: 'rest/userServiceOrder/confirm', method: 'POST', data })
