<template>
  <view class="week-outs">
    <view class="top-bar">
      <view class="nav-status" :style="{ height: statusBarHeight + 'px' }"></view>
      <view class="top-bar-inner">
        <view class="back" @click="back"><image class="back-icon" src="/static/mipmap-xxhdpi/black_back.png" mode="aspectFit" /></view>
        <text class="title">优肯周赛况</text>
      </view>
    </view>
    <scroll-view scroll-y class="body">
      <!-- 顶部 banner（cuba 标题图，带边框） -->
      <view class="banner-box">
        <image class="banner-img" src="/static/mipmap-xxhdpi/cuba.png" mode="aspectFit" />
      </view>

      <!-- 分组：U6 / U8 / U10 / U12，全部展开（对齐老项目，无折叠） -->
      <template v-for="(group, gi) in groups" :key="gi">
        <view v-if="group.games && group.games.length" class="group-box">
          <image class="group-title-img" :src="groupTitleImg(group.groupName)" mode="aspectFit" />

          <!-- 比赛列表：主队logo+队名 + 比分块 + 客队队名+logo -->
          <view v-for="g in group.games" :key="g.id" class="game-row">
            <image class="team-logo" :src="g.hostTeamLogo" mode="aspectFill" />
            <text class="team-name host">{{ g.hostTeamName }}</text>
            <view class="score-box">
              <text class="score-num">{{ g.hostTeamScore }}</text>
              <view class="score-sep"></view>
              <text class="score-num">{{ g.guestTeamScore }}</text>
            </view>
            <text class="team-name guest">{{ g.guestTeamName }}</text>
            <image class="team-logo" :src="g.guestTeamLogo" mode="aspectFill" />
          </view>
          <view class="game-rule"></view>

          <!-- 橙色分隔条 -->
          <view class="orange-bar"></view>

          <!-- 数据王标题图 -->
          <image class="kings-title-img" src="/static/mipmap-xxhdpi/good.png" mode="aspectFit" />

          <!-- 数据王 2×2 表格：得分王/篮板王 + 助攻王/抢断王，每类最多2人并列，超2隐藏 -->
          <view class="kings-table">
            <view v-for="(row, ri) in kingRows" :key="ri" class="kings-row">
              <template v-for="(def, ci) in row" :key="def.type">
                <view v-if="group.kings[def.type].show" class="king-cell">
                  <view class="king-logos">
                    <image
                      v-if="group.kings[def.type].first.avatar"
                      class="king-logo"
                      :src="group.kings[def.type].first.avatar"
                      mode="aspectFill"
                    />
                    <image
                      v-if="group.kings[def.type].hasSecond && group.kings[def.type].second.avatar"
                      class="king-logo second"
                      :src="group.kings[def.type].second.avatar"
                      mode="aspectFill"
                    />
                  </view>
                  <view class="king-mid">
                    <text class="king-title">{{ def.title }}</text>
                    <text class="king-name" :class="{ small: group.kings[def.type].hasSecond }">{{ group.kings[def.type].first.name }}</text>
                    <text v-if="group.kings[def.type].hasSecond" class="king-name small">{{ group.kings[def.type].second.name }}</text>
                  </view>
                  <text class="king-score">{{ group.kings[def.type].first.count }}</text>
                </view>
                <view v-else class="king-cell-empty"></view>
                <view v-if="ci === 0" class="king-sep-v"></view>
              </template>
            </view>
          </view>
        </view>
      </template>

      <empty-layout v-if="!groups.length && !loading" status="empty" />
    </scroll-view>
  </view>
</template>

<script setup>
/**
 * 优肯周赛况（对齐老项目 WeekOutsActivity）
 * - GET game/list-week?leagueId=youkenLeagueId -> code==1 取 data
 * - data[i]：0=U6 / 1=U8 / 2=U10 / 3=U12，每组 games + optimals(数据王)
 * - 全部展开（老项目 ScrollView 直接列出，无折叠）
 * - 比赛行：主队logo+队名 + 比分块(#ff6f21) + 客队队名+logo
 * - 数据王 2×2 表格（橙底 #ff6f21）：得分王 type1 / 篮板王 type2 / 助攻王 type3 / 抢断王 type5
 *   每类取前2人并列，0人或>2人该类隐藏（对齐老项目 a/b/c/d 计数逻辑）
 * - 标题图 cuba/u6/u8/u10/u12/good 从老项目 mipmap 拷贝，图本身含优肯品牌字体
 */
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import emptyLayout from '@/components/empty-layout/empty-layout.vue'
import { getWeekList } from '@/api/game'
import { config } from '@/config'

// 状态栏高度（custom 导航页需自行留出状态栏空间，避免与系统时间/电量栏重叠）
const statusBarHeight = uni.getSystemInfoSync().statusBarHeight || 0

const groups = ref([])
const loading = ref(false)

// 数据王行配置：第一行 得分王/篮板王，第二行 助攻王/抢断王
const kingRows = [
  [{ type: 1, title: '得 分 王' }, { type: 2, title: '篮 板 王' }],
  [{ type: 3, title: '助 攻 王' }, { type: 5, title: '抢 断 王' }]
]

onLoad(() => {
  loading.value = true
  getWeekList(config.youkenLeagueId).then((res) => {
    if (res.code === 1) {
      groups.value = (res.data || []).map((g) => ({ ...g, kings: buildKings(g) }))
    }
  }).finally(() => {
    loading.value = false
  })
})

/** 分组标题图：groupName 含 U6/U8/U10/U12，映射到对应图片 */
function groupTitleImg(groupName) {
  const m = /U(6|8|10|12)/.exec(groupName || '')
  const key = m ? ('u' + m[1]) : 'u6'
  return `/static/mipmap-xxhdpi/${key}.png`
}

/**
 * 构造数据王映射：{1:得分王, 2:篮板王, 3:助攻王, 5:抢断王}
 * 每类取前2人，0人或>2人则 show=false（对齐老项目：超过2人全部隐藏）
 */
function buildKings(group) {
  const map = { 1: [], 2: [], 3: [], 5: [] }
  ;(group.optimals || []).forEach((o) => {
    const t = o.type && o.type.value
    if (map[t]) map[t].push(o)
  })
  const result = {}
  Object.keys(map).forEach((t) => {
    const arr = map[t]
    if (!arr.length || arr.length > 2) {
      result[t] = { show: false, first: {}, second: null, hasSecond: false }
    } else {
      result[t] = {
        show: true,
        first: { name: arr[0].name, count: arr[0].count, avatar: arr[0].avatar || '' },
        second: arr[1] ? { name: arr[1].name, count: arr[1].count, avatar: arr[1].avatar || '' } : null,
        hasSecond: !!arr[1]
      }
    }
  })
  return result
}

function back() {
  uni.navigateBack()
}
</script>

<style lang="scss" scoped>
.week-outs {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f8f8f8;
}
.top-bar {
  background-color: #ffffff;
}
.nav-status {
  background-color: #ffffff;
}
.top-bar-inner {
  height: 88rpx;
  position: relative;
  display: flex;
  align-items: center;
  padding: 0 20rpx;
}
.back {
  font-size: 44rpx;
  color: #000000;
  width: 60rpx;
  position: absolute;
  left: 20rpx;
  top: 0;
  bottom: 0;
  display: flex;
  align-items: center;
}
.title {
  color: #000000;
  font-size: 32rpx;
  font-weight: bold;
  position: absolute;
  left: 100rpx;
  right: 100rpx;
  top: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}
.body {
  flex: 1;
}
.banner-box {
  margin: 20rpx;
  padding: 20rpx;
  border: 2rpx solid #e5e5e5;
  border-radius: 8rpx;
  background-color: #ffffff;
}
.banner-img {
  width: 100%;
  height: 280rpx;
}
.group-box {
  margin: 0 20rpx 20rpx;
  padding: 20rpx 0;
  background-color: #ffffff;
  border: 2rpx solid #e5e5e5;
  border-radius: 8rpx;
}
.group-title-img {
  width: 100%;
  height: 140rpx;
}
.game-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 10rpx 20rpx;
}
.team-logo {
  width: 60rpx;
  height: 60rpx;
}
.team-name {
  flex: 1;
  font-size: 22rpx;
  color: #141a66;
  font-weight: bold;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.team-name.host {
  margin-left: 6rpx;
}
.team-name.guest {
  margin-right: 6rpx;
  text-align: right;
}
.score-box {
  display: flex;
  flex-direction: row;
  align-items: center;
  width: 140rpx;
  background-color: #ff6f21;
  border-radius: 8rpx;
  padding: 6rpx 0;
  margin: 0 10rpx;
}
.score-num {
  flex: 1;
  text-align: center;
  color: #ffffff;
  font-size: 36rpx;
  font-weight: bold;
}
.score-sep {
  width: 4rpx;
  height: 40rpx;
  background-color: #ffffff;
}
.game-rule {
  height: 2rpx;
  margin: 0 20rpx;
  background-color: #ededed;
}
.orange-bar {
  height: 16rpx;
  background-color: #ff6f21;
  margin: 10rpx 20rpx;
}
.kings-title-img {
  width: 100%;
  height: 140rpx;
}
.kings-table {
  margin: 0 20rpx;
}
.kings-row {
  display: flex;
  flex-direction: row;
  align-items: stretch;
  margin-top: 10rpx;
}
.king-cell {
  flex: 1;
  display: flex;
  flex-direction: row;
  align-items: center;
  background-color: #ff6f21;
  padding: 10rpx;
  min-height: 120rpx;
}
.king-cell-empty {
  flex: 1;
}
.king-sep-v {
  width: 20rpx;
  background-color: #ffffff;
}
.king-logos {
  position: relative;
  width: 80rpx;
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}
.king-logo {
  width: 70rpx;
  height: 70rpx;
  border-radius: 50%;
}
.king-logo.second {
  position: absolute;
  right: 0;
  bottom: 0;
  width: 50rpx;
  height: 50rpx;
  border: 2rpx solid #ff6f21;
}
.king-mid {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.king-title {
  color: #ffffff;
  font-size: 26rpx;
  font-weight: bold;
}
.king-name {
  color: #ffffff;
  font-size: 26rpx;
  font-weight: bold;
}
.king-name.small {
  font-size: 22rpx;
}
.king-score {
  color: #ffffff;
  font-size: 54rpx;
  font-weight: bold;
  width: 80rpx;
  text-align: center;
}
.back-icon {
  width: 100rpx;
  height: 100rpx;
}
</style>
