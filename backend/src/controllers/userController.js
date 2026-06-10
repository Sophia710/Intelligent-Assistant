const db = require('../config/database');

/**
 * 获取当前用户信息
 */
function getCurrentUser(req, res) {
  try {
    // Mock: 固定返回默认用户
    const user = db.prepare(`
      SELECT u.*,
        (SELECT COUNT(*) FROM conversations c WHERE c.user_id = u.id) as conversation_count
      FROM users u
      WHERE u.id = 'user-001'
    `).get();

    if (!user) {
      return res.status(404).json({ success: false, error: '用户不存在' });
    }

    // 附加统计信息
    const stats = {
      totalConversations: db.prepare("SELECT COUNT(*) as count FROM conversations WHERE user_id = 'user-001'").get().count,
      totalMessages: db.prepare(`
        SELECT COUNT(*) as count FROM messages m
        JOIN conversations c ON m.conversation_id = c.id
        WHERE c.user_id = 'user-001'
      `).get().count
    };

    res.json({
      success: true,
      data: {
        ...user,
        stats
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: '获取用户信息失败: ' + error.message });
  }
}

module.exports = {
  getCurrentUser
};
