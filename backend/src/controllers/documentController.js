const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

/**
 * 获取知识库下的文档列表
 */
function getDocuments(req, res) {
  try {
    const { kbId } = req.params;
    const { status, format } = req.query;

    let sql = `
      SELECT d.*, u.name as uploader_name
      FROM documents d
      LEFT JOIN users u ON d.uploaded_by = u.id
      WHERE d.knowledge_base_id = ?
    `;
    const params = [kbId];

    if (status) {
      sql += ' AND d.parse_status = ?';
      params.push(status);
    }

    if (format) {
      sql += ' AND d.format = ?';
      params.push(format);
    }

    sql += ' ORDER BY d.upload_time DESC';

    const documents = db.prepare(sql).all(...params);

    res.json({ success: true, data: documents });
  } catch (error) {
    res.status(500).json({ success: false, error: '获取文档列表失败: ' + error.message });
  }
}

/**
 * 获取文档统计
 */
function getDocumentStats(req, res) {
  try {
    const { kbId } = req.params;

    const totalCount = db.prepare(
      'SELECT COUNT(*) as count FROM documents WHERE knowledge_base_id = ?'
    ).get(kbId).count;

    const statusStats = db.prepare(`
      SELECT parse_status, COUNT(*) as count 
      FROM documents 
      WHERE knowledge_base_id = ?
      GROUP BY parse_status
    `).all(kbId);

    const formatStats = db.prepare(`
      SELECT format, COUNT(*) as count, COALESCE(SUM(size_bytes), 0) as total_size
      FROM documents 
      WHERE knowledge_base_id = ?
      GROUP BY format
    `).all(kbId);

    const totalSize = db.prepare(
      'SELECT COALESCE(SUM(size_bytes), 0) as total_size FROM documents WHERE knowledge_base_id = ?'
    ).get(kbId).total_size;

    res.json({
      success: true,
      data: {
        totalCount,
        totalSizeBytes: totalSize,
        byStatus: statusStats.reduce((acc, item) => {
          acc[item.parse_status] = item.count;
          return acc;
        }, {}),
        byFormat: formatStats
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: '获取文档统计失败: ' + error.message });
  }
}

/**
 * 上传文档（Mock）
 */
function uploadDocument(req, res) {
  try {
    const { kbId } = req.params;
    // Mock 上传：从 body 或模拟文件信息
    const { filename, format, size_bytes } = req.body;

    // 验证知识库存在
    const kb = db.prepare('SELECT id FROM knowledge_bases WHERE id = ?').get(kbId);
    if (!kb) {
      return res.status(404).json({ success: false, error: '知识库不存在' });
    }

    const id = uuidv4();
    const mockFilename = filename || `uploaded_document_${Date.now()}.${format || 'pdf'}`;
    const mockFormat = format || path.extname(mockFilename).slice(1) || 'pdf';
    const mockSize = size_bytes || Math.floor(Math.random() * 5000000) + 100000;

    db.prepare(`
      INSERT INTO documents (id, knowledge_base_id, filename, format, size_bytes, upload_time, parse_status, parsed_content, uploaded_by)
      VALUES (?, ?, ?, ?, ?, datetime('now'), 'parsing', NULL, 'user-001')
    `).run(id, kbId, mockFilename, mockFormat, mockSize);

    // 更新知识库文档计数
    db.prepare(`
      UPDATE knowledge_bases SET document_count = document_count + 1, updated_at = datetime('now') WHERE id = ?
    `).run(kbId);

    const doc = db.prepare('SELECT * FROM documents WHERE id = ?').get(id);

    // 模拟异步解析完成
    setTimeout(() => {
      const statuses = ['completed', 'completed', 'completed', 'failed'];
      const finalStatus = statuses[Math.floor(Math.random() * statuses.length)];
      const mockContent = finalStatus === 'completed'
        ? `这是文档 "${mockFilename}" 的自动解析内容。\n\n文档包含 ${Math.floor(Math.random() * 50) + 10} 个章节，主要涵盖技术规范、测试方法及数据分析等内容。`
        : null;

      db.prepare(`
        UPDATE documents SET parse_status = ?, parsed_content = ? WHERE id = ?
      `).run(finalStatus, mockContent, id);
    }, 2000 + Math.random() * 3000);

    res.status(201).json({
      success: true,
      data: doc,
      message: '文档上传成功，正在解析中...'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: '上传文档失败: ' + error.message });
  }
}

/**
 * 获取文档详情（含解析内容）
 */
function getDocumentById(req, res) {
  try {
    const { id } = req.params;
    const doc = db.prepare(`
      SELECT d.*, kb.name as knowledge_base_name, u.name as uploader_name
      FROM documents d
      LEFT JOIN knowledge_bases kb ON d.knowledge_base_id = kb.id
      LEFT JOIN users u ON d.uploaded_by = u.id
      WHERE d.id = ?
    `).get(id);

    if (!doc) {
      return res.status(404).json({ success: false, error: '文档不存在' });
    }

    res.json({ success: true, data: doc });
  } catch (error) {
    res.status(500).json({ success: false, error: '获取文档详情失败: ' + error.message });
  }
}

/**
 * 删除文档
 */
function deleteDocument(req, res) {
  try {
    const { id } = req.params;

    const doc = db.prepare('SELECT id, knowledge_base_id FROM documents WHERE id = ?').get(id);
    if (!doc) {
      return res.status(404).json({ success: false, error: '文档不存在' });
    }

    db.prepare('DELETE FROM documents WHERE id = ?').run(id);

    // 更新知识库文档计数
    db.prepare(`
      UPDATE knowledge_bases SET document_count = MAX(0, document_count - 1), updated_at = datetime('now') WHERE id = ?
    `).run(doc.knowledge_base_id);

    res.json({ success: true, message: '文档删除成功' });
  } catch (error) {
    res.status(500).json({ success: false, error: '删除文档失败: ' + error.message });
  }
}

/**
 * 重新解析文档
 */
function reparseDocument(req, res) {
  try {
    const { id } = req.params;

    const doc = db.prepare('SELECT id FROM documents WHERE id = ?').get(id);
    if (!doc) {
      return res.status(404).json({ success: false, error: '文档不存在' });
    }

    // 设置为解析中
    db.prepare("UPDATE documents SET parse_status = 'parsing', parsed_content = NULL WHERE id = ?").run(id);

    // 模拟异步解析完成
    setTimeout(() => {
      const mockContent = `【重新解析】文档内容摘要：\n\n本文档经系统重新解析完成。包含完整的技术规范、测试数据和参考附录。\n\n解析时间: ${new Date().toLocaleString('zh-CN')}\n解析引擎版本: v2.4.1`;

      db.prepare(`
        UPDATE documents SET parse_status = 'completed', parsed_content = ? WHERE id = ?
      `).run(mockContent, id);
    }, 1500 + Math.random() * 2000);

    res.json({ success: true, message: '文档重新解析任务已提交' });
  } catch (error) {
    res.status(500).json({ success: false, error: '重新解析失败: ' + error.message });
  }
}

/**
 * 获取文档预览内容
 */
function previewDocument(req, res) {
  try {
    const { id } = req.params;

    const doc = db.prepare('SELECT * FROM documents WHERE id = ?').get(id);
    if (!doc) {
      return res.status(404).json({ success: false, error: '文档不存在' });
    }

    let previewContent = '';
    if (doc.parse_status === 'completed' && doc.parsed_content) {
      previewContent = doc.parsed_content;
    } else if (doc.parse_status === 'parsing') {
      previewContent = '📄 文档正在解析中，请稍后再试...';
    } else if (doc.parse_status === 'failed') {
      previewContent = '❌ 文档解析失败，请尝试重新上传或检查文件格式是否支持。';
    } else {
      previewContent = '⏳ 文档尚未开始解析';
    }

    res.json({
      success: true,
      data: {
        id: doc.id,
        filename: doc.filename,
        format: doc.format,
        parseStatus: doc.parse_status,
        previewContent,
        contentLength: previewContent.length
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: '获取预览失败: ' + error.message });
  }
}

module.exports = {
  getDocuments,
  getDocumentStats,
  uploadDocument,
  getDocumentById,
  deleteDocument,
  reparseDocument,
  previewDocument
};
