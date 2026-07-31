/**
 * 时间格式化（对应 Utils.timeFormatYYMMDD/timeFormatMMDD/timeFormatHHMM 等 / Timeutils）
 * 依赖 dayjs
 */
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
dayjs.locale('zh-cn')

/**
 * 通用格式化
 * @param {number|string|Date} date
 * @param {string} fmt dayjs 格式，默认 'YYYY-MM-DD HH:mm:ss'
 */
export function formatTime(date, fmt = 'YYYY-MM-DD HH:mm:ss') {
  if (!date) return ''
  return dayjs(typeof date === 'number' && date < 1e12 ? date * 1000 : date).format(fmt)
}

/** YYYY-MM-DD（对应 timeFormatYYMMDD） */
export const formatYYMMDD = (date) => formatTime(date, 'YYYY-MM-DD')

/** MM-DD */
export const formatMMDD = (date) => formatTime(date, 'MM-DD')

/** HH:mm */
export const formatHHMM = (date) => formatTime(date, 'HH:mm')

/** YYYY */
export const formatYY = (date) => formatTime(date, 'YYYY')

/** 日期转星期几（对应 Utils.getWeek） */
export function getWeek(date) {
  if (!date) return ''
  const weeks = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  return weeks[dayjs(date).day()]
}

/** 通用日期格式转换（对应 Utils.stringPattern） */
export function stringPattern(date, fromFmt, toFmt) {
  return dayjs(date, fromFmt).format(toFmt)
}

/**
 * 倒计时格式化 mm:ss（对应 Timeutils.GetMinutes）
 * @param {number} ms 毫秒
 */
export function msToMMSS(ms) {
  const totalSec = Math.floor(ms / 1000)
  const m = String(Math.floor(totalSec / 60)).padStart(2, '0')
  const s = String(totalSec % 60).padStart(2, '0')
  return `${m}:${s}`
}
