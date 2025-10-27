# MinIO对象存储服务集成文档

## 📋 概述

MinIO是一个高性能的对象存储服务，已成功集成到眼健康平台中，用于存储医疗报告、产品图片和其他文件。

## 🚀 快速启动

### 启动MinIO服务
```bash
# 使用一键启动脚本（推荐）
start-minio.bat

# 或使用Docker Compose
docker-compose -f docker-compose.minio.yml up -d
```

### 停止MinIO服务
```bash
# 使用停止脚本
stop-minio.bat

# 或使用Docker Compose
docker-compose -f docker-compose.minio.yml down
```

## 🌐 服务访问

- **MinIO控制台**: http://localhost:9001
- **MinIO API**: http://localhost:9000
- **默认用户名**: minioadmin
- **默认密码**: minioadmin123

## 📦 存储桶结构

系统自动创建以下存储桶：

1. **eyehealth-reports** - 医疗报告存储
   - 路径: `reports/{userId}/{timestamp}-{filename}`
   - 权限: 私有

2. **eyehealth-products** - 产品图片存储
   - 路径: `products/{category}/{filename}`
   - 权限: 公开

3. **eyehealth-uploads** - 通用文件上传
   - 路径: `uploads/{folder}/{filename}`
   - 权限: 公开

## 🔧 API接口

### 文件上传
```http
POST /api/v1/storage/upload
Content-Type: multipart/form-data
Authorization: Bearer {token}

FormData:
- file: 文件
- bucket: 存储桶名称（可选，默认eyehealth-uploads）
- folder: 文件夹名称（可选）
- filename: 自定义文件名（可选）
```

### 缓冲区上传
```http
POST /api/v1/storage/upload-buffer
Content-Type: application/json
Authorization: Bearer {token}

{
  "bucket": "eyehealth-uploads",
  "objectName": "test/file.txt",
  "data": "base64编码的数据",
  "contentType": "text/plain",
  "folder": "test"
}
```

### 文件列表
```http
GET /api/v1/storage/list?bucket=eyehealth-uploads&prefix=test/&limit=100
Authorization: Bearer {token}
```

### 获取文件URL
```http
GET /api/v1/storage/url/{bucket}/{objectName}
Authorization: Bearer {token}
```

### 下载文件
```http
GET /api/v1/storage/download/{bucket}/{objectName}
Authorization: Bearer {token}
```

### 文件信息
```http
GET /api/v1/storage/info/{bucket}/{objectName}
Authorization: Bearer {token}
```

### 删除文件
```http
DELETE /api/v1/storage/{bucket}/{objectName}
Authorization: Bearer {token}
```

### 存储桶列表
```http
GET /api/v1/storage/buckets
Authorization: Bearer {token}
```

### 健康检查
```http
GET /api/v1/storage/health
Authorization: Bearer {token}
```

## 🔄 集成功能

### 1. 报告上传集成
- 报告上传时自动存储到MinIO
- 生成预签名URL用于文件访问
- 支持文件哈希验证
- 自动清理临时文件

### 2. 产品图片存储
- 产品图片自动上传到MinIO
- 支持公开访问
- 自动生成缩略图URL

### 3. 通用文件存储
- 支持多种文件类型
- 自动文件类型检测
- 文件大小限制（50MB）

## 🛠️ 配置

### 环境变量
```env
# MinIO配置
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_USE_SSL=false
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin123
```

### 文件上传限制
- 最大文件大小: 50MB
- 支持的文件类型:
  - 图片: JPEG, PNG, GIF, WebP
  - 文档: PDF, DOC, DOCX
  - 文本: TXT

## 🧪 测试

### 运行集成测试
```bash
node test-minio-integration.js
```

### 测试内容
1. MinIO健康检查
2. 存储桶列表获取
3. 文件上传测试
4. 文件列表获取
5. 文件信息获取

## 📊 监控

### 健康检查
系统提供MinIO健康检查接口，用于监控服务状态：

```javascript
// 检查MinIO服务状态
const healthCheck = await axios.get('/api/v1/storage/health');
console.log('MinIO健康状态:', healthCheck.data.data.healthy);
```

### 日志记录
- 文件上传成功/失败日志
- 存储桶操作日志
- 错误处理和异常日志

## 🔒 安全特性

1. **访问控制**: 基于JWT token的API访问控制
2. **文件验证**: 文件类型和大小验证
3. **预签名URL**: 安全的文件访问URL生成
4. **数据完整性**: 文件哈希验证

## 🚨 故障排除

### 常见问题

1. **MinIO服务无法启动**
   - 检查Docker是否运行
   - 检查端口9000和9001是否被占用
   - 查看Docker日志: `docker logs eyehealth-minio`

2. **文件上传失败**
   - 检查MinIO服务状态
   - 验证文件大小和类型
   - 检查网络连接

3. **文件访问失败**
   - 检查预签名URL是否过期
   - 验证文件是否存在
   - 检查存储桶权限

### 调试命令
```bash
# 查看MinIO容器状态
docker ps | grep minio

# 查看MinIO日志
docker logs eyehealth-minio

# 进入MinIO容器
docker exec -it eyehealth-minio sh

# 检查存储桶
docker run --rm --link eyehealth-minio:minio minio/mc:latest ls myminio
```

## 📈 性能优化

1. **连接池**: MinIO客户端使用连接池
2. **并发上传**: 支持多文件并发上传
3. **缓存策略**: 预签名URL缓存
4. **压缩**: 支持文件压缩存储

## 🔮 未来扩展

1. **CDN集成**: 与CDN服务集成
2. **备份策略**: 自动备份到其他存储
3. **版本控制**: 文件版本管理
4. **元数据搜索**: 基于元数据的文件搜索

---

## 📞 支持

如有问题，请查看：
- MinIO官方文档: https://docs.min.io/
- 项目README: README.md
- 测试脚本: test-minio-integration.js






