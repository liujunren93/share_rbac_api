import Store from '@/utils/storage'
import { login, getInfo, userPermission, refreshToken } from '@/api/login'
import { ACCESS_TOKEN, REFRESH_TOKEN } from '@/store/mutation-types'
import { welcome } from '@/utils/util'

const user = {
  state: {
    token: { token: '', refreshToken: '' },
    name: '',
    welcome: '',
    avatar: '',
    roles: [],
    info: {},
    permission: {}
  },

  mutations: {
    SET_TOKEN: (state, token, refreshToken) => {
      state.token = token
      state.refreshToken = refreshToken
    },
    SET_NAME: (state, { name, welcome }) => {
      state.name = name
      state.welcome = welcome
    },
    SET_AVATAR: (state, avatar) => {
      state.avatar = avatar
    },
    SET_ROLES: (state, roles) => {
      state.roles = roles
    },
    SET_PERMISSION: (state, permission) => {
      state.permission = permission
    },
    SET_INFO: (state, info) => {
      state.info = info
    }
  },

  actions: {
    // 登录
    Login ({ commit }, userInfo) {
      userInfo.domain_id = 1

      return new Promise((resolve, reject) => {
        login(userInfo, { success: false }).then(response => {
          commit('SetHaseMenu', false, { root: true })
          const token = response.data.token
          const userInfo = response.data.user_info
          userPermission({ role_ids: userInfo.role_ids }).then(res => {
            commit('SET_PERMISSION', res.data)
          })
          commit('SET_ROLES', userInfo.role_ids)
          commit('SET_INFO', userInfo)
          commit('SET_NAME', { name: userInfo.name, welcome: welcome() })
          storageToken(token)
          commit('SET_TOKEN', token.access_token, token.refresh_token)

          resolve()
        }).catch(error => {
          reject(error)
        })
      })
    },

    GetInfo ({ commit }) {
      return new Promise((resolve, reject) => {
        getInfo().then(response => {
          const result = response.data
          userPermission({ role_ids: result.role_ids }).then(res => {
            commit('SET_PERMISSION', res.data)
          })
          commit('SET_NAME', { name: result.name, welcome: welcome() })
          commit('SET_ROLES', result.role_ids)
          resolve(response)
        }).catch(error => {
          reject(error)
        })
      })
    },
    RefreshToken ({ commit, state }) {
      return new Promise((resolve, reject) => {
        let rtoken = ''
        if (state.token.refreshToken) {
          rtoken = state.token.refreshToken
        } else {
          rtoken = Store.get(REFRESH_TOKEN)
        }
        if (rtoken) {
          refreshToken(rtoken).then(res => {
            const token = res.data.token
            storageToken(token)
            commit('SET_TOKEN', token.access_token, token.refresh_token)
            resolve(res)
          }).catch(error => {
            reject(error)
          })
        } else {
          return this.Logout()
        }
      })
    },
    // 登出
    Logout ({ commit, state }) {
      return new Promise((resolve) => {
        commit('SET_TOKEN', '')
        commit('SET_ROLES', [])
        // commit('permission/SetHaseMenu', false)
        commit('SetHaseMenu', false, { root: true })
        Store.remove(ACCESS_TOKEN)
        Store.remove(ACCESS_TOKEN)
        resolve()
      })
    }

  }
}

function storageToken (token) {
  Store.set(ACCESS_TOKEN, token.access_token, (token.expiry - token.created))
  Store.set(REFRESH_TOKEN, token.refresh_token, (token.expiry - token.created) * 2)
}

export default user
