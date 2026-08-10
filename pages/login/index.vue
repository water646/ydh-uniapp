<template>
  <view class="login">
    <custom-nav title="登录" :show-back="false" />
    <!-- ⚠️【MOCK】静态数据模式横幅（config.useMock=true 时显示） -->
    <view v-if="useMock" class="mock-banner">⚠️ MOCK 静态数据模式 · 验证码任意4位即可（如 1234）</view>
    <view class="logo"><!-- 智能技术台 --></view>
    <view class="form">
      <view class="input-row">
        <input v-model="phone" class="input" type="number" maxlength="11" placeholder="请输入手机号" />
      </view>
      <view class="input-row code-row">
        <input v-model="code" class="input" type="number" maxlength="4" placeholder="请输入验证码" />
        <view class="code-btn" :class="{ disabled: counting }" @click="sendCode">
          {{ codeText }}
        </view>
      </view>
      <view class="login-btn" @click="doLogin">登录</view>
      <view class="agree">
        <!-- <view class="checkbox" :class="{ checked: agreed }" @click="agreed = !agreed"></view> -->
        <text>登录即代表同意运动汇产品</text>
        <text class="link" @click="goAgreement(1)">《用户协议》</text>
		<text>和</text>
        <text class="link" @click="goAgreement(2)">《隐私政策》</text>
      </view>
    </view>
    <!-- 底部 logo（对应原 activity_login.xml 的 @mipmap/advertdown） -->
    <image class="bottom-logo" src="/static/advertdown.png" mode="widthFix" />
  </view>
</template>

<script setup>
/**
 * 登录页（对应 LoginActivity）
 * 短信验证码登录：getNote 获取验证码 -> validateLogin 登录 -> 存 token -> main
 */
import { ref, onUnmounted } from 'vue'
import customNav from '@/components/custom-nav/custom-nav.vue'
import { getNote, validateLogin } from '@/api/login'
import { useUserStore } from '@/store/user'
import { checkPhone } from '@/utils/validator'
import { config } from '@/config'

const userStore = useUserStore()
const useMock = config.useMock // ⚠️【MOCK】是否静态数据模式

const phone = ref('')
const code = ref('')
const agreed = ref(true)
const counting = ref(false)
const codeText = ref('获取验证码')
let timer = null
let currentTime = 0

async function sendCode() {
  if (counting.value) return
  if (!phone.value) return uni.showToast({ title: '请输入手机号码', icon: 'none' })
  if (!checkPhone(phone.value)) return uni.showToast({ title: '手机号格式不正确', icon: 'none' })

  const res = await getNote(phone.value)
  if (res.code === 1) {
    startCountDown()
  } else {
    uni.showToast({ title: res.msg || '发送失败', icon: 'none' })
  }
}

function startCountDown() {
  counting.value = true
  currentTime = 60
  codeText.value = '60s重新发送'
  timer = setInterval(() => {
    currentTime--
    if (currentTime <= 0) {
      clearInterval(timer)
      counting.value = false
      codeText.value = '重新获取'
    } else {
      codeText.value = currentTime + 's重新发送'
    }
  }, 1000)
}

async function doLogin() {
  if (!phone.value) return uni.showToast({ title: '请输入手机号码', icon: 'none' })
  if (!code.value) return uni.showToast({ title: '请输入短信验证码', icon: 'none' })
  if (!agreed.value) return uni.showToast({ title: '请先同意用户协议', icon: 'none' })

  const res = await validateLogin(phone.value, code.value)
  if (res.code === 1) {
    userStore.setAuth(String(res.data))
    uni.reLaunch({ url: '/pages/main/index' })
  } else {
    uni.showToast({ title: res.msg || '登录失败', icon: 'none' })
  }
}

function goAgreement(type) {
  uni.navigateTo({ url: '/pages/agreement/index?type=' + type })
}

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<style lang="scss" scoped>
.login {
  min-height: 100vh;
  background-color: #ffffff;
  display: flex;
  flex-direction: column;
}
/* 底部 logo（对应原 @mipmap/advertdown，原布局用 weight=1 占位顶到底部） */
.bottom-logo {
  margin-top: auto;
  width: 240rpx;
  align-self: center;
  margin-bottom: 50rpx;
}
/* ⚠️【MOCK】静态数据模式横幅 */
.mock-banner {
  margin: 20rpx 30rpx 0;
  padding: 16rpx 20rpx;
  background-color: #fff6e6;
  border: 1rpx solid #e6a23c;
  border-radius: 8rpx;
  color: #e6a23c;
  font-size: 24rpx;
  text-align: center;
}
.logo {
  text-align: center;
  font-size: 48rpx;
  color: #29a871;
  font-weight: bold;
  padding: 80rpx 0 60rpx;
}
.form {
  padding: 0 60rpx;
}
.input-row {
  margin-bottom: 30rpx;
  border-bottom: 1rpx solid #eeeeee;
}
.input {
  height: 90rpx;
  font-size: 30rpx;
}
.code-row {
  display: flex;
  align-items: center;
}
.code-row .input {
  flex: 1;
}
.code-btn {
  font-size: 26rpx;
  color: #29a871;
  padding: 10rpx 20rpx;
}
.code-btn.disabled {
  color: #999999;
}
.login-btn {
  margin-top: 60rpx;
  height: 90rpx;
  line-height: 90rpx;
  text-align: center;
  background-color: #29a871;
  color: #ffffff;
  font-size: 32rpx;
  border-radius: 45rpx;
}
.agree {
  margin-top: 40rpx;
  display: flex;
  align-items: center;
  font-size: 24rpx;
  color: #999999;
  flex-wrap: wrap;
}
.checkbox {
  width: 32rpx;
  height: 32rpx;
  border: 2rpx solid #cccccc;
  border-radius: 50%;
  margin-right: 10rpx;
}
.checkbox.checked {
  background-color: #29a871;
  border-color: #29a871;
}
.link {
  color: #009de9;
}
</style>
