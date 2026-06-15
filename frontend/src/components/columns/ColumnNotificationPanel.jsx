/**
 * 专栏通知中心 Popover
 *
 * 显示当前用户已订阅专栏的文章流(按 published_at 倒序)
 *
 * Props:
 *   - onClose(): void
 *   - onViewAll(): void   - "查看全部" 跳转
 */
import { useNavigate } from 'react-router-dom'
import { useColumnNotification } from '../../contexts/ColumnNotificationContext'
import NewBadge from './NewBadge'

function formatDate(iso) {
  try {
    const d = new Date(iso)
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${m}-${day}`
  } catch {
    return ''
  }
}

function ColumnNotificationPanel({ onClose, onViewAll }) {
  const { feed, loading, markOneRead, markAllRead, totalUnread } = useColumnNotification()
  const navigate = useNavigate()

  const handleItemClick = async (article) => {
    await markOneRead(article.id)
    onClose?.()
    if (article.column?.id) {
      navigate(`/columns/${article.column.id}/articles/${article.id}`)
    }
  }

  return (
    <div
      className="absolute right-0 mt-2 w-[360px] max-h-[480px] flex flex-col rounded-2xl overflow-hidden z-50"
      style={{
        top: '100%',
        backgroundColor: 'var(--color-surface-container-lowest)',
        border: '1px solid var(--color-outline-variant)',
        boxShadow: '0 12px 40px color-mix(in srgb, var(--color-on-surface) 18%, transparent)',
        animation: 'column-panel-in 180ms ease-out',
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* 头部 */}
      <div
        className="flex items-center justify-between px-4 py-3 border-b"
        style={{ borderColor: 'var(--color-outline-variant)' }}
      >
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined" style={{ color: 'var(--color-primary)' }}>newspaper</span>
          <span className="text-sm font-semibold" style={{ color: 'var(--color-on-surface)' }}>
            专栏更新
          </span>
          {totalUnread > 0 && (
            <span
              className="text-[10px] font-semibold rounded-full px-1.5 py-0.5"
              style={{
                backgroundColor: 'var(--color-error)',
                color: '#FFFFFF',
              }}
            >
              {totalUnread > 99 ? '99+' : totalUnread} 未读
            </span>
          )}
        </div>
        {totalUnread > 0 && (
          <button
            type="button"
            onClick={() => markAllRead()}
            className="text-[11px] font-medium px-2 py-0.5 rounded"
            style={{ color: 'var(--color-primary)' }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-surface-container)' }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
          >
            全部已读
          </button>
        )}
      </div>

      {/* 列表 */}
      <div className="flex-1 overflow-y-auto">
        {loading && feed.length === 0 ? (
          <div className="px-4 py-8 text-center text-[12px]" style={{ color: 'var(--color-on-surface-variant)' }}>
            加载中...
          </div>
        ) : feed.length === 0 ? (
          <div className="px-4 py-10 flex flex-col items-center gap-2">
            <span className="material-symbols-outlined" style={{ fontSize: 36, color: 'var(--color-outline)' }}>
              notifications_off
            </span>
            <div className="text-[12px]" style={{ color: 'var(--color-on-surface-variant)' }}>
              暂无更新
            </div>
            <button
              type="button"
              onClick={() => {
                onClose?.()
                navigate('/columns')
              }}
              className="text-[12px] font-medium px-3 py-1.5 rounded-lg"
              style={{
                backgroundColor: 'var(--color-primary)',
                color: 'var(--color-on-primary)',
              }}
            >
              去专栏市场逛逛
            </button>
          </div>
        ) : (
          <ul className="flex flex-col">
            {feed.map((article) => (
              <li
                key={article.id}
                onClick={() => handleItemClick(article)}
                className="px-4 py-3 flex flex-col gap-1 cursor-pointer border-b transition-colors"
                style={{
                  borderColor: 'var(--color-outline-variant)',
                  backgroundColor: article.is_new ? 'var(--color-surface-container-low)' : 'transparent',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-surface-container)' }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = article.is_new ? 'var(--color-surface-container-low)' : 'transparent' }}
              >
                <div className="flex items-center gap-2 text-[10px]" style={{ color: 'var(--color-on-surface-variant)' }}>
                  {article.is_new && <NewBadge size="sm" />}
                  {article.column && (
                    <span
                      className="px-1.5 py-0.5 rounded text-[10px] font-semibold"
                      style={{
                        backgroundColor: 'var(--color-surface-container-high)',
                        color: 'var(--color-on-surface)',
                      }}
                    >
                      {article.column.topic || article.column.name}
                    </span>
                  )}
                  <span>{formatDate(article.published_at)}</span>
                </div>
                <div
                  className="text-[12px] font-semibold leading-snug line-clamp-2"
                  style={{
                    color: 'var(--color-on-surface)',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {article.title}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* 底部 */}
      {feed.length > 0 && (
        <button
          type="button"
          onClick={() => onViewAll?.()}
          className="text-center py-2.5 text-[12px] font-medium border-t"
          style={{
            borderColor: 'var(--color-outline-variant)',
            color: 'var(--color-primary)',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-surface-container)' }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
        >
          查看全部 →
        </button>
      )}
    </div>
  )
}

export default ColumnNotificationPanel
