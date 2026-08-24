<template>
  <view class="page">
    <!-- 顶部栏：白底铺满边角（含状态栏），左侧返回键 + 标题「账号管理」 -->
    <custom-nav title="账号管理" />

    <view class="body">
      <view class="card">
        <!-- 头像 + 右下角相机角标（点击更换头像） -->
        <view class="avatar-wrap">
          <image class="avatar" :src="form.avatar || '/static/images/headimg.png'" mode="aspectFill"></image>
          <image class="camera" src="/static/images/camera.png" @click="onChangeAvatar"></image>
        </view>

        <!-- 可编辑：昵称（label 独占一行，值落在下方横线上） -->
        <view class="field-col">
          <view class="field-label">昵称:</view>
		  <view style="display: flex; align-items: center; justify-content: space-between; border-bottom: 3rpx solid #edf1f5;">
			  <input class="field-line-input" v-model="form.nickname" placeholder="请输入昵称" placeholder-class="field-ph" />
			  <image src="/static/images/delete.png" v-if="form.nickname" @click="form.nickname=''" style="height: 25rpx; width: 25rpx;"></image>
		  </view>
        </view>

        <!-- 可编辑：姓名 -->
        <view class="field-col">
          <view class="field-label">姓名:</view>
		  <view style="display: flex; align-items: center; justify-content: space-between; border-bottom: 3rpx solid #edf1f5;">
		  		<input class="field-line-input" v-model="form.name" placeholder="请输入姓名" placeholder-class="field-ph" />
		  		<image src="/static/images/delete.png" v-if="form.name" @click="form.name=''" style="height: 25rpx; width: 25rpx;"></image>
		  </view>
        </view>

        <!-- 不可编辑：账号ID + 复制 -->
        <view class="field-col">
          <view class="field-label">账号ID:</view>
          <view class="field-value-row">
			<view class="field-value">{{ form.accountId || '—' }}</view>
			<view class="copy-btn" @click="copyAccountId">
				<image class="copy-icon" src="/static/images/copy.png"></image>
				<view class="copy-text">复制</view>
			</view>
		  </view>
        </view>
      </view>
	  
	  <view class="card" style="margin-top: 20rpx; padding-bottom:40rpx; position: relative;">
		  <view style="display: flex; align-items: center;">
			  <view style="font-size: 25rpx;">身份修改</view>
			  <view style="margin-left: 30rpx;">
				  <view style="padding:5rpx 15rpx; border:3rpx solid #00B39B; border-radius: 12rpx; background-color: #EAF8F6;">
				  		<view style="font-size: 20rpx; color: #00B39B;">身份</view>
				  </view>
			  </view>
			  <image src="/static/images/continue.png" style="width: 15rpx; height:25rpx; position: absolute; right:45rpx"></image>
		  </view>
	  </view>
	  
	  <view class="card" style="margin-top: 20rpx; padding-bottom:40rpx; position: relative;">
	  		  <view style="display: flex; align-items: center;">
	  			  <view style="font-size: 25rpx;">修改手机号</view>
	  			  <image src="/static/images/continue.png" style="width: 15rpx; height:25rpx; position: absolute; right:45rpx"></image>
	  		  </view>
	  </view>
	  
    </view>
  </view>
</template>

<script setup>
/**
 * 账号管理
 * 入口：「我的」页昵称行右侧「管理」按钮。
 * 数据：user/info（昵称/账号ID/头像）、userAuthInfo/info（姓名，取认证记录）；保存接口待后端提供。
 */
import { ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import customNav from '@/components/custom-nav/custom-nav.vue'
import { getUserInfo } from '@/api/login'
import { getAuthInfo } from '@/api/auth'

const form = ref({ nickname: '', name: '', accountId: '—', avatar: '' })

onShow(() => {
  loadInfo()
  loadName()
})

/** 用户基础信息：昵称/账号ID/头像 */
function loadInfo() {
  getUserInfo().then((res) => {
    if (res.code === 1 && res.data) {
      const d = res.data
      form.value.nickname = d.nickName || ''
      form.value.accountId = d.id || '—'
      form.value.avatar = d.avatar || ''
    }
  }).catch(() => {})
}

/** 姓名：取认证记录里的 name（未认证则留空） */
function loadName() {
  getAuthInfo().then((res) => {
    if (res.code === 1 && Array.isArray(res.data) && res.data[0]) {
      form.value.name = res.data[0].name || ''
    }
  }).catch(() => {})
}

/** 更换头像：上传接口已有（oss/file/upload），保存到用户资料的接口待提供，先占位 */
function onChangeAvatar() {
  // TODO: chooseImage → uploadFile → 保存头像接口
}

/** 复制账号ID到剪贴板（ID 未加载出来时不动作） */
function copyAccountId() {
  const id = form.value.accountId
  if (!id || id === '—') return
  uni.setClipboardData({
    data: String(id),
    success: () => uni.showToast({ title: '已复制', icon: 'none' })
  })
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  background-color: #f5f6f8;
}

/* 内容区（顶栏不套此容器，保证白色顶栏铺满屏幕边角含状态栏） */
.body {
  padding: 24rpx;
}

.card {
  background-color: #ffffff;
  border-radius: 20rpx;
  padding: 40rpx 28rpx 8rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.04);
}

/* 头像居中 + 右下角相机角标 */
.avatar-wrap {
  position: relative;
  width: 140rpx;
  margin: 0 auto 40rpx;
}

.avatar {
  width: 140rpx;
  height: 140rpx;
  border-radius: 50%;
}

.camera {
  position: absolute;
  right: -6rpx;
  bottom: -6rpx;
  width: 48rpx;
  height: 48rpx;
}

/* 信息行：左标签 + 右内容 */
.field-row {
  display: flex;
  align-items: center;
  height: 100rpx;
  border-bottom: 2rpx solid #edf1f5;
}

.field-row:last-child {
  border-bottom: none;
}

.field-label {
  width: 160rpx;
  font-size: 25rpx;
  color: #333333;
  margin-bottom: 20rpx;
}

/* 纵向字段：label 一行，值落在下方横线上 */
.field-col {
  margin-bottom: 24rpx;
  display: flex;
  flex-direction: column;
  
}

.field-line-input {
  height: 50rpx;
  font-size: 25rpx;
  color: #333333;
}

.field-ph {
  color: #bbbbbb;
}

/* 只读值（账号ID）横排：值 + 复制按钮 */
.field-value-row {
  display: flex;
  align-items: center;
}

.field-value {
  font-size: 25rpx;
  color: #999999;
}

/* 复制按钮（图标 + 主题绿文字） */
.copy-btn {
  display: flex;
  align-items: center;
  margin-left: 30rpx;
}

.copy-icon {
  width: 23rpx;
  height: 23rpx;
}

.copy-text {
  color: #00b39b;
  font-size: 23rpx;
}
</style>
