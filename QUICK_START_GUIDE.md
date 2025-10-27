# 🚀 去中心化眼健康管理平台 - 快速启动指南

## 📋 系统要求

- **Node.js**: v18+ 
- **Python**: 3.11+
- **PostgreSQL**: 12+
- **操作系统**: Windows 10/11

## ⚡ 一键启动

### 启动所有服务
```bash
# 双击运行或在命令行执行
start-all.bat
```

这将同时启动：
- 🌐 **前端服务** (端口 3000) - Next.js React应用
- 🔧 **后端服务** (端口 3001) - NestJS API服务  
- 🧠 **AI服务** (端口 8000) - FastAPI AI推荐服务

### 停止所有服务
```bash
# 双击运行或在命令行执行
stop-all.bat
```

## 🌐 访问地址

| 服务 | 地址 | 描述 |
|------|------|------|
| **前端应用** | http://localhost:3000 | 主应用界面 |
| **后端API** | http://localhost:3001 | REST API服务 |
| **AI服务** | http://localhost:8000 | AI推荐服务 |
| **API文档** | http://localhost:3001/api/docs | Swagger API文档 |
| **AI文档** | http://localhost:8000/docs | AI服务API文档 |

## 📱 功能页面

| 功能 | 地址 | 描述 |
|------|------|------|
| **用户仪表板** | http://localhost:3000/dashboard | 用户个人中心 |
| **报告管理** | http://localhost:3000/reports | 上传、查看、下载报告 |
| **产品管理** | http://localhost:3000/products | 产品列表和创建 |
| **产品扫描** | http://localhost:3000/products/scan | 二维码扫描溯源 |
| **AI推荐** | http://localhost:3000/recommendations | 个性化产品推荐 |
| **购物车** | http://localhost:3000/cart | 购物车和结账 |
| **订单管理** | http://localhost:3000/orders | 订单查看和管理 |

## 🧪 测试功能

### 测试AI推荐服务
```bash
node test-ai-service.js
```

### 测试产品扫描
使用测试二维码：
- `QR_EYE001_2024` - 护眼蓝光眼镜
- `QR_EYE002_2024` - 叶黄素补充剂

## 🔧 手动启动（可选）

如果一键启动有问题，可以手动启动各个服务：

### 1. 启动前端
```bash
cd frontend
npm run dev
```

### 2. 启动后端
```bash
cd backend  
npm run start:dev
```

### 3. 启动AI服务
```bash
cd ai-service
python main.py
```

## 📊 服务状态检查

### 检查端口占用
```bash
netstat -ano | findstr "3000"  # 前端
netstat -ano | findstr "3001"  # 后端
netstat -ano | findstr "8000"  # AI服务
```

### 检查服务健康状态
- 前端: http://localhost:3000
- 后端: http://localhost:3001/health
- AI服务: http://localhost:8000/health

## 🐛 常见问题

### 1. 端口被占用
```bash
# 停止所有服务
stop-all.bat

# 或手动停止特定端口
netstat -ano | findstr "3000"
taskkill /PID <进程ID> /F
```

### 2. Python环境问题
```bash
# 检查Python版本
python --version

# 安装依赖
cd ai-service
python -m pip install fastapi uvicorn python-multipart numpy pandas pillow requests
```

### 3. 数据库连接问题
```bash
# 检查PostgreSQL是否运行
# 确保数据库密码正确: swj21bsss
```

## 🎯 功能特性

### ✅ 已实现功能
- [x] **用户认证** - 注册、登录、JWT令牌
- [x] **报告管理** - 上传、查看、下载、删除
- [x] **产品管理** - CRUD操作
- [x] **产品溯源** - 二维码扫描、供应链追踪
- [x] **AI推荐** - 个性化产品推荐
- [x] **多模态分析** - 图像、PDF、文本分析

### 🚧 待实现功能
- [ ] **订单管理** - 支付集成、智能合约退款
- [ ] **MinIO存储** - 对象存储服务
- [ ] **IPFS存储** - 去中心化文件存储
- [ ] **区块链集成** - Hyperledger Fabric
- [ ] **文件加密** - 上传文件加密
- [ ] **DID钱包** - 去中心化身份登录
- [ ] **远程医疗** - 在线问诊功能
- [ ] **移动应用** - React Native应用

## 📞 技术支持

如果遇到问题，请检查：
1. 所有服务是否正常启动
2. 端口是否被占用
3. 数据库连接是否正常
4. Python和Node.js环境是否正确

---

**🎉 现在您可以开始使用去中心化眼健康管理平台了！**