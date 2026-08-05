<template>
  <view class="photo">
    <view class="top-bar">
      <view class="nav-status" :style="{ height: statusBarHeight + 'px' }"></view>
      <view class="top-bar-inner">
        <view class="back" @click="back">‹</view>
        <text class="title">活动列表</text>
      </view>
    </view>
    <scroll-view scroll-y class="list" @scrolltolower="onLoadMore">
      <view v-for="item in list" :key="item.id" class="act-item" @click="goUpload(item)">
        <image v-if="item.logo" class="logo" :src="item.logo" mode="aspectFill" />
        <view v-else class="logo placeholder"></view>
        <view class="info">
          <text class="act-title">{{ item.title }}</text>
          <text class="act-addr">{{ item.address }}</text>
          <text class="act-status">{{ item.status && item.status.desc }}</text>
        </view>
      </view>
      <view v-if="loading" class="more">加载中…</view>
      <view v-else-if="!hasMore && list.length" class="more">已加载全部</view>
      <view v-if="!list.length && !loading" class="no-data">
        <image class="no-data-img" src="/static/mipmap-xxhdpi/no_shuju.png" mode="aspectFit" />
        <view style="color: #BBBBBB;">暂无数据</view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
/**
 * 图文直播活动列表（对应 PhotoActivity）
 * 分页 GET photo/activity/list-my-manage?pageNo=，点击进图片列表页
 */
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getPhotoActivity } from '@/api/photo'

// 状态栏高度（custom 导航页需自行留出状态栏空间，避免与系统时间/电量栏重叠）
const statusBarHeight = uni.getSystemInfoSync().statusBarHeight || 0

const list = ref([])
const pageNo = ref(1)
const hasMore = ref(true)
const loading = ref(false)

onLoad(() => load(true))

function load(reset) {
  if (loading.value) return
  if (reset) {
    pageNo.value = 1
    list.value = []
    hasMore.value = true
  }
  loading.value = true
  getPhotoActivity(pageNo.value).then((res) => {
    if (res.code === 1) {
      const d = res.data || {}
      const items = d.list || []
      list.value = reset ? items : list.value.concat(items)
      hasMore.value = !!d.nextPage
    }
  }).finally(() => {
    loading.value = false
  })
}

function onLoadMore() {
  if (hasMore.value && !loading.value) {
    pageNo.value++
    load(false)
  }
}

function goUpload(item) {
  uni.navigateTo({
    url: `/pages/photos-upload/photos-upload?id=${item.id}&title=${encodeURIComponent(item.title || '')}`
  })
}

function back() {
  uni.navigateBack()
}
</script>

<style lang="scss" scoped>
.photo {
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
  // justify-content: center;
  padding: 0 20rpx;
}
.back {
  font-size: 44rpx;
  color: #000000;
  width: 60rpx;
}
.title {
  color: #000000;
  font-size: 30rpx;
  flex: 1;
  margin-left: -50rpx;
  // justify-self: center;
  text-align: center;

}
.list {
  flex: 1;
}
.act-item {
  display: flex;
  background-color: #ffffff;
  margin: 12rpx 20rpx;
  padding: 24rpx;
  border-radius: 8rpx;
}
.logo {
  width: 120rpx;
  height: 120rpx;
  border-radius: 8rpx;
  margin-right: 20rpx;
}
.logo.placeholder {
  background-color: #eeeeee;
}
.info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.act-title {
  font-size: 28rpx;
  color: #333333;
  margin-bottom: 10rpx;
}
.act-addr {
  font-size: 24rpx;
  color: #999999;
  margin-bottom: 6rpx;
}
.act-status {
  font-size: 22rpx;
  color: #29a871;
}
.more {
  text-align: center;
  padding: 24rpx;
  font-size: 24rpx;
  color: #999999;
}
.no-data-img {
  display: block;
  width: 100rpx;
  height: 100rpx;
  margin: 100rpx auto 50rpx auto;
}
.no-data {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 300rpx;
}
</style>
