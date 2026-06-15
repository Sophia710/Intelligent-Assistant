/**
 * 当前用户 Hook（Mock）
 *
 * 本期为前端 mock,直接返回固定用户。
 * 未来接入真实后端时,可在此处改为请求 /api/users/me 并存到 Context。
 */

const MOCK_USER = {
  id: 'user-001',
  username: 'demo',
  display_name: '演示用户',
  role: 'user', // 'admin' | 'user'
}

/**
 * 简单权限判断
 */
const PERMISSIONS = {
  admin: ['*'],
  user: [
    'columns.view',
    'columns.subscribe',
    'columns.unsubscribe',
    'articles.view',
    'articles.read',
  ],
}

export function useCurrentUser() {
  return MOCK_USER
}

export function getCurrentUser() {
  return MOCK_USER
}

/**
 * 判定 user 是否具备 action 权限
 * @param {object} user
 * @param {string} action
 * @returns {boolean}
 */
export function can(user, action) {
  if (!user) return false
  const allowed = PERMISSIONS[user.role] || []
  return allowed.includes('*') || allowed.includes(action)
}

export default useCurrentUser
