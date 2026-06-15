import React, { useState, useEffect } from 'react'
import { useLocation, useParams, Link } from 'react-router-dom'
import api from '../services/api'
import { useTheme } from '../contexts/ThemeContext'
import ColumnNotificationBell from './columns/ColumnNotificationBell'

// 页面标题映射
const pageTitles = {
  '/chat/new': '新对话',
  '/agents': '智能体中心',
  '/skills': '技能中心',
  '/knowledge-base': '个人知识库',
  '/columns': '专栏订阅',
}

function TopBar() {
  const location = useLocation()
  const { id: convId } = useParams()
  const [conversationTitle, setConversationTitle] = useState('')
  // 动态面包屑末项：监听子页面派发的 page-context-update 事件，覆盖默认值「文档管理」
  const [breadcrumbLeaf, setBreadcrumbLeaf] = useState(null)
  const { isDark, toggleTheme } = useTheme()

  // 当处于对话详情页时，获取对话标题
  useEffect(() => {
    if (convId && location.pathname.startsWith('/chat/') && location.pathname !== '/chat/new') {
      api.get(`/conversations/${convId}`)
        .then(res => {
          if (res.data && res.data.title) {
            setConversationTitle(res.data.title)
          }
        })
        .catch(() => {
          // 使用默认标题
          setConversationTitle('对话详情')
        })
    } else {
      setConversationTitle('')
    }
  }, [convId, location.pathname])

  // 监听子页面派发的 page-context-update 事件，同步面包屑末项
  useEffect(() => {
    const handler = (e) => {
      setBreadcrumbLeaf(e.detail?.breadcrumbLeaf ?? null)
    }
    window.addEventListener('page-context-update', handler)
    return () => window.removeEventListener('page-context-update', handler)
  }, [])

  // 根据当前路由动态确定页面标题
  let title = ''
  let showBreadcrumb = false
  let breadcrumbItems = []

  if (location.pathname.startsWith('/chat/')) {
    // 对话页面 — 显示实际对话标题或回退到默认值
    title = conversationTitle || (location.pathname === '/chat/new' ? '新对话' : '对话详情')
  } else if (location.pathname.startsWith('/knowledge-base/') && location.pathname.includes('/documents')) {
    // 文档管理页 — 单标题 nav(与 h1 同款),末项默认「文档管理」,
    // 实际 KB 名称通过 page-context-update 事件覆盖 breadcrumbLeaf,同步驱动 title
    showBreadcrumb = 'single'
    title = breadcrumbLeaf || '文档管理'
  } else if (location.pathname === '/columns') {
    // /columns — 用 nav 元素展示「专栏订阅」,样式与 h1 一致
    showBreadcrumb = 'single'
    title = '专栏订阅'
  } else if (location.pathname.startsWith('/columns/') && location.pathname.includes('/articles/')) {
    // /columns/:id/articles/:aid — 单标题 nav,与 /columns 同款
    showBreadcrumb = 'single'
    title = '专栏订阅'
  } else if (location.pathname.startsWith('/columns/')) {
    // /columns/:id — 单标题 nav,与 /columns 同款
    showBreadcrumb = 'single'
    title = '专栏订阅'
  } else {
    // 其他页面从映射表取标题
    title = pageTitles[location.pathname] || ''
  }

  return (
    <header
      className="fixed top-0 right-0 left-[280px] h-16 z-10 flex items-center justify-between px-6 backdrop-blur-md border-b"
      style={{
        backgroundColor: 'color-mix(in srgb, var(--color-surface) 80%, transparent)',
        borderColor: 'color-mix(in srgb, var(--color-surface-variant) 50%, transparent)',
      }}
    >
      {/* 左侧：页面标题 / 面包屑导航 */}
      <div className="flex items-center gap-2">
        {/* 移动端菜单按钮 */}
        <button className="md:hidden text-[#464556]">
          <span className="material-symbols-outlined text-[22px]">menu</span>
        </button>

        {showBreadcrumb === true ? (
          /* 面包屑导航 */
          <nav className="flex items-center gap-1.5 text-sm">
            {breadcrumbItems.map((item, index) => (
              <React.Fragment key={index}>
                {index > 0 && (
                  <span className="material-symbols-outlined text-[16px] text-[#777588]">chevron_right</span>
                )}
                {item.path ? (
                  <Link
                    to={item.path}
                    className="text-[#464556] hover:text-[#3d32e6] transition-colors"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span className="text-[#1c1b1f] font-semibold">{item.label}</span>
                )}
              </React.Fragment>
            ))}
          </nav>
        ) : showBreadcrumb === 'single' ? (
          /* 单标题 — 使用 nav 元素,样式与 h1 一致 */
          <nav
            className="text-[18px] leading-snug font-bold text-[#3d32e6]"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            {title}
          </nav>
        ) : (
          /* 页面标题 - 使用 primary 色调以匹配设计稿 */
          <h1
            className="text-[18px] leading-snug font-bold text-[#3d32e6]"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            {title}
          </h1>
        )}
      </div>

      {/* 右侧：操作按钮 */}
      <div className="flex items-center gap-3">
        {/* 主题切换按钮 — 36x36px, rounded-lg, 匹配设计规范 */}
        <button
          onClick={toggleTheme}
          className="relative w-9 h-9 flex items-center justify-center rounded-lg transition-all duration-200 cursor-pointer"
          style={{ color: 'var(--color-on-surface-variant)' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--color-surface-container-low)'
            e.currentTarget.style.color = 'var(--color-primary)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent'
            e.currentTarget.style.color = 'var(--color-on-surface-variant)'
          }}
          title="切换主题"
          aria-label="切换明暗主题"
        >
          <span
            className="material-symbols-outlined text-[20px]"
            style={{
              transition: 'transform 300ms ease',
              transform: isDark ? 'rotate(0deg)' : 'rotate(0deg)',
            }}
          >
            {isDark ? 'light_mode' : 'dark_mode'}
          </span>
        </button>

        {/* 通知铃铛 */}
        <button
          className="p-2 rounded-lg transition-colors duration-150"
          style={{ color: 'var(--color-on-surface-variant)' }}
          onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-primary)' }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-on-surface-variant)' }}
        >
          <span className="material-symbols-outlined text-[22px]">notifications</span>
        </button>

        {/* 专栏通知铃铛 - 展示已订阅专栏的未读更新数 */}
        <ColumnNotificationBell />

        {/* 帮助按钮 */}
        <button
          className="p-2 rounded-lg transition-colors duration-150"
          style={{ color: 'var(--color-on-surface-variant)' }}
          onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-primary)' }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-on-surface-variant)' }}
        >
          <span className="material-symbols-outlined text-[22px]">help_outline</span>
        </button>
      </div>
    </header>
  )
}

export default TopBar
