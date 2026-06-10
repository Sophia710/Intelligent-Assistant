const express = require('express');
const router = express.Router();
const {
  updateFeedback,
  regenerateMessage
} = require('../controllers/messageController');

// 更新消息反馈（点赞/踩）
router.put('/:id/feedback', updateFeedback);

// 重新生成回复
router.post('/:id/regenerate', regenerateMessage);

module.exports = router;
