<template>
  <view class="multi-state">
    <slot v-if="state === 'content'" />
    <view v-else-if="state === 'loading'" class="ms-state">
      <view class="spinner"></view>
      <text class="ms-text">加载中…</text>
    </view>
    <view v-else-if="state === 'error'" class="ms-state" @click="onRetry">
      <text class="ms-text">加载失败，点击重试</text>
    </view>
    <view v-else-if="state === 'empty'" class="ms-state">
      <text class="ms-text">暂无内容</text>
    </view>
  </view>
</template>

<script setup>
/**
 * 多状态视图（对应 mvp/ui/myview/MultiStateView）
 * state: content / loading / error / empty
 */
defineProps({
  state: { type: String, default: 'content' }
})
const emit = defineEmits(['retry'])
function onRetry() {
  emit('retry')
}
</script>

<style lang="scss" scoped>
.multi-state {
  width: 100%;
}
.ms-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 160rpx 0;
}
.ms-text {
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
