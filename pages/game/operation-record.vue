<template>
  <view class="op-record">
    <view class="top-bar">
      <view class="back" @click="back">‹</view>
      <text class="title">操作记录</text>
    </view>
    <scroll-view
      scroll-y
      class="list"
      refresher-enabled
      :refresher-triggered="refreshing"
      @refresherrefresh="onRefresh"
      @scrolltolower="onLoadMore"
    >
      <view v-for="r in list" :key="r.id" class="rec-item" @click="onDelete(r)">
        <view class="rec-main">
          <view class="rec-line1">
            <text class="r-team">{{ r.teamName }}</text>
            <text class="r-time">{{ r.occurrenceTime }}</text>
            <text class="r-section">{{ r.sectionName }}</text>
          </view>
          <view class="rec-line2">
            <text class="r-player">{{ r.memberName }}</text>
            <text class="r-type">{{ r.type && r.type.desc }}</text>
            <text class="r-del">删除</text>
          </view>
        </view>
      </view>
      <empty-layout v-if="!list.length && !loading" status="empty" />
      <view v-if="loading" class="loading-more">加载中…</view>
      <view v-else-if="!hasMore && list.length" class="loading-more">已加载全部</view>
    </scroll-view>
  </view>
</template>

<script setup>
/**
 * 操作记录（对应 OperationRecordActivity，分页 + 删除 post 8888）
 * - 分页拉取 statistics/page(gameId, isDesc=1, pageNo) -> RecordNewData.DataBean.ListBean
 * - 下拉刷新 + 上拉加载
 * - 删除：statistics/cancel -> 重拉 + emit RECORD_REFRESH(对应 post 8888 通知 StaticNewDown)
 */
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import emptyLayout from '@/components/empty-layout/empty-layout.vue'
import { statisticsPage, cancelData } from '@/api/statistics'
import { emit, EventBus } from '@/utils/eventBus'

const gameId = ref('')
const list = ref([])
const pageNo = ref(1)
const totalPage = ref(1)
const loading = ref(false)
const refreshing = ref(false)
const hasMore = ref(true)

onLoad((opt) => {
  // Intent extra KEY(=BaseActivity.KEY)=gameId
  gameId.value = opt.gameId || opt.KEY || ''
  load(true)
})

function load(reset) {
  if (loading.value) return
  if (reset) {
    pageNo.value = 1
    list.value = []
    hasMore.value = true
  }
  loading.value = true
  statisticsPage(gameId.value, 1, pageNo.value).then((res) => {
    if (res.code === 1) {
      const d = res.data || {}
      const pageList = d.list || []
      list.value = reset ? pageList : list.value.concat(pageList)
      totalPage.value = d.totalPage || 1
      hasMore.value = pageNo.value < totalPage.value
    }
  }).finally(() => {
    loading.value = false
    refreshing.value = false
  })
}

function onRefresh() {
  refreshing.value = true
  load(true)
}

function onLoadMore() {
  if (hasMore.value && !loading.value) {
    pageNo.value++
    load(false)
  }
}

function onDelete(r) {
  uni.showModal({
    title: '提示',
    content: '确定删除该记录？',
    success: (rr) => {
      if (rr.confirm) {
        cancelData({
          gameId: gameId.value,
          recordNumber: r.recordNumber,
          statisticsMemberId: r.statisticsMemberId
        }).then((res) => {
          if (res.code === 1) {
            // 删除成功重拉并通知在线统计页刷新（对应 post Integer 8888）
            emit(EventBus.RECORD_REFRESH)
            load(true)
          }
        })
      }
    }
  })
}

function back() {
  uni.navigateBack()
}
</script>

<style lang="scss" scoped>
.op-record {
  min-height: 100vh;
  background-color: #f8f8f8;
  display: flex;
  flex-direction: column;
}
.top-bar {
  height: 88rpx;
  display: flex;
  align-items: center;
  padding: 0 20rpx;
  background-color: #2c2c2c;
}
.back {
  font-size: 44rpx;
  color: #ffffff;
  width: 60rpx;
}
.title {
  color: #ffffff;
  font-size: 30rpx;
  flex: 1;
  text-align: center;
}
.list {
  flex: 1;
}
.rec-item {
  background-color: #ffffff;
  margin: 12rpx 20rpx;
  padding: 24rpx;
  border-radius: 8rpx;
}
.rec-line1 {
  display: flex;
  gap: 20rpx;
  margin-bottom: 12rpx;
}
.r-team {
  font-size: 24rpx;
  color: #29a871;
}
.r-time {
  font-size: 22rpx;
  color: #999999;
}
.r-section {
  font-size: 22rpx;
  color: #999999;
}
.rec-line2 {
  display: flex;
  align-items: center;
  gap: 20rpx;
}
.r-player {
  flex: 1;
  font-size: 26rpx;
  color: #333333;
}
.r-type {
  font-size: 26rpx;
  color: #2f7ed8;
}
.r-del {
  font-size: 24rpx;
  color: #ff2d2d;
}
.loading-more {
  text-align: center;
  padding: 24rpx;
  font-size: 24rpx;
  color: #999999;
}
</style>
