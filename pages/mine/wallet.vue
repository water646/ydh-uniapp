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

    <!-- 收入明细列表：rest/userServiceOrder/list?status=6，每单一卡片 -->
    <view class="list-area" v-if="tab === 'income'">
      <view v-for="o in incomeList" :key="o.id" class="order-card">
        <view class="card-top">
          <view class="card-match">金额: {{ amountFmt(o) }}元</view>
          <view class="card-status" style="color:#B3B3B3">收入时间:{{ o.paymentTime || '—' }}</view>
        </view> 
		
		<view class="card-top">
		  <view class="card-match">关联比赛: {{ o.serviceMatch || '—' }}</view>
		</view>
		
	
        <view class="card-line">
          <text class="card-label">订单号</text>
          <text class="card-value">{{ o.orderNumber || '—' }}</text>
        </view>
<!--        <view class="card-bottom">
          <view class="card-pay" v-if="o.paymentResult">{{ o.paymentResult }} {{ o.paymentTime || '' }}</view>
          <view class="card-amount">+{{ amountFmt(o) }}<text class="card-unit">元</text></view>
        </view> -->
      </view>
      <view v-if="!loading && !incomeList.length" class="empty">暂无数据</view>
    </view>

    <!-- 提现明细：接口待定，先占位 -->
    <view class="list-area" v-else>
      <view class="empty">暂无数据</view>
    </view>
  </view>
</template>

<script setup>
/**
 * 我的钱包
 * 入口：「我的」页「我的钱包」菜单；收入明细取 rest/userServiceOrder/list?status=6（已打款），提现明细接口待定。
 */
import { ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { getOrderList } from '@/api/order'
import { stText, stColor } from '@/utils/order-status'

// 当前明细类型：income 收入明细 / withdraw 提现明细
const tab = ref('income')

// 收入明细列表
const loading = ref(false)
const incomeList = ref([])

onShow(() => {
  loadIncome()
})

/** 收入明细：拉 list 接口 status=6（已打款）第一页（分页加载后续需要再加） */
function loadIncome() {
  loading.value = true
  getOrderList({ pageNo: 1, status: 6 }).then((res) => {
    if (res.code === 1) {
      incomeList.value = (res.data && res.data.list) || []
	  incomeList.value.filter(item=>item.isPaid===1)
    }
  }).finally(() => {
    loading.value = false
  })
}

/** 金额格式化：两位小数 */
function amountFmt(o) {
  const n = Number(o.amountDue || 0)
  return isNaN(n) ? '0.00' : n.toFixed(2)
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

/* 明细列表区 */
.list-area {
  padding: 24rpx 24rpx 40rpx;
}

/* 单笔订单卡片（白卡圆角，同账号管理页卡片质感） */
.order-card {
  background-color: #ffffff;
  border-radius: 20rpx;
  padding: 28rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.04);
}

.card-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}

.card-match {
  font-size: 30rpx;
  font-weight: bold;
  color: #333333;
}

/* 状态文字颜色随订单状态枚举变化 */
.card-status {
  font-size: 24rpx;
}

.card-line {
  display: flex;
  margin-top: 10rpx;
}

.card-label {
  width: 140rpx;
  font-size: 25rpx;
  color: #999999;
}

.card-value {
  flex: 1;
  font-size: 25rpx;
  color: #333333;
}

/* 卡片底部：打款信息 + 金额 */
.card-bottom {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-top: 20rpx;
  padding-top: 20rpx;
  border-top: 2rpx solid #edf1f5;
}

.card-pay {
  font-size: 22rpx;
  color: #999999;
}

.card-amount {
  font-size: 40rpx;
  font-weight: bold;
  color: #00b39b;
}

.card-unit {
  font-size: 24rpx;
  font-weight: 400;
  margin-left: 6rpx;
}

/* 空列表占位 */
.empty {
  text-align: center;
  color: #bbbbbb;
  font-size: 26rpx;
  padding: 80rpx 0;
}
</style>
