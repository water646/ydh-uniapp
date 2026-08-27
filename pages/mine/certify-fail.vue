<template>
  <view class="page">
    <!-- 顶部白色栏：返回键 + 标题「认证失败」 -->
    <custom-nav title="认证失败" />

    <view class="body">
      <!-- 认证失败示意图 -->
      <image class="fail-img" src="/static/images/certfail.png" mode="aspectFit"></image>
      <!-- 灰色结果文字 -->
      <view class="fail-text">认证失败，请重新认证</view>
      <!-- 倒计时提示：3-2-1 -->
      <view class="count-text">{{ seconds }}秒后自动返回</view>
    </view>
  </view>
</template>

<script setup>
/**
 * 认证失败页（暂无入口，识别流程接入后由人脸识别结果分流进入）
 * 3-2-1 倒计时结束后自动返回上一页。
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
      // 无上级页面（如直接输 URL 进来）时兜底回 mine
      uni.navigateBack({
        fail: () => uni.reLaunch({ url: '/pages/mine/index' })
      })
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

/* 失败示意图（原图 280x258） */
.fail-img {
  width: 280rpx;
  height: 258rpx;
}

/* 灰色结果文字 */
.fail-text {
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
