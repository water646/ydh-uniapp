/**
 * 版本检查接口（对应 GameListService.versionCheck）
 */
import { request } from './request'

/** 版本检查 GET sys/app-version/check QueryMap{deviceType, appType, versionCode}（三参均为数字枚举；失败静默，不打扰用户） */
export const versionCheck = (params) => request({ url: 'sys/app-version/check', query: params, hideError: true })
