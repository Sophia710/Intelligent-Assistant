const express = require('express');
const router = express.Router();
const {
  getAgents,
  getAgentById
} = require('../controllers/agentController');

// 获取智能体列表（支持 ?category= 过滤，?keyword= 搜索）
router.get('/', getAgents);

// 获取智能体详情
router.get('/:id', getAgentById);

module.exports = router;
