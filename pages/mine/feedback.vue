<template>
  <view class="page">
    <!-- 顶部白色栏：返回键 + 标题「意见反馈」 -->
    <custom-nav title="意见反馈" />

    <!-- 主体：灰底，每条反馈一张白卡 -->
    <view class="body">
      <view v-if="list.length">
        <view v-for="(f, i) in list" :key="f.id || i" class="fb-card">
          <view class="fb-icon">
            <image class="fb-icon-img" src="/static/images/letter.png" mode="aspectFit"></image>
          </view>
          <view class="fb-main">
            <view class="fb-time">{{ f.createTime || '—' }}</view>
            <view class="fb-content">{{ f.content }}</view>
            <view class="fb-reply" v-if="f.reply">
              <view class="fb-reply-label">回复：</view>
              <view class="fb-reply-text">{{ f.reply }}</view>
            </view>
          </view>
        </view>
      </view>
      <view v-else class="empty">
        <image class="empty-img" src="/static/images/nomes.png" mode="aspectFit"></image>
        <view class="empty-text">您还没有相关信息哦!</view>
      </view>
    </view>

    <!-- 右下角悬浮留言按钮：进填写意见反馈页 -->
    <image class="liuyan-btn" src="/static/images/liuyan.png" mode="aspectFit" @click="onWrite"></image>
  </view>
</template>

<script setup>
/**
 * 意见反馈记录列表
 * 入口：mine 菜单「意见反馈」；右下角 liuyan.png 进填写页；数据来自 user/feedback/list。
 */
import { ref } from 'vue'
import { onShow, onReachBottom } from '@dcloudio/uni-app'
import customNav from '@/components/custom-nav/custom-nav.vue'
import { getFeedbackList } from '@/api/login'

// 反馈记录列表 + 分页状态
const list = ref([])
const pageNo = ref(1)
const loading = ref(false)
const finished = ref(false)

onShow(() => {
  // 每次进页回到第一页重新拉
  loadList()
})

// 滚动到底部加载下一页
onReachBottom(() => {
  loadList(true)
})

/** 拉取反馈记录：user/feedback/list（返回 { list, nextPage }，字段 content/createTime/reply） */
function loadList(more = false) {
  if (loading.value) return
  if (more && finished.value) return
  loading.value = true
  const page = more ? pageNo.value + 1 : 1
  if (!more) finished.value = false
  getFeedbackList(page).then((res) => {
    if (res.code === 1) {
      const d = res.data
      // 兼容 data 直接是数组或 { list: [...] } 两种返回结构
      const rows = Array.isArray(d) ? d : (d && d.list) || []
      if (more) {
        list.value = list.value.concat(rows)
      } else {
        list.value = rows
      }
      pageNo.value = page
      // 用分页返回的 nextPage 判断是否还有下一页（返回空页兜底）
      if (rows.length === 0 || d.nextPage === false) finished.value = true
    }
    loading.value = false
  }).catch(() => {
    loading.value = false
  })
}

/** 写意见反馈：进填写页 */
function onWrite() {
  uni.navigateTo({ url: '/pages/mine/feedback-add' })
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  background-color: #ffffff;
  /* 给右下角悬浮按钮留出空间 */
  padding-bottom: 60rpx;
}

/* 主体区（顶栏不套此容器，保证白色顶栏铺满屏幕边角含状态栏） */
.body {
  padding: 0 24rpx;
}

/* 单条反馈记录：左侧绿圆图标 + 右侧内容，行间分割线 */
.fb-card {
  display: flex;
  align-items: flex-start;
  padding: 30rpx 12rpx;
  border-bottom: 2rpx solid #f1f2f6;
}

.fb-card:last-of-type {
  border-bottom: none;
}

/* 左侧绿圆包裹信封图标 */
.fb-icon {
  width: 72rpx;
  height: 72rpx;
  border-radius: 50%;
  background-color: #00B39B;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.fb-icon-img {
  width: 34rpx;
  height: 27rpx;
}

/* 右侧内容区 */
.fb-main {
  flex: 1;
  margin-left: 20rpx;
}

.fb-content {
  font-size: 26rpx;
  color: #999999;
  line-height: 38rpx;
  margin-top: 8rpx;
  /* 单行展示，超出省略 */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.fb-time {
  font-size: 26rpx;
  color: #333333;
  line-height: 38rpx;
}

/* 平台回复块（有回复才显示） */
.fb-reply {
  margin-top: 16rpx;
  padding: 20rpx;
  background-color: #f8f8f8;
  border-radius: 12rpx;
}

.fb-reply-label {
  font-size: 22rpx;
  color: #00B39B;
  margin-bottom: 8rpx;
}

.fb-reply-text {
  font-size: 24rpx;
  color: #666666;
  line-height: 36rpx;
  word-break: break-all;
}

/* 右下角悬浮留言按钮 */
.liuyan-btn {
  position: fixed;
  right: 40rpx;
  bottom: 180rpx;
  width: 150rpx;
  height: 150rpx;
  z-index: 10;
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
