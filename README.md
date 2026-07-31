# 智能技术台 uniapp 版

由原生 Android 项目 `com.ydh123.statistics`（MVPArms：MVP+Dagger2+RxJava+Retrofit+GreenDAO）一比一迁移至 uniapp（Vue3 + App 端）。

## 运行方式

### 方式一：HBuilderX（推荐）
1. 用 HBuilderX 打开本目录 `uniapp版本`
2. 安装 npm 依赖：在项目根目录执行 `npm install`（uview-plus / pinia / js-md5 / dayjs）
   - 或 HBuilderX 中右键 `package.json` -> 使用外部命令安装依赖
3. 点击工具栏「运行」-> 运行到手机或模拟器 -> 选择 Android 真机/模拟器（App-Vue）
4. 首次运行需在 `manifest.json` 填写自己的 DCloud appid（或使用默认测试 id）

### 方式二：CLI（vue3 + vite）
```bash
npm install
npm run dev:app     # 调试
npm run build:app:release  # 打包
```

> 项目按 **App (Vue)** 端编写，部分能力（直播、相机、sqlite）依赖 App 环境；H5/小程序端部分页面不可用。

## 技术栈与对应关系

| 原生 Android | uniapp |
|---|---|
| MVPArms(MVP+Dagger2+RxJava) | Vue3 `<script setup>` + api 模块 + Pinia |
| Retrofit + GlobalHttpHandler | `api/request.js`（token 注入、-8/-9 登出拦截器） |
| GreenDAO 4 表 | `utils/db.js`（plus.sqlite） |
| EventBus(org.simple) | `utils/eventBus.js`（uni.\$emit/\$on） |
| 腾讯 LiteAV 推/拉流 | `<live-pusher>` / `<live-player>` |
| 阿里 OSS SDK | STS + `uni.uploadFile`（批6 实现） |
| AutoSize(360×640) | rpx |
| ButterKnife / Glide / SmartRefreshLayout | 模板绑定 / `<image>` / 原生下拉刷新 |

## 目录结构

```
uniapp版本/
├── manifest.json / pages.json / App.vue / main.js / uni.scss / package.json
├── config/          # 域名、密钥、分页等常量（对应 Api/AppConfig）
├── api/             # request 封装+拦截器 + 各业务接口（对应 Retrofit service）
├── types/           # 全部实体 TS 定义（对应 Java 实体）
├── store/           # Pinia：user(token/登录态) app(设备号/篮足切换)
├── utils/           # auth/device/md5/time/validator/eventBus/db
├── components/      # custom-nav/empty-layout/multi-state/battery-view
├── static/          # 图片、字体资源
└── pages/           # 各业务页面
```

## 不能一比一还原的边界

1. **PTP 单反 USB 控制 + LiveView**（`ptp/` 模块）：uniapp 无 USB host API，拍照直播入口保留、内部做占位提示。若必须单反，需后续封装 uni 原生插件复用原 Java。
2. **动态比分水印烧流**：`<live-pusher>` 仅支持静态水印，无法烧动态 Canvas。降级为推流端本地比分浮层（观众端无水印）；保真需原生插件包装 `TXLivePusher.setWatermark`。
3. **自定义录像**（MediaRecorder+对焦+分段）：占位。
4. **遗留推流页**（网易/金山云 5 个，已不在生产路由）：不迁移，统一 `live-pusher`。

## 迁移进度

| 批次 | 范围 | 状态 |
|---|---|---|
| 批1 | 项目骨架（配置/网络/类型/store/utils/公共组件/登录首页） | ✅ 已完成，可运行 |
| 批2 | 核心流程（main完整/比赛设置/赛前设置/大图预览） | ✅ 已完成 |
| 批3 | 统计录入（篮/足统计 4 页 + 离线队列上传） | ✅ 已完成 |
| 批4 | 记录与数据（记录 3 页/球员数据/操作记录/优肯榜） | ✅ 已完成 |
| 批5 | 直播（列表/推流/拉流/WebSocket 比分） | ✅ 已完成 |
| 批6 | 拍照上传与占位页 | ✅ 已完成 |

## 关键迁移注意

- 足球接口 = 篮球路径加 `soccer/` 前缀，统计接口共用（`config/sportPrefix`）
- 成功判据不统一：`ApiEntity` 用 `status===1`，其余用 `code===1`，拦截器兼容两者
- 字段拼写保留原样：`areanName`/`runStatu`/`homeStatustics`/`group_id`/`handillogicaFoul`
- 双斜杠路径 `game//info` 原样保留
- 统计 type 码表（篮球 1~16/117~121、足球进球/点球/黄红牌）原样保留
- 明文 HTTP：App 端默认允许
