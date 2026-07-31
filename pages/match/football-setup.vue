<template>
  <view class="football-setup">
    <custom-nav title="足球比赛设置">
      <template #right>
        <text class="start-btn" @click="onStart">开始统计</text>
      </template>
    </custom-nav>

    <u-tabs :list="tabs" :current="current" @click="onTabClick"></u-tabs>

    <view class="content">
      <match-info
        v-show="current === 0"
        :game-id="gameId"
        sport="football"
        :has-sync="true"
        @status-change="onStatusChange"
      />
      <team-roster
        v-show="current === 1"
        :game-id="gameId"
        :game-team-id="hostTeamId"
        sport="football"
        :type="1"
      />
      <team-roster
        v-show="current === 2"
        :game-id="gameId"
        :game-team-id="guestTeamId"
        sport="football"
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
 * 足球赛前设置（对应 MatchFootActivityActivity）
 * - 拉小节写入本地 game_section
 * - 3 Tab：比赛信息 / 主队 / 客队（足球版，球员含位置）
 * - 开始统计：校验后进足球统计页（批3实现）
 * 跳转传 KEY(=gameId)/HOSTNAME/GUESTNAME/HomeName/GuestName
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
const statusValue = ref(0)
const homeName = ref('')
const guestName = ref('')

const tabs = [{ name: '比赛信息' }, { name: '主队' }, { name: '客队' }]
const current = ref(0)
const showConfirm = ref(false)
const confirmMsg = ref('')

onLoad((opt) => {
  gameId.value = opt.gameId || ''
  hostTeamId.value = opt.hostTeamId || ''
  guestTeamId.value = opt.guestTeamId || ''
  statusValue.value = Number(opt.statusValue || 0)
  homeName.value = opt.homeName || ''
  guestName.value = opt.guestName || ''
  loadSections()
})

function onTabClick(e) {
  current.value = e.index
}

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
  // 进足球统计页（对应 StatidticsFootActivity）
  uni.navigateTo({
    url: `/pages/statistics/football-operate?gameId=${gameId.value}`
  })
}
</script>

<style lang="scss" scoped>
.football-setup {
  min-height: 100vh;
  background-color: #ffffff;
}
.start-btn {
  font-size: 28rpx;
  color: #29a871;
}
.content {
  height: calc(100vh - 200rpx);
}
</style>
