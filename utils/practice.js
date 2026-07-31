/**
 * 练习模式（对应原项目抽屉"篮球/足球练习模式"入口）
 *
 * 原理：本地造一场练习赛，写入 member（8v8）+ game_section（4 节），
 * 不联网、不依赖真实比赛，直接进离线统计页（basketball-operate /
 * football-operate）练手。记录写本地 technical_record。
 *
 * gameId 固定为 practice-<sport>，每次进入先清旧数据再重写，避免残留。
 */
import { initDB, insertOrReplace, deleteWhere } from './db'

const practiceGameId = (sport) => `practice-${sport}`

/** 球员姓名（主/客各 8 人） */
const HOME_NAMES = ['赵一', '钱二', '孙三', '李四', '周五', '吴六', '郑七', '王八']
const GUEST_NAMES = ['冯一', '陈二', '褚三', '卫四', '蒋五', '沈六', '韩七', '杨八']

/**
 * 初始化练习赛数据
 * @param {'basketball'|'football'} sport
 * @returns {Promise<{gameId:string, homeName:string, guestName:string}>}
 */
export function initPractice(sport = 'basketball') {
  const isFoot = sport === 'football'
  const gameId = practiceGameId(sport)
  const homeName = isFoot ? '飞虎队' : '红队'
  const guestName = isFoot ? '雄鹰队' : '蓝队'

  return initDB()
    .then(() =>
      // 先清旧数据（member / game_section / technical_record）
      Promise.all([
        deleteWhere('member', `game_id='${gameId}'`),
        deleteWhere('game_section', `game_id='${gameId}'`),
        deleteWhere('technical_record', `game_id='${gameId}'`)
      ])
    )
    .then(() =>
      Promise.all([
        // 主队 8 人（type=1），前 5 人首发 + 在场
        ...HOME_NAMES.map((name, i) =>
          insertOrReplace('member', {
            team_member_id: `${gameId}-host-${i + 1}`,
            game_id: gameId,
            type: 1,
            name,
            number: i + 1,
            startingLineup: i < 5 ? 1 : 0,
            playing: i < 5 ? 1 : 0
          })
        ),
        // 客队 8 人（type=0）
        ...GUEST_NAMES.map((name, i) =>
          insertOrReplace('member', {
            team_member_id: `${gameId}-guest-${i + 1}`,
            game_id: gameId,
            type: 0,
            name,
            number: i + 1,
            startingLineup: i < 5 ? 1 : 0,
            playing: i < 5 ? 1 : 0
          })
        ),
        // 4 个小节，第 1 节标记开始
        ...[1, 2, 3, 4].map((n) =>
          insertOrReplace('game_section', {
            section_id: `${gameId}-sec-${n}`,
            game_id: gameId,
            type: 1,
            name: `第${n}节`,
            sort: n,
            groups: '',
            isStart: n === 1 ? 1 : 0,
            isEnd: 0
          })
        )
      ])
    )
    .then(() => ({ gameId, homeName, guestName }))
}
