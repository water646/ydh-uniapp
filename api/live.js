/**
 * 直播接口（对应 GameListService 中 live/stream/* 端点）
 */
import { request } from './request'

/** 获取直播地址 POST live/stream/game Body */
export const getLiveGame = (params) => request({ url: 'live/stream/game', method: 'POST', data: params })

/** 比赛直播地址列表 GET live/stream/game-list query{gameId} */
export const getLiveGameList = (gameId) => request({ url: 'live/stream/game-list', query: { gameId } })

/** 添加比赛直播 POST live/stream/game-add Body{gameId, name, event, channel}（event=比赛类型 1篮球/2足球） */
export const addGame = (params) => request({ url: 'live/stream/game-add', method: 'POST', data: params })

/** 直播合成（生成回放）POST live/stream/compose Body */
export const compose = (params) => request({ url: 'live/stream/compose', method: 'POST', data: params })
