import axios from 'axios'
import store from '@/store'
import Store from '@/utils/storage'
import notification from 'ant-design-vue/es/notification'
import { VueAxios } from './axios'
import { ACCESS_TOKEN, REFRESH_TOKEN } from '@/store/mutation-types'
// 创建 axios 实例
const request = axios.create({
  // API 请求的默认前缀
  baseURL: process.env.VUE_APP_API_BASE_URL,
  timeout: 6000, // 请求超时时间
  withCredentials: true
})

let isRefreshToken = false
const refreshSubscribers = []

/* push所有请求到数组中 */
const subscribeTokenRefresh = (cb) => {
  refreshSubscribers.push(cb)
}

/* 刷新请求（refreshSubscribers数组中的请求得到新的token之后会自执行，用新的token去请求数据） */
const onRrefreshed = (token) => {
  refreshSubscribers.map(cb => cb(token))
}

// 异常拦截处理器
const errorHandler = (error) => {
  if (error.data) {
    const data = error.data
    // 从 localstorage 获取 token
    // const token = storage.get(ACCESS_TOKEN)
    var msg = data.msg
    let show = true
    const serShow = (data.code & 1) === 1
   let resCode = 200
    if (serShow) {
      resCode = (data.code - 1) / 10
    }
    if (error.config.error) {
      if (typeof error.config.error === 'boolean') {
        show = error.config.error
      } else if (typeof error.config.error === 'function') {
        error.config.error()
        show = false
      }
    }
    let msgType = ''
    switch (resCode) {
      case 14001:
        msgType = 'Unauthorized'
        msg = '账户或密码错误'
        break
      case 14005 || 14002:
          msg = '登陆信息已过期'
          msgType = 'authorized timeout'
            store.dispatch('Logout').then(() => {
              setTimeout(() => {
                window.location.reload()
              }, 1500)
            })
          break
      case 14003:
          msgType = 'Forbidden'
          msg = '无访问权限'
          break
      default:
        if ((data.code & 1) === 1) {
          msg = data.msg
          msgType = 'Error'
        } else {
          msg = '请求出现错误，请稍后再试'
          msgType = 'Error'
          break
        }
    }

    if (serShow && show) {
      notification['error']({ message: msgType, description: msg })
    }

    return Promise.reject(error.data)
  }
  return Promise.reject(error)
}

// request interceptor
request.interceptors.request.use(config => {
  if (config.url === '/rbac/auth/refreshToken' || config.url === '/rbac/auth/login') {
    return config
  }
  const token = Store.get(ACCESS_TOKEN)
  // storage.get(ACCESS_TOKEN)
  // 如果 token 存在
  // 让每个请求携带自定义 token 请根据实际情况自行修改
  if (token) {
    config.headers['Authorization'] = token
  } else { // token 过期
    const rtoken = Store.get(REFRESH_TOKEN)
    if (rtoken) {
      if (!isRefreshToken) {
        isRefreshToken = true

        store.dispatch('RefreshToken').then(res => {
          onRrefreshed(res.data.token.access_token)
          isRefreshToken = false
        })
          /* 把请求(token)=>{....}都push到一个数组中 */
          const retry = new Promise((resolve, reject) => {
            /* (token) => {...}这个函数就是回调函数 */
            subscribeTokenRefresh(token => {
              config.headers['Authorization'] = token
              /* 将请求挂起 */
              resolve(config)
            })
          })
          return retry
      }
    }
  }
  return config
}, errorHandler)

// response interceptor
request.interceptors.response.use((response) => {
  if (response.data.code === 200) {
    if (response.config.method !== 'get') {
      var msg = '操作成功'
      var show = true
      if (typeof response.config.success === 'function') {
        response.config.success()
        show = false
      } else if (response.config.success === false) {
        show = false
      }

      if (show) {
        notification['success']({ message: 'success', description: msg, duration: 3.5 })
      }
    }
    return response.data
  } else {
   return errorHandler(response)
  }
}, errorHandler)

const installer = {
  vm: {},
  install (Vue) {
    Vue.use(VueAxios, request)
  }
}

export default request

export {
  installer as VueAxios,
  request as axios
}
