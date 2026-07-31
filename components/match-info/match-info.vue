<template>
  <view class="match-info">
    <view class="row">
      <text class="label">日期</text>
      <text class="value">{{ dateStr }}</text>
    </view>
    <view class="row">
      <text class="label">时间</text>
      <text class="value">{{ timeStr }}</text>
    </view>
    <view class="row" @click="showStatus = true">
      <text class="label">状态</text>
      <text class="value">{{ statusDesc }} ▼</text>
    </view>

    <view v-if="hasSync" class="sync-row">
      <view class="sync-btn" :class="{ disabled: syncing }" @click="doSync">
        {{ syncing ? '同步中…' : '同步历史数据' }}
      </view>
      <view v-if="syncing" class="progress">
        <view class="progress-bar" :style="{ width: syncProgress + '%' }"></view>
      </view>
    </view>

    <game-status-dialog :show="showStatus" @select="onStatus" @close="showStatus = false" />
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
  hasSync: { type: Boolean, default: false }
})
const emit = defineEmits(['status-change'])

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
