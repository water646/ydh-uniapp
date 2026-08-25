<template>
  <view class="page">
    <!-- 顶部白色栏：返回键 + 标题「银行卡」 -->
    <custom-nav title="银行卡" />

    <!-- 主体：灰底，已绑定的银行卡以卡片展示 -->
    <view class="body">
      <view v-if="cards.length">
        <view v-for="c in cards" :key="c.id" class="carditem">
          <view class="carditem-top">
            <image class="carditem-icon" src="/static/images/bankcard.png"></image>
            <text class="carditem-bank">{{ c.bankName || '银行卡' }}</text>
          </view>
          <view class="carditem-num">{{ fmtCard(c.bankCardNumber) }}</view>
          <view class="carditem-holder">持卡人：{{ c.name || '—' }}</view>
        </view>
      </view>
      <view v-else class="empty">未绑定银行卡</view>
    </view>

    <!-- 底部：添加银行卡按钮 -->
    <view class="add-btn" @click="onAdd">
      <text class="add-btn-text">添加银行卡</text>
    </view>
  </view>
</template>

<script setup>
/**
 * 银行卡列表
 * 入口：钱包页银行卡条；数据来自 rest/userAuthInfo/info（带 bankCardNumber 的认证记录）。
 * 添加银行卡接口待定。
 */
import { ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import customNav from '@/components/custom-nav/custom-nav.vue'
import { getAuthInfo } from '@/api/auth'

// 绑定的银行卡列表
const cards = ref([])

onShow(() => {
  loadCards()
})

/** 拉认证记录，筛出绑了银行卡的 */
function loadCards() {
  getAuthInfo().then((res) => {
    if (res.code === 1 && Array.isArray(res.data)) {
      cards.value = res.data.filter((r) => r.bankCardNumber)
    }
  }).catch(() => {})
}

/** 卡号打码：前 4 后 4，中间星号 */
function fmtCard(no) {
  const s = String(no || '')
  if (s.length < 9) return s || '—'
  return s.slice(0, 4) + ' **** **** ' + s.slice(-4)
}

/** 添加银行卡：进添加页（卡号/预留手机号/验证码，卡类型由后端推断，提交接口待定） */
function onAdd() {
  uni.navigateTo({ url: '/pages/mine/bankcard-add' })
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
  /* 给底部固定按钮留出空间 */
  padding-bottom: 160rpx;
}

/* 主体区（顶栏不套此容器，保证白色顶栏铺满屏幕边角含状态栏） */
.body {
  padding: 24rpx;
}

/* 单张银行卡卡片：主题绿渐变（同钱包页银行卡条） */
.carditem {
  background: linear-gradient(#00C9BB, rgba(0, 201, 187, 0.55));
  border-radius: 20rpx;
  padding: 30rpx 28rpx;
  margin-bottom: 20rpx;
}

.carditem-top {
  display: flex;
  align-items: center;
}

.carditem-icon {
  width: 32rpx;
  height: 25rpx;
  margin-right: 12rpx;
}

.carditem-bank {
  color: #ffffff;
  font-size: 28rpx;
  font-weight: bold;
}

.carditem-num {
  color: #ffffff;
  font-size: 30rpx;
  margin-top: 20rpx;
  letter-spacing: 2rpx;
}

.carditem-holder {
  color: rgba(255, 255, 255, 0.8);
  font-size: 22rpx;
  margin-top: 12rpx;
}

/* 底部添加按钮：主题绿胶囊，固定贴底 */
.add-btn {
  position: fixed;
  left: 24rpx;
  right: 24rpx;
  bottom: 40rpx;
  height: 88rpx;
  border-radius: 44rpx;
  background-color: #00B39B;
  display: flex;
  align-items: center;
  justify-content: center;
}

.add-btn-text {
  color: #ffffff;
  font-size: 30rpx;
}

/* 未绑卡占位 */
.empty {
  text-align: center;
  color: #bbbbbb;
  font-size: 26rpx;
  padding: 80rpx 0;
}
</style>
