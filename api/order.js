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
