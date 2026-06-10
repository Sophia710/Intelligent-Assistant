const express = require('express');
const router = express.Router();
const {
  getDocuments,
  getDocumentStats,
  uploadDocument,
  getDocumentById,
  deleteDocument,
  reparseDocument,
  previewDocument
} = require('../controllers/documentController');

// 知识库下的文档列表
router.get('/knowledge-bases/:kbId/documents', getDocuments);

// 知识库下的文档统计
router.get('/knowledge-bases/:kbId/documents/stats', getDocumentStats);

// 上传文档到指定知识库
router.post('/knowledge-bases/:kbId/documents', uploadDocument);

// 文档详情（含解析内容）
router.get('/documents/:id', getDocumentById);

// 删除文档
router.delete('/documents/:id', deleteDocument);

// 重新解析文档
router.put('/documents/:id/reparse', reparseDocument);

// 文档预览
router.get('/documents/:id/preview', previewDocument);

module.exports = router;
