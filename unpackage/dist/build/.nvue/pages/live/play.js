import { ref, getCurrentInstance, onUnmounted, openBlock, createElementBlock, createElementVNode, createCommentVNode } from "vue";
import { _ as _export_sfc, o as onLoad, d as onShow, e as onHide } from "../../_plugin-vue_export-helper.js";
const _imports_0 = "/static/mipmap-xxhdpi/black_back.png";
const _style_0 = { "live-play": { "": { "flex": 1, "backgroundColor": "#000000" } }, "player": { "": { "flex": 1 } }, "no-live": { "": { "position": "absolute", "top": 0, "left": 0, "right": 0, "bottom": 0, "alignItems": "center", "justifyContent": "center" } }, "no-live-text": { "": { "fontSize": "15rpx", "color": "#999999" } }, "back": { "": { "position": "absolute", "top": "24rpx", "left": "24rpx", "width": "64rpx", "height": "64rpx", "borderRadius": "32rpx", "backgroundColor": "rgba(0,0,0,0.4)", "alignItems": "center", "justifyContent": "center", "transform": "rotate(90deg)", "transformOrigin": "50% 50%" } }, "back-icon": { "": { "width": "100rpx", "height": "100rpx" } } };
const _sfc_main = {
  __name: "play",
  setup(__props) {
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
    onShow(() => {
      plus.navigator.setStatusBarStyle("light");
    });
    onHide(() => {
      plus.navigator.setStatusBarStyle("dark");
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
    return (_ctx, _cache) => {
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
            src: playUrl.value,
            mode: "live",
            autoplay: true,
            muted: false,
            objectFit: "contain",
            onStatechange: onState,
            onError
          }, null, 40, ["src"]),
          !playing.value ? (openBlock(), createElementBlock("view", {
            key: 0,
            class: "no-live"
          }, [
            createElementVNode("u-text", { class: "no-live-text" }, "当前无直播")
          ])) : createCommentVNode("", true),
          createElementVNode("view", {
            class: "back",
            onClick: back
          }, [
            createElementVNode("u-image", {
              class: "back-icon",
              src: _imports_0,
              mode: "aspectFit"
            })
          ])
        ])
      ]);
    };
  }
};
const play = /* @__PURE__ */ _export_sfc(_sfc_main, [["styles", [_style_0]]]);
export {
  play as default
};
