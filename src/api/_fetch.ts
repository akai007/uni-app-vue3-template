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
