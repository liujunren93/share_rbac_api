import * as http from '@/utils/http'

const api = {

  accountBase: '/rbac/account/base'
}

export function accountBaseEdit (parameter, config) {
  return http.put(api.accountBase, parameter, config)
}

export function accountBaseInfo (parameter) {
  return http.get(api.accountBase, parameter)
}
