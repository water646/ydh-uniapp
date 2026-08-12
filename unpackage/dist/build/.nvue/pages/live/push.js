import { f as formatAppLog, _ as _export_sfc, o as onLoad, a as onReady, b as onUnload, c as onBackPress } from "../../_plugin-vue_export-helper.js";
import { ref, resolveComponent, openBlock, createElementBlock, createElementVNode, createVNode, toDisplayString } from "vue";
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
const _style_0 = { "live-push": { "": { "flex": 1, "backgroundColor": "#000000" } }, "pusher": { "": { "position": "absolute", "top": 0, "left": 0, "right": 0, "bottom": 0 } }, "overlay": { "": { "position": "absolute", "top": 0, "left": 0, "right": 0, "bottom": 0 } }, "top": { "": { "position": "absolute", "top": 0, "left": 0, "right": 0, "flexDirection": "row", "alignItems": "center", "paddingTop": "16rpx", "paddingRight": "20rpx", "paddingBottom": "16rpx", "paddingLeft": "20rpx" } }, "status": { "": { "flex": 1, "textAlign": "center", "color": "#ffffff", "fontSize": "24rpx" } }, "bottom": { "": { "position": "absolute", "bottom": 0, "left": 0, "flexDirection": "column", "alignItems": "flex-start", "paddingTop": "20rpx", "paddingRight": "20rpx", "paddingBottom": "20rpx", "paddingLeft": "20rpx" } }, "bottom-row": { "": { "flexDirection": "row", "marginBottom": "12rpx" } }, "gray-btn": { "": { "paddingTop": "8rpx", "paddingRight": "20rpx", "paddingBottom": "8rpx", "paddingLeft": "20rpx", "backgroundColor": "rgba(0,0,0,0.06)", "color": "#ffffff", "fontSize": "24rpx", "lineHeight": "40rpx", "marginRight": "16rpx" } } };
const _sfc_main = {
  __name: "push",
  setup(__props) {
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
        formatAppLog("log", "at pages/live/push.nvue:79", "logToFile err: " + e);
      }
    }
    onLoad((opt) => {
      plus.screen.lockOrientation("landscape-primary");
      publishUrl.value = decodeURIComponent(opt.livepublish || "");
      gameId.value = opt.gameId || "";
      homeName.value = opt.name || "直播";
      formatAppLog("log", "at pages/live/push.nvue:92", "[push] publishUrl=", publishUrl.value, "gameId=", gameId.value);
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
        formatAppLog("log", "at pages/live/push.nvue:120", "[push] permissions granted=", granted, "pusher=", pusher.value);
        logToFile("[push] onReady permissions=" + granted + " pusher=" + (pusher.value ? "yes" : "null"));
        if (!granted) {
          uni.showToast({ title: "需要相机/麦克风权限", icon: "none" });
          logToFile("[push] 权限未授予，无法预览");
          return;
        }
        let tries = 0;
        const tryPreview = () => {
          if (pusher.value) {
            formatAppLog("log", "at pages/live/push.nvue:131", "[push] startPreview 调用");
            logToFile("[push] startPreview 调用，组件已挂载");
            pusher.value.startPreview();
            logToFile("[push] startPreview 调用完成");
            pushScore();
            logToFile("[push] startPreview 后立即 pushScore 一次");
          } else if (tries++ < 20) {
            setTimeout(tryPreview, 100);
          } else {
            formatAppLog("log", "at pages/live/push.nvue:141", "[push] pusher ref 始终为 null -- livepusherview 组件未注册/未挂载");
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
      if (!pusher.value || !showScore.value) {
        logToFile("[push] pushScore skip: pusher=" + (pusher.value ? "yes" : "null") + " show=" + showScore.value);
        return;
      }
      logToFile("[push] updateScore host=" + hostScore.value + " guest=" + guestScore.value);
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
        msg: msg.value
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
    function toggleScore() {
      showScore.value = !showScore.value;
      if (showScore.value) {
        pushScore();
      } else if (pusher.value) {
        pusher.value.hideScore();
      }
    }
    function onState(e) {
      const d = e.detail || {};
      formatAppLog("log", "at pages/live/push.nvue:278", "[pusher] state", d);
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
    return (_ctx, _cache) => {
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
            ref_key: "pusher",
            ref: pusher,
            class: "pusher",
            url: publishUrl.value,
            onStatechange: onState
          }, null, 8, ["url"]),
          createElementVNode("view", { class: "overlay" }, [
            createElementVNode("view", { class: "top" }, [
              createElementVNode("u-text", {
                class: "gray-btn",
                onClick: back
              }, "返回"),
              createElementVNode("u-text", { class: "status" }, toDisplayString(statusText.value), 1),
              createElementVNode("u-text", {
                class: "gray-btn",
                onClick: toggleScore
              }, toDisplayString(showScore.value ? "隐藏" : "显示") + "比分", 1),
              createElementVNode("u-text", {
                class: "gray-btn",
                onClick: reconnectScore
              }, "比分重连")
            ]),
            createElementVNode("view", { class: "bottom" }, [
              createElementVNode("view", { class: "bottom-row" }, [
                createElementVNode("u-text", {
                  class: "gray-btn",
                  onClick: startPush
                }, "开始直播"),
                createElementVNode("u-text", {
                  class: "gray-btn",
                  onClick: stopPush
                }, "结束直播")
              ]),
              createElementVNode("u-text", {
                class: "gray-btn",
                onClick: onCompose
              }, "生成回放")
            ])
          ])
        ])
      ]);
    };
  }
};
const push = /* @__PURE__ */ _export_sfc(_sfc_main, [["styles", [_style_0]]]);
export {
  push as default
};
