<template>
  <view class="basketball-setup">
    <custom-nav title="篮球比赛设置" />

    <!-- tab 栏：scrollable 关掉后每项 flex:1，平分整屏宽度；选中态主题色 + 加长下划线 -->
    <u-tabs
      :list="tabs"
      :current="current"
      :scrollable="false"
      lineColor="#008183"
      :lineWidth="40"
      :activeStyle="{ color: '#008183' }"
      :itemStyle="{ height: '57px' }"
      @click="onTabClick"
    ></u-tabs>

    <view class="content">
      <match-info
        v-show="current === 0"
        :game-id="gameId"
        sport="basketball"
        :start-mode="true"
        :readonly="true"
        @start="onStart"
        @status-change="onStatusChange"
      />
      <team-roster
        v-show="current === 1"
        :game-id="gameId"
        :game-team-id="hostTeamId"
        sport="basketball"
        :type="1"
        :setup-mode="true"
        :team-name="hostTeamName"
      />
      <team-roster
        v-show="current === 2"
        :game-id="gameId"
        :game-team-id="guestTeamId"
        sport="basketball"
        :type="0"
        :setup-mode="true"
        :team-name="guestTeamName"
      />
    </view>

    <u-modal
      :show="showConfirm"
      :content="confirmMsg"
      :show-cancel-button="true"
      @confirm="onConfirmStart"
      @cancel="showConfirm = false"
    ></u-modal>
  </view>
</template>

<script setup>
/**
 * 篮球赛前设置（对应 MatchSetActivity）
 * - 拉小节写入本地 game_section（getSectionList）
 * - 3 Tab：比赛信息 / 主队 / 客队
 * - 开始统计按钮在「比赛信息」Tab 内（原右上角入口已移除），校验后进篮球统计页
 */
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import customNav from '@/components/custom-nav/custom-nav.vue'
import matchInfo from '@/components/match-info/match-info.vue'
import teamRoster from '@/components/team-roster/team-roster.vue'
import { getSectionList, getGameDetail } from '@/api/game'
import { insertOrReplace, countWhere } from '@/utils/db'

const gameId = ref('')
const hostTeamId = ref('')
const guestTeamId = ref('')
const statusValue = ref(1)
const matchType = ref('5v5')
// 主/客队名（详情接口返回，给球队 Tab 头部行显示）
const hostTeamName = ref('')
const guestTeamName = ref('')

const tabs = [{ name: '比赛信息' }, { name: '主队' }, { name: '客队' }]
const current = ref(0)
const showConfirm = ref(false)
const confirmMsg = ref('')

onLoad((opt) => {
  gameId.value = opt.gameId || ''
  hostTeamId.value = opt.hostTeamId || ''
  guestTeamId.value = opt.guestTeamId || ''
  statusValue.value = Number(opt.statusValue || 1)
  matchType.value = opt.type || '5v5'
  loadSections()
  loadTeamNames()
})

/** 拉比赛详情取主/客队名（列表接口同实体字段 hostTeamName/guestTeamName） */
function loadTeamNames() {
  if (!gameId.value) return
  getGameDetail(gameId.value, 'basketball').then((res) => {
    if (res.code === 1) {
      const g = (res.data && res.data.game) || res.data || {}
      hostTeamName.value = g.hostTeamName || '主队'
      guestTeamName.value = g.guestTeamName || '客队'
    }
  }).catch(() => {})
}

function onTabClick(e) {
  current.value = e.index
}

/** 拉小节写入本地 game_section（对应 MatchSetActivity.getSectionList） */
function loadSections() {
  if (!gameId.value) return
  getSectionList(gameId.value).then((res) => {
    if (res.code === 1) {
      ;(res.data || []).forEach((s) => {
        insertOrReplace('game_section', {
          section_id: s.id,
          game_id: s.gameId || gameId.value,
          type: s.type ? s.type.value : 0,
          name: s.name,
          sort: s.sort || 0,
          groups: s.groups || '',
          isStart: 0,
          isEnd: 0
        })
      })
    }
  })
}

function onStatusChange(s) {
  statusValue.value = s.value
}

function onStart() {
  // 校验：本地已有记录则不能改首发；状态需为进行中（对应 MatchSetActivity 校验逻辑）
  countWhere('technical_record', `game_id='${gameId.value}'`).then((cnt) => {
    if (statusValue.value !== 1) {
      confirmMsg.value = '请将比赛状态设置为进行中'
    } else if (cnt > 0) {
      confirmMsg.value = '开始统计将不能修改首发队员'
    } else {
      confirmMsg.value = '开始统计将不能修改首发队员'
    }
    showConfirm.value = true
  })
}

function onConfirmStart() {
  showConfirm.value = false
  if (statusValue.value !== 1) {
    uni.showToast({ title: '请将比赛状态设置为进行中', icon: 'none' })
    return
  }
  // 进篮球统计页（横屏直连版，比赛时 id 由页面内 game-detail-basketball 提供）
  uni.navigateTo({
    url: `/pages/statistics/basketball-operate?gameId=${gameId.value}`
  })
}
</script>

<style lang="scss" scoped>
.basketball-setup {
  min-height: 100vh;
  background-color: #ffffff;
}
/* tab 栏以下内容区：浅灰底；高度精确算到屏幕底 = 状态栏 + 50px 导航 + 1rpx 线 + 57px tab 栏 */
.content {
  height: calc(100vh - var(--status-bar-height) - 51px - 57px);
  background-color: #F3F3F3;
}
</style>
