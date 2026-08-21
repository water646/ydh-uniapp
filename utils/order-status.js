/**
 * 订单状态枚举（文案 + 卡片角标底色），首页/结束服务申请页共用
 * 编号按递增猜测：1待确认 2已取消 3待服务 4服务中 5服务完成 6已打款
 * 后端枚举定稿后只需改这一处。
 */
export const STATUS_MAP = {
  1: { text: '待确认', color: '#CF8A03' },
  2: { text: '已取消', color: '#AFAFAF' },
  3: { text: '待服务', color: '#00B39D' },
  4: { text: '服务中', color: '#2E7CF6' },
  5: { text: '服务完成', color: '#03B098' },
  6: { text: '已打款', color: '#67C23A' }
}

// 关键状态号（按钮显隐/流转用）
export const ST_WAIT_CONFIRM = 1
export const ST_CANCELLED = 2
export const ST_WAIT_SERVICE = 3
export const ST_SERVING = 4

export function stText(s) {
  return (STATUS_MAP[s] && STATUS_MAP[s].text) || ('状态' + s)
}

export function stColor(s) {
  return (STATUS_MAP[s] && STATUS_MAP[s].color) || '#AFAFAF'
}
