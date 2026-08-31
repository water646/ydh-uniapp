import { createSSRApp } from 'vue'
import App from './App.vue'
import uviewPlus from 'uview-plus'
// 整体引入 pinia 模块：nvue 页（如直播推流页）运行在独立 JS 上下文，
// 需把 Pinia 挂到 createApp 返回值上，否则 nvue 侧 defineStore 不是函数（白屏）
import * as Pinia from 'pinia'

export function createApp() {
  const app = createSSRApp(App)
  app.use(uviewPlus)
  app.use(Pinia.createPinia())
  return {
    app,
    Pinia
  }
}
