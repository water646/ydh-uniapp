<template>
  <view class="page">
    <!-- 顶部白色栏：返回键 + 标题「实名认证」 -->
    <custom-nav title="实名认证" />

    <view class="body">
      <!-- 姓名：label 在上，值坐横线 -->
      <view class="field-col">
        <view class="field-label">姓名:</view>
        <view class="input-line">
          <input class="field-line-input" v-model="realName" placeholder="请输入真实姓名" placeholder-class="ph-gray" />
        </view>
      </view>

      <!-- 身份证号：label 在上，值坐横线 -->
      <view class="field-col">
        <view class="field-label">身份证号:</view>
        <view class="input-line">
          <input class="field-line-input" v-model="idCard" type="idcard" maxlength="18" placeholder="请输入身份证号" placeholder-class="ph-gray" />
        </view>
      </view>

      <!-- 开始人脸识别 -->
      <view class="center-wrap">
        <view class="submit-btn" @click="onFace">开始人脸识别</view>
      </view>
    </view>
  </view>
</template>

<script setup>
/**
 * 实名认证：填写姓名 + 身份证号，先经 user/authCard 核验，通过后进人脸识别页
 * 入口：mine 菜单「我的认证」（未认证/审核中）。
 */
import { ref } from 'vue'
import customNav from '@/components/custom-nav/custom-nav.vue'
import { authCard } from '@/api/login'

const realName = ref('')
const idCard = ref('')

/**
 * 进人脸识别页
 * 暂不以后端 user/authCard 的返回为准（后端联调中），请求照发但不拦截，直接进下一页。
 */
function onFace() {
  if (!realName.value.trim()) {
    return uni.showToast({ title: '请输入姓名', icon: 'none' })
  }
  if (!/^\d{17}[\dXx]$/.test(idCard.value)) {
    return uni.showToast({ title: '请输入正确的身份证号', icon: 'none' })
  }
  // 照发核验请求（失败静默），后端就绪后恢复按返回拦截
  authCard(realName.value.trim(), idCard.value.trim().toUpperCase()).catch(() => {})
  uni.navigateTo({ url: '/pages/mine/certify-face?name=' + encodeURIComponent(realName.value.trim()) })
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  background-color: #ffffff;
}

/* 主体区（顶栏不套此容器，保证白色顶栏铺满屏幕边角含状态栏） */
.body {
  padding: 40rpx 32rpx;
}

/* 纵向字段：label 一行，值落在下方横线上 */
.field-col {
  margin-bottom: 50rpx;
  display: flex;
  flex-direction: column;
}

/* 加粗字段名在横线上方 */
.field-label {
  font-size: 25rpx;
  font-weight: bold;
  color: #333333;
  margin-bottom: 30rpx;
}

.input-line {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 3rpx solid #edf1f5;
}

.field-line-input {
  height: 50rpx;
  font-size: 28rpx;
  color: #333333;
}

.ph-gray {
  color: #bbbbbb;
}

/* 居中包裹（按钮所在行） */
.center-wrap {
  display: flex;
  justify-content: center;
}

/* 人脸识别按钮：主题绿胶囊 */
.submit-btn {
  width: 620rpx;
  height: 88rpx;
  border-radius: 44rpx;
  background-color: #00B39B;
  color: #ffffff;
  font-size: 30rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 60rpx;
}
</style>
