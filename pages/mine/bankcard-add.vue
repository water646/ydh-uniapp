<template>
  <view class="page">
    <!-- 顶部白色栏：返回键 + 标题「添加银行卡」 -->
    <custom-nav title="添加银行卡" />

    <view class="body">
      <!-- 卡片1：卡号 -->
      <view class="card">
        <view class="field-col">
          <view class="field-label field-label-divider label-bold">输入卡号添加</view>
          <view class="field-row no-line tight">
            <view class="row-label label-bold">卡号</view>
            <view class="input-line">
              <input class="field-line-input" v-model="cardNo" type="number" maxlength="19" placeholder="请输入银行卡号" placeholder-class="ph-gray" />
              <image class="clear-icon" src="/static/images/delete.png" v-if="cardNo" @click="cardNo = ''"></image>
            </view>
          </view>
        </view>
      </view>

      <!-- 卡号为空：免输入卡号添加（按银行列表选行，功能待接入） -->
      <view v-if="!cardNo" class="card card-gap">
        <view class="field-label field-label-divider label-bold">免输入卡号添加</view>
        <view class="qa-row" v-for="b in shownBanks" :key="b.name" @click="onPick(b)">
          <image class="qa-icon" :src="'/static/images/bank/' + b.icon" mode="aspectFit"></image>
          <view class="qa-name">{{ b.name }}</view>
          <view class="qa-arrow">›</view>
        </view>
        <!-- 展开/收起：常态前6家，点「全部银行」展开，展开后显示「收起」 -->
        <view class="qa-toggle" @click="expanded = !expanded">{{ expanded ? '收起' : '全部银行' }}</view>
      </view>

      <!-- 卡号非空：卡类型 / 银行预留手机号 / 验证码 + 确认（label 与值同行；卡类型由后端根据卡号推断回填，只展示不可输入） -->
      <template v-else>
        <view class="card card-gap card-rows">
          <view class="field-row">
            <view class="row-label label-bold">卡类型</view>
            <view class="input-line">
              <view class="field-value" :class="{ 'ph-gray': !cardType }">{{ cardType || '输入卡号后自动识别' }}</view>
            </view>
          </view>

          <view class="field-row">
            <view class="row-label">银行预留手机号</view>
            <view class="input-line">
              <input class="field-line-input" v-model="phone" type="number" maxlength="11" placeholder="请输入银行预留手机号" placeholder-class="ph-gray" />
            </view>
          </view>

          <view class="field-row no-line">
            <view class="row-label">验证码</view>
            <view class="input-line">
              <input class="field-line-input" v-model="code" type="number" maxlength="6" placeholder="请输入验证码" placeholder-class="ph-gray" />
              <view class="send-btn" :class="{ counting: counting }" @click="onSendCode">{{ counting ? seconds + 's后重新发送' : '发送验证码' }}</view>
            </view>
          </view>
        </view>

        <!-- 确认 -->
        <view class="center-wrap">
          <view class="confirm-btn" @click="onConfirm">确认</view>
        </view>
      </template>
    </view>
  </view>
</template>

<script setup>
/**
 * 添加银行卡
 * 入口：银行卡列表页「添加银行卡」；卡类型由后端根据卡号推断回填展示，不可输入；
 * 发码暂用登录短信接口 sms/login，绑卡提交接口待定。
 */
import { ref, computed, onUnmounted } from 'vue'
import customNav from '@/components/custom-nav/custom-nav.vue'
import { getNote } from '@/api/login'

const cardNo = ref('')
const phone = ref('')

// 免输入卡号添加：银行列表（图标与银行卡页同源），点击行为待定
const QUICK_BANKS = [
  { name: '中国工商银行', icon: 'gongshang.png' },
  { name: '中国农业银行', icon: 'nongye.png' },
  { name: '中国银行', icon: 'zhongguo.png' },
  { name: '中国建设银行', icon: 'jianshe.png' },
  { name: '交通银行', icon: 'jiaotong.png' },
  { name: '中国邮政储蓄银行', icon: 'youzheng.png' },
  { name: '招商银行', icon: 'zhaoshang.png' },
  { name: '浦发银行', icon: 'pufa.png' },
  { name: '中信银行', icon: 'zhongxin.png' },
  { name: '民生银行', icon: 'minsheng.png' },
  { name: '兴业银行', icon: 'xinye.jpeg' },
  { name: '光大银行', icon: 'guangda.png' },
  { name: '华夏银行', icon: 'huaxia.png' },
  { name: '广发银行', icon: 'guangfa.png' },
  { name: '平安银行', icon: 'pingan.png' },
  { name: '北京银行', icon: 'beijing.png' },
  { name: '上海银行', icon: 'shanghai.png' },
  { name: '南京银行', icon: 'nanjing.jpeg' },
  { name: '浙商银行', icon: 'zheshang.jpeg' },
  { name: '中国农业发展银行', icon: 'nongyefazhan.png' }
]

// 免输入列表展开状态：常态只显示前6家
const expanded = ref(false)
const shownBanks = computed(() => (expanded.value ? QUICK_BANKS : QUICK_BANKS.slice(0, 6)))

// 卡类型：后端根据卡号推断后回填，仅展示
const cardType = ref('')

// 验证码 + 60s 重发倒计时
const code = ref('')
const counting = ref(false)
const seconds = ref(60)
let timer = null

/** 发送验证码：发给银行预留手机号，成功后 60s 倒计时 */
function onSendCode() {
  if (counting.value) return
  if (!/^1\d{10}$/.test(phone.value)) {
    return uni.showToast({ title: '请输入正确的手机号', icon: 'none' })
  }
  getNote(phone.value).then((res) => {
    if (res.code === 1) {
      uni.showToast({ title: '验证码已发送', icon: 'none' })
      counting.value = true
      seconds.value = 60
      timer = setInterval(() => {
        seconds.value--
        if (seconds.value <= 0) {
          clearInterval(timer)
          timer = null
          counting.value = false
        }
      }, 1000)
    }
  }).catch(() => {})
}

onUnmounted(() => {
  if (timer) clearInterval(timer)
})

/** 免输入添加：点击某行进该银行的选卡页（取卡接口后端未实现，页面内先空态） */
function onPick(b) {
  uni.navigateTo({ url: '/pages/mine/bankcard-select?bank=' + encodeURIComponent(b.name) + '&icon=' + b.icon })
}

/** 确认：提交绑卡（接口待定） */
function onConfirm() {
  if (!cardNo.value) {
    return uni.showToast({ title: '请输入卡号', icon: 'none' })
  }
  if (!phone.value) {
    return uni.showToast({ title: '请输入银行预留手机号', icon: 'none' })
  }
  if (!code.value) {
    return uni.showToast({ title: '请输入验证码', icon: 'none' })
  }
  // TODO: 绑卡接口确定后在此提交 { cardNo, phone, code }，卡类型由后端根据卡号推断
  uni.navigateTo({ url: '/pages/mine/bankcard-success' })
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  background-color: #f5f5f5;
}

/* 主体区（顶栏不套此容器，保证白色顶栏铺满屏幕边角含状态栏） */
.body {
  padding: 24rpx;
}

/* 白色卡片 */
.card {
  background-color: #ffffff;
  border-radius: 20rpx;
  padding: 40rpx 28rpx 8rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.04);
}

/* 第二张卡片与第一张的间距 */
.card-gap {
  margin-top: 20rpx;
}

/* 纵向字段：label 一行，值落在下方横线上（同账号管理页） */
.field-col {
  margin-bottom: 24rpx;
  display: flex;
  flex-direction: column;
}

/* 同行字段卡片：行自带上下内距，卡片顶部内距减小 */
.card-rows {
  padding-top: 14rpx;
}

/* 同行字段行：label 居左，输入框同行居右，行底横线通到卡片两端 */
.field-row {
  display: flex;
  align-items: center;
  padding: 20rpx 0;
  border-bottom: 3rpx solid #edf1f5;
}

/* 不带下划线的字段行（卡号、验证码） */
.field-row.no-line {
  border-bottom: none;
}

/* 上下间距减半的字段行（卡号） */
.field-row.tight {
  padding: 10rpx 0;
}

.row-label {
  width: 190rpx;
  flex-shrink: 0;
  font-size: 25rpx;
  color: #333333;
}

/* 同行字段的输入行：占满余宽，横线由整行承担 */
.field-row .input-line {
  flex: 1;
  border-bottom: none;
}

.field-label {
  font-size: 25rpx;
  color: #333333;
  margin-bottom: 20rpx;
}

/* 标题与下方字段行之间的分割线 */
.field-label-divider {
  padding-bottom: 20rpx;
  border-bottom: 3rpx solid #edf1f5;
}

/* 需要加粗的字段名 */
.label-bold {
  font-weight: bold;
}

.input-line {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 3rpx solid #edf1f5;
}

.field-line-input {
  height: 50rpx;
  font-size: 25rpx;
  color: #333333;
}

/* 只展示不可输入的字段值（卡类型） */
.field-value {
  flex: 1;
  height: 50rpx;
  line-height: 50rpx;
  font-size: 25rpx;
  color: #333333;
}

.ph-gray {
  color: #bbbbbb;
}

.clear-icon {
  width: 25rpx;
  height: 25rpx;
}

/* 发送验证码小胶囊：主题绿，倒计时置灰 */
.send-btn {
  padding: 10rpx 24rpx;
  border-radius: 30rpx;
  background-color: #00B39B;
  color: #ffffff;
  font-size: 20rpx;
  white-space: nowrap;
}

.send-btn.counting {
  background-color: #CACACA;
}

/* 免输入卡号添加行：银行图标 + 名称 + 灰色>箭头，浅灰横线分割 */
.qa-row {
  display: flex;
  align-items: center;
  padding: 20rpx 0;
  border-bottom: 3rpx solid #f1f2f6;
}

.qa-row:last-of-type {
  border-bottom: none;
}

.qa-icon {
  width: 44rpx;
  height: 44rpx;
  margin-right: 20rpx;
  flex-shrink: 0;
}

.qa-name {
  flex: 1;
  font-size: 25rpx;
  color: #333333;
}

/* 灰色前进箭头 */
.qa-arrow {
  font-size: 32rpx;
  color: #bbbbbb;
  line-height: 32rpx;
}

/* 全部银行/收起：主题绿文字，居中 */
.qa-toggle {
  text-align: center;
  padding: 24rpx 0 12rpx;
  font-size: 26rpx;
  color: #00B39B;
}

/* 居中包裹（按钮所在行） */
.center-wrap {
  display: flex;
  justify-content: center;
}

/* 确认按钮：主题绿胶囊 */
.confirm-btn {
  width: 620rpx;
  height: 88rpx;
  border-radius: 44rpx;
  background-color: #00B39B;
  color: #ffffff;
  font-size: 30rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 60rpx;
}
</style>
