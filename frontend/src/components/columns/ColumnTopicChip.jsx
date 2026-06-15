/**
 * 专栏主题标签 Chip
 *
 * Props:
 *   - topic: string
 *   - active?: boolean
 *   - onClick?: () => void
 */
function ColumnTopicChip({ topic, active = false, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1 rounded-full transition-all duration-150"
      style={{
        backgroundColor: active
          ? 'var(--color-primary)'
          : 'var(--color-surface-container-low)',
        color: active ? 'var(--color-on-primary)' : 'var(--color-on-surface-variant)',
        border: `1px solid ${
          active ? 'var(--color-primary)' : 'var(--color-outline-variant)'
        }`,
        padding: '4px 12px',
        fontSize: '12px',
        fontWeight: 500,
      }}
      onMouseEnter={(e) => {
        if (!active) {
          e.currentTarget.style.borderColor = 'color-mix(in srgb, var(--color-primary) 50%, var(--color-outline-variant))'
          e.currentTarget.style.color = 'var(--color-on-surface)'
        }
      }}
      onMouseLeave={(e) => {
        if (!active) {
          e.currentTarget.style.borderColor = 'var(--color-outline-variant)'
          e.currentTarget.style.color = 'var(--color-on-surface-variant)'
        }
      }}
    >
      <span className="material-symbols-outlined" style={{ fontSize: 14 }}>label</span>
      {topic}
    </button>
  )
}

export default ColumnTopicChip
