/**
 * 对话详情页面 (03-最近对话)
 *
 * 功能：展示已存在的历史对话内容，支持继续对话。
 * 路由：/chat/:id
 *
 * 包含：
 * - 日期分隔线
 * - AI 消息气泡（左侧，灰色背景，机器人头像）
 * - 用户消息气泡（右侧，紫色背景，用户头像）
 * - 代码块组件（深色背景，语言标签，复制按钮）
 * - 图片展示组件
 * - 操作按钮组（点赞/踩/重新生成）
 * - 悬浮快捷建议标签
 * - 底部输入栏
 */
import React, { useState, useEffect, useLayoutEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import ChatInput from '../components/ChatInput'
import useMessages from '../hooks/useMessages'

/* 用户消息组件 */
function UserMessage({ message }) {
  return (
    <div className="flex gap-3 max-w-[85%] self-end flex-row-reverse">
      <img
        alt="User avatar"
        className="w-8 h-8 rounded-full flex-shrink-0 mt-1"
        style={{ border: '1px solid var(--color-surface-variant)' }}
        src="https://lh3.googleusercontent.com/aida-public/AB6AXuDA4pEbaoJK3mvgzMOWLrdOnvW1dRSNXF0RzIjzvdgevjdyvWRVCNfGimzjTll4sAfkwHgYf7stdPwdnWbeThidIk5PriuIGWbYhifdhMYSH_dBZ-BnhPJ4wz-xCfuLfjknbThqUbuXDpQcAEADLHuVL0t_zplxeridTyElkyQtPTsgEYxxVSJkuNRv3cRLp03kgDmojr6BwOfGuQ3a4jcSXmw93qUKCW7c2SxJDDWH7pkOwDQjAyxPUTCUxAC8Hot-mrM19IPzRHs"
      />
      <div
        className="text-white rounded-2xl rounded-tr-sm px-4 py-3 shadow-[0_4px_14px_rgba(61,50,230,0.15)]"
        style={{ backgroundColor: 'var(--color-primary)' }}
      >
        <p className="font-body-md text-body-md whitespace-pre-wrap">{message.content}</p>
      </div>
    </div>
  )
}

/* 代码块组件 */
function CodeBlock({ language, code }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div
      className="rounded-lg overflow-hidden my-3 shadow-sm"
      style={{ backgroundColor: 'var(--color-inverse-surface)' }}
    >
      <div
        className="px-4 py-2 flex justify-between items-center"
        style={{ backgroundColor: 'var(--color-inverse-surface)', color: 'var(--color-inverse-on-surface)' }}
      >
        <span className="font-label-md text-label-md" style={{ color: 'var(--color-outline-variant)' }}>{language || 'text'}</span>
        <button
          onClick={handleCopy}
          className="transition-colors flex items-center gap-1"
          style={{ color: 'var(--color-outline-variant)' }}
          onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-inverse-on-surface)'}
          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-outline-variant)'}
        >
          <span className="material-symbols-outlined text-[14px]">content_copy</span>
          <span className="font-label-md text-[10px]">{copied ? '已复制' : '复制代码'}</span>
        </button>
      </div>
      <pre
        className="p-4 font-mono text-sm overflow-x-auto"
        style={{ color: 'var(--color-surface-container-low)' }}
      >
        <code>{code}</code>
      </pre>
    </div>
  )
}

/* 思考过程占位文本（不影响实际答案内容）—— 真实业务场景下的长内容（>10 行） */
const THINKING_TEXT = [
  '用户当前咨询的是卫星互联网测试链路相关的问题，结合上下文「卫星互联网测试链路仿真图」，需要先确认其关心的具体环节：是链路预算、端到端时延，还是带宽与抖动表现。',
  '',
  '1. 首先梳理卫星互联网测试链路的关键组成：',
  '   - 地面段：用户终端（UT）、信关站（Gateway）、核心网接入点；',
  '   - 空间段：LEO / MEO / GEO 卫星载荷，星间链路（ISL，视具体星座而定）；',
  '   - 业务段：测控站、网管中心、QoS 策略下发。',
  '',
  '2. 评估常见测试维度：',
  '   - 链路预算：EIRP、G/T、C/N、链路余量，以及晴空 / 雨衰下的可用度；',
  '   - 时延：单跳传播时延（LEO 约 20–40 ms，GEO 约 240 ms）、RTT、TCP 慢启动影响；',
  '   - 吞吐与抖动：调制编码策略（MCS）切换、功率控制、波束调度带来的波动；',
  '   - 切换 / 掉线：LEO 卫星高速运动引起的波束切换、用户跨星切换、Starlink 类场景下短时中断。',
  '',
  '3. 对应用户可能的诉求，倾向于给出一份「仿真链路示意 + 关键指标表 + 典型测试方法」的组合回答，',
  '   并在末尾补充测试建议（如：晴天 / 雨天分组测试、不同时段采样、地面端与卫星端时钟同步方案等）。',
  '',
  '4. 输出策略：先给出简要结论与链路图，再分点展开技术指标，最后给出可复现的测试步骤与注意事项。',
].join('\n')

/* 轻量级 Markdown 解析器：支持标题、列表、表格、引用、代码块、加粗、段落 */
function parseInline(text) {
  // 将 **bold** 转成 React 节点
  const parts = []
  const regex = /\*\*([^*]+)\*\*/g
  let last = 0
  let m
  let key = 0
  while ((m = regex.exec(text)) !== null) {
    if (m.index > last) parts.push(text.slice(last, m.index))
    parts.push(
      <strong key={`b-${key++}`} className="font-semibold" style={{ color: 'var(--color-on-surface)' }}>
        {m[1]}
      </strong>
    )
    last = regex.lastIndex
  }
  if (last < text.length) parts.push(text.slice(last))
  return parts
}

/* 解析 Markdown 表格的一行单元格 */
function parseTableRow(line) {
  // 去除首尾的 |，再按 | 分割
  const trimmed = line.replace(/^\|/, '').replace(/\|$/, '')
  return trimmed.split('|').map((c) => c.trim())
}

/* 解析单个文本片段为有序的 block 数组 */
function parseTextBlocks(text) {
  const lines = text.split('\n')
  const blocks = []
  let i = 0

  const isTableSep = (line) => /^\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)+\|?$/.test(line.trim())
  const startsOrderedList = (line) => /^\d+\.\s+/.test(line)
  const startsUnorderedList = (line) => /^[\-\*]\s+/.test(line)
  const startsHeading = (line) => /^(#{1,3})\s+(.+)$/.test(line)
  const startsQuote = (line) => /^>\s+/.test(line)

  while (i < lines.length) {
    const line = lines[i]
    const trimmed = line.trim()

    if (trimmed === '') {
      i++
      continue
    }

    // Heading
    const hMatch = trimmed.match(/^(#{1,3})\s+(.+)$/)
    if (hMatch) {
      const level = hMatch[1].length
      const text = hMatch[2]
      blocks.push({ type: 'heading', level, text })
      i++
      continue
    }

    // Table: | h1 | h2 | + separator + rows
    if (
      /^\|.*\|$/.test(trimmed) &&
      i + 1 < lines.length &&
      isTableSep(lines[i + 1])
    ) {
      const headers = parseTableRow(trimmed)
      i += 2
      const rows = []
      while (i < lines.length && /^\|.*\|$/.test(lines[i].trim())) {
        rows.push(parseTableRow(lines[i].trim()))
        i++
      }
      blocks.push({ type: 'table', headers, rows })
      continue
    }

    // Unordered list
    if (startsUnorderedList(trimmed)) {
      const items = []
      while (i < lines.length && startsUnorderedList(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^[\-\*]\s+/, ''))
        i++
      }
      blocks.push({ type: 'ul', items })
      continue
    }

    // Ordered list
    if (startsOrderedList(trimmed)) {
      const items = []
      while (i < lines.length && startsOrderedList(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^\d+\.\s+/, ''))
        i++
      }
      blocks.push({ type: 'ol', items })
      continue
    }

    // Blockquote
    if (startsQuote(trimmed)) {
      const quote = []
      while (i < lines.length && startsQuote(lines[i].trim())) {
        quote.push(lines[i].trim().replace(/^>\s+/, ''))
        i++
      }
      blocks.push({ type: 'quote', text: quote.join(' ') })
      continue
    }

    // Paragraph: 收集直到空行或下一个块开始
    const paraLines = []
    while (i < lines.length) {
      const cur = lines[i]
      const curTrim = cur.trim()
      if (curTrim === '') break
      if (
        startsHeading(curTrim) ||
        startsUnorderedList(curTrim) ||
        startsOrderedList(curTrim) ||
        startsQuote(curTrim) ||
        (/^\|.*\|$/.test(curTrim) && i + 1 < lines.length && isTableSep(lines[i + 1]))
      ) {
        break
      }
      paraLines.push(cur)
      i++
    }
    if (paraLines.length > 0) {
      blocks.push({ type: 'paragraph', text: paraLines.join('\n') })
    }
  }

  return blocks
}

/* 主解析器：将消息内容拆分为有序的 block 列表（含 codeBlocks） */
function parseMessageContent(content) {
  // 1. 抽取 ```language\n...\n``` 代码块
  const codeRegex = /```(\w*)\n([\s\S]*?)```/g
  const codeBlocks = []
  let lastIndex = 0
  const segments = []
  let m
  while ((m = codeRegex.exec(content)) !== null) {
    if (m.index > lastIndex) {
      segments.push({ type: 'text', content: content.slice(lastIndex, m.index) })
    }
    codeBlocks.push({ language: m[1], code: m[2].trim() })
    segments.push({ type: 'code', index: codeBlocks.length - 1 })
    lastIndex = codeRegex.lastIndex
  }
  if (lastIndex < content.length) {
    segments.push({ type: 'text', content: content.slice(lastIndex) })
  }

  // 2. 将 text 段解析为 block
  const blocks = []
  segments.forEach((seg) => {
    if (seg.type === 'text') {
      parseTextBlocks(seg.content).forEach((b) => blocks.push(b))
    } else {
      blocks.push({ type: 'code', ...codeBlocks[seg.index] })
    }
  })

  // 3. 图片检测：提取 ![...](url) 形式
  const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g
  let imgMatch
  const imageBlocks = []
  while ((imgMatch = imageRegex.exec(content)) !== null) {
    imageBlocks.push({ type: 'image', alt: imgMatch[1], url: imgMatch[2] })
  }
  // 将 image block 追加到末尾
  imageBlocks.forEach((ib) => blocks.push(ib))
  const hasImage = imageBlocks.length > 0

  return { blocks, codeBlocks, hasImage }
}

/* 渲染单个 block 的 React 节点 */
function RenderBlock({ block, codeBlocks, imageUrl }) {
  if (block.type === 'heading') {
    const Tag = `h${block.level + 1}` // 避免与 h1 冲突
    const sizeMap = {
      1: 'text-[20px] font-semibold mt-2 mb-2',
      2: 'text-[17px] font-semibold mt-3 mb-2',
      3: 'text-[15px] font-semibold mt-2 mb-1.5',
    }
    return (
      <Tag
        className={sizeMap[block.level] || sizeMap[3]}
        style={{ color: 'var(--color-on-surface)' }}
      >
        {parseInline(block.text)}
      </Tag>
    )
  }
  if (block.type === 'paragraph') {
    return (
      <p
        className="font-body-md text-body-md mb-3 last:mb-0 whitespace-pre-wrap leading-relaxed"
        style={{ color: 'var(--color-on-surface)' }}
      >
        {parseInline(block.text)}
      </p>
    )
  }
  if (block.type === 'ul') {
    return (
      <ul
        className="font-body-md text-body-md mb-3 pl-5 list-disc space-y-1"
        style={{ color: 'var(--color-on-surface)' }}
      >
        {block.items.map((it, i) => (
          <li key={i} className="leading-relaxed" style={{ color: 'var(--color-on-surface)' }}>
            {parseInline(it)}
          </li>
        ))}
      </ul>
    )
  }
  if (block.type === 'ol') {
    return (
      <ol
        className="font-body-md text-body-md mb-3 pl-5 list-decimal space-y-1 marker:font-medium"
        style={{ color: 'var(--color-on-surface)' }}
      >
        {block.items.map((it, i) => (
          <li key={i} className="leading-relaxed" style={{ color: 'var(--color-on-surface)' }}>
            {parseInline(it)}
          </li>
        ))}
      </ol>
    )
  }
  if (block.type === 'quote') {
    return (
      <blockquote
        className="font-body-md text-body-md mb-3 pl-3 border-l-4 italic"
        style={{
          borderColor: 'var(--color-outline-variant)',
          color: 'var(--color-on-surface-variant)',
        }}
      >
        {parseInline(block.text)}
      </blockquote>
    )
  }
  if (block.type === 'table') {
    return (
      <div
        className="my-3 overflow-x-auto rounded-lg"
        style={{ border: '1px solid var(--color-surface-variant)' }}
      >
        <table className="font-body-md text-body-md w-full text-left">
          <thead style={{ backgroundColor: 'var(--color-surface-container)' }}>
            <tr>
              {block.headers.map((h, i) => (
                <th
                  key={i}
                  className="px-3 py-2 font-semibold"
                  style={{
                    color: 'var(--color-on-surface-variant)',
                    borderBottom: '1px solid var(--color-surface-variant)',
                  }}
                >
                  {parseInline(h)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {block.rows.map((row, ri) => (
              <tr
                key={ri}
                style={{ borderBottom: '1px solid var(--color-surface-variant)' }}
              >
                {row.map((cell, ci) => (
                  <td
                    key={ci}
                    className="px-3 py-2 align-top"
                    style={{ color: 'var(--color-on-surface)' }}
                  >
                    {parseInline(cell)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }
  if (block.type === 'code') {
    return <CodeBlock key={`cb-${Math.random()}`} language={block.language} code={block.code} />
  }
  if (block.type === 'image') {
    return (
      <div className="my-3">
        <img
          alt={block.alt || 'AI generated visualization'}
          className="w-full rounded-lg"
          style={{ border: '1px solid var(--color-surface-variant)' }}
          src={block.url || imageUrl}
        />
        <p
          className="text-center font-label-md mt-2"
          style={{ color: 'var(--color-outline)' }}
        >
          {block.alt || 'AI 生成的卫星互联网测试链路仿真图'}
        </p>
      </div>
    )
  }
  return null
}

/* 闪烁光标组件 */
function BlinkingCaret({ className = '' }) {
  return (
    <span
      className={`inline-block w-1.5 h-3.5 align-middle ml-0.5 animate-pulse ${className}`}
      style={{ backgroundColor: 'var(--color-primary)' }}
      aria-hidden="true"
    />
  )
}

/* 思考过程区组件：支持流式展示、自动收起、用户展开/收起（最多 10 行） */
function ThinkingSection({ thinking, phase, isExpanded, onToggle, fullThinking }) {
  const isThinking = phase === 'thinking'
  const isActive = isThinking || phase === 'answer' || phase === 'done' || phase === 'stopped'
  const contentRef = useRef(null)
  const [needsScroll, setNeedsScroll] = useState(false)

  // 展开后 + 内容变化时检测是否实际超出 10 行高度（240px ≈ 15rem）
  useLayoutEffect(() => {
    if (!isActive) {
      setNeedsScroll(false)
      return
    }
    const el = contentRef.current
    if (!el) return
    const check = () => {
      // clientHeight 在 max-height: 240px 限制下最大为 240，超过则需要滚动
      setNeedsScroll(el.scrollHeight - el.clientHeight > 1)
    }
    check()
    let ro
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(check)
      ro.observe(el)
    } else {
      window.addEventListener('resize', check)
    }
    return () => {
      if (ro) ro.disconnect()
      else window.removeEventListener('resize', check)
    }
  }, [thinking, isActive])

  if (!isActive) return null

  // 思考中强制展开；其他阶段遵循 isExpanded
  const effectiveExpanded = isThinking || isExpanded
  // 10 行 * 1.5rem 行高 = 15rem = 240px
  const expandedMaxHeightPx = 240

  return (
    <div
      className="mb-3 rounded-lg border-l-4 transition-all duration-300"
      style={
        isThinking
          ? {
              backgroundColor: 'color-mix(in srgb, var(--color-primary-container) 20%, transparent)',
              borderColor: 'var(--color-primary-container)',
            }
          : {
              backgroundColor: 'color-mix(in srgb, var(--color-surface-variant) 30%, transparent)',
              borderColor: 'var(--color-outline-variant)',
            }
      }
    >
      <div
        className="flex items-center gap-2 p-3 pb-2"
        style={isThinking ? { color: 'var(--color-primary-container)' } : { color: 'var(--color-outline)' }}
      >
        <span className="material-symbols-outlined text-[16px]">psychology</span>
        <span className="font-label-md text-label-md font-medium flex-1 select-none">
          {phase === 'thinking' ? '思考中' : '已完成思考'}
        </span>
        {isThinking && <BlinkingCaret style={{ backgroundColor: 'var(--color-primary-container)' }} />}
        {!isThinking && (
          <button
            onClick={onToggle}
            className="p-0.5 rounded transition-colors flex items-center gap-0.5"
            style={{ color: 'var(--color-outline)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'color-mix(in srgb, var(--color-on-surface) 8%, transparent)'
              e.currentTarget.style.color = 'var(--color-primary)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
              e.currentTarget.style.color = 'var(--color-outline)'
            }}
            title={effectiveExpanded ? '收起思考过程' : '展开思考过程'}
            type="button"
            aria-label={effectiveExpanded ? '收起思考过程' : '展开思考过程'}
          >
            <span className="material-symbols-outlined text-[16px]">
              {effectiveExpanded ? 'expand_less' : 'expand_more'}
            </span>
            <span className="font-label-md text-[10px]">
              {effectiveExpanded ? '收起' : '展开'}
            </span>
          </button>
        )}
      </div>
      <div
        ref={contentRef}
        className={`px-3 pb-3 font-body-md text-body-md leading-relaxed transition-all duration-200 ${
          effectiveExpanded
            ? needsScroll
              ? 'overflow-y-scroll'
              : 'overflow-visible'
            : 'max-h-[3.25rem] overflow-hidden'
        }`}
        style={
          effectiveExpanded
            ? {
                maxHeight: `${expandedMaxHeightPx}px`,
                // 仅在需要滚动时显示可见的自定义滚动条，否则隐藏
                scrollbarWidth: needsScroll ? 'thin' : 'none',
                scrollbarColor: needsScroll ? 'var(--color-outline-variant) transparent' : 'transparent transparent',
                color: 'var(--color-on-surface-variant)',
              }
            : {
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                color: 'var(--color-on-surface-variant)',
              }
        }
      >
        <p className="whitespace-pre-wrap break-words">
          {thinking}
          {isThinking && <BlinkingCaret style={{ backgroundColor: 'var(--color-primary-container)' }} />}
        </p>
      </div>
    </div>
  )
}

/* AI 失败消息组件：与成功态共用布局，但配色/图标/操作均区分 */
function FailureBubble({ message, onRetry, beforeActionClick }) {
  return (
    <div className="flex gap-3 max-w-[85%] self-start w-full">
      {/* 头像：失败时使用错误色调，提示这是 AI 但回答失败 */}
      <div
        className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-white mt-1"
        style={{ backgroundColor: 'var(--color-error)' }}
      >
        <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>smart_toy</span>
      </div>
      <div
        className="rounded-2xl rounded-tl-sm px-4 py-3 w-full max-w-[1000px] relative"
        style={{
          backgroundColor: 'var(--color-error-container)',
          color: 'var(--color-on-error-container)',
          border: '1px solid color-mix(in srgb, var(--color-error) 30%, transparent)',
        }}
      >
        {/* 失败标签行 */}
        <div
          className="flex items-center gap-2 mb-2 pb-2"
          style={{ borderBottom: '1px solid color-mix(in srgb, var(--color-error) 20%, transparent)' }}
        >
          <span className="material-symbols-outlined text-[18px]" style={{ color: 'var(--color-error)' }}>error</span>
          <span className="font-label-md text-label-md font-semibold" style={{ color: 'var(--color-error)' }}>回答失败</span>
          {message.error && (
            <span
              className="ml-auto font-label-md text-[10px] truncate max-w-[60%]"
              style={{ color: 'color-mix(in srgb, var(--color-error) 80%, transparent)' }}
              title={message.error}
            >
              {message.error}
            </span>
          )}
        </div>

        {/* 失败提示正文（用户可读） */}
        <p className="font-body-md text-body-md leading-relaxed whitespace-pre-wrap break-words mb-2">
          {message.content}
        </p>

        {/* 失败原因（详细） */}
        {message.error && (
          <p
            className="font-label-md text-[11px] mb-3"
            style={{ color: 'color-mix(in srgb, var(--color-error) 80%, transparent)' }}
          >
            原因：{message.error}
          </p>
        )}

        {/* 操作按钮栏：仅保留「重试」，隐藏点赞/踩/重新生成 */}
        <div
          className="flex items-center gap-2 mt-3 pt-2"
          style={{ borderTop: '1px solid color-mix(in srgb, var(--color-error) 20%, transparent)' }}
        >
          <button
            onClick={(e) => {
              if (beforeActionClick) beforeActionClick(e)
              if (onRetry) onRetry(message.id)
            }}
            className="transition-colors p-1 rounded flex items-center gap-1"
            style={{ color: 'var(--color-error)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--color-on-error-container)'
              e.currentTarget.style.backgroundColor = 'color-mix(in srgb, var(--color-error) 10%, transparent)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--color-error)'
              e.currentTarget.style.backgroundColor = 'transparent'
            }}
            title="重试"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">refresh</span>
            <span className="font-label-md text-label-md">重试</span>
          </button>
          <span
            className="font-label-md text-[10px] ml-auto"
            style={{ color: 'color-mix(in srgb, var(--color-error) 70%, transparent)' }}
          >
            本次回答未计入有效反馈
          </span>
        </div>
      </div>
    </div>
  )
}

/* AI 消息组件 */
function AIMessage({ message, onFeedback, onRegenerate, beforeActionClick, regenState, onRetry }) {
  // regenState 可能为 undefined，或包含 { phase, thinking, answer, fullContent, fullThinking }
  const phase = regenState?.phase
  const isLoading = phase === 'loading'
  const isThinking = phase === 'thinking'
  const isAnswering = phase === 'answer'
  const isDone = phase === 'done'
  const isStopped = phase === 'stopped'
  const isBusy = isLoading || isThinking || isAnswering

  // 失败态：未进入 regen 流程时，直接走失败气泡（与成功态完全不同的视觉）
  const isFailed = !regenState && message.status === 'failed'
  if (isFailed) {
    return (
      <FailureBubble
        message={message}
        onRetry={onRetry}
        beforeActionClick={beforeActionClick}
      />
    )
  }

  // 思考框展开/收起状态：思考中强制展开，思考完成后默认收起
  const [isThinkingExpanded, setIsThinkingExpanded] = useState(false)
  useEffect(() => {
    if (isThinking) {
      setIsThinkingExpanded(true)
    } else if (isAnswering || isDone || isStopped) {
      // 思考完成后自动收起
      setIsThinkingExpanded(false)
    } else if (!regenState) {
      setIsThinkingExpanded(false)
    }
  }, [phase, regenState])

  // 仅在 done 阶段解析最终内容（含代码块等），避免在流式输出阶段反复解析
  const finalParsed = isDone
    ? parseMessageContent(regenState.fullContent)
    : null

  // 初始（未进入 regen）状态下，直接使用消息自身 content 解析
  const initialParsed = !regenState
    ? parseMessageContent(message.content || '')
    : null

  return (
    <div className="flex gap-3 max-w-[85%] self-start w-full">
      <div
        className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-white mt-1"
        style={{ backgroundColor: 'var(--color-primary-container)' }}
      >
        <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1", color: 'var(--color-on-primary-container)' }}>robot_2</span>
      </div>
      <div
        className="rounded-2xl rounded-tl-sm px-4 py-3 w-full max-w-[1000px] relative transition-colors duration-200"
        style={{
          backgroundColor: 'var(--color-surface-container-low)',
          color: 'var(--color-on-surface)',
          border: '1px solid color-mix(in srgb, var(--color-surface-variant) 50%, transparent)',
        }}
      >
        {/* 1. 加载状态 - 模型处理中（持续 5 秒） */}
        {isLoading && (
          <div className="flex items-center gap-3 py-3" role="status" aria-live="polite">
            <div className="relative w-5 h-5 flex-shrink-0">
              <div className="absolute inset-0 rounded-full border-2" style={{ borderColor: 'var(--color-surface-variant)' }}></div>
              <div className="absolute inset-0 rounded-full border-2 border-transparent animate-spin" style={{ borderTopColor: 'var(--color-primary)' }}></div>
            </div>
            <div className="ml-auto flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ backgroundColor: 'var(--color-primary)', animationDelay: '0ms' }}></span>
              <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ backgroundColor: 'var(--color-primary)', animationDelay: '150ms' }}></span>
              <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ backgroundColor: 'var(--color-primary)', animationDelay: '300ms' }}></span>
            </div>
          </div>
        )}

        {/* 2. 思考过程区 - 流式输出、自动收起、可手动展开（最多 10 行） */}
        {!isLoading && regenState && (
          <ThinkingSection
            thinking={regenState.thinking}
            fullThinking={regenState.fullThinking}
            phase={phase}
            isExpanded={isThinkingExpanded}
            onToggle={() => setIsThinkingExpanded((v) => !v)}
          />
        )}

        {/* 2'. 初始页面加载时，也展示一个 mock 的思考过程框（默认收起，可手动展开） */}
        {!isLoading && !regenState && (
          <ThinkingSection
            thinking={THINKING_TEXT}
            fullThinking={THINKING_TEXT}
            phase="done"
            isExpanded={isThinkingExpanded}
            onToggle={() => setIsThinkingExpanded((v) => !v)}
          />
        )}

        {/* 3. 答案内容区 */}
        {!isLoading && (
          isDone && finalParsed ? (
            <>
              {finalParsed.blocks.map((block, i) => (
                <RenderBlock
                  key={`b-${i}`}
                  block={block}
                  codeBlocks={finalParsed.codeBlocks}
                  imageUrl="https://lh3.googleusercontent.com/aida-public/AB6AXuBG1UttqyI-AybsxVk-nsZSZ5FJWlBfVW2bA1OJjrRX2Qzv0TES4AtcwY0TQl7ySsNwZm2Kk3fBkSdm_YpR7jG6yhuPlxkAgY-Frbb8_L8ubXTw7dO3eLoVaxHgiPuD-7xfRC4e0WhDnXeajaOyacnVmQfoF0O9tcaiXD4rXvHTFiSdUEKuFZif-lH8PsO8CdCpoICn7ejusZEtV208Q0iKLaVRNKBpnLNaHvq-tLCJ7E3Pmgbkf1ltMxtNuFgm2t5cl4_ORYq2dGg"
                />
              ))}
            </>
          ) : !regenState && initialParsed && initialParsed.blocks.length > 0 ? (
            // 初始页面加载：渲染消息自带的 mock 内容（标题/段落/列表/表格/代码块/图片）
            <>
              {initialParsed.blocks.map((block, i) => (
                <RenderBlock
                  key={`ib-${i}`}
                  block={block}
                  codeBlocks={initialParsed.codeBlocks}
                  imageUrl="https://lh3.googleusercontent.com/aida-public/AB6AXuBG1UttqyI-AybsxVk-nsZSZ5FJWlBfVW2bA1OJjrRX2Qzv0TES4AtcwY0TQl7ySsNwZm2Kk3fBkSdm_YpR7jG6yhuPlxkAgY-Frbb8_L8ubXTw7dO3eLoVaxHgiPuD-7xfRC4e0WhDnXeajaOyacnVmQfoF0O9tcaiXD4rXvHTFiSdUEKuFZif-lH8PsO8CdCpoICn7ejusZEtV208Q0iKLaVRNKBpnLNaHvq-tLCJ7E3Pmgbkf1ltMxtNuFgm2t5cl4_ORYq2dGg"
                />
              ))}
            </>
          ) : isAnswering ? (
            <p
              className="font-body-md text-body-md mb-3 last:mb-0 whitespace-pre-wrap leading-relaxed"
              style={{ color: 'var(--color-on-surface)' }}
            >
              {regenState.answer}
              <BlinkingCaret />
            </p>
          ) : isStopped ? (
            // 中断状态：保留已生成的部分内容，无光标
            <div>
              <div
                className="flex items-center gap-2 mb-2"
                style={{ color: 'var(--color-outline)' }}
              >
                <span className="material-symbols-outlined text-[14px]">do_not_disturb_on</span>
                <span className="font-label-md text-[10px]">已停止生成（显示部分内容）</span>
              </div>
              <p
                className="font-body-md text-body-md mb-3 last:mb-0 whitespace-pre-wrap leading-relaxed"
                style={{ color: 'var(--color-on-surface)' }}
              >
                {regenState.answer}
              </p>
            </div>
          ) : null
        )}

        {/* 操作按钮栏 - 已恢复 */}
        <div
          className="flex items-center gap-2 mt-3 pt-2"
          style={{ borderTop: '1px solid color-mix(in srgb, var(--color-surface-variant) 50%, transparent)' }}
        >
          <button
            onClick={(e) => {
              beforeActionClick && beforeActionClick(e)
              onFeedback(message.id, 'positive')
            }}
            disabled={isBusy}
            className="transition-colors p-1 rounded disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ color: 'var(--color-outline)' }}
            onMouseEnter={(e) => { if (!isBusy) { e.currentTarget.style.color = 'var(--color-primary)'; e.currentTarget.style.backgroundColor = 'var(--color-surface-container)' } }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-outline)'; e.currentTarget.style.backgroundColor = 'transparent' }}
            title="有帮助"
          >
            <span className="material-symbols-outlined text-[18px]">thumb_up</span>
          </button>
          <button
            onClick={(e) => {
              beforeActionClick && beforeActionClick(e)
              onFeedback(message.id, 'negative')
            }}
            disabled={isBusy}
            className="transition-colors p-1 rounded disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ color: 'var(--color-outline)' }}
            onMouseEnter={(e) => { if (!isBusy) { e.currentTarget.style.color = 'var(--color-error)'; e.currentTarget.style.backgroundColor = 'var(--color-surface-container)' } }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-outline)'; e.currentTarget.style.backgroundColor = 'transparent' }}
            title="无帮助"
          >
            <span className="material-symbols-outlined text-[18px]">thumb_down</span>
          </button>
          <button
            onClick={(e) => {
              beforeActionClick && beforeActionClick(e)
              onRegenerate(message.id)
            }}
            disabled={isBusy}
            className="transition-colors p-1 rounded ml-auto flex items-center gap-1 disabled:opacity-60 disabled:cursor-not-allowed"
            style={{ color: 'var(--color-outline)' }}
            onMouseEnter={(e) => { if (!isBusy) { e.currentTarget.style.color = 'var(--color-primary)'; e.currentTarget.style.backgroundColor = 'var(--color-surface-container)' } }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-outline)'; e.currentTarget.style.backgroundColor = 'transparent' }}
            title="重新生成"
          >
            {isBusy ? (
              <>
                <div className="w-[18px] h-[18px] flex-shrink-0 relative">
                  <div className="absolute inset-0 rounded-full border-2" style={{ borderColor: 'var(--color-surface-variant)' }}></div>
                  <div className="absolute inset-0 rounded-full border-2 border-transparent animate-spin" style={{ borderTopColor: 'var(--color-primary)' }}></div>
                </div>
                <span className="font-label-md text-label-md">生成中</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[18px]">refresh</span>
                <span className="font-label-md text-label-md">重新生成</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function ChatPage() {
  const { id } = useParams()
  const messagesEndRef = useRef(null)
  // 标记是否抑制自动滚动（由操作按钮组点击触发后置为 true）
  const suppressAutoScrollRef = useRef(false)
  // 重新生成流式状态映射：{ [messageId]: { phase, thinking, answer, fullContent, fullThinking } }
  const [regenStates, setRegenStates] = useState({})
  // 中断信号：{ [msgId]: true }，同步可读，避免 useState 异步更新导致的延迟
  const stopFlagsRef = useRef({})
  // 当前正在 loading 阶段的 setTimeout id，用于中断时立即清除
  const loadingTimeoutRef = useRef(null)

  const {
    messages,
    sendMessage,
    submitFeedback,
    regenerateMessage,
    loading
  } = useMessages(id)

  // 用于在 await 之后读取最新的 messages（必须在 messages 解构之后声明，避免 TDZ）
  const messagesRef = useRef(messages)
  useEffect(() => { messagesRef.current = messages }, [messages])

  // 是否处于任何流式/思考/加载阶段（用于 ChatInput 切换为"停止"按钮）
  const isStreaming = Object.values(regenStates).some(
    (s) => s.phase === 'loading' || s.phase === 'thinking' || s.phase === 'answer'
  )

  // 自动滚动到底部（操作按钮触发的状态更新需要抑制滚动）
  useEffect(() => {
    if (suppressAutoScrollRef.current) {
      suppressAutoScrollRef.current = false
      return
    }
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // 流式输出驱动：逐字推进 thinking 与 answer 阶段，并响应停止信号
  useEffect(() => {
    const interval = setInterval(() => {
      setRegenStates((prev) => {
        const next = { ...prev }
        let changed = false
        for (const msgId in next) {
          const s = next[msgId]
          // 检查停止信号：若已停止则保持当前内容，置为 stopped 阶段
          if (stopFlagsRef.current[msgId] && (s.phase === 'thinking' || s.phase === 'answer')) {
            next[msgId] = { ...s, phase: 'stopped' }
            stopFlagsRef.current[msgId] = false
            changed = true
            continue
          }
          if (s.phase === 'thinking') {
            if (s.thinking.length < s.fullThinking.length) {
              const newLen = Math.min(
                s.thinking.length + 2,
                s.fullThinking.length
              )
              next[msgId] = {
                ...s,
                thinking: s.fullThinking.slice(0, newLen),
              }
              changed = true
            } else {
              next[msgId] = { ...s, phase: 'answer' }
              changed = true
            }
          } else if (s.phase === 'answer') {
            if (s.answer.length < s.fullContent.length) {
              const newLen = Math.min(
                s.answer.length + 4,
                s.fullContent.length
              )
              next[msgId] = {
                ...s,
                answer: s.fullContent.slice(0, newLen),
              }
              changed = true
            } else {
              next[msgId] = { ...s, phase: 'done' }
              changed = true
            }
          }
        }
        return changed ? next : prev
      })
    }, 30)
    return () => clearInterval(interval)
  }, [])

  // 卸载时清理 loading 计时器
  useEffect(() => {
    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current)
        loadingTimeoutRef.current = null
      }
    }
  }, [])

  // 操作按钮组点击前的统一处理：阻止默认滚动行为并标记抑制自动滚动
  const beforeActionButtonClick = (e) => {
    if (e && typeof e.preventDefault === 'function') {
      e.preventDefault()
    }
    if (e && typeof e.stopPropagation === 'function') {
      e.stopPropagation()
    }
    // 标记下一次 messages 变更时不滚动到底部
    suppressAutoScrollRef.current = true
  }

  // 处理发送消息
  const handleSend = async (content) => {
    await sendMessage(content)
  }

  // 处理反馈
  const handleFeedback = async (messageId, feedback) => {
    await submitFeedback(messageId, feedback)
  }

  // 处理停止：中断当前流式/loading 阶段，保留已生成的内容
  const handleStop = () => {
    // 找到当前正在进行中的消息 id
    const activeId = Object.keys(regenStates).find(
      (mid) => {
        const p = regenStates[mid].phase
        return p === 'loading' || p === 'thinking' || p === 'answer'
      }
    )
    if (!activeId) return

    // 清除 loading 计时器
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current)
      loadingTimeoutRef.current = null
    }

    const current = regenStates[activeId]
    if (current.phase === 'loading') {
      // loading 阶段没有任何内容产出，直接移除
      stopFlagsRef.current[activeId] = false
      setRegenStates((prev) => {
        const next = { ...prev }
        delete next[activeId]
        return next
      })
    } else {
      // 流式阶段：标记停止，下一次 tick 会将 phase 置为 'stopped'
      stopFlagsRef.current[activeId] = true
    }
  }

  // 处理失败消息的重试：复用重新生成流程，失败状态由 useMessages 自动清除，
  // 新内容由 handleRegenerate 优先从 message.retry_content 读取
  const handleRetry = async (messageId) => {
    await handleRegenerate(messageId)
  }

  // 处理重新生成（带加载/思考/流式输出的完整阶段）
  const handleRegenerate = async (messageId) => {
    // 若该消息已在流式中则忽略
    const current = regenStates[messageId]
    if (current && current.phase !== 'done' && current.phase !== 'stopped') return

    // 清理可能残留的 stop 信号
    stopFlagsRef.current[messageId] = false

    // 阶段 1：进入 loading，立即显示模型处理动画
    setRegenStates((prev) => ({
      ...prev,
      [messageId]: {
        phase: 'loading',
        thinking: '',
        answer: '',
        fullContent: '',
        fullThinking: THINKING_TEXT,
      },
    }))

    // 初始加载状态持续 5 秒后切换为"思考中"
    await new Promise((resolve) => {
      loadingTimeoutRef.current = setTimeout(() => {
        loadingTimeoutRef.current = null
        resolve()
      }, 5000)
    })

    // 若已被中断则直接返回
    if (stopFlagsRef.current[messageId]) {
      stopFlagsRef.current[messageId] = false
      setRegenStates((prev) => {
        const next = { ...prev }
        delete next[messageId]
        return next
      })
      return
    }

    // 调用实际的重新生成接口
    try {
      await regenerateMessage(messageId)
    } catch (e) {
      // 失败则清除该消息的 regen 状态
      setRegenStates((prev) => {
        const next = { ...prev }
        delete next[messageId]
        return next
      })
      return
    }

    // 再次检查停止信号
    if (stopFlagsRef.current[messageId]) {
      stopFlagsRef.current[messageId] = false
      return
    }

    // 从最新 messages 中读取重新生成后的内容
    // 失败态消息：优先使用 retry_content 作为"重试成功"的内容；否则回退到 content
    const updatedMsg = messagesRef.current.find((m) => m.id === messageId)
    const newContent =
      updatedMsg?.retry_content ||
      updatedMsg?.content ||
      ''

    // 阶段 2：进入 thinking 阶段，流式输出思考过程
    setRegenStates((prev) => ({
      ...prev,
      [messageId]: {
        phase: 'thinking',
        thinking: '',
        answer: '',
        fullContent: newContent,
        fullThinking: THINKING_TEXT,
      },
    }))
  }

  return (
    <main
      className="fixed top-0 left-[280px] right-0 bottom-0 flex flex-col z-0 transition-colors duration-200"
      style={{ backgroundColor: 'var(--color-background)' }}
    >
      {/* 消息流滚动区域 - 在 fixed 主区内独立滚动；pb-40 保证最后一条消息不被底部输入条遮挡 */}
      <div className="flex-1 overflow-y-auto pt-[80px] px-4 md:px-10 pb-40 flex flex-col items-center no-scrollbar">
        <div className="w-full max-w-[1200px] flex flex-col gap-6">
          {/* 日期分隔线 */}
          {!loading && messages.length > 0 && (
            <div className="text-center my-4">
              <span
                className="font-label-md text-label-md px-3 py-1"
                style={{
                  color: 'var(--color-outline)',
                  backgroundColor: 'var(--color-background)',
                }}
              >
                今天
              </span>
            </div>
          )}

          {/* 消息列表 */}
          {loading ? (
            /* 加载状态 - 旋转动画 */
            <div className="flex justify-center py-12">
              <div
                className="animate-spin w-8 h-8 border-2 rounded-full"
                style={{
                  borderColor: 'var(--color-surface-variant)',
                  borderTopColor: 'var(--color-primary)',
                }}
              ></div>
            </div>
          ) : messages.length === 0 ? (
            /* 空状态：第一轮对话必须由用户主动发起，不显示任何 AI 问候 */
            <div className="flex flex-col items-center justify-center py-20 gap-3 select-none" data-state="empty-first-round">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center"
                style={{
                  backgroundColor: 'var(--color-surface-container-low)',
                  border: '1px solid var(--color-surface-variant)',
                }}
              >
                <span
                  className="material-symbols-outlined text-[28px]"
                  style={{
                    color: 'var(--color-outline)',
                    fontVariationSettings: "'FILL' 0,wght' 300",
                  }}
                >
                  forum
                </span>
              </div>
              <div className="text-center">
                <p
                  className="font-label-md text-label-md"
                  style={{ color: 'var(--color-on-surface-variant)' }}
                >
                  在下方输入框中开始第一轮对话
                </p>
                <p
                  className="font-label-md text-[11px] mt-1"
                  style={{ color: 'var(--color-outline)' }}
                >
                  系统不会在用户输入前发送任何消息
                </p>
              </div>
            </div>
          ) : (
            /* 消息列表渲染 */
            messages.map((msg) => (
              msg.role === 'user'
                ? <UserMessage key={msg.id} message={msg} />
                : <AIMessage
                    key={msg.id}
                    message={msg}
                    onFeedback={handleFeedback}
                    onRegenerate={handleRegenerate}
                    onRetry={handleRetry}
                    beforeActionClick={beforeActionButtonClick}
                    regenState={regenStates[msg.id]}
                  />
            ))
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* 底部输入区域 - 与消息滚动区平级，flex-shrink-0 锚定在页面底部，鼠标滚动时不会随之移动 */}
      <div
        className="flex-shrink-0 w-full px-4 md:px-10 pt-4 pb-4 md:pb-6 flex justify-center transition-colors duration-200"
        style={{
          backgroundColor: 'var(--color-background)',
          borderTop: '1px solid color-mix(in srgb, var(--color-surface-variant) 60%, transparent)',
        }}
      >
        <div className="w-full max-w-[1200px]">
          <ChatInput
            onSend={handleSend}
            disabled={loading}
            maxWidth="max-w-[1200px]"
            streaming={isStreaming}
            onStop={handleStop}
          />

          <div className="text-center mt-2">
            <span
              className="text-[11px]"
              style={{ color: 'var(--color-on-surface-variant)' }}
              data-stitch-orig-opacity="0"
            >
              AI 可能会产生不准确信息，请核实重要内容。
            </span>
          </div>
        </div>
      </div>
    </main>
  )
}
