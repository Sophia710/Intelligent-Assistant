import { useState, useCallback, useEffect } from 'react'
import api from '../services/api'

/**
 * 消息管理 Hook
 * 提供：发送消息、获取历史消息、提交反馈、重新生成
 */

/* ============ Mock 数据集（按 conversationId 分发） ============
 * 设计原则：
 * - conv-001：默认第一轮对话，必须由用户主动发起，无任何 AI 问候 / 初始消息
 * - conv-success-demo：成功示例（卫星互联网测试链路仿真方案）
 * - conv-fail-demo：失败示例（AI 返回明确失败提示 + 视觉反馈）
 *
 * 失败消息的字段约定：
 *   status: 'failed'                 // 触发失败状态 UI
 *   content: '...'                   // 失败提示文本（用户可读）
 *   error: '...'                     // 失败原因（细颗粒度）
 *   retry_content: '...'             // 点击「重试」时使用的成功内容
 * ============================================================== */

const SUCCESS_AI_CONTENT = `## 卫星互联网测试链路仿真方案

下面给出一份端到端的仿真方案，覆盖场景设计、参数建模、指标采集与可视化。整体流程在 **地面段 → 空间段 → 业务段** 三段之间闭环运行，可根据具体星座（LEO / MEO / GEO）调整传播模型。

### 1. 仿真链路组成

- **地面段**：用户终端（UT）、信关站（Gateway）、核心网接入点；
- **空间段**：星座卫星载荷，星间链路（ISL，仅 LEO 星座常见）；
- **业务段**：测控站、网管中心、QoS 策略下发与采集探针。

### 2. 关键仿真参数

> 在脚本入口集中定义，便于多场景批量运行。

| 参数         | LEO 场景          | GEO 场景       | 备注                          |
| ------------ | ----------------- | -------------- | ----------------------------- |
| 单跳时延     | 20–40 ms          | ~240 ms        | 不含排队与处理                |
| 链路余量     | ≥ 6 dB            | ≥ 10 dB        | 晴空，雨衰另算                |
| 调制编码     | QPSK–64QAM 自适应 | 8PSK 为主      | 按 C/N 动态切换               |
| 波束切换周期 | 1–5 s             | 几乎无切换     | 切换瞬间可能产生 50–200 ms 抖动 |

### 3. 仿真核心代码（ns-3 片段）

\`\`\`python
# sat_link_sim.py
import ns3

def build_topology(nodes, isls=True):
    """构建星地 + 星间链路的简化拓扑"""
    for n in nodes:
        ns3.Install(n)
    if isls:
        for a, b in zip(nodes, nodes[1:]):
            ns3.PointToPoint(a, b).SetDelay("20ms")
    return nodes
\`\`\`

### 4. 测试建议

1. **晴空 / 雨天分组**：分别在 0 dB、3 dB、6 dB 雨衰下进行多轮采样；
2. **不同时段采样**：覆盖业务高峰（20:00–22:00）与低峰（03:00–05:00）；
3. **时钟同步**：地面端与卫星端采用 PTP / NTP 同步，时戳精度 ≤ 1 ms；
4. **可视化**：将 RTT、丢包率、吞吐量绘制成时序图，便于定位波束切换对业务的影响。

如果需要，我可以进一步给出 **OMNeT++** 或 **STK + Matlab** 的等价实现。

![AI 生成的卫星互联网测试链路仿真图](https://lh3.googleusercontent.com/aida-public/AB6AXuBG1UttqyI-AybsxVk-nsZSZ5FJWlBfVW2bA1OJjrRX2Qzv0TES4AtcwY0TQl7ySsNwZm2Kk3fBkSdm_YpR7jG6yhuPlxkAgY-Frbb8_L8ubXTw7dO3eLoVaxHgiPuD-7xfRC4e0WhDnXeajaOyacnVmQfoF0O9tcaiXD4rXvHTFiSdUEKuFZif-lH8PsO8CdCpoICn7ejusZEtV208Q0iKLaVRNKBpnLNaHvq-tLCJ7E3Pmgbkf1ltMxtNuFgm2t5cl4_ORYq2dGg)`

const MOCK_CONVERSATIONS = {
  // 默认第一轮对话：必须由用户主动发起，无任何 AI 消息
  'conv-001': [],

  // 成功示例：保留之前的设计，便于对照查看
  'conv-success-demo': [
    {
      id: 'mock-user-1',
      role: 'user',
      content: '请帮我设计一个卫星互联网测试链路的仿真方案，重点关注端到端时延、丢包率与吞吐量。',
      created_at: '2026-06-09T10:00:00Z',
    },
    {
      id: 'mock-ai-1',
      role: 'assistant',
      content: SUCCESS_AI_CONTENT,
      created_at: '2026-06-09T10:00:05Z',
    },
  ],

  // 失败示例：清晰展示大模型回答失败场景，含失败提示与可重试入口
  'conv-fail-demo': [
    {
      id: 'mock-fail-user-1',
      role: 'user',
      content: '请帮我分析一下今天上午 10:00 发生的 LEO-08 卫星链路丢包率突增事件，给出可能的原因。',
      created_at: '2026-06-09T11:20:00Z',
    },
    {
      id: 'mock-fail-ai-1',
      role: 'assistant',
      status: 'failed',
      content: '抱歉，我暂时无法回答这个问题。当前查询涉及尚未接入知识库的内部告警事件（LEO-08 链路质量告警），请补充以下信息后重试：\n\n1. 告警事件 ID（Alert ID）\n2. 发生时段（UTC）\n3. 受影响波束编号\n\n或联系运维值班同事协助处理。',
      error: '大模型服务返回 503：上游推理服务暂时不可用',
      retry_content: '## LEO-08 链路丢包率突增事件分析\n\n根据 10:00 UTC 的告警上下文，丢包率突增的可能原因按概率从高到低排序如下：\n\n### 1. 波束切换瞬时抖动（高概率）\n- LEO 卫星单星过顶时间约 5–8 分钟，**波束切换周期 1–5 s**；\n- 切换瞬间通常会引入 **50–200 ms 的额外时延** 与少量丢包；\n- 建议：核对当时是否处于波束交接窗口。\n\n### 2. 雨衰 / 大气吸收（中高概率）\n- 上午 10:00 区域可能有对流活动，Ka/Ku 频段雨衰可达 **3–6 dB**；\n- 建议：交叉核对同期天气雷达数据。\n\n### 3. 地面段拥塞（中概率）\n- 检查 Gateway 端口利用率是否超过 80%；\n- 必要时启用备用 Gateway 路径。\n\n### 后续动作\n1. 拉取 09:55–10:05 的 **PRB 利用率、调制编码 MCS、C/N** 时序图；\n2. 与同期正常链路的基线对比，确认是否单星问题；\n3. 若 15 分钟内未恢复，按预案切换到备份波束。',
      created_at: '2026-06-09T11:20:08Z',
    },
  ],
}

function useMessages(conversationId) {
  // 初始状态：按 conversationId 命中 mock，否则返回空数组（强制首轮用户发起）
  const [messages, setMessages] = useState(() => MOCK_CONVERSATIONS[conversationId] ?? [])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // 获取指定对话的消息历史
  const fetchMessages = async (convId) => {
    if (!convId) return
    setLoading(true)
    setError(null)
    try {
      const res = await api.get(`/conversations/${convId}/messages`)
      // 后端返回非空数组时覆盖默认 mock；返回空数组则保留默认数据
      if (Array.isArray(res.data) && res.data.length > 0) {
        setMessages(res.data)
      }
    } catch (err) {
      // 后端不可用时保留 mock 数据，不向用户暴露错误
      console.warn('获取消息历史失败，使用默认模拟数据:', err?.message)
    } finally {
      setLoading(false)
    }
  }

  // 当 conversationId 变化时，自动加载消息历史
  useEffect(() => {
    if (conversationId) {
      fetchMessages(conversationId)
    } else {
      setMessages([])
    }
  }, [conversationId])

  // 发送消息
  const sendMessage = useCallback(async (content) => {
    if (!conversationId || !content.trim()) return

    // 先乐观更新 UI：添加用户消息
    const userMessage = {
      id: `temp-${Date.now()}`,
      role: 'user',
      content: content.trim(),
      created_at: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, userMessage])
    setLoading(true)
    setError(null)

    try {
      const res = await api.post(`/conversations/${conversationId}/messages`, {
        content: content.trim(),
      })
      // 追加 AI 回复
      if (res.data) {
        setMessages((prev) => [...prev, res.data])
      }
    } catch (err) {
      setError(err.message)
      console.error('发送消息失败:', err)
      // 移除临时用户消息
      setMessages((prev) => prev.filter((m) => m.id !== userMessage.id))
    } finally {
      setLoading(false)
    }
  }, [conversationId])

  // 对消息进行反馈（点赞/踩）
  const submitFeedback = async (messageId, feedback) => {
    try {
      await api.put(`/messages/${messageId}/feedback`, { feedback })
      // 更新本地状态
      setMessages((prev) =>
        prev.map((m) =>
          m.id === messageId ? { ...m, feedback } : m
        )
      )
    } catch (err) {
      console.error('提交反馈失败:', err)
    }
  }

  // 重新生成某条 AI 回复
  const regenerateMessage = async (messageId) => {
    // 清除失败态标记：进入 regen 流程后，消息应恢复为正常气泡
    setMessages((prev) =>
      prev.map((m) =>
        m.id === messageId ? { ...m, status: undefined } : m
      )
    )
    try {
      const res = await api.post(`/messages/${messageId}/regenerate`)
      if (res.data) {
        setMessages((prev) =>
          prev.map((m) => (m.id === messageId ? res.data : m))
        )
      }
    } catch (err) {
      console.error('重新生成回复失败:', err)
    }
  }

  return {
    messages,
    setMessages,
    loading,
    error,
    fetchMessages,
    sendMessage,
    submitFeedback,
    regenerateMessage,
  }
}

export default useMessages
