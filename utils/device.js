/**
 * 设备号生成（对应 GetDeviceId）
 * 原项目用 IMEI+MAC 拼接 MD5，隐私受限已弃用；改用 plus.device.uuid 或自生成 UUID 持久化
 */
const KEY_DEVICE = 'device_id'

export function getDeviceId() {
  let id = uni.getStorageSync(KEY_DEVICE)
  if (id) return id

  // #ifdef APP-PLUS
  try {
    id = plus.device.uuid || ''
  } catch (e) {
    id = ''
  }
  // #endif

  if (!id) {
    id = generateUUID()
  }
  uni.setStorageSync(KEY_DEVICE, id)
  return id
}

/** 生成 UUID（对应原 getMD5(IMEI+MAC) 的替代） */
export function generateUUID() {
  const s4 = () => Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1)
  return `${s4()}${s4()}-${s4()}-${s4()}-${s4()}-${s4()}${s4()}${s4()}`
}
