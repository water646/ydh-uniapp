"use weex:vue";

if (typeof Promise !== 'undefined' && !Promise.prototype.finally) {
  Promise.prototype.finally = function(callback) {
    const promise = this.constructor
    return this.then(
      value => promise.resolve(callback()).then(() => value),
      reason => promise.resolve(callback()).then(() => {
        throw reason
      })
    )
  }
};

if (typeof uni !== 'undefined' && uni && uni.requireGlobal) {
  const global = uni.requireGlobal()
  ArrayBuffer = global.ArrayBuffer
  Int8Array = global.Int8Array
  Uint8Array = global.Uint8Array
  Uint8ClampedArray = global.Uint8ClampedArray
  Int16Array = global.Int16Array
  Uint16Array = global.Uint16Array
  Int32Array = global.Int32Array
  Uint32Array = global.Uint32Array
  Float32Array = global.Float32Array
  Float64Array = global.Float64Array
  BigInt64Array = global.BigInt64Array
  BigUint64Array = global.BigUint64Array
};


(() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __commonJS = (cb, mod) => function __require() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
    // If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
    mod
  ));

  // vue-ns:vue
  var require_vue = __commonJS({
    "vue-ns:vue"(exports, module) {
      module.exports = Vue;
    }
  });

  // F:/项目文件/uniapp版本/unpackage/dist/dev/.nvue/_plugin-vue_export-helper.js
  var import_vue = __toESM(require_vue());
  var ON_SHOW = "onShow";
  var ON_HIDE = "onHide";
  var ON_LOAD = "onLoad";
  var ON_READY = "onReady";
  var ON_UNLOAD = "onUnload";
  var ON_BACK_PRESS = "onBackPress";
  function formatAppLog(type, filename, ...args) {
    if (uni.__log__) {
      uni.__log__(type, filename, ...args);
    } else {
      console[type].apply(console, [...args, filename]);
    }
  }
  var createLifeCycleHook = (lifecycle, flag = 0) => (hook, target = (0, import_vue.getCurrentInstance)()) => {
    !import_vue.isInSSRComponentSetup && (0, import_vue.injectHook)(lifecycle, hook, target);
  };
  var onShow = /* @__PURE__ */ createLifeCycleHook(
    ON_SHOW,
    1 | 2
    /* HookFlags.PAGE */
  );
  var onHide = /* @__PURE__ */ createLifeCycleHook(
    ON_HIDE,
    1 | 2
    /* HookFlags.PAGE */
  );
  var onLoad = /* @__PURE__ */ createLifeCycleHook(
    ON_LOAD,
    2
    /* HookFlags.PAGE */
  );
  var onReady = /* @__PURE__ */ createLifeCycleHook(
    ON_READY,
    2
    /* HookFlags.PAGE */
  );
  var onUnload = /* @__PURE__ */ createLifeCycleHook(
    ON_UNLOAD,
    2
    /* HookFlags.PAGE */
  );
  var onBackPress = /* @__PURE__ */ createLifeCycleHook(
    ON_BACK_PRESS,
    2
    /* HookFlags.PAGE */
  );
  var _export_sfc = (sfc, props) => {
    const target = sfc.__vccOpts || sfc;
    for (const [key, val] of props) {
      target[key] = val;
    }
    return target;
  };

  // F:/项目文件/uniapp版本/unpackage/dist/dev/.nvue/pages/live/push.js
  var import_vue2 = __toESM(require_vue());
  var config = {
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
  var SportType = {
    BASKETBALL: "basketball",
    FOOTBALL: "football"
  };
  function sportPrefix(sport) {
    return sport === SportType.FOOTBALL ? "soccer/" : "";
  }
  var KEY_TOKEN = "auth_token";
  var KEY_USER_ID = "auth_user_id";
  function getToken() {
    return uni.getStorageSync(KEY_TOKEN) || "";
  }
  function clearAuth() {
    uni.removeStorageSync(KEY_TOKEN);
    uni.removeStorageSync(KEY_USER_ID);
  }
  var socketTask = null;
  var reconnectTimer = null;
  var messageCallback = null;
  var statusCallback = null;
  var closedByUser = false;
  var currentGroup = "";
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
      formatAppLog("log", "at utils/websocket.js:40", "WebSocket \u5DF2\u8FDE\u63A5", group, url);
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
      formatAppLog("log", "at utils/websocket.js:64", "WebSocket \u5173\u95ED", group);
      statusCallback && statusCallback("close");
      if (!closedByUser) {
        reconnectTimer = setTimeout(() => {
          connectSocket(currentGroup, messageCallback, statusCallback);
        }, 3e3);
      }
    });
    socketTask.onError(() => {
      formatAppLog("log", "at utils/websocket.js:75", "WebSocket \u9519\u8BEF", group, url);
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
  var E = (value, desc) => ({ value, desc });
  var EB = (value, desc, boolean) => ({ value, desc, boolean });
  var ok = (data, msg = "ok") => ({ status: 1, code: 1, msg, data });
  var IDS = {
    gameId: "mock-game-001",
    game2: "mock-game-002",
    game3: "mock-game-003",
    footGame: "mock-foot-game-001",
    hostTeamId: "mock-host-team-001",
    guestTeamId: "mock-guest-team-001",
    leagueId: "mock-league-001",
    token: "mock-token-test-001"
  };
  var basketGame1 = {
    id: IDS.gameId,
    name: "\u6D4B\u8BD5\u8054\u8D5B-\u7EA2\u84DD\u5927\u6218",
    status: E(2, "\u8FDB\u884C\u4E2D"),
    videoStatus: E(0, "\u672A\u76F4\u64AD"),
    runStatus: E(2, "\u8FDB\u884C\u4E2D"),
    type: E(1, "\u7BEE\u7403"),
    event: E(1, "\u8054\u8D5B"),
    time: "2026-07-31 15:00",
    venueId: "mock-venue-1",
    leagueGroupId: "mock-lg-1",
    leagueStageId: "mock-ls-1",
    hostTeamId: "ht1",
    hostGameTeamId: IDS.hostTeamId,
    hostTeamName: "\u7EA2\u961F",
    hostTeamLogo: "https://img95.699pic.com/photo/60017/5478.jpg_wh860.jpg",
    hostTeamScore: 28,
    guestTeamId: "gt2",
    guestGameTeamId: IDS.guestTeamId,
    guestTeamName: "\u84DD\u961F",
    guestTeamLogo: "",
    guestTeamScore: 24,
    leagueGroupName: "A\u7EC4",
    leagueStageName: "\u5C0F\u7EC4\u8D5B",
    leagueId: IDS.leagueId,
    leagueLogo: "",
    leagueName: "\u6D4B\u8BD5\u8054\u8D5B",
    venueName: "1\u53F7\u573A\u5730",
    isMedia: EB(1, "\u662F", true)
  };
  __spreadProps(__spreadValues({}, basketGame1), {
    id: IDS.game2,
    name: "\u6D4B\u8BD5\u8054\u8D5B-\u7EFF\u9EC4\u4E4B\u6218",
    status: E(1, "\u672A\u5F00\u59CB"),
    runStatus: E(1, "\u672A\u5F00\u59CB"),
    time: "2026-07-31 18:00",
    hostTeamName: "\u7EFF\u961F",
    guestTeamName: "\u9EC4\u961F",
    hostTeamScore: 0,
    guestTeamScore: 0,
    hostGameTeamId: "mock-host-team-002",
    guestGameTeamId: "mock-guest-team-002"
  });
  __spreadProps(__spreadValues({}, basketGame1), {
    id: IDS.game3,
    name: "\u6D4B\u8BD5\u8054\u8D5B-\u9752\u7D2B\u4E4B\u6218",
    status: E(3, "\u5DF2\u7ED3\u675F"),
    runStatus: E(3, "\u5DF2\u7ED3\u675F"),
    videoStatus: E(2, "\u5DF2\u7ED3\u675F"),
    time: "2026-07-30 15:00",
    hostTeamName: "\u9752\u961F",
    guestTeamName: "\u7D2B\u961F",
    hostTeamScore: 56,
    guestTeamScore: 49,
    hostGameTeamId: "mock-host-team-003",
    guestGameTeamId: "mock-guest-team-003"
  });
  __spreadProps(__spreadValues({}, basketGame1), {
    id: IDS.footGame,
    name: "\u6D4B\u8BD5\u676F-\u8DB3\u7403\u534A\u51B3\u8D5B",
    type: E(2, "\u8DB3\u7403"),
    event: E(2, "\u676F\u8D5B"),
    hostTeamName: "\u98DE\u864E\u961F",
    guestTeamName: "\u96C4\u9E70\u961F",
    hostTeamScore: 1,
    guestTeamScore: 1,
    hostGameTeamId: "mock-foot-host-001",
    guestGameTeamId: "mock-foot-guest-001",
    leagueName: "\u6D4B\u8BD5\u676F"
  });
  var gameDetail = ok({
    id: IDS.gameId,
    section: "1",
    logo: "",
    name: "\u6D4B\u8BD5\u8054\u8D5B-\u7EA2\u84DD\u5927\u6218",
    status: E(2, "\u8FDB\u884C\u4E2D"),
    runStatus: E(2, "\u8FDB\u884C\u4E2D"),
    type: E(1, "\u7BEE\u7403"),
    time: "2026-07-31 15:00",
    venueId: "mock-venue-1",
    leagueEventGroupId: "mock-lg-1",
    leagueId: IDS.leagueId,
    hostTeamId: "ht1",
    hostGameTeamId: IDS.hostTeamId,
    hostTeamName: "\u7EA2\u961F",
    hostTeamLogo: "",
    hostTeamScore: 28,
    guestTeamId: "gt2",
    guestGameTeamId: IDS.guestTeamId,
    guestTeamName: "\u84DD\u961F",
    guestTeamLogo: "",
    guestTeamScore: 24,
    leagueEventGroupName: "A\u7EC4",
    leagueEventId: "mock-le-1",
    leagueEventName: "\u5C0F\u7EC4\u8D5B",
    leagueName: "\u6D4B\u8BD5\u8054\u8D5B",
    leagueStageName: "\u5C0F\u7EC4\u8D5B",
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
  ok(__spreadProps(__spreadValues({}, gameDetail.data), { type: E(2, "\u8DB3\u7403"), hostTeamName: "\u98DE\u864E\u961F", guestTeamName: "\u96C4\u9E70\u961F", hostTeamScore: 1, guestTeamScore: 1, name: "\u6D4B\u8BD5\u676F-\u8DB3\u7403\u534A\u51B3\u8D5B", leagueName: "\u6D4B\u8BD5\u676F" }));
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
        uni.showLoading({ title: typeof loading === "string" ? loading : "\u52A0\u8F7D\u4E2D", mask: true });
      formatAppLog("log", "at api/request.js:51", "%c\u3010MOCK\u3011" + method.toUpperCase() + " " + url, "color:#e6a23c;font-weight:bold", mocked);
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
      uni.showLoading({ title: typeof loading === "string" ? loading : "\u52A0\u8F7D\u4E2D", mask: true });
    }
    return new Promise((resolve, reject) => {
      uni.request({
        url: finalUrl,
        method,
        data: method.toUpperCase() === "GET" ? void 0 : data,
        header: __spreadValues({
          "content-type": "application/json",
          // token 注入（对应 GlobalHttpHandlerImpl.onHttpRequestBefore）
          token: getToken()
        }, header),
        success: (res) => {
          if (loading)
            uni.hideLoading();
          const body = res.data;
          if (res.statusCode < 200 || res.statusCode >= 300) {
            if (!hideError) {
              uni.showToast({ title: `\u8BF7\u6C42\u5931\u8D25(${res.statusCode})`, icon: "none" });
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
            uni.showToast({ title: "\u7F51\u7EDC\u8FDE\u63A5\u5931\u8D25\uFF0C\u8BF7\u68C0\u67E5\u7F51\u7EDC", icon: "none" });
          }
          reject(err);
        }
      });
    });
  }
  var getGameDetail = (gameId, sport = SportType.BASKETBALL) => request({ url: `${sportPrefix(sport)}game/{gameId}/detail`, path: { gameId } });
  var compose = (params) => request({ url: "live/stream/compose", method: "POST", data: params });
  var _style_0 = { "live-push": { "": { "flex": 1, "backgroundColor": "#000000" } }, "pusher": { "": { "position": "absolute", "top": 0, "left": 0, "right": 0, "bottom": 0 } }, "overlay": { "": { "position": "absolute", "top": 0, "left": 0, "right": 0, "bottom": 0 } }, "top": { "": { "position": "absolute", "top": 0, "left": 0, "right": 0, "flexDirection": "row", "alignItems": "center", "paddingTop": "16rpx", "paddingRight": "20rpx", "paddingBottom": "16rpx", "paddingLeft": "20rpx" } }, "status": { "": { "flex": 1, "textAlign": "center", "color": "#ffffff", "fontSize": "24rpx" } }, "bottom": { "": { "position": "absolute", "bottom": 0, "left": 0, "flexDirection": "column", "alignItems": "flex-start", "paddingTop": "20rpx", "paddingRight": "20rpx", "paddingBottom": "20rpx", "paddingLeft": "20rpx" } }, "bottom-row": { "": { "flexDirection": "row", "marginBottom": "12rpx" } }, "gray-btn": { "": { "paddingTop": "8rpx", "paddingRight": "20rpx", "paddingBottom": "8rpx", "paddingLeft": "20rpx", "backgroundColor": "rgba(0,0,0,0.06)", "color": "#ffffff", "fontSize": "24rpx", "lineHeight": "40rpx", "marginRight": "16rpx" } } };
  var _sfc_main = {
    __name: "push",
    setup(__props, { expose: __expose }) {
      __expose();
      const publishUrl = (0, import_vue2.ref)("");
      const gameId = (0, import_vue2.ref)("");
      const homeName = (0, import_vue2.ref)("\u4E3B\u961F");
      const guestName = (0, import_vue2.ref)("\u5BA2\u961F");
      const homeLogo = (0, import_vue2.ref)("");
      const guestLogo = (0, import_vue2.ref)("");
      const hostScore = (0, import_vue2.ref)(0);
      const guestScore = (0, import_vue2.ref)(0);
      const section = (0, import_vue2.ref)("");
      const hostFoul = (0, import_vue2.ref)(0);
      const guestFoul = (0, import_vue2.ref)(0);
      const leagueName = (0, import_vue2.ref)("");
      const leagueLogo = (0, import_vue2.ref)("");
      const leagueStageName = (0, import_vue2.ref)("");
      const msg = (0, import_vue2.ref)("");
      const showScore = (0, import_vue2.ref)(true);
      const pushing = (0, import_vue2.ref)(false);
      const statusText = (0, import_vue2.ref)("\u672A\u8FDE\u63A5");
      const pusher = (0, import_vue2.ref)(null);
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
        homeName.value = opt.name || "\u76F4\u64AD";
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
            uni.showToast({ title: "\u9700\u8981\u76F8\u673A/\u9EA6\u514B\u98CE\u6743\u9650", icon: "none" });
            logToFile("[push] \u6743\u9650\u672A\u6388\u4E88\uFF0C\u65E0\u6CD5\u9884\u89C8");
            return;
          }
          let tries = 0;
          const tryPreview = () => {
            if (pusher.value) {
              formatAppLog("log", "at pages/live/push.nvue:131", "[push] startPreview \u8C03\u7528");
              logToFile("[push] startPreview \u8C03\u7528\uFF0C\u7EC4\u4EF6\u5DF2\u6302\u8F7D");
              pusher.value.startPreview();
              logToFile("[push] startPreview \u8C03\u7528\u5B8C\u6210");
              pushScore();
              logToFile("[push] startPreview \u540E\u7ACB\u5373 pushScore \u4E00\u6B21");
            } else if (tries++ < 20) {
              setTimeout(tryPreview, 100);
            } else {
              formatAppLog("log", "at pages/live/push.nvue:141", "[push] pusher ref \u59CB\u7EC8\u4E3A null -- livepusherview \u7EC4\u4EF6\u672A\u6CE8\u518C/\u672A\u6302\u8F7D");
              logToFile("[push] \u2717 pusher ref \u59CB\u7EC8\u4E3A null -- livepusherview \u7EC4\u4EF6\u672A\u6CE8\u518C/\u672A\u6302\u8F7D\uFF08\u63D2\u4EF6\u672A\u6253\u8FDB\u57FA\u5EA7\uFF09");
              uni.showToast({ title: "\u63A8\u6D41\u7EC4\u4EF6\u672A\u52A0\u8F7D\uFF0C\u8BF7\u786E\u8BA4\u63D2\u4EF6\u5DF2\u6253\u5305", icon: "none" });
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
        statusText.value = "\u6BD4\u5206\u63A5\u53E3\u8FDE\u63A5\u4E2D\u2026";
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
              statusText.value = "\u6BD4\u5206\u63A5\u53E3\u5DF2\u8FDE\u63A5";
              logToFile("[push] ws open");
            } else if (event === "close")
              statusText.value = "\u6BD4\u5206\u63A5\u53E3\u5DF2\u65AD\u5F00\uFF0C\u91CD\u8FDE\u4E2D\u2026";
            else if (event === "error")
              statusText.value = "\u6BD4\u5206\u63A5\u53E3\u8FDE\u63A5\u5931\u8D25";
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
          uni.showToast({ title: "\u63A8\u6D41\u5730\u5740\u4E3A\u7A7A\uFF0C\u65E0\u6CD5\u76F4\u64AD", icon: "none" });
          return;
        }
        if (!pusher.value) {
          uni.showToast({ title: "\u63A8\u6D41\u7EC4\u4EF6\u672A\u5C31\u7EEA", icon: "none" });
          logToFile("[push] startPush \u5931\u8D25\uFF1Apusher ref null");
          return;
        }
        logToFile("[push] startPush url=" + publishUrl.value);
        pusher.value.startPush(publishUrl.value);
        statusText.value = "\u63A8\u6D41\u8FDE\u63A5\u4E2D\u2026";
      }
      function stopPush() {
        if (pusher.value) {
          pusher.value.stopPush();
          pushing.value = false;
          statusText.value = "\u5DF2\u7ED3\u675F";
          logToFile("[push] stopPush");
        }
      }
      function switchCamera() {
        if (pusher.value)
          pusher.value.switchCamera();
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
          uni.showToast({ title: res.code === 1 ? "\u5DF2\u751F\u6210\u56DE\u653E" : "\u751F\u6210\u5931\u8D25", icon: "none" });
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
      const __returned__ = { publishUrl, gameId, homeName, guestName, homeLogo, guestLogo, hostScore, guestScore, section, hostFoul, guestFoul, leagueName, leagueLogo, leagueStageName, msg, showScore, pushing, statusText, pusher, logToFile, ensurePermissions, loadGameDetail, connectScore, reconnectScore, pushScore, startPush, stopPush, switchCamera, toggleScore, onState, onCompose, back, ref: import_vue2.ref, get onLoad() {
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
    const _component_livepusherview = (0, import_vue2.resolveComponent)("livepusherview");
    return (0, import_vue2.openBlock)(), (0, import_vue2.createElementBlock)("scroll-view", {
      scrollY: true,
      showScrollbar: true,
      enableBackToTop: true,
      bubble: "true",
      style: { flexDirection: "column" }
    }, [
      (0, import_vue2.createElementVNode)("view", { class: "live-push" }, [
        (0, import_vue2.createVNode)(_component_livepusherview, {
          ref: "pusher",
          class: "pusher",
          url: $setup.publishUrl,
          onStatechange: $setup.onState
        }, null, 8, ["url"]),
        (0, import_vue2.createElementVNode)("view", { class: "overlay" }, [
          (0, import_vue2.createElementVNode)("view", { class: "top" }, [
            (0, import_vue2.createElementVNode)("u-text", {
              class: "gray-btn",
              onClick: $setup.back
            }, "\u8FD4\u56DE"),
            (0, import_vue2.createElementVNode)(
              "u-text",
              { class: "status" },
              (0, import_vue2.toDisplayString)($setup.statusText),
              1
              /* TEXT */
            ),
            (0, import_vue2.createElementVNode)(
              "u-text",
              {
                class: "gray-btn",
                onClick: $setup.toggleScore
              },
              (0, import_vue2.toDisplayString)($setup.showScore ? "\u9690\u85CF" : "\u663E\u793A") + "\u6BD4\u5206",
              1
              /* TEXT */
            ),
            (0, import_vue2.createElementVNode)("u-text", {
              class: "gray-btn",
              onClick: $setup.reconnectScore
            }, "\u6BD4\u5206\u91CD\u8FDE")
          ]),
          (0, import_vue2.createElementVNode)("view", { class: "bottom" }, [
            (0, import_vue2.createElementVNode)("view", { class: "bottom-row" }, [
              (0, import_vue2.createElementVNode)("u-text", {
                class: "gray-btn",
                onClick: $setup.startPush
              }, "\u5F00\u59CB\u76F4\u64AD"),
              (0, import_vue2.createElementVNode)("u-text", {
                class: "gray-btn",
                onClick: $setup.stopPush
              }, "\u7ED3\u675F\u76F4\u64AD")
            ]),
            (0, import_vue2.createElementVNode)("u-text", {
              class: "gray-btn",
              onClick: $setup.onCompose
            }, "\u751F\u6210\u56DE\u653E")
          ])
        ])
      ])
    ]);
  }
  var push = /* @__PURE__ */ _export_sfc(_sfc_main, [["render", _sfc_render], ["styles", [_style_0]], ["__file", "F:/\u9879\u76EE\u6587\u4EF6/uniapp\u7248\u672C/pages/live/push.nvue"]]);

  // <stdin>
  var webview = plus.webview.currentWebview();
  if (webview) {
    const __pageId = parseInt(webview.id);
    const __pagePath = "pages/live/push";
    let __pageQuery = {};
    try {
      __pageQuery = JSON.parse(webview.__query__);
    } catch (e) {
    }
    push.mpType = "page";
    const app = Vue.createPageApp(push, { $store: getApp({ allowDefault: true }).$store, __pageId, __pagePath, __pageQuery });
    app.provide("__globalStyles", Vue.useCssStyles([...__uniConfig.styles, ...push.styles || []]));
    app.mount("#root");
  }
})();
