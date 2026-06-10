const express = require('express');
const router = express.Router();
const {
  getKnowledgeBases,
  getKnowledgeBaseStats,
  createKnowledgeBase,
  updateKnowledgeBase,
  deleteKnowledgeBase
} = require('../controllers/kbController');

// 知识库列表
router.get('/', getKnowledgeBases);

// 全局统计
router.get('/stats', getKnowledgeBaseStats);

// 创建知识库
router.post('/', createKnowledgeBase);

// 编辑知识库
router.put('/:id', updateKnowledgeBase);

// 删除知识库
router.delete('/:id', deleteKnowledgeBase);

module.exports = router;
