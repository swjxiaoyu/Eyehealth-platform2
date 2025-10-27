# 📁 项目结构说明

## 总体架构

```
eyehealth-platform/
├── frontend/          # Next.js 前端应用 (端口: 3000)
├── backend/           # NestJS 后端API (端口: 3001)
├── ai-service/        # Python AI服务 (端口: 8000)
├── blockchain/        # Hyperledger Fabric区块链网络
├── infrastructure/    # Kubernetes 部署配置
├── docs/              # 项目文档
├── start-dev.bat      # 开发环境启动脚本
├── start-all.bat      # 完整环境启动脚本
├── stop-all.bat       # 停止所有服务
├── docker-compose.dev.yml  # Docker Compose配置
└── README.md          # 项目主文档
```

## 🎯 核心模块

### Frontend (前端)
- **技术栈**: Next.js 14 + React + TypeScript + TailwindCSS
- **主要功能**:
  - 用户认证（邮箱/DID钱包）
  - 产品管理和扫码溯源
  - 报告上传和管理
  - 购物车和订单管理
  - 眼健康数据管理
  - 游戏化激励系统
  - 数据分析和可视化

### Backend (后端)
- **技术栈**: NestJS + TypeScript + PostgreSQL + TypeORM
- **主要模块**:
  - `auth/` - 用户认证和JWT
  - `blockchain/` - 区块链溯源服务
  - `product/` - 产品管理
  - `order/` - 订单管理
  - `report/` - 报告管理
  - `user/` - 用户管理
  - `encryption/` - 文件加密
  - `storage/` - MinIO存储
  - `eye-health/` - 眼健康管理
  - `gamification/` - 游戏化系统
  - `notification/` - 通知系统

### AI Service (AI服务)
- **技术栈**: Python + FastAPI
- **主要功能**: 智能推荐和健康分析

### Blockchain (区块链)
- **技术栈**: Hyperledger Fabric
- **主要功能**: 产品溯源和数据不可篡改

### Infrastructure (基础设施)
- **Kubernetes**: K8s 部署配置
- **Monitoring**: Prometheus 监控配置

## 📂 目录详解

### frontend/
```
frontend/
├── src/
│   ├── app/              # Next.js 页面
│   │   ├── auth/         # 认证页面
│   │   ├── dashboard/    # 仪表板
│   │   ├── products/     # 产品管理
│   │   ├── orders/       # 订单管理
│   │   ├── reports/      # 报告管理
│   │   ├── blockchain/   # 区块链溯源
│   │   ├── ipfs/         # IPFS存储
│   │   ├── eye-health/   # 眼健康
│   │   ├── gamification/ # 游戏化
│   │   └── analytics/    # 数据分析
│   ├── components/        # 可复用组件
│   ├── contexts/         # React Context
│   └── lib/              # 工具函数
├── public/               # 静态资源
└── package.json
```

### backend/
```
backend/
├── src/
│   ├── modules/          # 功能模块
│   │   ├── auth/        # 认证模块
│   │   ├── blockchain/  # 区块链模块
│   │   ├── product/     # 产品模块
│   │   ├── order/       # 订单模块
│   │   ├── report/      # 报告模块
│   │   └── user/        # 用户模块
│   ├── entities/        # 数据库实体
│   ├── config/          # 配置文件
│   └── main.ts          # 入口文件
├── test/                # 测试文件
├── uploads/            # 上传文件
└── package.json
```

### blockchain/
```
blockchain/
├── chaincode/           # 智能合约
│   ├── main.go         # 合约代码
│   └── go.mod          # Go依赖
├── config/             # 配置文件
├── network/            # 网络配置
├── scripts/            # 部署脚本
└── start-network.bat   # 启动脚本
```

## 🚀 启动流程

### 开发环境 (推荐)
```bash
.\start-dev.bat
```
启动服务：
- MinIO (端口 9000, 9001)
- Backend (端口 3001)
- Frontend (端口 3000)

### 完整环境
```bash
.\start-all.bat
```
启动服务：
- MinIO (端口 9000, 9001)
- Backend (端口 3001)
- Frontend (端口 3000)
- AI Service (端口 8000)

### 停止服务
```bash
.\stop-all.bat
```

## 📝 配置文件

### 环境变量
- `backend/.env` - 后端配置
- `frontend/.env.local` - 前端配置
- `ai-service/.env` - AI服务配置

### 数据库
- **PostgreSQL**: 主数据库
- **Redis**: 缓存
- **MinIO**: 对象存储

## 🔧 技术栈总结

### 前端
- Next.js 14, React 18, TypeScript
- TailwindCSS, shadcn/ui
- Axios, Zustand

### 后端
- NestJS, TypeScript
- PostgreSQL, TypeORM
- JWT, Passport
- MinIO, IPFS

### 区块链
- Hyperledger Fabric
- Go Chaincode

### DevOps
- Docker, Docker Compose
- Kubernetes
- Prometheus

## 📚 文档

- `README.md` - 主文档
- `blockchain/DEPLOYMENT_GUIDE.md` - 区块链部署
- `docs/` - 详细文档

---

**项目状态**: ✅ 生产就绪  
**最后更新**: 2025-10-24

