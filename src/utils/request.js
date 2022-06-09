import axios from 'axios'
import store from '@/store'
import storage from 'store'
import notification from 'ant-design-vue/es/notification'
import { VueAxios } from './axios'
import { ACCESS_TOKEN } from '@/store/mutation-types'

// 创建 axios 实例
const request = axios.create({
  // API 请求的默认前缀
  baseURL: process.env.VUE_APP_API_BASE_URL,
  timeout: 6000, // 请求超时时间
  withCredentials: true
})

// 异常拦截处理器
const errorHandler = (error) => {
  if (error.data) {
    const data = error.data
    // 从 localstorage 获取 token
    const token = storage.get(ACCESS_TOKEN)
    const stauts = data.code
    var msg = data.msg
    let show = false
    if (error.config.error) {
      if (typeof error.config.error === 'boolean') {
        show = !error.config.error
      } else if (typeof error.config.error === 'function') {
        error.config.error()
        show = false
      }
    }
    if (show) {
      switch (stauts) {
        case 4003:
          notification['error']({ message: 'Forbidden', description: msg })
          break
        case 4001:
          notification['error']({ message: 'Unauthorized', description: '登陆信息已过期' })
          if (token) {
            store.dispatch('Logout').then(() => {
              setTimeout(() => {
                window.location.reload()
              }, 1500)
            })
          }
          break
         case 4200:
            notification['error']({ message: 'Duplication', description: msg })
            break
         default :
          notification['error']({ message: 'error', description: '未知错误' })
          break
    }
    }

    return Promise.reject(error.data)
  }
  return Promise.reject(error)
}

// request interceptor
request.interceptors.request.use(config => {
  const token = storage.get(ACCESS_TOKEN)
  // 如果 token 存在
  // 让每个请求携带自定义 token 请根据实际情况自行修改
  if (token) {
    config.headers['Authorization'] = token
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
