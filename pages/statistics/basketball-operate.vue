<template>
  <view class="basket-operate" @click="clearSelection">
    <!-- 顶栏：比分 + 球队名 -->
<!--    <view class="top-bar">
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
    </view> -->
	<!-- 状态栏占位：为手机时间/电量栏留出位置 -->
	<view class="nav-status" :style="{ height: statusBarHeight + 'px' }"></view>

	<!-- 标题栏：篮球技术台 -->
	<view class="title-bar">
		<view class="tb-back" @click="back">
			<image class="tb-back-icon" src="/static/mipmap-xxhdpi/black_back.png" mode="aspectFit" />
		</view>
		<text class="title-text">篮球技术台</text>
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
            @click.stop="selectPlayer('host', m)"
          >
			<view class="person-foul" :class="{ red: m.foul > 4, yellow: m.foul === 4 }"></view>
			<p class="foul-times">{{ m.foul }}</p>
            <view class="person-ball" style="background-color:#F05A4E">
            	<text class="num">{{ m.number }}</text>
            </view>
            <text class="name">{{ m.name }}</text>
			<!-- 犯规次数 -->
            <!-- <text v-if="m.foul > 0" class="foul-c" :class="{ red: m.foul >= 5, yellow: m.foul === 4 }">{{ m.foul }}</text> -->
          </view>
        </view>
      </view>
	  
      <view class="team-col" style="border-left: 1rpx solid rgba(0,0,0,0.1);">
        <view class="col-head">{{ guestName }}</view>
        <view class="player-list">  <!-- class="player-list" -->
          <view
            v-for="m in guestMembers"
            :key="m.team_member_id"
			class="person-card"
			:class="{ sel: selectedId === m.team_member_id && selectedTeam === 'guest'}"
            @click.stop="selectPlayer('guest', m)"
          >
			<view class="person-foul" :class="{ red: m.foul > 4, yellow: m.foul === 4 }"></view>
			<p class="foul-times">{{ m.foul }}</p>
			<view class="person-ball" style="background-color:#1D9DE8">
				<text class="num">{{ m.number }}</text>
			</view>
            
            <text class="name">{{ m.name }}</text>
			<!-- 犯规次数 -->
            <!-- <text v-if="m.foul > 0" class="foul-c" :class="{ red: m.foul >= 5, yellow: m.foul === 4 }">{{ m.foul }}</text> -->
          </view>
        </view>
      </view>
    </view>

    <!-- 页面底部固定「记录」按钮：选中球员弹出底栏时被其覆盖 -->
    <view class="record-float" @click="showRecord = true">
      <text>记录</text>
    </view>

    <!-- 底栏：选择具体操作（选中球员后从底部平移上来，点其它部位收回） -->
    <transition name="slide-up">
      <view v-if="selectedId" class="bottom-bar" @click.stop>
      <scroll-view scroll-y class="action-scroll">
        <!-- 最近一次录入的操作提示（新操作覆盖旧的） -->
        <view v-if="latestRecord" class="record-chip">{{ latestRecord }}</view>
        <view class="action-grid">
          <view
            v-for="a in quickActions"
            :key="a.desc"
            class="action-btn"
            :class="a.color"
            @click="onQuickAction(a)"
          >
            <p>{{ a.desc }}</p>
          </view>
        </view>
      </scroll-view>
      </view>
    </transition>

    <change-member-dialog :show="showChange" :members="currentMembers" @confirm="onChange" @close="showChange = false" />
    <section-dialog :show="showSection" sport="basketball" @select="onSection" @close="showSection = false" />

    <!-- 记录页面（点「记录」弹出，样式参考原生 OperationRecordActivity：深灰标题栏 + 白底蓝字列表） -->
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
        <view v-for="r in records" :key="r.recordNumber || r.id" class="rp-item">
          <view class="rp-info">
            <view class="rp-row">
              <text class="rp-text rp-team">{{ r.teamName }}</text>
              <text class="rp-text rp-time">{{ recordTime(r) }}</text>
            </view>
            <view class="rp-row rp-row2">
              <text class="rp-text rp-section">{{ r.sectionName }}</text>
              <text class="rp-text rp-member">{{ r.memberName }}</text>
            </view>
          </view>
          <view class="rp-side">
            <text class="rp-text rp-type">{{ recordType(r) }}</text>
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
 * 篮球技术统计（横屏操作页，直连服务器）
 * - 进页 getGameBasketballDetail 一次拉全量（game/球员/小节/比分/犯规/暂停）
 * - 点动作 uploadData(statistics/add)，成功后 loadData/loadRecords 刷新
 * - 上报用「比赛时 id」：即 game-detail-basketball 成员行的 id（statisticsMemberId），
 *   命中/犯规/换人等记录均以它上报
 * - 换人(13/14)：先传下场成功后传上场；小节开始/结束(16/15)、上一/下一节 sectionRunning
 * - 删除 cancelData(statistics/cancel)；记录列表 statisticsPage(statistics/page)
 * - 不使用本地 db，比分/犯规/暂停以服务端返回为准
 * - 布局：上下四栏（顶栏比分球队名 / 副顶栏阶段暂停犯规 / 中部球员 / 底栏动作）
 */
import { ref, computed, onUnmounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import batteryView from '@/components/battery-view/battery-view.vue'
import changeMemberDialog from '@/components/change-member-dialog/change-member-dialog.vue'
import sectionDialog from '@/components/section-dialog/section-dialog.vue'
import { getGameBasketballDetail } from '@/api/game'
import { uploadData, sectionRunning, cancelData, statisticsPage } from '@/api/statistics'
import { BasketActions, BasketType } from '@/utils/stat-types'
import { on, off, EventBus } from '@/utils/eventBus'

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
// 副顶栏「犯规」= 该队球员个人犯规之和（与球员角标同源，保证总和一致，不再用服务端 hostTeamFoul）
const hostFoul = computed(() => hostMembers.value.reduce((s, m) => s + (m.foul || 0), 0))
const guestFoul = computed(() => guestMembers.value.reduce((s, m) => s + (m.foul || 0), 0))
const hostPause = ref(0)
const guestPause = ref(0)
const records = ref([])
// 动作按钮上方的最近一次操作提示（x号 xxx 动作），新操作覆盖旧的
const latestRecord = ref('')
const battery = ref(100)
const showChange = ref(false)
const showSection = ref(false)
const showRecord = ref(false)

const quickActions = BasketActions
const currentMembers = computed(() => (selectedTeam.value === 'host' ? hostMembers.value : guestMembers.value))

onLoad((opt) => {
  gameId.value = opt.gameId || ''
  homeName.value = opt.homeName || '主队'
  guestName.value = opt.guestName || '客队'
  loadData()
  loadRecords()
  on(EventBus.RECORD_REFRESH, onRecordRefresh)
})

onUnmounted(() => off(EventBus.RECORD_REFRESH, onRecordRefresh))

function onRecordRefresh() {
  loadData()
  loadRecords()
}

/** 服务端 MemberData -> 本地 snake_case 形状（模板/换人弹窗依赖 team_member_id + playing 数字） */
function adaptMember(m) {
  return {
    team_member_id: m.teamMemberId,
    id: m.id, // 比赛时 id（statisticsMemberId），上报用
    number: m.number,
    name: m.name,
    playing: m.playing?.boolean ? 1 : 0,
    startingLineup: m.startingLineup?.boolean ? 1 : 0,
    foul: m.foul || 0
  }
}

/** 在场靠前，号码升序（对应 Playing desc, Number asc） */
function sortMembers(list) {
  return list.sort((a, b) => (Number(b.playing) || 0) - (Number(a.playing) || 0) || (a.number - b.number))
}

/** 拉取全量状态（对应 statistics/game-detail-basketball） */
function loadData() {
  if (!gameId.value) return
  getGameBasketballDetail(gameId.value).then((res) => {
    if (res.code !== 1) return
    const d = res.data || {}
    const g = d.game || {}
    homeName.value = g.hostTeamName || homeName.value
    guestName.value = g.guestTeamName || guestName.value
    hostScore.value = g.hostTeamScore || 0
    guestScore.value = g.guestTeamScore || 0
    hostPause.value = d.hostTeamStop || 0
    guestPause.value = d.guestTeamStop || 0
    hostMembers.value = sortMembers((d.hostMembers || []).map(adaptMember))
    guestMembers.value = sortMembers((d.guestMembers || []).map(adaptMember))
    sections.value = d.sections || []
    // 定位当前运行中的小节
    const running = sections.value.find((s) => s.running && s.running.boolean)
    if (running) {
      // statisticsSectionId 用小节行的 id（非 gameSectionId）
      currentSection.value = running.id
      currentSectionName.value = running.name
      currentSectionIdx.value = sections.value.findIndex((s) => s.gameSectionId === running.gameSectionId)
    } else if (sections.value.length) {
      currentSection.value = sections.value[0].id
      currentSectionName.value = sections.value[0].name
      currentSectionIdx.value = 0
    }
  })
}

/** 记录列表（对应 statistics/page 第一页，最新优先） */
function loadRecords() {
  statisticsPage(gameId.value, 1, 1).then((res) => {
    if (res.code === 1) {
      const d = res.data || {}
      const list = d.list || []
      // 最新在前：recordNumber(时间戳)降序；mock 字符串 fallback 字典序降序
      records.value = list.slice().sort((a, b) => {
        const na = Number(a.recordNumber)
        const nb = Number(b.recordNumber)
        if (!isNaN(na) && !isNaN(nb)) return nb - na
        return String(b.recordNumber).localeCompare(String(a.recordNumber))
      })
    }
  })
}

/** 记录时间：原生取 occurrenceTime.substring(11)（跳过日期），兼容已是 HH:mm:ss 的字符串 */
function recordTime(r) {
  const t = r.occurrenceTime || ''
  return t.length > 8 ? t.slice(-8) : t
}

/** 记录类型描述：type.desc（服务端 statistics/page 返回 type 对象） */
function recordType(r) {
  return (r.type && r.type.desc) || ''
}

function selectPlayer(team, m) {
  selectedTeam.value = team
  selectedId.value = m.team_member_id
  selectedMember.value = m
}

/** 点其它部位收回底栏 */
function clearSelection() {
  selectedId.value = ''
  selectedTeam.value = ''
  selectedMember.value = null
}

function onQuickAction(a) {
  // 换人：打开换人弹窗（先下后上，type 13/14），不直接上传
  if (a.desc === '换人') {
    showChange.value = true
    return
  }
  doAction(a)
}

function doAction(a) {
  if (!selectedMember.value) {
    uni.showToast({ title: '请先选择球员', icon: 'none' })
    return
  }
  const team = selectedTeam.value
  const member = selectedMember.value
  const teamType = team === 'host' ? 1 : 0
  uploadData({
    description: `${member.name} ${a.desc}`,
    recordNumber: Date.now(),
    statisticsMemberId: member.id || member.team_member_id,
    statisticsSectionId: currentSection.value,
    type: a.type,
    index: 0,
    host_guest: teamType
  }).then((res) => {
    if (res.code === 1) {
      latestRecord.value = `${member.number}号 ${member.name} ${a.desc}`
      loadData()
      loadRecords()
    }
  })
}

function onDelete(r) {
  const v = r.type && r.type.value
  // 小节开始/结束(15/16)不支持删除（对应原生 OnItemClickLitener）
  if (v === 15 || v === 16) {
    uni.showToast({ title: '该操作不支持删除', icon: 'none' })
    return
  }
  uni.showModal({
    title: '提示',
    content: '是否删除此条数据..',
    success: (res) => {
      if (!res.confirm) return
      cancelData({
        gameId: gameId.value,
        recordNumber: r.recordNumber,
        statisticsMemberId: r.statisticsMemberId
      }).then((res2) => {
        if (res2.code === 1) {
          loadData()
          loadRecords()
        }
      })
    }
  })
}

/** 换人弹窗传的是 team_member_id，换算成比赛时 id */
function matchIdOf(teamMemberId) {
  const all = hostMembers.value.concat(guestMembers.value)
  const m = all.find((x) => x.team_member_id === teamMemberId)
  return (m && m.id) || teamMemberId
}

function onChange({ offId, onId }) {
  const team = selectedTeam.value || 'host'
  const teamType = team === 'host' ? 1 : 0
  const base = Date.now()
  uploadData({
    description: '换下', recordNumber: base, statisticsMemberId: matchIdOf(offId),
    statisticsSectionId: currentSection.value, type: 13, index: 0, host_guest: teamType
  }).then((res) => {
    if (res.code === 1) {
      return uploadData({
        description: '换上', recordNumber: base + 1, statisticsMemberId: matchIdOf(onId),
        statisticsSectionId: currentSection.value, type: 14, index: 0, host_guest: teamType
      })
    }
  }).then((res) => {
    if (res && res.code === 1) {
      loadData()
      loadRecords()
    }
  })
}

function onSection(t) {
  // 小节开始/结束：uploadData type 16/15（对应 StaticNewDownActivity section_begin/finish）
  if (t === 'start') { insertSectionRecord(BasketType.SECTION_START); return }
  if (t === 'end') { insertSectionRecord(BasketType.SECTION_END); return }
  // 上一/下一节：本地切 index 后 sectionRunning(目标小节)
  if (t === 'prev' && currentSectionIdx.value > 0) currentSectionIdx.value--
  if (t === 'next' && currentSectionIdx.value < sections.value.length - 1) currentSectionIdx.value++
  const sec = sections.value[currentSectionIdx.value]
  if (sec) {
    currentSection.value = sec.id
    currentSectionName.value = sec.name
  }
  sectionRunning(currentSection.value).then((res) => {
    if (res.code === 1) loadData()
  })
}

function insertSectionRecord(type) {
  uploadData({
    description: type === 16 ? '小节开始' : '小节结束',
    recordNumber: Date.now(),
    statisticsMemberId: -1,
    statisticsSectionId: currentSection.value,
    type,
    index: 0,
    host_guest: 0
  }).then((res) => {
    if (res.code === 1) {
      loadData()
      loadRecords()
    }
  })
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
  font-size: 40rpx;
  // font-weight: bold;
  color: black;
}
.colon {
  font-size: 36rpx;
  color: #999999;
}

/* 标题栏：篮球技术台 */
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
  // margin-top: 12rpx;
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
  width:290rpx;
  background-color: #F3584E;
}
.tb-half.blue {
  width:290rpx;
  background-color: #009DE9;
  text-align: right;
}
.tb-stuff{
  flex:1;  
  height: 100%;
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
  position:absolute;
  left:50%;
  transform:translateX(-50%)
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
	padding:5rpx 10rpx;
	margin:10rpx;
	background-color: #FFFFFF; 
	display: flex;
	flex-direction: column;
	justify-content: center; 
	align-items: center;
	position: relative;
	overflow: hidden;
}

.person-foul{
	padding: 22rpx; 
	background-color: #787878; 
	position: absolute; 
	border-radius: 50%; 
	left: 0; 
	top:0; 
	transform: translateX(-40%) translateY(-40%);
	display: flex;
	align-items: center;
	justify-content: center;
	color: #ffffff;
	font-size: 20rpx;
	line-height: 1;
}
.person-foul.red{
	background-color: #ff2d2d;
}
.person-foul.yellow{
	background-color: #f5a623;
}

.foul-times{
	position: absolute; 
	color: white; 
	font-size: 20rpx; 
	top:1%; 
	left:4%
}

.person-ball{
	width: 14rpx; 
	height:14rpx; 
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

.player-list{
	height:50vh; 
	background-color: #F8F8F8; 
	display: flex;
	flex-wrap: wrap; 
	padding:5rpx;
	// justify-content: space-around;
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
  z-index: 10;
}
.action-scroll {
  flex: 1;
  min-height: 0;
  margin-bottom: 20rpx;
}
/* 最近一次操作提示白框（按钮集合上方，新操作覆盖旧的） */
.record-chip {
  background-color: #ffffff;
  border: 1rpx solid #e5e5e5;
  border-radius: 8rpx;
  padding: 12rpx 20rpx;
  margin-bottom: 10rpx;
  font-size: 26rpx;
  color: #333333;
}
.action-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 10rpx;
}
.action-btn {
  flex: 0 0 calc((100% - 30rpx) / 4);
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
  background-color: #F3584E;
}
.action-btn.blue {
  background-color: #009de9;
}
/* 页面底部固定「记录」按钮（底栏弹出时被覆盖） */
.record-float {
  position: absolute;
  bottom: 10rpx;
  left: 50%;
  transform: translateX(-50%);
  padding: 12rpx 80rpx;
  background-color: #888888;
  color: #ffffff;
  font-size: 28rpx;
  border-radius: 6rpx;
  z-index: 5;
}

/* 底栏从底部滑入/滑出 */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform 0.25s ease;
}
.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
}

/* 记录页面（样式参考原生 OperationRecordActivity + item_recordnew） */
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
  height: 96rpx; /* 原生 48dp */
  background-color: #ffffff;
  display: flex;
  align-items: center;
  box-shadow: 0 6rpx 6rpx rgba(0, 0, 0, 0.18);
}
.rp-back {
  width: 96rpx; /* 原生 48dp */
  height: 96rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}
.rp-back-icon {
  width: 120rpx;
  height: 120rpx;
}
.rp-title {
  flex: 1;
  text-align: center;
  color: #000000;
  font-size: 36rpx; /* 原生 18dp */
}
.rp-list {
  flex: 1;
}
.rp-item {
  display: flex;
  align-items: center;
  padding: 10rpx; /* 原生 5dp */
  border-bottom: 1rpx solid #d9d9d9; /* cut_rule */
}
.rp-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 20rpx; /* 原生 10dp */
}
.rp-row {
  display: flex;
  align-items: center;
}
.rp-row2 {
  margin-top: 20rpx; /* 原生 10dp */
}
.rp-text {
  font-size: 28rpx; /* 原生 14dp */
  color: #2F7ED8; /* Record */
}
.rp-team {
  max-width: 200rpx; /* 原生 maxLength 5 */
  overflow: hidden;
  white-space: nowrap;
}
.rp-time {
  margin-left: 20rpx; /* 原生 10dp */
}
.rp-section {
  margin-right: 20rpx; /* 原生 10dp */
}
.rp-side {
  display: flex;
  align-items: center;
}
.rp-type {
  width: 160rpx; /* 原生 80dp */
  text-align: right;
  font-size: 28rpx;
  color: #2F7ED8;
}
.rp-del {
  width: 48rpx; /* 原生 padding 20dp 包裹图标，宽高缩至 3/5 */
  height: 48rpx;
  padding: 20rpx;
}
.rp-empty {
  padding: 40rpx;
  text-align: center;
  font-size: 28rpx;
  color: #999999;
}

</style>
