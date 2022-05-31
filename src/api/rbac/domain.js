import * as http from '@/utils/http'

const api = {
  domain: '/rbac/domain'
}

export function domainList (page, parameter) {
  if (page) {
    return http.getPage(api.domain, page, parameter)
  } else {
    return http.get(api.domain, parameter)
  }
}

export function domianCreate (parameter) {
  return http.post(api.domain, parameter)
}

export function domianUpdate (pk, parameter) {
  return http.put(api.domain + '/' + pk, parameter)
}

export function domianInfo (pk) {
  return http.get(api.domain + '/' + pk)
}
