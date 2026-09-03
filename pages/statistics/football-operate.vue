<template>
  <view class="foot-operate">
    <!-- 状态栏占位：为手机时间/电量栏留出位置 -->
    <view class="nav-status" :style="{ height: statusBarHeight + 'px' }"></view>
    <!-- 标题栏：足球技术台 -->
    <view class="title-bar">
      <view class="tb-back" @click="back">
        <image class="tb-back-icon" src="/static/mipmap-xxhdpi/black_back.png" mode="aspectFit" />
      </view>
      <text class="title-text">足球技术台</text>
    </view>
    <!-- 顶栏：左红(主队名) | 中白(比分) | 右蓝(客队名)，白块在文档流居中，不遮盖队名 -->
    <view class="top-bar2">
      <view class="tb-half red">
        <text class="tb-name">{{ homeName }}</text>
      </view>
      <view class="tb-score">
        <text class="score">{{ hostScore }}</text>
        <text class="score">:</text>
        <text class="score">{{ guestScore }}</text>
      </view>
      <view class="tb-half red tb-stuff"/>
      <view class="tb-half blue tb-stuff"/>
      <view class="tb-half blue">
        <text class="tb-name">{{ guestName }}</text>
      </view>
    </view>

    <!-- 副顶栏：主队犯规 | 比赛阶段+计时器居中 | 客队犯规 -->
    <view class="sub-bar">
      <view class="sub-side">
        <text class="sub-tag foul" :class="{ danger: hostFoul > 4 }">犯规{{ hostFoul }}</text>
      </view>
      <view class="sub-center">
        <view class="section-btn" @click="showSection = true">{{ currentSectionName }} ▾</view>
        <view class="timer-box">
          <text class="timer">{{ timerStr }}</text>
          <text class="t-btn" @click="toggleTimer">{{ timerRunning ? '暂停' : '开始' }}</text>
          <text class="t-btn" @click="editTimer">改时间</text>
        </view>
      </view>
      <view class="sub-side right">
        <text class="sub-tag foul" :class="{ danger: guestFoul > 4 }">犯规{{ guestFoul }}</text>
      </view>
    </view>

    <!-- 中部栏：球员选择（主客并排，卡片网格） -->
    <view class="mid">
      <view class="team-col">
        <view class="col-head">{{ homeName }}</view>
        <view class="player-list">
          <view
            v-for="m in hostMembers"
            :key="m.team_member_id"
            class="person-card"
            :class="{ sel: selectedId === m.team_member_id && selectedTeam === 'host' }"
            @click="selectPlayer('host', m)"
          >
            <view class="person-foul" :class="{ red: m.foul > 4, yellow: m.foul === 4 }"></view>
            <p class="foul-times">{{ m.foul }}</p>
            <view class="person-ball ball-host">
              <text class="num">{{ m.number }}</text>
            </view>
            <text class="name">{{ m.name }}</text>
            <!-- 犯规次数 -->
            <!-- <text v-if="m.foul > 0" class="foul-c" :class="{ red: m.foul >= 5 }">{{ m.foul }}</text> -->
          </view>
        </view>
      </view>

      <view class="team-col">
        <view class="col-head">{{ guestName }}</view>
        <view class="player-list">
          <view
            v-for="m in guestMembers"
            :key="m.team_member_id"
            class="person-card"
            :class="{ sel: selectedId === m.team_member_id && selectedTeam === 'guest' }"
            @click="selectPlayer('guest', m)"
          >
            <view class="person-foul" :class="{ red: m.foul > 4, yellow: m.foul === 4 }"></view>
            <p class="foul-times">{{ m.foul }}</p>
            <view class="person-ball">
              <text class="num">{{ m.number }}</text>
            </view>
            <text class="name">{{ m.name }}</text>
            <!-- 犯规次数 -->
            <!-- <text v-if="m.foul > 0" class="foul-c" :class="{ red: m.foul >= 5 }">{{ m.foul }}</text> -->
          </view>
        </view>
      </view>
    </view>

    <!-- 底栏：选择具体操作 -->
    <view class="bottom-bar">
      <scroll-view scroll-y class="action-scroll">
        <view class="action-grid">
          <view
            v-for="a in footActions"
            :key="a.type"
            class="action-btn"
            :class="a.color"
            @click="onAction(a)"
          >
            <p>{{ a.desc }}</p>
          </view>
        </view>
      </scroll-view>
      <view class="bottom-btns">
        <view class="r-btn orange" @click="showChange = true"> <p>换人</p> </view>
        <view class="r-btn gray" @click="showRecord = true"> <p>记录</p> </view>
      </view>
    </view>

    <change-member-dialog :show="showChange" :members="currentMembers" @confirm="onChange" @close="showChange = false" />
    <section-dialog :show="showSection" sport="football" @select="onSection" @close="showSection = false" />

    <!-- 记录页面（点「记录」弹出，样式参考原生 OperationRecordActivity：白底标题栏 + 阴影 + 列表） -->
    <view v-if="showRecord" class="record-page">
      <view class="rp-status" :style="{ height: statusBarHeight + 'px' }"></view>
      <view class="rp-top">
        <view class="rp-back" @click="showRecord = false">
          <image class="rp-back-icon" src="/static/mipmap-xxhdpi/black_back.png" mode="aspectFit" />
        </view>
        <text class="rp-title">操作记录</text>
        <view class="rp-back rp-back-holder"></view>
      </view>
      <scroll-view scroll-y class="rp-list">
        <view v-for="r in records" :key="r.recordNumber" class="rp-item">
          <view class="rp-info">
            <view class="rp-row">
              <text class="rp-text rp-team">{{ r.teamName }}</text>
            </view>
            <view class="rp-row rp-row2">
              <text class="rp-text rp-member">{{ r.memberName }}</text>
            </view>
          </view>
          <view class="rp-side">
            <text class="rp-text rp-type">{{ r.type ? r.type.desc : '' }}</text>
            <image class="rp-del" src="/static/mipmap-xxhdpi/delete_record.png" mode="aspectFit" @click="onDelete(r)" />
          </view>
        </view>
        <view v-if="!records.length" class="rp-empty">暂无记录</view>
      </scroll-view>
    </view>
  </view>
</template>

<script setup>
/**
 * 足球技术统计（对应 StatidticsFootActivity，横屏，直连服务器）
 * - 进页拼 getGameFootDetail(队名/比分/犯规/teamId) + getMember×2 + getSectionList
 * - 点动作 uploadData(statistics/add)，payload 多 elapsedTime（无 host_guest/index）
 * - 换人(13/14)：先传下场成功后传上场；小节开始/结束(16/15)、上一/下一半场 sectionRunning
 * - 比赛计时器（开始/暂停/改时分秒），计时存 SP（对应 MyPrefsFile/gameId=MM:SS）
 * - 布局：上下四栏（顶栏比分球队名 / 副顶栏阶段计时器犯规 / 中部球员 / 底栏动作）
 */
import { ref, computed, onUnmounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import changeMemberDialog from '@/components/change-member-dialog/change-member-dialog.vue'
import sectionDialog from '@/components/section-dialog/section-dialog.vue'
import { getGameFootDetail, getMember, getSectionList } from '@/api/game'
import { uploadData, sectionRunning, cancelData, statisticsPage } from '@/api/statistics'
import { FootActions, scoreOf, isFoul } from '@/utils/stat-types'
import { msToMMSS } from '@/utils/time'

// 状态栏高度（custom 导航页需自行留出状态栏空间，避免与系统状态栏重叠）
const statusBarHeight = uni.getSystemInfoSync().statusBarHeight || 0

const gameId = ref('')
const homeName = ref('主队')
const guestName = ref('客队')
const hostGameTeamId = ref('')
const guestGameTeamId = ref('')
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
// 副顶栏「犯规」= 该队球员个人犯规之和（与球员角标同源，保证总和一致，不再用服务端 hostTeamFoul）
const hostFoul = computed(() => hostMembers.value.reduce((s, m) => s + (m.foul || 0), 0))
const guestFoul = computed(() => guestMembers.value.reduce((s, m) => s + (m.foul || 0), 0))
const records = ref([])
const showChange = ref(false)
const showSection = ref(false)
const showRecord = ref(false)

const footActions = FootActions
const currentMembers = computed(() => (selectedTeam.value === 'host' ? hostMembers.value : guestMembers.value))

// 比赛计时器（对应 Timeutils + SP 缓存）
const timerStr = ref('00:00')
const timerRunning = ref(false)
let timerSeconds = 0
let timerInterval = null

onLoad((opt) => {
  gameId.value = opt.gameId || ''
  loadData()
  loadRecords()
  loadTimer()
})

onUnmounted(() => {
  stopTimer()
})

/** 服务端 MemberData -> 本地 snake_case 形状（模板/换人弹窗依赖 team_member_id + playing 数字） */
function adaptMember(m) {
  return {
    team_member_id: m.teamMemberId,
    number: m.number,
    name: m.name,
    playing: m.playing && m.playing.boolean ? 1 : 0,
    startingLineup: m.startingLineup && m.startingLineup.boolean ? 1 : 0,
    foul: 0
  }
}

/** 在场靠前，号码升序 */
function sortMembers(list) {
  return list.sort((a, b) => (Number(b.playing) || 0) - (Number(a.playing) || 0) || (a.number - b.number))
}

/** 进页拉全量：比赛详情(队名/比分/犯规/teamId) + 成员 + 小节 */
function loadData() {
  if (!gameId.value) return
  getGameFootDetail(gameId.value).then((res) => {
    if (res.code !== 1) return
    const d = res.data || {}
    homeName.value = d.hostTeamName || homeName.value
    guestName.value = d.guestTeamName || guestName.value
    hostScore.value = d.hostTeamScore || 0
    guestScore.value = d.guestTeamScore || 0
    hostGameTeamId.value = d.hostGameTeamId || ''
    guestGameTeamId.value = d.guestGameTeamId || ''
    loadMembers()
    loadSections()
  })
}

/** 只刷新比赛详情（队名/比分/犯规），不重拉成员/小节（删除后回退比分犯规用） */
function refreshDetail() {
  if (!gameId.value) return
  getGameFootDetail(gameId.value).then((res) => {
    if (res.code !== 1) return
    const d = res.data || {}
    homeName.value = d.hostTeamName || homeName.value
    guestName.value = d.guestTeamName || guestName.value
    hostScore.value = d.hostTeamScore || 0
    guestScore.value = d.guestTeamScore || 0
  })
}

function loadMembers() {
  const jobs = []
  if (hostGameTeamId.value) {
    jobs.push(getMember(hostGameTeamId.value).then((res) => {
      if (res.code === 1) hostMembers.value = sortMembers((res.data || []).map(adaptMember))
    }))
  }
  if (guestGameTeamId.value) {
    jobs.push(getMember(guestGameTeamId.value).then((res) => {
      if (res.code === 1) guestMembers.value = sortMembers((res.data || []).map(adaptMember))
    }))
  }
  // 成员就绪后重算一次个人犯规（与 loadRecords 里的 computeFouls 幂等，谁后到谁为准）
  Promise.all(jobs).then(() => computeFouls())
}
function loadSections() {
  getSectionList(gameId.value).then((res) => {
    if (res.code !== 1) return
    const list = res.data || []
    sections.value = list
    if (list.length) {
      currentSection.value = list[0].id
      currentSectionName.value = list[0].name
      currentSectionIdx.value = 0
    }
  })
}
function loadRecords() {
  statisticsPage(gameId.value, 1, 1).then((res) => {
    if (res.code === 1) {
      const d = res.data || {}
      records.value = (d.list || []).slice().sort((a, b) => {
        const na = Number(a.recordNumber)
        const nb = Number(b.recordNumber)
        if (!isNaN(na) && !isNaN(nb)) return nb - na
        return String(b.recordNumber).localeCompare(String(a.recordNumber))
      })
      computeFouls()
    }
  })
}

/** 个人犯规：从记录列表按 statisticsMemberId 累加（足球 member 接口无 foul 字段，本地统计） */
function computeFouls() {
  hostMembers.value.forEach((m) => (m.foul = 0))
  guestMembers.value.forEach((m) => (m.foul = 0))
  records.value.forEach((r) => {
    const t = r.type && r.type.value
    if (!isFoul(t, 'football')) return
    const id = r.statisticsMemberId
    let m = hostMembers.value.find((x) => x.team_member_id === id)
    if (!m) m = guestMembers.value.find((x) => x.team_member_id === id)
    if (m) m.foul++
  })
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
  uploadData({
    description: `${member.name} ${a.desc}`,
    recordNumber: Date.now(),
    statisticsMemberId: member.team_member_id,
    statisticsSectionId: currentSection.value,
    type: a.type,
    elapsedTime: timerSeconds
  }).then((res) => {
    if (res.code === 1) {
      const sc = scoreOf(a.type, 'football')
      if (sc > 0) {
        if (team === 'host') hostScore.value += sc
        else guestScore.value += sc
      }
      if (isFoul(a.type, 'football')) {
        member.foul = (member.foul || 0) + 1
      }
      loadRecords()
    }
  })
}

function onDelete(r) {
  const v = r.type && r.type.value
  // 换人(13/14)、小节开始/结束(15/16)不支持删除（对应原生）
  if (v === 13 || v === 14 || v === 15 || v === 16) {
    uni.showToast({ title: '该操作不支持删除', icon: 'none' })
    return
  }
  uni.showModal({
    title: '提示',
    content: '是否删除此条数据..',
    success: (res) => {
      if (!res.confirm) return
      cancelData({ gameId: gameId.value, recordNumber: r.recordNumber, statisticsMemberId: r.statisticsMemberId }).then((res2) => {
        if (res2.code === 1) {
          refreshDetail()
          loadRecords()
        }
      })
    }
  })
}

function onChange({ offId, onId }) {
  const base = Date.now()
  uploadData({
    description: '换下', recordNumber: base, statisticsMemberId: offId,
    statisticsSectionId: currentSection.value, type: 13, elapsedTime: timerSeconds
  }).then((res) => {
    if (res.code === 1) {
      return uploadData({
        description: '换上', recordNumber: base + 1, statisticsMemberId: onId,
        statisticsSectionId: currentSection.value, type: 14, elapsedTime: timerSeconds
      })
    }
  }).then((res) => {
    if (res && res.code === 1) loadRecords()
  })
}

function onSection(t) {
  // 半场开始/结束：uploadData type 16/15（对应原生足球 next_section_bt 的小节结束/开始）
  if (t === 'start') { insertSectionRecord(16); return }
  if (t === 'end') { insertSectionRecord(15); return }
  // 上一/下一半场：本地切 index 后 sectionRunning(目标小节)
  if (t === 'prev' && currentSectionIdx.value > 0) currentSectionIdx.value--
  if (t === 'next' && currentSectionIdx.value < sections.value.length - 1) currentSectionIdx.value++
  const sec = sections.value[currentSectionIdx.value]
  if (sec) {
    currentSection.value = sec.id
    currentSectionName.value = sec.name
  }
  sectionRunning(currentSection.value).then((res) => {
    if (res.code === 1) loadRecords()
  })
}

function insertSectionRecord(type) {
  uploadData({
    description: type === 16 ? '小节开始' : '小节结束',
    recordNumber: Date.now(),
    statisticsMemberId: -1,
    statisticsSectionId: currentSection.value,
    type,
    elapsedTime: timerSeconds
  }).then((res) => {
    if (res.code === 1) loadRecords()
  })
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

/* 标题栏：足球技术台 */
.title-bar {
  position: relative;
  width: 100%;
  background-color: #ffffff;
  text-align: center;
  padding: 24rpx 0;
}
.tb-back {
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 96rpx;
  height: 96rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}
.tb-back-icon {
  width: 120rpx;
  height: 120rpx;
}
.title-text {
  display: block;
  font-size: 34rpx;
  font-weight: bold;
  color: #000000;
}

/* 顶栏：左红 | 中白比分 | 右蓝，三栏 flex，白块在文档流里居中、天然隔开队名不遮盖 */
.top-bar2 {
  width: 100vw;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.tb-half {
  padding: 30rpx 20rpx;
  box-sizing: border-box;
}
.tb-half.red {
  width: 290rpx;
  background-color: #F3584E;
}
.tb-half.blue {
  width: 290rpx;
  background-color: #009DE9;
  text-align: right;
}
.tb-stuff {
  flex: 1;
  height: 100%;
}
.nav-status {
  background-color: #ffffff;
}
.tb-name {
  color: #ffffff;
  font-size: 27rpx;
}
.tb-score {
  background-color: #ffffff;
  padding: 15rpx 50rpx;
  display: flex;
  align-items: center;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
}
.score {
  font-size: 40rpx;
  // font-weight: bold;
  color: black;
}

/* 副顶栏：主队犯规 | 比赛阶段+计时器居中 | 客队犯规 */
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
.sub-center {
  display: flex;
  align-items: center;
  gap: 16rpx;
}
.section-btn {
  font-size: 26rpx;
  padding: 6rpx 20rpx;
  background-color: #29a871;
  color: #ffffff;
  border-radius: 6rpx;
}
.timer-box {
  display: flex;
  align-items: center;
  gap: 8rpx;
}
.timer {
  font-size: 28rpx;
  color: #ff6f21;
  font-weight: bold;
}
.t-btn {
  font-size: 22rpx;
  padding: 4rpx 12rpx;
  background-color: #29a871;
  border-radius: 4rpx;
  color: #ffffff;
}
.sub-tag {
  font-size: 22rpx;
  padding: 4rpx 14rpx;
  border-radius: 4rpx;
  color: #ffffff;
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

/* 中部栏：球员选择（主客并排，卡片网格） */
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
  /* 客队列左侧分割线（原内联样式） */
  border-left: 1rpx solid black;
}

.person-card {
  width: 140rpx;
  height: 80rpx;
  padding: 10rpx;
  margin: 10rpx;
  background-color: #FFFFFF;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: relative;
  overflow: hidden;
}

.person-foul {
  padding: 22rpx;
  background-color: #787878;
  position: absolute;
  border-radius: 50%;
  left: 0;
  top: 0;
  transform: translateX(-40%) translateY(-40%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  font-size: 20rpx;
  line-height: 1;
}
.person-foul.red {
  background-color: #ff2d2d;
}
.person-foul.yellow {
  background-color: #f5a623;
}

.foul-times {
  position: absolute;
  color: white;
  font-size: 20rpx;
  top: 1%;
  left: 4%;
}

.person-ball {
  width: 12rpx;
  height: 12rpx;
  padding: 18rpx;
  border-radius: 50%;
  background-color: red;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 5rpx;
}
/* 主队号码球底色（原内联样式）：主队蓝、客队沿用基础红 */
.ball-host {
  background-color: #1D9DE8;
}

.sel {
  background-color: #E1F3E4;
}

.col-head {
  text-align: center;
  font-size: 24rpx;
  color: #29a871;
  padding: 10rpx 0;
  border-bottom: 1rpx solid #f2f2f2;
}
.player-list {
  height: 50vh;
  background-color: #F8F8F8;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
}

.num {
  width: 60rpx;
  font-size: 26rpx;
  color: white;
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
  bottom: 10rpx;
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
  height: 80rpx;
  line-height: 50rpx;
  text-align: center;
  border-radius: 6rpx;
  font-size: 30rpx;
  color: #ffffff;
  display: flex;
  justify-content: center;
  align-items: center;
}
.r-btn.orange {
  background-color: #ff6f21;
}
.r-btn.gray {
  background-color: #888888;
}

/* 记录页面（全屏，参考原生 OperationRecordActivity） */
.record-page {
  position: fixed;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  background-color: #ffffff;
  display: flex;
  flex-direction: column;
  z-index: 999;
}
.rp-status {
  background-color: #ffffff;
}
.rp-top {
  position: relative;
  height: 96rpx;
  background-color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 6rpx 6rpx rgba(0, 0, 0, 0.18);
}
.rp-back {
  position: absolute;
  left: 0;
  top: 0;
  width: 96rpx;
  height: 96rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}
.rp-back-holder {
  left: auto;
  right: 0;
}
.rp-back-icon {
  width: 120rpx;
  height: 120rpx;
}
.rp-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #000000;
}
.rp-list {
  flex: 1;
  min-height: 0;
}
.rp-item {
  display: flex;
  align-items: center;
  padding: 20rpx 20rpx;
  border-bottom: 1rpx solid #d9d9d9;
}
.rp-info {
  flex: 1;
  min-width: 0;
}
.rp-row {
  display: flex;
  align-items: center;
}
.rp-row2 {
  margin-top: 8rpx;
}
.rp-text {
  font-size: 28rpx;
  color: #2f7ed8;
}
.rp-team {
  max-width: 240rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.rp-member {
  color: #666666;
}
.rp-side {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-left: 16rpx;
}
.rp-type {
  width: 160rpx;
  text-align: right;
}
.rp-del {
  width: 48rpx;
  height: 48rpx;
  padding: 20rpx;
}
.rp-empty {
  padding: 80rpx 0;
  text-align: center;
  font-size: 26rpx;
  color: #999999;
}
</style>
