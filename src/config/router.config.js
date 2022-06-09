// eslint-disable-next-line
import { UserLayout, BasicLayout, BlankLayout } from '@/layouts'
// import { bxAnaalyse } from '@/core/icons'

// const RouteView = {
//   name: 'RouteView',
//   render: h => h('router-view')
// }

/**
 * 基础路由
 * @type { *[] }
 */
export const constantRouterMap = [
  {
    path: '/user',
    component: UserLayout,
    redirect: '/user/login',
    hidden: true,
    children: [
      {
        path: 'login',
        name: 'login',
        component: () => import(/* webpackChunkName: "user" */ '@/views/user/Login')
      },

      {
        path: 'register',
        name: 'register',
        component: () => import(/* webpackChunkName: "user" */ '@/views/user/Register')
      },
      {
        path: 'register-result',
        name: 'registerResult',
        component: () => import(/* webpackChunkName: "user" */ '@/views/user/RegisterResult')
      },
      {
        path: 'recover',
        name: 'recover',
        component: undefined
      }
    ]
  },
  {
    path: '/account',
    component: BasicLayout,
    redirect: '/account/center',
    name: 'account',
    meta: { title: 'menu.account', icon: 'user', keepAlive: true, multiTab: false },
    children: [
      {
        path: '/account/center',
        name: 'center',
        component: () => import('@/views/account/center'),
        meta: { title: 'menu.account.center', keepAlive: true, multiTab: false }
      },
      {
        path: '/account/settings',
        name: 'settings',
        component: () => import('@/views/account/settings/Index'),
        meta: { title: 'menu.account.settings', hideHeader: true, permission: ['user'], multiTab: false },
        redirect: '/account/settings/basic',
        hideChildrenInMenu: true,
        children: [
          {
            path: '/account/settings/basic',
            name: 'BasicSettings',
            component: () => import('@/views/account/settings/BasicSetting'),
            meta: { title: 'account.settings.menuMap.basic', hidden: true, multiTab: false }
          },
          {
            path: '/account/settings/security',
            name: 'SecuritySettings',
            component: () => import('@/views/account/settings/Security'),
            meta: {
              title: 'account.settings.menuMap.security',
              hidden: true,
              keepAlive: true,
              multiTab: false
            }
          },
          {
            path: '/account/settings/custom',
            name: 'CustomSettings',
            component: () => import('@/views/account/settings/Custom'),
            meta: { title: 'account.settings.menuMap.custom', hidden: true, keepAlive: true, multiTab: false }
          },
          {
            path: '/account/settings/binding',
            name: 'BindingSettings',
            component: () => import('@/views/account/settings/Binding'),
            meta: { title: 'account.settings.menuMap.binding', hidden: true, keepAlive: true, multiTab: false }
          },
          {
            path: '/account/settings/notification',
            name: 'NotificationSettings',
            component: () => import('@/views/account/settings/Notification'),
            meta: {
              title: 'account.settings.menuMap.notification',
              hidden: true,
              keepAlive: true,
              permission: ['user'],
              multiTab: false
            }
          }
        ]
      }
    ]
  },

  {
    path: '/404',
    component: () => import(/* webpackChunkName: "fail" */ '@/views/exception/404')
  }
]
