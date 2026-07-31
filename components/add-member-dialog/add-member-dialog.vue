<template>
  <u-popup :show="show" mode="center" :round="20" @close="close">
    <view class="add-dialog">
      <view class="title">添加球员</view>
      <input v-model="form.number" class="input" type="number" placeholder="请输入号码" />
      <input v-model="form.name" class="input" placeholder="请输入姓名" />
      <input v-if="sport === 'football'" v-model="form.position" class="input" placeholder="请输入位置" />
      <view class="btns">
        <view class="btn cancel" @click="close">取消</view>
        <view class="btn confirm" @click="confirm">确定</view>
      </view>
    </view>
  </u-popup>
</template>

<script setup>
/**
 * 添加临时球员弹窗（对应 res/layout/dialog_add_member.xml）
 * 提交参数对应 AddMemberData：gameTeamId/number/name/position（position 仅足球）
 */
import { reactive, watch } from 'vue'

const props = defineProps({
  show: { type: Boolean, default: false },
  sport: { type: String, default: 'basketball' }
})
const emit = defineEmits(['confirm', 'close'])

const form = reactive({ number: '', name: '', position: '' })

watch(
  () => props.show,
  (v) => {
    if (v) Object.assign(form, { number: '', name: '', position: '' })
  }
)

function confirm() {
  if (!form.number || !form.name) {
    uni.showToast({ title: '请填写完整', icon: 'none' })
    return
  }
  emit('confirm', { ...form })
  close()
}
function close() {
  emit('close')
}
</script>

<style lang="scss" scoped>
.add-dialog {
  width: 560rpx;
  padding: 40rpx;
}
.title {
  text-align: center;
  font-size: 32rpx;
  color: #333333;
  margin-bottom: 30rpx;
}
.input {
  height: 80rpx;
  border: 1rpx solid #eeeeee;
  border-radius: 8rpx;
  padding: 0 20rpx;
  margin-bottom: 20rpx;
  font-size: 28rpx;
}
.btns {
  display: flex;
  gap: 20rpx;
  margin-top: 10rpx;
}
.btn {
  flex: 1;
  height: 80rpx;
  line-height: 80rpx;
  text-align: center;
  border-radius: 40rpx;
  font-size: 28rpx;
}
.cancel {
  background-color: #f2f2f2;
  color: #666666;
}
.confirm {
  background-color: #29a871;
  color: #ffffff;
}
</style>
