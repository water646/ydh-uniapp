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


(()=>{var S=Object.create;var _=Object.defineProperty;var h=Object.getOwnPropertyDescriptor;var w=Object.getOwnPropertyNames;var C=Object.getPrototypeOf,O=Object.prototype.hasOwnProperty;var N=(o,e)=>()=>(e||o((e={exports:{}}).exports,e),e.exports);var B=(o,e,n,a)=>{if(e&&typeof e=="object"||typeof e=="function")for(let s of w(e))!O.call(o,s)&&s!==n&&_(o,s,{get:()=>e[s],enumerable:!(a=h(e,s))||a.enumerable});return o};var y=(o,e,n)=>(n=o!=null?S(C(o)):{},B(e||!o||!o.__esModule?_(n,"default",{value:o,enumerable:!0}):n,o));var i=N((U,d)=>{d.exports=Vue});var t=y(i());var l=y(i()),I="onShow",A="onHide",L="onLoad";var p=(o,e=0)=>(n,a=(0,l.getCurrentInstance)())=>{!l.isInSSRComponentSetup&&(0,l.injectHook)(o,n,a)},f=p(I,3),m=p(A,3),g=p(L,2);var v=(o,e)=>{let n=o.__vccOpts||o;for(let[a,s]of e)n[a]=s;return n};var H="/static/mipmap-xxhdpi/black_back.png",R={"live-play":{"":{flex:1,backgroundColor:"#000000"}},player:{"":{flex:1}},"no-live":{"":{position:"absolute",top:0,left:0,right:0,bottom:0,alignItems:"center",justifyContent:"center"}},"no-live-text":{"":{fontSize:"15rpx",color:"#999999"}},back:{"":{position:"absolute",top:"24rpx",left:"24rpx",width:"64rpx",height:"64rpx",borderRadius:"32rpx",backgroundColor:"rgba(0,0,0,0.4)",alignItems:"center",justifyContent:"center",transform:"rotate(90deg)",transformOrigin:"50% 50%"}},"back-icon":{"":{width:"100rpx",height:"100rpx"}}},D={__name:"play",setup(o){let e=(0,t.ref)(""),n=(0,t.ref)(!1),a=null,s=(0,t.getCurrentInstance)();g(r=>{plus.screen.lockOrientation("portrait-primary"),e.value=decodeURIComponent(r.url||r.livepublish||""),setTimeout(()=>{a=uni.createLivePlayerContext("player",s&&s.proxy),a&&a.play({success:()=>{n.value=!0}})},300)}),f(()=>{plus.navigator.setStatusBarStyle("light")}),m(()=>{plus.navigator.setStatusBarStyle("dark")}),(0,t.onUnmounted)(()=>{a&&a.stop(),plus.screen.unlockOrientation()});function b(r){r.detail&&r.detail.code===2004&&(n.value=!0)}function x(r){n.value=!1}function k(){uni.navigateBack()}return(r,E)=>((0,t.openBlock)(),(0,t.createElementBlock)("scroll-view",{scrollY:!0,showScrollbar:!0,enableBackToTop:!0,bubble:"true",style:{flexDirection:"column"}},[(0,t.createElementVNode)("view",{class:"live-play"},[(0,t.createElementVNode)("live-player",{id:"player",class:"player",src:e.value,mode:"live",autoplay:!0,muted:!1,objectFit:"contain",onStatechange:b,onError:x},null,40,["src"]),n.value?(0,t.createCommentVNode)("",!0):((0,t.openBlock)(),(0,t.createElementBlock)("view",{key:0,class:"no-live"},[(0,t.createElementVNode)("u-text",{class:"no-live-text"},"\u5F53\u524D\u65E0\u76F4\u64AD")])),(0,t.createElementVNode)("view",{class:"back",onClick:k},[(0,t.createElementVNode)("u-image",{class:"back-icon",src:H,mode:"aspectFit"})])])]))}},c=v(D,[["styles",[R]]]);var u=plus.webview.currentWebview();if(u){let o=parseInt(u.id),e="pages/live/play",n={};try{n=JSON.parse(u.__query__)}catch(s){}c.mpType="page";let a=Vue.createPageApp(c,{$store:getApp({allowDefault:!0}).$store,__pageId:o,__pagePath:e,__pageQuery:n});a.provide("__globalStyles",Vue.useCssStyles([...__uniConfig.styles,...c.styles||[]])),a.mount("#root")}})();
