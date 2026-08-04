/**
 * 应用状态（对应 Global.device/version/companies + 篮球/足球切换）
 */
import { defineStore } from 'pinia'
import { getDeviceId } from '@/utils/device'
import { SportType } from '@/config'

// 版本号兜底值（= manifest.versionName；基座调试 plus.runtime 取不到或非 App 环境时使用，发版请同步修改）
const DEFAULT_VERSION = '2.8.4'

export const useAppStore = defineStore('app', {
  state: () => ({
    device: '', // 对应 Global.device
    version: '', // versionCode，版本更新检查用
    versionName: '', // 版本名（如 2.8.4），界面显示用
    sport: SportType.BASKETBALL, // 篮球/足球切换（对应 EventBus Boolean true=篮球）
    companies: [] // 对应 Global.companies
  }),
  actions: {
    init() {
      this.device = getDeviceId()
      // #ifdef APP-PLUS
      try {
        // versionCode 给更新检查用；versionName 给界面显示用；取不到均兜底默认值
        this.version = String(plus.runtime.versionCode || DEFAULT_VERSION)
        this.versionName = String(plus.runtime.version || DEFAULT_VERSION)
      } catch (e) {
        this.version = DEFAULT_VERSION
        this.versionName = DEFAULT_VERSION
      }
      // #endif
      // #ifndef APP-PLUS
      this.version = DEFAULT_VERSION
      this.versionName = DEFAULT_VERSION
      // #endif
    },
    setSport(sport) {
      this.sport = sport
    },
    toggleSport() {
      this.sport = this.sport === SportType.BASKETBALL ? SportType.FOOTBALL : SportType.BASKETBALL
    },
    setCompanies(list) {
      this.companies = list || []
    }
  }
})
