<template>
  <view class="basketball-setup">
    <custom-nav title="篮球比赛设置" />

    <u-tabs :list="tabs" :current="current" @click="onTabClick"></u-tabs>

    <view class="content">
      <match-info
        v-show="current === 0"
        :game-id="gameId"
        sport="basketball"
        :start-mode="true"
        @start="onStart"
        @status-change="onStatusChange"
      />
      <team-roster
        v-show="current === 1"
        :game-id="gameId"
        :game-team-id="hostTeamId"
        sport="basketball"
        :type="1"
      />
      <team-roster
        v-show="current === 2"
        :game-id="gameId"
        :game-team-id="guestTeamId"
        sport="basketball"
        :type="0"
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
import { getSectionList } from '@/api/game'
import { insertOrReplace, countWhere } from '@/utils/db'

const gameId = ref('')
const hostTeamId = ref('')
const guestTeamId = ref('')
const statusValue = ref(1)
const matchType = ref('5v5')

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
})

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
  // 进篮球统计页（离线版，对应 Statidtics1Activity）
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
.content {
  height: calc(100vh - 200rpx);
}
</style>
