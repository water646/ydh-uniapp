<template>
  <view class="week-outs">
    <view class="top-bar">
      <view class="back" @click="back">‹</view>
      <text class="title">优肯周赛况</text>
    </view>
    <scroll-view scroll-y class="body">
      <image class="banner" src="/static/week_banner.png" mode="widthFix" />
      <view v-for="(group, gi) in groups" :key="gi" class="group">
        <view class="group-banner" @click="toggle(gi)">
          <text>{{ group.groupName }}</text>
          <text class="arrow">{{ openIdx === gi ? '▲' : '▼' }}</text>
        </view>
        <view v-if="openIdx === gi" class="group-body">
          <view v-for="g in group.games" :key="g.id" class="game-item">
            <view class="game-teams">
              <text class="g-name">{{ g.hostTeamName }}</text>
              <text class="g-score">{{ g.hostTeamScore }} : {{ g.guestTeamScore }}</text>
              <text class="g-name">{{ g.guestTeamName }}</text>
            </view>
            <text class="g-time">{{ g.time }}</text>
          </view>
          <view v-if="group.optimals && group.optimals.length" class="kings">
            <view v-for="(opt, oi) in group.optimals" :key="oi" class="king">
              <image v-if="opt.avatar" class="king-avatar" :src="opt.avatar" mode="aspectFill" />
              <view v-else class="king-avatar placeholder"></view>
              <view class="king-info">
                <text class="king-name">{{ opt.name }}</text>
                <text class="king-count">{{ opt.count }} {{ opt.type && opt.type.desc }}</text>
              </view>
            </view>
          </view>
        </view>
      </view>
      <empty-layout v-if="!groups.length && !loading" status="empty" />
    </scroll-view>
  </view>
</template>

<script setup>
/**
 * 优肯周赛况（对应 WeekOutsActivity）
 * - OkGo GET game/list-week?leagueId=xxx -> UkenData（code==1 取 data）
 * - data[idx]：0=U6 / 1=U8 / 2=U10 / 3=U12，每组含 games + optimals(数据王)
 * - 数据王：得分王 type1 / 篮板王 type2 / 助攻王 type3 / 抢断王 type5
 * - 标题用 youken 字体（@/static/fonts/youken.ttf，未注册时用默认）
 */
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import emptyLayout from '@/components/empty-layout/empty-layout.vue'
import { getWeekList } from '@/api/game'
import { config } from '@/config'

const groups = ref([])
const openIdx = ref(0)
const loading = ref(false)

onLoad(() => {
  loading.value = true
  getWeekList(config.youkenLeagueId).then((res) => {
    if (res.code === 1) {
      groups.value = res.data || []
    }
  }).finally(() => {
    loading.value = false
  })
})

function toggle(i) {
  openIdx.value = openIdx.value === i ? -1 : i
}

function back() {
  uni.navigateBack()
}
</script>

<style lang="scss" scoped>
.week-outs {
  min-height: 100vh;
  background-color: #f8f8f8;
}
.top-bar {
  height: 88rpx;
  display: flex;
  align-items: center;
  padding: 0 20rpx;
  background-color: #141a66;
}
.back {
  font-size: 44rpx;
  color: #ffffff;
  width: 60rpx;
}
.title {
  color: #ffffff;
  font-size: 32rpx;
  flex: 1;
  text-align: center;
  font-weight: bold;
}
.body {
  height: calc(100vh - 88rpx);
}
.banner {
  width: 100%;
}
.group {
  margin: 16rpx 20rpx;
  background-color: #ffffff;
  border-radius: 8rpx;
  overflow: hidden;
}
.group-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx;
  background-color: #141a66;
  color: #ffffff;
  font-size: 28rpx;
}
.arrow {
  font-size: 24rpx;
}
.group-body {
  padding: 16rpx 24rpx;
}
.game-item {
  padding: 16rpx 0;
  border-bottom: 1rpx solid #f2f2f2;
}
.game-teams {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20rpx;
}
.g-name {
  font-size: 26rpx;
  color: #333333;
}
.g-score {
  font-size: 30rpx;
  color: #2f7ed8;
  font-weight: bold;
}
.g-time {
  display: block;
  text-align: center;
  font-size: 22rpx;
  color: #999999;
  margin-top: 8rpx;
}
.kings {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
  padding: 16rpx 0;
}
.king {
  display: flex;
  align-items: center;
  width: calc(50% - 8rpx);
  background-color: #fff8e8;
  padding: 16rpx;
  border-radius: 8rpx;
}
.king-avatar {
  width: 72rpx;
  height: 72rpx;
  border-radius: 50%;
  margin-right: 16rpx;
}
.king-avatar.placeholder {
  background-color: #eeeeee;
}
.king-info {
  flex: 1;
}
.king-name {
  display: block;
  font-size: 26rpx;
  color: #333333;
}
.king-count {
  display: block;
  font-size: 22rpx;
  color: #ff6f21;
  margin-top: 4rpx;
}
</style>
