# Notice Board - 家庭留言板系统

一个简单易用的家庭留言板系统，支持留言管理、优先级设置和过期时间功能。

## 功能特性

- 📝 留言创建、编辑、删除
- 🏷️ 优先级管理（紧急、高、普通、低）
- ⏰ 过期时间设置
- 🎨 响应式Web界面
- 💾 文件存储，无需数据库
- 🔒 系统服务运行，开机自启

## 系统要求

- Linux x86_64 系统
- 需要 root 权限进行安装

## 一键安装

### 在线安装

```bash
# 下载并运行安装脚本
curl -fsSL https://raw.githubusercontent.com/AlanLang/notice-board-server/main/install.sh | sudo bash
```

### 本地安装

```bash
# 下载安装脚本
wget https://raw.githubusercontent.com/AlanLang/notice-board-server/main/install.sh
chmod +x install.sh

# 运行安装
sudo ./install.sh
```

## 使用方法

### 安装命令

```bash
# 安装或更新到最新版本（默认）
sudo ./install.sh
sudo ./install.sh install

# 查看安装状态
./install.sh status

# 卸载系统
sudo ./install.sh uninstall

# 查看帮助
./install.sh help
```

### 服务管理

```bash
# 查看服务状态
sudo systemctl status notice-board

# 启动服务
sudo systemctl start notice-board

# 停止服务
sudo systemctl stop notice-board

# 重启服务
sudo systemctl restart notice-board

# 查看日志
sudo journalctl -u notice-board -f
```

## 访问系统

安装完成后，打开浏览器访问：

```
http://localhost:3003
```

或使用服务器IP地址：

```
http://your-server-ip:3003
```

## 文件位置

```
/etc/notice-board/                 # 安装目录
├── notice-board                   # 主程序
└── data/
    └── data.json                 # 数据文件
```

## API 接口

系统提供 REST API 接口，可用于客户端设备集成：

### 留言管理

```bash
# 获取所有留言
GET /api/messages

# 创建新留言
POST /api/messages
Content-Type: application/json
{
  "title": "留言标题",
  "content": "留言内容",
  "author": "作者",
  "priority": "normal"
}

# 获取特定留言
GET /api/messages/{id}

# 更新留言
PUT /api/messages/{id}

# 删除留言
DELETE /api/messages/{id}
```

### 系统状态

```bash
# 获取客户端状态
GET /api/clients

# 获取系统统计
GET /api/stats
```

## 开发

### 本地开发环境

```bash
# 克隆代码
git clone https://github.com/AlanLang/notice-board-server.git
cd notice-board-server

# 安装前端依赖
bun install

# 构建前端
bun run build

# 运行后端
cargo run
```

### 构建发布版本

```bash
# 构建前端
bun run build

# 构建后端
cargo build --release
```

## 故障排除

### 端口被占用

如果端口 3003 被占用，可以修改源码中的端口设置后重新编译。

### 权限问题

确保安装用户对数据目录有读写权限：

```bash
sudo chown -R $(whoami):$(whoami) /etc/notice-board/data
```

### 服务启动失败

查看详细错误日志：

```bash
sudo journalctl -u notice-board -n 50
```

### 数据文件损坏

如果数据文件损坏，可以重新创建：

```bash
sudo tee /etc/notice-board/data/data.json << 'EOF'
{
  "messages": {},
  "clients": {},
  "last_updated": "2025-08-21T00:00:00Z"
}
EOF
```

## 更新日志

### v0.1.0
- 初始版本发布
- 基础留言管理功能
- Web管理界面
- 系统服务支持

## 许可证

MIT License

## 反馈与支持

如有问题或建议，请在 [GitHub Issues](https://github.com/AlanLang/notice-board-server/issues) 中提交。