/**
 * 全局错误处理中间件
 * 统一捕获所有未处理的异常并返回标准格式错误响应
 */
function errorHandler(err, req, res, next) {
  console.error('❌ [错误]', new Date().toISOString(), '-', err.message);
  console.error(err.stack);

  // 处理特定类型的错误
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: '数据验证失败: ' + err.message
    });
  }

  // SQLite 错误处理
  if (err.code === 'SQLITE_CONSTRAINT') {
    return res.status(409).json({
      success: false,
      error: '数据冲突: 该记录已存在'
    });
  }

  if (err.code === 'SQLITE_BUSY') {
    return res.status(503).json({
      success: false,
      error: '数据库繁忙，请稍后重试'
    });
  }

  // JSON 解析错误
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({
      success: false,
      error: '请求体 JSON 格式无效'
    });
  }

  // 404 处理（由路由未匹配触发）
  if (err.status === 404) {
    return res.status(404).json({
      success: false,
      error: '请求的资源不存在'
    });
  }

  // 默认服务器内部错误
  const statusCode = err.statusCode || err.status || 500;
  res.status(statusCode).json({
    success: false,
    error: process.env.NODE_ENV === 'production' ? '服务器内部错误' : err.message
  });
}

/**
 * 404 未找到路由的处理中间件
 */
function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    error: `API 路径不存在: ${req.method} ${req.originalUrl}`
  });
}

module.exports = {
  errorHandler,
  notFoundHandler
};
