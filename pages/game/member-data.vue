<template>
  <view class="member-data">
    <view class="top-bar">
      <view class="nav-status" :style="{ height: statusBarHeight + 'px' }"></view>
      <view class="top-bar-inner">
        <view class="back" @click="back">‹</view>
        <view class="radio-group">
          <text class="radio" :class="{ on: team === 'host' }" @click="switchTeam('host')">{{ homeName }}</text>
          <text class="radio" :class="{ on: team === 'guest' }" @click="switchTeam('guest')">{{ guestName }}</text>
        </view>
      </view>
    </view>
    <scroll-view scroll-x class="table-scroll">
      <view class="table">
        <view class="tr head">
          <text class="td num">号码</text>
          <text class="td name">姓名</text>
          <text class="td">得分</text>
          <text class="td">篮板</text>
          <text class="td">助攻</text>
          <text class="td">抢断</text>
          <text class="td">盖帽</text>
          <text class="td">投篮</text>
          <text class="td">三分</text>
          <text class="td">罚球</text>
          <text class="td">失误</text>
          <text class="td">犯规</text>
        </view>
        <view v-for="m in rows" :key="m.team_member_id" class="tr">
          <text class="td num">{{ m.number }}</text>
          <text class="td name">{{ m.name }}</text>
          <text class="td">{{ m.stats.score }}</text>
          <text class="td">{{ m.stats.board }}</text>
          <text class="td">{{ m.stats.assists }}</text>
          <text class="td">{{ m.stats.steals }}</text>
          <text class="td">{{ m.stats.block }}</text>
          <text class="td">{{ m.stats.shots_success }}/{{ m.stats.shots_total }}</text>
          <text class="td">{{ m.stats.thirds_success }}/{{ m.stats.thirds_total }}</text>
          <text class="td">{{ m.stats.penalty_success }}/{{ m.stats.penalty_total }}</text>
          <text class="td">{{ m.stats.turnover }}</text>
          <text class="td">{{ m.stats.foul }}</text>
        </view>
        <view class="tr total">
          <text class="td num">合计</text>
          <text class="td name"></text>
          <text class="td">{{ total.score }}</text>
          <text class="td">{{ total.board }}</text>
          <text class="td">{{ total.assists }}</text>
          <text class="td">{{ total.steals }}</text>
          <text class="td">{{ total.block }}</text>
          <text class="td">{{ total.shots_success }}/{{ total.shots_total }}</text>
          <text class="td">{{ total.thirds_success }}/{{ total.thirds_total }}</text>
          <text class="td">{{ total.penalty_success }}/{{ total.penalty_total }}</text>
          <text class="td">{{ total.turnover }}</text>
          <text class="td">{{ total.foul }}</text>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
/**
 * 球员技术统计（对应 MemberDataActivity，横屏，纯本地 GreenDAO 聚合）
 * 主/客 Tab，按 statistics_member_id 聚合 TechNicalRecord，末行全队总计
 */
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { selectSQL } from '@/utils/db'
import { aggregateMemberStats } from '@/utils/stat-types'

// 状态栏高度（custom 导航页需自行留出状态栏空间，避免与系统状态栏重叠）
const statusBarHeight = uni.getSystemInfoSync().statusBarHeight || 0

const gameId = ref('')
const homeName = ref('主队')
const guestName = ref('客队')
const team = ref('host')
const rows = ref([])
const total = ref({})

onLoad((opt) => {
  gameId.value = opt.gameId || ''
  homeName.value = opt.homeName || '主队'
  guestName.value = opt.guestName || '客队'
  load()
})

function switchTeam(t) {
  team.value = t
  load()
}

function load() {
  const teamType = team.value === 'host' ? 1 : 0
  Promise.all([
    selectSQL(`SELECT * FROM member WHERE game_id='${gameId.value}' AND type=${teamType}`),
    selectSQL(`SELECT * FROM technical_record WHERE game_id='${gameId.value}' AND disable=0 AND "delete"=1 AND team_type=${teamType}`)
  ]).then(([members, recs]) => {
    const rowsData = members.map((m) => ({
      ...m,
      stats: aggregateMemberStats(recs.filter((r) => r.statistics_member_id === m.team_member_id))
    }))
    rows.value = rowsData
    const t = {
      score: 0, board: 0, assists: 0, steals: 0, block: 0, foul: 0,
      shots_total: 0, shots_success: 0, thirds_total: 0, thirds_success: 0,
      penalty_total: 0, penalty_success: 0, miss: 0, turnover: 0
    }
    rowsData.forEach((r) => Object.keys(t).forEach((k) => (t[k] += r.stats[k])))
    total.value = t
  })
}

function back() {
  uni.navigateBack()
}
</script>

<style lang="scss" scoped>
.member-data {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #ffffff;
}
.top-bar {
  background-color: #2c2c2c;
}
.nav-status {
  background-color: #2c2c2c;
}
.top-bar-inner {
  height: 80rpx;
  display: flex;
  align-items: center;
  padding: 0 20rpx;
}
.back {
  font-size: 44rpx;
  color: #ffffff;
  width: 60rpx;
}
.radio-group {
  flex: 1;
  display: flex;
  justify-content: center;
  gap: 40rpx;
}
.radio {
  font-size: 28rpx;
  color: #999999;
  padding: 10rpx 20rpx;
}
.radio.on {
  color: #29a871;
  border-bottom: 4rpx solid #29a871;
}
.table-scroll {
  flex: 1;
}
.table {
  min-width: 1200rpx;
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
  width: 100rpx;
  text-align: center;
  font-size: 22rpx;
  color: #333333;
  padding: 16rpx 0;
}
.td.num {
  width: 80rpx;
  color: #29a871;
}
.td.name {
  width: 140rpx;
  text-align: left;
  padding-left: 20rpx;
}
</style>
