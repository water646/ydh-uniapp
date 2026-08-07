/**
 * ============================================================================
 *  ⚠️⚠️⚠️  静态测试数据 (MOCK) —— 全部为造数，非真实接口返回  ⚠️⚠️⚠️
 * ============================================================================
 *  用途：前端联调测试。config.useMock === true 时，api/request.js 会拦截
 *        所有请求，按 url 匹配本文件返回静态数据，不再访问真实后端。
 *  关闭：把 config/index.js 里的 useMock 改为 false，即恢复走真实接口。
 *  标注：每个数据块均以 【MOCK】 注释开头；控制台会打印橙色 【MOCK】 日志。
 *  未匹配到的 url 仍会 fallthrough 走真实请求（方便局部联调）。
 * ============================================================================
 */
import { config } from '@/config'

/* ------------------------------------------------------------------ *
 * 【MOCK】小工具：构造枚举值与统一成功响应
 *   - E(value,desc)         => EnumValue      { value, desc }
 *   - EB(value,desc,bool)   => EnumValueBool  { value, desc, boolean }
 *   - ok(data,msg)          => { status:1, code:1, msg, data }（双判据全满足）
 *   首页/统计页均判 code===1，故统一返回 code:1 + status:1
 * ------------------------------------------------------------------ */
const E = (value, desc) => ({ value, desc })
const EB = (value, desc, boolean) => ({ value, desc, boolean })
const ok = (data, msg = 'ok') => ({ status: 1, code: 1, msg, data })

/* ------------------------------------------------------------------ *
 * 【MOCK】统一 id（各处数据保持一致，便于点进详情联调）
 * ------------------------------------------------------------------ */
const IDS = {
  gameId: 'mock-game-001',
  game2: 'mock-game-002',
  game3: 'mock-game-003',
  footGame: 'mock-foot-game-001',
  hostTeamId: 'mock-host-team-001',
  guestTeamId: 'mock-guest-team-001',
  leagueId: 'mock-league-001',
  token: 'mock-token-test-001'
}

/* ------------------------------------------------------------------ *
 * 【MOCK】用户信息（对应 UserInfoData）—— 登录后 getUserInfo 返回
 * ------------------------------------------------------------------ */
const userInfo = {
  id: 'mock-user-001',
  avatar: '',
  nickName: '测试管理员',
  sex: E(1, '男'),
  sketch: '【MOCK】测试账号',
  birthday: '1990-01-01',
  position: E(1, '控球后卫'),
  number: 23,
  weight: '75',
  height: '180',
  city: '北京',
  province: '北京',
  phone: '13800000000',
  isBindWx: EB(0, '未绑定', false),
  follows: 12,
  fans: 36
}

/* ------------------------------------------------------------------ *
 * 【MOCK】篮球比赛（NofinishGame）—— 红队 vs 蓝队，进行中
 * ------------------------------------------------------------------ */
const basketGame1 = {
  id: IDS.gameId,
  name: '测试联赛-红蓝大战',
  status: E(2, '进行中'),
  videoStatus: E(0, '未直播'),
  runStatus: E(2, '进行中'),
  type: E(1, '篮球'),
  event: E(1, '联赛'),
  time: '2026-07-31 15:00',
  venueId: 'mock-venue-1',
  leagueGroupId: 'mock-lg-1',
  leagueStageId: 'mock-ls-1',
  hostTeamId: 'ht1',
  hostGameTeamId: IDS.hostTeamId,
  hostTeamName: '红队',
  hostTeamLogo: 'https://img95.699pic.com/photo/60017/5478.jpg_wh860.jpg',
  hostTeamScore: 28,
  guestTeamId: 'gt2',
  guestGameTeamId: IDS.guestTeamId,
  guestTeamName: '蓝队',
  guestTeamLogo: '',
  guestTeamScore: 24,
  leagueGroupName: 'A组',
  leagueStageName: '小组赛',
  leagueId: IDS.leagueId,
  leagueLogo: '',
  leagueName: '测试联赛',
  venueName: '1号场地',
  isMedia: EB(1, '是', true)
}

/* 【MOCK】篮球比赛2 —— 未开始 */
const basketGame2 = {
  ...basketGame1,
  id: IDS.game2,
  name: '测试联赛-绿黄之战',
  status: E(1, '未开始'),
  runStatus: E(1, '未开始'),
  time: '2026-07-31 18:00',
  hostTeamName: '绿队',
  guestTeamName: '黄队',
  hostTeamScore: 0,
  guestTeamScore: 0,
  hostGameTeamId: 'mock-host-team-002',
  guestGameTeamId: 'mock-guest-team-002'
}

/* 【MOCK】篮球比赛3 —— 已结束 */
const basketGame3 = {
  ...basketGame1,
  id: IDS.game3,
  name: '测试联赛-青紫之战',
  status: E(3, '已结束'),
  runStatus: E(3, '已结束'),
  videoStatus: E(2, '已结束'),
  time: '2026-07-30 15:00',
  hostTeamName: '青队',
  guestTeamName: '紫队',
  hostTeamScore: 56,
  guestTeamScore: 49,
  hostGameTeamId: 'mock-host-team-003',
  guestGameTeamId: 'mock-guest-team-003'
}

/* 【MOCK】足球比赛（type=2 足球）—— 进行中 */
const footGame1 = {
  ...basketGame1,
  id: IDS.footGame,
  name: '测试杯-足球半决赛',
  type: E(2, '足球'),
  event: E(2, '杯赛'),
  hostTeamName: '飞虎队',
  guestTeamName: '雄鹰队',
  hostTeamScore: 1,
  guestTeamScore: 1,
  hostGameTeamId: 'mock-foot-host-001',
  guestGameTeamId: 'mock-foot-guest-001',
  leagueName: '测试杯'
}

/* ------------------------------------------------------------------ *
 * 【MOCK】比赛列表（NofinishData[] = { date, games[] }）
 *   按 query.status 区分：no_end=未结束(进行中+未开始) / end=已结束
 *   按 url 前缀区分篮球 / 足球（soccer/）
 * ------------------------------------------------------------------ */
function matchList(sport, status) {
  const isFoot = sport === 'football'
  const ongoing = isFoot ? footGame1 : basketGame1
  const notStart = isFoot ? { ...footGame1, id: 'mock-foot-002', status: E(1, '未开始'), runStatus: E(1, '未开始'), hostTeamScore: 0, guestTeamScore: 0 } : basketGame2
  const ended = isFoot ? { ...footGame1, id: 'mock-foot-003', status: E(3, '已结束'), runStatus: E(3, '已结束'), hostTeamScore: 3, guestTeamScore: 0 } : basketGame3
  if (status === 'end') {
    return ok([{ date: '2026-07-30', games: [ended] }])
  }
  return ok([{ date: '2026-07-31', games: [ongoing, notStart] }])
}

/* ------------------------------------------------------------------ *
 * 【MOCK】球员（StatisDownMember / MemberData 共用）
 *   篮球位置：1控卫 2分卫 3小前 4大前 5中锋；前5人首发+在场
 * ------------------------------------------------------------------ */
function buildMembers(teamName, teamId) {
  const names = teamName === '红队'
    ? ['赵一', '钱二', '孙三', '李四', '周五', '吴六', '郑七', '王八']
    : ['冯一', '陈二', '褚三', '卫四', '蒋五', '沈六', '韩七', '杨八']
  const pos = ['控球后卫', '得分后卫', '小前锋', '大前锋', '中锋', '替补后卫', '替补前锋', '替补中锋']
  return names.map((name, i) => ({
    id: `mock-${teamId}-m${i + 1}`,
    teamMemberId: `mock-${teamId}-member-${i + 1}`,
    startingLineup: EB(i < 5 ? 1 : 0, i < 5 ? '首发' : '替补', i < 5),
    playing: EB(i < 5 ? 1 : 0, i < 5 ? '在场' : '场下', i < 5),
    number: i + 1,
    name,
    temporary: 0,
    position: E(i < 5 ? i + 1 : 0, i < 5 ? pos[i] : '替补'),
    teamName,
    avatar: '',
    foul: i === 1 ? 2 : i === 3 ? 1 : 0
  }))
}

const hostMembers = buildMembers('红队', 'host')
const guestMembers = buildMembers('蓝队', 'guest')

/* ------------------------------------------------------------------ *
 * 【MOCK】小节（StatisDownSection / SectionData 共用）
 *   4 节，第 1 节 running.boolean=true
 * ------------------------------------------------------------------ */
const sections = [
  { id: 'mock-sec-1', gameSectionId: 'mock-sec-1', name: '第1节', gameId: IDS.gameId, type: E(1, '小节'), sort: 1, groups: '', running: EB(1, '进行中', true) },
  { id: 'mock-sec-2', gameSectionId: 'mock-sec-2', name: '第2节', gameId: IDS.gameId, type: E(1, '小节'), sort: 2, groups: '', running: EB(0, '未开始', false) },
  { id: 'mock-sec-3', gameSectionId: 'mock-sec-3', name: '第3节', gameId: IDS.gameId, type: E(1, '小节'), sort: 3, groups: '', running: EB(0, '未开始', false) },
  { id: 'mock-sec-4', gameSectionId: 'mock-sec-4', name: '第4节', gameId: IDS.gameId, type: E(1, '小节'), sort: 4, groups: '', running: EB(0, '未开始', false) }
]

/* 【MOCK】足球小节（上半场/下半场，足球不分“节”） */
const footSections = [
  { id: 'mock-foot-sec-1', gameSectionId: 'mock-foot-sec-1', name: '上半场', gameId: IDS.footGame, type: E(2, '半场'), sort: 1, groups: '', running: EB(1, '进行中', true) },
  { id: 'mock-foot-sec-2', gameSectionId: 'mock-foot-sec-2', name: '下半场', gameId: IDS.footGame, type: E(2, '半场'), sort: 2, groups: '', running: EB(0, '未开始', false) }
]

/* ------------------------------------------------------------------ *
 * 【MOCK】篮球统计全量（StatisDownData）—— statistics/game-detail-basketball
 *   basketball-down.vue 消费：d.game / d.hostMembers / d.guestMembers /
 *   d.sections / d.hostTeamFoul / d.guestTeamFoul / d.hostTeamStop / d.guestTeamStop
 * ------------------------------------------------------------------ */
const basketDetail = ok({
  game: {
    id: IDS.gameId,
    name: '测试联赛-红蓝大战',
    status: E(2, '进行中'),
    runStatus: E(2, '进行中'),
    type: E(1, '篮球'),
    event: E(1, '联赛'),
    time: '2026-07-31 15:00',
    isMedia: EB(1, '是', true),
    venueId: 'mock-venue-1',
    venueName: '1号场地',
    venueAddress: '测试体育馆1号场',
    leagueGroupId: 'mock-lg-1',
    leagueGroupName: 'A组',
    leagueGroupSort: 1,
    leagueStageId: 'mock-ls-1',
    leagueStageName: '小组赛',
    leagueStageSort: 1,
    leagueId: IDS.leagueId,
    leagueName: '测试联赛',
    leagueLogo: '',
    leagueStartTime: '2026-07-01',
    hostGameTeamId: IDS.hostTeamId,
    hostTeamId: 'ht1',
    hostTeamLogo: '',
    hostTeamName: '红队',
    hostTeamScore: 28,
    guestGameTeamId: IDS.guestTeamId,
    guestTeamId: 'gt2',
    guestTeamLogo: '',
    guestTeamName: '蓝队',
    guestTeamScore: 24,
    gameResult: E(0, '未结束'),
    videoStatus: E(0, '未直播'),
    section: '1'
  },
  hostTeamFoul: 3,
  guestTeamFoul: 2,
  hostTeamStop: 1,
  guestTeamStop: 0,
  hostMembers,
  guestMembers,
  sections
})

/* ------------------------------------------------------------------ *
 * 【MOCK】比赛详情（GameDetail）—— game/{gameId}/detail
 * ------------------------------------------------------------------ */
const gameDetail = ok({
  id: IDS.gameId,
  section: '1',
  logo: '',
  name: '测试联赛-红蓝大战',
  status: E(2, '进行中'),
  runStatus: E(2, '进行中'),
  type: E(1, '篮球'),
  time: '2026-07-31 15:00',
  venueId: 'mock-venue-1',
  leagueEventGroupId: 'mock-lg-1',
  leagueId: IDS.leagueId,
  hostTeamId: 'ht1',
  hostGameTeamId: IDS.hostTeamId,
  hostTeamName: '红队',
  hostTeamLogo: '',
  hostTeamScore: 28,
  guestTeamId: 'gt2',
  guestGameTeamId: IDS.guestTeamId,
  guestTeamName: '蓝队',
  guestTeamLogo: '',
  guestTeamScore: 24,
  leagueEventGroupName: 'A组',
  leagueEventId: 'mock-le-1',
  leagueEventName: '小组赛',
  leagueName: '测试联赛',
  leagueStageName: '小组赛',
  videoId: '',
  liveStreamId: '',
  hostTeamFoul: 3,
  guestTeamFoul: 2,
  leagueLogo: '',
  score: 28,
  backboard: 12,
  assists: 8,
  number: 8
})

/* 【MOCK】足球详情（GameDetail 足球版）—— game/{gameId}/foot-detail */
const footDetail = ok({ ...gameDetail.data, type: E(2, '足球'), hostTeamName: '飞虎队', guestTeamName: '雄鹰队', hostTeamScore: 1, guestTeamScore: 1, name: '测试杯-足球半决赛', leagueName: '测试杯' })

/* ------------------------------------------------------------------ *
 * 【MOCK】连接信息（ConnectData）—— ts/game/info
 * ------------------------------------------------------------------ */
const connectInfo = ok({
  id: IDS.gameId,
  event: E(1, '联赛'),
  name: '测试联赛-红蓝大战',
  status: E(2, '进行中'),
  runStatus: E(2, '进行中'),
  time: '2026-07-31 15:00',
  type: E(1, '篮球'),
  isMedia: EB(1, '是', true),
  venueId: 'mock-venue-1',
  venueName: '1号场地',
  venueAddress: '测试体育馆1号场',
  leagueGroupId: 'mock-lg-1',
  leagueGroupName: 'A组',
  leagueGroupSort: 1,
  leagueStageId: 'mock-ls-1',
  leagueStageName: '小组赛',
  leagueStageSort: 1,
  leagueId: IDS.leagueId,
  leagueName: '测试联赛',
  leagueLogo: '',
  leagueStartTime: '2026-07-01',
  hostGameTeamId: IDS.hostTeamId,
  hostTeamId: 'ht1',
  hostTeamLogo: '',
  hostTeamName: '红队',
  hostTeamScore: 28,
  guestGameTeamId: IDS.guestTeamId,
  guestTeamId: 'gt2',
  guestTeamLogo: '',
  guestTeamName: '蓝队',
  guestTeamScore: 24,
  gameResult: E(0, '未结束'),
  videoStatus: E(0, '未直播'),
  section: '1'
})

/* ------------------------------------------------------------------ *
 * 【MOCK】小节列表（SectionData[]）—— statistics/section/list
 *   basketball-setup.vue 消费 s.id / s.gameId / s.type.value / s.name / s.sort / s.groups
 * ------------------------------------------------------------------ */
function sectionList(query) {
  const isFoot = query && query.gameId && String(query.gameId).indexOf('foot') >= 0
  const list = isFoot ? footSections : sections
  return ok(list.map((s) => ({
    id: s.id,
    name: s.name,
    gameId: s.gameId,
    type: s.type,
    sort: s.sort,
    groups: s.groups
  })))
}

/* ------------------------------------------------------------------ *
 * 【MOCK】球员列表（MemberData[]）—— statistics/member/list query{gameTeamId}
 * ------------------------------------------------------------------ */
function memberList(query) {
  const isGuest = query && query.gameTeamId && String(query.gameTeamId).indexOf('guest') >= 0
  return ok(isGuest ? guestMembers : hostMembers)
}

/* ------------------------------------------------------------------ *
 * 【MOCK】统计记录列表（SynchrData）—— statistics/page
 *   record 页 / synchr 消费：list[].type / memberName / teamName / sectionName / description / occurrenceTime
 * ------------------------------------------------------------------ */
const recordList = ok({
  totalCount: 6,
  pageSize: 10,
  totalPage: 1,
  pageNo: 1,
  nextPage: false,
  list: [
    { id: 'mock-rec-1', recordNumber: 'mock-rec-1', statisticsSectionId: 'mock-sec-1', type: E(7, '三分命中'), occurrenceTime: '15:02:10', statisticsMemberId: 'mock-host-member-1', statisticsTeamId: IDS.hostTeamId, description: '赵一 三分命中', sectionName: '第1节', memberName: '赵一', teamName: '红队' },
    { id: 'mock-rec-2', recordNumber: 'mock-rec-2', statisticsSectionId: 'mock-sec-1', type: E(1, '篮板'), occurrenceTime: '15:03:25', statisticsMemberId: 'mock-guest-member-5', statisticsTeamId: IDS.guestTeamId, description: '冯五 篮板', sectionName: '第1节', memberName: '蒋五', teamName: '蓝队' },
    { id: 'mock-rec-3', recordNumber: 'mock-rec-3', statisticsSectionId: 'mock-sec-1', type: E(6, '两分命中'), occurrenceTime: '15:04:40', statisticsMemberId: 'mock-host-member-2', statisticsTeamId: IDS.hostTeamId, description: '钱二 两分命中', sectionName: '第1节', memberName: '钱二', teamName: '红队' },
    { id: 'mock-rec-4', recordNumber: 'mock-rec-4', statisticsSectionId: 'mock-sec-1', type: E(9, '犯规'), occurrenceTime: '15:05:55', statisticsMemberId: 'mock-guest-member-2', statisticsTeamId: IDS.guestTeamId, description: '陈二 犯规', sectionName: '第1节', memberName: '陈二', teamName: '蓝队' },
    { id: 'mock-rec-5', recordNumber: 'mock-rec-5', statisticsSectionId: 'mock-sec-1', type: E(2, '助攻'), occurrenceTime: '15:07:12', statisticsMemberId: 'mock-host-member-1', statisticsTeamId: IDS.hostTeamId, description: '赵一 助攻', sectionName: '第1节', memberName: '赵一', teamName: '红队' },
    { id: 'mock-rec-6', recordNumber: 'mock-rec-6', statisticsSectionId: 'mock-sec-1', type: E(17, '失误'), occurrenceTime: '15:08:30', statisticsMemberId: 'mock-guest-member-3', statisticsTeamId: IDS.guestTeamId, description: '褚三 失误', sectionName: '第1节', memberName: '褚三', teamName: '蓝队' }
  ]
})

/* ------------------------------------------------------------------ *
 * 【MOCK】优肯周赛况（UkenData）—— game/list-week
 * ------------------------------------------------------------------ */
const weekList = ok([
  {
    groupName: 'A组',
    games: [basketGame1, basketGame3],
    optimals: [
      { name: '赵一', avatar: '', count: 18, type: E(6, '得分王') },
      { name: '蒋五', avatar: '', count: 11, type: E(1, '篮板王') }
    ]
  },
  {
    groupName: 'B组',
    games: [basketGame2],
    optimals: [{ name: '吴六', avatar: '', count: 7, type: E(2, '助攻王') }]
  }
])

/* ------------------------------------------------------------------ *
 * 【MOCK】拍照活动列表（PhotoLiveData）—— photo/activity/list-my-manage
 * ------------------------------------------------------------------ */
const photoActivityList = ok({
  totalCount: 2,
  pageSize: 10,
  totalPage: 1,
  pageNo: 1,
  nextPage: false,
  list: [
    { id: 'mock-photo-act-1', type: E(1, '比赛'), title: '红蓝大战拍照直播', description: '【MOCK】测试活动', status: E(1, '进行中'), startTime: '2026-07-31 15:00', endTime: '2026-07-31 17:00', address: '1号场地', visitors: 128, logo: '', banner: '', poster: '', timeInterval: 0, showStatus: E(1, '显示') },
    { id: 'mock-photo-act-2', type: E(2, '联赛'), title: '测试杯拍照直播', description: '【MOCK】测试活动2', status: E(2, '已结束'), startTime: '2026-07-30 15:00', endTime: '2026-07-30 17:00', address: '2号场地', visitors: 56, logo: '', banner: '', poster: '', timeInterval: 0, showStatus: E(1, '显示') }
  ]
})

/* ------------------------------------------------------------------ *
 * 【MOCK】上传照片列表（PhotoListData[]）—— photo/picture/upload-list
 * ------------------------------------------------------------------ */
const uploadPhotoList = ok([
  { id: 'mock-pic-1', photoActivityId: 'mock-photo-act-1', userId: 'mock-user-001', url: '', width: 1080, height: 1920, fileName: 'mock-1.jpg', fileSize: 102400, fileTime: '2026-07-31 15:01:00', showStatus: E(1, '显示'), likeCount: 3 },
  { id: 'mock-pic-2', photoActivityId: 'mock-photo-act-1', userId: 'mock-user-001', url: '', width: 1080, height: 1920, fileName: 'mock-2.jpg', fileSize: 204800, fileTime: '2026-07-31 15:02:00', showStatus: E(1, '显示'), likeCount: 5 },
  { id: 'mock-pic-3', photoActivityId: 'mock-photo-act-1', userId: 'mock-user-001', url: '', width: 1080, height: 1920, fileName: 'mock-3.jpg', fileSize: 153600, fileTime: '2026-07-31 15:03:00', showStatus: E(1, '显示'), likeCount: 0 }
])

/* ------------------------------------------------------------------ *
 * 【MOCK】直播地址列表（LiveGameUrl[]）—— live/stream/game-list
 * ------------------------------------------------------------------ */
const liveGameList = ok([
  { id: 'mock-live-1', recordId: 'mock-rec-live-1', type: E(1, '直播'), appName: 'mock', streamName: 'mock-stream-1', name: '1号机位', status: E(1, '直播中'), cover: '', publish: 'rtmp://mock/live/mock-stream-1', liveRtmp: 'rtmp://mock/live/mock-stream-1', liveFlv: 'http://mock/live/mock-stream-1.flv', liveM3u8: 'http://mock/live/mock-stream-1.m3u8' }
])

/* ------------------------------------------------------------------ *
 * 【MOCK】版本检查（VersionCheck）—— sys/app-version/check
 *   versionCode 返回 0 => 必然 ≤ 当前版本，不弹更新框（main 判 v.versionCode > appStore.version）
 * ------------------------------------------------------------------ */
const versionCheckResult = ok({
  id: 'mock-ver-1',
  deviceType: E(1, 'android'),
  url: '',
  upgradeType: E(0, '可选'),
  remark: '【MOCK】当前已是最新版本（测试数据）',
  packageSize: '0',
  versionCode: 0,
  versionName: '2.8.4',
  notice: E(0, '不提醒')
})

/* ================================================================== *
 *  匹配表：{ method, url(可含 {xxx} 路径参数), handler(options) => body }
 *  handler 返回完整响应体（含 status/code/msg/data）
 *  未命中返回 null -> request.js 继续走真实请求
 * ================================================================== */
const RULES = [
  /* ----- 登录 ----- */
  { method: 'POST', url: 'sms/login', handler: () => ok(null, '【MOCK】验证码已发送(测试码:1234)') },
  { method: 'POST', url: 'user/login', handler: () => ok(IDS.token, '【MOCK】登录成功') },
  { method: 'GET', url: 'user/info', handler: () => ok(userInfo) },

  /* ----- 比赛列表（篮球 / 足球，按 query.status 区分未结束/已结束）----- */
  { method: 'GET', url: 'game/list-my-manage', handler: (o) => matchList('basketball', o.query && o.query.status) },
  { method: 'GET', url: 'soccer/game/list-my-manage', handler: (o) => matchList('football', o.query && o.query.status) },

  /* ----- 比赛详情 / 连接信息 ----- */
  { method: 'GET', url: 'ts/game/info', handler: () => connectInfo },
  { method: 'GET', url: 'game//info', handler: () => connectInfo },
  { method: 'GET', url: 'soccer/game//info', handler: () => connectInfo },
  { method: 'GET', url: 'game/{gameId}/detail', handler: () => gameDetail },
  { method: 'GET', url: 'soccer/game/{gameId}/detail', handler: () => gameDetail },
  { method: 'GET', url: 'game/{gameId}/foot-detail', handler: () => footDetail },
  { method: 'GET', url: 'statistics/game-detail-basketball', handler: () => basketDetail },

  /* ----- 小节 / 球员 ----- */
  { method: 'GET', url: 'statistics/section/list', handler: (o) => sectionList(o.query) },
  { method: 'GET', url: 'statistics/member/list', handler: (o) => memberList(o.query) },

  /* ----- 统计记录 ----- */
  { method: 'GET', url: 'statistics/page', handler: () => recordList },

  /* ----- 优肯周赛况 ----- */
  { method: 'GET', url: 'game/list-week', handler: () => weekList },

  /* ----- 拍照 / 相册 ----- */
  { method: 'GET', url: 'photo/activity/list-my-manage', handler: () => photoActivityList },
  { method: 'GET', url: 'photo/activity/create-game', handler: () => ok('mock-photo-act-new', '【MOCK】活动创建成功') },
  { method: 'GET', url: 'photo/picture/upload-list', handler: () => uploadPhotoList },

  /* ----- 直播 ----- */
  { method: 'GET', url: 'live/stream/game-list', handler: () => liveGameList },
  { method: 'POST', url: 'live/stream/game', handler: () => ok(liveGameList.data[0], '【MOCK】获取直播地址成功') },
  { method: 'POST', url: 'live/stream/game-add', handler: () => ok('mock-live-new', '【MOCK】直播添加成功') },
  { method: 'POST', url: 'live/stream/compose', handler: () => ok(null, '【MOCK】合成回放请求已提交') },

  /* ----- 版本检查 ----- */
  { method: 'GET', url: 'sys/app-version/check', handler: () => versionCheckResult },

  /* ----- 写操作：统一返回成功（mock 不真实落库）----- */
  { method: 'POST', url: 'ts/game/update-info', handler: () => ok(null, '【MOCK】保存成功') },
  { method: 'POST', url: 'game/status', handler: () => ok(null, '【MOCK】状态修改成功') },
  { method: 'POST', url: 'soccer/game/status', handler: () => ok(null, '【MOCK】状态修改成功') },
  { method: 'POST', url: 'statistics/member/sign', handler: () => ok(null, '【MOCK】签到成功') },
  { method: 'POST', url: 'statistics/member/sign-cancel', handler: () => ok(null, '【MOCK】取消签到成功') },
  { method: 'POST', url: 'statistics/member/starting-lineup', handler: () => ok(null, '【MOCK】设置首发成功') },
  { method: 'POST', url: 'statistics/member/starting-lineup-cancel', handler: () => ok(null, '【MOCK】取消首发成功') },
  { method: 'POST', url: 'statistics/member/temporary', handler: () => ok('mock-member-new', '【MOCK】添加临时球员成功') },
  { method: 'POST', url: 'statistics/member/edit-position', handler: () => ok(null, '【MOCK】位置修改成功') },
  { method: 'GET', url: 'statistics/member/delete-temporary', handler: () => ok(null, '【MOCK】删除球员成功') },
  { method: 'POST', url: 'statistics/add', handler: () => ok(null, '【MOCK】统计提交成功') },
  { method: 'POST', url: 'statistics/add-all', handler: () => ok(null, '【MOCK】批量统计提交成功') },
  { method: 'POST', url: 'statistics/cancel', handler: () => ok(null, '【MOCK】取消记录成功') },
  { method: 'POST', url: 'statistics/section/running', handler: () => ok(null, '【MOCK】小节状态切换成功') }
]

/** 把 url 模板（含 {xxx}）转成正则匹配真实 url（不含 query） */
function matchUrl(template, realUrl) {
  const re = new RegExp('^' + template.replace(/\{[^}]+\}/g, '([^/]+)') + '$')
  return re.test(realUrl)
}

/**
 * 【MOCK】核心：按 options 匹配静态数据
 * @param {Object} options 同 request(options) 的入参
 * @returns {Object|null} 命中返回响应体，未命中返回 null（交回真实请求）
 */
export function mockResolve(options) {
  if (!config.useMock) return null
  const { url, method = 'GET' } = options
  const m = method.toUpperCase()
  for (const rule of RULES) {
    if (rule.method !== m) continue
    if (!matchUrl(rule.url, url)) continue
    return rule.handler(options)
  }
  // 未命中：打印提示，方便补 mock
  console.warn(`%c【MOCK】未匹配到静态数据，走真实请求：${m} ${url}`, 'color:#f56c6c')
  return null
}
