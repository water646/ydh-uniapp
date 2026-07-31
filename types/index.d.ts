/**
 * 全局实体类型定义（一比一对应 Android Java 实体）
 * 对应 mvp/model/entity、mvp/ui/bean、mvp/ui/net/entity、mvp/model/api 下的实体
 * 注意：字段拼写保留后端原样（areanName/runStatu/homeStatustics/group_id 等）
 * 此文件为声明文件，不参与运行，仅供类型提示与阅读
 */

/* ========== 公共子结构 ========== */
interface EnumValue {
  value: number
  desc: string
}
interface EnumValueBool {
  value: number
  desc: string
  /** JSON key 为 "boolean"（JS 保留字，需用 obj['boolean'] 访问） */
  boolean: boolean
}

/* ========== 响应包装 ========== */
interface ApiEntity<T = any> {
  status: number
  code: number
  msg: string
  data: T
}
interface ApiDataEntity<T = any> extends ApiEntity<T> {
  data: T[] // 数组
}
interface ApiPage<T = any> {
  pageSize: number
  total: number
  totalPage: number
  pageNo: number
  isNextPage?: boolean
  nextPage?: boolean
  dataList?: T[]
  list?: T[]
  games?: T[]
  data?: T[]
  hostMembers?: T[]
  guestMembers?: T[]
  game?: T
  liveStream?: T
  liveVideoList?: T[]
  basketballStatisticsGameDTO?: T
  time?: number
  groupName?: string
  liveStreamList?: T[]
  liveVideo?: T
}
interface ApiPageEntity<T = any> extends ApiEntity<ApiPage<T>> {}
interface ApiMatchEntity<T = any> extends ApiEntity<ApiPage<T>> {}
interface NetBean<T = any> {
  status: number
  code: number
  msg: string
  data: T
}
interface NetLongEnity<T = any> {
  model: string
  method: string
  msg: string
  data: T
}
interface NetLongNewEnity<T = any> {
  data: T
}

/* ========== entity 模块 ========== */
interface AddMemberData {
  gameTeamId: string
  number: string
  name: number
  position: string
}
interface CancleMemberSignData { statisticsMemberId: string }
interface CancleStatidticsData { recordNumber: string; statisticsMemberId: string }
interface Company { vendorName: string; vendorId: string }
interface ConnectData {
  id: string; event: EnumValue; name: string; status: EnumValue; runStatus: EnumValue
  time: string; type: EnumValue; isMedia: EnumValueBool
  venueId: string; venueName: string; venueAddress: string
  leagueGroupId: string; leagueGroupName: string; leagueGroupSort: number
  leagueStageId: string; leagueStageName: string; leagueStageSort: number
  leagueId: string; leagueName: string; leagueLogo: string; leagueStartTime: string
  hostGameTeamId: string; hostTeamId: string; hostTeamLogo: string; hostTeamName: string; hostTeamScore: number
  guestGameTeamId: string; guestTeamId: string; guestTeamLogo: string; guestTeamName: string; guestTeamScore: number
  gameResult: EnumValue; videoStatus: EnumValue; section: string
}
interface ErrorMsgBean { msg: string }
interface GameData {
  competingTime: string; status: EnumValue; areanName: string; groupName: string
  firstTeamId: string; firstTeamScore: number; firstTeamName: string; firstTeamLogo: string; firstMatchResult: EnumValue
  secondTeamId: string; secondTeamScore: number; secondTeamName: string; secondTeamLogo: string; secondMatchResult: EnumValue
  eventName: string; activityName: string; id: string; showTime: boolean; serverTime: number; playingPeople: number
}
interface GameDetail {
  id: string; section: string; logo: string; name: string
  status: EnumValue; runStatus: EnumValue; type: EnumValue; time: string; venueId: string
  leagueEventGroupId: string; leagueId: string
  hostTeamId: string; hostGameTeamId: string; hostTeamName: string; hostTeamLogo: string; hostTeamScore: number
  guestTeamId: string; guestGameTeamId: string; guestTeamName: string; guestTeamLogo: string; guestTeamScore: number
  leagueEventGroupName: string; leagueEventId: string; leagueEventName: string; leagueName: string; leagueStageName: string
  videoId: string; liveStreamId: string
  hostTeamFoul: number; guestTeamFoul: number; leagueLogo: string
  score: number; backboard: number; assists: number; number: number
}
interface GameStatusData { gameId: string; status: EnumValue }
interface LiveGameUrl {
  id: string; recordId: string; type: EnumValue; appName: string; streamName: string; name: string
  status: EnumValue; cover: string; publish: string; liveRtmp: string; liveFlv: string; liveM3u8: string
}
interface MemberData {
  id: string; teamMemberId: string; startingLineup: EnumValueBool; playing: EnumValueBool
  number: number; name: string; temporary: number; position: EnumValue; teamName: string; avatar: string
}
interface MemberDetileData {
  name: string; number: number; score: number; board: number; assists: number; steals: number; gaimao: number
  shots_total: number; shots_success_total: number; thirds_total: number; thirds_success_total: number
  penalty_total: number; penalty_success_total: number; miss: number; foul: number
}
interface MemberSignData { gameTeamId: string; teamMemberId: string }
interface NofinishData { date: string; games: NofinishGame[] }
interface NofinishGame {
  id: string; event: EnumValue; name: string; status: EnumValue; videoStatus: EnumValue; runStatus: EnumValue; type: EnumValue
  time: string; venueId: string; leagueGroupId: string; leagueStageId: string
  hostTeamId: string; hostGameTeamId: string; hostTeamName: string; hostTeamLogo: string; hostTeamScore: number
  guestTeamId: string; guestGameTeamId: string; guestTeamName: string; guestTeamLogo: string; guestTeamScore: number
  leagueGroupName: string; leagueStageName: string; leagueId: string; leagueLogo: string; leagueName: string; venueName: string
  isMedia: EnumValueBool
}
interface PhotoListData {
  id: string; photoActivityId: string; userId: string; url: string
  width: number; height: number; fileName: string; fileSize: number; fileTime: string
  showStatus: EnumValue; likeCount: number
}
interface PhotoLiveData { totalCount: number; pageSize: number; totalPage: number; pageNo: number; nextPage: boolean; list: PhotoLiveItem[] }
interface PhotoLiveItem {
  id: string; type: EnumValue; title: string; description: string; status: EnumValue
  startTime: string; endTime: string; address: string; visitors: number
  logo: string; banner: string; poster: string; timeInterval: number; showStatus: EnumValue
}
interface RecordData { msg: string; firstTeamScore: number; secondTeamScore: number; section: string | null; runStatu: EnumValue }
interface RecordNewData { code: number; msg: string; data: RecordNewDataData }
interface RecordNewDataData { totalCount: number; pageSize: number; totalPage: number; pageNo: number; nextPage: boolean; list: RecordNewItem[] }
interface RecordNewItem {
  id: string; recordNumber: string; statisticsSectionId: string; type: EnumValue; occurrenceTime: string
  statisticsMemberId: string; statisticsTeamId: string; description: string; memberName: string; teamName: string; sectionName: string
}
interface SectionData { id: string; name: string; gameId: string; type: EnumValue; sort: number; groups: string }
interface StartingLineupData { gameTeamId: string; teamMemberId: string }
interface StatidticsData {
  description: string; id: string; occurrenceTime: string; recordNumber: string
  statisticsMemberId: string; statisticsSectionId: string; type: string
}
interface StatisDown { code: number; msg: string; data: StatisDownData }
interface StatisDownData {
  game: StatisDownGame
  hostTeamFoul: number; guestTeamFoul: number; hostTeamStop: number; guestTeamStop: number
  hostMembers: StatisDownMember[]; guestMembers: StatisDownMember[]; sections: StatisDownSection[]
}
interface StatisDownGame {
  id: string; event: EnumValue; name: string; status: EnumValue; runStatus: EnumValue; type: EnumValue
  time: string; isMedia: EnumValueBool; venueId: string; venueName: string; venueAddress: string
  leagueGroupId: string; leagueGroupName: string; leagueGroupSort: number
  leagueStageId: string; leagueStageName: string; leagueStageSort: number
  leagueId: string; leagueName: string; leagueLogo: string; leagueStartTime: string
  hostGameTeamId: string; hostTeamId: string; hostTeamLogo: string; hostTeamName: string; hostTeamScore: number
  guestGameTeamId: string; guestTeamId: string; guestTeamLogo: string; guestTeamName: string; guestTeamScore: number
  gameResult: EnumValue; videoStatus: EnumValue; section: string
}
interface StatisDownMember {
  id: string; teamMemberId: string; startingLineup: EnumValueBool; playing: EnumValueBool
  number: number; name: string; temporary: number; position: EnumValue; avatar: string; foul: number
}
interface StatisDownSection {
  id: string; name: string; gameId: string; type: EnumValue; sort: number; groups: string
  gameSectionId: string; running: EnumValueBool
}
interface StatisticsList {
  description: string; recordNumber: number; statisticsMemberId: string; statisticsSectionId: string; type: number
}
interface SynchrData { totalCount: number; pageSize: number; totalPage: number; pageNo: number; nextPage: boolean; list: SynchrItem[] }
interface SynchrItem {
  id: string; recordNumber: string; statisticsSectionId: string; type: EnumValue; occurrenceTime: string
  statisticsMemberId: string; statisticsTeamId: string; description: string; sectionName: string; memberName: string; teamName: string
}
interface UkenData { code: number; msg: string; data: UkenDataItem[] }
interface UkenDataItem { groupName: string; games: UkenGame[]; optimals: UkenOptimal[] }
interface UkenGame {
  id: string; name: string; status: EnumValue; runStatus: EnumValue; type: EnumValue; event: EnumValue
  time: string; isMedia: EnumValueBool; venueId: string; venueName: string; venueAddress: string
  leagueGroupId: string; leagueGroupName: string; leagueGroupSort: number
  leagueStageId: string; leagueStageName: string; leagueStageSort: number
  leagueId: string; leagueName: string; leagueLogo: string; leagueStartTime: string
  hostGameTeamId: string; hostTeamId: string; hostTeamLogo: string; hostTeamName: string; hostTeamScore: number
  guestGameTeamId: string; guestTeamId: string; guestTeamLogo: string; guestTeamName: string; guestTeamScore: number
  gameResult: EnumValue; videoStatus: EnumValue; liveChannel: EnumValue; section: string; allowLive: EnumValueBool
}
interface UkenOptimal { name: string; avatar: string; count: number; type: EnumValue }
interface UserInfoData {
  id: string; avatar: string; nickName: string; sex: EnumValue; sketch: string; birthday: string
  position: EnumValue; number: number; weight: string; height: string
  city: string; province: string; phone: string; isBindWx: EnumValueBool; follows: number; fans: number
}
interface VersionCheck {
  id: string; deviceType: EnumValue; url: string; upgradeType: EnumValue; remark: string
  packageSize: string; versionCode: number; versionName: string; notice: EnumValue
}

/* ========== bean 模块 ========== */
interface EnumEntity { value: number; desc: string }
interface DeviceInfoEntity {
  appVersion: string; deviceType: string; phoneLanguage: string; phoneModel: string
  phoneNetworkType: string; phonePPI: string; phoneResolution: string; phoneTimeZone: string; phoneSystemVersion: string
}
interface GameDataEntity {
  status: EnumEntity; homeScore: number; homeName: string; homeLogo: string
  guestScore: number; guestName: string; guestLogo: string
  runStatus: EnumEntity; section: string; activityName: string; activityLogo: string
  homeStatustics: MemberEntityBean[]; guestStatustics: MemberEntityBean[]
}
interface GameEntity {
  competingTime: string; status: EnumEntity; areanName: string
  firstTeamId: string; firstTeamScore: number; firstTeamName: string
  secondTeamId: string; secondTeamScore: number; secondTeamName: string; eventName: string; id: string
}
interface MatchEntity {
  id: string; name: string; logo: string; registrationStart: string; registrationEnd: string
  beginTime: string; endTime: string; location: string; status: EnumEntity
}
interface MemberEntityBean { number: number; nickName: string; actualName: string; score: number; backboard: number; assists: number }
interface UserIntro { nickName: string; userPhoto: string; phone: string }
interface User extends UserIntro {
  sex: EnumEntity; birthday: string; height: number; weight: number; standingReach: number; wingspan: number
  actualName: string; idNumber: string; age: number; number: number; playerPosition: EnumEntity; userTeamHistoryList: UserTeamHistory[]
}
interface UserTeamHistory { name: string; beginDate: string; endDate: string; playerPosition: EnumEntity }

/* ========== WebSocket 推送消息（longbean） ========== */
interface RecordBean {
  chatType: number; content: string; createTime: number; from: string
  group_id: string; id: string; msgType: number
}
interface RecordNewBean {
  msg: string; code: string; hostTeamScore: number; guestTeamScore: number
  section: string; runStatus: string; hostTeamFoul: number; guestTeamFoul: number
}
