// 页面相关
export const pagination = {
  defaultPageSize: 25,
  showTotal: total => `共${total}条数据`,
  showSizeChanger: true,
  pageSizeOptions: ['15', '20', '25', '35', '50']

}

const responseBody = {
  message: '',
  timestamp: 0,
  result: null,
  code: 0
}

export const buildPageData = (page, res) => {
  const pageNo = parseInt(page.pageNo)
  const pageSize = parseInt(page.pageSize)
  const totalPage = Math.ceil(res.data.total / pageSize)
  return builder({
    pageSize: pageSize,
    pageNo: pageNo,
    totalCount: res.data.total,
    totalPage: totalPage,
    data: res.data.list
  }, res.msg, res.code)
}

export const builder = (data, message, code = 0, headers = {}) => {
  responseBody.result = data
  if (message !== undefined && message !== null) {
    responseBody.message = message
  }
  if (code !== undefined && code !== 0) {
    responseBody.code = code
    responseBody._status = code
  }
  if (headers !== null && typeof headers === 'object' && Object.keys(headers).length > 0) {
    responseBody._headers = headers
  }
  responseBody.timestamp = new Date().getTime()
  return responseBody
}
