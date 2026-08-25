<template>
  <view class="page">
    <!-- 顶部白色栏：返回键 + 标题「意见反馈」 -->
    <custom-nav title="意见反馈" />

    <view class="body">
      <!-- 卡片1：反馈类型（建议/积极评价 单选） -->
      <view class="card">
        <view class="tag-title">反馈类型</view>
        <view class="tag-row">
          <view class="tag-item" :class="{ active: tag === '建议' }" @click="tag = '建议'">建议</view>
          <view class="tag-item" :class="{ active: tag === '积极评价' }" @click="tag = '积极评价'">积极评价</view>
        </view>
      </view>

      <!-- 卡片2：反馈内容 -->
      <view class="card card-gap">
        <textarea
          class="fb-textarea"
          v-model="content"
          maxlength="500"
          placeholder="请写下您的意见或建议，我们会尽快处理"
          placeholder-class="ph-gray"
        ></textarea>
        <view class="fb-count">{{ content.length }}/500</view>
      </view>

      <!-- 提交 -->
      <view class="center-wrap">
        <view class="submit-btn" @click="onSubmit">提交</view>
      </view>
    </view>
  </view>
</template>

<script setup>
/**
 * 填写意见反馈
 * 入口：反馈记录页右下角 liuyan.png；
 * 提交 POST user/feedback { content, tag }，tag 为 建议/积极评价。
 */
import { ref } from 'vue'
import customNav from '@/components/custom-nav/custom-nav.vue'
import { submitFeedback } from '@/api/login'

// 反馈类型（建议/积极评价，单选）与内容
const tag = ref('')
const content = ref('')
const submitting = ref(false)

/** 提交反馈 */
function onSubmit() {
  if (submitting.value) return
  if (!tag.value) {
    return uni.showToast({ title: '请选择反馈类型', icon: 'none' })
  }
  if (!content.value.trim()) {
    return uni.showToast({ title: '请输入反馈内容', icon: 'none' })
  }
  submitting.value = true
  submitFeedback(content.value.trim(), tag.value).then((res) => {
    submitting.value = false
    if (res.code === 1) {
      uni.showToast({ title: '提交成功', icon: 'none' })
      setTimeout(() => uni.navigateBack(), 600)
    } else if (res.msg) {
      // 后端校验（如内容长度不合法）信息直接透出
      uni.showToast({ title: res.msg, icon: 'none' })
    }
  }).catch(() => {
    submitting.value = false
  })
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  background-color: #f5f5f5;
}

/* 主体区（顶栏不套此容器，保证白色顶栏铺满屏幕边角含状态栏） */
.body {
  padding: 24rpx;
}

/* 白色卡片 */
.card {
  background-color: #ffffff;
  border-radius: 20rpx;
  padding: 28rpx;
}

/* 第二张卡片与第一张的间距 */
.card-gap {
  margin-top: 20rpx;
}

/* 反馈类型标题 */
.tag-title {
  font-size: 25rpx;
  font-weight: bold;
  color: #333333;
  margin-bottom: 24rpx;
}

/* 类型标签：单选胶囊，选中主题绿描边 */
.tag-row {
  display: flex;
}

.tag-item {
  padding: 14rpx 44rpx;
  border-radius: 32rpx;
  border: 2rpx solid #dddddd;
  color: #666666;
  font-size: 26rpx;
}

.tag-item + .tag-item {
  margin-left: 24rpx;
}

.tag-item.active {
  border-color: #00B39B;
  color: #00B39B;
  background-color: rgba(0, 179, 155, 0.08);
}

.fb-textarea {
  width: 100%;
  height: 300rpx;
  font-size: 28rpx;
  color: #333333;
  line-height: 40rpx;
}

.ph-gray {
  color: #bbbbbb;
}

/* 字数统计：卡片右下角 */
.fb-count {
  text-align: right;
  font-size: 22rpx;
  color: #bbbbbb;
  margin-top: 12rpx;
}

/* 居中包裹（按钮所在行） */
.center-wrap {
  display: flex;
  justify-content: center;
}

/* 提交按钮：主题绿胶囊 */
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
  margin-top: 60rpx;
}
</style>
