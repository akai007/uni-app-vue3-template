# uni-app-vue3-template

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

## 基础介绍
个人使用背景是因为公司业务覆盖多个小程序端，主要包括：支付宝小程序、微信小程序、百度小程序、快应用。项目基于npm包管理，vscode相关插件提供更好的开发体验。
- 主要用到相关技术：uni-app相关 / vue3 / vite / typescript / axios / sass / eslint / prettier
下面直接开始从头开始搭建一个可用的初始项目~ 如果"需求紧急"可以参考底部的GitHub源码。如果遇到问题可参照对应步骤。

## 使用npm安装uni-app
```
npm install -g @vue/cli
vue create -p dcloudio/uni-preset-vue#vue3 uni-app-vue3-demo
// 等待片刻 ...
> 请选择 uni-app 模板: 默认模板(TypeScript)

cd uni-app-vue3-demo

npm install
// 安装较慢时可使用
npm install --registry=https://registry.npm.taobao.org


```

## 配置 eslint + prettier 自动格式化代码
- 安装相关npm包
``` js
  "devDependencies": {
    "@typescript-eslint/eslint-plugin": "^5.15.0",
    "@typescript-eslint/parser": "^5.15.0",
    "eslint": "^8.11.0",
    "eslint-config-prettier": "^8.5.0",
    "eslint-plugin-prettier": "^4.0.0",
    "eslint-plugin-vue": "^8.5.0",
    "prettier": "2.6.0",
    "vite-plugin-eslint": "^1.3.0"
  }

```
- 安装相关插件
- [Prettier - Code formatter](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)
- [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
- eslint配置 `.eslintrc.js`
``` javascript 
module.exports = {
  env: { node: true },
  globals: { uni: true, wx: true, my: true, swan: true },
  parser: 'vue-eslint-parser',
  parserOptions: { parser: '@typescript-eslint/parser', sourceType: 'module' },
  extends: ['eslint:recommended', 'plugin:vue/vue3-recommended', 'prettier'],
  plugins: ['vue', '@typescript-eslint'],
  rules: {
    'vue/multi-word-component-names': 0,
  },
}
```
- prettier配置 `.prettierrc.js`
``` javascript
module.exports = {
  printWidth: 120,
  tabWidth: 2,
  tabs: false,
  semi: false,
  singleQuote: true,
  quoteProps: 'as-needed',
  tailingComma: 'all',
  bracketSpacing: true,
  jsxBracketSameLine: false,
  arrowParens: 'always',
  endOfLine: 'auto',
}
```
- vscode 配置 `.vscode/settings.json`
``` json
{
  "editor.tabSize": 2,
  
  "vetur.validation.template": false,
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "[vue]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[javascript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
}
```
- 测试代码自动格式化 (重启vscode 打开 src pages/index.vue 输入几个空格 然后在保存看是否会自动格式化)

## Typescript 配置允许默认 any 类型 `tsconfig.json`
```
{
  compilerOptions: {
    "noImplicitAny": false,
  }
}
```

## 配置 SASS

- 安装 npm 相关包
```
 npm install node-sass@4.0.0 sass-loader@7.3.1 --save-dev 
 // 如遇到安装问题可手动在package.json devDependencies 手动中添加
 // 删除 node_modules 然后 重新安装npm install
```

- 在 vue 中使用
``` xml
<style lang="scss">
</style>
```

### 配置全局公共变量 并 自动导入
- 新建全局样式变量 `src/style/var.scss`
``` scss
$test-size: 400rpx;
```
- 在全局自动导入 `vite.config.ts`
```  js
import { defineConfig, loadEnv, UserConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'
import * as path from 'path'

import eslintPlugin from 'vite-plugin-eslint'

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd())
  console.log(command, mode, env)

  let config: UserConfig = {
    resolve: { alias: { '~': path.resolve(__dirname, './src') } },
    css: {
      preprocessorOptions: {
        scss: { charset: false, additionalData: `@import "~/styles/var.scss";` },
      },
    },

    plugins: [uni(), eslintPlugin()],
  }

  if (command === 'serve') {
    // 仅开发
    return config
  } else {
    // 生产
    return config
  }
})


```
- vscode 相关插件
  - [SCSS IntelliSense](https://marketplace.visualstudio.com/items?itemName=mrmlnc.vscode-scss) 安装后会在全局提示 样式变量(如下图所示)
![image.png](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/d9ada1f8b48e4cf4854ec1139db5b454~tplv-k3u1fbpfcp-watermark.image?)

## 安装 axios api层 适配小程序
``` ts
import axios, { AxiosError } from 'axios'
import qs from 'qs'
let TOKEN_KEY = 'x-token' // TODO 根据自己后端配置
let API_SOURCE = ''
// #ifdef  MP-WEIXIN
API_SOURCE = 'weixin' // 微信小程序
// #endif
// #ifdef  MP-BAIDU
API_SOURCE = 'bdapplets' // 百度小程序
// #endif

// 设置表单类型
axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded'

let baseURL = process.env.VUE_APP_API_HOST

const fetch = axios.create({
  withCredentials: true,
  baseURL,
  timeout: 5000,
})
let jumpLoginCount = 0

// request拦截器,在请求之前做一些处理
fetch.interceptors.request.use(
  (config) => {
    Object.assign(config.headers, {
      Authorization: uni.getStorageSync(TOKEN_KEY),
    })
    config.data = qs.stringify(config.data)

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 配置成功后的拦截器
fetch.interceptors.response.use(
  (res) => {
    const params = qs.parse(res.config.data)

    // 设置 token
    if (res.headers.Authorization) {
      uni.setStorageSync(TOKEN_KEY, res.headers.Authorization)
    }
    // TODO 根据后端成功状态配置
    if (['20001'].includes(`${res.data.code}`)) {
      // 是否返回根数据
      if (params.rootResult) return res
      else return res.data
    } else {
      return Promise.reject(res.data)
    }
  },
  (error: AxiosError) => {
    const params = qs.parse(error.config.data)
    // 未登录 跳转登录页
    if (error.response!.status == 401) {
      if (jumpLoginCount == 0) {
        uni.navigateTo({
          url: '/pages/login/index', // TODO 配置成自己的登录页路径
        })
        ++jumpLoginCount
        setTimeout(() => (jumpLoginCount = 0), 2000)
      }
      return Promise.reject(error)
    }

    return Promise.reject(error)
  }
)

// 适配 小程序
fetch.defaults.adapter = function (config: any) {
  return new Promise((resolve, reject) => {
    var settle = require('axios/lib/core/settle')
    var buildURL = require('axios/lib/helpers/buildURL')

    uni.request({
      method: config.method.toUpperCase(),
      url: config.baseURL + buildURL(config.url, config.params, config.paramsSerializer),
      header: config.headers,
      data: config.data,
      dataType: config.dataType,
      responseType: config.responseType,
      sslVerify: config.sslVerify,
      complete: function complete(response: any) {
        response = {
          data: response.data,
          status: response.statusCode,
          errMsg: response.errMsg,
          headers: response.header, // 注意此处 单复数
          config: config,
        }
        settle(resolve, reject, response)
      },
    })
  })
}

export { fetch, API_SOURCE }

```



# script setup开发实践

## 前言
截止到目前，使用vue3 开发uni-app 虽然小坑还是不少，但已经达到基本可用的阶段。本文重点总结在使用Vue3 Composition-api 开发 Uni-app 时需要避开的坑和注意事项； 假定你已经搭建好基本的开发"架子"，如有需要可以参考我的另一篇文章 #[ Uni-app + Vue3 + TS 基础项目搭建 实战](https://juejin.cn/post/7035929902381531150)。

## 生命周期函数
- onLoad 可以获取页面传递的参数
``` ts
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
</script>
```

## 自定义样式 custom-class
- 在使用自定义组件 不支持 \<component class="class-name">\</component>，因此需要提供一个customClass prop来传递类名进行样式绑定
``` ts
<!-- 父组件 -->
<template>
  <view :class="[customClass]"></view>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
export default defineComponent({
  props: {
    customClass: { type: String, default: '' }, // 自定义类
  },
})
</script>

<!-- 子组件 -->
<template>
  <component custom-class="custom-class"></component>
</template>

<style scoped>
/* 如使用 scoped 则需要/deep/ */
/deep/ .custom-class {}
</style>
```

## 事件 emit
``` ts
<template>
  <view @click="handleClick"></view>
  
  <!-- 阻止事件冒泡 -->
  <view @click.stop="handleClick"></view>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
export default defineComponent({
  emits: ['click'], // 显性描述事件后 会对emit进行约束
  setup(props, {emit}) {
    function handleClick(e) {
      emit('click', e)
    }
    
    return {
      handleClick,
    }
  },
})
</script>
```

## 数据 props \ ref \ reactive \ computed 
``` ts
<script lang="ts">
import { defineComponent, PropType, ref, reactive, computed } from 'vue'

type Data = { id: string }

export default defineComponent({
  props: {
    data: { type: Object as PropType<Data>, default: false },
  },
  setup(props) {
    // ref更适合一个对象赋值
    const data = ref(props.data)
    
    // reactive更适合小规模逻辑的封装
    const popup = reactive({
      isShow: false,
      show: () => (popup.isShow = true)
      hide: () => (popup.isShow = false)
    })
    
    const id1 = computed(() => props.data ? props.data.id : '') 
    // 由于uni和vue生命周期不一致，在初始化过程中props.data 可能还未定义 需要保证不会报错，也可以用下面ts的语法糖来简化
    const id2 = computed(() => props.data?.id)
    
    return {
      isShow,
      popup,
      id1, id2,
    }
  },
})
</script>
```

## 监听 watch
``` ts
<script lang="ts">
import { defineComponent, PropType } from 'vue'

type Data = { id: string }

export default defineComponent({
  props: {
    data: { type: Object as PropType<Data>, default: false },
  },
  setup(props) {
    
    watch(props, (val, oldVal) => {
      if (!props) return // 规避uni和vue生命周期不一致的问题
      if (val.data?.id !== oldVal.data?.id) {
        console.log('props.data.id 变了')
      }
    })
    
    const data = ref(props.data)
    watch(data, (val, oldVal) => {
      if (val.id !== oldVal.id) {  
        console.log('data.id变了')
      }
    })
    
  },
})
</script>
```

## 其他注意事项
- setup 中 async function 暂时不会被转义，而支付宝小程序本身不支持，因此暂不建议使用








