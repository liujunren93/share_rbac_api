import * as http from '@/utils/http'

const api = {
  aliyunStsCredentials: '/system/aliyunStsCredentials'
}

export function aliyunStsCredentials () {
  return http.get(api.aliyunStsCredentials, {})
}
