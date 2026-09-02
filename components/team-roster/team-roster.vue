<template>
  <view
    class="team-roster"
    :class="{ 'team-roster--setup': setupMode }"
    :style="setupMode ? { '--tc': pageColor, '--tcl': pageColorLight, '--cc': circleColor } : null"
  >
    <!-- setup 模式头部行：左队名 + 右球衣颜色圆 + 「添加球员」按钮 -->
    <view v-if="setupMode" class="head">
      <text class="head-name" style="font-size: 27rpx;">{{ teamName || (type === 1 ? '主队' : '客队') }}</text>
      <view class="head-right">
        <!-- 球衣颜色圆：点击弹层选色，选中色替换本 tab 各处红色 -->
        <view class="jersey-circle" @click="openColorSheet">
          <view class="jersey">
            <view class="jersey-sleeve l"></view>
            <view class="jersey-body"></view>
            <view class="jersey-sleeve r"></view>
          </view>
        </view>
        <view class="head-add" style="font-size: 27rpx; " @click="showAdd = true">添加球员</view>
      </view>
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

    <!-- setup 模式：球队颜色选择弹层（主/客队各自独立）：自由选色 + 常用预设 -->
    <u-popup v-if="setupMode" :show="showColorSheet" mode="bottom" :round="20" @close="showColorSheet = false">
      <view class="sheet-colors">
        <view class="cs-title">选择球队颜色</view>

        <!-- 自由选色：SV 面板 + 色相条，拖动实时预览，完成后应用 -->
        <view class="cp-preview">
          <view class="cp-preview-color" :style="{ backgroundColor: pickHex }"></view>
          <text class="cp-preview-hex">{{ pickHex.toUpperCase() }}</text>
        </view>
        <view
          class="cp-sv"
          :style="{ backgroundColor: 'hsl(' + hue + ', 100%, 50%)' }"
          @touchstart="onSvTouch"
          @touchmove.stop.prevent="onSvTouch"
        >
          <view class="cp-sv-white"></view>
          <view class="cp-sv-black"></view>
          <view class="cp-cursor" :style="{ left: sat * 100 + '%', top: (1 - val) * 100 + '%', backgroundColor: pickHex }"></view>
        </view>
        <view class="cp-hue" @touchstart="onHueTouch" @touchmove.stop.prevent="onHueTouch">
          <view class="cp-hue-cursor" :style="{ left: (hue / 360) * 100 + '%', backgroundColor: 'hsl(' + hue + ', 100%, 50%)' }"></view>
        </view>
        <view class="cp-done" @click="onPickColor(pickHex)">完成</view>

        <view class="cs-title cs-title2">常用颜色</view>
        <view class="cs-grid">
          <view
            v-for="c in COLORS"
            :key="c"
            class="cs-item"
            :style="{ backgroundColor: c }"
            @click="onPickColor(c)"
          >
            <text v-if="teamColor === c" class="cs-check" :style="{ color: c === '#FFFFFF' ? '#333333' : '#ffffff' }">✓</text>
          </view>
        </view>
      </view>
    </u-popup>
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
import { ref, computed, watch, getCurrentInstance } from 'vue'
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

// 组件实例：节点查询要用，必须在 setup 期间捕获（事件回调里 getCurrentInstance() 是 null）
const instance = getCurrentInstance()

// ---- setup 模式球队颜色（主/客队为两个实例天然独立，按 gameTeamId 持久化） ----
const COLORS = ['#F4584C', '#00B39B', '#1890FF', '#722ED1', '#FA8C16', '#FADB14', '#52C41A', '#13C2C2', '#EB2F96', '#2F3542', '#8C8C8C', '#FFFFFF']
const teamColor = ref('')
const showColorSheet = ref(false)
// 页面各处"红色"用选中色（未选回落默认红）；球衣圆初始与页面统一为默认红
const pageColor = computed(() => teamColor.value || '#F4584C')
const pageColorLight = computed(() => mixWhite(pageColor.value, 0.88))
const circleColor = computed(() => teamColor.value || '#F4584C')

watch(() => props.gameTeamId, () => {
  teamColor.value = uni.getStorageSync('team_color_' + props.gameTeamId) || ''
}, { immediate: true })

/** 选色：记录并按 gameTeamId 存本地 */
function onPickColor(c) {
  teamColor.value = c
  uni.setStorageSync('team_color_' + props.gameTeamId, c)
  showColorSheet.value = false
}

// ---- 自由选色（HSV：色相条 + 饱和度/明度面板） ----
const hue = ref(4)
const sat = ref(1)
const val = ref(0.957)
const pickHex = computed(() => hsv2hex(hue.value, sat.value, val.value))
let svRect = null
let hueRect = null

/** 打开弹层：游标初始化为当前颜色，并量取选色区尺寸供触摸换算 */
function openColorSheet() {
  const hsv = hex2hsv(teamColor.value || '#F4584C')
  hue.value = hsv[0]
  sat.value = hsv[1]
  val.value = hsv[2]
  showColorSheet.value = true
  // 等弹层动画结束再量，避免量到动画中的位置
  setTimeout(queryPickerRects, 350)
}

function queryPickerRects() {
  uni.createSelectorQuery().in(instance.proxy).select('.cp-sv').boundingClientRect().select('.cp-hue').boundingClientRect().exec((res) => {
    if (res[0]) svRect = res[0]
    if (res[1]) hueRect = res[1]
  })
}

/** SV 面板：横向饱和度、纵向明度 */
function onSvTouch(e) {
  const t = e.touches && e.touches[0]
  if (!t) return
  if (!svRect) {
    queryPickerRects() // 兜底：量到后下一次触摸生效
    return
  }
  sat.value = clamp((t.clientX - svRect.left) / svRect.width)
  val.value = 1 - clamp((t.clientY - svRect.top) / svRect.height)
}

/** 色相条：横向 0-360° */
function onHueTouch(e) {
  const t = e.touches && e.touches[0]
  if (!t) return
  if (!hueRect) {
    queryPickerRects()
    return
  }
  hue.value = Math.round(clamp((t.clientX - hueRect.left) / hueRect.width) * 359)
}

function clamp(x) {
  return Math.min(Math.max(x, 0), 1)
}

/** HSV -> #RRGGBB */
function hsv2hex(h, s, v) {
  const f = (n) => {
    const k = (n + h / 60) % 6
    const x = v - v * s * Math.max(Math.min(k, 4 - k, 1), 0)
    return Math.round(x * 255).toString(16).padStart(2, '0')
  }
  return '#' + f(5) + f(3) + f(1)
}

/** #RRGGBB -> [h, s, v] */
function hex2hsv(hex) {
  const n = (hex || '').replace('#', '')
  if (n.length !== 6) return [4, 1, 0.957]
  const r = parseInt(n.slice(0, 2), 16) / 255
  const g = parseInt(n.slice(2, 4), 16) / 255
  const b = parseInt(n.slice(4, 6), 16) / 255
  const mx = Math.max(r, g, b)
  const mn = Math.min(r, g, b)
  const d = mx - mn
  let h = 0
  if (d !== 0) {
    if (mx === r) h = ((g - b) / d) % 6
    else if (mx === g) h = (b - r) / d + 2
    else h = (r - g) / d + 4
    h = Math.round(h * 60)
    if (h < 0) h += 360
  }
  return [h, mx === 0 ? 0 : d / mx, mx]
}

/** 颜色向白混合（ratio 为白权重），给删除标签做浅底 */
function mixWhite(hex, ratio) {
  const n = (hex || '').replace('#', '')
  if (n.length !== 6) return hex
  const f = (x) => Math.round(x + (255 - x) * ratio).toString(16).padStart(2, '0')
  return '#' + f(parseInt(n.slice(0, 2), 16)) + f(parseInt(n.slice(2, 4), 16)) + f(parseInt(n.slice(4, 6), 16))
}

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
  background-color: var(--tc, #F4584C);
  border-radius: 4rpx;
  color: #ffffff;
  font-size: 30rpx;
}
/* 头部右侧组：球衣颜色圆 + 添加球员按钮 */
.head-right {
  display: flex;
  align-items: center;
}
/* 球衣颜色圆：白底 + 当前色描边（默认主题绿），内画同色球衣 */
.jersey-circle {
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  background-color: #ffffff;
  border: 3rpx solid var(--cc, #F4584C);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16rpx;
  flex-shrink: 0;
}
.jersey {
  position: relative;
  width: 30rpx;
  height: 28rpx;
}
.jersey-body {
  position: absolute;
  left: 8rpx;
  top: 5rpx;
  width: 14rpx;
  height: 22rpx;
  background-color: var(--cc, #F4584C);
  border-radius: 0 0 5rpx 5rpx;
}
.jersey-sleeve {
  position: absolute;
  top: 5rpx;
  width: 9rpx;
  height: 11rpx;
  background-color: var(--cc, #F4584C);
}
.jersey-sleeve.l {
  left: 0;
  border-radius: 4rpx 0 2rpx 2rpx;
  transform: skewY(18deg);
}
.jersey-sleeve.r {
  right: 0;
  border-radius: 0 4rpx 2rpx 2rpx;
  transform: skewY(-18deg);
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
/* .op.del 的颜色在文件末尾统一用球队色变量定义 */
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
  background-color: var(--tc, #F3584E);
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
/* 序号；定宽与文字高度一致的方形单元格，让虚线分割线在不同号码位数下都对齐在同一位置 */
.team-roster--setup .num {
  color: var(--tc, #F4584C);
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
/* 亮起态：到场=已签到亮、未签到灭；首发选中亮；颜色随球队色 */
.team-roster--setup .op.sign.on,
.team-roster--setup .op.start.on {
  background-color: var(--tc, #F4584C);
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
/* 临时球员删除标签：浅色随球队色（--tcl 由 JS 混白得出） */
.op.del {
  background-color: var(--tcl, #ffeeee);
  color: var(--tc, #ff2d2d);
}
/* 球队颜色选择弹层 */
.sheet-colors {
  padding: 30rpx 30rpx 50rpx;
}
.cs-title {
  text-align: center;
  font-size: 28rpx;
  color: #999999;
  margin-bottom: 30rpx;
}
.cs-title2 {
  margin-top: 10rpx;
  text-align: left;
}
/* 自由选色：预览 + SV 面板 + 色相条 */
.cp-preview {
  display: flex;
  align-items: center;
  margin-bottom: 24rpx;
}
.cp-preview-color {
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  border: 2rpx solid #eeeeee;
  margin-right: 20rpx;
}
.cp-preview-hex {
  font-size: 28rpx;
  color: #333333;
}
.cp-sv {
  position: relative;
  height: 300rpx;
  border-radius: 12rpx;
  overflow: hidden;
}
.cp-sv-white {
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to right, #ffffff, rgba(255, 255, 255, 0));
}
.cp-sv-black {
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to top, #000000, rgba(0, 0, 0, 0));
}
.cp-cursor {
  position: absolute;
  width: 36rpx;
  height: 36rpx;
  border-radius: 50%;
  border: 4rpx solid #ffffff;
  box-shadow: 0 0 6rpx rgba(0, 0, 0, 0.4);
  transform: translate(-50%, -50%);
}
.cp-hue {
  position: relative;
  height: 36rpx;
  border-radius: 18rpx;
  margin-top: 24rpx;
  background: linear-gradient(to right, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%);
}
.cp-hue-cursor {
  position: absolute;
  top: 50%;
  width: 44rpx;
  height: 44rpx;
  border-radius: 50%;
  border: 4rpx solid #ffffff;
  box-shadow: 0 0 6rpx rgba(0, 0, 0, 0.4);
  transform: translate(-50%, -50%);
}
.cp-done {
  margin-top: 30rpx;
  height: 80rpx;
  line-height: 80rpx;
  text-align: center;
  border-radius: 40rpx;
  background-color: #00B39B;
  color: #ffffff;
  font-size: 28rpx;
}
.cs-grid {
  display: flex;
  flex-wrap: wrap;
}
.cs-item {
  width: 72rpx;
  height: 72rpx;
  border-radius: 50%;
  border: 2rpx solid #eeeeee;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 28rpx 28rpx 0;
}
.cs-check {
  font-size: 34rpx;
  font-weight: bold;
}
</style>
