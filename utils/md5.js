/**
 * MD5 加密（对应 Utils.MD5Encode / GetDeviceId.getMD5）
 * 依赖 js-md5，Global.s = MD5(AppConfig.SECRET)
 */
import md5 from 'js-md5'

const secretMd5Cache = null

/** MD5 加密，默认大写（对应 Utils.MD5Encode） */
export function md5Encode(str, upperCase = true) {
  if (!str) return ''
  const r = md5(String(str))
  return upperCase ? r.toUpperCase() : r
}

/** 字节转十六进制（对应 GetDeviceId.bytesToHex） */
export function bytesToHex(bytes) {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}
