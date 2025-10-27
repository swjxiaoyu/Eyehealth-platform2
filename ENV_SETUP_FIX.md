# JWT 配置错误修复指南

## 🔍 问题分析

**错误信息**:
```
Error: "expiresIn" should be a number of seconds or string representing a timespan
```

**原因**: 在新环境（另一个文件夹）运行时，`.env` 文件中 JWT 相关配置缺失或格式错误。

## ✅ 解决方案

### 方案 1：在新环境创建 `.env` 文件（推荐）

在新项目的 `backend` 目录下创建 `.env` 文件：

```bash
# 复制环境变量模板
cd D:\pj\eyehealth-platform\backend
copy env.example .env
```

然后编辑 `.env` 文件，确保包含以下 JWT 配置：

```env
# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your-super-secret-refresh-key
JWT_REFRESH_EXPIRES_IN=30d
```

**重要**: `JWT_EXPIRES_IN` 和 `JWT_REFRESH_EXPIRES_IN` 必须是：
- 数字（表示秒数），如 `3600` 表示 1 小时
- 字符串时间格式，如 `7d` (7天)、`24h` (24小时)、`60m` (60分钟)

### 方案 2：使用原环境的配置

将原环境的 `.env` 文件复制到新环境：

```bash
# 从原项目复制 .env 文件
copy D:\project\eyehealth-platform\backend\.env D:\pj\eyehealth-platform\backend\.env
```

### 方案 3：修改代码添加默认值（如果无法创建 .env）

修改 `backend/src/config/jwt.config.ts`，添加更安全的默认值和验证：

```typescript
export const getJwtConfig = (configService: ConfigService): JwtModuleOptions => {
  const expiresIn = configService.get('JWT_EXPIRES_IN', '7d');
  
  // 验证格式
  if (!expiresIn || (isNaN(Number(expiresIn)) && !expiresIn.match(/^\d+[smhd]$/i))) {
    throw new Error('JWT_EXPIRES_IN must be a number or string like "7d", "24h", etc.');
  }
  
  return {
    secret: configService.get('JWT_SECRET', 'your-super-secret-jwt-key'),
    signOptions: {
      expiresIn: expiresIn,
    },
  };
};
```

## 🎯 推荐步骤

1. **在新环境创建 `.env` 文件**
   ```bash
   cd D:\pj\eyehealth-platform\backend
   copy env.example .env
   ```

2. **验证 `.env` 文件内容**
   确保包含所有必需的配置项

3. **重启后端服务**
   ```bash
   npm run start:dev
   ```

## 📋 环境变量检查清单

确保 `.env` 文件包含以下内容：

```env
# ✅ Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=swj21bsss
DB_DATABASE=eyehealth

# ✅ JWT (必需！)
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your-super-secret-refresh-key
JWT_REFRESH_EXPIRES_IN=30d

# ✅ Server
PORT=3001
NODE_ENV=development

# ✅ CORS
CORS_ORIGIN=http://localhost:3000

# ✅ MinIO
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_USE_SSL=false
MINIO_ACCESS_KEY=admin
MINIO_SECRET_KEY=password123
```

## ⚠️ 注意事项

1. **不要修改原项目**：原项目（`D:\project\eyehealth-platform`）运行正常，不需要任何修改
2. **只修复新环境**：只需要在新环境（`D:\pj\eyehealth-platform`）添加 `.env` 文件
3. **检查路径**：确认新环境的路径是否正确

## 🔧 验证修复

修复后，重新启动后端，不应该再出现 JWT 错误。

