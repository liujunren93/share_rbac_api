import * as http from '@/utils/http'

const api = {
  role: '/rbac/role',
  rolePermission: '/rbac/rolePermission'
}

export function roleList (page, parameter) {
  if (page) {
    return http.getPage(api.role, page, parameter)
  } else {
    return http.get(api.role, parameter)
  }
}

export function roleCreate (parameter) {
  return http.post(api.role, parameter)
}

export function roleUpdate (pk, parameter) {
  return http.put(api.role + '/' + pk, parameter)
}

export function roleInfo (pk) {
  return http.get(api.role + '/' + pk)
}

export function rolePermission (pk) {
  return http.get(api.rolePermission + '/' + pk)
}
export function rolePermissionSet (pk, parameter) {
  return http.put(api.rolePermission + '/' + pk, parameter)
}
