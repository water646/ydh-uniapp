<template>
  <view class="page">
    <!-- 顶部白色栏：返回键 + 标题「选择银行卡」 -->
    <custom-nav title="选择银行卡" />

    <view class="body">
      <view v-if="cards.length">
        <view
          v-for="c in cards"
          :key="c.id"
          class="sel-card"
          :class="{ active: selectedId === c.id }"
          @click="selectedId = c.id"
        >
          <image v-if="icon" class="sel-icon" :src="'/static/images/bank/' + icon" mode="aspectFit"></image>
          <view class="sel-main">
            <view class="sel-bank">{{ bankName }}</view>
            <view class="sel-num">{{ fmtCard(c.number) }}</view>
          </view>
          <view class="sel-check" v-if="selectedId === c.id">✓</view>
        </view>
      </view>
      <!-- 后端取卡接口未实现：当前空态占位 -->
      <view v-else class="empty">
        <image class="empty-img" src="/static/images/nomes.png" mode="aspectFit"></image>
        <view class="empty-text">暂无可绑定的银行卡</view>
      </view>
    </view>

    <!-- 底部：确认按钮（未选中置灰） -->
    <view class="confirm-btn" :class="{ disabled: !selectedId }" @click="onConfirm">确认</view>
  </view>
</template>

<script setup>
/**
 * 免输入卡号添加：选择要绑定的银行卡
 * 入口：bankcard-add 免输入列表点击某银行；后端「获取该行可绑卡片」接口未实现，
 * 目前空态占位 + 预览假数据（注释），接口确定后在 loadCards() 里接入。
 */
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import customNav from '@/components/custom-nav/custom-nav.vue'

// 从上一页带过来的银行信息
const bankName = ref('')
const icon = ref('')

// 该行可绑定的卡片列表 + 当前选中项
const cards = ref([])
const selectedId = ref('')

// 【临时假数据】预览时解开注释，并注释掉下方 loadCards() 里的空赋值
// const TEST_CARDS = [
//   { id: 't1', number: '6222020200112233445' },
//   { id: 't2', number: '6222020200556677889' }
// ]

onLoad((options) => {
  bankName.value = safeDecode(options.bank)
  icon.value = options.icon || ''
  loadCards()
})

function safeDecode(s) {
  try {
    return decodeURIComponent(s || '')
  } catch (e) {
    return s || ''
  }
}

/** 拉取该行可绑定的卡片（接口待后端实现，字段暂按 { id, number } 约定） */
function loadCards() {
  // TODO: 接口实现后替换，成功后 cards.value = res.data
  cards.value = []
  // cards.value = TEST_CARDS
}

/** 卡号打码：前 4 后 4，中间星号 */
function fmtCard(no) {
  const s = String(no || '')
  if (s.length < 9) return s || '—'
  return s.slice(0, 4) + ' **** **** ' + s.slice(-4)
}

/** 确认绑定选中卡片（绑卡接口待定，先按成功走结果页） */
function onConfirm() {
  if (!selectedId.value) return
  // TODO: 绑卡接口确定后在此提交，失败跳 ?result=fail
  uni.navigateTo({ url: '/pages/mine/bankcard-success' })
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  background-color: #f5f5f5;
  /* 给底部固定按钮留出空间 */
  padding-bottom: 180rpx;
}

/* 主体区（顶栏不套此容器，保证白色顶栏铺满屏幕边角含状态栏） */
.body {
  padding: 24rpx;
}

/* 单张可选卡片：白底圆角，选中态主题绿描边 */
.sel-card {
  display: flex;
  align-items: center;
  background-color: #ffffff;
  border: 2rpx solid transparent;
  border-radius: 20rpx;
  padding: 30rpx 28rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.04);
}

.sel-card.active {
  border-color: #00B39B;
}

.sel-icon {
  width: 44rpx;
  height: 44rpx;
  margin-right: 20rpx;
  flex-shrink: 0;
}

.sel-main {
  flex: 1;
}

.sel-bank {
  font-size: 28rpx;
  font-weight: bold;
  color: #333333;
}

.sel-num {
  margin-top: 10rpx;
  font-size: 24rpx;
  color: #999999;
}

/* 选中标记：主题绿实心圆 + 白色对勾 */
.sel-check {
  width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
  background-color: #00B39B;
  color: #ffffff;
  font-size: 26rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

/* 底部确认按钮：主题绿胶囊，未选中置灰 */
.confirm-btn {
  position: fixed;
  left: 24rpx;
  right: 24rpx;
  bottom: 40rpx;
  height: 88rpx;
  border-radius: 44rpx;
  background-color: #00B39B;
  color: #ffffff;
  font-size: 30rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.confirm-btn.disabled {
  background-color: #CACACA;
}

/* 空态占位：居中插图 + 文字 */
.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 160rpx 0 80rpx;
}

.empty-img {
  width: 300rpx;
  height: 270rpx;
}

.empty-text {
  color: #999999;
  font-size: 26rpx;
  margin-top: 24rpx;
}
</style>
