# 后端无响应问题诊断与修复

## 🔍 问题症状

- **前端**: 网页操作无响应
- **后端**: 没有任何请求到达
- **影响**: 所有 API 调用失败

## ✅ 快速诊断步骤

### 步骤 1: 检查后端是否运行

```bash
# 检查后端进程
tasklist | findstr node

# 或者查看端口占用
netstat -ano | findstr :3001
```

**期望结果**: 
- 看到 `node.exe` 进程
- 端口 3001 被占用

### 步骤 2: 查看后端日志

打开运行后端的终端窗口，查看是否有错误信息：

**常见错误**:
1. 数据库连接失败
2. JWT 配置错误
3. 端口被占用
4. TypeORM 同步失败

### 步骤 3: 测试后端连接

```bash
# 测试健康检查端点
curl http://localhost:3001/api/v1/health

# 或者测试根路径
curl http://localhost:3001/

# 测试 API 文档
curl http://localhost:3001/api
```

### 步骤 4: 检查前端配置

查看 `frontend/src/lib/config.ts`:

```typescript
// 确保 API 地址正确
export const API_BASE_URL = 'http://localhost:3001/api/v1';
```

## 🐛 常见问题与解决方案

### 问题 1: 后端启动失败

**症状**: 后端立即退出

**可能原因**:
1. `.env` 文件缺失或配置错误
2. 数据库连接失败
3. JWT 配置错误

**解决方案**:
```bash
# 1. 检查 .env 文件
cd backend
copy env.example .env

# 2. 验证数据库连接
# 编辑 .env，确保数据库配置正确：
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=swj21bsss
DB_DATABASE=eyehealth

# 3. 重新启动
npm run start:dev
```

### 问题 2: CORS 错误

**症状**: 浏览器控制台显示 CORS 错误

**解决方案**:
```typescript
// backend/src/main.ts
// 确保 CORS 配置正确
app.enableCors({
  origin: 'http://localhost:3000',
  credentials: true,
});
```

### 问题 3: 端口被占用

**症状**: `EADDRINUSE: address already in use :::3001`

**解决方案**:
```bash
# 查找占用端口的进程
netstat -ano | findstr :3001

# 杀死进程 (替换 <PID> 为实际进程 ID)
taskkill /PID <PID> /F
```

### 问题 4: 数据库表不存在

**症状**: `relation "users" does not exist`

**解决方案**:
```bash
# 运行迁移或同步
cd backend
npm run migration:run

# 或者在 .env 中启用同步（仅开发环境）
# TypeORM 配置中: synchronize: true
```

### 问题 5: AuthService 未找到

**症状**: `Cannot find module './auth.service'`

**解决方案**:
```bash
# 我们已经修复了这个问题
# 如果仍然出现，重新安装依赖
cd backend
rm -rf node_modules
npm install
npm run start:dev
```

## 🔧 完整重启流程

### 1. 停止所有服务

```bash
# Windows (在新的 PowerShell 窗口)
# 杀死所有 node 进程
taskkill /F /IM node.exe

# 或者使用 Ctrl+C 逐个停止
```

### 2. 清理缓存

```bash
# 后端
cd backend
rm -rf dist
rm -rf node_modules/.cache

# 前端
cd ../frontend
rm -rf .next
rm -rf node_modules/.cache
```

### 3. 重新启动服务

**方式 A: 使用启动脚本**
```bash
# 在项目根目录
.\start-dev.bat
```

**方式 B: 手动启动**

```bash
# 终端 1: 后端
cd backend
npm run start:dev

# 终端 2: 前端
cd frontend
npm run dev
```

### 4. 验证服务运行

```bash
# 检查后端
curl http://localhost:3001/api

# 检查前端
curl http://localhost:3000

# 浏览器访问
# 前端: http://localhost:3000
# 后端 API 文档: http://localhost:3001/api
```

## 📊 诊断检查清单

### 后端检查
- [ ] 后端进程在运行
- [ ] 端口 3001 被占用
- [ ] 没有 TypeScript 编译错误
- [ ] 数据库连接成功
- [ ] `.env` 文件存在且配置正确
- [ ] MinIO 服务运行（如需要）

### 前端检查
- [ ] 前端进程在运行
- [ ] 端口 3000 被占用
- [ ] API 地址配置正确 (http://localhost:3001/api/v1)
- [ ] localStorage 中有有效的 access_token
- [ ] 浏览器控制台没有 CORS 错误

### 网络检查
- [ ] `localhost:3001` 可以访问
- [ ] `localhost:3000` 可以访问
- [ ] 防火墙没有拦截本地连接

## 🎯 快速测试

### 测试 1: 后端健康检查
```bash
curl http://localhost:3001/api/v1/health
```

**期望**: 返回 JSON 响应

### 测试 2: 用户登录
```bash
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"test@example.com\",\"password\":\"password123\"}"
```

**期望**: 返回 access_token

### 测试 3: 前端能否访问后端
在浏览器控制台运行:
```javascript
fetch('http://localhost:3001/api')
  .then(r => r.text())
  .then(console.log)
  .catch(console.error)
```

**期望**: 返回 API 文档 HTML

## 🔍 高级调试

### 启用详细日志

**后端** (`backend/src/main.ts`):
```typescript
const app = await NestFactory.create(AppModule, {
  logger: ['error', 'warn', 'log', 'debug', 'verbose'],
});
```

**查看所有日志**:
```bash
# 查看完整的启动日志
cd backend
npm run start:dev | tee backend.log
```

### 使用 Postman 或 Insomnia 测试 API

1. 导入 API 文档: http://localhost:3001/api-json
2. 测试各个端点
3. 检查响应状态码和错误信息

### 网络抓包分析

使用浏览器开发者工具:
1. 打开 Network 标签
2. 尝试登录或任何操作
3. 查看请求是否发送
4. 检查响应状态码和错误信息

## 📝 问题报告模板

如果问题仍然存在，请提供以下信息:

```
1. 操作系统: Windows/Linux/Mac
2. Node 版本: node -v
3. 后端日志: (完整的启动日志)
4. 前端错误: (浏览器控制台错误)
5. 网络请求: (开发者工具 Network 标签截图)
6. 数据库状态: (是否可以连接)
7. 操作步骤: (详细描述重现步骤)
```

## ✅ 成功标志

修复后应该看到:

1. **后端日志**:
   ```
   [Nest] Application is running on: http://localhost:3001
   ```

2. **前端日志**:
   ```
   ▲ Next.js 14.x.x
   - Local:        http://localhost:3000
   - Ready in 2.3s
   ```

3. **API 测试**:
   ```bash
   curl http://localhost:3001/api
   # 返回 Swagger 文档
   ```

4. **前端功能**:
   - 页面加载正常
   - 登录/注册可以发送请求
   - API 调用返回数据

