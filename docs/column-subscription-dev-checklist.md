# 知识库 - 专栏订阅功能 开发清单(阶段一 · 待审核)

> 版本: v0.1 (Development Checklist)
> 状态: **待用户审核**
> 创建日期: 2026-06-15
> 对应 PRD: PRD-卫星互联网运行运维智能体.md
> 待插入位置: 上述 PRD 的 §4.6 专栏订阅 (新增章节)

---

## A. 数据模型设计

### A.1 数据库表设计 (4 张表)

#### 表 1: `columns` (专栏表 — 管理员预配置)

| 字段 | 类型 | 必填 | 默认 | 说明 |
| --- | --- | --- | --- | --- |
| id | VARCHAR(36) | ✓ | UUID | 专栏主键 |
| name | VARCHAR(50) | ✓ | — | 专栏名称 |
| description | VARCHAR(200) | ✓ | — | 主题描述 |
| cover_url | VARCHAR(255) | | NULL | 封面图 URL(可使用占位) |
| topic | VARCHAR(50) | ✓ | — | 主题标签(用于文章匹配推送) |
| topic_keywords | JSON | ✓ | — | 主题关键词数组,文章标题/摘要含关键词即匹配 |
| sort_order | INT | | 0 | 展示排序权重(数字越小越靠前) |
| is_active | BOOLEAN | ✓ | TRUE | 是否启用(FALSE 时用户端不可见) |
| created_at | DATETIME | ✓ | NOW | |
| updated_at | DATETIME | ✓ | NOW | |

**索引:**
- `idx_active_sort` (is_active, sort_order) — 列表查询
- `idx_topic` (topic) — 按主题筛文章

#### 表 2: `column_articles` (专栏文章表 — 系统按主题匹配入库)

| 字段 | 类型 | 必填 | 默认 | 说明 |
| --- | --- | --- | --- | --- |
| id | VARCHAR(36) | ✓ | UUID | 文章主键 |
| column_id | VARCHAR(36) | ✓ | — | 所属专栏 FK |
| title | VARCHAR(200) | ✓ | — | 文章标题 |
| summary | VARCHAR(300) | ✓ | — | 文章摘要 |
| source | VARCHAR(100) | | NULL | 来源(如:"平台公告"、"管理员录入") |
| source_url | VARCHAR(255) | | NULL | 原文链接(可空) |
| published_at | DATETIME | ✓ | — | 发布时间(用于排序) |
| created_at | DATETIME | ✓ | NOW | |

**索引:**
- `idx_column_published` (column_id, published_at DESC) — 专栏内按时间倒序
- `idx_published` (published_at DESC) — 全局按时间倒序

#### 表 3: `user_column_subscriptions` (用户订阅关系表)

| 字段 | 类型 | 必填 | 默认 | 说明 |
| --- | --- | --- | --- | --- |
| id | VARCHAR(36) | ✓ | UUID | 订阅主键 |
| user_id | VARCHAR(36) | ✓ | — | 订阅者 FK |
| column_id | VARCHAR(36) | ✓ | — | 专栏 FK |
| status | ENUM | ✓ | 'active' | `active` / `unsubscribed` |
| subscribed_at | DATETIME | ✓ | NOW | 订阅时间 |
| updated_at | DATETIME | ✓ | NOW | |

**索引:**
- `uniq_user_column` (user_id, column_id) — 唯一约束,防止重复订阅
- `idx_user_status_time` (user_id, status, subscribed_at DESC) — 我的订阅查询

#### 表 4: `column_article_reads` (用户文章已读记录表 — 用于"最新更新"标记)

| 字段 | 类型 | 必填 | 默认 | 说明 |
| --- | --- | --- | --- | --- |
| id | VARCHAR(36) | ✓ | UUID | |
| user_id | VARCHAR(36) | ✓ | — | |
| article_id | VARCHAR(36) | ✓ | — | |
| read_at | DATETIME | ✓ | NOW | |

**索引:**
- `uniq_user_article` (user_id, article_id) — 唯一约束
- `idx_user_read_at` (user_id, read_at DESC)

### A.2 实体关系图

```
┌─────────────────┐         ┌─────────────────────┐
│    columns      │         │  column_articles    │
│ ─────────────── │         │ ──────────────────  │
│ id (PK)         │←────────│ column_id (FK)      │
│ name            │  1   N  │ id (PK)             │
│ description     │         │ title               │
│ cover_url       │         │ summary             │
│ topic           │         │ source              │
│ topic_keywords  │         │ source_url          │
│ sort_order      │         │ published_at        │
│ is_active       │         └─────────────────────┘
│ created_at      │                  ▲
│ updated_at      │                  │ N
└─────────────────┘                  │
        ▲                            │
        │ 1                          │
        │                            │
┌───────────────────────┐   ┌─────────────────────┐
│ user_column_           │   │ column_article_     │
│   subscriptions        │   │   reads             │
│ ─────────────────────  │   │ ──────────────────  │
│ id (PK)                │   │ id (PK)             │
│ user_id                │   │ user_id             │
│ column_id (FK)         │   │ article_id (FK)     │
│ status                 │   │ read_at             │
│ subscribed_at          │   └─────────────────────┘
│ updated_at             │
└───────────────────────┘
```

### A.3 数据隔离原则

| 隔离维度 | 实施 |
| --- | --- |
| 表级隔离 | 4 张表均以 `column_` 前缀命名,与 `knowledge_bases` / `documents` 无字段交叉 |
| 命名空间 | 前端 mock 文件 `mockColumns.js` / `mockColumnArticles.js` / `mockColumnSubscriptions.js` / `mockColumnReads.js` 独立 |
| Hook 隔离 | `useColumnSubscriptions` 不引用 `useKnowledgeBases`,互不依赖 |
| 路由隔离 | `/columns/*` 与 `/knowledge-base` 平级 |
| 视觉隔离 | 专栏卡片带专属"📡 专栏"标识,KB 卡片不带 |

---

## B. API 接口定义 (Mock 实现)

### B.1 专栏相关接口

| 方法 | 路径 | 说明 | 请求 / 响应 |
| --- | --- | --- | --- |
| GET | `/api/columns` | 获取所有启用的专栏列表 | Resp: `Column[]`,支持 `?topic=` 过滤 |
| GET | `/api/columns/:id` | 获取专栏详情 | Resp: `Column` |
| GET | `/api/columns/:id/articles` | 获取专栏文章列表(按 published_at 倒序) | Resp: `ColumnArticle[]`,支持 `?page=&pageSize=` |
| GET | `/api/columns/:id/articles/:aid` | 获取单篇文章 | Resp: `ColumnArticle` |
| GET | `/api/columns/articles/recent` | 获取全部专栏最近文章(用于推送流) | Resp: `ColumnArticle[]`,支持 `?limit=` |

### B.2 订阅相关接口

| 方法 | 路径 | 说明 | 请求 / 响应 |
| --- | --- | --- | --- |
| GET | `/api/columns/subscriptions/me` | 获取当前用户的订阅列表(含专栏信息) | Resp: `SubscriptionWithColumn[]` |
| POST | `/api/columns/:id/subscribe` | 订阅专栏 | Req: empty; Resp: `Subscription` |
| DELETE | `/api/columns/:id/subscribe` | 取消订阅 | Resp: `{ success: true }` |

### B.3 已读记录接口

| 方法 | 路径 | 说明 | 请求 / 响应 |
| --- | --- | --- | --- |
| POST | `/api/columns/articles/:aid/read` | 标记文章为已读 | Req: empty; Resp: `{ success: true }` |
| GET | `/api/columns/articles/me/reads` | 获取当前用户的已读文章 ID 集合 | Resp: `{ readArticleIds: string[] }` |

### B.4 数据结构定义 (TypeScript-like)

```ts
// 专栏
interface Column {
  id: string
  name: string
  description: string
  cover_url: string | null
  topic: string
  topic_keywords: string[]
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at: string
  // 冗余统计字段(便于前端展示)
  article_count?: number
  subscriber_count?: number
}

// 专栏文章
interface ColumnArticle {
  id: string
  column_id: string
  title: string
  summary: string
  source: string | null
  source_url: string | null
  published_at: string  // ISO datetime
  created_at: string
}

// 订阅关系(含专栏信息,减少前端二次查询)
interface SubscriptionWithColumn {
  id: string
  user_id: string
  column_id: string
  status: 'active' | 'unsubscribed'
  subscribed_at: string
  updated_at: string
  column: Column  // 嵌套完整专栏信息
  // 冗余:未读文章数
  unread_count?: number
}
```

### B.5 Mock 实现方案

**前端纯 Mock,无后端。** 数据存储在 `src/data/mockColumn*.js` 中,API 通过 `src/services/api.js` 的 mock 拦截器返回:

```js
// src/services/mockColumnApi.js
export const mockColumnApi = {
  getColumns: (params) => Promise.resolve(mockColumns.filter(c => c.is_active)),
  getColumn: (id) => Promise.resolve(mockColumns.find(c => c.id === id)),
  getColumnArticles: (id) => Promise.resolve(
    mockColumnArticles
      .filter(a => a.column_id === id)
      .sort((a, b) => b.published_at.localeCompare(a.published_at))
  ),
  getMySubscriptions: () => Promise.resolve(buildMySubscriptions()),
  subscribe: (columnId) => Promise.resolve(addSubscription(columnId)),
  unsubscribe: (columnId) => Promise.resolve(removeSubscription(columnId)),
  markArticleRead: (articleId) => Promise.resolve(markRead(articleId)),
  getMyReads: () => Promise.resolve(loadReadIds()),
}
```

**持久化:**
- 订阅关系 + 已读记录 → `localStorage['user:column:subs:v1']` / `localStorage['user:column:reads:v1']`
- 专栏 + 文章 → 静态 mock 文件(只读)

---

## C. 前端交互流程

### C.1 页面架构

```
KnowledgeBasePage (现有,改造)
  └── Tab 切换: [我的知识库] [专栏订阅]  ← 新增 Tab

专栏浏览页        /columns                (新)
我的订阅页        /columns/my-subs        (新)
专栏详情页        /columns/:id            (新)
文章详情页        /columns/:id/a/:aid     (新)
```

### C.2 关键流程图

#### 流程 1: 订阅/取消订阅

```
[进入专栏浏览页]
       │
       ▼
[加载 Column[] + 我的订阅 ID 集合]
       │
       ▼
[渲染卡片列表]
   - 未订阅: 蓝色 "+ 订阅" 按钮
   - 已订阅: 灰色 "✓ 已订阅" 按钮(hover 显示 "退订")
       │
       ├─ 点击 "+ 订阅"
       │     │
       │     ▼
       │   POST /columns/:id/subscribe
       │     │
       │     ▼
       │   更新 localStorage + 刷新订阅集合
       │     │
       │     ▼
       │   按钮变为 "✓ 已订阅" + Toast "订阅成功"
       │
       └─ 点击 "✓ 已订阅" (确认退订)
             │
             ▼
           DELETE /columns/:id/subscribe
             │
             ▼
           更新 localStorage + 刷新订阅集合
             │
             ▼
           按钮变为 "+ 订阅" + Toast "已取消订阅"
```

#### 流程 2: 内容推送(主题匹配)

```
[定时器每 60s 触发(或初始化时执行)]
       │
       ▼
[读取 localStorage 订阅的专栏 ID 列表]
       │
       ▼
[为每个订阅的专栏,查询其文章列表]
       │
       ▼
[筛选出 published_at > 上次查看时间 的新文章]
       │
       ▼
[对每篇新文章,标记 column_id 的所有订阅者为"有未读"]
       │
       ▼
[更新 TopBar 铃铛徽章: 总未读数 = Σ(每专栏未读数)]
```

**Mock 中的"按主题自动筛选推送"实现:**
- 静态 mock 文件预置 8 个专栏 + 每专栏 6-10 篇文章
- 部分文章 `published_at` 设为"未来时间"(相对当前会话时间 +1h/2h),模拟"刚推送的新文章"
- 定时器把"新文章"标记为未读,演示铃铛红点

#### 流程 3: "最新更新"标记

```
[加载文章列表]
       │
       ▼
[对当前用户,JOIN column_article_reads 表]
       │
       ▼
[计算每篇文章的 is_new 标记]
   is_new = (read_at IS NULL) AND (published_at > subscribed_at)
       │
       ▼
[渲染时,is_new = true 的卡片左上角显示红色 "最新" 徽章]
       │
       ▼
[用户点击文章 → POST /articles/:aid/read]
       │
       ▼
[is_new 标记变为 false,徽章消失]
```

#### 流程 4: 我的订阅页排序

```
[进入 /columns/my-subscriptions]
       │
       ▼
[加载我的订阅列表(含嵌套专栏信息)]
       │
       ▼
[按"专栏内最新文章 published_at 倒序"排序]
   ORDER BY max(article.published_at) DESC
       │
       ▼
[渲染卡片网格,每卡片显示:]
   - 专栏封面/名称/简介
   - 订阅时间
   - 未读文章数(红色徽章)
   - 最近 3 篇文章的缩略(标题 + 发布时间)
       │
       ▼
[支持二级排序切换: 最近更新 ↓ / 订阅时间 ↓]
```

### C.3 状态管理

| 范围 | 方案 | 文件 |
| --- | --- | --- |
| 全局未读数 | React Context (`ColumnNotificationContext`) | `contexts/ColumnNotificationContext.jsx` |
| 订阅关系 | Hook (`useColumnSubscriptions`) | `hooks/useColumnSubscriptions.js` |
| 专栏列表/详情 | Hook (`useColumns`) | `hooks/useColumns.js` |
| 文章列表/详情 | Hook (`useColumnArticles`) | `hooks/useColumnArticles.js` |
| 已读记录 | Hook (`useColumnReads`) | `hooks/useColumnReads.js` |
| 当前用户 | 模拟登录态,role = `subscriber` | `hooks/useCurrentUser.js` |

### C.4 关键组件清单

| 组件 | 职责 | 文件 |
| --- | --- | --- |
| `ColumnCard` | 专栏卡片(浏览页网格项) | `components/columns/ColumnCard.jsx` |
| `ColumnSubscribeButton` | 订阅/退订按钮(带状态切换) | `components/columns/ColumnSubscribeButton.jsx` |
| `ColumnArticleListItem` | 文章列表项(含最新徽章) | `components/columns/ColumnArticleListItem.jsx` |
| `ColumnTopicChip` | 主题标签 | `components/columns/ColumnTopicChip.jsx` |
| `ColumnNotificationBell` | TopBar 铃铛+未读数 | `components/columns/ColumnNotificationBell.jsx` |
| `ColumnNotificationPanel` | 通知中心 Popover | `components/columns/ColumnNotificationPanel.jsx` |
| `MySubscriptionCard` | 我的订阅页卡片 | `components/columns/MySubscriptionCard.jsx` |
| `NewBadge` | "最新" 徽章 | `components/columns/NewBadge.jsx` |

### C.5 路由 & 侧边栏接入

| 改造点 | 改动 |
| --- | --- |
| `App.jsx` | 新增 4 个路由:`/columns` `/columns/my-subs` `/columns/:id` `/columns/:id/a/:aid` |
| `Sidebar.jsx` | 在"知识库"分组下新增 2 项:"专栏市场" `/columns`、"我的订阅" `/columns/my-subs` |
| `KnowledgeBasePage.jsx` | 增加内部 Tab: `[我的知识库] [专栏订阅]`,点击"专栏订阅" Tab 嵌入 `<ColumnsBrowsePage />` |
| `TopBar.jsx` | 右上角铃铛旁新增专栏通知铃铛(显示专栏未读数) |

---

## D. 权限控制逻辑

### D.1 角色定义(简化版)

| 角色 | 标识 | 本期权限 |
| --- | --- | --- |
| 管理员 | `admin` | 专栏/文章的 CRUD(本期不做 UI,数据静态预置) |
| 普通用户 | `user` | 浏览 + 订阅/退订 + 阅读 |

### D.2 权限控制矩阵

| 操作 | 管理员 | 普通用户 |
| --- | --- | --- |
| 浏览专栏列表 | ✓ | ✓ |
| 浏览文章 | ✓ | ✓ |
| 订阅/退订专栏 | ✓ | ✓ |
| 标记文章已读 | ✓ | ✓ |
| 创建/编辑/删除专栏 | ✓(本期静态,无 UI) | ✗ |
| 推送文章到专栏 | ✓(本期静态,无 UI) | ✗ |

### D.3 前端权限实施

```js
// hooks/useCurrentUser.js
export function useCurrentUser() {
  // 本期固定为普通用户
  return {
    id: 'user-001',
    username: 'demo',
    role: 'user',
    display_name: '演示用户',
  }
}

// 权限判断工具
export function can(user, action) {
  const PERMISSIONS = {
    admin: ['*'],
    user: [
      'columns.view', 'columns.subscribe', 'columns.unsubscribe',
      'articles.view', 'articles.read',
    ],
  }
  const allowed = PERMISSIONS[user.role] || []
  return allowed.includes('*') || allowed.includes(action)
}

// 页面级使用
{can(currentUser, 'columns.create') && (
  <Button>新建专栏</Button>
)}
```

### D.4 数据级权限

| 场景 | 规则 |
| --- | --- |
| 列表可见性 | `is_active = true` 的专栏才对用户可见 |
| 订阅唯一性 | `UNIQUE (user_id, column_id)` 防重复 |
| 取消订阅 | 仅本人订阅可退订(后端按 user_id 过滤) |
| 文章可见性 | 已订阅或公开专栏,文章对所有用户可见 |

---

## E. 性能与扩展性

| 维度 | 措施 |
| --- | --- |
| 列表查询 | 列表接口支持分页(`?page=&pageSize=`),默认 20 条 |
| 订阅关系查询 | `user_id` 字段加索引,O(1) 定位 |
| 推送未读计算 | 订阅时记录 `subscribed_at`,新文章判定 = `published_at > subscribed_at AND NOT IN reads` |
| 铃铛数字更新 | 使用 `useMemo` 缓存,避免每次渲染重算 |
| 通知中心渲染 | 最多展示 50 条,超出点击"查看全部" |
| 代码分割 | `React.lazy` 加载 `/columns/*` 路由 |
| 未来扩展 | 数据结构兼容未来分页/全文检索/SSR |

---

## F. Mock 数据规模(本轮交付)

| 数据 | 数量 | 说明 |
| --- | --- | --- |
| 专栏 | 8 个 | 8 个主题各 1 个,is_active=true |
| 文章 | 64 篇 | 每专栏 8 篇,published_at 跨 30 天,3 篇为"最新" |
| 订阅关系 | 0 条(初始) | 用户主动操作后写入 localStorage |
| 已读记录 | 0 条(初始) | 用户点击文章后写入 localStorage |

---

## G. 验收清单

### G.1 功能验收

- [ ] 知识库页可切换"我的知识库"和"专栏订阅"两个 Tab
- [ ] 专栏浏览页加载并展示 8 个专栏卡片
- [ ] 订阅按钮点击后状态切换 + Toast 提示
- [ ] 取消订阅后按钮恢复
- [ ] 订阅关系持久化(刷新页面后保持)
- [ ] 我的订阅页展示已订阅专栏,按专栏内最新文章时间倒序
- [ ] 文章列表中"最新"徽章正确显示
- [ ] 点击文章后,徽章消失
- [ ] 铃铛数字 = 未读文章总数,实时更新
- [ ] 通知中心 Popover 可展开,点击通知跳转文章并标记已读
- [ ] 专栏内容**不**出现在我的知识库列表

### G.2 数据隔离验收

- [ ] 4 张表/4 个 mock 文件相互独立
- [ ] 专栏 Hooks 不引用 `useKnowledgeBases`
- [ ] 路由 `/columns/*` 与 `/knowledge-base` 平级

### G.3 视觉/交互验收

- [ ] 与现有界面风格一致
- [ ] 响应式 1280+ / 768 / 375 正常
- [ ] 空状态:无订阅/无通知时的友好提示
- [ ] 暗色模式兼容

### G.4 性能验收

- [ ] 专栏浏览页首屏 < 200ms
- [ ] 订阅操作响应 < 100ms
- [ ] 铃铛点击 < 50ms

---

## H. 待您确认的开放问题

1. **"系统按主题筛选推送"** 的实现策略:
   - A. **静态预置**(推荐):mock 文件直接预置每专栏已匹配好的文章,演示用
   - B. **运行时匹配**:定时器扫描所有文章,按 `topic_keywords` 匹配,真实逻辑演示
2. **"按更新时间排序"** 的二级排序:
   - A. 仅按专栏内最新文章时间倒序
   - B. 支持切换:最近更新 / 订阅时间 / 专栏名称
3. **未读标记的清除时机**:
   - A. 仅在用户点击文章详情时清除
   - B. 在通知中心点击时也算清除
4. **mock 数据刷新机制**:
   - A. 硬编码(刷新页面数据不变)
   - B. 启动时模拟"过去 30 天内陆续发布"的时间戳,看起来更真实

---

**请审核以上清单,确认后我会:**

1. 将本清单作为 `§4.6 专栏订阅` 章节插入 PRD 文件 `d:\XW\Project\Intelligent_Assistant\docs\PRD-卫星互联网运行运维智能体.md`
2. 然后按 PRD 进行代码实现(4 个 mock 文件 + 5 个 hooks + 1 个 context + 8 个组件 + 4 个页面 + 路由 + Sidebar/TopBar/KnowledgeBasePage 改造)
