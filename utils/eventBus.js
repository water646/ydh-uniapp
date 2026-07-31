/**
 * 事件总线（对应 org.simple.eventbus.EventBus）
 * 原项目仅两个事件：
 * - Boolean true/false：篮球/足球切换（MainActivity 发）
 * - Integer 8888：记录删除后刷新（OperationRecordActivity 发 -> StaticNewDownActivity 收）
 */
export const EventBus = {
  /** 篮球/足球切换，data: 'basketball' | 'football' */
  SPORT_CHANGE: 'sport_change',
  /** 记录刷新通知（对应 8888） */
  RECORD_REFRESH: 'record_refresh'
}

export function emit(event, data) {
  uni.$emit(event, data)
}

export function on(event, callback) {
  uni.$on(event, callback)
}

export function off(event, callback) {
  uni.$off(event, callback)
}
