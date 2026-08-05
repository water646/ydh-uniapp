import { f as formatAppLog, _ as _export_sfc, o as onLoad, a as onReady } from "../../_plugin-vue_export-helper.js";
import { ref, getCurrentInstance, onUnmounted, openBlock, createElementBlock, createElementVNode, normalizeStyle, toDisplayString, createCommentVNode } from "vue";
const config = {
  /**
   * ⚠️【MOCK 开关】⚠️
   * true  => 所有请求走 mock/mock-data.js 的静态测试数据（不访问真实后端）
   * false => 走真实后端接口（baseUrl）
   * 测试完毕请改回 false。
   */
  useMock: false,
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
({
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
});
({
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
});
({
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
});
const sections = [
  { id: "mock-sec-1", gameSectionId: "mock-sec-1", name: "第1节", gameId: IDS.gameId, type: E(1, "小节"), sort: 1, groups: "", running: EB(1, "进行中", true) },
  { id: "mock-sec-2", gameSectionId: "mock-sec-2", name: "第2节", gameId: IDS.gameId, type: E(1, "小节"), sort: 2, groups: "", running: EB(0, "未开始", false) },
  { id: "mock-sec-3", gameSectionId: "mock-sec-3", name: "第3节", gameId: IDS.gameId, type: E(1, "小节"), sort: 3, groups: "", running: EB(0, "未开始", false) },
  { id: "mock-sec-4", gameSectionId: "mock-sec-4", name: "第4节", gameId: IDS.gameId, type: E(1, "小节"), sort: 4, groups: "", running: EB(0, "未开始", false) }
];
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
ok({ ...gameDetail.data, type: E(2, "足球"), hostTeamName: "飞虎队", guestTeamName: "雄鹰队", hostTeamScore: 1, guestTeamScore: 1, name: "测试杯-足球半决赛", leagueName: "测试杯" });
ok(sections.map((s) => ({
  id: s.id,
  name: s.name,
  gameId: s.gameId,
  type: s.type,
  sort: s.sort,
  groups: s.groups
})));
function mockResolve(options) {
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
  const mocked = mockResolve();
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
const _imports_0 = "/static/mipmap-xhdpi/new_bifen.png";
const _imports_1 = "/static/watermark.png";
const _style_0 = { "live-push": { "": { "flex": 1, "backgroundColor": "#000000" } }, "pusher": { "": { "flex": 1 } }, "overlay": { "": { "position": "absolute", "transform": "rotate(90deg)", "transformOrigin": "50% 50%" } }, "top": { "": { "position": "absolute", "top": 0, "left": 0, "right": 0, "flexDirection": "row", "alignItems": "center", "paddingTop": "20rpx", "paddingRight": "20rpx", "paddingBottom": "20rpx", "paddingLeft": "20rpx", "height": "80rpx" } }, "back": { "": { "width": "64rpx", "height": "64rpx", "borderRadius": "32rpx", "backgroundColor": "rgba(0,0,0,0.4)", "alignItems": "center", "justifyContent": "center", "marginLeft": "50rpx" } }, "back-icon": { "": { "fontSize": "44rpx", "color": "#ffffff" } }, "status": { "": { "flex": 1, "textAlign": "center", "color": "#ffffff", "fontSize": "24rpx" } }, "reconnect": { "": { "fontSize": "24rpx", "color": "#009de9" } }, "score-overlay": { "": { "position": "absolute", "top": "550rpx", "left": "380rpx", "width": "800rpx", "height": "80rpx" } }, "score-bg": { "": { "position": "absolute", "top": 0, "left": 0, "width": "800rpx", "height": "80rpx" } }, "s-logo": { "": { "position": "absolute", "width": "48rpx", "height": "48rpx", "borderRadius": "24rpx", "top": "14rpx" } }, "s-logo-left": { "": { "left": "13rpx" } }, "s-logo-right": { "": { "right": "13rpx" } }, "s-team": { "": { "position": "absolute", "top": "30rpx", "width": "240rpx", "fontSize": "22rpx", "color": "#ffffff", "textAlign": "center", "lines": 1, "textOverflow": "ellipsis" } }, "s-host": { "": { "left": "32rpx" } }, "s-guest": { "": { "left": "528rpx" } }, "s-score": { "": { "position": "absolute", "top": "22rpx", "width": "128rpx", "fontSize": "40rpx", "color": "#ffffff", "fontWeight": "bold", "textAlign": "center" } }, "s-score-host": { "": { "left": "416rpx" } }, "s-score-guest": { "": { "left": "256rpx" } }, "s-section": { "": { "position": "absolute", "top": "32rpx", "left": "336rpx", "width": "128rpx", "fontSize": "22rpx", "color": "#ffffff", "textAlign": "center" } }, "bottom": { "": { "position": "absolute", "bottom": "0rpx", "paddingTop": 0, "paddingRight": "60rpx", "paddingBottom": 0, "paddingLeft": "60rpx", "left": 0, "right": 0, "flexDirection": "row", "justifyContent": "flex-start", "flexWrap": "wrap", "width": "700rpx" } }, "btn": { "": { "fontSize": "26rpx", "color": "#ffffff", "paddingTop": "16rpx", "paddingRight": "28rpx", "paddingBottom": "16rpx", "paddingLeft": "28rpx", "marginTop": "10rpx", "marginRight": "10rpx", "marginBottom": "10rpx", "marginLeft": "10rpx", "borderRadius": "30rpx", "backgroundColor": "rgba(0,0,0,0.5)" }, ".start": { "backgroundColor": "#29a871" }, ".stop": { "backgroundColor": "#ff2d2d" } }, "top-logo": { "": { "width": "420rpx", "height": "150rpx", "alignSelf": "flex-end", "position": "relative", "top": "20rpx", "right": "20rpx", "transform": "scale(0.5)" } }, "gray-btn": { "": { "width": "170rpx", "height": "90rpx", "backgroundColor": "rgba(0,0,0,0.3)", "borderRadius": "4rpx", "display": "flex", "alignItems": "center", "paddingTop": "30rpx", "paddingRight": "30rpx", "paddingBottom": "30rpx", "paddingLeft": "30rpx", "textAlign": "center", "marginTop": "40rpx", "marginRight": "40rpx", "marginBottom": "40rpx", "marginLeft": "40rpx", "color": "#FFFFFF", "fontSize": "28rpx" } }, "top-btn": { "": { "position": "relative", "right": "300rpx" } } };
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
    const showScore = ref(true);
    const pushing = ref(false);
    const statusText = ref("未连接");
    let pusherCtx = null;
    const instance = getCurrentInstance();
    const overlayStyle = (() => {
      let h = 1334;
      try {
        const info = uni.getSystemInfoSync();
        if (info.windowWidth && info.windowHeight) {
          h = Math.round(750 * info.windowHeight / info.windowWidth);
        }
      } catch (e) {
      }
      return {
        width: h + "rpx",
        height: "750rpx",
        left: (750 - h) / 2 + "rpx",
        top: (h - 750) / 2 + "rpx"
      };
    })();
    function getPusherCtx() {
      if (!pusherCtx) {
        pusherCtx = uni.createLivePusherContext("pusher", instance && instance.proxy);
      }
      return pusherCtx;
    }
    onLoad((opt) => {
      plus.screen.lockOrientation("portrait-primary");
      publishUrl.value = decodeURIComponent(opt.livepublish || "");
      gameId.value = opt.gameId || "";
      homeName.value = opt.name || "直播";
      formatAppLog("log", "at pages/live/push.nvue:121", "[push] publishUrl=", publishUrl.value, "gameId=", gameId.value);
      formatAppLog("log", "at pages/live/push.nvue:122", opt);
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
    function startPreview() {
      const ctx = getPusherCtx();
      if (!ctx) {
        formatAppLog("log", "at pages/live/push.nvue:152", "[pusher] createLivePusherContext 失败，组件未挂载");
        return;
      }
      ctx.startPreview({
        success: () => formatAppLog("log", "at pages/live/push.nvue:156", "[pusher] 预览已开启"),
        fail: (err) => {
          formatAppLog("log", "at pages/live/push.nvue:158", "[pusher] 预览开启失败", err);
          uni.showToast({ title: "摄像头开启失败，请检查权限", icon: "none" });
        }
      });
    }
    onReady(() => {
      ensurePermissions().then(() => {
        setTimeout(startPreview, 200);
      });
    });
    onUnmounted(() => {
      stopPush();
      if (pusherCtx) {
        try {
          pusherCtx.stopPreview();
        } catch (e) {
        }
      }
      closeSocket();
      plus.screen.unlockOrientation();
    });
    function loadGameDetail() {
      getGameDetail(gameId.value, "basketball").then((res) => {
        if (res.code !== 1)
          return;
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
        },
        (event) => {
          if (event === "open")
            statusText.value = "比分接口已连接";
          else if (event === "close")
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
    function startPush() {
      if (!publishUrl.value) {
        uni.showToast({ title: "推流地址为空，无法直播", icon: "none" });
        return;
      }
      const ctx = getPusherCtx();
      if (!ctx) {
        uni.showToast({ title: "推流组件未就绪", icon: "none" });
        return;
      }
      ctx.start({
        success: () => {
          pushing.value = true;
          statusText.value = "直播中";
        },
        fail: () => {
          uni.showToast({ title: "推流失败", icon: "none" });
        }
      });
    }
    function stopPush() {
      if (pusherCtx) {
        pusherCtx.stop();
        pushing.value = false;
        statusText.value = "已结束";
      }
    }
    function switchCamera() {
      if (pusherCtx)
        pusherCtx.switchCamera();
    }
    function toggleScore() {
      showScore.value = !showScore.value;
    }
    function onState(e) {
      formatAppLog("log", "at pages/live/push.nvue:260", "[pusher] state", e.detail);
    }
    function onError(e) {
      formatAppLog("log", "at pages/live/push.nvue:264", "[pusher] error", e.detail);
      uni.showToast({ title: "推流错误", icon: "none" });
    }
    function onCompose() {
      compose({ gameId: gameId.value }).then((res) => {
        uni.showToast({ title: res.code === 1 ? "已生成回放" : "生成失败", icon: "none" });
      });
    }
    function back() {
      uni.navigateBack();
    }
    const __returned__ = { publishUrl, gameId, homeName, guestName, homeLogo, guestLogo, hostScore, guestScore, section, showScore, pushing, statusText, get pusherCtx() {
      return pusherCtx;
    }, set pusherCtx(v) {
      pusherCtx = v;
    }, instance, overlayStyle, getPusherCtx, ensurePermissions, startPreview, loadGameDetail, connectScore, reconnectScore, startPush, stopPush, switchCamera, toggleScore, onState, onError, onCompose, back, ref, onUnmounted, getCurrentInstance, get onLoad() {
      return onLoad;
    }, get onReady() {
      return onReady;
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
  return openBlock(), createElementBlock("scroll-view", {
    scrollY: true,
    showScrollbar: true,
    enableBackToTop: true,
    bubble: "true",
    style: { flexDirection: "column" }
  }, [
    createElementVNode("view", { class: "live-push" }, [
      createElementVNode("live-pusher", {
        id: "pusher",
        class: "pusher",
        url: $setup.publishUrl,
        mode: "FHD",
        enableCamera: true,
        autoFocus: true,
        beauty: 0,
        muted: false,
        devicePosition: "back",
        onStatechange: $setup.onState,
        onError: $setup.onError
      }, null, 40, ["url"]),
      createElementVNode(
        "view",
        {
          class: "overlay",
          style: normalizeStyle($setup.overlayStyle)
        },
        [
          createElementVNode("view", { class: "top" }, [
            createElementVNode("view", { onClick: $setup.back }, [
              createElementVNode("u-text", { class: "gray-btn" }, "返回")
            ]),
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
                class: "gray-btn top-btn",
                onClick: $setup.toggleScore
              },
              toDisplayString($setup.showScore ? "隐藏" : "显示") + "比分",
              1
              /* TEXT */
            ),
            createElementVNode("u-text", {
              class: "reconnect",
              onClick: $setup.reconnectScore
            }, "比分重连")
          ]),
          $setup.showScore ? (openBlock(), createElementBlock("view", {
            key: 0,
            class: "score-overlay"
          }, [
            createElementVNode("u-image", {
              class: "score-bg",
              src: _imports_0
            }),
            $setup.homeLogo ? (openBlock(), createElementBlock("u-image", {
              key: 0,
              class: "s-logo s-logo-left",
              mode: "aspectFill",
              src: $setup.homeLogo
            }, null, 8, ["src"])) : createCommentVNode("v-if", true),
            $setup.guestLogo ? (openBlock(), createElementBlock("u-image", {
              key: 1,
              class: "s-logo s-logo-right",
              mode: "aspectFill",
              src: $setup.guestLogo
            }, null, 8, ["src"])) : createCommentVNode("v-if", true),
            createElementVNode(
              "u-text",
              { class: "s-team s-host" },
              toDisplayString($setup.homeName),
              1
              /* TEXT */
            ),
            createElementVNode(
              "u-text",
              { class: "s-score s-score-host" },
              toDisplayString($setup.hostScore),
              1
              /* TEXT */
            ),
            createElementVNode(
              "u-text",
              { class: "s-section" },
              toDisplayString($setup.section),
              1
              /* TEXT */
            ),
            createElementVNode(
              "u-text",
              { class: "s-score s-score-guest" },
              toDisplayString($setup.guestScore),
              1
              /* TEXT */
            ),
            createElementVNode(
              "u-text",
              { class: "s-team s-guest" },
              toDisplayString($setup.guestName),
              1
              /* TEXT */
            )
          ])) : createCommentVNode("v-if", true),
          createElementVNode("u-image", {
            class: "top-logo",
            mode: "left",
            src: _imports_1
          }),
          createElementVNode("view", { class: "bottom" }, [
            !$setup.pushing ? (openBlock(), createElementBlock("u-text", {
              key: 0,
              class: "gray-btn start",
              onClick: $setup.startPush
            }, "开始直播")) : createCommentVNode("v-if", true),
            createElementVNode("u-text", {
              class: "gray-btn stop",
              onClick: $setup.stopPush
            }, "结束直播"),
            createElementVNode("u-text", {
              class: "gray-btn",
              onClick: $setup.onCompose
            }, "生成回放")
          ])
        ],
        4
        /* STYLE */
      )
    ])
  ]);
}
const push = /* @__PURE__ */ _export_sfc(_sfc_main, [["render", _sfc_render], ["styles", [_style_0]], ["__file", "F:/项目文件/uniapp版本/pages/live/push.nvue"]]);
export {
  push as default
};
