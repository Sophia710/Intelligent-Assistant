const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');

/**
 * 获取知识库列表
 */
function getKnowledgeBases(req, res) {
  try {
    const knowledgeBases = db.prepare(`
      SELECT kb.*, u.name as creator_name
      FROM knowledge_bases kb
      LEFT JOIN users u ON kb.created_by = u.id
      ORDER BY kb.updated_at DESC
    `).all();

    res.json({ success: true, data: knowledgeBases });
  } catch (error) {
    res.status(500).json({ success: false, error: '获取知识库列表失败: ' + error.message });
  }
}

/**
 * 获取全局统计信息
 */
function getKnowledgeBaseStats(req, res) {
  try {
    const totalKBs = db.prepare('SELECT COUNT(*) as count FROM knowledge_bases').get().count;
    const totalDocs = db.prepare('SELECT COUNT(*) as count FROM documents').get().count;

    // 各状态文档数量
    const statusStats = db.prepare(`
      SELECT parse_status, COUNT(*) as count 
      FROM documents 
      GROUP BY parse_status
    `).all();

    // 总文件大小
    const sizeResult = db.prepare('SELECT COALESCE(SUM(size_bytes), 0) as total_size FROM documents').get();

    // 各知识库文档数
    const kbDocCounts = db.prepare(`
      SELECT kb.id, kb.name, kb.document_count, 
        (SELECT COUNT(*) FROM documents d WHERE d.knowledge_base_id = kb.id) as actual_count,
        SUM(CASE WHEN d.parse_status = 'completed' THEN 1 ELSE 0 END) as completed_count
      FROM knowledge_bases kb
      LEFT JOIN documents d ON d.knowledge_base_id = kb.id
      GROUP BY kb.id
    `).all();

    res.json({
      success: true,
      data: {
        totalKnowledgeBases: totalKBs,
        totalDocuments: totalDocs,
        totalSizeBytes: sizeResult.total_size,
        statusBreakdown: statusStats.reduce((acc, item) => {
          acc[item.parse_status] = item.count;
          return acc;
        }, {}),
        knowledgeBaseBreakdown: kbDocCounts
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: '获取统计数据失败: ' + error.message });
  }
}

/**
 * 创建知识库
 */
function createKnowledgeBase(req, res) {
  try {
    const { name, description, visibility } = req.body;
    const id = uuidv4();

    db.prepare(`
      INSERT INTO knowledge_bases (id, name, description, visibility, document_count, created_by, created_at, updated_at)
      VALUES (?, ?, ?, ?, 0, 'user-001', datetime('now'), datetime('now'))
    `).run(id, name, description, visibility || 'private');

    const kb = db.prepare('SELECT * FROM knowledge_bases WHERE id = ?').get(id);

    res.status(201).json({ success: true, data: kb, message: '知识库创建成功' });
  } catch (error) {
    res.status(500).json({ success: false, error: '创建知识库失败: ' + error.message });
  }
}

/**
 * 编辑知识库
 */
function updateKnowledgeBase(req, res) {
  try {
    const { id } = req.params;
    const { name, description, visibility } = req.body;

    const existing = db.prepare('SELECT id FROM knowledge_bases WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ success: false, error: '知识库不存在' });
    }

    db.prepare(`
      UPDATE knowledge_bases 
      SET name = COALESCE(?, name), 
          description = COALESCE(?, description), 
          visibility = COALESCE(?, visibility),
          updated_at = datetime('now')
      WHERE id = ?
    `).run(name, description, visibility, id);

    const kb = db.prepare('SELECT * FROM knowledge_bases WHERE id = ?').get(id);

    res.json({ success: true, data: kb, message: '知识库更新成功' });
  } catch (error) {
    res.status(500).json({ success: false, error: '更新知识库失败: ' + error.message });
  }
}

/**
 * 删除知识库
 */
function deleteKnowledgeBase(req, res) {
  try {
    const { id } = req.params;

    // 先删除关联文档
    db.prepare('DELETE FROM documents WHERE knowledge_base_id = ?').run(id);
    // 再删除知识库
    const result = db.prepare('DELETE FROM knowledge_bases WHERE id = ?').run(id);

    if (result.changes === 0) {
      return res.status(404).json({ success: false, error: '知识库不存在' });
    }

    res.json({ success: true, message: '知识库删除成功' });
  } catch (error) {
    res.status(500).json({ success: false, error: '删除知识库失败: ' + error.message });
  }
}

module.exports = {
  getKnowledgeBases,
  getKnowledgeBaseStats,
  createKnowledgeBase,
  updateKnowledgeBase,
  deleteKnowledgeBase
};
