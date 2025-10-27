# 去中心化眼健康管理平台 - 项目配置

## 环境变量配置

### 前端环境变量 (.env.local)
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
```

### 后端环境变量 (.env)
```env
# 数据库配置
DATABASE_URL=postgresql://postgres:password@localhost:5432/eyehealth
REDIS_URL=redis://localhost:6379

# JWT 配置
JWT_SECRET=your-jwt-secret-key
JWT_EXPIRES_IN=7d

# 存储配置
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET=eyehealth-reports

# 区块链配置
FABRIC_NETWORK_CONFIG_PATH=./network-config.yaml
FABRIC_CHANNEL_NAME=eyehealth-channel
FABRIC_CHAINCODE_NAME=eyehealth-contract

# AI 服务配置
AI_SERVICE_URL=http://localhost:8000
MILVUS_HOST=localhost
MILVUS_PORT=19530

# 密钥管理
VAULT_URL=http://localhost:8200
VAULT_TOKEN=your-vault-token
```

### AI 服务环境变量 (.env)
```env
# FastAPI 配置
API_HOST=0.0.0.0
API_PORT=8000
API_WORKERS=4

# 模型配置
MODEL_PATH=./models
MODEL_VERSION=v1.0.0
DEVICE=cpu  # 或 cuda

# Milvus 配置
MILVUS_HOST=localhost
MILVUS_PORT=19530
MILVUS_COLLECTION_NAME=eyehealth_embeddings

# 日志配置
LOG_LEVEL=INFO
LOG_FILE=./logs/ai-service.log
```

## Docker Compose 配置

### 开发环境 (docker-compose.dev.yml)
```yaml
version: '3.8'

services:
  # 数据库服务
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: eyehealth
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  # 存储服务
  minio:
    image: minio/minio:latest
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: minioadmin
    ports:
      - "9000:9000"
      - "9001:9001"
    volumes:
      - minio_data:/data

  # 向量数据库
  milvus:
    image: milvusdb/milvus:latest
    ports:
      - "19530:19530"
    volumes:
      - milvus_data:/var/lib/milvus

  # IPFS 节点
  ipfs:
    image: ipfs/go-ipfs:latest
    ports:
      - "4001:4001"
      - "5001:5001"
      - "8080:8080"
    volumes:
      - ipfs_data:/data/ipfs

  # 区块链网络
  fabric-peer:
    image: hyperledger/fabric-peer:latest
    environment:
      - CORE_PEER_ID=peer0.org1.example.com
      - CORE_PEER_ADDRESS=peer0.org1.example.com:7051
    ports:
      - "7051:7051"

  # 监控服务
  prometheus:
    image: prom/prometheus:latest
    ports:
      - "9090:9090"
    volumes:
      - ./infrastructure/monitoring/prometheus.yml:/etc/prometheus/prometheus.yml

  grafana:
    image: grafana/grafana:latest
    ports:
      - "3000:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
    volumes:
      - grafana_data:/var/lib/grafana

volumes:
  postgres_data:
  minio_data:
  milvus_data:
  ipfs_data:
  grafana_data:
```

## Kubernetes 配置

### 命名空间
```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: eyehealth-platform
```

### ConfigMap
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: eyehealth-config
  namespace: eyehealth-platform
data:
  DATABASE_URL: "postgresql://postgres:password@postgres-service:5432/eyehealth"
  REDIS_URL: "redis://redis-service:6379"
  MINIO_ENDPOINT: "minio-service"
  MILVUS_HOST: "milvus-service"
```

### Secret
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: eyehealth-secrets
  namespace: eyehealth-platform
type: Opaque
data:
  JWT_SECRET: <base64-encoded-secret>
  MINIO_ACCESS_KEY: <base64-encoded-key>
  MINIO_SECRET_KEY: <base64-encoded-secret>
```

## 开发工具配置

### VS Code 设置 (.vscode/settings.json)
```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.preferences.importModuleSpecifier": "relative",
  "files.exclude": {
    "**/node_modules": true,
    "**/dist": true,
    "**/.next": true
  }
}
```

### ESLint 配置 (.eslintrc.js)
```javascript
module.exports = {
  extends: [
    'next/core-web-vitals',
    '@typescript-eslint/recommended',
    'prettier'
  ],
  rules: {
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/no-explicit-any': 'warn',
    'prefer-const': 'error'
  }
}
```

### Prettier 配置 (.prettierrc)
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2
}
```

## 部署脚本

### 开发环境部署 (scripts/deploy-dev.sh)
```bash
#!/bin/bash

echo "🚀 部署开发环境..."

# 启动基础设施
docker-compose -f docker-compose.dev.yml up -d

# 等待服务启动
sleep 30

# 启动后端服务
cd backend
npm install
npm run start:dev &

# 启动AI服务
cd ../ai-service
pip install -r requirements.txt
python main.py &

# 启动前端
cd ../frontend
npm install
npm run dev &

echo "✅ 开发环境部署完成！"
echo "前端: http://localhost:3000"
echo "后端API: http://localhost:3001"
echo "AI服务: http://localhost:8000"
echo "MinIO控制台: http://localhost:9001"
echo "Grafana: http://localhost:3000"
```

### 生产环境部署 (scripts/deploy-prod.sh)
```bash
#!/bin/bash

echo "🚀 部署生产环境..."

# 构建镜像
docker build -t eyehealth-frontend ./frontend
docker build -t eyehealth-backend ./backend
docker build -t eyehealth-ai ./ai-service

# 部署到Kubernetes
kubectl apply -f infrastructure/k8s/

# 等待部署完成
kubectl wait --for=condition=available --timeout=300s deployment/eyehealth-frontend
kubectl wait --for=condition=available --timeout=300s deployment/eyehealth-backend
kubectl wait --for=condition=available --timeout=300s deployment/eyehealth-ai

echo "✅ 生产环境部署完成！"
```

## 监控和日志

### Prometheus 配置
```yaml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'eyehealth-backend'
    static_configs:
      - targets: ['backend-service:3001']
  
  - job_name: 'eyehealth-ai'
    static_configs:
      - targets: ['ai-service:8000']
  
  - job_name: 'postgres'
    static_configs:
      - targets: ['postgres-exporter:9187']
```

### Grafana 仪表板
- 系统指标监控
- 应用性能监控
- 区块链网络监控
- AI模型性能监控

## 安全配置

### 网络安全
- 使用TLS/SSL加密
- 配置防火墙规则
- 实施网络隔离

### 数据安全
- 客户端AES加密
- 服务端数据脱敏
- 定期安全审计

### 访问控制
- RBAC权限管理
- API限流
- 审计日志

