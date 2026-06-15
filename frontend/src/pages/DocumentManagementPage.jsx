/**
 * 文档管理页面 (05-文档管理)
 *
 * 功能：作为某个知识库内部的文档管理界面。
 * 路由：/knowledge-base/:id/documents
 *
 * 包含：
 * - 面包屑导航 + 返回按钮
 * - 4 宫格统计卡片
 * - 文档列表表格（含解析状态）
 * - 分页控件
 * - 上传文件弹窗
 * - 文档预览右侧抽屉
 */
import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import useDocuments from '../hooks/useDocuments'
import api from '../services/api'

// 解析状态配置 — 使用 CSS 变量统一适配
const PARSE_STATUS_CONFIG = {
  completed: {
    label: '已完成',
    dotColorVar: 'green-500',
    textColorVar: '--color-on-surface',
    bgColorVar: '--color-surface-container',
    borderColorVar: '--color-outline-variant',
    dotStatic: true,
  },
  parsing: {
    label: '解析中',
    dotColorVar: 'amber-500',
    textColorVar: '--color-on-surface',
    bgColorVar: '--color-surface-container-high',
    borderColorVar: '--color-outline-variant',
    dotStatic: false,
  },
  failed: {
    label: '解析失败',
    dotColorVar: '--color-error',
    textColorVar: '--color-error',
    bgColorVar: 'color-mix(in srgb, var(--color-error) 10%, transparent)',
    borderColorVar: 'color-mix(in srgb, var(--color-error) 30%, transparent)',
    dotStatic: true,
  },
}

export default function DocumentManagementPage() {
  const { id: kbId } = useParams()
  const navigate = useNavigate()
  const { documents, rawStats, loading, uploadDocument, deleteDocument, reparseDocument } = useDocuments(kbId)

  // ===== State(必须先于 useEffect,避免 linter 警告)=====
  const [kbName, setKbName] = useState('')
  const [searchKeyword, setSearchKeyword] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewContent, setPreviewContent] = useState(null)
  const pageSize = 10

  // 从 API 加载知识库名称,用于动态标题 + 面包屑
  useEffect(() => {
    let cancelled = false
    const loadKB = async () => {
      try {
        const res = await api.get(`/knowledge-bases/${kbId}`)
        if (!cancelled) {
          const name = res?.data?.name ?? res?.name ?? ''
          setKbName(name)
        }
      } catch (err) {
        console.error('获取知识库详情失败:', err)
        if (!cancelled) {
          setKbName('文档管理')
        }
      }
    }
    if (kbId) loadKB()
    return () => { cancelled = true }
  }, [kbId])

  // 同步 KB 名称到 document.title（影响浏览器标签与 TopBar 兜底）
  useEffect(() => {
    if (kbName) {
      document.title = `${kbName} - 知识库管理`
      window.dispatchEvent(new CustomEvent('page-context-update', { detail: { breadcrumbLeaf: kbName } }))
    }
    return () => {
      window.dispatchEvent(new CustomEvent('page-context-update', { detail: { breadcrumbLeaf: null } }))
    }
  }, [kbName])

  // 从文档列表聚合计算统计面板数据
  const stats = {
    totalDocs: documents.length || rawStats?.total || 0,
    completedCount: documents.filter(d => d.parse_status === 'completed').length || rawStats?.completed || 0,
    parsingCount: documents.filter(d => d.parse_status === 'parsing').length || rawStats?.parsing || 0,
    usedStorage: rawStats?.storageUsed || '4.2 GB',
  }

  // 过滤文档
  const filteredDocs = searchKeyword.trim()
    ? documents.filter(d => d.filename.includes(searchKeyword))
    : documents

  // 分页数据
  const totalPages = Math.ceil(filteredDocs.length / pageSize)
  const paginatedDocs = filteredDocs.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  // 打开预览抽屉
  const handlePreview = async (doc) => {
    try {
      const res = await api.get(`/documents/${doc.id}/preview`)
      const content = res?.data?.content ?? res?.content ?? ''
      setPreviewContent({ ...doc, content })
      setPreviewOpen(true)
    } catch (err) {
      console.error('获取预览失败:', err)
    }
  }

  // 关闭预览抽屉
  const closePreview = () => {
    setPreviewOpen(false)
    setTimeout(() => setPreviewContent(null), 500)
  }

  // 上传处理
  const handleUpload = async (file) => {
    await uploadDocument(file)
    setShowUploadModal(false)
  }

  // 获取文件格式配置
  const getFormatConfig = (format) => {
    if (format === 'pdf') return { icon: 'picture_as_pdf', iconColor: 'var(--color-error)' }
    if (format === 'docx') return { icon: 'article', iconColor: 'var(--color-primary)' }
    return { icon: 'text_snippet', iconColor: 'var(--color-on-surface-variant)' }
  }

  // 获取解析状态配置
  const getStatusConfig = (status) => PARSE_STATUS_CONFIG[status] || PARSE_STATUS_CONFIG.completed

  return (
    <main
      className="flex-1 min-w-0 flex flex-col pt-24 pb-10 px-4 md:px-10 max-w-[1600px] mx-auto w-full transition-colors duration-200"
      style={{ backgroundColor: 'var(--color-background)' }}
    >
      {/* 头部操作栏 — 同行布局:返回按钮(左) + 搜索/上传(右) */}
      <section className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3 mb-8">
        {/* 返回按钮(美化:描边+背景+阴影 hover,与设计规范统一) */}
        <button
          onClick={() => navigate('/knowledge-base')}
          className="group inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-[13px] font-medium transition-all duration-200 active:scale-[0.97] shrink-0"
          style={{
            color: 'var(--color-on-surface)',
            backgroundColor: 'var(--color-surface-container-lowest)',
            border: '1px solid var(--color-outline-variant)',
            boxShadow: '0 1px 2px color-mix(in srgb, var(--color-on-surface) 4%, transparent)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'var(--color-primary)'
            e.currentTarget.style.borderColor = 'var(--color-primary)'
            e.currentTarget.style.backgroundColor = 'color-mix(in srgb, var(--color-primary) 8%, transparent)'
            e.currentTarget.style.boxShadow = '0 2px 6px color-mix(in srgb, var(--color-primary) 18%, transparent)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--color-on-surface)'
            e.currentTarget.style.borderColor = 'var(--color-outline-variant)'
            e.currentTarget.style.backgroundColor = 'var(--color-surface-container-lowest)'
            e.currentTarget.style.boxShadow = '0 1px 2px color-mix(in srgb, var(--color-on-surface) 4%, transparent)'
          }}
        >
          <span className="material-symbols-outlined text-[18px] transition-transform duration-200 group-hover:-translate-x-0.5">arrow_back</span>
          返回列表
        </button>

        {/* 搜索 + 上传 */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* 搜索框 */}
          <div className="relative flex-1 md:w-80">
            <span
              className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-lg transition-colors duration-200"
              style={{ color: 'var(--color-outline)' }}
            >search</span>
            <input
              className="w-full pl-10 pr-4 py-2 rounded-lg text-sm outline-none transition-all duration-200"
              style={{
                backgroundColor: 'var(--color-surface-container)',
                color: 'var(--color-on-surface)',
                border: '1px solid var(--color-outline-variant)',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-primary)'
                e.currentTarget.style.boxShadow = '0 0 0 2px color-mix(in srgb, var(--color-primary) 20%, transparent)'
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-outline-variant)'
                e.currentTarget.style.boxShadow = 'none'
              }}
              placeholder="搜索文件名或关键字..."
              type="text"
              value={searchKeyword}
              onChange={(e) => { setSearchKeyword(e.target.value); setCurrentPage(1) }}
            />
          </div>

          {/* 上传按钮 */}
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-2 text-white px-4 py-2.5 rounded-lg text-xs hover:shadow-lg transition-all duration-200 active:scale-[0.98]"
            style={{
              backgroundColor: 'var(--color-primary)',
              boxShadow: '0 4px 14px color-mix(in srgb, var(--color-primary) 25%, transparent)',
            }}
          >
            <span className="material-symbols-outlined text-lg">upload_file</span>
            上传文件
          </button>
        </div>
      </section>

      {/* 统计卡片 4宫格 */}
      {!loading && stats && (
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {[
            { icon: 'description', label: '总文档数', value: stats.totalDocs, colorVar: '--color-primary', bgVar: '--color-primary' },
            { icon: 'check_circle', label: '解析成功', value: stats.completedCount ?? '-', colorVar: 'green-500', bgVar: 'green-500' },
            { icon: 'sync', label: '正在解析', value: stats.parsingCount ?? '-', colorVar: 'amber-500', bgVar: 'amber-500' },
            { icon: 'storage', label: '已用存储', value: `${stats.usedStorage ?? '4.2'} GB`, colorVar: '--color-on-secondary-container', bgVar: '--color-secondary-container' },
          ].map((stat, i) => (
            <div
              key={i}
              className="p-5 rounded-xl flex items-start gap-4 transition-colors duration-200"
              style={{
                backgroundColor: 'var(--color-surface-container-lowest)',
                border: '1px solid var(--color-outline-variant)',
                boxShadow: '0 1px 3px color-mix(in srgb, var(--color-on-surface) 4%, transparent)',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'color-mix(in srgb, var(--color-primary) 30%, transparent)' }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--color-outline-variant)' }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors duration-200"
                style={{
                  backgroundColor: stat.colorVar.startsWith('--')
                    ? `color-mix(in srgb, var(${stat.colorVar}) 12%, transparent)`
                    : `color-mix(in srgb, var(--color-${stat.colorVar.replace('-500', '')}-500) 12%, transparent)`,
                }}
              >
                <span
                  className="material-symbols-outlined transition-colors duration-200"
                  style={{ color: stat.colorVar.startsWith('--') ? `var(${stat.colorVar})` : `var(--color-${stat.colorVar.replace('-500', '')}-500)` }}
                >{stat.icon}</span>
              </div>
              <div>
                <p
                  className="text-xs transition-colors duration-200"
                  style={{ color: 'var(--color-on-surface-variant)' }}
                >{stat.label}</p>
                <p
                  className="text-xl font-bold mt-1 transition-colors duration-200"
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'var(--color-on-surface)' }}
                >{stat.value}</p>
              </div>
            </div>
          ))}
        </section>
      )}

      {/* 文档表格区域 */}
      <section className="flex-1 flex flex-col gap-5 min-h-0">
        <div
          className="rounded-xl overflow-hidden flex flex-col h-full transition-colors duration-200"
          style={{
            backgroundColor: 'var(--color-surface-container-lowest)',
            border: '1px solid var(--color-outline-variant)',
            boxShadow: '0 1px 3px color-mix(in srgb, var(--color-on-surface) 4%, transparent)',
          }}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead style={{ backgroundColor: 'var(--color-surface-container)' }}>
                <tr style={{ borderBottom: '1px solid var(--color-surface-variant)' }}>
                  <th className="px-5 py-4 text-xs font-medium transition-colors duration-200" style={{ color: 'var(--color-on-surface-variant)' }}>文件名</th>
                  <th className="px-4 py-4 text-xs font-medium text-center transition-colors duration-200" style={{ color: 'var(--color-on-surface-variant)' }}>格式</th>
                  <th className="px-4 py-4 text-xs font-medium transition-colors duration-200" style={{ color: 'var(--color-on-surface-variant)' }}>上传时间</th>
                  <th className="px-4 py-4 text-xs font-medium transition-colors duration-200" style={{ color: 'var(--color-on-surface-variant)' }}>解析状态</th>
                  <th className="px-5 py-4 text-xs font-medium text-right transition-colors duration-200" style={{ color: 'var(--color-on-surface-variant)' }}>操作</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="text-center py-12">
                      <div
                        className="animate-spin w-8 h-8 border-3 rounded-full mx-auto"
                        style={{
                          borderColor: 'var(--color-surface-variant)',
                          borderTopColor: 'var(--color-primary)',
                        }}
                      ></div>
                    </td>
                  </tr>
                ) : paginatedDocs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-12 text-sm transition-colors duration-200" style={{ color: 'var(--color-on-surface-variant)' }}>暂无文档</td>
                  </tr>
                ) : (
                  paginatedDocs.map(doc => {
                    const statusConfig = getStatusConfig(doc.parse_status)
                    const fmtConfig = getFormatConfig(doc.format)
                    const isDisabled = doc.parse_status === 'parsing'

                    return (
                      <tr
                        key={doc.id}
                        className="transition-colors group"
                        style={{ borderBottom: '1px solid color-mix(in srgb, var(--color-surface-variant) 50%, transparent)' }}
                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-surface-container)' }}
                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
                      >
                        {/* 文件名 */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-10 h-10 rounded-lg flex items-center justify-center transition-colors duration-200"
                              style={{ backgroundColor: 'var(--color-surface-container-high)' }}
                            >
                              <span className="material-symbols-outlined" style={{ color: fmtConfig.iconColor }}>{fmtConfig.icon}</span>
                            </div>
                            <span className="text-sm font-semibold transition-colors duration-200" style={{ color: 'var(--color-on-surface)' }}>{doc.filename}</span>
                          </div>
                        </td>

                        {/* 格式 */}
                        <td className="px-4 py-4 text-center">
                          <span
                            className="px-2 py-1 rounded text-[10px] font-bold uppercase transition-colors duration-200"
                            style={{
                              backgroundColor: 'var(--color-surface-container-high)',
                              color: 'var(--color-on-surface-variant)',
                            }}
                          >
                            {doc.format?.toUpperCase()}
                          </span>
                        </td>

                        {/* 上传时间 */}
                        <td className="px-4 py-4 text-sm transition-colors duration-200" style={{ color: 'var(--color-on-surface-variant)' }}>{formatTime(doc.upload_time)}</td>

                        {/* 解析状态 */}
                        <td className="px-4 py-4">
                          <span
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-colors duration-200"
                            style={{
                              backgroundColor: statusConfig.bgColorVar.startsWith('color-mix')
                                ? statusConfig.bgColorVar
                                : `var(${statusConfig.bgColorVar})`,
                              color: statusConfig.textColorVar.startsWith('--') ? `var(${statusConfig.textColorVar})` : statusConfig.textColorVar,
                              border: `1px solid ${statusConfig.borderColorVar.startsWith('color-mix') ? statusConfig.borderColorVar : `var(${statusConfig.borderColorVar})`}`,
                            }}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${!statusConfig.dotStatic ? 'animate-pulse' : ''}`}
                              style={{
                                backgroundColor: statusConfig.dotColorVar.startsWith('--')
                                  ? `var(${statusConfig.dotColorVar})`
                                  : statusConfig.dotColorVar,
                              }}
                            ></span>
                            {statusConfig.label}
                          </span>
                        </td>

                        {/* 操作按钮 */}
                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {/* 预览 */}
                            <button
                              onClick={() => !isDisabled && handlePreview(doc)}
                              disabled={isDisabled}
                              className="transition-colors p-1"
                              style={{
                                color: isDisabled ? 'var(--color-outline-variant)' : 'var(--color-on-surface-variant)',
                                opacity: isDisabled ? 0.4 : 1,
                                cursor: isDisabled ? 'not-allowed' : 'pointer',
                              }}
                              onMouseEnter={(e) => { if (!isDisabled) e.currentTarget.style.color = 'var(--color-primary)' }}
                              onMouseLeave={(e) => { if (!isDisabled) e.currentTarget.style.color = 'var(--color-on-surface-variant)' }}
                              title="预览"
                            >
                              <span className="material-symbols-outlined text-lg">visibility</span>
                            </button>

                            {/* 重新解析 */}
                            <button
                              onClick={() => reparseDocument(doc.id)}
                              disabled={isDisabled}
                              className="transition-colors p-1"
                              style={{
                                color: isDisabled ? 'var(--color-outline-variant)' : 'var(--color-on-surface-variant)',
                                opacity: isDisabled ? 0.4 : 1,
                                cursor: isDisabled ? 'not-allowed' : 'pointer',
                              }}
                              onMouseEnter={(e) => { if (!isDisabled) e.currentTarget.style.color = 'var(--color-tertiary)' }}
                              onMouseLeave={(e) => { if (!isDisabled) e.currentTarget.style.color = 'var(--color-on-surface-variant)' }}
                              title="重新解析"
                            >
                              <span className="material-symbols-outlined text-lg">refresh</span>
                            </button>

                            {/* 删除 */}
                            <button
                              onClick={() => deleteDocument(doc.id)}
                              className="transition-colors p-1"
                              style={{ color: 'var(--color-on-surface-variant)' }}
                              onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-error)' }}
                              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-on-surface-variant)' }}
                              title="删除"
                            >
                              <span className="material-symbols-outlined text-lg">delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* 分页 */}
          {filteredDocs.length > 0 && (
            <div
              className="mt-auto px-5 py-3 flex items-center justify-between"
              style={{ borderTop: '1px solid var(--color-surface-variant)' }}
            >
              <p className="text-xs transition-colors duration-200" style={{ color: 'var(--color-on-surface-variant)' }}>
                显示 {(currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, filteredDocs.length)} / 共 {filteredDocs.length} 条记录
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage <= 1}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-sm transition-colors disabled:opacity-50"
                  style={{
                    border: '1px solid var(--color-outline-variant)',
                    color: 'var(--color-on-surface-variant)',
                  }}
                  onMouseEnter={(e) => { if (currentPage > 1) e.currentTarget.style.backgroundColor = 'var(--color-surface-container)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
                >
                  <span className="material-symbols-outlined text-lg">chevron_left</span>
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-xs font-medium transition-colors"
                    style={
                      currentPage === page
                        ? { backgroundColor: 'var(--color-primary)', color: 'var(--color-on-primary)' }
                        : {
                            border: '1px solid var(--color-outline-variant)',
                            color: 'var(--color-on-surface-variant)',
                          }
                    }
                    onMouseEnter={(e) => {
                      if (currentPage !== page) e.currentTarget.style.backgroundColor = 'var(--color-surface-container)'
                    }}
                    onMouseLeave={(e) => {
                      if (currentPage !== page) e.currentTarget.style.backgroundColor = 'transparent'
                    }}
                  >
                    {page}
                  </button>
                ))}

                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage >= totalPages}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-sm transition-colors disabled:opacity-50"
                  style={{
                    border: '1px solid var(--color-outline-variant)',
                    color: 'var(--color-on-surface-variant)',
                  }}
                  onMouseEnter={(e) => { if (currentPage < totalPages) e.currentTarget.style.backgroundColor = 'var(--color-surface-container)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
                >
                  <span className="material-symbols-outlined text-lg">chevron_right</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ========== 上传弹窗 ========== */}
      {showUploadModal && (
        <UploadModal onClose={() => setShowUploadModal(false)} onUpload={handleUpload} />
      )}

      {/* ========== 预览抽屉 ========== */}
      <div
        className={`fixed top-0 right-0 h-screen w-full md:w-[600px] z-40 transition-transform duration-500 ease-out flex flex-col ${
          previewOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{
          backgroundColor: 'var(--color-surface-container-lowest)',
          boxShadow: '-20px 0 50px color-mix(in srgb, var(--color-on-surface) 15%, transparent)',
        }}
      >
        {previewContent && (
          <>
            {/* 抽屉头部 */}
            <div
              className="h-16 flex items-center justify-between px-6 backdrop-blur-md transition-colors duration-200"
              style={{
                backgroundColor: 'color-mix(in srgb, var(--color-surface-container-lowest) 80%, transparent)',
                borderBottom: '1px solid var(--color-surface-variant)',
              }}
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined" style={{ color: 'var(--color-error)' }}>
                  {getFormatConfig(previewContent.format).icon}
                </span>
                <span className="text-sm font-semibold truncate max-w-[300px]" style={{ color: 'var(--color-on-surface)' }}>{previewContent.filename}</span>
              </div>
              <button
                onClick={closePreview}
                className="material-symbols-outlined text-[24px] transition-colors p-2 rounded-full"
                style={{ color: 'var(--color-on-surface-variant)' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'var(--color-on-surface)'
                  e.currentTarget.style.backgroundColor = 'var(--color-surface-container)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'var(--color-on-surface-variant)'
                  e.currentTarget.style.backgroundColor = 'transparent'
                }}
              >close</button>
            </div>

            {/* 内容区 */}
            <div
              className="flex-1 overflow-y-auto p-6 transition-colors duration-200"
              style={{ backgroundColor: 'color-mix(in srgb, var(--color-surface-container) 30%, transparent)' }}
            >
              <div
                className="p-6 rounded-xl min-h-full prose prose-sm max-w-none text-sm space-y-4 transition-colors duration-200"
                style={{
                  backgroundColor: 'var(--color-surface-container-lowest)',
                  color: 'var(--color-on-surface-variant)',
                  border: '1px solid color-mix(in srgb, var(--color-surface-variant) 50%, transparent)',
                }}
              >
                <h1 className="text-xl font-bold mb-4" style={{ color: 'var(--color-on-surface)' }}>{previewContent.filename.replace(/\.[^.]+$/, '')}</h1>
                <p><strong style={{ color: 'var(--color-on-surface)' }}>摘要：</strong>{previewContent.content || '暂无解析内容。该文档尚未完成解析或解析失败。'}</p>
                <img
                  className="w-full rounded-lg my-4"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuB8qRQ2VbqXM6fK6DZ_kTrpRey3qSEpp9bpgITZJbx-Um0ZEO5ZrK5TZX7k8NeySOUjmXo4MqmCthpEi3lPKBuuGLd2bgXdYzMIkxzGwEEhBc7WCTNmydT7epBo7c0xH3zw1_iIH_LLOcO9u-IeeiClPyw8I8iPMjyK6nBxyhg0vQvzigPJf0Xo2pyLGK8J__bTBQrqg_Jj0RSLRz9P1WuZbOb4tBzQomVCMimDljiOYAbR0Jb20vi_7UiGn1TevxZPlL1Um-PG-Os"
                  alt="文档配图"
                  style={{ border: '1px solid color-mix(in srgb, var(--color-surface-variant) 30%, transparent)' }}
                />
                <h2 className="text-lg font-semibold" style={{ color: 'var(--color-on-surface)' }}>一、市场现状</h2>
                <p>随着LLM大模型技术的成熟，企业私域数据的价值日益凸显。传统的非结构化数据管理方式已无法满足AI的实时性需求，检索增强生成（RAG）技术成为行业标准。</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>数据解析的准确度与分块策略（Chunking）</li>
                  <li>多模态数据支持能力（PDF, Image, Text）</li>
                  <li>与现有业务系统的集成便捷度</li>
                </ul>
              </div>
            </div>

            {/* 底部操作栏 */}
            <div
              className="p-4 flex items-center justify-between transition-colors duration-200"
              style={{
                backgroundColor: 'var(--color-surface-container-lowest)',
                borderTop: '1px solid var(--color-surface-variant)',
              }}
            >
              <button
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs transition-colors"
                style={{
                  backgroundColor: 'var(--color-surface-container-high)',
                  color: 'var(--color-on-surface-variant)',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-surface-container-highest)' }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-surface-container-high)' }}
              >
                <span className="material-symbols-outlined text-lg">download</span>
                下载原文件
              </button>
              <button
                className="px-4 py-2 rounded-lg text-xs text-white hover:shadow-md transition-all duration-200"
                style={{
                  backgroundColor: 'var(--color-primary)',
                  boxShadow: '0 4px 14px color-mix(in srgb, var(--color-primary) 25%, transparent)',
                }}
              >
                引用至对话
              </button>
            </div>
          </>
        )}
      </div>
    </main>
  )
}

/* ======== 上传弹窗组件 ======== */
function UploadModal({ onClose, onUpload }) {
  const [dragOver, setDragOver] = useState(false)
  const [pickedFile, setPickedFile] = useState(null)
  const [uploading, setUploading] = useState(false)

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) setPickedFile(file)
  }

  const handleDragOver = (e) => { e.preventDefault(); setDragOver(true) }
  const handleDragLeave = (e) => { e.preventDefault(); setDragOver(false) }

  const handleFileInput = (e) => {
    const file = e.target.files[0]
    if (file) setPickedFile(file)
  }

  const handleSubmit = async () => {
    if (!pickedFile) return
    setUploading(true)
    try {
      await onUpload(pickedFile)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-[12px] transition-colors duration-200"
      style={{ backgroundColor: 'color-mix(in srgb, var(--color-on-surface) 60%, transparent)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-[500px] rounded-xl flex flex-col overflow-hidden transition-colors duration-200"
        style={{
          backgroundColor: 'var(--color-surface-container-lowest)',
          border: '1px solid var(--color-surface-variant)',
          boxShadow: '0 10px 30px color-mix(in srgb, var(--color-on-surface) 20%, transparent)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* 头部 */}
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: '1px solid var(--color-surface-variant)' }}
        >
          <h2
            className="text-lg font-semibold"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'var(--color-on-surface)' }}
          >上传文件</h2>
          <button
            onClick={onClose}
            className="transition-colors p-2 rounded-full"
            style={{ color: 'var(--color-on-surface-variant)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--color-on-surface)'
              e.currentTarget.style.backgroundColor = 'var(--color-surface-container)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--color-on-surface-variant)'
              e.currentTarget.style.backgroundColor = 'transparent'
            }}
          >
            <span className="material-symbols-outlined text-2xl">close</span>
          </button>
        </div>

        {/* 内容 */}
        <div className="p-6 flex flex-col gap-5">
          {/* 拖放区 */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className="rounded-xl p-8 flex flex-col items-center justify-center text-center transition-all duration-200 cursor-pointer"
            style={{
              border: `2px dashed ${dragOver ? 'var(--color-primary)' : 'var(--color-outline-variant)'}`,
              backgroundColor: dragOver
                ? 'color-mix(in srgb, var(--color-primary) 5%, transparent)'
                : 'var(--color-surface-container)',
            }}
            onClick={() => document.getElementById('file-input').click()}
            onMouseEnter={(e) => { if (!dragOver) e.currentTarget.style.borderColor = 'var(--color-primary)' }}
            onMouseLeave={(e) => { if (!dragOver) e.currentTarget.style.borderColor = 'var(--color-outline-variant)' }}
          >
            <span
              className="material-symbols-outlined text-[48px] mb-3"
              style={{ color: 'var(--color-primary)' }}
            >cloud_upload</span>
            <p className="text-sm font-medium mb-1" style={{ color: 'var(--color-on-surface)' }}>拖拽文件到此处或点击选择</p>
            <p className="text-xs" style={{ color: 'var(--color-on-surface-variant)' }}>支持 PDF、DOCX、TXT 格式，单文件最大 50MB</p>
            <input
              id="file-input"
              type="file"
              className="hidden"
              accept=".pdf,.docx,.txt"
              onChange={handleFileInput}
            />
          </div>

          {/* 已选文件 */}
          {pickedFile && (
            <div
              className="flex items-center gap-3 p-3 rounded-lg transition-colors duration-200"
              style={{
                backgroundColor: 'var(--color-surface-container)',
                border: '1px solid var(--color-outline-variant)',
              }}
            >
              <span
                className="material-symbols-outlined text-[28px]"
                style={{ color: 'var(--color-primary)' }}
              >description</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate" style={{ color: 'var(--color-on-surface)' }}>{pickedFile.name}</p>
                <p className="text-xs" style={{ color: 'var(--color-on-surface-variant)' }}>{(pickedFile.size / 1024).toFixed(1)} KB</p>
              </div>
              <button
                onClick={() => setPickedFile(null)}
                className="transition-colors p-1 rounded-full"
                style={{ color: 'var(--color-on-surface-variant)' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-error)' }}
                onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-on-surface-variant)' }}
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>
          )}

          {/* 操作按钮 */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-lg text-xs transition-colors"
              style={{
                border: '1px solid var(--color-outline-variant)',
                color: 'var(--color-on-surface-variant)',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-surface-container)' }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
            >
              取消
            </button>
            <button
              onClick={handleSubmit}
              disabled={!pickedFile || uploading}
              className="px-5 py-2.5 rounded-lg text-white text-xs hover:shadow-lg transition-all duration-200 disabled:opacity-50"
              style={{
                backgroundColor: 'var(--color-primary)',
                boxShadow: '0 4px 14px color-mix(in srgb, var(--color-primary) 30%, transparent)',
              }}
            >
              {uploading ? '上传中…' : '开始上传'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ======== 时间格式化辅助函数 ======== */
function formatTime(isoString) {
  if (!isoString) return '-'
  const d = new Date(isoString)
  return d.toLocaleDateString('zh-CN') + ' ' + d.toTimeString().slice(0, 5)
}
