<template>
  <!-- WebView 全屏加载远程协议页：页面自带顶栏，本页不再画标题栏避免重叠 -->
  <web-view class="web" :src="url" />

  <!-- 非 App 端兜底悬浮返回键（web-view 转为 iframe，普通元素可覆盖） -->
  <!-- #ifndef APP-PLUS -->
  <view class="float-back" @click="goBack">
    <image class="float-back-img" src="/static/mipmap-xxhdpi/black_back.png" mode="aspectFit" />
  </view>
  <!-- #endif -->
</template>

<script setup>
import { ref } from 'vue'
import { onLoad, onReady, onUnload } from '@dcloudio/uni-app'
import { config } from '@/config'

const url = ref('')
const title = ref('')

onLoad((opt) => {
  // 根据 type 参数判断加载用户协议还是隐私政策
  if (String(opt.type) === '2') {
    url.value = config.agreement.privacy
    title.value = '隐私政策'
  } else {
    url.value = config.agreement.user
    title.value = '用户协议'
  }

  // 动态设置导航栏标题
  uni.setNavigationBarTitle({
    title: title.value
  })
})

// App 端 web-view 是原生组件且层级最高（普通 view 盖不上去），
// 用 plus.nativeObj.View 画一个悬浮圆形返回键：不加顶栏，独立显示在所有 webview 之上
// #ifdef APP-PLUS
let backView = null

function createBackBtn() {
  const sb = uni.getSystemInfoSync().statusBarHeight || 0
  backView = new plus.nativeObj.View(
    'agreement-back',
    { top: (sb + 8) + 'px', left: '12px', width: '40px', height: '40px' },
    [
      // 白色圆形底 + 浅灰描边
      {
        tag: 'rect',
        id: 'bg',
        rectStyles: { color: 'rgba(255,255,255,0.92)', radius: '20px', borderColor: 'rgba(0,0,0,0.08)', borderWidth: '1px' },
        position: { top: '0px', left: '0px', width: '100%', height: '100%' }
      },
      // 返回箭头（项目自带图标）
      {
        tag: 'img',
        id: 'arrow',
        src: '_www/static/mipmap-xxhdpi/black_back.png',
        position: { top: '4px', left: '4px', width: '32px', height: '32px' }
      }
    ]
  )
  backView.addEventListener('click', goBack, false)
  backView.show()
}

function destroyBackBtn() {
  if (backView) {
    backView.close()
    backView = null
  }
}

onReady(createBackBtn)
onUnload(destroyBackBtn)
// #endif

// 返回上一页逻辑（热同步重载后页面栈可能只剩本页，兜底回首页）
const goBack = () => {
  uni.navigateBack({
    delta: 1,
    fail: () => {
      uni.switchTab({ url: '/pages/home/index' })
    }
  })
}
</script>

<style lang="scss" scoped>
/* 内嵌网页铺满整页（app 端 web-view 本就自动全屏） */
.web {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

/* 非 App 端悬浮返回键：白色圆底 + 返回箭头，避开状态栏 */
.float-back {
  position: fixed;
  top: calc(var(--status-bar-height) + 8px);
  left: 24rpx;
  width: 80rpx;
  height: 80rpx;
  border-radius: 40rpx;
  background-color: rgba(255, 255, 255, 0.92);
  border: 1rpx solid rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}
.float-back-img {
  width: 64rpx;
  height: 64rpx;
}
</style>
