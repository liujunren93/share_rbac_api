import * as http from '@/utils/http'

const api = {
  path: '/rbac/path'
}

export function pathList (page, parameter) {
  console.log(111, page)
  if (page) {
    return http.getPage(api.path, page, parameter)
  } else {
    return http.get(api.path, parameter)
  }
}

export function pathCreate (parameter) {
  return http.post(api.path, parameter)
}

export function pathUpdate (pk, parameter) {
  return http.put(api.path + '/' + pk, parameter)
}

export function pathInfo (pk) {
  return http.get(api.path + '/' + pk)
}

export function pathDel (pk) {
  return http.del(api.path + '/' + pk)
}
