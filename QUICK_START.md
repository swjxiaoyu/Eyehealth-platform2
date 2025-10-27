# 去中心化眼健康管理平台 - 快速启动指南

## 🚀 一键启动脚本

### 方法1: 完整启动脚本 (推荐)
双击运行 `start-services.bat`
- ✅ 自动检查服务状态
- ✅ 智能重启服务
- ✅ 自动打开浏览器
- ✅ 显示服务地址

### 方法2: 快速启动脚本
双击运行 `quick-start.bat`
- ✅ 直接启动前后端
- ✅ 简单快速

### 方法3: 停止服务脚本
双击运行 `stop-services.bat`
- ✅ 停止所有Node.js服务

## 📋 服务地址

- **前端**: http://localhost:3000
- **后端API**: http://localhost:3001
- **数据库**: PostgreSQL (localhost:5432)

## 🔧 手动启动

如果脚本无法正常工作，可以手动启动：

### 启动后端
```bash
cd backend
npm run start:dev
```

### 启动前端
```bash
cd frontend
npm run dev
```

## 📝 环境要求

- ✅ Node.js v22.19.0
- ✅ PostgreSQL (密码: swj21bsss)
- ✅ 数据库: eyehealth

## 🎯 功能特性

### 已实现功能
- ✅ 用户认证系统 (JWT)
- ✅ 用户管理
- ✅ 报告管理
- ✅ 产品管理
- ✅ 订单管理
- ✅ 推荐系统
- ✅ 区块链集成
- ✅ 文件存储

### API端点
- `/api/v1/auth/*` - 认证相关
- `/api/v1/users/*` - 用户管理
- `/api/v1/reports/*` - 报告管理
- `/api/v1/products/*` - 产品管理
- `/api/v1/orders/*` - 订单管理
- `/api/v1/recommendations/*` - 推荐系统
- `/api/v1/blockchain/*` - 区块链功能
- `/api/v1/storage/*` - 文件存储

## 🐛 故障排除

### 端口被占用
如果遇到端口被占用错误，运行 `stop-services.bat` 停止所有服务，然后重新启动。

### 数据库连接失败
确保PostgreSQL服务正在运行，密码设置为 `swj21bsss`。

### 依赖安装问题
如果遇到依赖问题，在对应目录运行：
```bash
npm install
```






