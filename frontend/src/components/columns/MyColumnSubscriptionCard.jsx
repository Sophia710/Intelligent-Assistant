/**
 * 我的订阅页卡片
 *
 * Props:
 *   - subscription: SubscriptionWithColumn (含 column, unread_count, latest_articles)
 *   - onViewColumn(): void
 *   - onUnsubscribe(): void
 *   - onReadArticle(article): void
 */
import NewBadge from './NewBadge'

function formatDate(iso) {
  try {
    const d = new Date(iso)
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
  } catch {
    return ''
  }
}

function MyColumnSubscriptionCard({
  subscription,
  onViewColumn,
  onUnsubscribe,
  onReadArticle,
}) {
  if (!subscription || !subscription.column) return null
  const { column, subscribed_at, unread_count, latest_articles = [] } = subscription
  return (
    <div
      className="rounded-2xl p-5 flex flex-col gap-4"
      style={{
        backgroundColor: 'var(--color-surface-container-lowest)',
        border: '1px solid var(--color-outline-variant)',
        boxShadow: '0 1px 3px color-mix(in srgb, var(--color-on-surface) 4%, transparent)',
      }}
    >
      {/* 头部:封面 + 信息 + 操作 */}
      <div className="flex items-start gap-4">
        <div
          className="rounded-xl flex items-center justify-center shrink-0"
          style={{
            width: 64,
            height: 64,
            background: column.cover_gradient || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          }}
        >
          <span
            className="material-symbols-outlined"
            style={{ fontSize: 32, color: '#FFFFFF', fontVariationSettings: "'FILL' 1, 'wght' 300" }}
          >
            {column.icon || 'satellite_alt'}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3
              className="text-[16px] font-semibold"
              style={{ color: 'var(--color-on-surface)' }}
            >
              {column.name}
            </h3>
            {unread_count > 0 && <NewBadge size="sm" label={`${unread_count} 篇未读`} />}
          </div>
          <div
            className="mt-1.5 flex items-center gap-3 text-[12px] flex-wrap"
            style={{ color: 'var(--color-on-surface-variant)' }}
          >
            <span className="inline-flex items-center gap-0.5">
              <span className="material-symbols-outlined" style={{ fontSize: 14 }}>label</span>
              {column.topic}
            </span>
            <span>·</span>
            <span className="inline-flex items-center gap-0.5">
              <span className="material-symbols-outlined" style={{ fontSize: 14 }}>group</span>
              {column.subscriber_count ?? 0} 订阅
            </span>
            <span>·</span>
            <span className="inline-flex items-center gap-0.5">
              <span className="material-symbols-outlined" style={{ fontSize: 14 }}>article</span>
              {column.article_count ?? 0} 篇
            </span>
            <span>·</span>
            <span>订阅于 {formatDate(subscribed_at)}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onViewColumn}
            className="px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all duration-150"
            style={{
              backgroundColor: 'var(--color-primary)',
              color: 'var(--color-on-primary)',
              border: '1px solid var(--color-primary)',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.9' }}
            onMouseLeave={(e) => { e.currentTarget.style.opacity = '1' }}
          >
            查看专栏
          </button>
          <button
            type="button"
            onClick={onUnsubscribe}
            className="px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all duration-150"
            style={{
              backgroundColor: 'transparent',
              color: 'var(--color-on-surface-variant)',
              border: '1px solid var(--color-outline-variant)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--color-error)'
              e.currentTarget.style.borderColor = 'var(--color-error)'
              e.currentTarget.style.backgroundColor = 'var(--color-error-container)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--color-on-surface-variant)'
              e.currentTarget.style.borderColor = 'var(--color-outline-variant)'
              e.currentTarget.style.backgroundColor = 'transparent'
            }}
          >
            退订
          </button>
        </div>
      </div>

      {/* 最近更新 */}
      <div
        className="rounded-lg p-3 flex flex-col gap-2"
        style={{ backgroundColor: 'var(--color-surface-container)' }}
      >
        <div
          className="text-[11px] tracking-widest uppercase font-medium"
          style={{ color: 'var(--color-outline)' }}
        >
          最近更新
        </div>
        {latest_articles.length === 0 ? (
          <div
            className="text-[12px]"
            style={{ color: 'var(--color-on-surface-variant)' }}
          >
            暂无文章
          </div>
        ) : (
          <ul className="flex flex-col gap-1.5">
            {latest_articles.map((a) => (
              <li
                key={a.id}
                className="flex items-center gap-2 text-[12px] cursor-pointer"
                style={{ color: 'var(--color-on-surface)' }}
                onClick={() => onReadArticle?.(a)}
              >
                {a.is_new ? (
                  <NewBadge size="sm" />
                ) : (
                  <span
                    className="inline-block w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: 'var(--color-outline)' }}
                  />
                )}
                <span className="truncate" style={{ color: 'var(--color-on-surface-variant)' }}>{formatDate(a.published_at)}</span>
                <span className="truncate flex-1">{a.title}</span>
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: 14, color: 'var(--color-outline)' }}
                >chevron_right</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

export default MyColumnSubscriptionCard
