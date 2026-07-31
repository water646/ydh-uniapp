import "./chunk-Y2F7D3TJ.js";

// F:/项目文件/uniapp版本/node_modules/uview-plus/libs/function/uni-api-shims.js
var needShims = [
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

// F:/项目文件/uniapp版本/node_modules/uview-plus/libs/vue.js
var defineMixin = (options) => {
  return options;
};

// F:/项目文件/uniapp版本/node_modules/uview-plus/libs/function/test.js
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
function range(value, param) {
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
var test_default = {
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
  range,
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

// F:/项目文件/uniapp版本/node_modules/uview-plus/libs/function/digit.js
var _boundaryCheckingState = true;
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
  if (_boundaryCheckingState) {
    if (num > Number.MAX_SAFE_INTEGER || num < Number.MIN_SAFE_INTEGER) {
      console.warn(`${num} 超出了精度限制，结果可能不正确`);
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
function plus(...nums) {
  if (nums.length > 2) {
    return iteratorOperation(nums, plus);
  }
  const [num1, num2] = nums;
  const baseNum = Math.pow(10, Math.max(digitLength(num1), digitLength(num2)));
  return (times(num1, baseNum) + times(num2, baseNum)) / baseNum;
}
function minus(...nums) {
  if (nums.length > 2) {
    return iteratorOperation(nums, minus);
  }
  const [num1, num2] = nums;
  const baseNum = Math.pow(10, Math.max(digitLength(num1), digitLength(num2)));
  return (times(num1, baseNum) - times(num2, baseNum)) / baseNum;
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
function enableBoundaryChecking(flag2 = true) {
  _boundaryCheckingState = flag2;
}
var digit_default = {
  times,
  plus,
  minus,
  divide,
  round,
  enableBoundaryChecking
};

// F:/项目文件/uniapp版本/node_modules/uview-plus/libs/config/config.js
var version = "3";
if (true) {
  console.log(`
 %c uview-plus V${version} %c https://uview-plus.jiangruyi.com/ 

`, "color: #ffffff; background: #3c9cff; padding:5px 0;", "color: #3c9cff;background: #ffffff; padding:5px 0;");
}
var config_default = {
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

// F:/项目文件/uniapp版本/node_modules/uview-plus/libs/function/index.js
function range2(min = 0, max = 0, value = 0) {
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
  return uni.rpx2px(value);
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
function getDeviceInfo() {
  let ret = {};
  ret = uni.getDeviceInfo();
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
    unit = config_default.unit || "px";
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
  if (true) {
    console.error(`uView提示：${err}`);
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
      const key2 = keys.shift();
      inFn(_obj[k], keys, v);
    }
  };
  if (typeof key !== "string" || key === "") {
  } else if (key.indexOf(".") !== -1) {
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
var function_default = {
  range: range2,
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

// F:/项目文件/uniapp版本/node_modules/uview-plus/libs/util/route.js
var Router = class {
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
    let mergeConfig = {};
    if (typeof options === "string") {
      mergeConfig.url = this.mixinParam(options, params2);
      mergeConfig.type = "navigateTo";
    } else {
      mergeConfig = deepMerge(this.config, options);
      mergeConfig.url = this.mixinParam(options.url, options.params);
    }
    if (mergeConfig.url === page())
      return;
    if (params2.intercept) {
      this.config.intercept = params2.intercept;
    }
    mergeConfig.params = params2;
    mergeConfig = deepMerge(this.config, mergeConfig);
    if (typeof uni.$u.routeIntercept === "function") {
      const isNext = await new Promise((resolve, reject) => {
        uni.$u.routeIntercept(mergeConfig, resolve);
      });
      isNext && this.openPage(mergeConfig);
    } else {
      this.openPage(mergeConfig);
    }
  }
  // 执行路由跳转
  openPage(config) {
    const {
      url: url2,
      type,
      delta,
      animationType,
      animationDuration
    } = config;
    if (config.type == "navigateTo" || config.type == "to") {
      uni.navigateTo({
        url: url2,
        animationType,
        animationDuration
      });
    }
    if (config.type == "redirectTo" || config.type == "redirect") {
      uni.redirectTo({
        url: url2
      });
    }
    if (config.type == "switchTab" || config.type == "tab") {
      uni.switchTab({
        url: url2
      });
    }
    if (config.type == "reLaunch" || config.type == "launch") {
      uni.reLaunch({
        url: url2
      });
    }
    if (config.type == "navigateBack" || config.type == "back") {
      uni.navigateBack({
        delta
      });
    }
  }
};
var route_default = new Router().route;

// F:/项目文件/uniapp版本/node_modules/uview-plus/libs/theme/runtime.js
var THEME_MODE_STORAGE_KEY = "u-theme-mode";
var FALLBACK_THEME_VARS = {
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
var THEME_COLOR_SYNC_MAP = {
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
function normalizeRuntimeRoute(route) {
  if (typeof route !== "string")
    return "";
  return route.replace(/^\//, "").split("?")[0];
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
        const route = normalizeRuntimeRoute((item == null ? void 0 : item.pagePath) || "");
        if (route)
          routes.push(route);
      });
    }
  } catch (e) {
  }
  return routes;
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
function isTabBarPage() {
  const route = getCurrentRuntimeRoute();
  if (!route)
    return false;
  const tabBarRoutes = getRuntimeTabBarRoutes();
  if (!tabBarRoutes.length)
    return false;
  return tabBarRoutes.includes(route);
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
function normalizeThemeMode(theme = "light") {
  return theme === "dark" ? "dark" : "light";
}
function normalizeThemePreference(mode = "system") {
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
  return normalizeThemeMode(theme);
}
function getFallbackThemePreference() {
  try {
    if (typeof uni !== "undefined" && typeof uni.getStorageSync === "function") {
      const preference = uni.getStorageSync(THEME_MODE_STORAGE_KEY);
      return normalizeThemePreference(preference);
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
  const vars = FALLBACK_THEME_VARS[normalizeThemeMode(mode)] || FALLBACK_THEME_VARS.light;
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
function applyNativeThemeUI(upU) {
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
  trySetTabBarStyle(getThemeTabBarStyle(runtimeU));
}
function applyNativeThemeUIDeferred(upU, delay = 30) {
  applyNativeThemeUI(upU);
  if (typeof setTimeout === "function") {
    setTimeout(() => {
      applyNativeThemeUI(upU);
    }, delay);
  }
}

// F:/项目文件/uniapp版本/node_modules/uview-plus/libs/mixin/mixin.js
var mixin = defineMixin({
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
        route_default({ type: this.linkType, url: url2 });
      }
    },
    navTo(url2 = "", linkType = "navigateTo") {
      route_default({ type: this.linkType, url: url2 });
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
    if (this.parent && test_default.array(this.parent.children)) {
      const childrenList = this.parent.children;
      childrenList.map((child, index) => {
        if (child === this) {
          childrenList.splice(index, 1);
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

// F:/项目文件/uniapp版本/node_modules/uview-plus/libs/mixin/mpMixin.js
var mpMixin = defineMixin({});

// F:/项目文件/uniapp版本/node_modules/uview-plus/libs/function/colorGradient.js
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
var colorGradient_default = {
  colorGradient,
  hexToRgb,
  rgbToHex,
  colorToRgba
};

// F:/项目文件/uniapp版本/node_modules/uview-plus/libs/function/debounce.js
var timeout = null;
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
var debounce_default = debounce;

// F:/项目文件/uniapp版本/node_modules/uview-plus/libs/function/throttle.js
var timer;
var flag;
function throttle(func2, wait = 500, immediate = true) {
  if (immediate) {
    if (!flag) {
      flag = true;
      typeof func2 === "function" && func2();
      timer = setTimeout(() => {
        flag = false;
      }, wait);
    }
  } else if (!flag) {
    flag = true;
    timer = setTimeout(() => {
      flag = false;
      typeof func2 === "function" && func2();
    }, wait);
  }
}
var throttle_default = throttle;

// F:/项目文件/uniapp版本/node_modules/uview-plus/libs/function/calc.js
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
var calc_default = {
  add,
  sub,
  mul,
  div
};

// F:/项目文件/uniapp版本/node_modules/uview-plus/libs/config/zIndex.js
var zIndex_default = {
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

// F:/项目文件/uniapp版本/node_modules/uview-plus/libs/config/color.js
var color = {
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
var color_default = color;

// F:/项目文件/uniapp版本/node_modules/uview-plus/libs/luch-request/utils.js
var { toString } = Object.prototype;
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
function isPlainObject(obj) {
  return Object.prototype.toString.call(obj) === "[object Object]";
}
function deepMerge2() {
  const result = {};
  function assignValue(val, key) {
    if (typeof result[key] === "object" && typeof val === "object") {
      result[key] = deepMerge2(result[key], val);
    } else if (typeof val === "object") {
      result[key] = deepMerge2({}, val);
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

// F:/项目文件/uniapp版本/node_modules/uview-plus/libs/luch-request/helpers/buildURL.js
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

// F:/项目文件/uniapp版本/node_modules/uview-plus/libs/luch-request/helpers/isAbsoluteURL.js
function isAbsoluteURL(url2) {
  return /^([a-z][a-z\d+\-.]*:)?\/\//i.test(url2);
}

// F:/项目文件/uniapp版本/node_modules/uview-plus/libs/luch-request/helpers/combineURLs.js
function combineURLs(baseURL, relativeURL) {
  return relativeURL ? `${baseURL.replace(/\/+$/, "")}/${relativeURL.replace(/^\/+/, "")}` : baseURL;
}

// F:/项目文件/uniapp版本/node_modules/uview-plus/libs/luch-request/core/buildFullPath.js
function buildFullPath(baseURL, requestedURL) {
  if (baseURL && !isAbsoluteURL(requestedURL)) {
    return combineURLs(baseURL, requestedURL);
  }
  return requestedURL;
}

// F:/项目文件/uniapp版本/node_modules/uview-plus/libs/luch-request/core/settle.js
function settle(resolve, reject, response) {
  const { validateStatus: validateStatus2 } = response.config;
  const status = response.statusCode;
  if (status && (!validateStatus2 || validateStatus2(status))) {
    resolve(response);
  } else {
    reject(response);
  }
}

// F:/项目文件/uniapp版本/node_modules/uview-plus/libs/luch-request/adapters/index.js
var mergeKeys = (keys, config2) => {
  const config = {};
  keys.forEach((prop) => {
    if (!isUndefined(config2[prop])) {
      config[prop] = config2[prop];
    }
  });
  return config;
};
var adapters_default = (config) => new Promise((resolve, reject) => {
  const fullPath = buildURL(buildFullPath(config.baseURL, config.url), config.params);
  const _config = {
    url: fullPath,
    header: config.header,
    complete: (response) => {
      config.fullPath = fullPath;
      response.config = config;
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
  if (config.method === "UPLOAD") {
    delete _config.header["content-type"];
    delete _config.header["Content-Type"];
    const otherConfig = {
      filePath: config.filePath,
      name: config.name
    };
    const optionalKeys = [
      "files",
      "file",
      "timeout",
      "formData"
    ];
    requestTask = uni.uploadFile({ ..._config, ...otherConfig, ...mergeKeys(optionalKeys, config) });
  } else if (config.method === "DOWNLOAD") {
    if (!isUndefined(config.timeout)) {
      _config.timeout = config.timeout;
    }
    requestTask = uni.downloadFile(_config);
  } else {
    const optionalKeys = [
      "data",
      "method",
      "timeout",
      "dataType",
      "responseType",
      "withCredentials"
    ];
    requestTask = uni.request({ ..._config, ...mergeKeys(optionalKeys, config) });
  }
  if (config.getTask) {
    config.getTask(requestTask, config);
  }
});

// F:/项目文件/uniapp版本/node_modules/uview-plus/libs/luch-request/core/dispatchRequest.js
var dispatchRequest_default = (config) => adapters_default(config);

// F:/项目文件/uniapp版本/node_modules/uview-plus/libs/luch-request/core/InterceptorManager.js
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
var InterceptorManager_default = InterceptorManager;

// F:/项目文件/uniapp版本/node_modules/uview-plus/libs/luch-request/core/mergeConfig.js
var mergeKeys2 = (keys, globalsConfig, config2) => {
  const config = {};
  keys.forEach((prop) => {
    if (!isUndefined(config2[prop])) {
      config[prop] = config2[prop];
    } else if (!isUndefined(globalsConfig[prop])) {
      config[prop] = globalsConfig[prop];
    }
  });
  return config;
};
var mergeConfig_default = (globalsConfig, config2 = {}) => {
  const method = config2.method || globalsConfig.method || "GET";
  let config = {
    baseURL: globalsConfig.baseURL || "",
    method,
    url: config2.url || "",
    params: config2.params || {},
    custom: { ...globalsConfig.custom || {}, ...config2.custom || {} },
    header: deepMerge2(globalsConfig.header || {}, config2.header || {})
  };
  const defaultToConfig2Keys = ["getTask", "validateStatus"];
  config = { ...config, ...mergeKeys2(defaultToConfig2Keys, globalsConfig, config2) };
  if (method === "DOWNLOAD") {
    if (!isUndefined(config2.timeout)) {
      config.timeout = config2.timeout;
    } else if (!isUndefined(globalsConfig.timeout)) {
      config.timeout = globalsConfig.timeout;
    }
  } else if (method === "UPLOAD") {
    delete config.header["content-type"];
    delete config.header["Content-Type"];
    const uploadKeys = [
      "files",
      "file",
      "filePath",
      "name",
      "timeout",
      "formData"
    ];
    uploadKeys.forEach((prop) => {
      if (!isUndefined(config2[prop])) {
        config[prop] = config2[prop];
      }
    });
    if (isUndefined(config.timeout) && !isUndefined(globalsConfig.timeout)) {
      config.timeout = globalsConfig.timeout;
    }
  } else {
    const defaultsKeys = [
      "data",
      "timeout",
      "dataType",
      "responseType",
      "withCredentials"
    ];
    config = { ...config, ...mergeKeys2(defaultsKeys, globalsConfig, config2) };
  }
  return config;
};

// F:/项目文件/uniapp版本/node_modules/uview-plus/libs/luch-request/core/defaults.js
var defaults_default = {
  baseURL: "",
  header: {},
  method: "GET",
  dataType: "json",
  responseType: "text",
  custom: {},
  timeout: 6e4,
  withCredentials: false,
  validateStatus: function validateStatus(status) {
    return status >= 200 && status < 300;
  }
};

// F:/项目文件/uniapp版本/node_modules/uview-plus/libs/luch-request/utils/clone.js
var clone = function() {
  "use strict";
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
        var index = allParents.indexOf(parent2);
        if (index != -1) {
          return allChildren[index];
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
var clone_default = clone;

// F:/项目文件/uniapp版本/node_modules/uview-plus/libs/luch-request/core/Request.js
var Request = class {
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
    if (!isPlainObject(arg)) {
      arg = {};
      console.warn("设置全局参数必须接收一个Object");
    }
    this.config = clone_default({ ...defaults_default, ...arg });
    this.interceptors = {
      request: new InterceptorManager_default(),
      response: new InterceptorManager_default()
    };
  }
  /**
  * @Function
  * @param {Request~setConfigCallback} f - 设置全局默认配置
  */
  setConfig(f) {
    this.config = f(this.config);
  }
  middleware(config) {
    config = mergeConfig_default(this.config, config);
    const chain = [dispatchRequest_default, void 0];
    let promise2 = Promise.resolve(config);
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
  request(config = {}) {
    return this.middleware(config);
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
  connect(url2, data, options = {}) {
    return this.middleware({
      url: url2,
      data,
      method: "CONNECT",
      ...options
    });
  }
  head(url2, data, options = {}) {
    return this.middleware({
      url: url2,
      data,
      method: "HEAD",
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
  trace(url2, data, options = {}) {
    return this.middleware({
      url: url2,
      data,
      method: "TRACE",
      ...options
    });
  }
  upload(url2, config = {}) {
    config.url = url2;
    config.method = "UPLOAD";
    return this.middleware(config);
  }
  download(url2, config = {}) {
    config.url = url2;
    config.method = "DOWNLOAD";
    return this.middleware(config);
  }
};

// F:/项目文件/uniapp版本/node_modules/uview-plus/libs/luch-request/index.js
var luch_request_default = Request;

// F:/项目文件/uniapp版本/node_modules/uview-plus/libs/function/http.js
var http = new luch_request_default();
var http_default = http;

// F:/项目文件/uniapp版本/node_modules/uview-plus/libs/config/props.js
var componentKeys = [
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
var props = {};
function ensureComponentProps(key) {
  if (!props[key] || typeof props[key] !== "object") {
    props[key] = {};
  }
  return props[key];
}
componentKeys.forEach(ensureComponentProps);
function setPropsConfig(configProps = {}) {
  Object.keys(configProps || {}).forEach((key) => {
    shallowMerge(ensureComponentProps(key), configProps[key]);
  });
  return props;
}
function setConfig(configs = {}) {
  shallowMerge(config_default, configs.config || {});
  setPropsConfig(configs.props || {});
  shallowMerge(color_default, configs.color || {});
  shallowMerge(zIndex_default, configs.zIndex || {});
}
if (typeof uni !== "undefined" && uni && uni.upuiParams) {
  console.log("setting uview-plus");
  let temp = uni.upuiParams();
  if (temp.httpIns) {
    temp.httpIns(http_default);
  }
  if (temp.options) {
    setConfig(temp.options);
  }
}
var props_default = props;

// F:/项目文件/uniapp版本/node_modules/uview-plus/libs/function/platform.js
var platform = "none";
platform = "vue3";
platform = "h5";
var platform_default = platform;

// F:/项目文件/uniapp版本/node_modules/uview-plus/components/u-icon/util.js
var iconFontFamily = "uicon-iconfont";
var params = {
  loaded: false
};
var getIconUrl = () => {
  return config_default.iconUrl;
};
var markFontLoaded = () => {
  if (config_default.loadFontOnce) {
    params.loaded = true;
  }
};
var loadFont = () => {
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
  if (config_default.customIcon.family) {
    uni.loadFontFace({
      global: true,
      // 是否全局生效。微信小程序 '2.10.0'起支持全局生效，需在 app.vue 中调用。
      family: config_default.customIcon.family,
      source: 'url("' + config_default.customIcon.url + '")',
      success() {
      },
      fail() {
      }
    });
  }
  return true;
};
var util_default = {
  params,
  loadFont
};

// F:/项目文件/uniapp版本/node_modules/uview-plus/libs/i18n/locales/zh-Hans.js
var zh_Hans_default = {
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

// F:/项目文件/uniapp版本/node_modules/uview-plus/libs/i18n/index.js
var settings = {
  lang: typeof uni !== "undefined" && typeof uni.getLocale === "function" ? uni.getLocale() : "zh-Hans",
  locales: {
    "zh-Hans": zh_Hans_default
  }
};
if (typeof uni !== "undefined" && typeof uni.onLocaleChange === "function") {
  uni.onLocaleChange((locale) => {
    settings.lang = typeof locale === "string" ? locale : locale && locale.locale || settings.lang;
  });
}
function isPlainObject2(value) {
  return Object.prototype.toString.call(value) === "[object Object]";
}
function hasLocale(locale) {
  return !!(locale && settings.locales[locale]);
}
function getLocale() {
  return settings.lang;
}
function setLocale(locale) {
  if (!locale || typeof locale !== "string")
    return settings.lang;
  settings.lang = locale;
  if (typeof uni !== "undefined" && typeof uni.setLocale === "function") {
    try {
      uni.setLocale(locale);
    } catch (e) {
    }
  }
  return settings.lang;
}
function registerLocale(localeOrMap, messages) {
  if (typeof localeOrMap === "string") {
    if (!localeOrMap || !isPlainObject2(messages))
      return;
    settings.locales[localeOrMap] = messages;
    return;
  }
  if (!isPlainObject2(localeOrMap))
    return;
  Object.keys(localeOrMap).forEach((key) => {
    const value = localeOrMap[key];
    if (isPlainObject2(value)) {
      settings.locales[key] = value;
    }
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
var i18n_default = {
  settings
};

// F:/项目文件/uniapp版本/node_modules/uview-plus/libs/i18n/locales/zh-Hant.js
var zh_Hant_default = {
  "up.common.cancel": "取消",
  "up.common.confirm": "確定",
  "up.common.start": "開始",
  "up.common.end": "結束",
  "up.common.stop": "停止",
  "up.common.copy": "複製",
  "up.common.none": "暫無",
  "up.common.tip": "提示",
  "up.common.success": "成功",
  "up.common.fail": "失敗",
  "up.common.close": "關閉",
  "up.common.preview": "預覽",
  "up.common.re-select": "重選",
  "up.common.rotate": "旋轉",
  "up.common.pleaseChoose": "請選擇",
  "up.common.loading": "加載中",
  "up.common.loading2": "正在加載",
  "up.common.inOperation": "操作中",
  "up.common.settings": "設置",
  "up.common.retry": "重試",
  "up.common.search": "搜索",
  "up.common.more": "更多",
  "up.common.video": "視頻",
  "up.common.file": "文件",
  "up.week.one": "一",
  "up.week.two": "二",
  "up.week.three": "三",
  "up.week.four": "四",
  "up.week.five": "五",
  "up.week.six": "六",
  "up.week.seven": "日",
  "up.barcode.error": "生成條碼失敗",
  "up.calendar.chooseDates": "日期選擇",
  "up.calendar.disabled": "該日期已禁用",
  "up.calendar.daysExceed": "選擇天數不能超過{days}天",
  "up.calendar.today": "今天",
  "up.cityLocate.locateCity": "定位城市",
  "up.cityLocate.fail": "定位失敗，請點擊重試。",
  "up.cityLocate.locating": "定位中",
  "up.code.send": "獲取驗證碼",
  "up.code.resendAfter": "X秒重新獲取",
  "up.code.resend": "重新獲取",
  "up.cropper.emptyWidhtOrHeight": "裁剪框的寬或高沒有設置",
  "up.empty.car": "購物車為空",
  "up.empty.page": "頁面不存在",
  "up.empty.search": "沒有搜索結果",
  "up.empty.address": "沒有收貨地址",
  "up.empty.wifi": "沒有WiFi",
  "up.empty.order": "訂單為空",
  "up.empty.coupon": "沒有優惠券",
  "up.empty.favor": "暫無收藏",
  "up.empty.permission": "無權限",
  "up.empty.history": "無歷史記錄",
  "up.empty.news": "無新聞列表",
  "up.empty.message": "消息列表為空",
  "up.empty.list": "列表為空",
  "up.empty.data": "數據為空",
  "up.empty.comment": "暫無評論",
  "up.link.copyed": "鏈接已複製，請在瀏覽器打開",
  "up.loadmoe.loadmore": "加載更多",
  "up.loadmoe.nomore": "沒有更多了",
  "up.noNetwork.text": "哎呀，網絡信號丟失",
  "up.noNetwork.pleaseCheck": "請檢查網絡，或前往",
  "up.noNetwork.connect": "網絡已連接",
  "up.noNetwork.disconnect": "無網絡連接",
  "up.pagination.previous": "上一頁",
  "up.pagination.next": "下一頁",
  "up.pullRefresh.pull": "下拉刷新",
  "up.pullRefresh.release": "釋放刷新",
  "up.pullRefresh.refreshing": "正在刷新",
  "up.readMore.expand": "展開閱讀全文",
  "up.readMore.fold": "收起",
  "up.search.placeholder": "請輸入關鍵字",
  "up.signature.penSize": "筆畫大小",
  "up.signature.penColor": "筆畫顏色",
  "up.upload.sizeExceed": "超過大小限制",
  "up.upload.uploading": "上傳中",
  "up.upload.previewImageFail": "預覽圖片失敗",
  "up.upload.previewVideoFail": "預覽視頻失敗",
  "up.goodsSku.stock": "庫存",
  "up.goodsSku.price": "價格",
  "up.goodsSku.amount": "件",
  "up.goodsSku.choosed": "已選",
  "up.goodsSku.buyAmount": "購買數量"
};

// F:/项目文件/uniapp版本/node_modules/uview-plus/libs/i18n/locales/en.js
var en_default = {
  "up.common.cancel": "Cancel",
  "up.common.confirm": "Confirm",
  "up.common.start": "Start",
  "up.common.end": "End",
  "up.common.stop": "Stop",
  "up.common.copy": "Copy",
  "up.common.none": "None",
  "up.common.tip": "Tip",
  "up.common.success": "Success",
  "up.common.fail": "Fail",
  "up.common.close": "Close",
  "up.common.preview": "Preview",
  "up.common.re-select": "Re-select",
  "up.common.rotate": "Rotate",
  "up.common.pleaseChoose": "Please choose",
  "up.common.loading": "Loading",
  "up.common.loading2": "Loading",
  "up.common.inOperation": "In operation",
  "up.common.settings": "Settings",
  "up.common.retry": "Retry",
  "up.common.search": "Search",
  "up.common.more": "More",
  "up.common.video": "Video",
  "up.common.file": "File",
  "up.week.one": "Mon",
  "up.week.two": "Tue",
  "up.week.three": "Wed",
  "up.week.four": "Thu",
  "up.week.five": "Fri",
  "up.week.six": "Sat",
  "up.week.seven": "Sun",
  "up.barcode.error": "Failed to generate barcode",
  "up.calendar.chooseDates": "Date selection",
  "up.calendar.disabled": "This date is disabled",
  "up.calendar.daysExceed": "The number of selected days cannot exceed {days} days",
  "up.calendar.today": "Today",
  "up.cityLocate.locateCity": "Locate city",
  "up.cityLocate.fail": "Location failed, please click to retry.",
  "up.cityLocate.locating": "Locating",
  "up.code.send": "Get verification code",
  "up.code.resendAfter": "Resend after X seconds",
  "up.code.resend": "Resend",
  "up.cropper.emptyWidhtOrHeight": "The width or height of the cropping box is not set",
  "up.empty.car": "Shopping cart is empty",
  "up.empty.page": "Page not found",
  "up.empty.search": "No search results",
  "up.empty.address": "No shipping address",
  "up.empty.wifi": "No WiFi",
  "up.empty.order": "Order is empty",
  "up.empty.coupon": "No coupons",
  "up.empty.favor": "No favorites",
  "up.empty.permission": "No permission",
  "up.empty.history": "No history",
  "up.empty.news": "No news list",
  "up.empty.message": "Message list is empty",
  "up.empty.list": "List is empty",
  "up.empty.data": "Data is empty",
  "up.empty.comment": "No comments",
  "up.link.copyed": "Link copied, please open in browser",
  "up.loadmoe.loadmore": "Load more",
  "up.loadmoe.nomore": "No more",
  "up.noNetwork.text": "Oops, network signal lost",
  "up.noNetwork.pleaseCheck": "Please check the network, or go to",
  "up.noNetwork.connect": "Network connected",
  "up.noNetwork.disconnect": "No network connection",
  "up.pagination.previous": "Previous",
  "up.pagination.next": "Next",
  "up.pullRefresh.pull": "Pull to refresh",
  "up.pullRefresh.release": "Release to refresh",
  "up.pullRefresh.refreshing": "Refreshing",
  "up.readMore.expand": "Expand to read more",
  "up.readMore.fold": "Collapse",
  "up.search.placeholder": "Please enter keywords",
  "up.signature.penSize": "Stroke size",
  "up.signature.penColor": "Stroke color",
  "up.upload.sizeExceed": "Size limit exceeded",
  "up.upload.uploading": "Uploading",
  "up.upload.previewImageFail": "Failed to preview image",
  "up.upload.previewVideoFail": "Failed to preview video",
  "up.goodsSku.stock": "Stock",
  "up.goodsSku.price": "Price",
  "up.goodsSku.amount": "Items",
  "up.goodsSku.choosed": "Selected",
  "up.goodsSku.buyAmount": "Quantity"
};

// F:/项目文件/uniapp版本/node_modules/uview-plus/libs/i18n/locales/es.js
var es_default = {
  "up.common.cancel": "Cancelar",
  "up.common.confirm": "Confirmar",
  "up.common.start": "Iniciar",
  "up.common.end": "Finalizar",
  "up.common.stop": "Detener",
  "up.common.copy": "Copiar",
  "up.common.none": "Ninguno",
  "up.common.tip": "Consejo",
  "up.common.success": "Éxito",
  "up.common.fail": "Fallido",
  "up.common.close": "Cerrar",
  "up.common.preview": "Vista previa",
  "up.common.re-select": "Re seleccionar",
  "up.common.rotate": "Rotar",
  "up.common.pleaseChoose": "Por favor seleccione",
  "up.common.loading": "Cargando",
  "up.common.loading2": "Cargando",
  "up.common.inOperation": "En operación",
  "up.common.settings": "Configuración",
  "up.common.retry": "Reintentar",
  "up.common.search": "Buscar",
  "up.common.more": "Más",
  "up.common.video": "Vídeo",
  "up.common.file": "Archivo",
  "up.week.one": "Lun",
  "up.week.two": "Mar",
  "up.week.three": "Mié",
  "up.week.four": "Jue",
  "up.week.five": "Vie",
  "up.week.six": "Sáb",
  "up.week.seven": "Dom",
  "up.barcode.error": "Error al generar código de barras",
  "up.calendar.chooseDates": "Selección de fecha",
  "up.calendar.disabled": "Esta fecha está deshabilitada",
  "up.calendar.daysExceed": "Los días seleccionados no pueden exceder {days} días",
  "up.calendar.today": "Hoy",
  "up.cityLocate.locateCity": "Localizar ciudad",
  "up.cityLocate.fail": "Error de localización, haga clic para reintentar.",
  "up.cityLocate.locating": "Localizando",
  "up.code.send": "Obtener código de verificación",
  "up.code.resendAfter": "Reenviar en X segundos",
  "up.code.resend": "Reenviar",
  "up.cropper.emptyWidhtOrHeight": "El ancho o alto del recorte no está configurado",
  "up.empty.car": "Carrito de compras vacío",
  "up.empty.page": "Página no encontrada",
  "up.empty.search": "Sin resultados de búsqueda",
  "up.empty.address": "Sin dirección de envío",
  "up.empty.wifi": "Sin WiFi",
  "up.empty.order": "Pedido vacío",
  "up.empty.coupon": "Sin cupones",
  "up.empty.favor": "Sin favoritos",
  "up.empty.permission": "Sin permisos",
  "up.empty.history": "Sin historial",
  "up.empty.news": "Sin noticias",
  "up.empty.message": "Lista de mensajes vacía",
  "up.empty.list": "Lista vacía",
  "up.empty.data": "Datos vacíos",
  "up.empty.comment": "Sin comentarios",
  "up.link.copyed": "Enlace copiado, por favor abra en el navegador",
  "up.loadmoe.loadmore": "Cargar más",
  "up.loadmoe.nomore": "No hay más",
  "up.noNetwork.text": "¡Ups! Se perdió la señal de red",
  "up.noNetwork.pleaseCheck": "Por favor verifique la red, o vaya a",
  "up.noNetwork.connect": "Red conectada",
  "up.noNetwork.disconnect": "Sin conexión a internet",
  "up.pagination.previous": "Página anterior",
  "up.pagination.next": "Página siguiente",
  "up.pullRefresh.pull": "Deslizar hacia abajo para actualizar",
  "up.pullRefresh.release": "Soltar para actualizar",
  "up.pullRefresh.refreshing": "Actualizando",
  "up.readMore.expand": "Expandir para leer más",
  "up.readMore.fold": "Contraer",
  "up.search.placeholder": "Ingrese palabra clave",
  "up.signature.penSize": "Tamaño del trazo",
  "up.signature.penColor": "Color del trazo",
  "up.upload.sizeExceed": "Excede el límite de tamaño",
  "up.upload.uploading": "Subiendo",
  "up.upload.previewImageFail": "Error al previsualizar imagen",
  "up.upload.previewVideoFail": "Error al previsualizar vídeo",
  "up.goodsSku.stock": "Inventario",
  "up.goodsSku.price": "Precio",
  "up.goodsSku.amount": "Piezas",
  "up.goodsSku.choosed": "Seleccionado",
  "up.goodsSku.buyAmount": "Cantidad"
};

// F:/项目文件/uniapp版本/node_modules/uview-plus/libs/i18n/locales/fr.js
var fr_default = {
  "up.common.cancel": "Annuler",
  "up.common.confirm": "Confirmer",
  "up.common.start": "Démarrer",
  "up.common.end": "Terminer",
  "up.common.stop": "Arrêter",
  "up.common.copy": "Copier",
  "up.common.none": "Aucun",
  "up.common.tip": "Conseil",
  "up.common.success": "Succès",
  "up.common.fail": "Échec",
  "up.common.close": "Fermer",
  "up.common.preview": "Aperçu",
  "up.common.re-select": "Resélectionner",
  "up.common.rotate": "Rotation",
  "up.common.pleaseChoose": "Veuillez choisir",
  "up.common.loading": "Chargement",
  "up.common.loading2": "Chargement en cours",
  "up.common.inOperation": "En cours d'opération",
  "up.common.settings": "Paramètres",
  "up.common.retry": "Réessayer",
  "up.common.search": "Rechercher",
  "up.common.more": "Plus",
  "up.common.video": "Vidéo",
  "up.common.file": "Fichier",
  "up.week.one": "Lun",
  "up.week.two": "Mar",
  "up.week.three": "Mer",
  "up.week.four": "Jeu",
  "up.week.five": "Ven",
  "up.week.six": "Sam",
  "up.week.seven": "Dim",
  "up.barcode.error": "Échec de génération du code-barres",
  "up.calendar.chooseDates": "Sélection de dates",
  "up.calendar.disabled": "Cette date est désactivée",
  "up.calendar.daysExceed": "Le nombre de jours sélectionnés ne peut pas dépasser {days} jours",
  "up.calendar.today": "Aujourd'hui",
  "up.cityLocate.locateCity": "Localiser la ville",
  "up.cityLocate.fail": "Échec de localisation, veuillez cliquer pour réessayer.",
  "up.cityLocate.locating": "Localisation en cours",
  "up.code.send": "Obtenir le code de vérification",
  "up.code.resendAfter": "Renvoyer dans X secondes",
  "up.code.resend": "Renvoyer",
  "up.cropper.emptyWidhtOrHeight": "La largeur ou la hauteur de recadrage n'est pas définie",
  "up.empty.car": "Panier vide",
  "up.empty.page": "Page introuvable",
  "up.empty.search": "Aucun résultat de recherche",
  "up.empty.address": "Aucune adresse de livraison",
  "up.empty.wifi": "Aucun Wi-Fi",
  "up.empty.order": "Commande vide",
  "up.empty.coupon": "Aucun coupon",
  "up.empty.favor": "Aucun favori",
  "up.empty.permission": "Aucune autorisation",
  "up.empty.history": "Aucun historique",
  "up.empty.news": "Aucune actualité",
  "up.empty.message": "Liste de messages vide",
  "up.empty.list": "Liste vide",
  "up.empty.data": "Données vides",
  "up.empty.comment": "Aucun commentaire",
  "up.link.copyed": "Lien copié, veuillez ouvrir dans le navigateur",
  "up.loadmoe.loadmore": "Charger plus",
  "up.loadmoe.nomore": "Plus de contenu",
  "up.noNetwork.text": "Oups, le signal réseau est perdu",
  "up.noNetwork.pleaseCheck": "Veuillez vérifier le réseau, ou aller à",
  "up.noNetwork.connect": "Réseau connecté",
  "up.noNetwork.disconnect": "Aucune connexion réseau",
  "up.pagination.previous": "Page précédente",
  "up.pagination.next": "Page suivante",
  "up.pullRefresh.pull": "Tirer pour actualiser",
  "up.pullRefresh.release": "Relâcher pour actualiser",
  "up.pullRefresh.refreshing": "Actualisation en cours",
  "up.readMore.expand": "Développer pour lire la suite",
  "up.readMore.fold": "Réduire",
  "up.search.placeholder": "Veuillez saisir un mot-clé",
  "up.signature.penSize": "Taille du trait",
  "up.signature.penColor": "Couleur du trait",
  "up.upload.sizeExceed": "Dépassement de la limite de taille",
  "up.upload.uploading": "Téléchargement en cours",
  "up.upload.previewImageFail": "Échec de l'aperçu de l'image",
  "up.upload.previewVideoFail": "Échec de l'aperçu de la vidéo",
  "up.goodsSku.stock": "Stock",
  "up.goodsSku.price": "Prix",
  "up.goodsSku.amount": "Pièces",
  "up.goodsSku.choosed": "Sélectionné",
  "up.goodsSku.buyAmount": "Quantité"
};

// F:/项目文件/uniapp版本/node_modules/uview-plus/libs/i18n/locales/de.js
var de_default = {
  "up.common.cancel": "Abbrechen",
  "up.common.confirm": "Bestätigen",
  "up.common.start": "Start",
  "up.common.end": "Ende",
  "up.common.stop": "Stopp",
  "up.common.copy": "Kopieren",
  "up.common.none": "Keine",
  "up.common.tip": "Hinweis",
  "up.common.success": "Erfolg",
  "up.common.fail": "Fehlgeschlagen",
  "up.common.close": "Schließen",
  "up.common.preview": "Vorschau",
  "up.common.re-select": "Erneut auswählen",
  "up.common.rotate": "Drehen",
  "up.common.pleaseChoose": "Bitte wählen",
  "up.common.loading": "Laden",
  "up.common.loading2": "Wird geladen",
  "up.common.inOperation": "In Bearbeitung",
  "up.common.settings": "Einstellungen",
  "up.common.retry": "Wiederholen",
  "up.common.search": "Suchen",
  "up.common.more": "Mehr",
  "up.common.video": "Video",
  "up.common.file": "Datei",
  "up.week.one": "Mo",
  "up.week.two": "Di",
  "up.week.three": "Mi",
  "up.week.four": "Do",
  "up.week.five": "Fr",
  "up.week.six": "Sa",
  "up.week.seven": "So",
  "up.barcode.error": "Barcode-Generierung fehlgeschlagen",
  "up.calendar.chooseDates": "Datumsauswahl",
  "up.calendar.disabled": "Dieses Datum ist deaktiviert",
  "up.calendar.daysExceed": "Die Anzahl der ausgewählten Tage darf {days} Tage nicht überschreiten",
  "up.calendar.today": "Heute",
  "up.cityLocate.locateCity": "Stadt lokalisieren",
  "up.cityLocate.fail": "Lokalisierung fehlgeschlagen, bitte klicken Sie zum Wiederholen.",
  "up.cityLocate.locating": "Lokalisierung läuft",
  "up.code.send": "Bestätigungscode erhalten",
  "up.code.resendAfter": "Erneut senden in X Sekunden",
  "up.code.resend": "Erneut senden",
  "up.cropper.emptyWidhtOrHeight": "Breite oder Höhe des Zuschneidebereichs nicht festgelegt",
  "up.empty.car": "Warenkorb ist leer",
  "up.empty.page": "Seite existiert nicht",
  "up.empty.search": "Keine Suchergebnisse",
  "up.empty.address": "Keine Lieferadresse",
  "up.empty.wifi": "Kein WLAN",
  "up.empty.order": "Bestellungen sind leer",
  "up.empty.coupon": "Keine Gutscheine",
  "up.empty.favor": "Keine Favoriten",
  "up.empty.permission": "Keine Berechtigung",
  "up.empty.history": "Kein Verlauf",
  "up.empty.news": "Keine Nachrichtenliste",
  "up.empty.message": "Nachrichtenliste ist leer",
  "up.empty.list": "Liste ist leer",
  "up.empty.data": "Daten sind leer",
  "up.empty.comment": "Keine Kommentare",
  "up.link.copyed": "Link kopiert, bitte im Browser öffnen",
  "up.loadmoe.loadmore": "Mehr laden",
  "up.loadmoe.nomore": "Keine weiteren Daten",
  "up.noNetwork.text": "Ups, Netzwerksignal verloren",
  "up.noNetwork.pleaseCheck": "Bitte überprüfen Sie das Netzwerk oder gehen Sie zu",
  "up.noNetwork.connect": "Netzwerk verbunden",
  "up.noNetwork.disconnect": "Keine Netzwerkverbindung",
  "up.pagination.previous": "Vorherige Seite",
  "up.pagination.next": "Nächste Seite",
  "up.pullRefresh.pull": "Zum Aktualisieren nach unten ziehen",
  "up.pullRefresh.release": "Loslassen zum Aktualisieren",
  "up.pullRefresh.refreshing": "Aktualisierung läuft",
  "up.readMore.expand": "Erweitern zum vollständigen Lesen",
  "up.readMore.fold": "Einklappen",
  "up.search.placeholder": "Bitte Schlüsselwort eingeben",
  "up.signature.penSize": "Strichstärke",
  "up.signature.penColor": "Strichfarbe",
  "up.upload.sizeExceed": "Größenbegrenzung überschritten",
  "up.upload.uploading": "Upload läuft",
  "up.upload.previewImageFail": "Bildvorschau fehlgeschlagen",
  "up.upload.previewVideoFail": "Videovorschau fehlgeschlagen",
  "up.goodsSku.stock": "Lagerbestand",
  "up.goodsSku.price": "Preis",
  "up.goodsSku.amount": "Stück",
  "up.goodsSku.choosed": "Ausgewählt",
  "up.goodsSku.buyAmount": "Anzahl"
};

// F:/项目文件/uniapp版本/node_modules/uview-plus/libs/i18n/locales/ko.js
var ko_default = {
  "up.common.cancel": "취소",
  "up.common.confirm": "확인",
  "up.common.start": "시작",
  "up.common.end": "종료",
  "up.common.stop": "정지",
  "up.common.copy": "복사",
  "up.common.none": "없음",
  "up.common.tip": "팁",
  "up.common.success": "성공",
  "up.common.fail": "실패",
  "up.common.close": "닫기",
  "up.common.preview": "미리보기",
  "up.common.re-select": "재선택",
  "up.common.rotate": "회전",
  "up.common.pleaseChoose": "선택해주세요",
  "up.common.loading": "로딩중",
  "up.common.loading2": "로딩중",
  "up.common.inOperation": "작업중",
  "up.common.settings": "설정",
  "up.common.retry": "재시도",
  "up.common.search": "검색",
  "up.common.more": "더보기",
  "up.common.video": "비디오",
  "up.common.file": "파일",
  "up.week.one": "월",
  "up.week.two": "화",
  "up.week.three": "수",
  "up.week.four": "목",
  "up.week.five": "금",
  "up.week.six": "토",
  "up.week.seven": "일",
  "up.barcode.error": "바코드 생성 실패",
  "up.calendar.chooseDates": "날짜 선택",
  "up.calendar.disabled": "해당 날짜는 사용할 수 없습니다",
  "up.calendar.daysExceed": "선택한 날짜 수가 {days}일을 초과할 수 없습니다",
  "up.calendar.today": "오늘",
  "up.cityLocate.locateCity": "도시 위치 찾기",
  "up.cityLocate.fail": "위치 찾기 실패, 다시 시도하려면 클릭하세요.",
  "up.cityLocate.locating": "위치 찾는 중",
  "up.code.send": "인증코드 받기",
  "up.code.resendAfter": "X초 후 재전송",
  "up.code.resend": "재전송",
  "up.cropper.emptyWidhtOrHeight": "자르기 영역의 너비 또는 높이가 설정되지 않았습니다",
  "up.empty.car": "장바구니가 비어 있습니다",
  "up.empty.page": "페이지가 존재하지 않습니다",
  "up.empty.search": "검색 결과가 없습니다",
  "up.empty.address": "배송 주소가 없습니다",
  "up.empty.wifi": "Wi-Fi가 없습니다",
  "up.empty.order": "주문이 없습니다",
  "up.empty.coupon": "쿠폰이 없습니다",
  "up.empty.favor": "즐겨찾기가 없습니다",
  "up.empty.permission": "권한이 없습니다",
  "up.empty.history": "기록이 없습니다",
  "up.empty.news": "뉴스가 없습니다",
  "up.empty.message": "메시지가 없습니다",
  "up.empty.list": "목록이 비어 있습니다",
  "up.empty.data": "데이터가 없습니다",
  "up.empty.comment": "댓글이 없습니다",
  "up.link.copyed": "링크가 복사되었습니다. 브라우저에서 열어주세요",
  "up.loadmoe.loadmore": "더 불러오기",
  "up.loadmoe.nomore": "더 이상 데이터가 없습니다",
  "up.noNetwork.text": "네트워크 신호가 없습니다",
  "up.noNetwork.pleaseCheck": "네트워크를 확인하거나 이동하세요",
  "up.noNetwork.connect": "네트워크 연결됨",
  "up.noNetwork.disconnect": "네트워크 연결 끊김",
  "up.pagination.previous": "이전 페이지",
  "up.pagination.next": "다음 페이지",
  "up.pullRefresh.pull": "당겨서 새로고침",
  "up.pullRefresh.release": "놓아서 새로고침",
  "up.pullRefresh.refreshing": "새로고침 중",
  "up.readMore.expand": "펼쳐서 전체 보기",
  "up.readMore.fold": "접기",
  "up.search.placeholder": "키워드를 입력하세요",
  "up.signature.penSize": "선 굵기",
  "up.signature.penColor": "선 색상",
  "up.upload.sizeExceed": "용량 제한 초과",
  "up.upload.uploading": "업로드 중",
  "up.upload.previewImageFail": "이미지 미리보기 실패",
  "up.upload.previewVideoFail": "비디오 미리보기 실패",
  "up.goodsSku.stock": "재고",
  "up.goodsSku.price": "가격",
  "up.goodsSku.amount": "개",
  "up.goodsSku.choosed": "선택됨",
  "up.goodsSku.buyAmount": "구매 수량"
};

// F:/项目文件/uniapp版本/node_modules/uview-plus/libs/i18n/locales/ja.js
var ja_default = {
  "up.common.cancel": "キャンセル",
  "up.common.confirm": "確認",
  "up.common.start": "開始",
  "up.common.end": "終了",
  "up.common.stop": "停止",
  "up.common.copy": "コピー",
  "up.common.none": "なし",
  "up.common.tip": "ヒント",
  "up.common.success": "成功",
  "up.common.fail": "失敗",
  "up.common.close": "閉じる",
  "up.common.preview": "プレビュー",
  "up.common.re-select": "再選択",
  "up.common.rotate": "回転",
  "up.common.pleaseChoose": "選択してください",
  "up.common.loading": "読み込み中",
  "up.common.loading2": "読み込み中",
  "up.common.inOperation": "操作中",
  "up.common.settings": "設定",
  "up.common.retry": "再試行",
  "up.common.search": "検索",
  "up.common.more": "もっと見る",
  "up.common.video": "ビデオ",
  "up.common.file": "ファイル",
  "up.week.one": "月",
  "up.week.two": "火",
  "up.week.three": "水",
  "up.week.four": "木",
  "up.week.five": "金",
  "up.week.six": "土",
  "up.week.seven": "日",
  "up.barcode.error": "バーコードの生成に失敗しました",
  "up.calendar.chooseDates": "日付選択",
  "up.calendar.disabled": "この日付は無効です",
  "up.calendar.daysExceed": "選択日数は{days}日を超えることはできません",
  "up.calendar.today": "今日",
  "up.cityLocate.locateCity": "都市の位置を特定",
  "up.cityLocate.fail": "位置特定に失敗しました。再試行するにはクリックしてください。",
  "up.cityLocate.locating": "位置特定中",
  "up.code.send": "認証コードを取得",
  "up.code.resendAfter": "X秒後に再送信",
  "up.code.resend": "再送信",
  "up.cropper.emptyWidhtOrHeight": "切り抜き枠の幅または高さが設定されていません",
  "up.empty.car": "ショッピングカートは空です",
  "up.empty.page": "ページが存在しません",
  "up.empty.search": "検索結果がありません",
  "up.empty.address": "配送先住所がありません",
  "up.empty.wifi": "Wi-Fiがありません",
  "up.empty.order": "注文がありません",
  "up.empty.coupon": "クーポンがありません",
  "up.empty.favor": "お気に入りがありません",
  "up.empty.permission": "権限がありません",
  "up.empty.history": "履歴がありません",
  "up.empty.news": "ニュースがありません",
  "up.empty.message": "メッセージがありません",
  "up.empty.list": "リストが空です",
  "up.empty.data": "データがありません",
  "up.empty.comment": "コメントがありません",
  "up.link.copyed": "リンクがコピーされました。ブラウザで開いてください",
  "up.loadmoe.loadmore": "さらに読み込む",
  "up.loadmoe.nomore": "これ以上データがありません",
  "up.noNetwork.text": "ネットワーク信号が失われました",
  "up.noNetwork.pleaseCheck": "ネットワークを確認するか、移動してください",
  "up.noNetwork.connect": "ネットワーク接続済み",
  "up.noNetwork.disconnect": "ネットワーク未接続",
  "up.pagination.previous": "前へ",
  "up.pagination.next": "次へ",
  "up.pullRefresh.pull": "引き下げて更新",
  "up.pullRefresh.release": "指を離して更新",
  "up.pullRefresh.refreshing": "更新中",
  "up.readMore.expand": "全文表示",
  "up.readMore.fold": "折りたたむ",
  "up.search.placeholder": "キーワードを入力してください",
  "up.signature.penSize": "線の太さ",
  "up.signature.penColor": "線の色",
  "up.upload.sizeExceed": "サイズ制限を超えています",
  "up.upload.uploading": "アップロード中",
  "up.upload.previewImageFail": "画像プレビュー失敗",
  "up.upload.previewVideoFail": "ビデオプレビュー失敗",
  "up.goodsSku.stock": "在庫",
  "up.goodsSku.price": "価格",
  "up.goodsSku.amount": "個",
  "up.goodsSku.choosed": "選択済み",
  "up.goodsSku.buyAmount": "購入数量"
};

// F:/项目文件/uniapp版本/node_modules/uview-plus/libs/i18n/locales/ru.js
var ru_default = {
  "up.common.cancel": "Отмена",
  "up.common.confirm": "Подтвердить",
  "up.common.start": "Начало",
  "up.common.end": "Конец",
  "up.common.stop": "Стоп",
  "up.common.copy": "Копировать",
  "up.common.none": "Нет",
  "up.common.tip": "Подсказка",
  "up.common.success": "Успех",
  "up.common.fail": "Ошибка",
  "up.common.close": "Закрыть",
  "up.common.preview": "Предпросмотр",
  "up.common.re-select": "Выбрать снова",
  "up.common.rotate": "Повернуть",
  "up.common.pleaseChoose": "Пожалуйста, выберите",
  "up.common.loading": "Загрузка",
  "up.common.loading2": "Загружается",
  "up.common.inOperation": "В процессе",
  "up.common.settings": "Настройки",
  "up.common.retry": "Повторить",
  "up.common.search": "Поиск",
  "up.common.more": "Больше",
  "up.common.video": "Видео",
  "up.common.file": "Файл",
  "up.week.one": "Пн",
  "up.week.two": "Вт",
  "up.week.three": "Ср",
  "up.week.four": "Чт",
  "up.week.five": "Пт",
  "up.week.six": "Сб",
  "up.week.seven": "Вс",
  "up.barcode.error": "Ошибка генерации штрихкода",
  "up.calendar.chooseDates": "Выбор даты",
  "up.calendar.disabled": "Эта дата отключена",
  "up.calendar.daysExceed": "Количество выбранных дней не может превышать {days} дней",
  "up.calendar.today": "Сегодня",
  "up.cityLocate.locateCity": "Определение города",
  "up.cityLocate.fail": "Ошибка определения местоположения, нажмите для повтора.",
  "up.cityLocate.locating": "Определение местоположения",
  "up.code.send": "Получить код подтверждения",
  "up.code.resendAfter": "Повторная отправка через X секунд",
  "up.code.resend": "Отправить снова",
  "up.cropper.emptyWidhtOrHeight": "Ширина или высота области обрезки не задана",
  "up.empty.car": "Корзина пуста",
  "up.empty.page": "Страница не существует",
  "up.empty.search": "Нет результатов поиска",
  "up.empty.address": "Нет адреса доставки",
  "up.empty.wifi": "Нет Wi-Fi",
  "up.empty.order": "Заказы отсутствуют",
  "up.empty.coupon": "Нет купонов",
  "up.empty.favor": "Нет избранного",
  "up.empty.permission": "Нет разрешения",
  "up.empty.history": "Нет истории",
  "up.empty.news": "Нет новостей",
  "up.empty.message": "Список сообщений пуст",
  "up.empty.list": "Список пуст",
  "up.empty.data": "Нет данных",
  "up.empty.comment": "Нет комментариев",
  "up.link.copyed": "Ссылка скопирована, откройте в браузере",
  "up.loadmoe.loadmore": "Загрузить еще",
  "up.loadmoe.nomore": "Больше нет данных",
  "up.noNetwork.text": "Ой, потеряно сетевое соединение",
  "up.noNetwork.pleaseCheck": "Проверьте сеть или перейдите к",
  "up.noNetwork.connect": "Сеть подключена",
  "up.noNetwork.disconnect": "Нет сетевого подключения",
  "up.pagination.previous": "Предыдущая страница",
  "up.pagination.next": "Следующая страница",
  "up.pullRefresh.pull": "Потяните вниз для обновления",
  "up.pullRefresh.release": "Отпустите для обновления",
  "up.pullRefresh.refreshing": "Обновление",
  "up.readMore.expand": "Развернуть для полного чтения",
  "up.readMore.fold": "Свернуть",
  "up.search.placeholder": "Введите ключевое слово",
  "up.signature.penSize": "Размер штриха",
  "up.signature.penColor": "Цвет штриха",
  "up.upload.sizeExceed": "Превышен лимит размера",
  "up.upload.uploading": "Загрузка",
  "up.upload.previewImageFail": "Ошибка предпросмотра изображения",
  "up.upload.previewVideoFail": "Ошибка предпросмотра видео",
  "up.goodsSku.stock": "Запас",
  "up.goodsSku.price": "Цена",
  "up.goodsSku.amount": "Штук",
  "up.goodsSku.choosed": "Выбрано",
  "up.goodsSku.buyAmount": "Количество"
};

// F:/项目文件/uniapp版本/node_modules/uview-plus/libs/i18n/locales/th.js
var th_default = {
  "up.common.cancel": "ยกเลิก",
  "up.common.confirm": "ยืนยัน",
  "up.common.start": "เริ่มต้น",
  "up.common.end": "สิ้นสุด",
  "up.common.stop": "หยุด",
  "up.common.copy": "คัดลอก",
  "up.common.none": "ไม่มี",
  "up.common.tip": "คำแนะนำ",
  "up.common.success": "สำเร็จ",
  "up.common.fail": "ล้มเหลว",
  "up.common.close": "ปิด",
  "up.common.preview": "ดูตัวอย่าง",
  "up.common.re-select": "เลือกใหม่",
  "up.common.rotate": "หมุน",
  "up.common.pleaseChoose": "กรุณาเลือก",
  "up.common.loading": "กำลังโหลด",
  "up.common.loading2": "กำลังโหลด",
  "up.common.inOperation": "กำลังดำเนินการ",
  "up.common.settings": "การตั้งค่า",
  "up.common.retry": "ลองใหม่",
  "up.common.search": "ค้นหา",
  "up.common.more": "เพิ่มเติม",
  "up.common.video": "วิดีโอ",
  "up.common.file": "ไฟล์",
  "up.week.one": "จันทร์",
  "up.week.two": "อังคาร",
  "up.week.three": "พุธ",
  "up.week.four": "พฤหัสบดี",
  "up.week.five": "ศุกร์",
  "up.week.six": "เสาร์",
  "up.week.seven": "อาทิตย์",
  "up.barcode.error": "สร้างบาร์โค้ดไม่สำเร็จ",
  "up.calendar.chooseDates": "เลือกวันที่",
  "up.calendar.disabled": "วันที่นี้ถูกปิดการใช้งาน",
  "up.calendar.daysExceed": "จำนวนวันที่เลือกต้องไม่เกิน {days} วัน",
  "up.calendar.today": "วันนี้",
  "up.cityLocate.locateCity": "ระบุตำแหน่งเมือง",
  "up.cityLocate.fail": "การระบุตำแหน่งล้มเหลว กรุณาคลิกเพื่อลองใหม่",
  "up.cityLocate.locating": "กำลังระบุตำแหน่ง",
  "up.code.send": "รับรหัสยืนยัน",
  "up.code.resendAfter": "ส่งใหม่ใน X วินาที",
  "up.code.resend": "ส่งใหม่",
  "up.cropper.emptyWidhtOrHeight": "ไม่ได้ตั้งค่าความกว้างหรือความสูงของกรอบตัดภาพ",
  "up.empty.car": "รถเข็นว่างเปล่า",
  "up.empty.page": "ไม่มีหน้านี้",
  "up.empty.search": "ไม่มีผลลัพธ์การค้นหา",
  "up.empty.address": "ไม่มีที่อยู่จัดส่ง",
  "up.empty.wifi": "ไม่มี WiFi",
  "up.empty.order": "ไม่มีคำสั่งซื้อ",
  "up.empty.coupon": "ไม่มีคูปอง",
  "up.empty.favor": "ไม่มีรายการโปรด",
  "up.empty.permission": "ไม่มีสิทธิ์",
  "up.empty.history": "ไม่มีประวัติ",
  "up.empty.news": "ไม่มีรายการข่าว",
  "up.empty.message": "รายการข้อความว่างเปล่า",
  "up.empty.list": "รายการว่างเปล่า",
  "up.empty.data": "ข้อมูลว่างเปล่า",
  "up.empty.comment": "ไม่มีความคิดเห็น",
  "up.link.copyed": "คัดลอกลิงก์แล้ว กรุณาเปิดในเบราว์เซอร์",
  "up.loadmoe.loadmore": "โหลดเพิ่มเติม",
  "up.loadmoe.nomore": "ไม่มีข้อมูลเพิ่มเติม",
  "up.noNetwork.text": "อ๊ะ ขาดการเชื่อมต่อเครือข่าย",
  "up.noNetwork.pleaseCheck": "กรุณาตรวจสอบเครือข่าย หรือไปที่",
  "up.noNetwork.connect": "เชื่อมต่อเครือข่ายแล้ว",
  "up.noNetwork.disconnect": "ไม่มีการเชื่อมต่อเครือข่าย",
  "up.pagination.previous": "หน้าก่อนหน้า",
  "up.pagination.next": "หน้าถัดไป",
  "up.pullRefresh.pull": "ดึงเพื่อรีเฟรช",
  "up.pullRefresh.release": "ปล่อยเพื่อรีเฟรช",
  "up.pullRefresh.refreshing": "กำลังรีเฟรช",
  "up.readMore.expand": "ขยายเพื่ออ่านทั้งหมด",
  "up.readMore.fold": "ย่อ",
  "up.search.placeholder": "กรุณาใส่คำสำคัญ",
  "up.signature.penSize": "ขนาดเส้น",
  "up.signature.penColor": "สีเส้น",
  "up.upload.sizeExceed": "เกินขนาดที่กำหนด",
  "up.upload.uploading": "กำลังอัปโหลด",
  "up.upload.previewImageFail": "ดูตัวอย่างภาพไม่สำเร็จ",
  "up.upload.previewVideoFail": "ดูตัวอย่างวิดีโอไม่สำเร็จ",
  "up.goodsSku.stock": "สินค้าคงคลัง",
  "up.goodsSku.price": "ราคา",
  "up.goodsSku.amount": "ชิ้น",
  "up.goodsSku.choosed": "เลือกแล้ว",
  "up.goodsSku.buyAmount": "จำนวน"
};

// F:/项目文件/uniapp版本/node_modules/uview-plus/libs/i18n/locales/all.js
var all_default = {
  "zh-Hans": zh_Hans_default,
  "zh-Hant": zh_Hant_default,
  en: en_default,
  es: es_default,
  fr: fr_default,
  de: de_default,
  ko: ko_default,
  ja: ja_default,
  ru: ru_default,
  th: th_default
};

// F:/项目文件/uniapp版本/node_modules/uview-plus/libs/theme/theme.js
var DEFAULT_LIGHT_THEME_COLORS = Object.freeze({
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
var DEFAULT_DARK_THEME_COLORS = Object.freeze({
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
var DEFAULT_THEME_EXTRA_VARS = Object.freeze({
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
var themeState = {
  preference: "system",
  mode: "light",
  version: 0,
  vars: {}
};
var THEME_MODE_STORAGE_KEY2 = "u-theme-mode";
var THEME_MODE_SYSTEM = "system";
var THEME_MODE_MANUAL = ["light", "dark"];
var LIGHT_THEME_TOKEN_FIELD_MAP = Object.freeze({
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
var LIGHT_THEME_FIELD_TOKEN_MAP = Object.freeze(
  Object.fromEntries(
    Object.entries(LIGHT_THEME_TOKEN_FIELD_MAP).map(([token, field]) => [field, token])
  )
);
var runtimeThemeOverrideState = {
  color: /* @__PURE__ */ Object.create(null),
  configColor: /* @__PURE__ */ Object.create(null)
};
var cachedLightThemeColors = null;
var hasRegisterThemeListener = false;
var currentThemePreference = THEME_MODE_SYSTEM;
function normalizeThemeMode2(theme = "light") {
  return theme === "dark" ? "dark" : "light";
}
function normalizeThemePreference2(mode = THEME_MODE_SYSTEM) {
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
    const value = color_default[field];
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
      const mode = uni.getStorageSync(THEME_MODE_STORAGE_KEY2);
      return normalizeThemePreference2(mode);
    }
  } catch (e) {
  }
  return THEME_MODE_SYSTEM;
}
function writeThemePreferenceToStorage(mode) {
  try {
    if (typeof uni !== "undefined" && typeof uni.setStorageSync === "function") {
      uni.setStorageSync(THEME_MODE_STORAGE_KEY2, mode);
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
  return normalizeThemeMode2(theme);
}
function getCurrentLightThemeColors() {
  const runtimeColorMap = config_default.color || {};
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
  const themeMode = normalizeThemeMode2(mode);
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
  const themeMode = normalizeThemeMode2(mode);
  const isDark = themeMode === "dark";
  const useBridge = !isDark;
  const runtimeColorMap = config_default.color || {};
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
function syncThemeToH5(mode) {
  if (typeof document !== "undefined" && document.documentElement) {
    document.documentElement.setAttribute("data-up-theme", mode);
  }
}
function hasActiveRuntimePage2() {
  try {
    if (typeof getCurrentPages === "function") {
      const pages2 = getCurrentPages();
      return Array.isArray(pages2) && pages2.length > 0;
    }
  } catch (e) {
  }
  return false;
}
function trySetNavigationBarColor2(options) {
  if (typeof uni === "undefined" || typeof uni.setNavigationBarColor !== "function")
    return;
  if (!hasActiveRuntimePage2())
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
function applyNativeThemeUI2(mode, themeColors, themeVars = {}) {
  var _a, _b;
  if (typeof uni === "undefined")
    return;
  if (config_default.nativeThemeSync !== true)
    return;
  const isDark = normalizeThemeMode2(mode) === "dark";
  const pageBg = (themeColors == null ? void 0 : themeColors.bgColor) || (isDark ? "#1f1f1f" : "#f3f4f6");
  const navBg = (themeVars == null ? void 0 : themeVars["--up-navbar-bg-color"]) || (themeVars == null ? void 0 : themeVars["--u-navbar-bg-color"]) || ((_a = config_default.color) == null ? void 0 : _a["up-navbar-bg-color"]) || ((_b = config_default.color) == null ? void 0 : _b["u-navbar-bg-color"]) || (isDark ? "#1c1c1e" : "#ffffff");
  trySetNavigationBarColor2({
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
  const themeMode = normalizeThemeMode2(mode);
  const themeColors = getThemeColorsByMode(themeMode);
  const themeVars = buildThemeCssVars(themeColors, themeMode);
  function_default.shallowMerge(color_default, {
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
  function_default.shallowMerge(config_default.color, buildConfigColorMap(themeColors));
  config_default.themeMode = themeMode;
  themeState.preference = currentThemePreference;
  themeState.mode = themeMode;
  themeState.vars = { ...themeVars };
  themeState.version = Number(themeState.version || 0) + 1;
  syncThemeToH5(themeMode);
  applyNativeThemeUI2(themeMode, themeColors, themeVars);
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
  currentThemePreference = normalizeThemeMode2(mode);
  writeThemePreferenceToStorage(currentThemePreference);
  return applyTheme(currentThemePreference);
}
function setThemePreference(mode = THEME_MODE_SYSTEM) {
  currentThemePreference = normalizeThemePreference2(mode);
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

// F:/项目文件/uniapp版本/node_modules/uview-plus/index.js
applyUniApiShims();
var rootToastState = {
  ref: null
};
var rootNotifyState = {
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
var themeType = ["primary", "success", "error", "warning", "info"];
function setConfig2(configs) {
  var _a, _b;
  const settings2 = configs || {};
  function_default.shallowMerge(config_default, settings2.config || {});
  setPropsConfig(settings2.props || {});
  function_default.shallowMerge(color_default, settings2.color || {});
  function_default.shallowMerge(zIndex_default, settings2.zIndex || {});
  syncThemeColorOverrideState({
    color: settings2.color,
    configColor: (_a = settings2 == null ? void 0 : settings2.config) == null ? void 0 : _a.color
  });
  const shouldRefreshTheme = !!settings2.color || !!((_b = settings2 == null ? void 0 : settings2.config) == null ? void 0 : _b.color) || themeState.version > 0;
  if (shouldRefreshTheme) {
    refreshThemeFromConfig();
  }
}
function_default.setConfig = setConfig2;
var $u = {
  route: route_default,
  date: function_default.timeFormat,
  // 另名date
  colorGradient: colorGradient_default.colorGradient,
  hexToRgb: colorGradient_default.hexToRgb,
  rgbToHex: colorGradient_default.rgbToHex,
  colorToRgba: colorGradient_default.colorToRgba,
  test: test_default,
  type: themeType,
  http: http_default,
  config: config_default,
  // uview-plus配置信息相关，比如版本号
  zIndex: zIndex_default,
  debounce: debounce_default,
  throttle: throttle_default,
  calc: calc_default,
  mixin,
  mpMixin,
  props: props_default,
  ...function_default,
  color: color_default,
  platform: platform_default,
  theme: themeState,
  setTheme,
  setThemePreference,
  getThemePreference,
  getSystemTheme,
  getThemeVars,
  getThemeTabBarStyle,
  applyNativeThemeUI,
  rootToast,
  setRootToastRef,
  rootNotify,
  setRootNotifyRef
};
var mount$u = function() {
  uni.$u = $u;
  initThemeSystem();
};
function defineGlobalThemeHelpers(Vue) {
  var _a;
  const globalProperties = (_a = Vue == null ? void 0 : Vue.config) == null ? void 0 : _a.globalProperties;
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
    return applyNativeThemeUI();
  };
}
var components = [];
function resolveComponents() {
  var _a;
  if (components.length)
    return components;
  const importFn = import.meta.glob("./components/u-*/u-*.vue", { eager: true });
  for (const key in importFn) {
    const component = (_a = importFn[key]) == null ? void 0 : _a.default;
    if ((component == null ? void 0 : component.name) && component.name.indexOf("u--") !== 0) {
      components.push(component);
    }
  }
  return components;
}
var install = (Vue, upuiParams = "") => {
  resolveComponents().forEach(function(component) {
    const name = component.name.replace(/u-([a-zA-Z0-9-_]+)/g, "up-$1");
    if (name != component.name) {
      Vue.component(component.name, component);
    }
    Vue.component(name, component);
  });
  if (upuiParams) {
    uni.upuiParams = upuiParams;
    let temp = upuiParams();
    if (temp.httpIns) {
      temp.httpIns(http_default);
    }
    if (temp.options) {
      setConfig2(temp.options);
    }
  }
  uni.$u = $u;
  initThemeSystem();
  if (Vue && Vue.config && Vue.config.globalProperties) {
    Vue.config.globalProperties.$u = $u;
    defineGlobalThemeHelpers(Vue);
  }
  if (Vue && typeof Vue.mixin === "function") {
    Vue.mixin(mixin);
  }
};
var uview_plus_default = {
  install
};
export {
  $parent,
  addStyle,
  addUnit,
  all_default as allLocales,
  calc_default as calc,
  color_default as color,
  colorGradient,
  colorToRgba,
  de_default as de,
  debounce_default as debounce,
  deepClone,
  deepMerge,
  uview_plus_default as default,
  digit_default as digit,
  en_default as en,
  error,
  es_default as es,
  util_default as fontUtil,
  formValidate,
  fr_default as fr,
  genLightColor,
  getDeviceInfo,
  getDuration,
  getLocale,
  getProperty,
  getPx,
  getValueByPath,
  getWindowInfo,
  guid,
  hasLocale,
  hexToRgb,
  http_default as http,
  i18n_default as i18n,
  ja_default as ja,
  ko_default as ko,
  mixin,
  mount$u,
  mpMixin,
  os,
  padZero,
  page,
  pages,
  platform_default as platform,
  priceFormat,
  props_default as props,
  queryParams,
  random,
  randomArray,
  range2 as range,
  registerLocale,
  rgbToHex,
  route_default as route,
  rpx2px,
  ru_default as ru,
  setConfig2 as setConfig,
  setLocale,
  setProperty,
  shallowMerge,
  sleep,
  sys,
  t,
  test_default as test,
  th_default as th,
  themeType,
  throttle_default as throttle,
  timeFormat,
  timeFrom,
  toast,
  trim,
  type2icon,
  zIndex_default as zIndex,
  zh_Hans_default as zhHans,
  zh_Hant_default as zhHant
};
//# sourceMappingURL=uview-plus.js.map
