<template>
  <view class="photos-upload">
    <view class="top-bar">
      <view class="nav-status" :style="{ height: statusBarHeight + 'px' }"></view>
      <view class="top-bar-inner">
        <view class="back" @click="back"><image class="back-icon" src="/static/mipmap-xxhdpi/black_back.png" mode="aspectFit" /></view>
        <text class="title">{{ title }}</text>
      </view>
    </view>
    <scroll-view scroll-y class="list">
      <view class="live-entry">
        <view class="live-btn" @click="goLivePhoto">拍照直播</view>
      </view>
      <view class="grid">
        <image
          v-for="(p, i) in photos"
          :key="p.id || i"
          class="photo-img"
          :src="p.url"
          mode="aspectFill"
          @click="preview(i)"
        />
      </view>
      <empty-layout v-if="!photos.length" status="empty" />
    </scroll-view>
  </view>
</template>

<script setup>
/**
 * 图片列表（对应 PhotosUploadActivity）
 * GET photo/picture/upload-list，图片网格，点击进大图预览 LargeViewActivity
 * 「拍照直播」按钮进拍照直播页（原 LivePhotoActivity USB 单反，改 camera 版）
 */
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import emptyLayout from '@/components/empty-layout/empty-layout.vue'
import { getUploadPhoto } from '@/api/photo'

// 状态栏高度（custom 导航页需自行留出状态栏空间，避免与系统时间/电量栏重叠）
const statusBarHeight = uni.getSystemInfoSync().statusBarHeight || 0

const id = ref('')
const title = ref('')
const photos = ref([])

onLoad((opt) => {
  id.value = opt.id || ''
  title.value = decodeURIComponent(opt.title || '')
  load()
})

function load() {
  getUploadPhoto().then((res) => {
    if (res.code === 1) photos.value = res.data || []
  })
}

function preview(i) {
  const urls = photos.value.map((p) => p.url)
  uni.navigateTo({
    url: `/pages/preview/large-view?position=${i}&urls=${encodeURIComponent(JSON.stringify(urls))}`
  })
}

function goLivePhoto() {
  uni.navigateTo({ url: `/pages/photo/live-photo?id=${id.value}` })
}

function back() {
  uni.navigateBack()
}
</script>

<style lang="scss" scoped>
.photos-upload {
  min-height: 100vh;
  background-color: #f8f8f8;
  display: flex;
  flex-direction: column;
}
.top-bar {
  background-color: #ffffff;
}
.nav-status {
  background-color: #ffffff;
}
.top-bar-inner {
  height: 88rpx;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20rpx;
}
.back {
  font-size: 44rpx;
  color: #000000;
  width: 60rpx;
}
.title {
  position: absolute;
  left: 100rpx;
  right: 100rpx;
  top: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  color: #000000;
  font-size: 30rpx;
}
.live-entry {
  display: flex;
  justify-content: center;
  padding: 30rpx 20rpx 10rpx;
}
.live-btn {
  width: 60%;
  height: 80rpx;
  line-height: 80rpx;
  text-align: center;
  border-radius: 40rpx;
  background-color: #ff6f21;
  color: #ffffff;
  font-size: 28rpx;
}
.list {
  flex: 1;
}
.grid {
  display: flex;
  flex-wrap: wrap;
  padding: 16rpx;
  gap: 12rpx;
}
.photo-img {
  width: calc(33.33% - 8rpx);
  height: 220rpx;
  border-radius: 8rpx;
}
.back-icon {
  width: 100rpx;
  height: 100rpx;
}
</style>
