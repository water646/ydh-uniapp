<template>
  <view class="basket-new">
    <view class="top-bar">
      <view class="nav-status" :style="{ height: statusBarHeight + 'px' }"></view>
      <view class="top-bar-inner">
        <view class="back" @click="back"><image class="back-icon" src="/static/mipmap-xxhdpi/black_back.png" mode="aspectFit" /></view>
        <text class="title">篮球统计</text>
        <text class="upload-btn" @click="onUploadAll">打包上传</text>
      </view>
    </view>

    <view class="score-board">
      <view class="team-score">
        <text class="tname">{{ homeName }}</text>
        <text class="score">{{ hostScore }}</text>
      </view>
      <text class="colon">:</text>
      <view class="team-score">
        <text class="score">{{ guestScore }}</text>
        <text class="tname">{{ guestName }}</text>
      </view>
    </view>

    <view class="ctrl-row">
      <view class="section-btn" @click="showSection = true">{{ currentSectionName }} ▼</view>
      <view class="stat-info">主 犯规{{ hostFoul }} 暂停{{ hostPause }} | 客 犯规{{ guestFoul }} 暂停{{ guestPause }}</view>
      <view class="sync-tag">待同步 {{ syncNum }}</view>
    </view>

    <view class="teams">
      <view class="team-col">
        <view class="col-title">{{ homeName }}</view>
        <scroll-view scroll-y class="player-list">
          <view
            v-for="m in hostMembers"
            :key="m.team_member_id"
            class="player"
            @click="onPlayer('host', m)"
          >
            <text class="num">{{ m.number }}</text>
            <text class="name">{{ m.name }}</text>
            <text v-if="m.foul > 0" class="foul-c" :class="{ red: m.foul >= 5 }">{{ m.foul }}</text>
          </view>
        </scroll-view>
        <view class="add-btn" @click="addTeam = 'host'; showAdd = true">+ 加球员</view>
      </view>
      <view class="team-col">
        <view class="col-title">{{ guestName }}</view>
        <scroll-view scroll-y class="player-list">
          <view
            v-for="m in guestMembers"
            :key="m.team_member_id"
            class="player"
            @click="onPlayer('guest', m)"
          >
            <text class="num">{{ m.number }}</text>
            <text class="name">{{ m.name }}</text>
            <text v-if="m.foul > 0" class="foul-c" :class="{ red: m.foul >= 5 }">{{ m.foul }}</text>
          </view>
        </scroll-view>
        <view class="add-btn" @click="addTeam = 'guest'; showAdd = true">+ 加球员</view>
      </view>
    </view>

    <view class="record-bar">
      <view class="rb-title">最近记录</view>
      <scroll-view scroll-y class="rec-list">
        <view v-for="r in records" :key="r.record_number" class="rec-item">
          <text class="r-desc">{{ r.description }}</text>
          <text class="r-del" @click="onDelete(r)">删除</text>
        </view>
      </scroll-view>
    </view>

    <action-sheet :show="showAction" :actions="basketActions" :title="selectedMember ? selectedMember.name : '选择动作'" @select="onAction" @close="showAction = false" />
    <section-dialog :show="showSection" @select="onSection" @close="showSection = false" />
    <add-member-dialog :show="showAdd" sport="basketball" @confirm="onAdd" @close="showAdd = false" />
    <change-member-dialog :show="showChange" :members="currentMembers" @confirm="onChange" @close="showChange = false" />
  </view>
</template>

<script setup>
/**
 * 新版篮球技术统计（对应 NewBasketStaticActivity，离线优先）
 * - 进页 getGameDetail 拉小节/比分初始化
 * - 球员来自本地 db，加临时球员后从服务端 getMember 刷新该队
 * - 点球员弹底部 action-sheet（含扩展类型 117~121）
 * - 打包上传：批量 uploadDataAll（对应 statistics/add-all）
 * - 离线队列 2s 上传
 */
import { ref, computed, onUnmounted } from 'vue'
import { onLoad, onBackPress } from '@dcloudio/uni-app'
import actionSheet from '@/components/action-sheet/action-sheet.vue'
import sectionDialog from '@/components/section-dialog/section-dialog.vue'
import addMemberDialog from '@/components/add-member-dialog/add-member-dialog.vue'
import changeMemberDialog from '@/components/change-member-dialog/change-member-dialog.vue'
import { getGameDetail, getMember, addMember } from '@/api/game'
import { uploadDataAll, cancelData } from '@/api/statistics'
import { queryList, insertOrReplace, executeSQL, selectSQL, deleteWhere } from '@/utils/db'
import { startUploadQueue, stopUploadQueue, pendingCount } from '@/utils/upload-queue'
import { BasketActions, BasketType, scoreOf, isFoul } from '@/utils/stat-types'

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
const hostPause = ref(0)
const guestPause = ref(0)
const records = ref([])
const syncNum = ref(0)
const showAction = ref(false)
const showSection = ref(false)
const showAdd = ref(false)
const showChange = ref(false)
const addTeam = ref('host')

const basketActions = BasketActions
const currentMembers = computed(() => (selectedTeam.value === 'host' ? hostMembers.value : guestMembers.value))

onLoad((opt) => {
  gameId.value = opt.gameId || ''
  homeName.value = opt.homeName || '主队'
  guestName.value = opt.guestName || '客队'
  loadGameData()
  loadMembers()
  loadRecords()
  startUploadQueue(gameId.value, () => {
    loadRecords()
    updateSyncNum()
  })
  updateSyncNum()
})

onUnmounted(() => stopUploadQueue())

// 拦截返回键（对应原项目 onKeyDown 拦截）
onBackPress(() => true)

function loadGameData() {
  getGameDetail(gameId.value, 'basketball').then((res) => {
    if (res.code !== 1) return
    const page = res.data || {}
    const g = page.game || {}
    if (g.hostTeamName) homeName.value = g.hostTeamName
    if (g.guestTeamName) guestName.value = g.guestTeamName
    hostScore.value = g.hostTeamScore || 0
    guestScore.value = g.guestTeamScore || 0
  })
  loadSections()
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

function loadMembers() {
  queryList('member', `game_id='${gameId.value}'`).then((list) => {
    hostMembers.value = list.filter((m) => m.type === 1).map((m) => ({ ...m, foul: 0 }))
    guestMembers.value = list.filter((m) => m.type === 0).map((m) => ({ ...m, foul: 0 }))
    loadStats()
  })
}

function loadRecords() {
  selectSQL(
    `SELECT * FROM technical_record WHERE game_id='${gameId.value}' AND disable=0 AND "delete"=1 ORDER BY record_number DESC LIMIT 30`
  ).then((list) => (records.value = list))
}

function loadStats() {
  selectSQL(`SELECT * FROM technical_record WHERE game_id='${gameId.value}' AND disable=0 AND "delete"=1`).then((list) => {
    let hf = 0, gf = 0, hp = 0, gp = 0
    const foulMap = {}
    list.forEach((r) => {
      if (isFoul(r.type, 'basketball')) {
        if (r.team_type === 1) hf++
        else gf++
        if (r.statistics_member_id) foulMap[r.statistics_member_id] = (foulMap[r.statistics_member_id] || 0) + 1
      }
      if (r.type === 5) r.team_type === 1 ? hp++ : gp++
    })
    hostFoul.value = hf
    guestFoul.value = gf
    hostPause.value = hp
    guestPause.value = gp
    hostMembers.value.forEach((m) => (m.foul = foulMap[m.team_member_id] || 0))
    guestMembers.value.forEach((m) => (m.foul = foulMap[m.team_member_id] || 0))
  })
}

function updateSyncNum() {
  pendingCount(gameId.value).then((n) => (syncNum.value = n))
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
  const teamName = team === 'host' ? homeName.value : guestName.value
  const teamType = team === 'host' ? 1 : 0
  insertOrReplace('technical_record', {
    record_number: Date.now(),
    elapsed_time: 0,
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
  const sc = scoreOf(a.type, 'basketball')
  if (sc > 0) {
    if (team === 'host') hostScore.value += sc
    else guestScore.value += sc
  }
  if (isFoul(a.type, 'basketball')) {
    if (team === 'host') hostFoul.value++
    else guestFoul.value++
    member.foul = (member.foul || 0) + 1
  }
  if (a.type === BasketType.PAUSE) {
    if (team === 'host') hostPause.value++
    else guestPause.value++
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
  const team = selectedTeam.value
  const teamName = team === 'host' ? homeName.value : guestName.value
  const teamType = team === 'host' ? 1 : 0
  const base = Date.now()
  insertOrReplace('technical_record', { record_number: base, elapsed_time: 0, statistics_section_id: currentSection.value, type: 13, statistics_member_id: offId, description: '换下', game_id: gameId.value, team_type: teamType, team_name: teamName, add: 0, delete: 1, is_need_upload: 0, disable: 0 })
  insertOrReplace('technical_record', { record_number: base + 1, elapsed_time: 0, statistics_section_id: currentSection.value, type: 14, statistics_member_id: onId, description: '换上', game_id: gameId.value, team_type: teamType, team_name: teamName, add: 0, delete: 1, is_need_upload: 0, disable: 0 })
  loadRecords()
  updateSyncNum()
}

/** 添加临时球员后从服务端刷新该队（对应 NewBasketStatic 加球员后 getHmemberList） */
function onAdd(form) {
  const teamType = addTeam.value === 'host' ? 1 : 0
  const members = addTeam.value === 'host' ? hostMembers.value : guestMembers.value
  const gameTeamId = members[0] ? members[0].game_id : ''
  addMember({ gameTeamId, number: form.number, name: form.name, position: form.position }).then((res) => {
    if (res.code === 1) {
      // 从服务端刷新该队成员
      refreshTeam(addTeam.value, gameTeamId)
      showAdd.value = false
    }
  })
}

function refreshTeam(team, gameTeamId) {
  if (!gameTeamId) return
  getMember(gameTeamId).then((res) => {
    if (res.code !== 1) return
    const list = (res.data || []).map((m) => ({ ...m, team_member_id: m.teamMemberId, foul: 0, type: team === 'host' ? 1 : 0, game_id: gameId.value, number: m.number, name: m.name, startingLineup: m.startingLineup?.boolean ? 1 : 0, playing: m.playing?.boolean ? 1 : 0 }))
    if (team === 'host') hostMembers.value = list
    else guestMembers.value = list
    // 替换本地该队 member
    deleteWhere('member', `game_id='${gameId.value}' AND type=${team === 'host' ? 1 : 0}`)
    list.forEach((m) => {
      insertOrReplace('member', {
        team_member_id: m.team_member_id, game_id: gameId.value, type: m.type,
        name: m.name, number: m.number, startingLineup: m.startingLineup, playing: m.playing
      })
    })
  })
}

/** 打包上传（对应 statistics/add-all） */
function onUploadAll() {
  selectSQL(`SELECT * FROM technical_record WHERE game_id='${gameId.value}' AND is_need_upload=0 AND disable=0`).then((list) => {
    if (!list.length) {
      uni.showToast({ title: '无待上传记录', icon: 'none' })
      return
    }
    const statisticsList = list.map((r) => ({
      description: r.description,
      recordNumber: r.record_number,
      statisticsMemberId: r.statistics_member_id,
      statisticsSectionId: r.statistics_section_id,
      type: r.type
    }))
    uploadDataAll({ statisticsList }).then((res) => {
      if (res.code === 1) {
        list.forEach((r) => {
          executeSQL(`UPDATE technical_record SET is_need_upload=1 WHERE record_number=${r.record_number}`)
        })
        updateSyncNum()
        uni.showToast({ title: '上传成功', icon: 'none' })
      }
    })
  })
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

function back() {
  uni.showModal({
    title: '提示',
    content: '确定退出统计？',
    success: (r) => {
      if (r.confirm) uni.navigateBack()
    }
  })
}
</script>

<style lang="scss" scoped>
.basket-new {
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
  color: #ffffff;
}
.back {
  font-size: 44rpx;
  width: 60rpx;
}
.title {
  flex: 1;
  text-align: center;
  font-size: 30rpx;
}
.upload-btn {
  font-size: 26rpx;
  color: #ff6f21;
}
.score-board {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20rpx;
  gap: 30rpx;
}
.team-score {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.tname {
  font-size: 24rpx;
  color: #666666;
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
.ctrl-row {
  display: flex;
  align-items: center;
  padding: 0 20rpx 16rpx;
  gap: 16rpx;
}
.section-btn {
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
.sync-tag {
  font-size: 22rpx;
  color: #ff6f21;
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
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.col-title {
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
.add-btn {
  text-align: center;
  font-size: 24rpx;
  color: #009de9;
  padding: 16rpx 0;
  border-top: 1rpx solid #f2f2f2;
}
.record-bar {
  margin: 16rpx 20rpx;
  background-color: #ffffff;
  border-radius: 8rpx;
  padding: 16rpx;
  max-height: 240rpx;
  display: flex;
  flex-direction: column;
}
.rb-title {
  font-size: 24rpx;
  color: #999999;
  margin-bottom: 8rpx;
}
.rec-list {
  flex: 1;
}
.rec-item {
  display: flex;
  align-items: center;
  padding: 8rpx 0;
  border-bottom: 1rpx solid #f8f8f8;
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
.back-icon {
  width: 100rpx;
  height: 100rpx;
}
</style>
