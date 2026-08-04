import { isInSSRComponentSetup, injectHook, getCurrentInstance } from "vue";
const ON_LOAD = "onLoad";
const ON_READY = "onReady";
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
  formatAppLog as f,
  onLoad as o
};
