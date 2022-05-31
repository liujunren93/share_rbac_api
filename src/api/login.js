import * as http from '@/utils/http'

const userApi = {
  Login: '/rbac/auth/login',
  Logout: '/auth/logout',
  ForgePassword: '/auth/forge-password',
  Register: '/auth/register',
  twoStepCode: '/auth/2step-code',
  SendSms: '/account/sms',
  SendSmsErr: '/account/sms_err',
  // get my info
  UserInfo: '/rbac/auth/userInfo',
  UserMenu: '/rbac/auth/menu',
  userPermission: '/rbac/auth/permission'
}

/**
 * login func
 * parameter: {
 *     username: '',
 *     password: '',
 *     remember_me: true,
 *     captcha: '12345'
 * }
 * @param parameter
 * @returns {*}
 */
export function login (parameter) {
  return http.post(userApi.Login, parameter)
}

export function userPermission (parameter) {
  return http.get(userApi.userPermission, parameter)
}

export function getSmsCaptcha (parameter) {
  return http.post(userApi.Login, parameter)
}

export function getInfo () {
  return http.get(userApi.UserInfo)
}

export function getCurrentUserNav () {
  return http.get(userApi.UserMenu)
}

export function logout () {
  return http.post(userApi.Login)
}
/**
 * get user 2step code open?
 * @param parameter {*}
 */
export function get2step (parameter) {
  return http.post(userApi.Login, parameter)
}
