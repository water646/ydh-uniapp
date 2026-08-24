<template>
  <view class="page">
    <!-- 左上角悬浮返回键（同身份选择页样式） -->
    <image class="back-btn" src="/static/mipmap-xxhdpi/black_back.png" mode="aspectFit" @click="onBack"></image>

    <!-- 顶部标题：居中悬浮，不用线条与内容分隔 -->
    <view class="nav-title">修改手机号</view>

    <!-- 原手机号（user/info） -->
	<view class="content">
		<view class="phone-box">
			<view class="phone-label">原手机号:</view>
			<view class="phone-num">{{ phone }}</view>
		</view>
		
		<!-- 验证码胶囊：左 2/3 输入，右 1/3 获取验证码（倒计时置灰） -->
		<view class="center-wrap">
			<view class="code-bar">
				<input class="code-input" v-model="code" type="number" maxlength="6" placeholder="请输入验证码" placeholder-class="code-ph" />
				<view class="code-btn" :class="{ counting: counting }" @click="onSendCode">{{ counting ? seconds + 's后重新发送' : '获取验证码' }}</view>
			</view>
		</view>

		<!-- 下一步：直接可点，前端不校验 -->
		<view class="center-wrap">
			<view class="next-btn" @click="onNext">下一步</view>
		</view>

	</view>
  </view>
</template>

<script setup>
/**
 * 修改手机号
 * 入口：「账号管理」页「修改手机号」卡片；原手机号来自 user/info。
 */
import { ref, onUnmounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { getUserInfo, getNote } from '@/api/login'

const phone = ref('—')

onShow(() => {
  getUserInfo().then((res) => {
    if (res.code === 1 && res.data) {
      phone.value = res.data.phone || '—'
    }
  }).catch(() => {})
})

// 验证码输入 + 60s 重发倒计时
const code = ref('')
const counting = ref(false)
const seconds = ref(60)
let timer = null

/** 获取验证码：发送成功后进入 60s 倒计时（暂用登录短信接口，修改手机号专用接口后端给了可替换） */
function onSendCode() {
  if (counting.value) return
  if (!phone.value || phone.value === '—') {
    return uni.showToast({ title: '手机号未加载', icon: 'none' })
  }
  getNote(phone.value).then((res) => {
    if (res.code === 1) {
      uni.showToast({ title: '验证码已发送', icon: 'none' })
      counting.value = true
      seconds.value = 60
      timer = setInterval(() => {
        seconds.value--
        if (seconds.value <= 0) {
          clearInterval(timer)
          timer = null
          counting.value = false
        }
      }, 1000)
    }
  }).catch(() => {})
}

onUnmounted(() => {
  if (timer) clearInterval(timer)
})

/** 下一步：直接进入「输入新手机号」步骤（前端不校验，交由后端） */
function onNext() {
  uni.navigateTo({ url: '/pages/mine/phone-new' })
}

function onBack() {
  if (getCurrentPages().length > 1) {
    uni.navigateBack()
  } else {
    // 兜底：热同步重载后页面栈只剩本页时，回首页 tab
    uni.switchTab({ url: '/pages/home/index' })
  }
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  background-color: #ffffff;
}

/* 悬浮返回键：状态栏下方一点，左上角（同身份选择页） */
.back-btn {
  position: fixed;
  top: calc(var(--status-bar-height) + 24rpx);
  left: 24rpx;
  width: 80rpx;
  height: 80rpx;
  z-index: 10;
}

/* 标题：与返回键同一水平带，居中，无分隔线 */
.nav-title {
  position: fixed;
  top: calc(var(--status-bar-height) + 40rpx);
  left: 0;
  right: 0;
  text-align: center;
  font-size: 34rpx;
  /* font-weight: bold; */
  color: #333333;
}

/* 原手机号区 */
.content {
  padding-top: 200rpx;
}

.phone-box {
  margin-left: 100rpx;
  margin-bottom: 50rpx;
}

.phone-label{
  font-size: 25rpx;
  margin-bottom: 28rpx;;
}

.phone-num {
  font-size: 35rpx;
  margin-bottom: 28rpx;;
}

/* 居中包裹（胶囊/按钮所在行） */
.center-wrap {
  display: flex;
  justify-content: center;
}

/* 下一步按钮：与验证码胶囊同宽（始终可点） */
.next-btn {
  width: 620rpx;
  height: 88rpx;
  border-radius: 44rpx;
  background-color: #00b39b;
  color: #ffffff;
  font-size: 30rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 60rpx;
}

/* 验证码胶囊：左 2/3 输入区（浅灰底），右 1/3 获取按钮（主题绿） */
.code-bar {
  display: flex;
  align-items: center;
  width: 620rpx;
  height: 68rpx;
  border-radius: 44rpx;
  background-color: #ffffff;
  border:3rpx solid #f2f3f5;
  overflow: hidden;
}

.code-input {
  flex: 1;
  height: 88rpx;
  padding: 0 30rpx;
  font-size: 28rpx;
  color: #333333;
}

.code-ph {
  color: #bbbbbb;
}

.code-btn {
  width: 33%;
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #00b39b;
  color: #ffffff;
  font-size: 22rpx;
}

/* 倒计时中：置灰不可再点 */
.code-btn.counting {
  background-color: #cacaca;
}
</style>
