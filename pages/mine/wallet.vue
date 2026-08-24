<template>
  <view class="page">
    <!-- 左上角悬浮返回键（同身份选择页样式） -->
    <image class="back-btn" src="/static/mipmap-xxhdpi/black_back.png" mode="aspectFit" @click="onBack"></image>

    <!-- 顶部背景区：与 mine 页 topcontent 相同样式的 minbgctop.png -->
    <view class="topcontent">
      <view class="pagetitle">
        <p>我的钱包</p>
      </view>
	  
	  <view style="display: flex; justify-content: center; flex-direction: column;">
			<view style="flex:1; position: relative; margin: 50rpx 20rpx; background: linear-gradient(rgba(255,255,255,0.3),rgba(255,255,255,1),rgba(255,255,255,1)	); border-radius: 20rpx; border: 4rpx solid white; padding:20rpx; display: flex; flex-direction: column; align-items: center; z-index:2;">
				<view style="color:#8B8B8B; margin-top: 20rpx; font-size: 26rpx;">钱包余额(元)</view>
				<view style="margin-top: 45rpx; color: #00B39B; font-size: 48rpx; font-weight: bold;">12345.00</view>
				<view style="color: #C0C0C0; font-size: 24rpx; margin-top: 10rpx;">提现金额少于300元收取0.5元手续费</view>
				
				<view style="background-color: #00B39B; width: 300rpx; height:68rpx; margin-top: 20rpx; border-radius:34rpx;display: flex;align-items: center;justify-content: center; z-index: 2;">
					<view style="color: white;">提现</view>
				</view>
				<image src="/static/images/transparent_coin.png" style="position: absolute; width: 350rpx; height:270rpx; bottom:0; right:0;"></image>
			</view>
			
			<view style="flex:1; margin: 0 20rpx; position:relative; background:linear-gradient(#00C9BB,rgba(0,201,187,0.55)) ; border-radius: 20rpx; padding:55rpx 25rpx 25rpx 25rpx; display: flex; align-items: center; justify-content: space-between; bottom:80rpx">
				
				<view style="display: flex; align-items: center;gap:10rpx;">
					<image src="/static/images/bankcard.png" style="width: 32rpx; height: 25rpx;"></image>
					<p style="color: white; font-size: 25rpx;">银行卡</p>
				</view>
				<image src="/static/images/golook.png" style="width: 20rpx; height:20rpx"></image>
			</view>
			
	  </view>
	  
    <!-- 明细类型 tab：黑色字体，选中绿色下划线，贴 topcontent 底部居中 -->
    <view class="tabs">
      <view class="tab" :class="{ active: tab === 'income' }" @click="tab = 'income'">收入明细</view>
      <view class="tab" :class="{ active: tab === 'withdraw' }" @click="tab = 'withdraw'">提现明细</view>
    </view>
    </view>
  </view>
</template>

<script setup>
/**
 * 我的钱包
 * 入口：「我的」页「我的钱包」菜单；顶部背景 + 收入/提现明细 tab，列表内容待做。
 */
import { ref } from 'vue'

// 当前明细类型：income 收入明细 / withdraw 提现明细
const tab = ref('income')

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
  background-color: #f8f8f8;
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

/* 顶部背景（与 mine 页 .topcontent 同款） */
.topcontent {
  width: 100%;
  min-height: 640rpx;
  box-sizing: content-box;
  /* 沉浸式状态栏：内容整体下移状态栏高度，背景图拉伸铺满 */
  padding-top: var(--status-bar-height);
  background: url('/static/images/minbgctop.png') no-repeat;
  background-size: 100% 100%;
  top: 0;
  left: 0;
  /* 纵向排列：标题在上，tab 沉底 */
  display: flex;
  flex-direction: column;
}

/* 页面标题（我的钱包，同 mine 页「个人中心」标题样式） */
.pagetitle {
  display: flex;
  justify-content: center;
  padding-top: 60rpx;
}

/* 明细 tab：贴 topcontent 底部居中，下划线紧贴底边 */
.tabs {
  margin-top: auto;
  display: flex;
  justify-content: center;
  gap: 90rpx;
}

/* 单个 tab：未选中 #414141 字 + 透明下划线占位（选中变黑字绿下划线，不跳动） */
.tab {
  font-size: 28rpx;
  color: #414141;
  padding: 12rpx 4rpx;
  border-bottom: 6rpx solid transparent;
}

.tab.active {
  color: #000000;
  border-bottom: 6rpx solid #00b39b;
}
</style>
