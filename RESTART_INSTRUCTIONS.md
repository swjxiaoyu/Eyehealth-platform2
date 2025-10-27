# 🔄 重启服务 - 应用修复

## 📍 当前状态

所有代码修复已完成并提交，但需要重启服务才能生效。

## ✅ 修复内容

1. ✅ API 路径已修复（`/auth/login` 而不是 `/api/v1/auth/login`）
2. ✅ JWT 配置已完善
3. ✅ AuthService 已恢复
4. ✅ 编码问题已解决

## 🚀 应用修复步骤

### 步骤 1: 停止所有服务

```bash
# 在运行后端的终端按 Ctrl+C
# 在运行前端的终端按 Ctrl+C
```

### 步骤 2: 清理缓存

```bash
# 清理前端缓存
cd frontend
rm -r .next

# Windows PowerShell
Remove-Item -Recurse -Force .next
```

### 步骤 3: 重启服务

**方式 A: 使用脚本**
```bash
cd ..
.\start-dev.bat
```

**方式 B: 手动启动**

```bash
# 终端 1: 后端
cd backend
npm run start:dev

# 终端 2: 前端（等待 3 秒后）
cd frontend
npm run dev
```

### 步骤 4: 验证修复

1. 访问 http://localhost:3000
2. 尝试登录
3. 查看浏览器控制台是否还有 404 错误

## 🔍 如果问题仍然存在

### 检查 1: 确认文件已更新

```bash
# 检查 API 路径
cat frontend/src/lib/api.ts | grep -A 3 "login:"
# 应该看到 '/auth/login' 而不是 '/api/v1/auth/login'
```

### 检查 2: 确认 backend 配置

```bash
# 检查 .env 文件
cd backend
cat .env | grep JWT
# 应该看到 JWT_SECRET, JWT_REFRESH_SECRET 等配置
```

### 检查 3: 测试后端 API

```bash
# 测试健康检查
curl http://localhost:3001/api/v1/health

# 测试登录端点
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

## ⚠️ 常见问题

### 问题 1: 前端没有更新
**原因**: `.next` 缓存未清理
**解决**: 删除 `.next` 目录并重启

### 问题 2: 后端报错
**检查**: 查看后端终端日志
**常见错误**:
- 数据库连接失败 → 检查 .env 配置
- JWT 配置错误 → 已修复，但需要重启
- AuthService 未找到 → 已修复

### 问题 3: API 仍然 404
**检查**: 
1. 后端是否运行在 3001 端口
2. 前端是否发送到正确的 URL
3. 浏览器控制台的 Network 标签

## 📝 测试清单

在重启后验证：

- [ ] 后端启动无错误
- [ ] 前端启动无错误
- [ ] 可以访问登录页面
- [ ] 登录请求发送到 `http://localhost:3001/api/v1/auth/login`
- [ ] 浏览器控制台没有 404 错误
- [ ] 可以成功获取 JWT token
- [ ] 跳转到 dashboard 成功

## 🎯 目标

新文件夹拉取代码后能够：
1. ✅ 无需手动配置即可运行
2. ✅ 登录功能正常工作
3. ✅ 所有 API 调用成功
4. ✅ 无 JWT 配置错误

