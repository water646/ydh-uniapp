<template>
  <view class="photos-upload">
    <view class="top-bar">
      <view class="nav-status" :style="{ height: statusBarHeight + 'px' }"></view>
      <view class="top-bar-inner">
        <view class="back" @click="back">‹</view>
        <text class="title">{{ title }}</text>
        <text class="live-btn" @click="goLivePhoto">拍照直播</text>
      </view>
    </view>
    <scroll-view scroll-y class="list">
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
  background-color: #2c2c2c;
}
.nav-status {
  background-color: #2c2c2c;
}
.top-bar-inner {
  height: 88rpx;
  display: flex;
  align-items: center;
  padding: 0 20rpx;
}
.back {
  font-size: 44rpx;
  color: #ffffff;
  width: 60rpx;
}
.title {
  flex: 1;
  text-align: center;
  color: #ffffff;
  font-size: 30rpx;
}
.live-btn {
  font-size: 26rpx;
  color: #009de9;
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
</style>
