# 家庭留言板项目文档

## 项目概述

这是一个家庭留言板系统，分为服务端和客户端两部分：
- **服务端**: 提供Web管理界面和REST API，使用Rust + Axum框架
- **客户端**: 嵌入式墨水屏硬件设备（未来开发）

## 技术栈

### 后端
- **语言**: Rust (edition 2024)
- **Web框架**: Axum 0.8.4
- **序列化**: serde + serde_json
- **异步运行时**: Tokio 1.47.1
- **日志**: env_logger + log
- **存储**: 文件存储 (JSON格式)
- **UUID**: uuid 1.18.0
- **时间处理**: chrono 0.4.41

### 前端
- **框架**: React 19.1.1
- **构建工具**: rsbuild 1.4.15
- **样式**: Tailwind CSS 4.0.0 (无需配置文件)
- **PostCSS**: @tailwindcss/postcss 4.1.12
- **组件库**: 自制shadcn/ui风格组件
- **语言**: TypeScript 5.9.2
- **包管理**: bun

## 项目结构

```
server/
├── src/
│   ├── main.rs              # 主程序入口
│   ├── models.rs            # 数据模型定义
│   ├── storage.rs           # 文件存储系统
│   ├── handlers.rs          # API处理器
│   └── frontend/            # 前端代码
│       ├── index.tsx        # 前端入口
│       ├── styles.css       # 全局样式
│       ├── components/      # React组件
│       │   ├── NoticeBoard.tsx    # 主界面组件
│       │   ├── MessageForm.tsx    # 留言表单
│       │   ├── MessageList.tsx    # 留言列表
│       │   └── ui/          # UI组件库
│       └── lib/
│           └── utils.ts     # 工具函数
├── data/                    # 数据存储目录
│   └── data.json           # JSON数据文件
├── web/                    # 构建后的前端静态文件
├── Cargo.toml              # Rust依赖配置
├── package.json            # Node.js依赖配置
├── rsbuild.config.ts       # 前端构建配置
├── postcss.config.js       # PostCSS配置 (Tailwind CSS 4.x 需要)
└── CLAUDE.md              # 项目文档 (本文件)

注意: Tailwind CSS 4.x 不需要 tailwind.config.js，但需要 postcss.config.js 来配置内容扫描
```

## 数据模型

### 留言 (Message)
```rust
struct Message {
    id: Uuid,                    // 唯一标识符
    title: String,               // 标题
    content: String,             // 内容
    author: String,              // 作者
    created_at: DateTime<Utc>,   // 创建时间
    updated_at: DateTime<Utc>,   // 更新时间
    priority: Priority,          // 优先级
    expires_at: Option<DateTime<Utc>>, // 过期时间(可选)
}

enum Priority {
    Low,      // 低优先级
    Normal,   // 普通
    High,     // 高优先级  
    Urgent,   // 紧急
}
```

### 客户端状态 (ClientStatus)
```rust
struct ClientStatus {
    id: String,                  // 客户端唯一ID
    name: String,                // 设备名称
    last_seen: DateTime<Utc>,    // 最后在线时间
    is_online: bool,             // 是否在线
    ip_address: Option<String>,  // IP地址
    device_info: Option<String>, // 设备信息
}
```

### 数据存储结构 (DataStore)
```rust
struct DataStore {
    messages: HashMap<Uuid, Message>,     // 所有留言
    clients: HashMap<String, ClientStatus>, // 客户端状态
    last_updated: DateTime<Utc>,          // 最后更新时间
}
```

## API 接口

### 留言管理
- `GET /api/messages` - 获取所有活跃留言 (按优先级和时间排序)
- `POST /api/messages` - 创建新留言
- `GET /api/messages/{id}` - 获取特定留言
- `PUT /api/messages/{id}` - 更新留言
- `DELETE /api/messages/{id}` - 删除留言

### 系统状态
- `GET /api/clients` - 获取所有客户端状态
- `GET /api/stats` - 获取系统统计信息

### 请求/响应示例

#### 创建留言
```bash
curl -X POST http://localhost:3003/api/messages \
  -H "Content-Type: application/json" \
  -d '{
    "title": "买菜提醒",
    "content": "今天下班记得买菜：西红柿、鸡蛋、青菜",
    "author": "妈妈",
    "priority": "normal"
  }'
```

#### 响应
```json
{
  "id": "47026f70-72b7-4536-9cb1-35cd58978df6",
  "title": "买菜提醒",
  "content": "今天下班记得买菜：西红柿、鸡蛋、青菜",
  "author": "妈妈",
  "created_at": "2025-08-20T08:48:03.084198Z",
  "updated_at": "2025-08-20T08:48:03.084198Z",
  "priority": "normal",
  "expires_at": null
}
```

## 存储系统

### 文件存储 (FileStorage)
- 数据保存在 `./data/data.json` 文件中
- 每次修改都会自动保存到文件
- 使用 `RwLock` 保证并发安全
- JSON格式，便于调试和迁移

### 数据持久化特性
- 自动创建数据目录
- 程序重启后数据保持不变
- 支持手动编辑数据文件
- 原子性写入操作

## 运行说明

### 环境要求
- Rust 1.86+ (edition 2024)
- Node.js/Bun (用于前端构建)

### 开发环境运行
```bash
# 构建前端
bun install
bun run build

# 运行后端
cargo run
```

### 环境变量
- `DATA_DIR`: 数据存储目录 (默认: `./data`)
- `RUST_LOG`: 日志级别 (默认: `info`)

### 访问地址
- Web管理界面: http://localhost:3003
- API接口: http://localhost:3003/api/*

## 功能特性

### 已实现功能
- ✅ 留言的增删改查
- ✅ 优先级管理 (紧急/高/普通/低)
- ✅ 过期时间支持
- ✅ 文件存储系统
- ✅ Web管理界面
- ✅ 响应式设计
- ✅ 中文界面
- ✅ 客户端状态预留接口
- ✅ 统计信息API
- ✅ CORS支持

### 前端界面功能
- 留言列表显示 (按优先级排序)
- 留言创建表单 (标题、内容、作者、优先级)
- 留言删除确认
- 优先级颜色标识
- 时间格式化显示
- 空状态提示

## 未来规划

### 客户端设备支持
- [ ] 墨水屏设备注册和管理
- [ ] 设备在线状态监控
- [ ] 设备特定的留言推送
- [ ] 设备电池状态监控
- [ ] 远程设备控制

### 功能增强
- [ ] 留言分类/标签系统
- [ ] 留言图片附件支持
- [ ] 用户权限管理
- [ ] 留言模板功能
- [ ] 定时留言发布
- [ ] 留言通知提醒
- [ ] 数据导出/备份功能

### 技术优化
- [ ] 数据库支持 (SQLite/PostgreSQL)
- [ ] 缓存系统
- [ ] WebSocket实时推送
- [ ] 移动端适配
- [ ] PWA支持
- [ ] Docker部署支持

## 代码维护说明

### 添加新的API接口
1. 在 `storage.rs` 中添加数据操作方法
2. 在 `handlers.rs` 中添加HTTP处理器
3. 在 `main.rs` 中注册新路由

### 修改数据模型
1. 更新 `models.rs` 中的结构定义
2. 更新 `storage.rs` 中的相关操作
3. 考虑数据迁移兼容性

### 前端组件开发
- 组件位置: `src/frontend/components/`
- 样式使用: Tailwind CSS 4.0 + CSS变量
- 状态管理: React hooks
- 类型定义: TypeScript接口

### 构建和部署
```bash
# 开发模式
cargo run        # 后端
bun run dev      # 前端开发服务器

# 生产构建
bun run build    # 构建前端
cargo build --release  # 构建后端

# 部署
./target/release/notice-board  # 运行生产版本
```

## 故障排除

### 常见问题
1. **端口占用**: 默认端口3003被占用，修改 `main.rs` 中的端口号
2. **权限问题**: 确保数据目录有写入权限
3. **前端构建失败**: 检查Node.js版本和依赖安装
4. **API请求失败**: 检查CORS配置和服务器状态

### 日志调试
```bash
RUST_LOG=debug cargo run  # 开启详细日志
```

### 数据恢复
如果 `data.json` 损坏，可以手动创建空文件：
```json
{
  "messages": {},
  "clients": {},
  "last_updated": "2025-08-20T00:00:00Z"
}
```

## 更新日志

### v0.1.0 (2025-08-20)
- ✅ 初始版本发布
- ✅ 基础留言管理功能
- ✅ Web管理界面
- ✅ 文件存储系统
- ✅ Tailwind CSS 4.0 升级
- ✅ 客户端状态预留接口