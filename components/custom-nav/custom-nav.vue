<template>
  <view class="custom-nav">
    <view class="nav-status" :style="{ height: statusBarHeight + 'px' }"></view>
    <view class="nav-content" :style="{ height: navHeight + 'px' }">
      <view class="nav-left" @click="onBack">
        <text v-if="showBack" class="back">‹</text>
        <slot v-else name="left" />
      </view>
      <view class="nav-title">{{ title }}</view>
      <view class="nav-right"><slot name="right" /></view>
    </view>
    <view class="nav-line"></view>
  </view>
</template>

<script setup>
/**
 * 通用标题栏（对应 res/layout/include_title.xml）
 * 白底 50dp，标题 17dp 居中黑色，返回键 45dp，底部 1px #d9d9d9 分割线
 */
import { ref } from 'vue'

defineProps({
  title: { type: String, default: '' },
  showBack: { type: Boolean, default: true }
})
const emit = defineEmits(['back'])

const statusBarHeight = ref(0)
const navHeight = ref(50)

const sysInfo = uni.getSystemInfoSync()
statusBarHeight.value = sysInfo.statusBarHeight || 0

function onBack() {
  emit('back')
  const pages = getCurrentPages()
  if (pages.length > 1) {
    uni.navigateBack()
  }
}
</script>

<style lang="scss" scoped>
.custom-nav {
  background-color: #ffffff;
}
.nav-content {
  display: flex;
  align-items: center;
  position: relative;
}
.nav-left {
  width: 90rpx;
  height: 90rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}
.back {
  font-size: 52rpx;
  color: #333333;
  line-height: 1;
}
.nav-title {
  flex: 1;
  text-align: center;
  font-size: 34rpx;
  color: #000000;
  font-weight: 500;
}
.nav-right {
  min-width: 90rpx;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-right: 20rpx;
}
.nav-line {
  height: 1rpx;
  background-color: #d9d9d9;
}
</style>
