<template>
  <view class="team-roster" :class="{ 'team-roster--setup': setupMode }">
    <!-- setup 模式头部行：左队名 + 右红色「添加球员」按钮 -->
    <view v-if="setupMode" class="head">
      <text class="head-name" style="font-size: 27rpx;">{{ teamName || (type === 1 ? '主队' : '客队') }}</text>
      <view class="head-add" style="font-size: 27rpx; " @click="showAdd = true">添加球员</view>
    </view>

    <scroll-view scroll-y class="list">
      <view
        v-for="m in members"
        :key="m.teamMemberId"
        class="member-item"
        @longpress="onLongPress(m)"
      >
        <!-- 序号+名字包裹层：旧模式等价于原布局；setup 模式为 260rpx 虚线矩形框 -->
        <view class="numwrap">
          <view class="num">{{ m.number }}</view>
          <!-- setup 模式：序号与名字之间的虚线竖线（旧模式 display:none） -->
          <view class="vline"></view>
          <view class="name">
            {{ m.name }}
            <text v-if="m.temporary === 1" class="temp">临时</text>
            <text v-if="sport === 'football' && m.position" class="pos">{{ m.position.desc }}</text>
          </view>
        </view>
        <view class="op sign" :class="{ on: isSigned(m) }" @click.stop="toggleSign(m)">到场</view>
        <view class="op start" :class="{ on: isOn(m.startingLineup) }" @click.stop="toggleStart(m)">首发</view>
        <view v-if="m.temporary === 1" class="op del" @click.stop="onDel(m)">删除</view>
      </view>
      <empty-layout v-if="!members.length" status="empty" />
    </scroll-view>

    <!-- setup 模式：底部只有「主队/客队弃权」红按钮；旧模式保留添加队员+弃权 -->
    <view class="bottom" :class="{ setup: setupMode }">
      <template v-if="setupMode">
        <view class="btn forfeit-red" @click="onForfeit">{{ type === 1 ? '主队弃权' : '客队弃权' }}</view>
        <view class="forfeit-note">注:弃权比分默认20:0，弃权0积分</view>
      </template>
      <template v-else>
        <view class="btn add" @click="showAdd = true">添加队员</view>
        <view class="btn forfeit" @click="onForfeit">弃权</view>
      </template>
    </view>

    <add-member-dialog :show="showAdd" :sport="sport" @confirm="onAdd" @close="showAdd = false" />
  </view>
</template>

<script setup>
/**
 * 球员管理 Tab（对应 HomeInfomationFragment / GameSetHostFragment / HomeFootInfomationFragment）
 * - 拉取成员列表（statistics/member/list 全队名单；行 id 即 statisticsMemberId，非空=已到场签到）
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
  memberEditPosition,
  teamWaiver
} from '@/api/game'
import { insertOrReplace, countWhere } from '@/utils/db'
import emptyLayout from '@/components/empty-layout/empty-layout.vue'
import addMemberDialog from '@/components/add-member-dialog/add-member-dialog.vue'

const props = defineProps({
  gameId: { type: String, default: '' },
  gameTeamId: { type: String, default: '' },
  sport: { type: String, default: 'basketball' },
  type: { type: Number, default: 1 },
  // 篮球赛前设置页新布局：头部队名+添加球员、底部弃权红按钮、列表与顶栏留隙
  setupMode: { type: Boolean, default: false },
  teamName: { type: String, default: '' }
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

/** 是否已到场：签到后行 id（statisticsMemberId）非空 */
function isSigned(m) {
  return !!m.id
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
      playing: isSigned(m) ? 1 : 0
    })
  })
}

watch(() => props.gameTeamId, load, { immediate: true })

function toggleSign(m) {
  if (!isSigned(m)) {
    // 未到场 -> 签到
    memberSign({ gameTeamId: props.gameTeamId, teamMemberId: m.teamMemberId }).then((res) => {
      if (res.code === 1) load()
      else uni.showToast({ title: res.msg || '操作失败', icon: 'none' })
    })
    return
  }
  // 已到场 -> 取消；本地已有技术记录的球员不能取消（对应老项目校验）
  countWhere('technical_record', `statistics_member_id='${m.id}'`).then((cnt) => {
    if (cnt > 0) {
      uni.showToast({ title: '该球员已经存在数据，不能取消到场', icon: 'none' })
      return
    }
    cancelMemberSign({ statisticsMemberId: m.id }).then((res) => {
      if (res.code === 1) load()
      else uni.showToast({ title: res.msg || '操作失败', icon: 'none' })
    })
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
  // position 为后端枚举（篮球 1-5：中锋/大前锋/小前锋/得分后卫/控球后卫），传空串/中文会被 400 拒绝，为空时不传
  const payload = { gameTeamId: props.gameTeamId, number: form.number, name: form.name }
  if (form.position) payload.position = form.position
  addMember(payload).then((res) => {
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

/** 弃权：二次确认后调 game/team/{gameTeamId}/waiver（被弃权方判 0:20，比赛直接结束，不可撤销） */
function onForfeit() {
  const side = props.type === 1 ? '主队' : '客队'
  uni.showModal({
    title: '提示',
    content: `确定${side}弃权吗？弃权后按 0:20 判负，比赛将直接结束且不可撤销`,
    success: (r) => {
      if (!r.confirm) return
      teamWaiver(props.gameTeamId).then((res) => {
        if (res.code === 1) {
          uni.showToast({ title: '已弃权', icon: 'none' })
          load()
        } else {
          uni.showToast({ title: res.msg || '弃权失败', icon: 'none' })
        }
      })
    }
  })
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
/* setup 模式：列表与顶栏留 10rpx 空隙（露出灰底） */
.team-roster--setup {
  padding-top: 10rpx;
}
/* 头部行：随基底灰底，左队名 + 右红色圆角矩形按钮；行定高 60rpx，
   按钮高 64rpx 上下溢出行外占满灰色空隙（上下各只留 8rpx），10rpx 空隙布局不变 */
.head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 66rpx;
  padding: 0 30rpx 10rpx;
  background-color: transparent;
}
.head-name {
  font-size: 30rpx;
  color: #333333;
}
.head-add {
  height: 72rpx;
  line-height: 72rpx;
  padding: 0 30rpx;
  background-color: #F4584C;
  border-radius: 4rpx;
  color: #ffffff;
  font-size: 30rpx;
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
/* 序号+名字包裹层：旧模式下与原横向布局等价 */
.numwrap {
  flex: 1;
  display: flex;
  align-items: center;
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
/* 到场：未到场绿色（点击签到），已到场置灰（点击取消到场） */
.op.sign {
  background-color: #29a871;
  color: #ffffff;
}
.op.sign.on {
  background-color: #f2f2f2;
  color: #999999;
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
/* setup 模式底栏：透明底无上边线，弃权红按钮 + 说明文字纵向居中 */
.bottom.setup {
  background-color: transparent;
  border-top: none;
  flex-direction: column;
  align-items: center;
}
.btn.forfeit-red {
  flex: none;
  width: 250rpx;
  height: 88rpx;
  line-height: 88rpx;
  border-radius: 6rpx;
  background-color: #F3584E;
  color: #ffffff;
  font-size: 30rpx;
}
/* 弃权按钮下方灰色小字说明 */
.forfeit-note {
  margin-top: 16rpx;
  text-align: center;
  font-size: 22rpx;
  color: #999999;
}

/* ---- setup 模式列表样式（旧页面保持绿色不变） ---- */
/* 球员条目上下内距压缩（行高约为原来的 0.8 倍） */
.team-roster--setup .member-item {
  padding: 10rpx 30rpx;
}
/* 序号+名字：260rpx 宽、3rpx 粗灰色虚线矩形框（透明度 0.5），内容靠左紧挨（框高 70rpx，字与框上下间距 1.5 倍） */
.team-roster--setup .numwrap {
  flex: none;
  width: 260rpx;
  height: 70rpx;
  box-sizing: border-box;
  border: 3rpx dashed rgba(175, 175, 175, 0.3);
  display: flex;
  align-items: center;
  padding: 0 12rpx;
}
/* 序号红色；定宽与文字高度一致的方形单元格，让虚线分割线在不同号码位数下都对齐在同一位置 */
.team-roster--setup .num {
  color: #F4584C;
  width: 40rpx;
  height: 40rpx;
  line-height: 40rpx;
  flex: none;
}
.team-roster--setup .name {
  flex: none;
  height: auto;
  border: none;
  padding: 0;
}
/* 到场/首发：圆形按钮，不亮 #AFAFAF 白字 */
.team-roster--setup .op.sign,
.team-roster--setup .op.start {
  width: 64rpx;
  height: 64rpx;
  padding: 0;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #AFAFAF;
  color: #ffffff;
  margin-left: 12rpx;
}
/* 亮起态红色：到场=已签到亮、未签到灭；首发选中亮 */
.team-roster--setup .op.sign.on,
.team-roster--setup .op.start.on {
  background-color: #F4584C;
}
/* 到场按钮吃掉剩余空间，把到场/首发推到行右缘；两圆钮间距加倍 */
.team-roster--setup .op.sign {
  margin-left: auto;
}
.team-roster--setup .op.start {
  margin-left: 40rpx;
  /* 右侧让出 25rpx 使首发整体左移；间距 50→40 再让到场相对左移 15 */
  margin-right: 25rpx;
}
/* 序号与名字之间的虚线竖线（旧模式不显示） */
.vline {
  display: none;
}
.team-roster--setup .vline {
  display: block;
  width: 0;
  height: 36rpx;
  border-left: 3rpx dashed rgba(175, 175, 175, 0.3);
  margin: 0 10rpx;
}
</style>
