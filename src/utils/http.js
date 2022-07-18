import request from './request'
import { buildPageData } from './pagination'
function defaultHeader (conf = {}) {
    if (conf.headers === undefined) {
        conf.headers = { 'Content-Type': 'application/json;charset=UTF-8' }
    }
    return conf
}
export const get = (url, params, conf = {}) => {
    conf = defaultHeader(conf)
    return new Promise((resolve, reject) => {
        return request({
            url: url,
            method: 'get',
            params: params,
            // data: params,
            ...conf
          }).then(response => {
            resolve(response)
          }).catch(error => {
            reject(error)
          })
    })
}

export const getPage = (url, page, params, conf = {}) => {
  let pageParams = {}
  if (page) {
    pageParams = { page_size: page.pageSize, page: page.pageNo - 1 }
    if (page.sortField) {
      pageParams['sort_field'] = page.sortField
      pageParams['sort_order'] = page.sortOrder === 'ascend' ? 'asc' : 'desc'
    }
  }

  Object.assign(params, pageParams)
  conf = defaultHeader(conf)
  return new Promise((resolve, reject) => {
      return request({
          url: url,
          method: 'get',
          params: params,
          // data: params,
          ...conf
        }).then(response => {
          resolve(buildPageData(page, response))
        }).catch(error => {
          reject(error)
        })
  })
}
export const del = (url, params, conf = {}) => {
    conf = defaultHeader(conf)
    return new Promise((resolve, reject) => {
        return request({
            url: url,
            method: 'delete',
            data: params,
            ...conf
          }).then(response => {
            resolve(response)
          }).catch(error => {
            reject(error)
          })
    })
}

export const post = (url, params = {}, conf = {}) => {
    conf = defaultHeader(conf)

    return new Promise((resolve, reject) => {
        return request({
            url: url,
            method: 'post',
            data: params,
            ...conf
          }).then(response => {
            resolve(response)
          }).catch(error => {
            reject(error)
          })
    })
}

export const put = (url, params = {}, conf = {}) => {
    conf = defaultHeader(conf)
    return new Promise((resolve, reject) => {
        return request({
            url: url,
            method: 'put',
            data: params,
           ...conf
          }).then(response => {
            resolve(response)
          }).catch(error => {
            reject(error)
          })
    })
}
