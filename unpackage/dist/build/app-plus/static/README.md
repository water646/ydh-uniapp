# static 静态资源说明

本目录需放置以下静态资源（从原 Android 项目 `res/`、`assets/` 拷贝或替换）：

## 图片
- `loading_bg.png` —— 启动页背景图（对应 `loadingActivity` 的 loadingbackground）
  - 若暂无，`pages/loading/index` 会显示纯绿底+「智能技术台」文字，不影响运行

## 字体（对应 assets/fonts、res/font）
- `fonts/songti.ttf` —— 宋体（AppTheme 全局默认字体）
- `fonts/youken.ttf` —— youken 字体（优肯周赛况页标题用）
- `fonts/titleblack.ttf` —— 标题黑体
- `fonts/ziti1.otf` —— 字体1

字体加载在 App.vue 可通过 `uni.loadFontFace` 按需注册，或暂时使用系统字体兜底（当前已用 `STSong/serif` 兜底）。

## 图标
后续页面用到的图标可使用 uView 内置 icon 或 iconfont，无需额外图片。
