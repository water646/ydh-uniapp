/**
 * 本地数据库（对应 GreenDAO，4 张表）
 * App 端使用 plus.sqlite；离线统计记录、球员、小节、计时缓存
 *
 * 表结构：
 * - member：队员（对应 db/Member）team_member_id 主键
 * - game_section：比赛小节（对应 db/GameSection）section_id 主键
 * - game_time：比赛计时（对应 db/GameTime）game_id 主键
 * - technical_record：技术统计记录（对应 db/TechNicalRecord）record_number 主键
 *
 * @Transient 字段（isChecked、foul）不上库，放 JS 对象
 */
import { config } from '@/config'

const DB_NAME = config.dbName
const DB_PATH = '_doc/statistics.db'

// 建表 SQL（字段名按 @Property(nameInDb) 原样保留）
const CREATE_SQL = [
  `CREATE TABLE IF NOT EXISTS member (
    team_member_id TEXT PRIMARY KEY,
    game_id TEXT,
    type INTEGER,
    name TEXT,
    number INTEGER,
    startingLineup INTEGER,
    playing INTEGER
  )`,
  `CREATE TABLE IF NOT EXISTS game_section (
    section_id TEXT PRIMARY KEY,
    game_id TEXT,
    type INTEGER,
    name TEXT,
    sort INTEGER,
    groups TEXT,
    isStart INTEGER,
    isEnd INTEGER
  )`,
  `CREATE TABLE IF NOT EXISTS game_time (
    game_id TEXT PRIMARY KEY,
    begintime INTEGER,
    stoptime INTEGER,
    isStop INTEGER
  )`,
  `CREATE TABLE IF NOT EXISTS technical_record (
    record_number INTEGER PRIMARY KEY,
    elapsed_time INTEGER,
    statistics_section_id TEXT,
    type INTEGER,
    statistics_member_id TEXT,
    description TEXT,
    game_id TEXT,
    team_type INTEGER,
    team_name TEXT,
    "add" INTEGER,
    "delete" INTEGER,
    is_need_upload INTEGER,
    disable INTEGER
  )`
]

let opened = false

/** 初始化数据库（对应 StatisBaseApplication.setupDataBase） */
export function initDB() {
  // #ifdef APP-PLUS
  if (opened) return Promise.resolve()
  return new Promise((resolve, reject) => {
    plus.sqlite.openDatabase({
      name: DB_NAME,
      path: DB_PATH,
      success: (e) => {
        opened = true
        let chain = Promise.resolve()
        CREATE_SQL.forEach((sql) => {
          chain = chain.then(() => executeSQL(sql))
        })
        chain.then(resolve).catch(reject)
      },
      fail: (e) => {
        console.error('打开数据库失败', e)
        reject(e)
      }
    })
  })
  // #endif
  // #ifndef APP-PLUS
  return Promise.resolve()
  // #endif
}

/** 执行无返回值 SQL（INSERT/UPDATE/DELETE/CREATE） */
export function executeSQL(sql) {
  // #ifdef APP-PLUS
  return new Promise((resolve, reject) => {
    plus.sqlite.executeSql({
      name: DB_NAME,
      sql,
      success: (e) => resolve(e),
      fail: (e) => {
        console.error('executeSQL 失败', sql, e)
        reject(e)
      }
    })
  })
  // #endif
  // #ifndef APP-PLUS
  return Promise.resolve()
  // #endif
}

/** 查询 SQL，返回行数组 */
export function selectSQL(sql) {
  // #ifdef APP-PLUS
  return new Promise((resolve, reject) => {
    plus.sqlite.selectSql({
      name: DB_NAME,
      sql,
      success: (e) => resolve(e || []),
      fail: (e) => {
        console.error('selectSQL 失败', sql, e)
        reject(e)
      }
    })
  })
  // #endif
  // #ifndef APP-PLUS
  return Promise.resolve([])
  // #endif
}

/** insertOrReplace（对应 GreenDAO insertOrReplace） */
export function insertOrReplace(table, obj) {
  const keys = Object.keys(obj)
  const placeholders = keys.map(() => '?').join(',')
  const values = keys.map((k) => obj[k])
  const sql = `INSERT OR REPLACE INTO ${table} (${keys.join(',')}) VALUES (${placeholders})`
  // plus.sqlite 不支持参数绑定，拼接时需注意转义；此处用安全转义
  const safeSql = `INSERT OR REPLACE INTO ${table} (${keys.join(',')}) VALUES (${values.map(sqlValue).join(',')})`
  return executeSQL(safeSql)
}

/** 按条件查询 */
export function queryList(table, where = '', order = '') {
  let sql = `SELECT * FROM ${table}`
  if (where) sql += ` WHERE ${where}`
  if (order) sql += ` ORDER BY ${order}`
  return selectSQL(sql)
}

/** 按条件删除 */
export function deleteWhere(table, where) {
  return executeSQL(`DELETE FROM ${table} WHERE ${where}`)
}

/** 按条件计数（对应 GreenDAO queryBuilder.count()） */
export function countWhere(table, where = '') {
  return selectSQL(`SELECT COUNT(*) as c FROM ${table}${where ? ` WHERE ${where}` : ''}`).then((res) => (res[0] ? res[0].c : 0))
}

/** SQL 值转义 */
function sqlValue(v) {
  if (v === null || v === undefined) return 'NULL'
  if (typeof v === 'number') return String(v)
  if (typeof v === 'boolean') return v ? '1' : '0'
  return `'${String(v).replace(/'/g, "''")}'`
}

export default {
  initDB,
  executeSQL,
  selectSQL,
  insertOrReplace,
  queryList,
  deleteWhere,
  countWhere
}
