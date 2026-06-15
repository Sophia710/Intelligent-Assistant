/**
 * 专栏卡片 - 专栏浏览页的网格项
 *
 * Props:
 *   - column: { id, name, description, topic, article_count, subscriber_count, cover_gradient, icon }
 *   - onClick(column): void
 *   - onSubscribe(column): void
 *   - onUnsubscribe(column): void
 */
import ColumnSubscribeButton from './ColumnSubscribeButton'

function ColumnCard({ column, onClick, onSubscribe, onUnsubscribe }) {
  if (!column) return null
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onClick?.(column)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick?.(column)
        }
      }}
      className="rounded-2xl p-4 flex flex-col gap-3 cursor-pointer transition-all duration-200"
      style={{
        backgroundColor: 'var(--color-surface-container-lowest)',
        border: '1px solid var(--color-outline-variant)',
        boxShadow: '0 1px 3px color-mix(in srgb, var(--color-on-surface) 4%, transparent)',
        minHeight: 240,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow =
          '0 8px 24px color-mix(in srgb, var(--color-on-surface) 10%, transparent)'
        e.currentTarget.style.borderColor =
          'color-mix(in srgb, var(--color-primary) 40%, var(--color-outline-variant))'
        e.currentTarget.style.transform = 'translateY(-2px)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow =
          '0 1px 3px color-mix(in srgb, var(--color-on-surface) 4%, transparent)'
        e.currentTarget.style.borderColor = 'var(--color-outline-variant)'
        e.currentTarget.style.transform = 'translateY(0)'
      }}
    >
      {/* 封面占位 */}
      <div
        className="rounded-xl flex items-center justify-center relative overflow-hidden"
        style={{
          height: 110,
          background: column.cover_gradient || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        }}
      >
        <span
          className="material-symbols-outlined"
          style={{ fontSize: 48, color: '#FFFFFF', fontVariationSettings: "'FILL' 1, 'wght' 300" }}
        >
          {column.icon || 'satellite_alt'}
        </span>
        <span
          className="absolute top-2 left-2 text-[10px] font-semibold tracking-wider px-2 py-0.5 rounded"
          style={{
            backgroundColor: 'rgba(255,255,255,0.92)',
            color: 'var(--color-on-surface)',
          }}
        >
          {column.topic}
        </span>
      </div>

      {/* 标题与简介 */}
      <div className="flex-1 min-h-0 flex flex-col gap-1">
        <h3
          className="text-[15px] font-semibold leading-snug truncate transition-colors"
          style={{ color: 'var(--color-on-surface)' }}
          title={column.name}
        >
          {column.name}
        </h3>
        <p
          className="text-[12px] leading-relaxed line-clamp-2"
          style={{
            color: 'var(--color-on-surface-variant)',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {column.description}
        </p>
      </div>

      {/* 统计 + 按钮 */}
      <div className="flex items-center justify-between pt-1">
        <div
          className="flex items-center gap-2.5 text-[11px]"
          style={{ color: 'var(--color-on-surface-variant)' }}
        >
          <span className="inline-flex items-center gap-0.5">
            <span className="material-symbols-outlined" style={{ fontSize: 14 }}>article</span>
            {column.article_count ?? 0} 篇
          </span>
          <span className="inline-flex items-center gap-0.5">
            <span className="material-symbols-outlined" style={{ fontSize: 14 }}>group</span>
            {column.subscriber_count ?? 0} 订阅
          </span>
        </div>
        <ColumnSubscribeButton
          subscribed={!!column.is_subscribed}
          size="sm"
          onSubscribe={() => onSubscribe?.(column)}
          onUnsubscribe={() => onUnsubscribe?.(column)}
        />
      </div>
    </div>
  )
}

export default ColumnCard
