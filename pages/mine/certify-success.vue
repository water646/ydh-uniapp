<template>
  <view class="page">
    <!-- 顶部白色栏：返回键 + 标题「认证成功」 -->
    <custom-nav title="认证成功" />

    <view class="body">
      <!-- 认证成功示意图 -->
      <image class="suc-img" src="/static/images/certsuc.png" mode="aspectFit"></image>
      <!-- 灰色结果文字 -->
      <view class="suc-text">认证成功</view>
      <!-- 倒计时提示：3-2-1 -->
      <view class="count-text">{{ seconds }}秒后自动返回</view>
    </view>
  </view>
</template>

<script setup>
/**
 * 认证成功页
 * 入口：人脸识别预备页「同意协议并认证」（当前识别流程未接入，先直达成功）；
 * 3-2-1 倒计时结束后自动回到 mine 页。
 */
import { ref, onUnmounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import customNav from '@/components/custom-nav/custom-nav.vue'

// 倒计时秒数（3-2-1）
const seconds = ref(3)

let timer = null

onLoad(() => {
  timer = setInterval(() => {
    seconds.value--
    if (seconds.value <= 0) {
      clearInterval(timer)
      timer = null
      uni.reLaunch({ url: '/pages/mine/index' })
    }
  }, 1000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<style scoped>
.page {
  min-height: 100vh;
  background-color: #ffffff;
}

/* 主体区（顶栏不套此容器，保证白色顶栏铺满屏幕边角含状态栏） */
.body {
  padding-top: 220rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* 成功示意图（原图 300x236） */
.suc-img {
  width: 300rpx;
  height: 236rpx;
}

/* 灰色结果文字 */
.suc-text {
  margin-top: 40rpx;
  font-size: 30rpx;
  color: #999999;
}

/* 倒计时提示 */
.count-text {
  margin-top: 24rpx;
  font-size: 26rpx;
  color: #bbbbbb;
}
</style>
