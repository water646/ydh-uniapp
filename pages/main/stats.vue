<template>
  <view class="main">
    <custom-nav title="技术统计">
      <template #right>
        <text class="nav-action" @click="goPhoto">活动列表</text>
      </template>
    </custom-nav>

    <!-- ⚠️【MOCK】静态数据模式横幅（config.useMock=true 时显示） -->
    <view v-if="useMock" class="mock-banner">⚠️ MOCK 静态数据模式 · 列表/详情/统计均为造数 · 关闭请改 config.useMock=false</view>

    <!-- 抽屉（对应 MainActivity DrawerLayout） -->
    <view v-if="drawer" class="mask" @click="drawer = false"></view>
    <view class="drawer" :class="{ open: drawer }">
      <view class="drawer-status" :style="{ height: statusBarHeight + 'px' }"></view>
      <view class="drawer-header">
        <image class="avatar-lg" :src="userInfo && userInfo.avatar" mode="aspectFill" />
        <text class="nick">{{ (userInfo && userInfo.nickName) || '未登录' }}</text>
      </view>
      <view class="drawer-item" @click="practice('basketball')">
		  <image class="search-icon" src="/static/mipmap-xhdpi/lianxi.png"/>
		  <p>篮球练习模式</p>
	  </view>
      <view class="drawer-item" @click="practice('football')">
		  <image class="search-icon" src="/static/mipmap-xhdpi/lianxi.png"/>
		  <p>足球练习模式</p>
	  </view>
      <view class="drawer-item" @click="goWeekOuts">
		  <image class="search-icon" src="/static/mipmap-xhdpi/lianxi.png"/>
		  <p>优肯周赛况</p>
	  </view>
      <!-- <view class="drawer-item exit" @click="logout">退出登录</view> -->
	  <view class="bottom-line">
		  <view class="exit-login" @click="logout">
			  <image class="exit-icon" src="/static/mipmap-xhdpi/tuichu.png"></image>
			  <view class="exit-text">退出登录</view>
		  </view>
		  <view class="version">版本 {{ appVersion }}</view>
	  </view>
      
    </view>

    <!-- 篮球/足球切换（对应右侧悬浮钮 + EventBus Boolean） -->
    <view class="sport-switch">
      <view
        class="sport-item"
        :class="{ active: appStore.sport === 'basketball' }"
        @click="selectSport('basketball')"
      >
        <image class="sport-icon" :src="appStore.sport === 'basketball' ? '/static/mipmap-xxhdpi/basket_c.png' : '/static/mipmap-xxhdpi/basket_w.png'" />
      </view>
      <view
        class="sport-item"
        :class="{ active: appStore.sport === 'football' }"
        @click="selectSport('football')"
      >
        <image class="sport-icon" :src="appStore.sport === 'football' ? '/static/mipmap-xxhdpi/football_c.png' : '/static/mipmap-xxhdpi/football_w.png'" />
      </view>
    </view>

    <!-- 未结束/已结束 Tab -->
    <view class="tabs">
      <view class="tab" :class="{ active: tab === 'no_end' }" @click="switchTab('no_end')">未结束</view>
      <view class="tab" :class="{ active: tab === 'end' }" @click="switchTab('end')">已结束</view>
    </view>

    <scroll-view
      scroll-y
      class="list"
      refresher-enabled
      :refresher-triggered="refreshing"
      :refresher-max-drag-distance="refresherMaxDrag"
      @refresherrefresh="onRefresh"
    >
      <view v-for="group in groups" :key="group.date" class="date-group">
        <view class="date-header">{{ group.date }}</view>
        <view v-for="g in group.games" :key="g.id" class="match-item">
			
			<view class="league-headinfo">
				<view class="league status">{{ statusText(g) }}</view>
				<view class="league">{{ g.leagueName }}</view>
			</view>
			
			<view class="league-innerinfo">
				<view class="team-line">
					<view class="team-cell">
						<image v-if="g.hostTeamLogo" class="logo" :src="g.hostTeamLogo" mode="aspectFill" />
						<text class="team-name">{{ g.hostTeamName }}</text>
					</view>
					<view class="team-cell">
						<text class="score">{{ g.hostTeamScore }}</text>
						<view class="action-btn ghost"><text>占</text></view>
					</view>
				</view>

				<view class="team-line">
					<view class="team-cell">
						<image v-if="g.guestTeamLogo" class="logo" :src="g.guestTeamLogo" mode="aspectFill" />
						<text class="team-name">{{ g.guestTeamName }}</text>
					</view>
					<view class="team-cell">
						<text class="score">{{ g.guestTeamScore }}</text>
						<view class="action-btn green" style="transform: translateY(-50%);" @click="goStatsDetail(g)">技术统计</view>
					</view>
				</view>
			</view>
			
			
			
<!--          <view class="teams">
            <view class="team">
              <image v-if="g.hostTeamLogo" class="logo" :src="g.hostTeamLogo" mode="aspectFill" />
              <text class="team-name">{{ g.hostTeamName }}</text>
              <text class="score">{{ g.hostTeamScore }}</text>
            </view>
            <text class="vs">:</text>
            <view class="team">
              <text class="score">{{ g.guestTeamScore }}</text>
              <text class="team-name">{{ g.guestTeamName }}</text>
              <image v-if="g.guestTeamLogo" class="logo" :src="g.guestTeamLogo" mode="aspectFill" />
            </view>
          </view>
          <view class="actions">
            <view class="action-btn green" @click="goMatchSet(g)">技术统计</view>
            <view class="action-btn blue" @click="goLive(g)">直播</view>
          </view> -->
        </view>
      </view>
	  <view v-if="!loading && !groups.length" class="no-data">
		  <image class="no-data-img" src="/static/mipmap-xxhdpi/no_shuju.png" mode="aspectFit" />
		  <view class="no-data-text">暂无数据</view>
	  </view>
      
      <view v-if="loading" class="loading-more">加载中…</view>
    </scroll-view>

    <!-- 版本更新弹窗（对应 UpdataDialog + DownloadService） -->
    <u-popup :show="showUpdate" mode="center" :round="20" @close="showUpdate = false">
      <view class="update-dialog">
        <view class="update-title">发现新版本</view>
        <scroll-view scroll-y class="update-content">
          <text>{{ versionInfo && versionInfo.remark }}</text>
        </scroll-view>
        <view class="update-btns">
          <view class="ub cancel" @click="showUpdate = false">稍后</view>
          <view class="ub confirm" @click="doUpdate">立即更新</view>
        </view>
      </view>
    </u-popup>
  </view>
</template>

<script setup>
/**
 * 技术统计列表页（结构与样式同 main/index）
 * 入口：mine「技术统计」；列表数据同主页，卡片内仅一个「技术统计」按钮（功能待定）。
 */
import { ref, computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import customNav from '@/components/custom-nav/custom-nav.vue'
import { getMatchList, getGameDetail } from '@/api/game'
import { getUserInfo } from '@/api/login'
import { versionCheck } from '@/api/version'
import { useUserStore } from '@/store/user'
import { useAppStore } from '@/store/app'
import { emit, EventBus } from '@/utils/eventBus'
import { config } from '@/config'

const userStore = useUserStore()
const appStore = useAppStore()
const useMock = config.useMock // ⚠️【MOCK】是否静态数据模式

const userInfo = ref(null)
const appVersion = ref('')
const sysInfo = uni.getSystemInfoSync()
// 状态栏高度（抽屉 fixed top:0，需留出状态栏空间避免与系统时间/电量栏重叠）
const statusBarHeight = sysInfo.statusBarHeight || 0
// 下拉刷新最大拖拽距离 300rpx（scroll-view 的 refresher 属性单位为 px，需换算）
const refresherMaxDrag = Math.round((300 * sysInfo.windowWidth) / 750)
const drawer = ref(false)
const tab = ref('no_end')
const loading = ref(false)
const refreshing = ref(false)
const rawList = ref([])
const showUpdate = ref(false)
const versionInfo = ref(null)


const groups = computed(() => {
  const map = {}
  rawList.value.forEach((item) => {
    const date = item.date || '未分组'
    if (!map[date]) map[date] = { date, games: [] }
    if (item.games) map[date].games.push(...item.games)
  })
  return Object.values(map)
})

onShow(() => {
  loadUserInfo()
  loadList()
  checkUpdate()
  appVersion.value = appStore.versionName || appStore.version
})

function loadUserInfo() {
  getUserInfo().then((res) => {
    if (res.code === 1) {
      userInfo.value = res.data
      userStore.setUserInfo(res.data)
    }
  })
}

function loadList() {
  loading.value = true
  getMatchList(tab.value, appStore.sport)
    .then((res) => {
      if (res.code === 1) rawList.value = res.data || []
    })
    .finally(() => {
      loading.value = false
      refreshing.value = false
    })
}

function switchTab(t) {
  tab.value = t
  loadList()
}

function toggleSport() {
  appStore.toggleSport()
  emit(EventBus.SPORT_CHANGE, appStore.sport)
  loadList()
}

/** 直接选择某个运动（两图标点击） */
function selectSport(sport) {
  if (appStore.sport === sport) return
  appStore.setSport(sport)
  emit(EventBus.SPORT_CHANGE, appStore.sport)
  loadList()
}

/** 生成篮球/足球单色 SVG 图标 data URI：选中绿色(#29a871)、未选中灰色(#bbbbbb) */
function ballIcon(sport, active) {
  const color = active ? '#29a871' : '#bbbbbb'
  const svg = sport === 'basketball'
    ? `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='50' r='40' fill='none' stroke='${color}' stroke-width='6'/><line x1='50' y1='10' x2='50' y2='90' stroke='${color}' stroke-width='6'/><line x1='10' y1='50' x2='90' y2='50' stroke='${color}' stroke-width='6'/><path d='M16 28 Q48 50 16 72' fill='none' stroke='${color}' stroke-width='6'/><path d='M84 28 Q52 50 84 72' fill='none' stroke='${color}' stroke-width='6'/></svg>`
    : `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='50' r='40' fill='none' stroke='${color}' stroke-width='6'/><polygon points='50,30 67,43 61,63 39,63 33,43' fill='${color}'/><line x1='50' y1='30' x2='50' y2='15' stroke='${color}' stroke-width='6'/><line x1='67' y1='43' x2='82' y2='38' stroke='${color}' stroke-width='6'/><line x1='61' y1='63' x2='74' y2='78' stroke='${color}' stroke-width='6'/><line x1='39' y1='63' x2='26' y2='78' stroke='${color}' stroke-width='6'/><line x1='33' y1='43' x2='18' y2='38' stroke='${color}' stroke-width='6'/></svg>`
  return 'data:image/svg+xml,' + encodeURIComponent(svg)
}

function onRefresh() {
  refreshing.value = true
  loadList()
}

function statusText(g) {
  const s = g.status && g.status.value
  if (s === 1) return '未开赛'
  if (s === 2) return '进行中'
  if (s === 3) return '结束'
  return '未开始'
}

/** 技术统计入口：进赛前设置页（同旧「练习模式」页面），按当前运动分流 */
function goStatsDetail(g) {
  const url = appStore.sport === 'football'
    ? `/pages/match/football-setup?gameId=${g.id}&hostTeamId=${g.hostGameTeamId}&guestTeamId=${g.guestGameTeamId}`
    : `/pages/match/basketball-setup?gameId=${g.id}&hostTeamId=${g.hostGameTeamId}&guestTeamId=${g.guestGameTeamId}`
  uni.navigateTo({ url })
}

function goPhoto() {
  uni.navigateTo({ url: '/pages/photo/photo' })
}

function practice(sport) {
  drawer.value = false
  uni.showLoading({ title: '加载练习赛…', mask: true })
  // 对齐老项目：用 "basketball"/"football" 作为 gameId 请求后端预设练习赛，
  // 练习赛统一走 game/{gameId}/detail（无 soccer/ 前缀），gameId 为运动名
  const req = getGameDetail(sport, 'basketball')
  req.then((res) => {
    uni.hideLoading()
    if (!res || res.code !== 1) {
      uni.showToast({ title: (res && res.msg) || '练习赛加载失败', icon: 'none' })
      return
    }
    const g = (res.data && res.data.game) || res.data || {}
    const url = sport === 'football'
      ? `/pages/match/football-setup?gameId=${g.id}&hostTeamId=${g.hostGameTeamId}&guestTeamId=${g.guestGameTeamId}`
      : `/pages/match/basketball-setup?gameId=${g.id}&hostTeamId=${g.hostGameTeamId}&guestTeamId=${g.guestGameTeamId}`
    uni.navigateTo({ url })
  }).catch((err) => {
    uni.hideLoading()
    uni.showToast({ title: (err && err.msg) || '练习赛加载失败', icon: 'none' })
  })
}

function goWeekOuts() {
  drawer.value = false
  uni.navigateTo({ url: '/pages/game/week-outs' })
}

function logout() {
  uni.showModal({
    title: '提示',
    content: '确定退出登录？',
    success: (r) => {
      if (r.confirm) {
        userStore.logout()
        uni.reLaunch({ url: '/pages/login/index' })
      }
    }
  })
}

/** 版本更新检查（对应 MainActivity VersionCheck） */
function checkUpdate() {
  // 服务端参数全是数字枚举（原生 MainActivity:193 传 1,2,VERSION_CODE），传 'android'/'statistics'/版本名会 500
  const vc = Number(appStore.version)
  if (!vc || vc <= 0) return // 取不到合法 versionCode 就不查，别弹更新也不报错
  versionCheck({ deviceType: 1, appType: 2, versionCode: vc }).then((res) => {
    if (res.code === 1 && res.data) {
      const v = res.data
      if (v.versionCode && Number(v.versionCode) > Number(appStore.version)) {
        versionInfo.value = v
        showUpdate.value = true
      }
    }
  }).catch(() => {})
}

/** 下载并安装 APK（对应 DownloadService） */
function doUpdate() {
  const url = versionInfo.value && versionInfo.value.url
  if (!url) return
  // #ifdef APP-PLUS
  uni.showLoading({ title: '下载中…', mask: true })
  const dtask = plus.downloader.createDownload(
    url,
    { filename: '_doc/update.apk' },
    (d, status) => {
      uni.hideLoading()
      if (status === 200) {
        plus.runtime.install(
          d.filename,
          {},
          () => {},
          () => uni.showToast({ title: '安装失败', icon: 'none' })
        )
      } else {
        uni.showToast({ title: '下载失败', icon: 'none' })
      }
    }
  )
  dtask.start()
  // #endif
  // #ifndef APP-PLUS
  uni.showToast({ title: 'App 端才支持更新', icon: 'none' })
  // #endif
}
</script>

<style lang="scss" scoped>
/* ⚠️【MOCK】静态数据模式横幅 */
.mock-banner {
  margin: 20rpx 30rpx 0;
  padding: 16rpx 20rpx;
  background-color: #fff6e6;
  border: 1rpx solid #e6a23c;
  border-radius: 8rpx;
  color: #e6a23c;
  font-size: 24rpx;
  text-align: center;
}
.main {
  min-height: 100vh;
  background-color: #f8f8f8;
}
/* 抽屉 */
.mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 20;
}
.drawer {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  width: 80%;
  background-color: #ffffff;
  z-index: 21;
  transform: translateX(-100%);
  transition: transform 0.3s;
  display: flex;
  flex-direction: column;
}
.drawer.open {
  transform: translateX(0);
}
.drawer-status {
  background-color: #2c2c2c;
}
.drawer-header {
  // background-color: #29a871;
  padding: 60rpx 40rpx;
  display: flex;
  // flex-direction: column;
  align-items: center;
  border-bottom:3rpx solid #333333;
}
.avatar-lg {
  width: 60rpx;
  height: 60rpx;
  border-radius: 50%;
  background-color: #ffffff;
}
.nick {
  color: black;
  font-size: 30rpx;
  margin-top: 20rpx;
  margin-left: 15rpx;
  transform: translateY(-24%);	
}
.drawer-item {
  padding: 30rpx 30rpx;
  font-size: 28rpx;
  color: #333333;
  border-bottom: 1rpx solid #f2f2f2;
  display: flex;
  align-items: center;
}
.drawer-item.exit {
  color: #ff2d2d;
}
.version {
  margin-top: auto;
  text-align: center;
  padding: 30rpx;
  font-size: 24rpx;
  color: #999999;
}
/* 篮球/足球切换（两圆形上下排列，选中绿色） */
.sport-switch {
  position: fixed;
  right: 30rpx;
  bottom: 200rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24rpx;
  z-index: 10;
}
.sport-item {
  width: 88rpx;
  height: 88rpx;
  border-radius: 50%;
  background-color: #ffffff;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
}
.sport-item.active {
  background-color: #e8f7f0;
}
.sport-icon {
  width: 56rpx;
  height: 56rpx;
}
.tabs {
  display: flex;
  background-color: #ffffff;
  border-bottom: 1rpx solid #eeeeee;
}
.tab {
  flex: 1;
  text-align: center;
  padding: 24rpx 0;
  font-size: 30rpx;
  color: #333333;
}
.tab.active {
  color: #29a871;
  font-weight: bold;
  border-bottom: 4rpx solid #29a871;
}
.list {
  height: calc(100vh - 200rpx);
}
.league-headinfo{
	display:flex;
	justify-content: space-between;
}

.team-line{
	display: flex;
	justify-content: space-between;
}

/* 比赛卡内两队信息纵向排列 */
.league-innerinfo {
	display: flex;
	flex-direction: column;
	gap: 15rpx;
}

/* 队名/比分与按钮的水平行 */
.team-cell {
	display: flex;
	align-items: center;
}

.date-group {
  margin-bottom: 20rpx;
}
.date-header {
  padding: 20rpx 30rpx;
  font-size: 26rpx;
  color: #999999;
  background-color: #f8f8f8;
  display: flex;
  justify-content: center;
}
.match-item {
  background-color: #ffffff;
  margin: 0 20rpx 20rpx;
  padding: 30rpx;
  border-radius: 12rpx;
}
.league {
  font-size: 24rpx;
  color: #999999;
  margin-bottom: 20rpx;
}
.teams {
  display: flex;
  align-items: center;
  justify-content: center;
}
.team {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 16rpx;
}
.team:last-child {
  justify-content: flex-end;
}
.logo {
  width: 60rpx;
  height: 60rpx;
  border-radius: 50%;
}
.team-name {
  font-size: 28rpx;
  margin-left: 15rpx;
  color: #333333;
}
.score {
  font-size: 35rpx;
  color: #F53C2F;
}

.score::after{
	background-color: #EEEEEE;
	padding:10rpx 1.5rpx;
	content: '';
	margin:0 15rpx;
}

.vs {
  margin: 0 30rpx;
  font-size: 28rpx;
  color: #999999;
}
.status {
  text-align: center;
  font-size: 24rpx;
  color: #29a871;
  // margin-top: 16rpx;
}
.actions {
  display: flex;
  gap: 20rpx;
  margin-top: 24rpx;
}
.action-btn {
  flex: 1;
  text-align: center;
  padding: 16rpx 0;
  border-radius: 8rpx;
  font-size: 26rpx;
  width: 170rpx;
  box-shadow: 0 2rpx 4rpx rgba(0,0,0,0.3);
}
.action-btn.green {
  background-color: #29a871;
  color: #ffffff;
}
.action-btn.blue {
  background-color: #009de9;
  color: #ffffff;
}
/* 主队行占位：与「技术统计」按钮同尺寸，保证上下两行比分对齐 */
.action-btn.ghost {
  visibility: hidden;
}

.loading-more {
  text-align: center;
  padding: 30rpx;
  font-size: 24rpx;
  color: #999999;
}
.no-data-img {
  display: block;
  width: 100rpx;
  height: 100rpx;
  margin: 100rpx auto 50rpx auto;
}
.nav-action {
  font-size: 26rpx;
  color: #333333;
}
/* 版本更新弹窗 */
.update-dialog {
  width: 600rpx;
  padding: 40rpx;
}
.update-title {
  text-align: center;
  font-size: 32rpx;
  color: #333333;
  margin-bottom: 20rpx;
}
.update-content {
  max-height: 300rpx;
  font-size: 26rpx;
  color: #666666;
  line-height: 1.6;
}
.update-btns {
  display: flex;
  gap: 20rpx;
  margin-top: 30rpx;
}
.ub {
  flex: 1;
  height: 80rpx;
  line-height: 80rpx;
  text-align: center;
  border-radius: 40rpx;
  font-size: 28rpx;
}
.ub.cancel {
  background-color: #f2f2f2;
  color: #666666;
}
.ub.confirm {
  background-color: #29a871;
  color: #ffffff;
}
	
.search-icon{
	width: 40rpx;
	height: 40rpx;
	margin-right: 20rpx;
}

.bottom-line{
	margin-top: auto;
	display: flex; 
	justify-content: space-between;
}

.exit-icon{
	width: 40rpx;
	height: 45rpx;
	margin:0 0 0 30rpx;
}

.exit-login{
	display: flex;
	align-items: center; 
	margin-bottom: 10rpx;
}
.no-data{
	display: flex;
	flex-direction: column;
	align-items: center;
	margin-top: 300rpx;
}

/* 空态文字 */
.no-data-text {
	color: #BBBBBB;
}

/* 退出登录文字 */
.exit-text {
	margin-left: 25rpx;
	font-size: 27rpx;
}

</style>
