if (typeof Promise !== "undefined" && !Promise.prototype.finally) {
  Promise.prototype.finally = function(callback) {
    const promise = this.constructor;
    return this.then(
      (value) => promise.resolve(callback()).then(() => value),
      (reason) => promise.resolve(callback()).then(() => {
        throw reason;
      })
    );
  };
}
;
if (typeof uni !== "undefined" && uni && uni.requireGlobal) {
  const global2 = uni.requireGlobal();
  ArrayBuffer = global2.ArrayBuffer;
  Int8Array = global2.Int8Array;
  Uint8Array = global2.Uint8Array;
  Uint8ClampedArray = global2.Uint8ClampedArray;
  Int16Array = global2.Int16Array;
  Uint16Array = global2.Uint16Array;
  Int32Array = global2.Int32Array;
  Uint32Array = global2.Uint32Array;
  Float32Array = global2.Float32Array;
  Float64Array = global2.Float64Array;
  BigInt64Array = global2.BigInt64Array;
  BigUint64Array = global2.BigUint64Array;
}
;
if (uni.restoreGlobal) {
  uni.restoreGlobal(Vue, weex, plus, setTimeout, clearTimeout, setInterval, clearInterval);
}
(function(vue) {
  "use strict";
  const ON_SHOW = "onShow";
  const ON_HIDE = "onHide";
  const ON_LOAD = "onLoad";
  const ON_BACK_PRESS = "onBackPress";
  function formatAppLog(type, filename, ...args) {
    if (uni.__log__) {
      uni.__log__(type, filename, ...args);
    } else {
      console[type].apply(console, [...args, filename]);
    }
  }
  function resolveEasycom(component, easycom) {
    return typeof component === "string" ? easycom : component;
  }
  const createLifeCycleHook = (lifecycle, flag2 = 0) => (hook, target = vue.getCurrentInstance()) => {
    !vue.isInSSRComponentSetup && vue.injectHook(lifecycle, hook, target);
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
  const onBackPress = /* @__PURE__ */ createLifeCycleHook(
    ON_BACK_PRESS,
    2
    /* HookFlags.PAGE */
  );
  var isVue2 = false;
  function set(target, key, val) {
    if (Array.isArray(target)) {
      target.length = Math.max(target.length, key);
      target.splice(key, 1, val);
      return val;
    }
    target[key] = val;
    return val;
  }
  function del(target, key) {
    if (Array.isArray(target)) {
      target.splice(key, 1);
      return;
    }
    delete target[key];
  }
  function getDevtoolsGlobalHook() {
    return getTarget().__VUE_DEVTOOLS_GLOBAL_HOOK__;
  }
  function getTarget() {
    return typeof navigator !== "undefined" && typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : {};
  }
  const isProxyAvailable = typeof Proxy === "function";
  const HOOK_SETUP = "devtools-plugin:setup";
  const HOOK_PLUGIN_SETTINGS_SET = "plugin:settings:set";
  let supported;
  let perf;
  function isPerformanceSupported() {
    var _a;
    if (supported !== void 0) {
      return supported;
    }
    if (typeof window !== "undefined" && window.performance) {
      supported = true;
      perf = window.performance;
    } else if (typeof global !== "undefined" && ((_a = global.perf_hooks) === null || _a === void 0 ? void 0 : _a.performance)) {
      supported = true;
      perf = global.perf_hooks.performance;
    } else {
      supported = false;
    }
    return supported;
  }
  function now() {
    return isPerformanceSupported() ? perf.now() : Date.now();
  }
  class ApiProxy {
    constructor(plugin, hook) {
      this.target = null;
      this.targetQueue = [];
      this.onQueue = [];
      this.plugin = plugin;
      this.hook = hook;
      const defaultSettings = {};
      if (plugin.settings) {
        for (const id in plugin.settings) {
          const item = plugin.settings[id];
          defaultSettings[id] = item.defaultValue;
        }
      }
      const localSettingsSaveId = `__vue-devtools-plugin-settings__${plugin.id}`;
      let currentSettings = Object.assign({}, defaultSettings);
      try {
        const raw = localStorage.getItem(localSettingsSaveId);
        const data = JSON.parse(raw);
        Object.assign(currentSettings, data);
      } catch (e) {
      }
      this.fallbacks = {
        getSettings() {
          return currentSettings;
        },
        setSettings(value) {
          try {
            localStorage.setItem(localSettingsSaveId, JSON.stringify(value));
          } catch (e) {
          }
          currentSettings = value;
        },
        now() {
          return now();
        }
      };
      if (hook) {
        hook.on(HOOK_PLUGIN_SETTINGS_SET, (pluginId, value) => {
          if (pluginId === this.plugin.id) {
            this.fallbacks.setSettings(value);
          }
        });
      }
      this.proxiedOn = new Proxy({}, {
        get: (_target, prop) => {
          if (this.target) {
            return this.target.on[prop];
          } else {
            return (...args) => {
              this.onQueue.push({
                method: prop,
                args
              });
            };
          }
        }
      });
      this.proxiedTarget = new Proxy({}, {
        get: (_target, prop) => {
          if (this.target) {
            return this.target[prop];
          } else if (prop === "on") {
            return this.proxiedOn;
          } else if (Object.keys(this.fallbacks).includes(prop)) {
            return (...args) => {
              this.targetQueue.push({
                method: prop,
                args,
                resolve: () => {
                }
              });
              return this.fallbacks[prop](...args);
            };
          } else {
            return (...args) => {
              return new Promise((resolve) => {
                this.targetQueue.push({
                  method: prop,
                  args,
                  resolve
                });
              });
            };
          }
        }
      });
    }
    async setRealTarget(target) {
      this.target = target;
      for (const item of this.onQueue) {
        this.target.on[item.method](...item.args);
      }
      for (const item of this.targetQueue) {
        item.resolve(await this.target[item.method](...item.args));
      }
    }
  }
  function setupDevtoolsPlugin(pluginDescriptor, setupFn) {
    const descriptor = pluginDescriptor;
    const target = getTarget();
    const hook = getDevtoolsGlobalHook();
    const enableProxy = isProxyAvailable && descriptor.enableEarlyProxy;
    if (hook && (target.__VUE_DEVTOOLS_PLUGIN_API_AVAILABLE__ || !enableProxy)) {
      hook.emit(HOOK_SETUP, pluginDescriptor, setupFn);
    } else {
      const proxy = enableProxy ? new ApiProxy(descriptor, hook) : null;
      const list = target.__VUE_DEVTOOLS_PLUGINS__ = target.__VUE_DEVTOOLS_PLUGINS__ || [];
      list.push({
        pluginDescriptor: descriptor,
        setupFn,
        proxy
      });
      if (proxy)
        setupFn(proxy.proxiedTarget);
    }
  }
  /*!
   * pinia v2.1.7
   * (c) 2023 Eduardo San Martin Morote
   * @license MIT
   */
  let activePinia;
  const setActivePinia = (pinia) => activePinia = pinia;
  const piniaSymbol = Symbol("pinia");
  function isPlainObject$2(o) {
    return o && typeof o === "object" && Object.prototype.toString.call(o) === "[object Object]" && typeof o.toJSON !== "function";
  }
  var MutationType;
  (function(MutationType2) {
    MutationType2["direct"] = "direct";
    MutationType2["patchObject"] = "patch object";
    MutationType2["patchFunction"] = "patch function";
  })(MutationType || (MutationType = {}));
  const IS_CLIENT = typeof window !== "undefined";
  const USE_DEVTOOLS = IS_CLIENT;
  const _global = /* @__PURE__ */ (() => typeof window === "object" && window.window === window ? window : typeof self === "object" && self.self === self ? self : typeof global === "object" && global.global === global ? global : typeof globalThis === "object" ? globalThis : { HTMLElement: null })();
  function bom(blob, { autoBom = false } = {}) {
    if (autoBom && /^\s*(?:text\/\S*|application\/xml|\S*\/\S*\+xml)\s*;.*charset\s*=\s*utf-8/i.test(blob.type)) {
      return new Blob([String.fromCharCode(65279), blob], { type: blob.type });
    }
    return blob;
  }
  function download(url2, name, opts) {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", url2);
    xhr.responseType = "blob";
    xhr.onload = function() {
      saveAs(xhr.response, name, opts);
    };
    xhr.onerror = function() {
      console.error("could not download file");
    };
    xhr.send();
  }
  function corsEnabled(url2) {
    const xhr = new XMLHttpRequest();
    xhr.open("HEAD", url2, false);
    try {
      xhr.send();
    } catch (e) {
    }
    return xhr.status >= 200 && xhr.status <= 299;
  }
  function click(node) {
    try {
      node.dispatchEvent(new MouseEvent("click"));
    } catch (e) {
      const evt = document.createEvent("MouseEvents");
      evt.initMouseEvent("click", true, true, window, 0, 0, 0, 80, 20, false, false, false, false, 0, null);
      node.dispatchEvent(evt);
    }
  }
  const _navigator = typeof navigator === "object" ? navigator : { userAgent: "" };
  const isMacOSWebView = /* @__PURE__ */ (() => /Macintosh/.test(_navigator.userAgent) && /AppleWebKit/.test(_navigator.userAgent) && !/Safari/.test(_navigator.userAgent))();
  const saveAs = !IS_CLIENT ? () => {
  } : (
    // Use download attribute first if possible (#193 Lumia mobile) unless this is a macOS WebView or mini program
    typeof HTMLAnchorElement !== "undefined" && "download" in HTMLAnchorElement.prototype && !isMacOSWebView ? downloadSaveAs : (
      // Use msSaveOrOpenBlob as a second approach
      "msSaveOrOpenBlob" in _navigator ? msSaveAs : (
        // Fallback to using FileReader and a popup
        fileSaverSaveAs
      )
    )
  );
  function downloadSaveAs(blob, name = "download", opts) {
    const a = document.createElement("a");
    a.download = name;
    a.rel = "noopener";
    if (typeof blob === "string") {
      a.href = blob;
      if (a.origin !== location.origin) {
        if (corsEnabled(a.href)) {
          download(blob, name, opts);
        } else {
          a.target = "_blank";
          click(a);
        }
      } else {
        click(a);
      }
    } else {
      a.href = URL.createObjectURL(blob);
      setTimeout(function() {
        URL.revokeObjectURL(a.href);
      }, 4e4);
      setTimeout(function() {
        click(a);
      }, 0);
    }
  }
  function msSaveAs(blob, name = "download", opts) {
    if (typeof blob === "string") {
      if (corsEnabled(blob)) {
        download(blob, name, opts);
      } else {
        const a = document.createElement("a");
        a.href = blob;
        a.target = "_blank";
        setTimeout(function() {
          click(a);
        });
      }
    } else {
      navigator.msSaveOrOpenBlob(bom(blob, opts), name);
    }
  }
  function fileSaverSaveAs(blob, name, opts, popup) {
    popup = popup || open("", "_blank");
    if (popup) {
      popup.document.title = popup.document.body.innerText = "downloading...";
    }
    if (typeof blob === "string")
      return download(blob, name, opts);
    const force = blob.type === "application/octet-stream";
    const isSafari = /constructor/i.test(String(_global.HTMLElement)) || "safari" in _global;
    const isChromeIOS = /CriOS\/[\d]+/.test(navigator.userAgent);
    if ((isChromeIOS || force && isSafari || isMacOSWebView) && typeof FileReader !== "undefined") {
      const reader = new FileReader();
      reader.onloadend = function() {
        let url2 = reader.result;
        if (typeof url2 !== "string") {
          popup = null;
          throw new Error("Wrong reader.result type");
        }
        url2 = isChromeIOS ? url2 : url2.replace(/^data:[^;]*;/, "data:attachment/file;");
        if (popup) {
          popup.location.href = url2;
        } else {
          location.assign(url2);
        }
        popup = null;
      };
      reader.readAsDataURL(blob);
    } else {
      const url2 = URL.createObjectURL(blob);
      if (popup)
        popup.location.assign(url2);
      else
        location.href = url2;
      popup = null;
      setTimeout(function() {
        URL.revokeObjectURL(url2);
      }, 4e4);
    }
  }
  function toastMessage(message, type) {
    const piniaMessage = "🍍 " + message;
    if (typeof __VUE_DEVTOOLS_TOAST__ === "function") {
      __VUE_DEVTOOLS_TOAST__(piniaMessage, type);
    } else if (type === "error") {
      console.error(piniaMessage);
    } else if (type === "warn") {
      console.warn(piniaMessage);
    } else {
      console.log(piniaMessage);
    }
  }
  function isPinia(o) {
    return "_a" in o && "install" in o;
  }
  function checkClipboardAccess() {
    if (!("clipboard" in navigator)) {
      toastMessage(`Your browser doesn't support the Clipboard API`, "error");
      return true;
    }
  }
  function checkNotFocusedError(error2) {
    if (error2 instanceof Error && error2.message.toLowerCase().includes("document is not focused")) {
      toastMessage('You need to activate the "Emulate a focused page" setting in the "Rendering" panel of devtools.', "warn");
      return true;
    }
    return false;
  }
  async function actionGlobalCopyState(pinia) {
    if (checkClipboardAccess())
      return;
    try {
      await navigator.clipboard.writeText(JSON.stringify(pinia.state.value));
      toastMessage("Global state copied to clipboard.");
    } catch (error2) {
      if (checkNotFocusedError(error2))
        return;
      toastMessage(`Failed to serialize the state. Check the console for more details.`, "error");
      console.error(error2);
    }
  }
  async function actionGlobalPasteState(pinia) {
    if (checkClipboardAccess())
      return;
    try {
      loadStoresState(pinia, JSON.parse(await navigator.clipboard.readText()));
      toastMessage("Global state pasted from clipboard.");
    } catch (error2) {
      if (checkNotFocusedError(error2))
        return;
      toastMessage(`Failed to deserialize the state from clipboard. Check the console for more details.`, "error");
      console.error(error2);
    }
  }
  async function actionGlobalSaveState(pinia) {
    try {
      saveAs(new Blob([JSON.stringify(pinia.state.value)], {
        type: "text/plain;charset=utf-8"
      }), "pinia-state.json");
    } catch (error2) {
      toastMessage(`Failed to export the state as JSON. Check the console for more details.`, "error");
      console.error(error2);
    }
  }
  let fileInput;
  function getFileOpener() {
    if (!fileInput) {
      fileInput = document.createElement("input");
      fileInput.type = "file";
      fileInput.accept = ".json";
    }
    function openFile() {
      return new Promise((resolve, reject) => {
        fileInput.onchange = async () => {
          const files = fileInput.files;
          if (!files)
            return resolve(null);
          const file = files.item(0);
          if (!file)
            return resolve(null);
          return resolve({ text: await file.text(), file });
        };
        fileInput.oncancel = () => resolve(null);
        fileInput.onerror = reject;
        fileInput.click();
      });
    }
    return openFile;
  }
  async function actionGlobalOpenStateFile(pinia) {
    try {
      const open2 = getFileOpener();
      const result = await open2();
      if (!result)
        return;
      const { text, file } = result;
      loadStoresState(pinia, JSON.parse(text));
      toastMessage(`Global state imported from "${file.name}".`);
    } catch (error2) {
      toastMessage(`Failed to import the state from JSON. Check the console for more details.`, "error");
      console.error(error2);
    }
  }
  function loadStoresState(pinia, state) {
    for (const key in state) {
      const storeState = pinia.state.value[key];
      if (storeState) {
        Object.assign(storeState, state[key]);
      } else {
        pinia.state.value[key] = state[key];
      }
    }
  }
  function formatDisplay(display) {
    return {
      _custom: {
        display
      }
    };
  }
  const PINIA_ROOT_LABEL = "🍍 Pinia (root)";
  const PINIA_ROOT_ID = "_root";
  function formatStoreForInspectorTree(store) {
    return isPinia(store) ? {
      id: PINIA_ROOT_ID,
      label: PINIA_ROOT_LABEL
    } : {
      id: store.$id,
      label: store.$id
    };
  }
  function formatStoreForInspectorState(store) {
    if (isPinia(store)) {
      const storeNames = Array.from(store._s.keys());
      const storeMap = store._s;
      const state2 = {
        state: storeNames.map((storeId) => ({
          editable: true,
          key: storeId,
          value: store.state.value[storeId]
        })),
        getters: storeNames.filter((id) => storeMap.get(id)._getters).map((id) => {
          const store2 = storeMap.get(id);
          return {
            editable: false,
            key: id,
            value: store2._getters.reduce((getters, key) => {
              getters[key] = store2[key];
              return getters;
            }, {})
          };
        })
      };
      return state2;
    }
    const state = {
      state: Object.keys(store.$state).map((key) => ({
        editable: true,
        key,
        value: store.$state[key]
      }))
    };
    if (store._getters && store._getters.length) {
      state.getters = store._getters.map((getterName) => ({
        editable: false,
        key: getterName,
        value: store[getterName]
      }));
    }
    if (store._customProperties.size) {
      state.customProperties = Array.from(store._customProperties).map((key) => ({
        editable: true,
        key,
        value: store[key]
      }));
    }
    return state;
  }
  function formatEventData(events) {
    if (!events)
      return {};
    if (Array.isArray(events)) {
      return events.reduce((data, event) => {
        data.keys.push(event.key);
        data.operations.push(event.type);
        data.oldValue[event.key] = event.oldValue;
        data.newValue[event.key] = event.newValue;
        return data;
      }, {
        oldValue: {},
        keys: [],
        operations: [],
        newValue: {}
      });
    } else {
      return {
        operation: formatDisplay(events.type),
        key: formatDisplay(events.key),
        oldValue: events.oldValue,
        newValue: events.newValue
      };
    }
  }
  function formatMutationType(type) {
    switch (type) {
      case MutationType.direct:
        return "mutation";
      case MutationType.patchFunction:
        return "$patch";
      case MutationType.patchObject:
        return "$patch";
      default:
        return "unknown";
    }
  }
  let isTimelineActive = true;
  const componentStateTypes = [];
  const MUTATIONS_LAYER_ID = "pinia:mutations";
  const INSPECTOR_ID = "pinia";
  const { assign: assign$1 } = Object;
  const getStoreType = (id) => "🍍 " + id;
  function registerPiniaDevtools(app, pinia) {
    setupDevtoolsPlugin({
      id: "dev.esm.pinia",
      label: "Pinia 🍍",
      logo: "https://pinia.vuejs.org/logo.svg",
      packageName: "pinia",
      homepage: "https://pinia.vuejs.org",
      componentStateTypes,
      app
    }, (api) => {
      if (typeof api.now !== "function") {
        toastMessage("You seem to be using an outdated version of Vue Devtools. Are you still using the Beta release instead of the stable one? You can find the links at https://devtools.vuejs.org/guide/installation.html.");
      }
      api.addTimelineLayer({
        id: MUTATIONS_LAYER_ID,
        label: `Pinia 🍍`,
        color: 15064968
      });
      api.addInspector({
        id: INSPECTOR_ID,
        label: "Pinia 🍍",
        icon: "storage",
        treeFilterPlaceholder: "Search stores",
        actions: [
          {
            icon: "content_copy",
            action: () => {
              actionGlobalCopyState(pinia);
            },
            tooltip: "Serialize and copy the state"
          },
          {
            icon: "content_paste",
            action: async () => {
              await actionGlobalPasteState(pinia);
              api.sendInspectorTree(INSPECTOR_ID);
              api.sendInspectorState(INSPECTOR_ID);
            },
            tooltip: "Replace the state with the content of your clipboard"
          },
          {
            icon: "save",
            action: () => {
              actionGlobalSaveState(pinia);
            },
            tooltip: "Save the state as a JSON file"
          },
          {
            icon: "folder_open",
            action: async () => {
              await actionGlobalOpenStateFile(pinia);
              api.sendInspectorTree(INSPECTOR_ID);
              api.sendInspectorState(INSPECTOR_ID);
            },
            tooltip: "Import the state from a JSON file"
          }
        ],
        nodeActions: [
          {
            icon: "restore",
            tooltip: 'Reset the state (with "$reset")',
            action: (nodeId) => {
              const store = pinia._s.get(nodeId);
              if (!store) {
                toastMessage(`Cannot reset "${nodeId}" store because it wasn't found.`, "warn");
              } else if (typeof store.$reset !== "function") {
                toastMessage(`Cannot reset "${nodeId}" store because it doesn't have a "$reset" method implemented.`, "warn");
              } else {
                store.$reset();
                toastMessage(`Store "${nodeId}" reset.`);
              }
            }
          }
        ]
      });
      api.on.inspectComponent((payload, ctx) => {
        const proxy = payload.componentInstance && payload.componentInstance.proxy;
        if (proxy && proxy._pStores) {
          const piniaStores = payload.componentInstance.proxy._pStores;
          Object.values(piniaStores).forEach((store) => {
            payload.instanceData.state.push({
              type: getStoreType(store.$id),
              key: "state",
              editable: true,
              value: store._isOptionsAPI ? {
                _custom: {
                  value: vue.toRaw(store.$state),
                  actions: [
                    {
                      icon: "restore",
                      tooltip: "Reset the state of this store",
                      action: () => store.$reset()
                    }
                  ]
                }
              } : (
                // NOTE: workaround to unwrap transferred refs
                Object.keys(store.$state).reduce((state, key) => {
                  state[key] = store.$state[key];
                  return state;
                }, {})
              )
            });
            if (store._getters && store._getters.length) {
              payload.instanceData.state.push({
                type: getStoreType(store.$id),
                key: "getters",
                editable: false,
                value: store._getters.reduce((getters, key) => {
                  try {
                    getters[key] = store[key];
                  } catch (error2) {
                    getters[key] = error2;
                  }
                  return getters;
                }, {})
              });
            }
          });
        }
      });
      api.on.getInspectorTree((payload) => {
        if (payload.app === app && payload.inspectorId === INSPECTOR_ID) {
          let stores = [pinia];
          stores = stores.concat(Array.from(pinia._s.values()));
          payload.rootNodes = (payload.filter ? stores.filter((store) => "$id" in store ? store.$id.toLowerCase().includes(payload.filter.toLowerCase()) : PINIA_ROOT_LABEL.toLowerCase().includes(payload.filter.toLowerCase())) : stores).map(formatStoreForInspectorTree);
        }
      });
      api.on.getInspectorState((payload) => {
        if (payload.app === app && payload.inspectorId === INSPECTOR_ID) {
          const inspectedStore = payload.nodeId === PINIA_ROOT_ID ? pinia : pinia._s.get(payload.nodeId);
          if (!inspectedStore) {
            return;
          }
          if (inspectedStore) {
            payload.state = formatStoreForInspectorState(inspectedStore);
          }
        }
      });
      api.on.editInspectorState((payload, ctx) => {
        if (payload.app === app && payload.inspectorId === INSPECTOR_ID) {
          const inspectedStore = payload.nodeId === PINIA_ROOT_ID ? pinia : pinia._s.get(payload.nodeId);
          if (!inspectedStore) {
            return toastMessage(`store "${payload.nodeId}" not found`, "error");
          }
          const { path } = payload;
          if (!isPinia(inspectedStore)) {
            if (path.length !== 1 || !inspectedStore._customProperties.has(path[0]) || path[0] in inspectedStore.$state) {
              path.unshift("$state");
            }
          } else {
            path.unshift("state");
          }
          isTimelineActive = false;
          payload.set(inspectedStore, path, payload.state.value);
          isTimelineActive = true;
        }
      });
      api.on.editComponentState((payload) => {
        if (payload.type.startsWith("🍍")) {
          const storeId = payload.type.replace(/^🍍\s*/, "");
          const store = pinia._s.get(storeId);
          if (!store) {
            return toastMessage(`store "${storeId}" not found`, "error");
          }
          const { path } = payload;
          if (path[0] !== "state") {
            return toastMessage(`Invalid path for store "${storeId}":
${path}
Only state can be modified.`);
          }
          path[0] = "$state";
          isTimelineActive = false;
          payload.set(store, path, payload.state.value);
          isTimelineActive = true;
        }
      });
    });
  }
  function addStoreToDevtools(app, store) {
    if (!componentStateTypes.includes(getStoreType(store.$id))) {
      componentStateTypes.push(getStoreType(store.$id));
    }
    setupDevtoolsPlugin({
      id: "dev.esm.pinia",
      label: "Pinia 🍍",
      logo: "https://pinia.vuejs.org/logo.svg",
      packageName: "pinia",
      homepage: "https://pinia.vuejs.org",
      componentStateTypes,
      app,
      settings: {
        logStoreChanges: {
          label: "Notify about new/deleted stores",
          type: "boolean",
          defaultValue: true
        }
        // useEmojis: {
        //   label: 'Use emojis in messages ⚡️',
        //   type: 'boolean',
        //   defaultValue: true,
        // },
      }
    }, (api) => {
      const now2 = typeof api.now === "function" ? api.now.bind(api) : Date.now;
      store.$onAction(({ after, onError, name, args }) => {
        const groupId = runningActionId++;
        api.addTimelineEvent({
          layerId: MUTATIONS_LAYER_ID,
          event: {
            time: now2(),
            title: "🛫 " + name,
            subtitle: "start",
            data: {
              store: formatDisplay(store.$id),
              action: formatDisplay(name),
              args
            },
            groupId
          }
        });
        after((result) => {
          activeAction = void 0;
          api.addTimelineEvent({
            layerId: MUTATIONS_LAYER_ID,
            event: {
              time: now2(),
              title: "🛬 " + name,
              subtitle: "end",
              data: {
                store: formatDisplay(store.$id),
                action: formatDisplay(name),
                args,
                result
              },
              groupId
            }
          });
        });
        onError((error2) => {
          activeAction = void 0;
          api.addTimelineEvent({
            layerId: MUTATIONS_LAYER_ID,
            event: {
              time: now2(),
              logType: "error",
              title: "💥 " + name,
              subtitle: "end",
              data: {
                store: formatDisplay(store.$id),
                action: formatDisplay(name),
                args,
                error: error2
              },
              groupId
            }
          });
        });
      }, true);
      store._customProperties.forEach((name) => {
        vue.watch(() => vue.unref(store[name]), (newValue, oldValue) => {
          api.notifyComponentUpdate();
          api.sendInspectorState(INSPECTOR_ID);
          if (isTimelineActive) {
            api.addTimelineEvent({
              layerId: MUTATIONS_LAYER_ID,
              event: {
                time: now2(),
                title: "Change",
                subtitle: name,
                data: {
                  newValue,
                  oldValue
                },
                groupId: activeAction
              }
            });
          }
        }, { deep: true });
      });
      store.$subscribe(({ events, type }, state) => {
        api.notifyComponentUpdate();
        api.sendInspectorState(INSPECTOR_ID);
        if (!isTimelineActive)
          return;
        const eventData = {
          time: now2(),
          title: formatMutationType(type),
          data: assign$1({ store: formatDisplay(store.$id) }, formatEventData(events)),
          groupId: activeAction
        };
        if (type === MutationType.patchFunction) {
          eventData.subtitle = "⤵️";
        } else if (type === MutationType.patchObject) {
          eventData.subtitle = "🧩";
        } else if (events && !Array.isArray(events)) {
          eventData.subtitle = events.type;
        }
        if (events) {
          eventData.data["rawEvent(s)"] = {
            _custom: {
              display: "DebuggerEvent",
              type: "object",
              tooltip: "raw DebuggerEvent[]",
              value: events
            }
          };
        }
        api.addTimelineEvent({
          layerId: MUTATIONS_LAYER_ID,
          event: eventData
        });
      }, { detached: true, flush: "sync" });
      const hotUpdate = store._hotUpdate;
      store._hotUpdate = vue.markRaw((newStore) => {
        hotUpdate(newStore);
        api.addTimelineEvent({
          layerId: MUTATIONS_LAYER_ID,
          event: {
            time: now2(),
            title: "🔥 " + store.$id,
            subtitle: "HMR update",
            data: {
              store: formatDisplay(store.$id),
              info: formatDisplay(`HMR update`)
            }
          }
        });
        api.notifyComponentUpdate();
        api.sendInspectorTree(INSPECTOR_ID);
        api.sendInspectorState(INSPECTOR_ID);
      });
      const { $dispose } = store;
      store.$dispose = () => {
        $dispose();
        api.notifyComponentUpdate();
        api.sendInspectorTree(INSPECTOR_ID);
        api.sendInspectorState(INSPECTOR_ID);
        api.getSettings().logStoreChanges && toastMessage(`Disposed "${store.$id}" store 🗑`);
      };
      api.notifyComponentUpdate();
      api.sendInspectorTree(INSPECTOR_ID);
      api.sendInspectorState(INSPECTOR_ID);
      api.getSettings().logStoreChanges && toastMessage(`"${store.$id}" store installed 🆕`);
    });
  }
  let runningActionId = 0;
  let activeAction;
  function patchActionForGrouping(store, actionNames, wrapWithProxy) {
    const actions = actionNames.reduce((storeActions, actionName) => {
      storeActions[actionName] = vue.toRaw(store)[actionName];
      return storeActions;
    }, {});
    for (const actionName in actions) {
      store[actionName] = function() {
        const _actionId = runningActionId;
        const trackedStore = wrapWithProxy ? new Proxy(store, {
          get(...args) {
            activeAction = _actionId;
            return Reflect.get(...args);
          },
          set(...args) {
            activeAction = _actionId;
            return Reflect.set(...args);
          }
        }) : store;
        activeAction = _actionId;
        const retValue = actions[actionName].apply(trackedStore, arguments);
        activeAction = void 0;
        return retValue;
      };
    }
  }
  function devtoolsPlugin({ app, store, options }) {
    if (store.$id.startsWith("__hot:")) {
      return;
    }
    store._isOptionsAPI = !!options.state;
    patchActionForGrouping(store, Object.keys(options.actions), store._isOptionsAPI);
    const originalHotUpdate = store._hotUpdate;
    vue.toRaw(store)._hotUpdate = function(newStore) {
      originalHotUpdate.apply(this, arguments);
      patchActionForGrouping(store, Object.keys(newStore._hmrPayload.actions), !!store._isOptionsAPI);
    };
    addStoreToDevtools(
      app,
      // FIXME: is there a way to allow the assignment from Store<Id, S, G, A> to StoreGeneric?
      store
    );
  }
  function createPinia() {
    const scope = vue.effectScope(true);
    const state = scope.run(() => vue.ref({}));
    let _p = [];
    let toBeInstalled = [];
    const pinia = vue.markRaw({
      install(app) {
        setActivePinia(pinia);
        {
          pinia._a = app;
          app.provide(piniaSymbol, pinia);
          app.config.globalProperties.$pinia = pinia;
          if (USE_DEVTOOLS) {
            registerPiniaDevtools(app, pinia);
          }
          toBeInstalled.forEach((plugin) => _p.push(plugin));
          toBeInstalled = [];
        }
      },
      use(plugin) {
        if (!this._a && !isVue2) {
          toBeInstalled.push(plugin);
        } else {
          _p.push(plugin);
        }
        return this;
      },
      _p,
      // it's actually undefined here
      // @ts-expect-error
      _a: null,
      _e: scope,
      _s: /* @__PURE__ */ new Map(),
      state
    });
    if (USE_DEVTOOLS && typeof Proxy !== "undefined") {
      pinia.use(devtoolsPlugin);
    }
    return pinia;
  }
  function patchObject(newState, oldState) {
    for (const key in oldState) {
      const subPatch = oldState[key];
      if (!(key in newState)) {
        continue;
      }
      const targetValue = newState[key];
      if (isPlainObject$2(targetValue) && isPlainObject$2(subPatch) && !vue.isRef(subPatch) && !vue.isReactive(subPatch)) {
        newState[key] = patchObject(targetValue, subPatch);
      } else {
        {
          newState[key] = subPatch;
        }
      }
    }
    return newState;
  }
  const noop = () => {
  };
  function addSubscription(subscriptions, callback, detached, onCleanup = noop) {
    subscriptions.push(callback);
    const removeSubscription = () => {
      const idx = subscriptions.indexOf(callback);
      if (idx > -1) {
        subscriptions.splice(idx, 1);
        onCleanup();
      }
    };
    if (!detached && vue.getCurrentScope()) {
      vue.onScopeDispose(removeSubscription);
    }
    return removeSubscription;
  }
  function triggerSubscriptions(subscriptions, ...args) {
    subscriptions.slice().forEach((callback) => {
      callback(...args);
    });
  }
  const fallbackRunWithContext = (fn) => fn();
  function mergeReactiveObjects(target, patchToApply) {
    if (target instanceof Map && patchToApply instanceof Map) {
      patchToApply.forEach((value, key) => target.set(key, value));
    }
    if (target instanceof Set && patchToApply instanceof Set) {
      patchToApply.forEach(target.add, target);
    }
    for (const key in patchToApply) {
      if (!patchToApply.hasOwnProperty(key))
        continue;
      const subPatch = patchToApply[key];
      const targetValue = target[key];
      if (isPlainObject$2(targetValue) && isPlainObject$2(subPatch) && target.hasOwnProperty(key) && !vue.isRef(subPatch) && !vue.isReactive(subPatch)) {
        target[key] = mergeReactiveObjects(targetValue, subPatch);
      } else {
        target[key] = subPatch;
      }
    }
    return target;
  }
  const skipHydrateSymbol = Symbol("pinia:skipHydration");
  function shouldHydrate(obj) {
    return !isPlainObject$2(obj) || !obj.hasOwnProperty(skipHydrateSymbol);
  }
  const { assign } = Object;
  function isComputed(o) {
    return !!(vue.isRef(o) && o.effect);
  }
  function createOptionsStore(id, options, pinia, hot) {
    const { state, actions, getters } = options;
    const initialState = pinia.state.value[id];
    let store;
    function setup() {
      if (!initialState && !hot) {
        {
          pinia.state.value[id] = state ? state() : {};
        }
      }
      const localState = hot ? (
        // use ref() to unwrap refs inside state TODO: check if this is still necessary
        vue.toRefs(vue.ref(state ? state() : {}).value)
      ) : vue.toRefs(pinia.state.value[id]);
      return assign(localState, actions, Object.keys(getters || {}).reduce((computedGetters, name) => {
        if (name in localState) {
          console.warn(`[🍍]: A getter cannot have the same name as another state property. Rename one of them. Found with "${name}" in store "${id}".`);
        }
        computedGetters[name] = vue.markRaw(vue.computed(() => {
          setActivePinia(pinia);
          const store2 = pinia._s.get(id);
          return getters[name].call(store2, store2);
        }));
        return computedGetters;
      }, {}));
    }
    store = createSetupStore(id, setup, options, pinia, hot, true);
    return store;
  }
  function createSetupStore($id, setup, options = {}, pinia, hot, isOptionsStore) {
    let scope;
    const optionsForPlugin = assign({ actions: {} }, options);
    if (!pinia._e.active) {
      throw new Error("Pinia destroyed");
    }
    const $subscribeOptions = {
      deep: true
      // flush: 'post',
    };
    {
      $subscribeOptions.onTrigger = (event) => {
        if (isListening) {
          debuggerEvents = event;
        } else if (isListening == false && !store._hotUpdating) {
          if (Array.isArray(debuggerEvents)) {
            debuggerEvents.push(event);
          } else {
            console.error("🍍 debuggerEvents should be an array. This is most likely an internal Pinia bug.");
          }
        }
      };
    }
    let isListening;
    let isSyncListening;
    let subscriptions = [];
    let actionSubscriptions = [];
    let debuggerEvents;
    const initialState = pinia.state.value[$id];
    if (!isOptionsStore && !initialState && !hot) {
      {
        pinia.state.value[$id] = {};
      }
    }
    const hotState = vue.ref({});
    let activeListener;
    function $patch(partialStateOrMutator) {
      let subscriptionMutation;
      isListening = isSyncListening = false;
      {
        debuggerEvents = [];
      }
      if (typeof partialStateOrMutator === "function") {
        partialStateOrMutator(pinia.state.value[$id]);
        subscriptionMutation = {
          type: MutationType.patchFunction,
          storeId: $id,
          events: debuggerEvents
        };
      } else {
        mergeReactiveObjects(pinia.state.value[$id], partialStateOrMutator);
        subscriptionMutation = {
          type: MutationType.patchObject,
          payload: partialStateOrMutator,
          storeId: $id,
          events: debuggerEvents
        };
      }
      const myListenerId = activeListener = Symbol();
      vue.nextTick().then(() => {
        if (activeListener === myListenerId) {
          isListening = true;
        }
      });
      isSyncListening = true;
      triggerSubscriptions(subscriptions, subscriptionMutation, pinia.state.value[$id]);
    }
    const $reset = isOptionsStore ? function $reset2() {
      const { state } = options;
      const newState = state ? state() : {};
      this.$patch(($state) => {
        assign($state, newState);
      });
    } : (
      /* istanbul ignore next */
      () => {
        throw new Error(`🍍: Store "${$id}" is built using the setup syntax and does not implement $reset().`);
      }
    );
    function $dispose() {
      scope.stop();
      subscriptions = [];
      actionSubscriptions = [];
      pinia._s.delete($id);
    }
    function wrapAction(name, action) {
      return function() {
        setActivePinia(pinia);
        const args = Array.from(arguments);
        const afterCallbackList = [];
        const onErrorCallbackList = [];
        function after(callback) {
          afterCallbackList.push(callback);
        }
        function onError(callback) {
          onErrorCallbackList.push(callback);
        }
        triggerSubscriptions(actionSubscriptions, {
          args,
          name,
          store,
          after,
          onError
        });
        let ret;
        try {
          ret = action.apply(this && this.$id === $id ? this : store, args);
        } catch (error2) {
          triggerSubscriptions(onErrorCallbackList, error2);
          throw error2;
        }
        if (ret instanceof Promise) {
          return ret.then((value) => {
            triggerSubscriptions(afterCallbackList, value);
            return value;
          }).catch((error2) => {
            triggerSubscriptions(onErrorCallbackList, error2);
            return Promise.reject(error2);
          });
        }
        triggerSubscriptions(afterCallbackList, ret);
        return ret;
      };
    }
    const _hmrPayload = /* @__PURE__ */ vue.markRaw({
      actions: {},
      getters: {},
      state: [],
      hotState
    });
    const partialStore = {
      _p: pinia,
      // _s: scope,
      $id,
      $onAction: addSubscription.bind(null, actionSubscriptions),
      $patch,
      $reset,
      $subscribe(callback, options2 = {}) {
        const removeSubscription = addSubscription(subscriptions, callback, options2.detached, () => stopWatcher());
        const stopWatcher = scope.run(() => vue.watch(() => pinia.state.value[$id], (state) => {
          if (options2.flush === "sync" ? isSyncListening : isListening) {
            callback({
              storeId: $id,
              type: MutationType.direct,
              events: debuggerEvents
            }, state);
          }
        }, assign({}, $subscribeOptions, options2)));
        return removeSubscription;
      },
      $dispose
    };
    const store = vue.reactive(assign(
      {
        _hmrPayload,
        _customProperties: vue.markRaw(/* @__PURE__ */ new Set())
        // devtools custom properties
      },
      partialStore
      // must be added later
      // setupStore
    ));
    pinia._s.set($id, store);
    const runWithContext = pinia._a && pinia._a.runWithContext || fallbackRunWithContext;
    const setupStore = runWithContext(() => pinia._e.run(() => (scope = vue.effectScope()).run(setup)));
    for (const key in setupStore) {
      const prop = setupStore[key];
      if (vue.isRef(prop) && !isComputed(prop) || vue.isReactive(prop)) {
        if (hot) {
          set(hotState.value, key, vue.toRef(setupStore, key));
        } else if (!isOptionsStore) {
          if (initialState && shouldHydrate(prop)) {
            if (vue.isRef(prop)) {
              prop.value = initialState[key];
            } else {
              mergeReactiveObjects(prop, initialState[key]);
            }
          }
          {
            pinia.state.value[$id][key] = prop;
          }
        }
        {
          _hmrPayload.state.push(key);
        }
      } else if (typeof prop === "function") {
        const actionValue = hot ? prop : wrapAction(key, prop);
        {
          setupStore[key] = actionValue;
        }
        {
          _hmrPayload.actions[key] = prop;
        }
        optionsForPlugin.actions[key] = prop;
      } else {
        if (isComputed(prop)) {
          _hmrPayload.getters[key] = isOptionsStore ? (
            // @ts-expect-error
            options.getters[key]
          ) : prop;
          if (IS_CLIENT) {
            const getters = setupStore._getters || // @ts-expect-error: same
            (setupStore._getters = vue.markRaw([]));
            getters.push(key);
          }
        }
      }
    }
    {
      assign(store, setupStore);
      assign(vue.toRaw(store), setupStore);
    }
    Object.defineProperty(store, "$state", {
      get: () => hot ? hotState.value : pinia.state.value[$id],
      set: (state) => {
        if (hot) {
          throw new Error("cannot set hotState");
        }
        $patch(($state) => {
          assign($state, state);
        });
      }
    });
    {
      store._hotUpdate = vue.markRaw((newStore) => {
        store._hotUpdating = true;
        newStore._hmrPayload.state.forEach((stateKey) => {
          if (stateKey in store.$state) {
            const newStateTarget = newStore.$state[stateKey];
            const oldStateSource = store.$state[stateKey];
            if (typeof newStateTarget === "object" && isPlainObject$2(newStateTarget) && isPlainObject$2(oldStateSource)) {
              patchObject(newStateTarget, oldStateSource);
            } else {
              newStore.$state[stateKey] = oldStateSource;
            }
          }
          set(store, stateKey, vue.toRef(newStore.$state, stateKey));
        });
        Object.keys(store.$state).forEach((stateKey) => {
          if (!(stateKey in newStore.$state)) {
            del(store, stateKey);
          }
        });
        isListening = false;
        isSyncListening = false;
        pinia.state.value[$id] = vue.toRef(newStore._hmrPayload, "hotState");
        isSyncListening = true;
        vue.nextTick().then(() => {
          isListening = true;
        });
        for (const actionName in newStore._hmrPayload.actions) {
          const action = newStore[actionName];
          set(store, actionName, wrapAction(actionName, action));
        }
        for (const getterName in newStore._hmrPayload.getters) {
          const getter = newStore._hmrPayload.getters[getterName];
          const getterValue = isOptionsStore ? (
            // special handling of options api
            vue.computed(() => {
              setActivePinia(pinia);
              return getter.call(store, store);
            })
          ) : getter;
          set(store, getterName, getterValue);
        }
        Object.keys(store._hmrPayload.getters).forEach((key) => {
          if (!(key in newStore._hmrPayload.getters)) {
            del(store, key);
          }
        });
        Object.keys(store._hmrPayload.actions).forEach((key) => {
          if (!(key in newStore._hmrPayload.actions)) {
            del(store, key);
          }
        });
        store._hmrPayload = newStore._hmrPayload;
        store._getters = newStore._getters;
        store._hotUpdating = false;
      });
    }
    if (USE_DEVTOOLS) {
      const nonEnumerable = {
        writable: true,
        configurable: true,
        // avoid warning on devtools trying to display this property
        enumerable: false
      };
      ["_p", "_hmrPayload", "_getters", "_customProperties"].forEach((p) => {
        Object.defineProperty(store, p, assign({ value: store[p] }, nonEnumerable));
      });
    }
    pinia._p.forEach((extender) => {
      if (USE_DEVTOOLS) {
        const extensions = scope.run(() => extender({
          store,
          app: pinia._a,
          pinia,
          options: optionsForPlugin
        }));
        Object.keys(extensions || {}).forEach((key) => store._customProperties.add(key));
        assign(store, extensions);
      } else {
        assign(store, scope.run(() => extender({
          store,
          app: pinia._a,
          pinia,
          options: optionsForPlugin
        })));
      }
    });
    if (store.$state && typeof store.$state === "object" && typeof store.$state.constructor === "function" && !store.$state.constructor.toString().includes("[native code]")) {
      console.warn(`[🍍]: The "state" must be a plain object. It cannot be
	state: () => new MyClass()
Found in store "${store.$id}".`);
    }
    if (initialState && isOptionsStore && options.hydrate) {
      options.hydrate(store.$state, initialState);
    }
    isListening = true;
    isSyncListening = true;
    return store;
  }
  function defineStore(idOrOptions, setup, setupOptions) {
    let id;
    let options;
    const isSetupStore = typeof setup === "function";
    if (typeof idOrOptions === "string") {
      id = idOrOptions;
      options = isSetupStore ? setupOptions : setup;
    } else {
      options = idOrOptions;
      id = idOrOptions.id;
      if (typeof id !== "string") {
        throw new Error(`[🍍]: "defineStore()" must be passed a store id as its first argument.`);
      }
    }
    function useStore(pinia, hot) {
      const hasContext = vue.hasInjectionContext();
      pinia = // in test mode, ignore the argument provided as we can always retrieve a
      // pinia instance with getActivePinia()
      pinia || (hasContext ? vue.inject(piniaSymbol, null) : null);
      if (pinia)
        setActivePinia(pinia);
      if (!activePinia) {
        throw new Error(`[🍍]: "getActivePinia()" was called but there was no active Pinia. Are you trying to use a store before calling "app.use(pinia)"?
See https://pinia.vuejs.org/core-concepts/outside-component-usage.html for help.
This will fail in production.`);
      }
      pinia = activePinia;
      if (!pinia._s.has(id)) {
        if (isSetupStore) {
          createSetupStore(id, setup, options, pinia);
        } else {
          createOptionsStore(id, options, pinia);
        }
        {
          useStore._pinia = pinia;
        }
      }
      const store = pinia._s.get(id);
      if (hot) {
        const hotId = "__hot:" + id;
        const newStore = isSetupStore ? createSetupStore(hotId, setup, options, pinia, true) : createOptionsStore(hotId, assign({}, options), pinia, true);
        hot._hotUpdate(newStore);
        delete pinia.state.value[hotId];
        pinia._s.delete(hotId);
      }
      if (IS_CLIENT) {
        const currentInstance = vue.getCurrentInstance();
        if (currentInstance && currentInstance.proxy && // avoid adding stores that are just built for hot module replacement
        !hot) {
          const vm = currentInstance.proxy;
          const cache = "_pStores" in vm ? vm._pStores : vm._pStores = {};
          cache[id] = store;
        }
      }
      return store;
    }
    useStore.$id = id;
    return useStore;
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
      var isArray2 = Array.isArray;
      if (root.JS_MD5_NO_NODE_JS || !isArray2) {
        isArray2 = function(obj) {
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
        if (!isArray2(message) && !isView(message)) {
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
        var Buffer2 = require$$1.Buffer;
        var bufferFrom;
        if (Buffer2.from && !root.JS_MD5_NO_BUFFER_FROM) {
          bufferFrom = Buffer2.from;
        } else {
          bufferFrom = function(message) {
            return new Buffer2(message);
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
          if (isArray2(message) || isView(message) || message.constructor === Buffer2) {
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
        var code2, index2 = 0, i, length = message.length, blocks2 = this.blocks;
        var buffer82 = this.buffer8;
        while (index2 < length) {
          if (this.hashed) {
            this.hashed = false;
            blocks2[0] = blocks2[16];
            blocks2[16] = blocks2[1] = blocks2[2] = blocks2[3] = blocks2[4] = blocks2[5] = blocks2[6] = blocks2[7] = blocks2[8] = blocks2[9] = blocks2[10] = blocks2[11] = blocks2[12] = blocks2[13] = blocks2[14] = blocks2[15] = 0;
          }
          if (isString) {
            if (ARRAY_BUFFER) {
              for (i = this.start; index2 < length && i < 64; ++index2) {
                code2 = message.charCodeAt(index2);
                if (code2 < 128) {
                  buffer82[i++] = code2;
                } else if (code2 < 2048) {
                  buffer82[i++] = 192 | code2 >>> 6;
                  buffer82[i++] = 128 | code2 & 63;
                } else if (code2 < 55296 || code2 >= 57344) {
                  buffer82[i++] = 224 | code2 >>> 12;
                  buffer82[i++] = 128 | code2 >>> 6 & 63;
                  buffer82[i++] = 128 | code2 & 63;
                } else {
                  code2 = 65536 + ((code2 & 1023) << 10 | message.charCodeAt(++index2) & 1023);
                  buffer82[i++] = 240 | code2 >>> 18;
                  buffer82[i++] = 128 | code2 >>> 12 & 63;
                  buffer82[i++] = 128 | code2 >>> 6 & 63;
                  buffer82[i++] = 128 | code2 & 63;
                }
              }
            } else {
              for (i = this.start; index2 < length && i < 64; ++index2) {
                code2 = message.charCodeAt(index2);
                if (code2 < 128) {
                  blocks2[i >>> 2] |= code2 << SHIFT[i++ & 3];
                } else if (code2 < 2048) {
                  blocks2[i >>> 2] |= (192 | code2 >>> 6) << SHIFT[i++ & 3];
                  blocks2[i >>> 2] |= (128 | code2 & 63) << SHIFT[i++ & 3];
                } else if (code2 < 55296 || code2 >= 57344) {
                  blocks2[i >>> 2] |= (224 | code2 >>> 12) << SHIFT[i++ & 3];
                  blocks2[i >>> 2] |= (128 | code2 >>> 6 & 63) << SHIFT[i++ & 3];
                  blocks2[i >>> 2] |= (128 | code2 & 63) << SHIFT[i++ & 3];
                } else {
                  code2 = 65536 + ((code2 & 1023) << 10 | message.charCodeAt(++index2) & 1023);
                  blocks2[i >>> 2] |= (240 | code2 >>> 18) << SHIFT[i++ & 3];
                  blocks2[i >>> 2] |= (128 | code2 >>> 12 & 63) << SHIFT[i++ & 3];
                  blocks2[i >>> 2] |= (128 | code2 >>> 6 & 63) << SHIFT[i++ & 3];
                  blocks2[i >>> 2] |= (128 | code2 & 63) << SHIFT[i++ & 3];
                }
              }
            }
          } else {
            if (ARRAY_BUFFER) {
              for (i = this.start; index2 < length && i < 64; ++index2) {
                buffer82[i++] = message[index2];
              }
            } else {
              for (i = this.start; index2 < length && i < 64; ++index2) {
                blocks2[i >>> 2] |= message[index2] << SHIFT[i++ & 3];
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
          var bytes = [], length = key.length, index2 = 0, code2;
          for (i = 0; i < length; ++i) {
            code2 = key.charCodeAt(i);
            if (code2 < 128) {
              bytes[index2++] = code2;
            } else if (code2 < 2048) {
              bytes[index2++] = 192 | code2 >>> 6;
              bytes[index2++] = 128 | code2 & 63;
            } else if (code2 < 55296 || code2 >= 57344) {
              bytes[index2++] = 224 | code2 >>> 12;
              bytes[index2++] = 128 | code2 >>> 6 & 63;
              bytes[index2++] = 128 | code2 & 63;
            } else {
              code2 = 65536 + ((code2 & 1023) << 10 | key.charCodeAt(++i) & 1023);
              bytes[index2++] = 240 | code2 >>> 18;
              bytes[index2++] = 128 | code2 >>> 12 & 63;
              bytes[index2++] = 128 | code2 >>> 6 & 63;
              bytes[index2++] = 128 | code2 & 63;
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
  const config$1 = {
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
  const SportType = {
    BASKETBALL: "basketball",
    FOOTBALL: "football"
  };
  function sportPrefix(sport) {
    return sport === SportType.FOOTBALL ? "soccer/" : "";
  }
  const useUserStore = defineStore("user", () => {
    const token = vue.ref(getToken());
    const userId = vue.ref(getUserId());
    const userInfo2 = vue.ref(null);
    const secretMd5 = vue.ref("");
    const isLogin = vue.computed(() => !!token.value);
    function init() {
      token.value = getToken();
      userId.value = getUserId();
      if (!secretMd5.value) {
        secretMd5.value = md5Encode(config$1.secret);
      }
    }
    function setAuth(t2, uid) {
      token.value = t2;
      setToken(t2);
      if (uid) {
        userId.value = uid;
        setUserId(uid);
      }
    }
    function setUserInfo(info) {
      userInfo2.value = info;
    }
    function logout() {
      clearAuth();
      token.value = "";
      userId.value = "";
      userInfo2.value = null;
    }
    return { token, userId, userInfo: userInfo2, secretMd5, isLogin, init, setAuth, setUserInfo, logout };
  });
  const _imports_0$3 = "/static/loading_bg.png";
  const _export_sfc = (sfc, props2) => {
    const target = sfc.__vccOpts || sfc;
    for (const [key, val] of props2) {
      target[key] = val;
    }
    return target;
  };
  const _sfc_main$J = {
    __name: "index",
    setup(__props, { expose: __expose }) {
      __expose();
      const userStore = useUserStore();
      onLoad(() => {
        requestPermissions().then(() => {
          setTimeout(() => {
            if (userStore.isLogin) {
              uni.reLaunch({ url: "/pages/main/index" });
            } else {
              uni.reLaunch({ url: "/pages/login/index" });
            }
          }, 1e3);
        });
      });
      function requestPermissions() {
        return new Promise((resolve) => {
          const perms = [
            "android.permission.READ_PHONE_STATE",
            "android.permission.RECORD_AUDIO",
            "android.permission.WRITE_EXTERNAL_STORAGE",
            "android.permission.CAMERA"
          ];
          try {
            plus.android.requestPermissions(
              perms,
              () => resolve(),
              () => resolve()
            );
          } catch (e) {
            resolve();
          }
        });
      }
      const __returned__ = { userStore, requestPermissions, get onLoad() {
        return onLoad;
      }, get useUserStore() {
        return useUserStore;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$I(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "loading" }, [
      vue.createElementVNode("image", {
        class: "bg",
        src: _imports_0$3,
        mode: "aspectFill"
      }),
      vue.createElementVNode("view", { class: "brand" }, "智能技术台")
    ]);
  }
  const PagesLoadingIndex = /* @__PURE__ */ _export_sfc(_sfc_main$J, [["render", _sfc_render$I], ["__scopeId", "data-v-ce0ef2b6"], ["__file", "F:/项目文件/uniapp版本/pages/loading/index.vue"]]);
  const _imports_0$2 = "/static/mipmap-xxhdpi/black_back.png";
  const _sfc_main$I = {
    __name: "custom-nav",
    props: {
      title: { type: String, default: "" },
      showBack: { type: Boolean, default: true }
    },
    emits: ["back"],
    setup(__props, { expose: __expose, emit: __emit }) {
      __expose();
      const emit2 = __emit;
      const statusBarHeight = vue.ref(0);
      const navHeight = vue.ref(50);
      const sysInfo = uni.getSystemInfoSync();
      statusBarHeight.value = sysInfo.statusBarHeight || 0;
      function onBack() {
        emit2("back");
        const pages2 = getCurrentPages();
        if (pages2.length > 1) {
          uni.navigateBack();
        }
      }
      const __returned__ = { emit: emit2, statusBarHeight, navHeight, sysInfo, onBack, ref: vue.ref };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$H(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "custom-nav" }, [
      vue.createElementVNode(
        "view",
        {
          class: "nav-status",
          style: vue.normalizeStyle({ height: $setup.statusBarHeight + "px" })
        },
        null,
        4
        /* STYLE */
      ),
      vue.createElementVNode(
        "view",
        {
          class: "nav-content",
          style: vue.normalizeStyle({ height: $setup.navHeight + "px" })
        },
        [
          vue.createElementVNode("view", {
            class: "nav-left",
            onClick: $setup.onBack
          }, [
            $props.showBack ? (vue.openBlock(), vue.createElementBlock("image", {
              key: 0,
              class: "back",
              src: _imports_0$2,
              mode: "aspectFit"
            })) : vue.renderSlot(_ctx.$slots, "left", { key: 1 }, void 0, true)
          ]),
          vue.createElementVNode(
            "view",
            { class: "nav-title" },
            vue.toDisplayString($props.title),
            1
            /* TEXT */
          ),
          vue.createElementVNode("view", { class: "nav-right" }, [
            vue.renderSlot(_ctx.$slots, "right", {}, void 0, true)
          ])
        ],
        4
        /* STYLE */
      ),
      vue.createElementVNode("view", { class: "nav-line" })
    ]);
  }
  const customNav = /* @__PURE__ */ _export_sfc(_sfc_main$I, [["render", _sfc_render$H], ["__scopeId", "data-v-1b09776d"], ["__file", "F:/项目文件/uniapp版本/components/custom-nav/custom-nav.vue"]]);
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
  const userInfo = {
    id: "mock-user-001",
    avatar: "",
    nickName: "测试管理员",
    sex: E(1, "男"),
    sketch: "【MOCK】测试账号",
    birthday: "1990-01-01",
    position: E(1, "控球后卫"),
    number: 23,
    weight: "75",
    height: "180",
    city: "北京",
    province: "北京",
    phone: "13800000000",
    isBindWx: EB(0, "未绑定", false),
    follows: 12,
    fans: 36
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
  const basketGame2 = {
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
  };
  const basketGame3 = {
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
  };
  const footGame1 = {
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
  };
  function matchList(sport, status) {
    const isFoot = sport === "football";
    const ongoing = isFoot ? footGame1 : basketGame1;
    const notStart = isFoot ? { ...footGame1, id: "mock-foot-002", status: E(1, "未开始"), runStatus: E(1, "未开始"), hostTeamScore: 0, guestTeamScore: 0 } : basketGame2;
    const ended = isFoot ? { ...footGame1, id: "mock-foot-003", status: E(3, "已结束"), runStatus: E(3, "已结束"), hostTeamScore: 3, guestTeamScore: 0 } : basketGame3;
    if (status === "end") {
      return ok([{ date: "2026-07-30", games: [ended] }]);
    }
    return ok([{ date: "2026-07-31", games: [ongoing, notStart] }]);
  }
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
  const sections = [
    { id: "mock-sec-1", gameSectionId: "mock-sec-1", name: "第1节", gameId: IDS.gameId, type: E(1, "小节"), sort: 1, groups: "", running: EB(1, "进行中", true) },
    { id: "mock-sec-2", gameSectionId: "mock-sec-2", name: "第2节", gameId: IDS.gameId, type: E(1, "小节"), sort: 2, groups: "", running: EB(0, "未开始", false) },
    { id: "mock-sec-3", gameSectionId: "mock-sec-3", name: "第3节", gameId: IDS.gameId, type: E(1, "小节"), sort: 3, groups: "", running: EB(0, "未开始", false) },
    { id: "mock-sec-4", gameSectionId: "mock-sec-4", name: "第4节", gameId: IDS.gameId, type: E(1, "小节"), sort: 4, groups: "", running: EB(0, "未开始", false) }
  ];
  const basketDetail = ok({
    game: {
      id: IDS.gameId,
      name: "测试联赛-红蓝大战",
      status: E(2, "进行中"),
      runStatus: E(2, "进行中"),
      type: E(1, "篮球"),
      event: E(1, "联赛"),
      time: "2026-07-31 15:00",
      isMedia: EB(1, "是", true),
      venueId: "mock-venue-1",
      venueName: "1号场地",
      venueAddress: "测试体育馆1号场",
      leagueGroupId: "mock-lg-1",
      leagueGroupName: "A组",
      leagueGroupSort: 1,
      leagueStageId: "mock-ls-1",
      leagueStageName: "小组赛",
      leagueStageSort: 1,
      leagueId: IDS.leagueId,
      leagueName: "测试联赛",
      leagueLogo: "",
      leagueStartTime: "2026-07-01",
      hostGameTeamId: IDS.hostTeamId,
      hostTeamId: "ht1",
      hostTeamLogo: "",
      hostTeamName: "红队",
      hostTeamScore: 28,
      guestGameTeamId: IDS.guestTeamId,
      guestTeamId: "gt2",
      guestTeamLogo: "",
      guestTeamName: "蓝队",
      guestTeamScore: 24,
      gameResult: E(0, "未结束"),
      videoStatus: E(0, "未直播"),
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
  const footDetail = ok({ ...gameDetail.data, type: E(2, "足球"), hostTeamName: "飞虎队", guestTeamName: "雄鹰队", hostTeamScore: 1, guestTeamScore: 1, name: "测试杯-足球半决赛", leagueName: "测试杯" });
  const connectInfo = ok({
    id: IDS.gameId,
    event: E(1, "联赛"),
    name: "测试联赛-红蓝大战",
    status: E(2, "进行中"),
    runStatus: E(2, "进行中"),
    time: "2026-07-31 15:00",
    type: E(1, "篮球"),
    isMedia: EB(1, "是", true),
    venueId: "mock-venue-1",
    venueName: "1号场地",
    venueAddress: "测试体育馆1号场",
    leagueGroupId: "mock-lg-1",
    leagueGroupName: "A组",
    leagueGroupSort: 1,
    leagueStageId: "mock-ls-1",
    leagueStageName: "小组赛",
    leagueStageSort: 1,
    leagueId: IDS.leagueId,
    leagueName: "测试联赛",
    leagueLogo: "",
    leagueStartTime: "2026-07-01",
    hostGameTeamId: IDS.hostTeamId,
    hostTeamId: "ht1",
    hostTeamLogo: "",
    hostTeamName: "红队",
    hostTeamScore: 28,
    guestGameTeamId: IDS.guestTeamId,
    guestTeamId: "gt2",
    guestTeamLogo: "",
    guestTeamName: "蓝队",
    guestTeamScore: 24,
    gameResult: E(0, "未结束"),
    videoStatus: E(0, "未直播"),
    section: "1"
  });
  const sectionList = ok(sections.map((s) => ({
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
  const recordList = ok({
    totalCount: 6,
    pageSize: 10,
    totalPage: 1,
    pageNo: 1,
    nextPage: false,
    list: [
      { id: "mock-rec-1", recordNumber: "mock-rec-1", statisticsSectionId: "mock-sec-1", type: E(7, "三分命中"), occurrenceTime: "15:02:10", statisticsMemberId: "mock-host-member-1", statisticsTeamId: IDS.hostTeamId, description: "赵一 三分命中", sectionName: "第1节", memberName: "赵一", teamName: "红队" },
      { id: "mock-rec-2", recordNumber: "mock-rec-2", statisticsSectionId: "mock-sec-1", type: E(1, "篮板"), occurrenceTime: "15:03:25", statisticsMemberId: "mock-guest-member-5", statisticsTeamId: IDS.guestTeamId, description: "冯五 篮板", sectionName: "第1节", memberName: "蒋五", teamName: "蓝队" },
      { id: "mock-rec-3", recordNumber: "mock-rec-3", statisticsSectionId: "mock-sec-1", type: E(6, "两分命中"), occurrenceTime: "15:04:40", statisticsMemberId: "mock-host-member-2", statisticsTeamId: IDS.hostTeamId, description: "钱二 两分命中", sectionName: "第1节", memberName: "钱二", teamName: "红队" },
      { id: "mock-rec-4", recordNumber: "mock-rec-4", statisticsSectionId: "mock-sec-1", type: E(9, "犯规"), occurrenceTime: "15:05:55", statisticsMemberId: "mock-guest-member-2", statisticsTeamId: IDS.guestTeamId, description: "陈二 犯规", sectionName: "第1节", memberName: "陈二", teamName: "蓝队" },
      { id: "mock-rec-5", recordNumber: "mock-rec-5", statisticsSectionId: "mock-sec-1", type: E(2, "助攻"), occurrenceTime: "15:07:12", statisticsMemberId: "mock-host-member-1", statisticsTeamId: IDS.hostTeamId, description: "赵一 助攻", sectionName: "第1节", memberName: "赵一", teamName: "红队" },
      { id: "mock-rec-6", recordNumber: "mock-rec-6", statisticsSectionId: "mock-sec-1", type: E(17, "失误"), occurrenceTime: "15:08:30", statisticsMemberId: "mock-guest-member-3", statisticsTeamId: IDS.guestTeamId, description: "褚三 失误", sectionName: "第1节", memberName: "褚三", teamName: "蓝队" }
    ]
  });
  const weekList = ok([
    {
      groupName: "A组",
      games: [basketGame1, basketGame3],
      optimals: [
        { name: "赵一", avatar: "", count: 18, type: E(6, "得分王") },
        { name: "蒋五", avatar: "", count: 11, type: E(1, "篮板王") }
      ]
    },
    {
      groupName: "B组",
      games: [basketGame2],
      optimals: [{ name: "吴六", avatar: "", count: 7, type: E(2, "助攻王") }]
    }
  ]);
  const photoActivityList = ok({
    totalCount: 2,
    pageSize: 10,
    totalPage: 1,
    pageNo: 1,
    nextPage: false,
    list: [
      { id: "mock-photo-act-1", type: E(1, "比赛"), title: "红蓝大战拍照直播", description: "【MOCK】测试活动", status: E(1, "进行中"), startTime: "2026-07-31 15:00", endTime: "2026-07-31 17:00", address: "1号场地", visitors: 128, logo: "", banner: "", poster: "", timeInterval: 0, showStatus: E(1, "显示") },
      { id: "mock-photo-act-2", type: E(2, "联赛"), title: "测试杯拍照直播", description: "【MOCK】测试活动2", status: E(2, "已结束"), startTime: "2026-07-30 15:00", endTime: "2026-07-30 17:00", address: "2号场地", visitors: 56, logo: "", banner: "", poster: "", timeInterval: 0, showStatus: E(1, "显示") }
    ]
  });
  const uploadPhotoList = ok([
    { id: "mock-pic-1", photoActivityId: "mock-photo-act-1", userId: "mock-user-001", url: "", width: 1080, height: 1920, fileName: "mock-1.jpg", fileSize: 102400, fileTime: "2026-07-31 15:01:00", showStatus: E(1, "显示"), likeCount: 3 },
    { id: "mock-pic-2", photoActivityId: "mock-photo-act-1", userId: "mock-user-001", url: "", width: 1080, height: 1920, fileName: "mock-2.jpg", fileSize: 204800, fileTime: "2026-07-31 15:02:00", showStatus: E(1, "显示"), likeCount: 5 },
    { id: "mock-pic-3", photoActivityId: "mock-photo-act-1", userId: "mock-user-001", url: "", width: 1080, height: 1920, fileName: "mock-3.jpg", fileSize: 153600, fileTime: "2026-07-31 15:03:00", showStatus: E(1, "显示"), likeCount: 0 }
  ]);
  const liveGameList = ok([
    { id: "mock-live-1", recordId: "mock-rec-live-1", type: E(1, "直播"), appName: "mock", streamName: "mock-stream-1", name: "1号机位", status: E(1, "直播中"), cover: "", publish: "rtmp://mock/live/mock-stream-1", liveRtmp: "rtmp://mock/live/mock-stream-1", liveFlv: "http://mock/live/mock-stream-1.flv", liveM3u8: "http://mock/live/mock-stream-1.m3u8" }
  ]);
  const versionCheckResult = ok({
    id: "mock-ver-1",
    deviceType: E(1, "android"),
    url: "",
    upgradeType: E(0, "可选"),
    remark: "【MOCK】当前已是最新版本（测试数据）",
    packageSize: "0",
    versionCode: 0,
    versionName: "2.8.4",
    notice: E(0, "不提醒")
  });
  const RULES = [
    /* ----- 登录 ----- */
    { method: "POST", url: "sms/login", handler: () => ok(null, "【MOCK】验证码已发送(测试码:1234)") },
    { method: "POST", url: "user/login", handler: () => ok(IDS.token, "【MOCK】登录成功") },
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
    { method: "GET", url: "photo/activity/create-game", handler: () => ok("mock-photo-act-new", "【MOCK】活动创建成功") },
    { method: "GET", url: "photo/picture/upload-list", handler: () => uploadPhotoList },
    /* ----- 直播 ----- */
    { method: "GET", url: "live/stream/game-list", handler: () => liveGameList },
    { method: "POST", url: "live/stream/game", handler: () => ok(liveGameList.data[0], "【MOCK】获取直播地址成功") },
    { method: "POST", url: "live/stream/game-add", handler: () => ok("mock-live-new", "【MOCK】直播添加成功") },
    { method: "POST", url: "live/stream/compose", handler: () => ok(null, "【MOCK】合成回放请求已提交") },
    /* ----- 版本检查 ----- */
    { method: "GET", url: "sys/app-version/check", handler: () => versionCheckResult },
    /* ----- 写操作：统一返回成功（mock 不真实落库）----- */
    { method: "POST", url: "ts/game/update-info", handler: () => ok(null, "【MOCK】保存成功") },
    { method: "POST", url: "game/status", handler: () => ok(null, "【MOCK】状态修改成功") },
    { method: "POST", url: "soccer/game/status", handler: () => ok(null, "【MOCK】状态修改成功") },
    { method: "POST", url: "statistics/member/sign", handler: () => ok(null, "【MOCK】签到成功") },
    { method: "POST", url: "statistics/member/sign-cancel", handler: () => ok(null, "【MOCK】取消签到成功") },
    { method: "POST", url: "statistics/member/starting-lineup", handler: () => ok(null, "【MOCK】设置首发成功") },
    { method: "POST", url: "statistics/member/starting-lineup-cancel", handler: () => ok(null, "【MOCK】取消首发成功") },
    { method: "POST", url: "statistics/member/temporary", handler: () => ok("mock-member-new", "【MOCK】添加临时球员成功") },
    { method: "POST", url: "statistics/member/edit-position", handler: () => ok(null, "【MOCK】位置修改成功") },
    { method: "GET", url: "statistics/member/delete-temporary", handler: () => ok(null, "【MOCK】删除球员成功") },
    { method: "POST", url: "statistics/add", handler: () => ok(null, "【MOCK】统计提交成功") },
    { method: "POST", url: "statistics/add-all", handler: () => ok(null, "【MOCK】批量统计提交成功") },
    { method: "POST", url: "statistics/cancel", handler: () => ok(null, "【MOCK】取消记录成功") },
    { method: "POST", url: "statistics/section/running", handler: () => ok(null, "【MOCK】小节状态切换成功") }
  ];
  function matchUrl(template, realUrl) {
    const re = new RegExp("^" + template.replace(/\{[^}]+\}/g, "([^/]+)") + "$");
    return re.test(realUrl);
  }
  function mockResolve(options) {
    if (!config$1.useMock)
      return null;
    const { url: url2, method = "GET" } = options;
    const m = method.toUpperCase();
    for (const rule of RULES) {
      if (rule.method !== m)
        continue;
      if (!matchUrl(rule.url, url2))
        continue;
      return rule.handler(options);
    }
    formatAppLog("warn", "at mock/mock-data.js:526", `%c【MOCK】未匹配到静态数据，走真实请求：${m} ${url2}`, "color:#f56c6c");
    return null;
  }
  function request(options) {
    const {
      url: url2,
      method = "GET",
      path,
      query,
      data,
      header = {},
      hideError = false,
      loading = false
    } = options;
    let finalUrl = config$1.baseUrl + url2;
    const mocked = mockResolve(options);
    if (mocked !== null) {
      if (loading)
        uni.showLoading({ title: typeof loading === "string" ? loading : "加载中", mask: true });
      formatAppLog("log", "at api/request.js:51", "%c【MOCK】" + method.toUpperCase() + " " + url2, "color:#e6a23c;font-weight:bold", mocked);
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
          if (body && config$1.tokenExpiredCodes.includes(body.code)) {
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
  const getNote = (phone) => request({ url: "sms/login", method: "POST", data: { phone } });
  const validateLogin = (phone, code2) => request({ url: "user/login", method: "POST", data: { phone, code: code2 } });
  const getUserInfo = () => request({ url: "user/info" });
  const synchr = (gameId, pageNo) => request({ url: "statistics/page", query: { gameId, pageNo } });
  var dayjs_min = { exports: {} };
  (function(module, exports) {
    !function(t2, e) {
      module.exports = e();
    }(commonjsGlobal, function() {
      var t2 = 1e3, e = 6e4, n = 36e5, r = "millisecond", i = "second", s = "minute", u = "hour", a = "day", o = "week", c = "month", f = "quarter", h = "year", d = "date", l = "Invalid Date", $ = /^(\d{4})[-/]?(\d{1,2})?[-/]?(\d{0,2})[Tt\s]*(\d{1,2})?:?(\d{1,2})?:?(\d{1,2})?[.:]?(\d+)?$/, y = /\[([^\]]+)]|YYYY|YY|M{1,4}|D{1,2}|d{1,4}|H{1,2}|h{1,2}|a|A|m{1,2}|s{1,2}|Z{1,2}|SSS/g, M = { name: "en", weekdays: "Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday".split("_"), months: "January_February_March_April_May_June_July_August_September_October_November_December".split("_"), ordinal: function(t3) {
        var e2 = ["th", "st", "nd", "rd"], n2 = t3 % 100;
        return "[" + t3 + (e2[(n2 - 20) % 10] || e2[n2] || e2[0]) + "]";
      } }, m = function(t3, e2, n2) {
        var r2 = String(t3);
        return !r2 || r2.length >= e2 ? t3 : "" + Array(e2 + 1 - r2.length).join(n2) + t3;
      }, v = { s: m, z: function(t3) {
        var e2 = -t3.utcOffset(), n2 = Math.abs(e2), r2 = Math.floor(n2 / 60), i2 = n2 % 60;
        return (e2 <= 0 ? "+" : "-") + m(r2, 2, "0") + ":" + m(i2, 2, "0");
      }, m: function t3(e2, n2) {
        if (e2.date() < n2.date())
          return -t3(n2, e2);
        var r2 = 12 * (n2.year() - e2.year()) + (n2.month() - e2.month()), i2 = e2.clone().add(r2, c), s2 = n2 - i2 < 0, u2 = e2.clone().add(r2 + (s2 ? -1 : 1), c);
        return +(-(r2 + (n2 - i2) / (s2 ? i2 - u2 : u2 - i2)) || 0);
      }, a: function(t3) {
        return t3 < 0 ? Math.ceil(t3) || 0 : Math.floor(t3);
      }, p: function(t3) {
        return { M: c, y: h, w: o, d: a, D: d, h: u, m: s, s: i, ms: r, Q: f }[t3] || String(t3 || "").toLowerCase().replace(/s$/, "");
      }, u: function(t3) {
        return void 0 === t3;
      } }, g = "en", D = {};
      D[g] = M;
      var p = "$isDayjsObject", S = function(t3) {
        return t3 instanceof _ || !(!t3 || !t3[p]);
      }, w = function t3(e2, n2, r2) {
        var i2;
        if (!e2)
          return g;
        if ("string" == typeof e2) {
          var s2 = e2.toLowerCase();
          D[s2] && (i2 = s2), n2 && (D[s2] = n2, i2 = s2);
          var u2 = e2.split("-");
          if (!i2 && u2.length > 1)
            return t3(u2[0]);
        } else {
          var a2 = e2.name;
          D[a2] = e2, i2 = a2;
        }
        return !r2 && i2 && (g = i2), i2 || !r2 && g;
      }, O = function(t3, e2) {
        if (S(t3))
          return t3.clone();
        var n2 = "object" == typeof e2 ? e2 : {};
        return n2.date = t3, n2.args = arguments, new _(n2);
      }, b = v;
      b.l = w, b.i = S, b.w = function(t3, e2) {
        return O(t3, { locale: e2.$L, utc: e2.$u, x: e2.$x, $offset: e2.$offset });
      };
      var _ = function() {
        function M2(t3) {
          this.$L = w(t3.locale, null, true), this.parse(t3), this.$x = this.$x || t3.x || {}, this[p] = true;
        }
        var m2 = M2.prototype;
        return m2.parse = function(t3) {
          this.$d = function(t4) {
            var e2 = t4.date, n2 = t4.utc;
            if (null === e2)
              return /* @__PURE__ */ new Date(NaN);
            if (b.u(e2))
              return /* @__PURE__ */ new Date();
            if (e2 instanceof Date)
              return new Date(e2);
            if ("string" == typeof e2 && !/Z$/i.test(e2)) {
              var r2 = e2.match($);
              if (r2) {
                var i2 = r2[2] - 1 || 0, s2 = (r2[7] || "0").substring(0, 3);
                return n2 ? new Date(Date.UTC(r2[1], i2, r2[3] || 1, r2[4] || 0, r2[5] || 0, r2[6] || 0, s2)) : new Date(r2[1], i2, r2[3] || 1, r2[4] || 0, r2[5] || 0, r2[6] || 0, s2);
              }
            }
            return new Date(e2);
          }(t3), this.init();
        }, m2.init = function() {
          var t3 = this.$d;
          this.$y = t3.getFullYear(), this.$M = t3.getMonth(), this.$D = t3.getDate(), this.$W = t3.getDay(), this.$H = t3.getHours(), this.$m = t3.getMinutes(), this.$s = t3.getSeconds(), this.$ms = t3.getMilliseconds();
        }, m2.$utils = function() {
          return b;
        }, m2.isValid = function() {
          return !(this.$d.toString() === l);
        }, m2.isSame = function(t3, e2) {
          var n2 = O(t3);
          return this.startOf(e2) <= n2 && n2 <= this.endOf(e2);
        }, m2.isAfter = function(t3, e2) {
          return O(t3) < this.startOf(e2);
        }, m2.isBefore = function(t3, e2) {
          return this.endOf(e2) < O(t3);
        }, m2.$g = function(t3, e2, n2) {
          return b.u(t3) ? this[e2] : this.set(n2, t3);
        }, m2.unix = function() {
          return Math.floor(this.valueOf() / 1e3);
        }, m2.valueOf = function() {
          return this.$d.getTime();
        }, m2.startOf = function(t3, e2) {
          var n2 = this, r2 = !!b.u(e2) || e2, f2 = b.p(t3), l2 = function(t4, e3) {
            var i2 = b.w(n2.$u ? Date.UTC(n2.$y, e3, t4) : new Date(n2.$y, e3, t4), n2);
            return r2 ? i2 : i2.endOf(a);
          }, $2 = function(t4, e3) {
            return b.w(n2.toDate()[t4].apply(n2.toDate("s"), (r2 ? [0, 0, 0, 0] : [23, 59, 59, 999]).slice(e3)), n2);
          }, y2 = this.$W, M3 = this.$M, m3 = this.$D, v2 = "set" + (this.$u ? "UTC" : "");
          switch (f2) {
            case h:
              return r2 ? l2(1, 0) : l2(31, 11);
            case c:
              return r2 ? l2(1, M3) : l2(0, M3 + 1);
            case o:
              var g2 = this.$locale().weekStart || 0, D2 = (y2 < g2 ? y2 + 7 : y2) - g2;
              return l2(r2 ? m3 - D2 : m3 + (6 - D2), M3);
            case a:
            case d:
              return $2(v2 + "Hours", 0);
            case u:
              return $2(v2 + "Minutes", 1);
            case s:
              return $2(v2 + "Seconds", 2);
            case i:
              return $2(v2 + "Milliseconds", 3);
            default:
              return this.clone();
          }
        }, m2.endOf = function(t3) {
          return this.startOf(t3, false);
        }, m2.$set = function(t3, e2) {
          var n2, o2 = b.p(t3), f2 = "set" + (this.$u ? "UTC" : ""), l2 = (n2 = {}, n2[a] = f2 + "Date", n2[d] = f2 + "Date", n2[c] = f2 + "Month", n2[h] = f2 + "FullYear", n2[u] = f2 + "Hours", n2[s] = f2 + "Minutes", n2[i] = f2 + "Seconds", n2[r] = f2 + "Milliseconds", n2)[o2], $2 = o2 === a ? this.$D + (e2 - this.$W) : e2;
          if (o2 === c || o2 === h) {
            var y2 = this.clone().set(d, 1);
            y2.$d[l2]($2), y2.init(), this.$d = y2.set(d, Math.min(this.$D, y2.daysInMonth())).$d;
          } else
            l2 && this.$d[l2]($2);
          return this.init(), this;
        }, m2.set = function(t3, e2) {
          return this.clone().$set(t3, e2);
        }, m2.get = function(t3) {
          return this[b.p(t3)]();
        }, m2.add = function(r2, f2) {
          var d2, l2 = this;
          r2 = Number(r2);
          var $2 = b.p(f2), y2 = function(t3) {
            var e2 = O(l2);
            return b.w(e2.date(e2.date() + Math.round(t3 * r2)), l2);
          };
          if ($2 === c)
            return this.set(c, this.$M + r2);
          if ($2 === h)
            return this.set(h, this.$y + r2);
          if ($2 === a)
            return y2(1);
          if ($2 === o)
            return y2(7);
          var M3 = (d2 = {}, d2[s] = e, d2[u] = n, d2[i] = t2, d2)[$2] || 1, m3 = this.$d.getTime() + r2 * M3;
          return b.w(m3, this);
        }, m2.subtract = function(t3, e2) {
          return this.add(-1 * t3, e2);
        }, m2.format = function(t3) {
          var e2 = this, n2 = this.$locale();
          if (!this.isValid())
            return n2.invalidDate || l;
          var r2 = t3 || "YYYY-MM-DDTHH:mm:ssZ", i2 = b.z(this), s2 = this.$H, u2 = this.$m, a2 = this.$M, o2 = n2.weekdays, c2 = n2.months, f2 = n2.meridiem, h2 = function(t4, n3, i3, s3) {
            return t4 && (t4[n3] || t4(e2, r2)) || i3[n3].slice(0, s3);
          }, d2 = function(t4) {
            return b.s(s2 % 12 || 12, t4, "0");
          }, $2 = f2 || function(t4, e3, n3) {
            var r3 = t4 < 12 ? "AM" : "PM";
            return n3 ? r3.toLowerCase() : r3;
          };
          return r2.replace(y, function(t4, r3) {
            return r3 || function(t5) {
              switch (t5) {
                case "YY":
                  return String(e2.$y).slice(-2);
                case "YYYY":
                  return b.s(e2.$y, 4, "0");
                case "M":
                  return a2 + 1;
                case "MM":
                  return b.s(a2 + 1, 2, "0");
                case "MMM":
                  return h2(n2.monthsShort, a2, c2, 3);
                case "MMMM":
                  return h2(c2, a2);
                case "D":
                  return e2.$D;
                case "DD":
                  return b.s(e2.$D, 2, "0");
                case "d":
                  return String(e2.$W);
                case "dd":
                  return h2(n2.weekdaysMin, e2.$W, o2, 2);
                case "ddd":
                  return h2(n2.weekdaysShort, e2.$W, o2, 3);
                case "dddd":
                  return o2[e2.$W];
                case "H":
                  return String(s2);
                case "HH":
                  return b.s(s2, 2, "0");
                case "h":
                  return d2(1);
                case "hh":
                  return d2(2);
                case "a":
                  return $2(s2, u2, true);
                case "A":
                  return $2(s2, u2, false);
                case "m":
                  return String(u2);
                case "mm":
                  return b.s(u2, 2, "0");
                case "s":
                  return String(e2.$s);
                case "ss":
                  return b.s(e2.$s, 2, "0");
                case "SSS":
                  return b.s(e2.$ms, 3, "0");
                case "Z":
                  return i2;
              }
              return null;
            }(t4) || i2.replace(":", "");
          });
        }, m2.utcOffset = function() {
          return 15 * -Math.round(this.$d.getTimezoneOffset() / 15);
        }, m2.diff = function(r2, d2, l2) {
          var $2, y2 = this, M3 = b.p(d2), m3 = O(r2), v2 = (m3.utcOffset() - this.utcOffset()) * e, g2 = this - m3, D2 = function() {
            return b.m(y2, m3);
          };
          switch (M3) {
            case h:
              $2 = D2() / 12;
              break;
            case c:
              $2 = D2();
              break;
            case f:
              $2 = D2() / 3;
              break;
            case o:
              $2 = (g2 - v2) / 6048e5;
              break;
            case a:
              $2 = (g2 - v2) / 864e5;
              break;
            case u:
              $2 = g2 / n;
              break;
            case s:
              $2 = g2 / e;
              break;
            case i:
              $2 = g2 / t2;
              break;
            default:
              $2 = g2;
          }
          return l2 ? $2 : b.a($2);
        }, m2.daysInMonth = function() {
          return this.endOf(c).$D;
        }, m2.$locale = function() {
          return D[this.$L];
        }, m2.locale = function(t3, e2) {
          if (!t3)
            return this.$L;
          var n2 = this.clone(), r2 = w(t3, e2, true);
          return r2 && (n2.$L = r2), n2;
        }, m2.clone = function() {
          return b.w(this.$d, this);
        }, m2.toDate = function() {
          return new Date(this.valueOf());
        }, m2.toJSON = function() {
          return this.isValid() ? this.toISOString() : null;
        }, m2.toISOString = function() {
          return this.$d.toISOString();
        }, m2.toString = function() {
          return this.$d.toUTCString();
        }, M2;
      }(), Y = _.prototype;
      return O.prototype = Y, [["$ms", r], ["$s", i], ["$m", s], ["$H", u], ["$W", a], ["$M", c], ["$y", h], ["$D", d]].forEach(function(t3) {
        Y[t3[1]] = function(e2) {
          return this.$g(e2, t3[0], t3[1]);
        };
      }), O.extend = function(t3, e2) {
        return t3.$i || (t3(e2, _, O), t3.$i = true), O;
      }, O.locale = w, O.isDayjs = S, O.unix = function(t3) {
        return O(1e3 * t3);
      }, O.en = D[g], O.Ls = D, O.p = {}, O;
    });
  })(dayjs_min);
  var dayjs_minExports = dayjs_min.exports;
  const dayjs = /* @__PURE__ */ getDefaultExportFromCjs(dayjs_minExports);
  function checkPhone(phone) {
    return /^1[3-9]\d{9}$/.test(phone);
  }
  const _imports_0$1 = "/static/advertdown.png";
  const _sfc_main$H = {
    __name: "index",
    setup(__props, { expose: __expose }) {
      __expose();
      const userStore = useUserStore();
      const useMock = config$1.useMock;
      const phone = vue.ref("");
      const code2 = vue.ref("");
      const agreed = vue.ref(true);
      const counting = vue.ref(false);
      const codeText = vue.ref("获取验证码");
      let timer2 = null;
      let currentTime = 0;
      function sendCode() {
        if (counting.value)
          return;
        if (!phone.value)
          return uni.showToast({ title: "请输入手机号码", icon: "none" });
        if (!checkPhone(phone.value))
          return uni.showToast({ title: "手机号格式不正确", icon: "none" });
        getNote(phone.value).then((res) => {
          if (res.code === 1) {
            startCountDown();
          } else {
            uni.showToast({ title: res.msg || "发送失败", icon: "none" });
          }
        });
      }
      function startCountDown() {
        counting.value = true;
        currentTime = 60;
        codeText.value = "60s重新发送";
        timer2 = setInterval(() => {
          currentTime--;
          if (currentTime <= 0) {
            clearInterval(timer2);
            counting.value = false;
            codeText.value = "重新获取";
          } else {
            codeText.value = currentTime + "s重新发送";
          }
        }, 1e3);
      }
      function doLogin() {
        if (!phone.value)
          return uni.showToast({ title: "请输入手机号码", icon: "none" });
        if (!code2.value)
          return uni.showToast({ title: "请输入短信验证码", icon: "none" });
        if (!agreed.value)
          return uni.showToast({ title: "请先同意用户协议", icon: "none" });
        validateLogin(phone.value, code2.value).then((res) => {
          if (res.code === 1) {
            userStore.setAuth(String(res.data));
            uni.reLaunch({ url: "/pages/main/index" });
          } else {
            uni.showToast({ title: res.msg || "登录失败", icon: "none" });
          }
        });
      }
      function goAgreement(type) {
        uni.navigateTo({ url: "/pages/agreement/index?type=" + type });
      }
      vue.onUnmounted(() => {
        if (timer2)
          clearInterval(timer2);
      });
      const __returned__ = { userStore, useMock, phone, code: code2, agreed, counting, codeText, get timer() {
        return timer2;
      }, set timer(v) {
        timer2 = v;
      }, get currentTime() {
        return currentTime;
      }, set currentTime(v) {
        currentTime = v;
      }, sendCode, startCountDown, doLogin, goAgreement, ref: vue.ref, onUnmounted: vue.onUnmounted, customNav, get getNote() {
        return getNote;
      }, get validateLogin() {
        return validateLogin;
      }, get useUserStore() {
        return useUserStore;
      }, get checkPhone() {
        return checkPhone;
      }, get config() {
        return config$1;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$G(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "login" }, [
      vue.createVNode($setup["customNav"], {
        title: "登录",
        "show-back": false
      }),
      $setup.useMock ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 0,
        class: "mock-banner"
      }, "⚠️ MOCK 静态数据模式 · 验证码任意4位即可（如 1234）")) : vue.createCommentVNode("v-if", true),
      vue.createElementVNode("view", { class: "logo" }),
      vue.createElementVNode("view", { class: "form" }, [
        vue.createElementVNode("view", { class: "input-row" }, [
          vue.withDirectives(vue.createElementVNode(
            "input",
            {
              "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => $setup.phone = $event),
              class: "input",
              type: "number",
              maxlength: "11",
              placeholder: "请输入手机号"
            },
            null,
            512
            /* NEED_PATCH */
          ), [
            [vue.vModelText, $setup.phone]
          ])
        ]),
        vue.createElementVNode("view", { class: "input-row code-row" }, [
          vue.withDirectives(vue.createElementVNode(
            "input",
            {
              "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => $setup.code = $event),
              class: "input",
              type: "number",
              maxlength: "4",
              placeholder: "请输入验证码"
            },
            null,
            512
            /* NEED_PATCH */
          ), [
            [vue.vModelText, $setup.code]
          ]),
          vue.createElementVNode(
            "view",
            {
              class: vue.normalizeClass(["code-btn", { disabled: $setup.counting }]),
              onClick: $setup.sendCode
            },
            vue.toDisplayString($setup.codeText),
            3
            /* TEXT, CLASS */
          )
        ]),
        vue.createElementVNode("view", {
          class: "login-btn",
          onClick: $setup.doLogin
        }, "登录"),
        vue.createElementVNode("view", { class: "agree" }, [
          vue.createElementVNode("text", null, "登录即代表同意运动汇产品"),
          vue.createElementVNode("text", {
            class: "link",
            onClick: _cache[2] || (_cache[2] = ($event) => $setup.goAgreement(1))
          }, "《用户协议》"),
          vue.createElementVNode("text", null, "和"),
          vue.createElementVNode("text", {
            class: "link",
            onClick: _cache[3] || (_cache[3] = ($event) => $setup.goAgreement(2))
          }, "《隐私政策》")
        ])
      ]),
      vue.createElementVNode("image", {
        class: "bottom-logo",
        src: _imports_0$1,
        mode: "widthFix"
      })
    ]);
  }
  const PagesLoginIndex = /* @__PURE__ */ _export_sfc(_sfc_main$H, [["render", _sfc_render$G], ["__scopeId", "data-v-d08ef7d4"], ["__file", "F:/项目文件/uniapp版本/pages/login/index.vue"]]);
  const defineMixin = (options) => {
    return options;
  };
  const TransitionDefaultProps = {
    // transition动画组件的props
    transition: {
      show: false,
      mode: "fade",
      duration: "300",
      timingFunction: "ease-out"
    }
  };
  const version = "3";
  {
    formatAppLog("log", "at node_modules/uview-plus/libs/config/config.js:5", `
 %c uview-plus V${version} %c https://uview-plus.jiangruyi.com/ 

`, "color: #ffffff; background: #3c9cff; padding:5px 0;", "color: #3c9cff;background: #ffffff; padding:5px 0;");
  }
  const config = {
    v: version,
    version,
    // 主题名称
    type: [
      "primary",
      "success",
      "info",
      "error",
      "warning"
    ],
    // 颜色部分，本来可以通过scss的:export导出供js使用，但是奈何nvue不支持
    color: {
      "u-primary": "#2979ff",
      "u-warning": "#ff9900",
      "u-success": "#19be6b",
      "u-error": "#fa3534",
      "u-info": "#909399",
      "u-main-color": "#303133",
      "u-content-color": "#606266",
      "u-tips-color": "#909399",
      "u-light-color": "#c0c4cc",
      "up-primary": "#2979ff",
      "up-warning": "#ff9900",
      "up-success": "#19be6b",
      "up-error": "#fa3534",
      "up-info": "#909399",
      "up-main-color": "#303133",
      "up-content-color": "#606266",
      "up-tips-color": "#909399",
      "up-light-color": "#c0c4cc"
    },
    // 字体图标地址
    iconUrl: "https://at.alicdn.com/t/font_2225171_8kdcwk4po24.ttf",
    // 自定义图标
    customIcon: {
      family: "",
      url: ""
    },
    customIcons: {},
    // 自定义图标与unicode对应关系
    // 默认单位，可以通过配置为rpx，那么在用于传入组件大小参数为数值时，就默认为rpx
    unit: "px",
    // 是否由运行时主题同步原生导航栏、页面背景、tabBar等全局UI
    nativeThemeSync: false,
    // 拦截器
    interceptor: {
      navbarLeftClick: null
    },
    // 只加载一次字体
    loadFontOnce: false
  };
  const zIndex = {
    toast: 10090,
    noNetwork: 10080,
    // popup包含popup，actionsheet，keyboard，picker的值
    popup: 10075,
    mask: 10070,
    navbar: 980,
    topTips: 975,
    sticky: 970,
    indexListSticky: 965
  };
  const color$2 = {
    primary: "#3c9cff",
    info: "#909399",
    default: "#909399",
    warning: "#f9ae3d",
    error: "#f56c6c",
    success: "#5ac725",
    mainColor: "#303133",
    contentColor: "#606266",
    tipsColor: "#909399",
    lightColor: "#c0c4cc",
    borderColor: "#e4e7ed"
  };
  const { toString } = Object.prototype;
  function isArray(val) {
    return toString.call(val) === "[object Array]";
  }
  function isObject(val) {
    return val !== null && typeof val === "object";
  }
  function isDate(val) {
    return toString.call(val) === "[object Date]";
  }
  function isURLSearchParams(val) {
    return typeof URLSearchParams !== "undefined" && val instanceof URLSearchParams;
  }
  function forEach(obj, fn) {
    if (obj === null || typeof obj === "undefined") {
      return;
    }
    if (typeof obj !== "object") {
      obj = [obj];
    }
    if (isArray(obj)) {
      for (let i = 0, l = obj.length; i < l; i++) {
        fn.call(null, obj[i], i, obj);
      }
    } else {
      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          fn.call(null, obj[key], key, obj);
        }
      }
    }
  }
  function isPlainObject$1(obj) {
    return Object.prototype.toString.call(obj) === "[object Object]";
  }
  function deepMerge$1() {
    const result = {};
    function assignValue(val, key) {
      if (typeof result[key] === "object" && typeof val === "object") {
        result[key] = deepMerge$1(result[key], val);
      } else if (typeof val === "object") {
        result[key] = deepMerge$1({}, val);
      } else {
        result[key] = val;
      }
    }
    for (let i = 0, l = arguments.length; i < l; i++) {
      forEach(arguments[i], assignValue);
    }
    return result;
  }
  function isUndefined(val) {
    return typeof val === "undefined";
  }
  function encode(val) {
    return encodeURIComponent(val).replace(/%40/gi, "@").replace(/%3A/gi, ":").replace(/%24/g, "$").replace(/%2C/gi, ",").replace(/%20/g, "+").replace(/%5B/gi, "[").replace(/%5D/gi, "]");
  }
  function buildURL(url2, params2) {
    if (!params2) {
      return url2;
    }
    let serializedParams;
    if (isURLSearchParams(params2)) {
      serializedParams = params2.toString();
    } else {
      const parts = [];
      forEach(params2, (val, key) => {
        if (val === null || typeof val === "undefined") {
          return;
        }
        if (isArray(val)) {
          key = `${key}[]`;
        } else {
          val = [val];
        }
        forEach(val, (v) => {
          if (isDate(v)) {
            v = v.toISOString();
          } else if (isObject(v)) {
            v = JSON.stringify(v);
          }
          parts.push(`${encode(key)}=${encode(v)}`);
        });
      });
      serializedParams = parts.join("&");
    }
    if (serializedParams) {
      const hashmarkIndex = url2.indexOf("#");
      if (hashmarkIndex !== -1) {
        url2 = url2.slice(0, hashmarkIndex);
      }
      url2 += (url2.indexOf("?") === -1 ? "?" : "&") + serializedParams;
    }
    return url2;
  }
  function isAbsoluteURL(url2) {
    return /^([a-z][a-z\d+\-.]*:)?\/\//i.test(url2);
  }
  function combineURLs(baseURL, relativeURL) {
    return relativeURL ? `${baseURL.replace(/\/+$/, "")}/${relativeURL.replace(/^\/+/, "")}` : baseURL;
  }
  function buildFullPath(baseURL, requestedURL) {
    if (baseURL && !isAbsoluteURL(requestedURL)) {
      return combineURLs(baseURL, requestedURL);
    }
    return requestedURL;
  }
  function settle(resolve, reject, response) {
    const { validateStatus } = response.config;
    const status = response.statusCode;
    if (status && (!validateStatus || validateStatus(status))) {
      resolve(response);
    } else {
      reject(response);
    }
  }
  const mergeKeys$1 = (keys, config2) => {
    const config3 = {};
    keys.forEach((prop) => {
      if (!isUndefined(config2[prop])) {
        config3[prop] = config2[prop];
      }
    });
    return config3;
  };
  const adapter = (config2) => new Promise((resolve, reject) => {
    const fullPath = buildURL(buildFullPath(config2.baseURL, config2.url), config2.params);
    const _config = {
      url: fullPath,
      header: config2.header,
      complete: (response) => {
        config2.fullPath = fullPath;
        response.config = config2;
        try {
          if (typeof response.data === "string") {
            response.data = JSON.parse(response.data);
          }
        } catch (e) {
        }
        settle(resolve, reject, response);
      }
    };
    let requestTask;
    if (config2.method === "UPLOAD") {
      delete _config.header["content-type"];
      delete _config.header["Content-Type"];
      const otherConfig = {
        filePath: config2.filePath,
        name: config2.name
      };
      const optionalKeys = [
        "files",
        "timeout",
        "formData"
      ];
      requestTask = uni.uploadFile({ ..._config, ...otherConfig, ...mergeKeys$1(optionalKeys, config2) });
    } else if (config2.method === "DOWNLOAD") {
      if (!isUndefined(config2.timeout)) {
        _config.timeout = config2.timeout;
      }
      requestTask = uni.downloadFile(_config);
    } else {
      const optionalKeys = [
        "data",
        "method",
        "timeout",
        "dataType",
        "responseType",
        "sslVerify",
        "firstIpv4"
      ];
      requestTask = uni.request({ ..._config, ...mergeKeys$1(optionalKeys, config2) });
    }
    if (config2.getTask) {
      config2.getTask(requestTask, config2);
    }
  });
  const dispatchRequest = (config2) => adapter(config2);
  function InterceptorManager() {
    this.handlers = [];
  }
  InterceptorManager.prototype.use = function use(fulfilled, rejected) {
    this.handlers.push({
      fulfilled,
      rejected
    });
    return this.handlers.length - 1;
  };
  InterceptorManager.prototype.eject = function eject(id) {
    if (this.handlers[id]) {
      this.handlers[id] = null;
    }
  };
  InterceptorManager.prototype.forEach = function forEach2(fn) {
    this.handlers.forEach((h) => {
      if (h !== null) {
        fn(h);
      }
    });
  };
  const mergeKeys = (keys, globalsConfig, config2) => {
    const config3 = {};
    keys.forEach((prop) => {
      if (!isUndefined(config2[prop])) {
        config3[prop] = config2[prop];
      } else if (!isUndefined(globalsConfig[prop])) {
        config3[prop] = globalsConfig[prop];
      }
    });
    return config3;
  };
  const mergeConfig = (globalsConfig, config2 = {}) => {
    const method = config2.method || globalsConfig.method || "GET";
    let config3 = {
      baseURL: globalsConfig.baseURL || "",
      method,
      url: config2.url || "",
      params: config2.params || {},
      custom: { ...globalsConfig.custom || {}, ...config2.custom || {} },
      header: deepMerge$1(globalsConfig.header || {}, config2.header || {})
    };
    const defaultToConfig2Keys = ["getTask", "validateStatus"];
    config3 = { ...config3, ...mergeKeys(defaultToConfig2Keys, globalsConfig, config2) };
    if (method === "DOWNLOAD") {
      if (!isUndefined(config2.timeout)) {
        config3.timeout = config2.timeout;
      } else if (!isUndefined(globalsConfig.timeout)) {
        config3.timeout = globalsConfig.timeout;
      }
    } else if (method === "UPLOAD") {
      delete config3.header["content-type"];
      delete config3.header["Content-Type"];
      const uploadKeys = [
        "files",
        "filePath",
        "name",
        "timeout",
        "formData"
      ];
      uploadKeys.forEach((prop) => {
        if (!isUndefined(config2[prop])) {
          config3[prop] = config2[prop];
        }
      });
      if (isUndefined(config3.timeout) && !isUndefined(globalsConfig.timeout)) {
        config3.timeout = globalsConfig.timeout;
      }
    } else {
      const defaultsKeys = [
        "data",
        "timeout",
        "dataType",
        "responseType",
        "sslVerify",
        "firstIpv4"
      ];
      config3 = { ...config3, ...mergeKeys(defaultsKeys, globalsConfig, config2) };
    }
    return config3;
  };
  const defaults = {
    baseURL: "",
    header: {},
    method: "GET",
    dataType: "json",
    responseType: "text",
    custom: {},
    timeout: 6e4,
    sslVerify: true,
    firstIpv4: false,
    validateStatus: function validateStatus(status) {
      return status >= 200 && status < 300;
    }
  };
  var clone = function() {
    function _instanceof(obj, type) {
      return type != null && obj instanceof type;
    }
    var nativeMap;
    try {
      nativeMap = Map;
    } catch (_) {
      nativeMap = function() {
      };
    }
    var nativeSet;
    try {
      nativeSet = Set;
    } catch (_) {
      nativeSet = function() {
      };
    }
    var nativePromise;
    try {
      nativePromise = Promise;
    } catch (_) {
      nativePromise = function() {
      };
    }
    function clone2(parent, circular, depth, prototype, includeNonEnumerable) {
      if (typeof circular === "object") {
        depth = circular.depth;
        prototype = circular.prototype;
        includeNonEnumerable = circular.includeNonEnumerable;
        circular = circular.circular;
      }
      var allParents = [];
      var allChildren = [];
      var useBuffer = typeof Buffer != "undefined";
      if (typeof circular == "undefined")
        circular = true;
      if (typeof depth == "undefined")
        depth = Infinity;
      function _clone(parent2, depth2) {
        if (parent2 === null)
          return null;
        if (depth2 === 0)
          return parent2;
        var child;
        var proto;
        if (typeof parent2 != "object") {
          return parent2;
        }
        if (_instanceof(parent2, nativeMap)) {
          child = new nativeMap();
        } else if (_instanceof(parent2, nativeSet)) {
          child = new nativeSet();
        } else if (_instanceof(parent2, nativePromise)) {
          child = new nativePromise(function(resolve, reject) {
            parent2.then(function(value) {
              resolve(_clone(value, depth2 - 1));
            }, function(err) {
              reject(_clone(err, depth2 - 1));
            });
          });
        } else if (clone2.__isArray(parent2)) {
          child = [];
        } else if (clone2.__isRegExp(parent2)) {
          child = new RegExp(parent2.source, __getRegExpFlags(parent2));
          if (parent2.lastIndex)
            child.lastIndex = parent2.lastIndex;
        } else if (clone2.__isDate(parent2)) {
          child = new Date(parent2.getTime());
        } else if (useBuffer && Buffer.isBuffer(parent2)) {
          if (Buffer.from) {
            child = Buffer.from(parent2);
          } else {
            child = new Buffer(parent2.length);
            parent2.copy(child);
          }
          return child;
        } else if (_instanceof(parent2, Error)) {
          child = Object.create(parent2);
        } else {
          if (typeof prototype == "undefined") {
            proto = Object.getPrototypeOf(parent2);
            child = Object.create(proto);
          } else {
            child = Object.create(prototype);
            proto = prototype;
          }
        }
        if (circular) {
          var index2 = allParents.indexOf(parent2);
          if (index2 != -1) {
            return allChildren[index2];
          }
          allParents.push(parent2);
          allChildren.push(child);
        }
        if (_instanceof(parent2, nativeMap)) {
          parent2.forEach(function(value, key) {
            var keyChild = _clone(key, depth2 - 1);
            var valueChild = _clone(value, depth2 - 1);
            child.set(keyChild, valueChild);
          });
        }
        if (_instanceof(parent2, nativeSet)) {
          parent2.forEach(function(value) {
            var entryChild = _clone(value, depth2 - 1);
            child.add(entryChild);
          });
        }
        for (var i in parent2) {
          var attrs = Object.getOwnPropertyDescriptor(parent2, i);
          if (attrs) {
            child[i] = _clone(parent2[i], depth2 - 1);
          }
          try {
            var objProperty = Object.getOwnPropertyDescriptor(parent2, i);
            if (objProperty.set === "undefined") {
              continue;
            }
            child[i] = _clone(parent2[i], depth2 - 1);
          } catch (e) {
            if (e instanceof TypeError) {
              continue;
            } else if (e instanceof ReferenceError) {
              continue;
            }
          }
        }
        if (Object.getOwnPropertySymbols) {
          var symbols = Object.getOwnPropertySymbols(parent2);
          for (var i = 0; i < symbols.length; i++) {
            var symbol = symbols[i];
            var descriptor = Object.getOwnPropertyDescriptor(parent2, symbol);
            if (descriptor && !descriptor.enumerable && !includeNonEnumerable) {
              continue;
            }
            child[symbol] = _clone(parent2[symbol], depth2 - 1);
            Object.defineProperty(child, symbol, descriptor);
          }
        }
        if (includeNonEnumerable) {
          var allPropertyNames = Object.getOwnPropertyNames(parent2);
          for (var i = 0; i < allPropertyNames.length; i++) {
            var propertyName = allPropertyNames[i];
            var descriptor = Object.getOwnPropertyDescriptor(parent2, propertyName);
            if (descriptor && descriptor.enumerable) {
              continue;
            }
            child[propertyName] = _clone(parent2[propertyName], depth2 - 1);
            Object.defineProperty(child, propertyName, descriptor);
          }
        }
        return child;
      }
      return _clone(parent, depth);
    }
    clone2.clonePrototype = function clonePrototype(parent) {
      if (parent === null)
        return null;
      var c = function() {
      };
      c.prototype = parent;
      return new c();
    };
    function __objToStr(o) {
      return Object.prototype.toString.call(o);
    }
    clone2.__objToStr = __objToStr;
    function __isDate(o) {
      return typeof o === "object" && __objToStr(o) === "[object Date]";
    }
    clone2.__isDate = __isDate;
    function __isArray(o) {
      return typeof o === "object" && __objToStr(o) === "[object Array]";
    }
    clone2.__isArray = __isArray;
    function __isRegExp(o) {
      return typeof o === "object" && __objToStr(o) === "[object RegExp]";
    }
    clone2.__isRegExp = __isRegExp;
    function __getRegExpFlags(re) {
      var flags = "";
      if (re.global)
        flags += "g";
      if (re.ignoreCase)
        flags += "i";
      if (re.multiline)
        flags += "m";
      return flags;
    }
    clone2.__getRegExpFlags = __getRegExpFlags;
    return clone2;
  }();
  class Request {
    /**
    * @param {Object} arg - 全局配置
    * @param {String} arg.baseURL - 全局根路径
    * @param {Object} arg.header - 全局header
    * @param {String} arg.method = [GET|POST|PUT|DELETE|CONNECT|HEAD|OPTIONS|TRACE] - 全局默认请求方式
    * @param {String} arg.dataType = [json] - 全局默认的dataType
    * @param {String} arg.responseType = [text|arraybuffer] - 全局默认的responseType。支付宝小程序不支持
    * @param {Object} arg.custom - 全局默认的自定义参数
    * @param {Number} arg.timeout - 全局默认的超时时间，单位 ms。默认60000。H5(HBuilderX 2.9.9+)、APP(HBuilderX 2.9.9+)、微信小程序（2.10.0）、支付宝小程序
    * @param {Boolean} arg.sslVerify - 全局默认的是否验证 ssl 证书。默认true.仅App安卓端支持（HBuilderX 2.3.3+）
    * @param {Boolean} arg.withCredentials - 全局默认的跨域请求时是否携带凭证（cookies）。默认false。仅H5支持（HBuilderX 2.6.15+）
    * @param {Boolean} arg.firstIpv4 - 全DNS解析时优先使用ipv4。默认false。仅 App-Android 支持 (HBuilderX 2.8.0+)
    * @param {Function(statusCode):Boolean} arg.validateStatus - 全局默认的自定义验证器。默认statusCode >= 200 && statusCode < 300
    */
    constructor(arg = {}) {
      if (!isPlainObject$1(arg)) {
        arg = {};
        formatAppLog("warn", "at node_modules/uview-plus/libs/luch-request/core/Request.js:40", "设置全局参数必须接收一个Object");
      }
      this.config = clone({ ...defaults, ...arg });
      this.interceptors = {
        request: new InterceptorManager(),
        response: new InterceptorManager()
      };
    }
    /**
    * @Function
    * @param {Request~setConfigCallback} f - 设置全局默认配置
    */
    setConfig(f) {
      this.config = f(this.config);
    }
    middleware(config2) {
      config2 = mergeConfig(this.config, config2);
      const chain = [dispatchRequest, void 0];
      let promise2 = Promise.resolve(config2);
      this.interceptors.request.forEach((interceptor) => {
        chain.unshift(interceptor.fulfilled, interceptor.rejected);
      });
      this.interceptors.response.forEach((interceptor) => {
        chain.push(interceptor.fulfilled, interceptor.rejected);
      });
      while (chain.length) {
        promise2 = promise2.then(chain.shift(), chain.shift());
      }
      return promise2;
    }
    /**
    * @Function
    * @param {Object} config - 请求配置项
    * @prop {String} options.url - 请求路径
    * @prop {Object} options.data - 请求参数
    * @prop {Object} [options.responseType = config.responseType] [text|arraybuffer] - 响应的数据类型
    * @prop {Object} [options.dataType = config.dataType] - 如果设为 json，会尝试对返回的数据做一次 JSON.parse
    * @prop {Object} [options.header = config.header] - 请求header
    * @prop {Object} [options.method = config.method] - 请求方法
    * @returns {Promise<unknown>}
    */
    request(config2 = {}) {
      return this.middleware(config2);
    }
    get(url2, options = {}) {
      return this.middleware({
        url: url2,
        method: "GET",
        ...options
      });
    }
    post(url2, data, options = {}) {
      return this.middleware({
        url: url2,
        data,
        method: "POST",
        ...options
      });
    }
    put(url2, data, options = {}) {
      return this.middleware({
        url: url2,
        data,
        method: "PUT",
        ...options
      });
    }
    delete(url2, data, options = {}) {
      return this.middleware({
        url: url2,
        data,
        method: "DELETE",
        ...options
      });
    }
    options(url2, data, options = {}) {
      return this.middleware({
        url: url2,
        data,
        method: "OPTIONS",
        ...options
      });
    }
    upload(url2, config2 = {}) {
      config2.url = url2;
      config2.method = "UPLOAD";
      return this.middleware(config2);
    }
    download(url2, config2 = {}) {
      config2.url = url2;
      config2.method = "DOWNLOAD";
      return this.middleware(config2);
    }
  }
  const http = new Request();
  function email(value) {
    return /^\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z0-9]+$/.test(value);
  }
  function mobile(value) {
    return /^1[23456789]\d{9}$/.test(value);
  }
  function url(value) {
    return /^((https|http|ftp|rtsp|mms):\/\/)(([0-9a-zA-Z_!~*'().&=+$%-]+: )?[0-9a-zA-Z_!~*'().&=+$%-]+@)?(([0-9]{1,3}.){3}[0-9]{1,3}|([0-9a-zA-Z_!~*'()-]+.)*([0-9a-zA-Z][0-9a-zA-Z-]{0,61})?[0-9a-zA-Z].[a-zA-Z]{2,6})(:[0-9]{1,4})?((\/?)|(\/[0-9a-zA-Z_!~*'().;?:@&=+$,%#-]+)+\/?)$/.test(value);
  }
  function date(value) {
    if (!value)
      return false;
    if (typeof value === "number") {
      if (value.toString().length !== 10 && value.toString().length !== 13) {
        return false;
      }
      return !isNaN(new Date(value).getTime());
    }
    if (typeof value === "string") {
      const numV = Number(value);
      if (!isNaN(numV)) {
        if (numV.toString().length === 10 || numV.toString().length === 13) {
          return !isNaN(new Date(numV).getTime());
        }
      }
      if (value.length < 10 || value.length > 19) {
        return false;
      }
      const dateRegex = /^\d{4}[-\/]\d{2}[-\/]\d{2}( \d{1,2}:\d{2}(:\d{2})?)?$/;
      if (!dateRegex.test(value)) {
        return false;
      }
      const dateValue = new Date(value);
      return !isNaN(dateValue.getTime());
    }
    return false;
  }
  function dateISO(value) {
    return /^\d{4}[\/\-](0?[1-9]|1[012])[\/\-](0?[1-9]|[12][0-9]|3[01])$/.test(value);
  }
  function number(value) {
    return /^[\+-]?(\d+\.?\d*|\.\d+|\d\.\d+e\+\d+)$/.test(value);
  }
  function string(value) {
    return typeof value === "string";
  }
  function digits(value) {
    return /^\d+$/.test(value);
  }
  function idCard(value) {
    return /^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}([0-9]|X)$/.test(
      value
    );
  }
  function carNo(value) {
    const xreg = /^[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领A-Z]{1}[A-Z]{1}(([0-9]{5}[DF]$)|([DF][A-HJ-NP-Z0-9][0-9]{4}$))/;
    const creg = /^[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领A-Z]{1}[A-Z]{1}[A-HJ-NP-Z0-9]{4}[A-HJ-NP-Z0-9挂学警港澳]{1}$/;
    if (value.length === 7) {
      return creg.test(value);
    }
    if (value.length === 8) {
      return xreg.test(value);
    }
    return false;
  }
  function amount(value) {
    return /^[1-9]\d*(,\d{3})*(\.\d{1,2})?$|^0\.\d{1,2}$/.test(value);
  }
  function chinese(value) {
    const reg = /^[\u4e00-\u9fa5]+$/gi;
    return reg.test(value);
  }
  function letter(value) {
    return /^[a-zA-Z]*$/.test(value);
  }
  function enOrNum(value) {
    const reg = /^[0-9a-zA-Z]*$/g;
    return reg.test(value);
  }
  function contains(value, param) {
    return value.indexOf(param) >= 0;
  }
  function range$1(value, param) {
    return value >= param[0] && value <= param[1];
  }
  function rangeLength(value, param) {
    return value.length >= param[0] && value.length <= param[1];
  }
  function landline(value) {
    const reg = /^\d{3,4}-\d{7,8}(-\d{3,4})?$/;
    return reg.test(value);
  }
  function empty(value) {
    switch (typeof value) {
      case "undefined":
        return true;
      case "string":
        if (value.replace(/(^[ \t\n\r]*)|([ \t\n\r]*$)/g, "").length == 0)
          return true;
        break;
      case "boolean":
        if (!value)
          return true;
        break;
      case "number":
        if (value === 0 || isNaN(value))
          return true;
        break;
      case "object":
        if (value === null || value.length === 0)
          return true;
        for (const i in value) {
          return false;
        }
        return true;
    }
    return false;
  }
  function jsonString(value) {
    if (typeof value === "string") {
      try {
        const obj = JSON.parse(value);
        if (typeof obj === "object" && obj) {
          return true;
        }
        return false;
      } catch (e) {
        return false;
      }
    }
    return false;
  }
  function array(value) {
    if (typeof Array.isArray === "function") {
      return Array.isArray(value);
    }
    return Object.prototype.toString.call(value) === "[object Array]";
  }
  function object(value) {
    return Object.prototype.toString.call(value) === "[object Object]";
  }
  function objectPromise(value) {
    return Object.prototype.toString.call(value) === "[object Promise]";
  }
  function code(value, len = 6) {
    return new RegExp(`^\\d{${len}}$`).test(value);
  }
  function func(value) {
    return typeof value === "function";
  }
  function promise(value) {
    return objectPromise(value) && func(value.then) && func(value.catch);
  }
  function image(value) {
    const newValue = value.split("?")[0];
    const IMAGE_REGEXP = /\.(jpeg|jpg|gif|png|svg|webp|jfif|bmp|dpg)/i;
    return IMAGE_REGEXP.test(newValue);
  }
  function video(value) {
    const VIDEO_REGEXP = /\.(mp4|mpg|mpeg|dat|asf|avi|rm|rmvb|mov|wmv|flv|mkv|m3u8)/i;
    return VIDEO_REGEXP.test(value);
  }
  function regExp(o) {
    return o && Object.prototype.toString.call(o) === "[object RegExp]";
  }
  const test = {
    email,
    mobile,
    url,
    date,
    dateISO,
    number,
    digits,
    idCard,
    carNo,
    amount,
    chinese,
    letter,
    enOrNum,
    contains,
    range: range$1,
    rangeLength,
    empty,
    isEmpty: empty,
    jsonString,
    landline,
    object,
    array,
    code,
    func,
    promise,
    video,
    image,
    regExp,
    string
  };
  function strip(num, precision = 15) {
    return +parseFloat(Number(num).toPrecision(precision));
  }
  function digitLength(num) {
    const eSplit = num.toString().split(/[eE]/);
    const len = (eSplit[0].split(".")[1] || "").length - +(eSplit[1] || 0);
    return len > 0 ? len : 0;
  }
  function float2Fixed(num) {
    if (num.toString().indexOf("e") === -1) {
      return Number(num.toString().replace(".", ""));
    }
    const dLen = digitLength(num);
    return dLen > 0 ? strip(Number(num) * Math.pow(10, dLen)) : Number(num);
  }
  function checkBoundary(num) {
    {
      if (num > Number.MAX_SAFE_INTEGER || num < Number.MIN_SAFE_INTEGER) {
        formatAppLog("warn", "at node_modules/uview-plus/libs/function/digit.js:45", `${num} 超出了精度限制，结果可能不正确`);
      }
    }
  }
  function iteratorOperation(arr, operation) {
    const [num1, num2, ...others] = arr;
    let res = operation(num1, num2);
    others.forEach((num) => {
      res = operation(res, num);
    });
    return res;
  }
  function times(...nums) {
    if (nums.length > 2) {
      return iteratorOperation(nums, times);
    }
    const [num1, num2] = nums;
    const num1Changed = float2Fixed(num1);
    const num2Changed = float2Fixed(num2);
    const baseNum = digitLength(num1) + digitLength(num2);
    const leftValue = num1Changed * num2Changed;
    checkBoundary(leftValue);
    return leftValue / Math.pow(10, baseNum);
  }
  function divide(...nums) {
    if (nums.length > 2) {
      return iteratorOperation(nums, divide);
    }
    const [num1, num2] = nums;
    const num1Changed = float2Fixed(num1);
    const num2Changed = float2Fixed(num2);
    checkBoundary(num1Changed);
    checkBoundary(num2Changed);
    return times(num1Changed / num2Changed, strip(Math.pow(10, digitLength(num2) - digitLength(num1))));
  }
  function round(num, ratio) {
    const base = Math.pow(10, ratio);
    let result = divide(Math.round(Math.abs(times(num, base))), base);
    if (num < 0 && result !== 0) {
      result = times(result, -1);
    }
    return result;
  }
  function range(min = 0, max = 0, value = 0) {
    return Math.max(min, Math.min(max, Number(value)));
  }
  function getPx(value, unit = false) {
    if (number(value)) {
      return unit ? `${value}px` : Number(value);
    }
    if (/(rpx|upx)$/.test(value)) {
      return unit ? `${uni.upx2px(parseInt(value))}px` : Number(uni.upx2px(parseInt(value)));
    }
    return unit ? `${parseInt(value)}px` : parseInt(value);
  }
  function rpx2px(value) {
    return uni.upx2px(value);
  }
  function sleep(value = 30) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, value);
    });
  }
  function os() {
    return uni.getDeviceInfo().platform.toLowerCase();
  }
  function sys() {
    return uni.getSystemInfoSync();
  }
  function getWindowInfo() {
    let ret = {};
    ret = uni.getWindowInfo();
    return ret;
  }
  function random(min, max) {
    if (min >= 0 && max > 0 && max >= min) {
      const gab = max - min + 1;
      return Math.floor(Math.random() * gab + min);
    }
    return 0;
  }
  function guid(len = 32, firstU = true, radix = null) {
    const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz".split("");
    const uuid = [];
    radix = radix || chars.length;
    if (len) {
      for (let i = 0; i < len; i++)
        uuid[i] = chars[0 | Math.random() * radix];
    } else {
      let r;
      uuid[8] = uuid[13] = uuid[18] = uuid[23] = "-";
      uuid[14] = "4";
      for (let i = 0; i < 36; i++) {
        if (!uuid[i]) {
          r = 0 | Math.random() * 16;
          uuid[i] = chars[i == 19 ? r & 3 | 8 : r];
        }
      }
    }
    if (firstU) {
      uuid.shift();
      return `u${uuid.join("")}`;
    }
    return uuid.join("");
  }
  function $parent(name = void 0) {
    let parent = this.$parent;
    while (parent) {
      let name2 = "";
      if (name.startsWith("up-")) {
        name2 = name.replace(/up-([a-zA-Z0-9-_]+)/g, "u-$1");
      } else if (name.startsWith("u-")) {
        name2 = name.replace(/u-([a-zA-Z0-9-_]+)/g, "up-$1");
      }
      if (parent.$options && parent.$options.name !== name && parent.$options.name !== name2) {
        parent = parent.$parent;
      } else {
        return parent;
      }
    }
    return false;
  }
  function addStyle(customStyle, target = "object") {
    if (empty(customStyle) || typeof customStyle === "object" && target === "object" || target === "string" && typeof customStyle === "string") {
      return customStyle;
    }
    if (target === "object") {
      customStyle = trim(customStyle);
      const styleArray = customStyle.split(";");
      const style = {};
      for (let i = 0; i < styleArray.length; i++) {
        if (styleArray[i]) {
          const item = styleArray[i].split(":");
          style[trim(item[0])] = trim(item[1]);
        }
      }
      return style;
    }
    let string2 = "";
    if (typeof customStyle === "object") {
      customStyle.forEach((val, i) => {
        const key = i.replace(/([A-Z])/g, "-$1").toLowerCase();
        string2 += `${key}:${val};`;
      });
    }
    return trim(string2);
  }
  function addUnit(value = "auto", unit = "") {
    if (!unit) {
      unit = config.unit || "px";
    }
    if (unit == "rpx" && number(String(value))) {
      value = value * 2;
    }
    value = String(value);
    return number(value) ? `${value}${unit}` : value;
  }
  function deepClone(obj) {
    if ([null, void 0, NaN, false].includes(obj))
      return obj;
    if (typeof obj !== "object" && typeof obj !== "function") {
      return obj;
    }
    const o = array(obj) ? [] : {};
    for (const i in obj) {
      if (obj.hasOwnProperty(i)) {
        o[i] = typeof obj[i] === "object" ? deepClone(obj[i]) : obj[i];
      }
    }
    return o;
  }
  function deepMerge(targetOrigin = {}, source = {}) {
    let target = deepClone(targetOrigin);
    if (typeof target !== "object" || typeof source !== "object")
      return false;
    for (const prop in source) {
      if (!source.hasOwnProperty(prop))
        continue;
      if (prop in target) {
        if (source[prop] == null) {
          target[prop] = source[prop];
        } else if (typeof target[prop] !== "object") {
          target[prop] = source[prop];
        } else if (typeof source[prop] !== "object") {
          target[prop] = source[prop];
        } else if (target[prop].concat && source[prop].concat) {
          target[prop] = target[prop].concat(source[prop]);
        } else {
          target[prop] = deepMerge(target[prop], source[prop]);
        }
      } else {
        target[prop] = source[prop];
      }
    }
    return target;
  }
  function shallowMerge(target, source = {}) {
    if (typeof target !== "object" || typeof source !== "object")
      return false;
    for (const prop in source) {
      if (!source.hasOwnProperty(prop))
        continue;
      if (prop in target) {
        if (source[prop] == null) {
          target[prop] = source[prop];
        } else if (typeof target[prop] !== "object") {
          target[prop] = source[prop];
        } else if (typeof source[prop] !== "object") {
          target[prop] = source[prop];
        } else if (target[prop].concat && source[prop].concat) {
          target[prop] = target[prop].concat(source[prop]);
        } else {
          target[prop] = shallowMerge(target[prop], source[prop]);
        }
      } else {
        target[prop] = source[prop];
      }
    }
    return target;
  }
  function error(err) {
    {
      formatAppLog("error", "at node_modules/uview-plus/libs/function/index.js:323", `uView提示：${err}`);
    }
  }
  function randomArray(array2 = []) {
    return array2.sort(() => Math.random() - 0.5);
  }
  if (!String.prototype.padStart) {
    String.prototype.padStart = function(maxLength, fillString = " ") {
      if (Object.prototype.toString.call(fillString) !== "[object String]") {
        throw new TypeError(
          "fillString must be String"
        );
      }
      const str = this;
      if (str.length >= maxLength)
        return String(str);
      const fillLength = maxLength - str.length;
      let times2 = Math.ceil(fillLength / fillString.length);
      while (times2 >>= 1) {
        fillString += fillString;
        if (times2 === 1) {
          fillString += fillString;
        }
      }
      return fillString.slice(0, fillLength) + str;
    };
  }
  function timeFormat(dateTime = null, formatStr = "yyyy-mm-dd") {
    let date2;
    if (!dateTime) {
      date2 = /* @__PURE__ */ new Date();
    } else if (/^\d{10}$/.test(dateTime.toString().trim())) {
      date2 = new Date(dateTime * 1e3);
    } else if (typeof dateTime === "string" && /^\d+$/.test(dateTime.trim())) {
      date2 = new Date(Number(dateTime));
    } else if (typeof dateTime === "string" && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,3})?(Z|[+-]\d{2}:\d{2})?$/.test(dateTime)) {
      date2 = new Date(dateTime);
    } else {
      date2 = new Date(
        typeof dateTime === "string" ? dateTime.replace(/-/g, "/") : dateTime
      );
    }
    const timeSource = {
      "y": date2.getFullYear().toString(),
      // 年
      "m": (date2.getMonth() + 1).toString().padStart(2, "0"),
      // 月
      "d": date2.getDate().toString().padStart(2, "0"),
      // 日
      "h": date2.getHours().toString().padStart(2, "0"),
      // 时
      "M": date2.getMinutes().toString().padStart(2, "0"),
      // 分
      "s": date2.getSeconds().toString().padStart(2, "0")
      // 秒
      // 有其他格式化字符需求可以继续添加，必须转化成字符串
    };
    for (const key in timeSource) {
      const [ret] = new RegExp(`${key}+`).exec(formatStr) || [];
      if (ret) {
        const beginIndex = key === "y" && ret.length === 2 ? 2 : 0;
        formatStr = formatStr.replace(ret, timeSource[key].slice(beginIndex));
      }
    }
    return formatStr;
  }
  function timeFrom(timestamp = null, format = "yyyy-mm-dd") {
    if (timestamp == null)
      timestamp = Number(/* @__PURE__ */ new Date());
    timestamp = parseInt(timestamp);
    if (timestamp.toString().length == 10)
      timestamp *= 1e3;
    let timer2 = (/* @__PURE__ */ new Date()).getTime() - timestamp;
    timer2 = parseInt(timer2 / 1e3);
    let tips = "";
    switch (true) {
      case timer2 < 300:
        tips = "刚刚";
        break;
      case (timer2 >= 300 && timer2 < 3600):
        tips = `${parseInt(timer2 / 60)}分钟前`;
        break;
      case (timer2 >= 3600 && timer2 < 86400):
        tips = `${parseInt(timer2 / 3600)}小时前`;
        break;
      case (timer2 >= 86400 && timer2 < 2592e3):
        tips = `${parseInt(timer2 / 86400)}天前`;
        break;
      default:
        if (format === false) {
          if (timer2 >= 2592e3 && timer2 < 365 * 86400) {
            tips = `${parseInt(timer2 / (86400 * 30))}个月前`;
          } else {
            tips = `${parseInt(timer2 / (86400 * 365))}年前`;
          }
        } else {
          tips = timeFormat(timestamp, format);
        }
    }
    return tips;
  }
  function trim(str, pos = "both") {
    str = String(str);
    if (pos == "both") {
      return str.replace(/^\s+|\s+$/g, "");
    }
    if (pos == "left") {
      return str.replace(/^\s*/, "");
    }
    if (pos == "right") {
      return str.replace(/(\s*$)/g, "");
    }
    if (pos == "all") {
      return str.replace(/\s+/g, "");
    }
    return str;
  }
  function queryParams(data = {}, isPrefix = true, arrayFormat = "brackets") {
    const prefix = isPrefix ? "?" : "";
    const _result = [];
    if (["indices", "brackets", "repeat", "comma"].indexOf(arrayFormat) == -1)
      arrayFormat = "brackets";
    for (const key in data) {
      const value = data[key];
      if (["", void 0, null].indexOf(value) >= 0) {
        continue;
      }
      if (value.constructor === Array) {
        switch (arrayFormat) {
          case "indices":
            for (let i = 0; i < value.length; i++) {
              _result.push(`${key}[${i}]=${value[i]}`);
            }
            break;
          case "brackets":
            value.forEach((_value) => {
              _result.push(`${key}[]=${_value}`);
            });
            break;
          case "repeat":
            value.forEach((_value) => {
              _result.push(`${key}=${_value}`);
            });
            break;
          case "comma":
            let commaStr = "";
            value.forEach((_value) => {
              commaStr += (commaStr ? "," : "") + _value;
            });
            _result.push(`${key}=${commaStr}`);
            break;
          default:
            value.forEach((_value) => {
              _result.push(`${key}[]=${_value}`);
            });
        }
      } else {
        _result.push(`${key}=${value}`);
      }
    }
    return _result.length ? prefix + _result.join("&") : "";
  }
  function toast(title, duration = 2e3) {
    uni.showToast({
      title: String(title),
      icon: "none",
      duration
    });
  }
  function type2icon(type = "success", fill = false) {
    if (["primary", "info", "error", "warning", "success"].indexOf(type) == -1)
      type = "success";
    let iconName = "";
    switch (type) {
      case "primary":
        iconName = "info-circle";
        break;
      case "info":
        iconName = "info-circle";
        break;
      case "error":
        iconName = "close-circle";
        break;
      case "warning":
        iconName = "error-circle";
        break;
      case "success":
        iconName = "checkmark-circle";
        break;
      default:
        iconName = "checkmark-circle";
    }
    if (fill)
      iconName += "-fill";
    return iconName;
  }
  function priceFormat(number2, decimals = 0, decimalPoint = ".", thousandsSeparator = ",") {
    number2 = `${number2}`.replace(/[^0-9+-Ee.]/g, "");
    const n = !isFinite(+number2) ? 0 : +number2;
    const prec = !isFinite(+decimals) ? 0 : Math.abs(decimals);
    const sep = typeof thousandsSeparator === "undefined" ? "," : thousandsSeparator;
    const dec = typeof decimalPoint === "undefined" ? "." : decimalPoint;
    let s = "";
    s = (prec ? round(n, prec) + "" : `${Math.round(n)}`).split(".");
    const re = /(-?\d+)(\d{3})/;
    while (re.test(s[0])) {
      s[0] = s[0].replace(re, `$1${sep}$2`);
    }
    if ((s[1] || "").length < prec) {
      s[1] = s[1] || "";
      s[1] += new Array(prec - s[1].length + 1).join("0");
    }
    return s.join(dec);
  }
  function getDuration(value, unit = true) {
    const valueNum = parseInt(value);
    if (unit) {
      if (/s$/.test(value))
        return value;
      return value > 30 ? `${value}ms` : `${value}s`;
    }
    if (/ms$/.test(value))
      return valueNum;
    if (/s$/.test(value))
      return valueNum > 30 ? valueNum : valueNum * 1e3;
    return valueNum;
  }
  function padZero(value) {
    return `00${value}`.slice(-2);
  }
  function formValidate(instance, event) {
    const formItem = $parent.call(instance, "up-form-item");
    const form = $parent.call(instance, "up-form");
    if (formItem && form) {
      form.validateField(formItem.prop, () => {
      }, event);
    }
  }
  function getProperty(obj, key) {
    if (typeof obj !== "object" || null == obj) {
      return "";
    }
    if (typeof key !== "string" || key === "") {
      return "";
    }
    if (key.indexOf(".") !== -1) {
      const keys = key.split(".");
      let firstObj = obj[keys[0]] || {};
      for (let i = 1; i < keys.length; i++) {
        if (firstObj) {
          firstObj = firstObj[keys[i]];
        }
      }
      return firstObj;
    }
    return obj[key];
  }
  function setProperty(obj, key, value) {
    if (typeof obj !== "object" || null == obj) {
      return;
    }
    const inFn = function(_obj, keys, v) {
      if (keys.length === 1) {
        _obj[keys[0]] = v;
        return;
      }
      while (keys.length > 1) {
        const k = keys[0];
        if (!_obj[k] || typeof _obj[k] !== "object") {
          _obj[k] = {};
        }
        keys.shift();
        inFn(_obj[k], keys, v);
      }
    };
    if (typeof key !== "string" || key === "")
      ;
    else if (key.indexOf(".") !== -1) {
      const keys = key.split(".");
      inFn(obj, keys, value);
    } else {
      obj[key] = value;
    }
  }
  function page() {
    const pages2 = getCurrentPages();
    return `/${pages2[pages2.length - 1].route || ""}`;
  }
  function pages() {
    const pages2 = getCurrentPages();
    return pages2;
  }
  function getValueByPath(obj, path) {
    const pathArr = path.split(".");
    return pathArr.reduce((acc, curr) => {
      return acc && acc[curr] !== void 0 ? acc[curr] : void 0;
    }, obj);
  }
  function genLightColor(textColor, lightness = 95) {
    const rgb = parseColorWithoutDOM(textColor);
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    const bgHsl = {
      h: hsl.h,
      s: hsl.s,
      l: Math.min(lightness, 95)
    };
    return hslToHex(bgHsl.h, bgHsl.s, bgHsl.l);
  }
  function parseColorWithoutDOM(colorStr) {
    const str = colorStr.toLowerCase().trim();
    if (str.startsWith("#")) {
      const hex = str.replace("#", "");
      const fullHex = hex.length === 3 ? hex.split("").map((c) => c + c).join("") : hex;
      return {
        r: parseInt(fullHex.substring(0, 2), 16),
        g: parseInt(fullHex.substring(2, 4), 16),
        b: parseInt(fullHex.substring(4, 6), 16)
      };
    }
    const rgbMatch = str.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (rgbMatch) {
      return {
        r: +rgbMatch[1],
        g: +rgbMatch[2],
        b: +rgbMatch[3]
      };
    }
    throw new Error("Invalid color format");
  }
  function rgbToHsl(r, g, b) {
    r /= 255, g /= 255, b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + 4;
          break;
      }
      h = (h * 60).toFixed(1);
    }
    return { h: +h, s: +(s * 100).toFixed(1), l: +(l * 100).toFixed(1) };
  }
  function hslToHex(h, s, l) {
    l /= 100;
    const a = s * Math.min(l, 1 - l) / 100;
    const f = (n) => {
      const k = (n + h / 30) % 12;
      const color2 = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      return Math.round(255 * color2).toString(16).padStart(2, "0");
    };
    return `#${f(0)}${f(8)}${f(4)}`;
  }
  const index = {
    range,
    getPx,
    sleep,
    os,
    sys,
    getWindowInfo,
    random,
    guid,
    $parent,
    addStyle,
    addUnit,
    deepClone,
    deepMerge,
    shallowMerge,
    error,
    randomArray,
    timeFormat,
    timeFrom,
    trim,
    queryParams,
    toast,
    type2icon,
    priceFormat,
    getDuration,
    padZero,
    formValidate,
    getProperty,
    setProperty,
    page,
    pages,
    getValueByPath,
    genLightColor,
    rpx2px
  };
  const componentKeys = [
    "actionSheet",
    "album",
    "alert",
    "avatar",
    "avatarGroup",
    "backtop",
    "badge",
    "box",
    "button",
    "calendar",
    "calendarStrip",
    "carKeyboard",
    "card",
    "cell",
    "cellGroup",
    "checkbox",
    "checkboxGroup",
    "circleProgress",
    "code",
    "codeInput",
    "col",
    "collapse",
    "collapseItem",
    "columnNotice",
    "countDown",
    "countTo",
    "datetimePicker",
    "divider",
    "dropdown",
    "dropdownItem",
    "empty",
    "form",
    "formItem",
    "gap",
    "grid",
    "gridItem",
    "guide",
    "icon",
    "image",
    "indexAnchor",
    "indexItem",
    "indexList",
    "input",
    "keyboard",
    "line",
    "lineProgress",
    "link",
    "list",
    "listItem",
    "loadingIcon",
    "loadingPage",
    "loadmore",
    "modal",
    "navbar",
    "navbarMini",
    "noNetwork",
    "noticeBar",
    "notify",
    "numberBox",
    "numberKeyboard",
    "overlay",
    "parse",
    "pdfReader",
    "picker",
    "pickerColumn",
    "popover",
    "popup",
    "radio",
    "radioGroup",
    "rate",
    "readMore",
    "row",
    "rowNotice",
    "safeBottom",
    "scrollList",
    "search",
    "section",
    "skeleton",
    "slider",
    "statusBar",
    "steps",
    "stepsItem",
    "sticky",
    "subsection",
    "swipeAction",
    "swipeActionItem",
    "swiper",
    "swiperIndicator",
    "switch",
    "tabbar",
    "tabbarItem",
    "table",
    "tabs",
    "tabsItem",
    "tag",
    "td",
    "text",
    "textarea",
    "th",
    "toast",
    "toolbar",
    "tooltip",
    "tr",
    "transition",
    "upload"
  ];
  const props$b = {};
  function ensureComponentProps(key) {
    if (!props$b[key] || typeof props$b[key] !== "object") {
      props$b[key] = {};
    }
    return props$b[key];
  }
  function isPlainObject(value) {
    return Object.prototype.toString.call(value) === "[object Object]";
  }
  function cloneDefaultValue(value) {
    if (Array.isArray(value)) {
      return value.slice();
    }
    if (isPlainObject(value)) {
      return mergeDefaults({}, value);
    }
    return value;
  }
  function mergeDefaults(target, defaults2 = {}) {
    if (!target || typeof target !== "object" || !defaults2 || typeof defaults2 !== "object") {
      return target;
    }
    Object.keys(defaults2).forEach((key) => {
      const defaultValue = defaults2[key];
      const targetValue = target[key];
      if (targetValue === void 0) {
        target[key] = cloneDefaultValue(defaultValue);
      } else if (isPlainObject(targetValue) && isPlainObject(defaultValue)) {
        mergeDefaults(targetValue, defaultValue);
      }
    });
    return target;
  }
  componentKeys.forEach(ensureComponentProps);
  function registerComponentProps(defaultProps = {}) {
    Object.keys(defaultProps || {}).forEach((key) => {
      const componentProps = ensureComponentProps(key);
      mergeDefaults(componentProps, defaultProps[key]);
    });
    return props$b;
  }
  function setPropsConfig(configProps = {}) {
    Object.keys(configProps || {}).forEach((key) => {
      shallowMerge(ensureComponentProps(key), configProps[key]);
    });
    return props$b;
  }
  function setConfig$1(configs = {}) {
    shallowMerge(config, configs.config || {});
    setPropsConfig(configs.props || {});
    shallowMerge(color$2, configs.color || {});
    shallowMerge(zIndex, configs.zIndex || {});
  }
  if (typeof uni !== "undefined" && uni && uni.upuiParams) {
    formatAppLog("log", "at node_modules/uview-plus/libs/config/props.js:185", "setting uview-plus");
    let temp = uni.upuiParams();
    if (temp.httpIns) {
      temp.httpIns(http);
    }
    if (temp.options) {
      setConfig$1(temp.options);
    }
  }
  const defProps$9 = registerComponentProps(TransitionDefaultProps);
  const props$a = defineMixin({
    props: {
      // 是否展示组件
      show: {
        type: Boolean,
        default: () => defProps$9.transition.show
      },
      // 使用的动画模式
      mode: {
        type: String,
        default: () => defProps$9.transition.mode
      },
      // 动画的执行时间，单位ms
      duration: {
        type: [String, Number],
        default: () => defProps$9.transition.duration
      },
      // 使用的动画过渡函数
      timingFunction: {
        type: String,
        default: () => defProps$9.transition.timingFunction
      }
    }
  });
  const mpMixin = defineMixin({});
  class Router {
    constructor() {
      this.config = {
        type: "navigateTo",
        url: "",
        delta: 1,
        // navigateBack页面后退时,回退的层数
        params: {},
        // 传递的参数
        animationType: "pop-in",
        // 窗口动画,只在APP有效
        animationDuration: 300,
        // 窗口动画持续时间,单位毫秒,只在APP有效
        intercept: false
        // 是否需要拦截
      };
      this.route = this.route.bind(this);
    }
    // 判断url前面是否有"/"，如果没有则加上，否则无法跳转
    addRootPath(url2) {
      return url2[0] === "/" ? url2 : `/${url2}`;
    }
    // 整合路由参数
    mixinParam(url2, params2) {
      url2 = url2 && this.addRootPath(url2);
      let query = "";
      if (/.*\/.*\?.*=.*/.test(url2)) {
        query = queryParams(params2, false);
        return url2 += `&${query}`;
      }
      query = queryParams(params2);
      return url2 += query;
    }
    // 对外的方法名称
    async route(options = {}, params2 = {}) {
      let mergeConfig2 = {};
      if (typeof options === "string") {
        mergeConfig2.url = this.mixinParam(options, params2);
        mergeConfig2.type = "navigateTo";
      } else {
        mergeConfig2 = deepMerge(this.config, options);
        mergeConfig2.url = this.mixinParam(options.url, options.params);
      }
      if (mergeConfig2.url === page())
        return;
      if (params2.intercept) {
        this.config.intercept = params2.intercept;
      }
      mergeConfig2.params = params2;
      mergeConfig2 = deepMerge(this.config, mergeConfig2);
      if (typeof uni.$u.routeIntercept === "function") {
        const isNext = await new Promise((resolve, reject) => {
          uni.$u.routeIntercept(mergeConfig2, resolve);
        });
        isNext && this.openPage(mergeConfig2);
      } else {
        this.openPage(mergeConfig2);
      }
    }
    // 执行路由跳转
    openPage(config2) {
      const {
        url: url2,
        type,
        delta,
        animationType,
        animationDuration
      } = config2;
      if (config2.type == "navigateTo" || config2.type == "to") {
        uni.navigateTo({
          url: url2,
          animationType,
          animationDuration
        });
      }
      if (config2.type == "redirectTo" || config2.type == "redirect") {
        uni.redirectTo({
          url: url2
        });
      }
      if (config2.type == "switchTab" || config2.type == "tab") {
        uni.switchTab({
          url: url2
        });
      }
      if (config2.type == "reLaunch" || config2.type == "launch") {
        uni.reLaunch({
          url: url2
        });
      }
      if (config2.type == "navigateBack" || config2.type == "back") {
        uni.navigateBack({
          delta
        });
      }
    }
  }
  const route = new Router().route;
  const THEME_MODE_STORAGE_KEY$1 = "u-theme-mode";
  const FALLBACK_THEME_VARS = {
    light: {
      "--up-main-color": "var(--up-light-main-color, #303133)",
      "--up-content-color": "var(--up-light-content-color, #606266)",
      "--up-tips-color": "var(--up-light-tips-color, #909193)",
      "--up-light-color": "var(--up-light-light-color, #c0c4cc)",
      "--up-border-color": "var(--up-light-border-color, #dadbde)",
      "--up-bg-color": "var(--up-light-bg-color, #f3f4f6)",
      "--up-hover-bg-color": "#e7ebf0",
      "--up-page-bg-color": "#f3f4f6",
      "--up-card-bg-color": "#ffffff",
      "--up-navbar-bg-color": "#ffffff",
      "--up-table2-header-bg-color": "#f5f7fa",
      "--up-table2-zebra-bg-color": "#fafafa",
      "--up-table2-highlight-bg-color": "#f5f7fa",
      "--up-gap-bg-color": "#f3f4f6",
      "--up-skeleton-bg-color": "#f1f2f4",
      "--up-skeleton-shimmer-color": "#e6e6e6",
      "--up-swipe-action-button-bg-color": "#c7c6cd",
      "--up-index-list-indicator-bg-color": "#c9c9c9",
      "--up-calendar-month-mark-color": "rgba(231, 232, 234, 0.83)",
      "--up-disabled-color": "var(--up-light-disabled-color, #c8c9cc)",
      "--up-primary": "var(--up-light-primary, #3c9cff)",
      "--up-primary-dark": "var(--up-light-primary-dark, #398ade)",
      "--up-primary-disabled": "var(--up-light-primary-disabled, #9acafc)",
      "--up-primary-light": "var(--up-light-primary-light, #ecf5ff)",
      "--up-warning": "var(--up-light-warning, #f9ae3d)",
      "--up-warning-dark": "var(--up-light-warning-dark, #f1a532)",
      "--up-warning-disabled": "var(--up-light-warning-disabled, #f9d39b)",
      "--up-warning-light": "var(--up-light-warning-light, #fdf6ec)",
      "--up-success": "var(--up-light-success, #5ac725)",
      "--up-success-dark": "var(--up-light-success-dark, #53c21d)",
      "--up-success-disabled": "var(--up-light-success-disabled, #a9e08f)",
      "--up-success-light": "var(--up-light-success-light, #f5fff0)",
      "--up-error": "var(--up-light-error, #f56c6c)",
      "--up-error-dark": "var(--up-light-error-dark, #e45656)",
      "--up-error-disabled": "var(--up-light-error-disabled, #f7b2b2)",
      "--up-error-light": "var(--up-light-error-light, #fef0f0)",
      "--up-info": "var(--up-light-info, #909399)",
      "--up-info-dark": "var(--up-light-info-dark, #767a82)",
      "--up-info-disabled": "var(--up-light-info-disabled, #c4c6c9)",
      "--up-info-light": "var(--up-light-info-light, #f4f4f5)"
    },
    dark: {
      "--up-main-color": "#f5f5f5",
      "--up-content-color": "#d1d5db",
      "--up-tips-color": "#9ca3af",
      "--up-light-color": "#6b7280",
      "--up-border-color": "#3a3a3c",
      "--up-bg-color": "#1f1f1f",
      "--up-hover-bg-color": "#343741",
      "--up-page-bg-color": "#1f1f1f",
      "--up-card-bg-color": "#1c1c1e",
      "--up-navbar-bg-color": "#1c1c1e",
      "--up-table2-header-bg-color": "#2a2d33",
      "--up-table2-zebra-bg-color": "#23262b",
      "--up-table2-highlight-bg-color": "#2f3440",
      "--up-gap-bg-color": "#111111",
      "--up-skeleton-bg-color": "#2f3135",
      "--up-skeleton-shimmer-color": "rgba(255, 255, 255, 0.12)",
      "--up-swipe-action-button-bg-color": "#4b5563",
      "--up-index-list-indicator-bg-color": "#4b5563",
      "--up-calendar-month-mark-color": "rgba(255, 255, 255, 0.04)",
      "--up-disabled-color": "#4b5563",
      "--up-primary": "#3c9cff",
      "--up-primary-dark": "#5aa8ff",
      "--up-primary-disabled": "#4c6f92",
      "--up-primary-light": "#10243a",
      "--up-warning": "#f9ae3d",
      "--up-warning-dark": "#ffbf66",
      "--up-warning-disabled": "#8a6a3a",
      "--up-warning-light": "#3d2f1b",
      "--up-success": "#5ac725",
      "--up-success-dark": "#7ad94b",
      "--up-success-disabled": "#5f7f4f",
      "--up-success-light": "#1f3316",
      "--up-error": "#f56c6c",
      "--up-error-dark": "#ff8a8a",
      "--up-error-disabled": "#8d5858",
      "--up-error-light": "#3a2222",
      "--up-info": "#909399",
      "--up-info-dark": "#b0b3b8",
      "--up-info-disabled": "#5f6368",
      "--up-info-light": "#2f3238"
    }
  };
  const THEME_COLOR_SYNC_MAP = {
    "--up-main-color": "mainColor",
    "--up-content-color": "contentColor",
    "--up-tips-color": "tipsColor",
    "--up-light-color": "lightColor",
    "--up-border-color": "borderColor",
    "--up-bg-color": "bgColor",
    "--up-disabled-color": "disabledColor",
    "--up-primary": "primary",
    "--up-primary-dark": "primaryDark",
    "--up-primary-disabled": "primaryDisabled",
    "--up-primary-light": "primaryLight",
    "--up-warning": "warning",
    "--up-warning-dark": "warningDark",
    "--up-warning-disabled": "warningDisabled",
    "--up-warning-light": "warningLight",
    "--up-success": "success",
    "--up-success-dark": "successDark",
    "--up-success-disabled": "successDisabled",
    "--up-success-light": "successLight",
    "--up-error": "error",
    "--up-error-dark": "errorDark",
    "--up-error-disabled": "errorDisabled",
    "--up-error-light": "errorLight",
    "--up-info": "info",
    "--up-info-dark": "infoDark",
    "--up-info-disabled": "infoDisabled",
    "--up-info-light": "infoLight"
  };
  function buildFallbackAliasVars(vars) {
    const aliasVars = {};
    Object.keys(vars).forEach((key) => {
      if (typeof key === "string" && key.indexOf("--up-") === 0) {
        aliasVars[key.replace("--up-", "--u-")] = vars[key];
      }
    });
    return aliasVars;
  }
  function getRuntimeU(upU) {
    if (upU)
      return upU;
    if (typeof uni !== "undefined")
      return uni.$u;
    return null;
  }
  function normalizeRuntimeRoute(route2) {
    if (typeof route2 !== "string")
      return "";
    return route2.replace(/^\//, "").split("?")[0];
  }
  function getCurrentRuntimeRoute() {
    try {
      if (typeof getCurrentPages !== "function")
        return "";
      const pages2 = getCurrentPages();
      if (!Array.isArray(pages2) || pages2.length === 0)
        return "";
      const page2 = pages2[pages2.length - 1] || {};
      return normalizeRuntimeRoute(page2.route || page2.path || "");
    } catch (e) {
    }
    return "";
  }
  function getRuntimeTabBarRoutes() {
    var _a;
    const routes = [];
    try {
      const runtimeConfig = typeof __uniConfig !== "undefined" ? __uniConfig : null;
      const tabBarList = (_a = runtimeConfig == null ? void 0 : runtimeConfig.tabBar) == null ? void 0 : _a.list;
      if (Array.isArray(tabBarList)) {
        tabBarList.forEach((item) => {
          const route2 = normalizeRuntimeRoute((item == null ? void 0 : item.pagePath) || "");
          if (route2)
            routes.push(route2);
        });
      }
    } catch (e) {
    }
    return routes;
  }
  function hasActiveRuntimePage$1() {
    try {
      if (typeof getCurrentPages === "function") {
        const pages2 = getCurrentPages();
        return Array.isArray(pages2) && pages2.length > 0;
      }
    } catch (e) {
    }
    return false;
  }
  function trySetNavigationBarColor$1(options) {
    if (typeof uni === "undefined" || typeof uni.setNavigationBarColor !== "function")
      return;
    if (!hasActiveRuntimePage$1())
      return;
    try {
      const result = uni.setNavigationBarColor(options);
      if (result && typeof result.catch === "function") {
        result.catch(() => {
        });
      }
    } catch (e) {
    }
  }
  function isTabBarPage() {
    const route2 = getCurrentRuntimeRoute();
    if (!route2)
      return false;
    const tabBarRoutes = getRuntimeTabBarRoutes();
    if (!tabBarRoutes.length)
      return false;
    return tabBarRoutes.includes(route2);
  }
  function trySetTabBarStyle(options) {
    if (typeof uni === "undefined" || typeof uni.setTabBarStyle !== "function")
      return;
    if (!isTabBarPage())
      return;
    try {
      const result = uni.setTabBarStyle(options);
      if (result && typeof result.catch === "function") {
        result.catch(() => {
        });
      }
    } catch (e) {
    }
  }
  function normalizeThemeMode$1(theme = "light") {
    return theme === "dark" ? "dark" : "light";
  }
  function normalizeThemePreference$1(mode = "system") {
    return mode === "dark" || mode === "light" ? mode : "system";
  }
  function getFallbackSystemTheme() {
    let theme = "light";
    try {
      if (typeof uni !== "undefined" && typeof uni.getAppBaseInfo === "function") {
        const appBaseInfo = uni.getAppBaseInfo() || {};
        if (appBaseInfo.theme)
          theme = appBaseInfo.theme;
      }
      if (typeof uni !== "undefined" && typeof uni.getSystemInfoSync === "function") {
        const systemInfo = uni.getSystemInfoSync() || {};
        if (systemInfo.theme)
          theme = systemInfo.theme;
      }
    } catch (e) {
      theme = "light";
    }
    return normalizeThemeMode$1(theme);
  }
  function getFallbackThemePreference() {
    try {
      if (typeof uni !== "undefined" && typeof uni.getStorageSync === "function") {
        const preference = uni.getStorageSync(THEME_MODE_STORAGE_KEY$1);
        return normalizeThemePreference$1(preference);
      }
    } catch (e) {
    }
    return "system";
  }
  function getFallbackThemeMode() {
    const preference = getFallbackThemePreference();
    if (preference === "dark" || preference === "light")
      return preference;
    return getFallbackSystemTheme();
  }
  function getFallbackThemeVarsByMode(mode) {
    const vars = FALLBACK_THEME_VARS[normalizeThemeMode$1(mode)] || FALLBACK_THEME_VARS.light;
    return {
      ...vars,
      ...buildFallbackAliasVars(vars)
    };
  }
  function getFallbackThemeVars(upU) {
    const mode = getThemeIsDark(upU) ? "dark" : "light";
    return getFallbackThemeVarsByMode(mode);
  }
  function syncRuntimeColor(runtimeU, vars) {
    if (!runtimeU || !runtimeU.color)
      return;
    Object.keys(THEME_COLOR_SYNC_MAP).forEach((token) => {
      const field = THEME_COLOR_SYNC_MAP[token];
      runtimeU.color[field] = vars[token];
    });
  }
  function syncThemeRuntimeFromStorage(upU) {
    const runtimeU = getRuntimeU(upU);
    if (!runtimeU || !runtimeU.theme)
      return runtimeU == null ? void 0 : runtimeU.theme;
    const preference = getFallbackThemePreference();
    const mode = preference === "system" ? getFallbackSystemTheme() : preference;
    const vars = getFallbackThemeVarsByMode(mode);
    const shouldUpdate = runtimeU.theme.preference !== preference || runtimeU.theme.mode !== mode;
    if (shouldUpdate && typeof runtimeU.setThemePreference === "function") {
      return runtimeU.setThemePreference(preference) || runtimeU.theme;
    }
    runtimeU.theme.preference = preference;
    runtimeU.theme.mode = mode;
    runtimeU.theme.vars = {
      ...vars,
      ...runtimeU.theme.vars && !shouldUpdate ? runtimeU.theme.vars : {}
    };
    if (shouldUpdate) {
      runtimeU.theme.version = Number(runtimeU.theme.version || 0) + 1;
    }
    syncRuntimeColor(runtimeU, runtimeU.theme.vars);
    return runtimeU.theme;
  }
  function getThemeIsDark(upU) {
    var _a, _b;
    const runtimeMode = (_b = (_a = getRuntimeU(upU)) == null ? void 0 : _a.theme) == null ? void 0 : _b.mode;
    if (runtimeMode)
      return runtimeMode === "dark";
    return getFallbackThemeMode() === "dark";
  }
  function getThemeVarsForStyle(upU) {
    const runtimeU = getRuntimeU(upU);
    if (runtimeU && typeof runtimeU.getThemeVars === "function") {
      return runtimeU.getThemeVars();
    }
    return getFallbackThemeVars(runtimeU);
  }
  function getThemeVar(varName, fallbackColor, upU) {
    var _a, _b;
    const runtimeU = getRuntimeU(upU);
    const themeVars = (_a = runtimeU == null ? void 0 : runtimeU.theme) == null ? void 0 : _a.vars;
    if (themeVars && Object.prototype.hasOwnProperty.call(themeVars, varName)) {
      return themeVars[varName];
    }
    if (typeof varName === "string") {
      const aliasVarName = varName.indexOf("--up-") === 0 ? varName.replace("--up-", "--u-") : varName.indexOf("--u-") === 0 ? varName.replace("--u-", "--up-") : "";
      if (aliasVarName && themeVars && Object.prototype.hasOwnProperty.call(themeVars, aliasVarName)) {
        return themeVars[aliasVarName];
      }
      const runtimeColorMap = ((_b = runtimeU == null ? void 0 : runtimeU.config) == null ? void 0 : _b.color) || {};
      const colorTokenKey = varName.indexOf("--") === 0 ? varName.slice(2) : varName;
      if (Object.prototype.hasOwnProperty.call(runtimeColorMap, colorTokenKey)) {
        return runtimeColorMap[colorTokenKey];
      }
      const aliasColorTokenKey = colorTokenKey.indexOf("up-") === 0 ? colorTokenKey.replace("up-", "u-") : colorTokenKey.indexOf("u-") === 0 ? colorTokenKey.replace("u-", "up-") : "";
      if (aliasColorTokenKey && Object.prototype.hasOwnProperty.call(runtimeColorMap, aliasColorTokenKey)) {
        return runtimeColorMap[aliasColorTokenKey];
      }
    }
    if (runtimeU && typeof runtimeU.getThemeVars === "function") {
      const vars = runtimeU.getThemeVars();
      if (vars && Object.prototype.hasOwnProperty.call(vars, varName)) {
        return vars[varName];
      }
    }
    const fallbackVars = getFallbackThemeVars(runtimeU);
    if (fallbackVars && Object.prototype.hasOwnProperty.call(fallbackVars, varName)) {
      return fallbackVars[varName];
    }
    return typeof fallbackColor !== "undefined" ? fallbackColor : "";
  }
  function getThemePageStyle(upU, preferCssVars = false) {
    var _a;
    const runtimeU = getRuntimeU(upU);
    const isDark = getThemeIsDark(runtimeU);
    const fallbackBg = isDark ? "#1f1f1f" : ((_a = runtimeU == null ? void 0 : runtimeU.color) == null ? void 0 : _a.bgColor) || "#f3f4f6";
    if (preferCssVars) {
      return {
        ...getThemeVarsForStyle(runtimeU),
        minHeight: "100vh",
        backgroundColor: `var(--up-page-bg-color, var(--up-bg-color, ${fallbackBg}))`
      };
    }
    return {
      backgroundColor: getThemeVar(
        "--up-page-bg-color",
        getThemeVar("--up-bg-color", fallbackBg, runtimeU),
        runtimeU
      )
    };
  }
  function getThemeCardStyle(upU, preferCssVars = false) {
    var _a;
    const runtimeU = getRuntimeU(upU);
    const isDark = getThemeIsDark(runtimeU);
    const fallbackCard = isDark ? "#1c1c1e" : "#ffffff";
    const fallbackBorder = ((_a = runtimeU == null ? void 0 : runtimeU.color) == null ? void 0 : _a.borderColor) || "#dadbde";
    if (preferCssVars) {
      return {
        backgroundColor: `var(--up-card-bg-color, ${fallbackCard})`,
        borderColor: `var(--up-border-color, ${fallbackBorder})`
      };
    }
    return {
      backgroundColor: getThemeVar("--up-card-bg-color", fallbackCard, runtimeU),
      borderColor: getThemeVar("--up-border-color", fallbackBorder, runtimeU)
    };
  }
  function getThemeTabBarStyle(upU) {
    const runtimeU = getRuntimeU(upU);
    const isDark = getThemeIsDark(runtimeU);
    return {
      color: isDark ? "#8e8e93" : "#909399",
      selectedColor: isDark ? "#f2f2f7" : "#303133",
      backgroundColor: isDark ? "#111111" : "#ffffff",
      borderStyle: isDark ? "white" : "black"
    };
  }
  function applyNativeThemeUI$1(upU) {
    var _a, _b;
    if (typeof uni === "undefined")
      return;
    const runtimeU = getRuntimeU(upU);
    if (((_a = runtimeU == null ? void 0 : runtimeU.config) == null ? void 0 : _a.nativeThemeSync) !== true)
      return;
    const isDark = getThemeIsDark(runtimeU);
    const fallbackBg = isDark ? "#1f1f1f" : ((_b = runtimeU == null ? void 0 : runtimeU.color) == null ? void 0 : _b.bgColor) || "#f3f4f6";
    const pageBg = getThemeVar(
      "--up-page-bg-color",
      getThemeVar("--up-bg-color", fallbackBg, runtimeU),
      runtimeU
    );
    const navBg = getThemeVar(
      "--up-navbar-bg-color",
      isDark ? "#1c1c1e" : "#ffffff",
      runtimeU
    );
    trySetNavigationBarColor$1({
      frontColor: isDark ? "#ffffff" : "#000000",
      backgroundColor: navBg,
      animation: {
        duration: 0,
        timingFunc: "linear"
      }
    });
    if (typeof uni.setBackgroundColor === "function") {
      uni.setBackgroundColor({
        backgroundColor: pageBg,
        backgroundColorTop: pageBg,
        backgroundColorBottom: pageBg
      });
    }
    trySetTabBarStyle(getThemeTabBarStyle(runtimeU));
  }
  function applyNativeThemeUIDeferred(upU, delay = 30) {
    applyNativeThemeUI$1(upU);
    if (typeof setTimeout === "function") {
      setTimeout(() => {
        applyNativeThemeUI$1(upU);
      }, delay);
    }
  }
  const mixin = defineMixin({
    // 定义每个组件都可能需要用到的外部样式以及类名
    props: {
      // 每个组件都有的父组件传递的样式，可以为字符串或者对象形式
      customStyle: {
        type: [Object, String],
        default: () => ({})
      },
      customClass: {
        type: String,
        default: ""
      },
      // 跳转的页面路径
      url: {
        type: String,
        default: ""
      },
      // 页面跳转的类型
      linkType: {
        type: String,
        default: "navigateTo"
      }
    },
    data() {
      return {
        __upPageThemeChangeHandler: null,
        upThemeVersion: 0
      };
    },
    onLoad() {
      this.upBindGetRect();
      this.upInitThemeVersion();
      if (this.upIsPageScope()) {
        this.upApplyNativeThemeUI();
        if (typeof uni !== "undefined" && typeof uni.$on === "function" && !this.__upPageThemeChangeHandler) {
          this.__upPageThemeChangeHandler = () => {
            this.upApplyNativeThemeUI();
          };
          uni.$on("uThemeChange", this.__upPageThemeChangeHandler);
        }
      }
    },
    onShow() {
      if (this.upIsPageScope()) {
        this.upApplyNativeThemeUI();
      }
    },
    created() {
      this.upBindGetRect();
      this.upInitThemeVersion();
      if (typeof uni !== "undefined" && typeof uni.$on === "function") {
        this.__uThemeChangeHandler = (payload = {}) => {
          this.upSyncThemeVersion(payload);
          this.upClearUCache();
          if (typeof this.$forceUpdate === "function") {
            this.$forceUpdate();
          }
        };
        uni.$on("uThemeChange", this.__uThemeChangeHandler);
      }
    },
    computed: {
      // 在2.x版本中，将会把$u挂载到uni对象下，导致在模板中无法使用uni.$u.xxx形式
      // 所以这里通过computed计算属性将其附加到this.$u上，就可以在模板或者js中使用uni.$u.xxx
      // 只在nvue环境通过此方式引入完整的$u，其他平台会出现性能问题，非nvue则按需引入（主要原因是props过大）
      $u() {
        this.upThemeVersion;
        const instance = this.$;
        if (instance == null ? void 0 : instance.__upUCache) {
          return instance.__upUCache;
        }
        let mergeU = deepMerge(uni.$u, {
          props: void 0,
          http: void 0,
          mixin: void 0
        });
        if (instance) {
          instance.__upUCache = mergeU;
          return instance.__upUCache;
        }
        return mergeU;
      },
      upThemeIsDark() {
        this.upThemeVersion;
        return getThemeIsDark(this.$u);
      },
      upThemeVars() {
        this.upThemeVersion;
        return getThemeVarsForStyle(this.$u);
      },
      upThemePageStyle() {
        this.upThemeVersion;
        return getThemePageStyle(this.$u);
      },
      upThemeCardStyle() {
        this.upThemeVersion;
        return getThemeCardStyle(this.$u);
      },
      /**
       * 生成bem规则类名
       * 由于微信小程序，H5，nvue之间绑定class的差异，无法通过:class="[bem()]"的形式进行同用
       * 故采用如下折中做法，最后返回的是数组（一般平台）或字符串（支付宝和字节跳动平台），类似['a', 'b', 'c']或'a b c'的形式
       * @param {String} name 组件名称
       * @param {Array} fixed 一直会存在的类名
       * @param {Array} change 会根据变量值为true或者false而出现或者隐藏的类名
       * @returns {Array|string}
       */
      bem() {
        return function(name, fixed, change) {
          const prefix = `u-${name}--`;
          const classes = {};
          if (fixed) {
            fixed.map((item) => {
              classes[prefix + this[item]] = true;
            });
          }
          if (change) {
            change.map((item) => {
              this[item] ? classes[prefix + item] = this[item] : delete classes[prefix + item];
            });
          }
          return Object.keys(classes);
        };
      }
    },
    methods: {
      upClearUCache() {
        if (this.$) {
          this.$.__upUCache = null;
        }
      },
      upBindGetRect() {
        const upU = this.$u || (typeof uni !== "undefined" ? uni.$u : null);
        if (upU) {
          upU.getRect = this.$uGetRect;
        } else if (typeof uni !== "undefined") {
          uni.$u = {
            getRect: this.$uGetRect
          };
        }
      },
      upReadThemeVersion() {
        return Number(typeof uni !== "undefined" && uni.$u && uni.$u.theme && uni.$u.theme.version || 0);
      },
      upInitThemeVersion() {
        const version2 = this.upReadThemeVersion();
        if (version2) {
          this.upThemeVersion = version2;
        }
      },
      upSyncThemeVersion(payload = {}) {
        const version2 = Number(payload.version || this.upReadThemeVersion() || 0);
        this.upThemeVersion = version2 || Number(this.upThemeVersion || 0) + 1;
      },
      upIsPageScope() {
        var _a;
        return !!(this.$page || this.route || ((_a = this.$options) == null ? void 0 : _a.mpType) === "page");
      },
      upHasProp(propName) {
        var _a, _b;
        const vnodeProps = ((_b = (_a = this.$) == null ? void 0 : _a.vnode) == null ? void 0 : _b.props) || {};
        const kebabName = propName.replace(/[A-Z]/g, (s) => `-${s.toLowerCase()}`);
        return Object.prototype.hasOwnProperty.call(vnodeProps, propName) || Object.prototype.hasOwnProperty.call(vnodeProps, kebabName);
      },
      upThemeVar(varName, fallbackColor) {
        this.upThemeVersion;
        return getThemeVar(varName, fallbackColor, this.$u);
      },
      upApplyNativeThemeUI() {
        syncThemeRuntimeFromStorage(this.$u);
        this.upSyncThemeVersion();
        applyNativeThemeUIDeferred(this.$u);
      },
      // 跳转某一个页面
      openPage(urlKey = "url") {
        const url2 = this[urlKey];
        if (url2) {
          route({ type: this.linkType, url: url2 });
        }
      },
      navTo(url2 = "", linkType = "navigateTo") {
        route({ type: this.linkType, url: url2 });
      },
      // 查询节点信息
      // 目前此方法在支付宝小程序中无法获取组件跟接点的尺寸，为支付宝的bug(2020-07-21)
      // 解决办法为在组件根部再套一个没有任何作用的view元素
      $uGetRect(selector, all) {
        return new Promise((resolve) => {
          uni.createSelectorQuery().in(this)[all ? "selectAll" : "select"](selector).boundingClientRect((rect) => {
            if (all && Array.isArray(rect) && rect.length) {
              resolve(rect);
            }
            if (!all && rect) {
              resolve(rect);
            }
          }).exec();
        });
      },
      getParentData(parentName = "") {
        if (!this.parent)
          this.parent = {};
        this.parent = $parent.call(this, parentName);
        if (this.parent.children) {
          this.parent.children.indexOf(this) === -1 && this.parent.children.push(this);
        }
        if (this.parent && this.parentData) {
          Object.keys(this.parentData).map((key) => {
            this.parentData[key] = this.parent[key];
          });
        }
      },
      // 阻止事件冒泡
      preventEvent(e) {
        e && typeof e.stopPropagation === "function" && e.stopPropagation();
      },
      // 空操作
      noop(e) {
        this.preventEvent(e);
      }
    },
    onReachBottom() {
      uni.$emit("uOnReachBottom");
    },
    beforeUnmount() {
      if (this.parent && test.array(this.parent.children)) {
        const childrenList = this.parent.children;
        childrenList.map((child, index2) => {
          if (child === this) {
            childrenList.splice(index2, 1);
          }
        });
      }
      if (typeof uni !== "undefined" && typeof uni.$off === "function" && this.__uThemeChangeHandler) {
        uni.$off("uThemeChange", this.__uThemeChangeHandler);
        this.__uThemeChangeHandler = null;
      }
      if (typeof uni !== "undefined" && typeof uni.$off === "function" && this.__upPageThemeChangeHandler) {
        uni.$off("uThemeChange", this.__upPageThemeChangeHandler);
        this.__upPageThemeChangeHandler = null;
      }
    }
  });
  const getClassNames = (name) => ({
    enter: `u-${name}-enter u-${name}-enter-active`,
    "enter-to": `u-${name}-enter-to u-${name}-enter-active`,
    leave: `u-${name}-leave u-${name}-leave-active`,
    "leave-to": `u-${name}-leave-to u-${name}-leave-active`
  });
  const transitionMixin = {
    methods: {
      // 组件被点击发出事件
      clickHandler() {
        this.$emit("click");
      },
      // vue版本的组件进场处理
      async vueEnter() {
        const classNames = getClassNames(this.mode);
        this.status = "enter";
        this.$emit("beforeEnter");
        this.inited = true;
        this.display = true;
        this.classes = classNames.enter;
        await vue.nextTick();
        {
          await sleep(20);
          this.$emit("enter");
          this.transitionEnded = false;
          this.$emit("afterEnter");
          this.classes = classNames["enter-to"];
        }
      },
      // 动画离场处理
      async vueLeave() {
        if (!this.display)
          return;
        const classNames = getClassNames(this.mode);
        this.status = "leave";
        this.$emit("beforeLeave");
        this.classes = classNames.leave;
        await vue.nextTick();
        {
          this.transitionEnded = false;
          this.$emit("leave");
          setTimeout(this.onTransitionEnd, this.duration);
          this.classes = classNames["leave-to"];
        }
      },
      // 完成过渡后触发
      onTransitionEnd() {
        if (this.transitionEnded)
          return;
        this.transitionEnded = true;
        this.$emit(this.status === "leave" ? "afterLeave" : "afterEnter");
        if (!this.show && this.display) {
          this.display = false;
          this.inited = false;
        }
      }
    }
  };
  const _sfc_main$G = {
    name: "u-transition",
    data() {
      return {
        inited: false,
        // 是否显示/隐藏组件
        viewStyle: {},
        // 组件内部的样式
        status: "",
        // 记录组件动画的状态
        transitionEnded: false,
        // 组件是否结束的标记
        display: false,
        // 组件是否展示
        classes: ""
        // 应用的类名
      };
    },
    emits: ["click", "beforeEnter", "enter", "afterEnter", "beforeLeave", "leave", "afterLeave"],
    computed: {
      mergeStyle() {
        const { viewStyle, customStyle } = this;
        return {
          transitionDuration: `${this.duration}ms`,
          // display: `${this.display ? '' : 'none'}`,
          transitionTimingFunction: this.timingFunction,
          // 避免自定义样式影响到动画属性，所以写在viewStyle前面
          ...addStyle(customStyle),
          ...viewStyle
        };
      }
    },
    // 将mixin挂在到组件中，实际上为一个vue格式对象。
    mixins: [mpMixin, mixin, transitionMixin, props$a],
    watch: {
      show: {
        handler(newVal) {
          newVal ? this.vueEnter() : this.vueLeave();
        },
        // 表示同时监听初始化时的props的show的意思
        immediate: true
      }
    }
  };
  function _sfc_render$F(_ctx, _cache, $props, $setup, $data, $options) {
    return $data.inited ? (vue.openBlock(), vue.createElementBlock(
      "view",
      {
        key: 0,
        class: vue.normalizeClass(["u-transition", $data.classes]),
        ref: "u-transition",
        onClick: _cache[0] || (_cache[0] = (...args) => _ctx.clickHandler && _ctx.clickHandler(...args)),
        style: vue.normalizeStyle([$options.mergeStyle]),
        onTouchmove: _cache[1] || (_cache[1] = (...args) => _ctx.noop && _ctx.noop(...args))
      },
      [
        vue.renderSlot(_ctx.$slots, "default", {}, void 0, true)
      ],
      38
      /* CLASS, STYLE, NEED_HYDRATION */
    )) : vue.createCommentVNode("v-if", true);
  }
  const __easycom_4 = /* @__PURE__ */ _export_sfc(_sfc_main$G, [["render", _sfc_render$F], ["__scopeId", "data-v-0573594d"], ["__file", "F:/项目文件/uniapp版本/node_modules/uview-plus/components/u-transition/u-transition.vue"]]);
  const OverlayDefaultProps = {
    // overlay组件
    overlay: {
      show: false,
      zIndex: 10070,
      duration: 300,
      opacity: 0.5
    }
  };
  const defProps$8 = registerComponentProps(OverlayDefaultProps);
  const props$9 = defineMixin({
    props: {
      // 是否显示遮罩
      show: {
        type: Boolean,
        default: () => defProps$8.overlay.show
      },
      // 层级z-index
      zIndex: {
        type: [String, Number],
        default: () => defProps$8.overlay.zIndex
      },
      // 遮罩的过渡时间，单位为ms
      duration: {
        type: [String, Number],
        default: () => defProps$8.overlay.duration
      },
      // 不透明度值，当做rgba的第四个参数
      opacity: {
        type: [String, Number],
        default: () => defProps$8.overlay.opacity
      }
    }
  });
  const _sfc_main$F = {
    name: "u-overlay",
    mixins: [mpMixin, mixin, props$9],
    computed: {
      overlayStyle() {
        const style = {
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: this.zIndex,
          bottom: 0,
          "background-color": `rgba(0, 0, 0, ${this.opacity})`
        };
        return deepMerge(style, addStyle(this.customStyle));
      }
    },
    emits: ["click"],
    methods: {
      clickHandler() {
        this.$emit("click");
      }
    }
  };
  function _sfc_render$E(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_u_transition = resolveEasycom(vue.resolveDynamicComponent("u-transition"), __easycom_4);
    return vue.openBlock(), vue.createBlock(_component_u_transition, {
      show: _ctx.show,
      "custom-class": "u-overlay",
      duration: _ctx.duration,
      "custom-style": $options.overlayStyle,
      onClick: $options.clickHandler,
      onTouchmove: vue.withModifiers(_ctx.noop, ["stop", "prevent"])
    }, {
      default: vue.withCtx(() => [
        vue.renderSlot(_ctx.$slots, "default", {}, void 0, true)
      ]),
      _: 3
      /* FORWARDED */
    }, 8, ["show", "duration", "custom-style", "onClick", "onTouchmove"]);
  }
  const __easycom_0$4 = /* @__PURE__ */ _export_sfc(_sfc_main$F, [["render", _sfc_render$E], ["__scopeId", "data-v-35f7c3e5"], ["__file", "F:/项目文件/uniapp版本/node_modules/uview-plus/components/u-overlay/u-overlay.vue"]]);
  const StatusBarDefaultProps = {
    // statusBar
    statusBar: {
      bgColor: "transparent",
      height: 0
    }
  };
  const defProps$7 = registerComponentProps(StatusBarDefaultProps);
  const props$8 = defineMixin({
    props: {
      bgColor: {
        type: String,
        default: () => defProps$7.statusBar.bgColor
      },
      // 状态栏获取得高度
      height: {
        type: Number,
        default: () => defProps$7.statusBar.height
      }
    }
  });
  const _sfc_main$E = {
    name: "u-status-bar",
    mixins: [mpMixin, mixin, props$8],
    data() {
      return {
        isH5: false
      };
    },
    created() {
    },
    emits: ["update:height"],
    computed: {
      style() {
        const style = {};
        let sheight = getWindowInfo().statusBarHeight;
        this.$emit("update:height", sheight);
        if (sheight == 0) {
          this.isH5 = true;
        } else {
          style.height = addUnit(sheight, "px");
        }
        style.backgroundColor = this.bgColor;
        return deepMerge(style, addStyle(this.customStyle));
      }
    }
  };
  function _sfc_render$D(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock(
      "view",
      {
        style: vue.normalizeStyle([$options.style]),
        class: vue.normalizeClass(["u-status-bar", [$data.isH5 && "u-safe-area-inset-top"]])
      },
      [
        vue.renderSlot(_ctx.$slots, "default", {}, void 0, true)
      ],
      6
      /* CLASS, STYLE */
    );
  }
  const __easycom_1$3 = /* @__PURE__ */ _export_sfc(_sfc_main$E, [["render", _sfc_render$D], ["__scopeId", "data-v-c0b45a48"], ["__file", "F:/项目文件/uniapp版本/node_modules/uview-plus/components/u-status-bar/u-status-bar.vue"]]);
  const icons = {
    "uicon-level": "",
    "uicon-column-line": "",
    "uicon-checkbox-mark": "",
    "uicon-folder": "",
    "uicon-movie": "",
    "uicon-star-fill": "",
    "uicon-star": "",
    "uicon-phone-fill": "",
    "uicon-phone": "",
    "uicon-apple-fill": "",
    "uicon-chrome-circle-fill": "",
    "uicon-backspace": "",
    "uicon-attach": "",
    "uicon-cut": "",
    "uicon-empty-car": "",
    "uicon-empty-coupon": "",
    "uicon-empty-address": "",
    "uicon-empty-favor": "",
    "uicon-empty-permission": "",
    "uicon-empty-news": "",
    "uicon-empty-search": "",
    "uicon-github-circle-fill": "",
    "uicon-rmb": "",
    "uicon-person-delete-fill": "",
    "uicon-reload": "",
    "uicon-order": "",
    "uicon-server-man": "",
    "uicon-search": "",
    "uicon-fingerprint": "",
    "uicon-more-dot-fill": "",
    "uicon-scan": "",
    "uicon-share-square": "",
    "uicon-map": "",
    "uicon-map-fill": "",
    "uicon-tags": "",
    "uicon-tags-fill": "",
    "uicon-bookmark-fill": "",
    "uicon-bookmark": "",
    "uicon-eye": "",
    "uicon-eye-fill": "",
    "uicon-mic": "",
    "uicon-mic-off": "",
    "uicon-calendar": "",
    "uicon-calendar-fill": "",
    "uicon-trash": "",
    "uicon-trash-fill": "",
    "uicon-play-left": "",
    "uicon-play-right": "",
    "uicon-minus": "",
    "uicon-plus": "",
    "uicon-info": "",
    "uicon-info-circle": "",
    "uicon-info-circle-fill": "",
    "uicon-question": "",
    "uicon-error": "",
    "uicon-close": "",
    "uicon-checkmark": "",
    "uicon-android-circle-fill": "",
    "uicon-android-fill": "",
    "uicon-ie": "",
    "uicon-IE-circle-fill": "",
    "uicon-google": "",
    "uicon-google-circle-fill": "",
    "uicon-setting-fill": "",
    "uicon-setting": "",
    "uicon-minus-square-fill": "",
    "uicon-plus-square-fill": "",
    "uicon-heart": "",
    "uicon-heart-fill": "",
    "uicon-camera": "",
    "uicon-camera-fill": "",
    "uicon-more-circle": "",
    "uicon-more-circle-fill": "",
    "uicon-chat": "",
    "uicon-chat-fill": "",
    "uicon-bag-fill": "",
    "uicon-bag": "",
    "uicon-error-circle-fill": "",
    "uicon-error-circle": "",
    "uicon-close-circle": "",
    "uicon-close-circle-fill": "",
    "uicon-checkmark-circle": "",
    "uicon-checkmark-circle-fill": "",
    "uicon-question-circle-fill": "",
    "uicon-question-circle": "",
    "uicon-share": "",
    "uicon-share-fill": "",
    "uicon-shopping-cart": "",
    "uicon-shopping-cart-fill": "",
    "uicon-bell": "",
    "uicon-bell-fill": "",
    "uicon-list": "",
    "uicon-list-dot": "",
    "uicon-zhihu": "",
    "uicon-zhihu-circle-fill": "",
    "uicon-zhifubao": "",
    "uicon-zhifubao-circle-fill": "",
    "uicon-weixin-circle-fill": "",
    "uicon-weixin-fill": "",
    "uicon-twitter-circle-fill": "",
    "uicon-twitter": "",
    "uicon-taobao-circle-fill": "",
    "uicon-taobao": "",
    "uicon-weibo-circle-fill": "",
    "uicon-weibo": "",
    "uicon-qq-fill": "",
    "uicon-qq-circle-fill": "",
    "uicon-moments-circel-fill": "",
    "uicon-moments": "",
    "uicon-qzone": "",
    "uicon-qzone-circle-fill": "",
    "uicon-baidu-circle-fill": "",
    "uicon-baidu": "",
    "uicon-facebook-circle-fill": "",
    "uicon-facebook": "",
    "uicon-car": "",
    "uicon-car-fill": "",
    "uicon-warning-fill": "",
    "uicon-warning": "",
    "uicon-clock-fill": "",
    "uicon-clock": "",
    "uicon-edit-pen": "",
    "uicon-edit-pen-fill": "",
    "uicon-email": "",
    "uicon-email-fill": "",
    "uicon-minus-circle": "",
    "uicon-minus-circle-fill": "",
    "uicon-plus-circle": "",
    "uicon-plus-circle-fill": "",
    "uicon-file-text": "",
    "uicon-file-text-fill": "",
    "uicon-pushpin": "",
    "uicon-pushpin-fill": "",
    "uicon-grid": "",
    "uicon-grid-fill": "",
    "uicon-play-circle": "",
    "uicon-play-circle-fill": "",
    "uicon-pause-circle-fill": "",
    "uicon-pause": "",
    "uicon-pause-circle": "",
    "uicon-eye-off": "",
    "uicon-eye-off-outline": "",
    "uicon-gift-fill": "",
    "uicon-gift": "",
    "uicon-rmb-circle-fill": "",
    "uicon-rmb-circle": "",
    "uicon-kefu-ermai": "",
    "uicon-server-fill": "",
    "uicon-coupon-fill": "",
    "uicon-coupon": "",
    "uicon-integral": "",
    "uicon-integral-fill": "",
    "uicon-home-fill": "",
    "uicon-home": "",
    "uicon-hourglass-half-fill": "",
    "uicon-hourglass": "",
    "uicon-account": "",
    "uicon-plus-people-fill": "",
    "uicon-minus-people-fill": "",
    "uicon-account-fill": "",
    "uicon-thumb-down-fill": "",
    "uicon-thumb-down": "",
    "uicon-thumb-up": "",
    "uicon-thumb-up-fill": "",
    "uicon-lock-fill": "",
    "uicon-lock-open": "",
    "uicon-lock-opened-fill": "",
    "uicon-lock": "",
    "uicon-red-packet-fill": "",
    "uicon-photo-fill": "",
    "uicon-photo": "",
    "uicon-volume-off-fill": "",
    "uicon-volume-off": "",
    "uicon-volume-fill": "",
    "uicon-volume": "",
    "uicon-red-packet": "",
    "uicon-download": "",
    "uicon-arrow-up-fill": "",
    "uicon-arrow-down-fill": "",
    "uicon-play-left-fill": "",
    "uicon-play-right-fill": "",
    "uicon-rewind-left-fill": "",
    "uicon-rewind-right-fill": "",
    "uicon-arrow-downward": "",
    "uicon-arrow-leftward": "",
    "uicon-arrow-rightward": "",
    "uicon-arrow-upward": "",
    "uicon-arrow-down": "",
    "uicon-arrow-right": "",
    "uicon-arrow-left": "",
    "uicon-arrow-up": "",
    "uicon-skip-back-left": "",
    "uicon-skip-forward-right": "",
    "uicon-rewind-right": "",
    "uicon-rewind-left": "",
    "uicon-arrow-right-double": "",
    "uicon-arrow-left-double": "",
    "uicon-wifi-off": "",
    "uicon-wifi": "",
    "uicon-empty-data": "",
    "uicon-empty-history": "",
    "uicon-empty-list": "",
    "uicon-empty-page": "",
    "uicon-empty-order": "",
    "uicon-empty-wifi": "",
    "uicon-man": "",
    "uicon-woman": "",
    "uicon-man-add": "",
    "uicon-man-add-fill": "",
    "uicon-man-delete": "",
    "uicon-man-delete-fill": "",
    "uicon-zh": "",
    "uicon-en": ""
  };
  const {
    color: color$1
  } = config;
  const IconDefaultProps = {
    // icon组件
    icon: {
      name: "",
      color: color$1["u-content-color"],
      size: "16px",
      bold: false,
      index: "",
      hoverClass: "",
      customPrefix: "uicon",
      label: "",
      labelPos: "right",
      labelSize: "15px",
      labelColor: color$1["u-content-color"],
      space: "3px",
      imgMode: "",
      width: "",
      height: "",
      top: 0,
      stop: false
    }
  };
  const defProps$6 = registerComponentProps(IconDefaultProps);
  const props$7 = defineMixin({
    props: {
      // 图标类名
      name: {
        type: String,
        default: () => defProps$6.icon.name
      },
      // 图标颜色，可接受主题色
      color: {
        type: String,
        default: () => defProps$6.icon.color
      },
      // 字体大小，单位px
      size: {
        type: [String, Number],
        default: () => defProps$6.icon.size
      },
      // 是否显示粗体
      bold: {
        type: Boolean,
        default: () => defProps$6.icon.bold
      },
      // 点击图标的时候传递事件出去的index（用于区分点击了哪一个）
      index: {
        type: [String, Number],
        default: () => defProps$6.icon.index
      },
      // 触摸图标时的类名
      hoverClass: {
        type: String,
        default: () => defProps$6.icon.hoverClass
      },
      // 自定义扩展前缀，方便用户扩展自己的图标库
      customPrefix: {
        type: String,
        default: () => defProps$6.icon.customPrefix
      },
      // 图标右边或者下面的文字
      label: {
        type: [String, Number],
        default: () => defProps$6.icon.label
      },
      // label的位置，只能右边或者下边
      labelPos: {
        type: String,
        default: () => defProps$6.icon.labelPos
      },
      // label的大小
      labelSize: {
        type: [String, Number],
        default: () => defProps$6.icon.labelSize
      },
      // label的颜色
      labelColor: {
        type: String,
        default: () => defProps$6.icon.labelColor
      },
      // label与图标的距离
      space: {
        type: [String, Number],
        default: () => defProps$6.icon.space
      },
      // 图片的mode
      imgMode: {
        type: String,
        default: () => defProps$6.icon.imgMode
      },
      // 用于显示图片小图标时，图片的宽度
      width: {
        type: [String, Number],
        default: () => defProps$6.icon.width
      },
      // 用于显示图片小图标时，图片的高度
      height: {
        type: [String, Number],
        default: () => defProps$6.icon.height
      },
      // 用于解决某些情况下，让图标垂直居中的用途
      top: {
        type: [String, Number],
        default: () => defProps$6.icon.top
      },
      // 是否阻止事件传播
      stop: {
        type: Boolean,
        default: () => defProps$6.icon.stop
      }
    }
  });
  const iconFontUrl = "/assets/upicon.4bc8cc97.ttf";
  const iconFontFamily = "uicon-iconfont";
  let params = {
    loaded: false
  };
  const getIconUrl = () => {
    return iconFontUrl;
  };
  const markFontLoaded = () => {
    params.loaded = true;
    return;
  };
  const loadFont = () => {
    const iconUrl = getIconUrl();
    markFontLoaded();
    uni.loadFontFace({
      global: true,
      // 是否全局生效。微信小程序 '2.10.0'起支持全局生效，需在 app.vue 中调用。
      family: iconFontFamily,
      source: 'url("' + iconUrl + '")',
      success() {
      },
      fail() {
      }
    });
    if (config.customIcon.family) {
      uni.loadFontFace({
        global: true,
        // 是否全局生效。微信小程序 '2.10.0'起支持全局生效，需在 app.vue 中调用。
        family: config.customIcon.family,
        source: 'url("' + config.customIcon.url + '")',
        success() {
        },
        fail() {
        }
      });
    }
    return true;
  };
  const fontUtil = {
    params,
    loadFont
  };
  const _sfc_main$D = {
    name: "u-icon",
    beforeCreate() {
      if (!fontUtil.params.loaded) {
        fontUtil.loadFont();
      }
    },
    data() {
      return {};
    },
    emits: ["click"],
    mixins: [mpMixin, mixin, props$7],
    computed: {
      uClasses() {
        let classes = [];
        classes.push(this.customPrefix + "-" + this.name);
        if (this.customPrefix == "uicon") {
          classes.push("u-iconfont");
        } else {
          classes.push(this.customPrefix);
        }
        if (this.color && config.type.includes(this.color))
          classes.push("u-icon__icon--" + this.color);
        return classes;
      },
      iconStyle() {
        let style = {};
        style = {
          fontSize: addUnit(this.size),
          lineHeight: addUnit(this.size),
          fontWeight: this.bold ? "bold" : "normal",
          // 某些特殊情况需要设置一个到顶部的距离，才能更好的垂直居中
          top: addUnit(this.top)
        };
        if (this.customPrefix !== "uicon") {
          style.fontFamily = this.customPrefix;
        }
        if (this.color && !config.type.includes(this.color))
          style.color = this.color;
        return style;
      },
      // 判断传入的name属性，是否图片路径，只要带有"/"均认为是图片形式
      isImg() {
        return this.name.indexOf("/") !== -1;
      },
      imgStyle() {
        let style = {};
        style.width = this.width ? addUnit(this.width) : addUnit(this.size);
        style.height = this.height ? addUnit(this.height) : addUnit(this.size);
        return style;
      },
      // 通过图标名，查找对应的图标
      icon() {
        if (this.customPrefix !== "uicon") {
          return config.customIcons[this.name] || this.name;
        }
        return icons["uicon-" + this.name] || this.name;
      }
    },
    methods: {
      addStyle,
      addUnit,
      clickHandler(e) {
        this.$emit("click", this.index, e);
        this.stop && this.preventEvent(e);
      }
    }
  };
  function _sfc_render$C(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock(
      "view",
      {
        class: vue.normalizeClass(["u-icon", ["u-icon--" + _ctx.labelPos]]),
        onClick: _cache[0] || (_cache[0] = (...args) => $options.clickHandler && $options.clickHandler(...args))
      },
      [
        $options.isImg ? (vue.openBlock(), vue.createElementBlock("image", {
          key: 0,
          class: "u-icon__img",
          src: _ctx.name,
          mode: _ctx.imgMode,
          style: vue.normalizeStyle([$options.imgStyle, $options.addStyle(_ctx.customStyle)])
        }, null, 12, ["src", "mode"])) : (vue.openBlock(), vue.createElementBlock("text", {
          key: 1,
          class: vue.normalizeClass(["u-icon__icon", $options.uClasses]),
          style: vue.normalizeStyle([$options.iconStyle, $options.addStyle(_ctx.customStyle)]),
          "hover-class": _ctx.hoverClass
        }, vue.toDisplayString($options.icon), 15, ["hover-class"])),
        _ctx.label !== "" ? (vue.openBlock(), vue.createElementBlock(
          "text",
          {
            key: 2,
            class: "u-icon__label",
            style: vue.normalizeStyle({
              color: _ctx.labelColor,
              fontSize: $options.addUnit(_ctx.labelSize),
              marginLeft: _ctx.labelPos == "right" ? $options.addUnit(_ctx.space) : 0,
              marginTop: _ctx.labelPos == "bottom" ? $options.addUnit(_ctx.space) : 0,
              marginRight: _ctx.labelPos == "left" ? $options.addUnit(_ctx.space) : 0,
              marginBottom: _ctx.labelPos == "top" ? $options.addUnit(_ctx.space) : 0
            })
          },
          vue.toDisplayString(_ctx.label),
          5
          /* TEXT, STYLE */
        )) : vue.createCommentVNode("v-if", true)
      ],
      2
      /* CLASS */
    );
  }
  const __easycom_0$3 = /* @__PURE__ */ _export_sfc(_sfc_main$D, [["render", _sfc_render$C], ["__scopeId", "data-v-1c933a9a"], ["__file", "F:/项目文件/uniapp版本/node_modules/uview-plus/components/u-icon/u-icon.vue"]]);
  registerComponentProps({ safeBottom: {} });
  const props$6 = defineMixin({
    props: {}
  });
  const _sfc_main$C = {
    name: "u-safe-bottom",
    mixins: [mpMixin, mixin, props$6],
    data() {
      return {
        safeAreaBottomHeight: 0,
        isNvue: false
      };
    },
    computed: {
      style() {
        const style = {};
        return deepMerge(style, addStyle(this.customStyle));
      }
    },
    mounted() {
    }
  };
  function _sfc_render$B(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock(
      "view",
      {
        class: vue.normalizeClass(["u-safe-bottom", [!$data.isNvue && "u-safe-area-inset-bottom"]]),
        style: vue.normalizeStyle([$options.style])
      },
      null,
      6
      /* CLASS, STYLE */
    );
  }
  const __easycom_3 = /* @__PURE__ */ _export_sfc(_sfc_main$C, [["render", _sfc_render$B], ["__scopeId", "data-v-3ec581de"], ["__file", "F:/项目文件/uniapp版本/node_modules/uview-plus/components/u-safe-bottom/u-safe-bottom.vue"]]);
  const PopupDefaultProps = {
    // popup组件
    popup: {
      show: false,
      overlay: true,
      mode: "bottom",
      duration: 300,
      closeable: false,
      overlayStyle: {},
      closeOnClickOverlay: true,
      zIndex: 10075,
      safeAreaInsetBottom: true,
      safeAreaInsetTop: false,
      closeIconPos: "top-right",
      round: "20px",
      zoom: true,
      bgColor: "",
      overlayOpacity: 0.5,
      pageInline: false,
      touchable: false,
      minHeight: "200px",
      maxHeight: "600px"
    }
  };
  const defProps$5 = registerComponentProps(PopupDefaultProps);
  const props$5 = defineMixin({
    props: {
      // 是否展示弹窗
      show: {
        type: Boolean,
        default: () => defProps$5.popup.show
      },
      // 是否显示遮罩
      overlay: {
        type: Boolean,
        default: () => defProps$5.popup.overlay
      },
      // 弹出的方向，可选值为 top bottom right left center
      mode: {
        type: String,
        default: () => defProps$5.popup.mode
      },
      // 动画时长，单位ms
      duration: {
        type: [String, Number],
        default: () => defProps$5.popup.duration
      },
      // 是否显示关闭图标
      closeable: {
        type: Boolean,
        default: () => defProps$5.popup.closeable
      },
      // 自定义遮罩的样式
      overlayStyle: {
        type: [Object, String],
        default: () => defProps$5.popup.overlayStyle
      },
      // 点击遮罩是否关闭弹窗
      closeOnClickOverlay: {
        type: Boolean,
        default: () => defProps$5.popup.closeOnClickOverlay
      },
      // 层级
      zIndex: {
        type: [String, Number],
        default: () => defProps$5.popup.zIndex
      },
      // 是否为iPhoneX留出底部安全距离
      safeAreaInsetBottom: {
        type: Boolean,
        default: () => defProps$5.popup.safeAreaInsetBottom
      },
      // 是否留出顶部安全距离（状态栏高度）
      safeAreaInsetTop: {
        type: Boolean,
        default: () => defProps$5.popup.safeAreaInsetTop
      },
      // 自定义关闭图标位置，top-left为左上角，top-right为右上角，bottom-left为左下角，bottom-right为右下角
      closeIconPos: {
        type: String,
        default: () => defProps$5.popup.closeIconPos
      },
      // 是否显示圆角
      round: {
        type: [Boolean, String, Number],
        default: () => defProps$5.popup.round
      },
      // mode=center，也即中部弹出时，是否使用缩放模式
      zoom: {
        type: Boolean,
        default: () => defProps$5.popup.zoom
      },
      // 弹窗背景色，设置为transparent可去除白色背景
      bgColor: {
        type: String,
        default: () => defProps$5.popup.bgColor
      },
      // 遮罩的透明度，0-1之间
      overlayOpacity: {
        type: [Number, String],
        default: () => defProps$5.popup.overlayOpacity
      },
      // 是否页面内展示
      pageInline: {
        type: Boolean,
        default: () => defProps$5.popup.pageInline
      },
      // 是否页开启手势滑动
      touchable: {
        type: Boolean,
        default: () => defProps$5.popup.touchable
      },
      // 手势滑动最小高度
      minHeight: {
        type: [String],
        default: () => defProps$5.popup.minHeight
      },
      // 手势滑动最大高度
      maxHeight: {
        type: [String],
        default: () => defProps$5.popup.maxHeight
      }
    }
  });
  const _sfc_main$B = {
    name: "u-popup",
    mixins: [mpMixin, mixin, props$5],
    data() {
      return {
        overlayDuration: this.duration + 50,
        // 触摸相关数据
        touchStartY: 0,
        touchStartHeight: 0,
        isTouching: false,
        // 当前弹窗高度
        currentHeight: "auto"
      };
    },
    watch: {
      show(newValue, oldValue) {
      }
    },
    computed: {
      transitionStyle() {
        const style = {
          display: "flex"
        };
        if (!this.pageInline) {
          style.zIndex = this.zIndex;
          style.position = "fixed";
        }
        style[this.mode] = 0;
        if (this.mode === "left") {
          return deepMerge(style, {
            bottom: 0,
            top: 0
          });
        } else if (this.mode === "right") {
          return deepMerge(style, {
            bottom: 0,
            top: 0
          });
        } else if (this.mode === "top") {
          return deepMerge(style, {
            left: 0,
            right: 0
          });
        } else if (this.mode === "bottom") {
          return deepMerge(style, {
            left: 0,
            right: 0
          });
        } else if (this.mode === "center") {
          return deepMerge(style, {
            alignItems: "center",
            "justify-content": "center",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0
          });
        }
      },
      contentStyleWrap() {
        const style = {};
        if (this.mode === "bottom" && this.touchable) {
          if (this.currentHeight !== "auto") {
            style.height = this.currentHeight;
          }
          if (this.maxHeight) {
            style.maxHeight = addUnit(this.maxHeight);
          }
          if (this.minHeight) {
            style.minHeight = addUnit(this.minHeight);
          }
        }
        return style;
      },
      contentStyle() {
        const style = {};
        getWindowInfo();
        if (this.mode !== "center") {
          style.flex = 1;
        }
        style.backgroundColor = this.bgColor || this.upThemeVar("--up-card-bg-color", this.upThemeIsDark ? "#1c1c1e" : "#ffffff");
        if (this.round) {
          const value = addUnit(this.round);
          if (this.mode === "top") {
            style.borderBottomLeftRadius = value;
            style.borderBottomRightRadius = value;
          } else if (this.mode === "bottom") {
            style.borderTopLeftRadius = value;
            style.borderTopRightRadius = value;
          } else if (this.mode === "center") {
            style.borderRadius = value;
          }
        }
        return deepMerge(style, addStyle(this.customStyle));
      },
      closeIconColor() {
        return this.upThemeVar("--up-content-color", "#606266");
      },
      indicatorStyle() {
        return {
          backgroundColor: this.upThemeVar("--up-light-color", "#c0c4cc")
        };
      },
      position() {
        if (this.mode === "center") {
          return this.zoom ? "fade-zoom" : "fade";
        }
        if (this.mode === "left") {
          return "slide-left";
        }
        if (this.mode === "right") {
          return "slide-right";
        }
        if (this.mode === "bottom") {
          return "slide-up";
        }
        if (this.mode === "top") {
          return "slide-down";
        }
      }
    },
    emits: ["open", "close", "click", "update:show"],
    methods: {
      // 点击遮罩
      overlayClick() {
        if (this.closeOnClickOverlay) {
          this.$emit("update:show", false);
          this.$emit("close");
        }
      },
      open(e) {
        this.$emit("update:show", true);
      },
      close(e) {
        this.$emit("update:show", false);
        this.$emit("close");
      },
      afterEnter() {
        this.$emit("open");
      },
      clickHandler() {
        if (this.mode === "center") {
          this.overlayClick();
        }
        this.$emit("click");
      },
      // 触摸开始
      onTouchStart(e) {
        if (!this.touchable || this.mode !== "bottom")
          return;
        this.isTouching = true;
        this.touchStartY = e.touches[0].clientY;
        this.touchStartHeight = this.$el.querySelector(".u-popup__content—transition").offsetHeight;
      },
      // 触摸移动
      onTouchMove(e) {
        if (!this.isTouching || !this.touchable || this.mode !== "bottom")
          return;
        const touchY = e.touches[0].clientY;
        const deltaY = touchY - this.touchStartY;
        if (deltaY !== 0) {
          const newHeight = this.touchStartHeight - deltaY;
          const minHeight = parseFloat(addUnit(this.minHeight)) || 200;
          const maxHeight = this.maxHeight ? this.maxHeight.toString().includes("%") ? getWindowInfo().windowHeight * (parseFloat(this.maxHeight) / 100) : parseFloat(addUnit(this.maxHeight)) : getWindowInfo().windowHeight * 0.8;
          if (newHeight >= minHeight && newHeight <= maxHeight) {
            this.currentHeight = newHeight + "px";
          }
        }
        e.preventDefault();
      },
      // 触摸结束
      onTouchEnd(e) {
        if (!this.isTouching || !this.touchable || this.mode !== "bottom")
          return;
        this.isTouching = false;
        const touchY = e.changedTouches[0].clientY;
        const deltaY = touchY - this.touchStartY;
        const velocity = Math.abs(deltaY) / (e.timeStamp - e.changedTouches[0].timestamp);
        if (deltaY > 100 || deltaY > 30 && velocity > 0.5) {
          this.close();
        }
      }
    }
  };
  function _sfc_render$A(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_u_overlay = resolveEasycom(vue.resolveDynamicComponent("u-overlay"), __easycom_0$4);
    const _component_u_status_bar = resolveEasycom(vue.resolveDynamicComponent("u-status-bar"), __easycom_1$3);
    const _component_up_icon = resolveEasycom(vue.resolveDynamicComponent("up-icon"), __easycom_0$3);
    const _component_u_safe_bottom = resolveEasycom(vue.resolveDynamicComponent("u-safe-bottom"), __easycom_3);
    const _component_u_transition = resolveEasycom(vue.resolveDynamicComponent("u-transition"), __easycom_4);
    return vue.openBlock(), vue.createElementBlock(
      "view",
      {
        class: vue.normalizeClass(["u-popup", [_ctx.customClass]]),
        style: vue.normalizeStyle({
          width: _ctx.show == false ? "0px" : "",
          height: _ctx.show == false ? "0px" : ""
        })
      },
      [
        vue.createElementVNode("view", { class: "u-popup__trigger" }, [
          vue.renderSlot(_ctx.$slots, "trigger", {}, void 0, true),
          vue.createElementVNode("view", {
            onClick: _cache[0] || (_cache[0] = (...args) => $options.open && $options.open(...args)),
            class: "u-popup__trigger__cover"
          })
        ]),
        _ctx.overlay ? (vue.openBlock(), vue.createBlock(_component_u_overlay, {
          key: 0,
          show: _ctx.show && _ctx.pageInline == false,
          onClick: $options.overlayClick,
          zIndex: _ctx.zIndex,
          duration: $data.overlayDuration,
          customStyle: _ctx.overlayStyle,
          opacity: _ctx.overlayOpacity
        }, null, 8, ["show", "onClick", "zIndex", "duration", "customStyle", "opacity"])) : vue.createCommentVNode("v-if", true),
        vue.createVNode(_component_u_transition, {
          class: "u-popup__content—transition",
          style: vue.normalizeStyle($options.contentStyleWrap),
          show: _ctx.pageInline ? true : _ctx.show,
          customStyle: $options.transitionStyle,
          mode: _ctx.pageInline ? "none" : $options.position,
          duration: _ctx.duration,
          onAfterEnter: $options.afterEnter,
          onClick: $options.clickHandler
        }, {
          default: vue.withCtx(() => [
            vue.createElementVNode(
              "view",
              {
                class: "u-popup__content",
                style: vue.normalizeStyle([$options.contentStyle]),
                onClick: _cache[6] || (_cache[6] = vue.withModifiers((...args) => _ctx.noop && _ctx.noop(...args), ["stop"])),
                onTouchmove: _cache[7] || (_cache[7] = vue.withModifiers((...args) => _ctx.noop && _ctx.noop(...args), ["stop", "prevent"]))
              },
              [
                _ctx.safeAreaInsetTop ? (vue.openBlock(), vue.createBlock(_component_u_status_bar, { key: 0 })) : vue.createCommentVNode("v-if", true),
                _ctx.touchable && _ctx.mode === "bottom" ? (vue.openBlock(), vue.createElementBlock(
                  "view",
                  {
                    key: 1,
                    class: "u-popup__content__touch-area",
                    onTouchstart: _cache[1] || (_cache[1] = (...args) => $options.onTouchStart && $options.onTouchStart(...args)),
                    onTouchmove: _cache[2] || (_cache[2] = (...args) => $options.onTouchMove && $options.onTouchMove(...args)),
                    onTouchend: _cache[3] || (_cache[3] = (...args) => $options.onTouchEnd && $options.onTouchEnd(...args)),
                    onTouchcancel: _cache[4] || (_cache[4] = (...args) => $options.onTouchEnd && $options.onTouchEnd(...args))
                  },
                  [
                    vue.createElementVNode(
                      "view",
                      {
                        class: "u-popup__content__indicator",
                        style: vue.normalizeStyle($options.indicatorStyle)
                      },
                      null,
                      4
                      /* STYLE */
                    )
                  ],
                  32
                  /* NEED_HYDRATION */
                )) : vue.createCommentVNode("v-if", true),
                vue.renderSlot(_ctx.$slots, "default", {}, void 0, true),
                _ctx.closeable ? (vue.openBlock(), vue.createElementBlock(
                  "view",
                  {
                    key: 2,
                    onClick: _cache[5] || (_cache[5] = vue.withModifiers((...args) => $options.close && $options.close(...args), ["stop"])),
                    class: vue.normalizeClass(["u-popup__content__close", ["u-popup__content__close--" + _ctx.closeIconPos]]),
                    "hover-class": "u-popup__content__close--hover",
                    "hover-stay-time": "150"
                  },
                  [
                    vue.createVNode(_component_up_icon, {
                      name: "close",
                      color: $options.closeIconColor,
                      size: "18",
                      bold: ""
                    }, null, 8, ["color"])
                  ],
                  2
                  /* CLASS */
                )) : vue.createCommentVNode("v-if", true),
                _ctx.safeAreaInsetBottom ? (vue.openBlock(), vue.createBlock(_component_u_safe_bottom, { key: 3 })) : vue.createCommentVNode("v-if", true)
              ],
              36
              /* STYLE, NEED_HYDRATION */
            ),
            vue.renderSlot(_ctx.$slots, "bottom", {}, void 0, true)
          ]),
          _: 3
          /* FORWARDED */
        }, 8, ["style", "show", "customStyle", "mode", "duration", "onAfterEnter", "onClick"])
      ],
      6
      /* CLASS, STYLE */
    );
  }
  const __easycom_0$2 = /* @__PURE__ */ _export_sfc(_sfc_main$B, [["render", _sfc_render$A], ["__scopeId", "data-v-74921bef"], ["__file", "F:/项目文件/uniapp版本/node_modules/uview-plus/components/u-popup/u-popup.vue"]]);
  const getMatchList = (status, sport = SportType.BASKETBALL) => request({ url: `${sportPrefix(sport)}game/list-my-manage`, query: { status } });
  const getMember = (gameTeamId) => request({ url: "statistics/member/list", query: { gameTeamId } });
  const getGameDetail = (gameId, sport = SportType.BASKETBALL) => request({ url: `${sportPrefix(sport)}game/{gameId}/detail`, path: { gameId } });
  const getGameBasketballDetail = (gameId) => request({ url: "statistics/game-detail-basketball", query: { gameId } });
  const getSectionList = (gameId) => request({ url: "statistics/section/list", query: { gameId } });
  const gameStatus = (params2, sport = SportType.BASKETBALL) => request({ url: `${sportPrefix(sport)}game/status`, method: "POST", data: params2 });
  const memberSign = (params2) => request({ url: "statistics/member/sign", method: "POST", data: params2 });
  const cancelMemberSign = (params2) => request({ url: "statistics/member/sign-cancel", method: "POST", data: params2 });
  const startingLineup = (params2) => request({ url: "statistics/member/starting-lineup", method: "POST", data: params2 });
  const startingLineupCancel = (params2) => request({ url: "statistics/member/starting-lineup-cancel", method: "POST", data: params2 });
  const addMember = (params2) => request({ url: "statistics/member/temporary", method: "POST", data: params2 });
  const deleteMember = (id, teamMemberId) => request({ url: "statistics/member/delete-temporary", query: { id, teamMemberId } });
  const memberEditPosition = (params2) => request({ url: "statistics/member/edit-position", method: "POST", data: params2 });
  const getWeekList = (leagueId) => request({ url: "game/list-week", query: { leagueId } });
  const versionCheck = (params2) => request({ url: "sys/app-version/check", query: params2 });
  const KEY_DEVICE = "device_id";
  function getDeviceId() {
    let id = uni.getStorageSync(KEY_DEVICE);
    if (id)
      return id;
    try {
      id = plus.device.uuid || "";
    } catch (e) {
      id = "";
    }
    if (!id) {
      id = generateUUID();
    }
    uni.setStorageSync(KEY_DEVICE, id);
    return id;
  }
  function generateUUID() {
    const s4 = () => Math.floor((1 + Math.random()) * 65536).toString(16).substring(1);
    return `${s4()}${s4()}-${s4()}-${s4()}-${s4()}-${s4()}${s4()}${s4()}`;
  }
  const DEFAULT_VERSION = "2.8.4";
  const useAppStore = defineStore("app", () => {
    const device = vue.ref("");
    const version2 = vue.ref("");
    const versionName = vue.ref("");
    const sport = vue.ref(SportType.BASKETBALL);
    const companies = vue.ref([]);
    function init() {
      device.value = getDeviceId();
      try {
        version2.value = String(plus.runtime.versionCode || DEFAULT_VERSION);
        versionName.value = String(plus.runtime.version || DEFAULT_VERSION);
      } catch (e) {
        version2.value = DEFAULT_VERSION;
        versionName.value = DEFAULT_VERSION;
      }
    }
    function setSport(s) {
      sport.value = s;
    }
    function toggleSport() {
      sport.value = sport.value === SportType.BASKETBALL ? SportType.FOOTBALL : SportType.BASKETBALL;
    }
    function setCompanies(list) {
      companies.value = list || [];
    }
    return { device, version: version2, versionName, sport, companies, init, setSport, toggleSport, setCompanies };
  });
  const EventBus = {
    /** 篮球/足球切换，data: 'basketball' | 'football' */
    SPORT_CHANGE: "sport_change",
    /** 记录刷新通知（对应 8888） */
    RECORD_REFRESH: "record_refresh"
  };
  function emit(event, data) {
    uni.$emit(event, data);
  }
  function on(event, callback) {
    uni.$on(event, callback);
  }
  function off(event, callback) {
    uni.$off(event, callback);
  }
  const _imports_0 = "/static/mipmap-xhdpi/lianxi.png";
  const _imports_1$2 = "/static/mipmap-xhdpi/tuichu.png";
  const _imports_1$1 = "/static/mipmap-xxhdpi/no_shuju.png";
  const _sfc_main$A = {
    __name: "index",
    setup(__props, { expose: __expose }) {
      __expose();
      const userStore = useUserStore();
      const appStore = useAppStore();
      const useMock = config$1.useMock;
      const userInfo2 = vue.ref(null);
      const appVersion = vue.ref("");
      const sysInfo = uni.getSystemInfoSync();
      const statusBarHeight = sysInfo.statusBarHeight || 0;
      const refresherMaxDrag = Math.round(300 * sysInfo.windowWidth / 750);
      const drawer = vue.ref(false);
      const tab = vue.ref("no_end");
      const loading = vue.ref(false);
      const refreshing = vue.ref(false);
      const rawList = vue.ref([]);
      const showUpdate = vue.ref(false);
      const versionInfo = vue.ref(null);
      const showStatusSheet = vue.ref(false);
      const currentGame = vue.ref(null);
      const statusOptions = [
        { value: 1, desc: "未开始" },
        { value: 2, desc: "进行中" },
        { value: 3, desc: "已结束" }
      ];
      const groups = vue.computed(() => {
        const map = {};
        rawList.value.forEach((item) => {
          const date2 = item.date || "未分组";
          if (!map[date2])
            map[date2] = { date: date2, games: [] };
          if (item.games)
            map[date2].games.push(...item.games);
        });
        return Object.values(map);
      });
      onShow(() => {
        loadUserInfo();
        loadList();
        checkUpdate();
        appVersion.value = appStore.versionName || appStore.version;
      });
      function loadUserInfo() {
        getUserInfo().then((res) => {
          if (res.code === 1) {
            userInfo2.value = res.data;
            userStore.setUserInfo(res.data);
          }
        });
      }
      function loadList() {
        loading.value = true;
        getMatchList(tab.value, appStore.sport).then((res) => {
          if (res.code === 1)
            rawList.value = res.data || [];
        }).finally(() => {
          loading.value = false;
          refreshing.value = false;
        });
      }
      function switchTab(t2) {
        tab.value = t2;
        loadList();
      }
      function toggleSport() {
        appStore.toggleSport();
        emit(EventBus.SPORT_CHANGE, appStore.sport);
        loadList();
      }
      function selectSport(sport) {
        if (appStore.sport === sport)
          return;
        appStore.setSport(sport);
        emit(EventBus.SPORT_CHANGE, appStore.sport);
        loadList();
      }
      function ballIcon(sport, active) {
        const color2 = active ? "#29a871" : "#bbbbbb";
        const svg = sport === "basketball" ? `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='50' r='40' fill='none' stroke='${color2}' stroke-width='6'/><line x1='50' y1='10' x2='50' y2='90' stroke='${color2}' stroke-width='6'/><line x1='10' y1='50' x2='90' y2='50' stroke='${color2}' stroke-width='6'/><path d='M16 28 Q48 50 16 72' fill='none' stroke='${color2}' stroke-width='6'/><path d='M84 28 Q52 50 84 72' fill='none' stroke='${color2}' stroke-width='6'/></svg>` : `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='50' r='40' fill='none' stroke='${color2}' stroke-width='6'/><polygon points='50,30 67,43 61,63 39,63 33,43' fill='${color2}'/><line x1='50' y1='30' x2='50' y2='15' stroke='${color2}' stroke-width='6'/><line x1='67' y1='43' x2='82' y2='38' stroke='${color2}' stroke-width='6'/><line x1='61' y1='63' x2='74' y2='78' stroke='${color2}' stroke-width='6'/><line x1='39' y1='63' x2='26' y2='78' stroke='${color2}' stroke-width='6'/><line x1='33' y1='43' x2='18' y2='38' stroke='${color2}' stroke-width='6'/></svg>`;
        return "data:image/svg+xml," + encodeURIComponent(svg);
      }
      function onRefresh() {
        refreshing.value = true;
        loadList();
      }
      function statusText(g) {
        const s = g.status && g.status.value;
        if (s === 1)
          return "未开赛";
        if (s === 2)
          return "进行中";
        if (s === 3)
          return "结束";
        return "未开始";
      }
      function goMatchSet(g) {
        currentGame.value = g;
        showStatusSheet.value = true;
      }
      function onStatusSelect(s) {
        const g = currentGame.value;
        if (!g)
          return;
        showStatusSheet.value = false;
        const params2 = { gameId: g.id, status: s.value };
        formatAppLog("log", "at pages/main/index.vue:327", "[gameStatus] 请求参数", params2, "sport=", appStore.sport);
        gameStatus(params2, appStore.sport).then((res) => {
          formatAppLog("log", "at pages/main/index.vue:329", "[gameStatus] 响应", res);
          if (res && res.code === 1) {
            uni.showToast({ title: `已修改为「${s.desc}」`, icon: "none" });
            g.status = { value: s.value, desc: s.desc };
            refreshing.value = true;
            loadList();
          } else {
            uni.showToast({ title: res && res.msg || "修改失败", icon: "none" });
          }
        }).catch((err) => {
          formatAppLog("error", "at pages/main/index.vue:341", "[gameStatus] 失败", err);
          uni.showToast({ title: err && err.msg || "修改失败", icon: "none" });
        });
      }
      function goLive(g) {
        uni.navigateTo({ url: `/pages/live/multiple?gameId=${g.id}&sport=${appStore.sport}` });
      }
      function goPhoto() {
        uni.navigateTo({ url: "/pages/photo/photo" });
      }
      function practice(sport) {
        drawer.value = false;
        uni.showLoading({ title: "加载练习赛…", mask: true });
        const req = getGameDetail(sport, "basketball");
        req.then((res) => {
          uni.hideLoading();
          if (!res || res.code !== 1) {
            uni.showToast({ title: res && res.msg || "练习赛加载失败", icon: "none" });
            return;
          }
          const g = res.data && res.data.game || res.data || {};
          const url2 = sport === "football" ? `/pages/match/football-setup?gameId=${g.id}&hostTeamId=${g.hostGameTeamId}&guestTeamId=${g.guestGameTeamId}` : `/pages/match/basketball-setup?gameId=${g.id}&hostTeamId=${g.hostGameTeamId}&guestTeamId=${g.guestGameTeamId}`;
          uni.navigateTo({ url: url2 });
        }).catch((err) => {
          uni.hideLoading();
          uni.showToast({ title: err && err.msg || "练习赛加载失败", icon: "none" });
        });
      }
      function goWeekOuts() {
        drawer.value = false;
        uni.navigateTo({ url: "/pages/game/week-outs" });
      }
      function logout() {
        uni.showModal({
          title: "提示",
          content: "确定退出登录？",
          success: (r) => {
            if (r.confirm) {
              userStore.logout();
              uni.reLaunch({ url: "/pages/login/index" });
            }
          }
        });
      }
      function checkUpdate() {
        versionCheck({ deviceType: "android", appType: "statistics", versionCode: appStore.version }).then((res) => {
          if (res.code === 1 && res.data) {
            const v = res.data;
            if (v.versionCode && Number(v.versionCode) > Number(appStore.version)) {
              versionInfo.value = v;
              showUpdate.value = true;
            }
          }
        }).catch(() => {
        });
      }
      function doUpdate() {
        const url2 = versionInfo.value && versionInfo.value.url;
        if (!url2)
          return;
        uni.showLoading({ title: "下载中…", mask: true });
        const dtask = plus.downloader.createDownload(
          url2,
          { filename: "_doc/update.apk" },
          (d, status) => {
            uni.hideLoading();
            if (status === 200) {
              plus.runtime.install(
                d.filename,
                {},
                () => {
                },
                () => uni.showToast({ title: "安装失败", icon: "none" })
              );
            } else {
              uni.showToast({ title: "下载失败", icon: "none" });
            }
          }
        );
        dtask.start();
      }
      const __returned__ = { userStore, appStore, useMock, userInfo: userInfo2, appVersion, sysInfo, statusBarHeight, refresherMaxDrag, drawer, tab, loading, refreshing, rawList, showUpdate, versionInfo, showStatusSheet, currentGame, statusOptions, groups, loadUserInfo, loadList, switchTab, toggleSport, selectSport, ballIcon, onRefresh, statusText, goMatchSet, onStatusSelect, goLive, goPhoto, practice, goWeekOuts, logout, checkUpdate, doUpdate, ref: vue.ref, computed: vue.computed, get onShow() {
        return onShow;
      }, customNav, get getMatchList() {
        return getMatchList;
      }, get gameStatus() {
        return gameStatus;
      }, get getGameDetail() {
        return getGameDetail;
      }, get getUserInfo() {
        return getUserInfo;
      }, get versionCheck() {
        return versionCheck;
      }, get useUserStore() {
        return useUserStore;
      }, get useAppStore() {
        return useAppStore;
      }, get emit() {
        return emit;
      }, get EventBus() {
        return EventBus;
      }, get config() {
        return config$1;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$z(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_u_popup = resolveEasycom(vue.resolveDynamicComponent("u-popup"), __easycom_0$2);
    return vue.openBlock(), vue.createElementBlock("view", { class: "main" }, [
      vue.createVNode($setup["customNav"], {
        title: "智能技术台",
        "show-back": false
      }, {
        left: vue.withCtx(() => [
          vue.createElementVNode("view", {
            class: "avatar-btn",
            onClick: _cache[0] || (_cache[0] = ($event) => $setup.drawer = true)
          }, [
            vue.createElementVNode("image", {
              class: "avatar",
              src: $setup.userInfo && $setup.userInfo.avatar,
              mode: "aspectFill"
            }, null, 8, ["src"])
          ])
        ]),
        right: vue.withCtx(() => [
          vue.createElementVNode("text", {
            class: "nav-action",
            onClick: $setup.goPhoto
          }, "活动列表")
        ]),
        _: 1
        /* STABLE */
      }),
      $setup.useMock ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 0,
        class: "mock-banner"
      }, "⚠️ MOCK 静态数据模式 · 列表/详情/统计均为造数 · 关闭请改 config.useMock=false")) : vue.createCommentVNode("v-if", true),
      $setup.drawer ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 1,
        class: "mask",
        onClick: _cache[1] || (_cache[1] = ($event) => $setup.drawer = false)
      })) : vue.createCommentVNode("v-if", true),
      vue.createElementVNode(
        "view",
        {
          class: vue.normalizeClass(["drawer", { open: $setup.drawer }])
        },
        [
          vue.createElementVNode(
            "view",
            {
              class: "drawer-status",
              style: vue.normalizeStyle({ height: $setup.statusBarHeight + "px" })
            },
            null,
            4
            /* STYLE */
          ),
          vue.createElementVNode("view", { class: "drawer-header" }, [
            vue.createElementVNode("image", {
              class: "avatar-lg",
              src: $setup.userInfo && $setup.userInfo.avatar,
              mode: "aspectFill"
            }, null, 8, ["src"]),
            vue.createElementVNode(
              "text",
              { class: "nick" },
              vue.toDisplayString($setup.userInfo && $setup.userInfo.nickName || "未登录"),
              1
              /* TEXT */
            )
          ]),
          vue.createElementVNode("view", {
            class: "drawer-item",
            onClick: _cache[2] || (_cache[2] = ($event) => $setup.practice("basketball"))
          }, [
            vue.createElementVNode("image", {
              class: "search-icon",
              src: _imports_0
            }),
            vue.createElementVNode("p", null, "篮球练习模式")
          ]),
          vue.createElementVNode("view", {
            class: "drawer-item",
            onClick: _cache[3] || (_cache[3] = ($event) => $setup.practice("football"))
          }, [
            vue.createElementVNode("image", {
              class: "search-icon",
              src: _imports_0
            }),
            vue.createElementVNode("p", null, "足球练习模式")
          ]),
          vue.createElementVNode("view", {
            class: "drawer-item",
            onClick: $setup.goWeekOuts
          }, [
            vue.createElementVNode("image", {
              class: "search-icon",
              src: _imports_0
            }),
            vue.createElementVNode("p", null, "优肯周赛况")
          ]),
          vue.createElementVNode("view", { class: "bottom-line" }, [
            vue.createElementVNode("view", {
              class: "exit-login",
              onClick: $setup.logout
            }, [
              vue.createElementVNode("image", {
                class: "exit-icon",
                src: _imports_1$2
              }),
              vue.createElementVNode("view", { style: { "margin-left": "25rpx", "font-size": "27rpx" } }, "退出登录")
            ]),
            vue.createElementVNode(
              "view",
              { class: "version" },
              "版本 " + vue.toDisplayString($setup.appVersion),
              1
              /* TEXT */
            )
          ])
        ],
        2
        /* CLASS */
      ),
      vue.createElementVNode("view", { class: "sport-switch" }, [
        vue.createElementVNode(
          "view",
          {
            class: vue.normalizeClass(["sport-item", { active: $setup.appStore.sport === "basketball" }]),
            onClick: _cache[4] || (_cache[4] = ($event) => $setup.selectSport("basketball"))
          },
          [
            vue.createElementVNode("image", {
              class: "sport-icon",
              src: $setup.appStore.sport === "basketball" ? "/static/mipmap-xxhdpi/basket_c.png" : "/static/mipmap-xxhdpi/basket_w.png"
            }, null, 8, ["src"])
          ],
          2
          /* CLASS */
        ),
        vue.createElementVNode(
          "view",
          {
            class: vue.normalizeClass(["sport-item", { active: $setup.appStore.sport === "football" }]),
            onClick: _cache[5] || (_cache[5] = ($event) => $setup.selectSport("football"))
          },
          [
            vue.createElementVNode("image", {
              class: "sport-icon",
              src: $setup.appStore.sport === "football" ? "/static/mipmap-xxhdpi/football_c.png" : "/static/mipmap-xxhdpi/football_w.png"
            }, null, 8, ["src"])
          ],
          2
          /* CLASS */
        )
      ]),
      vue.createElementVNode("view", { class: "tabs" }, [
        vue.createElementVNode(
          "view",
          {
            class: vue.normalizeClass(["tab", { active: $setup.tab === "no_end" }]),
            onClick: _cache[6] || (_cache[6] = ($event) => $setup.switchTab("no_end"))
          },
          "未结束",
          2
          /* CLASS */
        ),
        vue.createElementVNode(
          "view",
          {
            class: vue.normalizeClass(["tab", { active: $setup.tab === "end" }]),
            onClick: _cache[7] || (_cache[7] = ($event) => $setup.switchTab("end"))
          },
          "已结束",
          2
          /* CLASS */
        )
      ]),
      vue.createElementVNode("scroll-view", {
        "scroll-y": "",
        class: "list",
        "refresher-enabled": "",
        "refresher-triggered": $setup.refreshing,
        "refresher-max-drag-distance": $setup.refresherMaxDrag,
        onRefresherrefresh: $setup.onRefresh
      }, [
        (vue.openBlock(true), vue.createElementBlock(
          vue.Fragment,
          null,
          vue.renderList($setup.groups, (group) => {
            return vue.openBlock(), vue.createElementBlock("view", {
              key: group.date,
              class: "date-group"
            }, [
              vue.createElementVNode(
                "view",
                { class: "date-header" },
                vue.toDisplayString(group.date),
                1
                /* TEXT */
              ),
              (vue.openBlock(true), vue.createElementBlock(
                vue.Fragment,
                null,
                vue.renderList(group.games, (g) => {
                  return vue.openBlock(), vue.createElementBlock("view", {
                    key: g.id,
                    class: "match-item"
                  }, [
                    vue.createElementVNode("view", { class: "league-headinfo" }, [
                      vue.createElementVNode(
                        "view",
                        { class: "league status" },
                        vue.toDisplayString($setup.statusText(g)),
                        1
                        /* TEXT */
                      ),
                      vue.createElementVNode(
                        "view",
                        { class: "league" },
                        vue.toDisplayString(g.leagueName),
                        1
                        /* TEXT */
                      )
                    ]),
                    vue.createElementVNode("view", {
                      class: "league-innerinfo",
                      style: { "display": "flex", "flex-direction": "column", "gap": "15rpx" }
                    }, [
                      vue.createElementVNode("view", { class: "team-line" }, [
                        vue.createElementVNode("view", { style: { "display": "flex", "align-items": "center" } }, [
                          g.hostTeamLogo ? (vue.openBlock(), vue.createElementBlock("image", {
                            key: 0,
                            class: "logo",
                            src: g.hostTeamLogo,
                            mode: "aspectFill"
                          }, null, 8, ["src"])) : vue.createCommentVNode("v-if", true),
                          vue.createElementVNode(
                            "text",
                            { class: "team-name" },
                            vue.toDisplayString(g.hostTeamName),
                            1
                            /* TEXT */
                          )
                        ]),
                        vue.createElementVNode("view", { style: { "display": "flex", "align-items": "center" } }, [
                          vue.createElementVNode(
                            "text",
                            { class: "score" },
                            vue.toDisplayString(g.hostTeamScore),
                            1
                            /* TEXT */
                          ),
                          vue.createElementVNode("view", {
                            class: "action-btn blue",
                            onClick: ($event) => $setup.goLive(g)
                          }, "直播", 8, ["onClick"])
                        ])
                      ]),
                      vue.createElementVNode("view", { class: "team-line" }, [
                        vue.createElementVNode("view", { style: { "display": "flex", "align-items": "center" } }, [
                          g.guestTeamLogo ? (vue.openBlock(), vue.createElementBlock("image", {
                            key: 0,
                            class: "logo",
                            src: g.guestTeamLogo,
                            mode: "aspectFill"
                          }, null, 8, ["src"])) : vue.createCommentVNode("v-if", true),
                          vue.createElementVNode(
                            "text",
                            { class: "team-name" },
                            vue.toDisplayString(g.guestTeamName),
                            1
                            /* TEXT */
                          )
                        ]),
                        vue.createElementVNode("view", { style: { "display": "flex", "align-items": "center" } }, [
                          vue.createElementVNode(
                            "text",
                            { class: "score" },
                            vue.toDisplayString(g.guestTeamScore),
                            1
                            /* TEXT */
                          ),
                          vue.createElementVNode("view", {
                            class: "action-btn green",
                            onClick: ($event) => $setup.goMatchSet(g)
                          }, "修改状态", 8, ["onClick"])
                        ])
                      ])
                    ])
                  ]);
                }),
                128
                /* KEYED_FRAGMENT */
              ))
            ]);
          }),
          128
          /* KEYED_FRAGMENT */
        )),
        !$setup.loading && !$setup.groups.length ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 0,
          class: "no-data"
        }, [
          vue.createElementVNode("image", {
            class: "no-data-img",
            src: _imports_1$1,
            mode: "aspectFit"
          }),
          vue.createElementVNode("view", { style: { "color": "#BBBBBB" } }, "暂无数据")
        ])) : vue.createCommentVNode("v-if", true),
        $setup.loading ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 1,
          class: "loading-more"
        }, "加载中…")) : vue.createCommentVNode("v-if", true)
      ], 40, ["refresher-triggered", "refresher-max-drag-distance"]),
      vue.createVNode(_component_u_popup, {
        show: $setup.showUpdate,
        mode: "center",
        round: 20,
        onClose: _cache[9] || (_cache[9] = ($event) => $setup.showUpdate = false)
      }, {
        default: vue.withCtx(() => [
          vue.createElementVNode("view", { class: "update-dialog" }, [
            vue.createElementVNode("view", { class: "update-title" }, "发现新版本"),
            vue.createElementVNode("scroll-view", {
              "scroll-y": "",
              class: "update-content"
            }, [
              vue.createElementVNode(
                "text",
                null,
                vue.toDisplayString($setup.versionInfo && $setup.versionInfo.remark),
                1
                /* TEXT */
              )
            ]),
            vue.createElementVNode("view", { class: "update-btns" }, [
              vue.createElementVNode("view", {
                class: "ub cancel",
                onClick: _cache[8] || (_cache[8] = ($event) => $setup.showUpdate = false)
              }, "稍后"),
              vue.createElementVNode("view", {
                class: "ub confirm",
                onClick: $setup.doUpdate
              }, "立即更新")
            ])
          ])
        ]),
        _: 1
        /* STABLE */
      }, 8, ["show"]),
      vue.createVNode(_component_u_popup, {
        show: $setup.showStatusSheet,
        mode: "bottom",
        round: 20,
        onClose: _cache[11] || (_cache[11] = ($event) => $setup.showStatusSheet = false)
      }, {
        default: vue.withCtx(() => [
          vue.createElementVNode("view", { class: "status-sheet" }, [
            vue.createElementVNode("view", { class: "sheet-title" }, "修改比赛状态"),
            (vue.openBlock(), vue.createElementBlock(
              vue.Fragment,
              null,
              vue.renderList($setup.statusOptions, (s) => {
                return vue.createElementVNode("view", {
                  key: s.value,
                  class: vue.normalizeClass(["status-item", { active: $setup.currentGame && $setup.currentGame.status && $setup.currentGame.status.value === s.value }]),
                  onClick: ($event) => $setup.onStatusSelect(s)
                }, [
                  vue.createElementVNode(
                    "text",
                    { class: "status-text" },
                    vue.toDisplayString(s.desc),
                    1
                    /* TEXT */
                  ),
                  $setup.currentGame && $setup.currentGame.status && $setup.currentGame.status.value === s.value ? (vue.openBlock(), vue.createElementBlock("text", {
                    key: 0,
                    class: "status-check"
                  }, "✓")) : vue.createCommentVNode("v-if", true)
                ], 10, ["onClick"]);
              }),
              64
              /* STABLE_FRAGMENT */
            )),
            vue.createElementVNode("view", {
              class: "status-cancel",
              onClick: _cache[10] || (_cache[10] = ($event) => $setup.showStatusSheet = false)
            }, "取消")
          ])
        ]),
        _: 1
        /* STABLE */
      }, 8, ["show"])
    ]);
  }
  const PagesMainIndex = /* @__PURE__ */ _export_sfc(_sfc_main$A, [["render", _sfc_render$z], ["__scopeId", "data-v-d311227b"], ["__file", "F:/项目文件/uniapp版本/pages/main/index.vue"]]);
  const BadgeDefaultProps = {
    // 徽标数组件
    badge: {
      isDot: false,
      value: "",
      show: true,
      max: 999,
      type: "error",
      showZero: false,
      bgColor: null,
      color: null,
      shape: "circle",
      numberType: "overflow",
      offset: [],
      inverted: false,
      absolute: false
    }
  };
  const defProps$4 = registerComponentProps(BadgeDefaultProps);
  const props$4 = defineMixin({
    props: {
      // 是否显示圆点
      isDot: {
        type: Boolean,
        default: () => defProps$4.badge.isDot
      },
      // 显示的内容
      value: {
        type: [Number, String],
        default: () => defProps$4.badge.value
      },
      // 显示的内容
      modelValue: {
        type: [Number, String],
        default: () => defProps$4.badge.modelValue
      },
      // 是否显示
      show: {
        type: Boolean,
        default: () => defProps$4.badge.show
      },
      // 最大值，超过最大值会显示 '{max}+'
      max: {
        type: [Number, String],
        default: () => defProps$4.badge.max
      },
      // 主题类型，error|warning|success|primary
      type: {
        type: String,
        default: () => defProps$4.badge.type
      },
      // 当数值为 0 时，是否展示 Badge
      showZero: {
        type: Boolean,
        default: () => defProps$4.badge.showZero
      },
      // 背景颜色，优先级比type高，如设置，type参数会失效
      bgColor: {
        type: [String, null],
        default: () => defProps$4.badge.bgColor
      },
      // 字体颜色
      color: {
        type: [String, null],
        default: () => defProps$4.badge.color
      },
      // 徽标形状，circle-四角均为圆角，horn-左下角为直角
      shape: {
        type: String,
        default: () => defProps$4.badge.shape
      },
      // 设置数字的显示方式，overflow|ellipsis|limit
      // overflow会根据max字段判断，超出显示`${max}+`
      // ellipsis会根据max判断，超出显示`${max}...`
      // limit会依据1000作为判断条件，超出1000，显示`${value/1000}K`，比如2.2k、3.34w，最多保留2位小数
      numberType: {
        type: String,
        default: () => defProps$4.badge.numberType
      },
      // 设置badge的位置偏移，格式为 [x, y]，也即设置的为top和right的值，absolute为true时有效
      offset: {
        type: Array,
        default: () => defProps$4.badge.offset
      },
      // 是否反转背景和字体颜色
      inverted: {
        type: Boolean,
        default: () => defProps$4.badge.inverted
      },
      // 是否绝对定位
      absolute: {
        type: Boolean,
        default: () => defProps$4.badge.absolute
      }
    }
  });
  const _sfc_main$z = {
    name: "u-badge",
    mixins: [mpMixin, props$4, mixin],
    computed: {
      // 是否将badge中心与父组件右上角重合
      boxStyle() {
        let style = {};
        return style;
      },
      // 整个组件的样式
      badgeStyle() {
        const style = {};
        if (this.color) {
          style.color = this.color;
        }
        if (this.bgColor && !this.inverted) {
          style.backgroundColor = this.bgColor;
        }
        if (this.absolute) {
          style.position = "absolute";
          if (this.offset.length) {
            const top = this.offset[0];
            const right = this.offset[1] || top;
            style.top = addUnit(top);
            style.right = addUnit(right);
          }
        }
        return style;
      },
      showValue() {
        switch (this.numberType) {
          case "overflow":
            return Number(this.value) > Number(this.max) ? this.max + "+" : this.value;
          case "ellipsis":
            return Number(this.value) > Number(this.max) ? "..." : this.value;
          case "limit":
            return Number(this.value) > 999 ? Number(this.value) >= 9999 ? Math.floor(this.value / 1e4 * 100) / 100 + "w" : Math.floor(this.value / 1e3 * 100) / 100 + "k" : this.value;
          default:
            return Number(this.value);
        }
      }
    },
    methods: {
      addStyle
    }
  };
  function _sfc_render$y(_ctx, _cache, $props, $setup, $data, $options) {
    return _ctx.show && ((Number(_ctx.value) === 0 ? _ctx.showZero : true) || _ctx.isDot) ? (vue.openBlock(), vue.createElementBlock(
      "text",
      {
        key: 0,
        class: vue.normalizeClass([[_ctx.isDot ? "u-badge--dot" : "u-badge--not-dot", _ctx.inverted && "u-badge--inverted", _ctx.shape === "horn" && "u-badge--horn", `u-badge--${_ctx.type}${_ctx.inverted ? "--inverted" : ""}`], "u-badge"]),
        style: vue.normalizeStyle([$options.addStyle(_ctx.customStyle), $options.badgeStyle])
      },
      vue.toDisplayString(_ctx.isDot ? "" : $options.showValue),
      7
      /* TEXT, CLASS, STYLE */
    )) : vue.createCommentVNode("v-if", true);
  }
  const __easycom_1$2 = /* @__PURE__ */ _export_sfc(_sfc_main$z, [["render", _sfc_render$y], ["__scopeId", "data-v-aa9883b1"], ["__file", "F:/项目文件/uniapp版本/node_modules/uview-plus/components/u-badge/u-badge.vue"]]);
  const TabsDefaultProps = {
    //
    tabs: {
      duration: 300,
      list: [],
      lineColor: "",
      activeStyle: {
        color: "#303133"
      },
      inactiveStyle: {
        color: "#606266"
      },
      lineWidth: 20,
      lineHeight: 3,
      lineBgSize: "cover",
      itemStyle: {
        height: "44px"
      },
      scrollable: true,
      current: 0,
      keyName: "name",
      iconStyle: {},
      shapeMode: ""
    }
  };
  const defProps$3 = registerComponentProps(TabsDefaultProps);
  const props$3 = defineMixin({
    props: {
      // 滑块的移动过渡时间，单位ms
      duration: {
        type: Number,
        default: () => defProps$3.tabs.duration
      },
      // tabs标签数组
      list: {
        type: Array,
        default: () => defProps$3.tabs.list
      },
      // 滑块颜色
      lineColor: {
        type: String,
        default: () => defProps$3.tabs.lineColor
      },
      // 菜单选择中时的样式
      activeStyle: {
        type: [String, Object],
        default: () => defProps$3.tabs.activeStyle
      },
      // 菜单非选中时的样式
      inactiveStyle: {
        type: [String, Object],
        default: () => defProps$3.tabs.inactiveStyle
      },
      // 滑块长度
      lineWidth: {
        type: [String, Number],
        default: () => defProps$3.tabs.lineWidth
      },
      // 滑块高度
      lineHeight: {
        type: [String, Number],
        default: () => defProps$3.tabs.lineHeight
      },
      // 滑块背景显示大小，当滑块背景设置为图片时使用
      lineBgSize: {
        type: String,
        default: () => defProps$3.tabs.lineBgSize
      },
      // 菜单item的样式
      itemStyle: {
        type: [String, Object],
        default: () => defProps$3.tabs.itemStyle
      },
      // 菜单是否可滚动
      scrollable: {
        type: Boolean,
        default: () => defProps$3.tabs.scrollable
      },
      // 当前选中标签的索引
      current: {
        type: [Number, String],
        default: () => defProps$3.tabs.current
      },
      // 默认读取的键名
      keyName: {
        type: String,
        default: () => defProps$3.tabs.keyName
      },
      // 左侧图标样式
      iconStyle: {
        type: [String, Object],
        default: () => defProps$3.tabs.iconStyle
      },
      // 形态模式，可选：capsule/card/pill-arrow/tag
      shapeMode: {
        type: String,
        default: () => defProps$3.tabs.shapeMode
      }
    }
  });
  const _sfc_main$y = {
    name: "u-tabs",
    mixins: [mpMixin, mixin, props$3],
    data() {
      return {
        tabList: [],
        scrollLeft: 0,
        scrollViewWidth: 0,
        lineOffsetLeft: 0,
        lineShow: false,
        tabsRect: {
          left: 0
        },
        innerCurrent: 0,
        moving: false
      };
    },
    watch: {
      current: {
        immediate: true,
        handler(newValue, oldValue) {
          if (newValue !== this.innerCurrent) {
            if (typeof newValue == "string") {
              this.innerCurrent = parseInt(newValue);
            } else {
              this.innerCurrent = newValue;
            }
            this.$nextTick(() => {
              this.resize();
            });
          }
        }
      },
      // list变化时，重新渲染list各项信息
      list: {
        handler(newValue, oldValue) {
          this.tabList = deepClone(newValue);
          this.$nextTick(() => {
            this.resize();
          });
        },
        immediate: true,
        deep: true
      }
    },
    computed: {
      shapeModeClass() {
        return this.shapeMode ? `u-tabs--shape-${this.shapeMode}` : "";
      },
      showLine() {
        return this.lineShow && !["capsule", "pill-arrow", "tag"].includes(this.shapeMode);
      },
      itemComputedStyle() {
        const style = addStyle(this.itemStyle) || {};
        if (this.upHasProp("itemStyle")) {
          return style;
        }
        const defaultModeHeights = {
          capsule: "30px",
          card: "34px",
          "pill-arrow": "32px",
          tag: "28px"
        };
        const height = defaultModeHeights[this.shapeMode];
        if (!height) {
          return style;
        }
        return deepMerge(style, {
          height
        });
      },
      textStyle() {
        return (index2) => {
          var _a, _b, _c, _d;
          const style = {};
          const customeStyle = index2 == this.innerCurrent ? addStyle(this.activeStyle) : addStyle(this.inactiveStyle);
          const isActive = index2 == this.innerCurrent;
          const defaultActiveColor = ((_b = (_a = props$b.tabs) == null ? void 0 : _a.activeStyle) == null ? void 0 : _b.color) || "#303133";
          const defaultInactiveColor = ((_d = (_c = props$b.tabs) == null ? void 0 : _c.inactiveStyle) == null ? void 0 : _d.color) || "#606266";
          const isActiveStyleOverridden = this.upHasProp("activeStyle") || customeStyle && customeStyle.color && customeStyle.color !== defaultActiveColor;
          const isInactiveStyleOverridden = this.upHasProp("inactiveStyle") || customeStyle && customeStyle.color && customeStyle.color !== defaultInactiveColor;
          if (isActive && ["pill-arrow", "tag"].includes(this.shapeMode) && !isActiveStyleOverridden) {
            style.color = "#ffffff";
          } else if (isActive && !isActiveStyleOverridden) {
            style.color = this.upThemeVar("--up-main-color", this.$u.color.mainColor || defaultActiveColor);
          }
          if (!isActive && ["pill-arrow", "tag"].includes(this.shapeMode) && !isInactiveStyleOverridden) {
            style.color = "#606266";
          } else if (!isActive && !isInactiveStyleOverridden) {
            style.color = this.upThemeVar("--up-content-color", this.$u.color.contentColor || defaultInactiveColor);
          }
          if (this.tabList[index2].disabled) {
            style.color = this.upThemeVar("--up-disabled-color", this.$u.color.disabledColor || "#c8c9cc");
          }
          return deepMerge(customeStyle, style);
        };
      },
      propsBadge() {
        return props$b.badge;
      }
    },
    async mounted() {
      this.init();
      this.windowResizeCallback = (res) => {
        this.init();
      };
      uni.onWindowResize(this.windowResizeCallback);
    },
    beforeUnmount() {
      uni.offWindowResize(this.windowResizeCallback);
    },
    emits: ["click", "longPress", "change", "update:current"],
    methods: {
      addStyle,
      addUnit,
      setLineLeft() {
        const tabItem = this.tabList[this.innerCurrent];
        if (!tabItem) {
          return;
        }
        let lineOffsetLeft = this.tabList.slice(0, this.innerCurrent).reduce((total, curr) => total + curr.rect.width, 0);
        const lineWidth = getPx(this.lineWidth);
        this.lineOffsetLeft = lineOffsetLeft + (tabItem.rect.width - lineWidth) / 2;
        if (!this.lineShow)
          this.lineShow = true;
      },
      // nvue下设置滑块的位置
      animation(x, duration = 0) {
      },
      // 点击某一个标签
      clickHandler(item, index2) {
        this.$emit("click", {
          ...item,
          index: index2
        }, index2);
        if (item.disabled)
          return;
        if (this.innerCurrent == index2)
          return;
        this.innerCurrent = index2;
        this.$nextTick(() => {
          this.resize();
        });
        this.$emit("update:current", index2);
        this.$emit("change", {
          ...item,
          index: index2
        }, index2);
      },
      // 长按事件
      longPressHandler(item, index2) {
        this.$emit("longPress", {
          ...item,
          index: index2
        });
      },
      init() {
        sleep().then(() => {
          this.resize();
        });
      },
      setScrollLeft() {
        if (this.innerCurrent < 0) {
          this.innerCurrent = 0;
        }
        const tabRect = this.tabList[this.innerCurrent];
        const offsetLeft = this.tabList.slice(0, this.innerCurrent).reduce((total, curr) => {
          return total + curr.rect.width;
        }, 0);
        const windowWidth = getWindowInfo().windowWidth;
        let scrollLeft = offsetLeft - (this.tabsRect.width - tabRect.rect.width) / 2 - (windowWidth - this.tabsRect.right) / 2 + this.tabsRect.left / 2;
        scrollLeft = Math.min(scrollLeft, this.scrollViewWidth - this.tabsRect.width);
        this.scrollLeft = Math.max(0, scrollLeft);
      },
      // 获取所有标签的尺寸
      resize() {
        if (this.tabList.length === 0) {
          return;
        }
        Promise.all([this.getTabsRect(), this.getAllItemRect()]).then(([tabsRect, itemRect = []]) => {
          if (tabsRect.left > tabsRect.width) {
            tabsRect.right = tabsRect.right - Math.floor(tabsRect.left / tabsRect.width) * tabsRect.width;
            tabsRect.left = tabsRect.left % tabsRect.width;
          }
          this.tabsRect = tabsRect;
          this.scrollViewWidth = 0;
          itemRect.map((item, index2) => {
            this.scrollViewWidth += item.width;
            this.tabList[index2].rect = item;
          });
          this.setLineLeft();
          this.setScrollLeft();
        });
      },
      // 获取导航菜单的尺寸
      getTabsRect() {
        return new Promise((resolve) => {
          this.queryRect("u-tabs__wrapper__scroll-view").then((size) => resolve(size));
        });
      },
      // 获取所有标签的尺寸
      getAllItemRect() {
        return new Promise((resolve) => {
          const promiseAllArr = this.tabList.map((item, index2) => this.queryRect(
            `u-tabs__wrapper__nav__item-${index2}`,
            true
          ));
          Promise.all(promiseAllArr).then((sizes) => resolve(sizes));
        });
      },
      // 获取各个标签的尺寸
      queryRect(el, item) {
        return new Promise((resolve) => {
          this.$uGetRect(`.${el}`).then((size) => {
            resolve(size);
          });
        });
      }
    }
  };
  function _sfc_render$x(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_up_icon = resolveEasycom(vue.resolveDynamicComponent("up-icon"), __easycom_0$3);
    const _component_u_badge = resolveEasycom(vue.resolveDynamicComponent("u-badge"), __easycom_1$2);
    return vue.openBlock(), vue.createElementBlock(
      "view",
      {
        class: vue.normalizeClass(["u-tabs", [_ctx.customClass, $options.shapeModeClass]])
      },
      [
        vue.createElementVNode("view", { class: "u-tabs__wrapper" }, [
          vue.renderSlot(_ctx.$slots, "left", {}, void 0, true),
          vue.createElementVNode("view", { class: "u-tabs__wrapper__scroll-view-wrapper" }, [
            vue.createElementVNode("scroll-view", {
              "scroll-x": _ctx.scrollable,
              "scroll-left": $data.scrollLeft,
              "scroll-with-animation": "",
              class: "u-tabs__wrapper__scroll-view",
              "show-scrollbar": false,
              ref: "u-tabs__wrapper__scroll-view"
            }, [
              vue.createElementVNode(
                "view",
                {
                  class: "u-tabs__wrapper__nav",
                  ref: "u-tabs__wrapper__nav"
                },
                [
                  (vue.openBlock(true), vue.createElementBlock(
                    vue.Fragment,
                    null,
                    vue.renderList($data.tabList, (item, index2) => {
                      return vue.openBlock(), vue.createElementBlock("view", {
                        class: vue.normalizeClass(["u-tabs__wrapper__nav__item", [
                          `u-tabs__wrapper__nav__item-${index2}`,
                          _ctx.shapeMode && `u-tabs__wrapper__nav__item--${_ctx.shapeMode}`,
                          item.disabled && "u-tabs__wrapper__nav__item--disabled",
                          $data.innerCurrent == index2 ? "u-tabs__wrapper__nav__item-active" : ""
                        ]]),
                        key: index2,
                        onClick: ($event) => $options.clickHandler(item, index2),
                        onLongpress: ($event) => $options.longPressHandler(item, index2),
                        ref_for: true,
                        ref: `u-tabs__wrapper__nav__item-${index2}`,
                        style: vue.normalizeStyle([$options.itemComputedStyle, { flex: _ctx.scrollable ? "" : 1 }])
                      }, [
                        _ctx.$slots.icon ? vue.renderSlot(_ctx.$slots, "icon", {
                          key: 0,
                          item,
                          keyName: _ctx.keyName,
                          index: index2
                        }, void 0, true) : (vue.openBlock(), vue.createElementBlock(
                          vue.Fragment,
                          { key: 1 },
                          [
                            item.icon ? (vue.openBlock(), vue.createElementBlock("view", {
                              key: 0,
                              class: "u-tabs__wrapper__nav__item__prefix-icon"
                            }, [
                              vue.createVNode(_component_up_icon, {
                                name: item.icon,
                                customStyle: $options.addStyle(_ctx.iconStyle)
                              }, null, 8, ["name", "customStyle"])
                            ])) : vue.createCommentVNode("v-if", true)
                          ],
                          64
                          /* STABLE_FRAGMENT */
                        )),
                        _ctx.$slots.content ? vue.renderSlot(_ctx.$slots, "content", {
                          key: 2,
                          item,
                          keyName: _ctx.keyName,
                          index: index2
                        }, void 0, true) : !_ctx.$slots.content && (_ctx.$slots.default || _ctx.$slots.$default) ? vue.renderSlot(_ctx.$slots, "default", {
                          key: 3,
                          item,
                          keyName: _ctx.keyName,
                          index: index2
                        }, void 0, true) : (vue.openBlock(), vue.createElementBlock(
                          "text",
                          {
                            key: 4,
                            class: vue.normalizeClass([[item.disabled && "u-tabs__wrapper__nav__item__text--disabled"], "u-tabs__wrapper__nav__item__text"]),
                            style: vue.normalizeStyle([$options.textStyle(index2)])
                          },
                          vue.toDisplayString(item[_ctx.keyName]),
                          7
                          /* TEXT, CLASS, STYLE */
                        )),
                        vue.createVNode(_component_u_badge, {
                          show: !!(item.badge && (item.badge.show || item.badge.isDot || item.badge.value)),
                          isDot: item.badge && item.badge.isDot || $options.propsBadge.isDot,
                          value: item.badge && item.badge.value || $options.propsBadge.value,
                          max: item.badge && item.badge.max || $options.propsBadge.max,
                          type: item.badge && item.badge.type || $options.propsBadge.type,
                          showZero: item.badge && item.badge.showZero || $options.propsBadge.showZero,
                          bgColor: item.badge && item.badge.bgColor || $options.propsBadge.bgColor,
                          color: item.badge && item.badge.color || $options.propsBadge.color,
                          shape: item.badge && item.badge.shape || $options.propsBadge.shape,
                          numberType: item.badge && item.badge.numberType || $options.propsBadge.numberType,
                          inverted: item.badge && item.badge.inverted || $options.propsBadge.inverted,
                          customStyle: "margin-left: 4px;"
                        }, null, 8, ["show", "isDot", "value", "max", "type", "showZero", "bgColor", "color", "shape", "numberType", "inverted"]),
                        _ctx.shapeMode === "card" && $data.innerCurrent == index2 && index2 < $data.tabList.length - 1 ? (vue.openBlock(), vue.createElementBlock("view", {
                          key: 5,
                          class: "u-tabs__wrapper__nav__item__card-corner"
                        })) : vue.createCommentVNode("v-if", true),
                        _ctx.shapeMode === "pill-arrow" && $data.innerCurrent == index2 ? (vue.openBlock(), vue.createElementBlock("view", {
                          key: 6,
                          class: "u-tabs__wrapper__nav__item__active-arrow"
                        })) : vue.createCommentVNode("v-if", true)
                      ], 46, ["onClick", "onLongpress"]);
                    }),
                    128
                    /* KEYED_FRAGMENT */
                  )),
                  vue.createElementVNode(
                    "view",
                    {
                      class: "u-tabs__wrapper__nav__line",
                      ref: "u-tabs__wrapper__nav__line",
                      style: vue.normalizeStyle([{
                        width: $options.addUnit(_ctx.lineWidth),
                        transform: `translate(${$data.lineOffsetLeft}px)`,
                        transitionDuration: `${_ctx.duration}ms`,
                        height: $options.addUnit(_ctx.lineHeight),
                        background: _ctx.lineColor,
                        backgroundSize: _ctx.lineBgSize,
                        display: $options.showLine ? "block" : "none"
                      }])
                    },
                    null,
                    4
                    /* STYLE */
                  )
                ],
                512
                /* NEED_PATCH */
              )
            ], 8, ["scroll-x", "scroll-left"])
          ]),
          vue.renderSlot(_ctx.$slots, "right", {}, void 0, true)
        ])
      ],
      2
      /* CLASS */
    );
  }
  const __easycom_0$1 = /* @__PURE__ */ _export_sfc(_sfc_main$y, [["render", _sfc_render$x], ["__scopeId", "data-v-0546c3e4"], ["__file", "F:/项目文件/uniapp版本/node_modules/uview-plus/components/u-tabs/u-tabs.vue"]]);
  const LineDefaultProps = {
    // line组件
    line: {
      color: "#d6d7d9",
      length: "100%",
      direction: "row",
      hairline: true,
      margin: 0,
      dashed: false
    }
  };
  const defProps$2 = registerComponentProps(LineDefaultProps);
  const props$2 = defineMixin({
    props: {
      color: {
        type: String,
        default: () => defProps$2.line.color
      },
      // 长度，竖向时表现为高度，横向时表现为长度，可以为百分比，带px单位的值等
      length: {
        type: [String, Number],
        default: () => defProps$2.line.length
      },
      // 线条方向，col-竖向，row-横向
      direction: {
        type: String,
        default: () => defProps$2.line.direction
      },
      // 是否显示细边框
      hairline: {
        type: Boolean,
        default: () => defProps$2.line.hairline
      },
      // 线条与上下左右元素的间距，字符串形式，如"30px"、"20px 30px"
      margin: {
        type: [String, Number],
        default: () => defProps$2.line.margin
      },
      // 是否虚线，true-虚线，false-实线
      dashed: {
        type: Boolean,
        default: () => defProps$2.line.dashed
      }
    }
  });
  const _sfc_main$x = {
    name: "u-line",
    mixins: [mpMixin, mixin, props$2],
    computed: {
      lineStyle() {
        const style = {};
        style.margin = this.margin;
        if (this.direction === "row") {
          style.borderBottomWidth = "1px";
          style.borderBottomStyle = this.dashed ? "dashed" : "solid";
          style.width = addUnit(this.length);
          if (this.hairline)
            style.transform = "scaleY(0.5)";
        } else {
          style.borderLeftWidth = "1px";
          style.borderLeftStyle = this.dashed ? "dashed" : "solid";
          style.height = addUnit(this.length);
          if (this.hairline)
            style.transform = "scaleX(0.5)";
        }
        style.borderColor = this.color;
        return deepMerge(style, addStyle(this.customStyle));
      }
    }
  };
  function _sfc_render$w(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock(
      "view",
      {
        class: "u-line",
        style: vue.normalizeStyle([$options.lineStyle])
      },
      null,
      4
      /* STYLE */
    );
  }
  const __easycom_0 = /* @__PURE__ */ _export_sfc(_sfc_main$x, [["render", _sfc_render$w], ["__scopeId", "data-v-bbd9963c"], ["__file", "F:/项目文件/uniapp版本/node_modules/uview-plus/components/u-line/u-line.vue"]]);
  const {
    color
  } = config;
  const LoadingIconDefaultProps = {
    // loading-icon加载中图标组件
    loadingIcon: {
      show: true,
      color: color["u-tips-color"],
      textColor: color["u-tips-color"],
      vertical: false,
      mode: "spinner",
      size: 24,
      textSize: 15,
      text: "",
      timingFunction: "ease-in-out",
      duration: 1200,
      inactiveColor: ""
    }
  };
  const defProps$1 = registerComponentProps(LoadingIconDefaultProps);
  const props$1 = defineMixin({
    props: {
      // 是否显示组件
      show: {
        type: Boolean,
        default: () => defProps$1.loadingIcon.show
      },
      // 颜色
      color: {
        type: String,
        default: () => defProps$1.loadingIcon.color
      },
      // 提示文字颜色
      textColor: {
        type: String,
        default: () => defProps$1.loadingIcon.textColor
      },
      // 文字和图标是否垂直排列
      vertical: {
        type: Boolean,
        default: () => defProps$1.loadingIcon.vertical
      },
      // 模式选择，circle-圆形，spinner-花朵形，semicircle-半圆形
      mode: {
        type: String,
        default: () => defProps$1.loadingIcon.mode
      },
      // 图标大小，单位默认px
      size: {
        type: [String, Number],
        default: () => defProps$1.loadingIcon.size
      },
      // 文字大小
      textSize: {
        type: [String, Number],
        default: () => defProps$1.loadingIcon.textSize
      },
      // 文字内容
      text: {
        type: [String, Number],
        default: () => defProps$1.loadingIcon.text
      },
      // 动画模式
      timingFunction: {
        type: String,
        default: () => defProps$1.loadingIcon.timingFunction
      },
      // 动画执行周期时间
      duration: {
        type: [String, Number],
        default: () => defProps$1.loadingIcon.duration
      },
      // mode=circle时的暗边颜色
      inactiveColor: {
        type: String,
        default: () => defProps$1.loadingIcon.inactiveColor
      }
    }
  });
  function colorGradient(startColor = "rgb(0, 0, 0)", endColor = "rgb(255, 255, 255)", step = 10) {
    const startRGB = hexToRgb(startColor, false);
    const startR = startRGB[0];
    const startG = startRGB[1];
    const startB = startRGB[2];
    const endRGB = hexToRgb(endColor, false);
    const endR = endRGB[0];
    const endG = endRGB[1];
    const endB = endRGB[2];
    const sR = (endR - startR) / step;
    const sG = (endG - startG) / step;
    const sB = (endB - startB) / step;
    const colorArr = [];
    for (let i = 0; i < step; i++) {
      let hex = rgbToHex(`rgb(${Math.round(sR * i + startR)},${Math.round(sG * i + startG)},${Math.round(sB * i + startB)})`);
      if (i === 0)
        hex = rgbToHex(startColor);
      if (i === step - 1)
        hex = rgbToHex(endColor);
      colorArr.push(hex);
    }
    return colorArr;
  }
  function hexToRgb(sColor, str = true) {
    const reg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/;
    sColor = String(sColor).toLowerCase();
    if (sColor && reg.test(sColor)) {
      if (sColor.length === 4) {
        let sColorNew = "#";
        for (let i = 1; i < 4; i += 1) {
          sColorNew += sColor.slice(i, i + 1).concat(sColor.slice(i, i + 1));
        }
        sColor = sColorNew;
      }
      const sColorChange = [];
      for (let i = 1; i < 7; i += 2) {
        sColorChange.push(parseInt(`0x${sColor.slice(i, i + 2)}`));
      }
      if (!str) {
        return sColorChange;
      }
      return `rgb(${sColorChange[0]},${sColorChange[1]},${sColorChange[2]})`;
    }
    if (/^(rgb|RGB)/.test(sColor)) {
      const arr = sColor.replace(/(?:\(|\)|rgb|RGB)*/g, "").split(",");
      return arr.map((val) => Number(val));
    }
    return sColor;
  }
  function rgbToHex(rgb) {
    const _this = rgb;
    const reg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/;
    if (/^(rgb|RGB)/.test(_this)) {
      const aColor = _this.replace(/(?:\(|\)|rgb|RGB)*/g, "").split(",");
      let strHex = "#";
      for (let i = 0; i < aColor.length; i++) {
        let hex = Number(aColor[i]).toString(16);
        hex = String(hex).length == 1 ? `${0}${hex}` : hex;
        if (hex === "0") {
          hex += hex;
        }
        strHex += hex;
      }
      if (strHex.length !== 7) {
        strHex = _this;
      }
      return strHex;
    }
    if (reg.test(_this)) {
      const aNum = _this.replace(/#/, "").split("");
      if (aNum.length === 6) {
        return _this;
      }
      if (aNum.length === 3) {
        let numHex = "#";
        for (let i = 0; i < aNum.length; i += 1) {
          numHex += aNum[i] + aNum[i];
        }
        return numHex;
      }
    } else {
      return _this;
    }
  }
  function colorToRgba(color2, alpha) {
    color2 = rgbToHex(color2);
    const reg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/;
    let sColor = String(color2).toLowerCase();
    if (sColor && reg.test(sColor)) {
      if (sColor.length === 4) {
        let sColorNew = "#";
        for (let i = 1; i < 4; i += 1) {
          sColorNew += sColor.slice(i, i + 1).concat(sColor.slice(i, i + 1));
        }
        sColor = sColorNew;
      }
      const sColorChange = [];
      for (let i = 1; i < 7; i += 2) {
        sColorChange.push(parseInt(`0x${sColor.slice(i, i + 2)}`));
      }
      return `rgba(${sColorChange.join(",")},${alpha})`;
    }
    return sColor;
  }
  const colorGradient$1 = {
    colorGradient,
    hexToRgb,
    rgbToHex,
    colorToRgba
  };
  const _sfc_main$w = {
    name: "u-loading-icon",
    mixins: [mpMixin, mixin, props$1],
    data() {
      return {
        // Array.form可以通过一个伪数组对象创建指定长度的数组
        // https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/from
        array12: Array.from({
          length: 12
        }),
        // 这里需要设置默认值为360，否则在安卓nvue上，会延迟一个duration周期后才执行
        // 在iOS nvue上，则会一开始默认执行两个周期的动画
        aniAngel: 360,
        // 动画旋转角度
        webviewHide: false,
        // 监听webview的状态，如果隐藏了页面，则停止动画，以免性能消耗
        loading: false
        // 是否运行中，针对nvue使用
      };
    },
    computed: {
      // 当为circle类型时，给其另外三边设置一个更轻一些的颜色
      // 之所以需要这么做的原因是，比如父组件传了color为红色，那么需要另外的三个边为浅红色
      // 而不能是固定的某一个其他颜色(因为这个固定的颜色可能浅蓝，导致效果没有那么细腻良好)
      otherBorderColor() {
        const lightColor = colorGradient(this.color, "#ffffff", 100)[80];
        if (this.mode === "circle") {
          return this.inactiveColor ? this.inactiveColor : lightColor;
        } else {
          return "transparent";
        }
      }
    },
    watch: {
      show(n) {
      }
    },
    mounted() {
      this.init();
    },
    methods: {
      addUnit,
      addStyle,
      init() {
        setTimeout(() => {
          this.show && this.addEventListenerToWebview();
        }, 20);
      },
      // 监听webview的显示与隐藏
      addEventListenerToWebview() {
        const pages2 = getCurrentPages();
        const page2 = pages2[pages2.length - 1];
        const currentWebview = page2.$getAppWebview();
        currentWebview.addEventListener("hide", () => {
          this.webviewHide = true;
        });
        currentWebview.addEventListener("show", () => {
          this.webviewHide = false;
        });
      }
    }
  };
  function _sfc_render$v(_ctx, _cache, $props, $setup, $data, $options) {
    return _ctx.show ? (vue.openBlock(), vue.createElementBlock(
      "view",
      {
        key: 0,
        class: vue.normalizeClass(["u-loading-icon", [_ctx.vertical && "u-loading-icon--vertical"]]),
        style: vue.normalizeStyle([$options.addStyle(_ctx.customStyle)])
      },
      [
        !$data.webviewHide ? (vue.openBlock(), vue.createElementBlock(
          "view",
          {
            key: 0,
            class: vue.normalizeClass(["u-loading-icon__spinner", [`u-loading-icon__spinner--${_ctx.mode}`]]),
            ref: "ani",
            style: vue.normalizeStyle({
              color: _ctx.color,
              width: $options.addUnit(_ctx.size),
              height: $options.addUnit(_ctx.size),
              borderTopColor: _ctx.color,
              borderBottomColor: $options.otherBorderColor,
              borderLeftColor: $options.otherBorderColor,
              borderRightColor: $options.otherBorderColor,
              "animation-duration": `${_ctx.duration}ms`,
              "animation-timing-function": _ctx.mode === "semicircle" || _ctx.mode === "circle" ? _ctx.timingFunction : ""
            })
          },
          [
            _ctx.mode === "spinner" ? (vue.openBlock(true), vue.createElementBlock(
              vue.Fragment,
              { key: 0 },
              vue.renderList($data.array12, (item, index2) => {
                return vue.openBlock(), vue.createElementBlock("view", {
                  key: index2,
                  class: "u-loading-icon__dot"
                });
              }),
              128
              /* KEYED_FRAGMENT */
            )) : vue.createCommentVNode("v-if", true)
          ],
          6
          /* CLASS, STYLE */
        )) : vue.createCommentVNode("v-if", true),
        _ctx.text ? (vue.openBlock(), vue.createElementBlock(
          "text",
          {
            key: 1,
            class: "u-loading-icon__text",
            style: vue.normalizeStyle({
              fontSize: $options.addUnit(_ctx.textSize),
              color: _ctx.textColor
            })
          },
          vue.toDisplayString(_ctx.text),
          5
          /* TEXT, STYLE */
        )) : vue.createCommentVNode("v-if", true)
      ],
      6
      /* CLASS, STYLE */
    )) : vue.createCommentVNode("v-if", true);
  }
  const __easycom_1$1 = /* @__PURE__ */ _export_sfc(_sfc_main$w, [["render", _sfc_render$v], ["__scopeId", "data-v-00752c6d"], ["__file", "F:/项目文件/uniapp版本/node_modules/uview-plus/components/u-loading-icon/u-loading-icon.vue"]]);
  const zhHans = {
    "up.common.cancel": "取消",
    "up.common.confirm": "确定",
    "up.common.start": "开始",
    "up.common.end": "结束",
    "up.common.stop": "停止",
    "up.common.copy": "复制",
    "up.common.none": "暂无",
    "up.common.tip": "提示",
    "up.common.success": "成功",
    "up.common.fail": "失败",
    "up.common.close": "关闭",
    "up.common.preview": "预览",
    "up.common.re-select": "重选",
    "up.common.rotate": "旋转",
    "up.common.pleaseChoose": "请选择",
    "up.common.loading": "加载中",
    "up.common.loading2": "正在加载",
    "up.common.inOperation": "操作中",
    "up.common.settings": "设置",
    "up.common.retry": "重试",
    "up.common.search": "搜索",
    "up.common.more": "更多",
    "up.common.video": "视频",
    "up.common.file": "文件",
    "up.week.one": "一",
    "up.week.two": "二",
    "up.week.three": "三",
    "up.week.four": "四",
    "up.week.five": "五",
    "up.week.six": "六",
    "up.week.seven": "日",
    "up.barcode.error": "生成条码失败",
    "up.calendar.chooseDates": "日期选择",
    "up.calendar.disabled": "该日期已禁用",
    "up.calendar.daysExceed": "选择天数不能超过{days}天",
    "up.calendar.today": "今天",
    "up.cityLocate.locateCity": "定位城市",
    "up.cityLocate.fail": "定位失败，请点击重试。",
    "up.cityLocate.locating": "定位中",
    "up.code.send": "获取验证码",
    "up.code.resendAfter": "X秒重新获取",
    "up.code.resend": "重新获取",
    "up.cropper.emptyWidhtOrHeight": "裁剪框的宽或高没有设置",
    "up.empty.car": "购物车为空",
    "up.empty.page": "页面不存在",
    "up.empty.search": "没有搜索结果",
    "up.empty.address": "没有收货地址",
    "up.empty.wifi": "没有WiFi",
    "up.empty.order": "订单为空",
    "up.empty.coupon": "没有优惠券",
    "up.empty.favor": "暂无收藏",
    "up.empty.permission": "无权限",
    "up.empty.history": "无历史记录",
    "up.empty.news": "无新闻列表",
    "up.empty.message": "消息列表为空",
    "up.empty.list": "列表为空",
    "up.empty.data": "数据为空",
    "up.empty.comment": "暂无评论",
    "up.link.copyed": "链接已复制，请在浏览器打开",
    "up.loadmoe.loadmore": "加载更多",
    "up.loadmoe.nomore": "没有更多了",
    "up.noNetwork.text": "哎呀，网络信号丢失",
    "up.noNetwork.pleaseCheck": "请检查网络，或前往",
    "up.noNetwork.connect": "网络已连接",
    "up.noNetwork.disconnect": "无网络连接",
    "up.pagination.previous": "上一页",
    "up.pagination.next": "下一页",
    "up.pullRefresh.pull": "下拉刷新",
    "up.pullRefresh.release": "释放刷新",
    "up.pullRefresh.refreshing": "正在刷新",
    "up.readMore.expand": "展开阅读全文",
    "up.readMore.fold": "收起",
    "up.search.placeholder": "请输入关键字",
    "up.signature.penSize": "笔画大小",
    "up.signature.penColor": "笔画颜色",
    "up.upload.sizeExceed": "超过大小限制",
    "up.upload.uploading": "上传中",
    "up.upload.previewImageFail": "预览图片失败",
    "up.upload.previewVideoFail": "预览视频失败",
    "up.goodsSku.stock": "库存",
    "up.goodsSku.price": "价格",
    "up.goodsSku.amount": "件",
    "up.goodsSku.choosed": "已选",
    "up.goodsSku.buyAmount": "购买数量"
  };
  const settings = {
    lang: typeof uni !== "undefined" && typeof uni.getLocale === "function" ? uni.getLocale() : "zh-Hans",
    locales: {
      "zh-Hans": zhHans
    }
  };
  if (typeof uni !== "undefined" && typeof uni.onLocaleChange === "function") {
    uni.onLocaleChange((locale) => {
      settings.lang = typeof locale === "string" ? locale : locale && locale.locale || settings.lang;
    });
  }
  function t(value, params2 = {}) {
    if (value) {
      let lang = settings.lang;
      if (!settings.locales[settings.lang]) {
        lang = "zh-Hans";
      }
      let result = settings.locales[lang][value] || value;
      if (params2 && typeof params2 === "object") {
        Object.keys(params2).forEach((key) => {
          const reg = new RegExp(`{${key}}`, "g");
          result = String(result).replace(reg, params2[key]);
        });
      }
      return result;
    }
    return value;
  }
  const ModalDefaultProps = {
    // modal 组件
    modal: {
      show: false,
      title: "",
      content: "",
      confirmText: t("up.common.confirm"),
      cancelText: t("up.common.cancel"),
      showConfirmButton: true,
      showCancelButton: false,
      confirmColor: "#2979ff",
      cancelColor: "#606266",
      buttonReverse: false,
      zoom: true,
      asyncClose: false,
      closeOnClickOverlay: false,
      negativeTop: 0,
      width: "650rpx",
      confirmButtonShape: "",
      duration: 400,
      contentTextAlign: "left",
      asyncCloseTip: t("up.common.inOperation") + "...",
      asyncCancelClose: false,
      contentStyle: {}
    }
  };
  const defProps = registerComponentProps(ModalDefaultProps);
  const props = defineMixin({
    props: {
      // 是否展示modal
      show: {
        type: Boolean,
        default: () => defProps.modal.show
      },
      // 标题
      title: {
        type: [String],
        default: () => defProps.modal.title
      },
      // 弹窗内容
      content: {
        type: String,
        default: () => defProps.modal.content
      },
      // 确认文案
      confirmText: {
        type: String,
        default: () => defProps.modal.confirmText
      },
      // 取消文案
      cancelText: {
        type: String,
        default: () => defProps.modal.cancelText
      },
      // 是否显示确认按钮
      showConfirmButton: {
        type: Boolean,
        default: () => defProps.modal.showConfirmButton
      },
      // 是否显示取消按钮
      showCancelButton: {
        type: Boolean,
        default: () => defProps.modal.showCancelButton
      },
      // 确认按钮颜色
      confirmColor: {
        type: String,
        default: () => defProps.modal.confirmColor
      },
      // 取消文字颜色
      cancelColor: {
        type: String,
        default: () => defProps.modal.cancelColor
      },
      // 对调确认和取消的位置
      buttonReverse: {
        type: Boolean,
        default: () => defProps.modal.buttonReverse
      },
      // 是否开启缩放效果
      zoom: {
        type: Boolean,
        default: () => defProps.modal.zoom
      },
      // 是否异步关闭，只对确定按钮有效
      asyncClose: {
        type: Boolean,
        default: () => defProps.modal.asyncClose
      },
      // 是否允许点击遮罩关闭modal
      closeOnClickOverlay: {
        type: Boolean,
        default: () => defProps.modal.closeOnClickOverlay
      },
      // 给一个负的margin-top，往上偏移，避免和键盘重合的情况
      negativeTop: {
        type: [String, Number],
        default: () => defProps.modal.negativeTop
      },
      // modal宽度，不支持百分比，可以数值，px，rpx单位
      width: {
        type: [String, Number],
        default: () => defProps.modal.width
      },
      // 确认按钮的样式，circle-圆形，square-方形，如设置，将不会显示取消按钮
      confirmButtonShape: {
        type: String,
        default: () => defProps.modal.confirmButtonShape
      },
      // 弹窗动画过度时间
      duration: {
        type: [Number],
        default: defProps.modal.duration
      },
      // 文案对齐方式
      contentTextAlign: {
        type: String,
        default: () => defProps.modal.contentTextAlign
      },
      // 异步确定时如果点击了取消时候的提示文案
      asyncCloseTip: {
        type: String,
        default: () => defProps.modal.asyncCloseTip
      },
      // 是否异步关闭，只对取消按钮有效
      asyncCancelClose: {
        type: Boolean,
        default: () => defProps.modal.asyncCancelClose
      },
      // 内容样式
      contentStyle: {
        type: Object,
        default: () => defProps.modal.contentStyle
      }
    }
  });
  const _sfc_main$v = {
    name: "u-modal",
    mixins: [mpMixin, mixin, props],
    data() {
      return {
        loading: false
      };
    },
    watch: {
      show(n) {
        if (n && this.loading)
          this.loading = false;
      }
    },
    emits: ["confirm", "cancel", "close", "update:show", "cancelOnAsync"],
    computed: {
      contentStyleCpu() {
        let style = this.contentStyle;
        style.paddingTop = `${this.title ? 12 : 25}px`;
        return style;
      }
    },
    methods: {
      addUnit,
      // 点击确定按钮
      confirmHandler() {
        if (this.asyncClose) {
          this.loading = true;
        } else {
          this.$emit("update:show", false);
        }
        this.$emit("confirm");
      },
      // 点击取消按钮
      cancelHandler() {
        if (this.asyncClose && this.loading) {
          if (this.asyncCloseTip) {
            uni.showToast({
              title: this.asyncCloseTip,
              icon: "none"
            });
          }
          this.$emit("cancelOnAsync");
        } else {
          if (!this.asyncCancelClose) {
            this.$emit("update:show", false);
          }
        }
        this.$emit("cancel");
      },
      // 点击遮罩
      // 从原理上来说，modal的遮罩点击，并不是真的点击到了遮罩
      // 因为modal依赖于popup的中部弹窗类型，中部弹窗比较特殊，虽有然遮罩，但是为了让弹窗内容能flex居中
      // 多了一个透明的遮罩，此透明的遮罩会覆盖在灰色的遮罩上，所以实际上是点击不到灰色遮罩的，popup内部在
      // 透明遮罩的子元素做了.stop处理，所以点击内容区，也不会导致误触发
      clickHandler() {
        if (this.closeOnClickOverlay) {
          this.$emit("update:show", false);
          this.$emit("close");
        }
      }
    }
  };
  function _sfc_render$u(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_u_line = resolveEasycom(vue.resolveDynamicComponent("u-line"), __easycom_0);
    const _component_u_loading_icon = resolveEasycom(vue.resolveDynamicComponent("u-loading-icon"), __easycom_1$1);
    const _component_u_popup = resolveEasycom(vue.resolveDynamicComponent("u-popup"), __easycom_0$2);
    return vue.openBlock(), vue.createBlock(_component_u_popup, {
      mode: "center",
      zoom: _ctx.zoom,
      show: _ctx.show,
      class: vue.normalizeClass([_ctx.customClass]),
      customStyle: {
        borderRadius: "6px",
        overflow: "hidden",
        marginTop: `-${$options.addUnit(_ctx.negativeTop)}`
      },
      closeOnClickOverlay: _ctx.closeOnClickOverlay,
      safeAreaInsetBottom: false,
      duration: _ctx.duration,
      onClick: $options.clickHandler
    }, {
      bottom: vue.withCtx(() => [
        vue.renderSlot(_ctx.$slots, "popupBottom", {}, void 0, true)
      ]),
      default: vue.withCtx(() => [
        vue.createElementVNode(
          "view",
          {
            class: "u-modal",
            style: vue.normalizeStyle({
              width: $options.addUnit(_ctx.width)
            })
          },
          [
            _ctx.title ? (vue.openBlock(), vue.createElementBlock(
              "view",
              {
                key: 0,
                class: "u-modal__title"
              },
              vue.toDisplayString(_ctx.title),
              1
              /* TEXT */
            )) : vue.createCommentVNode("v-if", true),
            vue.createElementVNode(
              "view",
              {
                class: "u-modal__content",
                style: vue.normalizeStyle($options.contentStyleCpu)
              },
              [
                vue.renderSlot(_ctx.$slots, "default", {}, () => [
                  vue.createElementVNode(
                    "text",
                    {
                      class: "u-modal__content__text",
                      style: vue.normalizeStyle({ textAlign: _ctx.contentTextAlign })
                    },
                    vue.toDisplayString(_ctx.content),
                    5
                    /* TEXT, STYLE */
                  )
                ], true)
              ],
              4
              /* STYLE */
            ),
            _ctx.$slots.confirmButton ? (vue.openBlock(), vue.createElementBlock("view", {
              key: 1,
              class: "u-modal__button-group--confirm-button"
            }, [
              vue.renderSlot(_ctx.$slots, "confirmButton", {}, void 0, true)
            ])) : (vue.openBlock(), vue.createElementBlock(
              vue.Fragment,
              { key: 2 },
              [
                vue.createVNode(_component_u_line),
                vue.createElementVNode(
                  "view",
                  {
                    class: "u-modal__button-group",
                    style: vue.normalizeStyle({
                      flexDirection: _ctx.buttonReverse ? "row-reverse" : "row"
                    })
                  },
                  [
                    _ctx.showCancelButton ? (vue.openBlock(), vue.createElementBlock(
                      "view",
                      {
                        key: 0,
                        class: vue.normalizeClass(["u-modal__button-group__wrapper u-modal__button-group__wrapper--cancel", [_ctx.showCancelButton && !_ctx.showConfirmButton && "u-modal__button-group__wrapper--only-cancel"]]),
                        "hover-stay-time": 150,
                        "hover-class": "u-modal__button-group__wrapper--hover",
                        onClick: _cache[0] || (_cache[0] = (...args) => $options.cancelHandler && $options.cancelHandler(...args))
                      },
                      [
                        vue.createElementVNode(
                          "text",
                          {
                            class: "u-modal__button-group__wrapper__text",
                            style: vue.normalizeStyle({
                              color: _ctx.cancelColor
                            })
                          },
                          vue.toDisplayString(_ctx.cancelText),
                          5
                          /* TEXT, STYLE */
                        )
                      ],
                      2
                      /* CLASS */
                    )) : vue.createCommentVNode("v-if", true),
                    _ctx.showConfirmButton && _ctx.showCancelButton ? (vue.openBlock(), vue.createBlock(_component_u_line, {
                      key: 1,
                      direction: "column"
                    })) : vue.createCommentVNode("v-if", true),
                    _ctx.showConfirmButton ? (vue.openBlock(), vue.createElementBlock(
                      "view",
                      {
                        key: 2,
                        class: vue.normalizeClass(["u-modal__button-group__wrapper u-modal__button-group__wrapper--confirm", [!_ctx.showCancelButton && _ctx.showConfirmButton && "u-modal__button-group__wrapper--only-confirm"]]),
                        "hover-stay-time": 150,
                        "hover-class": "u-modal__button-group__wrapper--hover",
                        onClick: _cache[1] || (_cache[1] = (...args) => $options.confirmHandler && $options.confirmHandler(...args))
                      },
                      [
                        $data.loading ? (vue.openBlock(), vue.createBlock(_component_u_loading_icon, { key: 0 })) : (vue.openBlock(), vue.createElementBlock(
                          "text",
                          {
                            key: 1,
                            class: "u-modal__button-group__wrapper__text",
                            style: vue.normalizeStyle({
                              color: _ctx.confirmColor
                            })
                          },
                          vue.toDisplayString(_ctx.confirmText),
                          5
                          /* TEXT, STYLE */
                        ))
                      ],
                      2
                      /* CLASS */
                    )) : vue.createCommentVNode("v-if", true)
                  ],
                  4
                  /* STYLE */
                )
              ],
              64
              /* STABLE_FRAGMENT */
            ))
          ],
          4
          /* STYLE */
        )
      ]),
      _: 3
      /* FORWARDED */
    }, 8, ["zoom", "show", "class", "customStyle", "closeOnClickOverlay", "duration", "onClick"]);
  }
  const __easycom_1 = /* @__PURE__ */ _export_sfc(_sfc_main$v, [["render", _sfc_render$u], ["__scopeId", "data-v-12b77a26"], ["__file", "F:/项目文件/uniapp版本/node_modules/uview-plus/components/u-modal/u-modal.vue"]]);
  var zhCn = { exports: {} };
  (function(module, exports) {
    !function(e, _) {
      module.exports = _(dayjs_minExports);
    }(commonjsGlobal, function(e) {
      function _(e2) {
        return e2 && "object" == typeof e2 && "default" in e2 ? e2 : { default: e2 };
      }
      var t2 = _(e), d = { name: "zh-cn", weekdays: "星期日_星期一_星期二_星期三_星期四_星期五_星期六".split("_"), weekdaysShort: "周日_周一_周二_周三_周四_周五_周六".split("_"), weekdaysMin: "日_一_二_三_四_五_六".split("_"), months: "一月_二月_三月_四月_五月_六月_七月_八月_九月_十月_十一月_十二月".split("_"), monthsShort: "1月_2月_3月_4月_5月_6月_7月_8月_9月_10月_11月_12月".split("_"), ordinal: function(e2, _2) {
        return "W" === _2 ? e2 + "周" : e2 + "日";
      }, weekStart: 1, yearStart: 4, formats: { LT: "HH:mm", LTS: "HH:mm:ss", L: "YYYY/MM/DD", LL: "YYYY年M月D日", LLL: "YYYY年M月D日Ah点mm分", LLLL: "YYYY年M月D日ddddAh点mm分", l: "YYYY/M/D", ll: "YYYY年M月D日", lll: "YYYY年M月D日 HH:mm", llll: "YYYY年M月D日dddd HH:mm" }, relativeTime: { future: "%s内", past: "%s前", s: "几秒", m: "1 分钟", mm: "%d 分钟", h: "1 小时", hh: "%d 小时", d: "1 天", dd: "%d 天", M: "1 个月", MM: "%d 个月", y: "1 年", yy: "%d 年" }, meridiem: function(e2, _2) {
        var t3 = 100 * e2 + _2;
        return t3 < 600 ? "凌晨" : t3 < 900 ? "早上" : t3 < 1100 ? "上午" : t3 < 1300 ? "中午" : t3 < 1800 ? "下午" : "晚上";
      } };
      return t2.default.locale(d, null, true), d;
    });
  })(zhCn);
  dayjs.locale("zh-cn");
  function formatTime(date2, fmt = "YYYY-MM-DD HH:mm:ss") {
    if (!date2)
      return "";
    return dayjs(typeof date2 === "number" && date2 < 1e12 ? date2 * 1e3 : date2).format(fmt);
  }
  function msToMMSS(ms) {
    const totalSec = Math.floor(ms / 1e3);
    const m = String(Math.floor(totalSec / 60)).padStart(2, "0");
    const s = String(totalSec % 60).padStart(2, "0");
    return `${m}:${s}`;
  }
  const DB_NAME = config$1.dbName;
  const DB_PATH = "_doc/statistics.db";
  const CREATE_SQL = [
    `CREATE TABLE IF NOT EXISTS member (
    team_member_id TEXT PRIMARY KEY,
    game_id TEXT,
    type INTEGER,
    name TEXT,
    number INTEGER,
    startingLineup INTEGER,
    playing INTEGER
  )`,
    `CREATE TABLE IF NOT EXISTS game_section (
    section_id TEXT PRIMARY KEY,
    game_id TEXT,
    type INTEGER,
    name TEXT,
    sort INTEGER,
    groups TEXT,
    isStart INTEGER,
    isEnd INTEGER
  )`,
    `CREATE TABLE IF NOT EXISTS game_time (
    game_id TEXT PRIMARY KEY,
    begintime INTEGER,
    stoptime INTEGER,
    isStop INTEGER
  )`,
    `CREATE TABLE IF NOT EXISTS technical_record (
    record_number INTEGER PRIMARY KEY,
    elapsed_time INTEGER,
    statistics_section_id TEXT,
    type INTEGER,
    statistics_member_id TEXT,
    description TEXT,
    game_id TEXT,
    team_type INTEGER,
    team_name TEXT,
    "add" INTEGER,
    "delete" INTEGER,
    is_need_upload INTEGER,
    disable INTEGER
  )`
  ];
  let opened = false;
  function initDB() {
    if (opened)
      return Promise.resolve();
    return new Promise((resolve, reject) => {
      plus.sqlite.openDatabase({
        name: DB_NAME,
        path: DB_PATH,
        success: (e) => {
          opened = true;
          let chain = Promise.resolve();
          CREATE_SQL.forEach((sql) => {
            chain = chain.then(() => executeSQL(sql));
          });
          chain.then(resolve).catch(reject);
        },
        fail: (e) => {
          formatAppLog("error", "at utils/db.js:81", "打开数据库失败", e);
          reject(e);
        }
      });
    });
  }
  function executeSQL(sql) {
    return new Promise((resolve, reject) => {
      plus.sqlite.executeSql({
        name: DB_NAME,
        sql,
        success: (e) => resolve(e),
        fail: (e) => {
          formatAppLog("error", "at utils/db.js:101", "executeSQL 失败", sql, e);
          reject(e);
        }
      });
    });
  }
  function selectSQL(sql) {
    return new Promise((resolve, reject) => {
      plus.sqlite.selectSql({
        name: DB_NAME,
        sql,
        success: (e) => resolve(e || []),
        fail: (e) => {
          formatAppLog("error", "at utils/db.js:121", "selectSQL 失败", sql, e);
          reject(e);
        }
      });
    });
  }
  function insertOrReplace(table, obj) {
    const keys = Object.keys(obj);
    const placeholders = keys.map(() => "?").join(",");
    const values = keys.map((k) => obj[k]);
    `INSERT OR REPLACE INTO ${table} (${keys.join(",")}) VALUES (${placeholders})`;
    const safeSql = `INSERT OR REPLACE INTO ${table} (${keys.join(",")}) VALUES (${values.map(sqlValue).join(",")})`;
    return executeSQL(safeSql);
  }
  function queryList(table, where = "", order = "") {
    let sql = `SELECT * FROM ${table}`;
    if (where)
      sql += ` WHERE ${where}`;
    if (order)
      sql += ` ORDER BY ${order}`;
    return selectSQL(sql);
  }
  function deleteWhere(table, where) {
    return executeSQL(`DELETE FROM ${table} WHERE ${where}`);
  }
  function countWhere(table, where = "") {
    return selectSQL(`SELECT COUNT(*) as c FROM ${table}${where ? ` WHERE ${where}` : ""}`).then((res) => res[0] ? res[0].c : 0);
  }
  function sqlValue(v) {
    if (v === null || v === void 0)
      return "NULL";
    if (typeof v === "number")
      return String(v);
    if (typeof v === "boolean")
      return v ? "1" : "0";
    return `'${String(v).replace(/'/g, "''")}'`;
  }
  const _sfc_main$u = {
    __name: "game-status-dialog",
    props: {
      show: { type: Boolean, default: false }
    },
    emits: ["select", "close"],
    setup(__props, { expose: __expose, emit: __emit }) {
      __expose();
      const emit2 = __emit;
      function onSelect(value, desc) {
        emit2("select", { value, desc });
        close();
      }
      function close() {
        emit2("close");
      }
      const __returned__ = { emit: emit2, onSelect, close };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$t(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_u_popup = resolveEasycom(vue.resolveDynamicComponent("u-popup"), __easycom_0$2);
    return vue.openBlock(), vue.createBlock(_component_u_popup, {
      show: $props.show,
      mode: "bottom",
      round: 20,
      onClose: $setup.close
    }, {
      default: vue.withCtx(() => [
        vue.createElementVNode("view", { class: "status-dialog" }, [
          vue.createElementVNode("view", {
            class: "item",
            onClick: _cache[0] || (_cache[0] = ($event) => $setup.onSelect(0, "未开始"))
          }, "未开始"),
          vue.createElementVNode("view", {
            class: "item",
            onClick: _cache[1] || (_cache[1] = ($event) => $setup.onSelect(1, "进行中"))
          }, "进行中"),
          vue.createElementVNode("view", {
            class: "item",
            onClick: _cache[2] || (_cache[2] = ($event) => $setup.onSelect(2, "已结束"))
          }, "已结束"),
          vue.createElementVNode("view", {
            class: "cancel",
            onClick: $setup.close
          }, "取消")
        ])
      ]),
      _: 1
      /* STABLE */
    }, 8, ["show"]);
  }
  const gameStatusDialog = /* @__PURE__ */ _export_sfc(_sfc_main$u, [["render", _sfc_render$t], ["__scopeId", "data-v-0fb0a458"], ["__file", "F:/项目文件/uniapp版本/components/game-status-dialog/game-status-dialog.vue"]]);
  const _sfc_main$t = {
    __name: "match-info",
    props: {
      gameId: { type: String, default: "" },
      sport: { type: String, default: "basketball" },
      hasSync: { type: Boolean, default: false }
    },
    emits: ["status-change"],
    setup(__props, { expose: __expose, emit: __emit }) {
      __expose();
      const props2 = __props;
      const emit2 = __emit;
      const dateStr = vue.ref("");
      const timeStr = vue.ref("");
      const statusDesc = vue.ref("");
      const showStatus = vue.ref(false);
      const syncing = vue.ref(false);
      const syncProgress = vue.ref(0);
      function load() {
        if (!props2.gameId)
          return;
        getGameDetail(props2.gameId, props2.sport).then((res) => {
          if (res.code !== 1)
            return;
          const page2 = res.data || {};
          const g = page2.game || page2;
          if (g && g.time) {
            dateStr.value = formatTime(g.time, "YYYY-MM-DD");
            timeStr.value = formatTime(g.time, "HH:mm");
          }
          statusDesc.value = g && g.status ? g.status.desc : "";
        });
      }
      vue.watch(() => props2.gameId, load, { immediate: true });
      function onStatus(s) {
        showStatus.value = false;
        gameStatus({ gameId: props2.gameId, status: { value: s.value, desc: s.desc } }, props2.sport).then((res) => {
          if (res.code === 1) {
            statusDesc.value = s.desc;
            emit2("status-change", s);
          } else {
            uni.showToast({ title: res.msg || "修改失败", icon: "none" });
          }
        });
      }
      function doSync() {
        if (syncing.value)
          return;
        syncing.value = true;
        syncProgress.value = 0;
        syncPage(1);
      }
      function syncPage(pageNo) {
        synchr(props2.gameId, pageNo).then((res) => {
          if (res.code !== 1) {
            syncing.value = false;
            return;
          }
          const page2 = res.data || {};
          const list = page2.list || [];
          list.forEach((item) => {
            insertOrReplace("technical_record", {
              record_number: item.recordNumber,
              elapsed_time: 0,
              statistics_section_id: item.statisticsSectionId,
              type: item.type ? item.type.value : 0,
              statistics_member_id: item.statisticsMemberId,
              description: item.description || "",
              game_id: props2.gameId,
              team_type: 0,
              team_name: item.teamName || "",
              add: 0,
              delete: 1,
              is_need_upload: 0,
              disable: 0
            });
          });
          syncProgress.value = page2.totalPage ? Math.round(pageNo / page2.totalPage * 100) : 100;
          if (page2.nextPage && pageNo < (page2.totalPage || pageNo)) {
            syncPage(pageNo + 1);
          } else {
            syncing.value = false;
            uni.showToast({ title: "同步完成", icon: "none" });
          }
        }).catch(() => {
          syncing.value = false;
        });
      }
      const __returned__ = { props: props2, emit: emit2, dateStr, timeStr, statusDesc, showStatus, syncing, syncProgress, load, onStatus, doSync, syncPage, ref: vue.ref, watch: vue.watch, get getGameDetail() {
        return getGameDetail;
      }, get gameStatus() {
        return gameStatus;
      }, get synchr() {
        return synchr;
      }, get formatTime() {
        return formatTime;
      }, get insertOrReplace() {
        return insertOrReplace;
      }, gameStatusDialog };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$s(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "match-info" }, [
      vue.createElementVNode("view", { class: "row" }, [
        vue.createElementVNode("text", { class: "label" }, "日期"),
        vue.createElementVNode(
          "text",
          { class: "value" },
          vue.toDisplayString($setup.dateStr),
          1
          /* TEXT */
        )
      ]),
      vue.createElementVNode("view", { class: "row" }, [
        vue.createElementVNode("text", { class: "label" }, "时间"),
        vue.createElementVNode(
          "text",
          { class: "value" },
          vue.toDisplayString($setup.timeStr),
          1
          /* TEXT */
        )
      ]),
      vue.createElementVNode("view", {
        class: "row",
        onClick: _cache[0] || (_cache[0] = ($event) => $setup.showStatus = true)
      }, [
        vue.createElementVNode("text", { class: "label" }, "状态"),
        vue.createElementVNode(
          "text",
          { class: "value" },
          vue.toDisplayString($setup.statusDesc) + " ▼",
          1
          /* TEXT */
        )
      ]),
      $props.hasSync ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 0,
        class: "sync-row"
      }, [
        vue.createElementVNode(
          "view",
          {
            class: vue.normalizeClass(["sync-btn", { disabled: $setup.syncing }]),
            onClick: $setup.doSync
          },
          vue.toDisplayString($setup.syncing ? "同步中…" : "同步历史数据"),
          3
          /* TEXT, CLASS */
        ),
        $setup.syncing ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 0,
          class: "progress"
        }, [
          vue.createElementVNode(
            "view",
            {
              class: "progress-bar",
              style: vue.normalizeStyle({ width: $setup.syncProgress + "%" })
            },
            null,
            4
            /* STYLE */
          )
        ])) : vue.createCommentVNode("v-if", true)
      ])) : vue.createCommentVNode("v-if", true),
      vue.createVNode($setup["gameStatusDialog"], {
        show: $setup.showStatus,
        onSelect: $setup.onStatus,
        onClose: _cache[1] || (_cache[1] = ($event) => $setup.showStatus = false)
      }, null, 8, ["show"])
    ]);
  }
  const matchInfo = /* @__PURE__ */ _export_sfc(_sfc_main$t, [["render", _sfc_render$s], ["__scopeId", "data-v-1153092f"], ["__file", "F:/项目文件/uniapp版本/components/match-info/match-info.vue"]]);
  const _sfc_main$s = {
    __name: "empty-layout",
    props: {
      status: { type: String, default: "" }
    },
    emits: ["retry"],
    setup(__props, { expose: __expose, emit: __emit }) {
      __expose();
      const emit2 = __emit;
      function onRetry() {
        emit2("retry");
      }
      const __returned__ = { emit: emit2, onRetry };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$r(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "empty-layout" }, [
      $props.status === "loading" ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 0,
        class: "state"
      }, [
        vue.createElementVNode("view", { class: "spinner" }),
        vue.createElementVNode("text", { class: "state-text" }, "加载中…")
      ])) : $props.status === "error" ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 1,
        class: "state",
        onClick: $setup.onRetry
      }, [
        vue.createElementVNode("text", { class: "state-text" }, "加载失败，点击页面重试")
      ])) : $props.status === "empty" ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 2,
        class: "state"
      }, [
        vue.createElementVNode("text", { class: "state-text" }, "暂无内容")
      ])) : $props.status === "nodata" ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 3,
        class: "state"
      }, [
        vue.createElementVNode("text", { class: "state-text" }, "暂无内容")
      ])) : vue.renderSlot(_ctx.$slots, "default", { key: 4 }, void 0, true)
    ]);
  }
  const emptyLayout = /* @__PURE__ */ _export_sfc(_sfc_main$s, [["render", _sfc_render$r], ["__scopeId", "data-v-d6c9915e"], ["__file", "F:/项目文件/uniapp版本/components/empty-layout/empty-layout.vue"]]);
  const _sfc_main$r = {
    __name: "add-member-dialog",
    props: {
      show: { type: Boolean, default: false },
      sport: { type: String, default: "basketball" }
    },
    emits: ["confirm", "close"],
    setup(__props, { expose: __expose, emit: __emit }) {
      __expose();
      const props2 = __props;
      const emit2 = __emit;
      const form = vue.reactive({ number: "", name: "", position: "" });
      vue.watch(
        () => props2.show,
        (v) => {
          if (v)
            Object.assign(form, { number: "", name: "", position: "" });
        }
      );
      function confirm() {
        if (!form.number || !form.name) {
          uni.showToast({ title: "请填写完整", icon: "none" });
          return;
        }
        emit2("confirm", { ...form });
        close();
      }
      function close() {
        emit2("close");
      }
      const __returned__ = { props: props2, emit: emit2, form, confirm, close, reactive: vue.reactive, watch: vue.watch };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$q(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_u_popup = resolveEasycom(vue.resolveDynamicComponent("u-popup"), __easycom_0$2);
    return vue.openBlock(), vue.createBlock(_component_u_popup, {
      show: $props.show,
      mode: "center",
      round: 20,
      onClose: $setup.close
    }, {
      default: vue.withCtx(() => [
        vue.createElementVNode("view", { class: "add-dialog" }, [
          vue.createElementVNode("view", { class: "title" }, "添加球员"),
          vue.withDirectives(vue.createElementVNode(
            "input",
            {
              "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => $setup.form.number = $event),
              class: "input",
              type: "number",
              placeholder: "请输入号码"
            },
            null,
            512
            /* NEED_PATCH */
          ), [
            [vue.vModelText, $setup.form.number]
          ]),
          vue.withDirectives(vue.createElementVNode(
            "input",
            {
              "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => $setup.form.name = $event),
              class: "input",
              placeholder: "请输入姓名"
            },
            null,
            512
            /* NEED_PATCH */
          ), [
            [vue.vModelText, $setup.form.name]
          ]),
          $props.sport === "football" ? vue.withDirectives((vue.openBlock(), vue.createElementBlock(
            "input",
            {
              key: 0,
              "onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => $setup.form.position = $event),
              class: "input",
              placeholder: "请输入位置"
            },
            null,
            512
            /* NEED_PATCH */
          )), [
            [vue.vModelText, $setup.form.position]
          ]) : vue.createCommentVNode("v-if", true),
          vue.createElementVNode("view", { class: "btns" }, [
            vue.createElementVNode("view", {
              class: "btn cancel",
              onClick: $setup.close
            }, "取消"),
            vue.createElementVNode("view", {
              class: "btn confirm",
              onClick: $setup.confirm
            }, "确定")
          ])
        ])
      ]),
      _: 1
      /* STABLE */
    }, 8, ["show"]);
  }
  const addMemberDialog = /* @__PURE__ */ _export_sfc(_sfc_main$r, [["render", _sfc_render$q], ["__scopeId", "data-v-c3334222"], ["__file", "F:/项目文件/uniapp版本/components/add-member-dialog/add-member-dialog.vue"]]);
  const _sfc_main$q = {
    __name: "team-roster",
    props: {
      gameId: { type: String, default: "" },
      gameTeamId: { type: String, default: "" },
      sport: { type: String, default: "basketball" },
      type: { type: Number, default: 1 }
    },
    setup(__props, { expose: __expose }) {
      const props2 = __props;
      const members = vue.ref([]);
      const showAdd = vue.ref(false);
      function isOn(v) {
        return !!(v && (v.boolean || v.value === 1));
      }
      function load() {
        if (!props2.gameTeamId)
          return;
        getMember(props2.gameTeamId).then((res) => {
          if (res.code === 1) {
            members.value = res.data || [];
            cacheLocal();
          }
        });
      }
      function cacheLocal() {
        members.value.forEach((m) => {
          insertOrReplace("member", {
            team_member_id: m.teamMemberId,
            game_id: props2.gameId,
            type: props2.type,
            name: m.name,
            number: m.number,
            startingLineup: isOn(m.startingLineup) ? 1 : 0,
            playing: isOn(m.playing) ? 1 : 0
          });
        });
      }
      vue.watch(() => props2.gameTeamId, load, { immediate: true });
      function toggleSign(m) {
        const api = isOn(m.playing) ? cancelMemberSign : memberSign;
        api({ gameTeamId: props2.gameTeamId, teamMemberId: m.teamMemberId }).then((res) => {
          if (res.code === 1)
            load();
          else
            uni.showToast({ title: res.msg || "操作失败", icon: "none" });
        });
      }
      function toggleStart(m) {
        const api = isOn(m.startingLineup) ? startingLineupCancel : startingLineup;
        api({ gameTeamId: props2.gameTeamId, teamMemberId: m.teamMemberId }).then((res) => {
          if (res.code === 1)
            load();
          else
            uni.showToast({ title: res.msg || "操作失败", icon: "none" });
        });
      }
      function onAdd(form) {
        addMember({
          gameTeamId: props2.gameTeamId,
          number: form.number,
          name: form.name,
          position: form.position
        }).then((res) => {
          if (res.code === 1) {
            showAdd.value = false;
            load();
          } else {
            uni.showToast({ title: res.msg || "添加失败", icon: "none" });
          }
        });
      }
      function onDel(m) {
        uni.showModal({
          title: "提示",
          content: "确定删除该临时球员？",
          success: (r) => {
            if (r.confirm) {
              deleteMember(m.id, m.teamMemberId).then((res) => {
                if (res.code === 1)
                  load();
              });
            }
          }
        });
      }
      function onForfeit() {
        uni.showToast({ title: "弃权功能待实现", icon: "none" });
      }
      function onLongPress(m) {
        if (props2.sport !== "football")
          return;
        uni.showModal({
          title: "修改位置",
          editable: true,
          placeholderText: "请输入位置",
          content: m.position ? m.position.desc : "",
          success: (r) => {
            if (r.confirm && r.content !== "") {
              memberEditPosition({ teamMemberId: m.teamMemberId, position: r.content }).then((res) => {
                if (res.code === 1)
                  load();
              });
            }
          }
        });
      }
      __expose({ refresh: load });
      const __returned__ = { props: props2, members, showAdd, isOn, load, cacheLocal, toggleSign, toggleStart, onAdd, onDel, onForfeit, onLongPress, ref: vue.ref, watch: vue.watch, get getMember() {
        return getMember;
      }, get memberSign() {
        return memberSign;
      }, get cancelMemberSign() {
        return cancelMemberSign;
      }, get startingLineup() {
        return startingLineup;
      }, get startingLineupCancel() {
        return startingLineupCancel;
      }, get addMember() {
        return addMember;
      }, get deleteMember() {
        return deleteMember;
      }, get memberEditPosition() {
        return memberEditPosition;
      }, get insertOrReplace() {
        return insertOrReplace;
      }, emptyLayout, addMemberDialog };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$p(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "team-roster" }, [
      vue.createElementVNode("scroll-view", {
        "scroll-y": "",
        class: "list"
      }, [
        (vue.openBlock(true), vue.createElementBlock(
          vue.Fragment,
          null,
          vue.renderList($setup.members, (m) => {
            return vue.openBlock(), vue.createElementBlock("view", {
              key: m.teamMemberId,
              class: "member-item",
              onLongpress: ($event) => $setup.onLongPress(m)
            }, [
              vue.createElementVNode(
                "view",
                { class: "num" },
                vue.toDisplayString(m.number),
                1
                /* TEXT */
              ),
              vue.createElementVNode("view", { class: "name" }, [
                vue.createTextVNode(
                  vue.toDisplayString(m.name) + " ",
                  1
                  /* TEXT */
                ),
                m.temporary === 1 ? (vue.openBlock(), vue.createElementBlock("text", {
                  key: 0,
                  class: "temp"
                }, "临时")) : vue.createCommentVNode("v-if", true),
                $props.sport === "football" && m.position ? (vue.openBlock(), vue.createElementBlock(
                  "text",
                  {
                    key: 1,
                    class: "pos"
                  },
                  vue.toDisplayString(m.position.desc),
                  1
                  /* TEXT */
                )) : vue.createCommentVNode("v-if", true)
              ]),
              vue.createElementVNode("view", {
                class: vue.normalizeClass(["op sign", { on: $setup.isOn(m.playing) }]),
                onClick: vue.withModifiers(($event) => $setup.toggleSign(m), ["stop"])
              }, "到场", 10, ["onClick"]),
              vue.createElementVNode("view", {
                class: vue.normalizeClass(["op start", { on: $setup.isOn(m.startingLineup) }]),
                onClick: vue.withModifiers(($event) => $setup.toggleStart(m), ["stop"])
              }, "首发", 10, ["onClick"]),
              m.temporary === 1 ? (vue.openBlock(), vue.createElementBlock("view", {
                key: 0,
                class: "op del",
                onClick: vue.withModifiers(($event) => $setup.onDel(m), ["stop"])
              }, "删除", 8, ["onClick"])) : vue.createCommentVNode("v-if", true)
            ], 40, ["onLongpress"]);
          }),
          128
          /* KEYED_FRAGMENT */
        )),
        !$setup.members.length ? (vue.openBlock(), vue.createBlock($setup["emptyLayout"], {
          key: 0,
          status: "empty"
        })) : vue.createCommentVNode("v-if", true)
      ]),
      vue.createElementVNode("view", { class: "bottom" }, [
        vue.createElementVNode("view", {
          class: "btn add",
          onClick: _cache[0] || (_cache[0] = ($event) => $setup.showAdd = true)
        }, "添加队员"),
        vue.createElementVNode("view", {
          class: "btn forfeit",
          onClick: $setup.onForfeit
        }, "弃权")
      ]),
      vue.createVNode($setup["addMemberDialog"], {
        show: $setup.showAdd,
        sport: $props.sport,
        onConfirm: $setup.onAdd,
        onClose: _cache[1] || (_cache[1] = ($event) => $setup.showAdd = false)
      }, null, 8, ["show", "sport"])
    ]);
  }
  const teamRoster = /* @__PURE__ */ _export_sfc(_sfc_main$q, [["render", _sfc_render$p], ["__scopeId", "data-v-f8ca6510"], ["__file", "F:/项目文件/uniapp版本/components/team-roster/team-roster.vue"]]);
  const _sfc_main$p = {
    __name: "basketball-setup",
    setup(__props, { expose: __expose }) {
      __expose();
      const gameId = vue.ref("");
      const hostTeamId = vue.ref("");
      const guestTeamId = vue.ref("");
      const statusValue = vue.ref(1);
      const matchType = vue.ref("5v5");
      const tabs = [{ name: "比赛信息" }, { name: "主队" }, { name: "客队" }];
      const current = vue.ref(0);
      const showConfirm = vue.ref(false);
      const confirmMsg = vue.ref("");
      onLoad((opt) => {
        gameId.value = opt.gameId || "";
        hostTeamId.value = opt.hostTeamId || "";
        guestTeamId.value = opt.guestTeamId || "";
        statusValue.value = Number(opt.statusValue || 1);
        matchType.value = opt.type || "5v5";
        loadSections();
      });
      function onTabClick(e) {
        current.value = e.index;
      }
      function loadSections() {
        if (!gameId.value)
          return;
        getSectionList(gameId.value).then((res) => {
          if (res.code === 1) {
            (res.data || []).forEach((s) => {
              insertOrReplace("game_section", {
                section_id: s.id,
                game_id: s.gameId || gameId.value,
                type: s.type ? s.type.value : 0,
                name: s.name,
                sort: s.sort || 0,
                groups: s.groups || "",
                isStart: 0,
                isEnd: 0
              });
            });
          }
        });
      }
      function onStatusChange(s) {
        statusValue.value = s.value;
      }
      function onStart() {
        countWhere("technical_record", `game_id='${gameId.value}'`).then((cnt) => {
          if (statusValue.value !== 1) {
            confirmMsg.value = "请将比赛状态设置为进行中";
          } else if (cnt > 0) {
            confirmMsg.value = "开始统计将不能修改首发队员";
          } else {
            confirmMsg.value = "开始统计将不能修改首发队员";
          }
          showConfirm.value = true;
        });
      }
      function onConfirmStart() {
        showConfirm.value = false;
        if (statusValue.value !== 1) {
          uni.showToast({ title: "请将比赛状态设置为进行中", icon: "none" });
          return;
        }
        uni.navigateTo({
          url: `/pages/statistics/basketball-operate?gameId=${gameId.value}`
        });
      }
      const __returned__ = { gameId, hostTeamId, guestTeamId, statusValue, matchType, tabs, current, showConfirm, confirmMsg, onTabClick, loadSections, onStatusChange, onStart, onConfirmStart, ref: vue.ref, get onLoad() {
        return onLoad;
      }, customNav, matchInfo, teamRoster, get getSectionList() {
        return getSectionList;
      }, get insertOrReplace() {
        return insertOrReplace;
      }, get countWhere() {
        return countWhere;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$o(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_u_tabs = resolveEasycom(vue.resolveDynamicComponent("u-tabs"), __easycom_0$1);
    const _component_u_modal = resolveEasycom(vue.resolveDynamicComponent("u-modal"), __easycom_1);
    return vue.openBlock(), vue.createElementBlock("view", { class: "basketball-setup" }, [
      vue.createVNode($setup["customNav"], { title: "比赛设置" }, {
        right: vue.withCtx(() => [
          vue.createElementVNode("text", {
            class: "start-btn",
            onClick: $setup.onStart
          }, "开始统计")
        ]),
        _: 1
        /* STABLE */
      }),
      vue.createVNode(_component_u_tabs, {
        list: $setup.tabs,
        current: $setup.current,
        onClick: $setup.onTabClick
      }, null, 8, ["current"]),
      vue.createElementVNode("view", { class: "content" }, [
        vue.withDirectives(vue.createVNode($setup["matchInfo"], {
          "game-id": $setup.gameId,
          sport: "basketball",
          "has-sync": true,
          onStatusChange: $setup.onStatusChange
        }, null, 8, ["game-id"]), [
          [vue.vShow, $setup.current === 0]
        ]),
        vue.withDirectives(vue.createVNode($setup["teamRoster"], {
          "game-id": $setup.gameId,
          "game-team-id": $setup.hostTeamId,
          sport: "basketball",
          type: 1
        }, null, 8, ["game-id", "game-team-id"]), [
          [vue.vShow, $setup.current === 1]
        ]),
        vue.withDirectives(vue.createVNode($setup["teamRoster"], {
          "game-id": $setup.gameId,
          "game-team-id": $setup.guestTeamId,
          sport: "basketball",
          type: 0
        }, null, 8, ["game-id", "game-team-id"]), [
          [vue.vShow, $setup.current === 2]
        ])
      ]),
      vue.createVNode(_component_u_modal, {
        show: $setup.showConfirm,
        content: $setup.confirmMsg,
        "show-cancel-button": true,
        onConfirm: $setup.onConfirmStart,
        onCancel: _cache[0] || (_cache[0] = ($event) => $setup.showConfirm = false)
      }, null, 8, ["show", "content"])
    ]);
  }
  const PagesMatchBasketballSetup = /* @__PURE__ */ _export_sfc(_sfc_main$p, [["render", _sfc_render$o], ["__scopeId", "data-v-d2d4d0a2"], ["__file", "F:/项目文件/uniapp版本/pages/match/basketball-setup.vue"]]);
  const _sfc_main$o = {
    __name: "index",
    setup(__props, { expose: __expose }) {
      __expose();
      const gameId = vue.ref("");
      const hostTeamId = vue.ref("");
      const guestTeamId = vue.ref("");
      const tabs = [{ name: "比赛信息" }, { name: "主队" }, { name: "客队" }];
      const current = vue.ref(0);
      const showConfirm = vue.ref(false);
      onLoad((opt) => {
        gameId.value = opt.gameId || "";
        hostTeamId.value = opt.hostTeamId || "";
        guestTeamId.value = opt.guestTeamId || "";
      });
      function onTabClick(e) {
        current.value = e.index;
      }
      function onStart() {
        showConfirm.value = true;
      }
      function onConfirmStart() {
        showConfirm.value = false;
        uni.navigateTo({
          url: `/pages/statistics/basketball-down?gameId=${gameId.value}`
        });
      }
      const __returned__ = { gameId, hostTeamId, guestTeamId, tabs, current, showConfirm, onTabClick, onStart, onConfirmStart, ref: vue.ref, get onLoad() {
        return onLoad;
      }, customNav, matchInfo, teamRoster };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$n(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_u_tabs = resolveEasycom(vue.resolveDynamicComponent("u-tabs"), __easycom_0$1);
    const _component_u_modal = resolveEasycom(vue.resolveDynamicComponent("u-modal"), __easycom_1);
    return vue.openBlock(), vue.createElementBlock("view", { class: "game-setup" }, [
      vue.createVNode($setup["customNav"], { title: "比赛设置" }, {
        right: vue.withCtx(() => [
          vue.createElementVNode("text", {
            class: "start-btn",
            onClick: $setup.onStart
          }, "开始统计")
        ]),
        _: 1
        /* STABLE */
      }),
      vue.createVNode(_component_u_tabs, {
        list: $setup.tabs,
        current: $setup.current,
        onClick: $setup.onTabClick
      }, null, 8, ["current"]),
      vue.createElementVNode("view", { class: "content" }, [
        vue.withDirectives(vue.createVNode($setup["matchInfo"], {
          "game-id": $setup.gameId,
          sport: "basketball",
          "has-sync": false
        }, null, 8, ["game-id"]), [
          [vue.vShow, $setup.current === 0]
        ]),
        vue.withDirectives(vue.createVNode($setup["teamRoster"], {
          "game-id": $setup.gameId,
          "game-team-id": $setup.hostTeamId,
          sport: "basketball",
          type: 1
        }, null, 8, ["game-id", "game-team-id"]), [
          [vue.vShow, $setup.current === 1]
        ]),
        vue.withDirectives(vue.createVNode($setup["teamRoster"], {
          "game-id": $setup.gameId,
          "game-team-id": $setup.guestTeamId,
          sport: "basketball",
          type: 0
        }, null, 8, ["game-id", "game-team-id"]), [
          [vue.vShow, $setup.current === 2]
        ])
      ]),
      vue.createVNode(_component_u_modal, {
        show: $setup.showConfirm,
        content: "开始统计将不能修改首发队员",
        "show-cancel-button": true,
        onConfirm: $setup.onConfirmStart,
        onCancel: _cache[0] || (_cache[0] = ($event) => $setup.showConfirm = false)
      }, null, 8, ["show"])
    ]);
  }
  const PagesGameSetupIndex = /* @__PURE__ */ _export_sfc(_sfc_main$o, [["render", _sfc_render$n], ["__scopeId", "data-v-fe81e945"], ["__file", "F:/项目文件/uniapp版本/pages/game-setup/index.vue"]]);
  const _sfc_main$n = {
    __name: "football-setup",
    setup(__props, { expose: __expose }) {
      __expose();
      const gameId = vue.ref("");
      const hostTeamId = vue.ref("");
      const guestTeamId = vue.ref("");
      const statusValue = vue.ref(1);
      const homeName = vue.ref("");
      const guestName = vue.ref("");
      const tabs = [{ name: "比赛信息" }, { name: "主队" }, { name: "客队" }];
      const current = vue.ref(0);
      const showConfirm = vue.ref(false);
      const confirmMsg = vue.ref("");
      onLoad((opt) => {
        gameId.value = opt.gameId || "";
        hostTeamId.value = opt.hostTeamId || "";
        guestTeamId.value = opt.guestTeamId || "";
        statusValue.value = Number(opt.statusValue || 1);
        homeName.value = opt.homeName || "";
        guestName.value = opt.guestName || "";
        loadSections();
      });
      function onTabClick(e) {
        current.value = e.index;
      }
      function loadSections() {
        if (!gameId.value)
          return;
        getSectionList(gameId.value).then((res) => {
          if (res.code === 1) {
            (res.data || []).forEach((s) => {
              insertOrReplace("game_section", {
                section_id: s.id,
                game_id: s.gameId || gameId.value,
                type: s.type ? s.type.value : 0,
                name: s.name,
                sort: s.sort || 0,
                groups: s.groups || "",
                isStart: 0,
                isEnd: 0
              });
            });
          }
        });
      }
      function onStatusChange(s) {
        statusValue.value = s.value;
      }
      function onStart() {
        countWhere("technical_record", `game_id='${gameId.value}'`).then((cnt) => {
          if (statusValue.value !== 1) {
            confirmMsg.value = "请将比赛状态设置为进行中";
          } else if (cnt > 0) {
            confirmMsg.value = "开始统计将不能修改首发队员";
          } else {
            confirmMsg.value = "开始统计将不能修改首发队员";
          }
          showConfirm.value = true;
        });
      }
      function onConfirmStart() {
        showConfirm.value = false;
        if (statusValue.value !== 1) {
          uni.showToast({ title: "请将比赛状态设置为进行中", icon: "none" });
          return;
        }
        uni.navigateTo({
          url: `/pages/statistics/football-operate?gameId=${gameId.value}`
        });
      }
      const __returned__ = { gameId, hostTeamId, guestTeamId, statusValue, homeName, guestName, tabs, current, showConfirm, confirmMsg, onTabClick, loadSections, onStatusChange, onStart, onConfirmStart, ref: vue.ref, get onLoad() {
        return onLoad;
      }, customNav, matchInfo, teamRoster, get getSectionList() {
        return getSectionList;
      }, get insertOrReplace() {
        return insertOrReplace;
      }, get countWhere() {
        return countWhere;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$m(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_u_tabs = resolveEasycom(vue.resolveDynamicComponent("u-tabs"), __easycom_0$1);
    const _component_u_modal = resolveEasycom(vue.resolveDynamicComponent("u-modal"), __easycom_1);
    return vue.openBlock(), vue.createElementBlock("view", { class: "football-setup" }, [
      vue.createVNode($setup["customNav"], { title: "足球比赛设置" }, {
        right: vue.withCtx(() => [
          vue.createElementVNode("text", {
            class: "start-btn",
            onClick: $setup.onStart
          }, "开始统计")
        ]),
        _: 1
        /* STABLE */
      }),
      vue.createVNode(_component_u_tabs, {
        list: $setup.tabs,
        current: $setup.current,
        onClick: $setup.onTabClick
      }, null, 8, ["current"]),
      vue.createElementVNode("view", { class: "content" }, [
        vue.withDirectives(vue.createVNode($setup["matchInfo"], {
          "game-id": $setup.gameId,
          sport: "football",
          "has-sync": true,
          onStatusChange: $setup.onStatusChange
        }, null, 8, ["game-id"]), [
          [vue.vShow, $setup.current === 0]
        ]),
        vue.withDirectives(vue.createVNode($setup["teamRoster"], {
          "game-id": $setup.gameId,
          "game-team-id": $setup.hostTeamId,
          sport: "football",
          type: 1
        }, null, 8, ["game-id", "game-team-id"]), [
          [vue.vShow, $setup.current === 1]
        ]),
        vue.withDirectives(vue.createVNode($setup["teamRoster"], {
          "game-id": $setup.gameId,
          "game-team-id": $setup.guestTeamId,
          sport: "football",
          type: 0
        }, null, 8, ["game-id", "game-team-id"]), [
          [vue.vShow, $setup.current === 2]
        ])
      ]),
      vue.createVNode(_component_u_modal, {
        show: $setup.showConfirm,
        content: $setup.confirmMsg,
        "show-cancel-button": true,
        onConfirm: $setup.onConfirmStart,
        onCancel: _cache[0] || (_cache[0] = ($event) => $setup.showConfirm = false)
      }, null, 8, ["show", "content"])
    ]);
  }
  const PagesMatchFootballSetup = /* @__PURE__ */ _export_sfc(_sfc_main$n, [["render", _sfc_render$m], ["__scopeId", "data-v-a74d07ea"], ["__file", "F:/项目文件/uniapp版本/pages/match/football-setup.vue"]]);
  const _sfc_main$m = {
    __name: "battery-view",
    props: {
      power: { type: Number, default: 100 },
      // 0-100
      charging: { type: Boolean, default: false }
    },
    setup(__props, { expose: __expose }) {
      __expose();
      const props2 = __props;
      const levelClass = vue.computed(() => {
        if (props2.power <= 20)
          return "low";
        if (props2.power <= 50)
          return "mid";
        return "high";
      });
      const __returned__ = { props: props2, levelClass, computed: vue.computed };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$l(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock(
      "view",
      {
        class: vue.normalizeClass(["battery", { charging: $props.charging }])
      },
      [
        vue.createElementVNode("view", { class: "battery-body" }, [
          vue.createElementVNode(
            "view",
            {
              class: vue.normalizeClass(["battery-level", $setup.levelClass]),
              style: vue.normalizeStyle({ width: $props.power + "%" })
            },
            null,
            6
            /* CLASS, STYLE */
          )
        ]),
        vue.createElementVNode("view", { class: "battery-tip" })
      ],
      2
      /* CLASS */
    );
  }
  const batteryView = /* @__PURE__ */ _export_sfc(_sfc_main$m, [["render", _sfc_render$l], ["__scopeId", "data-v-646cc3ef"], ["__file", "F:/项目文件/uniapp版本/components/battery-view/battery-view.vue"]]);
  const _sfc_main$l = {
    __name: "action-sheet",
    props: {
      show: { type: Boolean, default: false },
      title: { type: String, default: "选择动作" },
      actions: { type: Array, default: () => [] }
    },
    emits: ["select", "close"],
    setup(__props, { expose: __expose, emit: __emit }) {
      __expose();
      const emit2 = __emit;
      function onSelect(a) {
        emit2("select", a);
        emit2("close");
      }
      function close() {
        emit2("close");
      }
      const __returned__ = { emit: emit2, onSelect, close };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$k(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_u_popup = resolveEasycom(vue.resolveDynamicComponent("u-popup"), __easycom_0$2);
    return vue.openBlock(), vue.createBlock(_component_u_popup, {
      show: $props.show,
      mode: "bottom",
      round: 20,
      onClose: $setup.close
    }, {
      default: vue.withCtx(() => [
        vue.createElementVNode("view", { class: "action-sheet" }, [
          vue.createElementVNode(
            "view",
            { class: "sheet-title" },
            vue.toDisplayString($props.title),
            1
            /* TEXT */
          ),
          vue.createElementVNode("view", { class: "grid" }, [
            (vue.openBlock(true), vue.createElementBlock(
              vue.Fragment,
              null,
              vue.renderList($props.actions, (a) => {
                return vue.openBlock(), vue.createElementBlock("view", {
                  key: a.type,
                  class: vue.normalizeClass(["action", a.color]),
                  onClick: ($event) => $setup.onSelect(a)
                }, vue.toDisplayString(a.desc), 11, ["onClick"]);
              }),
              128
              /* KEYED_FRAGMENT */
            ))
          ])
        ])
      ]),
      _: 1
      /* STABLE */
    }, 8, ["show"]);
  }
  const actionSheet = /* @__PURE__ */ _export_sfc(_sfc_main$l, [["render", _sfc_render$k], ["__scopeId", "data-v-d53be547"], ["__file", "F:/项目文件/uniapp版本/components/action-sheet/action-sheet.vue"]]);
  const _sfc_main$k = {
    __name: "change-member-dialog",
    props: {
      show: { type: Boolean, default: false },
      members: { type: Array, default: () => [] }
    },
    emits: ["confirm", "close"],
    setup(__props, { expose: __expose, emit: __emit }) {
      __expose();
      const props2 = __props;
      const emit2 = __emit;
      const offId = vue.ref("");
      const onId = vue.ref("");
      function isOn(m) {
        var _a;
        return !!(m && (((_a = m.playing) == null ? void 0 : _a.boolean) || m.playing === 1));
      }
      const playingMembers = vue.computed(() => props2.members.filter(isOn));
      const benchMembers = vue.computed(() => props2.members.filter((m) => !isOn(m)));
      vue.watch(
        () => props2.show,
        (v) => {
          if (v) {
            offId.value = "";
            onId.value = "";
          }
        }
      );
      function confirm() {
        if (!offId.value || !onId.value) {
          uni.showToast({ title: "请选择上下场球员", icon: "none" });
          return;
        }
        emit2("confirm", { offId: offId.value, onId: onId.value });
        close();
      }
      function close() {
        emit2("close");
      }
      const __returned__ = { props: props2, emit: emit2, offId, onId, isOn, playingMembers, benchMembers, confirm, close, ref: vue.ref, computed: vue.computed, watch: vue.watch };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$j(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_u_popup = resolveEasycom(vue.resolveDynamicComponent("u-popup"), __easycom_0$2);
    return vue.openBlock(), vue.createBlock(_component_u_popup, {
      show: $props.show,
      mode: "bottom",
      round: 20,
      onClose: $setup.close
    }, {
      default: vue.withCtx(() => [
        vue.createElementVNode("view", { class: "change-dialog" }, [
          vue.createElementVNode("view", { class: "title" }, "换人"),
          vue.createElementVNode("view", { class: "step" }, "下场球员"),
          vue.createElementVNode("view", { class: "player-grid" }, [
            (vue.openBlock(true), vue.createElementBlock(
              vue.Fragment,
              null,
              vue.renderList($setup.playingMembers, (m) => {
                return vue.openBlock(), vue.createElementBlock("view", {
                  key: m.teamMemberId,
                  class: vue.normalizeClass(["player", { sel: $setup.offId === m.teamMemberId }]),
                  onClick: ($event) => $setup.offId = m.teamMemberId
                }, vue.toDisplayString(m.number) + " " + vue.toDisplayString(m.name), 11, ["onClick"]);
              }),
              128
              /* KEYED_FRAGMENT */
            )),
            !$setup.playingMembers.length ? (vue.openBlock(), vue.createElementBlock("view", {
              key: 0,
              class: "empty"
            }, "无上场球员")) : vue.createCommentVNode("v-if", true)
          ]),
          vue.createElementVNode("view", { class: "step" }, "上场球员"),
          vue.createElementVNode("view", { class: "player-grid" }, [
            (vue.openBlock(true), vue.createElementBlock(
              vue.Fragment,
              null,
              vue.renderList($setup.benchMembers, (m) => {
                return vue.openBlock(), vue.createElementBlock("view", {
                  key: m.teamMemberId,
                  class: vue.normalizeClass(["player", { sel: $setup.onId === m.teamMemberId }]),
                  onClick: ($event) => $setup.onId = m.teamMemberId
                }, vue.toDisplayString(m.number) + " " + vue.toDisplayString(m.name), 11, ["onClick"]);
              }),
              128
              /* KEYED_FRAGMENT */
            )),
            !$setup.benchMembers.length ? (vue.openBlock(), vue.createElementBlock("view", {
              key: 0,
              class: "empty"
            }, "无替补球员")) : vue.createCommentVNode("v-if", true)
          ]),
          vue.createElementVNode("view", { class: "btns" }, [
            vue.createElementVNode("view", {
              class: "btn cancel",
              onClick: $setup.close
            }, "取消"),
            vue.createElementVNode("view", {
              class: "btn confirm",
              onClick: $setup.confirm
            }, "确定")
          ])
        ])
      ]),
      _: 1
      /* STABLE */
    }, 8, ["show"]);
  }
  const changeMemberDialog = /* @__PURE__ */ _export_sfc(_sfc_main$k, [["render", _sfc_render$j], ["__scopeId", "data-v-e301e1db"], ["__file", "F:/项目文件/uniapp版本/components/change-member-dialog/change-member-dialog.vue"]]);
  const _sfc_main$j = {
    __name: "section-dialog",
    props: {
      show: { type: Boolean, default: false }
    },
    emits: ["select", "close"],
    setup(__props, { expose: __expose, emit: __emit }) {
      __expose();
      const emit2 = __emit;
      function onSelect(t2) {
        emit2("select", t2);
        emit2("close");
      }
      function close() {
        emit2("close");
      }
      const __returned__ = { emit: emit2, onSelect, close };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$i(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_u_popup = resolveEasycom(vue.resolveDynamicComponent("u-popup"), __easycom_0$2);
    return vue.openBlock(), vue.createBlock(_component_u_popup, {
      show: $props.show,
      mode: "bottom",
      round: 20,
      onClose: $setup.close
    }, {
      default: vue.withCtx(() => [
        vue.createElementVNode("view", { class: "section-dialog" }, [
          vue.createElementVNode("view", {
            class: "item",
            onClick: _cache[0] || (_cache[0] = ($event) => $setup.onSelect("start"))
          }, "小节开始"),
          vue.createElementVNode("view", {
            class: "item",
            onClick: _cache[1] || (_cache[1] = ($event) => $setup.onSelect("end"))
          }, "小节结束"),
          vue.createElementVNode("view", {
            class: "item",
            onClick: _cache[2] || (_cache[2] = ($event) => $setup.onSelect("prev"))
          }, "上一节"),
          vue.createElementVNode("view", {
            class: "item",
            onClick: _cache[3] || (_cache[3] = ($event) => $setup.onSelect("next"))
          }, "下一节"),
          vue.createElementVNode("view", {
            class: "cancel",
            onClick: $setup.close
          }, "取消")
        ])
      ]),
      _: 1
      /* STABLE */
    }, 8, ["show"]);
  }
  const sectionDialog = /* @__PURE__ */ _export_sfc(_sfc_main$j, [["render", _sfc_render$i], ["__scopeId", "data-v-b243f57c"], ["__file", "F:/项目文件/uniapp版本/components/section-dialog/section-dialog.vue"]]);
  const uploadData = (params2) => request({ url: "statistics/add", method: "POST", data: params2 });
  const uploadDataAll = (params2) => request({ url: "statistics/add-all", method: "POST", data: params2 });
  const cancelData = (params2) => request({ url: "statistics/cancel", method: "POST", data: params2 });
  const sectionRunning = (statisticsSectionId) => request({ url: "statistics/section/running", method: "POST", data: { statisticsSectionId } });
  const statisticsPage = (gameId, isDesc = 1, pageNo = 1) => request({ url: "statistics/page", query: { gameId, isDesc, pageNo } });
  let timer = null;
  let uploading = false;
  function startUploadQueue(gameId, onUploaded) {
    stopUploadQueue();
    timer = setInterval(() => {
      doUpload(gameId, onUploaded);
    }, 2e3);
  }
  function stopUploadQueue() {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  }
  async function doUpload(gameId, onUploaded) {
    if (uploading)
      return;
    uploading = true;
    try {
      const list = await selectSQL(
        `SELECT * FROM technical_record WHERE game_id='${gameId}' AND is_need_upload=0 AND disable=0 LIMIT 10`
      );
      for (const r of list) {
        try {
          const res = await uploadData({
            description: r.description || "",
            recordNumber: r.record_number,
            statisticsMemberId: r.statistics_member_id || "",
            statisticsSectionId: r.statistics_section_id || "",
            type: r.type,
            elapsedTime: r.elapsed_time || 0
          });
          if (res.code === 1) {
            await executeSQL(
              `UPDATE technical_record SET is_need_upload=1 WHERE record_number=${r.record_number}`
            );
            onUploaded && onUploaded(r);
          }
        } catch (e) {
        }
      }
    } finally {
      uploading = false;
    }
  }
  async function pendingCount(gameId) {
    const res = await selectSQL(
      `SELECT COUNT(*) as c FROM technical_record WHERE game_id='${gameId}' AND is_need_upload=0 AND disable=0`
    );
    return res[0] ? res[0].c : 0;
  }
  const BasketType = {
    BACKBOARD: 1,
    ASSIST: 2,
    BLOCK: 3,
    STEAL: 4,
    PAUSE: 5,
    TWO_POINT: 6,
    THREE_POINT: 7,
    FREE_THROW: 8,
    FOUL: 9,
    TWO_MISS: 10,
    THREE_MISS: 11,
    FREE_MISS: 12,
    CHANGE_OFF: 13,
    CHANGE_ON: 14,
    SECTION_END: 15,
    SECTION_START: 16,
    TURNOVER: 17,
    FRONT_BOARD: 117,
    BACK_BOARD: 118,
    TECH_FOUL: 119,
    ILLEGAL_FOUL: 120,
    DISQ_FOUL: 121
  };
  const BasketTypeDesc = {
    1: "篮板",
    2: "助攻",
    3: "盖帽",
    4: "抢断",
    5: "暂停",
    6: "两分命中",
    7: "三分命中",
    8: "罚球命中",
    9: "犯规",
    10: "两分不中",
    11: "三分不中",
    12: "罚球不中",
    13: "换人下场",
    14: "换人上场",
    15: "小节结束",
    16: "小节开始",
    17: "失误",
    117: "前场篮板",
    118: "后场篮板",
    119: "技术犯规",
    120: "违体",
    121: "夺权"
  };
  const FootTypeDesc = {
    2: "助攻",
    5: "暂停",
    9: "犯规",
    13: "换人下场",
    14: "换人上场",
    17: "失误",
    18: "进球",
    19: "点球",
    20: "射门",
    21: "黄牌",
    22: "红牌",
    23: "越位",
    24: "手球"
  };
  const BasketActions = [
    { type: 1, desc: "篮板", color: "green" },
    { type: 117, desc: "前场篮板", color: "green" },
    { type: 118, desc: "后场篮板", color: "green" },
    { type: 2, desc: "助攻", color: "green" },
    { type: 3, desc: "盖帽", color: "green" },
    { type: 4, desc: "抢断", color: "green" },
    { type: 6, desc: "二分命中", color: "green" },
    { type: 7, desc: "三分命中", color: "green" },
    { type: 8, desc: "罚球命中", color: "green" },
    { type: 10, desc: "两分不中", color: "red" },
    { type: 11, desc: "三分不中", color: "red" },
    { type: 12, desc: "罚球不中", color: "red" },
    { type: 9, desc: "犯规", color: "red" },
    { type: 119, desc: "技术犯规", color: "red" },
    { type: 120, desc: "违体", color: "red" },
    { type: 121, desc: "夺权", color: "red" },
    { type: 17, desc: "失误", color: "red" },
    { type: 5, desc: "暂停", color: "blue" }
  ];
  const FootActions = [
    { type: 18, desc: "进球", color: "green" },
    { type: 19, desc: "点球", color: "green" },
    { type: 20, desc: "射门", color: "green" },
    { type: 2, desc: "助攻", color: "green" },
    { type: 21, desc: "黄牌", color: "red" },
    { type: 22, desc: "红牌", color: "red" },
    { type: 23, desc: "越位", color: "red" },
    { type: 24, desc: "手球", color: "red" },
    { type: 9, desc: "犯规", color: "red" },
    { type: 17, desc: "失误", color: "red" },
    { type: 5, desc: "暂停", color: "blue" }
  ];
  function scoreOf(type, sport) {
    if (sport === "football") {
      return type === 18 || type === 19 ? 1 : 0;
    }
    if (type === 6)
      return 2;
    if (type === 7)
      return 3;
    if (type === 8)
      return 1;
    return 0;
  }
  function isFoul(type, sport) {
    if (sport === "football")
      return [9, 21, 22].includes(type);
    return [9, 119, 120, 121].includes(type);
  }
  function typeDesc(type, sport) {
    return sport === "football" ? FootTypeDesc[type] || "" : BasketTypeDesc[type] || "";
  }
  function aggregateMemberStats(records) {
    const s = {
      score: 0,
      board: 0,
      assists: 0,
      steals: 0,
      block: 0,
      foul: 0,
      shots_total: 0,
      shots_success: 0,
      thirds_total: 0,
      thirds_success: 0,
      penalty_total: 0,
      penalty_success: 0,
      miss: 0,
      turnover: 0
    };
    (records || []).forEach((r) => {
      switch (r.type) {
        case 1:
        case 117:
        case 118:
          s.board++;
          break;
        case 2:
          s.assists++;
          break;
        case 3:
          s.block++;
          break;
        case 4:
          s.steals++;
          break;
        case 6:
          s.shots_success++;
          s.shots_total++;
          s.score += 2;
          break;
        case 7:
          s.thirds_success++;
          s.thirds_total++;
          s.score += 3;
          break;
        case 8:
          s.penalty_success++;
          s.penalty_total++;
          s.score += 1;
          break;
        case 9:
        case 119:
        case 120:
        case 121:
          s.foul++;
          break;
        case 10:
          s.shots_total++;
          s.miss++;
          break;
        case 11:
          s.thirds_total++;
          s.miss++;
          break;
        case 12:
          s.penalty_total++;
          s.miss++;
          break;
        case 17:
          s.turnover++;
          break;
      }
    });
    return s;
  }
  const _sfc_main$i = {
    __name: "basketball-operate",
    setup(__props, { expose: __expose }) {
      __expose();
      const statusBarHeight = uni.getSystemInfoSync().statusBarHeight || 0;
      const gameId = vue.ref("");
      const homeName = vue.ref("主队");
      const guestName = vue.ref("客队");
      const hostMembers2 = vue.ref([]);
      const guestMembers2 = vue.ref([]);
      const sections2 = vue.ref([]);
      const currentSectionIdx = vue.ref(0);
      const currentSection = vue.ref("");
      const currentSectionName = vue.ref("第1节");
      const selectedTeam = vue.ref("");
      const selectedId = vue.ref("");
      const selectedMember = vue.ref(null);
      const hostScore = vue.ref(0);
      const guestScore = vue.ref(0);
      const hostFoul = vue.ref(0);
      const guestFoul = vue.ref(0);
      const hostPause = vue.ref(0);
      const guestPause = vue.ref(0);
      const records = vue.ref([]);
      const battery = vue.ref(100);
      const syncNum = vue.ref(0);
      const showAction = vue.ref(false);
      const showChange = vue.ref(false);
      const showSection = vue.ref(false);
      const showKickoff = vue.ref(false);
      const quickActions = BasketActions.slice(0, 9);
      const basketActions = BasketActions;
      const currentMembers = vue.computed(() => selectedTeam.value === "host" ? hostMembers2.value : guestMembers2.value);
      onLoad((opt) => {
        gameId.value = opt.gameId || "";
        homeName.value = opt.homeName || "主队";
        guestName.value = opt.guestName || "客队";
        Promise.all([loadMembers(), loadSections()]).then(() => {
          loadStats();
          checkKickoff();
        });
        loadRecords();
        startUploadQueue(gameId.value, () => {
          loadRecords();
          updateSyncNum();
        });
        updateSyncNum();
      });
      vue.onUnmounted(() => stopUploadQueue());
      function sortMembers(list) {
        return list.sort((a, b) => (Number(b.playing) || 0) - (Number(a.playing) || 0) || a.number - b.number);
      }
      function loadMembers() {
        return queryList("member", `game_id='${gameId.value}'`).then((list) => {
          const init = list.map((m) => {
            const hasVal = m.playing !== null && m.playing !== void 0 && m.playing !== "";
            const playing = hasVal ? Number(m.playing) : Number(m.startingLineup) ? 1 : 0;
            if (!hasVal) {
              executeSQL(`UPDATE member SET playing=${playing} WHERE team_member_id='${m.team_member_id}'`);
            }
            return { ...m, foul: 0, playing };
          });
          hostMembers2.value = sortMembers(init.filter((m) => m.type === 1));
          guestMembers2.value = sortMembers(init.filter((m) => m.type === 0));
        });
      }
      function loadSections() {
        return queryList("game_section", `game_id='${gameId.value}'`, "sort ASC").then((list) => {
          sections2.value = list;
          if (list.length) {
            currentSectionIdx.value = 0;
            currentSection.value = list[0].section_id;
            currentSectionName.value = list[0].name;
          }
        });
      }
      function loadRecords() {
        selectSQL(
          `SELECT * FROM technical_record WHERE game_id='${gameId.value}' AND disable=0 AND "delete"=1 ORDER BY record_number DESC LIMIT 30`
        ).then((list) => {
          records.value = list;
        });
      }
      function loadStats() {
        selectSQL(
          `SELECT * FROM technical_record WHERE game_id='${gameId.value}' AND disable=0 AND "delete"=1`
        ).then((list) => {
          let hs = 0, gs = 0, hf = 0, gf = 0, hp = 0, gp = 0;
          const foulMap = {};
          const sec = currentSection.value;
          list.forEach((r) => {
            const sc = scoreOf(r.type, "basketball");
            const fl = isFoul(r.type, "basketball");
            const inSec = r.statistics_section_id === sec;
            if (r.team_type === 1) {
              hs += sc;
              if (fl && inSec)
                hf++;
              if (r.type === 5)
                hp++;
            } else {
              gs += sc;
              if (fl && inSec)
                gf++;
              if (r.type === 5)
                gp++;
            }
            if (fl && r.statistics_member_id)
              foulMap[r.statistics_member_id] = (foulMap[r.statistics_member_id] || 0) + 1;
          });
          hostScore.value = hs;
          guestScore.value = gs;
          hostFoul.value = hf;
          guestFoul.value = gf;
          hostPause.value = hp;
          guestPause.value = gp;
          hostMembers2.value.forEach((m) => m.foul = foulMap[m.team_member_id] || 0);
          guestMembers2.value.forEach((m) => m.foul = foulMap[m.team_member_id] || 0);
        });
      }
      function updateSyncNum() {
        pendingCount(gameId.value).then((n) => syncNum.value = n);
      }
      function selectPlayer(team, m) {
        selectedTeam.value = team;
        selectedId.value = m.team_member_id;
        selectedMember.value = m;
      }
      function onQuickAction(a) {
        doAction(a);
      }
      function onAction(a) {
        doAction(a);
      }
      function doAction(a) {
        if (!selectedMember.value) {
          uni.showToast({ title: "请先选择球员", icon: "none" });
          return;
        }
        const team = selectedTeam.value;
        const member = selectedMember.value;
        const teamName = team === "host" ? homeName.value : guestName.value;
        const teamType = team === "host" ? 1 : 0;
        const recordNumber = Date.now();
        const description = `${member.name} ${a.desc}`;
        insertOrReplace("technical_record", {
          record_number: recordNumber,
          elapsed_time: 0,
          statistics_section_id: currentSection.value,
          type: a.type,
          statistics_member_id: member.team_member_id,
          description,
          game_id: gameId.value,
          team_type: teamType,
          team_name: teamName,
          add: 0,
          delete: 1,
          is_need_upload: 0,
          disable: 0
        });
        const sc = scoreOf(a.type, "basketball");
        if (sc > 0) {
          if (team === "host")
            hostScore.value += sc;
          else
            guestScore.value += sc;
        }
        if (isFoul(a.type, "basketball")) {
          if (team === "host")
            hostFoul.value++;
          else
            guestFoul.value++;
          member.foul = (member.foul || 0) + 1;
          if (member.foul >= 5) {
            uni.showToast({ title: "该队员犯规已达5次或以上", icon: "none" });
          }
        }
        if (a.type === BasketType.PAUSE) {
          if (team === "host")
            hostPause.value++;
          else
            guestPause.value++;
        }
        loadRecords();
        updateSyncNum();
      }
      function onDelete(r) {
        cancelData({
          gameId: gameId.value,
          recordNumber: r.record_number,
          statisticsMemberId: r.statistics_member_id
        }).then((res) => {
          if (res.code === 1) {
            executeSQL(`UPDATE technical_record SET disable=1, is_need_upload=1 WHERE record_number=${r.record_number}`);
            loadRecords();
            loadStats();
            updateSyncNum();
          }
        });
      }
      function onChange({ offId, onId }) {
        const team = selectedTeam.value || "host";
        const teamName = team === "host" ? homeName.value : guestName.value;
        const teamType = team === "host" ? 1 : 0;
        const members = team === "host" ? hostMembers2.value : guestMembers2.value;
        const offMember = members.find((m) => m.team_member_id === offId);
        const onMember = members.find((m) => m.team_member_id === onId);
        const base = Date.now();
        insertOrReplace("technical_record", {
          record_number: base,
          elapsed_time: 0,
          statistics_section_id: currentSection.value,
          type: 13,
          statistics_member_id: offId,
          description: `${offMember ? offMember.name : ""} 换下`,
          game_id: gameId.value,
          team_type: teamType,
          team_name: teamName,
          add: 0,
          delete: 1,
          is_need_upload: 0,
          disable: 0
        });
        insertOrReplace("technical_record", {
          record_number: base + 1,
          elapsed_time: 0,
          statistics_section_id: currentSection.value,
          type: 14,
          statistics_member_id: onId,
          description: `${onMember ? onMember.name : ""} 换上`,
          game_id: gameId.value,
          team_type: teamType,
          team_name: teamName,
          add: 0,
          delete: 1,
          is_need_upload: 0,
          disable: 0
        });
        executeSQL(`UPDATE member SET playing=0 WHERE team_member_id='${offId}'`);
        executeSQL(`UPDATE member SET playing=1 WHERE team_member_id='${onId}'`);
        if (offMember)
          offMember.playing = 0;
        if (onMember)
          onMember.playing = 1;
        if (team === "host")
          hostMembers2.value = sortMembers([...hostMembers2.value]);
        else
          guestMembers2.value = sortMembers([...guestMembers2.value]);
        loadRecords();
        updateSyncNum();
      }
      function onSection(t2) {
        if (t2 === "prev" && currentSectionIdx.value > 0)
          currentSectionIdx.value--;
        if (t2 === "next" && currentSectionIdx.value < sections2.value.length - 1)
          currentSectionIdx.value++;
        const sec = sections2.value[currentSectionIdx.value];
        if (sec) {
          currentSection.value = sec.section_id;
          currentSectionName.value = sec.name;
        }
        if (t2 === "start")
          insertSectionRecord(BasketType.SECTION_START);
        if (t2 === "end")
          insertSectionRecord(BasketType.SECTION_END);
        loadStats();
      }
      function insertSectionRecord(type) {
        insertOrReplace("technical_record", {
          record_number: Date.now(),
          elapsed_time: 0,
          statistics_section_id: currentSection.value,
          type,
          statistics_member_id: "",
          description: type === 16 ? "小节开始" : "小节结束",
          game_id: gameId.value,
          team_type: 0,
          team_name: "",
          add: 0,
          delete: 1,
          is_need_upload: 0,
          disable: 0
        });
        loadRecords();
        updateSyncNum();
      }
      function checkKickoff() {
        const sec = sections2.value[currentSectionIdx.value];
        showKickoff.value = !!(sec && !Number(sec.isStart));
      }
      function onKickoff(teamType) {
        const teamName = teamType === 1 ? homeName.value : guestName.value;
        insertOrReplace("technical_record", {
          record_number: Date.now(),
          elapsed_time: 0,
          statistics_section_id: currentSection.value,
          type: 16,
          statistics_member_id: "",
          description: `${teamName}球权`,
          game_id: gameId.value,
          team_type: teamType,
          team_name: teamName,
          add: 0,
          delete: 1,
          is_need_upload: 0,
          disable: 0
        });
        executeSQL(`UPDATE game_section SET isStart=1 WHERE section_id='${currentSection.value}'`);
        if (sections2.value[currentSectionIdx.value])
          sections2.value[currentSectionIdx.value].isStart = 1;
        showKickoff.value = false;
        loadRecords();
        updateSyncNum();
      }
      function back() {
        uni.navigateBack();
      }
      const __returned__ = { statusBarHeight, gameId, homeName, guestName, hostMembers: hostMembers2, guestMembers: guestMembers2, sections: sections2, currentSectionIdx, currentSection, currentSectionName, selectedTeam, selectedId, selectedMember, hostScore, guestScore, hostFoul, guestFoul, hostPause, guestPause, records, battery, syncNum, showAction, showChange, showSection, showKickoff, quickActions, basketActions, currentMembers, sortMembers, loadMembers, loadSections, loadRecords, loadStats, updateSyncNum, selectPlayer, onQuickAction, onAction, doAction, onDelete, onChange, onSection, insertSectionRecord, checkKickoff, onKickoff, back, ref: vue.ref, computed: vue.computed, onUnmounted: vue.onUnmounted, get onLoad() {
        return onLoad;
      }, batteryView, actionSheet, changeMemberDialog, sectionDialog, get queryList() {
        return queryList;
      }, get insertOrReplace() {
        return insertOrReplace;
      }, get executeSQL() {
        return executeSQL;
      }, get selectSQL() {
        return selectSQL;
      }, get startUploadQueue() {
        return startUploadQueue;
      }, get stopUploadQueue() {
        return stopUploadQueue;
      }, get pendingCount() {
        return pendingCount;
      }, get cancelData() {
        return cancelData;
      }, get BasketActions() {
        return BasketActions;
      }, get BasketType() {
        return BasketType;
      }, get scoreOf() {
        return scoreOf;
      }, get isFoul() {
        return isFoul;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$h(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "basket-operate" }, [
      vue.createElementVNode("view", { class: "top-bar" }, [
        vue.createElementVNode(
          "view",
          {
            class: "nav-status",
            style: vue.normalizeStyle({ height: $setup.statusBarHeight + "px" })
          },
          null,
          4
          /* STYLE */
        ),
        vue.createElementVNode("view", { class: "top-bar-inner" }, [
          vue.createElementVNode("view", {
            class: "back",
            onClick: $setup.back
          }, [
            vue.createElementVNode("image", {
              class: "back-icon",
              src: _imports_0$2,
              mode: "aspectFit"
            })
          ]),
          vue.createElementVNode("view", { class: "team-info" }, [
            vue.createElementVNode(
              "text",
              { class: "tname" },
              vue.toDisplayString($setup.homeName),
              1
              /* TEXT */
            ),
            vue.createElementVNode(
              "text",
              {
                class: vue.normalizeClass(["tag foul", { danger: $setup.hostFoul > 4 }])
              },
              "犯规" + vue.toDisplayString($setup.hostFoul),
              3
              /* TEXT, CLASS */
            ),
            vue.createElementVNode(
              "text",
              { class: "tag pause" },
              "暂停" + vue.toDisplayString($setup.hostPause),
              1
              /* TEXT */
            )
          ]),
          vue.createElementVNode(
            "view",
            {
              class: "section-btn",
              onClick: _cache[0] || (_cache[0] = ($event) => $setup.showSection = true)
            },
            vue.toDisplayString($setup.currentSectionName),
            1
            /* TEXT */
          ),
          vue.createElementVNode("view", { class: "team-info" }, [
            vue.createElementVNode(
              "text",
              { class: "tag pause" },
              "暂停" + vue.toDisplayString($setup.guestPause),
              1
              /* TEXT */
            ),
            vue.createElementVNode(
              "text",
              {
                class: vue.normalizeClass(["tag foul", { danger: $setup.guestFoul > 4 }])
              },
              "犯规" + vue.toDisplayString($setup.guestFoul),
              3
              /* TEXT, CLASS */
            ),
            vue.createElementVNode(
              "text",
              { class: "tname" },
              vue.toDisplayString($setup.guestName),
              1
              /* TEXT */
            )
          ]),
          vue.createVNode($setup["batteryView"], { power: $setup.battery }, null, 8, ["power"])
        ])
      ]),
      vue.createElementVNode("view", { class: "body" }, [
        vue.createElementVNode("view", { class: "team-panel" }, [
          vue.createElementVNode(
            "view",
            { class: "panel-title" },
            vue.toDisplayString($setup.homeName),
            1
            /* TEXT */
          ),
          vue.createElementVNode("scroll-view", {
            "scroll-y": "",
            class: "player-list"
          }, [
            (vue.openBlock(true), vue.createElementBlock(
              vue.Fragment,
              null,
              vue.renderList($setup.hostMembers, (m) => {
                return vue.openBlock(), vue.createElementBlock("view", {
                  key: m.team_member_id,
                  class: vue.normalizeClass(["player", { sel: $setup.selectedId === m.team_member_id && $setup.selectedTeam === "host", playing: Number(m.playing) }]),
                  onClick: ($event) => $setup.selectPlayer("host", m)
                }, [
                  vue.createElementVNode(
                    "text",
                    { class: "num" },
                    vue.toDisplayString(m.number),
                    1
                    /* TEXT */
                  ),
                  vue.createElementVNode(
                    "text",
                    { class: "name" },
                    vue.toDisplayString(m.name),
                    1
                    /* TEXT */
                  ),
                  m.foul > 0 ? (vue.openBlock(), vue.createElementBlock(
                    "text",
                    {
                      key: 0,
                      class: vue.normalizeClass(["foul-c", { red: m.foul >= 5, yellow: m.foul === 4 }])
                    },
                    vue.toDisplayString(m.foul),
                    3
                    /* TEXT, CLASS */
                  )) : vue.createCommentVNode("v-if", true)
                ], 10, ["onClick"]);
              }),
              128
              /* KEYED_FRAGMENT */
            ))
          ])
        ]),
        vue.createElementVNode("view", { class: "center" }, [
          vue.createElementVNode("view", { class: "score-board" }, [
            vue.createElementVNode(
              "text",
              { class: "score" },
              vue.toDisplayString($setup.hostScore),
              1
              /* TEXT */
            ),
            vue.createElementVNode("text", { class: "colon" }, ":"),
            vue.createElementVNode(
              "text",
              { class: "score" },
              vue.toDisplayString($setup.guestScore),
              1
              /* TEXT */
            )
          ]),
          vue.createElementVNode(
            "view",
            { class: "sync-tag" },
            "待同步 " + vue.toDisplayString($setup.syncNum),
            1
            /* TEXT */
          ),
          vue.createElementVNode("view", { class: "action-grid" }, [
            (vue.openBlock(true), vue.createElementBlock(
              vue.Fragment,
              null,
              vue.renderList($setup.quickActions, (a) => {
                return vue.openBlock(), vue.createElementBlock("view", {
                  key: a.type,
                  class: vue.normalizeClass(["action-btn", a.color]),
                  onClick: ($event) => $setup.onQuickAction(a)
                }, vue.toDisplayString(a.desc), 11, ["onClick"]);
              }),
              128
              /* KEYED_FRAGMENT */
            ))
          ]),
          vue.createElementVNode("view", { class: "row-btns" }, [
            vue.createElementVNode("view", {
              class: "r-btn blue",
              onClick: _cache[1] || (_cache[1] = ($event) => $setup.showAction = true)
            }, "更多动作"),
            vue.createElementVNode("view", {
              class: "r-btn orange",
              onClick: _cache[2] || (_cache[2] = ($event) => $setup.showChange = true)
            }, "换人")
          ]),
          vue.createElementVNode("scroll-view", {
            "scroll-y": "",
            class: "record-preview"
          }, [
            (vue.openBlock(true), vue.createElementBlock(
              vue.Fragment,
              null,
              vue.renderList($setup.records, (r) => {
                return vue.openBlock(), vue.createElementBlock("view", {
                  key: r.record_number,
                  class: "record-item"
                }, [
                  vue.createElementVNode(
                    "text",
                    { class: "r-team" },
                    vue.toDisplayString(r.team_name),
                    1
                    /* TEXT */
                  ),
                  vue.createElementVNode(
                    "text",
                    { class: "r-desc" },
                    vue.toDisplayString(r.description),
                    1
                    /* TEXT */
                  ),
                  vue.createElementVNode("text", {
                    class: "r-del",
                    onClick: ($event) => $setup.onDelete(r)
                  }, "删除", 8, ["onClick"])
                ]);
              }),
              128
              /* KEYED_FRAGMENT */
            ))
          ])
        ]),
        vue.createElementVNode("view", { class: "team-panel" }, [
          vue.createElementVNode(
            "view",
            { class: "panel-title" },
            vue.toDisplayString($setup.guestName),
            1
            /* TEXT */
          ),
          vue.createElementVNode("scroll-view", {
            "scroll-y": "",
            class: "player-list"
          }, [
            (vue.openBlock(true), vue.createElementBlock(
              vue.Fragment,
              null,
              vue.renderList($setup.guestMembers, (m) => {
                return vue.openBlock(), vue.createElementBlock("view", {
                  key: m.team_member_id,
                  class: vue.normalizeClass(["player", { sel: $setup.selectedId === m.team_member_id && $setup.selectedTeam === "guest", playing: Number(m.playing) }]),
                  onClick: ($event) => $setup.selectPlayer("guest", m)
                }, [
                  vue.createElementVNode(
                    "text",
                    { class: "num" },
                    vue.toDisplayString(m.number),
                    1
                    /* TEXT */
                  ),
                  vue.createElementVNode(
                    "text",
                    { class: "name" },
                    vue.toDisplayString(m.name),
                    1
                    /* TEXT */
                  ),
                  m.foul > 0 ? (vue.openBlock(), vue.createElementBlock(
                    "text",
                    {
                      key: 0,
                      class: vue.normalizeClass(["foul-c", { red: m.foul >= 5, yellow: m.foul === 4 }])
                    },
                    vue.toDisplayString(m.foul),
                    3
                    /* TEXT, CLASS */
                  )) : vue.createCommentVNode("v-if", true)
                ], 10, ["onClick"]);
              }),
              128
              /* KEYED_FRAGMENT */
            ))
          ])
        ])
      ]),
      vue.createVNode($setup["actionSheet"], {
        show: $setup.showAction,
        actions: $setup.basketActions,
        title: "选择动作",
        onSelect: $setup.onAction,
        onClose: _cache[3] || (_cache[3] = ($event) => $setup.showAction = false)
      }, null, 8, ["show", "actions"]),
      vue.createVNode($setup["changeMemberDialog"], {
        show: $setup.showChange,
        members: $setup.currentMembers,
        onConfirm: $setup.onChange,
        onClose: _cache[4] || (_cache[4] = ($event) => $setup.showChange = false)
      }, null, 8, ["show", "members"]),
      vue.createVNode($setup["sectionDialog"], {
        show: $setup.showSection,
        onSelect: $setup.onSection,
        onClose: _cache[5] || (_cache[5] = ($event) => $setup.showSection = false)
      }, null, 8, ["show"]),
      $setup.showKickoff ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 0,
        class: "kickoff-mask"
      }, [
        vue.createElementVNode("view", { class: "kickoff-tip" }, "选择开场球权"),
        vue.createElementVNode("view", { class: "kickoff-teams" }, [
          vue.createElementVNode(
            "view",
            {
              class: "kickoff-ball",
              onClick: _cache[6] || (_cache[6] = ($event) => $setup.onKickoff(1))
            },
            vue.toDisplayString($setup.homeName),
            1
            /* TEXT */
          ),
          vue.createElementVNode(
            "view",
            {
              class: "kickoff-ball",
              onClick: _cache[7] || (_cache[7] = ($event) => $setup.onKickoff(0))
            },
            vue.toDisplayString($setup.guestName),
            1
            /* TEXT */
          )
        ])
      ])) : vue.createCommentVNode("v-if", true)
    ]);
  }
  const PagesStatisticsBasketballOperate = /* @__PURE__ */ _export_sfc(_sfc_main$i, [["render", _sfc_render$h], ["__scopeId", "data-v-ef0dfe21"], ["__file", "F:/项目文件/uniapp版本/pages/statistics/basketball-operate.vue"]]);
  const _sfc_main$h = {
    __name: "football-operate",
    setup(__props, { expose: __expose }) {
      __expose();
      const statusBarHeight = uni.getSystemInfoSync().statusBarHeight || 0;
      const gameId = vue.ref("");
      const homeName = vue.ref("主队");
      const guestName = vue.ref("客队");
      const hostMembers2 = vue.ref([]);
      const guestMembers2 = vue.ref([]);
      const sections2 = vue.ref([]);
      const currentSectionIdx = vue.ref(0);
      const currentSection = vue.ref("");
      const currentSectionName = vue.ref("上半场");
      const selectedTeam = vue.ref("");
      const selectedId = vue.ref("");
      const selectedMember = vue.ref(null);
      const hostScore = vue.ref(0);
      const guestScore = vue.ref(0);
      const hostFoul = vue.ref(0);
      const guestFoul = vue.ref(0);
      const records = vue.ref([]);
      const battery = vue.ref(100);
      const syncNum = vue.ref(0);
      const showChange = vue.ref(false);
      const showSection = vue.ref(false);
      const footActions = FootActions;
      const currentMembers = vue.computed(() => selectedTeam.value === "host" ? hostMembers2.value : guestMembers2.value);
      const timerStr = vue.ref("00:00");
      const timerRunning = vue.ref(false);
      let timerSeconds = 0;
      let timerInterval = null;
      onLoad((opt) => {
        gameId.value = opt.gameId || "";
        homeName.value = opt.homeName || "主队";
        guestName.value = opt.guestName || "客队";
        loadMembers();
        loadSections();
        loadRecords();
        loadTimer();
        startUploadQueue(gameId.value, () => {
          loadRecords();
          updateSyncNum();
        });
        updateSyncNum();
      });
      vue.onUnmounted(() => {
        stopUploadQueue();
        stopTimer();
      });
      function loadMembers() {
        queryList("member", `game_id='${gameId.value}'`).then((list) => {
          hostMembers2.value = list.filter((m) => m.type === 1).map((m) => ({ ...m, foul: 0 }));
          guestMembers2.value = list.filter((m) => m.type === 0).map((m) => ({ ...m, foul: 0 }));
          loadStats();
        });
      }
      function loadSections() {
        queryList("game_section", `game_id='${gameId.value}'`, "sort ASC").then((list) => {
          sections2.value = list;
          if (list.length) {
            currentSection.value = list[0].section_id;
            currentSectionName.value = list[0].name;
          }
        });
      }
      function loadRecords() {
        selectSQL(
          `SELECT * FROM technical_record WHERE game_id='${gameId.value}' AND disable=0 AND "delete"=1 ORDER BY record_number DESC LIMIT 30`
        ).then((list) => records.value = list);
      }
      function loadStats() {
        selectSQL(`SELECT * FROM technical_record WHERE game_id='${gameId.value}' AND disable=0 AND "delete"=1`).then((list) => {
          let hs = 0, gs = 0, hf = 0, gf = 0;
          const foulMap = {};
          list.forEach((r) => {
            const sc = scoreOf(r.type, "football");
            const fl = isFoul(r.type, "football");
            if (r.team_type === 1) {
              hs += sc;
              if (fl)
                hf++;
            } else {
              gs += sc;
              if (fl)
                gf++;
            }
            if (fl && r.statistics_member_id)
              foulMap[r.statistics_member_id] = (foulMap[r.statistics_member_id] || 0) + 1;
          });
          hostScore.value = hs;
          guestScore.value = gs;
          hostFoul.value = hf;
          guestFoul.value = gf;
          hostMembers2.value.forEach((m) => m.foul = foulMap[m.team_member_id] || 0);
          guestMembers2.value.forEach((m) => m.foul = foulMap[m.team_member_id] || 0);
        });
      }
      function updateSyncNum() {
        pendingCount(gameId.value).then((n) => syncNum.value = n);
      }
      function selectPlayer(team, m) {
        selectedTeam.value = team;
        selectedId.value = m.team_member_id;
        selectedMember.value = m;
      }
      function onAction(a) {
        if (!selectedMember.value) {
          uni.showToast({ title: "请先选择球员", icon: "none" });
          return;
        }
        const team = selectedTeam.value;
        const member = selectedMember.value;
        const teamName = team === "host" ? homeName.value : guestName.value;
        const teamType = team === "host" ? 1 : 0;
        insertOrReplace("technical_record", {
          record_number: Date.now(),
          elapsed_time: timerSeconds,
          statistics_section_id: currentSection.value,
          type: a.type,
          statistics_member_id: member.team_member_id,
          description: `${member.name} ${a.desc}`,
          game_id: gameId.value,
          team_type: teamType,
          team_name: teamName,
          add: 0,
          delete: 1,
          is_need_upload: 0,
          disable: 0
        });
        const sc = scoreOf(a.type, "football");
        if (sc > 0) {
          if (team === "host")
            hostScore.value += sc;
          else
            guestScore.value += sc;
        }
        if (isFoul(a.type, "football")) {
          if (team === "host")
            hostFoul.value++;
          else
            guestFoul.value++;
          member.foul = (member.foul || 0) + 1;
        }
        loadRecords();
        updateSyncNum();
      }
      function onDelete(r) {
        cancelData({ gameId: gameId.value, recordNumber: r.record_number, statisticsMemberId: r.statistics_member_id }).then((res) => {
          if (res.code === 1) {
            executeSQL(`UPDATE technical_record SET disable=1, is_need_upload=1 WHERE record_number=${r.record_number}`);
            loadRecords();
            loadStats();
            updateSyncNum();
          }
        });
      }
      function onChange({ offId, onId }) {
        const team = selectedTeam.value || "host";
        const teamName = team === "host" ? homeName.value : guestName.value;
        const teamType = team === "host" ? 1 : 0;
        const members = team === "host" ? hostMembers2.value : guestMembers2.value;
        const offMember = members.find((m) => m.team_member_id === offId);
        const onMember = members.find((m) => m.team_member_id === onId);
        const base = Date.now();
        insertOrReplace("technical_record", { record_number: base, elapsed_time: timerSeconds, statistics_section_id: currentSection.value, type: 13, statistics_member_id: offId, description: `${offMember ? offMember.name : ""} 换下`, game_id: gameId.value, team_type: teamType, team_name: teamName, add: 0, delete: 1, is_need_upload: 0, disable: 0 });
        insertOrReplace("technical_record", { record_number: base + 1, elapsed_time: timerSeconds, statistics_section_id: currentSection.value, type: 14, statistics_member_id: onId, description: `${onMember ? onMember.name : ""} 换上`, game_id: gameId.value, team_type: teamType, team_name: teamName, add: 0, delete: 1, is_need_upload: 0, disable: 0 });
        loadRecords();
        updateSyncNum();
      }
      function onSection(t2) {
        if (t2 === "prev" && currentSectionIdx.value > 0)
          currentSectionIdx.value--;
        if (t2 === "next" && currentSectionIdx.value < sections2.value.length - 1)
          currentSectionIdx.value++;
        const sec = sections2.value[currentSectionIdx.value];
        if (sec) {
          currentSection.value = sec.section_id;
          currentSectionName.value = sec.name;
        }
      }
      function toggleTimer() {
        if (timerRunning.value)
          stopTimer();
        else
          startTimer();
      }
      function startTimer() {
        if (timerRunning.value)
          return;
        timerRunning.value = true;
        timerInterval = setInterval(() => {
          timerSeconds++;
          timerStr.value = msToMMSS(timerSeconds * 1e3);
          saveTimer();
        }, 1e3);
      }
      function stopTimer() {
        timerRunning.value = false;
        if (timerInterval)
          clearInterval(timerInterval);
        saveTimer();
      }
      function loadTimer() {
        timerSeconds = uni.getStorageSync("foot_timer_" + gameId.value) || 0;
        timerStr.value = msToMMSS(timerSeconds * 1e3);
      }
      function saveTimer() {
        uni.setStorageSync("foot_timer_" + gameId.value, timerSeconds);
      }
      function editTimer() {
        uni.showModal({
          title: "修改时间",
          editable: true,
          placeholderText: "mm:ss",
          content: timerStr.value,
          success: (r) => {
            if (r.confirm && r.content) {
              const parts = r.content.split(":").map(Number);
              timerSeconds = (parts[0] || 0) * 60 + (parts[1] || 0);
              timerStr.value = msToMMSS(timerSeconds * 1e3);
              saveTimer();
            }
          }
        });
      }
      function back() {
        uni.navigateBack();
      }
      const __returned__ = { statusBarHeight, gameId, homeName, guestName, hostMembers: hostMembers2, guestMembers: guestMembers2, sections: sections2, currentSectionIdx, currentSection, currentSectionName, selectedTeam, selectedId, selectedMember, hostScore, guestScore, hostFoul, guestFoul, records, battery, syncNum, showChange, showSection, footActions, currentMembers, timerStr, timerRunning, get timerSeconds() {
        return timerSeconds;
      }, set timerSeconds(v) {
        timerSeconds = v;
      }, get timerInterval() {
        return timerInterval;
      }, set timerInterval(v) {
        timerInterval = v;
      }, loadMembers, loadSections, loadRecords, loadStats, updateSyncNum, selectPlayer, onAction, onDelete, onChange, onSection, toggleTimer, startTimer, stopTimer, loadTimer, saveTimer, editTimer, back, ref: vue.ref, computed: vue.computed, onUnmounted: vue.onUnmounted, get onLoad() {
        return onLoad;
      }, batteryView, changeMemberDialog, sectionDialog, get queryList() {
        return queryList;
      }, get insertOrReplace() {
        return insertOrReplace;
      }, get executeSQL() {
        return executeSQL;
      }, get selectSQL() {
        return selectSQL;
      }, get startUploadQueue() {
        return startUploadQueue;
      }, get stopUploadQueue() {
        return stopUploadQueue;
      }, get pendingCount() {
        return pendingCount;
      }, get cancelData() {
        return cancelData;
      }, get FootActions() {
        return FootActions;
      }, get scoreOf() {
        return scoreOf;
      }, get isFoul() {
        return isFoul;
      }, get msToMMSS() {
        return msToMMSS;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$g(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "foot-operate" }, [
      vue.createElementVNode("view", { class: "top-bar" }, [
        vue.createElementVNode(
          "view",
          {
            class: "nav-status",
            style: vue.normalizeStyle({ height: $setup.statusBarHeight + "px" })
          },
          null,
          4
          /* STYLE */
        ),
        vue.createElementVNode("view", { class: "top-bar-inner" }, [
          vue.createElementVNode("view", {
            class: "back",
            onClick: $setup.back
          }, [
            vue.createElementVNode("image", {
              class: "back-icon",
              src: _imports_0$2,
              mode: "aspectFit"
            })
          ]),
          vue.createElementVNode("view", { class: "team-info" }, [
            vue.createElementVNode(
              "text",
              { class: "tname" },
              vue.toDisplayString($setup.homeName),
              1
              /* TEXT */
            ),
            vue.createElementVNode(
              "text",
              { class: "tag foul" },
              "犯规" + vue.toDisplayString($setup.hostFoul),
              1
              /* TEXT */
            )
          ]),
          vue.createElementVNode("view", { class: "timer-box" }, [
            vue.createElementVNode(
              "text",
              { class: "timer" },
              vue.toDisplayString($setup.timerStr),
              1
              /* TEXT */
            ),
            vue.createElementVNode("view", { class: "timer-btns" }, [
              vue.createElementVNode(
                "text",
                {
                  class: "t-btn",
                  onClick: $setup.toggleTimer
                },
                vue.toDisplayString($setup.timerRunning ? "暂停" : "开始"),
                1
                /* TEXT */
              ),
              vue.createElementVNode("text", {
                class: "t-btn",
                onClick: $setup.editTimer
              }, "改时间")
            ])
          ]),
          vue.createElementVNode("view", { class: "team-info" }, [
            vue.createElementVNode(
              "text",
              { class: "tag foul" },
              "犯规" + vue.toDisplayString($setup.guestFoul),
              1
              /* TEXT */
            ),
            vue.createElementVNode(
              "text",
              { class: "tname" },
              vue.toDisplayString($setup.guestName),
              1
              /* TEXT */
            )
          ]),
          vue.createVNode($setup["batteryView"], { power: $setup.battery }, null, 8, ["power"])
        ])
      ]),
      vue.createElementVNode("view", { class: "body" }, [
        vue.createElementVNode("view", { class: "team-panel" }, [
          vue.createElementVNode(
            "view",
            { class: "panel-title" },
            vue.toDisplayString($setup.homeName),
            1
            /* TEXT */
          ),
          vue.createElementVNode("scroll-view", {
            "scroll-y": "",
            class: "player-list"
          }, [
            (vue.openBlock(true), vue.createElementBlock(
              vue.Fragment,
              null,
              vue.renderList($setup.hostMembers, (m) => {
                return vue.openBlock(), vue.createElementBlock("view", {
                  key: m.team_member_id,
                  class: vue.normalizeClass(["player", { sel: $setup.selectedId === m.team_member_id && $setup.selectedTeam === "host" }]),
                  onClick: ($event) => $setup.selectPlayer("host", m)
                }, [
                  vue.createElementVNode(
                    "text",
                    { class: "num" },
                    vue.toDisplayString(m.number),
                    1
                    /* TEXT */
                  ),
                  vue.createElementVNode(
                    "text",
                    { class: "name" },
                    vue.toDisplayString(m.name),
                    1
                    /* TEXT */
                  ),
                  m.foul > 0 ? (vue.openBlock(), vue.createElementBlock(
                    "text",
                    {
                      key: 0,
                      class: vue.normalizeClass(["foul-c", { red: m.foul >= 5 }])
                    },
                    vue.toDisplayString(m.foul),
                    3
                    /* TEXT, CLASS */
                  )) : vue.createCommentVNode("v-if", true)
                ], 10, ["onClick"]);
              }),
              128
              /* KEYED_FRAGMENT */
            ))
          ])
        ]),
        vue.createElementVNode("view", { class: "center" }, [
          vue.createElementVNode("view", { class: "score-board" }, [
            vue.createElementVNode(
              "text",
              { class: "score" },
              vue.toDisplayString($setup.hostScore),
              1
              /* TEXT */
            ),
            vue.createElementVNode("text", { class: "colon" }, ":"),
            vue.createElementVNode(
              "text",
              { class: "score" },
              vue.toDisplayString($setup.guestScore),
              1
              /* TEXT */
            )
          ]),
          vue.createElementVNode(
            "view",
            {
              class: "section-btn",
              onClick: _cache[0] || (_cache[0] = ($event) => $setup.showSection = true)
            },
            vue.toDisplayString($setup.currentSectionName),
            1
            /* TEXT */
          ),
          vue.createElementVNode(
            "view",
            { class: "sync-tag" },
            "待同步 " + vue.toDisplayString($setup.syncNum),
            1
            /* TEXT */
          ),
          vue.createElementVNode("view", { class: "action-grid" }, [
            (vue.openBlock(true), vue.createElementBlock(
              vue.Fragment,
              null,
              vue.renderList($setup.footActions, (a) => {
                return vue.openBlock(), vue.createElementBlock("view", {
                  key: a.type,
                  class: vue.normalizeClass(["action-btn", a.color]),
                  onClick: ($event) => $setup.onAction(a)
                }, vue.toDisplayString(a.desc), 11, ["onClick"]);
              }),
              128
              /* KEYED_FRAGMENT */
            ))
          ]),
          vue.createElementVNode("view", { class: "row-btns" }, [
            vue.createElementVNode("view", {
              class: "r-btn orange",
              onClick: _cache[1] || (_cache[1] = ($event) => $setup.showChange = true)
            }, "换人")
          ]),
          vue.createElementVNode("scroll-view", {
            "scroll-y": "",
            class: "record-preview"
          }, [
            (vue.openBlock(true), vue.createElementBlock(
              vue.Fragment,
              null,
              vue.renderList($setup.records, (r) => {
                return vue.openBlock(), vue.createElementBlock("view", {
                  key: r.record_number,
                  class: "record-item"
                }, [
                  vue.createElementVNode(
                    "text",
                    { class: "r-team" },
                    vue.toDisplayString(r.team_name),
                    1
                    /* TEXT */
                  ),
                  vue.createElementVNode(
                    "text",
                    { class: "r-desc" },
                    vue.toDisplayString(r.description),
                    1
                    /* TEXT */
                  ),
                  vue.createElementVNode("text", {
                    class: "r-del",
                    onClick: ($event) => $setup.onDelete(r)
                  }, "删除", 8, ["onClick"])
                ]);
              }),
              128
              /* KEYED_FRAGMENT */
            ))
          ])
        ]),
        vue.createElementVNode("view", { class: "team-panel" }, [
          vue.createElementVNode(
            "view",
            { class: "panel-title" },
            vue.toDisplayString($setup.guestName),
            1
            /* TEXT */
          ),
          vue.createElementVNode("scroll-view", {
            "scroll-y": "",
            class: "player-list"
          }, [
            (vue.openBlock(true), vue.createElementBlock(
              vue.Fragment,
              null,
              vue.renderList($setup.guestMembers, (m) => {
                return vue.openBlock(), vue.createElementBlock("view", {
                  key: m.team_member_id,
                  class: vue.normalizeClass(["player", { sel: $setup.selectedId === m.team_member_id && $setup.selectedTeam === "guest" }]),
                  onClick: ($event) => $setup.selectPlayer("guest", m)
                }, [
                  vue.createElementVNode(
                    "text",
                    { class: "num" },
                    vue.toDisplayString(m.number),
                    1
                    /* TEXT */
                  ),
                  vue.createElementVNode(
                    "text",
                    { class: "name" },
                    vue.toDisplayString(m.name),
                    1
                    /* TEXT */
                  ),
                  m.foul > 0 ? (vue.openBlock(), vue.createElementBlock(
                    "text",
                    {
                      key: 0,
                      class: vue.normalizeClass(["foul-c", { red: m.foul >= 5 }])
                    },
                    vue.toDisplayString(m.foul),
                    3
                    /* TEXT, CLASS */
                  )) : vue.createCommentVNode("v-if", true)
                ], 10, ["onClick"]);
              }),
              128
              /* KEYED_FRAGMENT */
            ))
          ])
        ])
      ]),
      vue.createVNode($setup["changeMemberDialog"], {
        show: $setup.showChange,
        members: $setup.currentMembers,
        onConfirm: $setup.onChange,
        onClose: _cache[2] || (_cache[2] = ($event) => $setup.showChange = false)
      }, null, 8, ["show", "members"]),
      vue.createVNode($setup["sectionDialog"], {
        show: $setup.showSection,
        onSelect: $setup.onSection,
        onClose: _cache[3] || (_cache[3] = ($event) => $setup.showSection = false)
      }, null, 8, ["show"])
    ]);
  }
  const PagesStatisticsFootballOperate = /* @__PURE__ */ _export_sfc(_sfc_main$h, [["render", _sfc_render$g], ["__scopeId", "data-v-6d1135d0"], ["__file", "F:/项目文件/uniapp版本/pages/statistics/football-operate.vue"]]);
  const _sfc_main$g = {
    __name: "basketball-operate-new",
    setup(__props, { expose: __expose }) {
      __expose();
      const statusBarHeight = uni.getSystemInfoSync().statusBarHeight || 0;
      const gameId = vue.ref("");
      const homeName = vue.ref("主队");
      const guestName = vue.ref("客队");
      const hostMembers2 = vue.ref([]);
      const guestMembers2 = vue.ref([]);
      const sections2 = vue.ref([]);
      const currentSectionIdx = vue.ref(0);
      const currentSection = vue.ref("");
      const currentSectionName = vue.ref("第1节");
      const selectedTeam = vue.ref("");
      const selectedMember = vue.ref(null);
      const hostScore = vue.ref(0);
      const guestScore = vue.ref(0);
      const hostFoul = vue.ref(0);
      const guestFoul = vue.ref(0);
      const hostPause = vue.ref(0);
      const guestPause = vue.ref(0);
      const records = vue.ref([]);
      const syncNum = vue.ref(0);
      const showAction = vue.ref(false);
      const showSection = vue.ref(false);
      const showAdd = vue.ref(false);
      const showChange = vue.ref(false);
      const addTeam = vue.ref("host");
      const basketActions = BasketActions;
      const currentMembers = vue.computed(() => selectedTeam.value === "host" ? hostMembers2.value : guestMembers2.value);
      onLoad((opt) => {
        gameId.value = opt.gameId || "";
        homeName.value = opt.homeName || "主队";
        guestName.value = opt.guestName || "客队";
        loadGameData();
        loadMembers();
        loadRecords();
        startUploadQueue(gameId.value, () => {
          loadRecords();
          updateSyncNum();
        });
        updateSyncNum();
      });
      vue.onUnmounted(() => stopUploadQueue());
      onBackPress(() => true);
      function loadGameData() {
        getGameDetail(gameId.value, "basketball").then((res) => {
          if (res.code !== 1)
            return;
          const page2 = res.data || {};
          const g = page2.game || {};
          if (g.hostTeamName)
            homeName.value = g.hostTeamName;
          if (g.guestTeamName)
            guestName.value = g.guestTeamName;
          hostScore.value = g.hostTeamScore || 0;
          guestScore.value = g.guestTeamScore || 0;
        });
        loadSections();
      }
      function loadSections() {
        queryList("game_section", `game_id='${gameId.value}'`, "sort ASC").then((list) => {
          sections2.value = list;
          if (list.length) {
            currentSection.value = list[0].section_id;
            currentSectionName.value = list[0].name;
          }
        });
      }
      function loadMembers() {
        queryList("member", `game_id='${gameId.value}'`).then((list) => {
          hostMembers2.value = list.filter((m) => m.type === 1).map((m) => ({ ...m, foul: 0 }));
          guestMembers2.value = list.filter((m) => m.type === 0).map((m) => ({ ...m, foul: 0 }));
          loadStats();
        });
      }
      function loadRecords() {
        selectSQL(
          `SELECT * FROM technical_record WHERE game_id='${gameId.value}' AND disable=0 AND "delete"=1 ORDER BY record_number DESC LIMIT 30`
        ).then((list) => records.value = list);
      }
      function loadStats() {
        selectSQL(`SELECT * FROM technical_record WHERE game_id='${gameId.value}' AND disable=0 AND "delete"=1`).then((list) => {
          let hf = 0, gf = 0, hp = 0, gp = 0;
          const foulMap = {};
          list.forEach((r) => {
            if (isFoul(r.type, "basketball")) {
              if (r.team_type === 1)
                hf++;
              else
                gf++;
              if (r.statistics_member_id)
                foulMap[r.statistics_member_id] = (foulMap[r.statistics_member_id] || 0) + 1;
            }
            if (r.type === 5)
              r.team_type === 1 ? hp++ : gp++;
          });
          hostFoul.value = hf;
          guestFoul.value = gf;
          hostPause.value = hp;
          guestPause.value = gp;
          hostMembers2.value.forEach((m) => m.foul = foulMap[m.team_member_id] || 0);
          guestMembers2.value.forEach((m) => m.foul = foulMap[m.team_member_id] || 0);
        });
      }
      function updateSyncNum() {
        pendingCount(gameId.value).then((n) => syncNum.value = n);
      }
      function onPlayer(team, m) {
        selectedTeam.value = team;
        selectedMember.value = m;
        showAction.value = true;
      }
      function onAction(a) {
        const team = selectedTeam.value;
        const member = selectedMember.value;
        if (!member)
          return;
        const teamName = team === "host" ? homeName.value : guestName.value;
        const teamType = team === "host" ? 1 : 0;
        insertOrReplace("technical_record", {
          record_number: Date.now(),
          elapsed_time: 0,
          statistics_section_id: currentSection.value,
          type: a.type,
          statistics_member_id: member.team_member_id,
          description: `${member.name} ${a.desc}`,
          game_id: gameId.value,
          team_type: teamType,
          team_name: teamName,
          add: 0,
          delete: 1,
          is_need_upload: 0,
          disable: 0
        });
        const sc = scoreOf(a.type, "basketball");
        if (sc > 0) {
          if (team === "host")
            hostScore.value += sc;
          else
            guestScore.value += sc;
        }
        if (isFoul(a.type, "basketball")) {
          if (team === "host")
            hostFoul.value++;
          else
            guestFoul.value++;
          member.foul = (member.foul || 0) + 1;
        }
        if (a.type === BasketType.PAUSE) {
          if (team === "host")
            hostPause.value++;
          else
            guestPause.value++;
        }
        loadRecords();
        updateSyncNum();
      }
      function onDelete(r) {
        cancelData({ gameId: gameId.value, recordNumber: r.record_number, statisticsMemberId: r.statistics_member_id }).then((res) => {
          if (res.code === 1) {
            executeSQL(`UPDATE technical_record SET disable=1, is_need_upload=1 WHERE record_number=${r.record_number}`);
            loadRecords();
            loadStats();
            updateSyncNum();
          }
        });
      }
      function onChange({ offId, onId }) {
        const team = selectedTeam.value;
        const teamName = team === "host" ? homeName.value : guestName.value;
        const teamType = team === "host" ? 1 : 0;
        const base = Date.now();
        insertOrReplace("technical_record", { record_number: base, elapsed_time: 0, statistics_section_id: currentSection.value, type: 13, statistics_member_id: offId, description: "换下", game_id: gameId.value, team_type: teamType, team_name: teamName, add: 0, delete: 1, is_need_upload: 0, disable: 0 });
        insertOrReplace("technical_record", { record_number: base + 1, elapsed_time: 0, statistics_section_id: currentSection.value, type: 14, statistics_member_id: onId, description: "换上", game_id: gameId.value, team_type: teamType, team_name: teamName, add: 0, delete: 1, is_need_upload: 0, disable: 0 });
        loadRecords();
        updateSyncNum();
      }
      function onAdd(form) {
        addTeam.value === "host" ? 1 : 0;
        const members = addTeam.value === "host" ? hostMembers2.value : guestMembers2.value;
        const gameTeamId = members[0] ? members[0].game_id : "";
        addMember({ gameTeamId, number: form.number, name: form.name, position: form.position }).then((res) => {
          if (res.code === 1) {
            refreshTeam(addTeam.value, gameTeamId);
            showAdd.value = false;
          }
        });
      }
      function refreshTeam(team, gameTeamId) {
        if (!gameTeamId)
          return;
        getMember(gameTeamId).then((res) => {
          if (res.code !== 1)
            return;
          const list = (res.data || []).map((m) => {
            var _a, _b;
            return { ...m, team_member_id: m.teamMemberId, foul: 0, type: team === "host" ? 1 : 0, game_id: gameId.value, number: m.number, name: m.name, startingLineup: ((_a = m.startingLineup) == null ? void 0 : _a.boolean) ? 1 : 0, playing: ((_b = m.playing) == null ? void 0 : _b.boolean) ? 1 : 0 };
          });
          if (team === "host")
            hostMembers2.value = list;
          else
            guestMembers2.value = list;
          deleteWhere("member", `game_id='${gameId.value}' AND type=${team === "host" ? 1 : 0}`);
          list.forEach((m) => {
            insertOrReplace("member", {
              team_member_id: m.team_member_id,
              game_id: gameId.value,
              type: m.type,
              name: m.name,
              number: m.number,
              startingLineup: m.startingLineup,
              playing: m.playing
            });
          });
        });
      }
      function onUploadAll() {
        selectSQL(`SELECT * FROM technical_record WHERE game_id='${gameId.value}' AND is_need_upload=0 AND disable=0`).then((list) => {
          if (!list.length) {
            uni.showToast({ title: "无待上传记录", icon: "none" });
            return;
          }
          const statisticsList = list.map((r) => ({
            description: r.description,
            recordNumber: r.record_number,
            statisticsMemberId: r.statistics_member_id,
            statisticsSectionId: r.statistics_section_id,
            type: r.type
          }));
          uploadDataAll({ statisticsList }).then((res) => {
            if (res.code === 1) {
              list.forEach((r) => {
                executeSQL(`UPDATE technical_record SET is_need_upload=1 WHERE record_number=${r.record_number}`);
              });
              updateSyncNum();
              uni.showToast({ title: "上传成功", icon: "none" });
            }
          });
        });
      }
      function onSection(t2) {
        if (t2 === "prev" && currentSectionIdx.value > 0)
          currentSectionIdx.value--;
        if (t2 === "next" && currentSectionIdx.value < sections2.value.length - 1)
          currentSectionIdx.value++;
        const sec = sections2.value[currentSectionIdx.value];
        if (sec) {
          currentSection.value = sec.section_id;
          currentSectionName.value = sec.name;
        }
      }
      function back() {
        uni.showModal({
          title: "提示",
          content: "确定退出统计？",
          success: (r) => {
            if (r.confirm)
              uni.navigateBack();
          }
        });
      }
      const __returned__ = { statusBarHeight, gameId, homeName, guestName, hostMembers: hostMembers2, guestMembers: guestMembers2, sections: sections2, currentSectionIdx, currentSection, currentSectionName, selectedTeam, selectedMember, hostScore, guestScore, hostFoul, guestFoul, hostPause, guestPause, records, syncNum, showAction, showSection, showAdd, showChange, addTeam, basketActions, currentMembers, loadGameData, loadSections, loadMembers, loadRecords, loadStats, updateSyncNum, onPlayer, onAction, onDelete, onChange, onAdd, refreshTeam, onUploadAll, onSection, back, ref: vue.ref, computed: vue.computed, onUnmounted: vue.onUnmounted, get onLoad() {
        return onLoad;
      }, get onBackPress() {
        return onBackPress;
      }, actionSheet, sectionDialog, addMemberDialog, changeMemberDialog, get getGameDetail() {
        return getGameDetail;
      }, get getMember() {
        return getMember;
      }, get addMember() {
        return addMember;
      }, get uploadDataAll() {
        return uploadDataAll;
      }, get cancelData() {
        return cancelData;
      }, get queryList() {
        return queryList;
      }, get insertOrReplace() {
        return insertOrReplace;
      }, get executeSQL() {
        return executeSQL;
      }, get selectSQL() {
        return selectSQL;
      }, get deleteWhere() {
        return deleteWhere;
      }, get startUploadQueue() {
        return startUploadQueue;
      }, get stopUploadQueue() {
        return stopUploadQueue;
      }, get pendingCount() {
        return pendingCount;
      }, get BasketActions() {
        return BasketActions;
      }, get BasketType() {
        return BasketType;
      }, get scoreOf() {
        return scoreOf;
      }, get isFoul() {
        return isFoul;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$f(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "basket-new" }, [
      vue.createElementVNode("view", { class: "top-bar" }, [
        vue.createElementVNode(
          "view",
          {
            class: "nav-status",
            style: vue.normalizeStyle({ height: $setup.statusBarHeight + "px" })
          },
          null,
          4
          /* STYLE */
        ),
        vue.createElementVNode("view", { class: "top-bar-inner" }, [
          vue.createElementVNode("view", {
            class: "back",
            onClick: $setup.back
          }, [
            vue.createElementVNode("image", {
              class: "back-icon",
              src: _imports_0$2,
              mode: "aspectFit"
            })
          ]),
          vue.createElementVNode("text", { class: "title" }, "篮球统计"),
          vue.createElementVNode("text", {
            class: "upload-btn",
            onClick: $setup.onUploadAll
          }, "打包上传")
        ])
      ]),
      vue.createElementVNode("view", { class: "score-board" }, [
        vue.createElementVNode("view", { class: "team-score" }, [
          vue.createElementVNode(
            "text",
            { class: "tname" },
            vue.toDisplayString($setup.homeName),
            1
            /* TEXT */
          ),
          vue.createElementVNode(
            "text",
            { class: "score" },
            vue.toDisplayString($setup.hostScore),
            1
            /* TEXT */
          )
        ]),
        vue.createElementVNode("text", { class: "colon" }, ":"),
        vue.createElementVNode("view", { class: "team-score" }, [
          vue.createElementVNode(
            "text",
            { class: "score" },
            vue.toDisplayString($setup.guestScore),
            1
            /* TEXT */
          ),
          vue.createElementVNode(
            "text",
            { class: "tname" },
            vue.toDisplayString($setup.guestName),
            1
            /* TEXT */
          )
        ])
      ]),
      vue.createElementVNode("view", { class: "ctrl-row" }, [
        vue.createElementVNode(
          "view",
          {
            class: "section-btn",
            onClick: _cache[0] || (_cache[0] = ($event) => $setup.showSection = true)
          },
          vue.toDisplayString($setup.currentSectionName) + " ▼",
          1
          /* TEXT */
        ),
        vue.createElementVNode(
          "view",
          { class: "stat-info" },
          "主 犯规" + vue.toDisplayString($setup.hostFoul) + " 暂停" + vue.toDisplayString($setup.hostPause) + " | 客 犯规" + vue.toDisplayString($setup.guestFoul) + " 暂停" + vue.toDisplayString($setup.guestPause),
          1
          /* TEXT */
        ),
        vue.createElementVNode(
          "view",
          { class: "sync-tag" },
          "待同步 " + vue.toDisplayString($setup.syncNum),
          1
          /* TEXT */
        )
      ]),
      vue.createElementVNode("view", { class: "teams" }, [
        vue.createElementVNode("view", { class: "team-col" }, [
          vue.createElementVNode(
            "view",
            { class: "col-title" },
            vue.toDisplayString($setup.homeName),
            1
            /* TEXT */
          ),
          vue.createElementVNode("scroll-view", {
            "scroll-y": "",
            class: "player-list"
          }, [
            (vue.openBlock(true), vue.createElementBlock(
              vue.Fragment,
              null,
              vue.renderList($setup.hostMembers, (m) => {
                return vue.openBlock(), vue.createElementBlock("view", {
                  key: m.team_member_id,
                  class: "player",
                  onClick: ($event) => $setup.onPlayer("host", m)
                }, [
                  vue.createElementVNode(
                    "text",
                    { class: "num" },
                    vue.toDisplayString(m.number),
                    1
                    /* TEXT */
                  ),
                  vue.createElementVNode(
                    "text",
                    { class: "name" },
                    vue.toDisplayString(m.name),
                    1
                    /* TEXT */
                  ),
                  m.foul > 0 ? (vue.openBlock(), vue.createElementBlock(
                    "text",
                    {
                      key: 0,
                      class: vue.normalizeClass(["foul-c", { red: m.foul >= 5 }])
                    },
                    vue.toDisplayString(m.foul),
                    3
                    /* TEXT, CLASS */
                  )) : vue.createCommentVNode("v-if", true)
                ], 8, ["onClick"]);
              }),
              128
              /* KEYED_FRAGMENT */
            ))
          ]),
          vue.createElementVNode("view", {
            class: "add-btn",
            onClick: _cache[1] || (_cache[1] = ($event) => {
              $setup.addTeam = "host";
              $setup.showAdd = true;
            })
          }, "+ 加球员")
        ]),
        vue.createElementVNode("view", { class: "team-col" }, [
          vue.createElementVNode(
            "view",
            { class: "col-title" },
            vue.toDisplayString($setup.guestName),
            1
            /* TEXT */
          ),
          vue.createElementVNode("scroll-view", {
            "scroll-y": "",
            class: "player-list"
          }, [
            (vue.openBlock(true), vue.createElementBlock(
              vue.Fragment,
              null,
              vue.renderList($setup.guestMembers, (m) => {
                return vue.openBlock(), vue.createElementBlock("view", {
                  key: m.team_member_id,
                  class: "player",
                  onClick: ($event) => $setup.onPlayer("guest", m)
                }, [
                  vue.createElementVNode(
                    "text",
                    { class: "num" },
                    vue.toDisplayString(m.number),
                    1
                    /* TEXT */
                  ),
                  vue.createElementVNode(
                    "text",
                    { class: "name" },
                    vue.toDisplayString(m.name),
                    1
                    /* TEXT */
                  ),
                  m.foul > 0 ? (vue.openBlock(), vue.createElementBlock(
                    "text",
                    {
                      key: 0,
                      class: vue.normalizeClass(["foul-c", { red: m.foul >= 5 }])
                    },
                    vue.toDisplayString(m.foul),
                    3
                    /* TEXT, CLASS */
                  )) : vue.createCommentVNode("v-if", true)
                ], 8, ["onClick"]);
              }),
              128
              /* KEYED_FRAGMENT */
            ))
          ]),
          vue.createElementVNode("view", {
            class: "add-btn",
            onClick: _cache[2] || (_cache[2] = ($event) => {
              $setup.addTeam = "guest";
              $setup.showAdd = true;
            })
          }, "+ 加球员")
        ])
      ]),
      vue.createElementVNode("view", { class: "record-bar" }, [
        vue.createElementVNode("view", { class: "rb-title" }, "最近记录"),
        vue.createElementVNode("scroll-view", {
          "scroll-y": "",
          class: "rec-list"
        }, [
          (vue.openBlock(true), vue.createElementBlock(
            vue.Fragment,
            null,
            vue.renderList($setup.records, (r) => {
              return vue.openBlock(), vue.createElementBlock("view", {
                key: r.record_number,
                class: "rec-item"
              }, [
                vue.createElementVNode(
                  "text",
                  { class: "r-desc" },
                  vue.toDisplayString(r.description),
                  1
                  /* TEXT */
                ),
                vue.createElementVNode("text", {
                  class: "r-del",
                  onClick: ($event) => $setup.onDelete(r)
                }, "删除", 8, ["onClick"])
              ]);
            }),
            128
            /* KEYED_FRAGMENT */
          ))
        ])
      ]),
      vue.createVNode($setup["actionSheet"], {
        show: $setup.showAction,
        actions: $setup.basketActions,
        title: $setup.selectedMember ? $setup.selectedMember.name : "选择动作",
        onSelect: $setup.onAction,
        onClose: _cache[3] || (_cache[3] = ($event) => $setup.showAction = false)
      }, null, 8, ["show", "actions", "title"]),
      vue.createVNode($setup["sectionDialog"], {
        show: $setup.showSection,
        onSelect: $setup.onSection,
        onClose: _cache[4] || (_cache[4] = ($event) => $setup.showSection = false)
      }, null, 8, ["show"]),
      vue.createVNode($setup["addMemberDialog"], {
        show: $setup.showAdd,
        sport: "basketball",
        onConfirm: $setup.onAdd,
        onClose: _cache[5] || (_cache[5] = ($event) => $setup.showAdd = false)
      }, null, 8, ["show"]),
      vue.createVNode($setup["changeMemberDialog"], {
        show: $setup.showChange,
        members: $setup.currentMembers,
        onConfirm: $setup.onChange,
        onClose: _cache[6] || (_cache[6] = ($event) => $setup.showChange = false)
      }, null, 8, ["show", "members"])
    ]);
  }
  const PagesStatisticsBasketballOperateNew = /* @__PURE__ */ _export_sfc(_sfc_main$g, [["render", _sfc_render$f], ["__scopeId", "data-v-c3cd0a4d"], ["__file", "F:/项目文件/uniapp版本/pages/statistics/basketball-operate-new.vue"]]);
  const _sfc_main$f = {
    __name: "basketball-down",
    setup(__props, { expose: __expose }) {
      __expose();
      const statusBarHeight = uni.getSystemInfoSync().statusBarHeight || 0;
      const gameId = vue.ref("");
      const homeName = vue.ref("主队");
      const guestName = vue.ref("客队");
      const hostMembers2 = vue.ref([]);
      const guestMembers2 = vue.ref([]);
      const sections2 = vue.ref([]);
      const currentSectionIdx = vue.ref(0);
      const currentSection = vue.ref("");
      const currentSectionName = vue.ref("第1节");
      const selectedTeam = vue.ref("");
      const selectedMember = vue.ref(null);
      const hostScore = vue.ref(0);
      const guestScore = vue.ref(0);
      const hostFoul = vue.ref(0);
      const guestFoul = vue.ref(0);
      const hostStop = vue.ref(0);
      const guestStop = vue.ref(0);
      const syncing = vue.ref(false);
      const showAction = vue.ref(false);
      const showChange = vue.ref(false);
      const showSection = vue.ref(false);
      const basketActions = BasketActions;
      const currentMembers = vue.computed(() => selectedTeam.value === "host" ? hostMembers2.value : guestMembers2.value);
      onLoad((opt) => {
        gameId.value = opt.gameId || "";
        loadData();
        on(EventBus.RECORD_REFRESH, loadData);
      });
      vue.onUnmounted(() => {
        off(EventBus.RECORD_REFRESH, loadData);
      });
      function loadData() {
        if (!gameId.value)
          return;
        syncing.value = true;
        getGameBasketballDetail(gameId.value).then((res) => {
          if (res.code !== 1)
            return;
          const d = res.data || {};
          const g = d.game || {};
          homeName.value = g.hostTeamName || homeName.value;
          guestName.value = g.guestTeamName || guestName.value;
          hostScore.value = g.hostTeamScore || 0;
          guestScore.value = g.guestTeamScore || 0;
          hostFoul.value = d.hostTeamFoul || 0;
          guestFoul.value = d.guestTeamFoul || 0;
          hostStop.value = d.hostTeamStop || 0;
          guestStop.value = d.guestTeamStop || 0;
          hostMembers2.value = d.hostMembers || [];
          guestMembers2.value = d.guestMembers || [];
          sections2.value = d.sections || [];
          const running = sections2.value.find((s) => s.running && s.running.boolean);
          if (running) {
            currentSection.value = running.gameSectionId;
            currentSectionName.value = running.name;
            currentSectionIdx.value = sections2.value.findIndex((s) => s.gameSectionId === running.gameSectionId);
          } else if (sections2.value.length) {
            currentSection.value = sections2.value[0].gameSectionId;
            currentSectionName.value = sections2.value[0].name;
          }
        }).finally(() => {
          syncing.value = false;
        });
      }
      function onPlayer(team, m) {
        selectedTeam.value = team;
        selectedMember.value = m;
        showAction.value = true;
      }
      function onAction(a) {
        const team = selectedTeam.value;
        const member = selectedMember.value;
        if (!member)
          return;
        const teamType = team === "host" ? 1 : 0;
        uploading2();
        uploadData({
          description: `${member.name} ${a.desc}`,
          recordNumber: Date.now(),
          statisticsMemberId: member.teamMemberId,
          statisticsSectionId: currentSection.value,
          type: a.type,
          index: 0,
          host_guest: teamType
        }).then((res) => {
          if (res.code === 1)
            loadData();
        }).finally(done);
      }
      function onChange({ offId, onId }) {
        const team = selectedTeam.value;
        const teamType = team === "host" ? 1 : 0;
        const base = Date.now();
        uploading2();
        uploadData({
          description: "换下",
          recordNumber: base,
          statisticsMemberId: offId,
          statisticsSectionId: currentSection.value,
          type: 13,
          index: 0,
          host_guest: teamType
        }).then((res) => {
          if (res.code === 1) {
            return uploadData({
              description: "换上",
              recordNumber: base + 1,
              statisticsMemberId: onId,
              statisticsSectionId: currentSection.value,
              type: 14,
              index: 0,
              host_guest: teamType
            });
          }
        }).then((res) => {
          if (res && res.code === 1)
            loadData();
        }).finally(done);
      }
      function onSection(t2) {
        if (t2 === "prev" && currentSectionIdx.value > 0)
          currentSectionIdx.value--;
        if (t2 === "next" && currentSectionIdx.value < sections2.value.length - 1)
          currentSectionIdx.value++;
        const sec = sections2.value[currentSectionIdx.value];
        if (sec) {
          currentSection.value = sec.gameSectionId;
          currentSectionName.value = sec.name;
        }
        if (t2 === "start" || t2 === "end") {
          uploading2();
          sectionRunning(currentSection.value).then((res) => {
            if (res.code === 1)
              loadData();
          }).finally(done);
        }
      }
      let syncCount = 0;
      function uploading2() {
        syncCount++;
        syncing.value = true;
      }
      function done() {
        syncCount = Math.max(0, syncCount - 1);
        if (syncCount === 0)
          syncing.value = false;
      }
      function back() {
        uni.navigateBack();
      }
      const __returned__ = { statusBarHeight, gameId, homeName, guestName, hostMembers: hostMembers2, guestMembers: guestMembers2, sections: sections2, currentSectionIdx, currentSection, currentSectionName, selectedTeam, selectedMember, hostScore, guestScore, hostFoul, guestFoul, hostStop, guestStop, syncing, showAction, showChange, showSection, basketActions, currentMembers, loadData, onPlayer, onAction, onChange, onSection, get syncCount() {
        return syncCount;
      }, set syncCount(v) {
        syncCount = v;
      }, uploading: uploading2, done, back, ref: vue.ref, computed: vue.computed, onUnmounted: vue.onUnmounted, get onLoad() {
        return onLoad;
      }, actionSheet, changeMemberDialog, sectionDialog, get getGameBasketballDetail() {
        return getGameBasketballDetail;
      }, get uploadData() {
        return uploadData;
      }, get sectionRunning() {
        return sectionRunning;
      }, get cancelData() {
        return cancelData;
      }, get BasketActions() {
        return BasketActions;
      }, get scoreOf() {
        return scoreOf;
      }, get isFoul() {
        return isFoul;
      }, get on() {
        return on;
      }, get off() {
        return off;
      }, get EventBus() {
        return EventBus;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$e(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "basket-down" }, [
      vue.createElementVNode("view", { class: "top-bar" }, [
        vue.createElementVNode(
          "view",
          {
            class: "nav-status",
            style: vue.normalizeStyle({ height: $setup.statusBarHeight + "px" })
          },
          null,
          4
          /* STYLE */
        ),
        vue.createElementVNode("view", { class: "top-bar-inner" }, [
          vue.createElementVNode("view", {
            class: "back",
            onClick: $setup.back
          }, [
            vue.createElementVNode("image", {
              class: "back-icon",
              src: _imports_0$2,
              mode: "aspectFit"
            })
          ]),
          vue.createElementVNode("view", { class: "teams-name" }, [
            vue.createElementVNode(
              "text",
              { class: "tname red" },
              vue.toDisplayString($setup.homeName),
              1
              /* TEXT */
            ),
            vue.createElementVNode("text", { class: "vs" }, "vs"),
            vue.createElementVNode(
              "text",
              { class: "tname blue" },
              vue.toDisplayString($setup.guestName),
              1
              /* TEXT */
            )
          ])
        ])
      ]),
      vue.createElementVNode("view", { class: "score-box" }, [
        vue.createElementVNode(
          "text",
          { class: "score" },
          vue.toDisplayString($setup.hostScore),
          1
          /* TEXT */
        ),
        vue.createElementVNode("text", { class: "colon" }, ":"),
        vue.createElementVNode(
          "text",
          { class: "score" },
          vue.toDisplayString($setup.guestScore),
          1
          /* TEXT */
        )
      ]),
      vue.createElementVNode("view", { class: "ctrl-row" }, [
        vue.createElementVNode(
          "view",
          {
            class: "section-box",
            onClick: _cache[0] || (_cache[0] = ($event) => $setup.showSection = true)
          },
          vue.toDisplayString($setup.currentSectionName) + " ▼",
          1
          /* TEXT */
        ),
        vue.createElementVNode(
          "view",
          { class: "stat-info" },
          "主 犯规" + vue.toDisplayString($setup.hostFoul) + " 暂停" + vue.toDisplayString($setup.hostStop) + " | 客 犯规" + vue.toDisplayString($setup.guestFoul) + " 暂停" + vue.toDisplayString($setup.guestStop),
          1
          /* TEXT */
        )
      ]),
      vue.createElementVNode("view", { class: "teams" }, [
        vue.createElementVNode("scroll-view", {
          "scroll-y": "",
          class: "team-col"
        }, [
          (vue.openBlock(true), vue.createElementBlock(
            vue.Fragment,
            null,
            vue.renderList($setup.hostMembers, (m) => {
              return vue.openBlock(), vue.createElementBlock("view", {
                key: m.teamMemberId,
                class: "player",
                onClick: ($event) => $setup.onPlayer("host", m)
              }, [
                vue.createElementVNode(
                  "text",
                  { class: "num" },
                  vue.toDisplayString(m.number),
                  1
                  /* TEXT */
                ),
                vue.createElementVNode(
                  "text",
                  { class: "name" },
                  vue.toDisplayString(m.name),
                  1
                  /* TEXT */
                ),
                m.foul > 0 ? (vue.openBlock(), vue.createElementBlock(
                  "text",
                  {
                    key: 0,
                    class: vue.normalizeClass(["foul-c", { red: m.foul >= 5 }])
                  },
                  vue.toDisplayString(m.foul),
                  3
                  /* TEXT, CLASS */
                )) : vue.createCommentVNode("v-if", true)
              ], 8, ["onClick"]);
            }),
            128
            /* KEYED_FRAGMENT */
          ))
        ]),
        vue.createElementVNode("scroll-view", {
          "scroll-y": "",
          class: "team-col"
        }, [
          (vue.openBlock(true), vue.createElementBlock(
            vue.Fragment,
            null,
            vue.renderList($setup.guestMembers, (m) => {
              return vue.openBlock(), vue.createElementBlock("view", {
                key: m.teamMemberId,
                class: "player",
                onClick: ($event) => $setup.onPlayer("guest", m)
              }, [
                vue.createElementVNode(
                  "text",
                  { class: "num" },
                  vue.toDisplayString(m.number),
                  1
                  /* TEXT */
                ),
                vue.createElementVNode(
                  "text",
                  { class: "name" },
                  vue.toDisplayString(m.name),
                  1
                  /* TEXT */
                ),
                m.foul > 0 ? (vue.openBlock(), vue.createElementBlock(
                  "text",
                  {
                    key: 0,
                    class: vue.normalizeClass(["foul-c", { red: m.foul >= 5 }])
                  },
                  vue.toDisplayString(m.foul),
                  3
                  /* TEXT, CLASS */
                )) : vue.createCommentVNode("v-if", true)
              ], 8, ["onClick"]);
            }),
            128
            /* KEYED_FRAGMENT */
          ))
        ])
      ]),
      vue.createElementVNode("view", { class: "sync-bar" }, [
        vue.createElementVNode(
          "text",
          { class: "sync-num" },
          vue.toDisplayString($setup.syncing ? "同步中…" : "已同步"),
          1
          /* TEXT */
        ),
        vue.createElementVNode("view", {
          class: "sync-btn",
          onClick: $setup.loadData
        }, "刷新")
      ]),
      vue.createVNode($setup["actionSheet"], {
        show: $setup.showAction,
        actions: $setup.basketActions,
        title: $setup.selectedMember ? $setup.selectedMember.name : "选择动作",
        onSelect: $setup.onAction,
        onClose: _cache[1] || (_cache[1] = ($event) => $setup.showAction = false)
      }, null, 8, ["show", "actions", "title"]),
      vue.createVNode($setup["changeMemberDialog"], {
        show: $setup.showChange,
        members: $setup.currentMembers,
        onConfirm: $setup.onChange,
        onClose: _cache[2] || (_cache[2] = ($event) => $setup.showChange = false)
      }, null, 8, ["show", "members"]),
      vue.createVNode($setup["sectionDialog"], {
        show: $setup.showSection,
        onSelect: $setup.onSection,
        onClose: _cache[3] || (_cache[3] = ($event) => $setup.showSection = false)
      }, null, 8, ["show"])
    ]);
  }
  const PagesStatisticsBasketballDown = /* @__PURE__ */ _export_sfc(_sfc_main$f, [["render", _sfc_render$e], ["__scopeId", "data-v-2960a474"], ["__file", "F:/项目文件/uniapp版本/pages/statistics/basketball-down.vue"]]);
  const scoreTypes$2 = "6,7,8";
  const foulTypes$2 = "9";
  const _sfc_main$e = {
    __name: "record",
    setup(__props, { expose: __expose }) {
      __expose();
      const statusBarHeight = uni.getSystemInfoSync().statusBarHeight || 0;
      const gameId = vue.ref("");
      const tabs = ["全部", "得分", "犯规"];
      const current = vue.ref(0);
      const records = vue.ref([]);
      onLoad((opt) => {
        gameId.value = opt.gameId || "";
        loadRecords();
      });
      function switchTab(i) {
        current.value = i;
        loadRecords();
      }
      function loadRecords() {
        let where = `game_id='${gameId.value}' AND disable=0 AND "delete"=1`;
        if (current.value === 1)
          where += ` AND type IN (${scoreTypes$2})`;
        if (current.value === 2)
          where += ` AND type IN (${foulTypes$2})`;
        Promise.all([
          selectSQL(`SELECT * FROM technical_record WHERE ${where} ORDER BY record_number DESC`),
          selectSQL(`SELECT * FROM member WHERE game_id='${gameId.value}'`),
          selectSQL(`SELECT * FROM game_section WHERE game_id='${gameId.value}'`)
        ]).then(([recs, members, secs]) => {
          const memberMap = {};
          members.forEach((m) => memberMap[m.team_member_id] = m.name);
          const secMap = {};
          secs.forEach((s) => secMap[s.section_id] = s.name);
          records.value = recs.map((r) => ({
            ...r,
            member_name: memberMap[r.statistics_member_id] || "",
            section_name: secMap[r.statistics_section_id] || ""
          }));
        });
      }
      function canDelete(r) {
        return ![13, 14, 15, 16].includes(r.type);
      }
      function onDelete(r) {
        executeSQL(`UPDATE technical_record SET disable=1 WHERE record_number=${r.record_number}`).then(() => {
          loadRecords();
        });
      }
      function back() {
        uni.navigateBack();
      }
      const __returned__ = { statusBarHeight, gameId, tabs, current, records, scoreTypes: scoreTypes$2, foulTypes: foulTypes$2, switchTab, loadRecords, canDelete, onDelete, back, ref: vue.ref, get onLoad() {
        return onLoad;
      }, emptyLayout, get selectSQL() {
        return selectSQL;
      }, get executeSQL() {
        return executeSQL;
      }, get typeDesc() {
        return typeDesc;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$d(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "record-page" }, [
      vue.createElementVNode("view", { class: "top-bar" }, [
        vue.createElementVNode(
          "view",
          {
            class: "nav-status",
            style: vue.normalizeStyle({ height: $setup.statusBarHeight + "px" })
          },
          null,
          4
          /* STYLE */
        ),
        vue.createElementVNode("view", { class: "top-bar-inner" }, [
          vue.createElementVNode("view", {
            class: "back",
            onClick: $setup.back
          }, [
            vue.createElementVNode("image", {
              class: "back-icon",
              src: _imports_0$2,
              mode: "aspectFit"
            })
          ]),
          vue.createElementVNode("view", { class: "tabs" }, [
            (vue.openBlock(), vue.createElementBlock(
              vue.Fragment,
              null,
              vue.renderList($setup.tabs, (t2, i) => {
                return vue.createElementVNode("text", {
                  key: i,
                  class: vue.normalizeClass(["tab", { active: $setup.current === i }]),
                  onClick: ($event) => $setup.switchTab(i)
                }, vue.toDisplayString(t2), 11, ["onClick"]);
              }),
              64
              /* STABLE_FRAGMENT */
            ))
          ])
        ])
      ]),
      vue.createElementVNode("scroll-view", {
        "scroll-y": "",
        class: "list"
      }, [
        (vue.openBlock(true), vue.createElementBlock(
          vue.Fragment,
          null,
          vue.renderList($setup.records, (r) => {
            return vue.openBlock(), vue.createElementBlock("view", {
              key: r.record_number,
              class: "rec-item"
            }, [
              vue.createElementVNode("view", { class: "rec-info" }, [
                vue.createElementVNode(
                  "text",
                  { class: "r-section" },
                  vue.toDisplayString(r.section_name),
                  1
                  /* TEXT */
                ),
                vue.createElementVNode(
                  "text",
                  { class: "r-team" },
                  vue.toDisplayString(r.team_name),
                  1
                  /* TEXT */
                ),
                vue.createElementVNode(
                  "text",
                  { class: "r-player" },
                  vue.toDisplayString(r.member_name),
                  1
                  /* TEXT */
                ),
                vue.createElementVNode(
                  "text",
                  { class: "r-type" },
                  vue.toDisplayString($setup.typeDesc(r.type, "basketball")),
                  1
                  /* TEXT */
                )
              ]),
              $setup.canDelete(r) ? (vue.openBlock(), vue.createElementBlock("text", {
                key: 0,
                class: "r-del",
                onClick: ($event) => $setup.onDelete(r)
              }, "删除", 8, ["onClick"])) : vue.createCommentVNode("v-if", true)
            ]);
          }),
          128
          /* KEYED_FRAGMENT */
        )),
        !$setup.records.length ? (vue.openBlock(), vue.createBlock($setup["emptyLayout"], {
          key: 0,
          status: "empty"
        })) : vue.createCommentVNode("v-if", true)
      ])
    ]);
  }
  const PagesRecordRecord = /* @__PURE__ */ _export_sfc(_sfc_main$e, [["render", _sfc_render$d], ["__scopeId", "data-v-ef6850c5"], ["__file", "F:/项目文件/uniapp版本/pages/record/record.vue"]]);
  const scoreTypes$1 = "18,19";
  const foulTypes$1 = "9";
  const _sfc_main$d = {
    __name: "record-foot",
    setup(__props, { expose: __expose }) {
      __expose();
      const statusBarHeight = uni.getSystemInfoSync().statusBarHeight || 0;
      const gameId = vue.ref("");
      const tabs = ["全部", "得分", "犯规"];
      const current = vue.ref(0);
      const records = vue.ref([]);
      onLoad((opt) => {
        gameId.value = opt.gameId || "";
        loadRecords();
      });
      function switchTab(i) {
        current.value = i;
        loadRecords();
      }
      function loadRecords() {
        let where = `game_id='${gameId.value}' AND disable=0 AND "delete"=1`;
        if (current.value === 1)
          where += ` AND type IN (${scoreTypes$1})`;
        if (current.value === 2)
          where += ` AND type IN (${foulTypes$1})`;
        Promise.all([
          selectSQL(`SELECT * FROM technical_record WHERE ${where} ORDER BY record_number DESC`),
          selectSQL(`SELECT * FROM member WHERE game_id='${gameId.value}'`),
          selectSQL(`SELECT * FROM game_section WHERE game_id='${gameId.value}'`)
        ]).then(([recs, members, secs]) => {
          const memberMap = {};
          members.forEach((m) => memberMap[m.team_member_id] = m.name);
          const secMap = {};
          secs.forEach((s) => secMap[s.section_id] = s.name);
          records.value = recs.map((r) => ({
            ...r,
            member_name: memberMap[r.statistics_member_id] || "",
            section_name: secMap[r.statistics_section_id] || ""
          }));
        });
      }
      function canDelete(r) {
        return ![13, 14, 15, 16].includes(r.type);
      }
      function onDelete(r) {
        executeSQL(`UPDATE technical_record SET disable=1 WHERE record_number=${r.record_number}`).then(() => {
          loadRecords();
        });
      }
      function back() {
        uni.navigateBack();
      }
      const __returned__ = { statusBarHeight, gameId, tabs, current, records, scoreTypes: scoreTypes$1, foulTypes: foulTypes$1, switchTab, loadRecords, canDelete, onDelete, back, ref: vue.ref, get onLoad() {
        return onLoad;
      }, emptyLayout, get selectSQL() {
        return selectSQL;
      }, get executeSQL() {
        return executeSQL;
      }, get typeDesc() {
        return typeDesc;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$c(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "record-page" }, [
      vue.createElementVNode("view", { class: "top-bar" }, [
        vue.createElementVNode(
          "view",
          {
            class: "nav-status",
            style: vue.normalizeStyle({ height: $setup.statusBarHeight + "px" })
          },
          null,
          4
          /* STYLE */
        ),
        vue.createElementVNode("view", { class: "top-bar-inner" }, [
          vue.createElementVNode("view", {
            class: "back",
            onClick: $setup.back
          }, [
            vue.createElementVNode("image", {
              class: "back-icon",
              src: _imports_0$2,
              mode: "aspectFit"
            })
          ]),
          vue.createElementVNode("view", { class: "tabs" }, [
            (vue.openBlock(), vue.createElementBlock(
              vue.Fragment,
              null,
              vue.renderList($setup.tabs, (t2, i) => {
                return vue.createElementVNode("text", {
                  key: i,
                  class: vue.normalizeClass(["tab", { active: $setup.current === i }]),
                  onClick: ($event) => $setup.switchTab(i)
                }, vue.toDisplayString(t2), 11, ["onClick"]);
              }),
              64
              /* STABLE_FRAGMENT */
            ))
          ])
        ])
      ]),
      vue.createElementVNode("scroll-view", {
        "scroll-y": "",
        class: "list"
      }, [
        (vue.openBlock(true), vue.createElementBlock(
          vue.Fragment,
          null,
          vue.renderList($setup.records, (r) => {
            return vue.openBlock(), vue.createElementBlock("view", {
              key: r.record_number,
              class: "rec-item"
            }, [
              vue.createElementVNode("view", { class: "rec-info" }, [
                vue.createElementVNode(
                  "text",
                  { class: "r-section" },
                  vue.toDisplayString(r.section_name),
                  1
                  /* TEXT */
                ),
                vue.createElementVNode(
                  "text",
                  { class: "r-team" },
                  vue.toDisplayString(r.team_name),
                  1
                  /* TEXT */
                ),
                vue.createElementVNode(
                  "text",
                  { class: "r-player" },
                  vue.toDisplayString(r.member_name),
                  1
                  /* TEXT */
                ),
                vue.createElementVNode(
                  "text",
                  { class: "r-type" },
                  vue.toDisplayString($setup.typeDesc(r.type, "football")),
                  1
                  /* TEXT */
                )
              ]),
              $setup.canDelete(r) ? (vue.openBlock(), vue.createElementBlock("text", {
                key: 0,
                class: "r-del",
                onClick: ($event) => $setup.onDelete(r)
              }, "删除", 8, ["onClick"])) : vue.createCommentVNode("v-if", true)
            ]);
          }),
          128
          /* KEYED_FRAGMENT */
        )),
        !$setup.records.length ? (vue.openBlock(), vue.createBlock($setup["emptyLayout"], {
          key: 0,
          status: "empty"
        })) : vue.createCommentVNode("v-if", true)
      ])
    ]);
  }
  const PagesRecordRecordFoot = /* @__PURE__ */ _export_sfc(_sfc_main$d, [["render", _sfc_render$c], ["__scopeId", "data-v-cef4c907"], ["__file", "F:/项目文件/uniapp版本/pages/record/record-foot.vue"]]);
  const scoreTypes = "6,7,8";
  const foulTypes = "9,119,120,121";
  const _sfc_main$c = {
    __name: "record-new",
    setup(__props, { expose: __expose }) {
      __expose();
      const statusBarHeight = uni.getSystemInfoSync().statusBarHeight || 0;
      const gameId = vue.ref("");
      const tabs = ["全部", "得分", "犯规"];
      const current = vue.ref(0);
      const records = vue.ref([]);
      onLoad((opt) => {
        gameId.value = opt.gameId || "";
        loadRecords();
      });
      function switchTab(i) {
        current.value = i;
        loadRecords();
      }
      function loadRecords() {
        let where = `game_id='${gameId.value}' AND disable=0 AND "delete"=1`;
        if (current.value === 1)
          where += ` AND type IN (${scoreTypes})`;
        if (current.value === 2)
          where += ` AND type IN (${foulTypes})`;
        Promise.all([
          selectSQL(`SELECT * FROM technical_record WHERE ${where} ORDER BY record_number DESC`),
          selectSQL(`SELECT * FROM member WHERE game_id='${gameId.value}'`),
          selectSQL(`SELECT * FROM game_section WHERE game_id='${gameId.value}'`)
        ]).then(([recs, members, secs]) => {
          const memberMap = {};
          members.forEach((m) => memberMap[m.team_member_id] = m.name);
          const secMap = {};
          secs.forEach((s) => secMap[s.section_id] = s.name);
          records.value = recs.map((r) => ({
            ...r,
            member_name: memberMap[r.statistics_member_id] || "",
            section_name: secMap[r.statistics_section_id] || ""
          }));
        });
      }
      function canDelete(r) {
        return ![13, 14, 15, 16].includes(r.type);
      }
      function onDelete(r) {
        executeSQL(`UPDATE technical_record SET disable=1 WHERE record_number=${r.record_number}`).then(() => {
          loadRecords();
        });
      }
      function back() {
        uni.navigateBack();
      }
      const __returned__ = { statusBarHeight, gameId, tabs, current, records, scoreTypes, foulTypes, switchTab, loadRecords, canDelete, onDelete, back, ref: vue.ref, get onLoad() {
        return onLoad;
      }, emptyLayout, get selectSQL() {
        return selectSQL;
      }, get executeSQL() {
        return executeSQL;
      }, get typeDesc() {
        return typeDesc;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$b(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "record-new" }, [
      vue.createElementVNode("view", { class: "top-bar" }, [
        vue.createElementVNode(
          "view",
          {
            class: "nav-status",
            style: vue.normalizeStyle({ height: $setup.statusBarHeight + "px" })
          },
          null,
          4
          /* STYLE */
        ),
        vue.createElementVNode("view", { class: "top-bar-inner" }, [
          vue.createElementVNode("view", {
            class: "back",
            onClick: $setup.back
          }, [
            vue.createElementVNode("image", {
              class: "back-icon",
              src: _imports_0$2,
              mode: "aspectFit"
            })
          ]),
          vue.createElementVNode("text", { class: "title" }, "操作记录"),
          vue.createElementVNode("view", { class: "tabs" }, [
            (vue.openBlock(), vue.createElementBlock(
              vue.Fragment,
              null,
              vue.renderList($setup.tabs, (t2, i) => {
                return vue.createElementVNode("text", {
                  key: i,
                  class: vue.normalizeClass(["tab", { active: $setup.current === i }]),
                  onClick: ($event) => $setup.switchTab(i)
                }, vue.toDisplayString(t2), 11, ["onClick"]);
              }),
              64
              /* STABLE_FRAGMENT */
            ))
          ])
        ])
      ]),
      vue.createElementVNode("scroll-view", {
        "scroll-y": "",
        class: "list"
      }, [
        (vue.openBlock(true), vue.createElementBlock(
          vue.Fragment,
          null,
          vue.renderList($setup.records, (r) => {
            return vue.openBlock(), vue.createElementBlock("view", {
              key: r.record_number,
              class: "rec-item"
            }, [
              vue.createElementVNode("view", { class: "rec-info" }, [
                vue.createElementVNode(
                  "text",
                  { class: "r-section" },
                  vue.toDisplayString(r.section_name),
                  1
                  /* TEXT */
                ),
                vue.createElementVNode(
                  "text",
                  { class: "r-team" },
                  vue.toDisplayString(r.team_name),
                  1
                  /* TEXT */
                ),
                vue.createElementVNode(
                  "text",
                  { class: "r-player" },
                  vue.toDisplayString(r.member_name),
                  1
                  /* TEXT */
                ),
                vue.createElementVNode(
                  "text",
                  { class: "r-type" },
                  vue.toDisplayString($setup.typeDesc(r.type, "basketball")),
                  1
                  /* TEXT */
                )
              ]),
              $setup.canDelete(r) ? (vue.openBlock(), vue.createElementBlock("text", {
                key: 0,
                class: "r-del",
                onClick: ($event) => $setup.onDelete(r)
              }, "删除", 8, ["onClick"])) : vue.createCommentVNode("v-if", true)
            ]);
          }),
          128
          /* KEYED_FRAGMENT */
        )),
        !$setup.records.length ? (vue.openBlock(), vue.createBlock($setup["emptyLayout"], {
          key: 0,
          status: "empty"
        })) : vue.createCommentVNode("v-if", true)
      ])
    ]);
  }
  const PagesRecordRecordNew = /* @__PURE__ */ _export_sfc(_sfc_main$c, [["render", _sfc_render$b], ["__scopeId", "data-v-ec7ed095"], ["__file", "F:/项目文件/uniapp版本/pages/record/record-new.vue"]]);
  const _sfc_main$b = {
    __name: "member-data",
    setup(__props, { expose: __expose }) {
      __expose();
      const statusBarHeight = uni.getSystemInfoSync().statusBarHeight || 0;
      const gameId = vue.ref("");
      const homeName = vue.ref("主队");
      const guestName = vue.ref("客队");
      const team = vue.ref("host");
      const rows = vue.ref([]);
      const total = vue.ref({});
      onLoad((opt) => {
        gameId.value = opt.gameId || "";
        homeName.value = opt.homeName || "主队";
        guestName.value = opt.guestName || "客队";
        load();
      });
      function switchTeam(t2) {
        team.value = t2;
        load();
      }
      function load() {
        const teamType = team.value === "host" ? 1 : 0;
        Promise.all([
          selectSQL(`SELECT * FROM member WHERE game_id='${gameId.value}' AND type=${teamType}`),
          selectSQL(`SELECT * FROM technical_record WHERE game_id='${gameId.value}' AND disable=0 AND "delete"=1 AND team_type=${teamType}`)
        ]).then(([members, recs]) => {
          const rowsData = members.map((m) => ({
            ...m,
            stats: aggregateMemberStats(recs.filter((r) => r.statistics_member_id === m.team_member_id))
          }));
          rows.value = rowsData;
          const t2 = {
            score: 0,
            board: 0,
            assists: 0,
            steals: 0,
            block: 0,
            foul: 0,
            shots_total: 0,
            shots_success: 0,
            thirds_total: 0,
            thirds_success: 0,
            penalty_total: 0,
            penalty_success: 0,
            miss: 0,
            turnover: 0
          };
          rowsData.forEach((r) => Object.keys(t2).forEach((k) => t2[k] += r.stats[k]));
          total.value = t2;
        });
      }
      function back() {
        uni.navigateBack();
      }
      const __returned__ = { statusBarHeight, gameId, homeName, guestName, team, rows, total, switchTeam, load, back, ref: vue.ref, get onLoad() {
        return onLoad;
      }, get selectSQL() {
        return selectSQL;
      }, get aggregateMemberStats() {
        return aggregateMemberStats;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$a(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "member-data" }, [
      vue.createElementVNode("view", { class: "top-bar" }, [
        vue.createElementVNode(
          "view",
          {
            class: "nav-status",
            style: vue.normalizeStyle({ height: $setup.statusBarHeight + "px" })
          },
          null,
          4
          /* STYLE */
        ),
        vue.createElementVNode("view", { class: "top-bar-inner" }, [
          vue.createElementVNode("view", {
            class: "back",
            onClick: $setup.back
          }, [
            vue.createElementVNode("image", {
              class: "back-icon",
              src: _imports_0$2,
              mode: "aspectFit"
            })
          ]),
          vue.createElementVNode("view", { class: "radio-group" }, [
            vue.createElementVNode(
              "text",
              {
                class: vue.normalizeClass(["radio", { on: $setup.team === "host" }]),
                onClick: _cache[0] || (_cache[0] = ($event) => $setup.switchTeam("host"))
              },
              vue.toDisplayString($setup.homeName),
              3
              /* TEXT, CLASS */
            ),
            vue.createElementVNode(
              "text",
              {
                class: vue.normalizeClass(["radio", { on: $setup.team === "guest" }]),
                onClick: _cache[1] || (_cache[1] = ($event) => $setup.switchTeam("guest"))
              },
              vue.toDisplayString($setup.guestName),
              3
              /* TEXT, CLASS */
            )
          ])
        ])
      ]),
      vue.createElementVNode("scroll-view", {
        "scroll-x": "",
        class: "table-scroll"
      }, [
        vue.createElementVNode("view", { class: "table" }, [
          vue.createElementVNode("view", { class: "tr head" }, [
            vue.createElementVNode("text", { class: "td num" }, "号码"),
            vue.createElementVNode("text", { class: "td name" }, "姓名"),
            vue.createElementVNode("text", { class: "td" }, "得分"),
            vue.createElementVNode("text", { class: "td" }, "篮板"),
            vue.createElementVNode("text", { class: "td" }, "助攻"),
            vue.createElementVNode("text", { class: "td" }, "抢断"),
            vue.createElementVNode("text", { class: "td" }, "盖帽"),
            vue.createElementVNode("text", { class: "td" }, "投篮"),
            vue.createElementVNode("text", { class: "td" }, "三分"),
            vue.createElementVNode("text", { class: "td" }, "罚球"),
            vue.createElementVNode("text", { class: "td" }, "失误"),
            vue.createElementVNode("text", { class: "td" }, "犯规")
          ]),
          (vue.openBlock(true), vue.createElementBlock(
            vue.Fragment,
            null,
            vue.renderList($setup.rows, (m) => {
              return vue.openBlock(), vue.createElementBlock("view", {
                key: m.team_member_id,
                class: "tr"
              }, [
                vue.createElementVNode(
                  "text",
                  { class: "td num" },
                  vue.toDisplayString(m.number),
                  1
                  /* TEXT */
                ),
                vue.createElementVNode(
                  "text",
                  { class: "td name" },
                  vue.toDisplayString(m.name),
                  1
                  /* TEXT */
                ),
                vue.createElementVNode(
                  "text",
                  { class: "td" },
                  vue.toDisplayString(m.stats.score),
                  1
                  /* TEXT */
                ),
                vue.createElementVNode(
                  "text",
                  { class: "td" },
                  vue.toDisplayString(m.stats.board),
                  1
                  /* TEXT */
                ),
                vue.createElementVNode(
                  "text",
                  { class: "td" },
                  vue.toDisplayString(m.stats.assists),
                  1
                  /* TEXT */
                ),
                vue.createElementVNode(
                  "text",
                  { class: "td" },
                  vue.toDisplayString(m.stats.steals),
                  1
                  /* TEXT */
                ),
                vue.createElementVNode(
                  "text",
                  { class: "td" },
                  vue.toDisplayString(m.stats.block),
                  1
                  /* TEXT */
                ),
                vue.createElementVNode(
                  "text",
                  { class: "td" },
                  vue.toDisplayString(m.stats.shots_success) + "/" + vue.toDisplayString(m.stats.shots_total),
                  1
                  /* TEXT */
                ),
                vue.createElementVNode(
                  "text",
                  { class: "td" },
                  vue.toDisplayString(m.stats.thirds_success) + "/" + vue.toDisplayString(m.stats.thirds_total),
                  1
                  /* TEXT */
                ),
                vue.createElementVNode(
                  "text",
                  { class: "td" },
                  vue.toDisplayString(m.stats.penalty_success) + "/" + vue.toDisplayString(m.stats.penalty_total),
                  1
                  /* TEXT */
                ),
                vue.createElementVNode(
                  "text",
                  { class: "td" },
                  vue.toDisplayString(m.stats.turnover),
                  1
                  /* TEXT */
                ),
                vue.createElementVNode(
                  "text",
                  { class: "td" },
                  vue.toDisplayString(m.stats.foul),
                  1
                  /* TEXT */
                )
              ]);
            }),
            128
            /* KEYED_FRAGMENT */
          )),
          vue.createElementVNode("view", { class: "tr total" }, [
            vue.createElementVNode("text", { class: "td num" }, "合计"),
            vue.createElementVNode("text", { class: "td name" }),
            vue.createElementVNode(
              "text",
              { class: "td" },
              vue.toDisplayString($setup.total.score),
              1
              /* TEXT */
            ),
            vue.createElementVNode(
              "text",
              { class: "td" },
              vue.toDisplayString($setup.total.board),
              1
              /* TEXT */
            ),
            vue.createElementVNode(
              "text",
              { class: "td" },
              vue.toDisplayString($setup.total.assists),
              1
              /* TEXT */
            ),
            vue.createElementVNode(
              "text",
              { class: "td" },
              vue.toDisplayString($setup.total.steals),
              1
              /* TEXT */
            ),
            vue.createElementVNode(
              "text",
              { class: "td" },
              vue.toDisplayString($setup.total.block),
              1
              /* TEXT */
            ),
            vue.createElementVNode(
              "text",
              { class: "td" },
              vue.toDisplayString($setup.total.shots_success) + "/" + vue.toDisplayString($setup.total.shots_total),
              1
              /* TEXT */
            ),
            vue.createElementVNode(
              "text",
              { class: "td" },
              vue.toDisplayString($setup.total.thirds_success) + "/" + vue.toDisplayString($setup.total.thirds_total),
              1
              /* TEXT */
            ),
            vue.createElementVNode(
              "text",
              { class: "td" },
              vue.toDisplayString($setup.total.penalty_success) + "/" + vue.toDisplayString($setup.total.penalty_total),
              1
              /* TEXT */
            ),
            vue.createElementVNode(
              "text",
              { class: "td" },
              vue.toDisplayString($setup.total.turnover),
              1
              /* TEXT */
            ),
            vue.createElementVNode(
              "text",
              { class: "td" },
              vue.toDisplayString($setup.total.foul),
              1
              /* TEXT */
            )
          ])
        ])
      ])
    ]);
  }
  const PagesGameMemberData = /* @__PURE__ */ _export_sfc(_sfc_main$b, [["render", _sfc_render$a], ["__scopeId", "data-v-f4187503"], ["__file", "F:/项目文件/uniapp版本/pages/game/member-data.vue"]]);
  const _sfc_main$a = {
    __name: "new-member-data",
    setup(__props, { expose: __expose }) {
      __expose();
      const statusBarHeight = uni.getSystemInfoSync().statusBarHeight || 0;
      const gameId = vue.ref("");
      const homeName = vue.ref("主队");
      const guestName = vue.ref("客队");
      const hostRows = vue.ref([]);
      const guestRows = vue.ref([]);
      const hostTotal = vue.ref({});
      const guestTotal = vue.ref({});
      onLoad((opt) => {
        gameId.value = opt.gameId || "";
        homeName.value = opt.homeName || "主队";
        guestName.value = opt.guestName || "客队";
        load();
      });
      function load() {
        selectSQL(`SELECT * FROM technical_record WHERE game_id='${gameId.value}' AND disable=0 AND "delete"=1`).then((recs) => {
          Promise.all([
            selectSQL(`SELECT * FROM member WHERE game_id='${gameId.value}' AND type=1`),
            selectSQL(`SELECT * FROM member WHERE game_id='${gameId.value}' AND type=0`)
          ]).then(([hostMembers2, guestMembers2]) => {
            hostRows.value = hostMembers2.map((m) => ({ ...m, stats: aggregateMemberStats(recs.filter((r) => r.statistics_member_id === m.team_member_id)) }));
            guestRows.value = guestMembers2.map((m) => ({ ...m, stats: aggregateMemberStats(recs.filter((r) => r.statistics_member_id === m.team_member_id)) }));
            hostTotal.value = sumTotal(hostRows.value);
            guestTotal.value = sumTotal(guestRows.value);
          });
        });
      }
      function sumTotal(rows) {
        const t2 = { score: 0, board: 0, assists: 0, steals: 0, block: 0, foul: 0 };
        rows.forEach((r) => Object.keys(t2).forEach((k) => t2[k] += r.stats[k]));
        return t2;
      }
      function back() {
        uni.navigateBack();
      }
      const __returned__ = { statusBarHeight, gameId, homeName, guestName, hostRows, guestRows, hostTotal, guestTotal, load, sumTotal, back, ref: vue.ref, get onLoad() {
        return onLoad;
      }, get selectSQL() {
        return selectSQL;
      }, get aggregateMemberStats() {
        return aggregateMemberStats;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$9(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "new-member-data" }, [
      vue.createElementVNode("view", { class: "top-bar" }, [
        vue.createElementVNode(
          "view",
          {
            class: "nav-status",
            style: vue.normalizeStyle({ height: $setup.statusBarHeight + "px" })
          },
          null,
          4
          /* STYLE */
        ),
        vue.createElementVNode("view", { class: "top-bar-inner" }, [
          vue.createElementVNode("view", {
            class: "back",
            onClick: $setup.back
          }, [
            vue.createElementVNode("image", {
              class: "back-icon",
              src: _imports_0$2,
              mode: "aspectFit"
            })
          ]),
          vue.createElementVNode("text", { class: "title" }, "比赛数据")
        ])
      ]),
      vue.createElementVNode("scroll-view", {
        "scroll-y": "",
        class: "body"
      }, [
        vue.createElementVNode("view", { class: "score-head" }, [
          vue.createElementVNode(
            "text",
            null,
            "总分 " + vue.toDisplayString($setup.hostTotal.score) + " : " + vue.toDisplayString($setup.guestTotal.score),
            1
            /* TEXT */
          )
        ]),
        vue.createElementVNode("view", { class: "team-table" }, [
          vue.createElementVNode(
            "text",
            { class: "th" },
            vue.toDisplayString($setup.homeName),
            1
            /* TEXT */
          ),
          vue.createElementVNode("view", { class: "tr head" }, [
            vue.createElementVNode("text", { class: "td num" }, "号"),
            vue.createElementVNode("text", { class: "td name" }, "姓名"),
            vue.createElementVNode("text", { class: "td" }, "分"),
            vue.createElementVNode("text", { class: "td" }, "板"),
            vue.createElementVNode("text", { class: "td" }, "助"),
            vue.createElementVNode("text", { class: "td" }, "抢"),
            vue.createElementVNode("text", { class: "td" }, "帽"),
            vue.createElementVNode("text", { class: "td" }, "犯")
          ]),
          (vue.openBlock(true), vue.createElementBlock(
            vue.Fragment,
            null,
            vue.renderList($setup.hostRows, (m) => {
              return vue.openBlock(), vue.createElementBlock("view", {
                key: m.team_member_id,
                class: "tr"
              }, [
                vue.createElementVNode(
                  "text",
                  { class: "td num" },
                  vue.toDisplayString(m.number),
                  1
                  /* TEXT */
                ),
                vue.createElementVNode(
                  "text",
                  { class: "td name" },
                  vue.toDisplayString(m.name),
                  1
                  /* TEXT */
                ),
                vue.createElementVNode(
                  "text",
                  { class: "td" },
                  vue.toDisplayString(m.stats.score),
                  1
                  /* TEXT */
                ),
                vue.createElementVNode(
                  "text",
                  { class: "td" },
                  vue.toDisplayString(m.stats.board),
                  1
                  /* TEXT */
                ),
                vue.createElementVNode(
                  "text",
                  { class: "td" },
                  vue.toDisplayString(m.stats.assists),
                  1
                  /* TEXT */
                ),
                vue.createElementVNode(
                  "text",
                  { class: "td" },
                  vue.toDisplayString(m.stats.steals),
                  1
                  /* TEXT */
                ),
                vue.createElementVNode(
                  "text",
                  { class: "td" },
                  vue.toDisplayString(m.stats.block),
                  1
                  /* TEXT */
                ),
                vue.createElementVNode(
                  "text",
                  { class: "td" },
                  vue.toDisplayString(m.stats.foul),
                  1
                  /* TEXT */
                )
              ]);
            }),
            128
            /* KEYED_FRAGMENT */
          )),
          vue.createElementVNode("view", { class: "tr total" }, [
            vue.createElementVNode("text", { class: "td num" }, "合计"),
            vue.createElementVNode("text", { class: "td name" }),
            vue.createElementVNode(
              "text",
              { class: "td" },
              vue.toDisplayString($setup.hostTotal.score),
              1
              /* TEXT */
            ),
            vue.createElementVNode(
              "text",
              { class: "td" },
              vue.toDisplayString($setup.hostTotal.board),
              1
              /* TEXT */
            ),
            vue.createElementVNode(
              "text",
              { class: "td" },
              vue.toDisplayString($setup.hostTotal.assists),
              1
              /* TEXT */
            ),
            vue.createElementVNode(
              "text",
              { class: "td" },
              vue.toDisplayString($setup.hostTotal.steals),
              1
              /* TEXT */
            ),
            vue.createElementVNode(
              "text",
              { class: "td" },
              vue.toDisplayString($setup.hostTotal.block),
              1
              /* TEXT */
            ),
            vue.createElementVNode(
              "text",
              { class: "td" },
              vue.toDisplayString($setup.hostTotal.foul),
              1
              /* TEXT */
            )
          ])
        ]),
        vue.createElementVNode("view", { class: "team-table" }, [
          vue.createElementVNode(
            "text",
            { class: "th" },
            vue.toDisplayString($setup.guestName),
            1
            /* TEXT */
          ),
          vue.createElementVNode("view", { class: "tr head" }, [
            vue.createElementVNode("text", { class: "td num" }, "号"),
            vue.createElementVNode("text", { class: "td name" }, "姓名"),
            vue.createElementVNode("text", { class: "td" }, "分"),
            vue.createElementVNode("text", { class: "td" }, "板"),
            vue.createElementVNode("text", { class: "td" }, "助"),
            vue.createElementVNode("text", { class: "td" }, "抢"),
            vue.createElementVNode("text", { class: "td" }, "帽"),
            vue.createElementVNode("text", { class: "td" }, "犯")
          ]),
          (vue.openBlock(true), vue.createElementBlock(
            vue.Fragment,
            null,
            vue.renderList($setup.guestRows, (m) => {
              return vue.openBlock(), vue.createElementBlock("view", {
                key: m.team_member_id,
                class: "tr"
              }, [
                vue.createElementVNode(
                  "text",
                  { class: "td num" },
                  vue.toDisplayString(m.number),
                  1
                  /* TEXT */
                ),
                vue.createElementVNode(
                  "text",
                  { class: "td name" },
                  vue.toDisplayString(m.name),
                  1
                  /* TEXT */
                ),
                vue.createElementVNode(
                  "text",
                  { class: "td" },
                  vue.toDisplayString(m.stats.score),
                  1
                  /* TEXT */
                ),
                vue.createElementVNode(
                  "text",
                  { class: "td" },
                  vue.toDisplayString(m.stats.board),
                  1
                  /* TEXT */
                ),
                vue.createElementVNode(
                  "text",
                  { class: "td" },
                  vue.toDisplayString(m.stats.assists),
                  1
                  /* TEXT */
                ),
                vue.createElementVNode(
                  "text",
                  { class: "td" },
                  vue.toDisplayString(m.stats.steals),
                  1
                  /* TEXT */
                ),
                vue.createElementVNode(
                  "text",
                  { class: "td" },
                  vue.toDisplayString(m.stats.block),
                  1
                  /* TEXT */
                ),
                vue.createElementVNode(
                  "text",
                  { class: "td" },
                  vue.toDisplayString(m.stats.foul),
                  1
                  /* TEXT */
                )
              ]);
            }),
            128
            /* KEYED_FRAGMENT */
          )),
          vue.createElementVNode("view", { class: "tr total" }, [
            vue.createElementVNode("text", { class: "td num" }, "合计"),
            vue.createElementVNode("text", { class: "td name" }),
            vue.createElementVNode(
              "text",
              { class: "td" },
              vue.toDisplayString($setup.guestTotal.score),
              1
              /* TEXT */
            ),
            vue.createElementVNode(
              "text",
              { class: "td" },
              vue.toDisplayString($setup.guestTotal.board),
              1
              /* TEXT */
            ),
            vue.createElementVNode(
              "text",
              { class: "td" },
              vue.toDisplayString($setup.guestTotal.assists),
              1
              /* TEXT */
            ),
            vue.createElementVNode(
              "text",
              { class: "td" },
              vue.toDisplayString($setup.guestTotal.steals),
              1
              /* TEXT */
            ),
            vue.createElementVNode(
              "text",
              { class: "td" },
              vue.toDisplayString($setup.guestTotal.block),
              1
              /* TEXT */
            ),
            vue.createElementVNode(
              "text",
              { class: "td" },
              vue.toDisplayString($setup.guestTotal.foul),
              1
              /* TEXT */
            )
          ])
        ])
      ])
    ]);
  }
  const PagesGameNewMemberData = /* @__PURE__ */ _export_sfc(_sfc_main$a, [["render", _sfc_render$9], ["__scopeId", "data-v-222878b2"], ["__file", "F:/项目文件/uniapp版本/pages/game/new-member-data.vue"]]);
  const _sfc_main$9 = {
    __name: "operation-record",
    setup(__props, { expose: __expose }) {
      __expose();
      const statusBarHeight = uni.getSystemInfoSync().statusBarHeight || 0;
      const gameId = vue.ref("");
      const list = vue.ref([]);
      const pageNo = vue.ref(1);
      const totalPage = vue.ref(1);
      const loading = vue.ref(false);
      const refreshing = vue.ref(false);
      const hasMore = vue.ref(true);
      onLoad((opt) => {
        gameId.value = opt.gameId || opt.KEY || "";
        load(true);
      });
      function load(reset) {
        if (loading.value)
          return;
        if (reset) {
          pageNo.value = 1;
          list.value = [];
          hasMore.value = true;
        }
        loading.value = true;
        statisticsPage(gameId.value, 1, pageNo.value).then((res) => {
          if (res.code === 1) {
            const d = res.data || {};
            const pageList = d.list || [];
            list.value = reset ? pageList : list.value.concat(pageList);
            totalPage.value = d.totalPage || 1;
            hasMore.value = pageNo.value < totalPage.value;
          }
        }).finally(() => {
          loading.value = false;
          refreshing.value = false;
        });
      }
      function onRefresh() {
        refreshing.value = true;
        load(true);
      }
      function onLoadMore() {
        if (hasMore.value && !loading.value) {
          pageNo.value++;
          load(false);
        }
      }
      function onDelete(r) {
        uni.showModal({
          title: "提示",
          content: "确定删除该记录？",
          success: (rr) => {
            if (rr.confirm) {
              cancelData({
                gameId: gameId.value,
                recordNumber: r.recordNumber,
                statisticsMemberId: r.statisticsMemberId
              }).then((res) => {
                if (res.code === 1) {
                  emit(EventBus.RECORD_REFRESH);
                  load(true);
                }
              });
            }
          }
        });
      }
      function back() {
        uni.navigateBack();
      }
      const __returned__ = { statusBarHeight, gameId, list, pageNo, totalPage, loading, refreshing, hasMore, load, onRefresh, onLoadMore, onDelete, back, ref: vue.ref, get onLoad() {
        return onLoad;
      }, emptyLayout, get statisticsPage() {
        return statisticsPage;
      }, get cancelData() {
        return cancelData;
      }, get emit() {
        return emit;
      }, get EventBus() {
        return EventBus;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$8(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "op-record" }, [
      vue.createElementVNode("view", { class: "top-bar" }, [
        vue.createElementVNode(
          "view",
          {
            class: "nav-status",
            style: vue.normalizeStyle({ height: $setup.statusBarHeight + "px" })
          },
          null,
          4
          /* STYLE */
        ),
        vue.createElementVNode("view", { class: "top-bar-inner" }, [
          vue.createElementVNode("view", {
            class: "back",
            onClick: $setup.back
          }, [
            vue.createElementVNode("image", {
              class: "back-icon",
              src: _imports_0$2,
              mode: "aspectFit"
            })
          ]),
          vue.createElementVNode("text", { class: "title" }, "操作记录")
        ])
      ]),
      vue.createElementVNode("scroll-view", {
        "scroll-y": "",
        class: "list",
        "refresher-enabled": "",
        "refresher-triggered": $setup.refreshing,
        onRefresherrefresh: $setup.onRefresh,
        onScrolltolower: $setup.onLoadMore
      }, [
        (vue.openBlock(true), vue.createElementBlock(
          vue.Fragment,
          null,
          vue.renderList($setup.list, (r) => {
            return vue.openBlock(), vue.createElementBlock("view", {
              key: r.id,
              class: "rec-item",
              onClick: ($event) => $setup.onDelete(r)
            }, [
              vue.createElementVNode("view", { class: "rec-main" }, [
                vue.createElementVNode("view", { class: "rec-line1" }, [
                  vue.createElementVNode(
                    "text",
                    { class: "r-team" },
                    vue.toDisplayString(r.teamName),
                    1
                    /* TEXT */
                  ),
                  vue.createElementVNode(
                    "text",
                    { class: "r-time" },
                    vue.toDisplayString(r.occurrenceTime),
                    1
                    /* TEXT */
                  ),
                  vue.createElementVNode(
                    "text",
                    { class: "r-section" },
                    vue.toDisplayString(r.sectionName),
                    1
                    /* TEXT */
                  )
                ]),
                vue.createElementVNode("view", { class: "rec-line2" }, [
                  vue.createElementVNode(
                    "text",
                    { class: "r-player" },
                    vue.toDisplayString(r.memberName),
                    1
                    /* TEXT */
                  ),
                  vue.createElementVNode(
                    "text",
                    { class: "r-type" },
                    vue.toDisplayString(r.type && r.type.desc),
                    1
                    /* TEXT */
                  ),
                  vue.createElementVNode("text", { class: "r-del" }, "删除")
                ])
              ])
            ], 8, ["onClick"]);
          }),
          128
          /* KEYED_FRAGMENT */
        )),
        !$setup.list.length && !$setup.loading ? (vue.openBlock(), vue.createBlock($setup["emptyLayout"], {
          key: 0,
          status: "empty"
        })) : vue.createCommentVNode("v-if", true),
        $setup.loading ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 1,
          class: "loading-more"
        }, "加载中…")) : !$setup.hasMore && $setup.list.length ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 2,
          class: "loading-more"
        }, "已加载全部")) : vue.createCommentVNode("v-if", true)
      ], 40, ["refresher-triggered"])
    ]);
  }
  const PagesGameOperationRecord = /* @__PURE__ */ _export_sfc(_sfc_main$9, [["render", _sfc_render$8], ["__scopeId", "data-v-a085037c"], ["__file", "F:/项目文件/uniapp版本/pages/game/operation-record.vue"]]);
  const _imports_1 = "/static/mipmap-xxhdpi/cuba.png";
  const _imports_2 = "/static/mipmap-xxhdpi/good.png";
  const _sfc_main$8 = {
    __name: "week-outs",
    setup(__props, { expose: __expose }) {
      __expose();
      const statusBarHeight = uni.getSystemInfoSync().statusBarHeight || 0;
      const groups = vue.ref([]);
      const loading = vue.ref(false);
      const kingRows = [
        [{ type: 1, title: "得 分 王" }, { type: 2, title: "篮 板 王" }],
        [{ type: 3, title: "助 攻 王" }, { type: 5, title: "抢 断 王" }]
      ];
      onLoad(() => {
        loading.value = true;
        getWeekList(config$1.youkenLeagueId).then((res) => {
          if (res.code === 1) {
            groups.value = (res.data || []).map((g) => ({ ...g, kings: buildKings(g) }));
          }
        }).finally(() => {
          loading.value = false;
        });
      });
      function groupTitleImg(groupName) {
        const m = /U(6|8|10|12)/.exec(groupName || "");
        const key = m ? "u" + m[1] : "u6";
        return `/static/mipmap-xxhdpi/${key}.png`;
      }
      function buildKings(group) {
        const map = { 1: [], 2: [], 3: [], 5: [] };
        (group.optimals || []).forEach((o) => {
          const t2 = o.type && o.type.value;
          if (map[t2])
            map[t2].push(o);
        });
        const result = {};
        Object.keys(map).forEach((t2) => {
          const arr = map[t2];
          if (!arr.length || arr.length > 2) {
            result[t2] = { show: false, first: {}, second: null, hasSecond: false };
          } else {
            result[t2] = {
              show: true,
              first: { name: arr[0].name, count: arr[0].count, avatar: arr[0].avatar || "" },
              second: arr[1] ? { name: arr[1].name, count: arr[1].count, avatar: arr[1].avatar || "" } : null,
              hasSecond: !!arr[1]
            };
          }
        });
        return result;
      }
      function back() {
        uni.navigateBack();
      }
      const __returned__ = { statusBarHeight, groups, loading, kingRows, groupTitleImg, buildKings, back, ref: vue.ref, get onLoad() {
        return onLoad;
      }, emptyLayout, get getWeekList() {
        return getWeekList;
      }, get config() {
        return config$1;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$7(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "week-outs" }, [
      vue.createElementVNode("view", { class: "top-bar" }, [
        vue.createElementVNode(
          "view",
          {
            class: "nav-status",
            style: vue.normalizeStyle({ height: $setup.statusBarHeight + "px" })
          },
          null,
          4
          /* STYLE */
        ),
        vue.createElementVNode("view", { class: "top-bar-inner" }, [
          vue.createElementVNode("view", {
            class: "back",
            onClick: $setup.back
          }, [
            vue.createElementVNode("image", {
              class: "back-icon",
              src: _imports_0$2,
              mode: "aspectFit"
            })
          ]),
          vue.createElementVNode("text", { class: "title" }, "优肯周赛况")
        ])
      ]),
      vue.createElementVNode("scroll-view", {
        "scroll-y": "",
        class: "body"
      }, [
        vue.createElementVNode("view", { class: "banner-box" }, [
          vue.createElementVNode("image", {
            class: "banner-img",
            src: _imports_1,
            mode: "aspectFit"
          })
        ]),
        (vue.openBlock(true), vue.createElementBlock(
          vue.Fragment,
          null,
          vue.renderList($setup.groups, (group, gi) => {
            return vue.openBlock(), vue.createElementBlock(
              vue.Fragment,
              { key: gi },
              [
                group.games && group.games.length ? (vue.openBlock(), vue.createElementBlock("view", {
                  key: 0,
                  class: "group-box"
                }, [
                  vue.createElementVNode("image", {
                    class: "group-title-img",
                    src: $setup.groupTitleImg(group.groupName),
                    mode: "aspectFit"
                  }, null, 8, ["src"]),
                  (vue.openBlock(true), vue.createElementBlock(
                    vue.Fragment,
                    null,
                    vue.renderList(group.games, (g) => {
                      return vue.openBlock(), vue.createElementBlock("view", {
                        key: g.id,
                        class: "game-row"
                      }, [
                        vue.createElementVNode("image", {
                          class: "team-logo",
                          src: g.hostTeamLogo,
                          mode: "aspectFill"
                        }, null, 8, ["src"]),
                        vue.createElementVNode(
                          "text",
                          { class: "team-name host" },
                          vue.toDisplayString(g.hostTeamName),
                          1
                          /* TEXT */
                        ),
                        vue.createElementVNode("view", { class: "score-box" }, [
                          vue.createElementVNode(
                            "text",
                            { class: "score-num" },
                            vue.toDisplayString(g.hostTeamScore),
                            1
                            /* TEXT */
                          ),
                          vue.createElementVNode("view", { class: "score-sep" }),
                          vue.createElementVNode(
                            "text",
                            { class: "score-num" },
                            vue.toDisplayString(g.guestTeamScore),
                            1
                            /* TEXT */
                          )
                        ]),
                        vue.createElementVNode(
                          "text",
                          { class: "team-name guest" },
                          vue.toDisplayString(g.guestTeamName),
                          1
                          /* TEXT */
                        ),
                        vue.createElementVNode("image", {
                          class: "team-logo",
                          src: g.guestTeamLogo,
                          mode: "aspectFill"
                        }, null, 8, ["src"])
                      ]);
                    }),
                    128
                    /* KEYED_FRAGMENT */
                  )),
                  vue.createElementVNode("view", { class: "game-rule" }),
                  vue.createElementVNode("view", { class: "orange-bar" }),
                  vue.createElementVNode("image", {
                    class: "kings-title-img",
                    src: _imports_2,
                    mode: "aspectFit"
                  }),
                  vue.createElementVNode("view", { class: "kings-table" }, [
                    (vue.openBlock(), vue.createElementBlock(
                      vue.Fragment,
                      null,
                      vue.renderList($setup.kingRows, (row, ri) => {
                        return vue.createElementVNode("view", {
                          key: ri,
                          class: "kings-row"
                        }, [
                          (vue.openBlock(true), vue.createElementBlock(
                            vue.Fragment,
                            null,
                            vue.renderList(row, (def, ci) => {
                              return vue.openBlock(), vue.createElementBlock(
                                vue.Fragment,
                                {
                                  key: def.type
                                },
                                [
                                  group.kings[def.type].show ? (vue.openBlock(), vue.createElementBlock("view", {
                                    key: 0,
                                    class: "king-cell"
                                  }, [
                                    vue.createElementVNode("view", { class: "king-logos" }, [
                                      group.kings[def.type].first.avatar ? (vue.openBlock(), vue.createElementBlock("image", {
                                        key: 0,
                                        class: "king-logo",
                                        src: group.kings[def.type].first.avatar,
                                        mode: "aspectFill"
                                      }, null, 8, ["src"])) : vue.createCommentVNode("v-if", true),
                                      group.kings[def.type].hasSecond && group.kings[def.type].second.avatar ? (vue.openBlock(), vue.createElementBlock("image", {
                                        key: 1,
                                        class: "king-logo second",
                                        src: group.kings[def.type].second.avatar,
                                        mode: "aspectFill"
                                      }, null, 8, ["src"])) : vue.createCommentVNode("v-if", true)
                                    ]),
                                    vue.createElementVNode("view", { class: "king-mid" }, [
                                      vue.createElementVNode(
                                        "text",
                                        { class: "king-title" },
                                        vue.toDisplayString(def.title),
                                        1
                                        /* TEXT */
                                      ),
                                      vue.createElementVNode(
                                        "text",
                                        {
                                          class: vue.normalizeClass(["king-name", { small: group.kings[def.type].hasSecond }])
                                        },
                                        vue.toDisplayString(group.kings[def.type].first.name),
                                        3
                                        /* TEXT, CLASS */
                                      ),
                                      group.kings[def.type].hasSecond ? (vue.openBlock(), vue.createElementBlock(
                                        "text",
                                        {
                                          key: 0,
                                          class: "king-name small"
                                        },
                                        vue.toDisplayString(group.kings[def.type].second.name),
                                        1
                                        /* TEXT */
                                      )) : vue.createCommentVNode("v-if", true)
                                    ]),
                                    vue.createElementVNode(
                                      "text",
                                      { class: "king-score" },
                                      vue.toDisplayString(group.kings[def.type].first.count),
                                      1
                                      /* TEXT */
                                    )
                                  ])) : (vue.openBlock(), vue.createElementBlock("view", {
                                    key: 1,
                                    class: "king-cell-empty"
                                  })),
                                  ci === 0 ? (vue.openBlock(), vue.createElementBlock("view", {
                                    key: 2,
                                    class: "king-sep-v"
                                  })) : vue.createCommentVNode("v-if", true)
                                ],
                                64
                                /* STABLE_FRAGMENT */
                              );
                            }),
                            128
                            /* KEYED_FRAGMENT */
                          ))
                        ]);
                      }),
                      64
                      /* STABLE_FRAGMENT */
                    ))
                  ])
                ])) : vue.createCommentVNode("v-if", true)
              ],
              64
              /* STABLE_FRAGMENT */
            );
          }),
          128
          /* KEYED_FRAGMENT */
        )),
        !$setup.groups.length && !$setup.loading ? (vue.openBlock(), vue.createBlock($setup["emptyLayout"], {
          key: 0,
          status: "empty"
        })) : vue.createCommentVNode("v-if", true)
      ])
    ]);
  }
  const PagesGameWeekOuts = /* @__PURE__ */ _export_sfc(_sfc_main$8, [["render", _sfc_render$7], ["__scopeId", "data-v-4f294de8"], ["__file", "F:/项目文件/uniapp版本/pages/game/week-outs.vue"]]);
  const getLiveGameList = (gameId) => request({ url: "live/stream/game-list", query: { gameId } });
  const addGame = (params2) => request({ url: "live/stream/game-add", method: "POST", data: params2 });
  const _sfc_main$7 = {
    __name: "multiple",
    setup(__props, { expose: __expose }) {
      __expose();
      const statusBarHeight = uni.getSystemInfoSync().statusBarHeight || 0;
      const gameId = vue.ref("");
      const sport = vue.ref("basketball");
      const list = vue.ref([]);
      const loading = vue.ref(false);
      const refreshing = vue.ref(false);
      const liveType = vue.ref("V2");
      const showAdd = vue.ref(false);
      const form = vue.reactive({ livename: "" });
      onLoad((opt) => {
        gameId.value = opt.gameId || "";
        sport.value = opt.sport || "basketball";
        liveType.value = uni.getStorageSync("live_type_" + gameId.value) || "V2";
        loadList();
      });
      function loadList() {
        loading.value = true;
        getLiveGameList(gameId.value).then((res) => {
          if (res.code === 1)
            list.value = res.data || [];
        }).finally(() => {
          loading.value = false;
          refreshing.value = false;
        });
      }
      function onRefresh() {
        refreshing.value = true;
        loadList();
      }
      function setType(t2) {
        liveType.value = t2;
        uni.setStorageSync("live_type_" + gameId.value, t2);
      }
      function onAdd() {
        if (!form.livename) {
          uni.showToast({ title: "请输入直播名称", icon: "none" });
          return;
        }
        addGame({
          gameId: gameId.value,
          name: form.livename,
          event: sport.value === "football" ? "2" : "1",
          // 比赛类型：1=篮球，2=足球
          channel: 1
        }).then((res) => {
          if (res.code === 1) {
            showAdd.value = false;
            form.livename = "";
            loadList();
          } else {
            uni.showToast({ title: res.msg || "添加失败", icon: "none" });
          }
        });
      }
      function goPush(item) {
        const publish = item.publish || item.liveRtmp || "";
        uni.navigateTo({
          url: `/pages/live/push?livepublish=${encodeURIComponent(publish)}&gameId=${gameId.value}&liveType=${liveType.value}&name=${encodeURIComponent(item.name || "")}`
        });
      }
      function back() {
        uni.navigateBack();
      }
      const __returned__ = { statusBarHeight, gameId, sport, list, loading, refreshing, liveType, showAdd, form, loadList, onRefresh, setType, onAdd, goPush, back, ref: vue.ref, reactive: vue.reactive, get onLoad() {
        return onLoad;
      }, emptyLayout, get getLiveGameList() {
        return getLiveGameList;
      }, get addGame() {
        return addGame;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$6(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_u_popup = resolveEasycom(vue.resolveDynamicComponent("u-popup"), __easycom_0$2);
    return vue.openBlock(), vue.createElementBlock("view", { class: "live-multiple" }, [
      vue.createElementVNode("view", { class: "top-bar" }, [
        vue.createElementVNode(
          "view",
          {
            class: "nav-status",
            style: vue.normalizeStyle({ height: $setup.statusBarHeight + "px" })
          },
          null,
          4
          /* STYLE */
        ),
        vue.createElementVNode("view", { class: "top-bar-inner" }, [
          vue.createElementVNode("view", {
            class: "back",
            onClick: $setup.back
          }, [
            vue.createElementVNode("image", {
              class: "back-icon",
              src: _imports_0$2,
              mode: "aspectFit"
            })
          ]),
          vue.createElementVNode("text", { class: "title" }, "直播"),
          vue.createElementVNode("text", {
            class: "add",
            onClick: _cache[0] || (_cache[0] = ($event) => $setup.showAdd = true)
          }, "添加视角")
        ])
      ]),
      vue.createElementVNode("scroll-view", {
        "scroll-y": "",
        class: "list",
        "refresher-enabled": "",
        "refresher-triggered": $setup.refreshing,
        onRefresherrefresh: $setup.onRefresh
      }, [
        (vue.openBlock(true), vue.createElementBlock(
          vue.Fragment,
          null,
          vue.renderList($setup.list, (item) => {
            return vue.openBlock(), vue.createElementBlock("view", {
              key: item.id,
              class: "live-item",
              onClick: ($event) => $setup.goPush(item)
            }, [
              vue.createElementVNode(
                "text",
                { class: "live-name" },
                vue.toDisplayString(item.name),
                1
                /* TEXT */
              ),
              vue.createElementVNode("text", { class: "arrow" }, "›")
            ], 8, ["onClick"]);
          }),
          128
          /* KEYED_FRAGMENT */
        )),
        !$setup.list.length && !$setup.loading ? (vue.openBlock(), vue.createBlock($setup["emptyLayout"], {
          key: 0,
          status: "empty"
        })) : vue.createCommentVNode("v-if", true)
      ], 40, ["refresher-triggered"]),
      vue.createElementVNode("view", { class: "type-footer" }, [
        vue.createElementVNode("view", { class: "type-title" }, "选择直播类型"),
        vue.createElementVNode("view", { class: "type-bar" }, [
          vue.createElementVNode(
            "view",
            {
              class: vue.normalizeClass(["type-btn", { on: $setup.liveType === "V2" }]),
              onClick: _cache[1] || (_cache[1] = ($event) => $setup.setType("V2"))
            },
            "V2",
            2
            /* CLASS */
          ),
          vue.createElementVNode(
            "view",
            {
              class: vue.normalizeClass(["type-btn", { on: $setup.liveType === "V3" }]),
              onClick: _cache[2] || (_cache[2] = ($event) => $setup.setType("V3"))
            },
            "V3",
            2
            /* CLASS */
          )
        ])
      ]),
      vue.createVNode(_component_u_popup, {
        show: $setup.showAdd,
        mode: "center",
        round: 20,
        onClose: _cache[5] || (_cache[5] = ($event) => $setup.showAdd = false)
      }, {
        default: vue.withCtx(() => [
          vue.createElementVNode("view", { class: "add-dialog" }, [
            vue.createElementVNode("view", { class: "dialog-title" }, "添加直播视角"),
            vue.withDirectives(vue.createElementVNode(
              "input",
              {
                "onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => $setup.form.livename = $event),
                class: "input",
                placeholder: "直播名称"
              },
              null,
              512
              /* NEED_PATCH */
            ), [
              [vue.vModelText, $setup.form.livename]
            ]),
            vue.createElementVNode("view", { class: "btns" }, [
              vue.createElementVNode("view", {
                class: "btn cancel",
                onClick: _cache[4] || (_cache[4] = ($event) => $setup.showAdd = false)
              }, "取消"),
              vue.createElementVNode("view", {
                class: "btn confirm",
                onClick: $setup.onAdd
              }, "确定")
            ])
          ])
        ]),
        _: 1
        /* STABLE */
      }, 8, ["show"])
    ]);
  }
  const PagesLiveMultiple = /* @__PURE__ */ _export_sfc(_sfc_main$7, [["render", _sfc_render$6], ["__scopeId", "data-v-a5336a99"], ["__file", "F:/项目文件/uniapp版本/pages/live/multiple.vue"]]);
  const getPhotoActivity = (pageNo) => request({ url: "photo/activity/list-my-manage", query: { pageNo } });
  const getUploadPhoto = () => request({ url: "photo/picture/upload-list" });
  const _sfc_main$6 = {
    __name: "photo",
    setup(__props, { expose: __expose }) {
      __expose();
      const statusBarHeight = uni.getSystemInfoSync().statusBarHeight || 0;
      const list = vue.ref([]);
      const pageNo = vue.ref(1);
      const hasMore = vue.ref(true);
      const loading = vue.ref(false);
      onLoad(() => load(true));
      function load(reset) {
        if (loading.value)
          return;
        if (reset) {
          pageNo.value = 1;
          list.value = [];
          hasMore.value = true;
        }
        loading.value = true;
        getPhotoActivity(pageNo.value).then((res) => {
          if (res.code === 1) {
            const d = res.data || {};
            const items = d.list || [];
            list.value = reset ? items : list.value.concat(items);
            hasMore.value = !!d.nextPage;
          }
        }).finally(() => {
          loading.value = false;
        });
      }
      function onLoadMore() {
        if (hasMore.value && !loading.value) {
          pageNo.value++;
          load(false);
        }
      }
      function goUpload(item) {
        uni.navigateTo({
          url: `/pages/photos-upload/photos-upload?id=${item.id}&title=${encodeURIComponent(item.title || "")}`
        });
      }
      function back() {
        uni.navigateBack();
      }
      const __returned__ = { statusBarHeight, list, pageNo, hasMore, loading, load, onLoadMore, goUpload, back, ref: vue.ref, get onLoad() {
        return onLoad;
      }, get getPhotoActivity() {
        return getPhotoActivity;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$5(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "photo" }, [
      vue.createElementVNode("view", { class: "top-bar" }, [
        vue.createElementVNode(
          "view",
          {
            class: "nav-status",
            style: vue.normalizeStyle({ height: $setup.statusBarHeight + "px" })
          },
          null,
          4
          /* STYLE */
        ),
        vue.createElementVNode("view", { class: "top-bar-inner" }, [
          vue.createElementVNode("view", {
            class: "back",
            onClick: $setup.back
          }, [
            vue.createElementVNode("image", {
              class: "back-icon",
              src: _imports_0$2,
              mode: "aspectFit"
            })
          ]),
          vue.createElementVNode("text", { class: "title" }, "活动列表")
        ])
      ]),
      vue.createElementVNode(
        "scroll-view",
        {
          "scroll-y": "",
          class: "list",
          onScrolltolower: $setup.onLoadMore
        },
        [
          (vue.openBlock(true), vue.createElementBlock(
            vue.Fragment,
            null,
            vue.renderList($setup.list, (item) => {
              return vue.openBlock(), vue.createElementBlock("view", {
                key: item.id,
                class: "act-item",
                onClick: ($event) => $setup.goUpload(item)
              }, [
                item.logo ? (vue.openBlock(), vue.createElementBlock("image", {
                  key: 0,
                  class: "logo",
                  src: item.logo,
                  mode: "aspectFill"
                }, null, 8, ["src"])) : (vue.openBlock(), vue.createElementBlock("view", {
                  key: 1,
                  class: "logo placeholder"
                })),
                vue.createElementVNode("view", { class: "info" }, [
                  vue.createElementVNode(
                    "text",
                    { class: "act-title" },
                    vue.toDisplayString(item.title),
                    1
                    /* TEXT */
                  ),
                  vue.createElementVNode(
                    "text",
                    { class: "act-addr" },
                    vue.toDisplayString(item.address),
                    1
                    /* TEXT */
                  ),
                  vue.createElementVNode(
                    "text",
                    { class: "act-status" },
                    vue.toDisplayString(item.status && item.status.desc),
                    1
                    /* TEXT */
                  )
                ])
              ], 8, ["onClick"]);
            }),
            128
            /* KEYED_FRAGMENT */
          )),
          $setup.loading ? (vue.openBlock(), vue.createElementBlock("view", {
            key: 0,
            class: "more"
          }, "加载中…")) : !$setup.hasMore && $setup.list.length ? (vue.openBlock(), vue.createElementBlock("view", {
            key: 1,
            class: "more"
          }, "已加载全部")) : vue.createCommentVNode("v-if", true),
          !$setup.list.length && !$setup.loading ? (vue.openBlock(), vue.createElementBlock("view", {
            key: 2,
            class: "no-data"
          }, [
            vue.createElementVNode("image", {
              class: "no-data-img",
              src: _imports_1$1,
              mode: "aspectFit"
            }),
            vue.createElementVNode("view", { style: { "color": "#BBBBBB" } }, "暂无数据")
          ])) : vue.createCommentVNode("v-if", true)
        ],
        32
        /* NEED_HYDRATION */
      )
    ]);
  }
  const PagesPhotoPhoto = /* @__PURE__ */ _export_sfc(_sfc_main$6, [["render", _sfc_render$5], ["__scopeId", "data-v-5140b150"], ["__file", "F:/项目文件/uniapp版本/pages/photo/photo.vue"]]);
  const _sfc_main$5 = {
    __name: "photos-upload",
    setup(__props, { expose: __expose }) {
      __expose();
      const statusBarHeight = uni.getSystemInfoSync().statusBarHeight || 0;
      const id = vue.ref("");
      const title = vue.ref("");
      const photos = vue.ref([]);
      onLoad((opt) => {
        id.value = opt.id || "";
        title.value = decodeURIComponent(opt.title || "");
        load();
      });
      function load() {
        getUploadPhoto().then((res) => {
          if (res.code === 1)
            photos.value = res.data || [];
        });
      }
      function preview(i) {
        const urls = photos.value.map((p) => p.url);
        uni.navigateTo({
          url: `/pages/preview/large-view?position=${i}&urls=${encodeURIComponent(JSON.stringify(urls))}`
        });
      }
      function goLivePhoto() {
        uni.navigateTo({ url: `/pages/photo/live-photo?id=${id.value}` });
      }
      function back() {
        uni.navigateBack();
      }
      const __returned__ = { statusBarHeight, id, title, photos, load, preview, goLivePhoto, back, ref: vue.ref, get onLoad() {
        return onLoad;
      }, emptyLayout, get getUploadPhoto() {
        return getUploadPhoto;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$4(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "photos-upload" }, [
      vue.createElementVNode("view", { class: "top-bar" }, [
        vue.createElementVNode(
          "view",
          {
            class: "nav-status",
            style: vue.normalizeStyle({ height: $setup.statusBarHeight + "px" })
          },
          null,
          4
          /* STYLE */
        ),
        vue.createElementVNode("view", { class: "top-bar-inner" }, [
          vue.createElementVNode("view", {
            class: "back",
            onClick: $setup.back
          }, [
            vue.createElementVNode("image", {
              class: "back-icon",
              src: _imports_0$2,
              mode: "aspectFit"
            })
          ]),
          vue.createElementVNode(
            "text",
            { class: "title" },
            vue.toDisplayString($setup.title),
            1
            /* TEXT */
          )
        ])
      ]),
      vue.createElementVNode("scroll-view", {
        "scroll-y": "",
        class: "list"
      }, [
        vue.createElementVNode("view", { class: "live-entry" }, [
          vue.createElementVNode("view", {
            class: "live-btn",
            onClick: $setup.goLivePhoto
          }, "拍照直播")
        ]),
        vue.createElementVNode("view", { class: "grid" }, [
          (vue.openBlock(true), vue.createElementBlock(
            vue.Fragment,
            null,
            vue.renderList($setup.photos, (p, i) => {
              return vue.openBlock(), vue.createElementBlock("image", {
                key: p.id || i,
                class: "photo-img",
                src: p.url,
                mode: "aspectFill",
                onClick: ($event) => $setup.preview(i)
              }, null, 8, ["src", "onClick"]);
            }),
            128
            /* KEYED_FRAGMENT */
          ))
        ]),
        !$setup.photos.length ? (vue.openBlock(), vue.createBlock($setup["emptyLayout"], {
          key: 0,
          status: "empty"
        })) : vue.createCommentVNode("v-if", true)
      ])
    ]);
  }
  const PagesPhotosUploadPhotosUpload = /* @__PURE__ */ _export_sfc(_sfc_main$5, [["render", _sfc_render$4], ["__scopeId", "data-v-a55f83b1"], ["__file", "F:/项目文件/uniapp版本/pages/photos-upload/photos-upload.vue"]]);
  function uploadToBackend(filePath, url2, formData = {}) {
    return new Promise((resolve, reject) => {
      uni.uploadFile({
        url: config$1.baseUrl + url2,
        filePath,
        name: "file",
        header: { token: getToken() },
        formData,
        success: (res) => {
          try {
            resolve(JSON.parse(res.data));
          } catch (e) {
            resolve(res.data);
          }
        },
        fail: reject
      });
    });
  }
  async function uploadToOSS(filePath, activityId) {
    return uploadToBackend(filePath, "photo/picture/upload", { activityId });
  }
  const _sfc_main$4 = {
    __name: "live-photo",
    setup(__props, { expose: __expose }) {
      __expose();
      const statusBarHeight = uni.getSystemInfoSync().statusBarHeight || 0;
      const id = vue.ref("");
      const uploaded = vue.ref(0);
      const uploading2 = vue.ref(false);
      const localPhotos = vue.ref([]);
      onLoad((opt) => {
        id.value = opt.id || "";
      });
      function takePhoto() {
        uni.chooseImage({
          count: 1,
          sourceType: ["camera"],
          success: (r) => doUpload2(r.tempFilePaths)
        });
      }
      function choosePhoto() {
        uni.chooseImage({
          count: 9,
          sourceType: ["album"],
          success: (r) => doUpload2(r.tempFilePaths)
        });
      }
      function doUpload2(paths) {
        uploading2.value = true;
        let success = 0;
        let fail = 0;
        let left = paths.length;
        paths.forEach((fp) => {
          const item = { url: fp, status: "uploading" };
          localPhotos.value.unshift(item);
          uploadToOSS(fp, id.value).then((res) => {
            if (res.code === 1) {
              item.status = "done";
              success++;
              uploaded.value++;
            } else {
              item.status = "fail";
              fail++;
            }
          }).catch(() => {
            item.status = "fail";
            fail++;
          }).finally(() => {
            left--;
            if (left === 0) {
              uploading2.value = false;
              if (fail === 0) {
                uni.showToast({ title: `上传成功 ${success} 张`, icon: "success" });
              } else if (success === 0) {
                uni.showToast({ title: `上传失败 ${fail} 张`, icon: "none" });
              } else {
                uni.showToast({ title: `成功 ${success} 张，失败 ${fail} 张`, icon: "none" });
              }
            }
          });
        });
      }
      function back() {
        uni.navigateBack();
      }
      const __returned__ = { statusBarHeight, id, uploaded, uploading: uploading2, localPhotos, takePhoto, choosePhoto, doUpload: doUpload2, back, ref: vue.ref, get onLoad() {
        return onLoad;
      }, emptyLayout, get uploadToOSS() {
        return uploadToOSS;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$3(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "live-photo" }, [
      vue.createElementVNode("view", { class: "top-bar" }, [
        vue.createElementVNode(
          "view",
          {
            class: "nav-status",
            style: vue.normalizeStyle({ height: $setup.statusBarHeight + "px" })
          },
          null,
          4
          /* STYLE */
        ),
        vue.createElementVNode("view", { class: "top-bar-inner" }, [
          vue.createElementVNode("view", {
            class: "back",
            onClick: $setup.back
          }, [
            vue.createElementVNode("image", {
              class: "back-icon",
              src: _imports_0$2,
              mode: "aspectFit"
            })
          ]),
          vue.createElementVNode("text", { class: "title" }, "拍照直播")
        ])
      ]),
      vue.createElementVNode("view", { class: "info-bar" }, [
        vue.createElementVNode(
          "text",
          { class: "info-text" },
          "已上传 " + vue.toDisplayString($setup.uploaded) + " 张",
          1
          /* TEXT */
        ),
        $setup.uploading ? (vue.openBlock(), vue.createElementBlock("text", {
          key: 0,
          class: "uploading"
        }, "上传中…")) : vue.createCommentVNode("v-if", true)
      ]),
      vue.createElementVNode("view", { class: "actions" }, [
        vue.createElementVNode("view", {
          class: "btn camera",
          onClick: $setup.takePhoto
        }, "拍照"),
        vue.createElementVNode("view", {
          class: "btn album",
          onClick: $setup.choosePhoto
        }, "从相册选择")
      ]),
      vue.createElementVNode("scroll-view", {
        "scroll-y": "",
        class: "preview-list"
      }, [
        vue.createElementVNode("view", { class: "grid" }, [
          (vue.openBlock(true), vue.createElementBlock(
            vue.Fragment,
            null,
            vue.renderList($setup.localPhotos, (p, i) => {
              return vue.openBlock(), vue.createElementBlock("view", {
                key: i,
                class: "preview-item"
              }, [
                vue.createElementVNode("image", {
                  class: "preview-img",
                  src: p.url,
                  mode: "aspectFill"
                }, null, 8, ["src"]),
                p.status === "uploading" ? (vue.openBlock(), vue.createElementBlock("text", {
                  key: 0,
                  class: "badge uploading"
                }, "上传中")) : p.status === "done" ? (vue.openBlock(), vue.createElementBlock("text", {
                  key: 1,
                  class: "badge done"
                }, "已上传")) : p.status === "fail" ? (vue.openBlock(), vue.createElementBlock("text", {
                  key: 2,
                  class: "badge fail"
                }, "失败")) : vue.createCommentVNode("v-if", true)
              ]);
            }),
            128
            /* KEYED_FRAGMENT */
          ))
        ]),
        !$setup.localPhotos.length ? (vue.openBlock(), vue.createBlock($setup["emptyLayout"], {
          key: 0,
          status: "empty"
        })) : vue.createCommentVNode("v-if", true)
      ]),
      vue.createElementVNode("view", { class: "tip" }, " 原项目使用 USB 连接单反相机（PTP 协议）取片后自动上传，uniapp 无 USB host 能力无法实现， 此处改为手机摄像头拍照 / 相册选图后自动上传（选图即传，无需点按钮）。 ")
    ]);
  }
  const PagesPhotoLivePhoto = /* @__PURE__ */ _export_sfc(_sfc_main$4, [["render", _sfc_render$3], ["__scopeId", "data-v-021154e6"], ["__file", "F:/项目文件/uniapp版本/pages/photo/live-photo.vue"]]);
  const _sfc_main$3 = {
    __name: "large-view",
    setup(__props, { expose: __expose }) {
      __expose();
      const urls = vue.ref([]);
      const current = vue.ref(0);
      onLoad((opt) => {
        try {
          urls.value = JSON.parse(opt.urls);
        } catch (e) {
          try {
            urls.value = JSON.parse(decodeURIComponent(opt.urls));
          } catch (e2) {
            urls.value = [];
          }
        }
        current.value = Number(opt.position || 0);
      });
      onShow(() => {
        plus.navigator.setStatusBarStyle("light");
      });
      onHide(() => {
        plus.navigator.setStatusBarStyle("dark");
      });
      function onChange(e) {
        current.value = e.detail.current;
      }
      function back() {
        uni.navigateBack();
      }
      const __returned__ = { urls, current, onChange, back, ref: vue.ref, get onLoad() {
        return onLoad;
      }, get onShow() {
        return onShow;
      }, get onHide() {
        return onHide;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$2(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "large-view" }, [
      vue.createElementVNode("swiper", {
        class: "swiper",
        current: $setup.current,
        onChange: $setup.onChange
      }, [
        (vue.openBlock(true), vue.createElementBlock(
          vue.Fragment,
          null,
          vue.renderList($setup.urls, (url2, i) => {
            return vue.openBlock(), vue.createElementBlock("swiper-item", { key: i }, [
              vue.createElementVNode("image", {
                src: url2,
                mode: "aspectFit",
                class: "img",
                onClick: $setup.back
              }, null, 8, ["src"])
            ]);
          }),
          128
          /* KEYED_FRAGMENT */
        ))
      ], 40, ["current"]),
      $setup.urls.length > 1 ? (vue.openBlock(), vue.createElementBlock(
        "view",
        {
          key: 0,
          class: "page-indicator"
        },
        vue.toDisplayString($setup.current + 1) + "/" + vue.toDisplayString($setup.urls.length),
        1
        /* TEXT */
      )) : vue.createCommentVNode("v-if", true)
    ]);
  }
  const PagesPreviewLargeView = /* @__PURE__ */ _export_sfc(_sfc_main$3, [["render", _sfc_render$2], ["__scopeId", "data-v-f6219a2c"], ["__file", "F:/项目文件/uniapp版本/pages/preview/large-view.vue"]]);
  const _sfc_main$2 = {
    __name: "index",
    setup(__props, { expose: __expose }) {
      __expose();
      const url2 = vue.ref("");
      const title = vue.ref("");
      onLoad((opt) => {
        const type = opt.type;
        if (String(type) === "2") {
          url2.value = config$1.agreement.privacy;
          title.value = "隐私政策";
        } else {
          url2.value = config$1.agreement.user;
          title.value = "用户协议";
        }
        uni.setNavigationBarTitle({
          title: title.value
        });
      });
      const goBack = () => {
        uni.navigateBack({
          delta: 1,
          // 返回的页面数，默认为 1
          success: () => {
          },
          fail: () => {
          }
        });
      };
      const __returned__ = { url: url2, title, goBack, ref: vue.ref, get onLoad() {
        return onLoad;
      }, get config() {
        return config$1;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$1(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock(
      vue.Fragment,
      null,
      [
        vue.createElementVNode("view", { style: { "display": "flex", "align-items": "center", "justify-content": "center", "height": "70rpx", "width": "100%", "background-color": "#FFFFFF" } }, [
          vue.createElementVNode("image", {
            onClick: _cache[0] || (_cache[0] = ($event) => $setup.goBack()),
            style: { "position": "absolute", "left": "-15rpx", "width": "100rpx", "height": "100rpx" },
            src: _imports_0$2,
            mode: "aspectFit"
          }),
          vue.createElementVNode(
            "view",
            { style: { "color": "#717171" } },
            vue.toDisplayString($setup.title),
            1
            /* TEXT */
          )
        ]),
        vue.createElementVNode("web-view", {
          style: { "position": "absolute", "top": "60rpx" },
          src: $setup.url
        }, null, 8, ["src"])
      ],
      64
      /* STABLE_FRAGMENT */
    );
  }
  const PagesAgreementIndex = /* @__PURE__ */ _export_sfc(_sfc_main$2, [["render", _sfc_render$1], ["__scopeId", "data-v-dd75091a"], ["__file", "F:/项目文件/uniapp版本/pages/agreement/index.vue"]]);
  const _sfc_main$1 = {
    __name: "index",
    setup(__props, { expose: __expose }) {
      __expose();
      const title = vue.ref("");
      const msg = vue.ref("该功能暂未实现");
      onLoad((opt) => {
        title.value = opt.title || "";
        msg.value = opt.msg || "该功能暂未实现";
        uni.setNavigationBarTitle({ title: title.value });
      });
      const __returned__ = { title, msg, ref: vue.ref, get onLoad() {
        return onLoad;
      }, customNav };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "placeholder" }, [
      vue.createVNode($setup["customNav"], { title: $setup.title }, null, 8, ["title"]),
      vue.createElementVNode("view", { class: "content" }, [
        vue.createElementVNode("view", { class: "icon" }, "⚠"),
        vue.createElementVNode(
          "text",
          { class: "msg" },
          vue.toDisplayString($setup.msg),
          1
          /* TEXT */
        )
      ])
    ]);
  }
  const PagesPlaceholderIndex = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["render", _sfc_render], ["__scopeId", "data-v-29f28d5e"], ["__file", "F:/项目文件/uniapp版本/pages/placeholder/index.vue"]]);
  __definePage("pages/loading/index", PagesLoadingIndex);
  __definePage("pages/login/index", PagesLoginIndex);
  __definePage("pages/main/index", PagesMainIndex);
  __definePage("pages/match/basketball-setup", PagesMatchBasketballSetup);
  __definePage("pages/game-setup/index", PagesGameSetupIndex);
  __definePage("pages/match/football-setup", PagesMatchFootballSetup);
  __definePage("pages/statistics/basketball-operate", PagesStatisticsBasketballOperate);
  __definePage("pages/statistics/football-operate", PagesStatisticsFootballOperate);
  __definePage("pages/statistics/basketball-operate-new", PagesStatisticsBasketballOperateNew);
  __definePage("pages/statistics/basketball-down", PagesStatisticsBasketballDown);
  __definePage("pages/record/record", PagesRecordRecord);
  __definePage("pages/record/record-foot", PagesRecordRecordFoot);
  __definePage("pages/record/record-new", PagesRecordRecordNew);
  __definePage("pages/game/member-data", PagesGameMemberData);
  __definePage("pages/game/new-member-data", PagesGameNewMemberData);
  __definePage("pages/game/operation-record", PagesGameOperationRecord);
  __definePage("pages/game/week-outs", PagesGameWeekOuts);
  __definePage("pages/live/multiple", PagesLiveMultiple);
  __definePage("pages/photo/photo", PagesPhotoPhoto);
  __definePage("pages/photos-upload/photos-upload", PagesPhotosUploadPhotosUpload);
  __definePage("pages/photo/live-photo", PagesPhotoLivePhoto);
  __definePage("pages/preview/large-view", PagesPreviewLargeView);
  __definePage("pages/agreement/index", PagesAgreementIndex);
  __definePage("pages/placeholder/index", PagesPlaceholderIndex);
  const _sfc_main = {
    onLaunch() {
      const userStore = useUserStore();
      const appStore = useAppStore();
      userStore.init();
      appStore.init();
      initDB();
    },
    onShow() {
      plus.navigator.setStatusBarStyle("dark");
    },
    onHide() {
    }
  };
  const App = /* @__PURE__ */ _export_sfc(_sfc_main, [["__file", "F:/项目文件/uniapp版本/App.vue"]]);
  const needShims = [
    {
      name: "onWindowResize",
      fallback: function(_callback) {
      }
    },
    {
      name: "offWindowResize",
      fallback: function(_callback) {
      }
    }
  ];
  function applyUniApiShims() {
    if (typeof uni === "undefined")
      return;
    for (const { name, fallback } of needShims) {
      if (typeof uni[name] !== "function") {
        uni[name] = fallback;
      }
    }
  }
  let timeout = null;
  function debounce(func2, wait = 500, immediate = false) {
    if (timeout !== null)
      clearTimeout(timeout);
    if (immediate) {
      const callNow = !timeout;
      timeout = setTimeout(() => {
        timeout = null;
      }, wait);
      if (callNow)
        typeof func2 === "function" && func2();
    } else {
      timeout = setTimeout(() => {
        typeof func2 === "function" && func2();
      }, wait);
    }
  }
  let flag;
  function throttle(func2, wait = 500, immediate = true) {
    if (immediate) {
      if (!flag) {
        flag = true;
        typeof func2 === "function" && func2();
        setTimeout(() => {
          flag = false;
        }, wait);
      }
    } else if (!flag) {
      flag = true;
      setTimeout(() => {
        flag = false;
        typeof func2 === "function" && func2();
      }, wait);
    }
  }
  function add(arg1, arg2) {
    var r1, r2, m;
    try {
      r1 = arg1.toString().split(".")[1].length;
    } catch (e) {
      r1 = 0;
    }
    try {
      r2 = arg2.toString().split(".")[1].length;
    } catch (e) {
      r2 = 0;
    }
    m = Math.pow(10, Math.max(r1, r2));
    return (arg1 * m + arg2 * m) / m;
  }
  function sub(arg1, arg2) {
    var r1, r2, m, n;
    try {
      r1 = arg1.toString().split(".")[1].length;
    } catch (e) {
      r1 = 0;
    }
    try {
      r2 = arg2.toString().split(".")[1].length;
    } catch (e) {
      r2 = 0;
    }
    m = Math.pow(10, Math.max(r1, r2));
    n = r1 >= r2 ? r1 : r2;
    return Math.abs(((arg1 * m - arg2 * m) / m).toFixed(n));
  }
  function mul(a, b) {
    var c = 0, d = a.toString(), e = b.toString();
    try {
      c += d.split(".")[1].length;
    } catch (f) {
    }
    try {
      c += e.split(".")[1].length;
    } catch (f) {
    }
    return Number(d.replace(".", "")) * Number(e.replace(".", "")) / Math.pow(10, c);
  }
  function div(a, b) {
    var c, d, e = 0, f = 0;
    try {
      e = a.toString().split(".")[1].length;
    } catch (g) {
    }
    try {
      f = b.toString().split(".")[1].length;
    } catch (g) {
    }
    return c = Number(a.toString().replace(".", "")), d = Number(b.toString().replace(".", "")), xyutil.mul(c / d, Math.pow(10, f - e));
  }
  const calc = {
    add,
    sub,
    mul,
    div
  };
  let platform = "none";
  platform = "vue3";
  platform = "plus";
  const platform$1 = platform;
  const DEFAULT_LIGHT_THEME_COLORS = Object.freeze({
    primary: "#3c9cff",
    info: "#909399",
    warning: "#f9ae3d",
    error: "#f56c6c",
    success: "#5ac725",
    mainColor: "#303133",
    contentColor: "#606266",
    tipsColor: "#909193",
    lightColor: "#c0c4cc",
    borderColor: "#dadbde",
    bgColor: "#f3f4f6",
    disabledColor: "#c8c9cc",
    primaryDark: "#398ade",
    primaryDisabled: "#9acafc",
    primaryLight: "#ecf5ff",
    warningDark: "#f1a532",
    warningDisabled: "#f9d39b",
    warningLight: "#fdf6ec",
    successDark: "#53c21d",
    successDisabled: "#a9e08f",
    successLight: "#f5fff0",
    errorDark: "#e45656",
    errorDisabled: "#f7b2b2",
    errorLight: "#fef0f0",
    infoDark: "#767a82",
    infoDisabled: "#c4c6c9",
    infoLight: "#f4f4f5"
  });
  const DEFAULT_DARK_THEME_COLORS = Object.freeze({
    primary: "#3c9cff",
    info: "#909399",
    warning: "#f9ae3d",
    error: "#f56c6c",
    success: "#5ac725",
    mainColor: "#f5f5f5",
    contentColor: "#d1d5db",
    tipsColor: "#9ca3af",
    lightColor: "#6b7280",
    borderColor: "#3a3a3c",
    bgColor: "#1f1f1f",
    disabledColor: "#4b5563",
    primaryDark: "#5aa8ff",
    primaryDisabled: "#4c6f92",
    primaryLight: "#10243a",
    warningDark: "#ffbf66",
    warningDisabled: "#8a6a3a",
    warningLight: "#3d2f1b",
    successDark: "#7ad94b",
    successDisabled: "#5f7f4f",
    successLight: "#1f3316",
    errorDark: "#ff8a8a",
    errorDisabled: "#8d5858",
    errorLight: "#3a2222",
    infoDark: "#b0b3b8",
    infoDisabled: "#5f6368",
    infoLight: "#2f3238"
  });
  const DEFAULT_THEME_EXTRA_VARS = Object.freeze({
    light: Object.freeze({
      "--up-table2-header-bg-color": "#f5f7fa",
      "--up-table2-zebra-bg-color": "#fafafa",
      "--up-table2-highlight-bg-color": "#f5f7fa",
      "--up-gap-bg-color": "#f3f4f6",
      "--up-skeleton-bg-color": "#f1f2f4",
      "--up-skeleton-shimmer-color": "#e6e6e6",
      "--up-swipe-action-button-bg-color": "#c7c6cd",
      "--up-index-list-indicator-bg-color": "#c9c9c9",
      "--up-calendar-month-mark-color": "rgba(231, 232, 234, 0.83)"
    }),
    dark: Object.freeze({
      "--up-table2-header-bg-color": "#2a2d33",
      "--up-table2-zebra-bg-color": "#23262b",
      "--up-table2-highlight-bg-color": "#2f3440",
      "--up-gap-bg-color": "#111111",
      "--up-skeleton-bg-color": "#2f3135",
      "--up-skeleton-shimmer-color": "rgba(255, 255, 255, 0.12)",
      "--up-swipe-action-button-bg-color": "#4b5563",
      "--up-index-list-indicator-bg-color": "#4b5563",
      "--up-calendar-month-mark-color": "rgba(255, 255, 255, 0.04)"
    })
  });
  const themeState = {
    preference: "system",
    mode: "light",
    version: 0,
    vars: {}
  };
  const THEME_MODE_STORAGE_KEY = "u-theme-mode";
  const THEME_MODE_SYSTEM = "system";
  const THEME_MODE_MANUAL = ["light", "dark"];
  const LIGHT_THEME_TOKEN_FIELD_MAP = Object.freeze({
    "primary": "primary",
    "primary-dark": "primaryDark",
    "primary-disabled": "primaryDisabled",
    "primary-light": "primaryLight",
    "warning": "warning",
    "warning-dark": "warningDark",
    "warning-disabled": "warningDisabled",
    "warning-light": "warningLight",
    "success": "success",
    "success-dark": "successDark",
    "success-disabled": "successDisabled",
    "success-light": "successLight",
    "error": "error",
    "error-dark": "errorDark",
    "error-disabled": "errorDisabled",
    "error-light": "errorLight",
    "info": "info",
    "info-dark": "infoDark",
    "info-disabled": "infoDisabled",
    "info-light": "infoLight",
    "main-color": "mainColor",
    "content-color": "contentColor",
    "tips-color": "tipsColor",
    "light-color": "lightColor",
    "border-color": "borderColor",
    "bg-color": "bgColor",
    "disabled-color": "disabledColor"
  });
  const LIGHT_THEME_FIELD_TOKEN_MAP = Object.freeze(
    Object.fromEntries(
      Object.entries(LIGHT_THEME_TOKEN_FIELD_MAP).map(([token, field]) => [field, token])
    )
  );
  const runtimeThemeOverrideState = {
    color: /* @__PURE__ */ Object.create(null),
    configColor: /* @__PURE__ */ Object.create(null)
  };
  let cachedLightThemeColors = null;
  let hasRegisterThemeListener = false;
  let currentThemePreference = THEME_MODE_SYSTEM;
  function normalizeThemeMode(theme = "light") {
    return theme === "dark" ? "dark" : "light";
  }
  function normalizeThemePreference(mode = THEME_MODE_SYSTEM) {
    if (THEME_MODE_MANUAL.includes(mode))
      return mode;
    return THEME_MODE_SYSTEM;
  }
  function getLightBridgeVar(token, fallback) {
    return `var(--up-light-${token}, ${fallback})`;
  }
  function clearOverrideBucket(bucket) {
    Object.keys(bucket).forEach((key) => {
      delete bucket[key];
    });
  }
  function normalizeLightThemeToken(token = "") {
    if (typeof token !== "string")
      return "";
    if (token.indexOf("up-") === 0)
      return token.slice(3);
    if (token.indexOf("u-") === 0)
      return token.slice(2);
    return token;
  }
  function isLightThemeConfigColorKey(token = "") {
    return token.indexOf("up-") === 0 || token.indexOf("u-") === 0;
  }
  function syncThemeColorOverrideState({
    color: colorOverrides,
    configColor: configColorOverrides,
    reset = false
  } = {}) {
    if (reset) {
      clearOverrideBucket(runtimeThemeOverrideState.color);
      clearOverrideBucket(runtimeThemeOverrideState.configColor);
    }
    if (colorOverrides && typeof colorOverrides === "object") {
      Object.keys(LIGHT_THEME_FIELD_TOKEN_MAP).forEach((field) => {
        if (!Object.prototype.hasOwnProperty.call(colorOverrides, field))
          return;
        const value = colorOverrides[field];
        if (typeof value === "string" && value) {
          runtimeThemeOverrideState.color[field] = true;
          return;
        }
        delete runtimeThemeOverrideState.color[field];
      });
    }
    if (configColorOverrides && typeof configColorOverrides === "object") {
      Object.keys(configColorOverrides).forEach((key) => {
        const token = normalizeLightThemeToken(key);
        if (!Object.prototype.hasOwnProperty.call(LIGHT_THEME_TOKEN_FIELD_MAP, token))
          return;
        const value = configColorOverrides[key];
        if (typeof value === "string" && value) {
          const overrideKey = isLightThemeConfigColorKey(key) ? key : `up-${token}`;
          runtimeThemeOverrideState.configColor[overrideKey] = true;
          return;
        }
        delete runtimeThemeOverrideState.configColor[key];
        delete runtimeThemeOverrideState.configColor[`u-${token}`];
        delete runtimeThemeOverrideState.configColor[`up-${token}`];
      });
    }
  }
  function getExplicitRuntimeColorValue(token, runtimeColorMap = {}) {
    const field = LIGHT_THEME_TOKEN_FIELD_MAP[token];
    if (!field)
      return "";
    if (runtimeThemeOverrideState.color[field]) {
      const value = color$2[field];
      if (typeof value === "string" && value)
        return value;
    }
    const upKey = `up-${token}`;
    const uKey = `u-${token}`;
    if (!runtimeThemeOverrideState.configColor[upKey] && !runtimeThemeOverrideState.configColor[uKey])
      return "";
    const upValue = runtimeColorMap[upKey];
    const uValue = runtimeColorMap[uKey];
    if (runtimeThemeOverrideState.configColor[upKey] && typeof upValue === "string" && upValue)
      return upValue;
    if (runtimeThemeOverrideState.configColor[uKey] && typeof uValue === "string" && uValue)
      return uValue;
    return "";
  }
  function readThemePreferenceFromStorage() {
    try {
      if (typeof uni !== "undefined" && typeof uni.getStorageSync === "function") {
        const mode = uni.getStorageSync(THEME_MODE_STORAGE_KEY);
        return normalizeThemePreference(mode);
      }
    } catch (e) {
    }
    return THEME_MODE_SYSTEM;
  }
  function writeThemePreferenceToStorage(mode) {
    try {
      if (typeof uni !== "undefined" && typeof uni.setStorageSync === "function") {
        uni.setStorageSync(THEME_MODE_STORAGE_KEY, mode);
      }
    } catch (e) {
    }
  }
  function getSystemTheme() {
    let theme = "light";
    try {
      if (typeof uni !== "undefined" && typeof uni.getAppBaseInfo === "function") {
        const appBaseInfo = uni.getAppBaseInfo() || {};
        if (appBaseInfo.theme) {
          theme = appBaseInfo.theme;
        }
      }
      if (typeof uni !== "undefined" && typeof uni.getSystemInfoSync === "function") {
        const systemInfo = uni.getSystemInfoSync() || {};
        if (systemInfo.theme) {
          theme = systemInfo.theme;
        }
      }
    } catch (e) {
      theme = "light";
    }
    return normalizeThemeMode(theme);
  }
  function getCurrentLightThemeColors() {
    const runtimeColorMap = config.color || {};
    const lightThemeColors = {
      ...DEFAULT_LIGHT_THEME_COLORS
    };
    Object.keys(LIGHT_THEME_TOKEN_FIELD_MAP).forEach((token) => {
      const explicitValue = getExplicitRuntimeColorValue(token, runtimeColorMap);
      if (!explicitValue)
        return;
      lightThemeColors[LIGHT_THEME_TOKEN_FIELD_MAP[token]] = explicitValue;
    });
    return lightThemeColors;
  }
  function getThemeColorsByMode(mode) {
    if (!cachedLightThemeColors) {
      cachedLightThemeColors = getCurrentLightThemeColors();
    }
    const themeMode = normalizeThemeMode(mode);
    if (themeMode === "dark") {
      return {
        ...DEFAULT_DARK_THEME_COLORS,
        primary: cachedLightThemeColors.primary,
        info: cachedLightThemeColors.info,
        warning: cachedLightThemeColors.warning,
        error: cachedLightThemeColors.error,
        success: cachedLightThemeColors.success
      };
    }
    return {
      ...cachedLightThemeColors
    };
  }
  function buildConfigColorMap(themeColors) {
    return {
      "u-primary": themeColors.primary,
      "u-primary-dark": themeColors.primaryDark,
      "u-primary-disabled": themeColors.primaryDisabled,
      "u-primary-light": themeColors.primaryLight,
      "u-warning": themeColors.warning,
      "u-warning-dark": themeColors.warningDark,
      "u-warning-disabled": themeColors.warningDisabled,
      "u-warning-light": themeColors.warningLight,
      "u-success": themeColors.success,
      "u-success-dark": themeColors.successDark,
      "u-success-disabled": themeColors.successDisabled,
      "u-success-light": themeColors.successLight,
      "u-error": themeColors.error,
      "u-error-dark": themeColors.errorDark,
      "u-error-disabled": themeColors.errorDisabled,
      "u-error-light": themeColors.errorLight,
      "u-info": themeColors.info,
      "u-info-dark": themeColors.infoDark,
      "u-info-disabled": themeColors.infoDisabled,
      "u-info-light": themeColors.infoLight,
      "u-main-color": themeColors.mainColor,
      "u-content-color": themeColors.contentColor,
      "u-tips-color": themeColors.tipsColor,
      "u-light-color": themeColors.lightColor,
      "u-border-color": themeColors.borderColor,
      "u-bg-color": themeColors.bgColor,
      "u-disabled-color": themeColors.disabledColor,
      "up-primary": themeColors.primary,
      "up-primary-dark": themeColors.primaryDark,
      "up-primary-disabled": themeColors.primaryDisabled,
      "up-primary-light": themeColors.primaryLight,
      "up-warning": themeColors.warning,
      "up-warning-dark": themeColors.warningDark,
      "up-warning-disabled": themeColors.warningDisabled,
      "up-warning-light": themeColors.warningLight,
      "up-success": themeColors.success,
      "up-success-dark": themeColors.successDark,
      "up-success-disabled": themeColors.successDisabled,
      "up-success-light": themeColors.successLight,
      "up-error": themeColors.error,
      "up-error-dark": themeColors.errorDark,
      "up-error-disabled": themeColors.errorDisabled,
      "up-error-light": themeColors.errorLight,
      "up-info": themeColors.info,
      "up-info-dark": themeColors.infoDark,
      "up-info-disabled": themeColors.infoDisabled,
      "up-info-light": themeColors.infoLight,
      "up-main-color": themeColors.mainColor,
      "up-content-color": themeColors.contentColor,
      "up-tips-color": themeColors.tipsColor,
      "up-light-color": themeColors.lightColor,
      "up-border-color": themeColors.borderColor,
      "up-bg-color": themeColors.bgColor,
      "up-disabled-color": themeColors.disabledColor
    };
  }
  function buildAliasCssVars(vars = {}) {
    const aliasVars = {};
    Object.keys(vars).forEach((key) => {
      if (typeof key !== "string")
        return;
      if (key.indexOf("--up-") === 0) {
        aliasVars[key.replace("--up-", "--u-")] = vars[key];
        return;
      }
      if (key.indexOf("--u-") === 0) {
        aliasVars[key.replace("--u-", "--up-")] = vars[key];
      }
    });
    return aliasVars;
  }
  function buildThemeCssVars(themeColors, mode = "light") {
    const themeMode = normalizeThemeMode(mode);
    const isDark = themeMode === "dark";
    const useBridge = !isDark;
    const runtimeColorMap = config.color || {};
    const defaultExtraVars = DEFAULT_THEME_EXTRA_VARS[themeMode] || DEFAULT_THEME_EXTRA_VARS.light;
    const pageBgColor = themeColors.bgColor || (isDark ? "#1f1f1f" : "#f3f4f6");
    const hoverBgColor = runtimeColorMap["up-hover-bg-color"] || runtimeColorMap["u-hover-bg-color"] || (isDark ? "#343741" : "#e7ebf0");
    const navbarBgColor = runtimeColorMap["up-navbar-bg-color"] || runtimeColorMap["u-navbar-bg-color"] || (isDark ? "#1c1c1e" : "#ffffff");
    const resolveLightTokenValue = (token, fallback) => {
      if (!useBridge)
        return fallback;
      const explicitValue = getExplicitRuntimeColorValue(token, runtimeColorMap);
      return explicitValue || getLightBridgeVar(token, fallback);
    };
    const resolvedMainColor = resolveLightTokenValue("main-color", themeColors.mainColor);
    const resolvedContentColor = resolveLightTokenValue("content-color", themeColors.contentColor);
    const resolvedTipsColor = resolveLightTokenValue("tips-color", themeColors.tipsColor);
    const resolvedLightColor = resolveLightTokenValue("light-color", themeColors.lightColor);
    const resolvedBorderColor = resolveLightTokenValue("border-color", themeColors.borderColor);
    const resolvedBgColor = resolveLightTokenValue("bg-color", themeColors.bgColor);
    const resolvedDisabledColor = resolveLightTokenValue("disabled-color", themeColors.disabledColor);
    const resolvedPrimary = resolveLightTokenValue("primary", themeColors.primary);
    const resolvedPrimaryDark = resolveLightTokenValue("primary-dark", themeColors.primaryDark);
    const resolvedPrimaryDisabled = resolveLightTokenValue("primary-disabled", themeColors.primaryDisabled);
    const resolvedPrimaryLight = resolveLightTokenValue("primary-light", themeColors.primaryLight);
    const resolvedWarning = resolveLightTokenValue("warning", themeColors.warning);
    const resolvedWarningDark = resolveLightTokenValue("warning-dark", themeColors.warningDark);
    const resolvedWarningDisabled = resolveLightTokenValue("warning-disabled", themeColors.warningDisabled);
    const resolvedWarningLight = resolveLightTokenValue("warning-light", themeColors.warningLight);
    const resolvedSuccess = resolveLightTokenValue("success", themeColors.success);
    const resolvedSuccessDark = resolveLightTokenValue("success-dark", themeColors.successDark);
    const resolvedSuccessDisabled = resolveLightTokenValue("success-disabled", themeColors.successDisabled);
    const resolvedSuccessLight = resolveLightTokenValue("success-light", themeColors.successLight);
    const resolvedError = resolveLightTokenValue("error", themeColors.error);
    const resolvedErrorDark = resolveLightTokenValue("error-dark", themeColors.errorDark);
    const resolvedErrorDisabled = resolveLightTokenValue("error-disabled", themeColors.errorDisabled);
    const resolvedErrorLight = resolveLightTokenValue("error-light", themeColors.errorLight);
    const resolvedInfo = resolveLightTokenValue("info", themeColors.info);
    const resolvedInfoDark = resolveLightTokenValue("info-dark", themeColors.infoDark);
    const resolvedInfoDisabled = resolveLightTokenValue("info-disabled", themeColors.infoDisabled);
    const resolvedInfoLight = resolveLightTokenValue("info-light", themeColors.infoLight);
    const coreVars = {
      "--u-main-color": resolvedMainColor,
      "--u-content-color": resolvedContentColor,
      "--u-tips-color": resolvedTipsColor,
      "--u-light-color": resolvedLightColor,
      "--u-border-color": resolvedBorderColor,
      "--u-bg-color": resolvedBgColor,
      "--u-hover-bg-color": hoverBgColor,
      "--u-disabled-color": resolvedDisabledColor,
      "--u-primary": resolvedPrimary,
      "--u-primary-dark": resolvedPrimaryDark,
      "--u-primary-disabled": resolvedPrimaryDisabled,
      "--u-primary-light": resolvedPrimaryLight,
      "--u-warning": resolvedWarning,
      "--u-warning-dark": resolvedWarningDark,
      "--u-warning-disabled": resolvedWarningDisabled,
      "--u-warning-light": resolvedWarningLight,
      "--u-success": resolvedSuccess,
      "--u-success-dark": resolvedSuccessDark,
      "--u-success-disabled": resolvedSuccessDisabled,
      "--u-success-light": resolvedSuccessLight,
      "--u-error": resolvedError,
      "--u-error-dark": resolvedErrorDark,
      "--u-error-disabled": resolvedErrorDisabled,
      "--u-error-light": resolvedErrorLight,
      "--u-info": resolvedInfo,
      "--u-info-dark": resolvedInfoDark,
      "--u-info-disabled": resolvedInfoDisabled,
      "--u-info-light": resolvedInfoLight,
      "--up-main-color": resolvedMainColor,
      "--up-content-color": resolvedContentColor,
      "--up-tips-color": resolvedTipsColor,
      "--up-light-color": resolvedLightColor,
      "--up-border-color": resolvedBorderColor,
      "--up-bg-color": resolvedBgColor,
      "--up-hover-bg-color": hoverBgColor,
      "--up-disabled-color": resolvedDisabledColor,
      "--up-primary": resolvedPrimary,
      "--up-primary-dark": resolvedPrimaryDark,
      "--up-primary-disabled": resolvedPrimaryDisabled,
      "--up-primary-light": resolvedPrimaryLight,
      "--up-warning": resolvedWarning,
      "--up-warning-dark": resolvedWarningDark,
      "--up-warning-disabled": resolvedWarningDisabled,
      "--up-warning-light": resolvedWarningLight,
      "--up-success": resolvedSuccess,
      "--up-success-dark": resolvedSuccessDark,
      "--up-success-disabled": resolvedSuccessDisabled,
      "--up-success-light": resolvedSuccessLight,
      "--up-error": resolvedError,
      "--up-error-dark": resolvedErrorDark,
      "--up-error-disabled": resolvedErrorDisabled,
      "--up-error-light": resolvedErrorLight,
      "--up-info": resolvedInfo,
      "--up-info-dark": resolvedInfoDark,
      "--up-info-disabled": resolvedInfoDisabled,
      "--up-info-light": resolvedInfoLight,
      "--up-page-bg-color": pageBgColor,
      "--up-card-bg-color": isDark ? "#1c1c1e" : "#ffffff",
      "--up-navbar-bg-color": navbarBgColor
    };
    const extraVars = {};
    Object.keys(runtimeColorMap).forEach((key) => {
      if (typeof key !== "string")
        return;
      const isThemeToken = key.indexOf("up-") === 0 || key.indexOf("u-") === 0;
      if (!isThemeToken)
        return;
      const cssVarName = `--${key}`;
      if (Object.prototype.hasOwnProperty.call(coreVars, cssVarName))
        return;
      const value = runtimeColorMap[key];
      if (typeof value === "string" && value) {
        extraVars[cssVarName] = value;
      }
    });
    return {
      ...coreVars,
      ...defaultExtraVars,
      ...buildAliasCssVars(defaultExtraVars),
      ...extraVars,
      ...buildAliasCssVars(extraVars)
    };
  }
  function getThemeVars(mode) {
    if (mode) {
      return buildThemeCssVars(getThemeColorsByMode(mode), mode);
    }
    if (themeState.vars && Object.keys(themeState.vars).length > 0) {
      return { ...themeState.vars };
    }
    return buildThemeCssVars(getThemeColorsByMode(themeState.mode), themeState.mode);
  }
  function hasActiveRuntimePage() {
    try {
      if (typeof getCurrentPages === "function") {
        const pages2 = getCurrentPages();
        return Array.isArray(pages2) && pages2.length > 0;
      }
    } catch (e) {
    }
    return false;
  }
  function trySetNavigationBarColor(options) {
    if (typeof uni === "undefined" || typeof uni.setNavigationBarColor !== "function")
      return;
    if (!hasActiveRuntimePage())
      return;
    try {
      const result = uni.setNavigationBarColor(options);
      if (result && typeof result.catch === "function") {
        result.catch(() => {
        });
      }
    } catch (e) {
    }
  }
  function applyNativeThemeUI(mode, themeColors, themeVars = {}) {
    var _a, _b;
    if (typeof uni === "undefined")
      return;
    if (config.nativeThemeSync !== true)
      return;
    const isDark = normalizeThemeMode(mode) === "dark";
    const pageBg = (themeColors == null ? void 0 : themeColors.bgColor) || (isDark ? "#1f1f1f" : "#f3f4f6");
    const navBg = (themeVars == null ? void 0 : themeVars["--up-navbar-bg-color"]) || (themeVars == null ? void 0 : themeVars["--u-navbar-bg-color"]) || ((_a = config.color) == null ? void 0 : _a["up-navbar-bg-color"]) || ((_b = config.color) == null ? void 0 : _b["u-navbar-bg-color"]) || (isDark ? "#1c1c1e" : "#ffffff");
    trySetNavigationBarColor({
      frontColor: isDark ? "#ffffff" : "#000000",
      backgroundColor: navBg,
      animation: {
        duration: 0,
        timingFunc: "linear"
      }
    });
    if (typeof uni.setBackgroundColor === "function") {
      uni.setBackgroundColor({
        backgroundColor: pageBg,
        backgroundColorTop: pageBg,
        backgroundColorBottom: pageBg
      });
    }
    trySetTabBarStyle({
      color: isDark ? "#8e8e93" : "#909399",
      selectedColor: isDark ? "#f2f2f7" : "#303133",
      backgroundColor: isDark ? "#111111" : "#ffffff",
      borderStyle: isDark ? "white" : "black"
    });
  }
  function applyTheme(mode = "light") {
    const themeMode = normalizeThemeMode(mode);
    const themeColors = getThemeColorsByMode(themeMode);
    const themeVars = buildThemeCssVars(themeColors, themeMode);
    index.shallowMerge(color$2, {
      primary: themeColors.primary,
      primaryDark: themeColors.primaryDark,
      primaryDisabled: themeColors.primaryDisabled,
      primaryLight: themeColors.primaryLight,
      info: themeColors.info,
      infoDark: themeColors.infoDark,
      infoDisabled: themeColors.infoDisabled,
      infoLight: themeColors.infoLight,
      default: themeColors.info,
      warning: themeColors.warning,
      warningDark: themeColors.warningDark,
      warningDisabled: themeColors.warningDisabled,
      warningLight: themeColors.warningLight,
      error: themeColors.error,
      errorDark: themeColors.errorDark,
      errorDisabled: themeColors.errorDisabled,
      errorLight: themeColors.errorLight,
      success: themeColors.success,
      successDark: themeColors.successDark,
      successDisabled: themeColors.successDisabled,
      successLight: themeColors.successLight,
      mainColor: themeColors.mainColor,
      contentColor: themeColors.contentColor,
      tipsColor: themeColors.tipsColor,
      lightColor: themeColors.lightColor,
      borderColor: themeColors.borderColor,
      bgColor: themeColors.bgColor,
      disabledColor: themeColors.disabledColor
    });
    index.shallowMerge(config.color, buildConfigColorMap(themeColors));
    config.themeMode = themeMode;
    themeState.preference = currentThemePreference;
    themeState.mode = themeMode;
    themeState.vars = { ...themeVars };
    themeState.version = Number(themeState.version || 0) + 1;
    applyNativeThemeUI(themeMode, themeColors, themeVars);
    if (typeof uni !== "undefined" && uni.$u && uni.$u.theme) {
      uni.$u.theme.mode = themeState.mode;
      if (Object.prototype.hasOwnProperty.call(uni.$u.theme, "colors")) {
        delete uni.$u.theme.colors;
      }
      uni.$u.theme.vars = { ...themeState.vars };
      uni.$u.theme.version = themeState.version;
    }
    if (typeof uni !== "undefined" && typeof uni.$emit === "function") {
      uni.$emit("uThemeChange", {
        mode: themeState.mode,
        colors: { ...themeColors },
        version: themeState.version,
        vars: { ...themeState.vars }
      });
    }
    return themeState;
  }
  function setTheme(mode = "light") {
    currentThemePreference = normalizeThemeMode(mode);
    writeThemePreferenceToStorage(currentThemePreference);
    return applyTheme(currentThemePreference);
  }
  function setThemePreference(mode = THEME_MODE_SYSTEM) {
    currentThemePreference = normalizeThemePreference(mode);
    writeThemePreferenceToStorage(currentThemePreference);
    if (currentThemePreference === THEME_MODE_SYSTEM) {
      return applyTheme(getSystemTheme());
    }
    return applyTheme(currentThemePreference);
  }
  function getThemePreference() {
    return currentThemePreference;
  }
  function refreshThemeFromConfig() {
    cachedLightThemeColors = getCurrentLightThemeColors();
    if (themeState.version > 0) {
      applyTheme(themeState.mode);
    }
  }
  function initThemeSystem() {
    if (typeof uni === "undefined")
      return;
    if (!cachedLightThemeColors) {
      cachedLightThemeColors = getCurrentLightThemeColors();
    }
    currentThemePreference = readThemePreferenceFromStorage();
    if (currentThemePreference === THEME_MODE_SYSTEM) {
      applyTheme(getSystemTheme());
    } else {
      applyTheme(currentThemePreference);
    }
    if (!hasRegisterThemeListener && typeof uni.onThemeChange === "function") {
      uni.onThemeChange((res = {}) => {
        if (currentThemePreference === THEME_MODE_SYSTEM) {
          applyTheme(res.theme);
        }
      });
      hasRegisterThemeListener = true;
    }
  }
  applyUniApiShims();
  const rootToastState = {
    ref: null
  };
  const rootNotifyState = {
    ref: null
  };
  function normalizeRootToastOptions(options = {}) {
    const toastOptions = typeof options === "string" ? { message: options } : options && typeof options === "object" ? { ...options } : {};
    if (!toastOptions.message && toastOptions.title) {
      toastOptions.message = toastOptions.title;
    }
    return toastOptions;
  }
  function setRootToastRef(ref = null) {
    rootToastState.ref = ref || null;
  }
  function rootToast(options = {}) {
    const toastOptions = normalizeRootToastOptions(options);
    const toastRef = rootToastState.ref;
    if (toastRef && typeof toastRef.show === "function") {
      toastRef.show(toastOptions);
      return;
    }
    if (!toastOptions.message)
      return;
    if (typeof uni !== "undefined" && typeof uni.showToast === "function") {
      uni.showToast({
        title: toastOptions.message,
        icon: "none",
        duration: Number(toastOptions.duration) || 2e3
      });
    }
  }
  function normalizeRootNotifyOptions(options = {}) {
    const notifyOptions = typeof options === "string" ? { message: options } : options && typeof options === "object" ? { ...options } : {};
    if (!notifyOptions.message && notifyOptions.title) {
      notifyOptions.message = notifyOptions.title;
    }
    return notifyOptions;
  }
  function setRootNotifyRef(ref = null) {
    rootNotifyState.ref = ref || null;
  }
  function rootNotify(options = {}) {
    const notifyOptions = normalizeRootNotifyOptions(options);
    const notifyRef = rootNotifyState.ref;
    if (notifyRef && typeof notifyRef.show === "function") {
      notifyRef.show(notifyOptions);
      return;
    }
    if (!notifyOptions.message)
      return;
    if (typeof uni !== "undefined" && typeof uni.showToast === "function") {
      uni.showToast({
        title: notifyOptions.message,
        icon: "none",
        duration: Number(notifyOptions.duration) || 3e3
      });
    }
  }
  let themeType = ["primary", "success", "error", "warning", "info"];
  function setConfig(configs) {
    var _a, _b;
    const settings2 = configs || {};
    index.shallowMerge(config, settings2.config || {});
    setPropsConfig(settings2.props || {});
    index.shallowMerge(color$2, settings2.color || {});
    index.shallowMerge(zIndex, settings2.zIndex || {});
    syncThemeColorOverrideState({
      color: settings2.color,
      configColor: (_a = settings2 == null ? void 0 : settings2.config) == null ? void 0 : _a.color
    });
    const shouldRefreshTheme = !!settings2.color || !!((_b = settings2 == null ? void 0 : settings2.config) == null ? void 0 : _b.color) || themeState.version > 0;
    if (shouldRefreshTheme) {
      refreshThemeFromConfig();
    }
  }
  index.setConfig = setConfig;
  const $u = {
    route,
    date: index.timeFormat,
    // 另名date
    colorGradient: colorGradient$1.colorGradient,
    hexToRgb: colorGradient$1.hexToRgb,
    rgbToHex: colorGradient$1.rgbToHex,
    colorToRgba: colorGradient$1.colorToRgba,
    test,
    type: themeType,
    http,
    config,
    // uview-plus配置信息相关，比如版本号
    zIndex,
    debounce,
    throttle,
    calc,
    mixin,
    mpMixin,
    props: props$b,
    ...index,
    color: color$2,
    platform: platform$1,
    theme: themeState,
    setTheme,
    setThemePreference,
    getThemePreference,
    getSystemTheme,
    getThemeVars,
    getThemeTabBarStyle,
    applyNativeThemeUI: applyNativeThemeUI$1,
    rootToast,
    setRootToastRef,
    rootNotify,
    setRootNotifyRef
  };
  function defineGlobalThemeHelpers(Vue2) {
    var _a;
    const globalProperties = (_a = Vue2 == null ? void 0 : Vue2.config) == null ? void 0 : _a.globalProperties;
    if (!globalProperties)
      return;
    Object.defineProperty(globalProperties, "upThemeIsDark", {
      configurable: true,
      get() {
        return getThemeIsDark();
      }
    });
    Object.defineProperty(globalProperties, "upThemeVars", {
      configurable: true,
      get() {
        return getThemeVarsForStyle();
      }
    });
    Object.defineProperty(globalProperties, "upThemePageStyle", {
      configurable: true,
      get() {
        return getThemePageStyle();
      }
    });
    Object.defineProperty(globalProperties, "upThemeCardStyle", {
      configurable: true,
      get() {
        return getThemeCardStyle();
      }
    });
    globalProperties.upThemeVar = function(varName, fallbackColor) {
      return getThemeVar(varName, fallbackColor);
    };
    globalProperties.upApplyNativeThemeUI = function() {
      return applyNativeThemeUI$1();
    };
  }
  const install = (Vue2, upuiParams = "") => {
    if (upuiParams) {
      uni.upuiParams = upuiParams;
      let temp = upuiParams();
      if (temp.httpIns) {
        temp.httpIns(http);
      }
      if (temp.options) {
        setConfig(temp.options);
      }
    }
    uni.$u = $u;
    initThemeSystem();
    if (Vue2 && Vue2.config && Vue2.config.globalProperties) {
      Vue2.config.globalProperties.$u = $u;
      defineGlobalThemeHelpers(Vue2);
    }
    if (Vue2 && typeof Vue2.mixin === "function") {
      Vue2.mixin(mixin);
    }
  };
  const uviewPlus = {
    install
  };
  function createApp() {
    const app = vue.createVueApp(App);
    app.use(uviewPlus);
    app.use(createPinia());
    return {
      app
    };
  }
  const { app: __app__, Vuex: __Vuex__, Pinia: __Pinia__ } = createApp();
  uni.Vuex = __Vuex__;
  uni.Pinia = __Pinia__;
  __app__.provide("__globalStyles", __uniConfig.styles);
  __app__._component.mpType = "app";
  __app__._component.render = () => {
  };
  __app__.mount("#app");
})(Vue);
