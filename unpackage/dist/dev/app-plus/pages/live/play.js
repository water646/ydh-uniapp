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
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
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

  // F:/项目文件/uniapp版本/unpackage/dist/dev/.nvue/pages/live/play.js
  var import_vue2 = __toESM(require_vue());

  // F:/项目文件/uniapp版本/unpackage/dist/dev/.nvue/_plugin-vue_export-helper.js
  var import_vue = __toESM(require_vue());
  var ON_LOAD = "onLoad";
  var createLifeCycleHook = (lifecycle, flag = 0) => (hook, target = (0, import_vue.getCurrentInstance)()) => {
    !import_vue.isInSSRComponentSetup && (0, import_vue.injectHook)(lifecycle, hook, target);
  };
  var onLoad = /* @__PURE__ */ createLifeCycleHook(
    ON_LOAD,
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

  // F:/项目文件/uniapp版本/unpackage/dist/dev/.nvue/pages/live/play.js
  var _imports_0 = "/static/mipmap-xxhdpi/black_back.png";
  var _style_0 = { "live-play": { "": { "flex": 1, "backgroundColor": "#000000" } }, "player": { "": { "flex": 1 } }, "no-live": { "": { "position": "absolute", "top": 0, "left": 0, "right": 0, "bottom": 0, "alignItems": "center", "justifyContent": "center" } }, "no-live-text": { "": { "fontSize": "15rpx", "color": "#999999" } }, "back": { "": { "position": "absolute", "top": "24rpx", "left": "24rpx", "width": "64rpx", "height": "64rpx", "borderRadius": "32rpx", "backgroundColor": "rgba(0,0,0,0.4)", "alignItems": "center", "justifyContent": "center", "transform": "rotate(90deg)", "transformOrigin": "50% 50%" } }, "back-icon": { "": { "width": "100rpx", "height": "100rpx" } } };
  var _sfc_main = {
    __name: "play",
    setup(__props, { expose: __expose }) {
      __expose();
      const playUrl = (0, import_vue2.ref)("");
      const playing = (0, import_vue2.ref)(false);
      let playerCtx = null;
      const instance = (0, import_vue2.getCurrentInstance)();
      onLoad((opt) => {
        plus.screen.lockOrientation("portrait-primary");
        playUrl.value = decodeURIComponent(opt.url || opt.livepublish || "");
        setTimeout(() => {
          playerCtx = uni.createLivePlayerContext("player", instance && instance.proxy);
          if (playerCtx) {
            playerCtx.play({
              success: () => {
                playing.value = true;
              }
            });
          }
        }, 300);
      });
      (0, import_vue2.onUnmounted)(() => {
        if (playerCtx)
          playerCtx.stop();
        plus.screen.unlockOrientation();
      });
      function onState(e) {
        if (e.detail && e.detail.code === 2004) {
          playing.value = true;
        }
      }
      function onError(e) {
        playing.value = false;
      }
      function back() {
        uni.navigateBack();
      }
      const __returned__ = { playUrl, playing, get playerCtx() {
        return playerCtx;
      }, set playerCtx(v) {
        playerCtx = v;
      }, instance, onState, onError, back, ref: import_vue2.ref, onUnmounted: import_vue2.onUnmounted, getCurrentInstance: import_vue2.getCurrentInstance, get onLoad() {
        return onLoad;
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
      (0, import_vue2.createElementVNode)("view", { class: "live-play" }, [
        (0, import_vue2.createElementVNode)("live-player", {
          id: "player",
          class: "player",
          src: $setup.playUrl,
          mode: "live",
          autoplay: true,
          muted: false,
          objectFit: "contain",
          onStatechange: $setup.onState,
          onError: $setup.onError
        }, null, 40, ["src"]),
        !$setup.playing ? ((0, import_vue2.openBlock)(), (0, import_vue2.createElementBlock)("view", {
          key: 0,
          class: "no-live"
        }, [
          (0, import_vue2.createElementVNode)("u-text", { class: "no-live-text" }, "\u5F53\u524D\u65E0\u76F4\u64AD")
        ])) : (0, import_vue2.createCommentVNode)("v-if", true),
        (0, import_vue2.createElementVNode)("view", {
          class: "back",
          onClick: $setup.back
        }, [
          (0, import_vue2.createElementVNode)("u-image", {
            class: "back-icon",
            src: _imports_0,
            mode: "aspectFit"
          })
        ])
      ])
    ]);
  }
  var play = /* @__PURE__ */ _export_sfc(_sfc_main, [["render", _sfc_render], ["styles", [_style_0]], ["__file", "F:/\u9879\u76EE\u6587\u4EF6/uniapp\u7248\u672C/pages/live/play.nvue"]]);

  // <stdin>
  var webview = plus.webview.currentWebview();
  if (webview) {
    const __pageId = parseInt(webview.id);
    const __pagePath = "pages/live/play";
    let __pageQuery = {};
    try {
      __pageQuery = JSON.parse(webview.__query__);
    } catch (e) {
    }
    play.mpType = "page";
    const app = Vue.createPageApp(play, { $store: getApp({ allowDefault: true }).$store, __pageId, __pagePath, __pageQuery });
    app.provide("__globalStyles", Vue.useCssStyles([...__uniConfig.styles, ...play.styles || []]));
    app.mount("#root");
  }
})();
