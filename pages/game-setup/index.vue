<template>
  <view class="game-setup">
    <custom-nav title="比赛设置">
      <template #right>
        <text class="start-btn" @click="onStart">开始统计</text>
      </template>
    </custom-nav>

    <u-tabs :list="tabs" :current="current" @click="onTabClick"></u-tabs>

    <view class="content">
      <match-info
        v-show="current === 0"
        :game-id="gameId"
        sport="basketball"
        :has-sync="false"
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
      content="开始统计将不能修改首发队员"
      :show-cancel-button="true"
      @confirm="onConfirmStart"
      @cancel="showConfirm = false"
    ></u-modal>
  </view>
</template>

<script setup>
/**
 * 比赛设置（对应 GameSetupActivity）
 * 与 MatchSetActivity 结构相同，但无 API（数据由 Fragment 处理），
 * 开始统计进在线同步统计页 StaticNewDown（批3实现）
 */
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import customNav from '@/components/custom-nav/custom-nav.vue'
import matchInfo from '@/components/match-info/match-info.vue'
import teamRoster from '@/components/team-roster/team-roster.vue'

const gameId = ref('')
const hostTeamId = ref('')
const guestTeamId = ref('')

const tabs = [{ name: '比赛信息' }, { name: '主队' }, { name: '客队' }]
const current = ref(0)
const showConfirm = ref(false)

onLoad((opt) => {
  gameId.value = opt.gameId || ''
  hostTeamId.value = opt.hostTeamId || ''
  guestTeamId.value = opt.guestTeamId || ''
})

function onTabClick(e) {
  current.value = e.index
}

function onStart() {
  showConfirm.value = true
}

function onConfirmStart() {
  showConfirm.value = false
  // 进在线同步统计页（对应 StaticNewDownActivity）
  uni.navigateTo({
    url: `/pages/statistics/basketball-down?gameId=${gameId.value}`
  })
}
</script>

<style lang="scss" scoped>
.game-setup {
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
