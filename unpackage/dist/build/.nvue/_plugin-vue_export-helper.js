import { isInSSRComponentSetup, injectHook, getCurrentInstance } from "vue";
const ON_SHOW = "onShow";
const ON_HIDE = "onHide";
const ON_LOAD = "onLoad";
const ON_READY = "onReady";
const ON_UNLOAD = "onUnload";
const ON_BACK_PRESS = "onBackPress";
function formatAppLog(type, filename, ...args) {
  if (uni.__log__) {
    uni.__log__(type, filename, ...args);
  } else {
    console[type].apply(console, [...args, filename]);
  }
}
const createLifeCycleHook = (lifecycle, flag = 0) => (hook, target = getCurrentInstance()) => {
  !isInSSRComponentSetup && injectHook(lifecycle, hook, target);
};
const onShow = /* @__PURE__ */ createLifeCycleHook(
  ON_SHOW,
  1 | 2
  /* HookFlags.PAGE */
);
const onHide = /* @__PURE__ */ createLifeCycleHook(
  ON_HIDE,
  1 | 2
  /* HookFlags.PAGE */
);
const onLoad = /* @__PURE__ */ createLifeCycleHook(
  ON_LOAD,
  2
  /* HookFlags.PAGE */
);
const onReady = /* @__PURE__ */ createLifeCycleHook(
  ON_READY,
  2
  /* HookFlags.PAGE */
);
const onUnload = /* @__PURE__ */ createLifeCycleHook(
  ON_UNLOAD,
  2
  /* HookFlags.PAGE */
);
const onBackPress = /* @__PURE__ */ createLifeCycleHook(
  ON_BACK_PRESS,
  2
  /* HookFlags.PAGE */
);
const _export_sfc = (sfc, props) => {
  const target = sfc.__vccOpts || sfc;
  for (const [key, val] of props) {
    target[key] = val;
  }
  return target;
};
export {
  _export_sfc as _,
  onReady as a,
  onUnload as b,
  onBackPress as c,
  onShow as d,
  onHide as e,
  formatAppLog as f,
  onLoad as o
};
