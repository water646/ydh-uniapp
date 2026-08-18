import { f as formatAppLog, _ as _export_sfc, o as onLoad, a as onReady, b as onUnload, c as onBackPress } from "../../_plugin-vue_export-helper.js";
import { ref, resolveComponent, openBlock, createElementBlock, createElementVNode, createVNode, createCommentVNode, toDisplayString } from "vue";
const config = {
  /**
   * ⚠️【MOCK 开关】⚠️
   * true  => 所有请求走 mock/mock-data.js 的静态测试数据（不访问真实后端）
   * false => 走真实后端接口（baseUrl）
   * 测试完毕请改回 false。
   */
  useMock: true,
  /** Retrofit baseUrl：对应 Api.APP_DOMAIN */
  baseUrl: "http://app.ydh123.com/ydh-service/",
  /** WebSocket 长连接地址：对应 Api.LONG_URL，用于直播实时比分推送 */
  wsUrl: "ws://im.ydh123.com?",
  /** 加密密钥：对应 AppConfig.SECRET，Global.s = MD5(secret) */
  secret: "5QPxu5v8P@v%L6pP",
  /** 首页页码：对应 AppConfig.PAGE_NUMBER_FIRST */
  pageFirst: 1,
  /** 每页条数：对应 AppConfig.PAGE_SIZE */
  pageSize: 10,
  /** 文件存储目录（App 端使用 plus.io 私有目录，对应原 /sdcard/ydh_statistics/） */
  filePath: "_doc/ydh_statistics/",
  /** 数据库名：对应 AppConfig.DATA_BASE_NAME */
  dbName: "statistics",
  /** token 失效 code：对应 GlobalHttpHandlerImpl 的 -8 / -9 登出逻辑 */
  tokenExpiredCodes: [-8, -9],
  /** 协议页地址：对应 UserAgreeActivity 的两个 WebView URL */
  agreement: {
    user: "https://app.ydh123.com/user-agreement-statistics",
    privacy: "https://app.ydh123.com/privacy-statistics"
  },
  /** 优肯周赛况联赛 id（对应 WeekOutsActivity 硬编码 leagueId） */
  youkenLeagueId: "7f9e9d6018b372e92522bb2625f341b1"
};
const SportType = {
  BASKETBALL: "basketball",
  FOOTBALL: "football"
};
function sportPrefix(sport) {
  return sport === SportType.FOOTBALL ? "soccer/" : "";
}
const KEY_TOKEN = "auth_token";
const KEY_USER_ID = "auth_user_id";
function getToken() {
  return uni.getStorageSync(KEY_TOKEN) || "";
}
function clearAuth() {
  uni.removeStorageSync(KEY_TOKEN);
  uni.removeStorageSync(KEY_USER_ID);
}
let socketTask = null;
let reconnectTimer = null;
let messageCallback = null;
let statusCallback = null;
let closedByUser = false;
let currentGroup = "";
function connectSocket(group, onMessage, onStatus) {
  closedByUser = false;
  currentGroup = group;
  messageCallback = onMessage;
  statusCallback = onStatus;
  const token = getToken();
  const url = `${config.wsUrl}token=${encodeURIComponent(token)}&group=${group}`;
  socketTask = uni.connectSocket({
    url,
    complete() {
    }
  });
  socketTask.onOpen(() => {
    formatAppLog("log", "at utils/websocket.js:40", "WebSocket 已连接", group, url);
    statusCallback && statusCallback("open");
  });
  socketTask.onMessage((res) => {
    try {
      const msg = JSON.parse(res.data);
      let data = msg.data;
      if (data && typeof data.content === "string") {
        try {
          data = JSON.parse(data.content);
        } catch (e) {
          data = { msg: data.content };
        }
      }
      messageCallback && messageCallback(data || {});
    } catch (e) {
    }
  });
  socketTask.onClose(() => {
    formatAppLog("log", "at utils/websocket.js:64", "WebSocket 关闭", group);
    statusCallback && statusCallback("close");
    if (!closedByUser) {
      reconnectTimer = setTimeout(() => {
        connectSocket(currentGroup, messageCallback, statusCallback);
      }, 3e3);
    }
  });
  socketTask.onError(() => {
    formatAppLog("log", "at utils/websocket.js:75", "WebSocket 错误", group, url);
    statusCallback && statusCallback("error");
  });
}
function closeSocket() {
  closedByUser = true;
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
  if (socketTask) {
    try {
      socketTask.close();
    } catch (e) {
    }
    socketTask = null;
  }
}
const E = (value, desc) => ({ value, desc });
const EB = (value, desc, boolean) => ({ value, desc, boolean });
const ok = (data, msg = "ok") => ({ status: 1, code: 1, msg, data });
const IDS = {
  gameId: "mock-game-001",
  game2: "mock-game-002",
  game3: "mock-game-003",
  footGame: "mock-foot-game-001",
  hostTeamId: "mock-host-team-001",
  guestTeamId: "mock-guest-team-001",
  leagueId: "mock-league-001",
  token: "mock-token-test-001"
};
const userInfo = {
  id: "mock-user-001",
  avatar: "",
  nickName: "测试管理员",
  sex: E(1, "男"),
  sketch: "【MOCK】测试账号",
  birthday: "1990-01-01",
  position: E(1, "控球后卫"),
  number: 23,
  weight: "75",
  height: "180",
  city: "北京",
  province: "北京",
  phone: "13800000000",
  isBindWx: EB(0, "未绑定", false),
  follows: 12,
  fans: 36
};
const basketGame1 = {
  id: IDS.gameId,
  name: "测试联赛-红蓝大战",
  status: E(2, "进行中"),
  videoStatus: E(0, "未直播"),
  runStatus: E(2, "进行中"),
  type: E(1, "篮球"),
  event: E(1, "联赛"),
  time: "2026-07-31 15:00",
  venueId: "mock-venue-1",
  leagueGroupId: "mock-lg-1",
  leagueStageId: "mock-ls-1",
  hostTeamId: "ht1",
  hostGameTeamId: IDS.hostTeamId,
  hostTeamName: "红队",
  hostTeamLogo: "https://img95.699pic.com/photo/60017/5478.jpg_wh860.jpg",
  hostTeamScore: 28,
  guestTeamId: "gt2",
  guestGameTeamId: IDS.guestTeamId,
  guestTeamName: "蓝队",
  guestTeamLogo: "",
  guestTeamScore: 24,
  leagueGroupName: "A组",
  leagueStageName: "小组赛",
  leagueId: IDS.leagueId,
  leagueLogo: "",
  leagueName: "测试联赛",
  venueName: "1号场地",
  isMedia: EB(1, "是", true)
};
const basketGame2 = {
  ...basketGame1,
  id: IDS.game2,
  name: "测试联赛-绿黄之战",
  status: E(1, "未开始"),
  runStatus: E(1, "未开始"),
  time: "2026-07-31 18:00",
  hostTeamName: "绿队",
  guestTeamName: "黄队",
  hostTeamScore: 0,
  guestTeamScore: 0,
  hostGameTeamId: "mock-host-team-002",
  guestGameTeamId: "mock-guest-team-002"
};
const basketGame3 = {
  ...basketGame1,
  id: IDS.game3,
  name: "测试联赛-青紫之战",
  status: E(3, "已结束"),
  runStatus: E(3, "已结束"),
  videoStatus: E(2, "已结束"),
  time: "2026-07-30 15:00",
  hostTeamName: "青队",
  guestTeamName: "紫队",
  hostTeamScore: 56,
  guestTeamScore: 49,
  hostGameTeamId: "mock-host-team-003",
  guestGameTeamId: "mock-guest-team-003"
};
const footGame1 = {
  ...basketGame1,
  id: IDS.footGame,
  name: "测试杯-足球半决赛",
  type: E(2, "足球"),
  event: E(2, "杯赛"),
  hostTeamName: "飞虎队",
  guestTeamName: "雄鹰队",
  hostTeamScore: 1,
  guestTeamScore: 1,
  hostGameTeamId: "mock-foot-host-001",
  guestGameTeamId: "mock-foot-guest-001",
  leagueName: "测试杯"
};
function matchList(sport, status) {
  const isFoot = sport === "football";
  const ongoing = isFoot ? footGame1 : basketGame1;
  const notStart = isFoot ? { ...footGame1, id: "mock-foot-002", status: E(1, "未开始"), runStatus: E(1, "未开始"), hostTeamScore: 0, guestTeamScore: 0 } : basketGame2;
  const ended = isFoot ? { ...footGame1, id: "mock-foot-003", status: E(3, "已结束"), runStatus: E(3, "已结束"), hostTeamScore: 3, guestTeamScore: 0 } : basketGame3;
  if (status === "end") {
    return ok([{ date: "2026-07-30", games: [ended] }]);
  }
  return ok([{ date: "2026-07-31", games: [ongoing, notStart] }]);
}
function buildMembers(teamName, teamId) {
  const names = teamName === "红队" ? ["赵一", "钱二", "孙三", "李四", "周五", "吴六", "郑七", "王八"] : ["冯一", "陈二", "褚三", "卫四", "蒋五", "沈六", "韩七", "杨八"];
  const pos = ["控球后卫", "得分后卫", "小前锋", "大前锋", "中锋", "替补后卫", "替补前锋", "替补中锋"];
  return names.map((name, i) => ({
    id: `mock-${teamId}-m${i + 1}`,
    teamMemberId: `mock-${teamId}-member-${i + 1}`,
    startingLineup: EB(i < 5 ? 1 : 0, i < 5 ? "首发" : "替补", i < 5),
    playing: EB(i < 5 ? 1 : 0, i < 5 ? "在场" : "场下", i < 5),
    number: i + 1,
    name,
    temporary: 0,
    position: E(i < 5 ? i + 1 : 0, i < 5 ? pos[i] : "替补"),
    teamName,
    avatar: "",
    foul: i === 1 ? 2 : i === 3 ? 1 : 0
  }));
}
const hostMembers = buildMembers("红队", "host");
const guestMembers = buildMembers("蓝队", "guest");
const sections = [
  { id: "mock-sec-1", gameSectionId: "mock-sec-1", name: "第1节", gameId: IDS.gameId, type: E(1, "小节"), sort: 1, groups: "", running: EB(1, "进行中", true) },
  { id: "mock-sec-2", gameSectionId: "mock-sec-2", name: "第2节", gameId: IDS.gameId, type: E(1, "小节"), sort: 2, groups: "", running: EB(0, "未开始", false) },
  { id: "mock-sec-3", gameSectionId: "mock-sec-3", name: "第3节", gameId: IDS.gameId, type: E(1, "小节"), sort: 3, groups: "", running: EB(0, "未开始", false) },
  { id: "mock-sec-4", gameSectionId: "mock-sec-4", name: "第4节", gameId: IDS.gameId, type: E(1, "小节"), sort: 4, groups: "", running: EB(0, "未开始", false) }
];
const footSections = [
  { id: "mock-foot-sec-1", gameSectionId: "mock-foot-sec-1", name: "上半场", gameId: IDS.footGame, type: E(2, "半场"), sort: 1, groups: "", running: EB(1, "进行中", true) },
  { id: "mock-foot-sec-2", gameSectionId: "mock-foot-sec-2", name: "下半场", gameId: IDS.footGame, type: E(2, "半场"), sort: 2, groups: "", running: EB(0, "未开始", false) }
];
const basketDetail = ok({
  game: {
    id: IDS.gameId,
    name: "测试联赛-红蓝大战",
    status: E(2, "进行中"),
    runStatus: E(2, "进行中"),
    type: E(1, "篮球"),
    event: E(1, "联赛"),
    time: "2026-07-31 15:00",
    isMedia: EB(1, "是", true),
    venueId: "mock-venue-1",
    venueName: "1号场地",
    venueAddress: "测试体育馆1号场",
    leagueGroupId: "mock-lg-1",
    leagueGroupName: "A组",
    leagueGroupSort: 1,
    leagueStageId: "mock-ls-1",
    leagueStageName: "小组赛",
    leagueStageSort: 1,
    leagueId: IDS.leagueId,
    leagueName: "测试联赛",
    leagueLogo: "",
    leagueStartTime: "2026-07-01",
    hostGameTeamId: IDS.hostTeamId,
    hostTeamId: "ht1",
    hostTeamLogo: "",
    hostTeamName: "红队",
    hostTeamScore: 28,
    guestGameTeamId: IDS.guestTeamId,
    guestTeamId: "gt2",
    guestTeamLogo: "",
    guestTeamName: "蓝队",
    guestTeamScore: 24,
    gameResult: E(0, "未结束"),
    videoStatus: E(0, "未直播"),
    section: "1"
  },
  hostTeamFoul: 3,
  guestTeamFoul: 2,
  hostTeamStop: 1,
  guestTeamStop: 0,
  hostMembers,
  guestMembers,
  sections
});
const gameDetail = ok({
  id: IDS.gameId,
  section: "1",
  logo: "",
  name: "测试联赛-红蓝大战",
  status: E(2, "进行中"),
  runStatus: E(2, "进行中"),
  type: E(1, "篮球"),
  time: "2026-07-31 15:00",
  venueId: "mock-venue-1",
  leagueEventGroupId: "mock-lg-1",
  leagueId: IDS.leagueId,
  hostTeamId: "ht1",
  hostGameTeamId: IDS.hostTeamId,
  hostTeamName: "红队",
  hostTeamLogo: "",
  hostTeamScore: 28,
  guestTeamId: "gt2",
  guestGameTeamId: IDS.guestTeamId,
  guestTeamName: "蓝队",
  guestTeamLogo: "",
  guestTeamScore: 24,
  leagueEventGroupName: "A组",
  leagueEventId: "mock-le-1",
  leagueEventName: "小组赛",
  leagueName: "测试联赛",
  leagueStageName: "小组赛",
  videoId: "",
  liveStreamId: "",
  hostTeamFoul: 3,
  guestTeamFoul: 2,
  leagueLogo: "",
  score: 28,
  backboard: 12,
  assists: 8,
  number: 8
});
const footDetail = ok({ ...gameDetail.data, type: E(2, "足球"), hostTeamName: "飞虎队", guestTeamName: "雄鹰队", hostTeamScore: 1, guestTeamScore: 1, name: "测试杯-足球半决赛", leagueName: "测试杯" });
const connectInfo = ok({
  id: IDS.gameId,
  event: E(1, "联赛"),
  name: "测试联赛-红蓝大战",
  status: E(2, "进行中"),
  runStatus: E(2, "进行中"),
  time: "2026-07-31 15:00",
  type: E(1, "篮球"),
  isMedia: EB(1, "是", true),
  venueId: "mock-venue-1",
  venueName: "1号场地",
  venueAddress: "测试体育馆1号场",
  leagueGroupId: "mock-lg-1",
  leagueGroupName: "A组",
  leagueGroupSort: 1,
  leagueStageId: "mock-ls-1",
  leagueStageName: "小组赛",
  leagueStageSort: 1,
  leagueId: IDS.leagueId,
  leagueName: "测试联赛",
  leagueLogo: "",
  leagueStartTime: "2026-07-01",
  hostGameTeamId: IDS.hostTeamId,
  hostTeamId: "ht1",
  hostTeamLogo: "",
  hostTeamName: "红队",
  hostTeamScore: 28,
  guestGameTeamId: IDS.guestTeamId,
  guestTeamId: "gt2",
  guestTeamLogo: "",
  guestTeamName: "蓝队",
  guestTeamScore: 24,
  gameResult: E(0, "未结束"),
  videoStatus: E(0, "未直播"),
  section: "1"
});
function sectionList(query) {
  const isFoot = query && query.gameId && String(query.gameId).indexOf("foot") >= 0;
  const list = isFoot ? footSections : sections;
  return ok(list.map((s) => ({
    id: s.id,
    name: s.name,
    gameId: s.gameId,
    type: s.type,
    sort: s.sort,
    groups: s.groups
  })));
}
function memberList(query) {
  const isGuest = query && query.gameTeamId && String(query.gameTeamId).indexOf("guest") >= 0;
  return ok(isGuest ? guestMembers : hostMembers);
}
const recordList = ok({
  totalCount: 6,
  pageSize: 10,
  totalPage: 1,
  pageNo: 1,
  nextPage: false,
  list: [
    { id: "mock-rec-1", recordNumber: "mock-rec-1", statisticsSectionId: "mock-sec-1", type: E(7, "三分命中"), occurrenceTime: "15:02:10", statisticsMemberId: "mock-host-member-1", statisticsTeamId: IDS.hostTeamId, description: "赵一 三分命中", sectionName: "第1节", memberName: "赵一", teamName: "红队" },
    { id: "mock-rec-2", recordNumber: "mock-rec-2", statisticsSectionId: "mock-sec-1", type: E(1, "篮板"), occurrenceTime: "15:03:25", statisticsMemberId: "mock-guest-member-5", statisticsTeamId: IDS.guestTeamId, description: "冯五 篮板", sectionName: "第1节", memberName: "蒋五", teamName: "蓝队" },
    { id: "mock-rec-3", recordNumber: "mock-rec-3", statisticsSectionId: "mock-sec-1", type: E(6, "两分命中"), occurrenceTime: "15:04:40", statisticsMemberId: "mock-host-member-2", statisticsTeamId: IDS.hostTeamId, description: "钱二 两分命中", sectionName: "第1节", memberName: "钱二", teamName: "红队" },
    { id: "mock-rec-4", recordNumber: "mock-rec-4", statisticsSectionId: "mock-sec-1", type: E(9, "犯规"), occurrenceTime: "15:05:55", statisticsMemberId: "mock-guest-member-2", statisticsTeamId: IDS.guestTeamId, description: "陈二 犯规", sectionName: "第1节", memberName: "陈二", teamName: "蓝队" },
    { id: "mock-rec-5", recordNumber: "mock-rec-5", statisticsSectionId: "mock-sec-1", type: E(2, "助攻"), occurrenceTime: "15:07:12", statisticsMemberId: "mock-host-member-1", statisticsTeamId: IDS.hostTeamId, description: "赵一 助攻", sectionName: "第1节", memberName: "赵一", teamName: "红队" },
    { id: "mock-rec-6", recordNumber: "mock-rec-6", statisticsSectionId: "mock-sec-1", type: E(17, "失误"), occurrenceTime: "15:08:30", statisticsMemberId: "mock-guest-member-3", statisticsTeamId: IDS.guestTeamId, description: "褚三 失误", sectionName: "第1节", memberName: "褚三", teamName: "蓝队" }
  ]
});
const weekList = ok([
  {
    groupName: "A组",
    games: [basketGame1, basketGame3],
    optimals: [
      { name: "赵一", avatar: "", count: 18, type: E(6, "得分王") },
      { name: "蒋五", avatar: "", count: 11, type: E(1, "篮板王") }
    ]
  },
  {
    groupName: "B组",
    games: [basketGame2],
    optimals: [{ name: "吴六", avatar: "", count: 7, type: E(2, "助攻王") }]
  }
]);
const photoActivityList = ok({
  totalCount: 2,
  pageSize: 10,
  totalPage: 1,
  pageNo: 1,
  nextPage: false,
  list: [
    { id: "mock-photo-act-1", type: E(1, "比赛"), title: "红蓝大战拍照直播", description: "【MOCK】测试活动", status: E(1, "进行中"), startTime: "2026-07-31 15:00", endTime: "2026-07-31 17:00", address: "1号场地", visitors: 128, logo: "", banner: "", poster: "", timeInterval: 0, showStatus: E(1, "显示") },
    { id: "mock-photo-act-2", type: E(2, "联赛"), title: "测试杯拍照直播", description: "【MOCK】测试活动2", status: E(2, "已结束"), startTime: "2026-07-30 15:00", endTime: "2026-07-30 17:00", address: "2号场地", visitors: 56, logo: "", banner: "", poster: "", timeInterval: 0, showStatus: E(1, "显示") }
  ]
});
const uploadPhotoList = ok([
  { id: "mock-pic-1", photoActivityId: "mock-photo-act-1", userId: "mock-user-001", url: "", width: 1080, height: 1920, fileName: "mock-1.jpg", fileSize: 102400, fileTime: "2026-07-31 15:01:00", showStatus: E(1, "显示"), likeCount: 3 },
  { id: "mock-pic-2", photoActivityId: "mock-photo-act-1", userId: "mock-user-001", url: "", width: 1080, height: 1920, fileName: "mock-2.jpg", fileSize: 204800, fileTime: "2026-07-31 15:02:00", showStatus: E(1, "显示"), likeCount: 5 },
  { id: "mock-pic-3", photoActivityId: "mock-photo-act-1", userId: "mock-user-001", url: "", width: 1080, height: 1920, fileName: "mock-3.jpg", fileSize: 153600, fileTime: "2026-07-31 15:03:00", showStatus: E(1, "显示"), likeCount: 0 }
]);
const liveGameList = ok([
  { id: "mock-live-1", recordId: "mock-rec-live-1", type: E(1, "直播"), appName: "mock", streamName: "mock-stream-1", name: "1号机位", status: E(1, "直播中"), cover: "", publish: "rtmp://mock/live/mock-stream-1", liveRtmp: "rtmp://mock/live/mock-stream-1", liveFlv: "http://mock/live/mock-stream-1.flv", liveM3u8: "http://mock/live/mock-stream-1.m3u8" }
]);
const versionCheckResult = ok({
  id: "mock-ver-1",
  deviceType: E(1, "android"),
  url: "",
  upgradeType: E(0, "可选"),
  remark: "【MOCK】当前已是最新版本（测试数据）",
  packageSize: "0",
  versionCode: 0,
  versionName: "2.8.4",
  notice: E(0, "不提醒")
});
const RULES = [
  /* ----- 登录 ----- */
  { method: "POST", url: "sms/login", handler: () => ok(null, "【MOCK】验证码已发送(测试码:1234)") },
  { method: "POST", url: "user/login", handler: () => ok(IDS.token, "【MOCK】登录成功") },
  { method: "GET", url: "user/info", handler: () => ok(userInfo) },
  /* ----- 比赛列表（篮球 / 足球，按 query.status 区分未结束/已结束）----- */
  { method: "GET", url: "game/list-my-manage", handler: (o) => matchList("basketball", o.query && o.query.status) },
  { method: "GET", url: "soccer/game/list-my-manage", handler: (o) => matchList("football", o.query && o.query.status) },
  /* ----- 比赛详情 / 连接信息 ----- */
  { method: "GET", url: "ts/game/info", handler: () => connectInfo },
  { method: "GET", url: "game//info", handler: () => connectInfo },
  { method: "GET", url: "soccer/game//info", handler: () => connectInfo },
  { method: "GET", url: "game/{gameId}/detail", handler: () => gameDetail },
  { method: "GET", url: "soccer/game/{gameId}/detail", handler: () => gameDetail },
  { method: "GET", url: "game/{gameId}/foot-detail", handler: () => footDetail },
  { method: "GET", url: "statistics/game-detail-basketball", handler: () => basketDetail },
  /* ----- 小节 / 球员 ----- */
  { method: "GET", url: "statistics/section/list", handler: (o) => sectionList(o.query) },
  { method: "GET", url: "statistics/member/list", handler: (o) => memberList(o.query) },
  /* ----- 统计记录 ----- */
  { method: "GET", url: "statistics/page", handler: () => recordList },
  /* ----- 优肯周赛况 ----- */
  { method: "GET", url: "game/list-week", handler: () => weekList },
  /* ----- 拍照 / 相册 ----- */
  { method: "GET", url: "photo/activity/list-my-manage", handler: () => photoActivityList },
  { method: "GET", url: "photo/activity/create-game", handler: () => ok("mock-photo-act-new", "【MOCK】活动创建成功") },
  { method: "GET", url: "photo/picture/upload-list", handler: () => uploadPhotoList },
  /* ----- 直播 ----- */
  { method: "GET", url: "live/stream/game-list", handler: () => liveGameList },
  { method: "POST", url: "live/stream/game", handler: () => ok(liveGameList.data[0], "【MOCK】获取直播地址成功") },
  { method: "POST", url: "live/stream/game-add", handler: () => ok("mock-live-new", "【MOCK】直播添加成功") },
  { method: "POST", url: "live/stream/compose", handler: () => ok(null, "【MOCK】合成回放请求已提交") },
  /* ----- 版本检查 ----- */
  { method: "GET", url: "sys/app-version/check", handler: () => versionCheckResult },
  /* ----- 写操作：统一返回成功（mock 不真实落库）----- */
  { method: "POST", url: "ts/game/update-info", handler: () => ok(null, "【MOCK】保存成功") },
  { method: "POST", url: "game/status", handler: () => ok(null, "【MOCK】状态修改成功") },
  { method: "POST", url: "soccer/game/status", handler: () => ok(null, "【MOCK】状态修改成功") },
  { method: "POST", url: "statistics/member/sign", handler: () => ok(null, "【MOCK】签到成功") },
  { method: "POST", url: "statistics/member/sign-cancel", handler: () => ok(null, "【MOCK】取消签到成功") },
  { method: "POST", url: "statistics/member/starting-lineup", handler: () => ok(null, "【MOCK】设置首发成功") },
  { method: "POST", url: "statistics/member/starting-lineup-cancel", handler: () => ok(null, "【MOCK】取消首发成功") },
  { method: "POST", url: "statistics/member/temporary", handler: () => ok("mock-member-new", "【MOCK】添加临时球员成功") },
  { method: "POST", url: "statistics/member/edit-position", handler: () => ok(null, "【MOCK】位置修改成功") },
  { method: "GET", url: "statistics/member/delete-temporary", handler: () => ok(null, "【MOCK】删除球员成功") },
  { method: "POST", url: "statistics/add", handler: () => ok(null, "【MOCK】统计提交成功") },
  { method: "POST", url: "statistics/add-all", handler: () => ok(null, "【MOCK】批量统计提交成功") },
  { method: "POST", url: "statistics/cancel", handler: () => ok(null, "【MOCK】取消记录成功") },
  { method: "POST", url: "statistics/section/running", handler: () => ok(null, "【MOCK】小节状态切换成功") }
];
function matchUrl(template, realUrl) {
  const re = new RegExp("^" + template.replace(/\{[^}]+\}/g, "([^/]+)") + "$");
  return re.test(realUrl);
}
function mockResolve(options) {
  const { url, method = "GET" } = options;
  const m = method.toUpperCase();
  for (const rule of RULES) {
    if (rule.method !== m)
      continue;
    if (!matchUrl(rule.url, url))
      continue;
    return rule.handler(options);
  }
  formatAppLog("warn", "at mock/mock-data.js:536", `%c【MOCK】未匹配到静态数据，走真实请求：${m} ${url}`, "color:#f56c6c");
  return null;
}
function request(options) {
  const {
    url,
    method = "GET",
    path,
    query,
    data,
    header = {},
    hideError = false,
    loading = false
  } = options;
  let finalUrl = config.baseUrl + url;
  const mocked = mockResolve(options);
  if (mocked !== null) {
    if (loading)
      uni.showLoading({ title: typeof loading === "string" ? loading : "加载中", mask: true });
    formatAppLog("log", "at api/request.js:51", "%c【MOCK】" + method.toUpperCase() + " " + url, "color:#e6a23c;font-weight:bold", mocked);
    return new Promise((resolve) => {
      setTimeout(() => {
        if (loading)
          uni.hideLoading();
        resolve(mocked);
      }, 300);
    });
  }
  if (path) {
    Object.keys(path).forEach((k) => {
      finalUrl = finalUrl.replace(`{${k}}`, encodeURIComponent(path[k]));
    });
  }
  if (query && Object.keys(query).length) {
    const qs = Object.keys(query).filter((k) => query[k] !== void 0 && query[k] !== null && query[k] !== "").map((k) => `${k}=${encodeURIComponent(query[k])}`).join("&");
    if (qs)
      finalUrl += (finalUrl.includes("?") ? "&" : "?") + qs;
  }
  if (loading) {
    uni.showLoading({ title: typeof loading === "string" ? loading : "加载中", mask: true });
  }
  return new Promise((resolve, reject) => {
    uni.request({
      url: finalUrl,
      method,
      data: method.toUpperCase() === "GET" ? void 0 : data,
      header: {
        "content-type": "application/json",
        // token 注入（对应 GlobalHttpHandlerImpl.onHttpRequestBefore）
        token: getToken(),
        ...header
      },
      success: (res) => {
        if (loading)
          uni.hideLoading();
        const body = res.data;
        if (res.statusCode < 200 || res.statusCode >= 300) {
          if (!hideError) {
            uni.showToast({ title: `请求失败(${res.statusCode})`, icon: "none" });
          }
          reject(body || res);
          return;
        }
        if (body && config.tokenExpiredCodes.includes(body.code)) {
          clearAuth();
          uni.reLaunch({ url: "/pages/login/index" });
          reject(body);
          return;
        }
        resolve(body);
      },
      fail: (err) => {
        if (loading)
          uni.hideLoading();
        if (!hideError) {
          uni.showToast({ title: "网络连接失败，请检查网络", icon: "none" });
        }
        reject(err);
      }
    });
  });
}
const getGameDetail = (gameId, sport = SportType.BASKETBALL) => request({ url: `${sportPrefix(sport)}game/{gameId}/detail`, path: { gameId } });
const compose = (params) => request({ url: "live/stream/compose", method: "POST", data: params });
const _imports_0 = "/static/mipmap-xxhdpi/watermark.png";
const _style_0 = { "live-push": { "": { "flex": 1, "backgroundColor": "#000000" } }, "pusher": { "": { "position": "absolute", "top": 0, "left": 0, "right": 0, "bottom": 0 } }, "overlay": { "": { "position": "absolute", "top": 0, "left": 0, "right": 0, "bottom": 0 } }, "top": { "": { "position": "absolute", "top": 0, "left": 0, "right": 0, "flexDirection": "row", "alignItems": "center", "paddingTop": "16rpx", "paddingRight": "20rpx", "paddingBottom": "16rpx", "paddingLeft": "20rpx" } }, "status": { "": { "flex": 1, "textAlign": "center", "color": "#ffffff", "fontSize": "16rpx" } }, "bottom": { "": { "position": "absolute", "bottom": 0, "left": 0, "flexDirection": "column", "alignItems": "flex-start", "paddingTop": "30rpx", "paddingRight": "30rpx", "paddingBottom": "30rpx", "paddingLeft": "30rpx" } }, "bottom-row": { "": { "flexDirection": "row", "marginBottom": "24rpx" } }, "gray-btn": { "": { "paddingTop": "5rpx", "paddingRight": "13rpx", "paddingBottom": "5rpx", "paddingLeft": "13rpx", "backgroundColor": "rgba(0,0,0,0.06)", "color": "#ffffff", "fontSize": "16rpx", "lineHeight": "27rpx", "marginRight": "11rpx" } }, "preview-layer": { "": { "position": "absolute", "top": 0, "left": 0, "right": 0, "bottom": 0 } }, "pv-top-left": { "": { "position": "absolute", "top": "24rpx", "left": "24rpx", "flexDirection": "row", "alignItems": "center" } }, "pv-league-logo": { "": { "width": "36rpx", "height": "36rpx", "borderRadius": "18rpx", "marginRight": "10rpx" } }, "pv-league-name": { "": { "fontSize": "20rpx", "color": "#ffffff", "paddingTop": "2rpx", "paddingRight": "10rpx", "paddingBottom": "2rpx", "paddingLeft": "10rpx", "backgroundColor": "rgba(0,0,0,0.4)", "borderRadius": "4rpx" } }, "pv-watermark-clip": { "": { "position": "absolute", "top": "64rpx", "right": "24rpx", "width": "57.6rpx", "height": "19rpx", "overflow": "hidden", "alignItems": "flex-start" } }, "pv-watermark-img": { "": { "width": "120rpx", "height": "19rpx" } }, "pv-scorebar-wrap": { "": { "position": "absolute", "bottom": "56rpx", "left": 0, "right": 0, "alignItems": "center" } }, "pv-scorebar": { "": { "flexDirection": "row", "alignItems": "center", "paddingTop": "5rpx", "paddingRight": "12rpx", "paddingBottom": "5rpx", "paddingLeft": "12rpx", "backgroundColor": "rgba(0,0,0,0.55)", "borderRadius": "6rpx" } }, "pv-team-logo": { "": { "width": "30rpx", "height": "30rpx", "borderRadius": "15rpx" } }, "pv-name-box": { "": { "width": "90rpx", "alignItems": "center", "marginTop": 0, "marginRight": "8rpx", "marginBottom": 0, "marginLeft": "8rpx" } }, "pv-team-name": { "": { "fontSize": "16rpx", "color": "#ffffff", "lines": 1, "textOverflow": "ellipsis" } }, "pv-score-box": { "": { "flexDirection": "row", "alignItems": "center", "marginTop": 0, "marginRight": "12rpx", "marginBottom": 0, "marginLeft": "12rpx" } }, "pv-score": { "": { "fontSize": "26rpx", "color": "#ffffff", "fontWeight": "bold" } }, "pv-colon": { "": { "fontSize": "20rpx", "color": "#ffffff", "marginTop": 0, "marginRight": "6rpx", "marginBottom": 0, "marginLeft": "6rpx" } }, "pv-sub-row": { "": { "flexDirection": "row", "marginTop": "6rpx" } }, "pv-sub-text": { "": { "fontSize": "14rpx", "color": "#ffffff", "marginTop": 0, "marginRight": "8rpx", "marginBottom": 0, "marginLeft": "8rpx" } }, "pv-msg": { "": { "position": "absolute", "bottom": "24rpx", "left": 0, "right": 0, "alignItems": "center" } }, "pv-msg-text": { "": { "fontSize": "20rpx", "color": "#ffffff", "paddingTop": "4rpx", "paddingRight": "24rpx", "paddingBottom": "4rpx", "paddingLeft": "24rpx", "backgroundColor": "rgba(0,0,0,0.5)", "borderRadius": "4rpx" } } };
const _sfc_main = {
  __name: "push",
  setup(__props, { expose: __expose }) {
    __expose();
    const publishUrl = ref("");
    const gameId = ref("");
    const homeName = ref("主队");
    const guestName = ref("客队");
    const homeLogo = ref("");
    const guestLogo = ref("");
    const hostScore = ref(0);
    const guestScore = ref(0);
    const section = ref("");
    const hostFoul = ref(0);
    const guestFoul = ref(0);
    const leagueName = ref("");
    const leagueLogo = ref("");
    const leagueStageName = ref("");
    const msg = ref("");
    const showScore = ref(true);
    const pushing = ref(false);
    const statusText = ref("未连接");
    const pusher = ref(null);
    function logToFile(msg2) {
      try {
        const ts = (/* @__PURE__ */ new Date()).toLocaleString();
        const main = plus.android.runtimeMainActivity();
        const File = plus.android.importClass("java.io.File");
        const FileWriter = plus.android.importClass("java.io.FileWriter");
        const dir = main.getExternalFilesDir(null);
        const f = new File(dir, "push_debug.log");
        const fw = new FileWriter(f, true);
        fw.write(ts + " " + msg2 + "\n");
        fw.close();
      } catch (e) {
        formatAppLog("log", "at pages/live/push.nvue:118", "logToFile err: " + e);
      }
    }
    onLoad((opt) => {
      plus.screen.lockOrientation("landscape-primary");
      publishUrl.value = decodeURIComponent(opt.livepublish || "");
      gameId.value = opt.gameId || "";
      homeName.value = opt.name || "直播";
      formatAppLog("log", "at pages/live/push.nvue:131", "[push] publishUrl=", publishUrl.value, "gameId=", gameId.value);
      logToFile("[push] onLoad url=" + publishUrl.value + " gameId=" + gameId.value + " name=" + opt.name);
      loadGameDetail();
      connectScore();
    });
    function ensurePermissions() {
      return new Promise((resolve) => {
        try {
          plus.android.requestPermissions(
            ["android.permission.CAMERA", "android.permission.RECORD_AUDIO"],
            () => resolve(true),
            () => resolve(false)
          );
        } catch (e) {
          resolve(true);
        }
      });
    }
    onReady(() => {
      ensurePermissions().then((granted) => {
        formatAppLog("log", "at pages/live/push.nvue:159", "[push] permissions granted=", granted, "pusher=", pusher.value);
        logToFile("[push] onReady permissions=" + granted + " pusher=" + (pusher.value ? "yes" : "null"));
        if (!granted) {
          uni.showToast({ title: "需要相机/麦克风权限", icon: "none" });
          logToFile("[push] 权限未授予，无法预览");
          return;
        }
        let tries = 0;
        const tryPreview = () => {
          if (pusher.value) {
            formatAppLog("log", "at pages/live/push.nvue:170", "[push] startPreview 调用");
            logToFile("[push] startPreview 调用，组件已挂载");
            pusher.value.startPreview();
            logToFile("[push] startPreview 调用完成");
            pushScore();
            logToFile("[push] startPreview 后立即 pushScore 一次");
          } else if (tries++ < 20) {
            setTimeout(tryPreview, 100);
          } else {
            formatAppLog("log", "at pages/live/push.nvue:180", "[push] pusher ref 始终为 null -- livepusherview 组件未注册/未挂载");
            logToFile("[push] ✗ pusher ref 始终为 null -- livepusherview 组件未注册/未挂载（插件未打进基座）");
            uni.showToast({ title: "推流组件未加载，请确认插件已打包", icon: "none" });
          }
        };
        setTimeout(tryPreview, 300);
      });
    });
    onUnload(() => {
      stopPush();
      if (pusher.value) {
        try {
          pusher.value.stopPreview();
        } catch (e) {
        }
      }
      closeSocket();
      plus.screen.lockOrientation("portrait-primary");
    });
    function loadGameDetail() {
      getGameDetail(gameId.value, "basketball").then((res) => {
        if (res.code !== 1) {
          logToFile("[push] loadGameDetail code=" + res.code);
          return;
        }
        const page = res.data || {};
        const g = page.game || page;
        if (g.hostTeamName)
          homeName.value = g.hostTeamName;
        if (g.guestTeamName)
          guestName.value = g.guestTeamName;
        if (g.hostTeamLogo)
          homeLogo.value = g.hostTeamLogo;
        if (g.guestTeamLogo)
          guestLogo.value = g.guestTeamLogo;
        hostScore.value = g.hostTeamScore || 0;
        guestScore.value = g.guestTeamScore || 0;
        if (g.leagueName)
          leagueName.value = g.leagueName;
        if (g.leagueLogo)
          leagueLogo.value = g.leagueLogo;
        if (g.leagueStageName)
          leagueStageName.value = g.leagueStageName;
        if (g.hostTeamFoul !== void 0)
          hostFoul.value = g.hostTeamFoul;
        if (g.guestTeamFoul !== void 0)
          guestFoul.value = g.guestTeamFoul;
        logToFile("[push] loadGameDetail OK host=" + homeName.value + " guest=" + guestName.value + " score=" + hostScore.value + ":" + guestScore.value);
        pushScore();
      });
    }
    function connectScore() {
      statusText.value = "比分接口连接中…";
      connectSocket(
        "push",
        (data) => {
          if (data.hostTeamScore !== void 0)
            hostScore.value = data.hostTeamScore;
          if (data.guestTeamScore !== void 0)
            guestScore.value = data.guestTeamScore;
          if (data.section !== void 0)
            section.value = data.section;
          if (data.hostTeamFoul !== void 0)
            hostFoul.value = data.hostTeamFoul;
          if (data.guestTeamFoul !== void 0)
            guestFoul.value = data.guestTeamFoul;
          if (data.msg !== void 0)
            msg.value = data.msg;
          if (data.leagueStageName !== void 0)
            leagueStageName.value = data.leagueStageName;
          pushScore();
        },
        (event) => {
          if (event === "open") {
            statusText.value = "比分接口已连接";
            logToFile("[push] ws open");
          } else if (event === "close")
            statusText.value = "比分接口已断开，重连中…";
          else if (event === "error")
            statusText.value = "比分接口连接失败";
        }
      );
    }
    function reconnectScore() {
      closeSocket();
      connectScore();
    }
    function pushScore() {
      if (!pusher.value) {
        logToFile("[push] pushScore skip: pusher=null");
        return;
      }
      logToFile("[push] updateScore host=" + hostScore.value + " guest=" + guestScore.value + " showScorebar=" + showScore.value);
      pusher.value.updateScore({
        hostName: homeName.value,
        guestName: guestName.value,
        hostScore: String(hostScore.value),
        guestScore: String(guestScore.value),
        section: section.value,
        hostFoul: hostFoul.value,
        guestFoul: guestFoul.value,
        hostLogo: homeLogo.value,
        guestLogo: guestLogo.value,
        leagueName: leagueName.value,
        leagueLogo: leagueLogo.value,
        leagueStageName: leagueStageName.value,
        msg: msg.value,
        showScorebar: showScore.value
      });
    }
    function startPush() {
      if (!publishUrl.value) {
        uni.showToast({ title: "推流地址为空，无法直播", icon: "none" });
        return;
      }
      if (!pusher.value) {
        uni.showToast({ title: "推流组件未就绪", icon: "none" });
        logToFile("[push] startPush 失败：pusher ref null");
        return;
      }
      logToFile("[push] startPush url=" + publishUrl.value);
      pusher.value.startPush(publishUrl.value);
      statusText.value = "推流连接中…";
    }
    function stopPush() {
      if (pusher.value) {
        pusher.value.stopPush();
        pushing.value = false;
        statusText.value = "已结束";
        logToFile("[push] stopPush");
      }
    }
    function switchCamera() {
      if (pusher.value)
        pusher.value.switchCamera();
    }
    function toggleScore() {
      showScore.value = !showScore.value;
      pushScore();
    }
    function onState(e) {
      const d = e.detail || {};
      formatAppLog("log", "at pages/live/push.nvue:316", "[pusher] state", d);
      logToFile("[pusher] state code=" + d.code + " msg=" + d.msg);
      if (d.msg)
        statusText.value = d.msg;
      if (d.code === 1005)
        pushing.value = true;
      else if (d.code === -1305)
        pushing.value = false;
    }
    function onCompose() {
      compose({ gameId: gameId.value }).then((res) => {
        uni.showToast({ title: res.code === 1 ? "已生成回放" : "生成失败", icon: "none" });
      });
    }
    function back() {
      try {
        stopPush();
      } catch (e) {
      }
      if (pusher.value) {
        try {
          pusher.value.stopPreview();
        } catch (e) {
        }
      }
      try {
        closeSocket();
      } catch (e) {
      }
      plus.screen.lockOrientation("portrait-primary");
      uni.navigateBack();
    }
    onBackPress(() => {
      try {
        stopPush();
      } catch (e) {
      }
      if (pusher.value) {
        try {
          pusher.value.stopPreview();
        } catch (e) {
        }
      }
      try {
        closeSocket();
      } catch (e) {
      }
      plus.screen.lockOrientation("portrait-primary");
      return false;
    });
    const __returned__ = { publishUrl, gameId, homeName, guestName, homeLogo, guestLogo, hostScore, guestScore, section, hostFoul, guestFoul, leagueName, leagueLogo, leagueStageName, msg, showScore, pushing, statusText, pusher, logToFile, ensurePermissions, loadGameDetail, connectScore, reconnectScore, pushScore, startPush, stopPush, switchCamera, toggleScore, onState, onCompose, back, ref, get onLoad() {
      return onLoad;
    }, get onReady() {
      return onReady;
    }, get onUnload() {
      return onUnload;
    }, get onBackPress() {
      return onBackPress;
    }, get connectSocket() {
      return connectSocket;
    }, get closeSocket() {
      return closeSocket;
    }, get getGameDetail() {
      return getGameDetail;
    }, get compose() {
      return compose;
    } };
    Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
    return __returned__;
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  const _component_livepusherview = resolveComponent("livepusherview");
  return openBlock(), createElementBlock("scroll-view", {
    scrollY: true,
    showScrollbar: true,
    enableBackToTop: true,
    bubble: "true",
    style: { flexDirection: "column" }
  }, [
    createElementVNode("view", { class: "live-push" }, [
      createVNode(_component_livepusherview, {
        ref: "pusher",
        class: "pusher",
        url: $setup.publishUrl,
        onStatechange: $setup.onState
      }, null, 8, ["url"]),
      createElementVNode("view", { class: "preview-layer" }, [
        createElementVNode("view", { class: "pv-top-left" }, [
          $setup.leagueLogo ? (openBlock(), createElementBlock("u-image", {
            key: 0,
            class: "pv-league-logo",
            src: $setup.leagueLogo,
            mode: "aspectFill"
          }, null, 8, ["src"])) : createCommentVNode("v-if", true),
          createElementVNode(
            "u-text",
            { class: "pv-league-name" },
            toDisplayString($setup.leagueName),
            1
            /* TEXT */
          )
        ]),
        createElementVNode("view", { class: "pv-watermark-clip" }, [
          createElementVNode("u-image", {
            class: "pv-watermark-img",
            src: _imports_0,
            mode: "aspectFit"
          })
        ]),
        $setup.showScore ? (openBlock(), createElementBlock("view", {
          key: 0,
          class: "pv-scorebar-wrap"
        }, [
          createElementVNode("view", { class: "pv-scorebar" }, [
            $setup.homeLogo ? (openBlock(), createElementBlock("u-image", {
              key: 0,
              class: "pv-team-logo",
              src: $setup.homeLogo,
              mode: "aspectFill"
            }, null, 8, ["src"])) : createCommentVNode("v-if", true),
            createElementVNode("view", { class: "pv-name-box" }, [
              createElementVNode(
                "u-text",
                { class: "pv-team-name" },
                toDisplayString($setup.homeName),
                1
                /* TEXT */
              )
            ]),
            createElementVNode("view", { class: "pv-score-box" }, [
              createElementVNode(
                "u-text",
                { class: "pv-score" },
                toDisplayString($setup.hostScore),
                1
                /* TEXT */
              ),
              createElementVNode("u-text", { class: "pv-colon" }, ":"),
              createElementVNode(
                "u-text",
                { class: "pv-score" },
                toDisplayString($setup.guestScore),
                1
                /* TEXT */
              )
            ]),
            createElementVNode("view", { class: "pv-name-box" }, [
              createElementVNode(
                "u-text",
                { class: "pv-team-name" },
                toDisplayString($setup.guestName),
                1
                /* TEXT */
              )
            ]),
            $setup.guestLogo ? (openBlock(), createElementBlock("u-image", {
              key: 1,
              class: "pv-team-logo",
              src: $setup.guestLogo,
              mode: "aspectFill"
            }, null, 8, ["src"])) : createCommentVNode("v-if", true)
          ]),
          createElementVNode("view", { class: "pv-sub-row" }, [
            createElementVNode(
              "u-text",
              { class: "pv-sub-text" },
              toDisplayString($setup.leagueStageName),
              1
              /* TEXT */
            ),
            $setup.section ? (openBlock(), createElementBlock(
              "u-text",
              {
                key: 0,
                class: "pv-sub-text"
              },
              toDisplayString($setup.section),
              1
              /* TEXT */
            )) : createCommentVNode("v-if", true)
          ])
        ])) : createCommentVNode("v-if", true),
        $setup.msg && $setup.msg !== "小节结束" ? (openBlock(), createElementBlock("view", {
          key: 1,
          class: "pv-msg"
        }, [
          createElementVNode(
            "u-text",
            { class: "pv-msg-text" },
            toDisplayString($setup.msg),
            1
            /* TEXT */
          )
        ])) : createCommentVNode("v-if", true)
      ]),
      createElementVNode("view", { class: "overlay" }, [
        createElementVNode("view", { class: "top" }, [
          createElementVNode("u-text", {
            class: "gray-btn",
            onClick: $setup.back
          }, "返回"),
          createElementVNode(
            "u-text",
            { class: "status" },
            toDisplayString($setup.statusText),
            1
            /* TEXT */
          ),
          createElementVNode(
            "u-text",
            {
              class: "gray-btn",
              onClick: $setup.toggleScore
            },
            toDisplayString($setup.showScore ? "隐藏" : "显示") + "比分",
            1
            /* TEXT */
          ),
          createElementVNode("u-text", {
            class: "gray-btn",
            onClick: $setup.reconnectScore
          }, "比分重连")
        ]),
        createElementVNode("view", { class: "bottom" }, [
          createElementVNode("view", { class: "bottom-row" }, [
            createElementVNode("u-text", {
              class: "gray-btn",
              onClick: $setup.startPush
            }, "开始直播"),
            createElementVNode("u-text", {
              class: "gray-btn",
              onClick: $setup.stopPush
            }, "结束直播")
          ]),
          createElementVNode("u-text", {
            class: "gray-btn",
            onClick: $setup.onCompose
          }, "生成回放")
        ])
      ])
    ])
  ]);
}
const push = /* @__PURE__ */ _export_sfc(_sfc_main, [["render", _sfc_render], ["styles", [_style_0]], ["__file", "F:/项目文件/uniapp版本/pages/live/push.nvue"]]);
export {
  push as default
};
