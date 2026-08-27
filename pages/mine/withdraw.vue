<template>
  <view class="page">
    <!-- 左上角悬浮返回键（同身份选择页样式） -->
    <image class="back-btn" src="/static/mipmap-xxhdpi/black_back.png" mode="aspectFit" @click="onBack"></image>

    <!-- 顶部标题：居中悬浮，不用线条与内容分隔 -->
    <view class="nav-title">绑定验证</view>

    <view class="content">
      <!-- 选中银行卡（只展示一张，点右侧箭头弹出所有卡换卡） -->
      <view v-if="selectedCard" class="bank-row" @click="showCardSheet = true">
        <view class="bank-row-main">
          <view class="bank-row-title">到账银行卡</view>
          <view class="bank-row-body">
            <view class="bank-row-line">
              <image class="bank-row-icon" src="/static/images/bankcard.png"></image>
              <view class="bank-row-name">{{ selectedCard.bankName || '银行卡' }} {{ fmtCard(selectedCard.bankCardNumber) }}</view>
            </view>
            <view class="bank-row-tip">预计48小时内到账</view>
          </view>
        </view>
        <image class="bank-row-arrow" src="/static/images/continue.png"></image>
      </view>
      <view v-else class="empty">未绑定银行卡</view>

      <!-- 分隔线：银行卡区 与 提现输入区 -->
      <view class="section-divider"></view>

      <!-- 提现金额（白卡片包裹，￥前缀，卡底可提现余额） -->
      <view class="amount-card">
        <view class="amount-label">提现金额</view>
        <view class="amount-line">
          <view class="amount-yen">￥</view>
          <input class="amount-input" v-model="amount" type="digit" placeholder="请输入提现金额" placeholder-class="ph-gray" />
        </view>
        <!-- <view class="amount-tip">提现金额少于300元收取0.5元手续费</view> -->
        <view class="amount-balance-row">
          <view class="amount-balance">可提现余额{{ balance }}元</view>
          <view class="amount-all" @click="onAllWithdraw">全部提现</view>
        </view>
        <view class="amount-exceed" v-if="exceeded">已超出可提现余额</view>
      </view>

      <!-- 提现 -->
      <view class="center-wrap">
        <view class="submit-btn" @click="onSubmit">提现</view>
      </view>
    </view>

    <!-- 换卡弹层：底部弹出所有绑定的银行卡 -->
    <u-popup :show="showCardSheet" mode="bottom" :round="20" @close="showCardSheet = false">
      <view class="sheet">
        <view class="sheet-title">选择银行卡</view>
        <view
          v-for="c in cards"
          :key="c.id"
          class="bank-row sheet-row"
          :class="{ sel: selectedId === c.id }"
          @click="onPickCard(c)"
        >
          <view class="bank-row-main">
            <view class="bank-row-name">{{ c.bankName || '银行卡' }}</view>
            <view class="bank-row-num">{{ fmtCard(c.bankCardNumber) }}</view>
            <view class="bank-row-holder">持卡人：{{ c.name || '—' }}</view>
          </view>
          <view class="bank-row-check" v-if="selectedId === c.id">✓</view>
        </view>
        <view class="sheet-cancel" @click="showCardSheet = false">取消</view>
      </view>
    </u-popup>
  </view>
</template>

<script setup>
/**
 * 提现
 * 入口：钱包页「提现」按钮；银行卡来自 rest/userAuthInfo/info（认证记录里带 bankName/bankCardNumber/name）。
 * 提现提交接口待定，当前只完成选卡 + 输金额。
 */
import { ref, computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { getAuthInfo } from '@/api/auth'
import { getUserInfo } from '@/api/login'

// 绑定的银行卡列表（认证记录里带卡号的才算）
const cards = ref([])
const selectedId = ref('')
const amount = ref('')

// 换卡弹层
const showCardSheet = ref(false)

// 当前选中的卡（页面只展示这一张）
const selectedCard = computed(() => cards.value.find((c) => c.id === selectedId.value) || null)

// 可提现余额（user/info 的 balance，两位小数展示）
const balance = ref('0.00')

// 输入金额超出可提现余额时提示（有输入且数值大于余额才亮）
const exceeded = computed(() => {
  const a = Number(amount.value)
  const b = Number(balance.value)
  return amount.value !== '' && !isNaN(a) && !isNaN(b) && a > b
})

onShow(() => {
  loadCards()
  loadBalance()
})

/** 余额：user/info 的 balance */
function loadBalance() {
  getUserInfo().then((res) => {
    if (res.code === 1 && res.data) {
      const n = Number(res.data.balance || 0)
      balance.value = isNaN(n) ? '0.00' : n.toFixed(2)
    }
  }).catch(() => {})
}

/** 拉认证记录，筛出绑了银行卡的；默认选第一张 */
function loadCards() {
  getAuthInfo().then((res) => {
    if (res.code === 1 && Array.isArray(res.data)) {
      cards.value = res.data.filter((r) => r.bankCardNumber)
      if (cards.value.length && !cards.value.some((c) => c.id === selectedId.value)) {
        selectedId.value = cards.value[0].id
      }
    }
  }).catch(() => {})
}

/** 卡号打码：前 4 后 4，中间星号 */
function fmtCard(no) {
  const s = String(no || '')
  if (s.length < 9) return s || '—'
  return s.slice(0, 4) + ' **** **** ' + s.slice(-4)
}

/** 弹层里选卡：切换选中并收起弹层 */
function onPickCard(c) {
  selectedId.value = c.id
  showCardSheet.value = false
}

/** 全部提现：金额输入框直接填入当前余额 */
function onAllWithdraw() {
  amount.value = balance.value
}

/** 提现：校验选卡/金额后进结果页（提交接口待定，通过校验即视为已受理） */
function onSubmit() {
  if (!selectedId.value) {
    return uni.showToast({ title: '请选择银行卡', icon: 'none' })
  }
  const n = Number(amount.value)
  if (!amount.value || isNaN(n) || n <= 0) {
    return uni.showToast({ title: '请输入正确的提现金额', icon: 'none' })
  }
  // TODO: 提现接口确定后在此提交（选中卡 selectedId + 金额 amount），成功后再跳结果页
  uni.navigateTo({ url: '/pages/mine/withdraw-result' })
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
  background-color: #f5f5f5;
}

/* 悬浮返回键：状态栏下方一点，左上角（同身份选择页） */
.back-btn {
  position: fixed;
  top: calc(var(--status-bar-height) + 24rpx);
  left: 12rpx;
  width: 80rpx;
  height: 80rpx;
  z-index: 10;
}

/* 标题：与返回键同一水平带，居中，底部细线 */
.nav-title {
  position: fixed;
  top: calc(var(--status-bar-height) + 40rpx);
  left: 0;
  right: 0;
  text-align: center;
  font-size: 34rpx;
  color: #333333;
  padding-bottom: 20rpx;
  border-bottom: 3rpx solid #f2f3f6;
}

.content {
  padding-top: 150rpx;
}

/* 银行卡行：银行名/打码卡号/持卡人 + 右侧箭头（页面）或对勾（弹层） */
.bank-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0rpx 60rpx 30rpx 48rpx;
}

/* 到账银行卡小标题 */
.bank-row-title {
  position: relative;
  font-size: 25rpx;
  margin-bottom: 30rpx;
}

.bank-row-body {
  position: relative;
}

/* 银行图标 + 卡名一行 */
.bank-row-line {
  display: flex;
  align-items: center;
  margin-bottom: 25rpx;
}

.bank-row-icon {
  width: 30rpx;
  height: 25rpx;
  margin-right: 10rpx;
}

/* 到账时长提示：相对卡名缩进 */
.bank-row-tip {
  color: #999999;
  font-size: 25rpx;
  margin-top: 8rpx;
  position: relative;
  left: 40rpx;
}

/* 换卡箭头（同账号管理页入口箭头尺寸，随内容下移） */
.bank-row-arrow {
  width: 15rpx;
  height: 25rpx;
  position: relative;
  top: 25rpx;
}

.bank-row-name {
  color: #333333;
  font-size: 28rpx;
  font-weight: bold;
}

.bank-row.sel .bank-row-name {
  color: black;
}

.bank-row-num {
  color: #666666;
  font-size: 26rpx;
  margin-top: 12rpx;
}

.bank-row-holder {
  color: #999999;
  font-size: 22rpx;
  margin-top: 8rpx;
}

/* 选中对勾（主题绿） */
.bank-row-check {
  color: #00B39B;
  font-size: 36rpx;
  font-weight: bold;
}

/* 分隔线：银行卡区 与 提现输入区 */
.section-divider {
  height: 5rpx;
  background-color: #f1f2f6;
}

/* 换卡弹层：底部弹出 */
.sheet {
  padding: 30rpx 0 20rpx;
}

.sheet-title {
  text-align: center;
  font-size: 28rpx;
  color: #999999;
  margin-bottom: 10rpx;
}

/* 弹层内卡片行之间加发丝线 */
.sheet-row {
  border-bottom: 1rpx solid #f1f2f6;
}

.sheet-row:last-of-type {
  border-bottom: none;
}

.sheet-cancel {
  height: 90rpx;
  line-height: 90rpx;
  text-align: center;
  color: #999999;
  font-size: 28rpx;
  border-top: 5rpx solid #f1f2f6;
}

/* 提现金额卡片：白卡圆角（同银行卡列表左右对齐） */
.amount-card {
  background-color: #ffffff;
  border-radius: 20rpx;
  padding: 28rpx;
  margin: 40rpx 24rpx 0;
}

.amount-label {
  font-size: 25rpx;
  margin-bottom: 70rpx;
}

/* 输入行：￥前缀 + 输入框，坐在横线上 */
.amount-line {
  display: flex;
  align-items: center;
  border-bottom: 3rpx solid #edf1f5;
}

.amount-yen {
  font-size: 40rpx;
  font-weight: bold;
  color: #333333;
  margin-right: 12rpx;
}

.amount-input {
  flex: 1;
  height: 60rpx;
  font-size: 60rpx;
  color: #333333;
}

.ph-gray {
  color: #bbbbbb;
  font-size: 30rpx;
}

.amount-tip {
  color: #C0C0C0;
  font-size: 24rpx;
  margin-top: 10rpx;
}

/* 卡片底部：可提现余额（灰）与 全部提现（主题绿）同行 */
.amount-balance-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16rpx;
}

.amount-balance {
  color: #999999;
  font-size: 22rpx;
}

.amount-all {
  color: #00B39B;
  font-size: 22rpx;
}

/* 超出余额提示（红色小字） */
.amount-exceed {
  color: #F53C2F;
  font-size: 22rpx;
  margin-top: 10rpx;
}

/* 居中包裹（按钮所在行） */
.center-wrap {
  display: flex;
  justify-content: center;
}

/* 提现按钮：主题绿胶囊 */
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
  margin-top: 80rpx;
}

/* 未绑卡占位 */
.empty {
  text-align: center;
  color: #bbbbbb;
  font-size: 26rpx;
  padding: 80rpx 0;
}
</style>
