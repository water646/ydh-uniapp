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
        <view v-for="(p, i) in localPhotos" :key="i" class="preview-item">
          <image class="preview-img" :src="p.url" mode="aspectFill" />
          <text v-if="p.status === 'uploading'" class="badge uploading">上传中</text>
          <text v-else-if="p.status === 'done'" class="badge done">已上传</text>
          <text v-else-if="p.status === 'fail'" class="badge fail">失败</text>
        </view>
      </view>
      <empty-layout v-if="!localPhotos.length" status="empty" />
    </scroll-view>

    <view class="tip">
      原项目使用 USB 连接单反相机（PTP 协议）取片后自动上传，uniapp 无 USB host 能力无法实现，
      此处改为手机摄像头拍照 / 相册选图后自动上传（选图即传，无需点按钮）。
    </view>
  </view>
</template>

<script setup>
/**
 * 拍照直播（对应 LivePhotoActivity）
 * 原项目：USB 单反（PTP）取片 + OSS 自动上传，强依赖 USB host，uniapp 完全不可迁移
 * 本页改为：uni.chooseImage 拍照/选图 -> 选图即自动 uploadToOSS 上传
 * 上传情况通过顶部「已上传 X 张 / 上传中」+ 每张角标(上传中/已上传/失败) + 结束 toast 提示
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
// { url, status: 'uploading' | 'done' | 'fail' }
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
  let success = 0
  let fail = 0
  let left = paths.length
  paths.forEach((fp) => {
    const item = { url: fp, status: 'uploading' }
    localPhotos.value.unshift(item)
    uploadToOSS(fp, id.value)
      .then((res) => {
        if (res.code === 1) { item.status = 'done'; success++; uploaded.value++ }
        else { item.status = 'fail'; fail++ }
      })
      .catch(() => { item.status = 'fail'; fail++ })
      .finally(() => {
        left--
        if (left === 0) {
          uploading.value = false
          // 上传结束提示情况
          if (fail === 0) {
            uni.showToast({ title: `上传成功 ${success} 张`, icon: 'success' })
          } else if (success === 0) {
            uni.showToast({ title: `上传失败 ${fail} 张`, icon: 'none' })
          } else {
            uni.showToast({ title: `成功 ${success} 张，失败 ${fail} 张`, icon: 'none' })
          }
        }
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
.preview-item {
  position: relative;
  width: calc(33.33% - 8rpx);
}
.preview-img {
  width: 100%;
  height: 220rpx;
  border-radius: 8rpx;
}
.badge {
  position: absolute;
  bottom: 6rpx;
  left: 6rpx;
  font-size: 18rpx;
  padding: 2rpx 8rpx;
  border-radius: 4rpx;
  color: #ffffff;
}
.badge.uploading {
  background-color: #ff6f21;
}
.badge.done {
  background-color: #29a871;
}
.badge.fail {
  background-color: #ff2d2d;
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
