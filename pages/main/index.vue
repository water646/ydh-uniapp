<template>
  <view class="main">
    <custom-nav title="智能技术台" :show-back="false">
      <template #left>
        <view class="avatar-btn" @click="drawer = true">
          <image class="avatar" :src="userInfo && userInfo.avatar" mode="aspectFill" />
        </view>
      </template>
      <template #right>
        <text class="nav-action" @click="goPhoto">活动列表</text>
      </template>
    </custom-nav>

    <!-- ⚠️【MOCK】静态数据模式横幅（config.useMock=true 时显示） -->
    <view v-if="useMock" class="mock-banner">⚠️ MOCK 静态数据模式 · 列表/详情/统计均为造数 · 关闭请改 config.useMock=false</view>

    <!-- 抽屉（对应 MainActivity DrawerLayout） -->
    <view v-if="drawer" class="mask" @click="drawer = false"></view>
    <view class="drawer" :class="{ open: drawer }">
      <view class="drawer-header">
        <image class="avatar-lg" :src="userInfo && userInfo.avatar" mode="aspectFill" />
        <text class="nick">{{ (userInfo && userInfo.nickName) || '未登录' }}</text>
      </view>
      <view class="drawer-item" @click="practice('basketball')">篮球练习模式</view>
      <view class="drawer-item" @click="practice('football')">足球练习模式</view>
      <view class="drawer-item" @click="goWeekOuts">优肯周赛况</view>
      <view class="drawer-item exit" @click="logout">退出登录</view>
      <view class="version">版本 {{ appVersion }}</view>
    </view>

    <!-- 篮球/足球切换（对应右侧悬浮钮 + EventBus Boolean） -->
    <view class="sport-switch" @click="toggleSport">
      {{ appStore.sport === 'basketball' ? '篮球' : '足球' }}
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
      @refresherrefresh="onRefresh"
    >
      <view v-for="group in groups" :key="group.date" class="date-group">
        <view class="date-header">{{ group.date }}</view>
        <view v-for="g in group.games" :key="g.id" class="match-item">
			<view class="league-headinfo">
				<view class="league status">{{ statusText(g) }}</view>
				<view class="league">{{ g.leagueName }}</view>
			</view>
			
			
			
			<view class="league-innerinfo" style="display: flex; flex-direction: column; gap:15rpx;">
				<view class="team-line">
					<view style="display: flex; align-items: center;">
						<image v-if="g.hostTeamLogo" class="logo" :src="g.hostTeamLogo" mode="aspectFill" />
						<text class="team-name">{{ g.hostTeamName }}</text>
					</view>
					<view style="display: flex; align-items: center;">
						<text class="score">{{ g.hostTeamScore }}</text>
						<view class="action-btn blue" @click="goLive(g)">直播</view>
					</view>
				</view>
				
				<view class="team-line">
					<view style="display: flex; align-items: center;">
						<image v-if="g.guestTeamLogo" class="logo" :src="g.guestTeamLogo" mode="aspectFill" />
						<text class="team-name">{{ g.guestTeamName }}</text>
					</view>
					<view style="display: flex; align-items: center;">
						<text class="score">{{ g.guestTeamScore }}</text>
						<view class="action-btn green" @click="goMatchSet(g)">修改状态</view>
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
      <empty-layout v-if="!loading && !groups.length" status="empty" />
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
 * 主页（对应 MainActivity）
 * 批2 完善版：抽屉（用户信息/练习模式/优肯/退出/版本）+ 版本更新检查 + 比赛列表跳赛前设置
 */
import { ref, computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import customNav from '@/components/custom-nav/custom-nav.vue'
import emptyLayout from '@/components/empty-layout/empty-layout.vue'
import { getMatchList } from '@/api/game'
import { getUserInfo } from '@/api/login'
import { versionCheck } from '@/api/version'
import { useUserStore } from '@/store/user'
import { useAppStore } from '@/store/app'
import { emit, EventBus } from '@/utils/eventBus'
import { config } from '@/config'
import { initPractice } from '@/utils/practice'

const userStore = useUserStore()
const appStore = useAppStore()
const useMock = config.useMock // ⚠️【MOCK】是否静态数据模式

const userInfo = ref(null)
const appVersion = ref('')
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
  appVersion.value = appStore.version
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

function onRefresh() {
  refreshing.value = true
  loadList()
}

function statusText(g) {
  const s = g.status && g.status.value
  if (s === 1) return '进行中'
  if (s === 2) return '已结束'
  return '未开始'
}

function goMatchSet(g) {
  const sport = appStore.sport
  const url =
    sport === 'football'
      ? `/pages/match/football-setup?gameId=${g.id}&hostTeamId=${g.hostGameTeamId}&guestTeamId=${g.guestGameTeamId}`
      : `/pages/match-set/index?gameId=${g.id}&hostTeamId=${g.hostGameTeamId}&guestTeamId=${g.guestGameTeamId}`
  uni.navigateTo({ url })
}

function goLive(g) {
  uni.navigateTo({ url: '/pages/live/multiple?gameId=' + g.id })
}

function goPhoto() {
  uni.navigateTo({ url: '/pages/photo/photo' })
}

function practice(sport) {
  drawer.value = false
  uni.showLoading({ title: '准备练习数据…', mask: true })
  // 本地造一场练习赛（member 8v8 + 4 小节），再跳离线统计页练手
  initPractice(sport)
    .then(({ gameId, homeName, guestName }) => {
      uni.hideLoading()
      const page = sport === 'football' ? 'football-operate' : 'basketball-operate'
      uni.navigateTo({
        url: `/pages/statistics/${page}?gameId=${gameId}&homeName=${encodeURIComponent(homeName)}&guestName=${encodeURIComponent(guestName)}`
      })
    })
    .catch(() => {
      uni.hideLoading()
      uni.showToast({ title: '练习数据初始化失败', icon: 'none' })
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
  versionCheck({ deviceType: 'android', appType: 'statistics', versionCode: appStore.version }).then((res) => {
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
.avatar-btn {
  width: 90rpx;
  height: 90rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}
.avatar {
  width: 56rpx;
  height: 56rpx;
  border-radius: 50%;
  background-color: #eeeeee;
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
  width: 70%;
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
.drawer-header {
  background-color: #29a871;
  padding: 60rpx 40rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.avatar-lg {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  background-color: #ffffff;
}
.nick {
  color: #ffffff;
  font-size: 30rpx;
  margin-top: 20rpx;
}
.drawer-item {
  padding: 30rpx 40rpx;
  font-size: 28rpx;
  color: #333333;
  border-bottom: 1rpx solid #f2f2f2;
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
/* 篮球/足球切换 */
.sport-switch {
  position: fixed;
  right: 30rpx;
  bottom: 200rpx;
  width: 100rpx;
  height: 100rpx;
  line-height: 100rpx;
  text-align: center;
  border-radius: 50%;
  background-color: #29a871;
  color: #ffffff;
  font-size: 28rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.2);
  z-index: 10;
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
  width: 180rpx;

}
.action-btn.green {
  background-color: #29a871;
  color: #ffffff;
}
.action-btn.blue {
  background-color: #009de9;
  color: #ffffff;
}
.loading-more {
  text-align: center;
  padding: 30rpx;
  font-size: 24rpx;
  color: #999999;
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
</style>
