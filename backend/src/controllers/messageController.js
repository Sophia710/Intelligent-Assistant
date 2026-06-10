const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');

/**
 * 更新消息反馈（点赞/踩）
 */
function updateFeedback(req, res) {
  try {
    const { id } = req.params;
    const { feedback } = req.body;

    if (!['positive', 'negative', 'none'].includes(feedback)) {
      return res.status(400).json({ success: false, error: '反馈值必须是 positive/negative/none' });
    }

    const result = db.prepare("UPDATE messages SET feedback = ? WHERE id = ?").run(feedback, id);

    if (result.changes === 0) {
      return res.status(404).json({ success: false, error: '消息不存在' });
    }

    res.json({ success: true, message: '反馈更新成功' });
  } catch (error) {
    res.status(500).json({ success: false, error: '更新反馈失败: ' + error.message });
  }
}

/**
 * 重新生成回复（返回新的 mock 内容）
 */
function regenerateMessage(req, res) {
  try {
    const { id } = req.params;

    // 查找原消息
    const originalMessage = db.prepare('SELECT * FROM messages WHERE id = ?').get(id);
    if (!originalMessage) {
      return res.status(404).json({ success: false, error: '消息不存在' });
    }

    if (originalMessage.role !== 'assistant') {
      return res.status(400).json({ success: false, error: '只能重新生成助手消息' });
    }

    // 生成新的 Mock 回复内容
    const newReplies = [
      {
        content: `# 🔄 重新生成的回答

感谢你的耐心等待！我从另一个角度重新分析了这个问题：

## 💡 新的视角

之前的回答侧重于理论分析，这次让我补充一些 **实战经验总结**：

### 经验要点 #1
在实际的卫星载荷测试中，我们发现约 **67%** 的性能问题源于：
- 温度漂移导致的时钟偏移
- 辐射引起的单粒子翻转(SEU)
- 电源纹波对敏感电路的干扰

### 经验要点 #2

\`\`\`python
# 改进版：带容错机制的 FSPL 计算
def robust_fspl(freq_mhz, dist_km, margin_db=3.0):
    \"\"\"含设计余量的路径损耗计算\"\"\"
    base_loss = 20*math.log10(dist_km) + 20*math.log10(freq_mhz) + 92.45
    
    # 额外余量：大气衰减 + 极化损耗 + 指向误差
    extra_margin = margin_db + 1.5 + 0.5  # 默认总余量 ~5dB
    
    return round(base_loss + extra_margin, 2)

# 示例：Ka波段1000km，含5dB余量
print(f"FSPL(含余量): {robust_fspl(20000, 1000)} dB")
# 输出: FSPL(含余量): 193.42 dB
\`\`\`

这个版本增加了 **工程安全余量**，更贴近实际部署需求。`,
        metadata: { model: 'mock-gpt-4', tokens: 398, regenerated: true }
      },
      {
        content: `# 🔄 重新生成 — 深度技术解析

让我用更专业的方式重新梳理这个问题：

## 🏗️ 分层架构视图

\`\`\`
┌─────────────────────────────────────┐
│           应用层 (L7)               │  ← 业务逻辑 / QoS策略
├─────────────────────────────────────┤
│         传输层 (L4)                 │  ← TCP加速 / QUIC适配
├─────────────────────────────────────┤
│         网络层 (L3)                 │  ← SDN路由 / 切换管理
├─────────────────────────────────────┤
│     数据链路层 (L2)                 │  ← ACM / ARQ / FEC
├─────────────────────────────────────┤
│       物理层 (L1)                   │  ← 调制/编码/波束成形
└───────────┬─────────────────────────┘
            │ 星地射频链路
    ┌───────▼─────────────────┐
    │   LEO/GEO 卫星星座       │  → 多普勒补偿 · 路由转发
    └─────────────────────────┘
\`\`\`

## 📐 关键公式速查

| 参数 | 公式 | 典型值(Ka, 1000km) |
|------|------|-------------------|
| FSPL | 20lg(d)+20lg(f)+92.45 | 188.42 dB |
| 雨衰 | ITU-R P.618 模型 | 2~15 dB |
| 大气吸收 | ITU-R P.676 | < 1 dB |
| G/T值 | Gr/Tsys | 6 dB/K |

> 本次回答采用了分层架构视角，便于定位问题所在的具体层级。`,
        metadata: { model: 'mock-gpt-4', tokens: 467, regenerated: true }
      },
      {
        content: `# 🔄 重新生成 — 实战案例驱动

让我用一个 **真实测试案例** 来说明：

## 📋 案例：某型号终端入网测试复盘

**背景**：2025年Q1，一款新型手机直连卫星终端在入网测试中发现异常

### 问题现象
- ✅ 静态环境下信令建立成功率 99.2%
- ❌ 高速移动(>800km/h)下掉线率飙升至 18%
- ⚠️ 雨天 Ka 波段吞吐量下降超 60%

### 根因分析

\`\`\`mermaid
graph TD
    A[高速移动掉线率高] --> B{多普勒频移?}
    B -->|是| C[频率跟踪环带宽不足]
    B --> 否 D{切换延迟?}
    D -->|是| E[测量报告上报间隔过长]
    C --> F[调整PLL带宽 50→200Hz]
    E --> G[MR周期 240ms→80ms]
    F --> H[掉线率降至 2.1% ✅]
    G --> H
\`\`\`

### 修复效果验证

| 指标 | 修复前 | 修复后 | 目标值 | 状态 |
|------|--------|--------|--------|------|
| 掉线率 | 18% | 2.1% | <3% | ✅ 通过 |
| 切换中断 | 320ms | 85ms | <100ms | ✅ 通过 |
| 吞吐保持率 | 40% | 88% | >85% | ✅ 通过 |

> 📎 详细数据请参考：\`2025-Q1终端入网测试总报告.pdf\` 第4章`,
        metadata: { model: 'mock-gpt-4', tokens: 512, regenerated: true }
      }
    ];

    const newReply = newReplies[Math.floor(Math.random() * newReplies.length)];

    // 更新原消息内容
    db.prepare(`
      UPDATE messages SET content = ?, metadata = ?, created_at = datetime('now') WHERE id = ?
    `).run(newReply.content, JSON.stringify(newReply.metadata), id);

    res.json({
      success: true,
      data: {
        id,
        content: newReply.content,
        metadata: newReply.metadata
      },
      message: '回复已重新生成'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: '重新生成失败: ' + error.message });
  }
}

module.exports = {
  updateFeedback,
  regenerateMessage
};
