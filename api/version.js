/**
 * 版本检查接口（对应 GameListService.versionCheck）
 */
import { request } from './request'

/** 版本检查 GET sys/app-version/check QueryMap{deviceType, appType, versionCode} */
export const versionCheck = (params) => request({ url: 'sys/app-version/check', query: params })
