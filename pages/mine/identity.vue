<template>
  <view class="page">
	<view class="page-bg">
		<!-- 左上角悬浮返回键（本页无顶栏，仅避开状态栏） -->
		<image class="back-btn" src="/static/mipmap-xxhdpi/black_back.png" mode="aspectFit" @click="onBack"></image>

		<view class="content">
			<view class="title">请选择您的身份</view>
			<view class="option-grid">
				<view v-for="item in identity" :key="item" class="option" :class="{ sel: selected.includes(item) }" @click="onToggle(item)">
					<view>{{ item }}</view>
				</view>
			</view>

			<!-- 确定（提交所选身份，接口待定） -->
			<view class="confirm-btn" @click="onConfirm">
				<text class="confirm-text">确定</text>
			</view>
		</view>
	</view>
  </view>
</template>

<script setup>
/**
 * 身份选择（可多选）
 * 入口：「账号管理」页「身份修改」卡片；选中项切换 sel 样式，提交接口待后端提供。
 */
import { ref } from 'vue'

const identity = ['教练员','技术统计员','直播运营','队医','摄影师','摄像师','计时员','安保','保洁','啦啦队','场地服务','其他']

// 已选身份（多选，点一下选中、再点取消）
const selected = ref([])

/** 切换某身份的选中态 */
function onToggle(item) {
  const i = selected.value.indexOf(item)
  if (i >= 0) {
    selected.value.splice(i, 1)
  } else {
    selected.value.push(item)
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

/** 确定：提交所选身份（selected.value 为已选数组），接口待定 */
function onConfirm() {
  // TODO: 提交接口确定后接入
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  background-color: #f5f6f8;
}

/* 整页渐变底 */
.page-bg {
  background: linear-gradient(#CFEDEF, #E3FAF1);
  width: 100vw;
  height: 100vh;
}

/* 悬浮返回键：状态栏下方一点，左上角 */
.back-btn {
  position: fixed;
  top: calc(var(--status-bar-height) + 24rpx);
  left: 24rpx;
  width: 80rpx;
  height: 80rpx;
  z-index: 10;
}

.content {
  padding-top: 250rpx;
}

.title {
  color: #043e37;
  font-size: 40rpx;
  margin-left: 40rpx;
}

/* 选项宫格 */
.option-grid {
  margin: 100rpx 50rpx;
  display: flex;
  justify-content: space-around;
  flex-wrap: wrap;
  gap: 40rpx;
}

/* 单个选项：默认透明描边占位，选中加 sel 不跳动 */
.option {
  width: 290rpx;
  height: 84rpx;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #ffffff;
  border-radius: 10rpx;
  border: 3rpx solid transparent;
}

.sel {
  border: 3rpx solid #00b39b;
  background-color: #e0fffb;
  color: #00b39b;
}

/* 确定按钮（同「保存」按钮样式，与宫格左右对齐） */
.confirm-btn {
  height: 88rpx;
  border-radius: 44rpx;
  background-color: #03b098;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 50rpx;
}

.confirm-text {
  font-size: 30rpx;
  color: #ffffff;
  font-weight: 550;
}
</style>
