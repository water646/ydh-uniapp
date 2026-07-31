/**
 * 校验工具（对应 Utils.checkPhone / isCard / containsEmoji）
 */

/** 手机号校验 */
export function checkPhone(phone) {
  return /^1[3-9]\d{9}$/.test(phone)
}

/** 身份证校验（15/18 位，对应 Utils.isCard） */
export function isCard(id) {
  return /(^\d{15}$)|(^\d{17}([0-9]|X|x)$)/.test(id)
}

/** 是否包含 emoji（对应 Utils.containsEmoji） */
export function containsEmoji(str) {
  if (!str) return false
  const emojiReg = /[\uD83C|\uD83D|\uD83E][\uDC00-\uDFFF][‍|️]|[\uD83C|\uD83D|\uD83E][\uDC00-\uDFFF]|[0-9]*#[⃣]|[㊙|㊗|〰|〽|©|®|™|ℹ]/
  return emojiReg.test(str)
}

/** 中文校验（对应 Utils.isChinese） */
export function isChinese(str) {
  return /^[一-龥]+$/.test(str)
}

/** 判断今天/昨天/明天（对应 Utils.checkCalendar） */
export function checkCalendar(dateStr) {
  const today = dayjs().format('YYYY-MM-DD')
  const target = dayjs(dateStr).format('YYYY-MM-DD')
  if (target === today) return '今天'
  if (target === dayjs().add(1, 'day').format('YYYY-MM-DD')) return '明天'
  if (target === dayjs().subtract(1, 'day').format('YYYY-MM-DD')) return '昨天'
  return ''
}

import dayjs from 'dayjs'
