<template>
  <view class="live-photo">
    <view class="top-bar">
      <view class="nav-status" :style="{ height: statusBarHeight + 'px' }"></view>
      <view class="top-bar-inner">
        <view class="back" @click="back"><image class="back-icon" src="/static/mipmap-xxhdpi/black_back.png" mode="aspectFit" /></view>
        <text class="title">拍照直播</text>
      </view>
    </view>

    <view class="info-bar">
      <text class="info-text">已上传 {{ uploaded }} 张</text>
      <text v-if="uploading" class="uploading">上传中…</text>
    </view>

    <view class="actions">
      <view class="btn camera" @click="takePhoto">📷 拍照</view>
      <view class="btn album" @click="choosePhoto">从相册选择</view>
    </view>

    <scroll-view scroll-y class="preview-list">
      <view class="grid">
        <image
          v-for="(p, i) in localPhotos"
          :key="i"
          class="preview-img"
          :src="p"
          mode="aspectFill"
        />
      </view>
      <empty-layout v-if="!localPhotos.length" status="empty" />
    </scroll-view>

    <view class="tip">
      原项目使用 USB 连接单反相机（PTP 协议）取片上传，uniapp 无 USB host 能力无法实现，
      此处改为手机摄像头拍照 / 相册选图后上传。
    </view>
  </view>
</template>

<script setup>
/**
 * 拍照直播（对应 LivePhotoActivity）
 * 原项目：USB 单反（PTP）取片 + OSS 断点续传，强依赖 USB host，uniapp 完全不可迁移
 * 本页改为：uni.chooseImage 拍照/选图 + 上传（uploadToOSS）
 * 单反 USB 控制若需保留，只能封装 uni 原生插件复用原 Java（混合架构）
 */
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import emptyLayout from '@/components/empty-layout/empty-layout.vue'
import { uploadToOSS } from '@/utils/oss'

// 状态栏高度（custom 导航页需自行留出状态栏空间，避免与系统时间/电量栏重叠）
const statusBarHeight = uni.getSystemInfoSync().statusBarHeight || 0

const id = ref('')
const uploaded = ref(0)
const uploading = ref(false)
const localPhotos = ref([])

onLoad((opt) => {
  id.value = opt.id || ''
})

function takePhoto() {
  uni.chooseImage({
    count: 1,
    sourceType: ['camera'],
    success: (r) => doUpload(r.tempFilePaths)
  })
}

function choosePhoto() {
  uni.chooseImage({
    count: 9,
    sourceType: ['album'],
    success: (r) => doUpload(r.tempFilePaths)
  })
}

function doUpload(paths) {
  uploading.value = true
  let pending = paths.length
  paths.forEach((fp) => {
    localPhotos.value.unshift(fp)
    uploadToOSS(fp, id.value)
      .then((res) => {
        if (res.code === 1) uploaded.value++
      })
      .catch(() => {
        uni.showToast({ title: '上传失败', icon: 'none' })
      })
      .finally(() => {
        pending--
        if (pending === 0) uploading.value = false
      })
  })
}

function back() {
  uni.navigateBack()
}
</script>

<style lang="scss" scoped>
.live-photo {
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
  padding: 0 20rpx;
}
.back {
  font-size: 44rpx;
  color: #000000;
  width: 60rpx;
}
.title {
  position: absolute;
  left: 80rpx;
  right: 80rpx;
  top: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  color: #000000;
  font-size: 30rpx;
}
.info-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx;
}
.info-text {
  font-size: 26rpx;
  color: #29a871;
}
.uploading {
  font-size: 24rpx;
  color: #ff6f21;
}
.actions {
  display: flex;
  gap: 16rpx;
  padding: 0 20rpx 20rpx;
}
.btn {
  flex: 1;
  height: 80rpx;
  line-height: 80rpx;
  text-align: center;
  border-radius: 40rpx;
  font-size: 28rpx;
}
.btn.camera {
  background-color: #29a871;
  color: #ffffff;
}
.btn.album {
  background-color: #009de9;
  color: #ffffff;
}
.preview-list {
  flex: 1;
}
.grid {
  display: flex;
  flex-wrap: wrap;
  padding: 16rpx;
  gap: 12rpx;
}
.preview-img {
  width: calc(33.33% - 8rpx);
  height: 220rpx;
  border-radius: 8rpx;
}
.tip {
  padding: 20rpx;
  font-size: 22rpx;
  color: #999999;
  line-height: 1.5;
  background-color: #fff8e8;
}
.back-icon {
  width: 100rpx;
  height: 100rpx;
}
</style>
