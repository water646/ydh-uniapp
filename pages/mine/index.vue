<template>
  <view class="page">
    <!-- 顶部信息区（背景图 minbgctop.png） -->
    <view class="topcontent">
      <view class="personblcok">
        <image class="perphone" :src="molist.avatar || '/static/images/anpeo.png'" mode="" @click="uploadAvatar"></image>
        <view class="permess" @click="popClick('person')">
          <view class="mestop">手机号: <text class="mestop-text">{{ molist.phone }}</text></view>
          <view class="mesbot">
            <view class="idmes">账户ID：{{ molist.accountId }}</view>
            <view class="idmesimg">
              <view class="idtext">{{ molist.isAuth === 1 ? '已认证' : '未认证' }}</view>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 菜单白色卡片（顶部快捷入口按钮 + 下方菜单列表） -->
    <view class="bolist">
      <view class="funbar">
        <view class="funbtn" @click="goStats">技术统计</view>
        <view class="funbtn" @click="goLive">现场直播</view>
      </view>
      <view class="list-menu-cell" @click="authenClick()">
        <image class="cell-imga" src="/static/images/mycer.png" mode=""></image>
        <view class="cell-title">我的认证</view>
        <image class="cell-next" src="/static/images/moicon.png" mode=""></image>
      </view>
      <view class="list-menu-cell" @click="myserClick()">
        <image class="cell-imgb" src="/static/images/myser.png" mode=""></image>
        <view class="cell-title">我的服务</view>
        <image class="cell-next" src="/static/images/moicon.png" mode=""></image>
      </view>
      <view class="list-menu-cell" @click="payhisClick()">
        <image class="cell-imgb" src="/static/images/mymoney.png" mode=""></image>
        <view class="cell-title">打款历史</view>
        <image class="cell-next" src="/static/images/moicon.png" mode=""></image>
      </view>
      <view class="list-menu-cell" @click="popClick('outconfirm')">
        <image class="cell-imgd" src="/static/images/myexit.png" mode=""></image>
        <view class="cell-title">退出登录</view>
        <image class="cell-next" src="/static/images/moicon.png" mode=""></image>
      </view>
    </view>

    <!-- 确认弹窗 -->
    <confirm-popup :show="isAuthen" :message="popmessage" :confirm-text="popbut" @confirm="handleConfirm" @cancel="isAuthen = false"></confirm-popup>
  </view>
</template>

<script setup>
/**
 * 「我的」页（样式迁移自 F:/项目文件/UNIAPP/pages/minePage/minePage.vue）
 * 已接逻辑：user/info 显示手机号/账户ID/头像、退出登录（清 token 回登录页）。
 * 仍占位：认证徽章/我的认证/我的服务/打款历史（本后端无认证体系）、头像上传。
 */
import { ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { getUserInfo } from '@/api/login'
import { useUserStore } from '@/store/user'
import confirmPopup from '@/components/confirm-popup/confirm-popup.vue'

const userStore = useUserStore()

// 用户信息（user/info 返回；认证字段本后端没有，徽章固定显示未认证）
const molist = ref({ phone: '—', accountId: '—', avatar: '' })

// 弹窗状态
const isAuthen = ref(false)
const popmessage = ref('')
const popbut = ref('确定')
const popType = ref('')

onShow(() => {
  if (!userStore.isLogin) {
    uni.reLaunch({ url: '/pages/login/index' })
    return
  }
  loadInfo()
})

/** 拉取个人信息：手机号、账户ID(id)、头像 */
function loadInfo() {
  getUserInfo().then((res) => {
    if (res.code === 1 && res.data) {
      const d = res.data
      molist.value = {
        phone: d.phone || '—',
        accountId: d.id || '—',
        avatar: d.avatar || ''
      }
      userStore.setUserInfo(d)
    }
  }).catch(() => {})
}

function popClick(type) {
  popType.value = type
  if (type === 'outconfirm') {
    popmessage.value = '确定退出登录吗?'
    popbut.value = '确定'
  } else {
    popmessage.value = '请先进行认证'
    popbut.value = '去认证'
  }
  isAuthen.value = true
}

/** 弹窗确认：退出登录执行登出，其余（去认证等）暂无逻辑只关窗 */
function handleConfirm() {
  isAuthen.value = false
  if (popType.value === 'outconfirm') {
    userStore.logout()
    uni.reLaunch({ url: '/pages/login/index' })
  }
}

/** 技术统计：进技术统计页（原首页，现为普通页面，navigateTo 即可） */
function goStats() {
  uni.navigateTo({ url: '/pages/main/index' })
}

/** 现场直播：入口待定，暂无动作 */
function goLive() {}

function uploadAvatar() {}
function authenClick() {}
function myserClick() {}
function payhisClick() {}
</script>

<style scoped>
.page {
  min-height: 100vh;
  background-color: #f8f8f8;
}

.topcontent {
  width: 100%;
  min-height: 420rpx;
  box-sizing: content-box;
  /* 沉浸式状态栏：内容整体下移状态栏高度，背景图拉伸铺满 */
  padding-top: var(--status-bar-height);
  background: url('/static/images/minbgctop.png') no-repeat;
  background-size: 100% 100%;
  top: 0;
  left: 0;
}

.personblcok {
  display: flex;
  align-items: center;
  padding-top: 110rpx;
}

.perphone {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  margin-left: 36rpx;
}

.permess {
  display: flex;
  flex-direction: column;
  margin-left: 60rpx;
}

.mestop {
  height: 44rpx;
  font-weight: 500;
  font-size: 32rpx;
  color: #000000;
  line-height: 44rpx;
  text-align: left;
}

.mestop-text {
  margin-left: 8rpx;
}

.mesbot {
  display: flex;
  margin-top: 20rpx;
}

.idmes {
  height: 28rpx;
  font-weight: 400;
  font-size: 20rpx;
  color: #333333;
  line-height: 28rpx;
  text-align: left;
}

.idmesimg {
  width: 78rpx;
  height: 28rpx;
  background: rgba(27, 208, 184, 0.2);
  border-radius: 22rpx;
  backdrop-filter: blur(10px);
  margin-left: 24rpx;
}

.idtext {
  height: 28rpx;
  font-weight: 500;
  font-size: 16rpx;
  color: #333333;
  line-height: 28rpx;
  text-align: center;
}

/* 快捷入口：白卡片内第一行 */
.funbar {
  display: flex;
  margin: 8rpx 36rpx 28rpx;
}

.funbtn {
  flex: 1;
  height: 120rpx;
  border-radius: 20rpx;
  background: #00b39b;
  box-shadow: 0 8rpx 20rpx rgba(0, 179, 155, 0.25);
  color: #ffffff;
  font-size: 30rpx;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
}

.funbtn + .funbtn {
  margin-left: 24rpx;
}

.bolist {
  width: 100%;
  min-height: calc(100vh - 572rpx);
  border-top-left-radius: 40rpx;
  border-top-right-radius: 40rpx;
  z-index: 1;
  margin-top: -60rpx;
  background-color: #fff;
  padding-top: 24rpx;
}

.list-menu-cell {
  width: 678rpx;
  height: 122rpx;
  display: flex;
  border-bottom: 2rpx solid #edf1f5;
  margin-left: 36rpx;
}

.cell-imga {
  width: 36rpx;
  height: 40rpx;
  margin: 42rpx 28rpx 40rpx 18rpx;
}

.cell-imgb {
  width: 36rpx;
  height: 32rpx;
  margin: 42rpx 28rpx 40rpx 18rpx;
}

.cell-imgd {
  width: 36rpx;
  height: 36rpx;
  margin: 42rpx 28rpx 40rpx 18rpx;
}

.cell-title {
  width: 564rpx;
  height: 122rpx;
  font-size: 28rpx;
  font-weight: 400;
  color: #333300;
  line-height: 122rpx;
}

.cell-next {
  width: 10rpx;
  height: 20rpx;
  margin-top: 50rpx;
}
</style>
