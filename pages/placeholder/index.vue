<template>
  <view class="placeholder">
    <custom-nav :title="title" />
    <view class="content">
      <view class="icon">⚠</view>
      <text class="msg">{{ msg }}</text>
    </view>
  </view>
</template>

<script setup>
/**
 * 通用占位页
 * 用于 PTP 单反控制、录像、尚未实现的批次入口等
 */
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import customNav from '@/components/custom-nav/custom-nav.vue'

const title = ref('')
const msg = ref('该功能暂未实现')

onLoad((opt) => {
  title.value = opt.title || ''
  msg.value = opt.msg || '该功能暂未实现'
  uni.setNavigationBarTitle({ title: title.value })
})
</script>

<style lang="scss" scoped>
.placeholder {
  min-height: 100vh;
  background-color: #f8f8f8;
}
.content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-top: 240rpx;
}
.icon {
  font-size: 100rpx;
  color: #ff6f21;
  margin-bottom: 30rpx;
}
.msg {
  font-size: 28rpx;
  color: #999999;
  padding: 0 60rpx;
  text-align: center;
}
</style>
