/**
 * TopBar 专栏通知铃铛
 *
 * - 读取 ColumnNotificationContext 中的 totalUnread
 * - 数字 ≥ 99 显示 99+
 * - 点击展开/收起 ColumnNotificationPanel
 */
import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useColumnNotification } from '../../contexts/ColumnNotificationContext'
import ColumnNotificationPanel from './ColumnNotificationPanel'

function ColumnNotificationBell() {
  const { totalUnread, loading } = useColumnNotification()
  const [open, setOpen] = useState(false)
  const [unreadAnimated, setUnreadAnimated] = useState(false)
  const wrapRef = useRef(null)
  const navigate = useNavigate()

  // 点击外部关闭
  useEffect(() => {
    if (!open) return
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  // 数字变化时触发一次脉冲
  useEffect(() => {
    if (totalUnread > 0) {
      setUnreadAnimated(true)
      const t = setTimeout(() => setUnreadAnimated(false), 600)
      return () => clearTimeout(t)
    }
  }, [totalUnread])

  const display = totalUnread > 99 ? '99+' : totalUnread

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="p-2 rounded-lg relative transition-colors duration-150"
        style={{ color: 'var(--color-on-surface-variant)' }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = 'var(--color-primary)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = 'var(--color-on-surface-variant)'
        }}
        title="专栏通知"
        aria-label="专栏通知"
      >
        <span className="material-symbols-outlined text-[22px]">newspaper</span>
        {totalUnread > 0 && (
          <span
            className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] rounded-full flex items-center justify-center text-[10px] font-semibold text-white px-1"
            style={{
              backgroundColor: 'var(--color-error)',
              boxShadow: '0 0 0 2px var(--color-surface)',
              animation: unreadAnimated ? 'bell-pulse 0.6s ease-out' : undefined,
            }}
          >
            {loading ? '·' : display}
          </span>
        )}
      </button>
      {open && (
        <ColumnNotificationPanel
          onClose={() => setOpen(false)}
          onViewAll={() => {
            setOpen(false)
            navigate('/columns/my-subscriptions')
          }}
        />
      )}
    </div>
  )
}

export default ColumnNotificationBell
