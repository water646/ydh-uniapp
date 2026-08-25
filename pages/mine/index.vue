<template>
  <view class="page">
    <!-- 顶部信息区（背景图 minbgctop.png） -->
    <view class="topcontent">
	  <view class="pagetitle">
		  <p>个人中心</p>
	  </view>
      <view class="personblcok">
        <image class="perphone" :src="molist.avatar || '/static/images/headimg.png'" mode="" @click="uploadAvatar"></image>
        <view class="permess" @click="popClick('person')">
			<view class="namerow">
				<view class="idmesimg">
					<view class="idtext">{{ AUTH_BADGE[authState] }}</view>
				</view>
				
				<view class="mestop"> 
					<p class="mestop-text">{{ molist.nickname }}</p>
				</view>
				
				<view class="idmes copy-btn" @click="doManage">管理</view>
			</view>

			<view class="mesbot">
				<view class="idmes">账户ID：{{ molist.accountId }}</view>	
				<view class="idmes copy-btn" @click="copyAccountId">复制</view>
			</view>
        </view>
      </view>
    </view>

    <!-- 菜单白色卡片（顶部快捷入口按钮 + 下方菜单列表） -->
    <view class="bolist">
      <view class="funbar">
        <view class="funbtn funbtn-stats" @click="goStats">
			<p class="funbtn-text">技术统计</p>
			<image class="funbtn-img" src="/static/images/skill.png"></image>
		</view>
        <view class="funbtn funbtn-live" @click="goLive">
			<p class="funbtn-text">现场直播</p>
			<image class="funbtn-img" src="/static/images/live.png"></image>
		</view>
      </view>
      <view class="list-menu-cell" @click="authenClick()">
        <image class="cell-imga" src="/static/images/mycer.png" mode=""></image>
        <view class="cell-title">我的认证</view>
        <image class="cell-next" src="/static/images/moicon.png" mode=""></image>
      </view>
      <view class="list-menu-cell" @click="goFeedback">
        <image class="cell-imgb" src="/static/images/mymoney.png" mode=""></image>
        <view class="cell-title">意见反馈</view>
        <image class="cell-next" src="/static/images/moicon.png" mode=""></image>
      </view>
      <view class="list-menu-cell" @click="goWallet">
        <image class="cell-imgb" src="/static/images/money.png" mode=""></image>
        <view class="cell-title">我的钱包</view>
        <image class="cell-next" src="/static/images/moicon.png" mode=""></image>
      </view>
      <view class="list-menu-cell" @click="popClick('outconfirm')">
        <image class="cell-imgd" src="/static/images/myexit.png" mode=""></image>
        <view class="cell-title">退出登录</view>
        <image class="cell-next" src="/static/images/moicon.png" mode=""></image>
      </view>

      <!-- 底部版本信息 -->
      <view class="pagefoot">
        <view class="pagefoot-text">当前版本:v1.0</view>
        <view class="pagefoot-text">北京星河联盟科技有限公司</view>
      </view>
    </view>

    <!-- 确认弹窗 -->
    <confirm-popup :show="isAuthen" :message="popmessage" :confirm-text="popbut" @confirm="handleConfirm" @cancel="isAuthen = false"></confirm-popup>
  </view>
</template>

<script setup>
/**
 * 「我的」页（样式迁移自 F:/项目文件/UNIAPP/pages/minePage/minePage.vue）
 * 已接逻辑：user/info 显示手机号/账户ID/头像、userAuthInfo/info 认证徽章、退出登录（清 token 回登录页）。
 * 仍占位：头像上传、去认证跳转（认证页待做）。
 */
import { ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { getUserInfo } from '@/api/login'
import { getAuthInfo } from '@/api/auth'
import { useUserStore } from '@/store/user'
import confirmPopup from '@/components/confirm-popup/confirm-popup.vue'

const userStore = useUserStore()

// 用户信息（user/info 返回）
const molist = ref({ phone: '—', accountId: '—', avatar: '' })

// 认证状态（rest/userAuthInfo/info）：none 未认证 / pending 有记录未过审 / ok 已认证
const authState = ref('none')
const AUTH_BADGE = { none: '未认证', pending: '审核中', ok: '已认证' }

// 弹窗状态
const isAuthen = ref(false)
const popmessage = ref('')
const popbut = ref('确定')
const popType = ref('')

onShow(() => {
  if (!userStore.isLogin) {
    uni.reLaunch({ url: '/pages/login/index' })
    return
  }
  loadInfo()
  loadAuth()
})

/** 拉取个人信息：手机号、账户ID(id)、头像 */
function loadInfo() {
  getUserInfo().then((res) => {
    if (res.code === 1 && res.data) {
      const d = res.data
      molist.value = {
        phone: d.phone || '—',
        accountId: d.id || '—',
        avatar: d.avatar || '',
		nickname: d.nickName || '-',
      }
      userStore.setUserInfo(d)
    }
  }).catch(() => {})
}

/** 拉取认证状态：有记录且 auditStatus===1 视为已认证；有记录未过审视为审核中（状态含义待后端定稿） */
function loadAuth() {
  getAuthInfo().then((res) => {
    if (res.code === 1 && Array.isArray(res.data)) {
      const rec = res.data[0]
      authState.value = rec ? (rec.auditStatus === 1 ? 'ok' : 'pending') : 'none'
    }
  }).catch(() => {})
}

function popClick(type) {
  popType.value = type
  if (type === 'outconfirm') {
    popmessage.value = '确定退出登录吗?'
    popbut.value = '确定'
  } else if (authState.value === 'ok') {
    return // 已认证不再拦截（个人资料编辑页待做）
  } else {
    popmessage.value = '请先进行认证'
    popbut.value = '去认证'
  }
  isAuthen.value = true
}

/** 弹窗确认：退出登录执行登出，其余（去认证等）暂无逻辑只关窗 */
function handleConfirm() {
  isAuthen.value = false
  if (popType.value === 'outconfirm') {
    userStore.logout()
    uni.reLaunch({ url: '/pages/login/index' })
  }
}

/** 技术统计：进技术统计页（原首页，现为普通页面，navigateTo 即可） */
function goStats() {
  uni.navigateTo({ url: '/pages/main/index' })
}

/** 现场直播：先进技术统计页（同「技术统计」入口，后续直播入口再细分） */
function goLive() {
  uni.navigateTo({ url: '/pages/main/index' })
}

function uploadAvatar() {}

/** 复制账户ID到剪贴板（ID 未加载出来时不动作） */
function copyAccountId() {
  const id = molist.value.accountId
  if (!id || id === '—') return
  uni.setClipboardData({
    data: String(id),
    success: () => uni.showToast({ title: '已复制', icon: 'none' })
  })
}

/** 我的认证：已认证先提示（详情页待做），未认证/审核中弹「去认证」引导 */
function authenClick() {
  if (authState.value === 'ok') {
    uni.showToast({ title: '已认证', icon: 'none' })
  } else {
    popClick('auth')
  }
}

const doManage=()=>{
	uni.navigateTo({
		url:"/pages/mine/manage"
	})
}

/** 意见反馈：进反馈记录列表页 */
function goFeedback() {
  uni.navigateTo({ url: '/pages/mine/feedback' })
}

/** 我的钱包：进钱包页（内容待做，当前为空白页） */
function goWallet() {
  uni.navigateTo({ url: '/pages/mine/wallet' })
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  /* 顶栏 + 白卡片纵向排列，白卡片撑满剩余高度 */
  display: flex;
  flex-direction: column;
  background-color: #f8f8f8;
}

.topcontent {
  width: 100%;
  min-height: 420rpx;
  box-sizing: content-box;
  /* 沉浸式状态栏：内容整体下移状态栏高度，背景图拉伸铺满 */
  padding-top: var(--status-bar-height);
  background: url('/static/images/minbgctop.png') no-repeat;
  background-size: 100% 100%;
  top: 0;
  left: 0;
}

/* 页面标题（个人中心） */
.pagetitle {
  display: flex;
  justify-content: center;
  padding-top: 60rpx;
}

.personblcok {
  display: flex;
  align-items: center;
  padding-top: 80rpx;
}

.perphone {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  margin-left: 36rpx;
}

.permess {
  display: flex;
  flex-direction: column;
  margin-left: 15rpx;
}

/* 昵称行：认证徽章 + 昵称横向排列 */
.namerow {
  display: flex;
  align-items: center;
  gap: 10rpx;
}

.mestop {
  height: 44rpx;
  font-weight: 500;
  font-size: 32rpx;
  color: #000000;
  line-height: 44rpx;
  text-align: left;
}

.mestop-text {
  margin-left: 8rpx;
  font-weight: bold;
}

.mesbot {
  display: flex;
  margin-top: 20rpx;
  margin-left: 24rpx;
}

.idmes {
  height: 28rpx;
  font-weight: 400;
  font-size: 23rpx;
  color: #333333;
  line-height: 28rpx;
  text-align: left;
}

/* 复制按钮（账户ID后，主题绿） */
.copy-btn {
  margin-left: 15rpx;
  color: #00b39b;
}

.idmesimg {
  width: 78rpx;
  height: 28rpx;
  background: rgba(27, 208, 184, 0.2);
  border-radius: 22rpx;
  backdrop-filter: blur(10px);
  margin-left: 24rpx;
}

.idtext {
  height: 28rpx;
  font-weight: bold;
  font-size: 16rpx;
  color: #333333;
  line-height: 28rpx;
  text-align: center;
}

/* 快捷入口：白卡片内第一行 */
.funbar {
  display: flex;
  margin: 8rpx 36rpx 28rpx;
}

.funbtn {
  flex: 1;
  height: 130rpx;
  border-radius: 30rpx;
  color: #ffffff;
  font-size: 30rpx;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
}

.funbtn + .funbtn {
  margin-left: 24rpx;
}

/* 两个快捷入口的渐变底色 */
.funbtn-stats {
  background: linear-gradient(to right, #D3FBC7, #E6FFEA);
}

.funbtn-live {
  background: linear-gradient(to right, #C9E5FF, #DFF1FD);
}

/* 入口文字（黑字）与右下装饰图 */
.funbtn-text {
  color: #000000;
}

.funbtn-img {
  width: 150rpx;
  height: 150rpx;
  position: relative;
  bottom: 20rpx;
}

/* 白卡片：撑满顶栏之外的剩余高度，直到底部 */
.bolist {
  width: 100%;
  flex: 1;
  border-radius: 50rpx 50rpx 0 0;
  box-shadow: 0 -2rpx 3rpx rgba(0, 0, 0, 0.05);
  z-index: 1;
  margin-top: -60rpx;
  background-color: #fff;
  padding-top: 24rpx;
  display: flex;
  flex-direction: column;
}

/* 底部版本信息：贴在白卡片最底部 */
.pagefoot {
  margin-top: auto;
  padding: 30rpx 0 40rpx;
  text-align: center;
}

.pagefoot-text {
  font-size: 20rpx;
  color: #bbbbbb;
  line-height: 32rpx;
}

.list-menu-cell {
  width: 678rpx;
  height: 122rpx;
  display: flex;
  border-bottom: 2rpx solid #edf1f5;
  margin-left: 36rpx;
}

.cell-imga {
  width: 36rpx;
  height: 40rpx;
  margin: 42rpx 28rpx 40rpx 18rpx;
}

.cell-imgb {
  width: 36rpx;
  height: 32rpx;
  margin: 42rpx 28rpx 40rpx 18rpx;
}

.cell-imgd {
  width: 36rpx;
  height: 36rpx;
  margin: 42rpx 28rpx 40rpx 18rpx;
}

.cell-title {
  width: 564rpx;
  height: 122rpx;
  font-size: 28rpx;
  font-weight: 400;
  color: #333300;
  line-height: 122rpx;
}

.cell-next {
  width: 10rpx;
  height: 20rpx;
  margin-top: 50rpx;
}
</style>
