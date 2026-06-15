/**
 * 专栏订阅/退订按钮
 *
 * Props:
 *   - subscribed: boolean
 *   - loading?: boolean
 *   - onSubscribe(): void
 *   - onUnsubscribe(): void
 *   - size?: 'sm' | 'md'
 */
function ColumnSubscribeButton({
  subscribed,
  loading = false,
  onSubscribe,
  onUnsubscribe,
  size = 'md',
}) {
  const isSm = size === 'sm'
  return (
    <button
      type="button"
      disabled={loading}
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        if (loading) return
        if (subscribed) onUnsubscribe?.()
        else onSubscribe?.()
      }}
      className="inline-flex items-center gap-1.5 font-medium rounded-lg transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
      style={{
        backgroundColor: subscribed
          ? 'var(--color-surface-container-high)'
          : 'var(--color-primary)',
        color: subscribed
          ? 'var(--color-on-surface-variant)'
          : 'var(--color-on-primary)',
        border: `1px solid ${
          subscribed ? 'var(--color-outline-variant)' : 'var(--color-primary)'
        }`,
        padding: isSm ? '4px 12px' : '8px 18px',
        fontSize: isSm ? '12px' : '13px',
        boxShadow: subscribed
          ? 'none'
          : '0 2px 6px color-mix(in srgb, var(--color-primary) 25%, transparent)',
      }}
      onMouseEnter={(e) => {
        if (loading) return
        if (subscribed) {
          e.currentTarget.style.backgroundColor = 'var(--color-error-container)'
          e.currentTarget.style.color = 'var(--color-on-error-container)'
          e.currentTarget.style.borderColor = 'var(--color-error)'
        } else {
          e.currentTarget.style.opacity = '0.92'
          e.currentTarget.style.transform = 'translateY(-1px)'
        }
      }}
      onMouseLeave={(e) => {
        if (loading) return
        if (subscribed) {
          e.currentTarget.style.backgroundColor = 'var(--color-surface-container-high)'
          e.currentTarget.style.color = 'var(--color-on-surface-variant)'
          e.currentTarget.style.borderColor = 'var(--color-outline-variant)'
        } else {
          e.currentTarget.style.opacity = '1'
          e.currentTarget.style.transform = 'translateY(0)'
        }
      }}
      title={subscribed ? '点击取消订阅' : '订阅此专栏'}
    >
      {loading ? (
        <>
          <span
            className="material-symbols-outlined animate-spin"
            style={{ fontSize: isSm ? 14 : 16 }}
          >progress_activity</span>
          {isSm ? '处理中' : '处理中'}
        </>
      ) : subscribed ? (
        <>
          <span className="material-symbols-outlined" style={{ fontSize: isSm ? 14 : 16 }}>check</span>
          {isSm ? '已订阅' : '已订阅'}
        </>
      ) : (
        <>
          <span className="material-symbols-outlined" style={{ fontSize: isSm ? 14 : 16 }}>add</span>
          {isSm ? '订阅' : '订阅'}
        </>
      )}
    </button>
  )
}

export default ColumnSubscribeButton
