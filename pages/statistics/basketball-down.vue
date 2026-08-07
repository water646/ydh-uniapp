<template>
  <view class="basket-down">
    <view class="top-bar">
      <view class="nav-status" :style="{ height: statusBarHeight + 'px' }"></view>
      <view class="top-bar-inner">
        <view class="back" @click="back"><image class="back-icon" src="/static/mipmap-xxhdpi/black_back.png" mode="aspectFit" /></view>
        <view class="teams-name">
          <text class="tname red">{{ homeName }}</text>
          <text class="vs">vs</text>
          <text class="tname blue">{{ guestName }}</text>
        </view>
      </view>
    </view>

    <view class="score-box">
      <text class="score">{{ hostScore }}</text>
      <text class="colon">:</text>
      <text class="score">{{ guestScore }}</text>
    </view>

    <view class="ctrl-row">
      <view class="section-box" @click="showSection = true">{{ currentSectionName }} ▼</view>
      <view class="stat-info">主 犯规{{ hostFoul }} 暂停{{ hostStop }} | 客 犯规{{ guestFoul }} 暂停{{ guestStop }}</view>
    </view>

    <view class="teams">
      <scroll-view scroll-y class="team-col">
        <view
          v-for="m in hostMembers"
          :key="m.teamMemberId"
          class="player"
          @click="onPlayer('host', m)"
        >
          <text class="num">{{ m.number }}</text>
          <text class="name">{{ m.name }}</text>
          <text v-if="m.foul > 0" class="foul-c" :class="{ red: m.foul >= 5 }">{{ m.foul }}</text>
        </view>
      </scroll-view>
      <scroll-view scroll-y class="team-col">
        <view
          v-for="m in guestMembers"
          :key="m.teamMemberId"
          class="player"
          @click="onPlayer('guest', m)"
        >
          <text class="num">{{ m.number }}</text>
          <text class="name">{{ m.name }}</text>
          <text v-if="m.foul > 0" class="foul-c" :class="{ red: m.foul >= 5 }">{{ m.foul }}</text>
        </view>
      </scroll-view>
    </view>

    <view class="sync-bar">
      <text class="sync-num">{{ syncing ? '同步中…' : '已同步' }}</text>
      <view class="sync-btn" @click="loadData">刷新</view>
    </view>

    <action-sheet :show="showAction" :actions="basketActions" :title="selectedMember ? selectedMember.name : '选择动作'" @select="onAction" @close="showAction = false" />
    <change-member-dialog :show="showChange" :members="currentMembers" @confirm="onChange" @close="showChange = false" />
    <section-dialog :show="showSection" @select="onSection" @close="showSection = false" />
  </view>
</template>

<script setup>
/**
 * 篮球技术统计-在线同步版（对应 StaticNewDownActivity，竖屏，在线优先）
 * - 进页 getGameBasketballDetail 一次拉全量（game/小节/主客球员/比分/犯规/暂停）
 * - 每次动作即时 uploadData，成功后刷新 loadData
 * - 换人：先传下场(13)成功后传上场(14)
 * - 切换小节 sectionRunning -> 刷新
 * - 收 EventBus 8888（RECORD_REFRESH）-> 刷新 loadData（对应 OperationRecord 删除后通知）
 * 不使用本地 db，全部基于服务端返回状态
 */
import { ref, computed, onUnmounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import actionSheet from '@/components/action-sheet/action-sheet.vue'
import changeMemberDialog from '@/components/change-member-dialog/change-member-dialog.vue'
import sectionDialog from '@/components/section-dialog/section-dialog.vue'
import { getGameBasketballDetail } from '@/api/game'
import { uploadData, sectionRunning, cancelData } from '@/api/statistics'
import { BasketActions, scoreOf, isFoul } from '@/utils/stat-types'
import { on, off, EventBus } from '@/utils/eventBus'

// 状态栏高度（custom 导航页需自行留出状态栏空间，避免与系统时间/电量栏重叠）
const statusBarHeight = uni.getSystemInfoSync().statusBarHeight || 0

const gameId = ref('')
const homeName = ref('主队')
const guestName = ref('客队')
const hostMembers = ref([])
const guestMembers = ref([])
const sections = ref([])
const currentSectionIdx = ref(0)
const currentSection = ref('')
const currentSectionName = ref('第1节')
const selectedTeam = ref('')
const selectedMember = ref(null)
const hostScore = ref(0)
const guestScore = ref(0)
const hostFoul = ref(0)
const guestFoul = ref(0)
const hostStop = ref(0)
const guestStop = ref(0)
const syncing = ref(false)
const showAction = ref(false)
const showChange = ref(false)
const showSection = ref(false)

const basketActions = BasketActions
const currentMembers = computed(() => (selectedTeam.value === 'host' ? hostMembers.value : guestMembers.value))

onLoad((opt) => {
  gameId.value = opt.gameId || ''
  loadData()
  // 收 8888 刷新（对应 OperationRecordActivity post 8888）
  on(EventBus.RECORD_REFRESH, loadData)
})

onUnmounted(() => {
  off(EventBus.RECORD_REFRESH, loadData)
})

/** 拉取全量状态（对应 getGameData -> statistics/game-detail-basketball） */
function loadData() {
  if (!gameId.value) return
  syncing.value = true
  getGameBasketballDetail(gameId.value).then((res) => {
    if (res.code !== 1) return
    // res.data 为 StatisDownData（含 game/hostMembers/guestMembers/sections/犯规/暂停）
    const d = res.data || {}
    const g = d.game || {}
    homeName.value = g.hostTeamName || homeName.value
    guestName.value = g.guestTeamName || guestName.value
    hostScore.value = g.hostTeamScore || 0
    guestScore.value = g.guestTeamScore || 0
    hostFoul.value = d.hostTeamFoul || 0
    guestFoul.value = d.guestTeamFoul || 0
    hostStop.value = d.hostTeamStop || 0
    guestStop.value = d.guestTeamStop || 0
    hostMembers.value = d.hostMembers || []
    guestMembers.value = d.guestMembers || []
    sections.value = d.sections || []
    // 定位当前运行中的小节
    const running = sections.value.find((s) => s.running && s.running.boolean)
    if (running) {
      currentSection.value = running.gameSectionId
      currentSectionName.value = running.name
      currentSectionIdx.value = sections.value.findIndex((s) => s.gameSectionId === running.gameSectionId)
    } else if (sections.value.length) {
      currentSection.value = sections.value[0].gameSectionId
      currentSectionName.value = sections.value[0].name
    }
  }).finally(() => {
    syncing.value = false
  })
}

function onPlayer(team, m) {
  selectedTeam.value = team
  selectedMember.value = m
  showAction.value = true
}

function onAction(a) {
  const team = selectedTeam.value
  const member = selectedMember.value
  if (!member) return
  const teamType = team === 'host' ? 1 : 0
  uploading()
  uploadData({
    description: `${member.name} ${a.desc}`,
    recordNumber: Date.now(),
    statisticsMemberId: member.teamMemberId,
    statisticsSectionId: currentSection.value,
    type: a.type,
    index: 0,
    host_guest: teamType
  }).then((res) => {
    if (res.code === 1) loadData()
  }).finally(done)
}

/** 换人：先传下场(13)成功后传上场(14)（对应 StaticNewDown 换人逻辑） */
function onChange({ offId, onId }) {
  const team = selectedTeam.value
  const teamType = team === 'host' ? 1 : 0
  const base = Date.now()
  uploading()
  uploadData({
    description: '换下', recordNumber: base, statisticsMemberId: offId,
    statisticsSectionId: currentSection.value, type: 13, index: 0, host_guest: teamType
  }).then((res) => {
    if (res.code === 1) {
      return uploadData({
        description: '换上', recordNumber: base + 1, statisticsMemberId: onId,
        statisticsSectionId: currentSection.value, type: 14, index: 0, host_guest: teamType
      })
    }
  }).then((res) => {
    if (res && res.code === 1) loadData()
  }).finally(done)
}

function onSection(t) {
  if (t === 'prev' && currentSectionIdx.value > 0) currentSectionIdx.value--
  if (t === 'next' && currentSectionIdx.value < sections.value.length - 1) currentSectionIdx.value++
  const sec = sections.value[currentSectionIdx.value]
  if (sec) {
    currentSection.value = sec.gameSectionId
    currentSectionName.value = sec.name
  }
  if (t === 'start' || t === 'end') {
    // 设置小节运行状态（对应 statistics/section/running）
    uploading()
    sectionRunning(currentSection.value).then((res) => {
      if (res.code === 1) loadData()
    }).finally(done)
  }
}

let syncCount = 0
function uploading() {
  syncCount++
  syncing.value = true
}
function done() {
  syncCount = Math.max(0, syncCount - 1)
  if (syncCount === 0) syncing.value = false
}

function back() {
  uni.navigateBack()
}
</script>

<style lang="scss" scoped>
.basket-down {
  min-height: 100vh;
  background-color: #f8f8f8;
  display: flex;
  flex-direction: column;
}
.top-bar {
  background-color: #ffffff;
}
.nav-status {
  background-color: #ffffff;
}
.top-bar-inner {
  height: 88rpx;
  display: flex;
  align-items: center;
  padding: 0 20rpx;
  position: relative;
}
.back {
  font-size: 44rpx;
  color: #000000;
  width: 60rpx;
}
.teams-name {
  position: absolute;
  left: 80rpx;
  right: 80rpx;
  top: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20rpx;
  pointer-events: none;
}
.tname {
  font-size: 28rpx;
}
.tname.red {
  color: #ff2d2d;
}
.tname.blue {
  color: #009de9;
}
.vs {
  font-size: 24rpx;
  color: #999999;
}
.score-box {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 30rpx;
  padding: 20rpx 0;
}
.score {
  font-size: 64rpx;
  font-weight: bold;
  color: #2f7ed8;
}
.colon {
  font-size: 40rpx;
  color: #999999;
}
.ctrl-row {
  display: flex;
  align-items: center;
  padding: 0 20rpx 16rpx;
  gap: 16rpx;
}
.section-box {
  font-size: 24rpx;
  padding: 6rpx 16rpx;
  background-color: #29a871;
  color: #ffffff;
  border-radius: 6rpx;
}
.stat-info {
  flex: 1;
  font-size: 22rpx;
  color: #999999;
}
.teams {
  display: flex;
  gap: 16rpx;
  padding: 0 20rpx;
  flex: 1;
}
.team-col {
  flex: 1;
  background-color: #ffffff;
  border-radius: 8rpx;
}
.player {
  display: flex;
  align-items: center;
  padding: 20rpx;
  border-bottom: 1rpx solid #f2f2f2;
}
.num {
  width: 60rpx;
  font-size: 28rpx;
  color: #29a871;
  font-weight: bold;
}
.name {
  flex: 1;
  font-size: 26rpx;
  color: #333333;
}
.foul-c {
  font-size: 24rpx;
  color: #ff6f21;
}
.foul-c.red {
  color: #ff2d2d;
}
.sync-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx;
}
.sync-num {
  font-size: 24rpx;
  color: #999999;
}
.sync-btn {
  font-size: 26rpx;
  color: #29a871;
  padding: 10rpx 30rpx;
  border: 1rpx solid #29a871;
  border-radius: 30rpx;
}
.back-icon {
  width: 100rpx;
  height: 100rpx;
}
</style>
