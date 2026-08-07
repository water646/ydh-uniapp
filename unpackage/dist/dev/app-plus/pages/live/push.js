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
  var userInfo = {
    id: "mock-user-001",
    avatar: "",
    nickName: "\u6D4B\u8BD5\u7BA1\u7406\u5458",
    sex: E(1, "\u7537"),
    sketch: "\u3010MOCK\u3011\u6D4B\u8BD5\u8D26\u53F7",
    birthday: "1990-01-01",
    position: E(1, "\u63A7\u7403\u540E\u536B"),
    number: 23,
    weight: "75",
    height: "180",
    city: "\u5317\u4EAC",
    province: "\u5317\u4EAC",
    phone: "13800000000",
    isBindWx: EB(0, "\u672A\u7ED1\u5B9A", false),
    follows: 12,
    fans: 36
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
  var basketGame2 = __spreadProps(__spreadValues({}, basketGame1), {
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
  var basketGame3 = __spreadProps(__spreadValues({}, basketGame1), {
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
  var footGame1 = __spreadProps(__spreadValues({}, basketGame1), {
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
  function matchList(sport, status) {
    const isFoot = sport === "football";
    const ongoing = isFoot ? footGame1 : basketGame1;
    const notStart = isFoot ? __spreadProps(__spreadValues({}, footGame1), { id: "mock-foot-002", status: E(1, "\u672A\u5F00\u59CB"), runStatus: E(1, "\u672A\u5F00\u59CB"), hostTeamScore: 0, guestTeamScore: 0 }) : basketGame2;
    const ended = isFoot ? __spreadProps(__spreadValues({}, footGame1), { id: "mock-foot-003", status: E(3, "\u5DF2\u7ED3\u675F"), runStatus: E(3, "\u5DF2\u7ED3\u675F"), hostTeamScore: 3, guestTeamScore: 0 }) : basketGame3;
    if (status === "end") {
      return ok([{ date: "2026-07-30", games: [ended] }]);
    }
    return ok([{ date: "2026-07-31", games: [ongoing, notStart] }]);
  }
  function buildMembers(teamName, teamId) {
    const names = teamName === "\u7EA2\u961F" ? ["\u8D75\u4E00", "\u94B1\u4E8C", "\u5B59\u4E09", "\u674E\u56DB", "\u5468\u4E94", "\u5434\u516D", "\u90D1\u4E03", "\u738B\u516B"] : ["\u51AF\u4E00", "\u9648\u4E8C", "\u891A\u4E09", "\u536B\u56DB", "\u848B\u4E94", "\u6C88\u516D", "\u97E9\u4E03", "\u6768\u516B"];
    const pos = ["\u63A7\u7403\u540E\u536B", "\u5F97\u5206\u540E\u536B", "\u5C0F\u524D\u950B", "\u5927\u524D\u950B", "\u4E2D\u950B", "\u66FF\u8865\u540E\u536B", "\u66FF\u8865\u524D\u950B", "\u66FF\u8865\u4E2D\u950B"];
    return names.map((name, i) => ({
      id: `mock-${teamId}-m${i + 1}`,
      teamMemberId: `mock-${teamId}-member-${i + 1}`,
      startingLineup: EB(i < 5 ? 1 : 0, i < 5 ? "\u9996\u53D1" : "\u66FF\u8865", i < 5),
      playing: EB(i < 5 ? 1 : 0, i < 5 ? "\u5728\u573A" : "\u573A\u4E0B", i < 5),
      number: i + 1,
      name,
      temporary: 0,
      position: E(i < 5 ? i + 1 : 0, i < 5 ? pos[i] : "\u66FF\u8865"),
      teamName,
      avatar: "",
      foul: i === 1 ? 2 : i === 3 ? 1 : 0
    }));
  }
  var hostMembers = buildMembers("\u7EA2\u961F", "host");
  var guestMembers = buildMembers("\u84DD\u961F", "guest");
  var sections = [
    { id: "mock-sec-1", gameSectionId: "mock-sec-1", name: "\u7B2C1\u8282", gameId: IDS.gameId, type: E(1, "\u5C0F\u8282"), sort: 1, groups: "", running: EB(1, "\u8FDB\u884C\u4E2D", true) },
    { id: "mock-sec-2", gameSectionId: "mock-sec-2", name: "\u7B2C2\u8282", gameId: IDS.gameId, type: E(1, "\u5C0F\u8282"), sort: 2, groups: "", running: EB(0, "\u672A\u5F00\u59CB", false) },
    { id: "mock-sec-3", gameSectionId: "mock-sec-3", name: "\u7B2C3\u8282", gameId: IDS.gameId, type: E(1, "\u5C0F\u8282"), sort: 3, groups: "", running: EB(0, "\u672A\u5F00\u59CB", false) },
    { id: "mock-sec-4", gameSectionId: "mock-sec-4", name: "\u7B2C4\u8282", gameId: IDS.gameId, type: E(1, "\u5C0F\u8282"), sort: 4, groups: "", running: EB(0, "\u672A\u5F00\u59CB", false) }
  ];
  var basketDetail = ok({
    game: {
      id: IDS.gameId,
      name: "\u6D4B\u8BD5\u8054\u8D5B-\u7EA2\u84DD\u5927\u6218",
      status: E(2, "\u8FDB\u884C\u4E2D"),
      runStatus: E(2, "\u8FDB\u884C\u4E2D"),
      type: E(1, "\u7BEE\u7403"),
      event: E(1, "\u8054\u8D5B"),
      time: "2026-07-31 15:00",
      isMedia: EB(1, "\u662F", true),
      venueId: "mock-venue-1",
      venueName: "1\u53F7\u573A\u5730",
      venueAddress: "\u6D4B\u8BD5\u4F53\u80B2\u99861\u53F7\u573A",
      leagueGroupId: "mock-lg-1",
      leagueGroupName: "A\u7EC4",
      leagueGroupSort: 1,
      leagueStageId: "mock-ls-1",
      leagueStageName: "\u5C0F\u7EC4\u8D5B",
      leagueStageSort: 1,
      leagueId: IDS.leagueId,
      leagueName: "\u6D4B\u8BD5\u8054\u8D5B",
      leagueLogo: "",
      leagueStartTime: "2026-07-01",
      hostGameTeamId: IDS.hostTeamId,
      hostTeamId: "ht1",
      hostTeamLogo: "",
      hostTeamName: "\u7EA2\u961F",
      hostTeamScore: 28,
      guestGameTeamId: IDS.guestTeamId,
      guestTeamId: "gt2",
      guestTeamLogo: "",
      guestTeamName: "\u84DD\u961F",
      guestTeamScore: 24,
      gameResult: E(0, "\u672A\u7ED3\u675F"),
      videoStatus: E(0, "\u672A\u76F4\u64AD"),
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
  var footDetail = ok(__spreadProps(__spreadValues({}, gameDetail.data), { type: E(2, "\u8DB3\u7403"), hostTeamName: "\u98DE\u864E\u961F", guestTeamName: "\u96C4\u9E70\u961F", hostTeamScore: 1, guestTeamScore: 1, name: "\u6D4B\u8BD5\u676F-\u8DB3\u7403\u534A\u51B3\u8D5B", leagueName: "\u6D4B\u8BD5\u676F" }));
  var connectInfo = ok({
    id: IDS.gameId,
    event: E(1, "\u8054\u8D5B"),
    name: "\u6D4B\u8BD5\u8054\u8D5B-\u7EA2\u84DD\u5927\u6218",
    status: E(2, "\u8FDB\u884C\u4E2D"),
    runStatus: E(2, "\u8FDB\u884C\u4E2D"),
    time: "2026-07-31 15:00",
    type: E(1, "\u7BEE\u7403"),
    isMedia: EB(1, "\u662F", true),
    venueId: "mock-venue-1",
    venueName: "1\u53F7\u573A\u5730",
    venueAddress: "\u6D4B\u8BD5\u4F53\u80B2\u99861\u53F7\u573A",
    leagueGroupId: "mock-lg-1",
    leagueGroupName: "A\u7EC4",
    leagueGroupSort: 1,
    leagueStageId: "mock-ls-1",
    leagueStageName: "\u5C0F\u7EC4\u8D5B",
    leagueStageSort: 1,
    leagueId: IDS.leagueId,
    leagueName: "\u6D4B\u8BD5\u8054\u8D5B",
    leagueLogo: "",
    leagueStartTime: "2026-07-01",
    hostGameTeamId: IDS.hostTeamId,
    hostTeamId: "ht1",
    hostTeamLogo: "",
    hostTeamName: "\u7EA2\u961F",
    hostTeamScore: 28,
    guestGameTeamId: IDS.guestTeamId,
    guestTeamId: "gt2",
    guestTeamLogo: "",
    guestTeamName: "\u84DD\u961F",
    guestTeamScore: 24,
    gameResult: E(0, "\u672A\u7ED3\u675F"),
    videoStatus: E(0, "\u672A\u76F4\u64AD"),
    section: "1"
  });
  var sectionList = ok(sections.map((s) => ({
    id: s.id,
    name: s.name,
    gameId: s.gameId,
    type: s.type,
    sort: s.sort,
    groups: s.groups
  })));
  function memberList(query) {
    const isGuest = query && query.gameTeamId && String(query.gameTeamId).indexOf("guest") >= 0;
    return ok(isGuest ? guestMembers : hostMembers);
  }
  var recordList = ok({
    totalCount: 6,
    pageSize: 10,
    totalPage: 1,
    pageNo: 1,
    nextPage: false,
    list: [
      { id: "mock-rec-1", recordNumber: "mock-rec-1", statisticsSectionId: "mock-sec-1", type: E(7, "\u4E09\u5206\u547D\u4E2D"), occurrenceTime: "15:02:10", statisticsMemberId: "mock-host-member-1", statisticsTeamId: IDS.hostTeamId, description: "\u8D75\u4E00 \u4E09\u5206\u547D\u4E2D", sectionName: "\u7B2C1\u8282", memberName: "\u8D75\u4E00", teamName: "\u7EA2\u961F" },
      { id: "mock-rec-2", recordNumber: "mock-rec-2", statisticsSectionId: "mock-sec-1", type: E(1, "\u7BEE\u677F"), occurrenceTime: "15:03:25", statisticsMemberId: "mock-guest-member-5", statisticsTeamId: IDS.guestTeamId, description: "\u51AF\u4E94 \u7BEE\u677F", sectionName: "\u7B2C1\u8282", memberName: "\u848B\u4E94", teamName: "\u84DD\u961F" },
      { id: "mock-rec-3", recordNumber: "mock-rec-3", statisticsSectionId: "mock-sec-1", type: E(6, "\u4E24\u5206\u547D\u4E2D"), occurrenceTime: "15:04:40", statisticsMemberId: "mock-host-member-2", statisticsTeamId: IDS.hostTeamId, description: "\u94B1\u4E8C \u4E24\u5206\u547D\u4E2D", sectionName: "\u7B2C1\u8282", memberName: "\u94B1\u4E8C", teamName: "\u7EA2\u961F" },
      { id: "mock-rec-4", recordNumber: "mock-rec-4", statisticsSectionId: "mock-sec-1", type: E(9, "\u72AF\u89C4"), occurrenceTime: "15:05:55", statisticsMemberId: "mock-guest-member-2", statisticsTeamId: IDS.guestTeamId, description: "\u9648\u4E8C \u72AF\u89C4", sectionName: "\u7B2C1\u8282", memberName: "\u9648\u4E8C", teamName: "\u84DD\u961F" },
      { id: "mock-rec-5", recordNumber: "mock-rec-5", statisticsSectionId: "mock-sec-1", type: E(2, "\u52A9\u653B"), occurrenceTime: "15:07:12", statisticsMemberId: "mock-host-member-1", statisticsTeamId: IDS.hostTeamId, description: "\u8D75\u4E00 \u52A9\u653B", sectionName: "\u7B2C1\u8282", memberName: "\u8D75\u4E00", teamName: "\u7EA2\u961F" },
      { id: "mock-rec-6", recordNumber: "mock-rec-6", statisticsSectionId: "mock-sec-1", type: E(17, "\u5931\u8BEF"), occurrenceTime: "15:08:30", statisticsMemberId: "mock-guest-member-3", statisticsTeamId: IDS.guestTeamId, description: "\u891A\u4E09 \u5931\u8BEF", sectionName: "\u7B2C1\u8282", memberName: "\u891A\u4E09", teamName: "\u84DD\u961F" }
    ]
  });
  var weekList = ok([
    {
      groupName: "A\u7EC4",
      games: [basketGame1, basketGame3],
      optimals: [
        { name: "\u8D75\u4E00", avatar: "", count: 18, type: E(6, "\u5F97\u5206\u738B") },
        { name: "\u848B\u4E94", avatar: "", count: 11, type: E(1, "\u7BEE\u677F\u738B") }
      ]
    },
    {
      groupName: "B\u7EC4",
      games: [basketGame2],
      optimals: [{ name: "\u5434\u516D", avatar: "", count: 7, type: E(2, "\u52A9\u653B\u738B") }]
    }
  ]);
  var photoActivityList = ok({
    totalCount: 2,
    pageSize: 10,
    totalPage: 1,
    pageNo: 1,
    nextPage: false,
    list: [
      { id: "mock-photo-act-1", type: E(1, "\u6BD4\u8D5B"), title: "\u7EA2\u84DD\u5927\u6218\u62CD\u7167\u76F4\u64AD", description: "\u3010MOCK\u3011\u6D4B\u8BD5\u6D3B\u52A8", status: E(1, "\u8FDB\u884C\u4E2D"), startTime: "2026-07-31 15:00", endTime: "2026-07-31 17:00", address: "1\u53F7\u573A\u5730", visitors: 128, logo: "", banner: "", poster: "", timeInterval: 0, showStatus: E(1, "\u663E\u793A") },
      { id: "mock-photo-act-2", type: E(2, "\u8054\u8D5B"), title: "\u6D4B\u8BD5\u676F\u62CD\u7167\u76F4\u64AD", description: "\u3010MOCK\u3011\u6D4B\u8BD5\u6D3B\u52A82", status: E(2, "\u5DF2\u7ED3\u675F"), startTime: "2026-07-30 15:00", endTime: "2026-07-30 17:00", address: "2\u53F7\u573A\u5730", visitors: 56, logo: "", banner: "", poster: "", timeInterval: 0, showStatus: E(1, "\u663E\u793A") }
    ]
  });
  var uploadPhotoList = ok([
    { id: "mock-pic-1", photoActivityId: "mock-photo-act-1", userId: "mock-user-001", url: "", width: 1080, height: 1920, fileName: "mock-1.jpg", fileSize: 102400, fileTime: "2026-07-31 15:01:00", showStatus: E(1, "\u663E\u793A"), likeCount: 3 },
    { id: "mock-pic-2", photoActivityId: "mock-photo-act-1", userId: "mock-user-001", url: "", width: 1080, height: 1920, fileName: "mock-2.jpg", fileSize: 204800, fileTime: "2026-07-31 15:02:00", showStatus: E(1, "\u663E\u793A"), likeCount: 5 },
    { id: "mock-pic-3", photoActivityId: "mock-photo-act-1", userId: "mock-user-001", url: "", width: 1080, height: 1920, fileName: "mock-3.jpg", fileSize: 153600, fileTime: "2026-07-31 15:03:00", showStatus: E(1, "\u663E\u793A"), likeCount: 0 }
  ]);
  var liveGameList = ok([
    { id: "mock-live-1", recordId: "mock-rec-live-1", type: E(1, "\u76F4\u64AD"), appName: "mock", streamName: "mock-stream-1", name: "1\u53F7\u673A\u4F4D", status: E(1, "\u76F4\u64AD\u4E2D"), cover: "", publish: "rtmp://mock/live/mock-stream-1", liveRtmp: "rtmp://mock/live/mock-stream-1", liveFlv: "http://mock/live/mock-stream-1.flv", liveM3u8: "http://mock/live/mock-stream-1.m3u8" }
  ]);
  var versionCheckResult = ok({
    id: "mock-ver-1",
    deviceType: E(1, "android"),
    url: "",
    upgradeType: E(0, "\u53EF\u9009"),
    remark: "\u3010MOCK\u3011\u5F53\u524D\u5DF2\u662F\u6700\u65B0\u7248\u672C\uFF08\u6D4B\u8BD5\u6570\u636E\uFF09",
    packageSize: "0",
    versionCode: 0,
    versionName: "2.8.4",
    notice: E(0, "\u4E0D\u63D0\u9192")
  });
  var RULES = [
    /* ----- 登录 ----- */
    { method: "POST", url: "sms/login", handler: () => ok(null, "\u3010MOCK\u3011\u9A8C\u8BC1\u7801\u5DF2\u53D1\u9001(\u6D4B\u8BD5\u7801:1234)") },
    { method: "POST", url: "user/login", handler: () => ok(IDS.token, "\u3010MOCK\u3011\u767B\u5F55\u6210\u529F") },
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
    { method: "GET", url: "statistics/section/list", handler: () => sectionList },
    { method: "GET", url: "statistics/member/list", handler: (o) => memberList(o.query) },
    /* ----- 统计记录 ----- */
    { method: "GET", url: "statistics/page", handler: () => recordList },
    /* ----- 优肯周赛况 ----- */
    { method: "GET", url: "game/list-week", handler: () => weekList },
    /* ----- 拍照 / 相册 ----- */
    { method: "GET", url: "photo/activity/list-my-manage", handler: () => photoActivityList },
    { method: "GET", url: "photo/activity/create-game", handler: () => ok("mock-photo-act-new", "\u3010MOCK\u3011\u6D3B\u52A8\u521B\u5EFA\u6210\u529F") },
    { method: "GET", url: "photo/picture/upload-list", handler: () => uploadPhotoList },
    /* ----- 直播 ----- */
    { method: "GET", url: "live/stream/game-list", handler: () => liveGameList },
    { method: "POST", url: "live/stream/game", handler: () => ok(liveGameList.data[0], "\u3010MOCK\u3011\u83B7\u53D6\u76F4\u64AD\u5730\u5740\u6210\u529F") },
    { method: "POST", url: "live/stream/game-add", handler: () => ok("mock-live-new", "\u3010MOCK\u3011\u76F4\u64AD\u6DFB\u52A0\u6210\u529F") },
    { method: "POST", url: "live/stream/compose", handler: () => ok(null, "\u3010MOCK\u3011\u5408\u6210\u56DE\u653E\u8BF7\u6C42\u5DF2\u63D0\u4EA4") },
    /* ----- 版本检查 ----- */
    { method: "GET", url: "sys/app-version/check", handler: () => versionCheckResult },
    /* ----- 写操作：统一返回成功（mock 不真实落库）----- */
    { method: "POST", url: "ts/game/update-info", handler: () => ok(null, "\u3010MOCK\u3011\u4FDD\u5B58\u6210\u529F") },
    { method: "POST", url: "game/status", handler: () => ok(null, "\u3010MOCK\u3011\u72B6\u6001\u4FEE\u6539\u6210\u529F") },
    { method: "POST", url: "soccer/game/status", handler: () => ok(null, "\u3010MOCK\u3011\u72B6\u6001\u4FEE\u6539\u6210\u529F") },
    { method: "POST", url: "statistics/member/sign", handler: () => ok(null, "\u3010MOCK\u3011\u7B7E\u5230\u6210\u529F") },
    { method: "POST", url: "statistics/member/sign-cancel", handler: () => ok(null, "\u3010MOCK\u3011\u53D6\u6D88\u7B7E\u5230\u6210\u529F") },
    { method: "POST", url: "statistics/member/starting-lineup", handler: () => ok(null, "\u3010MOCK\u3011\u8BBE\u7F6E\u9996\u53D1\u6210\u529F") },
    { method: "POST", url: "statistics/member/starting-lineup-cancel", handler: () => ok(null, "\u3010MOCK\u3011\u53D6\u6D88\u9996\u53D1\u6210\u529F") },
    { method: "POST", url: "statistics/member/temporary", handler: () => ok("mock-member-new", "\u3010MOCK\u3011\u6DFB\u52A0\u4E34\u65F6\u7403\u5458\u6210\u529F") },
    { method: "POST", url: "statistics/member/edit-position", handler: () => ok(null, "\u3010MOCK\u3011\u4F4D\u7F6E\u4FEE\u6539\u6210\u529F") },
    { method: "GET", url: "statistics/member/delete-temporary", handler: () => ok(null, "\u3010MOCK\u3011\u5220\u9664\u7403\u5458\u6210\u529F") },
    { method: "POST", url: "statistics/add", handler: () => ok(null, "\u3010MOCK\u3011\u7EDF\u8BA1\u63D0\u4EA4\u6210\u529F") },
    { method: "POST", url: "statistics/add-all", handler: () => ok(null, "\u3010MOCK\u3011\u6279\u91CF\u7EDF\u8BA1\u63D0\u4EA4\u6210\u529F") },
    { method: "POST", url: "statistics/cancel", handler: () => ok(null, "\u3010MOCK\u3011\u53D6\u6D88\u8BB0\u5F55\u6210\u529F") },
    { method: "POST", url: "statistics/section/running", handler: () => ok(null, "\u3010MOCK\u3011\u5C0F\u8282\u72B6\u6001\u5207\u6362\u6210\u529F") }
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
    formatAppLog("warn", "at mock/mock-data.js:526", `%c\u3010MOCK\u3011\u672A\u5339\u914D\u5230\u9759\u6001\u6570\u636E\uFF0C\u8D70\u771F\u5B9E\u8BF7\u6C42\uFF1A${m} ${url}`, "color:#f56c6c");
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
  var _imports_0 = "/static/mipmap-xhdpi/new_bifen.png";
  var _imports_1 = "/static/watermark.png";
  var _style_0 = { "live-push": { "": { "flex": 1, "backgroundColor": "#000000" } }, "pusher": { "": { "flex": 1 } }, "overlay": { "": { "position": "absolute", "transform": "rotate(90deg)", "transformOrigin": "50% 50%" } }, "top": { "": { "position": "absolute", "top": 0, "left": 0, "right": 0, "flexDirection": "row", "alignItems": "center", "paddingTop": "20rpx", "paddingRight": "20rpx", "paddingBottom": "20rpx", "paddingLeft": "20rpx", "height": "80rpx" } }, "back": { "": { "width": "64rpx", "height": "64rpx", "borderRadius": "32rpx", "backgroundColor": "rgba(0,0,0,0.4)", "alignItems": "center", "justifyContent": "center", "marginLeft": "50rpx" } }, "back-icon": { "": { "fontSize": "44rpx", "color": "#ffffff" } }, "status": { "": { "flex": 1, "textAlign": "center", "color": "#ffffff", "fontSize": "24rpx" } }, "reconnect": { "": { "fontSize": "24rpx", "color": "#009de9" } }, "score-overlay": { "": { "position": "absolute", "top": "550rpx", "left": "380rpx", "width": "800rpx", "height": "80rpx" } }, "score-bg": { "": { "position": "absolute", "top": 0, "left": 0, "width": "800rpx", "height": "80rpx" } }, "s-logo": { "": { "position": "absolute", "width": "48rpx", "height": "48rpx", "borderRadius": "24rpx", "top": "14rpx" } }, "s-logo-left": { "": { "left": "13rpx" } }, "s-logo-right": { "": { "right": "13rpx" } }, "s-team": { "": { "position": "absolute", "top": "30rpx", "width": "240rpx", "fontSize": "22rpx", "color": "#ffffff", "textAlign": "center", "lines": 1, "textOverflow": "ellipsis" } }, "s-host": { "": { "left": "32rpx" } }, "s-guest": { "": { "left": "528rpx" } }, "s-score": { "": { "position": "absolute", "top": "22rpx", "width": "128rpx", "fontSize": "40rpx", "color": "#ffffff", "fontWeight": "bold", "textAlign": "center" } }, "s-score-host": { "": { "left": "416rpx" } }, "s-score-guest": { "": { "left": "256rpx" } }, "s-section": { "": { "position": "absolute", "top": "32rpx", "left": "336rpx", "width": "128rpx", "fontSize": "22rpx", "color": "#ffffff", "textAlign": "center" } }, "bottom": { "": { "position": "absolute", "bottom": "0rpx", "paddingTop": 0, "paddingRight": "60rpx", "paddingBottom": 0, "paddingLeft": "60rpx", "left": 0, "right": 0, "flexDirection": "row", "justifyContent": "flex-start", "flexWrap": "wrap", "width": "700rpx" } }, "btn": { "": { "fontSize": "26rpx", "color": "#ffffff", "paddingTop": "16rpx", "paddingRight": "28rpx", "paddingBottom": "16rpx", "paddingLeft": "28rpx", "marginTop": "10rpx", "marginRight": "10rpx", "marginBottom": "10rpx", "marginLeft": "10rpx", "borderRadius": "30rpx", "backgroundColor": "rgba(0,0,0,0.5)" }, ".start": { "backgroundColor": "#29a871" }, ".stop": { "backgroundColor": "#ff2d2d" } }, "top-logo": { "": { "width": "420rpx", "height": "150rpx", "alignSelf": "flex-end", "position": "relative", "top": "20rpx", "right": "20rpx", "transform": "scale(0.5)" } }, "gray-btn": { "": { "width": "170rpx", "height": "90rpx", "backgroundColor": "rgba(0,0,0,0.3)", "borderRadius": "4rpx", "display": "flex", "alignItems": "center", "paddingTop": "30rpx", "paddingRight": "30rpx", "paddingBottom": "30rpx", "paddingLeft": "30rpx", "textAlign": "center", "marginTop": "40rpx", "marginRight": "40rpx", "marginBottom": "40rpx", "marginLeft": "40rpx", "color": "#FFFFFF", "fontSize": "28rpx" } }, "top-btn": { "": { "position": "relative", "right": "300rpx" } } };
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
      const showScore = (0, import_vue2.ref)(true);
      const pushing = (0, import_vue2.ref)(false);
      const statusText = (0, import_vue2.ref)("\u672A\u8FDE\u63A5");
      let pusherCtx = null;
      const instance = (0, import_vue2.getCurrentInstance)();
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
        homeName.value = opt.name || "\u76F4\u64AD";
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
          formatAppLog("log", "at pages/live/push.nvue:152", "[pusher] createLivePusherContext \u5931\u8D25\uFF0C\u7EC4\u4EF6\u672A\u6302\u8F7D");
          return;
        }
        ctx.startPreview({
          success: () => formatAppLog("log", "at pages/live/push.nvue:156", "[pusher] \u9884\u89C8\u5DF2\u5F00\u542F"),
          fail: (err) => {
            formatAppLog("log", "at pages/live/push.nvue:158", "[pusher] \u9884\u89C8\u5F00\u542F\u5931\u8D25", err);
            uni.showToast({ title: "\u6444\u50CF\u5934\u5F00\u542F\u5931\u8D25\uFF0C\u8BF7\u68C0\u67E5\u6743\u9650", icon: "none" });
          }
        });
      }
      onReady(() => {
        ensurePermissions().then(() => {
          setTimeout(startPreview, 200);
        });
      });
      (0, import_vue2.onUnmounted)(() => {
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
          },
          (event) => {
            if (event === "open")
              statusText.value = "\u6BD4\u5206\u63A5\u53E3\u5DF2\u8FDE\u63A5";
            else if (event === "close")
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
      function startPush() {
        if (!publishUrl.value) {
          uni.showToast({ title: "\u63A8\u6D41\u5730\u5740\u4E3A\u7A7A\uFF0C\u65E0\u6CD5\u76F4\u64AD", icon: "none" });
          return;
        }
        const ctx = getPusherCtx();
        if (!ctx) {
          uni.showToast({ title: "\u63A8\u6D41\u7EC4\u4EF6\u672A\u5C31\u7EEA", icon: "none" });
          return;
        }
        ctx.start({
          success: () => {
            pushing.value = true;
            statusText.value = "\u76F4\u64AD\u4E2D";
          },
          fail: () => {
            uni.showToast({ title: "\u63A8\u6D41\u5931\u8D25", icon: "none" });
          }
        });
      }
      function stopPush() {
        if (pusherCtx) {
          pusherCtx.stop();
          pushing.value = false;
          statusText.value = "\u5DF2\u7ED3\u675F";
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
        uni.showToast({ title: "\u63A8\u6D41\u9519\u8BEF", icon: "none" });
      }
      function onCompose() {
        compose({ gameId: gameId.value }).then((res) => {
          uni.showToast({ title: res.code === 1 ? "\u5DF2\u751F\u6210\u56DE\u653E" : "\u751F\u6210\u5931\u8D25", icon: "none" });
        });
      }
      function back() {
        uni.navigateBack();
      }
      const __returned__ = { publishUrl, gameId, homeName, guestName, homeLogo, guestLogo, hostScore, guestScore, section, showScore, pushing, statusText, get pusherCtx() {
        return pusherCtx;
      }, set pusherCtx(v) {
        pusherCtx = v;
      }, instance, overlayStyle, getPusherCtx, ensurePermissions, startPreview, loadGameDetail, connectScore, reconnectScore, startPush, stopPush, switchCamera, toggleScore, onState, onError, onCompose, back, ref: import_vue2.ref, onUnmounted: import_vue2.onUnmounted, getCurrentInstance: import_vue2.getCurrentInstance, get onLoad() {
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
    return (0, import_vue2.openBlock)(), (0, import_vue2.createElementBlock)("scroll-view", {
      scrollY: true,
      showScrollbar: true,
      enableBackToTop: true,
      bubble: "true",
      style: { flexDirection: "column" }
    }, [
      (0, import_vue2.createElementVNode)("view", { class: "live-push" }, [
        (0, import_vue2.createElementVNode)("live-pusher", {
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
        (0, import_vue2.createElementVNode)(
          "view",
          {
            class: "overlay",
            style: (0, import_vue2.normalizeStyle)($setup.overlayStyle)
          },
          [
            (0, import_vue2.createElementVNode)("view", { class: "top" }, [
              (0, import_vue2.createElementVNode)("view", { onClick: $setup.back }, [
                (0, import_vue2.createElementVNode)("u-text", { class: "gray-btn" }, "\u8FD4\u56DE")
              ]),
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
                  class: "gray-btn top-btn",
                  onClick: $setup.toggleScore
                },
                (0, import_vue2.toDisplayString)($setup.showScore ? "\u9690\u85CF" : "\u663E\u793A") + "\u6BD4\u5206",
                1
                /* TEXT */
              ),
              (0, import_vue2.createElementVNode)("u-text", {
                class: "reconnect",
                onClick: $setup.reconnectScore
              }, "\u6BD4\u5206\u91CD\u8FDE")
            ]),
            $setup.showScore ? ((0, import_vue2.openBlock)(), (0, import_vue2.createElementBlock)("view", {
              key: 0,
              class: "score-overlay"
            }, [
              (0, import_vue2.createElementVNode)("u-image", {
                class: "score-bg",
                src: _imports_0
              }),
              $setup.homeLogo ? ((0, import_vue2.openBlock)(), (0, import_vue2.createElementBlock)("u-image", {
                key: 0,
                class: "s-logo s-logo-left",
                mode: "aspectFill",
                src: $setup.homeLogo
              }, null, 8, ["src"])) : (0, import_vue2.createCommentVNode)("v-if", true),
              $setup.guestLogo ? ((0, import_vue2.openBlock)(), (0, import_vue2.createElementBlock)("u-image", {
                key: 1,
                class: "s-logo s-logo-right",
                mode: "aspectFill",
                src: $setup.guestLogo
              }, null, 8, ["src"])) : (0, import_vue2.createCommentVNode)("v-if", true),
              (0, import_vue2.createElementVNode)(
                "u-text",
                { class: "s-team s-host" },
                (0, import_vue2.toDisplayString)($setup.homeName),
                1
                /* TEXT */
              ),
              (0, import_vue2.createElementVNode)(
                "u-text",
                { class: "s-score s-score-host" },
                (0, import_vue2.toDisplayString)($setup.hostScore),
                1
                /* TEXT */
              ),
              (0, import_vue2.createElementVNode)(
                "u-text",
                { class: "s-section" },
                (0, import_vue2.toDisplayString)($setup.section),
                1
                /* TEXT */
              ),
              (0, import_vue2.createElementVNode)(
                "u-text",
                { class: "s-score s-score-guest" },
                (0, import_vue2.toDisplayString)($setup.guestScore),
                1
                /* TEXT */
              ),
              (0, import_vue2.createElementVNode)(
                "u-text",
                { class: "s-team s-guest" },
                (0, import_vue2.toDisplayString)($setup.guestName),
                1
                /* TEXT */
              )
            ])) : (0, import_vue2.createCommentVNode)("v-if", true),
            (0, import_vue2.createElementVNode)("u-image", {
              class: "top-logo",
              mode: "left",
              src: _imports_1
            }),
            (0, import_vue2.createElementVNode)("view", { class: "bottom" }, [
              !$setup.pushing ? ((0, import_vue2.openBlock)(), (0, import_vue2.createElementBlock)("u-text", {
                key: 0,
                class: "gray-btn start",
                onClick: $setup.startPush
              }, "\u5F00\u59CB\u76F4\u64AD")) : (0, import_vue2.createCommentVNode)("v-if", true),
              (0, import_vue2.createElementVNode)("u-text", {
                class: "gray-btn stop",
                onClick: $setup.stopPush
              }, "\u7ED3\u675F\u76F4\u64AD"),
              (0, import_vue2.createElementVNode)("u-text", {
                class: "gray-btn",
                onClick: $setup.onCompose
              }, "\u751F\u6210\u56DE\u653E")
            ])
          ],
          4
          /* STYLE */
        )
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
