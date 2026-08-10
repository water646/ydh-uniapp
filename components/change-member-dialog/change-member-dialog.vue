<template>
  <u-popup :show="show" mode="bottom" :round="20" @close="close">
    <view class="change-dialog">
      <view class="title">换人</view>
      <view class="step">下场球员</view>
      <view class="player-grid">
        <view
          v-for="m in playingMembers"
          :key="m.team_member_id"
          class="player"
          :class="{ sel: offId === m.team_member_id }"
          @click="offId = m.team_member_id"
        >
          {{ m.number }} {{ m.name }}
        </view>
        <view v-if="!playingMembers.length" class="empty">无上场球员</view>
      </view>
      <view class="step">上场球员</view>
      <view class="player-grid">
        <view
          v-for="m in benchMembers"
          :key="m.team_member_id"
          class="player"
          :class="{ sel: onId === m.team_member_id }"
          @click="onId = m.team_member_id"
        >
          {{ m.number }} {{ m.name }}
        </view>
        <view v-if="!benchMembers.length" class="empty">无替补球员</view>
      </view>
      <view class="btns">
        <view class="btn cancel" @click="close">取消</view>
        <view class="btn confirm" @click="confirm">确定</view>
      </view>
    </view>
  </u-popup>
</template>

<script setup>
/**
 * 换人弹窗（对应 dialog_change_member / dialog_changemember）
 * 选下场球员(type 13) + 上场球员(type 14)
 * members: MemberData[]（playing.boolean 区分在场/替补）
 */
import { ref, computed, watch } from 'vue'

const props = defineProps({
  show: { type: Boolean, default: false },
  members: { type: Array, default: () => [] }
})
const emit = defineEmits(['confirm', 'close'])

const offId = ref('')
const onId = ref('')

function isOn(m) {
  return !!(m && (m.playing?.boolean || m.playing === 1))
}
const playingMembers = computed(() => props.members.filter(isOn))
const benchMembers = computed(() => props.members.filter((m) => !isOn(m)))

watch(
  () => props.show,
  (v) => {
    if (v) {
      offId.value = ''
      onId.value = ''
    }
  }
)

function confirm() {
  if (!offId.value || !onId.value) {
    uni.showToast({ title: '请选择上下场球员', icon: 'none' })
    return
  }
  emit('confirm', { offId: offId.value, onId: onId.value })
  close()
}
function close() {
  emit('close')
}
</script>

<style lang="scss" scoped>
.change-dialog {
  padding: 30rpx;
}
.title {
  text-align: center;
  font-size: 32rpx;
  color: #333333;
  margin-bottom: 20rpx;
}
.step {
  font-size: 26rpx;
  color: #999999;
  margin: 16rpx 0;
}
.player-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}
.player {
  padding: 16rpx 24rpx;
  border: 1rpx solid #dddddd;
  border-radius: 8rpx;
  font-size: 26rpx;
  color: #333333;
}
.player.sel {
  background-color: #29a871;
  color: #ffffff;
  border-color: #29a871;
}
.empty {
  font-size: 24rpx;
  color: #cccccc;
}
.btns {
  display: flex;
  gap: 20rpx;
  margin-top: 30rpx;
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
