<template>
  <view class="record-page">
    <view class="top-bar">
      <view class="nav-status" :style="{ height: statusBarHeight + 'px' }"></view>
      <view class="top-bar-inner">
        <view class="back" @click="back">‹</view>
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
          <text class="r-type">{{ typeDesc(r.type, 'football') }}</text>
        </view>
        <text v-if="canDelete(r)" class="r-del" @click="onDelete(r)">删除</text>
      </view>
      <empty-layout v-if="!records.length" status="empty" />
    </scroll-view>
  </view>
</template>

<script setup>
/**
 * 足球操作记录（对应 RecordFootActivity，横屏，纯本地 GreenDAO）
 * 3 Tab：全部 / 得分(type 18/19 进球/点球) / 犯规(type 9)
 * Adapter 另含 type 20~24 标签（射门/黄牌/红牌/越位/手球）
 */
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import emptyLayout from '@/components/empty-layout/empty-layout.vue'
import { selectSQL, executeSQL } from '@/utils/db'
import { typeDesc } from '@/utils/stat-types'

// 状态栏高度（custom 导航页需自行留出状态栏空间，避免与系统状态栏重叠）
const statusBarHeight = uni.getSystemInfoSync().statusBarHeight || 0

const gameId = ref('')
const tabs = ['全部', '得分', '犯规']
const current = ref(0)
const records = ref([])

const scoreTypes = '18,19'
const foulTypes = '9'

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
.record-page {
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
.tabs {
  flex: 1;
  display: flex;
  justify-content: center;
  gap: 40rpx;
}
.tab {
  font-size: 28rpx;
  color: #999999;
  padding: 10rpx 0;
}
.tab.active {
  color: #29a871;
  border-bottom: 4rpx solid #29a871;
}
.list {
  flex: 1;
}
.rec-item {
  display: flex;
  align-items: center;
  padding: 20rpx 24rpx;
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
  font-size: 22rpx;
  color: #29a871;
  width: 120rpx;
}
.r-player {
  flex: 1;
  font-size: 24rpx;
  color: #333333;
}
.r-type {
  font-size: 24rpx;
  color: #2f7ed8;
}
.r-del {
  font-size: 24rpx;
  color: #ff2d2d;
}
</style>
