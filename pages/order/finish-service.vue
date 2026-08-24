<template>
  <view class="page">
    <custom-nav title="结束服务申请" />

    <view class="body">
    <!-- 订单信息（与首页卡片同款信息行 + 图标） -->
    <view class="card">
      <view class="card-title">基本信息</view>
      <view class="info-line">
        <image class="info-icon" src="/static/images/infoicon.png"></image>
        <p class="info-row">派单时间: {{ order.assignTime || '—' }}</p>
      </view>
      <view class="info-line">
        <image class="info-icon" src="/static/images/infoicon.png"></image>
        <p class="info-row">服务比赛: {{ order.serviceMatch || '—' }}</p>
      </view>
      <view class="info-line">
        <image class="info-icon" src="/static/images/infoicon.png"></image>
        <p class="info-row">服务角色: {{ order.serviceRole || '—' }}</p>
      </view>
      <view class="info-line">
        <image class="info-icon" src="/static/images/infoicon.png"></image>
        <p class="info-row">服务开始时间: {{ order.serviceStartTime || '—' }}</p>
      </view>
      <view class="info-line">
        <image class="info-icon" src="/static/images/infoicon.png"></image>
        <p class="info-row">服务单号: {{ order.orderNumber || '—' }}</p>
      </view>
      <p class="info-row pay-row" v-if="order.paymentResult">打款: {{ order.paymentResult }}（{{ order.paymentTime }}）</p>
    </view>

    <!-- 服务详情：现场图片/视频上传（URL 上传待接入，先留本地临时路径） -->
    <view class="card" style="padding-bottom: 30rpx;">
      <view class="card-title">服务详情</view>

      <view class="upload-label">现场图片</view>
      <view class="upload-grid">
        <view class="img-cell" v-for="(p, i) in images" :key="i">
          <image class="upload-cell" :src="p.path" mode="aspectFill" @click="previewImage(i)"></image>
          <view class="del-badge" @click.stop="removeImage(i)">
            <view class="del-icon"></view>
          </view>
        </view>
        <view class="upload-box" v-if="images.length < IMG_MAX" @click="onChooseImage">
          <view class="plus"></view>
        </view>
      </view>

      <view class="upload-label">现场视频</view>
      <view class="upload-grid">
        <view class="video-cell" v-for="(v, i) in videos" :key="i">
          <video class="video-player" :src="v.path" :controls="false" object-fit="cover"></video>
          <text class="video-duration" v-if="v.duration">{{ fmtDur(v.duration) }}</text>
          <view class="del-badge" @click.stop="removeVideo(i)">
            <view class="del-icon"></view>
          </view>
        </view>
        <view class="upload-box" v-if="videos.length < VIDEO_MAX" @click="onChooseVideo">
          <view class="plus"></view>
        </view>
      </view>
    </view>

    <!-- 服务总结 -->
    <view class="card" style="padding-bottom: 30rpx;">
      <view class="card-title">服务总结</view>
      <textarea class="summary"  v-model="summary" placeholder="填写服务总结（选填）" placeholder-class="summary-ph" />
    </view>

    <view class="submit-btn" @click="onSubmit">
      <text class="submit-text">提交申请</text>
    </view>
    </view>
  </view>
</template>

<script setup>
/**
 * 结束服务申请（框架页）
 * 入口：首页「服务中」订单卡片的「结束服务申请」按钮。
 * 上传：选中即逐个 POST oss/file/upload 换取 URL；提交申请接口待后端提供。
 */
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import customNav from '@/components/custom-nav/custom-nav.vue'
import { uploadFile } from '@/api/upload'

const order = ref({})
const summary = ref('') // 服务总结

// 已选素材：path 为本地临时路径（用于展示），url 为上传成功后 OSS 地址；视频带时长用于角标
const images = ref([]) // [{ path, url }]
const videos = ref([]) // [{ path, duration, url }]
const IMG_MAX = 9
const VIDEO_MAX = 3

onLoad((opts) => {
  // 订单对象由首页整体传入，解析失败则保持空壳（各行显示 —）
  try {
    if (opts && opts.data) order.value = JSON.parse(decodeURIComponent(opts.data))
  } catch (e) {
    order.value = {}
  }
})

/** 逐个上传，返回成功条目（单个失败已 toast，跳过该文件） */
async function uploadEach(paths, makeItem) {
  const ok = []
  for (const p of paths) {
    try {
      const url = await uploadFile(p)
      ok.push(makeItem(p, url))
    } catch (e) {
      /* 失败的跳过，不进宫格 */
    }
  }
  return ok
}

/** 选现场图片（相册/拍照），选完逐个上传换 URL */
function onChooseImage() {
  if (images.value.length >= IMG_MAX) {
    return uni.showToast({ title: '最多 ' + IMG_MAX + ' 张图片', icon: 'none' })
  }
  uni.chooseImage({
    count: IMG_MAX - images.value.length,
    sizeType: ['compressed'],
    success: async (res) => {
      const paths = res.tempFilePaths || []
      if (!paths.length) return
      uni.showLoading({ title: '上传中...', mask: true })
      const items = await uploadEach(paths, (p, url) => ({ path: p, url }))
      images.value = images.value.concat(items)
      uni.hideLoading()
    }
  })
}

function previewImage(i) {
  uni.previewImage({ urls: images.value.map((x) => x.path), current: i })
}

/** 删除已选素材：仅移出宫格（已上传到 OSS 的文件不回收） */
function removeImage(i) {
  images.value.splice(i, 1)
}

function removeVideo(i) {
  videos.value.splice(i, 1)
}

/** 选现场视频（相册/拍摄），一次一个，选完上传换 URL */
function onChooseVideo() {
  if (videos.value.length >= VIDEO_MAX) {
    return uni.showToast({ title: '最多 ' + VIDEO_MAX + ' 个视频', icon: 'none' })
  }
  uni.chooseVideo({
    sourceType: ['album', 'camera'],
    compressed: true,
    success: async (res) => {
      if (!res.tempFilePath) return
      uni.showLoading({ title: '上传中...', mask: true })
      const items = await uploadEach([res.tempFilePath], (p, url) => ({ path: p, duration: res.duration || 0, url }))
      videos.value = videos.value.concat(items)
      uni.hideLoading()
    }
  })
}

/** 秒数格式化为 m:ss */
function fmtDur(sec) {
  sec = Math.round(sec || 0)
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return m + ':' + String(s).padStart(2, '0')
}

function onSubmit() {
  // TODO: 提交结束服务申请接口，成功后订单状态应变为「服务完成」
  // 提交时素材取 URL：images.value.map(x => x.url)、videos.value.map(x => x.url)
  uni.showToast({ title: '提交接口待接入', icon: 'none' })
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  background-color: #f5f6f8;
}

/* 内容区（顶栏不套此容器，保证白色顶栏铺满屏幕边角含状态栏） */
.body {
  padding: 24rpx;
}

.card {
  background-color: #ffffff;
  border-radius: 20rpx;
  padding: 28rpx 28rpx 0 28rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.04);
}

.card-title {
  font-size: 30rpx;
  font-weight: bold;
  color: #333333;
  margin-bottom: 24rpx;
}

/* 信息行（同首页订单卡片） */
.info-line {
  display: flex;
  padding-top: 25rpx;
  padding-bottom: 5rpx;
  border-top: 1rpx solid rgba(0,0,0,0.1);
}

.info-icon {
  width: 30rpx;
  height: 30rpx;
  margin-right: 10rpx;
  flex-shrink: 0;
}

.info-row {
  font-size: 26rpx;
  margin-bottom: 22rpx;
}

.pay-row {
  color: #03b098;
}

/* 上传分区小标题 */
.upload-label {
  font-size: 26rpx;
  color: #666666;
  margin-bottom: 16rpx;
}

/* 上传宫格：已选图片 + 末尾的上传框同行排列，超出换行 */
.upload-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
  margin-bottom: 24rpx;
}

.upload-cell {
  width: 200rpx;
  height: 200rpx;
  border-radius: 16rpx;
}

/* 上传框：主题绿虚线圆角正方形（与图片同尺寸） */
.upload-box {
  width: 200rpx;
  height: 200rpx;
  border: 2rpx dashed #03b098;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* css 画加号：横竖两根短棒 */
.plus {
  position: relative;
  width: 56rpx;
  height: 56rpx;
}

.plus::before,
.plus::after {
  content: '';
  position: absolute;
  background-color: #03b098;
  border-radius: 4rpx;
}

.plus::before {
  width: 56rpx;
  height: 4rpx;
  top: 26rpx;
  left: 0;
}

.plus::after {
  width: 4rpx;
  height: 56rpx;
  left: 26rpx;
  top: 0;
}

/* 已选图片格：承载图片 + 右上角删除角标 */
.img-cell {
  position: relative;
  width: 200rpx;
  height: 200rpx;
}

/* 删除角标：主题绿圆底 + 白叉，压在素材格右上角 */
.del-badge {
  position: absolute;
  top: -10rpx;
  right: -10rpx;
  width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
  background-color: #03b098;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
}

/* css 画白叉：加号旋转 45° 即成叉 */
.del-icon {
  position: relative;
  width: 20rpx;
  height: 20rpx;
  transform: rotate(45deg);
}

.del-icon::before,
.del-icon::after {
  content: '';
  position: absolute;
  background-color: #ffffff;
  border-radius: 2rpx;
}

.del-icon::before {
  width: 20rpx;
  height: 3rpx;
  top: 8.5rpx;
  left: 0;
}

.del-icon::after {
  width: 3rpx;
  height: 20rpx;
  left: 8.5rpx;
  top: 0;
}

/* 已选视频格：video 组件首帧即封面，右下角时长角标 */
.video-cell {
  position: relative;
  width: 200rpx;
  height: 200rpx;
}

.video-player {
  width: 200rpx;
  height: 200rpx;
  border-radius: 16rpx;
  display: block;
}

.video-duration {
  position: absolute;
  right: 10rpx;
  bottom: 10rpx;
  font-size: 20rpx;
  color: #ffffff;
  background-color: rgba(0, 0, 0, 0.5);
  border-radius: 8rpx;
  padding: 2rpx 10rpx;
}

/* 服务总结输入框 */
.summary {
  width: 100%;
  height: 200rpx;
  background-color: #f5f6f8;
  border-radius: 12rpx;
  padding: 20rpx;
  font-size: 26rpx;
  box-sizing: border-box;
}

.summary-ph {
  color: #bbbbbb;
}

/* 提交按钮（样式参考首页接单按钮） */
.submit-btn {
  height: 88rpx;
  border-radius: 44rpx;
  background-color: #03b098;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 40rpx;
}

.submit-text {
  font-size: 30rpx;
  color: #ffffff;
  font-weight: 550;
}
</style>
