/**
 * 应用状态（对应 Global.device/version/companies + 篮球/足球切换）
 */
import { defineStore } from 'pinia'
import { getDeviceId } from '@/utils/device'
import { SportType } from '@/config'

export const useAppStore = defineStore('app', {
  state: () => ({
    device: '', // 对应 Global.device
    version: '', // 对应 Global.version
    sport: SportType.BASKETBALL, // 篮球/足球切换（对应 EventBus Boolean true=篮球）
    companies: [] // 对应 Global.companies
  }),
  actions: {
    init() {
      this.device = getDeviceId()
      // #ifdef APP-PLUS
      try {
        this.version = String(plus.runtime.versionCode || '')
      } catch (e) {
        this.version = ''
      }
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
