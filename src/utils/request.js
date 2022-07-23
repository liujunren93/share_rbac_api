import axios from 'axios'
import store from '@/store'
import Store from '@/utils/storage'
// import Lock from '@/utils/lock'
import notification from 'ant-design-vue/es/notification'
import { VueAxios } from './axios'
import { ACCESS_TOKEN, REFRESH_TOKEN } from '@/store/mutation-types'
// 创建 axios 实例
const request = axios.create({
  // API 请求的默认前缀
  baseURL: process.env.VUE_APP_API_BASE_URL,
  timeout: 6000, // 请求超时时间
  withCredentials: true,
  retry: 3,
  retryDelay: 1000
})

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
  if (error.code === 'ECONNABORTED' && error.message.indexOf('timeout') !== -1) {
    var config = error.config
    config.__retryCount = config.__retryCount || 0
    if (config.__retryCount < config.retry) {
    // Increase the retry count
      config.__retryCount += 1
      var newHttp = new Promise(function (resolve) {
        setTimeout(function () {
          // console.log('resolve');
          resolve()
        }, config.retryDelay || 1)
      })
      return newHttp.then(function () {
        console.log('retry')
        return request(config)
      })
    }
  }
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
      case 14005:
      case 14002:
          msg = '登陆信息已过期'
          msgType = 'authorized'
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
// var lock = new Lock()
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
    return config
  } else { // token 过期
    const rtoken = Store.get(REFRESH_TOKEN)
    if (rtoken) {
        store.dispatch('RefreshToken').then(res => {
          onRrefreshed(res.data.token.access_token)
          // return config
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
