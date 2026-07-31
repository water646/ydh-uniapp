<template>
  <view class="agreement">
    <custom-nav :title="title" />
    <web-view :src="url" />
  </view>
</template>

<script setup>
/**
 * 用户协议/隐私政策页（对应 UserAgreeActivity）
 * type=1 用户协议，type=2 隐私政策，WebView 加载远程页面
 */
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import customNav from '@/components/custom-nav/custom-nav.vue'
import { config } from '@/config'

const url = ref('')
const title = ref('')

onLoad((opt) => {
  const type = opt.type
  if (String(type) === '2') {
    url.value = config.agreement.privacy
    title.value = '隐私政策'
  } else {
    url.value = config.agreement.user
    title.value = '用户协议'
  }
  uni.setNavigationBarTitle({ title: title.value })
})
</script>

<style lang="scss" scoped>
.agreement {
  height: 100vh;
  display: flex;
  flex-direction: column;
}
</style>
