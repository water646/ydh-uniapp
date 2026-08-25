<template>
  <view class="page">
    <!-- 顶部主图：宽度占满屏幕，高度按原图比例自适应（752x444） -->
    <image class="hero" src="/static/images/shouyepic.png" mode="widthFix"></image>

    <!-- 白色卡片：略微上移覆盖主图底部，下缘直达页面底部 -->
    <view class="panel">
      <view class="panel-title">选择你的身份</view>

      <!-- 身份九宫格：四行三列，灰色圆角选项 -->
      <view class="panel-grid">
        <view
          v-for="(name, i) in identity"
          :key="i"
          class="grid-item"
          :class="{ active: selected.includes(name) }"
          @click="toggle(name)"
        >{{ name }}</view>
      </view>

      <view class="panel-title">选择服务城市</view>

      <!-- 城市选择条：淡绿底圆角，居中文字 + 右箭头 -->
      <view class="city-picker" @click="showCitySheet = true">
        <view class="city-text">{{ city || '请选择城市' }}</view>
        <image v-if="!city" class="city-arrow" src="/static/images/choosecity.png"></image>
      </view>

      <!-- 加入平台按钮 -->
      <view class="center-wrap">
        <view class="join-btn" @click="onJoin">加入星河联盟服务平台</view>
      </view>
    </view>
    <!-- 城市选择弹层：底部弹出（目前只有北京）；零尺寸 fixed 宿主，不参与页面 flex 布局 -->
    <view class="popup-host">
      <u-popup :show="showCitySheet" mode="bottom" :round="20" @close="showCitySheet = false">
        <view class="sheet">
          <view class="sheet-title">选择城市</view>
          <view class="sheet-row" @click="onPickCity('北京')">北京</view>
          <view class="sheet-cancel" @click="showCitySheet = false">取消</view>
        </view>
      </u-popup>
    </view>

    <!-- 未登录引导弹窗（同退出登录样式） -->
    <confirm-popup
      :show="loginPop"
      :message="'您还没有登录\n登录后即可使用更多功能'"
      confirm-text="登录注册"
      @confirm="goLogin"
      @cancel="loginPop = false"
    ></confirm-popup>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { useUserStore } from '@/store/user'
import confirmPopup from '@/components/confirm-popup/confirm-popup.vue'

const userStore = useUserStore()

const identity = [
  "教练员",
  "技术统计员",
  "直播运营",
  "队医",
  "摄影师",
  "摄像师",
  "计时员",
  "安保",
  "保洁",
  "啦啦队",
  "场地服务",
  "其他"
]

// 已选中的身份（可多选）
const selected = ref([])

// 服务城市（弹层选择，目前只有北京）
const city = ref('')
const showCitySheet = ref(false)

/** 选城市：收起弹层并回显 */
function onPickCity(name) {
  city.value = name
  showCitySheet.value = false
}

/** 点选切换：选中/取消选中 */
function toggle(name) {
  const i = selected.value.indexOf(name)
  if (i === -1) {
    selected.value.push(name)
  } else {
    selected.value.splice(i, 1)
  }
}

// 未登录引导弹窗
const loginPop = ref(false)

/** 加入平台：无 token 弹登录引导；已登录的后续流程待定 */
function onJoin() {
  if (userStore.isLogin) return
  loginPop.value = true
}

/** 弹窗确认：去登录页 */
function goLogin() {
  loginPop.value = false
  uni.navigateTo({ url: '/pages/login/index' })
}

/**
 * 身份选择页
 * 启动未登录时进入（loading 页路由：有 token 直接进首页，无 token 进本页）；
 * 后续在此选择身份后进入登录页。无顶部栏与标题。
 */
</script>

<style scoped>
.page {
  min-height: 100vh;
  background-color: #f5f5f5;
  display: flex;
  flex-direction: column;
}

.hero {
  width: 100%;
  display: block;
  position: relative;
  z-index: 1;
}

/* 白色卡片：负 margin 上移覆盖主图底部约 60rpx，左右留 20rpx 空隙，高度撑到页面底部 */
.panel {
  flex: 1;
  position: relative;
  z-index: 2;
  background-color: #ffffff;
  border-radius: 30rpx;
  box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.08);
  margin: -60rpx 20rpx 0;
}

/* 卡片左上角标题 */
.panel-title {
  font-size: 34rpx;
  font-weight: bold;
  color: #333333;
  padding: 36rpx 32rpx 0;
}

/* 身份宫格：四行三列 */
.panel-grid {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  padding: 36rpx 38rpx 0;
}

.grid-item {
  width: 200rpx;
  height: 60rpx;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f5;
  border-radius: 16rpx;
  color: #333333;
  font-size: 25rpx;
  margin-bottom: 24rpx;
}

/* 选中态：淡绿底 + 主题绿字与描边（可多选） */
.grid-item.active {
  background-color: #EAF8F6;
  color: #00B39B;
  border: 3rpx solid #00B39B;
}

/* 城市选择条：淡绿底圆角，居中文字 + 右箭头 */
.city-picker {
  height: 98rpx;
  background-color: #EAF8F6;
  margin: 32rpx;
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.city-text {
  font-size: 32rpx;
  font-weight: bold;
  color: #333333;
  margin-right: 10rpx;
}

.city-arrow {
  width: 8rpx;
  height: 20rpx;
}

/* 弹层宿主：零尺寸固定定位，避免 u-popup 根节点参与 flex 布局把白色卡片顶起 */
.popup-host {
  position: fixed;
  top: 0;
  left: 0;
  width: 0;
  height: 0;
  z-index: 999;
}

/* 城市选择弹层（同提现页换卡弹层样式） */
.sheet {
  padding: 30rpx 0 20rpx;
}

.sheet-title {
  text-align: center;
  font-size: 28rpx;
  color: #999999;
  margin-bottom: 10rpx;
}

.sheet-row {
  height: 90rpx;
  line-height: 90rpx;
  text-align: center;
  font-size: 28rpx;
  color: #333333;
  border-top: 1rpx solid #f1f2f6;
}

.sheet-cancel {
  height: 90rpx;
  line-height: 90rpx;
  text-align: center;
  color: #999999;
  font-size: 28rpx;
  border-top: 5rpx solid #f1f2f6;
}

/* 居中包裹（按钮所在行） */
.center-wrap {
  display: flex;
  justify-content: center;
}

/* 加入按钮：主题绿胶囊白字 */
.join-btn {
  width: 620rpx;
  height: 88rpx;
  border-radius: 44rpx;
  background-color: #00B39B;
  color: #ffffff;
  font-size: 30rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 40rpx;
}
</style>
