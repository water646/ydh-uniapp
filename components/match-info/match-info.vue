<template>
  <view class="match-info" :class="{ 'match-info--ro': readonly }">
    <!-- 只读模式：白底卡片，日期+时间合并展示、状态纯展示，value 靠右，不可修改（篮球赛前设置页用） -->
    <template v-if="readonly">
      <view class="ro-card">
        <view class="row">
          <text class="label">比赛时间</text>
          <text class="value">{{ dateStr || timeStr ? dateStr + ' ' + timeStr : '—' }}</text>
        </view>
        <view class="row">
          <text class="label">比赛状态</text>
          <text class="value">{{ statusDesc || '—' }}</text>
        </view>
      </view>
    </template>
    <template v-else>
      <view class="row">
        <text class="label">日期</text>
        <picker class="picker" mode="date" :value="dateStr" @change="onDateChange">
          <view class="value">{{ dateStr || '请选择' }} ▼</view>
        </picker>
      </view>
      <view class="row">
        <text class="label">时间</text>
        <picker class="picker" mode="time" :value="timeStr" @change="onTimeChange">
          <view class="value">{{ timeStr || '请选择' }} ▼</view>
        </picker>
      </view>
      <view class="row" @click="showStatus = true">
        <text class="label">状态</text>
        <text class="value">{{ statusDesc }} ▼</text>
      </view>
    </template>

    <view v-if="startMode" class="sync-row">
      <view class="sync-btn start" @click="$emit('start')">开始统计</view>
    </view>
    <view v-else-if="hasSync" class="sync-row">
      <view class="sync-btn" :class="{ disabled: syncing }" @click="doSync">
        {{ syncing ? '同步中…' : '同步历史数据' }}
      </view>
      <view v-if="syncing" class="progress">
        <view class="progress-bar" :style="{ width: syncProgress + '%' }"></view>
      </view>
    </view>

    <!-- 只读模式页脚标语 -->
    <view v-if="readonly" class="ro-slogan">运动汇赛事服务</view>

    <game-status-dialog v-if="!readonly" :show="showStatus" @select="onStatus" @close="showStatus = false" />
  </view>
</template>

<script setup>
/**
 * 比赛信息 Tab（对应 MatchInfomationFragment / GameSetMessageFragment）
 * - 拉取比赛详情显示日期/时间/状态（对应 getGameDetail）
 * - 修改比赛状态（对应 gameStatus + dialog_game_status）
 * - hasSync=true 时提供同步历史数据（对应 getSynchr 分页写入本地 technical_record）
 *   hasSync=false 对应 GameSetMessageFragment（无同步）
 */
import { ref, watch } from 'vue'
import { getGameDetail, gameStatus } from '@/api/game'
import { synchr } from '@/api/login'
import { formatTime } from '@/utils/time'
import { insertOrReplace } from '@/utils/db'
import gameStatusDialog from '@/components/game-status-dialog/game-status-dialog.vue'

const props = defineProps({
  gameId: { type: String, default: '' },
  sport: { type: String, default: 'basketball' },
  hasSync: { type: Boolean, default: false },
  // true 时同步按钮位置改为「开始统计」，点击 emit('start')（篮球赛前设置页用）
  startMode: { type: Boolean, default: false },
  // 只读：日期/时间/状态不可改，合并展示为「比赛时间」「比赛状态」两栏（篮球赛前设置页用）
  readonly: { type: Boolean, default: false }
})
const emit = defineEmits(['status-change', 'start'])

const dateStr = ref('')
const timeStr = ref('')
const statusDesc = ref('')
const showStatus = ref(false)
const syncing = ref(false)
const syncProgress = ref(0)

function load() {
  if (!props.gameId) return
  getGameDetail(props.gameId, props.sport).then((res) => {
    if (res.code !== 1) return
    const page = res.data || {}
    const g = page.game || page
    if (g && g.time) {
      dateStr.value = formatTime(g.time, 'YYYY-MM-DD')
      timeStr.value = formatTime(g.time, 'HH:mm')
    }
    statusDesc.value = g && g.status ? g.status.desc : ''
  })
}

watch(() => props.gameId, load, { immediate: true })

function onStatus(s) {
  showStatus.value = false
  gameStatus({ gameId: props.gameId, status: { value: s.value, desc: s.desc } }, props.sport).then((res) => {
    if (res.code === 1) {
      statusDesc.value = s.desc
      emit('status-change', s)
    } else {
      uni.showToast({ title: res.msg || '修改失败', icon: 'none' })
    }
  })
}

/**
 * 日期/时间修改：对齐原生 MatchInfomationFragment（pvData/pvTime 选完 set_time/data_time 回填）
 * 注意：原生 updataMatcnInfo（updateGameInfo）调用被注释，选完未写后端，故此处亦仅回填 UI
 */
function onDateChange(e) {
  dateStr.value = e.detail.value
}
function onTimeChange(e) {
  timeStr.value = e.detail.value
}

/** 同步历史数据：分页拉取写入本地 technical_record（对应 MatchInfomationFragment 同步逻辑） */
function doSync() {
  if (syncing.value) return
  syncing.value = true
  syncProgress.value = 0
  syncPage(1)
}

function syncPage(pageNo) {
  synchr(props.gameId, pageNo).then((res) => {
    if (res.code !== 1) {
      syncing.value = false
      return
    }
    const page = res.data || {}
    const list = page.list || []
    list.forEach((item) => {
      insertOrReplace('technical_record', {
        record_number: item.recordNumber,
        elapsed_time: 0,
        statistics_section_id: item.statisticsSectionId,
        type: item.type ? item.type.value : 0,
        statistics_member_id: item.statisticsMemberId,
        description: item.description || '',
        game_id: props.gameId,
        team_type: 0,
        team_name: item.teamName || '',
        add: 0,
        delete: 1,
        is_need_upload: 0,
        disable: 0
      })
    })
    syncProgress.value = page.totalPage ? Math.round((pageNo / page.totalPage) * 100) : 100
    if (page.nextPage && pageNo < (page.totalPage || pageNo)) {
      syncPage(pageNo + 1)
    } else {
      syncing.value = false
      uni.showToast({ title: '同步完成', icon: 'none' })
    }
  }).catch(() => {
    syncing.value = false
  })
}
</script>

<style lang="scss" scoped>
.match-info {
  padding: 30rpx;
}
.row {
  display: flex;
  align-items: center;
  height: 90rpx;
  border-bottom: 1rpx solid #f2f2f2;
}
.label {
  width: 160rpx;
  font-size: 28rpx;
  color: #999999;
}
.value {
  flex: 1;
  font-size: 28rpx;
  color: #333333;
}
.picker {
  flex: 1;
}
/* 只读模式：与顶栏留 20rpx 空隙，白底矩形通栏拉满 */
.match-info--ro {
  padding: 20rpx 0 0;
}
.ro-card {
  background-color: #ffffff;
}
.ro-card .row {
  padding: 0 30rpx;
}
.ro-card .row:last-child {
  border-bottom: none;
}
.ro-card .value {
  text-align: right;
}
/* 只读模式的「开始统计」：#F3584E 圆角矩形，约 72% 屏宽，水平居中 */
.match-info--ro .sync-row {
  padding: 0 30rpx;
  margin-top: 200rpx;
}
.match-info--ro .sync-btn.start {
  background-color: #F3584E;
  border-radius: 16rpx;
  width: 540rpx;
  height: 96rpx;
  line-height: 96rpx;
  margin: 0 auto;
}
/* 按钮下方标语 */
.ro-slogan {
  margin-top: 40rpx;
  text-align: center;
  font-size: 50rpx;
  color: #9B9B9B;
}
.sync-row {
  margin-top: 40rpx;
}
.sync-btn {
  height: 80rpx;
  line-height: 80rpx;
  text-align: center;
  background-color: #009de9;
  color: #ffffff;
  border-radius: 40rpx;
  font-size: 28rpx;
}
.sync-btn.disabled {
  background-color: #cccccc;
}
.sync-btn.start {
  background-color: #29a871;
}
.progress {
  margin-top: 20rpx;
  height: 8rpx;
  background-color: #eeeeee;
  border-radius: 4rpx;
  overflow: hidden;
}
.progress-bar {
  height: 100%;
  background-color: #29a871;
  transition: width 0.3s;
}
</style>
