const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');

/**
 * 种子数据 - 初始化 Mock 数据
 */
function seedDatabase() {
  // 检查是否已有数据
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get();
  if (userCount.count > 0) {
    console.log('📊 数据库已有数据，跳过种子数据插入');
    return;
  }

  console.log('🌱 开始插入种子数据...');

  const insertUser = db.prepare(`
    INSERT INTO users (id, name, avatar_url, created_at) VALUES (?, ?, ?, datetime('now'))
  `);

  const insertAgent = db.prepare(`
    INSERT INTO agents (id, name, description, category, icon, color_theme, status) 
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const insertKB = db.prepare(`
    INSERT INTO knowledge_bases (id, name, description, visibility, document_count, created_by, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
  `);

  const insertDocument = db.prepare(`
    INSERT INTO documents (id, knowledge_base_id, filename, format, size_bytes, upload_time, parse_status, parsed_content, uploaded_by)
    VALUES (?, ?, ?, ?, ?, datetime('now'), ?, ?, ?)
  `);

  const insertConversation = db.prepare(`
    INSERT INTO conversations (id, title, agent_id, user_id, created_at, updated_at)
    VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))
  `);

  const insertMessage = db.prepare(`
    INSERT INTO messages (id, conversation_id, role, content, feedback, metadata, created_at)
    VALUES (?, ?, ?, ?, 'none', ?, datetime('now'))
  `);

  // 使用事务批量插入
  const transaction = db.transaction(() => {
    // ========== 用户数据 ==========
    insertUser.run(
      'user-001',
      'Alex Chen',
      'https://lh3.googleusercontent.com/a/ACg8ocIjaaKkOsvPqQ4ZKRjYZwCtQ5vJmNpXqRstT3Y=s96-c'
    );

    // ========== 智能体数据 (12个) ==========
    const agents = [
      // 用户终端智能化测试
      { id: 'agent-001', name: '手机直连卫星终端测试', description: '针对手机直连卫星场景的终端功能、信号质量、功耗等全方位智能化测试，支持多频段、多制式终端自动适配验证。', category: 'terminal', icon: 'smartphone', color_theme: '#4CAF50', status: 'active' },
      { id: 'agent-002', name: '便携/固定终端功能兼容性测试', description: '覆盖便携式用户终端与固定地面站的协议兼容性、接口一致性及业务功能自动化测试。', category: 'terminal', icon: 'router', color_theme: '#8BC34A', status: 'active' },
      { id: 'agent-003', name: '终端大规模接入模拟', description: '模拟海量终端同时接入场景下的信令风暴、资源调度和拥塞控制等压力测试。', category: 'terminal', icon: 'groups', color_theme: '#CDDC39', status: 'active' },

      // 星地网络智能化测试
      { id: 'agent-004', name: '网络性能/压力测试', description: '对星地融合网络的吞吐量、时延、抖动等关键指标进行智能化性能基准测试与极限压测。', category: 'network', icon: 'speed', color_theme: '#2196F3', status: 'active' },
      { id: 'agent-005', name: '星地链路损伤仿真', description: '模拟雨衰、大气闪烁、多普勒频移等链路损伤条件下的传输可靠性智能评估。', category: 'network', icon: 'cloud_sync', color_theme: '#03A9F4', status: 'active' },
      { id: 'agent-006', name: '星座组网仿真测试', description: '基于数字孪生技术对低轨星座拓扑动态变化、路由切换及星间链路进行全链路仿真验证。', category: 'network', icon: 'hub', color_theme: '#00BCD4', status: 'active' },

      // 卫星载荷智能化测试
      { id: 'agent-007', name: 'AI载荷性能/功能测试', description: '面向星载AI处理器的推理性能、能效比及在轨模型更新功能的自动化测试框架。', category: 'payload', icon: 'psychology', color_theme: '#9C27B0', status: 'active' },
      { id: 'agent-008', name: '射频/基带自动化测试', description: '覆盖卫星转发器射频特性、基带调制解调参数的全自动化测试与异常检测。', category: 'payload', icon: 'settings_input_antenna', color_theme: '#673AB7', status: 'active' },
      { id: 'agent-009', name: '极端环境可靠测试', description: '模拟空间辐射、热真空循环等极端环境下卫星载荷的功能可靠性与寿命预测测试。', category: 'payload', icon: 'thermostat', color_theme: '#3F51B5', status: 'maintenance' },

      // 全链路智能化验收与运维测试
      { id: 'agent-010', name: '在轨运维与故障预测', description: '利用遥测大数据进行健康状态评估、异常根因分析及故障预测性维护的智能运维系统。', category: 'e2e', icon: 'health_and_safety', color_theme: '#FF5722', status: 'active' },
      { id: 'agent-011', name: '安全与攻击测试', description: '针对星地链路的窃听、干扰、欺骗等攻击场景进行红蓝对抗演练与安全加固验证。', category: 'e2e', icon: 'shield', color_theme: '#E91E63', status: 'active' },
      { id: 'agent-012', name: '端到端业务验收测试', description: '从用户终端到应用服务器的完整业务链路验收测试，覆盖语音、视频、物联网等多类业务场景。', category: 'e2e', icon: 'task_alt', color_theme: '#FF9800', status: 'active' }
    ];

    agents.forEach(agent => {
      insertAgent.run(agent.id, agent.name, agent.description, agent.category, agent.icon, agent.color_theme, agent.status);
    });

    // ========== 知识库数据 (3个) ==========
    insertKB.run(
      'kb-001',
      '协议规范库',
      '收录卫星通信领域国际标准(ITU-R)、行业标准及企业内部规范文档',
      'organization',
      142,
      'user-001'
    );
    insertKB.run(
      'kb-002',
      '测试报告归档',
      '历次终端入网测试、网络性能测试、载荷验证测试的报告汇总与分析',
      'private',
      856,
      'user-001'
    );
    insertKB.run(
      'kb-003',
      '系统设计文档',
      '包含总体架构设计、各分系统接口定义、部署运维手册等技术文档',
      'public',
      45,
      'user-001'
    );

    // ========== 文档数据 ==========
    // 知识库1 - 协议规范的文档
    const kb1Docs = [
      { id: 'doc-001', filename: 'ITU-R S.2172-VLEO系统技术标准.pdf', format: 'pdf', size_bytes: 2458624, parse_status: 'completed', parsed_content: '本标准规定了甚低地球轨道(VLEO)卫星通信系统的技术要求，包括轨道高度范围(250-450km)、频率规划、功率通量密度限制等内容...' },
      { id: 'doc-002', filename: '3GPP Release 17 NTN技术规范.pdf', format: 'pdf', size_bytes: 5234890, parse_status: 'completed', parsed_content: '3GPP R17引入了非地面网络(NTN)支持，定义了卫星接入网架构、定时提前量补偿机制、多普勒频移处理方案...' },
      { id: 'doc-003', filename: '星间激光链路接口协议_v2.3.docx', format: 'docx', size_bytes: 892456, parse_status: 'parsing', parsed_content: null },
      { id: 'doc-004', filename: 'Ka波段波束成形算法说明.txt', format: 'txt', size_bytes: 45678, parse_status: 'failed', parsed_content: null },
      { id: 'doc-005', filename: 'DVB-S2X卫星调制标准详解.pdf', format: 'pdf', size_bytes: 3456789, parse_status: 'completed', parsed_content: 'DVB-S2X是DVB-S2的扩展标准，支持更高阶调制(256APSK)、更灵活的滚降系数配置、以及自适应编码调制(ACM)增强...' }
    ];
    kb1Docs.forEach(doc => {
      insertDocument.run(doc.id, 'kb-001', doc.filename, doc.format, doc.size_bytes, doc.parse_status, doc.parsed_content, 'user-001');
    });

    // 知识库2 - 测试报告的文档
    const kb2Docs = [
      { id: 'doc-006', filename: '2025-Q1终端入网测试总报告.pdf', format: 'pdf', size_bytes: 8765432, parse_status: 'completed', parsed_content: '2025年第一季度共完成12款终端的入网测试，涵盖手机直连、便携终端、固定站三类设备。整体通过率83.3%...' },
      { id: 'doc-007', filename: '大规模接入压力测试_10000终端.pdf', format: 'pdf', size_bytes: 6543210, parse_status: 'completed', parsed_content: '本次测试模拟10000个终端同时接入核心网的极限场景，测试结果表明系统最大可承载8500个并发连接...' },
      { id: 'doc-008', filename: '星地链路雨衰仿真测试报告.docx', format: 'docx', size_bytes: 1234567, parse_status: 'parsing', parsed_content: null },
      { id: 'doc-009', filename: 'AI载荷推理性能基准测试.pdf', format: 'pdf', size_bytes: 4567890, parse_status: 'completed', parsed_content: '对星载AI芯片进行INT8/INT16/FP32三种精度的推理性能基准测试。INT8模式下ResNet50推理耗时约15ms...' },
      { id: 'doc-010', filename: '安全攻防演练报告_2025H1.pdf', format: 'pdf', size_bytes: 5678901, parse_status: 'completed', parsed_content: '上半年完成3轮红蓝对抗演练，发现并修复高危漏洞5个、中危漏洞12个。主要攻击面包括信令伪造、频谱干扰...' },
      { id: 'doc-011', filename: '端到端业务验收_视频通话.pdf', format: 'pdf', size_bytes: 3456789, parse_status: 'completed', parsed_content: '端到端视频通话验收测试：平均单向时延320ms，丢包率<1%，MOS评分4.1/5.0，满足设计指标要求...' },
      { id: 'doc-012', filename: '星座组网路由切换测试.txt', format: 'txt', size_bytes: 234567, parse_status: 'failed', parsed_content: null }
    ];
    kb2Docs.forEach(doc => {
      insertDocument.run(doc.id, 'kb-002', doc.filename, doc.format, doc.size_bytes, doc.parse_status, doc.parsed_content, 'user-001');
    });

    // 知识库3 - 系统文档的文档
    const kb3Docs = [
      { id: 'doc-013', filename: '卫星互联网总体架构设计V3.0.pdf', format: 'pdf', size_bytes: 12345678, parse_status: 'completed', parsed_content: '本架构采用"空间段-地面段-用户段"三层体系结构。空间段包含108颗低轨卫星组成的Walker星座...' },
      { id: 'doc-014', filename: '地面站网管系统接口定义.xlsx', format: 'docx', size_bytes: 987654, parse_status: 'completed', parsed_content: '定义了地面站与网管系统之间的北向接口协议，包括SNMP Trap告警上报、NETCONF配置下发等...' },
      { id: 'doc-015', filename: '运营运维操作手册.pdf', format: 'pdf', size_bytes: 5678901, parse_status: 'parsing', parsed_content: null }
    ];
    kb3Docs.forEach(doc => {
      insertDocument.run(doc.id, 'kb-003', doc.filename, doc.format, doc.size_bytes, doc.parse_status, doc.parsed_content, 'user-001');
    });

    // ========== 对话数据 (5条) ==========
    const conversations = [
      { id: 'conv-001', title: 'Python代码调试帮助', agent_id: 'agent-007', user_id: 'user-001' },
      { id: 'conv-002', title: '卫星链路损耗计算方法', agent_id: 'agent-005', user_id: 'user-001' },
      { id: 'conv-003', title: '终端兼容性问题排查', agent_id: 'agent-002', user_id: 'user-001' },
      { id: 'conv-004', title: 'AI模型在轨更新流程咨询', agent_id: 'agent-010', user_id: 'user-001' },
      { id: 'conv-005', title: '网络安全防护建议', agent_id: 'agent-011', user_id: 'user-001' }
    ];
    conversations.forEach(conv => {
      insertConversation.run(conv.id, conv.title, conv.agent_id, conv.user_id);
    });

    // ========== 消息数据 (以conv-001为例构建完整对话流) ==========
    const messages = [
      // AI问候
      { id: 'msg-001', conversation_id: 'conv-001', role: 'assistant', content: `你好！我是 **AI载荷性能/功能测试** 智能体 🛰️\n\n我可以帮助你解决以下类型的问题：\n\n- 🧠 星载 AI 处理器推理性能分析与优化建议\n- 🔧 在轨模型更新流程与版本管理策略\n- 📊 能效比(EOPS)评估与对比测试方案\n- 🛡️ AI 推理结果置信度校验与异常检测\n\n请告诉我你需要什么帮助？`, metadata: JSON.stringify({ model: 'mock-gpt-4', tokens: 128 }) },

      // 用户提问
      { id: 'msg-002', conversation_id: 'conv-001', role: 'user', content: '帮我写一个 Python 函数来计算卫星链路的自由空间路径损耗(FSPL)，输入参数包括频率(MHz)和距离(km)。', metadata: JSON.stringify({}) },

      // AI回复（含代码块+图片+说明）
      { id: 'msg-003', conversation_id: 'conv-001', role: 'assistant', content: `好的！下面是一个完整的 **自由空间路径损耗 (FSPL)** 计算函数：

## 📐 公式原理

FSPL（dB）= 20·log₁₀(d) + 20·log₁₀(f) + 92.45

其中：
- **d** 为距离（km）
- **f** 为频率（MHz）

## 💻 Python 实现

\`\`\`python
import math

def calculate_fspl(frequency_mhz: float, distance_km: float) -> float:
    """
    计算自由空间路径损耗 (Free Space Path Loss)

    参数:
        frequency_mhz: 载波频率，单位 MHz
        distance_km:     传播距离，单位 km

    返回:
        路径损耗值，单位 dB

    示例:
        >>> calculate_fspl(20000, 1000)  # Ka波段, 1000km
        188.42
    """
    if frequency_mhz <= 0:
        raise ValueError("频率必须为正数")
    if distance_km <= 0:
        raise ValueError("距离必须为正数")

    # FSPL(dB) = 20*log10(d) + 20*log10(f) + 92.45
    fspl = (
        20 * math.log10(distance_km) +
        20 * math.log10(frequency_mhz) +
        92.45
    )
    return round(fspl, 2)


# ====== 测试用例 ======
if __name__ == "__main__":
    test_cases = [
        ("L波段",   1500,  2000),   # IoT/导航
        ("S波段",   2200,  1500),   # 低速数据
        ("Ka波段",  20000, 1000),   # 高速宽带
        ("V波段",   40000, 500),    # 星间链路
    ]

    print(f"{'频段':^8} | {'频率(MHz)':^12} | {'距离(km)':^10} | {'FSPL(dB)':^10}")
    print("-" * 52)

    for band, freq, dist in test_cases:
        loss = calculate_fspl(freq, dist)
        print(f"{band:^8} | {freq:^12} | {dist:^10} | {loss:^10.2f}")
\`\`\`

## 📊 运行结果示例

| 频段 | 频率(MHz) | 距离(km) | FSPL(dB) |
|------|-----------|----------|----------|
| L波段 | 1500 | 2000 | 174.40 |
| S波段 | 2200 | 1500 | 172.18 |
| Ka波段 | 20000 | 1000 | 188.42 |
| V波段 | 40000 | 500 | 190.41 |

## 🛰️ 卫星链路扩展建议

在实际的 **星地链路** 中，除了 FSPL 外还需要考虑以下额外损耗：

1. **大气衰减** — 雨衰（Ka/V波段尤其严重）、氧气/水汽吸收
2. **极化损耗** — 一般取 0.5~3 dB
3. **指向误差损耗** — 终端天线跟踪精度不足导致
4. **多普勒频移补偿损失** — LEO 场景下显著

> 💡 如果需要完整的 **链路预算计算工具**（含上述所有因素），请告诉我！`, metadata: JSON.stringify({ model: 'mock-gpt-4', tokens: 512 }) }
    ];

    messages.forEach(msg => {
      insertMessage.run(msg.id, msg.conversation_id, msg.role, msg.content, msg.metadata);
    });

    console.log(`✅ 种子数据插入完成：1个用户, ${agents.length}个智能体, 3个知识库, 15个文档, 5条对话`);
  });

  transaction();
}

module.exports = { seedDatabase };
