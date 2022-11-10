<template>
  <view class="content">
    <image class="logo" src="../../static/logo.png"></image>
    <view>
      <text class="title">{{ title }}</text>
    </view>
    <button class="button" @click="handleClick">count: {{ count }}, click to add</button>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onShow, onHide, onLoad } from '@dcloudio/uni-app'

const title = ref('')
onLoad((options) => {
  console.log('page query', options)
})

// 页面切换到前台时
onShow(() => {
  title.value = 'hello uni-app-vue3 setup'
})

// 页面切换到后台时
onHide(() => {
  title.value = 'see you'
})

const count = ref(0)
const handleClick = () => count.value++
</script>

<style lang="scss">
.content {
  text-align: center;
  height: $test-size;
}

.logo {
  height: 200rpx;
  width: 200rpx;
  margin-top: 200rpx;
}

.title {
  font-size: 36rpx;
  color: #8f8f94;
}
.button {
  margin-top: 32rpx;
}
</style>
