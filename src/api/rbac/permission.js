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

export function permissionCreate (parameter) {
  return http.post(api.permission, parameter)
}

export function permissionUpdate (pk, parameter) {
  return http.put(api.permission + '/' + pk, parameter)
}

export function permissionInfo (pk) {
  return http.get(api.permission + '/' + pk)
}

export function permissionPathList (pk) {
  return http.get(api.permissionPath + '/' + pk)
}
export function permissionPathSet (pk, parameter) {
  return http.put(api.permissionPath + '/' + pk, parameter)
}
