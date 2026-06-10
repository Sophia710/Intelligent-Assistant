const db = require('../config/database');

/**
 * 获取所有智能体（支持分类过滤和关键词搜索）
 */
function getAgents(req, res) {
  try {
    const { category, keyword } = req.query;
    let sql = `
      SELECT a.*, 
        (SELECT COUNT(*) FROM conversations c WHERE c.agent_id = a.id) as usage_count
      FROM agents a
      WHERE 1=1
    `;
    const params = [];

    if (category) {
      sql += ' AND a.category = ?';
      params.push(category);
    }

    if (keyword) {
      sql += ' AND (a.name LIKE ? OR a.description LIKE ?)';
      params.push(`%${keyword}%`, `%${keyword}%`);
    }

    sql += ' ORDER BY a.category, a.name';

    const agents = db.prepare(sql).all(...params);

    // 按类别分组统计
    const categories = {};
    agents.forEach(agent => {
      if (!categories[agent.category]) {
        const categoryNames = {
          terminal: '用户终端智能化测试',
          network: '星地网络智能化测试',
          payload: '卫星载荷智能化测试',
          e2e: '全链路智能化验收与运维测试'
        };
        categories[agent.category] = {
          key: agent.category,
          name: categoryNames[agent.category] || agent.category,
          count: 0,
          agents: []
        };
      }
      categories[agent.category].count++;
      categories[agent.category].agents.push(agent);
    });

    res.json({
      success: true,
      data: {
        list: agents,
        categories: Object.values(categories),
        total: agents.length
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: '获取智能体列表失败: ' + error.message });
  }
}

/**
 * 获取智能体详情
 */
function getAgentById(req, res) {
  try {
    const { id } = req.params;
    const agent = db.prepare(`
      SELECT a.*,
        (SELECT COUNT(*) FROM conversations c WHERE c.agent_id = a.id) as usage_count
      FROM agents a
      WHERE a.id = ?
    `).get(id);

    if (!agent) {
      return res.status(404).json({ success: false, error: '智能体不存在' });
    }

    // 获取与该智能体相关的最近对话
    const recentConversations = db.prepare(`
      SELECT id, title, created_at, updated_at 
      FROM conversations 
      WHERE agent_id = ? 
      ORDER BY updated_at DESC 
      LIMIT 5
    `).all(id);

    res.json({
      success: true,
      data: {
        ...agent,
        recentConversations
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: '获取智能体详情失败: ' + error.message });
  }
}

module.exports = {
  getAgents,
  getAgentById
};
