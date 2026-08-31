import { f as formatAppLog, _ as _export_sfc, o as onLoad, a as onReady, b as onUnload, c as onBackPress } from "../../_plugin-vue_export-helper.js";
import { ref, computed, resolveComponent, openBlock, createElementBlock, createElementVNode, createVNode, createCommentVNode, toDisplayString, Fragment, renderList } from "vue";
import { defineStore } from "pinia";
const config = {
  /**
   * ⚠️【MOCK 开关】⚠️
   * true  => 所有请求走 mock/mock-data.js 的静态测试数据（不访问真实后端）
   * false => 走真实后端接口（baseUrl）
   * 测试完毕请改回 false。
   */
  useMock: false,
  /** Retrofit baseUrl：对应 Api.APP_DOMAIN。本地联调：localhost:9898；测完换回生产（下一行） */
  baseUrl: "http://localhost:9898/ydh-service/",
  // baseUrl: 'http://app.ydh123.com/ydh-service/',
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
function setToken(token) {
  uni.setStorageSync(KEY_TOKEN, token || "");
}
function getUserId() {
  return uni.getStorageSync(KEY_USER_ID) || "";
}
function setUserId(id) {
  uni.setStorageSync(KEY_USER_ID, id);
}
function clearAuth() {
  uni.removeStorageSync(KEY_TOKEN);
  uni.removeStorageSync(KEY_USER_ID);
}
let socketTask = null;
let reconnectTimer = null;
let heartbeatTimer = null;
let messageCallback = null;
let statusCallback = null;
let closedByUser = false;
let currentGroup = "";
function sendHeartbeat() {
  if (socketTask) {
    try {
      socketTask.send({ data: JSON.stringify({ cmd: 13, hbbyte: "-128" }) });
    } catch (e) {
    }
  }
}
function connectSocket(group, onMessage, onStatus) {
  closedByUser = false;
  currentGroup = group;
  messageCallback = onMessage;
  statusCallback = onStatus;
  const token = getToken();
  let device = "";
  try {
    device = "android" + String(plus.device.uuid || plus.device.imei || "").replace(/-/g, "");
  } catch (e) {
    device = "";
  }
  const url = `${config.wsUrl}token=${encodeURIComponent(token)}&group=${group}&device=${device}`;
  socketTask = uni.connectSocket({
    url,
    complete() {
    }
  });
  socketTask.onOpen(() => {
    formatAppLog("log", "at utils/websocket.js:62", "WebSocket 已连接", group, url);
    statusCallback && statusCallback("open");
    sendHeartbeat();
    if (heartbeatTimer)
      clearInterval(heartbeatTimer);
    heartbeatTimer = setInterval(sendHeartbeat, 20 * 1e3);
  });
  socketTask.onMessage((res) => {
    const raw = res.data;
    try {
      const msg = JSON.parse(raw);
      let data = msg.data;
      if (data && typeof data.content === "string") {
        try {
          data = JSON.parse(data.content);
          if (data && data.data && typeof data.data === "object") {
            data = data.data;
          }
        } catch (e) {
          data = { msg: data.content };
        }
      }
      messageCallback && messageCallback(data || {});
    } catch (e) {
      messageCallback && messageCallback({ __raw: String(raw) });
    }
  });
  socketTask.onClose(() => {
    formatAppLog("log", "at utils/websocket.js:96", "WebSocket 关闭", group);
    if (heartbeatTimer) {
      clearInterval(heartbeatTimer);
      heartbeatTimer = null;
    }
    statusCallback && statusCallback("close");
    if (!closedByUser) {
      reconnectTimer = setTimeout(() => {
        connectSocket(currentGroup, messageCallback, statusCallback);
      }, 3e3);
    }
  });
  socketTask.onError(() => {
    formatAppLog("log", "at utils/websocket.js:111", "WebSocket 错误", group, url);
    statusCallback && statusCallback("error");
  });
}
function closeSocket() {
  closedByUser = true;
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
  if (heartbeatTimer) {
    clearInterval(heartbeatTimer);
    heartbeatTimer = null;
  }
  if (socketTask) {
    try {
      socketTask.close();
    } catch (e) {
    }
    socketTask = null;
  }
}
var commonjsGlobal = typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : {};
function getDefaultExportFromCjs(x) {
  return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, "default") ? x["default"] : x;
}
function getAugmentedNamespace(n) {
  if (n.__esModule)
    return n;
  var f = n.default;
  if (typeof f == "function") {
    var a = function a2() {
      if (this instanceof a2) {
        return Reflect.construct(f, arguments, this.constructor);
      }
      return f.apply(this, arguments);
    };
    a.prototype = f.prototype;
  } else
    a = {};
  Object.defineProperty(a, "__esModule", { value: true });
  Object.keys(n).forEach(function(k) {
    var d = Object.getOwnPropertyDescriptor(n, k);
    Object.defineProperty(a, k, d.get ? d : {
      enumerable: true,
      get: function() {
        return n[k];
      }
    });
  });
  return a;
}
var md5$1 = { exports: {} };
const __viteBrowserExternal = new Proxy({}, {
  get(_, key) {
    throw new Error(`Module "" has been externalized for browser compatibility. Cannot access ".${key}" in client code.  See https://vitejs.dev/guide/troubleshooting.html#module-externalized-for-browser-compatibility for more details.`);
  }
});
const __viteBrowserExternal$1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: __viteBrowserExternal
}, Symbol.toStringTag, { value: "Module" }));
const require$$1 = /* @__PURE__ */ getAugmentedNamespace(__viteBrowserExternal$1);
/**
 * [js-md5]{@link https://github.com/emn178/js-md5}
 *
 * @namespace md5
 * @version 0.8.3
 * @author Chen, Yi-Cyuan [emn178@gmail.com]
 * @copyright Chen, Yi-Cyuan 2014-2023
 * @license MIT
 */
(function(module) {
  (function() {
    var INPUT_ERROR = "input is invalid type";
    var FINALIZE_ERROR = "finalize already called";
    var WINDOW = typeof window === "object";
    var root = WINDOW ? window : {};
    if (root.JS_MD5_NO_WINDOW) {
      WINDOW = false;
    }
    var WEB_WORKER = !WINDOW && typeof self === "object";
    var NODE_JS = !root.JS_MD5_NO_NODE_JS && typeof process === "object" && process.versions && process.versions.node;
    if (NODE_JS) {
      root = commonjsGlobal;
    } else if (WEB_WORKER) {
      root = self;
    }
    var COMMON_JS = !root.JS_MD5_NO_COMMON_JS && true && module.exports;
    var ARRAY_BUFFER = !root.JS_MD5_NO_ARRAY_BUFFER && typeof ArrayBuffer !== "undefined";
    var HEX_CHARS = "0123456789abcdef".split("");
    var EXTRA = [128, 32768, 8388608, -2147483648];
    var SHIFT = [0, 8, 16, 24];
    var OUTPUT_TYPES = ["hex", "array", "digest", "buffer", "arrayBuffer", "base64"];
    var BASE64_ENCODE_CHAR = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".split("");
    var blocks = [], buffer8;
    if (ARRAY_BUFFER) {
      var buffer = new ArrayBuffer(68);
      buffer8 = new Uint8Array(buffer);
      blocks = new Uint32Array(buffer);
    }
    var isArray = Array.isArray;
    if (root.JS_MD5_NO_NODE_JS || !isArray) {
      isArray = function(obj) {
        return Object.prototype.toString.call(obj) === "[object Array]";
      };
    }
    var isView = ArrayBuffer.isView;
    if (ARRAY_BUFFER && (root.JS_MD5_NO_ARRAY_BUFFER_IS_VIEW || !isView)) {
      isView = function(obj) {
        return typeof obj === "object" && obj.buffer && obj.buffer.constructor === ArrayBuffer;
      };
    }
    var formatMessage = function(message) {
      var type = typeof message;
      if (type === "string") {
        return [message, true];
      }
      if (type !== "object" || message === null) {
        throw new Error(INPUT_ERROR);
      }
      if (ARRAY_BUFFER && message.constructor === ArrayBuffer) {
        return [new Uint8Array(message), false];
      }
      if (!isArray(message) && !isView(message)) {
        throw new Error(INPUT_ERROR);
      }
      return [message, false];
    };
    var createOutputMethod = function(outputType) {
      return function(message) {
        return new Md5(true).update(message)[outputType]();
      };
    };
    var createMethod = function() {
      var method = createOutputMethod("hex");
      if (NODE_JS) {
        method = nodeWrap(method);
      }
      method.create = function() {
        return new Md5();
      };
      method.update = function(message) {
        return method.create().update(message);
      };
      for (var i = 0; i < OUTPUT_TYPES.length; ++i) {
        var type = OUTPUT_TYPES[i];
        method[type] = createOutputMethod(type);
      }
      return method;
    };
    var nodeWrap = function(method) {
      var crypto = require$$1;
      var Buffer = require$$1.Buffer;
      var bufferFrom;
      if (Buffer.from && !root.JS_MD5_NO_BUFFER_FROM) {
        bufferFrom = Buffer.from;
      } else {
        bufferFrom = function(message) {
          return new Buffer(message);
        };
      }
      var nodeMethod = function(message) {
        if (typeof message === "string") {
          return crypto.createHash("md5").update(message, "utf8").digest("hex");
        } else {
          if (message === null || message === void 0) {
            throw new Error(INPUT_ERROR);
          } else if (message.constructor === ArrayBuffer) {
            message = new Uint8Array(message);
          }
        }
        if (isArray(message) || isView(message) || message.constructor === Buffer) {
          return crypto.createHash("md5").update(bufferFrom(message)).digest("hex");
        } else {
          return method(message);
        }
      };
      return nodeMethod;
    };
    var createHmacOutputMethod = function(outputType) {
      return function(key, message) {
        return new HmacMd5(key, true).update(message)[outputType]();
      };
    };
    var createHmacMethod = function() {
      var method = createHmacOutputMethod("hex");
      method.create = function(key) {
        return new HmacMd5(key);
      };
      method.update = function(key, message) {
        return method.create(key).update(message);
      };
      for (var i = 0; i < OUTPUT_TYPES.length; ++i) {
        var type = OUTPUT_TYPES[i];
        method[type] = createHmacOutputMethod(type);
      }
      return method;
    };
    function Md5(sharedMemory) {
      if (sharedMemory) {
        blocks[0] = blocks[16] = blocks[1] = blocks[2] = blocks[3] = blocks[4] = blocks[5] = blocks[6] = blocks[7] = blocks[8] = blocks[9] = blocks[10] = blocks[11] = blocks[12] = blocks[13] = blocks[14] = blocks[15] = 0;
        this.blocks = blocks;
        this.buffer8 = buffer8;
      } else {
        if (ARRAY_BUFFER) {
          var buffer2 = new ArrayBuffer(68);
          this.buffer8 = new Uint8Array(buffer2);
          this.blocks = new Uint32Array(buffer2);
        } else {
          this.blocks = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        }
      }
      this.h0 = this.h1 = this.h2 = this.h3 = this.start = this.bytes = this.hBytes = 0;
      this.finalized = this.hashed = false;
      this.first = true;
    }
    Md5.prototype.update = function(message) {
      if (this.finalized) {
        throw new Error(FINALIZE_ERROR);
      }
      var result = formatMessage(message);
      message = result[0];
      var isString = result[1];
      var code, index = 0, i, length = message.length, blocks2 = this.blocks;
      var buffer82 = this.buffer8;
      while (index < length) {
        if (this.hashed) {
          this.hashed = false;
          blocks2[0] = blocks2[16];
          blocks2[16] = blocks2[1] = blocks2[2] = blocks2[3] = blocks2[4] = blocks2[5] = blocks2[6] = blocks2[7] = blocks2[8] = blocks2[9] = blocks2[10] = blocks2[11] = blocks2[12] = blocks2[13] = blocks2[14] = blocks2[15] = 0;
        }
        if (isString) {
          if (ARRAY_BUFFER) {
            for (i = this.start; index < length && i < 64; ++index) {
              code = message.charCodeAt(index);
              if (code < 128) {
                buffer82[i++] = code;
              } else if (code < 2048) {
                buffer82[i++] = 192 | code >>> 6;
                buffer82[i++] = 128 | code & 63;
              } else if (code < 55296 || code >= 57344) {
                buffer82[i++] = 224 | code >>> 12;
                buffer82[i++] = 128 | code >>> 6 & 63;
                buffer82[i++] = 128 | code & 63;
              } else {
                code = 65536 + ((code & 1023) << 10 | message.charCodeAt(++index) & 1023);
                buffer82[i++] = 240 | code >>> 18;
                buffer82[i++] = 128 | code >>> 12 & 63;
                buffer82[i++] = 128 | code >>> 6 & 63;
                buffer82[i++] = 128 | code & 63;
              }
            }
          } else {
            for (i = this.start; index < length && i < 64; ++index) {
              code = message.charCodeAt(index);
              if (code < 128) {
                blocks2[i >>> 2] |= code << SHIFT[i++ & 3];
              } else if (code < 2048) {
                blocks2[i >>> 2] |= (192 | code >>> 6) << SHIFT[i++ & 3];
                blocks2[i >>> 2] |= (128 | code & 63) << SHIFT[i++ & 3];
              } else if (code < 55296 || code >= 57344) {
                blocks2[i >>> 2] |= (224 | code >>> 12) << SHIFT[i++ & 3];
                blocks2[i >>> 2] |= (128 | code >>> 6 & 63) << SHIFT[i++ & 3];
                blocks2[i >>> 2] |= (128 | code & 63) << SHIFT[i++ & 3];
              } else {
                code = 65536 + ((code & 1023) << 10 | message.charCodeAt(++index) & 1023);
                blocks2[i >>> 2] |= (240 | code >>> 18) << SHIFT[i++ & 3];
                blocks2[i >>> 2] |= (128 | code >>> 12 & 63) << SHIFT[i++ & 3];
                blocks2[i >>> 2] |= (128 | code >>> 6 & 63) << SHIFT[i++ & 3];
                blocks2[i >>> 2] |= (128 | code & 63) << SHIFT[i++ & 3];
              }
            }
          }
        } else {
          if (ARRAY_BUFFER) {
            for (i = this.start; index < length && i < 64; ++index) {
              buffer82[i++] = message[index];
            }
          } else {
            for (i = this.start; index < length && i < 64; ++index) {
              blocks2[i >>> 2] |= message[index] << SHIFT[i++ & 3];
            }
          }
        }
        this.lastByteIndex = i;
        this.bytes += i - this.start;
        if (i >= 64) {
          this.start = i - 64;
          this.hash();
          this.hashed = true;
        } else {
          this.start = i;
        }
      }
      if (this.bytes > 4294967295) {
        this.hBytes += this.bytes / 4294967296 << 0;
        this.bytes = this.bytes % 4294967296;
      }
      return this;
    };
    Md5.prototype.finalize = function() {
      if (this.finalized) {
        return;
      }
      this.finalized = true;
      var blocks2 = this.blocks, i = this.lastByteIndex;
      blocks2[i >>> 2] |= EXTRA[i & 3];
      if (i >= 56) {
        if (!this.hashed) {
          this.hash();
        }
        blocks2[0] = blocks2[16];
        blocks2[16] = blocks2[1] = blocks2[2] = blocks2[3] = blocks2[4] = blocks2[5] = blocks2[6] = blocks2[7] = blocks2[8] = blocks2[9] = blocks2[10] = blocks2[11] = blocks2[12] = blocks2[13] = blocks2[14] = blocks2[15] = 0;
      }
      blocks2[14] = this.bytes << 3;
      blocks2[15] = this.hBytes << 3 | this.bytes >>> 29;
      this.hash();
    };
    Md5.prototype.hash = function() {
      var a, b, c, d, bc, da, blocks2 = this.blocks;
      if (this.first) {
        a = blocks2[0] - 680876937;
        a = (a << 7 | a >>> 25) - 271733879 << 0;
        d = (-1732584194 ^ a & 2004318071) + blocks2[1] - 117830708;
        d = (d << 12 | d >>> 20) + a << 0;
        c = (-271733879 ^ d & (a ^ -271733879)) + blocks2[2] - 1126478375;
        c = (c << 17 | c >>> 15) + d << 0;
        b = (a ^ c & (d ^ a)) + blocks2[3] - 1316259209;
        b = (b << 22 | b >>> 10) + c << 0;
      } else {
        a = this.h0;
        b = this.h1;
        c = this.h2;
        d = this.h3;
        a += (d ^ b & (c ^ d)) + blocks2[0] - 680876936;
        a = (a << 7 | a >>> 25) + b << 0;
        d += (c ^ a & (b ^ c)) + blocks2[1] - 389564586;
        d = (d << 12 | d >>> 20) + a << 0;
        c += (b ^ d & (a ^ b)) + blocks2[2] + 606105819;
        c = (c << 17 | c >>> 15) + d << 0;
        b += (a ^ c & (d ^ a)) + blocks2[3] - 1044525330;
        b = (b << 22 | b >>> 10) + c << 0;
      }
      a += (d ^ b & (c ^ d)) + blocks2[4] - 176418897;
      a = (a << 7 | a >>> 25) + b << 0;
      d += (c ^ a & (b ^ c)) + blocks2[5] + 1200080426;
      d = (d << 12 | d >>> 20) + a << 0;
      c += (b ^ d & (a ^ b)) + blocks2[6] - 1473231341;
      c = (c << 17 | c >>> 15) + d << 0;
      b += (a ^ c & (d ^ a)) + blocks2[7] - 45705983;
      b = (b << 22 | b >>> 10) + c << 0;
      a += (d ^ b & (c ^ d)) + blocks2[8] + 1770035416;
      a = (a << 7 | a >>> 25) + b << 0;
      d += (c ^ a & (b ^ c)) + blocks2[9] - 1958414417;
      d = (d << 12 | d >>> 20) + a << 0;
      c += (b ^ d & (a ^ b)) + blocks2[10] - 42063;
      c = (c << 17 | c >>> 15) + d << 0;
      b += (a ^ c & (d ^ a)) + blocks2[11] - 1990404162;
      b = (b << 22 | b >>> 10) + c << 0;
      a += (d ^ b & (c ^ d)) + blocks2[12] + 1804603682;
      a = (a << 7 | a >>> 25) + b << 0;
      d += (c ^ a & (b ^ c)) + blocks2[13] - 40341101;
      d = (d << 12 | d >>> 20) + a << 0;
      c += (b ^ d & (a ^ b)) + blocks2[14] - 1502002290;
      c = (c << 17 | c >>> 15) + d << 0;
      b += (a ^ c & (d ^ a)) + blocks2[15] + 1236535329;
      b = (b << 22 | b >>> 10) + c << 0;
      a += (c ^ d & (b ^ c)) + blocks2[1] - 165796510;
      a = (a << 5 | a >>> 27) + b << 0;
      d += (b ^ c & (a ^ b)) + blocks2[6] - 1069501632;
      d = (d << 9 | d >>> 23) + a << 0;
      c += (a ^ b & (d ^ a)) + blocks2[11] + 643717713;
      c = (c << 14 | c >>> 18) + d << 0;
      b += (d ^ a & (c ^ d)) + blocks2[0] - 373897302;
      b = (b << 20 | b >>> 12) + c << 0;
      a += (c ^ d & (b ^ c)) + blocks2[5] - 701558691;
      a = (a << 5 | a >>> 27) + b << 0;
      d += (b ^ c & (a ^ b)) + blocks2[10] + 38016083;
      d = (d << 9 | d >>> 23) + a << 0;
      c += (a ^ b & (d ^ a)) + blocks2[15] - 660478335;
      c = (c << 14 | c >>> 18) + d << 0;
      b += (d ^ a & (c ^ d)) + blocks2[4] - 405537848;
      b = (b << 20 | b >>> 12) + c << 0;
      a += (c ^ d & (b ^ c)) + blocks2[9] + 568446438;
      a = (a << 5 | a >>> 27) + b << 0;
      d += (b ^ c & (a ^ b)) + blocks2[14] - 1019803690;
      d = (d << 9 | d >>> 23) + a << 0;
      c += (a ^ b & (d ^ a)) + blocks2[3] - 187363961;
      c = (c << 14 | c >>> 18) + d << 0;
      b += (d ^ a & (c ^ d)) + blocks2[8] + 1163531501;
      b = (b << 20 | b >>> 12) + c << 0;
      a += (c ^ d & (b ^ c)) + blocks2[13] - 1444681467;
      a = (a << 5 | a >>> 27) + b << 0;
      d += (b ^ c & (a ^ b)) + blocks2[2] - 51403784;
      d = (d << 9 | d >>> 23) + a << 0;
      c += (a ^ b & (d ^ a)) + blocks2[7] + 1735328473;
      c = (c << 14 | c >>> 18) + d << 0;
      b += (d ^ a & (c ^ d)) + blocks2[12] - 1926607734;
      b = (b << 20 | b >>> 12) + c << 0;
      bc = b ^ c;
      a += (bc ^ d) + blocks2[5] - 378558;
      a = (a << 4 | a >>> 28) + b << 0;
      d += (bc ^ a) + blocks2[8] - 2022574463;
      d = (d << 11 | d >>> 21) + a << 0;
      da = d ^ a;
      c += (da ^ b) + blocks2[11] + 1839030562;
      c = (c << 16 | c >>> 16) + d << 0;
      b += (da ^ c) + blocks2[14] - 35309556;
      b = (b << 23 | b >>> 9) + c << 0;
      bc = b ^ c;
      a += (bc ^ d) + blocks2[1] - 1530992060;
      a = (a << 4 | a >>> 28) + b << 0;
      d += (bc ^ a) + blocks2[4] + 1272893353;
      d = (d << 11 | d >>> 21) + a << 0;
      da = d ^ a;
      c += (da ^ b) + blocks2[7] - 155497632;
      c = (c << 16 | c >>> 16) + d << 0;
      b += (da ^ c) + blocks2[10] - 1094730640;
      b = (b << 23 | b >>> 9) + c << 0;
      bc = b ^ c;
      a += (bc ^ d) + blocks2[13] + 681279174;
      a = (a << 4 | a >>> 28) + b << 0;
      d += (bc ^ a) + blocks2[0] - 358537222;
      d = (d << 11 | d >>> 21) + a << 0;
      da = d ^ a;
      c += (da ^ b) + blocks2[3] - 722521979;
      c = (c << 16 | c >>> 16) + d << 0;
      b += (da ^ c) + blocks2[6] + 76029189;
      b = (b << 23 | b >>> 9) + c << 0;
      bc = b ^ c;
      a += (bc ^ d) + blocks2[9] - 640364487;
      a = (a << 4 | a >>> 28) + b << 0;
      d += (bc ^ a) + blocks2[12] - 421815835;
      d = (d << 11 | d >>> 21) + a << 0;
      da = d ^ a;
      c += (da ^ b) + blocks2[15] + 530742520;
      c = (c << 16 | c >>> 16) + d << 0;
      b += (da ^ c) + blocks2[2] - 995338651;
      b = (b << 23 | b >>> 9) + c << 0;
      a += (c ^ (b | ~d)) + blocks2[0] - 198630844;
      a = (a << 6 | a >>> 26) + b << 0;
      d += (b ^ (a | ~c)) + blocks2[7] + 1126891415;
      d = (d << 10 | d >>> 22) + a << 0;
      c += (a ^ (d | ~b)) + blocks2[14] - 1416354905;
      c = (c << 15 | c >>> 17) + d << 0;
      b += (d ^ (c | ~a)) + blocks2[5] - 57434055;
      b = (b << 21 | b >>> 11) + c << 0;
      a += (c ^ (b | ~d)) + blocks2[12] + 1700485571;
      a = (a << 6 | a >>> 26) + b << 0;
      d += (b ^ (a | ~c)) + blocks2[3] - 1894986606;
      d = (d << 10 | d >>> 22) + a << 0;
      c += (a ^ (d | ~b)) + blocks2[10] - 1051523;
      c = (c << 15 | c >>> 17) + d << 0;
      b += (d ^ (c | ~a)) + blocks2[1] - 2054922799;
      b = (b << 21 | b >>> 11) + c << 0;
      a += (c ^ (b | ~d)) + blocks2[8] + 1873313359;
      a = (a << 6 | a >>> 26) + b << 0;
      d += (b ^ (a | ~c)) + blocks2[15] - 30611744;
      d = (d << 10 | d >>> 22) + a << 0;
      c += (a ^ (d | ~b)) + blocks2[6] - 1560198380;
      c = (c << 15 | c >>> 17) + d << 0;
      b += (d ^ (c | ~a)) + blocks2[13] + 1309151649;
      b = (b << 21 | b >>> 11) + c << 0;
      a += (c ^ (b | ~d)) + blocks2[4] - 145523070;
      a = (a << 6 | a >>> 26) + b << 0;
      d += (b ^ (a | ~c)) + blocks2[11] - 1120210379;
      d = (d << 10 | d >>> 22) + a << 0;
      c += (a ^ (d | ~b)) + blocks2[2] + 718787259;
      c = (c << 15 | c >>> 17) + d << 0;
      b += (d ^ (c | ~a)) + blocks2[9] - 343485551;
      b = (b << 21 | b >>> 11) + c << 0;
      if (this.first) {
        this.h0 = a + 1732584193 << 0;
        this.h1 = b - 271733879 << 0;
        this.h2 = c - 1732584194 << 0;
        this.h3 = d + 271733878 << 0;
        this.first = false;
      } else {
        this.h0 = this.h0 + a << 0;
        this.h1 = this.h1 + b << 0;
        this.h2 = this.h2 + c << 0;
        this.h3 = this.h3 + d << 0;
      }
    };
    Md5.prototype.hex = function() {
      this.finalize();
      var h0 = this.h0, h1 = this.h1, h2 = this.h2, h3 = this.h3;
      return HEX_CHARS[h0 >>> 4 & 15] + HEX_CHARS[h0 & 15] + HEX_CHARS[h0 >>> 12 & 15] + HEX_CHARS[h0 >>> 8 & 15] + HEX_CHARS[h0 >>> 20 & 15] + HEX_CHARS[h0 >>> 16 & 15] + HEX_CHARS[h0 >>> 28 & 15] + HEX_CHARS[h0 >>> 24 & 15] + HEX_CHARS[h1 >>> 4 & 15] + HEX_CHARS[h1 & 15] + HEX_CHARS[h1 >>> 12 & 15] + HEX_CHARS[h1 >>> 8 & 15] + HEX_CHARS[h1 >>> 20 & 15] + HEX_CHARS[h1 >>> 16 & 15] + HEX_CHARS[h1 >>> 28 & 15] + HEX_CHARS[h1 >>> 24 & 15] + HEX_CHARS[h2 >>> 4 & 15] + HEX_CHARS[h2 & 15] + HEX_CHARS[h2 >>> 12 & 15] + HEX_CHARS[h2 >>> 8 & 15] + HEX_CHARS[h2 >>> 20 & 15] + HEX_CHARS[h2 >>> 16 & 15] + HEX_CHARS[h2 >>> 28 & 15] + HEX_CHARS[h2 >>> 24 & 15] + HEX_CHARS[h3 >>> 4 & 15] + HEX_CHARS[h3 & 15] + HEX_CHARS[h3 >>> 12 & 15] + HEX_CHARS[h3 >>> 8 & 15] + HEX_CHARS[h3 >>> 20 & 15] + HEX_CHARS[h3 >>> 16 & 15] + HEX_CHARS[h3 >>> 28 & 15] + HEX_CHARS[h3 >>> 24 & 15];
    };
    Md5.prototype.toString = Md5.prototype.hex;
    Md5.prototype.digest = function() {
      this.finalize();
      var h0 = this.h0, h1 = this.h1, h2 = this.h2, h3 = this.h3;
      return [
        h0 & 255,
        h0 >>> 8 & 255,
        h0 >>> 16 & 255,
        h0 >>> 24 & 255,
        h1 & 255,
        h1 >>> 8 & 255,
        h1 >>> 16 & 255,
        h1 >>> 24 & 255,
        h2 & 255,
        h2 >>> 8 & 255,
        h2 >>> 16 & 255,
        h2 >>> 24 & 255,
        h3 & 255,
        h3 >>> 8 & 255,
        h3 >>> 16 & 255,
        h3 >>> 24 & 255
      ];
    };
    Md5.prototype.array = Md5.prototype.digest;
    Md5.prototype.arrayBuffer = function() {
      this.finalize();
      var buffer2 = new ArrayBuffer(16);
      var blocks2 = new Uint32Array(buffer2);
      blocks2[0] = this.h0;
      blocks2[1] = this.h1;
      blocks2[2] = this.h2;
      blocks2[3] = this.h3;
      return buffer2;
    };
    Md5.prototype.buffer = Md5.prototype.arrayBuffer;
    Md5.prototype.base64 = function() {
      var v1, v2, v3, base64Str = "", bytes = this.array();
      for (var i = 0; i < 15; ) {
        v1 = bytes[i++];
        v2 = bytes[i++];
        v3 = bytes[i++];
        base64Str += BASE64_ENCODE_CHAR[v1 >>> 2] + BASE64_ENCODE_CHAR[(v1 << 4 | v2 >>> 4) & 63] + BASE64_ENCODE_CHAR[(v2 << 2 | v3 >>> 6) & 63] + BASE64_ENCODE_CHAR[v3 & 63];
      }
      v1 = bytes[i];
      base64Str += BASE64_ENCODE_CHAR[v1 >>> 2] + BASE64_ENCODE_CHAR[v1 << 4 & 63] + "==";
      return base64Str;
    };
    function HmacMd5(key, sharedMemory) {
      var i, result = formatMessage(key);
      key = result[0];
      if (result[1]) {
        var bytes = [], length = key.length, index = 0, code;
        for (i = 0; i < length; ++i) {
          code = key.charCodeAt(i);
          if (code < 128) {
            bytes[index++] = code;
          } else if (code < 2048) {
            bytes[index++] = 192 | code >>> 6;
            bytes[index++] = 128 | code & 63;
          } else if (code < 55296 || code >= 57344) {
            bytes[index++] = 224 | code >>> 12;
            bytes[index++] = 128 | code >>> 6 & 63;
            bytes[index++] = 128 | code & 63;
          } else {
            code = 65536 + ((code & 1023) << 10 | key.charCodeAt(++i) & 1023);
            bytes[index++] = 240 | code >>> 18;
            bytes[index++] = 128 | code >>> 12 & 63;
            bytes[index++] = 128 | code >>> 6 & 63;
            bytes[index++] = 128 | code & 63;
          }
        }
        key = bytes;
      }
      if (key.length > 64) {
        key = new Md5(true).update(key).array();
      }
      var oKeyPad = [], iKeyPad = [];
      for (i = 0; i < 64; ++i) {
        var b = key[i] || 0;
        oKeyPad[i] = 92 ^ b;
        iKeyPad[i] = 54 ^ b;
      }
      Md5.call(this, sharedMemory);
      this.update(iKeyPad);
      this.oKeyPad = oKeyPad;
      this.inner = true;
      this.sharedMemory = sharedMemory;
    }
    HmacMd5.prototype = new Md5();
    HmacMd5.prototype.finalize = function() {
      Md5.prototype.finalize.call(this);
      if (this.inner) {
        this.inner = false;
        var innerHash = this.array();
        Md5.call(this, this.sharedMemory);
        this.update(this.oKeyPad);
        this.update(innerHash);
        Md5.prototype.finalize.call(this);
      }
    };
    var exports = createMethod();
    exports.md5 = exports;
    exports.md5.hmac = createHmacMethod();
    if (COMMON_JS) {
      module.exports = exports;
    } else {
      root.md5 = exports;
    }
  })();
})(md5$1);
var md5Exports = md5$1.exports;
const md5 = /* @__PURE__ */ getDefaultExportFromCjs(md5Exports);
function md5Encode(str, upperCase = true) {
  if (!str)
    return "";
  const r = md5(String(str));
  return upperCase ? r.toUpperCase() : r;
}
const useUserStore = defineStore("user", () => {
  const token = ref(getToken());
  const userId = ref(getUserId());
  const userInfo = ref(null);
  const secretMd5 = ref("");
  const isLogin = computed(() => !!token.value);
  function init() {
    token.value = getToken();
    userId.value = getUserId();
    if (!secretMd5.value) {
      secretMd5.value = md5Encode(config.secret);
    }
  }
  function setAuth(t, uid) {
    token.value = t;
    setToken(t);
    if (uid) {
      userId.value = uid;
      setUserId(uid);
    }
  }
  function setUserInfo(info) {
    userInfo.value = info;
  }
  function logout() {
    clearAuth();
    token.value = "";
    userId.value = "";
    userInfo.value = null;
  }
  return { token, userId, userInfo, secretMd5, isLogin, init, setAuth, setUserInfo, logout };
});
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
function buildStatsMembers(teamName) {
  const base = teamName === "红队" ? hostMembers : guestMembers;
  return base.slice(0, 6).map((m, i) => ({
    number: m.number,
    name: m.name,
    score: 8 + i * 2,
    assists: i % 2 === 0 ? 2 : 1,
    backboard: 3 + i
  }));
}
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
  number: 8,
  hostMembers: buildStatsMembers("红队"),
  guestMembers: buildStatsMembers("蓝队")
});
ok({ ...gameDetail.data, type: E(2, "足球"), hostTeamName: "飞虎队", guestTeamName: "雄鹰队", hostTeamScore: 1, guestTeamScore: 1, name: "测试杯-足球半决赛", leagueName: "测试杯" });
function mockResolve(options) {
  return null;
}
let redirectingToLogin = false;
function onTokenExpired() {
  useUserStore().logout();
  if (redirectingToLogin)
    return;
  const pages = getCurrentPages();
  const cur = pages[pages.length - 1];
  if (cur && cur.route && cur.route.indexOf("pages/login/index") !== -1)
    return;
  redirectingToLogin = true;
  uni.showToast({ title: "登录已过期，请重新登录", icon: "none" });
  uni.reLaunch({
    url: "/pages/login/index",
    complete: () => {
      setTimeout(() => {
        redirectingToLogin = false;
      }, 1e3);
    }
  });
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
    formatAppLog("log", "at api/request.js:77", "%c【MOCK】" + method.toUpperCase() + " " + url, "color:#e6a23c;font-weight:bold", mocked);
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
          if (res.statusCode === 401) {
            onTokenExpired();
            reject(body || res);
            return;
          }
          if (!hideError) {
            const errMsg = body && (body.msg || body.message) || `请求失败(${res.statusCode})`;
            uni.showToast({ title: errMsg, icon: "none" });
          }
          reject(body || res);
          return;
        }
        if (body && config.tokenExpiredCodes.includes(body.code)) {
          onTokenExpired();
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
const getLiveGameList = (gameId) => request({ url: "live/stream/game-list", query: { gameId } });
const compose = (params) => request({ url: "live/stream/compose", method: "POST", data: params });
const _imports_0 = "/static/mipmap-xxhdpi/watermark.png";
const _imports_1 = "/static/mipmap-xxhdpi/new_bifen.png";
const _imports_2 = "/static/mipmap-xxhdpi/sectionbackground.png";
const _imports_3 = "/static/mipmap-xxhdpi/bottom.png";
const _style_0 = { "live-push": { "": { "flex": 1, "backgroundColor": "#000000" } }, "pusher": { "": { "position": "absolute", "top": 0, "left": 0, "right": 0, "bottom": 0 } }, "overlay": { "": { "position": "absolute", "top": 0, "left": 0, "right": 0, "bottom": 0 } }, "top": { "": { "position": "absolute", "top": 0, "left": 0, "right": 0, "flexDirection": "row", "alignItems": "center", "paddingTop": "16rpx", "paddingRight": "20rpx", "paddingBottom": "16rpx", "paddingLeft": "20rpx" } }, "status": { "": { "flex": 1, "textAlign": "center", "color": "#ffffff", "fontSize": "16rpx" } }, "bottom": { "": { "position": "absolute", "bottom": 0, "left": 0, "flexDirection": "column", "alignItems": "flex-start", "paddingTop": "30rpx", "paddingRight": "30rpx", "paddingBottom": "30rpx", "paddingLeft": "30rpx" } }, "bottom-row": { "": { "flexDirection": "row", "marginBottom": "56rpx" } }, "gray-btn": { "": { "paddingTop": "5rpx", "paddingRight": "13rpx", "paddingBottom": "5rpx", "paddingLeft": "13rpx", "backgroundColor": "rgba(0,0,0,0.06)", "color": "#ffffff", "fontSize": "16rpx", "lineHeight": "27rpx", "marginRight": "11rpx" } }, "preview-layer": { "": { "position": "absolute", "top": 0, "left": 0, "right": 0, "bottom": 0 } }, "pv-top-left": { "": { "position": "absolute", "top": "24rpx", "left": "24rpx", "flexDirection": "row", "alignItems": "center" } }, "pv-league-logo": { "": { "width": "36rpx", "height": "36rpx", "borderRadius": "18rpx", "marginRight": "10rpx" } }, "pv-league-name": { "": { "fontSize": "20rpx", "color": "#ffffff", "paddingTop": "2rpx", "paddingRight": "10rpx", "paddingBottom": "2rpx", "paddingLeft": "10rpx", "backgroundColor": "rgba(0,0,0,0.4)", "borderRadius": "4rpx" } }, "pv-watermark-clip": { "": { "position": "absolute", "top": "64rpx", "right": "24rpx", "width": "57.6rpx", "height": "19rpx", "overflow": "hidden", "alignItems": "flex-start" } }, "pv-watermark-img": { "": { "width": "120rpx", "height": "19rpx" } }, "pv-scorebar-wrap": { "": { "position": "absolute", "bottom": "56rpx", "left": 0, "right": 0, "alignItems": "center" } }, "pv-scorebar": { "": { "position": "relative", "width": "600rpx", "height": "44rpx", "flexDirection": "row", "alignItems": "center", "justifyContent": "center" } }, "pv-bifen-bg": { "": { "position": "absolute", "top": 0, "left": 0, "right": 0, "bottom": 0, "width": "600rpx", "height": "44rpx" } }, "pv-team-logo": { "": { "width": "36rpx", "height": "36rpx", "borderRadius": "18rpx", "marginTop": 0, "marginRight": "4rpx", "marginBottom": 0, "marginLeft": "4rpx" } }, "pv-cell": { "": { "flex": 1, "alignItems": "center", "justifyContent": "center" } }, "pv-name-cell": { "": { "minWidth": 0 } }, "pv-team-name": { "": { "fontSize": "15rpx", "color": "#ffffff", "lines": 1, "textOverflow": "ellipsis" } }, "pv-score": { "": { "fontSize": "22rpx", "color": "#ffffff", "fontWeight": "bold" } }, "pv-section-text": { "": { "fontSize": "14rpx", "color": "#ffffff" } }, "pv-foul": { "": { "width": "60rpx", "height": "8rpx", "marginTop": "4rpx" } }, "pv-sub-row": { "": { "flexDirection": "row", "marginTop": "4rpx" } }, "pv-sub-text": { "": { "fontSize": "14rpx", "color": "#ffffff", "marginTop": 0, "marginRight": "8rpx", "marginBottom": 0, "marginLeft": "8rpx" } }, "pv-msg": { "": { "position": "absolute", "bottom": "24rpx", "left": 0, "right": 0, "alignItems": "center" } }, "pv-msg-text": { "": { "fontSize": "20rpx", "color": "#ffffff", "paddingTop": "4rpx", "paddingRight": "24rpx", "paddingBottom": "4rpx", "paddingLeft": "24rpx", "backgroundColor": "rgba(0,0,0,0.5)", "borderRadius": "4rpx" } }, "pv-section-end": { "": { "position": "absolute", "top": 0, "left": 0, "right": 0, "alignItems": "center", "paddingTop": "30rpx" } }, "pv-se-banner": { "": { "position": "relative", "width": "480rpx", "height": "60rpx" } }, "pv-se-bg": { "": { "position": "absolute", "top": 0, "left": 0, "right": 0, "bottom": 0, "width": "480rpx", "height": "60rpx" } }, "pv-se-content": { "": { "flex": 1, "flexDirection": "column", "alignItems": "center", "justifyContent": "center" } }, "pv-se-league": { "": { "fontSize": "11rpx", "color": "#ffffff" } }, "pv-se-row": { "": { "flexDirection": "row", "alignItems": "center", "justifyContent": "center", "marginTop": "3rpx" } }, "pv-se-name": { "": { "fontSize": "10rpx", "color": "#000000", "lines": 1 } }, "pv-se-name-left": { "": { "marginRight": "12rpx" } }, "pv-se-name-right": { "": { "marginLeft": "12rpx" } }, "pv-se-score": { "": { "fontSize": "14rpx", "color": "#ffffff", "fontWeight": "bold" } }, "pv-se-score-left": { "": { "marginRight": "12rpx" } }, "pv-se-score-right": { "": { "marginLeft": "12rpx" } }, "pv-se-section": { "": { "fontSize": "10rpx", "color": "#ffffff" } }, "pv-se-stats": { "": { "position": "relative", "width": "480rpx", "flexDirection": "row", "marginTop": "4rpx", "paddingTop": "4rpx", "paddingRight": 0, "paddingBottom": "4rpx", "paddingLeft": 0 } }, "pv-se-stats-bg": { "": { "position": "absolute", "top": 0, "left": 0, "right": 0, "bottom": 0 } }, "pv-se-col": { "": { "flex": 1, "flexDirection": "column" } }, "pv-se-tr": { "": { "flexDirection": "row", "height": "32rpx", "alignItems": "center" } }, "pv-se-td": { "": { "flex": 1, "textAlign": "center", "fontSize": "11rpx", "color": "#ffffff" } }, "pv-se-td-name": { "": { "flex": 1.6, "textAlign": "left", "paddingLeft": "10rpx", "lines": 1, "textOverflow": "ellipsis" } } };
const MAX_PUSH_RETRY = 5;
const _sfc_main = {
  __name: "push",
  setup(__props, { expose: __expose }) {
    __expose();
    const publishUrl = ref("");
    const gameId = ref("");
    const sport = ref("basketball");
    const streamId = ref("");
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
    const hostMembers2 = ref([]);
    const guestMembers2 = ref([]);
    let msgTimer = null;
    function setMsg(text) {
      msg.value = text;
      if (msgTimer)
        clearTimeout(msgTimer);
      if (text) {
        msgTimer = setTimeout(() => {
          msg.value = "";
          if (!sectionEnd.value)
            pushScore();
        }, 5e3);
      }
    }
    function foulImg(n) {
      const c = Math.max(0, Math.min(5, Number(n) || 0));
      return `/static/mipmap-xxhdpi/fangui${c}.png`;
    }
    const foulHostImg = computed(() => foulImg(hostFoul.value));
    const foulGuestImg = computed(() => foulImg(guestFoul.value));
    const showScore = ref(true);
    const sectionEnd = ref(false);
    let sectionEndTimer = null;
    const sectionPage = ref(1);
    let sectionPageTimer = null;
    let wsEverOpened = false;
    let wantPush = false;
    let pushRetryTimer = null;
    let pushRetryCount = 0;
    let pushConnecting = false;
    let pushConnectingTimer = null;
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
        formatAppLog("log", "at pages/live/push.nvue:216", "logToFile err: " + e);
      }
    }
    onLoad((opt) => {
      plus.screen.lockOrientation("landscape-primary");
      publishUrl.value = decodeURIComponent(opt.livepublish || "");
      gameId.value = opt.gameId || "";
      sport.value = opt.sport || "basketball";
      homeName.value = opt.name || "直播";
      formatAppLog("log", "at pages/live/push.nvue:230", "[push] publishUrl=", publishUrl.value, "gameId=", gameId.value);
      logToFile("[push] onLoad url=" + publishUrl.value + " gameId=" + gameId.value + " name=" + opt.name);
      loadGameDetail();
      connectScore();
      findCurrentStream().then((it) => {
        if (it && it.id) {
          streamId.value = it.id;
          logToFile("[push] streamId=" + streamId.value);
        } else {
          logToFile("[push] 未找到当前直播流记录");
        }
      });
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
        formatAppLog("log", "at pages/live/push.nvue:267", "[push] permissions granted=", granted, "pusher=", pusher.value);
        logToFile("[push] onReady permissions=" + granted + " pusher=" + (pusher.value ? "yes" : "null"));
        if (!granted) {
          uni.showToast({ title: "需要相机/麦克风权限", icon: "none" });
          logToFile("[push] 权限未授予，无法预览");
          return;
        }
        let tries = 0;
        const tryPreview = () => {
          if (pusher.value) {
            formatAppLog("log", "at pages/live/push.nvue:278", "[push] startPreview 调用");
            logToFile("[push] startPreview 调用，组件已挂载");
            pusher.value.startPreview();
            logToFile("[push] startPreview 调用完成");
            pushScore();
            logToFile("[push] startPreview 后立即 pushScore 一次");
          } else if (tries++ < 20) {
            setTimeout(tryPreview, 100);
          } else {
            formatAppLog("log", "at pages/live/push.nvue:288", "[push] pusher ref 始终为 null -- livepusherview 组件未注册/未挂载");
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
      getGameDetail(gameId.value, sport.value).then((res) => {
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
        hostMembers2.value = page.hostMembers || [];
        guestMembers2.value = page.guestMembers || [];
        logToFile("[push] loadGameDetail OK host=" + homeName.value + " guest=" + guestName.value + " score=" + hostScore.value + ":" + guestScore.value + " members=" + hostMembers2.value.length + "/" + guestMembers2.value.length);
        if (!sectionEnd.value)
          pushScore();
      });
    }
    function connectScore() {
      statusText.value = "比分接口连接中…";
      connectSocket(
        "push" + gameId.value,
        (data) => {
          logToFile("[push] ws msg " + JSON.stringify(data));
          if (data.hostTeamScore != null)
            hostScore.value = data.hostTeamScore;
          if (data.guestTeamScore != null)
            guestScore.value = data.guestTeamScore;
          if (data.section != null)
            section.value = data.section;
          if (data.hostTeamFoul != null)
            hostFoul.value = data.hostTeamFoul;
          if (data.guestTeamFoul != null)
            guestFoul.value = data.guestTeamFoul;
          if (data.msg != null && data.msg !== "小节结束")
            setMsg(data.msg);
          if (data.leagueStageName != null)
            leagueStageName.value = data.leagueStageName;
          if (data.runStatus === "SECTION_END" || data.msg === "小节结束") {
            showSectionEnd();
          } else if (!sectionEnd.value) {
            pushScore();
          }
        },
        (event) => {
          if (event === "open") {
            statusText.value = "比分接口已连接";
            logToFile("[push] ws open group=push" + gameId.value);
            if (wsEverOpened) {
              logToFile("[push] ws 重连成功，补拉比分");
              loadGameDetail();
            }
            wsEverOpened = true;
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
      if (pushing.value) {
        uni.showToast({ title: "已在直播中", icon: "none" });
        return;
      }
      if (pushConnecting) {
        uni.showToast({ title: "正在连接，请稍候", icon: "none" });
        return;
      }
      logToFile("[push] startPush url=" + publishUrl.value);
      if (pushRetryTimer) {
        clearTimeout(pushRetryTimer);
        pushRetryTimer = null;
      }
      wantPush = true;
      pushConnecting = true;
      if (pushConnectingTimer)
        clearTimeout(pushConnectingTimer);
      pushConnectingTimer = setTimeout(() => {
        pushConnecting = false;
        pushConnectingTimer = null;
      }, 15e3);
      pusher.value.startPush(publishUrl.value);
      statusText.value = "推流连接中…";
    }
    function stopPush() {
      wantPush = false;
      if (pushRetryTimer) {
        clearTimeout(pushRetryTimer);
        pushRetryTimer = null;
      }
      pushRetryCount = 0;
      pushConnecting = false;
      if (pushConnectingTimer) {
        clearTimeout(pushConnectingTimer);
        pushConnectingTimer = null;
      }
      if (pusher.value) {
        pusher.value.stopPush();
        pushing.value = false;
        statusText.value = "已结束";
        logToFile("[push] stopPush");
      }
    }
    function schedulePushRetry() {
      if (pushRetryTimer)
        return;
      if (pushRetryCount >= MAX_PUSH_RETRY) {
        statusText.value = "直播中断，请点「开始直播」重连";
        uni.showToast({ title: "自动重连失败，请手动重连", icon: "none" });
        logToFile("[push] 自动重推达上限(" + MAX_PUSH_RETRY + "次)，等待手动重连");
        return;
      }
      const delay = Math.min(3e3 * (pushRetryCount + 1), 15e3);
      pushRetryCount++;
      statusText.value = "网络中断，" + Math.round(delay / 1e3) + "秒后自动重连…";
      logToFile("[push] 断网，" + delay + "ms 后自动重推(第" + pushRetryCount + "次)");
      pushRetryTimer = setTimeout(() => {
        pushRetryTimer = null;
        refreshPublishUrl().then(() => {
          if (wantPush)
            startPush();
        });
      }, delay);
    }
    function clearConnectingLock() {
      pushConnecting = false;
      if (pushConnectingTimer) {
        clearTimeout(pushConnectingTimer);
        pushConnectingTimer = null;
      }
    }
    function findCurrentStream() {
      return getLiveGameList(gameId.value).then((res) => {
        if (res.code !== 1 || !res.data || !res.data.length)
          return null;
        const m = publishUrl.value.match(/game\/([^?]+)/);
        if (!m)
          return null;
        return res.data.find((it) => (it.publish || "").indexOf("game/" + m[1]) !== -1) || null;
      }).catch(() => null);
    }
    function refreshPublishUrl() {
      return findCurrentStream().then((hit) => {
        if (!hit)
          return;
        if (hit.id)
          streamId.value = hit.id;
        if (hit.publish && hit.publish !== publishUrl.value) {
          publishUrl.value = hit.publish;
          logToFile("[push] 重推前已刷新推流地址");
        }
      });
    }
    function switchCamera() {
      if (pusher.value)
        pusher.value.switchCamera();
    }
    function toggleScore() {
      showScore.value = !showScore.value;
      pushScore();
    }
    function showSectionEnd() {
      sectionEnd.value = true;
      if (sectionEndTimer)
        clearTimeout(sectionEndTimer);
      if (sectionPageTimer) {
        clearInterval(sectionPageTimer);
        sectionPageTimer = null;
      }
      sectionPage.value = 1;
      burnSectionEnd();
      if (hostMembers2.value.length > 6 || guestMembers2.value.length > 6) {
        logToFile("[push] 报幕分页轮播 members=" + hostMembers2.value.length + "/" + guestMembers2.value.length);
        sectionPageTimer = setInterval(() => {
          sectionPage.value = sectionPage.value === 1 ? 2 : 1;
          burnSectionEnd();
        }, 2e3);
      }
      getGameDetail(gameId.value, sport.value).then((res) => {
        if (res.code !== 1 || !sectionEnd.value)
          return;
        const detail = res.data || {};
        hostMembers2.value = detail.hostMembers || [];
        guestMembers2.value = detail.guestMembers || [];
        logToFile("[push] 报幕刷新球员统计 members=" + hostMembers2.value.length + "/" + guestMembers2.value.length);
        burnSectionEnd();
      });
      sectionEndTimer = setTimeout(() => {
        sectionEnd.value = false;
        if (sectionPageTimer) {
          clearInterval(sectionPageTimer);
          sectionPageTimer = null;
        }
        pushScore();
      }, 1e4);
    }
    function pageMembers(list) {
      if (list.length > 6) {
        return sectionPage.value === 1 ? list.slice(0, 6) : list.slice(6, 12);
      }
      return list;
    }
    const pvHostMembers = computed(() => pageMembers(hostMembers2.value));
    const pvGuestMembers = computed(() => pageMembers(guestMembers2.value));
    function burnSectionEnd() {
      if (!pusher.value)
        return;
      const host = pageMembers(hostMembers2.value);
      const guest = pageMembers(guestMembers2.value);
      logToFile("[push] 小节结束 报幕(第" + sectionPage.value + "页) section=" + section.value + " " + hostScore.value + ":" + guestScore.value + " members=" + host.length + "/" + guest.length);
      pusher.value.showSectionEnd({
        leagueName: leagueName.value,
        hostName: homeName.value,
        guestName: guestName.value,
        hostScore: String(hostScore.value),
        guestScore: String(guestScore.value),
        section: section.value,
        hostLogo: homeLogo.value,
        guestLogo: guestLogo.value,
        hostMembers: host,
        guestMembers: guest
      });
    }
    function onState(e) {
      const d = e.detail || {};
      formatAppLog("log", "at pages/live/push.nvue:585", "[pusher] state", d);
      logToFile("[pusher] state code=" + d.code + " msg=" + d.msg);
      if (d.msg)
        statusText.value = d.msg;
      if (d.code === 1005) {
        pushing.value = true;
        pushRetryCount = 0;
        clearConnectingLock();
      } else if (d.code === -1305) {
        pushing.value = false;
        clearConnectingLock();
        if (wantPush)
          schedulePushRetry();
      }
    }
    function onCompose() {
      if (!streamId.value) {
        uni.showToast({ title: "直播流信息未获取到，请稍后再试", icon: "none" });
        return;
      }
      compose({ id: streamId.value }).then((res) => {
        uni.showToast({ title: res.code === 1 ? "已生成回放" : res.msg || "生成失败", icon: "none" });
      });
    }
    function back() {
      if (msgTimer)
        clearTimeout(msgTimer);
      if (sectionEndTimer)
        clearTimeout(sectionEndTimer);
      if (sectionPageTimer)
        clearInterval(sectionPageTimer);
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
      if (msgTimer)
        clearTimeout(msgTimer);
      if (sectionEndTimer)
        clearTimeout(sectionEndTimer);
      if (sectionPageTimer)
        clearInterval(sectionPageTimer);
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
    const __returned__ = { publishUrl, gameId, sport, streamId, homeName, guestName, homeLogo, guestLogo, hostScore, guestScore, section, hostFoul, guestFoul, leagueName, leagueLogo, leagueStageName, msg, hostMembers: hostMembers2, guestMembers: guestMembers2, get msgTimer() {
      return msgTimer;
    }, set msgTimer(v) {
      msgTimer = v;
    }, setMsg, foulImg, foulHostImg, foulGuestImg, showScore, sectionEnd, get sectionEndTimer() {
      return sectionEndTimer;
    }, set sectionEndTimer(v) {
      sectionEndTimer = v;
    }, sectionPage, get sectionPageTimer() {
      return sectionPageTimer;
    }, set sectionPageTimer(v) {
      sectionPageTimer = v;
    }, get wsEverOpened() {
      return wsEverOpened;
    }, set wsEverOpened(v) {
      wsEverOpened = v;
    }, get wantPush() {
      return wantPush;
    }, set wantPush(v) {
      wantPush = v;
    }, get pushRetryTimer() {
      return pushRetryTimer;
    }, set pushRetryTimer(v) {
      pushRetryTimer = v;
    }, get pushRetryCount() {
      return pushRetryCount;
    }, set pushRetryCount(v) {
      pushRetryCount = v;
    }, MAX_PUSH_RETRY, get pushConnecting() {
      return pushConnecting;
    }, set pushConnecting(v) {
      pushConnecting = v;
    }, get pushConnectingTimer() {
      return pushConnectingTimer;
    }, set pushConnectingTimer(v) {
      pushConnectingTimer = v;
    }, pushing, statusText, pusher, logToFile, ensurePermissions, loadGameDetail, connectScore, reconnectScore, pushScore, startPush, stopPush, schedulePushRetry, clearConnectingLock, findCurrentStream, refreshPublishUrl, switchCamera, toggleScore, showSectionEnd, pageMembers, pvHostMembers, pvGuestMembers, burnSectionEnd, onState, onCompose, back, ref, computed, get onLoad() {
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
    }, get getLiveGameList() {
      return getLiveGameList;
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
            createElementVNode("u-image", {
              class: "pv-bifen-bg",
              src: _imports_1,
              mode: "scaleToFill"
            }),
            $setup.homeLogo ? (openBlock(), createElementBlock("u-image", {
              key: 0,
              class: "pv-team-logo pv-logo-home",
              src: $setup.homeLogo,
              mode: "aspectFill"
            }, null, 8, ["src"])) : createCommentVNode("v-if", true),
            createElementVNode("view", { class: "pv-cell pv-name-cell" }, [
              createElementVNode(
                "u-text",
                { class: "pv-team-name" },
                toDisplayString($setup.homeName),
                1
                /* TEXT */
              )
            ]),
            createElementVNode("view", { class: "pv-cell pv-score-cell" }, [
              createElementVNode(
                "u-text",
                { class: "pv-score" },
                toDisplayString($setup.hostScore),
                1
                /* TEXT */
              ),
              createElementVNode("u-image", {
                class: "pv-foul",
                src: $setup.foulHostImg,
                mode: "scaleToFill"
              }, null, 8, ["src"])
            ]),
            createElementVNode("view", { class: "pv-cell pv-sec-cell" }, [
              $setup.section ? (openBlock(), createElementBlock(
                "u-text",
                {
                  key: 0,
                  class: "pv-section-text"
                },
                toDisplayString($setup.section),
                1
                /* TEXT */
              )) : createCommentVNode("v-if", true)
            ]),
            createElementVNode("view", { class: "pv-cell pv-score-cell" }, [
              createElementVNode(
                "u-text",
                { class: "pv-score" },
                toDisplayString($setup.guestScore),
                1
                /* TEXT */
              ),
              createElementVNode("u-image", {
                class: "pv-foul",
                src: $setup.foulGuestImg,
                mode: "scaleToFill"
              }, null, 8, ["src"])
            ]),
            createElementVNode("view", { class: "pv-cell pv-name-cell" }, [
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
              class: "pv-team-logo pv-logo-guest",
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
            )
          ])
        ])) : createCommentVNode("v-if", true),
        $setup.sectionEnd ? (openBlock(), createElementBlock("view", {
          key: 1,
          class: "pv-section-end"
        }, [
          createElementVNode("view", { class: "pv-se-banner" }, [
            createElementVNode("u-image", {
              class: "pv-se-bg",
              src: _imports_2,
              mode: "scaleToFill"
            }),
            createElementVNode("view", { class: "pv-se-content" }, [
              createElementVNode(
                "u-text",
                { class: "pv-se-league" },
                toDisplayString($setup.leagueName),
                1
                /* TEXT */
              ),
              createElementVNode("view", { class: "pv-se-row" }, [
                createElementVNode(
                  "u-text",
                  { class: "pv-se-name pv-se-name-left" },
                  toDisplayString($setup.homeName),
                  1
                  /* TEXT */
                ),
                createElementVNode(
                  "u-text",
                  { class: "pv-se-score pv-se-score-left" },
                  toDisplayString($setup.hostScore),
                  1
                  /* TEXT */
                ),
                $setup.section ? (openBlock(), createElementBlock(
                  "u-text",
                  {
                    key: 0,
                    class: "pv-se-section"
                  },
                  toDisplayString($setup.section),
                  1
                  /* TEXT */
                )) : createCommentVNode("v-if", true),
                createElementVNode(
                  "u-text",
                  { class: "pv-se-score pv-se-score-right" },
                  toDisplayString($setup.guestScore),
                  1
                  /* TEXT */
                ),
                createElementVNode(
                  "u-text",
                  { class: "pv-se-name pv-se-name-right" },
                  toDisplayString($setup.guestName),
                  1
                  /* TEXT */
                )
              ])
            ])
          ]),
          createElementVNode("view", { class: "pv-se-stats" }, [
            createElementVNode("u-image", {
              class: "pv-se-stats-bg",
              src: _imports_3,
              mode: "scaleToFill"
            }),
            createElementVNode("view", { class: "pv-se-col" }, [
              createElementVNode("view", { class: "pv-se-tr pv-se-th" }, [
                createElementVNode("u-text", { class: "pv-se-td pv-se-td-name" }, "球号/姓名"),
                createElementVNode("u-text", { class: "pv-se-td" }, "得分"),
                createElementVNode("u-text", { class: "pv-se-td" }, "助攻"),
                createElementVNode("u-text", { class: "pv-se-td" }, "篮板")
              ]),
              (openBlock(true), createElementBlock(
                Fragment,
                null,
                renderList($setup.pvHostMembers, (m, i) => {
                  return openBlock(), createElementBlock("view", {
                    key: "h" + i,
                    class: "pv-se-tr"
                  }, [
                    createElementVNode(
                      "u-text",
                      { class: "pv-se-td pv-se-td-name" },
                      toDisplayString(m.number) + " " + toDisplayString(m.name),
                      1
                      /* TEXT */
                    ),
                    createElementVNode(
                      "u-text",
                      { class: "pv-se-td" },
                      toDisplayString(m.score || 0),
                      1
                      /* TEXT */
                    ),
                    createElementVNode(
                      "u-text",
                      { class: "pv-se-td" },
                      toDisplayString(m.assists || 0),
                      1
                      /* TEXT */
                    ),
                    createElementVNode(
                      "u-text",
                      { class: "pv-se-td" },
                      toDisplayString(m.backboard || 0),
                      1
                      /* TEXT */
                    )
                  ]);
                }),
                128
                /* KEYED_FRAGMENT */
              ))
            ]),
            createElementVNode("view", { class: "pv-se-col" }, [
              createElementVNode("view", { class: "pv-se-tr pv-se-th" }, [
                createElementVNode("u-text", { class: "pv-se-td pv-se-td-name" }, "球号/姓名"),
                createElementVNode("u-text", { class: "pv-se-td" }, "得分"),
                createElementVNode("u-text", { class: "pv-se-td" }, "助攻"),
                createElementVNode("u-text", { class: "pv-se-td" }, "篮板")
              ]),
              (openBlock(true), createElementBlock(
                Fragment,
                null,
                renderList($setup.pvGuestMembers, (m, i) => {
                  return openBlock(), createElementBlock("view", {
                    key: "g" + i,
                    class: "pv-se-tr"
                  }, [
                    createElementVNode(
                      "u-text",
                      { class: "pv-se-td pv-se-td-name" },
                      toDisplayString(m.number) + " " + toDisplayString(m.name),
                      1
                      /* TEXT */
                    ),
                    createElementVNode(
                      "u-text",
                      { class: "pv-se-td" },
                      toDisplayString(m.score || 0),
                      1
                      /* TEXT */
                    ),
                    createElementVNode(
                      "u-text",
                      { class: "pv-se-td" },
                      toDisplayString(m.assists || 0),
                      1
                      /* TEXT */
                    ),
                    createElementVNode(
                      "u-text",
                      { class: "pv-se-td" },
                      toDisplayString(m.backboard || 0),
                      1
                      /* TEXT */
                    )
                  ]);
                }),
                128
                /* KEYED_FRAGMENT */
              ))
            ])
          ])
        ])) : createCommentVNode("v-if", true),
        $setup.msg && $setup.msg !== "小节结束" ? (openBlock(), createElementBlock("view", {
          key: 2,
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
            style: { "height": "40rpx" },
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
            createElementVNode(
              "u-text",
              {
                class: "gray-btn",
                onClick: $setup.startPush
              },
              toDisplayString($setup.pushing ? "直播中" : "开始直播"),
              1
              /* TEXT */
            ),
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
