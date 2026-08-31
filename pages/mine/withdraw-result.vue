<template>
  <view class="page">
    <!-- 顶部白色栏：返回键 + 标题「提现结果」 -->
    <custom-nav title="提现结果" />

    <view class="body">
      <image class="suc-img" src="/static/images/suc.png" mode="aspectFit"></image>
      <view class="suc-title">提现申请成功</view>
      <view class="suc-tip">请注意查询银行卡余额，如未到账，请联系客服处理</view>
      <view class="suc-phone">客服电话 <text class="suc-phone-num">400888</text></view>
    </view>
  </view>
</template>

<script setup>
/**
 * 提现申请结果页
 * 入口：提现页点「提现」通过校验后进入；提现提交接口待定（当前进页即视为已受理展示）。
 */
onMounted(()=>{
	  uni.showToast({ title: '提现接口待接入', icon: 'none' })
})


import { onMounted } from 'vue';
import customNav from '@/components/custom-nav/custom-nav.vue'
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

/* 客服电话：号码主题绿 */
.suc-phone {
  font-size: 25rpx;
  color: #999999;
  margin-top: 10rpx;
}

.suc-phone-num {
  color: #00B39B;
  font-weight: bold;
}
</style>
