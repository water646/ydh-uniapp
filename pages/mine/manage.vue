<template>
  <view class="page">
    <!-- 顶部栏：白底铺满边角（含状态栏），左侧返回键 + 标题「账号管理」 -->
    <custom-nav title="账号管理" />

    <view class="body">
      <view class="card">
        <!-- 头像 + 右下角相机角标（点击更换头像） -->
        <view class="avatar-wrap">
          <image class="avatar" :src="form.avatar || '/static/images/headimg.png'" mode="aspectFill" @click="onChangeAvatar"></image>
          <image class="camera" src="/static/images/camera.png" @click="onChangeAvatar"></image>
        </view>

        <!-- 可编辑：昵称（label 独占一行，值落在下方横线上） -->
        <view class="field-col">
          <view class="field-label">昵称:</view>
		  <view class="input-line">
			  <input class="field-line-input" v-model="form.nickname" placeholder="请输入昵称" placeholder-class="field-ph" />
			  <image class="clear-icon" src="/static/images/delete.png" v-if="form.nickname" @click="form.nickname=''"></image>
		  </view>
        </view>

        <!-- 不可编辑：姓名（来自认证记录） -->
        <view class="field-col">
          <view class="field-label">姓名:</view>
	  <view class="field-value">{{ form.name || '—' }}</view>
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
	  
	  <view class="card card-entry" @click="goIdentity">
		  <view class="entry-row">
			  <view class="entry-title">身份修改</view>
			  <view class="entry-tag">
				  <view>
				  		<view class="entry-tag-text">身份</view>
				  </view>
			  </view>
			  <image class="entry-arrow" src="/static/images/continue.png"></image>
		  </view>
	  </view>
	  
	  <view class="card card-entry" @click="goPhone">
	  		  <view class="entry-row">
	  			  <view class="entry-title">修改手机号</view>
	  			  <image class="entry-arrow" src="/static/images/continue.png"></image>
	  		  </view>
	  </view>

	  <!-- 保存 -->
	  <view class="save-btn" @click="onSave">
	  	<text class="save-text">保存</text>
	  </view>

    </view>
  </view>
</template>

<script setup>
/**
 * 账号管理
 * 入口：「我的」页昵称行右侧「管理」按钮。
 * 数据：user/info（昵称/账号ID/头像）、userAuthInfo/info（姓名，取认证记录）。
 * 保存：POST user/update（传哪些字段就保存哪些）。
 */
import { ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import customNav from '@/components/custom-nav/custom-nav.vue'
import { getUserInfo, updateUser } from '@/api/login'
import { getAuthInfo } from '@/api/auth'
import { uploadFile } from '@/api/upload'

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

/** 更换头像：底部弹出「拍摄 / 在相册中选择」 */
function onChangeAvatar() {
  uni.showActionSheet({
    itemList: ['拍摄', '在相册中选择'],
    success: (res) => {
      if (res.tapIndex === 0) chooseAvatar('camera')
      else if (res.tapIndex === 1) chooseAvatar('album')
    }
  })
}

/** 按来源选图 → 上传 OSS → 界面即时换新头像（点「保存」时随表单一并落库） */
function chooseAvatar(sourceType) {
  uni.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    sourceType: [sourceType],
    success: (res) => {
      const path = res.tempFilePaths && res.tempFilePaths[0]
      if (!path) return
      uni.showLoading({ title: '上传中...', mask: true })
      uploadFile(path).then((url) => {
        form.value.avatar = url
      }).catch(() => {
        /* 失败提示 uploadFile 内部已 toast */
      }).finally(() => {
        uni.hideLoading()
      })
    }
  })
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

/** 身份修改：进身份选择页 */
function goIdentity() {
  uni.navigateTo({ url: '/pages/mine/identity' })
}

/** 修改手机号：进修改手机号页 */
function goPhone() {
  uni.navigateTo({ url: '/pages/mine/phone' })
}

const saving = ref(false)

/** 保存：可编辑字段（昵称/头像）POST user/update（后端只更新传了的字段），成功后不重拉、界面即所见 */
function onSave() {
  if (saving.value) return
  if (!form.value.nickname.trim()) {
    return uni.showToast({ title: '请输入昵称', icon: 'none' })
  }
  saving.value = true
  updateUser({
    nickName: form.value.nickname.trim(),
    avatar: form.value.avatar
  }).then((res) => {
    saving.value = false
    if (res.code === 1) {
      uni.showToast({ title: '已保存', icon: 'none' })
    } else if (res.msg) {
      uni.showToast({ title: res.msg, icon: 'none' })
    }
  }).catch(() => {
    saving.value = false
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

/* 输入行：值坐在横线上，右侧带一键清空按钮 */
.input-line {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 3rpx solid #edf1f5;
}

.clear-icon {
  width: 25rpx;
  height: 25rpx;
}

/* 入口卡（身份修改/修改手机号）：标题行 + 右侧箭头 */
.card-entry {
  margin-top: 20rpx;
  padding-bottom: 40rpx;
  position: relative;
}

.entry-row {
  display: flex;
  align-items: center;
}

.entry-title {
  font-size: 25rpx;
}

/* 身份标签：主题绿描边小牌 */
.entry-tag {
  margin-left: 30rpx;
  padding: 5rpx 15rpx;
  border: 3rpx solid #00b39b;
  border-radius: 12rpx;
  background-color: #eaf8f6;
}

.entry-tag-text {
  font-size: 20rpx;
  color: #00b39b;
}

/* 右侧箭头（绝对定位贴卡片右边距，垂直沿用流内位置） */
.entry-arrow {
  width: 15rpx;
  height: 25rpx;
  position: absolute;
  right: 45rpx;
}

/* 保存按钮（同结束服务申请页的提交按钮样式） */
.save-btn {
  height: 88rpx;
  border-radius: 44rpx;
  background-color: #03b098;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 40rpx;
}

.save-text {
  font-size: 30rpx;
  color: #ffffff;
  font-weight: 550;
}
</style>
