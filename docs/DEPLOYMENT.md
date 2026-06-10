# 卫星互联网运行运维智能体 — 部署说明文档

> **版本**: v1.0  
> **更新日期**: 2026-06-05

---

## 一、系统要求

### 开发环境

| 组件 | 版本要求 | 说明 |
|------|---------|------|
| Node.js | >= 18.0.0 | LTS 版本优先 |
| npm | >= 9.0.0 | 随 Node.js 安装 |
| 浏览器 | Chrome 90+ / Edge 90+ | 开发调试用 |

### 生产环境

| 组件 | 推荐版本 | 说明 |
|------|---------|------|
| Node.js | >= 20.0.0 | LTS 版本 |
| npm | >= 10.0.0 | 或使用 pnpm/yarn |
| PM2 | >= 5.0.0 | 进程管理（推荐） |
| Nginx | >= 1.24 | 反向代理（推荐） |

---

## 二、开发环境搭建

### 步骤 1: 克隆/获取项目代码

```bash
cd your-project-directory
```

项目结构：
```
Intelligent_Assistant/
├── frontend/          # React 前端应用
├── backend/           # Node.js 后端服务
├── UI/                # 高保真原型 HTML（参考）
└── docs/              # 项目文档
```

### 步骤 2: 安装后端依赖

```bash
cd backend
npm install
```

主要依赖包：
- express: Web 框架
- cors: 跨域支持
- uuid: UUID 生成
- sql.js: SQLite 数据库（纯 JS 实现，无需编译工具）

> **注意**: 如需原生性能可替换为 better-sqlite3（需要 Visual Studio Build Tools）

### 步骤 3: 启动后端服务

```bash
# 开发模式（热重载）
npm run dev

# 生产模式
npm start
```

后端默认运行在 **http://localhost:3001**

启动后自动执行数据库初始化和种子数据填充。

验证后端是否正常：
```bash
curl http://localhost:3001/api/health
# 预期返回: {"success":true,"message":"卫星互联网运行运维智能体 API 正常运行"}
```

### 步骤 4: 安装前端依赖

```bash
cd ../frontend
npm install
```

主要依赖包：
- react + react-dom: UI 框架
- react-router-dom: 路由管理
- lucide-react: 图标库（备用）
- tailwindcss + @tailwindcss/vite: CSS 框架

### 步骤 5: 启动前端开发服务器

```bash
npm run dev
```

前端默认运行在 **http://localhost:5173**

Vite 配置了代理规则，`/api` 开头的请求会自动转发到后端 `http://localhost:3001`。

### 步骤 6: 访问应用

浏览器打开 http://localhost:5173 即可看到完整应用。

---

## 三、生产环境部署

### 方案 A: 本地部署（单机）

#### 3.1 构建前端静态文件

```bash
cd frontend
npm run build
```

构建产物输出到 `frontend/dist/` 目录。

#### 3.2 启动后端

```bash
cd backend
npm start
```

#### 3.3 使用 Nginx 托管静态文件 + 反向代理

Nginx 配置示例：

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # 前端静态文件
    location / {
        root /path/to/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # API 反向代理
    location /api {
        proxy_pass http://127.0.0.1:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

重启 Nginx：
```bash
sudo nginx -t && sudo nginx -s reload
```

### 方案 B: PM2 进程管理（推荐）

#### 3.1 安装 PM2

```bash
npm install -g pm2
```

#### 3.2 启动后端进程

```bash
cd backend
pm2 start src/server.js --name "satellite-api"
```

#### 3.3 配置 PM2 开机自启

```bash
pm2 startup
pm2 save
```

常用 PM2 命令：
```bash
pm2 list              # 查看进程列表
pm2 logs satellite-api # 查看日志
pm2 restart satellite-api # 重启
pm2 stop satellite-api    # 停止
```

### 方案 C: Docker 容器化部署（可选）

#### Dockerfile（后端）

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3001
CMD ["node", "src/server.js"]
```

#### Dockerfile（前端 - Nginx）

```dockerfile
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
```

#### docker-compose.yml

```yaml
version: '3.8'
services:
  api:
    build: ./backend
    ports:
      - "3001:3001"
    volumes:
      - ./database:/app/database
  
  web:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - api
```

启动：
```bash
docker-compose up -d --build
```

---

## 四、环境变量配置

当前版本无需额外环境变量配置。后续扩展时可添加：

| 变量名 | 默认值 | 说明 |
|--------|--------|------|
| PORT | 3001 | 服务端口 |
| NODE_ENV | development | 运行环境 |
| DB_PATH | ./database/satellite_assistant.db | 数据库文件路径 |
| JWT_SECRET | (无) | Token 密钥（启用认证时） |
| CORS_ORIGIN | * | 允许的跨域来源 |

---

## 五、常见问题排查

### Q1: 后端启动报错 "Module not found: better-sqlite3"

**原因**: 缺少 C++ 编译工具  
**解决**: 
1. 安装 Visual Studio Build Tools (windows-build-tools)
2. 或改用 sql.js（已适配）：修改 package.json 将 better-sqlife3 替换为 sql.js

### Q2: 前端页面空白 / 样式异常

**原因**: Tailwind CSS 未正确安装  
**解决**:
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Q3: API 请求跨域失败

**原因**: 后端未启动或 CORS 配置问题  
**解决**: 确认后端在 3001 端口运行；Vite 代理配置已设置 `/api -> localhost:3001`

### Q4: 数据库文件不存在

**解决**: 首次启动后端时会自动创建数据库文件和种子数据。如需重置：
```bash
rm backend/database/satellite_assistant.db
npm run dev
```

---

*如有其他问题，请查看后端控制台日志或提交 Issue。*
