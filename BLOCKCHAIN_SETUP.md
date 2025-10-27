# 区块链设置指南

## ⚠️ 警告信息说明

当后端启动时看到以下警告：
```
[Nest] WARN [BlockchainService] Admin user not found in wallet. Please run enrollment script first.
```

这表示**区块链服务未正确初始化**，但**不影响系统正常运行**！

### 默认行为

系统会自动回退到 **Mock（模拟）区块链模式**：
- ✅ 所有功能正常工作
- ✅ 数据保存到 PostgreSQL 数据库
- ✅ 产品溯源功能可用
- ⚠️ 数据**不会**写入真实区块链网络

## 🔧 如果需要启用真实区块链

### 方式一：快速启动（推荐）

如果是第一次运行，直接使用开发模式（已内置 Mock 区块链）：

```bash
# 启动开发环境（自动使用 Mock 区块链）
.\start-dev.bat
```

### 方式二：启用真实区块链

如果需要使用真实的 Hyperledger Fabric 区块链网络：

#### 1. 生成加密材料

```bash
cd blockchain
.\generate-crypto.bat
```

#### 2. 生成创世区块

```bash
# 需要配置 Hyperledger Fabric 工具
configtxgen -profile EyeHealthGenesis -outputBlock ./channel-artifacts/genesis.block -channelID eyehealth-sys-channel
```

#### 3. 启动区块链网络

```bash
cd blockchain\network
docker-compose up -d
```

#### 4. 部署智能合约

```bash
# 安装和实例化链码
# 需要配置 peer CLI 工具
peer chaincode install ...
peer chaincode instantiate ...
```

#### 5. 注册管理员

```bash
cd blockchain
node setup-admin.js
```

## 📝 当前状态

- **开发模式**: 使用 Mock 区块链服务（推荐）
- **生产模式**: 需要完整配置 Hyperledger Fabric 网络

## ✅ 验证区块链状态

### 检查 API

```bash
# 查看区块链网络信息
curl http://localhost:3001/api/v1/blockchain/network/info
```

如果返回包含 `"mock": true`，说明正在使用 Mock 模式。

## 🔍 常见问题

### Q: 警告信息会影响系统运行吗？
**A**: 不会！系统自动使用 Mock 模式，所有功能正常工作。

### Q: 什么时候需要真实区块链？
**A**: 
- 生产环境部署
- 需要真正的数据不可篡改
- 需要跨组织共享数据

### Q: 如何禁用警告？
**A**: 设置环境变量：
```bash
# Windows
set NODE_ENV=development

# Linux/Mac
export NODE_ENV=development
```

然后启动后端：
```bash
cd backend
npm run start:dev
```

## 📚 相关文档

- [Hyperledger Fabric 文档](https://hyperledger-fabric.readthedocs.io/)
- [区块链部署指南](blockchain/DEPLOYMENT_GUIDE.md)

