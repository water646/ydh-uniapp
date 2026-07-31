/**
 * 图片上传（对应 oss/OssService）
 * 原项目用阿里云 OSS SDK + STS 断点续传（asyncResumableUpload）
 * uniapp 改为：
 *   1) uploadToBackend：上传到后端接口转存 OSS（默认，最易跑通）
 *   2) uploadToOSS：STS 直传 OSS（对应原前端直传，需后端提供 STS 凭证接口 photo/picture/sts）
 */
import { config } from '@/config'
import { getToken } from '@/utils/auth'

/**
 * 上传图片到后端接口（后端转存 OSS）
 * @param {string} filePath 本地文件路径
 * @param {string} url 后端接口相对路径
 * @param {Object} formData 额外表单参数
 * @returns {Promise<Object>} 后端响应
 */
export function uploadToBackend(filePath, url, formData = {}) {
  return new Promise((resolve, reject) => {
    uni.uploadFile({
      url: config.baseUrl + url,
      filePath,
      name: 'file',
      header: { token: getToken() },
      formData,
      success: (res) => {
        try {
          resolve(JSON.parse(res.data))
        } catch (e) {
          resolve(res.data)
        }
      },
      fail: reject
    })
  })
}

/**
 * 上传图片到 OSS（对应原前端直传）
 * 默认走后端转存（uploadToBackend）；若后端提供 STS 凭证接口，可改为 STS 表单直传。
 * STS 直传实现思路（按后端 photo/picture/sts 返回字段调整）：
 *   const sts = (await request({ url: 'photo/picture/sts' })).data
 *   uni.uploadFile({
 *     url: sts.host,
 *     filePath, name: 'file',
 *     formData: {
 *       key: `photo/${activityId}/${Date.now()}.jpg`,
 *       OSSAccessKeyId: sts.accessKeyId,
 *       policy: sts.policy, signature: sts.signature,
 *       callback: sts.callback, success_action_status: '200'
 *     }
 *   })
 * @param {string} filePath
 * @param {string} activityId 拍照活动 id（对应 photoActivityId）
 */
export async function uploadToOSS(filePath, activityId) {
  // 默认走后端转存；实际项目按上方注释改为 STS 直传
  return uploadToBackend(filePath, 'photo/picture/upload', { activityId })
}
