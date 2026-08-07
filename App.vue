<script>
import { onLaunch, onShow, onHide } from '@dcloudio/uni-app'
import { useUserStore } from '@/store/user'
import { useAppStore } from '@/store/app'
import { initDB } from '@/utils/db'

export default {
  onLaunch() {
    // 对应 StatisBaseApplication.onCreate / Global.init
    const userStore = useUserStore()
    const appStore = useAppStore()
    userStore.init()
    appStore.init()
    // #ifdef APP-PLUS
    // 初始化本地数据库（对应 GreenDAO setupDataBase）
    initDB()
    // #endif
  },
  onShow() {
    // #ifdef APP-PLUS
    // 状态栏文字统一黑色（顶栏白底，状态栏占位 #ffffff）
    plus.navigator.setStatusBarStyle('dark')
    // #endif
  },
  onHide() {}
}
</script>

<style lang="scss">
/* 全局样式：对应 AppTheme（黑体全局字体） */
page {
  background-color: #f8f8f8;
  font-family: 'Heiti SC', '黑体', 'Droid Sans Fallback', sans-serif;
  color: #333333;
  font-size: 30rpx;
}

/* 通用工具类 */
.flex {
  display: flex;
}
.flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}
.flex-between {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.flex-1 {
  flex: 1;
}
.ellipsis {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
</style>
