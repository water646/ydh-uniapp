/**
 * 比赛与成员接口（对应 GameListService）
 * 篮球/足球双套路径：足球 = 篮球路径加 soccer/ 前缀，统计接口共用
 * 双斜杠路径 game//info 原样保留（勿修正）
 */
import { request } from './request'
import { sportPrefix, SportType } from '@/config'

/** 比赛列表 GET game/list-my-manage (篮球) / soccer/game/list-my-manage (足球) */
export const getMatchList = (status, sport = SportType.BASKETBALL) =>
  request({ url: `${sportPrefix(sport)}game/list-my-manage`, query: { status } })

/** 比赛详情 GET ts/game/info query{gmEventGroupGameId} */
export const gameInfo = (gmEventGroupGameId) => request({ url: 'ts/game/info', query: { gmEventGroupGameId } })

/** 设置比赛信息 POST ts/game/update-info Body */
export const updateGameInfo = (params) => request({ url: 'ts/game/update-info', method: 'POST', data: params })

/** 获取主/客队成员 GET statistics/member/list query{gameTeamId} */
export const getMember = (gameTeamId) => request({ url: 'statistics/member/list', query: { gameTeamId } })

/** 比赛详情 GET game/{gameId}/detail (篮球) / soccer/game/{gameId}/detail (足球) */
export const getGameDetail = (gameId, sport = SportType.BASKETBALL) =>
  request({ url: `${sportPrefix(sport)}game/{gameId}/detail`, path: { gameId } })

/** 篮球统计详情（含球员/小节）GET statistics/game-detail-basketball query{gameId} */
export const getGameBasketballDetail = (gameId) => request({ url: 'statistics/game-detail-basketball', query: { gameId } })

/** 足球比赛详情（另一路径）GET game/{gameId}/foot-detail */
export const getGameFootDetail = (gameId) => request({ url: 'game/{gameId}/foot-detail', path: { gameId } })

/** 小节列表 GET statistics/section/list query{gameId} */
export const getSectionList = (gameId) => request({ url: 'statistics/section/list', query: { gameId } })

/** 修改比赛状态 POST game/status (篮球) / soccer/game/status (足球) */
export const gameStatus = (params, sport = SportType.BASKETBALL) =>
  request({ url: `${sportPrefix(sport)}game/status`, method: 'POST', data: params })

/** 球员签到 POST statistics/member/sign */
export const memberSign = (params) => request({ url: 'statistics/member/sign', method: 'POST', data: params })

/** 取消签到 POST statistics/member/sign-cancel */
export const cancelMemberSign = (params) => request({ url: 'statistics/member/sign-cancel', method: 'POST', data: params })

/** 设置首发 POST statistics/member/starting-lineup */
export const startingLineup = (params) => request({ url: 'statistics/member/starting-lineup', method: 'POST', data: params })

/** 取消首发 POST statistics/member/starting-lineup-cancel */
export const startingLineupCancel = (params) => request({ url: 'statistics/member/starting-lineup-cancel', method: 'POST', data: params })

/** 添加临时球员 POST statistics/member/temporary */
export const addMember = (params) => request({ url: 'statistics/member/temporary', method: 'POST', data: params })

/** 删除临时球员 GET statistics/member/delete-temporary query{id, teamMemberId} */
export const deleteMember = (id, teamMemberId) => request({ url: 'statistics/member/delete-temporary', query: { id, teamMemberId } })

/** 修改球员上场位置 POST statistics/member/edit-position */
export const memberEditPosition = (params) => request({ url: 'statistics/member/edit-position', method: 'POST', data: params })

/** 比赛连接信息 GET game//info (双斜杠原样保留) query{gameId} */
export const getConnect = (gameId, sport = SportType.BASKETBALL) =>
  request({ url: `${sportPrefix(sport)}game//info`, query: { gameId } })

/** 优肯周赛况 GET game/list-week query{leagueId}（原 OkGo，同 baseUrl） */
export const getWeekList = (leagueId) => request({ url: 'game/list-week', query: { leagueId } })
