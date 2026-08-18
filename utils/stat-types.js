/**
 * 技术统计 type 码表与映射（对应各统计 Activity 的 exchange() switch）
 * type 数值码必须原样保留，用于写 technical_record 与上传 statistics/add
 */

/* ========== 篮球 type ========== */
export const BasketType = {
  BACKBOARD: 1,
  ASSIST: 2,
  BLOCK: 3,
  STEAL: 4,
  PAUSE: 5,
  TWO_POINT: 6,
  THREE_POINT: 7,
  FREE_THROW: 8,
  FOUL: 9,
  TWO_MISS: 10,
  THREE_MISS: 11,
  FREE_MISS: 12,
  CHANGE_OFF: 13,
  CHANGE_ON: 14,
  SECTION_END: 15,
  SECTION_START: 16,
  TURNOVER: 17,
  FRONT_BOARD: 117,
  BACK_BOARD: 118,
  TECH_FOUL: 119,
  ILLEGAL_FOUL: 120,
  DISQ_FOUL: 121
}

export const BasketTypeDesc = {
  1: '篮板', 2: '助攻', 3: '盖帽', 4: '抢断', 5: '暂停',
  6: '两分命中', 7: '三分命中', 8: '罚球命中', 9: '犯规',
  10: '两分不中', 11: '三分不中', 12: '罚球不中',
  13: '换人下场', 14: '换人上场', 15: '小节结束', 16: '小节开始', 17: '失误',
  117: '前场篮板', 118: '后场篮板', 119: '技术犯规', 120: '违体', 121: '夺权'
}

/* ========== 足球 type ========== */
export const FootType = {
  ASSIST: 2,
  PAUSE: 5,
  FOUL: 9,
  CHANGE_OFF: 13,
  CHANGE_ON: 14,
  TURNOVER: 17,
  GOAL: 18,
  PENALTY: 19,
  SHOOT: 20,
  YELLOW: 21,
  RED: 22,
  OFFSIDE: 23,
  HAND: 24
}

export const FootTypeDesc = {
  2: '助攻', 5: '暂停', 9: '犯规', 13: '换人下场', 14: '换人上场', 17: '失误',
  18: '进球', 19: '点球', 20: '射门', 21: '黄牌', 22: '红牌', 23: '越位', 24: '手球'
}

/* ========== 动作分组（底部 sheet 用） ========== */
/**
 * 篮球动作（底部栏 20 个，4×5 布局，对应 a.txt 顺序）
 * - 命中行：一分命中/罚球命中 → 8（+1 分），二分命中 → 6（+2 分），三分命中 → 7（+3 分）
 * - 不中行：一分不中/罚球不中 → 12，二分不中 → 10，三分不中 → 11
 * - 犯规行：犯规/进攻犯规 → 9，技术犯规 → 119，违体 → 120，夺权 → 121（服务端均计犯规 +1）
 * - 换人：type 占位 13，前端 onQuickAction 识别 desc 走换人弹窗，不直接上传
 * - 颜色：前 8 个 + 最后 2 个 green，其余 red
 */
export const BasketActions = [
  { type: 117, desc: '前场篮板', color: 'green' },
  { type: 2, desc: '助攻', color: 'green' },
  { type: 3, desc: '盖帽', color: 'green' },
  { type: 4, desc: '抢断', color: 'green' },
  { type: 8, desc: '一分命中', color: 'green' },
  { type: 6, desc: '二分命中', color: 'green' },
  { type: 7, desc: '三分命中', color: 'green' },
  { type: 8, desc: '罚球命中', color: 'green' },
  { type: 12, desc: '一分不中', color: 'red' },
  { type: 10, desc: '二分不中', color: 'red' },
  { type: 11, desc: '三分不中', color: 'red' },
  { type: 12, desc: '罚球不中', color: 'red' },
  { type: 9, desc: '犯规', color: 'red' },
  { type: 119, desc: '技术犯规', color: 'red' },
  { type: 120, desc: '违体', color: 'red' },
  { type: 121, desc: '夺权', color: 'red' },
  { type: 9, desc: '进攻犯规', color: 'red' },
  { type: 17, desc: '失误', color: 'red' },
  { type: 118, desc: '后场篮板', color: 'green' },
  { type: 13, desc: '换人', color: 'green' }
]

/** 足球动作 */
export const FootActions = [
  { type: 18, desc: '进球', color: 'green' },
  { type: 19, desc: '点球', color: 'green' },
  { type: 20, desc: '射门', color: 'green' },
  { type: 2, desc: '助攻', color: 'green' },
  { type: 21, desc: '黄牌', color: 'red' },
  { type: 22, desc: '红牌', color: 'red' },
  { type: 23, desc: '越位', color: 'red' },
  { type: 24, desc: '手球', color: 'red' },
  { type: 9, desc: '犯规', color: 'red' },
  { type: 17, desc: '失误', color: 'red' },
  { type: 5, desc: '暂停', color: 'blue' }
]

/** 得分计算（对应比分更新逻辑） */
export function scoreOf(type, sport) {
  if (sport === 'football') {
    return type === 18 || type === 19 ? 1 : 0
  }
  if (type === 6) return 2
  if (type === 7) return 3
  if (type === 8) return 1
  return 0
}

/** 是否犯规（对应犯规计数） */
export function isFoul(type, sport) {
  if (sport === 'football') return [9, 21, 22].includes(type)
  return [9, 119, 120, 121].includes(type)
}

/** 是否得分类型（用于记录页过滤「得分」Tab） */
export function isScore(type, sport) {
  if (sport === 'football') return [18, 19].includes(type)
  return [6, 7, 8].includes(type)
}

/** type 转描述 */
export function typeDesc(type, sport) {
  return sport === 'football' ? FootTypeDesc[type] || '' : BasketTypeDesc[type] || ''
}

/**
 * 球员技术统计聚合（对应 MemberDataListFragment.createMember，按 type 累加）
 * 输入该球员的所有 technical_record，返回统计汇总
 * type 映射：1/117/118 篮板，2 助攻，3 盖帽，4 抢断，6/7/8 命中，9/119/120/121 犯规，
 *           10/11/12 不中(出手)，17 失误
 */
export function aggregateMemberStats(records) {
  const s = {
    score: 0, board: 0, assists: 0, steals: 0, block: 0, foul: 0,
    shots_total: 0, shots_success: 0, thirds_total: 0, thirds_success: 0,
    penalty_total: 0, penalty_success: 0, miss: 0, turnover: 0
  }
  ;(records || []).forEach((r) => {
    switch (r.type) {
      case 1: case 117: case 118: s.board++; break
      case 2: s.assists++; break
      case 3: s.block++; break
      case 4: s.steals++; break
      case 6: s.shots_success++; s.shots_total++; s.score += 2; break
      case 7: s.thirds_success++; s.thirds_total++; s.score += 3; break
      case 8: s.penalty_success++; s.penalty_total++; s.score += 1; break
      case 9: case 119: case 120: case 121: s.foul++; break
      case 10: s.shots_total++; s.miss++; break
      case 11: s.thirds_total++; s.miss++; break
      case 12: s.penalty_total++; s.miss++; break
      case 17: s.turnover++; break
    }
  })
  return s
}
