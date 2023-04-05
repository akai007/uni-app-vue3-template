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

## 总结
通过上述步骤后，就能愉快的进行踩坑之旅了~ 如有需要可访问源码 ![github.svg](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/c1466516857f47af8373fb376e126ef4~tplv-k3u1fbpfcp-watermark.image?) [uni-app-vue3-template](https://github.com/akai007/uni-app-vue3-template)








