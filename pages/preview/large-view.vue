<template>
  <view class="large-view">
    <swiper class="swiper" :current="current" @change="onChange">
      <swiper-item v-for="(url, i) in urls" :key="i">
        <image :src="url" mode="aspectFit" class="img" @click="back" />
      </swiper-item>
    </swiper>
    <view v-if="urls.length > 1" class="page-indicator">{{ current + 1 }}/{{ urls.length }}</view>
  </view>
</template>

<script setup>
/**
 * 全屏图片预览（对应 LargeViewActivity）
 * 收 POSITION + URLS(ArrayList<String>)，分页浏览，点图退出
 * 原项目用 HackyViewPager + PhotoView 捏合缩放；uniapp 用 swiper + image aspectFit
 */
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'

const urls = ref([])
const current = ref(0)

onLoad((opt) => {
  // 兼容编码/未编码两种传参方式
  try {
    urls.value = JSON.parse(opt.urls)
  } catch (e) {
    try {
      urls.value = JSON.parse(decodeURIComponent(opt.urls))
    } catch (e2) {
      urls.value = []
    }
  }
  current.value = Number(opt.position || 0)
})

function onChange(e) {
  current.value = e.detail.current
}

function back() {
  uni.navigateBack()
}
</script>

<style lang="scss" scoped>
.large-view {
  width: 100%;
  height: 100vh;
  background-color: #000000;
}
.swiper {
  width: 100%;
  height: 100vh;
}
.img {
  width: 100%;
  height: 100%;
}
.page-indicator {
  position: fixed;
  bottom: 80rpx;
  left: 0;
  right: 0;
  text-align: center;
  color: #ffffff;
  font-size: 28rpx;
}
</style>
