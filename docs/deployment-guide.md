# 去中心化眼健康管理平台 - 部署指南

## 项目概述

本项目是一个基于区块链技术的去中心化眼健康管理平台，提供安全、透明、智能的眼健康管理解决方案。

## 技术架构

### 前端
- **框架**: Next.js 15 + React 18 + TypeScript
- **UI库**: Tailwind CSS + shadcn/ui
- **状态管理**: React Context + Hooks
- **认证**: JWT + DID钱包登录

### 后端
- **框架**: NestJS + TypeScript
- **数据库**: PostgreSQL + Redis
- **存储**: MinIO (S3兼容)
- **认证**: JWT + Passport

### AI服务
- **框架**: FastAPI + Python 3.10
- **机器学习**: PyTorch + Transformers
- **向量数据库**: Milvus
- **模型服务**: BentoML

### 区块链
- **平台**: Hyperledger Fabric
- **智能合约**: Go语言
- **存储**: IPFS (去中心化文件存储)

### 基础设施
- **容器化**: Docker + Docker Compose
- **编排**: Kubernetes
- **监控**: Prometheus + Grafana
- **日志**: ELK Stack

## 快速开始

### 环境要求

- Node.js 18+
- Python 3.10+
- Docker & Docker Compose
- Git

### 1. 克隆项目

```bash
git clone <repository-url>
cd eyehealth-platform
```

### 2. 设置环境变量

```bash
# 复制环境变量文件
cp frontend/env.example frontend/.env.local
cp backend/env.example backend/.env
cp ai-service/env.example ai-service/.env
```

### 3. 启动服务

#### 方式一：使用部署脚本（推荐）

```bash
# 给脚本执行权限
chmod +x scripts/deploy-dev.sh

# 部署整个平台
./scripts/deploy-dev.sh deploy
```

#### 方式二：手动启动

```bash
# 1. 启动基础设施服务
docker-compose -f docker-compose.dev.yml up -d postgres redis minio milvus etcd ipfs

# 2. 等待服务启动
sleep 30

# 3. 安装依赖
cd frontend && npm install && cd ..
cd backend && npm install && cd ..
cd ai-service && pip install -r requirements.txt && cd ..

# 4. 启动应用服务
cd backend && npm run start:dev &
cd ai-service && python main.py &
cd frontend && npm run dev &
```

### 4. 访问应用

- **前端应用**: http://localhost:3000
- **后端API**: http://localhost:3001
- **AI服务**: http://localhost:8000
- **MinIO控制台**: http://localhost:9001 (minioadmin/minioadmin)
- **Grafana**: http://localhost:3000 (admin/admin)
- **Prometheus**: http://localhost:9090

## 功能特性

### 1. 用户认证系统
- 支持邮箱/密码登录
- 支持DID钱包登录
- JWT令牌认证
- 用户权限管理

### 2. 文件上传和存储
- 客户端AES加密
- MinIO对象存储
- IPFS去中心化存储
- 区块链哈希验证

### 3. AI智能推荐
- 多模态数据分析
- 个性化产品推荐
- 实时健康监测
- 推荐结果解释

### 4. 产品溯源
- 全链路溯源记录
- 二维码验证
- 防伪认证
- 供应链透明

### 5. 智能合约
- 产品溯源合约
- 报告证明合约
- 订单管理合约
- 授权管理合约

## API文档

### 认证API

```bash
# 用户登录
POST /api/v1/auth/login
{
  "email": "user@example.com",
  "password": "password123"
}

# 用户注册
POST /api/v1/auth/register
{
  "name": "张三",
  "email": "user@example.com",
  "password": "password123",
  "dob": "1990-01-01"
}

# 钱包登录
POST /api/v1/auth/wallet-login
{
  "walletAddress": "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6"
}
```

### 报告API

```bash
# 上传报告
POST /api/v1/reports/upload
Content-Type: multipart/form-data
file: <file>
metadata: {"type": "examination"}

# 获取用户报告
GET /api/v1/reports/user/{userId}

# 获取报告详情
GET /api/v1/reports/{reportId}
```

### 产品API

```bash
# 获取产品列表
GET /api/v1/products

# 扫描产品
GET /api/v1/products/scan/{qrCode}

# 获取产品溯源
GET /api/v1/product/trace/{productId}
```

### 推荐API

```bash
# 获取推荐
POST /api/v1/recommendation
{
  "user_id": "user123",
  "context": {
    "sleep_hours": 8,
    "screen_time": 6,
    "wearing_contacts": true
  },
  "top_k": 5
}
```

## 开发指南

### 前端开发

```bash
cd frontend

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 运行测试
npm test
```

### 后端开发

```bash
cd backend

# 安装依赖
npm install

# 启动开发服务器
npm run start:dev

# 运行测试
npm run test

# 生成API文档
npm run build
# 访问 http://localhost:3001/api/docs
```

### AI服务开发

```bash
cd ai-service

# 安装依赖
pip install -r requirements.txt

# 启动服务
python main.py

# 运行测试
pytest

# 代码格式化
black .
```

## 部署到生产环境

### 1. 构建镜像

```bash
# 构建所有服务镜像
docker build -t eyehealth-frontend ./frontend
docker build -t eyehealth-backend ./backend
docker build -t eyehealth-ai ./ai-service
```

### 2. 部署到Kubernetes

```bash
# 应用Kubernetes配置
kubectl apply -f infrastructure/k8s/

# 检查部署状态
kubectl get pods -n eyehealth-platform
kubectl get services -n eyehealth-platform
```

### 3. 配置域名和SSL

```bash
# 配置Ingress
kubectl apply -f infrastructure/k8s/ingress.yaml

# 配置SSL证书
kubectl apply -f infrastructure/k8s/certificate.yaml
```

## 监控和维护

### 1. 查看日志

```bash
# 查看应用日志
kubectl logs -f deployment/eyehealth-backend -n eyehealth-platform
kubectl logs -f deployment/eyehealth-ai-service -n eyehealth-platform
kubectl logs -f deployment/eyehealth-frontend -n eyehealth-platform
```

### 2. 监控指标

- **Prometheus**: http://prometheus:9090
- **Grafana**: http://grafana:3000
- **应用指标**: `/metrics` 端点

### 3. 数据库维护

```bash
# 备份数据库
pg_dump -h localhost -U postgres eyehealth > backup.sql

# 恢复数据库
psql -h localhost -U postgres eyehealth < backup.sql
```

## 故障排除

### 常见问题

1. **服务启动失败**
   - 检查端口占用: `netstat -tulpn | grep :3000`
   - 检查Docker服务: `docker ps`
   - 查看日志: `docker logs <container-name>`

2. **数据库连接失败**
   - 检查PostgreSQL服务: `docker ps | grep postgres`
   - 检查连接字符串配置
   - 验证数据库用户权限

3. **AI服务无响应**
   - 检查Python依赖: `pip list`
   - 检查模型文件: `ls ai-service/models/`
   - 查看AI服务日志

4. **区块链网络问题**
   - 检查Fabric网络状态: `docker ps | grep fabric`
   - 验证智能合约部署
   - 检查网络配置

### 性能优化

1. **数据库优化**
   - 添加索引
   - 优化查询语句
   - 配置连接池

2. **缓存优化**
   - 启用Redis缓存
   - 配置CDN
   - 优化静态资源

3. **AI服务优化**
   - 使用GPU加速
   - 模型量化
   - 批处理优化

## 安全考虑

1. **数据加密**
   - 客户端AES加密
   - 传输层TLS加密
   - 数据库字段加密

2. **访问控制**
   - JWT令牌验证
   - API限流
   - 权限管理

3. **区块链安全**
   - 私钥管理
   - 智能合约审计
   - 网络隔离

## 贡献指南

1. Fork项目
2. 创建功能分支: `git checkout -b feature/AmazingFeature`
3. 提交更改: `git commit -m 'Add some AmazingFeature'`
4. 推送分支: `git push origin feature/AmazingFeature`
5. 创建Pull Request

## 许可证

本项目采用MIT许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 联系方式

- 项目链接: [GitHub Repository]
- 问题反馈: [GitHub Issues]
- 技术文档: [Wiki]






