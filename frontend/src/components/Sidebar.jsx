import React, { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import api from '../services/api'

/* 后端不可用时的 mock 对话列表 fallback（与 useMessages.js 中的 MOCK_CONVERSATIONS 一一对应） */
const MOCK_CONVERSATIONS_FALLBACK = [
  { id: 'conv-001', title: '新对话', status: 'empty' },
  { id: 'conv-success-demo', title: '卫星互联网测试链路仿真方案', status: 'success' },
  { id: 'conv-fail-demo', title: 'LEO-08 链路丢包异常（失败示例）', status: 'failed' },
]

function Sidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const [conversations, setConversations] = useState([])
  const [userInfo, setUserInfo] = useState({ name: '用户', avatar: null })

  // 获取最近对话列表
  useEffect(() => {
    api.get('/conversations')
      .then(res => {
        if (res.data && Array.isArray(res.data)) {
          // 最多显示 5 条
          setConversations(res.data.slice(0, 5))
        }
      })
      .catch(() => {
        // API 不可用时使用 mock fallback 列表（含成功 / 失败示例）
        setConversations(MOCK_CONVERSATIONS_FALLBACK)
      })
  }, [])

  // 获取用户信息
  useEffect(() => {
    api.get('/users/me')
      .then(res => {
        if (res.data) {
          setUserInfo({
            name: res.data.name || '用户',
            avatar: res.data.avatar || null,
          })
        }
      })
      .catch(() => {
        // 使用默认值
      })
  }, [])

  // 判断导航菜单是否激活
  const isActiveNav = (path) => location.pathname.startsWith(path)

  return (
    <aside
      className="fixed left-0 top-0 h-screen w-[280px] border-r flex flex-col z-20 transition-colors duration-200"
      style={{
        backgroundColor: 'var(--color-surface)',
        borderColor: 'color-mix(in srgb, var(--color-surface-variant) 50%, transparent)',
      }}
    >
      {/* 品牌头部区域 */}
      <div className="p-6 pb-4">
        <div className="flex items-center gap-3">
          {/* Logo 图标 */}
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'var(--color-primary-container)' }}>
            <span className="material-symbols-outlined text-[22px]" style={{ color: 'var(--color-on-primary-container)', fontVariationSettings: "'FILL' 1" }}>
              robot_2
            </span>
          </div>
          {/* 品牌名称和副标题 */}
          <div className="flex flex-col">
            <span
              className="leading-tight"
              style={{ fontSize: '18px', fontWeight: 600, fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'var(--color-primary)' }}
            >
              卫星互联网运行运维智能体
            </span>
            <span className="text-[12px]" style={{ color: 'var(--color-on-surface-variant)' }}>Intelligent Assistant</span>
          </div>
        </div>
      </div>

      {/* 新建对话 CTA 按钮 */}
      <div className="px-4 pb-4">
        <Link
          to="/chat/new"
          className="flex items-center justify-center gap-2 w-full py-3 rounded-lg text-white font-medium hover:opacity-90 transition-opacity duration-200"
          style={{ backgroundColor: 'var(--color-primary)', boxShadow: '0 4px 14px rgba(61,50,230,0.39)' }}
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          新建对话
        </Link>
      </div>

      {/* 导航菜单 */}
      <nav className="px-3 pb-2">
        <Link
          to="/agents"
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 transition-colors duration-200 border-l-4 ${
            isActiveNav('/agents') ? 'font-medium' : ''
          }`}
          style={isActiveNav('/agents') ? {
            backgroundColor: 'var(--color-surface-container-low)',
            color: 'var(--color-on-surface)',
            borderColor: 'var(--color-primary)',
          } : {
            color: 'var(--color-on-surface-variant)',
            borderColor: 'transparent',
          }}
          onMouseEnter={(e) => { if (!isActiveNav('/agents')) e.currentTarget.style.backgroundColor = 'var(--color-surface-container-low)' }}
          onMouseLeave={(e) => { if (!isActiveNav('/agents')) e.currentTarget.style.backgroundColor = 'transparent' }}
        >
          <span className="material-symbols-outlined text-[20px]">explore</span>
          智能体中心
        </Link>
        <Link
          to="/skills"
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 transition-colors duration-200 border-l-4 ${
            isActiveNav('/skills') ? 'font-medium' : ''
          }`}
          style={isActiveNav('/skills') ? {
            backgroundColor: 'var(--color-surface-container-low)',
            color: 'var(--color-on-surface)',
            borderColor: 'var(--color-primary)',
          } : {
            color: 'var(--color-on-surface-variant)',
            borderColor: 'transparent',
          }}
          onMouseEnter={(e) => { if (!isActiveNav('/skills')) e.currentTarget.style.backgroundColor = 'var(--color-surface-container-low)' }}
          onMouseLeave={(e) => { if (!isActiveNav('/skills')) e.currentTarget.style.backgroundColor = 'transparent' }}
        >
          <span className="material-symbols-outlined text-[20px]">apps</span>
          技能中心
        </Link>
        <Link
          to="/knowledge-base"
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 transition-colors duration-200 border-l-4 ${
            isActiveNav('/knowledge-base') ? 'font-medium' : ''
          }`}
          style={isActiveNav('/knowledge-base') ? {
            backgroundColor: 'var(--color-surface-container-low)',
            color: 'var(--color-on-surface)',
            borderColor: 'var(--color-primary)',
          } : {
            color: 'var(--color-on-surface-variant)',
            borderColor: 'transparent',
          }}
          onMouseEnter={(e) => { if (!isActiveNav('/knowledge-base')) e.currentTarget.style.backgroundColor = 'var(--color-surface-container-low)' }}
          onMouseLeave={(e) => { if (!isActiveNav('/knowledge-base')) e.currentTarget.style.backgroundColor = 'transparent' }}
        >
          <span className="material-symbols-outlined text-[20px]">library_books</span>
          知识库
        </Link>
      </nav>

      {/* 最近对话列表 */}
      <div className="flex-1 overflow-hidden flex flex-col px-3">
        <div className="px-3 pt-4 pb-2">
          <span className="text-[11px] tracking-widest uppercase font-medium" style={{ color: 'var(--color-outline)' }}>
            最近对话 (RECENT)
          </span>
        </div>
        <div className="flex-1 overflow-y-auto no-scrollbar space-y-0.5">
          {conversations.length > 0 ? (
            conversations.map((conv) => {
              const isFailed = conv.status === 'failed'
              const isEmpty = conv.status === 'empty'
              const isCurrentPath = location.pathname === `/chat/${conv.id}`
              return (
                <Link
                  key={conv.id}
                  to={`/chat/${conv.id}`}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors duration-150 border-l-4 ${
                    isCurrentPath ? 'font-medium' : ''
                  }`}
                  style={isCurrentPath ? {
                    backgroundColor: 'var(--color-surface-container-low)',
                    color: 'var(--color-primary)',
                    borderColor: 'var(--color-primary)',
                  } : {
                    color: 'var(--color-on-surface-variant)',
                    borderColor: 'transparent',
                  }}
                  onMouseEnter={(e) => { if (!isCurrentPath) e.currentTarget.style.backgroundColor = 'var(--color-surface-container-low)' }}
                  onMouseLeave={(e) => { if (!isCurrentPath) e.currentTarget.style.backgroundColor = 'transparent' }}
                >
                  {isFailed ? (
                    <span
                      className="material-symbols-outlined text-[16px]"
                      style={{ color: 'var(--color-error)' }}
                      title="失败示例"
                    >
                      error
                    </span>
                  ) : isEmpty ? (
                    <span className="material-symbols-outlined text-[16px] opacity-60">edit_square</span>
                  ) : (
                    <span className="material-symbols-outlined text-[16px] opacity-60">history</span>
                  )}
                  <span className="text-sm truncate flex-1">{conv.title || '未命名对话'}</span>
                  {isFailed && (
                    <span
                      className="font-label-md text-[9px] border rounded px-1 py-0.5 leading-none"
                      style={{ color: 'var(--color-error)', borderColor: 'color-mix(in srgb, var(--color-error) 40%, transparent)' }}
                    >
                      失败
                    </span>
                  )}
                </Link>
              )
            })
          ) : (
            <div className="px-3 py-4 text-sm" style={{ color: 'var(--color-outline)' }}>暂无最近对话</div>
          )}
        </div>
      </div>

      {/* 底部区域：设置 + 用户信息 */}
      <div
        className="p-3 mt-auto border-t transition-colors duration-200"
        style={{ borderColor: 'color-mix(in srgb, var(--color-surface-variant) 50%, transparent)' }}
      >
        <button
          className="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors duration-150 w-full"
          style={{ color: 'var(--color-on-surface-variant)' }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-surface-container-low)'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          <span className="material-symbols-outlined text-[20px]">settings</span>
          <span className="text-sm">设置</span>
        </button>

        <div className="flex items-center gap-3 px-3 py-2 rounded-lg mt-1">
          {/* 用户头像 */}
          {userInfo.avatar ? (
            <img src={userInfo.avatar} alt="" className="w-8 h-8 rounded-full object-cover" />
          ) : (
            <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--color-primary-container)' }}>
              <span className="material-symbols-outlined text-white text-[16px]">person</span>
            </div>
          )}
          {/* 用户名（截断显示） */}
          <span className="text-sm truncate" style={{ color: 'var(--color-on-surface)' }}>{userInfo.name}</span>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar
