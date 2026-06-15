/**
 * 专栏文章列表项
 *
 * Props:
 *   - article: ColumnArticle (with is_new)
 *   - onClick(article): void
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

function ColumnArticleListItem({ article, onClick }) {
  if (!article) return null
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onClick?.(article)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick?.(article)
        }
      }}
      className="flex flex-col gap-2 p-4 rounded-xl cursor-pointer transition-colors duration-150"
      style={{
        backgroundColor: 'var(--color-surface-container-lowest)',
        border: '1px solid var(--color-outline-variant)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = 'var(--color-surface-container-low)'
        e.currentTarget.style.borderColor = 'color-mix(in srgb, var(--color-primary) 30%, var(--color-outline-variant))'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'var(--color-surface-container-lowest)'
        e.currentTarget.style.borderColor = 'var(--color-outline-variant)'
      }}
    >
      <div className="flex items-center gap-2 text-[11px]" style={{ color: 'var(--color-on-surface-variant)' }}>
        {article.is_new && <NewBadge size="sm" />}
        <span>{formatDate(article.published_at)}</span>
        <span>·</span>
        <span className="inline-flex items-center gap-0.5">
          <span className="material-symbols-outlined" style={{ fontSize: 12 }}>schedule</span>
          {article.read_minutes ?? 5} min read
        </span>
        {article.column && (
          <>
            <span>·</span>
            <span className="inline-flex items-center gap-0.5">
              <span className="material-symbols-outlined" style={{ fontSize: 12 }}>topic</span>
              {article.column.name || article.column.topic}
            </span>
          </>
        )}
      </div>
      <h4
        className="text-[15px] font-semibold leading-snug"
        style={{ color: 'var(--color-on-surface)' }}
      >
        {article.title}
      </h4>
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
        {article.summary}
      </p>
    </div>
  )
}

export default ColumnArticleListItem
