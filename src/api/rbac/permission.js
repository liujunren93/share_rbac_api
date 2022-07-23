import * as http from '@/utils/http'

const api = {
  permission: '/rbac/permission',
  permissionPath: '/rbac/permissionPath'
}

export function permissionList (page, parameter) {
  if (page) {
    return http.getPage(api.permission, page, parameter)
  } else {
    return http.get(api.permission, parameter)
  }
}

export function permissionCreate (parameter, conf) {
  return http.post(api.permission, parameter, conf)
}

export function permissionUpdate (pk, parameter, conf) {
  return http.put(api.permission + '/' + pk, parameter, conf)
}

export function permissionInfo (pk) {
  return http.get(api.permission + '/' + pk)
}

export function permissionDel (pk) {
  return http.del(api.permission + '/' + pk)
}

export function permissionPathList (pk) {
  return http.get(api.permissionPath + '/' + pk)
}
export function permissionPathSet (pk, parameter) {
  return http.put(api.permissionPath + '/' + pk, parameter)
}
