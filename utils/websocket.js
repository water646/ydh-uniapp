/**
 * WebSocket 实时比分客户端（对应 mvp/ui/net/EmptyClient + Api.LONG_URL）
 * 连接 ws://im.ydh123.com?token=&group=live|push
 * 下发消息结构：{ model:"ts_msg", method:"ts_record", data: RecordBean/RecordNewBean }
 *   - RecordBean.data.content 为 JSON 字符串，需二次 parse -> {msg, hostTeamScore, guestTeamScore, section, runStatus}
 *   - RecordNewBean.data 直接为 {msg, hostTeamScore, guestTeamScore, section, runStatus, hostTeamFoul, guestTeamFoul}
 * 用途：另一台设备录入统计后，通过 WS 实时推到推流端，更新本地比分浮层
 * （原项目用 Canvas 把比分烧进推流画面，uniapp live-pusher 不支持动态水印烧流，降级为本地浮层）
 */
import { config } from '@/config'
import { getToken } from '@/utils/auth'

let socketTask = null
let reconnectTimer = null
let messageCallback = null
let statusCallback = null
let closedByUser = false
let currentGroup = ''

/**
 * 连接 WebSocket
 * @param {string} group push|live
 * @param {Function} onMessage 收到比分消息回调
 * @param {Function} [onStatus] 连接状态回调，参数 'open'|'close'|'error'
 */
export function connectSocket(group, onMessage, onStatus) {
  closedByUser = false
  currentGroup = group
  messageCallback = onMessage
  statusCallback = onStatus
  const token = getToken()
  const url = `${config.wsUrl}token=${encodeURIComponent(token)}&group=${group}`

  socketTask = uni.connectSocket({
    url,
    complete() {}
  })

  socketTask.onOpen(() => {
    console.log('WebSocket 已连接', group, url)
    statusCallback && statusCallback('open')
  })

  socketTask.onMessage((res) => {
    try {
      const msg = JSON.parse(res.data)
      // msg = NetLongEnity/NetLongNewEnity { model, method, data }
      let data = msg.data
      // RecordBean：data.content 是 JSON 字符串，需二次解析
      if (data && typeof data.content === 'string') {
        try {
          data = JSON.parse(data.content)
        } catch (e) {
          data = { msg: data.content }
        }
      }
      messageCallback && messageCallback(data || {})
    } catch (e) {
      // 非 JSON 消息，忽略
    }
  })

  socketTask.onClose(() => {
    console.log('WebSocket 关闭', group)
    statusCallback && statusCallback('close')
    if (!closedByUser) {
      // 断线重连（对应原项目重连逻辑）
      reconnectTimer = setTimeout(() => {
        connectSocket(currentGroup, messageCallback, statusCallback)
      }, 3000)
    }
  })

  socketTask.onError(() => {
    console.log('WebSocket 错误', group, url)
    statusCallback && statusCallback('error')
  })
}

/** 关闭连接 */
export function closeSocket() {
  closedByUser = true
  if (reconnectTimer) {
    clearTimeout(reconnectTimer)
    reconnectTimer = null
  }
  if (socketTask) {
    try {
      socketTask.close()
    } catch (e) {}
    socketTask = null
  }
}
