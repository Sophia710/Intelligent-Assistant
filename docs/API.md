# 卫星互联网运行运维智能体 - API 接口文档

> **版本**: v1.0  
> **基础URL**: `http://localhost:3001/api`  
> **认证方式**: Bearer Token (预留)  
> **数据格式**: JSON

---

## 目录

- [通用说明](#通用说明)
- [对话管理 API](#对话管理-api)
- [消息管理 API](#消息管理-api)
- [智能体管理 API](#智能体管理-api)
- [知识库管理 API](#知识库管理-api)
- [文档管理 API](#文档管理-api)
- [用户管理 API](#用户管理-api)

---

## 通用说明

### 统一响应格式

**成功响应**:
```json
{
  "success": true,
  "data": { ... },
  "message": "操作成功"
}
```

**错误响应**:
```json
{
  "success": false,
  "error": "错误描述信息",
  "code": 400
}
```

### HTTP 状态码

| 状态码 | 含义 |
|--------|------|
| 200 | 成功 |
| 201 | 创建成功 |
| 400 | 请求参数错误 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

### 分页参数（适用于列表接口）

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| page | integer | 1 | 页码 |
| pageSize | integer | 20 | 每页条数 |

---

## 对话管理 API

### 获取对话列表

`GET /api/conversations`

**响应示例**:
```json
{
  "success": true,
  "data": [
    {
      "id": "conv-001",
      "title": "如何进行星地链路仿真测试？",
      "agent_id": null,
      "agent_name": null,
      "created_at": "2026-06-05T08:30:00Z",
      "updated_at": "2026-06-05T10:15:00Z",
      "message_count": 3
    }
  ]
}
```

### 获取对话详情

`GET /api/conversations/:id`

**路径参数**: `id` (string) - 对话 ID

**响应**: 包含对话信息及完整消息列表

### 创建新对话

`POST /api/conversations`

**请求体**:
```json
{
  "title": "新对话标题（可选，默认取首条消息前20字）"
}
```

**响应**: 返回新建的对话对象

### 删除对话

`DELETE /api/conversations/:id`

**路径参数**: `id` (string) - 对话 ID

### 发送消息（Mock AI 回复）

`POST /api/conversations/:id/messages`

**请求体**:
```json
{
  "content": "用户输入的消息内容"
}
```

**响应**: 
- 延迟 500~1500ms 后返回 AI 的 Mock 回复
- 回复内容包含文本、代码块、图片引用等复合格式
- 自动追加 user 消息和 assistant 回复到消息列表中一并返回

**Mock AI 回复特性**:
- 首次问候：返回友好欢迎语
- 技术问题：返回含 Python 代码块的详细解答 + 可视化图引用
- 其他问题：返回相关领域知识性回答

---

## 消息管理 API

### 更新消息反馈

`PUT /api/messages/:id/feedback`

**路径参数**: `id` (string) - 消息 ID

**请求体**:
```json
{
  "feedback": "positive" | "negative" | "none"
}
```

### 重新生成回复

`POST /api/messages/:id/regenerate`

**路径参数**: `id` (string) - 要重新生成的 AI 消息 ID

**响应**: 替换该消息为新生成的 Mock 内容

---

## 智能体管理 API

### 获取智能体列表

`GET /api/agents`

**查询参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| category | string | 否 | 过滤分类: terminal / network / payload / e2e |
| keyword | string | 否 | 搜索关键词（匹配名称和描述） |

**响应示例**:
```json
{
  "success": true,
  "data": [
    {
      "id": "agent-001",
      "name": "手机直连卫星终端测试",
      "description": "全面评估手机直连卫星场景下的通信质量与协议一致性。",
      "category": "terminal",
      "icon": "satellite_alt",
      "color_theme": "primary",
      "status": "active"
    }
  ],
  "total": 12
}
```

**智能体分类枚举**:

| category | 名称 | 包含智能体数 |
|----------|------|-----------|
| terminal | 用户终端智能化测试 | 3 |
| network | 星地网络智能化测试 | 3 |
| payload | 卫星载荷智能化测试 | 3 |
| e2e | 全链路智能化验收与运维测试 | 3 |

### 获取智能体详情

`GET /api/agents/:id`

**路径参数**: `id` (string) - 智能 ID

---

## 知识库管理 API

### 获取知识库列表

`GET /api/knowledge-bases`

**响应**: 知识库数组，每项包含 id, name, description, visibility, document_count, created_by, created_at, updated_at

### 获取全局统计

`GET /api/knowledge-bases/stats`

**响应**:
```json
{
  "success": true,
  "data": {
    "totalKBs": 12,
    "totalDocs": 1248,
    "totalStorage": "4.2 GB"
  }
}
```

### 创建知识库

`POST /api/knowledge-bases`

**请求体**:
```json
{
  "name": "知识库名称 (必填)",
  "description": "知识库描述 (可选)",
  "visibility": "private | organization | public (默认 private)"
}
```

### 编辑知识库

`PUT /api/knowledge-bases/:id`

**请求体**: 同创建，所有字段可选

### 删除知识库

`DELETE /api/knowledge-bases/:id`

---

## 文档管理 API

### 获取知识库下的文档列表

`GET /api/knowledge-bases/:kbId/documents`

**路径参数**: `kbId` (string) - 知识库 ID

**查询参数**: page, pageSize, keyword(搜索文件名)

**响应**: 文档列表，每项包含 id, filename, format, size_bytes, upload_time, parse_status

**parse_status 枚举**:

| 状态 | 说明 | 可用操作 |
|------|------|---------|
| pending | 待解析 | 仅删除 |
| parsing | 解析中 | 仅删除（预览/重新解析按钮禁用） |
| completed | 解析完成 | 预览 + 重新解析 + 删除 |
| failed | 解析失败 | 重新解析 + 删除 |

### 获取文档统计

`GET /api/knowledge-bases/:kbId/documents/stats`

**响应**:
```json
{
  "success": true,
  "data": {
    "totalDocs": 128,
    "completedCount": 112,
    "parsingCount": 12,
    "failedCount": 4,
    "usedStorage": "4.2 GB"
  }
}
```

### 上传文档（Mock）

`POST /api/knowledge-bases/:kbId/documents`

**Content-Type**: multipart/form-data

**表单字段**: file (File 对象)

**限制**: PDF / DOCX / TXT，最大 50MB

**Mock 行为**: 不实际存储文件，生成模拟文档记录并随机分配解析状态

### 获取文档预览内容

`GET /api/documents/:id/preview`

**路径参数**: `id` (string) - 文档 ID

**响应**: 返回解析后的文档文本内容（Markdown 格式）

### 删除文档

`DELETE /api/documents/:id`

### 重新触发文档解析

`PUT /api/documents/:id/reparse`

**Mock 行为**: 将 parse_status 从 failed 改为 completed，或从 completed 改为 parsing 再延迟变为 completed

---

## 用户管理 API

### 获取当前用户信息

`GET /api/users/me`

**响应**:
```json
{
  "success": true,
  "data": {
    "id": "user-001",
    "name": "Alex Chen",
    "avatar_url": "https://...",
    "stats": {
      "totalConversations": 5,
      "totalMessages": 23
    }
  }
}
```

---

## 错误码参考

| code | message | 说明 |
|------|---------|------|
| 400 | 参数缺失或格式错误 | 检查必填字段和数据类型 |
| 404 | 资源不存在 | 检查 ID 是否正确 |
| 500 | 服务器内部错误 | 请联系管理员 |

---

*最后更新: 2026-06-05*
