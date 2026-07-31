/**
 * 离线上传队列（对应 Statidtics1Activity/NewBasketStatic 的 2s 轮询上传）
 * 本地 technical_record 中 is_need_upload=0 的记录逐条上传 statistics/add，
 * 成功后置 is_need_upload=1；取消记录调 statistics/cancel
 */
import { selectSQL, executeSQL } from '@/utils/db'
import { uploadData } from '@/api/statistics'

let timer = null
let uploading = false

/** 启动队列：每 2s 轮询上传（对应 Handler postDelayed 2000ms） */
export function startUploadQueue(gameId, onUploaded) {
  stopUploadQueue()
  timer = setInterval(() => {
    doUpload(gameId, onUploaded)
  }, 2000)
}

export function stopUploadQueue() {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}

async function doUpload(gameId, onUploaded) {
  if (uploading) return
  uploading = true
  try {
    const list = await selectSQL(
      `SELECT * FROM technical_record WHERE game_id='${gameId}' AND is_need_upload=0 AND disable=0 LIMIT 10`
    )
    for (const r of list) {
      try {
        const res = await uploadData({
          description: r.description || '',
          recordNumber: r.record_number,
          statisticsMemberId: r.statistics_member_id || '',
          statisticsSectionId: r.statistics_section_id || '',
          type: r.type,
          elapsedTime: r.elapsed_time || 0
        })
        if (res.code === 1) {
          await executeSQL(
            `UPDATE technical_record SET is_need_upload=1 WHERE record_number=${r.record_number}`
          )
          onUploaded && onUploaded(r)
        }
      } catch (e) {
        // 单条失败不影响后续
      }
    }
  } finally {
    uploading = false
  }
}

/** 待同步数量（用于页面显示 sync_num） */
export async function pendingCount(gameId) {
  const res = await selectSQL(
    `SELECT COUNT(*) as c FROM technical_record WHERE game_id='${gameId}' AND is_need_upload=0 AND disable=0`
  )
  return res[0] ? res[0].c : 0
}
