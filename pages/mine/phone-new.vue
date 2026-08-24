<template>
  <view class="page">
    <!-- 左上角悬浮返回键（同上一页样式） -->
    <image class="back-btn" src="/static/mipmap-xxhdpi/black_back.png" mode="aspectFit" @click="onBack"></image>

    <!-- 顶部标题：居中悬浮，不用线条与内容分隔 -->
    <view class="nav-title">修改手机号</view>

    <!-- 新手机号（横线输入） -->
	<view class="content">
		<view class="phone-box">
			<view class="phone-label">输入新手机号:</view>
			<input class="new-phone-input" v-model="newPhone" type="number" maxlength="11" placeholder="请输入新手机号" placeholder-class="ph-gray" />
		</view>

		<!-- 验证码胶囊：左 2/3 输入，右 1/3 获取验证码（倒计时置灰） -->
		<view class="center-wrap">
			<view class="code-bar">
				<input class="code-input" v-model="code" type="number" maxlength="6" placeholder="请输入验证码" placeholder-class="ph-gray" />
				<view class="code-btn" :class="{ counting: counting }" @click="onSendCode">{{ counting ? seconds + 's后重新发送' : '获取验证码' }}</view>
			</view>
		</view>

		<!-- 下一步：直接可点，前端不校验 -->
		<view class="center-wrap">
			<view class="next-btn" @click="onNext">下一步</view>
		</view>

	</view>

	<!-- 修改成功弹窗（同退出登录弹窗样式，仅一个确定按钮） -->
	<confirm-popup :show="successPop" message="手机号修改成功" :show-cancel="false" @confirm="afterSuccess" @cancel="afterSuccess"></confirm-popup>
  </view>
</template>

<script setup>
/**
 * 修改手机号·第二步：输入新手机号 + 新号验证码
 * 入口：上一页（原手机号验证）点「下一步」；POST user/phone 验证通过后端即改库，无需再调 user/update。
 */
import { ref, onUnmounted } from 'vue'
import { getNote, verifyPhone } from '@/api/login'
import confirmPopup from '@/components/confirm-popup/confirm-popup.vue'

const newPhone = ref('')

// 验证码输入 + 60s 重发倒计时（发给新手机号）
const code = ref('')
const counting = ref(false)
const seconds = ref(60)
let timer = null

/** 获取验证码：校验手机号格式 → 发送成功后进入 60s 倒计时 */
function onSendCode() {
  if (counting.value) return
  if (!/^1\d{10}$/.test(newPhone.value)) {
    return uni.showToast({ title: '请输入正确的手机号', icon: 'none' })
  }
  getNote(newPhone.value).then((res) => {
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

const saving = ref(false)
const successPop = ref(false)

/** 下一步：不校验直接提交 → POST user/phone 验证通过即改库 → 弹「手机号修改成功」→ 回账号管理（对错以后端返回为准） */
function onNext() {
  if (saving.value) return
  saving.value = true
  verifyPhone(newPhone.value, code.value).then((res) => {
    saving.value = false
    if (res.code === 1) {
      successPop.value = true
    } else if (res.msg) {
      uni.showToast({ title: res.msg, icon: 'none' })
    }
  }).catch(() => {
    saving.value = false
  })
}

/** 成功弹窗关闭（确定或点遮罩）：回账号管理页（跳过中间的原手机号验证页） */
function afterSuccess() {
  successPop.value = false
  if (getCurrentPages().length > 2) {
    uni.navigateBack({ delta: 2 })
  } else {
    // 兜底：热同步重载后页面栈不足时，直接替换为账号管理页
    uni.redirectTo({ url: '/pages/mine/manage' })
  }
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

/* 悬浮返回键：状态栏下方一点，左上角（同上一页） */
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
  color: #333333;
}

/* 新手机号区 */
.content {
  padding-top: 200rpx;
}

.phone-box {
  margin-left: 100rpx;
  margin-bottom: 50rpx;
}

.phone-label {
  font-size: 25rpx;
  margin-bottom: 28rpx;
}

/* 新手机号输入：坐在空白横线上（字号同上一页的手机号展示） */
.new-phone-input {
  width: 550rpx;
  height: 60rpx;
  font-size: 35rpx;
  color: #333333;
  border-bottom: 3rpx solid #edf1f5;
  margin-bottom: 28rpx;
}

.ph-gray {
  color: #bbbbbb;
  font-size: 25rpx;
}

/* 居中包裹（胶囊/按钮所在行） */
.center-wrap {
  display: flex;
  justify-content: center;
}

/* 验证码胶囊：左 2/3 输入区，右 1/3 获取按钮（主题绿） */
.code-bar {
  display: flex;
  align-items: center;
  width: 620rpx;
  height: 68rpx;
  border-radius: 44rpx;
  background-color: #ffffff;
  border: 3rpx solid #f2f3f5;
  overflow: hidden;
}

.code-input {
  flex: 1;
  height: 88rpx;
  padding: 0 30rpx;
  font-size: 28rpx;
  color: #333333;
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
</style>
