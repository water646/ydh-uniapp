<template>
  <view class="record-new">
    <view class="top-bar">
      <view class="nav-status" :style="{ height: statusBarHeight + 'px' }"></view>
      <view class="top-bar-inner">
        <view class="back" @click="back"><image class="back-icon" src="/static/mipmap-xxhdpi/black_back.png" mode="aspectFit" /></view>
        <text class="title">操作记录</text>
        <view class="tabs">
          <text
            v-for="(t, i) in tabs"
            :key="i"
            class="tab"
            :class="{ active: current === i }"
            @click="switchTab(i)"
          >{{ t }}</text>
        </view>
      </view>
    </view>
    <scroll-view scroll-y class="list">
      <view v-for="r in records" :key="r.record_number" class="rec-item">
        <view class="rec-info">
          <text class="r-section">{{ r.section_name }}</text>
          <text class="r-team">{{ r.team_name }}</text>
          <text class="r-player">{{ r.member_name }}</text>
          <text class="r-type">{{ typeDesc(r.type, 'basketball') }}</text>
        </view>
        <text v-if="canDelete(r)" class="r-del" @click="onDelete(r)">删除</text>
      </view>
      <empty-layout v-if="!records.length" status="empty" />
    </scroll-view>
  </view>
</template>

<script setup>
/**
 * 篮球新版操作记录（对应 RecordNewActivity，竖屏，纯本地 GreenDAO）
 * 3 Tab：全部 / 得分(6/7/8) / 犯规(9/119/120/121 含技术/违体/夺权)
 * 含 type 117/118 前后场篮板
 */
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import emptyLayout from '@/components/empty-layout/empty-layout.vue'
import { selectSQL, executeSQL } from '@/utils/db'
import { typeDesc } from '@/utils/stat-types'

// 状态栏高度（custom 导航页需自行留出状态栏空间，避免与系统时间/电量栏重叠）
const statusBarHeight = uni.getSystemInfoSync().statusBarHeight || 0

const gameId = ref('')
const tabs = ['全部', '得分', '犯规']
const current = ref(0)
const records = ref([])

const scoreTypes = '6,7,8'
const foulTypes = '9,119,120,121'

onLoad((opt) => {
  gameId.value = opt.gameId || ''
  loadRecords()
})

function switchTab(i) {
  current.value = i
  loadRecords()
}

function loadRecords() {
  let where = `game_id='${gameId.value}' AND disable=0 AND "delete"=1`
  if (current.value === 1) where += ` AND type IN (${scoreTypes})`
  if (current.value === 2) where += ` AND type IN (${foulTypes})`
  Promise.all([
    selectSQL(`SELECT * FROM technical_record WHERE ${where} ORDER BY record_number DESC`),
    selectSQL(`SELECT * FROM member WHERE game_id='${gameId.value}'`),
    selectSQL(`SELECT * FROM game_section WHERE game_id='${gameId.value}'`)
  ]).then(([recs, members, secs]) => {
    const memberMap = {}
    members.forEach((m) => (memberMap[m.team_member_id] = m.name))
    const secMap = {}
    secs.forEach((s) => (secMap[s.section_id] = s.name))
    records.value = recs.map((r) => ({
      ...r,
      member_name: memberMap[r.statistics_member_id] || '',
      section_name: secMap[r.statistics_section_id] || ''
    }))
  })
}

function canDelete(r) {
  return ![13, 14, 15, 16].includes(r.type)
}

function onDelete(r) {
  executeSQL(`UPDATE technical_record SET disable=1 WHERE record_number=${r.record_number}`).then(() => {
    loadRecords()
  })
}

function back() {
  uni.navigateBack()
}
</script>

<style lang="scss" scoped>
.record-new {
  min-height: 100vh;
  background-color: #ffffff;
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
  height: 96rpx;
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
  margin-right: 30rpx;
}
.tabs {
  flex: 1;
  display: flex;
  gap: 30rpx;
}
.tab {
  font-size: 26rpx;
  color: #999999;
  padding: 10rpx 0;
}
.tab.active {
  color: #ff2d2d;
  border-bottom: 4rpx solid #ff2d2d;
}
.list {
  flex: 1;
}
.rec-item {
  display: flex;
  align-items: center;
  padding: 24rpx;
  border-bottom: 1rpx solid #f2f2f2;
}
.rec-info {
  flex: 1;
  display: flex;
  gap: 20rpx;
}
.r-section {
  font-size: 22rpx;
  color: #999999;
  width: 80rpx;
}
.r-team {
  font-size: 24rpx;
  color: #29a871;
  width: 140rpx;
}
.r-player {
  flex: 1;
  font-size: 26rpx;
  color: #333333;
}
.r-type {
  font-size: 26rpx;
  color: #2f7ed8;
}
.r-del {
  font-size: 26rpx;
  color: #ff2d2d;
}
.back-icon {
  width: 100rpx;
  height: 100rpx;
}
</style>
