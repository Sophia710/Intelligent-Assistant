const express = require('express');
const router = express.Router();
const {
  getConversations,
  getConversationById,
  createConversation,
  deleteConversation,
  getMessagesByConversationId,
  sendMessage
} = require('../controllers/conversationController');

// 对话列表
router.get('/', getConversations);

// 创建对话
router.post('/', createConversation);

// 获取对话详情（含消息）
router.get('/:id', getConversationById);

// 删除对话
router.delete('/:id', deleteConversation);

// 获取某对话的消息列表
router.get('/:id/messages', getMessagesByConversationId);

// 发送消息
router.post('/:id/messages', sendMessage);

module.exports = router;
