const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');

/**
 * 获取对话列表
 */
function getConversations(req, res) {
  try {
    const conversations = db.prepare(`
      SELECT c.*,
        a.name as agent_name, a.icon as agent_icon, a.color_theme as agent_color,
        (SELECT COUNT(*) FROM messages m WHERE m.conversation_id = c.id) as message_count,
        (SELECT content FROM messages m WHERE m.conversation_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message
      FROM conversations c
      LEFT JOIN agents a ON c.agent_id = a.id
      WHERE c.user_id = 'user-001'
      ORDER BY c.updated_at DESC
    `).all();

    res.json({ success: true, data: conversations });
  } catch (error) {
    res.status(500).json({ success: false, error: '获取对话列表失败: ' + error.message });
  }
}

/**
 * 获取对话详情（含消息）
 */
function getConversationById(req, res) {
  try {
    const { id } = req.params;
    const conversation = db.prepare(`
      SELECT c.*, a.name as agent_name, a.icon as agent_icon, a.description as agent_description, a.color_theme
      FROM conversations c
      LEFT JOIN agents a ON c.agent_id = a.id
      WHERE c.id = ?
    `).get(id);

    if (!conversation) {
      return res.status(404).json({ success: false, error: '对话不存在' });
    }

    // 获取该对话的所有消息
    const messages = db.prepare(`
      SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at ASC
    `).all(id);

    res.json({
      success: true,
      data: {
        ...conversation,
        messages
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: '获取对话详情失败: ' + error.message });
  }
}

/**
 * 创建新对话
 */
function createConversation(req, res) {
  try {
    const { title, agent_id } = req.body;
    const id = uuidv4();

    db.prepare(`
      INSERT INTO conversations (id, title, agent_id, user_id, created_at, updated_at)
      VALUES (?, ?, ?, 'user-001', datetime('now'), datetime('now'))
    `).run(id, title || '新对话', agent_id || null);

    const conversation = db.prepare('SELECT * FROM conversations WHERE id = ?').get(id);

    res.status(201).json({ success: true, data: conversation, message: '对话创建成功' });
  } catch (error) {
    res.status(500).json({ success: false, error: '创建对话失败: ' + error.message });
  }
}

/**
 * 删除对话
 */
function deleteConversation(req, res) {
  try {
    const { id } = req.params;

    // 先删除关联消息
    db.prepare('DELETE FROM messages WHERE conversation_id = ?').run(id);
    // 再删除对话
    const result = db.prepare('DELETE FROM conversations WHERE id = ?').run(id);

    if (result.changes === 0) {
      return res.status(404).json({ success: false, error: '对话不存在' });
    }

    res.json({ success: true, message: '对话删除成功' });
  } catch (error) {
    res.status(500).json({ success: false, error: '删除对话失败: ' + error.message });
  }
}

/**
 * 获取某对话的所有消息
 */
function getMessagesByConversationId(req, res) {
  try {
    const { id } = req.params;

    // 验证对话存在
    const conversation = db.prepare('SELECT id FROM conversations WHERE id = ?').get(id);
    if (!conversation) {
      return res.status(404).json({ success: false, error: '对话不存在' });
    }

    const messages = db.prepare(`
      SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at ASC
    `).all(id);

    res.json({ success: true, data: messages });
  } catch (error) {
    res.status(500).json({ success: false, error: '获取消息失败: ' + error.message });
  }
}

/**
 * 发送消息（返回 Mock AI 回复）
 */
function sendMessage(req, res) {
  try {
    const { id: conversationId } = req.params;
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ success: false, error: '消息内容不能为空' });
    }

    // 验证对话存在
    const conversation = db.prepare('SELECT * FROM conversations WHERE id = ?').get(conversationId);
    if (!conversation) {
      return res.status(404).json({ success: false, error: '对话不存在' });
    }

    // 保存用户消息
    const userMsgId = uuidv4();
    db.prepare(`
      INSERT INTO messages (id, conversation_id, role, content, feedback, metadata, created_at)
      VALUES (?, ?, ?, 'user', 'none', '{}', datetime('now'))
    `).run(userMsgId, conversationId, content);

    // 更新对话时间
    db.prepare("UPDATE conversations SET updated_at = datetime('now') WHERE id = ?").run(conversationId);

    // 模拟 AI 延迟回复 (500ms - 1500ms)
    const delay = Math.floor(Math.random() * 1000) + 500;

    setTimeout(() => {
      // 生成 Mock AI 回复
      const aiReply = generateMockAIReply(content);

      // 保存 AI 消息
      const aiMsgId = uuidv4();
      db.prepare(`
        INSERT INTO messages (id, conversation_id, role, content, feedback, metadata, created_at)
        VALUES (?, ?, ?, 'assistant', 'none', ?, datetime('now'))
      `).run(aiMsgId, conversationId, aiReply.content, JSON.stringify(aiReply.metadata));

      db.prepare("UPDATE conversations SET updated_at = datetime('now') WHERE id = ?").run(conversationId);
    }, delay);

    // 立即返回用户消息已接收，AI 回复将通过轮询获取
    res.status(201).json({
      success: true,
      data: {
        userMessage: { id: userMsgId, role: 'user', content },
        aiDelay: delay
      },
      message: '消息已发送，AI 正在思考中...'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: '发送消息失败: ' + error.message });
  }
}

/**
 * 生成 Mock AI 回复
 */
function generateMockAIReply(userMessage) {
  const replies = [
    {
      content: `感谢你的提问！关于 **"${userMessage.slice(0, 30)}..."** ，我来详细分析一下：

## 📋 分析结果

根据当前知识库中的相关文档和测试数据，我为你整理了以下要点：

### 核心结论
1. 该问题在卫星互联网场景下属于**常见类型**，已有标准化的处理流程
2. 建议优先参考《协议规范库》中 ITU-R S.2172 相关章节
3. 如需进一步验证，可调用"**网络性能/压力测试**"智能体进行实测

### 参考代码

\`\`\`python
# 卫星链路质量评估示例
def evaluate_link_quality(snr_db, ber_threshold=1e-5):
    \"\"\"根据信噪比评估链路质量\"\"\"
    # 简化的链路质量模型
    if snr_db >= 15:
        return "优秀 ✅", "适合高清视频传输"
    elif snr_db >= 10:
        return "良好 👍", "适合语音和数据业务"
    elif snr_db >= 5:
        return "一般 ⚠️", "建议启用前向纠错"
    else:
        return "较差 ❌", "需要增强信号或切换波束"
\`\`\`

> 💡 提示：如需更详细的参数配置方案，请告诉我你的具体使用场景！`,
      metadata: { model: 'mock-gpt-4', tokens: 386, latency_ms: 820 }
    },
    {
      content: `好的，这是一个很好的问题！让我从 **星地一体化** 的视角来回答：

## 🔍 问题分析

你提到的问题涉及以下几个关键层面：

| 维度 | 关键因素 | 推荐措施 |
|------|----------|----------|
| 链路层 | 自由空间损耗、大气衰减 | 自适应编码调制(ACM) |
| 网络层 | 路由切换时延、拓扑动态性 | SDN控制器优化 |
| 应用层 | 业务QoS保障 | 边缘计算下沉 |

## 🛠️ 实施建议

\`\`\`javascript
// 星地协同资源调度策略示例
const schedulingPolicy = {
  priority: ['emergency', 'voice', 'video', 'data'],
  allocation: {
    method: 'weighted_fair_queue',
    params: {
      weights: { emergency: 10, voice: 5, video: 3, data: 1 },
      maxLatencyMs: { voice: 300, video: 500, data: 2000 }
    }
  },
  fallback: 'ground_relay'  // 地面中继兜底
};
\`\`\`

需要我针对某个具体维度展开说明吗？`,
      metadata: { model: 'mock-gpt-4', tokens: 298, latency_ms: 1050 }
    },
    {
      content: `# 📊 综合分析报告

基于你的问题，我检索了知识库中的相关资料并生成以下分析：

## 📈 数据概览

- **匹配文档数**: 7 篇（协议规范 3 篇、测试报告 4 篇）
- **置信度评分**: ⭐⭐⭐⭐☆ (85%)
- **最近更新**: 2025年3月测试数据

## 🔬 技术细节

### 方案 A：标准化路径（推荐）
- 完全符合 ITU-R 及 3GPP NTN 规范
- 实施周期：2-3 周
- 风险等级：🟢 低

### 方案 B：定制化优化
- 针对特定场景深度调优
- 实施周期：4-6 周
- 风险等级：🟡 中

> 📎 相关文档：[\`2025-Q1终端入网测试总报告.pdf\`](kb-002/doc-006)、[\`端到端业务验收_视频通话.pdf\`](kb-002/doc-011)

需要我帮你生成完整的实施方案吗？`,
      metadata: { model: 'mock-gpt-4', tokens: 442, latency_ms: 1300 }
    }
  ];

  return replies[Math.floor(Math.random() * replies.length)];
}

module.exports = {
  getConversations,
  getConversationById,
  createConversation,
  deleteConversation,
  getMessagesByConversationId,
  sendMessage
};
