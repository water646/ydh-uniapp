/**
 * 全局配置（对应 Android AppConfig.java / Api.java）
 * 域名、密钥、分页、协议地址等常量集中管理
 */
export const config = {
  /**
   * ⚠️【MOCK 开关】⚠️
   * true  => 所有请求走 mock/mock-data.js 的静态测试数据（不访问真实后端）
   * false => 走真实后端接口（baseUrl）
   * 测试完毕请改回 false。
   */
  useMock: false,
  /** Retrofit baseUrl：对应 Api.APP_DOMAIN */
  baseUrl: 'http://app.ydh123.com/ydh-service/',
  /** WebSocket 长连接地址：对应 Api.LONG_URL，用于直播实时比分推送 */
  wsUrl: 'ws://im.ydh123.com?',
  /** 加密密钥：对应 AppConfig.SECRET，Global.s = MD5(secret) */
  secret: '5QPxu5v8P@v%L6pP',
  /** 首页页码：对应 AppConfig.PAGE_NUMBER_FIRST */
  pageFirst: 1,
  /** 每页条数：对应 AppConfig.PAGE_SIZE */
  pageSize: 10,
  /** 文件存储目录（App 端使用 plus.io 私有目录，对应原 /sdcard/ydh_statistics/） */
  filePath: '_doc/ydh_statistics/',
  /** 数据库名：对应 AppConfig.DATA_BASE_NAME */
  dbName: 'statistics',
  /** token 失效 code：对应 GlobalHttpHandlerImpl 的 -8 / -9 登出逻辑 */
  tokenExpiredCodes: [-8, -9],
  /** 协议页地址：对应 UserAgreeActivity 的两个 WebView URL */
  agreement: {
    user: 'https://app.ydh123.com/user-agreement-statistics',
    privacy: 'https://app.ydh123.com/privacy-statistics'
  },
  /** 优肯周赛况联赛 id（对应 WeekOutsActivity 硬编码 leagueId） */
  youkenLeagueId: '7f9e9d6018b372e92522bb2625f341b1'
}

/** 运动类型：足球接口 = 篮球路径加 soccer/ 前缀，统计接口共用 */
export const SportType = {
  BASKETBALL: 'basketball',
  FOOTBALL: 'football'
}

/** 拼接足球前缀（统一处理篮球/足球双套路径） */
export function sportPrefix(sport) {
  return sport === SportType.FOOTBALL ? 'soccer/' : ''
}
