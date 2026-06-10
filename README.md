# 卫星互联网运行运维智能体 (Satellite Internet O&M Intelligent Assistant)

> **AI 驱动的卫星测试与运维智能化工作台**

[![React](https://img.shields.io/badge/React-19-blue)](https://react.dev)
[![Node.js](https://img.shields.io/badge/Node.js-20+-green)](https://nodejs.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-cyan)](https://tailwindcss.com)
[![License](https://img.shields.io/badge/License-MIT-yellow)](https://opensource.org/licenses/MIT)

---

## 项目简介

本项目是一个面向**卫星互联网测试与运维领域**的 AI 智能助手平台。产品以对话式交互为核心，整合以下功能模块：

- **对话交互**: 与 AI 进行自然语言对话，获取测试方案建议、代码生成、数据分析
- **智能体市场**: 4 大类 12 个专业智能体，覆盖终端/网络/载荷/全链路测试场景
- **知识库管理**: 企业级 RAG 知识管理体系，支撑协议规范、测试报告、系统文档的结构化管理
- **文档管理**: 文件上传、解析状态追踪、在线预览及引用至对话

---

## 技术选型

### 前端技术栈

| 技术 | 用途 | 版本 |
|------|------|------|
| React | UI 框架 | 19.x |
| Vite | 构建工具 | 6.x |
| Tailwind CSS v4 | 原子化 CSS | 4.x |
| React Router DOM | 路由管理 | 6.x |
| Material Symbols Outlined | 图标系统 | Google Fonts |
| Inter + Plus Jakarta Sans | 字体族 | Google Fonts |

### 后端技术栈

| 技术 | 用途 | 版本 |
|------|------|------|
| Express | Web 框架 | 4.x |
| sql.js | SQLite 数据库 | 最新 |
| cors | 跨域支持 | 2.x |
| uuid | ID 生成 | 9.x |

### 开发工具

- VS Code + Trae IDE
- PowerShell / Terminal
- Chrome DevTools

---

## 项目结构

```
Intelligent_Assistant/
├── frontend/                    # React 前端应用
│   ├── src/
│   │   ├── main.jsx            # 应用入口
│   │   ├── App.jsx             # 路由配置
│   │   ├── index.css           # 全局样式 + Tailwind
│   │   ├── theme/
│   │   │   └── designTokens.js # 设计令牌常量
│   │   ├── layouts/
│   │   │   └── MainLayout.jsx  # 主布局（侧边栏 + TopBar）
│   │   ├── components/
│   │   │   ├── Sidebar.jsx     # 侧边栏导航组件
│   │   │   ├── TopBar.jsx      # 顶部应用栏
│   │   │   └── ChatInput.jsx    # 对话输入框组件
│   │   ├── pages/
│   │   │   ├── NewChatPage.jsx           # 01 新建对话
│   │   │   ├── ChatPage.jsx               # 03 最近对话
│   │   │   ├── AgentCenterPage.jsx        # 02 智能体中心
│   │   │   ├── KnowledgeBasePage.jsx      # 04 知识库管理
│   │   │   └── DocumentManagementPage.jsx  # 05 文档管理
│   │   ├── services/
│   │   │   └── api.js          # API 请求封装
│   │   └── hooks/
│   │       ├── useConversations.js   # 对话 Hook
│   │       ├── useMessages.js        # 消息 Hook
│   │       ├── useKnowledgeBases.js  # 知识库 Hook
│   │       ├── useDocuments.js       # 文档 Hook
│   │       └── useAgents.js          # 智能体 Hook
│   ├── index.html                 # HTML 入口
│   ├── vite.config.js             # Vite 配置
│   └── package.json               # 前端依赖
│
├── backend/                     # Node.js 后端服务
│   ├── src/
│   │   ├── server.js             # 入口文件 (端口 3001)
│   │   ├── config/
│   │   │   └── database.js       # 数据库连接
│   │   ├── controllers/           # 控制器层
│   │   │   ├── conversationController.js
│   │   │   ├── messageController.js
│   │   │   ├── agentController.js
│   │   │   ├── kbController.js
│   │   │   ├── documentController.js
│   │   │   └── userController.js
│   │   ├── routes/               # 路由定义
│   │   │   ├── conversations.js
│   │   │   ├── messages.js
│   │   │   ├── agents.js
│   │   │   ├── knowledgeBases.js
│   │   │   ├── documents.js
│   │   │   └── users.js
│   │   ├── data/
│   │   │   └── seed.js           # Mock 种子数据
│   │   └── middleware/
│   │       └── errorHandler.js   # 全局错误处理
│   ├── database/
│   │   └── init.sql             # 建表 SQL 脚本
│   └── package.json               # 后端依赖
│
├── UI/                          # 高保真原型（HTML 参考）
│   ├── 01-新建对话.html
│   ├── 02-智能体中心.html
│   ├── 03-最近对话.html
│   ├── 04-知识库.html
│   └── 05-文档管理.html
│
├── docs/                        # 项目文档
│   ├── API.md                   # API 接口文档
│   ├── DEPLOYMENT.md            # 部署说明
│   └── PRD-卫星互联网运行运维智能体.md  # 产品需求文档
│
└── README.md                    # 本文件
```

---

## 快速开始

### 前置条件

- Node.js >= 18.0.0
- npm >= 9.0.0

### 1. 安装依赖 & 启动后端

```bash
cd backend
npm install
npm run dev
```
> 后端运行在 http://localhost:3001

### 2. 安装依赖 & 启动前端

```bash
cd frontend
npm install
npm run dev
```
> 前端运行在 http://localhost:5173（API 自动代理到后端）

### 3. 访问应用

打开浏览器访问 http://localhost:5173

---

## 功能模块

### 已实现功能

| 模块 | 功能点 | 状态 |
|------|--------|------|
| **对话管理** | 创建/删除对话 | ✅ |
| | 消息发送与接收 | ✅ |
| | AI Mock 回复（含代码块/图片） | ✅ |
| | 消息点赞/踩反馈 | ✅ |
| | 重新生成回复 | ✅ |
| **智能体市场** | 12 个智能体分 4 类展示 | ✅ |
| | 关键词搜索过滤 | ✅ |
| | 点击卡片创建对话 | ✅ |
| **知识库管理** | 知识库列表/统计 | ✅ |
| | 新建/编辑/删除知识库 | ✅ |
| | 可见性选择（私有/组织/公开） | ✅ |
| **文档管理** | 文档表格展示 | ✅ |
| | 解析状态追踪（3 种状态） | ✅ |
| | 文件上传弹窗（Mock） | ✅ |
| | 文档预览右侧抽屉 | ✅ |
| | 分页控件 | ✅ |
| | 重新解析/删除 | ✅ |
| **导航布局** | 共享侧边栏（280px） | ✅ |
| | 顶部应用栏（毛玻璃效果） | ✅ |
| | 页面间路由导航 | ✅ |
| | 最近对话列表 | ✅ |
| **UI/UX** | Material Design 3 设计令牌 | ✅ |
| | Hover 动效过渡 | ✅ |
| | 弹窗/抽屉动画 | ✅ |
| | 响应式布局（桌面端优化） | ✅ |

### 预留功能（待实现）

- 暗色模式切换
- 移动端 Drawer 侧边栏
- WebSocket 流式 AI 输出
- 真实大模型 API 对接
- 文件上传真实存储
- 用户登录/认证
- 通知中心面板
- 设置页面

---

## 页面导航关系

```
01-新建对话 ──发送消息──▶ 03-最近对话
                              │
        ┌─────────────────────┤
        ▼                     ▼
  02-智能体中心          04-知识库
                                │
                          [进入] │
                                ▼
                         05-文档管理
```

---

## 开发规范

- 代码注释统一使用中文
- 组件采用函数式 + Hooks
- 样式优先使用 Tailwind CSS 类名
- API 统一返回 `{ success, data/error }` 格式
- Git 提交信息格式：`type(scope): description`

---

## License

MIT License

---

*卫星互联网运行运维智能体 © 2026*
