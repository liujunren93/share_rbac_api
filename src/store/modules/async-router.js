/**
 * 向后端请求用户的菜单，动态生成路由
 */
import { constantRouterMap } from '@/config/router.config'
import { generatorDynamicRouter } from '@/router/generator-routers'

const permission = {
  state: {
    routers: constantRouterMap,
    addRouters: [],
    hasMenu: false
  },
  mutations: {
    SET_ROUTERS: (state, routers) => {
      state.addRouters = routers
      state.routers = constantRouterMap.concat(routers)
    },
    SetHaseMenu: (state, hasMenu) => {
      state.hasMenu = hasMenu
    }
  },
  actions: {
    GenerateRoutes ({ commit }, data) {
      return new Promise(resolve => {
        generatorDynamicRouter().then(routers => {
          console.log(routers)
          commit('SET_ROUTERS', routers)
          commit('SetHaseMenu', true)
          resolve()
        })
      })
    }
  }
}

export default permission
