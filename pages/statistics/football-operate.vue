<template>
  <view class="foot-operate">
    <view class="top-bar">
      <view class="nav-status" :style="{ height: statusBarHeight + 'px' }"></view>
      <view class="top-bar-inner">
        <view class="back" @click="back">‹</view>
        <view class="team-info">
          <text class="tname">{{ homeName }}</text>
          <text class="tag foul">犯规{{ hostFoul }}</text>
        </view>
        <view class="timer-box">
          <text class="timer">{{ timerStr }}</text>
          <view class="timer-btns">
            <text class="t-btn" @click="toggleTimer">{{ timerRunning ? '暂停' : '开始' }}</text>
            <text class="t-btn" @click="editTimer">改时间</text>
          </view>
        </view>
        <view class="team-info">
          <text class="tag foul">犯规{{ guestFoul }}</text>
          <text class="tname">{{ guestName }}</text>
        </view>
        <battery-view :power="battery" />
      </view>
    </view>

    <view class="body">
      <view class="team-panel">
        <view class="panel-title">{{ homeName }}</view>
        <scroll-view scroll-y class="player-list">
          <view
            v-for="m in hostMembers"
            :key="m.team_member_id"
            class="player"
            :class="{ sel: selectedId === m.team_member_id && selectedTeam === 'host' }"
            @click="selectPlayer('host', m)"
          >
            <text class="num">{{ m.number }}</text>
            <text class="name">{{ m.name }}</text>
            <text v-if="m.foul > 0" class="foul-c" :class="{ red: m.foul >= 5 }">{{ m.foul }}</text>
          </view>
        </scroll-view>
      </view>

      <view class="center">
        <view class="score-board">
          <text class="score">{{ hostScore }}</text>
          <text class="colon">:</text>
          <text class="score">{{ guestScore }}</text>
        </view>
        <view class="section-btn" @click="showSection = true">{{ currentSectionName }}</view>
        <view class="sync-tag">待同步 {{ syncNum }}</view>

        <view class="action-grid">
          <view
            v-for="a in footActions"
            :key="a.type"
            class="action-btn"
            :class="a.color"
            @click="onAction(a)"
          >
            {{ a.desc }}
          </view>
        </view>
        <view class="row-btns">
          <view class="r-btn orange" @click="showChange = true">换人</view>
        </view>

        <scroll-view scroll-y class="record-preview">
          <view v-for="r in records" :key="r.record_number" class="record-item">
            <text class="r-team">{{ r.team_name }}</text>
            <text class="r-desc">{{ r.description }}</text>
            <text class="r-del" @click="onDelete(r)">删除</text>
          </view>
        </scroll-view>
      </view>

      <view class="team-panel">
        <view class="panel-title">{{ guestName }}</view>
        <scroll-view scroll-y class="player-list">
          <view
            v-for="m in guestMembers"
            :key="m.team_member_id"
            class="player"
            :class="{ sel: selectedId === m.team_member_id && selectedTeam === 'guest' }"
            @click="selectPlayer('guest', m)"
          >
            <text class="num">{{ m.number }}</text>
            <text class="name">{{ m.name }}</text>
            <text v-if="m.foul > 0" class="foul-c" :class="{ red: m.foul >= 5 }">{{ m.foul }}</text>
          </view>
        </scroll-view>
      </view>
    </view>

    <change-member-dialog :show="showChange" :members="currentMembers" @confirm="onChange" @close="showChange = false" />
    <section-dialog :show="showSection" @select="onSection" @close="showSection = false" />
  </view>
</template>

<script setup>
/**
 * 足球技术统计（对应 StatidticsFootActivity，横屏，离线优先）
 * - 动作集：进球/点球/射门/助攻/黄牌/红牌/越位/手球/犯规/暂停/换人/失误
 * - 比赛计时器（开始/暂停/改时分秒），计时存 SP（对应 MyPrefsFile/gameId=MM:SS）
 * - 记录多 elapsedTime 字段上传
 */
import { ref, computed, onUnmounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import batteryView from '@/components/battery-view/battery-view.vue'
import changeMemberDialog from '@/components/change-member-dialog/change-member-dialog.vue'
import sectionDialog from '@/components/section-dialog/section-dialog.vue'
import { queryList, insertOrReplace, executeSQL, selectSQL } from '@/utils/db'
import { startUploadQueue, stopUploadQueue, pendingCount } from '@/utils/upload-queue'
import { cancelData } from '@/api/statistics'
import { FootActions, scoreOf, isFoul } from '@/utils/stat-types'
import { msToMMSS } from '@/utils/time'

// 状态栏高度（custom 导航页需自行留出状态栏空间，避免与系统状态栏重叠）
const statusBarHeight = uni.getSystemInfoSync().statusBarHeight || 0

const gameId = ref('')
const homeName = ref('主队')
const guestName = ref('客队')
const hostMembers = ref([])
const guestMembers = ref([])
const sections = ref([])
const currentSectionIdx = ref(0)
const currentSection = ref('')
const currentSectionName = ref('上半场')
const selectedTeam = ref('')
const selectedId = ref('')
const selectedMember = ref(null)
const hostScore = ref(0)
const guestScore = ref(0)
const hostFoul = ref(0)
const guestFoul = ref(0)
const records = ref([])
const battery = ref(100)
const syncNum = ref(0)
const showChange = ref(false)
const showSection = ref(false)

const footActions = FootActions
const currentMembers = computed(() => (selectedTeam.value === 'host' ? hostMembers.value : guestMembers.value))

// 比赛计时器（对应 Timeutils + SP 缓存）
const timerStr = ref('00:00')
const timerRunning = ref(false)
let timerSeconds = 0
let timerInterval = null

onLoad((opt) => {
  gameId.value = opt.gameId || ''
  homeName.value = opt.homeName || '主队'
  guestName.value = opt.guestName || '客队'
  loadMembers()
  loadSections()
  loadRecords()
  loadTimer()
  startUploadQueue(gameId.value, () => {
    loadRecords()
    updateSyncNum()
  })
  updateSyncNum()
})

onUnmounted(() => {
  stopUploadQueue()
  stopTimer()
})

function loadMembers() {
  queryList('member', `game_id='${gameId.value}'`).then((list) => {
    hostMembers.value = list.filter((m) => m.type === 1).map((m) => ({ ...m, foul: 0 }))
    guestMembers.value = list.filter((m) => m.type === 0).map((m) => ({ ...m, foul: 0 }))
    loadStats()
  })
}
function loadSections() {
  queryList('game_section', `game_id='${gameId.value}'`, 'sort ASC').then((list) => {
    sections.value = list
    if (list.length) {
      currentSection.value = list[0].section_id
      currentSectionName.value = list[0].name
    }
  })
}
function loadRecords() {
  selectSQL(
    `SELECT * FROM technical_record WHERE game_id='${gameId.value}' AND disable=0 AND "delete"=1 ORDER BY record_number DESC LIMIT 30`
  ).then((list) => (records.value = list))
}
function loadStats() {
  selectSQL(`SELECT * FROM technical_record WHERE game_id='${gameId.value}' AND disable=0 AND "delete"=1`).then((list) => {
    let hs = 0, gs = 0, hf = 0, gf = 0
    const foulMap = {}
    list.forEach((r) => {
      const sc = scoreOf(r.type, 'football')
      const fl = isFoul(r.type, 'football')
      if (r.team_type === 1) {
        hs += sc
        if (fl) hf++
      } else {
        gs += sc
        if (fl) gf++
      }
      if (fl && r.statistics_member_id) foulMap[r.statistics_member_id] = (foulMap[r.statistics_member_id] || 0) + 1
    })
    hostScore.value = hs
    guestScore.value = gs
    hostFoul.value = hf
    guestFoul.value = gf
    hostMembers.value.forEach((m) => (m.foul = foulMap[m.team_member_id] || 0))
    guestMembers.value.forEach((m) => (m.foul = foulMap[m.team_member_id] || 0))
  })
}
function updateSyncNum() {
  pendingCount(gameId.value).then((n) => (syncNum.value = n))
}
function selectPlayer(team, m) {
  selectedTeam.value = team
  selectedId.value = m.team_member_id
  selectedMember.value = m
}

function onAction(a) {
  if (!selectedMember.value) {
    uni.showToast({ title: '请先选择球员', icon: 'none' })
    return
  }
  const team = selectedTeam.value
  const member = selectedMember.value
  const teamName = team === 'host' ? homeName.value : guestName.value
  const teamType = team === 'host' ? 1 : 0
  insertOrReplace('technical_record', {
    record_number: Date.now(),
    elapsed_time: timerSeconds,
    statistics_section_id: currentSection.value,
    type: a.type,
    statistics_member_id: member.team_member_id,
    description: `${member.name} ${a.desc}`,
    game_id: gameId.value,
    team_type: teamType,
    team_name: teamName,
    add: 0,
    delete: 1,
    is_need_upload: 0,
    disable: 0
  })
  const sc = scoreOf(a.type, 'football')
  if (sc > 0) {
    if (team === 'host') hostScore.value += sc
    else guestScore.value += sc
  }
  if (isFoul(a.type, 'football')) {
    if (team === 'host') hostFoul.value++
    else guestFoul.value++
    member.foul = (member.foul || 0) + 1
  }
  loadRecords()
  updateSyncNum()
}

function onDelete(r) {
  cancelData({ gameId: gameId.value, recordNumber: r.record_number, statisticsMemberId: r.statistics_member_id }).then((res) => {
    if (res.code === 1) {
      executeSQL(`UPDATE technical_record SET disable=1, is_need_upload=1 WHERE record_number=${r.record_number}`)
      loadRecords()
      loadStats()
      updateSyncNum()
    }
  })
}

function onChange({ offId, onId }) {
  const team = selectedTeam.value || 'host'
  const teamName = team === 'host' ? homeName.value : guestName.value
  const teamType = team === 'host' ? 1 : 0
  const members = team === 'host' ? hostMembers.value : guestMembers.value
  const offMember = members.find((m) => m.team_member_id === offId)
  const onMember = members.find((m) => m.team_member_id === onId)
  const base = Date.now()
  insertOrReplace('technical_record', { record_number: base, elapsed_time: timerSeconds, statistics_section_id: currentSection.value, type: 13, statistics_member_id: offId, description: `${offMember ? offMember.name : ''} 换下`, game_id: gameId.value, team_type: teamType, team_name: teamName, add: 0, delete: 1, is_need_upload: 0, disable: 0 })
  insertOrReplace('technical_record', { record_number: base + 1, elapsed_time: timerSeconds, statistics_section_id: currentSection.value, type: 14, statistics_member_id: onId, description: `${onMember ? onMember.name : ''} 换上`, game_id: gameId.value, team_type: teamType, team_name: teamName, add: 0, delete: 1, is_need_upload: 0, disable: 0 })
  loadRecords()
  updateSyncNum()
}

function onSection(t) {
  if (t === 'prev' && currentSectionIdx.value > 0) currentSectionIdx.value--
  if (t === 'next' && currentSectionIdx.value < sections.value.length - 1) currentSectionIdx.value++
  const sec = sections.value[currentSectionIdx.value]
  if (sec) {
    currentSection.value = sec.section_id
    currentSectionName.value = sec.name
  }
}

/* ========== 计时器（对应 Timeutils + SP 存 MM:SS） ========== */
function toggleTimer() {
  if (timerRunning.value) stopTimer()
  else startTimer()
}
function startTimer() {
  if (timerRunning.value) return
  timerRunning.value = true
  timerInterval = setInterval(() => {
    timerSeconds++
    timerStr.value = msToMMSS(timerSeconds * 1000)
    saveTimer()
  }, 1000)
}
function stopTimer() {
  timerRunning.value = false
  if (timerInterval) clearInterval(timerInterval)
  saveTimer()
}
function loadTimer() {
  timerSeconds = uni.getStorageSync('foot_timer_' + gameId.value) || 0
  timerStr.value = msToMMSS(timerSeconds * 1000)
}
function saveTimer() {
  uni.setStorageSync('foot_timer_' + gameId.value, timerSeconds)
}
function editTimer() {
  uni.showModal({
    title: '修改时间',
    editable: true,
    placeholderText: 'mm:ss',
    content: timerStr.value,
    success: (r) => {
      if (r.confirm && r.content) {
        const parts = r.content.split(':').map(Number)
        timerSeconds = (parts[0] || 0) * 60 + (parts[1] || 0)
        timerStr.value = msToMMSS(timerSeconds * 1000)
        saveTimer()
      }
    }
  })
}

function back() {
  uni.navigateBack()
}
</script>

<style lang="scss" scoped>
.foot-operate {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f8f8f8;
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
  color: #ffffff;
}
.back {
  font-size: 44rpx;
  width: 60rpx;
}
.team-info {
  display: flex;
  align-items: center;
  gap: 10rpx;
  flex: 1;
}
.tname {
  font-size: 26rpx;
}
.tag.foul {
  font-size: 22rpx;
  padding: 2rpx 10rpx;
  border-radius: 4rpx;
  background-color: #ff2d2d;
}
.timer-box {
  display: flex;
  align-items: center;
  gap: 10rpx;
}
.timer {
  font-size: 30rpx;
  color: #ff6f21;
}
.timer-btns {
  display: flex;
  gap: 8rpx;
}
.t-btn {
  font-size: 22rpx;
  padding: 4rpx 12rpx;
  background-color: #29a871;
  border-radius: 4rpx;
}
.body {
  flex: 1;
  display: flex;
  flex-direction: row;
  overflow: hidden;
}
.team-panel {
  width: 240rpx;
  background-color: #ffffff;
  border-right: 1rpx solid #eeeeee;
  display: flex;
  flex-direction: column;
}
.panel-title {
  text-align: center;
  font-size: 24rpx;
  color: #29a871;
  padding: 12rpx 0;
  border-bottom: 1rpx solid #f2f2f2;
}
.player-list {
  flex: 1;
}
.player {
  display: flex;
  align-items: center;
  padding: 16rpx 20rpx;
  border-bottom: 1rpx solid #f2f2f2;
}
.player.sel {
  background-color: #e8f7ee;
}
.num {
  width: 50rpx;
  font-size: 26rpx;
  color: #29a871;
  font-weight: bold;
}
.name {
  flex: 1;
  font-size: 24rpx;
  color: #333333;
}
.foul-c {
  font-size: 22rpx;
  color: #ff6f21;
}
.foul-c.red {
  color: #ff2d2d;
}
.center {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 16rpx;
}
.score-board {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 30rpx;
}
.score {
  font-size: 56rpx;
  font-weight: bold;
  color: #2f7ed8;
}
.colon {
  font-size: 40rpx;
  color: #999999;
}
.section-btn {
  text-align: center;
  font-size: 24rpx;
  color: #29a871;
  margin: 6rpx 0;
}
.sync-tag {
  text-align: center;
  font-size: 22rpx;
  color: #999999;
  margin-bottom: 6rpx;
}
.action-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}
.action-btn {
  width: calc(33.33% - 8rpx);
  height: 64rpx;
  line-height: 64rpx;
  text-align: center;
  border-radius: 6rpx;
  font-size: 24rpx;
  color: #ffffff;
}
.action-btn.green {
  background-color: #29a871;
}
.action-btn.red {
  background-color: #ff2d2d;
}
.action-btn.blue {
  background-color: #009de9;
}
.row-btns {
  display: flex;
  gap: 12rpx;
  margin: 10rpx 0;
}
.r-btn {
  flex: 1;
  height: 60rpx;
  line-height: 60rpx;
  text-align: center;
  border-radius: 6rpx;
  font-size: 24rpx;
  color: #ffffff;
}
.r-btn.orange {
  background-color: #ff6f21;
}
.record-preview {
  flex: 1;
  background-color: #ffffff;
  border-radius: 6rpx;
}
.record-item {
  display: flex;
  align-items: center;
  padding: 12rpx 16rpx;
  border-bottom: 1rpx solid #f2f2f2;
}
.r-team {
  font-size: 22rpx;
  color: #29a871;
  width: 100rpx;
}
.r-desc {
  flex: 1;
  font-size: 22rpx;
  color: #333333;
}
.r-del {
  font-size: 22rpx;
  color: #ff2d2d;
}
</style>
