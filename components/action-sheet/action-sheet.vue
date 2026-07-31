<template>
  <u-popup :show="show" mode="bottom" :round="20" @close="close">
    <view class="action-sheet">
      <view class="sheet-title">{{ title }}</view>
      <view class="grid">
        <view
          v-for="a in actions"
          :key="a.type"
          class="action"
          :class="a.color"
          @click="onSelect(a)"
        >
          {{ a.desc }}
        </view>
      </view>
    </view>
  </u-popup>
</template>

<script setup>
/**
 * 动作选择底部 sheet（对应 res/layout/dialog_basket.xml）
 * 接收动作列表（{type,desc,color}），选中后 emit
 */
defineProps({
  show: { type: Boolean, default: false },
  title: { type: String, default: '选择动作' },
  actions: { type: Array, default: () => [] }
})
const emit = defineEmits(['select', 'close'])

function onSelect(a) {
  emit('select', a)
  emit('close')
}
function close() {
  emit('close')
}
</script>

<style lang="scss" scoped>
.action-sheet {
  padding: 30rpx;
}
.sheet-title {
  text-align: center;
  font-size: 28rpx;
  color: #999999;
  margin-bottom: 20rpx;
}
.grid {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
}
.action {
  width: calc(33.33% - 14rpx);
  height: 80rpx;
  line-height: 80rpx;
  text-align: center;
  border-radius: 8rpx;
  font-size: 26rpx;
  color: #ffffff;
}
.action.green {
  background-color: #29a871;
}
.action.red {
  background-color: #ff2d2d;
}
.action.blue {
  background-color: #009de9;
}
</style>
