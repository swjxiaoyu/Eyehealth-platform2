# 👁️ 全球去中心化眼睛健康平台

一个基于区块链、IPFS和AI技术的现代化眼健康管理平台，提供产品溯源、报告管理、远程医疗等功能。

## 🚀 快速开始

### 一键启动

```bash
# 启动开发环境（推荐）
start-dev.bat

# 启动完整环境（包含AI服务）
start-all.bat

# 停止所有服务
stop-all.bat

# 检查服务状态
check-status.bat
```

### 服务地址

- **前端应用**: http://localhost:3000
- **后端API**: http://localhost:3001
- **API文档**: http://localhost:3001/api
- **MinIO存储**: http://localhost:9000 (admin/password123)
- **MinIO控制台**: http://localhost:9001
- **AI服务**: http://localhost:8000 (可选)

## 📋 系统要求

- **Node.js**: >= 18.0.0
- **Docker**: >= 20.0.0
- **Python**: >= 3.8 (可选，用于AI服务)
- **操作系统**: Windows 10/11, macOS, Linux

## 🏗️ 项目结构

```
eyehealth-platform/
├── frontend/          # Next.js前端应用
├── backend/           # NestJS后端API
├── ai-service/        # Python AI服务
├── blockchain/         # Hyperledger Fabric配置
├── infrastructure/     # Kubernetes部署配置
├── docs/              # 项目文档
├── scripts/           # 部署脚本
├── start-dev.bat      # 开发环境启动脚本
├── start-all.bat      # 完整环境启动脚本
├── stop-all.bat       # 停止所有服务
└── check-status.bat   # 服务状态检查
```

## 🔧 功能特性

### ✅ 已实现功能

- **用户认证**: JWT + DID钱包登录
- **产品管理**: 产品CRUD、分类管理
- **产品溯源**: QR码扫描、区块链溯源
- **报告管理**: 文件上传、加密存储
- **购物车**: 商品添加、数量管理
- **订单管理**: 订单创建、状态跟踪
- **区块链集成**: Hyperledger Fabric网络
- **IPFS存储**: 去中心化文件存储
- **MinIO存储**: 对象存储服务

### 🚧 开发中功能

- **远程医疗**: 在线问诊、视频通话
- **移动端应用**: React Native应用
- **AI诊断**: 智能眼健康分析
- **推荐系统**: 个性化产品推荐

## 🛠️ 开发指南

### 环境配置

1. **克隆项目**
   ```bash
   git clone <repository-url>
   cd eyehealth-platform
   ```

2. **安装依赖**
   ```bash
   # 后端依赖
   cd backend
   npm install
   
   # 前端依赖
   cd ../frontend
   npm install
   
   # AI服务依赖（可选）
   cd ../ai-service
   pip install -r requirements.txt
   ```

3. **环境变量配置**
   ```bash
   # 复制环境变量模板
   cp backend/env.example backend/.env
   cp frontend/env.example frontend/.env.local
   cp ai-service/env.example ai-service/.env
   ```

### 手动启动服务

1. **启动MinIO**
   ```bash
   docker run -d --name eyehealth-minio -p 9000:9000 -p 9001:9001 \
     -e MINIO_ROOT_USER=admin -e MINIO_ROOT_PASSWORD=password123 \
     minio/minio server /data --console-address ":9001"
   ```

2. **启动后端**
   ```bash
   cd backend
   npm run start:dev
   ```

3. **启动前端**
   ```bash
   cd frontend
   npm run dev
   ```

4. **启动AI服务**（可选）
   ```bash
   cd ai-service
   python main.py
   ```

## 📚 API文档

启动后端服务后，访问 http://localhost:3001/api 查看完整的API文档。

### 主要API端点

- `POST /api/v1/auth/login` - 用户登录
- `POST /api/v1/auth/register` - 用户注册
- `GET /api/v1/products/qr/:qrCode` - 产品扫描（公开）
- `POST /api/v1/reports` - 报告上传
- `GET /api/v1/blockchain/network/info` - 区块链网络信息

## 🔒 安全特性

- **JWT认证**: 安全的用户认证机制
- **DID钱包**: 去中心化身份验证
- **文件加密**: AES-256-GCM加密存储
- **区块链验证**: 不可篡改的数据记录
- **CORS配置**: 跨域请求安全控制

## 🐳 Docker部署

```bash
# 使用Docker Compose启动
docker-compose -f docker-compose.dev.yml up -d
```

## 📊 监控与日志

- **服务状态**: 使用 `check-status.bat` 检查
- **日志查看**: 各服务控制台窗口
- **性能监控**: 内置健康检查端点

## 🤝 贡献指南

1. Fork项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开Pull Request

## 📄 许可证

本项目采用MIT许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 📞 支持

如有问题或建议，请：

- 创建 [Issue](https://github.com/your-repo/issues)
- 发送邮件至 support@eyehealth-platform.com
- 查看 [文档](docs/) 获取更多信息

---

**注意**: 这是一个开发版本，请勿在生产环境中使用。