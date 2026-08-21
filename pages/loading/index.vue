<template>
  <view class="loading">
    <image class="bg" src="/static/loading_bg.png" mode="aspectFill" />
    <view class="brand">智能技术台</view>
  </view>
</template>

<script setup>
/**
 * 启动/闪屏页（对应 loadingActivity）
 * 运行时申请权限 -> 1s 后按登录态路由：已登录->main，未登录->login
 */
import { onLoad } from '@dcloudio/uni-app'
import { useUserStore } from '@/store/user'

const userStore = useUserStore()

onLoad(() => {
  requestPermissions().then(() => {
    setTimeout(() => {
      if (userStore.isLogin) {
        uni.reLaunch({ url: '/pages/home/index' })
      } else {
        uni.reLaunch({ url: '/pages/login/index' })
      }
    }, 1000)
  })
})

/** 申请运行时权限（对应 loadingActivity 的 RxPermissions） */
function requestPermissions() {
  // #ifdef APP-PLUS
  return new Promise((resolve) => {
    const perms = [
      'android.permission.READ_PHONE_STATE',
      'android.permission.RECORD_AUDIO',
      'android.permission.WRITE_EXTERNAL_STORAGE',
      'android.permission.CAMERA'
    ]
    try {
      plus.android.requestPermissions(
        perms,
        () => resolve(),
        () => resolve()
      )
    } catch (e) {
      resolve()
    }
  })
  // #endif
  // #ifndef APP-PLUS
  return Promise.resolve()
  // #endif
}
</script>

<style lang="scss" scoped>
.loading {
  width: 100%;
  height: 100vh;
  position: relative;
  background-color: #29a871;
}
.bg {
  width: 100%;
  height: 100%;
}
.brand {
  position: absolute;
  bottom: 200rpx;
  width: 100%;
  text-align: center;
  color: #ffffff;
  font-size: 40rpx;
  letter-spacing: 4rpx;
}
</style>
