/**
 * 统一请求封装
 * 对应 Android Retrofit + OkHttp + GlobalHttpHandlerImpl
 * - 请求拦截：注入 token 请求头（对应 onHttpRequestBefore）
 * - 响应拦截：code === -8/-9 自动登出跳登录页（对应 onHttpResultResponse）
 * - 成功判据：status === 1 || code === 1（原项目两套判据并存）
 * - 路径参数 {gameId} 替换（对应 @Path）
 * - GET query 拼接（对应 @Query/@QueryMap）
 * - POST body（对应 @Body RequestParams）
 */
import { config } from '@/config'
import { getToken, clearAuth } from '@/utils/auth'
import { mockResolve } from '@/mock/mock-data'

/** 成功判据（兼容 ApiEntity 的 status===1 与其余的 code===1） */
export function isSuccess(body) {
  return !!body && (body.status === 1 || body.code === 1)
}

/**
 * @param {Object} options
 * @param {string} options.url 相对路径（拼在 baseUrl 后），可含 {xxx} 路径参数
 * @param {string} [options.method] GET/POST，默认 GET
 * @param {Object} [options.path] 路径参数，替换 url 中的 {xxx}
 * @param {Object} [options.query] GET 查询参数
 * @param {Object} [options.data] POST body
 * @param {Object} [options.header] 额外请求头
 * @param {boolean} [options.hideError] 是否隐藏错误提示
 * @param {string|boolean} [options.loading] 显示 loading
 * @returns {Promise<any>} 响应体（含 status/code/msg/data）
 */
export function request(options) {
  const {
    url,
    method = 'GET',
    path,
    query,
    data,
    header = {},
    hideError = false,
    loading = false
  } = options

  let finalUrl = config.baseUrl + url

  // ⚠️【MOCK】静态测试数据拦截：config.useMock=true 时优先返回造数，不访问真实后端
  // 命中则直接 resolve；未命中 fallthrough 走下方真实请求
  const mocked = mockResolve(options)
  if (mocked !== null) {
    if (loading) uni.showLoading({ title: typeof loading === 'string' ? loading : '加载中', mask: true })
    console.log('%c【MOCK】' + method.toUpperCase() + ' ' + url, 'color:#e6a23c;font-weight:bold', mocked)
    return new Promise((resolve) => {
      setTimeout(() => {
        if (loading) uni.hideLoading()
        resolve(mocked)
      }, 300)
    })
  }

  // 路径参数替换（对应 @Path("gameId")）
  if (path) {
    Object.keys(path).forEach((k) => {
      finalUrl = finalUrl.replace(`{${k}}`, encodeURIComponent(path[k]))
    })
  }

  // GET 查询参数（对应 @Query / @QueryMap）
  if (query && Object.keys(query).length) {
    const qs = Object.keys(query)
      .filter((k) => query[k] !== undefined && query[k] !== null && query[k] !== '')
      .map((k) => `${k}=${encodeURIComponent(query[k])}`)
      .join('&')
    if (qs) finalUrl += (finalUrl.includes('?') ? '&' : '?') + qs
  }

  if (loading) {
    uni.showLoading({ title: typeof loading === 'string' ? loading : '加载中', mask: true })
  }

  return new Promise((resolve, reject) => {
    uni.request({
      url: finalUrl,
      method,
      data: method.toUpperCase() === 'GET' ? undefined : data,
      header: {
        'content-type': 'application/json',
        // token 注入（对应 GlobalHttpHandlerImpl.onHttpRequestBefore）
        token: getToken(),
        ...header
      },
      success: (res) => {
        if (loading) uni.hideLoading()
        const body = res.data

        // HTTP 状态码异常（业务错误会用非 2xx + body.msg 返回，如「只有进行中的比赛才能直播」）
        if (res.statusCode < 200 || res.statusCode >= 300) {
          if (!hideError) {
            const errMsg = (body && (body.msg || body.message)) || `请求失败(${res.statusCode})`
            uni.showToast({ title: errMsg, icon: 'none' })
          }
          reject(body || res)
          return
        }

        // token 失效登出（对应 GlobalHttpHandlerImpl 的 -8/-9 逻辑）
        if (body && config.tokenExpiredCodes.includes(body.code)) {
          clearAuth()
          uni.reLaunch({ url: '/pages/login/index' })
          reject(body)
          return
        }

        resolve(body)
      },
      fail: (err) => {
        if (loading) uni.hideLoading()
        // 对应 ResponseErrorListenerImpl 的网络错误提示
        if (!hideError) {
          uni.showToast({ title: '网络连接失败，请检查网络', icon: 'none' })
        }
        reject(err)
      }
    })
  })
}
