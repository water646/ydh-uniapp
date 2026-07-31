<template>
  <u-popup :show="show" mode="bottom" :round="20" @close="close">
    <view class="status-dialog">
      <view class="item" @click="onSelect(0, '未开始')">未开始</view>
      <view class="item" @click="onSelect(1, '进行中')">进行中</view>
      <view class="item" @click="onSelect(2, '已结束')">已结束</view>
      <view class="cancel" @click="close">取消</view>
    </view>
  </u-popup>
</template>

<script setup>
/**
 * 比赛状态选择弹窗（对应 res/layout/dialog_game_status.xml）
 * 状态值：0 未开始 / 1 进行中 / 2 已结束（对应 GameStatusData.status）
 */
defineProps({
  show: { type: Boolean, default: false }
})
const emit = defineEmits(['select', 'close'])

function onSelect(value, desc) {
  emit('select', { value, desc })
  close()
}
function close() {
  emit('close')
}
</script>

<style lang="scss" scoped>
.status-dialog {
  padding: 20rpx 0;
}
.item {
  height: 100rpx;
  line-height: 100rpx;
  text-align: center;
  font-size: 30rpx;
  color: #333333;
  border-bottom: 1rpx solid #f2f2f2;
}
.cancel {
  height: 100rpx;
  line-height: 100rpx;
  text-align: center;
  font-size: 30rpx;
  color: #999999;
  margin-top: 16rpx;
  border-top: 10rpx solid #f8f8f8;
}
</style>
