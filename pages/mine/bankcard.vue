<template>
  <view class="page">
    <!-- 顶部白色栏：返回键 + 标题「银行卡」 -->
    <custom-nav title="银行卡" />

    <!-- 主体：灰底，已绑定的银行卡以卡片展示 -->
    <view class="body">
      <view v-if="cards.length">
        <view v-for="c in cards" :key="c.id" class="carditem" :style="cardStyle(c)">
          <!-- 右侧浅色 logo 水印：暂不上线（样式待调），启用时解开下一行
          <image v-if="markSrc(c)" class="carditem-mark" :src="markSrc(c)" mode="heightFix"></image>
          -->
          <view class="carditem-top">
            <!-- 命中银行：白色圆底(70rpx) + logo(60rpx)；未命中：默认卡形图标 -->
            <view class="carditem-logo" v-if="hasBankIcon(c)">
              <image class="carditem-logo-img" :style="logoStyle(c)" :src="bankIconSrc(c)" mode="aspectFit"></image>
            </view>
            <image v-else class="carditem-icon" src="/static/images/bankcard.png"></image>
            <text class="carditem-bank">{{ c.bankName || '银行卡' }}</text>
            <view class="carditem-unbind" @click="onUnbind(c)">解绑</view>
          </view>
          <view class="carditem-num">{{ fmtCard(c.bankCardNumber) }}</view>
          <view class="carditem-holder">持卡人：{{ c.name || '—' }}</view>
        </view>
      </view>
      <view v-else class="empty">未绑定银行卡</view>
    </view>

    <!-- 底部：添加银行卡按钮 -->
    <view class="add-btn" @click="onAdd">
      <text class="add-btn-text">添加银行卡</text>
    </view>
  </view>
</template>

<script setup>
/**
 * 银行卡列表
 * 入口：钱包页银行卡条；数据来自 rest/userAuthInfo/info（带 bankCardNumber 的认证记录）。
 * 添加银行卡接口待定。
 */
import { ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import customNav from '@/components/custom-nav/custom-nav.vue'
import { getAuthInfo } from '@/api/auth'

// 绑定的银行卡列表
const cards = ref([])

// key：银行名包含即命中；中国银行 key 为 null——必须全名完全一致
const bankColor = [
    {"bank":"中国工商银行","key":"工商","color":"#C65155"},
    {"bank":"中国农业银行","key":"农业","color":"#049983"},
    {"bank":"中国银行","key":null,"color":"#B00D33"},
    {"bank":"中国建设银行","key":"建设","color":"#00529B"},
    {"bank":"交通银行","key":"交通","color":"#00338D"},
    {"bank":"中国邮政储蓄银行","key":"邮政","color":"#008C77"},
    {"bank":"招商银行","key":"招商","color":"#981E34"},
    {"bank":"浦发银行","key":"浦发","color":"#04356F"},
    {"bank":"中信银行","key":"中信","color":"#D8000F"},
    {"bank":"民生银行","key":"民生","color":"#0066B3"},
    {"bank":"兴业银行","key":"兴业","color":"#00468B"},
    {"bank":"光大银行","key":"光大","color":"#FFCC00"},
    {"bank":"华夏银行","key":"华夏","color":"#C8102E"},
    {"bank":"广发银行","key":"广发","color":"#C8252D"},
    {"bank":"平安银行","key":"平安","color":"#FF6700"},
    {"bank":"北京银行","key":"北京","color":"#C8102E"},
    {"bank":"上海银行","key":"上海","color":"#005AA7"},
    {"bank":"南京银行","key":"南京","color":"#C51822"},
    {"bank":"浙商银行","key":"浙商","color":"#E40317"},
    {"bank":"中国农业发展银行","key":"农业发展","color":"#AC8005"}
]

// 银行名 → static/images/bank/ 图标文件名（20家全量；民生用四角刷白处理过的 minsheng.png）
const DEFAULT_ICON = '/static/images/bankcard.png'
const bankIcon = {
  '中国工商银行': 'gongshang.png',
  '中国农业银行': 'nongye.png',
  '中国银行': 'zhongguo.png',
  '中国建设银行': 'jianshe.png',
  '交通银行': 'jiaotong.png',
  '中国邮政储蓄银行': 'youzheng.png',
  '招商银行': 'zhaoshang.png',
  '浦发银行': 'pufa.png',
  '中信银行': 'zhongxin.png',
  '民生银行': 'minsheng.png',
  '兴业银行': 'xinye.jpeg',
  '光大银行': 'guangda.png',
  '华夏银行': 'huaxia.png',
  '广发银行': 'guangfa.png',
  '平安银行': 'pingan.png',
  '北京银行': 'beijing.png',
  '上海银行': 'shanghai.png',
  '南京银行': 'nanjing.jpeg',
  '浙商银行': 'zheshang.jpeg',
  '中国农业发展银行': 'nongyefazhan.png'
}

// 图标原始像素宽高（PIL 实测）：显示时按比例缩放，对角线 = 62rpx（< 圆底直径 64rpx，方角不出圆）
const bankIconSize = {
  'gongshang.png': [42, 42],
  'nongye.png': [44, 42],
  'zhongguo.png': [42, 42],
  'jianshe.png': [56, 62],
  'jiaotong.png': [48, 54],
  'youzheng.png': [46, 46],
  'zhaoshang.png': [46, 42],
  'pufa.png': [42, 42],
  'zhongxin.png': [42, 42],
  'minsheng.png': [500, 500],
  'xinye.jpeg': [800, 500],
  'guangda.png': [624, 321],
  'huaxia.png': [510, 483],
  'guangfa.png': [594, 555],
  'pingan.png': [933, 351],
  'beijing.png': [168, 168],
  'shanghai.png': [300, 302],
  'nanjing.jpeg': [491, 475],
  'zheshang.jpeg': [514, 500],
  'nongyefazhan.png': [468, 464]
}

// 图标微调（rpx）：x 负左移/正右移，y 负上移/正下移——修正 png 自带的不对称透明留白
const bankIconOffset = {
  '中国工商银行': { x: -2, y: 2 },
  '中国银行': { x: -2, y: 2 },
  '中国建设银行': { x: -3, y: -3 }
}

/** logo 显示尺寸 + 微调：按图片宽高等比缩放使对角线 = 62rpx，方角不出 64rpx 圆底 */
function logoStyle(c) {
  const hit = matchBank(c.bankName)
  const file = hit && bankIcon[hit.bank]
  const size = file && bankIconSize[file]
  const style = {}
  if (size) {
    const k = 62 / Math.sqrt(size[0] * size[0] + size[1] * size[1])
    style.width = (size[0] * k).toFixed(2) + 'rpx'
    style.height = (size[1] * k).toFixed(2) + 'rpx'
  }
  const off = hit && bankIconOffset[hit.bank]
  if (off) {
    style.marginLeft = off.x + 'rpx'
    style.marginTop = off.y + 'rpx'
  }
  return style
}

/** 银行名匹配：中国银行要求完全一致，其余名字包含 key 即命中（长 key 优先，农业发展 先于 农业） */
function matchBank(name) {
  const n = (name || '').trim()
  if (!n) return null
  if (n === '中国银行') return bankColor.find((b) => b.bank === '中国银行')
  return bankColor
    .filter((b) => b.key && n.includes(b.key))
    .sort((a, b) => b.key.length - a.key.length)[0] || null
}

/** 卡片背景：命中 bankColor 用银行色，否则空对象走默认绿色渐变 */
function cardStyle(c) {
  const hit = matchBank(c.bankName)
  return hit ? { background: hit.color } : {}
}

/** 是否命中拼音银行图标 */
function hasBankIcon(c) {
  const hit = matchBank(c.bankName)
  return !!(hit && bankIcon[hit.bank])
}

/** 卡片图标：命中映射用白色圆底银行图标，否则默认图标 */
function bankIconSrc(c) {
  const hit = matchBank(c.bankName)
  const file = hit && bankIcon[hit.bank]
  return file ? '/static/images/bank/' + file : DEFAULT_ICON
}

/** 右侧水印：银行 logo 的浅色版（同目录 -light.png），无 logo 的卡返回空串不显示 */
function markSrc(c) {
  const hit = matchBank(c.bankName)
  const file = hit && bankIcon[hit.bank]
  return file ? '/static/images/bank/' + file.replace(/\.(png|jpe?g)$/, '') + '-light.png' : ''
}

// 【临时假数据】已停用，预览时解开注释并注释掉下方 onShow 里的 loadCards()
// const TEST_CARDS = bankColor.map((b, i) => ({
//   id: 'test' + i,
//   bankName: b.bank,
//   bankCardNumber: '6222' + String(1000000000000 + i),
//   name: '张三'
// })).concat([{ id: 'test-default', bankName: '某某银行', bankCardNumber: '6222987654321098765', name: '张三' }])

onShow(() => {
  loadCards()
  // cards.value = TEST_CARDS
})

/** 拉认证记录，筛出绑了银行卡的 */
function loadCards() {
  getAuthInfo().then((res) => {
    if (res.code === 1 && Array.isArray(res.data)) {
      cards.value = res.data.filter((r) => r.bankCardNumber)
    }
  }).catch(() => {})
}

/** 卡号打码：前 4 后 4，中间星号 */
function fmtCard(no) {
  const s = String(no || '')
  if (s.length < 9) return s || '—'
  return s.slice(0, 4) + ' **** **** ' + s.slice(-4)
}

/** 添加银行卡：进添加页（卡号/预留手机号/验证码，卡类型由后端推断，提交接口待定） */
function onAdd() {
  uni.navigateTo({ url: '/pages/mine/bankcard-add' })
}

/** 解绑银行卡（接口待定） */
function onUnbind(c) {
  // TODO: 解绑接口确定后在此提交（预计带 c.id），成功后 loadCards() 刷新
  uni.showToast({ title: '解绑接口待接入', icon: 'none' })
}

function onBack() {
  if (getCurrentPages().length > 1) {
    uni.navigateBack()
  } else {
    // 兜底：热同步重载后页面栈只剩本页时，回首页 tab
    uni.switchTab({ url: '/pages/home/index' })
  }
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  background-color: #f5f5f5;
  /* 给底部固定按钮留出空间 */
  padding-bottom: 160rpx;
}

/* 主体区（顶栏不套此容器，保证白色顶栏铺满屏幕边角含状态栏） */
.body {
  padding: 24rpx;
}

/* 单张银行卡卡片：主题绿渐变（同钱包页银行卡条） */
.carditem {
  position: relative;
  background: linear-gradient(#00C9BB, rgba(0, 201, 187, 0.55));
  border-radius: 20rpx;
  padding: 30rpx 28rpx;
  margin-bottom: 20rpx;
}

/* 右侧浅色 logo 水印：与卡片等高、贴右缘，宽度按比例自适应（heightFix）；
   层级：卡片(0) < 水印(1) < 内容/按钮(2) */
.carditem-mark {
  position: absolute;
  right: 0;
  top: 0;
  height: 100%;
  z-index: 1;
}

/* 内容行抬到水印之上（含解绑按钮） */
.carditem-top,
.carditem-num,
.carditem-holder {
  position: relative;
  z-index: 2;
}

.carditem-top {
  display: flex;
  align-items: center;
}

.carditem-icon {
  width: 32rpx;
  height: 25rpx;
  margin-right: 12rpx;
}

/* 银行专属图标：白色圆底 64rpx；logo 尺寸由 logoStyle 按对角线 62rpx 动态给出 */
.carditem-logo {
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  background-color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12rpx;
  flex-shrink: 0;
}

.carditem-logo-img {
  /* 兜底尺寸，正常被内联样式覆盖 */
  width: 60rpx;
  height: 60rpx;
}

.carditem-bank {
  color: #ffffff;
  font-size: 28rpx;
  font-weight: bold;
}

/* 解绑小胶囊：靠卡片右上角，白描边 */
.carditem-unbind {
  margin-left: auto;
  padding: 6rpx 24rpx;
  border: 1rpx solid rgba(255, 255, 255, 0.8);
  border-radius: 24rpx;
  color: #ffffff;
  font-size: 22rpx;
}

.carditem-num {
  color: #ffffff;
  font-size: 30rpx;
  margin-top: 20rpx;
  letter-spacing: 2rpx;
}

.carditem-holder {
  color: rgba(255, 255, 255, 0.8);
  font-size: 22rpx;
  margin-top: 12rpx;
}

/* 底部添加按钮：主题绿胶囊，固定贴底 */
.add-btn {
  position: fixed;
  left: 24rpx;
  right: 24rpx;
  bottom: 40rpx;
  height: 88rpx;
  border-radius: 44rpx;
  background-color: #00B39B;
  display: flex;
  align-items: center;
  justify-content: center;
}

.add-btn-text {
  color: #ffffff;
  font-size: 30rpx;
}

/* 未绑卡占位 */
.empty {
  text-align: center;
  color: #bbbbbb;
  font-size: 26rpx;
  padding: 80rpx 0;
}
</style>
