/**
 * 技术统计接口（对应 GameListService 中 statistics/* 端点）
 * 统一上传端点 statistics/add，统一取消 statistics/cancel
 */
import { request } from './request'

/** 提交技术统计（单条）POST statistics/add Body */
export const uploadData = (params) => request({ url: 'statistics/add', method: 'POST', data: params })

/** 提交技术统计（批量）POST statistics/add-all Body{statisticsList:[...]} */
export const uploadDataAll = (params) => request({ url: 'statistics/add-all', method: 'POST', data: params })

/** 取消统计记录 POST statistics/cancel Body{gameId, recordNumber, statisticsMemberId} */
export const cancelData = (params) => request({ url: 'statistics/cancel', method: 'POST', data: params })

/** 小节运行状态 POST statistics/section/running Body{statisticsSectionId} */
export const sectionRunning = (statisticsSectionId) => request({ url: 'statistics/section/running', method: 'POST', data: { statisticsSectionId } })

/** 统计记录列表（分页，最新优先）GET statistics/page query{gameId, isDesc, pageNo} */
export const statisticsPage = (gameId, isDesc = 1, pageNo = 1) => request({ url: 'statistics/page', query: { gameId, isDesc, pageNo } })
