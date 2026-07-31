<template>
  <view class="empty-layout">
    <view v-if="status === 'loading'" class="state">
      <view class="spinner"></view>
      <text class="state-text">加载中…</text>
    </view>
    <view v-else-if="status === 'error'" class="state" @click="onRetry">
      <text class="state-text">加载失败，点击页面重试</text>
    </view>
    <view v-else-if="status === 'empty'" class="state">
      <text class="state-text">暂无内容</text>
    </view>
    <view v-else-if="status === 'nodata'" class="state">
      <text class="state-text">暂无内容</text>
    </view>
    <slot v-else />
  </view>
</template>

<script setup>
/**
 * 空状态视图（对应 mvp/ui/myview/EmptyLayout）
 * 状态：loading / error / empty / nodata / 默认(隐藏，显示插槽)
 */
defineProps({
  status: { type: String, default: '' }
})
const emit = defineEmits(['retry'])

function onRetry() {
  emit('retry')
}
</script>

<style lang="scss" scoped>
.empty-layout {
  width: 100%;
}
.state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx 0;
}
.state-text {
  margin-top: 20rpx;
  font-size: 26rpx;
  color: #999999;
}
.spinner {
  width: 48rpx;
  height: 48rpx;
  border: 4rpx solid #eeeeee;
  border-top-color: #29a871;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
