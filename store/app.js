/**
 * 应用状态（对应 Global.device/version/companies + 篮球/足球切换）
 */
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getDeviceId } from '@/utils/device'
import { SportType } from '@/config'

// 版本号兜底值（基座调试 plus.runtime 取不到或非 App 环境时使用，发版请同步修改 manifest）
const DEFAULT_VERSION_CODE = '215'   // = manifest.versionCode；更新检查接口要数字，传版本名会 500
const DEFAULT_VERSION_NAME = '2.8.4' // = manifest.versionName，界面显示用

export const useAppStore = defineStore('app', () => {
  const device = ref('') // 对应 Global.device
  const version = ref('') // versionCode，版本更新检查用
  const versionName = ref('') // 版本名（如 2.8.4），界面显示用
  const sport = ref(SportType.BASKETBALL) // 篮球/足球切换（对应 EventBus Boolean true=篮球）
  const companies = ref([]) // 对应 Global.companies

  /** 对应 Global.init */
  function init() {
    device.value = getDeviceId()
    // #ifdef APP-PLUS
    try {
      // versionCode 给更新检查用；versionName 给界面显示用；取不到均兜底默认值
      version.value = String(plus.runtime.versionCode || DEFAULT_VERSION_CODE)
      versionName.value = String(plus.runtime.version || DEFAULT_VERSION_NAME)
    } catch (e) {
      version.value = DEFAULT_VERSION_CODE
      versionName.value = DEFAULT_VERSION_NAME
    }
    // #endif
    // #ifndef APP-PLUS
    version.value = DEFAULT_VERSION_CODE
    versionName.value = DEFAULT_VERSION_NAME
    // #endif
  }

  function setSport(s) {
    sport.value = s
  }

  function toggleSport() {
    sport.value = sport.value === SportType.BASKETBALL ? SportType.FOOTBALL : SportType.BASKETBALL
  }

  function setCompanies(list) {
    companies.value = list || []
  }

  return { device, version, versionName, sport, companies, init, setSport, toggleSport, setCompanies }
})
