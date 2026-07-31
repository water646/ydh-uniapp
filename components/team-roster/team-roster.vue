<template>
  <view class="team-roster">
    <scroll-view scroll-y class="list">
      <view
        v-for="m in members"
        :key="m.teamMemberId"
        class="member-item"
        @longpress="onLongPress(m)"
      >
        <view class="num">{{ m.number }}</view>
        <view class="name">
          {{ m.name }}
          <text v-if="m.temporary === 1" class="temp">临时</text>
          <text v-if="sport === 'football' && m.position" class="pos">{{ m.position.desc }}</text>
        </view>
        <view class="op sign" :class="{ on: isOn(m.playing) }" @click.stop="toggleSign(m)">到场</view>
        <view class="op start" :class="{ on: isOn(m.startingLineup) }" @click.stop="toggleStart(m)">首发</view>
        <view v-if="m.temporary === 1" class="op del" @click.stop="onDel(m)">删除</view>
      </view>
      <empty-layout v-if="!members.length" status="empty" />
    </scroll-view>

    <view class="bottom">
      <view class="btn add" @click="showAdd = true">添加队员</view>
      <view class="btn forfeit" @click="onForfeit">弃权</view>
    </view>

    <add-member-dialog :show="showAdd" :sport="sport" @confirm="onAdd" @close="showAdd = false" />
  </view>
</template>

<script setup>
/**
 * 球员管理 Tab（对应 HomeInfomationFragment / GameSetHostFragment / HomeFootInfomationFragment）
 * - 拉取成员列表（对应 getMember），缓存到本地 member 表
 * - 到场签到/取消（memberSign / cancelMemberSign）
 * - 首发设置/取消（startingLineup / startingLineupCancel）
 * - 添加临时球员（addMember）/ 删除临时球员（deleteMember）
 * - 足球长按改位置（memberEditPosition）
 * type: 1 主队 / 0 客队
 */
import { ref, watch } from 'vue'
import {
  getMember,
  memberSign,
  cancelMemberSign,
  startingLineup,
  startingLineupCancel,
  addMember,
  deleteMember,
  memberEditPosition
} from '@/api/game'
import { insertOrReplace } from '@/utils/db'
import emptyLayout from '@/components/empty-layout/empty-layout.vue'
import addMemberDialog from '@/components/add-member-dialog/add-member-dialog.vue'

const props = defineProps({
  gameId: { type: String, default: '' },
  gameTeamId: { type: String, default: '' },
  sport: { type: String, default: 'basketball' },
  type: { type: Number, default: 1 }
})

const members = ref([])
const showAdd = ref(false)

/** EnumValueBool 是否开启 */
function isOn(v) {
  return !!(v && (v.boolean || v.value === 1))
}

function load() {
  if (!props.gameTeamId) return
  getMember(props.gameTeamId).then((res) => {
    if (res.code === 1) {
      members.value = res.data || []
      cacheLocal()
    }
  })
}

/** 缓存到本地 member 表（对应 HomeInfomationFragment 写 GreenDAO） */
function cacheLocal() {
  members.value.forEach((m) => {
    insertOrReplace('member', {
      team_member_id: m.teamMemberId,
      game_id: props.gameId,
      type: props.type,
      name: m.name,
      number: m.number,
      startingLineup: isOn(m.startingLineup) ? 1 : 0,
      playing: isOn(m.playing) ? 1 : 0
    })
  })
}

watch(() => props.gameTeamId, load, { immediate: true })

function toggleSign(m) {
  const api = isOn(m.playing) ? cancelMemberSign : memberSign
  api({ gameTeamId: props.gameTeamId, teamMemberId: m.teamMemberId }).then((res) => {
    if (res.code === 1) load()
    else uni.showToast({ title: res.msg || '操作失败', icon: 'none' })
  })
}

function toggleStart(m) {
  const api = isOn(m.startingLineup) ? startingLineupCancel : startingLineup
  api({ gameTeamId: props.gameTeamId, teamMemberId: m.teamMemberId }).then((res) => {
    if (res.code === 1) load()
    else uni.showToast({ title: res.msg || '操作失败', icon: 'none' })
  })
}

function onAdd(form) {
  addMember({
    gameTeamId: props.gameTeamId,
    number: form.number,
    name: form.name,
    position: form.position
  }).then((res) => {
    if (res.code === 1) {
      showAdd.value = false
      load()
    } else {
      uni.showToast({ title: res.msg || '添加失败', icon: 'none' })
    }
  })
}

function onDel(m) {
  uni.showModal({
    title: '提示',
    content: '确定删除该临时球员？',
    success: (r) => {
      if (r.confirm) {
        deleteMember(m.id, m.teamMemberId).then((res) => {
          if (res.code === 1) load()
        })
      }
    }
  })
}

function onForfeit() {
  uni.showToast({ title: '弃权功能待实现', icon: 'none' })
}

/** 足球长按改位置（对应 HomeFootInfomationFragment 长按改位置） */
function onLongPress(m) {
  if (props.sport !== 'football') return
  uni.showModal({
    title: '修改位置',
    editable: true,
    placeholderText: '请输入位置',
    content: m.position ? m.position.desc : '',
    success: (r) => {
      if (r.confirm && r.content !== '') {
        memberEditPosition({ teamMemberId: m.teamMemberId, position: r.content }).then((res) => {
          if (res.code === 1) load()
        })
      }
    }
  })
}

defineExpose({ refresh: load })
</script>

<style lang="scss" scoped>
.team-roster {
  height: 100%;
  display: flex;
  flex-direction: column;
}
.list {
  flex: 1;
}
.member-item {
  display: flex;
  align-items: center;
  padding: 24rpx 30rpx;
  border-bottom: 1rpx solid #f2f2f2;
  background-color: #ffffff;
}
.num {
  width: 70rpx;
  font-size: 30rpx;
  color: #29a871;
  font-weight: bold;
}
.name {
  flex: 1;
  font-size: 28rpx;
  color: #333333;
}
.temp {
  font-size: 20rpx;
  color: #ff6f21;
  margin-left: 10rpx;
  border: 1rpx solid #ff6f21;
  padding: 0 8rpx;
  border-radius: 4rpx;
}
.pos {
  font-size: 22rpx;
  color: #999999;
  margin-left: 10rpx;
}
.op {
  font-size: 24rpx;
  padding: 10rpx 20rpx;
  border-radius: 30rpx;
  margin-left: 10rpx;
  background-color: #f2f2f2;
  color: #999999;
}
.op.on {
  background-color: #29a871;
  color: #ffffff;
}
.op.del {
  background-color: #ffeeee;
  color: #ff2d2d;
}
.bottom {
  display: flex;
  padding: 20rpx 30rpx;
  gap: 20rpx;
  background-color: #ffffff;
  border-top: 1rpx solid #eeeeee;
}
.btn {
  flex: 1;
  height: 80rpx;
  line-height: 80rpx;
  text-align: center;
  border-radius: 40rpx;
  font-size: 28rpx;
}
.add {
  background-color: #29a871;
  color: #ffffff;
}
.forfeit {
  background-color: #f2f2f2;
  color: #666666;
}
</style>
