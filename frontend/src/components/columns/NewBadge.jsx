/**
 * "最新" 红点徽章
 *
 * Props:
 *   - size: 'sm' | 'md'  (默认 sm)
 *   - label: string      (默认 "最新")
 */
function NewBadge({ size = 'sm', label = '最新' }) {
  const isSm = size === 'sm'
  return (
    <span
      className="inline-flex items-center gap-1 font-semibold rounded-full"
      style={{
        backgroundColor: 'var(--color-error)',
        color: '#FFFFFF',
        fontSize: isSm ? '10px' : '11px',
        padding: isSm ? '2px 8px' : '3px 10px',
        lineHeight: 1.2,
        boxShadow: '0 1px 4px color-mix(in srgb, var(--color-error) 35%, transparent)',
      }}
    >
      <span
        className="rounded-full animate-pulse"
        style={{
          width: isSm ? 5 : 6,
          height: isSm ? 5 : 6,
          backgroundColor: '#FFFFFF',
        }}
      />
      {label}
    </span>
  )
}

export default NewBadge
