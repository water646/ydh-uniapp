<template>
  <view class="live-multiple">
    <view class="top-bar">
      <view class="nav-status" :style="{ height: statusBarHeight + 'px' }"></view>
      <view class="top-bar-inner">
        <view class="back" @click="back">‹</view>
        <text class="title">直播</text>
        <text class="add" @click="showAdd = true">添加视角</text>
      </view>
    </view>

    <scroll-view
      scroll-y
      class="list"
      refresher-enabled
      :refresher-triggered="refreshing"
      @refresherrefresh="onRefresh"
    >
      <view v-for="item in list" :key="item.id" class="live-item" @click="goPush(item)">
        <text class="live-name">{{ item.name }}</text>
        <text class="arrow">›</text>
      </view>
      <empty-layout v-if="!list.length && !loading" status="empty" />
    </scroll-view>

    <!-- V2/V3 直播类型选择（底边栏，两个方形按钮横向排布） -->
    <view class="type-footer">
      <view class="type-title">选择直播类型</view>
      <view class="type-bar">
        <view class="type-btn" :class="{ on: liveType === 'V2' }" @click="setType('V2')">V2</view>
        <view class="type-btn" :class="{ on: liveType === 'V3' }" @click="setType('V3')">V3</view>
      </view>
    </view>

    <u-popup :show="showAdd" mode="center" :round="20" @close="showAdd = false">
      <view class="add-dialog">
        <view class="dialog-title">添加直播视角</view>
        <input v-model="form.livename" class="input" placeholder="直播名称" />
        <view class="btns">
          <view class="btn cancel" @click="showAdd = false">取消</view>
          <view class="btn confirm" @click="onAdd">确定</view>
        </view>
      </view>
    </u-popup>
  </view>
</template>

<script setup>
/**
 * 直播流列表（对应 LiveMultipleActivity，竖屏）
 * - GET live/stream/game-list 列表
 * - POST live/stream/game-add 添加视角(gameId/livename/event/channel)
 * - V2/V3 选择存 SP（每场一个），点击列表项进统一推流页
 */
import { ref, reactive } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import emptyLayout from '@/components/empty-layout/empty-layout.vue'
import { getLiveGameList, addGame } from '@/api/live'

// 状态栏高度（custom 导航页需自行留出状态栏空间，避免与系统时间/电量栏重叠）
const statusBarHeight = uni.getSystemInfoSync().statusBarHeight || 0

const gameId = ref('')
const sport = ref('basketball')
const list = ref([])
const loading = ref(false)
const refreshing = ref(false)
const liveType = ref('V2')
const showAdd = ref(false)
const form = reactive({ livename: '' })

onLoad((opt) => {
  gameId.value = opt.gameId || ''
  sport.value = opt.sport || 'basketball'
  liveType.value = uni.getStorageSync('live_type_' + gameId.value) || 'V2'
  loadList()
})

function loadList() {
  loading.value = true
  getLiveGameList(gameId.value).then((res) => {
    if (res.code === 1) list.value = res.data || []
  }).finally(() => {
    loading.value = false
    refreshing.value = false
  })
}

function onRefresh() {
  refreshing.value = true
  loadList()
}

function setType(t) {
  liveType.value = t
  uni.setStorageSync('live_type_' + gameId.value, t)
}

function onAdd() {
  if (!form.livename) {
    uni.showToast({ title: '请输入直播名称', icon: 'none' })
    return
  }
  addGame({
    gameId: gameId.value,
    name: form.livename,
    event: sport.value === 'football' ? '2' : '1', // 比赛类型：1=篮球，2=足球
    channel: 1
  }).then((res) => {
    if (res.code === 1) {
      showAdd.value = false
      form.livename = ''
      loadList()
    } else {
      uni.showToast({ title: res.msg || '添加失败', icon: 'none' })
    }
  })
}

function goPush(item) {
  // 推流地址（publish 或 liveRtmp），原项目 RTMP
  const publish = item.publish || item.liveRtmp || ''
  uni.navigateTo({
    url: `/pages/live/push?livepublish=${encodeURIComponent(publish)}&gameId=${gameId.value}&liveType=${liveType.value}&name=${encodeURIComponent(item.name || '')}`
  })
}

function back() {
  uni.navigateBack()
}
</script>

<style lang="scss" scoped>
.live-multiple {
  min-height: 100vh;
  background-color: #f8f8f8;
  display: flex;
  flex-direction: column;
}
.top-bar {
  background-color: #ffffff;
}
.top-bar-inner {
  height: 88rpx;
  display: flex;
  align-items: center;
  padding: 0 20rpx;
}
.back {
  font-size: 44rpx;
  color: #000000;
  width: 60rpx;
}
.title {
  flex: 1;
  text-align: center;
  color: #000000;
  font-size: 30rpx;
}
.add {
  font-size: 26rpx;
  color: #1e7a4d;
}
.list {
  flex: 1;
  padding-bottom: 200rpx;
}
.live-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #ffffff;
  margin: 12rpx 20rpx;
  padding: 30rpx 24rpx;
  border-radius: 8rpx;
}
.live-name {
  font-size: 28rpx;
  color: #333333;
}
.arrow {
  font-size: 32rpx;
  color: #cccccc;
}
.type-footer {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ffffff;
}
.type-title {
  text-align: center;
  font-size: 34rpx;
  color: #333333;
  padding: 16rpx 0;
  background-color: #ffffff;
}
.type-bar {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 20rpx;
  padding: 10rpx;
  background-color: #DDDDDD;
  border-top: 1rpx solid #eeeeee;
}
.type-btn {
  // flex: 1;
  height: 88rpx;
  width: 180rpx;
  line-height: 88rpx;
  text-align: center;
  font-size: 28rpx;
  border: 1rpx solid #DDDDDD;
  color: #AAAAAA;
  margin:0 30rpx;
  font-size: 35rpx;
  border-radius: 8rpx;
  box-shadow: 0 4rpx 6rpx rgba(0,0,0,0.1);
}
.type-btn.on {
  background-color: white;
  color: black;
}
.add-dialog {
  width: 560rpx;
  padding: 40rpx;
}
.dialog-title {
  text-align: center;
  font-size: 32rpx;
  color: #333333;
  margin-bottom: 24rpx;
}
.input {
  height: 80rpx;
  border: 1rpx solid #eeeeee;
  border-radius: 8rpx;
  padding: 0 20rpx;
  margin-bottom: 20rpx;
  font-size: 28rpx;
}
.btns {
  display: flex;
  gap: 20rpx;
  margin-top: 10rpx;
}
.btn {
  flex: 1;
  height: 80rpx;
  line-height: 80rpx;
  text-align: center;
  border-radius: 40rpx;
  font-size: 28rpx;
}
.cancel {
  background-color: #f2f2f2;
  color: #666666;
}
.confirm {
  background-color: #29a871;
  color: #ffffff;
}
</style>
