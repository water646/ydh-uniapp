/**
 * OSS 文件上传 POST oss/file/upload（multipart/form-data，文件字段名 file）
 * 上传成功 resolve 文件 URL 字符串；失败 toast 并 reject。
 * 注：uni.uploadFile 的响应体是字符串，需手动 JSON.parse。
 */
import { config } from '@/config'
import { getToken } from '@/utils/auth'

export function uploadFile(filePath) {
  return new Promise((resolve, reject) => {
    uni.uploadFile({
      url: config.baseUrl + 'oss/file/upload',
      filePath,
      name: 'file',
      header: { token: getToken() },
      success: (res) => {
        let body = null
        try {
          body = JSON.parse(res.data)
        } catch (e) {
          uni.showToast({ title: '上传返回解析失败', icon: 'none' })
          reject(e)
          return
        }
        const ok = res.statusCode >= 200 && res.statusCode < 300 &&
          (body.code === 1 || body.status === 1) && body.data
        if (ok) {
          resolve(body.data)
        } else {
          uni.showToast({ title: (body && body.msg) || '上传失败', icon: 'none' })
          reject(body || res)
        }
      },
      fail: (err) => {
        uni.showToast({ title: '上传失败，请检查网络', icon: 'none' })
        reject(err)
      }
    })
  })
}
