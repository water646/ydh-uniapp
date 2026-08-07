<template>
  <u-popup :show="show" mode="bottom" :round="20" @close="close">
    <view class="section-dialog">
      <view class="item" @click="onSelect('start')">{{ startEndWord }}开始</view>
      <view class="item" @click="onSelect('end')">{{ startEndWord }}结束</view>
      <view class="item" @click="onSelect('prev')">上一{{ prevNextWord }}</view>
      <view class="item" @click="onSelect('next')">下一{{ prevNextWord }}</view>
      <view class="cancel" @click="close">取消</view>
    </view>
  </u-popup>
</template>

<script setup>
/**
 * 小节切换弹窗（对应 dialog_section_type）
 * 选项：开始 / 结束 / 上一节(半场) / 下一节(半场)
 * sport='football' 时文案改为“半场”（足球不分节，只分上/下半场）
 */
const props = defineProps({
  show: { type: Boolean, default: false },
  sport: { type: String, default: 'basketball' }
})
const isFoot = props.sport === 'football'
const startEndWord = isFoot ? '半场' : '小节'
const prevNextWord = isFoot ? '半场' : '节'
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
