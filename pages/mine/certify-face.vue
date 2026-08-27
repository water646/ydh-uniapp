<template>
  <view class="page">
    <!-- 顶部白色栏：返回键 + 标题「人脸识别」 -->
    <custom-nav title="人脸识别" />

    <view class="body">
      <!-- 中间识别示意图 -->
      <image class="scan-img" src="/static/images/facescan.png" mode="aspectFit"></image>

      <!-- 授权说明 -->
      <view class="scan-tip">
        <view class="tip-title">运动汇 申请</view>
        <view class="tip-text">对你进行人脸识别认证并获取本次认证过程中拍摄的人脸照片，请确保为{{ realName }}本人操作。</view>
      </view>

      <!-- 同意协议勾选 -->
      <view class="agree-row" @click="agreed = !agreed">
        <view class="checkbox" :class="{ on: agreed }">
          <view class="checkbox-dot" v-if="agreed"></view>
        </view>
        <view class="agree-text">同意<text class="agree-link">《认证服务协议》</text></view>
      </view>

      <!-- 底部纵向按钮 -->
      <view class="btn-col">
        <view class="agree-btn" @click="onAgreeCertify">同意协议并认证</view>
        <view class="later-btn" @click="onLater">暂不认证</view>
      </view>
    </view>
  </view>
</template>

<script setup>
/**
 * 人脸识别预备页
 * 入口：实名认证页通过姓名/身份证校验后进入（携带 name）；
 * 勾选协议后点「同意协议并认证」进认证成功页（识别方案待定，暂直达）。
 */
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import customNav from '@/components/custom-nav/custom-nav.vue'

// 上一页填写的姓名
const realName = ref('')

// 是否勾选同意协议
const agreed = ref(false)

onLoad((opt) => {
  realName.value = opt && opt.name ? decodeURIComponent(opt.name) : ''
})

/** 同意协议并认证：识别流程未接入，暂直达成功页（方案确定后在此调起识别） */
function onAgreeCertify() {
  if (!agreed.value) {
    return uni.showToast({ title: '请先同意认证服务协议', icon: 'none' })
  }
  uni.navigateTo({ url: '/pages/mine/certify-success' })
}

/** 暂不认证：返回上一页 */
function onLater() {
  uni.navigateBack()
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  background-color: #ffffff;
}

/* 主体区（顶栏不套此容器，保证白色顶栏铺满屏幕边角含状态栏） */
.body {
  padding: 80rpx 60rpx 0;
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* 识别示意图 */
.scan-img {
  width: 300rpx;
  height: 300rpx;
}

/* 授权说明 */
.scan-tip {
  margin-top: 40rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.tip-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333333;
}

.tip-text {
  margin-top: 20rpx;
  font-size: 26rpx;
  color: #666666;
  line-height: 42rpx;
  text-align: center;
}

/* 同意协议勾选行 */
.agree-row {
  margin-top: 40rpx;
  display: flex;
  align-items: center;
}

/* 自绘圆形勾选框：选中主题绿描边 + 内部实心圆点 */
.checkbox {
  width: 34rpx;
  height: 34rpx;
  border-radius: 50%;
  border: 3rpx solid #cccccc;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12rpx;
}

.checkbox.on {
  border-color: #00B39B;
}

.checkbox-dot {
  width: 18rpx;
  height: 18rpx;
  border-radius: 50%;
  background-color: #00B39B;
}

.agree-text {
  font-size: 25rpx;
  color: #666666;
}

/* 协议名：主题绿 */
.agree-link {
  color: #00B39B;
}

/* 底部按钮：纵向排列 */
.btn-col {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 80rpx;
}

/* 同意并认证：主题绿胶囊 */
.agree-btn {
  width: 620rpx;
  height: 88rpx;
  border-radius: 44rpx;
  background-color: #00B39B;
  color: #ffffff;
  font-size: 30rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 暂不认证：灰底白字胶囊 */
.later-btn {
  width: 620rpx;
  height: 88rpx;
  border-radius: 44rpx;
  background-color: #e9e9e9;
  color: #333333;
  font-size: 30rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 30rpx;
}
</style>
