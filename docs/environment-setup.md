# 环境变量配置说明

## 1. 前端环境变量 (frontend/.env.local)

```env
# API 配置
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_AI_SERVICE_URL=http://localhost:8000
NEXT_PUBLIC_BLOCKCHAIN_RPC_URL=http://localhost:7051

# 认证配置
NEXT_PUBLIC_AUTH_DOMAIN=your-auth-domain.com
NEXT_PUBLIC_CLIENT_ID=your-client-id

# 存储配置
NEXT_PUBLIC_S3_ENDPOINT=http://localhost:9000
NEXT_PUBLIC_S3_BUCKET=eyehealth-reports

# IPFS 配置
NEXT_PUBLIC_IPFS_GATEWAY=https://ipfs.io/ipfs/

# 应用配置
NEXT_PUBLIC_APP_NAME=去中心化眼健康管理平台
NEXT_PUBLIC_APP_VERSION=1.0.0
```

## 2. 后端环境变量 (backend/.env)

```env
# 数据库配置
DATABASE_URL=postgresql://postgres:password@localhost:5432/eyehealth
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=password
DATABASE_NAME=eyehealth

# Redis配置
REDIS_URL=redis://localhost:6379
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT配置
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production
JWT_REFRESH_EXPIRES_IN=30d

# 存储配置
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET=eyehealth-reports
MINIO_USE_SSL=false

# 区块链配置
FABRIC_NETWORK_CONFIG_PATH=./network-config.yaml
FABRIC_CHANNEL_NAME=eyehealth-channel
FABRIC_CHAINCODE_NAME=eyehealth-contract
FABRIC_PEER_URL=http://localhost:7051
FABRIC_ORDERER_URL=http://localhost:7050

# AI服务配置
AI_SERVICE_URL=http://localhost:8000
AI_SERVICE_TIMEOUT=30000

# Milvus配置
MILVUS_HOST=localhost
MILVUS_PORT=19530
MILVUS_COLLECTION_NAME=eyehealth_embeddings

# 密钥管理
VAULT_URL=http://localhost:8200
VAULT_TOKEN=your-vault-token
VAULT_MOUNT_PATH=secret

# 应用配置
APP_NAME=去中心化眼健康管理平台
APP_VERSION=1.0.0
APP_PORT=3001
APP_HOST=0.0.0.0
NODE_ENV=development

# 安全配置
BCRYPT_ROUNDS=12
RATE_LIMIT_TTL=60
RATE_LIMIT_LIMIT=100

# 文件上传配置
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,image/webp,application/pdf,text/plain

# 日志配置
LOG_LEVEL=debug
LOG_FILE=./logs/app.log

# CORS配置
CORS_ORIGIN=http://localhost:3000
CORS_CREDENTIALS=true

# Swagger配置
SWAGGER_TITLE=眼健康平台API
SWAGGER_DESCRIPTION=基于区块链技术的去中心化眼健康管理平台API文档
SWAGGER_VERSION=1.0.0
SWAGGER_PATH=api/docs
```

## 3. AI服务环境变量 (ai-service/.env)

```env
# AI服务配置
API_HOST=0.0.0.0
API_PORT=8000
API_WORKERS=1

# 模型配置
MODEL_PATH=./models
MODEL_VERSION=v1.0.0
DEVICE=cpu  # 或 cuda

# Milvus配置
MILVUS_HOST=localhost
MILVUS_PORT=19530
MILVUS_COLLECTION_NAME=eyehealth_embeddings

# 日志配置
LOG_LEVEL=INFO
LOG_FILE=./logs/ai-service.log

# 环境配置
NODE_ENV=development

# 模型配置
TEXT_MODEL_NAME=distilbert-base-uncased
VISION_MODEL_NAME=resnet50
MULTIMODAL_MODEL_NAME=clip-vit-base-patch32

# 推荐配置
RECOMMENDATION_TOP_K=5
RECOMMENDATION_CONFIDENCE_THRESHOLD=0.7

# 文件处理配置
MAX_FILE_SIZE=10485760  # 10MB
ALLOWED_IMAGE_TYPES=image/jpeg,image/png,image/gif,image/webp
ALLOWED_DOCUMENT_TYPES=application/pdf,text/plain

# 缓存配置
EMBEDDING_CACHE_SIZE=1000
EMBEDDING_CACHE_TTL=3600  # 1小时

# 性能配置
BATCH_SIZE=32
MAX_CONCURRENT_REQUESTS=10
REQUEST_TIMEOUT=30
```

## 快速设置命令

```bash
# 1. 复制环境变量文件
cp frontend/env.example frontend/.env.local
cp backend/env.example backend/.env
cp ai-service/env.example ai-service/.env

# 2. 编辑环境变量（可选）
# 根据需要修改上述配置文件中的值
```

## 重要说明

### 必须修改的配置项：

1. **JWT密钥** - 生产环境必须使用强密钥
   ```env
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production
   ```

2. **数据库密码** - 建议修改默认密码
   ```env
   DATABASE_PASSWORD=your-secure-password
   ```

3. **MinIO密钥** - 生产环境建议修改
   ```env
   MINIO_ACCESS_KEY=your-access-key
   MINIO_SECRET_KEY=your-secret-key
   ```

### 可选配置项：

- **AI服务设备** - 如果有GPU，可以设置为 `cuda`
- **日志级别** - 生产环境建议设置为 `INFO` 或 `WARN`
- **端口配置** - 如果端口冲突可以修改

### 生产环境注意事项：

1. 所有密钥和密码必须使用强密码
2. 数据库连接使用生产环境地址
3. 启用HTTPS和SSL配置
4. 设置适当的CORS策略
5. 配置监控和日志收集






