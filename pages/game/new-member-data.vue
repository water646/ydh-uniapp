<template>
  <view class="new-member-data">
    <view class="top-bar">
      <view class="nav-status" :style="{ height: statusBarHeight + 'px' }"></view>
      <view class="top-bar-inner">
        <view class="back" @click="back">‹</view>
        <text class="title">比赛数据</text>
      </view>
    </view>
    <scroll-view scroll-y class="body">
      <view class="score-head">
        <text>总分 {{ hostTotal.score }} : {{ guestTotal.score }}</text>
      </view>
      <view class="team-table">
        <text class="th">{{ homeName }}</text>
        <view class="tr head">
          <text class="td num">号</text>
          <text class="td name">姓名</text>
          <text class="td">分</text>
          <text class="td">板</text>
          <text class="td">助</text>
          <text class="td">抢</text>
          <text class="td">帽</text>
          <text class="td">犯</text>
        </view>
        <view v-for="m in hostRows" :key="m.team_member_id" class="tr">
          <text class="td num">{{ m.number }}</text>
          <text class="td name">{{ m.name }}</text>
          <text class="td">{{ m.stats.score }}</text>
          <text class="td">{{ m.stats.board }}</text>
          <text class="td">{{ m.stats.assists }}</text>
          <text class="td">{{ m.stats.steals }}</text>
          <text class="td">{{ m.stats.block }}</text>
          <text class="td">{{ m.stats.foul }}</text>
        </view>
        <view class="tr total">
          <text class="td num">合计</text>
          <text class="td name"></text>
          <text class="td">{{ hostTotal.score }}</text>
          <text class="td">{{ hostTotal.board }}</text>
          <text class="td">{{ hostTotal.assists }}</text>
          <text class="td">{{ hostTotal.steals }}</text>
          <text class="td">{{ hostTotal.block }}</text>
          <text class="td">{{ hostTotal.foul }}</text>
        </view>
      </view>
      <view class="team-table">
        <text class="th">{{ guestName }}</text>
        <view class="tr head">
          <text class="td num">号</text>
          <text class="td name">姓名</text>
          <text class="td">分</text>
          <text class="td">板</text>
          <text class="td">助</text>
          <text class="td">抢</text>
          <text class="td">帽</text>
          <text class="td">犯</text>
        </view>
        <view v-for="m in guestRows" :key="m.team_member_id" class="tr">
          <text class="td num">{{ m.number }}</text>
          <text class="td name">{{ m.name }}</text>
          <text class="td">{{ m.stats.score }}</text>
          <text class="td">{{ m.stats.board }}</text>
          <text class="td">{{ m.stats.assists }}</text>
          <text class="td">{{ m.stats.steals }}</text>
          <text class="td">{{ m.stats.block }}</text>
          <text class="td">{{ m.stats.foul }}</text>
        </view>
        <view class="tr total">
          <text class="td num">合计</text>
          <text class="td name"></text>
          <text class="td">{{ guestTotal.score }}</text>
          <text class="td">{{ guestTotal.board }}</text>
          <text class="td">{{ guestTotal.assists }}</text>
          <text class="td">{{ guestTotal.steals }}</text>
          <text class="td">{{ guestTotal.block }}</text>
          <text class="td">{{ guestTotal.foul }}</text>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
/**
 * 新版球员技术统计（对应 NewMemberDataActivity，竖屏，主客双列同屏）
 * 同 aggregateMemberStats 聚合，一屏同显主客两表
 */
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { selectSQL } from '@/utils/db'
import { aggregateMemberStats } from '@/utils/stat-types'

// 状态栏高度（custom 导航页需自行留出状态栏空间，避免与系统时间/电量栏重叠）
const statusBarHeight = uni.getSystemInfoSync().statusBarHeight || 0

const gameId = ref('')
const homeName = ref('主队')
const guestName = ref('客队')
const hostRows = ref([])
const guestRows = ref([])
const hostTotal = ref({})
const guestTotal = ref({})

onLoad((opt) => {
  gameId.value = opt.gameId || ''
  homeName.value = opt.homeName || '主队'
  guestName.value = opt.guestName || '客队'
  load()
})

function load() {
  selectSQL(`SELECT * FROM technical_record WHERE game_id='${gameId.value}' AND disable=0 AND "delete"=1`).then((recs) => {
    Promise.all([
      selectSQL(`SELECT * FROM member WHERE game_id='${gameId.value}' AND type=1`),
      selectSQL(`SELECT * FROM member WHERE game_id='${gameId.value}' AND type=0`)
    ]).then(([hostMembers, guestMembers]) => {
      hostRows.value = hostMembers.map((m) => ({ ...m, stats: aggregateMemberStats(recs.filter((r) => r.statistics_member_id === m.team_member_id)) }))
      guestRows.value = guestMembers.map((m) => ({ ...m, stats: aggregateMemberStats(recs.filter((r) => r.statistics_member_id === m.team_member_id)) }))
      hostTotal.value = sumTotal(hostRows.value)
      guestTotal.value = sumTotal(guestRows.value)
    })
  })
}

function sumTotal(rows) {
  const t = { score: 0, board: 0, assists: 0, steals: 0, block: 0, foul: 0 }
  rows.forEach((r) => Object.keys(t).forEach((k) => (t[k] += r.stats[k])))
  return t
}

function back() {
  uni.navigateBack()
}
</script>

<style lang="scss" scoped>
.new-member-data {
  min-height: 100vh;
  background-color: #f8f8f8;
  display: flex;
  flex-direction: column;
}
.top-bar {
  background-color: #2c2c2c;
}
.nav-status {
  background-color: #2c2c2c;
}
.top-bar-inner {
  height: 88rpx;
  display: flex;
  align-items: center;
  padding: 0 20rpx;
}
.back {
  font-size: 44rpx;
  color: #ffffff;
  width: 60rpx;
}
.title {
  color: #ffffff;
  font-size: 30rpx;
  flex: 1;
  text-align: center;
}
.body {
  flex: 1;
}
.score-head {
  text-align: center;
  padding: 20rpx;
  font-size: 28rpx;
  color: #2f7ed8;
  font-weight: bold;
}
.team-table {
  background-color: #ffffff;
  margin: 16rpx;
  border-radius: 8rpx;
  overflow: hidden;
}
.th {
  display: block;
  text-align: center;
  font-size: 26rpx;
  color: #29a871;
  padding: 16rpx 0;
  border-bottom: 1rpx solid #f2f2f2;
}
.tr {
  display: flex;
  border-bottom: 1rpx solid #f2f2f2;
}
.tr.head {
  background-color: #f8f8f8;
}
.tr.total {
  background-color: #e8f7ee;
  font-weight: bold;
}
.td {
  flex: 1;
  text-align: center;
  font-size: 24rpx;
  color: #333333;
  padding: 16rpx 0;
}
.td.num {
  flex: 0.6;
  color: #29a871;
}
.td.name {
  flex: 1.5;
  text-align: left;
  padding-left: 20rpx;
}
</style>
