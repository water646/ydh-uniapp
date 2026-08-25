<template>
  <view class="popblcok" v-if="show" @click="close">
    <view class="popwindow" @click.stop>
      <view class="potobgc">
        <image class="pupmainicon" src="/static/images/pupmainicon.png" mode=""></image>
      </view>
      <view class="poconte">{{ message }}</view>
      <view class="pobuton">
        <view class="poreturn" v-if="showCancel" @click="close">
          <view class="poreturntext">取消</view>
        </view>
        <view class="porenter" :class="{ single: !showCancel }" @click="onConfirm">
          <view class="porentertext">{{ confirmText }}</view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
/**
 * 通用确认弹窗（样式源自「我的」页退出登录弹窗）
 * 用法：<confirm-popup :show="x" message="..." confirm-text="确定" @confirm="..." @cancel="..." />
 */
const props = defineProps({
  show: { type: Boolean, default: false },
  message: { type: String, default: '' },
  confirmText: { type: String, default: '确定' },
  showCancel: { type: Boolean, default: true } // 成功提示类弹窗可传 false 只留确定
})

const emit = defineEmits(['confirm', 'cancel'])

function close() {
  emit('cancel')
}

function onConfirm() {
  emit('confirm')
}
</script>

<style scoped>
.popblcok {
  position: fixed;
  top: 0;
  bottom: 0;
  right: 0;
  left: 0;
  background-color: rgba(0, 0, 0, 0.38);
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  z-index: 999;
}

.popwindow {
  position: absolute;
  display: flex;
  flex-direction: column;
  width: 610rpx;
  height: 394rpx;
  top: 40%;
  background-color: #fff;
  border-radius: 40rpx;
  overflow: visible;
}

.potobgc {
  width: 610rpx;
  height: 104rpx;
  background: linear-gradient(180deg, rgba(27, 208, 184, 0.33) 0%, rgba(255, 255, 255, 0.08) 100%);
  border-radius: 40rpx 40rpx 0 0;
}

.pupmainicon {
  width: 142rpx;
  height: 142rpx;
  margin-top: -64rpx;
}

.poconte {
  height: 182rpx;
  font-weight: 500;
  font-size: 32rpx;
  color: #414141;
  /* 支持多行（message 传 \n）：flex 垂直居中，pre-line 让 \n 生效 */
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 48rpx;
  white-space: pre-line;
  padding: 0 30rpx;
  box-sizing: border-box;
}

.pobuton {
  display: flex;
  margin: 0 auto;
}

.poreturn {
  width: 200rpx;
  height: 72rpx;
  background: #e9e9e9;
  border-radius: 36rpx;
  display: flex;
  justify-content: center;
}

.poreturntext {
  height: 72rpx;
  font-weight: bold;
  font-size: 28rpx;
  line-height: 72rpx;
  color: #333333;
}

.porenter {
  width: 200rpx;
  height: 72rpx;
  background: #00b39b;
  border-radius: 36rpx;
  display: flex;
  justify-content: center;
  margin-left: 48rpx;
}

.porentertext {
  height: 72rpx;
  font-weight: bold;
  font-size: 28rpx;
  line-height: 72rpx;
  color: #ffffff;
}

/* 无取消按钮时：去掉与取消的间距，单独居中 */
.porenter.single {
  margin-left: 0;
}
</style>
