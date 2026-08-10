<template>
  <view class="basket-operate">
    <!-- 顶栏：比分 + 球队名 -->
    <view class="top-bar">
      <view class="nav-status" :style="{ height: statusBarHeight + 'px' }"></view>
      <view class="top-bar-inner">
        <view class="back" @click="back"><image class="back-icon" src="/static/mipmap-xxhdpi/black_back.png" mode="aspectFit" /></view>
        <view class="score-area">
          <text class="team-name">{{ homeName }}</text>
          <text class="score">{{ hostScore }}</text>
          <text class="colon">:</text>
          <text class="score">{{ guestScore }}</text>
          <text class="team-name">{{ guestName }}</text>
        </view>
        <view class="top-right">
          <text class="sync">待同步 {{ syncNum }}</text>
          <battery-view :power="battery" />
        </view>
      </view>
    </view>

    <!-- 副顶栏：比赛阶段 + 暂停 + 犯规 -->
    <view class="sub-bar">
      <view class="sub-side">
        <text class="sub-tag pause">暂停{{ hostPause }}</text>
        <text class="sub-tag foul" :class="{ danger: hostFoul > 4 }">犯规{{ hostFoul }}</text>
      </view>
      <view class="section-btn" @click="showSection = true">{{ currentSectionName }} ▾</view>
      <view class="sub-side right">
        <text class="sub-tag foul" :class="{ danger: guestFoul > 4 }">犯规{{ guestFoul }}</text>
        <text class="sub-tag pause">暂停{{ guestPause }}</text>
      </view>
    </view>

    <!-- 中部栏：球员选择（主客并排，各自滚动） -->
    <view class="mid">
      <view class="team-col">
        <view class="col-head">{{ homeName }}</view>
        <view class="player-list"> <!-- class="player-list" -->
          <view
            v-for="m in hostMembers"
            :key="m.team_member_id"
			class="person-card"
			:class="{ sel: selectedId === m.team_member_id && selectedTeam === 'host'}"
            @click="selectPlayer('host', m)"
          >
            <view class="person-ball" style="background-color:#1D9DE8">
            	<text class="num">{{ m.number }}</text>
            </view>
            <text class="name">{{ m.name }}</text>
			<!-- 犯规次数 -->
            <!-- <text v-if="m.foul > 0" class="foul-c" :class="{ red: m.foul >= 5, yellow: m.foul === 4 }">{{ m.foul }}</text> -->
          </view>
        </view>
      </view>
	  
      <view class="team-col" style="border-left: 1rpx solid black;">
        <view class="col-head">{{ guestName }}</view>
        <view class="player-list">  <!-- class="player-list" -->
          <view
            v-for="m in guestMembers"
            :key="m.team_member_id"
			class="person-card"
			:class="{ sel: selectedId === m.team_member_id && selectedTeam === 'guest'}"
            @click="selectPlayer('guest', m)"
          >
			<view class="person-ball">
				<text class="num">{{ m.number }}</text>
			</view>
            
            <text class="name">{{ m.name }}</text>
			<!-- 犯规次数 -->
            <!-- <text v-if="m.foul > 0" class="foul-c" :class="{ red: m.foul >= 5, yellow: m.foul === 4 }">{{ m.foul }}</text> -->
          </view>
        </view>
      </view>
    </view>

    <!-- 底栏：选择具体操作 -->
    <view class="bottom-bar">
      <scroll-view scroll-y class="action-scroll">
        <view class="action-grid">
          <view
            v-for="a in quickActions"
            :key="a.type"
            class="action-btn"
            :class="a.color"
            @click="onQuickAction(a)"
          >
            <p>{{ a.desc }}</p>
          </view>
        </view>
      </scroll-view>
      <view class="bottom-btns">
        <view class="r-btn orange" @click="showChange = true">换人</view>
        <view class="r-btn gray" @click="showRecord = true">记录</view>
      </view>
    </view>

    <change-member-dialog :show="showChange" :members="currentMembers" @confirm="onChange" @close="showChange = false" />
    <section-dialog :show="showSection" sport="basketball" @select="onSection" @close="showSection = false" />

    <!-- 记录列表弹层（点底栏「记录」展开，可删除） -->
    <view v-if="showRecord" class="record-mask" @click="showRecord = false">
      <view class="record-panel" @click.stop>
        <view class="record-head">比赛记录</view>
        <scroll-view scroll-y class="record-scroll">
          <view v-for="r in records" :key="r.record_number" class="record-item">
            <text class="r-team">{{ r.team_name }}</text>
            <text class="r-desc">{{ r.description }}</text>
            <text class="r-del" @click="onDelete(r)">删除</text>
          </view>
          <view v-if="!records.length" class="record-empty">暂无记录</view>
        </scroll-view>
        <view class="record-close" @click="showRecord = false">关闭</view>
      </view>
    </view>

    <!-- 开场球权遮罩（对应 qiuquan_layout） -->
    <view v-if="showKickoff" class="kickoff-mask">
      <view class="kickoff-tip">选择开场球权</view>
      <view class="kickoff-teams">
        <view class="kickoff-ball" @click="onKickoff(1)">{{ homeName }}</view>
        <view class="kickoff-ball" @click="onKickoff(0)">{{ guestName }}</view>
      </view>
    </view>
  </view>
</template>

<script setup>
/**
 * 篮球技术统计（对应 Statidtics1Activity，横屏，离线优先）
 * - 球员/小节从本地 db 读取
 * - 点动作写 technical_record(is_need_upload=0)，2s 队列上传 statistics/add
 * - 比分/犯规/暂停从已有记录聚合
 * - 换人(13/14)、小节开始/结束(16/15)、删除(cancel + 本地标记)
 * - 布局：上下四栏（顶栏比分球队名 / 副顶栏阶段暂停犯规 / 中部球员 / 底栏动作）
 */
import { ref, computed, onUnmounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import batteryView from '@/components/battery-view/battery-view.vue'
import changeMemberDialog from '@/components/change-member-dialog/change-member-dialog.vue'
import sectionDialog from '@/components/section-dialog/section-dialog.vue'
import { queryList, insertOrReplace, executeSQL, selectSQL } from '@/utils/db'
import { startUploadQueue, stopUploadQueue, pendingCount } from '@/utils/upload-queue'
import { cancelData } from '@/api/statistics'
import { BasketActions, BasketType, scoreOf, isFoul } from '@/utils/stat-types'

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
const currentSectionName = ref('第1节')
const selectedTeam = ref('')
const selectedId = ref('')
const selectedMember = ref(null)
const hostScore = ref(0)
const guestScore = ref(0)
const hostFoul = ref(0)
const guestFoul = ref(0)
const hostPause = ref(0)
const guestPause = ref(0)
const records = ref([])
const battery = ref(100)
const syncNum = ref(0)
const showChange = ref(false)
const showSection = ref(false)
const showKickoff = ref(false)
const showRecord = ref(false)

const quickActions = BasketActions
const currentMembers = computed(() => (selectedTeam.value === 'host' ? hostMembers.value : guestMembers.value))

onLoad((opt) => {
  gameId.value = opt.gameId || ''
  homeName.value = opt.homeName || '主队'
  guestName.value = opt.guestName || '客队'
  // 球员 + 小节就绪后再算统计（全队犯规依赖当前节）
  Promise.all([loadMembers(), loadSections()]).then(() => {
    loadStats()
    checkKickoff()
  })
  loadRecords()
  startUploadQueue(gameId.value, () => {
    loadRecords()
    updateSyncNum()
  })
  updateSyncNum()
})

onUnmounted(() => stopUploadQueue())

/** 在场靠前，号码升序（对应 Playing desc, Number asc） */
function sortMembers(list) {
  return list.sort((a, b) => (Number(b.playing) || 0) - (Number(a.playing) || 0) || (a.number - b.number))
}
function loadMembers() {
  return queryList('member', `game_id='${gameId.value}'`).then((list) => {
    const init = list.map((m) => {
      const hasVal = m.playing !== null && m.playing !== undefined && m.playing !== ''
      const playing = hasVal ? Number(m.playing) : (Number(m.startingLineup) ? 1 : 0)
      if (!hasVal) {
        executeSQL(`UPDATE member SET playing=${playing} WHERE team_member_id='${m.team_member_id}'`)
      }
      return { ...m, foul: 0, playing }
    })
    hostMembers.value = sortMembers(init.filter((m) => m.type === 1))
    guestMembers.value = sortMembers(init.filter((m) => m.type === 0))
  })
}

function loadSections() {
  return queryList('game_section', `game_id='${gameId.value}'`, 'sort ASC').then((list) => {
    sections.value = list
    if (list.length) {
      currentSectionIdx.value = 0
      currentSection.value = list[0].section_id
      currentSectionName.value = list[0].name
    }
  })
}

function loadRecords() {
  selectSQL(
    `SELECT * FROM technical_record WHERE game_id='${gameId.value}' AND disable=0 AND "delete"=1 ORDER BY record_number DESC LIMIT 30`
  ).then((list) => {
    records.value = list
  })
}

/** 比分/暂停/球员个人犯规按全场，全队犯规按当前节（对应 getCurrentFoulAndStop 按 statisticsSectionId 过滤） */
function loadStats() {
  selectSQL(
    `SELECT * FROM technical_record WHERE game_id='${gameId.value}' AND disable=0 AND "delete"=1`
  ).then((list) => {
    let hs = 0, gs = 0, hf = 0, gf = 0, hp = 0, gp = 0
    const foulMap = {}
    const sec = currentSection.value
    list.forEach((r) => {
      const sc = scoreOf(r.type, 'basketball')
      const fl = isFoul(r.type, 'basketball')
      const inSec = r.statistics_section_id === sec
      if (r.team_type === 1) {
        hs += sc
        if (fl && inSec) hf++
        if (r.type === 5) hp++
      } else {
        gs += sc
        if (fl && inSec) gf++
        if (r.type === 5) gp++
      }
      if (fl && r.statistics_member_id) foulMap[r.statistics_member_id] = (foulMap[r.statistics_member_id] || 0) + 1
    })
    hostScore.value = hs
    guestScore.value = gs
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

function selectPlayer(team, m) {
  selectedTeam.value = team
  selectedId.value = m.team_member_id
  selectedMember.value = m
}

function onQuickAction(a) {
  doAction(a)
}

function doAction(a) {
  if (!selectedMember.value) {
    uni.showToast({ title: '请先选择球员', icon: 'none' })
    return
  }
  const team = selectedTeam.value
  const member = selectedMember.value
  const teamName = team === 'host' ? homeName.value : guestName.value
  const teamType = team === 'host' ? 1 : 0
  const recordNumber = Date.now()
  const description = `${member.name} ${a.desc}`

  insertOrReplace('technical_record', {
    record_number: recordNumber,
    elapsed_time: 0,
    statistics_section_id: currentSection.value,
    type: a.type,
    statistics_member_id: member.team_member_id,
    description,
    game_id: gameId.value,
    team_type: teamType,
    team_name: teamName,
    add: 0,
    delete: 1,
    is_need_upload: 0,
    disable: 0
  })

  // 即时更新比分/犯规/暂停
  const sc = scoreOf(a.type, 'basketball')
  if (sc > 0) {
    if (team === 'host') hostScore.value += sc
    else guestScore.value += sc
  }
  if (isFoul(a.type, 'basketball')) {
    if (team === 'host') hostFoul.value++
    else guestFoul.value++
    member.foul = (member.foul || 0) + 1
    if (member.foul >= 5) {
      uni.showToast({ title: '该队员犯规已达5次或以上', icon: 'none' })
    }
  }
  if (a.type === BasketType.PAUSE) {
    if (team === 'host') hostPause.value++
    else guestPause.value++
  }
  loadRecords()
  updateSyncNum()
}

function onDelete(r) {
  cancelData({
    gameId: gameId.value,
    recordNumber: r.record_number,
    statisticsMemberId: r.statistics_member_id
  }).then((res) => {
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
  insertOrReplace('technical_record', {
    record_number: base, elapsed_time: 0, statistics_section_id: currentSection.value, type: 13,
    statistics_member_id: offId, description: `${offMember ? offMember.name : ''} 换下`,
    game_id: gameId.value, team_type: teamType, team_name: teamName, add: 0, delete: 1, is_need_upload: 0, disable: 0
  })
  insertOrReplace('technical_record', {
    record_number: base + 1, elapsed_time: 0, statistics_section_id: currentSection.value, type: 14,
    statistics_member_id: onId, description: `${onMember ? onMember.name : ''} 换上`,
    game_id: gameId.value, team_type: teamType, team_name: teamName, add: 0, delete: 1, is_need_upload: 0, disable: 0
  })
  // 回写 playing 状态并重排（对应 Member.playing 落库 + Playing desc 排序）
  executeSQL(`UPDATE member SET playing=0 WHERE team_member_id='${offId}'`)
  executeSQL(`UPDATE member SET playing=1 WHERE team_member_id='${onId}'`)
  if (offMember) offMember.playing = 0
  if (onMember) onMember.playing = 1
  if (team === 'host') hostMembers.value = sortMembers([...hostMembers.value])
  else guestMembers.value = sortMembers([...guestMembers.value])
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
  if (t === 'start') insertSectionRecord(BasketType.SECTION_START)
  if (t === 'end') insertSectionRecord(BasketType.SECTION_END)
  // 全队犯规按当前节，切换后重算
  loadStats()
}

function insertSectionRecord(type) {
  insertOrReplace('technical_record', {
    record_number: Date.now(), elapsed_time: 0, statistics_section_id: currentSection.value, type,
    statistics_member_id: '', description: type === 16 ? '小节开始' : '小节结束',
    game_id: gameId.value, team_type: 0, team_name: '', add: 0, delete: 1, is_need_upload: 0, disable: 0
  })
  loadRecords()
  updateSyncNum()
}

/** 开场球权选择（对应 qiuquan_layout：未开赛时强制选球权，选后插 type16 + 标记 isStart） */
function checkKickoff() {
  const sec = sections.value[currentSectionIdx.value]
  showKickoff.value = !!(sec && !Number(sec.isStart))
}
function onKickoff(teamType) {
  const teamName = teamType === 1 ? homeName.value : guestName.value
  insertOrReplace('technical_record', {
    record_number: Date.now(), elapsed_time: 0, statistics_section_id: currentSection.value, type: 16,
    statistics_member_id: '', description: `${teamName}球权`,
    game_id: gameId.value, team_type: teamType, team_name: teamName, add: 0, delete: 1, is_need_upload: 0, disable: 0
  })
  executeSQL(`UPDATE game_section SET isStart=1 WHERE section_id='${currentSection.value}'`)
  if (sections.value[currentSectionIdx.value]) sections.value[currentSectionIdx.value].isStart = 1
  showKickoff.value = false
  loadRecords()
  updateSyncNum()
}

function back() {
  uni.navigateBack()
}
</script>

<style lang="scss" scoped>
.basket-operate {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f8f8f8;
}

/* 顶栏：比分 + 球队名 */
.top-bar {
  background-color: #ffffff;
}
.nav-status {
  background-color: #ffffff;
}
.top-bar-inner {
  position: relative;
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20rpx;
}
.top-right {
  display: flex;
  align-items: center;
  gap: 10rpx;
}
.back {
  width: 60rpx;
  display: flex;
  align-items: center;
}
.back-icon {
  width: 40rpx;
  height: 40rpx;
}
.score-area {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20rpx;
  pointer-events: none;
}
.team-name {
  font-size: 28rpx;
  color: #141a66;
  font-weight: bold;
}
.score {
  font-size: 48rpx;
  font-weight: bold;
  color: #2f7ed8;
}
.colon {
  font-size: 36rpx;
  color: #999999;
}

/* 副顶栏：主队暂停犯规 | 比赛阶段居中 | 客队犯规暂停 */
.sub-bar {
  display: flex;
  align-items: center;
  padding: 10rpx 20rpx;
  background-color: #ffffff;
  border-bottom: 1rpx solid #eeeeee;
}
.sub-side {
  flex: 1;
  display: flex;
  gap: 12rpx;
}
.sub-side.right {
  justify-content: flex-end;
}
.section-btn {
  font-size: 26rpx;
  padding: 6rpx 20rpx;
  background-color: #29a871;
  color: #ffffff;
  border-radius: 6rpx;
}
.sub-tag {
  font-size: 22rpx;
  padding: 4rpx 14rpx;
  border-radius: 4rpx;
  color: #ffffff;
}
.sub-tag.pause {
  background-color: #009de9;
}
.sub-tag.foul {
  background-color: #999999;
}
.sub-tag.foul.danger {
  background-color: #ff2d2d;
}
.sync {
  font-size: 22rpx;
  color: #999999;
}

/* 中部栏：球员选择（主客并排，各自滚动） */
.mid {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: row;
}
.team-col {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: #ffffff;
  border-right: 1rpx solid #eeeeee;
  height: 500rpx;
}
.team-col:last-child {
  border-right: none;
}

.person-card{
	width: 140rpx; 
	height:80rpx;
	padding:10rpx;
	margin:10rpx;
	background-color: #FFFFFF; 
	display: flex;
	flex-direction: column;
	justify-content: center; 
	align-items: center;
}

.person-ball{
	width: 12rpx; 
	height:12rpx; 
	padding:18rpx;
	border-radius: 50%;
	background-color: red;
	display: flex;
	justify-content: center;
	align-items: center;
	margin-bottom: 5rpx;
}

.sel{
	background-color: #E1F3E4;
}


.col-head {
  text-align: center;
  font-size: 24rpx;
  color: #29a871;
  padding: 10rpx 0;
  border-bottom: 1rpx solid #f2f2f2;
}
// .player-list {
//   flex: 1;
//   min-height: 0;
// }
.player-list{
	height:50vh; 
	background-color: #F8F8F8; 
	display: flex;
	flex-wrap: wrap; 
	justify-content: space-around;
}


.player {
  display: flex;
  align-items: center;
  padding: 14rpx 20rpx;
  border-bottom: 1rpx solid #f2f2f2;
}
// .player.sel {
//   background-color: #e8f7ee;
// }
.player.playing {
  border-left: 6rpx solid #29a871;
}
.num {
  width: 60rpx;
  font-size: 26rpx;
  color: white;
  // font-weight: bold;
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
.foul-c.yellow {
  color: #f5a623;
}

/* 底栏：选择具体操作 */
.bottom-bar {
  background-color: #ffffff;
  border-top: 1rpx solid #eeeeee;
  padding: 12rpx 20rpx;
  max-height: 40vh;
  min-height: 0;
  display: flex;
  flex-direction: column;
  position: absolute;
  bottom:10rpx;
}
.action-scroll {
  flex: 1;
  min-height: 0;
  margin-bottom: 10rpx;
}
.action-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 10rpx;
}
.action-btn {
  flex: 0 0 calc((100% - 20rpx) / 3);
  height: 80rpx;
  line-height: 52rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6rpx;
  font-size: 30rpx;
  color: #ffffff;
}
.action-btn.green {
  background-color: #48ADB3;
}
.action-btn.red {
  background-color: #ff2d2d;
}
.action-btn.blue {
  background-color: #009de9;
}
.bottom-btns {
  display: flex;
  gap: 12rpx;
}
.r-btn {
  flex: 1;
  height: 50rpx;
  line-height: 50rpx;
  text-align: center;
  border-radius: 6rpx;
  font-size: 24rpx;
  color: #ffffff;
}
.r-btn.orange {
  background-color: #ff6f21;
}
.r-btn.gray {
  background-color: #888888;
}

/* 记录列表弹层 */
.record-mask {
  position: fixed;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}
.record-panel {
  width: 70%;
  max-height: 70%;
  background-color: #ffffff;
  border-radius: 12rpx;
  display: flex;
  flex-direction: column;
}
.record-head {
  padding: 20rpx;
  text-align: center;
  font-size: 28rpx;
  border-bottom: 1rpx solid #eeeeee;
}
.record-scroll {
  flex: 1;
  min-height: 0;
}
.record-item {
  display: flex;
  align-items: center;
  padding: 16rpx 20rpx;
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
.record-empty {
  padding: 40rpx;
  text-align: center;
  font-size: 24rpx;
  color: #999999;
}
.record-close {
  padding: 20rpx;
  text-align: center;
  font-size: 26rpx;
  color: #009de9;
  border-top: 1rpx solid #eeeeee;
}

/* 开场球权遮罩 */
.kickoff-mask {
  position: fixed;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 999;
}
.kickoff-tip {
  color: #ffffff;
  font-size: 32rpx;
  margin-bottom: 40rpx;
}
.kickoff-teams {
  display: flex;
  gap: 80rpx;
}
.kickoff-ball {
  width: 200rpx;
  height: 200rpx;
  border-radius: 100rpx;
  background-color: #29a871;
  color: #ffffff;
  font-size: 30rpx;
  line-height: 200rpx;
  text-align: center;
}
</style>
