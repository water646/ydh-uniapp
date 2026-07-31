<template>
  <view class="battery" :class="{ charging }">
    <view class="battery-body">
      <view class="battery-level" :class="levelClass" :style="{ width: power + '%' }"></view>
    </view>
    <view class="battery-tip"></view>
  </view>
</template>

<script setup>
/**
 * 电池图标（对应 mvp/ui/myview/BatteryView）
 * 用于直播推流页电量显示，按 power 百分比填充
 */
import { computed } from 'vue'

const props = defineProps({
  power: { type: Number, default: 100 }, // 0-100
  charging: { type: Boolean, default: false }
})

const levelClass = computed(() => {
  if (props.power <= 20) return 'low'
  if (props.power <= 50) return 'mid'
  return 'high'
})
</script>

<style lang="scss" scoped>
.battery {
  display: flex;
  align-items: center;
}
.battery-body {
  width: 44rpx;
  height: 22rpx;
  border: 2rpx solid #ffffff;
  border-radius: 4rpx;
  padding: 2rpx;
  box-sizing: border-box;
}
.battery-level {
  height: 100%;
  border-radius: 2rpx;
  transition: width 0.3s;
}
.battery-level.high {
  background-color: #29a871;
}
.battery-level.mid {
  background-color: #ff6f21;
}
.battery-level.low {
  background-color: #ff2d2d;
}
.battery-tip {
  width: 4rpx;
  height: 12rpx;
  background-color: #ffffff;
  border-radius: 0 2rpx 2rpx 0;
}
</style>
