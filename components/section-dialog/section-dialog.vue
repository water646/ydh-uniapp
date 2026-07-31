<template>
  <u-popup :show="show" mode="bottom" :round="20" @close="close">
    <view class="section-dialog">
      <view class="item" @click="onSelect('start')">小节开始</view>
      <view class="item" @click="onSelect('end')">小节结束</view>
      <view class="item" @click="onSelect('prev')">上一节</view>
      <view class="item" @click="onSelect('next')">下一节</view>
      <view class="cancel" @click="close">取消</view>
    </view>
  </u-popup>
</template>

<script setup>
/**
 * 小节切换弹窗（对应 dialog_section_type）
 * 选项：小节开始 / 小节结束 / 上一节 / 下一节
 */
defineProps({
  show: { type: Boolean, default: false }
})
const emit = defineEmits(['select', 'close'])

function onSelect(t) {
  emit('select', t)
  emit('close')
}
function close() {
  emit('close')
}
</script>

<style lang="scss" scoped>
.section-dialog {
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
