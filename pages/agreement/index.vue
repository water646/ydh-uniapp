
<template>


    <!-- <button class="back-btn" @click="goBack()">返回</button> -->
	<view style="display:flex; align-items: center;justify-content: center; height:70rpx;width: 100%;background-color: #FFFFFF; ">
		<image @click="goBack()" style="position: absolute; left: 20rpx; top: 11rpx; width: 100rpx; height: 100rpx;" src="/static/mipmap-xxhdpi/black_back.png" mode="aspectFit" />
		<view style="color: #717171;">{{title}}</view>
	</view>

    <!-- WebView 组件加载远程 URL -->
    <web-view style="position:absolute; top:60rpx" :src="url" />
</template>

<script setup>
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { config } from '@/config'

// 响应式数据
const url = ref('')
const title = ref('')

// 页面加载生命周期
onLoad((opt) => {
  const type = opt.type
  
  // 根据 type 参数判断加载用户协议还是隐私政策
  if (String(type) === '2') {
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

// 返回上一页逻辑
const goBack = () => {
  uni.navigateBack({
    delta: 1, // 返回的页面数，默认为 1
    success: () => {
      console.log('返回成功');
    },
    fail: () => {
      console.log('返回失败');
    }
  });
}
</script>

<style lang="scss" scoped>
.container {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.top-line {
  width: 100%;
  height: 60rpx;
  background-color: #DDDDDD;
  padding: 20rpx;
  /* 如果不需要padding影响高度，建议调整 box-sizing 或移除 padding */
  box-sizing: border-box;
}

.back-btn {
  position: fixed;
  bottom: 60rpx;
  /* 建议添加 left 或 right 定位，否则 justify-self 在 fixed 定位下可能无效 */
  left: 50%;
  transform: translateX(-50%);
  width: 130rpx;
  height: 65rpx;
  z-index: 99999;
  font-size: 25rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.5); /* 示例背景色，便于查看 */
  color: #fff; /* 示例文字颜色 */
  border-radius: 30rpx; /* 示例圆角 */
}
</style>
