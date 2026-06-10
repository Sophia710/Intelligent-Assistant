const express = require('express');
const cors = require('cors');
const db = require('./config/database');
const { initDatabase } = db;
const { seedDatabase } = require('./data/seed');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

// 导入路由
const conversationRoutes = require('./routes/conversations');
const messageRoutes = require('./routes/messages');
const agentRoutes = require('./routes/agents');
const kbRoutes = require('./routes/knowledgeBases');
const documentRoutes = require('./routes/documents');
const userRoutes = require('./routes/users');

const app = express();
const PORT = process.env.PORT || 3001;

// ========== 中间件配置 ==========

// CORS - 允许所有来源
app.use(cors());

// JSON 请求体解析
app.use(express.json({ limit: '10mb' }));

// URL编码解析
app.use(express.urlencoded({ extended: true }));

// 请求日志（简易版）
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`📨 ${req.method} ${req.originalUrl} ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// ========== 路由挂载 ==========

// API 健康检查
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'ok',
      service: '卫星互联网运行运维智能体后端服务',
      version: '1.0.0',
      timestamp: new Date().toISOString()
    }
  });
});

// 业务路由
app.use('/api/conversations', conversationRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/agents', agentRoutes);
app.use('/api/knowledge-bases', kbRoutes);
app.use('/api', documentRoutes);  // 文档路由包含 /knowledge-bases/:kbId/documents 前缀
app.use('/api/users', userRoutes);

// ========== 错误处理 ==========

// 404 兜底
app.use(notFoundHandler);

// 全局错误处理
app.use(errorHandler);

// ========== 异步启动服务器 ==========

async function startServer() {
  // 初始化数据库
  await initDatabase();

  // 启动 HTTP 服务
  app.listen(PORT, () => {
    console.log('');
    console.log('╔══════════════════════════════════════════════╗');
    console.log('║  🛰️ 卫星互联网运行运维智能体后端服务已启动     ║');
    console.log('╠══════════════════════════════════════════════╣');
    console.log(`║  本地地址: http://localhost:${PORT}              ║`);
    console.log('║  健康检查: /api/health                        ║');
    console.log('╠══════════════════════════════════════════════╣');
    console.log('║  可用API路由:                                  ║');
    console.log('║  GET    /api/agents                    智能体   ║');
    console.log('║  GET    /api/conversations            对话列表 ║');
    console.log('║  POST   /api/conversations            创建对话 ║');
    console.log('║  GET    /api/knowledge-bases          知识库   ║');
    console.log('║  GET    /api/users/me                 当前用户 ║');
    console.log('╚══════════════════════════════════════════════╝');
    console.log('');

    // 初始化种子数据
    seedDatabase();
  });
}

startServer().catch(err => {
  console.error('❌ 服务器启动失败:', err);
  process.exit(1);
});
