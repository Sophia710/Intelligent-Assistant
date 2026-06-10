/**
 * 文件上传弹窗
 *
 * Props:
 *   open      : boolean
 *   onClose   : () => void
 *   onConfirm : (File[]) => void
 *   accept    : string - input accept 字符串
 *   multiple  : boolean
 */
import React, { useRef } from 'react'

export default function FileUploadModal({
  open,
  onClose,
  onConfirm,
  accept = '*/*',
  multiple = true,
}) {
  const inputRef = useRef(null)

  if (!open) return null

  const handlePick = () => inputRef.current?.click()
  const handleChange = (e) => {
    const files = Array.from(e.target.files || [])
    if (files.length) onConfirm(files)
    e.target.value = '' // 允许重复选择同一文件
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl p-6 shadow-2xl"
        style={{
          backgroundColor: 'var(--color-surface-container-lowest)',
          border: '1px solid var(--color-outline-variant)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 mb-1">
          <span
            className="material-symbols-outlined text-[24px]"
            style={{ color: 'var(--color-primary)' }}
          >
            upload_file
          </span>
          <h3 className="text-base font-semibold" style={{ color: 'var(--color-on-surface)' }}>
            上传附件
          </h3>
        </div>
        <p className="text-xs mb-5" style={{ color: 'var(--color-on-surface-variant)' }}>
          支持图片、文档、压缩包等，单个文件最大 20MB
        </p>

        <div
          onClick={handlePick}
          className="border-2 border-dashed rounded-xl py-10 px-4 flex flex-col items-center gap-2 cursor-pointer transition-colors duration-200"
          style={{ borderColor: 'var(--color-outline-variant)' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--color-primary)'
            e.currentTarget.style.backgroundColor =
              'color-mix(in srgb, var(--color-primary) 5%, transparent)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--color-outline-variant)'
            e.currentTarget.style.backgroundColor = 'transparent'
          }}
        >
          <span
            className="material-symbols-outlined text-[40px]"
            style={{ color: 'var(--color-primary)' }}
          >
            cloud_upload
          </span>
          <p className="text-sm" style={{ color: 'var(--color-on-surface)' }}>
            点击选择文件
          </p>
          <p className="text-[11px]" style={{ color: 'var(--color-on-surface-variant)' }}>
            或将文件拖拽到此处
          </p>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          className="hidden"
          onChange={handleChange}
        />

        <div className="flex justify-end mt-4">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-sm transition-colors duration-200"
            style={{
              color: 'var(--color-on-surface-variant)',
              backgroundColor: 'transparent',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-surface-container-low)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
            }}
          >
            取消
          </button>
        </div>
      </div>
    </div>
  )
}
