const express = require('express');
const router = express.Router();
const {
  getCurrentUser
} = require('../controllers/userController');

// 获取当前用户信息
router.get('/me', getCurrentUser);

module.exports = router;
