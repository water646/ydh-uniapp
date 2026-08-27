<template>
  <view class="page">
    <!-- 顶部白色栏：返回键 + 标题「绑定结果」 -->
    <custom-nav title="绑定结果" />

    <view class="body">
      <!-- 绑定成功 -->
      <template v-if="!isFail">
        <image class="suc-img" src="/static/images/suc.png" mode="aspectFit"></image>
        <view class="suc-title">绑定成功</view>
        <view class="suc-tip">快去接单吧！有收入后可提现到该银行卡</view>
      </template>

      <!-- 绑定失败 -->
      <template v-else>
        <image class="suc-img" src="/static/images/fail.png" mode="aspectFit"></image>
        <view class="suc-title">绑定失败</view>
        <view class="suc-tip">请返回上一页重新验证</view>
      </template>
    </view>
  </view>
</template>

<script setup>
/**
 * 绑卡结果页（成功/失败同页，v-if 切换）
 * 入口：添加银行卡页点「确认」提交后按结果进入；绑卡提交接口待定（当前默认进成功态）。
 * URL 参数 result=fail 时展示绑定失败。
 */
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import customNav from '@/components/custom-nav/custom-nav.vue'

// 是否绑定失败（默认成功）
const isFail = ref(false)

onLoad((options) => {
  if (options && options.result === 'fail') {
    isFail.value = true
  }
})
</script>

<style scoped>
.page {
  min-height: 100vh;
  background-color: #f5f5f5;
}

/* 主体区（顶栏不套此容器，保证白色顶栏铺满屏幕边角含状态栏） */
.body {
  padding: 120rpx 60rpx 0;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.suc-img {
  width: 160rpx;
  height: 160rpx;
}

.suc-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333333;
  margin-top: 40rpx;
}

.suc-tip {
  font-size: 25rpx;
  color: #999999;
  margin-top: 24rpx;
  text-align: center;
  line-height: 40rpx;
}
</style>
