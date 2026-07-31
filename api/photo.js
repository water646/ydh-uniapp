/**
 * 拍照/活动接口（对应 GameListService 中 photo/* 端点）
 */
import { request } from './request'

/** 活动列表（分页）GET photo/activity/list-my-manage query{pageNo} */
export const getPhotoActivity = (pageNo) => request({ url: 'photo/activity/list-my-manage', query: { pageNo } })

/** 为比赛/联赛创建活动 GET photo/activity/create-game query{id, type} */
export const createGame = (id, type) => request({ url: 'photo/activity/create-game', query: { id, type } })

/** 上传照片列表 GET photo/picture/upload-list */
export const getUploadPhoto = () => request({ url: 'photo/picture/upload-list' })
