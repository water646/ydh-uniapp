/**
 * WebSocket 实时比分客户端（对应 mvp/ui/net/EmptyClient + Api.LONG_URL）
 * 连接 ws://im.ydh123.com?token=&group=push<gameId>|live<gameId>
 * 下发消息结构：{ model:"ts_msg", method:"ts_record", data: RecordBean/RecordNewBean }
 *   - RecordBean.data.content 为 JSON 字符串，需二次 parse -> {data:{msg, hostTeamScore, ...}}，再剥一层 data
 *   - RecordNewBean.data 直接为 {msg, hostTeamScore, guestTeamScore, section, runStatus, hostTeamFoul, guestTeamFoul}
 * 用途：另一台设备录入统计后，通过 WS 实时推到推流端，更新本地比分浮层
 * （原项目用 Canvas 把比分烧进推流画面，uniapp live-pusher 不支持动态水印烧流，降级为本地浮层）
 *
 * 心跳：对应原生 NeWTencentLiveActivity 的 sendData() -> {"cmd":13,"hbbyte":"-128"}，
 *       onOpen 后立即发一次，之后每 20s 一次；后端依赖心跳保持/激活推送通道。
 */
import { config } from '@/config'
import { getToken } from '@/utils/auth'

let socketTask = null
let reconnectTimer = null
let heartbeatTimer = null
let messageCallback = null
let statusCallback = null
let closedByUser = false
let currentGroup = ''

/** 心跳消息（对应原生 sendData：cmd=13, hbbyte=-128） */
function sendHeartbeat() {
  if (socketTask) {
    try {
      socketTask.send({ data: JSON.stringify({ cmd: 13, hbbyte: '-128' }) })
    } catch (e) {}
  }
}

/**
 * 连接 WebSocket
 * @param {string} group push<gameId>|live<gameId>
 * @param {Function} onMessage 收到比分消息回调
 * @param {Function} [onStatus] 连接状态回调，参数 'open'|'close'|'error'
 */
export function connectSocket(group, onMessage, onStatus) {
  closedByUser = false
  currentGroup = group
  messageCallback = onMessage
  statusCallback = onStatus
  const token = getToken()
  // device：对应原生 &device=android<deviceId>（Global.getDevice() = IMEI/MAC/UUID 去符号）
  let device = ''
  // #ifdef APP-PLUS
  try {
    device = 'android' + String(plus.device.uuid || plus.device.imei || '').replace(/-/g, '')
  } catch (e) {
    device = ''
  }
  // #endif
  const url = `${config.wsUrl}token=${encodeURIComponent(token)}&group=${group}&device=${device}`

  socketTask = uni.connectSocket({
    url,
    complete() {}
  })

  socketTask.onOpen(() => {
    console.log('WebSocket 已连接', group, url)
    statusCallback && statusCallback('open')
    // 心跳：onOpen 后立即发一次，之后每 20s 一次（对齐原生）
    sendHeartbeat()
    if (heartbeatTimer) clearInterval(heartbeatTimer)
    heartbeatTimer = setInterval(sendHeartbeat, 20 * 1000)
  })

  socketTask.onMessage((res) => {
    const raw = res.data
    try {
      const msg = JSON.parse(raw)
      // msg = NetLongEnity/NetLongNewEnity { model, method, data }
      let data = msg.data
      // RecordBean：data.content 是 JSON 字符串，需二次解析
      if (data && typeof data.content === 'string') {
        try {
          data = JSON.parse(data.content)
          // content 二次 parse 后仍是 {data:{...}}（对应 NetRecordNewEnity，只含 data 字段），再剥一层
          if (data && data.data && typeof data.data === 'object') {
            data = data.data
          }
        } catch (e) {
          data = { msg: data.content }
        }
      }
      messageCallback && messageCallback(data || {})
    } catch (e) {
      // 非 JSON 消息（如后端连接后的"链接成功"、心跳响应），也透传，便于推流端记录诊断
      messageCallback && messageCallback({ __raw: String(raw) })
    }
  })

  socketTask.onClose(() => {
    console.log('WebSocket 关闭', group)
    if (heartbeatTimer) {
      clearInterval(heartbeatTimer)
      heartbeatTimer = null
    }
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
  if (heartbeatTimer) {
    clearInterval(heartbeatTimer)
    heartbeatTimer = null
  }
  if (socketTask) {
    try {
      socketTask.close()
    } catch (e) {}
    socketTask = null
  }
}
