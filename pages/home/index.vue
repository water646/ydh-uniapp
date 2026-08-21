<template>
  <view class="page">
    <!-- 顶栏：白底 + 城市定位 + 搜索框（固定吸顶） -->
    <view class="topbar">
      <view class="loc">
        <image class="loc-icon" src="/static/images/locicon.png"></image>
        <view class="loc-text">{{ city }}</view>
      </view>
      <view class="search-box">
        <view class="search-icon"></view>
        <input class="search-input" v-model="keyword" placeholder="请输入您要搜索的内容" placeholder-class="search-ph" confirm-type="search" />
      </view>
    </view>

    <!-- 副顶栏：状态筛选胶囊（独立吸顶于顶栏下方，横向滑动），默认选中「全部」 -->
    <scroll-view class="subbar" scroll-x :show-scrollbar="false">
      <view
        v-for="t in statusTabs"
        :key="t.value"
        class="status-pill"
        :class="{ active: activeStatus === t.value }"
        @click="onStatusClick(t.value)"
      >{{ t.label }}</view>
    </scroll-view>

    <!-- 主体：订单信息卡片列表 -->
    <view class="order-list">
        <view class="order-card" v-for="o in orders" :key="o.id" @click="onOrderClick(o)">
			<view class="card-tag" :style="{ backgroundColor: stColor(o.status) }">
				<p class="card-tag-text">{{ stText(o.status) }}</p>
			</view>

			<view class="info-line">
				<image class="info-icon" src="/static/images/infoicon.png"></image>
				<p class="info-row">派单时间: {{ o.assignTime }}</p>
			</view>
			<view class="info-line">
				<image class="info-icon" src="/static/images/infoicon.png"></image>
				<p class="info-row">服务比赛: {{ o.serviceMatch || '—' }}</p>
			</view>
			<view class="info-line">
				<image class="info-icon" src="/static/images/infoicon.png"></image>
				<p class="info-row">服务角色: {{ o.serviceRole || '—' }}</p>
			</view>
			<view class="info-line">
				<image class="info-icon" src="/static/images/infoicon.png"></image>
				<p class="info-row">服务开始时间: {{ o.serviceStartTime }}</p>
			</view>
			<view class="info-line">
				<image class="info-icon" src="/static/images/infoicon.png"></image>
				<p class="info-row">服务单号: {{ o.orderNumber }}</p>
			</view>
			<p class="info-row pay-row" v-if="o.paymentResult">打款: {{ o.paymentResult }}（{{ o.paymentTime }}）</p>

			<view class="card-divider"></view>

			<view class="card-footer">
				<p class="price">￥{{ o.amountDue }}</p>

				<view class="btn-group" v-if="o.status === 1">
					<view class="btn btn-reject" @click.stop="onReject(o)">
						<p class="btn-text reject-text">拒绝</p>
					</view>
					<view class="btn btn-accept" @click.stop="onAccept(o)">
						<p class="btn-text accept-text">接单</p>
					</view>
				</view>
				<!-- 待服务：开始服务 -->
				<view class="btn-group" v-else-if="o.status === 3">
					<view class="btn btn-accept btn-start" @click.stop="onStartService(o)">
						<p class="btn-text accept-text">开始服务</p>
					</view>
				</view>
				<!-- 服务中：结束服务申请（跳转申请页） -->
				<view class="btn-group" v-else-if="o.status === 4">
					<view class="btn btn-accept btn-finish" @click.stop="onFinishService(o)">
						<p class="btn-text accept-text">结束服务申请</p>
					</view>
				</view>
			</view>
        </view>

        <!-- 空状态 -->
        <view class="empty" v-if="!loading && !orders.length">
          <text>暂无订单</text>
        </view>

        <view class="list-end" v-if="orders.length">— 没有更多了 —</view>
    </view>

    <!-- 接单/拒绝确认弹窗（同退出登录样式） -->
    <confirm-popup :show="showConfirm" :message="confirmMsg" @confirm="doConfirm" @cancel="showConfirm = false"></confirm-popup>
  </view>
</template>

<script setup>
/**
 * 「首页」订单卡片列表
 * 数据源：GET rest/userServiceOrder/list（本地/生产后端同路径）
 * 上拉翻页（nextPage）；接单/拒绝均走 POST userServiceOrder/confirm（整个订单对象为请求体）。
 */
import { ref } from 'vue'
import { onLoad, onShow, onReachBottom } from '@dcloudio/uni-app'
import { getOrderList, confirmOrder } from '@/api/order'
import { STATUS_MAP, ST_WAIT_SERVICE, ST_CANCELLED, ST_SERVING, stText, stColor } from '@/utils/order-status'
import confirmPopup from '@/components/confirm-popup/confirm-popup.vue'

const keyword = ref('')

// 当前城市：默认「北京」，IP 定位成功后覆盖
const city = ref('北京')

// 状态文案/底色/状态号统一在 utils/order-status.js 维护

// 副顶栏筛选项：全部 + 六种状态（顺序同状态编号）
const statusTabs = [
  { label: '全部', value: 0 },
  ...Object.keys(STATUS_MAP).map((k) => ({ label: STATUS_MAP[k].text, value: Number(k) }))
]

// 当前筛选状态：0 = 全部（不传 status 参数）
const activeStatus = ref(0)

/** 切换状态筛选并重拉列表 */
function onStatusClick(v) {
  if (activeStatus.value === v) return
  activeStatus.value = v
  refresh()
}

const orders = ref([])
const pageNo = ref(1)
const loading = ref(false)
const finished = ref(false)

onLoad(() => {
  loadCity()
})

/** 尝试按 IP 取当前城市（ipwho.is 免费接口，中文），任何失败都静默保持默认「北京」 */
function loadCity() {
  uni.request({
    url: 'https://ipwho.is/?lang=zh-CN',
    method: 'GET',
    timeout: 5000,
    success: (res) => {
      const d = res.data
      if (d && d.success && d.city) {
        city.value = String(d.city).replace(/市$/, '')
      }
    }
  })
}

onShow(() => {
  refresh()
})

/** 重置到第一页重拉 */
function refresh() {
  pageNo.value = 1
  finished.value = false
  loadOrders()
}

function loadOrders() {
  if (loading.value) return
  loading.value = true
  const params = { pageNo: pageNo.value }
  if (activeStatus.value > 0) params.status = activeStatus.value
  getOrderList(params).then((res) => {
    if (res.code === 1 && res.data) {
      const list = res.data.list || []
      orders.value = pageNo.value === 1 ? list : orders.value.concat(list)
      finished.value = !res.data.nextPage
    }
    loading.value = false
  }).catch(() => {
    loading.value = false
  })
}

/** 上拉加载下一页 */
onReachBottom(() => {
  if (finished.value || loading.value) return
  pageNo.value++
  loadOrders()
})

function onOrderClick(o) {
  // TODO: 订单详情
}

// 接单/拒绝：同一 confirm 接口、同一确认弹窗，只是成功后落到不同状态
// 状态号常量 ST_* 从 utils/order-status.js 引入

const showConfirm = ref(false)
const confirmMsg = ref('')
const confirmTarget = ref(null) // { o, next, okText }
const submitting = ref(false)

function onAccept(o) {
  confirmTarget.value = { o, next: ST_WAIT_SERVICE, okText: '接单成功' }
  confirmMsg.value = '确定接单吗？'
  showConfirm.value = true
}

function onReject(o) {
  confirmTarget.value = { o, next: ST_CANCELLED, okText: '已拒绝' }
  confirmMsg.value = '确定拒绝此订单吗？'
  showConfirm.value = true
}

/** 待服务订单：开始服务，状态改为服务中 */
function onStartService(o) {
  confirmTarget.value = { o, next: ST_SERVING, okText: '已开始服务' }
  confirmMsg.value = '确定开始服务吗？'
  showConfirm.value = true
}

/** 服务中订单：跳转结束服务申请页（整个订单对象经 data 参数传入） */
function onFinishService(o) {
  uni.navigateTo({
    url: '/pages/order/finish-service?data=' + encodeURIComponent(JSON.stringify(o))
  })
}

/** 弹窗点确定：先把订单的 status 改为目标状态号，整个对象 POST confirm（后端按请求体落库），失败回滚 */
function doConfirm() {
  showConfirm.value = false
  const t = confirmTarget.value
  if (!t || submitting.value) return
  submitting.value = true
  const prev = t.o.status
  t.o.status = t.next
  confirmOrder(t.o).then((res) => {
    submitting.value = false
    if (res.code === 1) {
      uni.showToast({ title: t.okText, icon: 'none' })
    } else {
      t.o.status = prev
    }
  }).catch(() => {
    submitting.value = false
    t.o.status = prev
  })
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  background-color: #f5f6f8;
}

/* 顶栏：城市定位 + 搜索框 */
.topbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  /* 状态栏沉浸：顶部额外让出状态栏高度 */
  padding: calc(var(--status-bar-height) + 20rpx) 20rpx 20rpx;
  background-color: #ffffff;
}

/* 城市定位 */
.loc {
  display: flex;
  align-items: center;
  margin-right: 25rpx;
  margin-left: 5rpx;
  position: relative;
  top:2rpx;
}

.loc-icon {
  width: 32rpx;
  height: 40rpx;
  margin-right: 10rpx;
  flex-shrink: 0;
}

.loc-text {
  font-size: 28rpx;
  color: #333333;
}

.search-box {
  display: flex;
  align-items: center;
  flex: 1;
  height: 55rpx;
  background-color: #f2f3f5;
  border-radius: 36rpx;
  padding: 0 24rpx;
}

/* 副顶栏：独立吸顶在顶栏下方（顶栏高 = 状态栏+95rpx） */
.subbar {
  position: fixed;
  left: 0;
  right: 0;
  top: calc(var(--status-bar-height) + 95rpx);
  z-index: 10;
  white-space: nowrap;
  background-color: #ffffff;
  border-bottom: 1rpx solid #eeeeee;
  padding: 12rpx 20rpx;
}

/* 状态筛选项：未选中只有文字，选中为两端半圆小胶囊 */
.status-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 44rpx;
  padding: 0;
  border-radius: 22rpx;
  background-color: transparent;
  color: #666666;
  font-size: 22rpx;
  margin-right: 28rpx;
}

.status-pill.active {
  background-color: #dcf4ee;
  color: #177f69;
  font-weight: bold;
  padding: 0 20rpx;
}

/* css 画放大镜：圆 + 手柄 */
.search-icon {
  width: 26rpx;
  height: 26rpx;
  border: 4rpx solid #999999;
  border-radius: 50%;
  position: relative;
  flex-shrink: 0;
}

.search-icon::after {
  content: '';
  position: absolute;
  width: 16rpx;
  height: 4rpx;
  background: #999999;
  border-radius: 2rpx;
  transform: rotate(45deg);
  right: -14rpx;
  bottom: -4rpx;
}

.search-input {
  flex: 1;
  margin-left: 16rpx;
  font-size: 28rpx;
  color: #333333;
}

.search-ph {
  color: #bbbbbb;
}

/* 订单列表（给吸顶顶栏让位） */
.order-list {
  padding: 24rpx 24rpx 40rpx;
  /* 顶栏95 + 副顶栏(12+44+12)=68，再留 20rpx 间隙 */
  padding-top: calc(var(--status-bar-height) + 183rpx);
}

.order-card {
  position: relative;
  overflow: hidden;
  background-color: #ffffff;
  border-radius: 20rpx;
  padding: 28rpx 28rpx 18rpx 28rpx;
  margin-top: 10rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.04);
}

/* 右上角状态标识（背景色由 statusMap 动态绑定） */
.card-tag {
  position: absolute;
  right: 0;
  top: 0;
  width: 110rpx;
  height: 40rpx;
  border-radius: 0 0 0 18rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-tag-text {
  font-size: 20rpx;
  color: #ffffff;
}

/* 卡片信息行（图标 + 文字） */
.info-line {
  display: flex;
}

.info-icon {
  width: 30rpx;
  height: 30rpx;
  margin-right: 10rpx;
  flex-shrink: 0;
}

.info-row {
  font-size: 26rpx;
  margin-bottom: 22rpx;
}

.pay-row {
  color: #03b098;
}

.card-divider {
  border-bottom: 2rpx solid rgba(0, 0, 0, 0.1);
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20rpx;
}

.price {
  font-size: 26rpx;
  font-weight: bold;
  color: #03b098;
}

/* 拒绝/接单按钮（仅待确认状态显示） */
.btn-group {
  display: flex;
  justify-content: space-between;
  gap: 20rpx;
}

.btn {
  height: 40rpx;
  width: 100rpx;
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-reject {
  border: 2rpx solid #6e6e6e;
}

.btn-accept {
  background-color: #03b098;
  border: 2rpx solid #03b098;
}

/* 开始服务按钮：同接单样式，加宽放四个字 */
.btn-start {
  width: 160rpx;
}

/* 结束服务申请按钮：同上，更宽放六个字 */
.btn-finish {
  width: 220rpx;
}

.btn-text {
  font-size: 22rpx;
}

.reject-text {
  color: #6e6e6e;
  font-weight: bold;
}

.accept-text {
  color: #ffffff;
  font-weight: 550;
}

/* 空状态 */
.empty {
  text-align: center;
  color: #bbbbbb;
  font-size: 26rpx;
  padding: 160rpx 0;
}

.list-end {
  text-align: center;
  color: #bbbbbb;
  font-size: 24rpx;
  padding: 20rpx 0;
}
</style>
