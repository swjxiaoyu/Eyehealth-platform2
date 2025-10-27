# 快速修复指南

## 🚀 新环境快速启动

### 步骤 1: 克隆项目后立即设置环境变量

```bash
# 1. 进入后端目录
cd backend

# 2. 复制环境变量模板（Windows）
copy env.example .env

# Linux/Mac
# cp env.example .env
```

### 步骤 2: 验证 .env 文件

确保 `.env` 文件包含以下配置：

```env
# JWT Configuration (必需)
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your-super-secret-refresh-key-here
JWT_REFRESH_EXPIRES_IN=30d
```

### 步骤 3: 启动项目

```bash
# 方式一：使用一键启动脚本
cd ..
.\start-dev.bat

# 方式二：手动启动
cd backend
npm run start:dev
```

## ⚠️ 常见错误修复

### 错误 1: JWT expiresIn 错误

**错误信息**:
```
Error: "expiresIn" should be a number of seconds or string representing a timespan
```

**解决方案**: 确保 `.env` 文件中 `JWT_EXPIRES_IN` 和 `JWT_REFRESH_EXPIRES_IN` 的值是正确的格式：
- ✅ `7d` (7天)
- ✅ `24h` (24小时)
- ✅ `3600` (3600秒)
- ❌ 不要留空
- ❌ 不要使用无效格式

### 错误 2: 区块链服务未初始化

**警告信息**:
```
[Nest] WARN [BlockchainService] Admin user not found in wallet.
```

**解决方案**: 这是正常的！系统会自动使用 Mock（模拟）区块链模式，不影响功能。

## 📋 环境变量检查清单

运行项目前，确保 `.env` 文件包含：

```env
# ✅ 数据库配置
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=swj21bsss
DB_DATABASE=eyehealth

# ✅ JWT 配置（必需）
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your-super-secret-refresh-key-here
JWT_REFRESH_EXPIRES_IN=30d

# ✅ 服务器配置
PORT=3001
NODE_ENV=development

# ✅ CORS 配置
CORS_ORIGIN=http://localhost:3000

# ✅ MinIO 配置
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_USE_SSL=false
MINIO_ACCESS_KEY=admin
MINIO_SECRET_KEY=password123
```

## 🎯 一键修复命令

如果遇到 JWT 错误，运行以下命令：

**Windows**:
```bash
cd backend
copy env.example .env
```

**Linux/Mac**:
```bash
cd backend
cp env.example .env
```

然后重新启动后端服务。

## ✅ 验证修复

修复后，重新启动后端：

```bash
cd backend
npm run start:dev
```

应该看到：
```
[Nest] Application is running on: http://localhost:3001
```

如果看到这个，说明修复成功！🎉

