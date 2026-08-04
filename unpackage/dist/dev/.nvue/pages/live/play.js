import { ref, getCurrentInstance, onUnmounted, openBlock, createElementBlock, createElementVNode, createCommentVNode } from "vue";
import { _ as _export_sfc, o as onLoad } from "../../_plugin-vue_export-helper.js";
const _style_0 = { "live-play": { "": { "flex": 1, "backgroundColor": "#000000" } }, "player": { "": { "flex": 1 } }, "no-live": { "": { "position": "absolute", "top": 0, "left": 0, "right": 0, "bottom": 0, "alignItems": "center", "justifyContent": "center" } }, "no-live-text": { "": { "fontSize": "15rpx", "color": "#999999" } }, "back": { "": { "position": "absolute", "top": "12rpx", "left": "12rpx", "width": "32rpx", "height": "32rpx", "borderRadius": "16rpx", "backgroundColor": "rgba(0,0,0,0.4)", "alignItems": "center", "justifyContent": "center", "transform": "rotate(90deg)", "transformOrigin": "50% 50%" } }, "back-icon": { "": { "fontSize": "22rpx", "color": "#ffffff" } } };
const _sfc_main = {
  __name: "play",
  setup(__props, { expose: __expose }) {
    __expose();
    const playUrl = ref("");
    const playing = ref(false);
    let playerCtx = null;
    const instance = getCurrentInstance();
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
    onUnmounted(() => {
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
    }, instance, onState, onError, back, ref, onUnmounted, getCurrentInstance, get onLoad() {
      return onLoad;
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
    createElementVNode("view", { class: "live-play" }, [
      createElementVNode("live-player", {
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
      !$setup.playing ? (openBlock(), createElementBlock("view", {
        key: 0,
        class: "no-live"
      }, [
        createElementVNode("u-text", { class: "no-live-text" }, "当前无直播")
      ])) : createCommentVNode("v-if", true),
      createElementVNode("view", {
        class: "back",
        onClick: $setup.back
      }, [
        createElementVNode("u-text", { class: "back-icon" }, "‹")
      ])
    ])
  ]);
}
const play = /* @__PURE__ */ _export_sfc(_sfc_main, [["render", _sfc_render], ["styles", [_style_0]], ["__file", "F:/项目文件/uniapp版本/pages/live/play.nvue"]]);
export {
  play as default
};
