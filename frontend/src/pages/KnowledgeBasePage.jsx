/**
 * 知识库页面 — 「个人知识库」(04-知识库)
 *
 * 路由: /knowledge-base
 *
 * 功能:个人私有知识库的统一管理视图,支持创建、编辑、删除知识库及查看统计。
 *      专栏订阅内容已迁移至 /columns(侧边栏二级导航),本页面与之完全隔离。
 *
 * 包含:
 * - 头部操作栏(标题+搜索+新建按钮)
 * - 统计概览面板(3 列卡片)
 * - 知识库网格列表
 * - 新建/编辑/删除弹窗
 */
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import useKnowledgeBases from '../hooks/useKnowledgeBases'

export default function KnowledgeBasePage() {
  const navigate = useNavigate()
  const {
    knowledgeBases,
    loading,
    createKnowledgeBase,
    updateKnowledgeBase,
    deleteKnowledgeBase
  } = useKnowledgeBases()

  // 知识库统计数据（从列表数据中聚合计算）
  const stats = {
    totalKBs: knowledgeBases.length,
    totalDocs: knowledgeBases.reduce((sum, kb) => sum + (kb.document_count || 0), 0),
    totalStorage: '4.2 GB',
  }

  const [searchKeyword, setSearchKeyword] = useState('')
  const [showNewModal, setShowNewModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedKB, setSelectedKB] = useState(null)

  // 表单状态
  const [formName, setFormName] = useState('')
  const [formDesc, setFormDesc] = useState('')
  const [formVisibility, setFormVisibility] = useState('private')

  // 过滤知识库
  const filteredKBs = searchKeyword.trim()
    ? knowledgeBases.filter(kb => kb.name.includes(searchKeyword) || kb.description?.includes(searchKeyword))
    : knowledgeBases

  // 打开新建弹窗
  const openNewModal = () => {
    setFormName('')
    setFormDesc('')
    setFormVisibility('private')
    setShowNewModal(true)
  }

  // 打开编辑弹窗
  const openEditModal = (kb) => {
    setSelectedKB(kb)
    setFormName(kb.name)
    setFormDesc(kb.description || '')
    setFormVisibility(kb.visibility || 'private')
    setShowEditModal(true)
  }

  // 打开删除确认弹窗
  const openDeleteModal = (kb) => {
    setSelectedKB(kb)
    setShowDeleteModal(true)
  }

  // 提交新建
  const handleCreate = async () => {
    if (!formName.trim()) return
    await createKnowledgeBase({ name: formName.trim(), description: formDesc, visibility: formVisibility })
    setShowNewModal(false)
  }

  // 提交编辑
  const handleEdit = async () => {
    if (!formName.trim() || !selectedKB) return
    await updateKnowledgeBase(selectedKB.id, { name: formName.trim(), description: formDesc, visibility: formVisibility })
    setShowEditModal(false)
    setSelectedKB(null)
  }

  // 确认删除
  const handleDelete = async () => {
    if (!selectedKB) return
    await deleteKnowledgeBase(selectedKB.id)
    setShowDeleteModal(false)
    setSelectedKB(null)
  }

  // 进入知识库详情
  const handleEnter = (kbId) => {
    navigate(`/knowledge-base/${kbId}/documents`)
  }

  return (
    <main
      className="flex-1 p-10 mt-16 transition-colors duration-200"
      style={{ backgroundColor: 'var(--color-background)' }}
    >
      <div className="max-w-7xl mx-auto space-y-8">
        {/* 头部操作栏 */}
        <section className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          {/* 靠右对齐:桌面端 ml-auto 推到右侧;移动端 self-end 在 flex-column 中右对齐 */}
          <div className="flex items-center gap-4 w-full md:w-auto md:ml-auto self-end">
            {/* 搜索框 */}
            <div className="relative flex-1 md:w-80">
              <span
                className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-lg transition-colors duration-200"
                style={{ color: 'var(--color-outline)' }}
              >search</span>
              <input
                className="w-full pl-10 pr-4 py-2 rounded-lg text-sm outline-none transition-all duration-200"
                style={{
                  backgroundColor: 'var(--color-surface-container-lowest)',
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
                placeholder="搜索知识库..."
                type="text"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
              />
            </div>

            {/* 新建按钮 */}
            <button
              onClick={openNewModal}
              className="flex items-center gap-2 text-white py-2 px-4 rounded-lg text-xs font-medium transition-all duration-200 whitespace-nowrap"
              style={{
                backgroundColor: 'var(--color-primary)',
                boxShadow: '0 4px 14px color-mix(in srgb, var(--color-primary) 25%, transparent)',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.9' }}
              onMouseLeave={(e) => { e.currentTarget.style.opacity = '1' }}
            >
              <span className="material-symbols-outlined text-sm">add</span>
              新建知识库
            </button>
          </div>
        </section>

        {/* 统计概览面板 */}
        {!loading && stats && (
          <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 总知识库数量 */}
            <StatCard
              icon="library_books"
              iconColorVar="--color-primary"
              iconBgVar="--color-primary"
              label="总知识库数量"
              value={stats.totalKBs}
            />

            {/* 总文档数 */}
            <StatCard
              icon="description"
              iconColorVar="--color-tertiary"
              iconBgVar="--color-tertiary"
              label="总文档数"
              value={stats.totalDocs}
            />

            {/* 已用存储容量 */}
            <StatCard
              icon="cloud_done"
              iconColorVar="--color-on-secondary-container"
              iconBgVar="--color-secondary-container"
              label="已用存储容量"
              value={stats.totalStorage ?? '4.2 GB'}
            />
          </section>
        )}

        {/* 知识库卡片列表 */}
        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full flex justify-center py-16">
              <div
                className="animate-spin w-10 h-10 border-3 rounded-full"
                style={{
                  borderColor: 'var(--color-surface-variant)',
                  borderTopColor: 'var(--color-primary)',
                }}
              ></div>
            </div>
          ) : filteredKBs.length === 0 ? (
            <div
              className="col-span-full text-center py-16 transition-colors duration-200"
              style={{ color: 'var(--color-on-surface-variant)' }}
            >
              暂无知识库
            </div>
          ) : (
            filteredKBs.map(kb => (
              <div
                key={kb.id}
                className="rounded-xl hover:shadow-md transition-all duration-200 flex flex-col h-full p-6"
                style={{
                  backgroundColor: 'var(--color-surface-container-lowest)',
                  border: '1px solid var(--color-outline-variant)',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'color-mix(in srgb, var(--color-primary) 40%, transparent)' }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--color-outline-variant)' }}
              >
                {/* 卡片头部 */}
                <div className="flex justify-between items-start mb-4">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center transition-colors duration-200"
                    style={{ backgroundColor: 'var(--color-surface-container-high)' }}
                  >
                    <span
                      className="material-symbols-outlined"
                      style={{ color: 'var(--color-on-surface)' }}
                    >{kb.document_count > 500 ? 'database' : 'folder'}</span>
                  </div>
                  <button
                    className="transition-colors p-1"
                    style={{ color: 'var(--color-outline)' }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-on-surface)' }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-outline)' }}
                  >
                    <span className="material-symbols-outlined text-lg">more_vert</span>
                  </button>
                </div>

                {/* 名称和描述 */}
                <h3
                  className="text-lg font-semibold mb-2 transition-colors duration-200"
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'var(--color-on-surface)' }}
                >
                  {kb.name}
                </h3>
                <p
                  className="text-sm mb-4 flex-1 leading-relaxed transition-colors duration-200"
                  style={{ color: 'var(--color-on-surface-variant)' }}
                >
                  {kb.description || '暂无描述'}
                </p>

                {/* 元数据面板 */}
                <div
                  className="rounded-lg p-3 mb-4 space-y-2"
                  style={{ backgroundColor: 'var(--color-surface-container)' }}
                >
                  <div className="flex justify-between text-xs">
                    <span style={{ color: 'var(--color-on-surface-variant)' }}>文件数量</span>
                    <span style={{ color: 'var(--color-on-surface)' }} className="font-semibold">{kb.document_count ?? '-'}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span style={{ color: 'var(--color-on-surface-variant)' }}>最后更新时间</span>
                    <span style={{ color: 'var(--color-on-surface)' }} className="font-semibold">{formatTime(kb.updated_at)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span style={{ color: 'var(--color-on-surface-variant)' }}>创建人</span>
                    <span style={{ color: 'var(--color-on-surface)' }} className="font-semibold">{kb.created_by_name || '-'}</span>
                  </div>
                </div>

                {/* 操作按钮行 */}
                <div
                  className="flex items-center gap-2 pt-3"
                  style={{ borderTop: '1px solid var(--color-surface-variant)' }}
                >
                  <button
                    onClick={() => handleEnter(kb.id)}
                    className="flex-1 text-[#1c1b1b] py-2 rounded-lg text-xs text-center transition-colors"
                    style={{
                      backgroundColor: 'var(--color-surface-container-high)',
                      border: '1px solid var(--color-outline-variant)',
                      color: 'var(--color-on-surface)',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-surface-container-highest)' }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-surface-container-high)' }}
                  >
                    进入
                  </button>
                  <button
                    onClick={() => openEditModal(kb)}
                    className="p-2 rounded-lg transition-colors"
                    style={{
                      color: 'var(--color-on-surface-variant)',
                      border: '1px solid transparent',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = 'var(--color-primary)'
                      e.currentTarget.style.backgroundColor = 'color-mix(in srgb, var(--color-primary) 10%, transparent)'
                      e.currentTarget.style.borderColor = 'color-mix(in srgb, var(--color-primary) 40%, transparent)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = 'var(--color-on-surface-variant)'
                      e.currentTarget.style.backgroundColor = 'transparent'
                      e.currentTarget.style.borderColor = 'transparent'
                    }}
                    title="编辑"
                  >
                    <span className="material-symbols-outlined text-sm">edit</span>
                  </button>
                  <button
                    onClick={() => openDeleteModal(kb)}
                    className="p-2 rounded-lg transition-colors"
                    style={{
                      color: 'var(--color-on-surface-variant)',
                      border: '1px solid transparent',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = 'var(--color-error)'
                      e.currentTarget.style.backgroundColor = 'color-mix(in srgb, var(--color-error) 10%, transparent)'
                      e.currentTarget.style.borderColor = 'color-mix(in srgb, var(--color-error) 40%, transparent)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = 'var(--color-on-surface-variant)'
                      e.currentTarget.style.backgroundColor = 'transparent'
                      e.currentTarget.style.borderColor = 'transparent'
                    }}
                    title="删除"
                  >
                    <span className="material-symbols-outlined text-sm">delete</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </section>
      </div>

      {/* ========== 弹窗组件 ========== */}

      {/* 新建知识库弹窗 */}
      {showNewModal && (
        <ModalOverlay onClose={() => setShowNewModal(false)}>
          <ModalBox title="新建知识库" onClose={() => setShowNewModal(false)}>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label
                  className="text-xs transition-colors duration-200"
                  style={{ color: 'var(--color-on-surface-variant)' }}
                >名称 <span style={{ color: 'var(--color-error)' }}>*</span></label>
                <input
                  className="w-full rounded-lg px-3 py-2.5 outline-none focus:ring-2 transition-all duration-200"
                  style={{
                    backgroundColor: 'var(--color-surface-container)',
                    color: 'var(--color-on-surface)',
                    border: '1px solid var(--color-outline-variant)',
                  }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--color-primary)' }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--color-outline-variant)' }}
                  placeholder="请输入知识库名称"
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  autoFocus
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label
                  className="text-xs transition-colors duration-200"
                  style={{ color: 'var(--color-on-surface-variant)' }}
                >描述</label>
                <textarea
                  className="w-full rounded-lg px-3 py-2 outline-none focus:ring-2 resize-none transition-all duration-200"
                  style={{
                    backgroundColor: 'var(--color-surface-container)',
                    color: 'var(--color-on-surface)',
                    border: '1px solid var(--color-outline-variant)',
                  }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--color-primary)' }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--color-outline-variant)' }}
                  placeholder="请输入知识库描述"
                  rows={3}
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label
                  className="text-xs transition-colors duration-200"
                  style={{ color: 'var(--color-on-surface-variant)' }}
                >可见性</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { val: 'private', label: '私有', icon: 'lock' },
                    { val: 'organization', label: '组织内', icon: 'groups' },
                    { val: 'public', label: '公开', icon: 'public' },
                  ].map(opt => (
                    <label
                      key={opt.val}
                      className="relative flex flex-col items-center p-3 rounded-lg cursor-pointer group transition-colors"
                      style={{
                        border: `1px solid ${formVisibility === opt.val ? 'var(--color-primary)' : 'var(--color-outline-variant)'}`,
                        backgroundColor: formVisibility === opt.val
                          ? 'color-mix(in srgb, var(--color-primary) 8%, transparent)'
                          : 'transparent',
                      }}
                      onMouseEnter={(e) => {
                        if (formVisibility !== opt.val) e.currentTarget.style.backgroundColor = 'var(--color-surface-container)'
                      }}
                      onMouseLeave={(e) => {
                        if (formVisibility !== opt.val) e.currentTarget.style.backgroundColor = 'transparent'
                      }}
                    >
                      <input
                        type="radio"
                        name="visibility-new"
                        value={opt.val}
                        checked={formVisibility === opt.val}
                        onChange={(e) => setFormVisibility(e.target.value)}
                        className="sr-only"
                      />
                      <span
                        className="material-symbols-outlined mb-1.5 text-[28px] transition-colors"
                        style={{ color: formVisibility === opt.val ? 'var(--color-primary)' : 'var(--color-on-surface-variant)' }}
                      >{opt.icon}</span>
                      <span
                        className="text-sm transition-colors"
                        style={{ color: 'var(--color-on-surface)' }}
                      >{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setShowNewModal(false)}
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
                  onClick={handleCreate}
                  disabled={!formName.trim()}
                  className="px-5 py-2.5 rounded-lg text-white text-xs hover:shadow-lg transition-all duration-200 disabled:opacity-50"
                  style={{
                    backgroundColor: 'var(--color-primary)',
                    boxShadow: '0 4px 14px color-mix(in srgb, var(--color-primary) 30%, transparent)',
                  }}
                >
                  确定
                </button>
              </div>
            </div>
          </ModalBox>
        </ModalOverlay>
      )}

      {/* 编辑知识库弹窗 */}
      {showEditModal && selectedKB && (
        <ModalOverlay onClose={() => setShowEditModal(false)}>
          <ModalBox title="编辑知识库" onClose={() => setShowEditModal(false)}>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label
                  className="text-xs transition-colors duration-200"
                  style={{ color: 'var(--color-on-surface-variant)' }}
                >名称 <span style={{ color: 'var(--color-error)' }}>*</span></label>
                <input
                  className="w-full rounded-lg px-3 py-2.5 outline-none focus:ring-2 transition-all duration-200"
                  style={{
                    backgroundColor: 'var(--color-surface-container)',
                    color: 'var(--color-on-surface)',
                    border: '1px solid var(--color-outline-variant)',
                  }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--color-primary)' }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--color-outline-variant)' }}
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label
                  className="text-xs transition-colors duration-200"
                  style={{ color: 'var(--color-on-surface-variant)' }}
                >描述</label>
                <textarea
                  className="w-full rounded-lg px-3 py-2 outline-none focus:ring-2 resize-none transition-all duration-200"
                  style={{
                    backgroundColor: 'var(--color-surface-container)',
                    color: 'var(--color-on-surface)',
                    border: '1px solid var(--color-outline-variant)',
                  }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--color-primary)' }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--color-outline-variant)' }}
                  rows={3}
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="px-5 py-2.5 rounded-lg text-xs transition-colors"
                  style={{
                    border: '1px solid var(--color-outline-variant)',
                    color: 'var(--color-on-surface-variant)',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-surface-container)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
                >取消</button>
                <button
                  onClick={handleEdit}
                  disabled={!formName.trim()}
                  className="px-5 py-2.5 rounded-lg text-white text-xs hover:shadow-lg transition-all duration-200 disabled:opacity-50"
                  style={{
                    backgroundColor: 'var(--color-primary)',
                    boxShadow: '0 4px 14px color-mix(in srgb, var(--color-primary) 30%, transparent)',
                  }}
                >保存</button>
              </div>
            </div>
          </ModalBox>
        </ModalOverlay>
      )}

      {/* 删除确认弹窗 */}
      {showDeleteModal && selectedKB && (
        <ModalOverlay onClose={() => setShowDeleteModal(false)}>
          <ModalBox title="确认删除" onClose={() => setShowDeleteModal(false)}>
            <div className="flex flex-col gap-4">
              <p
                className="text-sm transition-colors duration-200"
                style={{ color: 'var(--color-on-surface-variant)' }}
              >
                确定要删除知识库 <strong style={{ color: 'var(--color-on-surface)' }}>「{selectedKB.name}」</strong> 吗？此操作不可撤销。
              </p>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-5 py-2.5 rounded-lg text-xs transition-colors"
                  style={{
                    border: '1px solid var(--color-outline-variant)',
                    color: 'var(--color-on-surface-variant)',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-surface-container)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
                >取消</button>
                <button
                  onClick={handleDelete}
                  className="px-5 py-2.5 rounded-lg text-white text-xs hover:shadow-lg transition-all duration-200"
                  style={{
                    backgroundColor: 'var(--color-error)',
                    boxShadow: '0 4px 14px color-mix(in srgb, var(--color-error) 30%, transparent)',
                  }}
                >确认删除</button>
              </div>
            </div>
          </ModalBox>
        </ModalOverlay>
      )}
    </main>
  )
}

/* ======== 辅助组件 ======== */

/** 统计卡片 */
function StatCard({ icon, iconColorVar, iconBgVar, label, value }) {
  return (
    <div
      className="rounded-xl p-5 flex items-center gap-4 transition-colors duration-200"
      style={{
        backgroundColor: 'var(--color-surface-container-lowest)',
        border: '1px solid var(--color-outline-variant)',
        boxShadow: '0 1px 3px color-mix(in srgb, var(--color-on-surface) 4%, transparent)',
      }}
    >
      <div
        className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-colors duration-200"
        style={{ backgroundColor: `color-mix(in srgb, var(${iconBgVar}) 12%, transparent)` }}
      >
        <span
          className="material-symbols-outlined transition-colors duration-200"
          style={{ color: `var(${iconColorVar})` }}
        >{icon}</span>
      </div>
      <div>
        <p
          className="text-xs uppercase tracking-wider transition-colors duration-200"
          style={{ color: 'var(--color-on-surface-variant)' }}
        >{label}</p>
        <p
          className="text-2xl font-bold mt-1 transition-colors duration-200"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'var(--color-on-surface)' }}
        >{value}</p>
      </div>
    </div>
  )
}

/** 模态遮罩层 */
function ModalOverlay({ children, onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-[12px] transition-colors duration-200"
      style={{ backgroundColor: 'color-mix(in srgb, var(--color-on-surface) 60%, transparent)' }}
      onClick={onClose}
    >
      {children}
    </div>
  )
}

/** 模态框容器 */
function ModalBox({ title, onClose, children }) {
  return (
    <div
      className="w-full max-w-[600px] rounded-xl flex flex-col overflow-hidden transition-colors duration-200"
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
          className="text-lg font-semibold transition-colors duration-200"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'var(--color-on-surface)' }}
        >{title}</h2>
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
        {children}
      </div>
    </div>
  )
}

/** 时间格式化辅助函数 */
function formatTime(isoString) {
  if (!isoString) return '-'
  const date = new Date(isoString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  const diffHour = Math.floor(diffMs / 3600000)
  const diffDay = Math.floor(diffMs / 86400000)

  if (diffMin < 1) return '刚刚'
  if (diffMin < 60) return `${diffMin}分钟前`
  if (diffHour < 24) return `${diffHour}小时前`
  if (diffDay < 7) return `${diffDay}天前`

  return date.toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}
