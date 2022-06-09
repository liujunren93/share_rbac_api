import * as http from '@/utils/http'

const api = {
  admin: '/rbac/admin',
  adminRole: '/rbac/adminRole',
  accountBase: '/account/base'
}

export function userList (page, parameter, config) {
  if (page) {
    return http.getPage(api.admin, page, parameter, config)
  } else {
    return http.get(api.admin, parameter, config)
  }
}

export function userCreate (parameter) {
  return http.post(api.admin, parameter)
}

export function userUpdate (pk, parameter) {
  return http.put(api.admin + '/' + pk, parameter)
}

export function userInfo (pk) {
  return http.get(api.admin + '/' + pk)
}

export function userRoleList (pk) {
  return http.get(api.adminRole + '/' + pk)
}
export function userRoleSet (pk, parameter) {
  return http.put(api.adminRole + '/' + pk, parameter)
}

export function accountBaseEdit (parameter) {
  return http.put(api.accountBase, parameter)
}
