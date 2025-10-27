# 报告功能问题诊断与修复

## 🔍 问题分析

### 问题 1: 新环境获取不到报告
- 原因：新环境可能没有 `.env` 文件或配置不完整
- 影响：无法连接到数据库和 MinIO

### 问题 2: 前端 HMR 模块错误
```
Module factory is not available. It might have been deleted in an HMR update.
```
- 原因：Next.js 热更新过程中模块被删除或更改
- 影响：前端无法正常编译和运行

## ✅ 解决方案

### 步骤 1: 在新环境创建 `.env` 文件

```bash
cd backend
copy env.example .env
```

**确保 `.env` 包含：**
```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=swj21bsss
DB_DATABASE=eyehealth

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your-super-secret-refresh-key-here
JWT_REFRESH_EXPIRES_IN=30d

# MinIO Configuration
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_USE_SSL=false
MINIO_ACCESS_KEY=admin
MINIO_SECRET_KEY=password123
```

### 步骤 2: 启动 MinIO 服务

```bash
# Windows
docker start eyehealth-minio

# 如果容器不存在，创建它
docker run -d --name eyehealth-minio -p 9000:9000 -p 9001:9001 ^
  -e MINIO_ROOT_USER=admin -e MINIO_ROOT_PASSWORD=password123 ^
  minio/minio server /data --console-address ":9001"
```

### 步骤 3: 检查数据库连接

```bash
cd backend
npm run start:dev
```

查看是否有数据库连接错误。

### 步骤 4: 修复前端 HMR 错误

**如果遇到 HMR 错误：**

```bash
cd frontend

# 清理缓存
rm -r .next
rm -r node_modules/.cache

# 重新安装依赖（如果需要）
npm install

# 重启开发服务器
npm run dev
```

## 📋 后端报告功能检查清单

### API 端点验证

1. **获取报告列表**
   ```bash
   curl -X GET http://localhost:3001/api/v1/reports \
     -H "Authorization: Bearer YOUR_TOKEN"
   ```

2. **上传报告**
   ```bash
   curl -X POST http://localhost:3001/api/v1/reports/upload \
     -F "file=@test.pdf" \
     -F "type=examination" \
     -H "Authorization: Bearer YOUR_TOKEN"
   ```

### 数据库验证

确保 `reports` 表存在：

```sql
SELECT * FROM reports LIMIT 10;
```

### MinIO 验证

访问 http://localhost:9001 检查 `eyehealth-reports` bucket 是否存在

## 🐛 常见错误

### 错误 1: "MinIO connection refused"
**解决方案**: 启动 MinIO 容器
```bash
docker start eyehealth-minio
```

### 错误 2: "Database connection failed"
**解决方案**: 
- 检查 PostgreSQL 是否运行
- 验证 `.env` 中的数据库配置
- 运行数据库迁移

### 错误 3: "无法获取报告"
**可能原因**:
- JWT token 过期或无效
- 用户未登录
- 数据库中没有报告记录

**解决方案**:
1. 重新登录获取新 token
2. 检查 localStorage 中的 `access_token`
3. 上传一个测试报告

## 📝 测试流程

1. 启动所有服务
   ```bash
   # 终端 1: MinIO
   docker start eyehealth-minio
   
   # 终端 2: 后端
   cd backend
   npm run start:dev
   
   # 终端 3: 前端
   cd frontend
   npm run dev
   ```

2. 访问前端
   ```
   http://localhost:3000
   ```

3. 登录账号
   ```
   访问 http://localhost:3000/auth/login
   使用您的账号登录
   ```

4. 上传测试报告
   ```
   访问 http://localhost:3000/reports/upload
   选择一个 PDF 文件上传
   ```

5. 查看报告列表
   ```
   访问 http://localhost:3000/reports
   应该能看到刚才上传的报告
   ```

## ✅ 验证成功标志

- [x] 后端启动无错误
- [x] 前端启动无 HMR 错误  
- [x] 可以访问报告上传页面
- [x] 可以成功上传文件
- [x] 报告列表显示上传的文件
- [x] 可以下载/查看报告

## 🔧 如果问题仍然存在

1. **检查后端日志**
   ```bash
   # 查看是否有错误信息
   cd backend
   npm run start:dev
   ```

2. **检查前端控制台**
   ```bash
   # 打开浏览器开发者工具
   # 查看 Console 和 Network 标签
   ```

3. **检查 MinIO 状态**
   ```bash
   docker ps | grep minio
   ```

4. **重新初始化 MinIO bucket**
   ```bash
   docker exec -it eyehealth-minio mc mb eyehealth-reports --ignore-existing
   ```

