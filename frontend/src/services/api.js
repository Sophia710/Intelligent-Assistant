/**
 * API 请求封装
 * 统一处理：基础URL、headers、响应格式、错误处理
 */

const BASE_URL = '/api'

// 默认请求头
function getDefaultHeaders() {
  const headers = {
    'Content-Type': 'application/json',
  }
  // 如果存在 token，自动附加到 Authorization
  const token = localStorage.getItem('token')
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  return headers
}

/**
 * 统一响应处理
 * - 检查 HTTP 状态码
 * - 解析 JSON 响应
 * - 统一错误格式
 */
async function handleResponse(response) {
  if (!response.ok) {
    // 尝试从响应体获取错误信息
    let errorMessage = `请求失败 (${response.status})`
    try {
      const errorData = await response.json()
      errorMessage = errorData.message || errorData.error || errorMessage
    } catch {
      // 非 JSON 响应，使用默认错误信息
    }
    throw new Error(errorMessage)
  }
  // 部分接口可能返回空响应（如 204 No Content）
  const contentType = response.headers.get('content-type')
  if (contentType && contentType.includes('application/json')) {
    return response.json()
  }
  return { data: null }
}

/** GET 请求 */
export function get(url, params) {
  let finalUrl = `${BASE_URL}${url}`
  if (params) {
    const searchParams = new URLSearchParams(params).toString()
    finalUrl += `?${searchParams}`
  }

  return fetch(finalUrl, {
    method: 'GET',
    headers: getDefaultHeaders(),
  }).then(handleResponse)
}

/** POST 请求 */
export function post(url, data) {
  return fetch(`${BASE_URL}${url}`, {
    method: 'POST',
    headers: getDefaultHeaders(),
    body: JSON.stringify(data),
  }).then(handleResponse)
}

/** PUT 请求 */
export function put(url, data) {
  return fetch(`${BASE_URL}${url}`, {
    method: 'PUT',
    headers: getDefaultHeaders(),
    body: JSON.stringify(data),
  }).then(handleResponse)
}

/** DELETE 请求 */
export function del(url) {
  return fetch(`${BASE_URL}${url}`, {
    method: 'DELETE',
    headers: getDefaultHeaders(),
  }).then(handleResponse)
}

// 导出聚合对象，支持 api.get() / api.post() 等调用方式
const api = { get, post, put, del }
export default api
