# Hyperledger Fabric 网络部署指南

## 问题解决

您遇到的错误是因为Docker无法连接到Docker Hub下载镜像。这通常是由于网络连接问题或防火墙限制导致的。

## 解决方案

### 方案1：分步部署（推荐）

1. **下载镜像**
   ```bash
   # 运行镜像下载脚本
   blockchain/download-images.bat
   ```

2. **生成加密材料**
   ```bash
   # 运行加密材料生成脚本
   blockchain/generate-crypto.bat
   ```

3. **启动网络**
   ```bash
   # 运行离线网络启动脚本
   blockchain/start-network-offline.bat
   ```

### 方案2：手动下载镜像

如果脚本仍然失败，请手动运行以下命令：

```bash
# 下载必要的镜像
docker pull hyperledger/fabric-tools:2.4
docker pull hyperledger/fabric-peer:2.4
docker pull hyperledger/fabric-orderer:2.4
docker pull couchdb:3.1.1

# 创建latest标签
docker tag hyperledger/fabric-tools:2.4 hyperledger/fabric-tools:latest
docker tag hyperledger/fabric-peer:2.4 hyperledger/fabric-peer:latest
docker tag hyperledger/fabric-orderer:2.4 hyperledger/fabric-orderer:latest
```

### 方案3：使用代理

如果您在公司网络环境中，可能需要配置Docker代理：

1. 创建或编辑 `~/.docker/config.json`：
   ```json
   {
     "proxies": {
       "default": {
         "httpProxy": "http://proxy.company.com:8080",
         "httpsProxy": "http://proxy.company.com:8080"
       }
     }
   }
   ```

2. 重启Docker服务

### 方案4：离线部署

如果您有离线镜像包，可以：

1. 加载镜像：
   ```bash
   docker load -i fabric-images.tar
   ```

2. 然后运行部署脚本

## 验证部署

部署完成后，您可以通过以下方式验证：

1. **检查容器状态**：
   ```bash
   docker ps
   ```

2. **检查网络信息**：
   ```bash
   docker exec cli peer channel list
   ```

3. **测试链码**：
   ```bash
   docker exec cli peer chaincode query -C eyehealth-channel -n producttrace -c '{"function":"GetProductBySKU","Args":["TEST001"]}'
   ```

## 网络信息

- **Orderer**: orderer.example.com:7050
- **Peer0**: peer0.org1.example.com:7051
- **Peer1**: peer1.org1.example.com:8051
- **CouchDB0**: localhost:5984
- **CouchDB1**: localhost:6984
- **Channel**: eyehealth-channel
- **Chaincode**: producttrace

## 下一步

1. 运行 `backend/enroll-admin.js` 注册管理员用户
2. 启动后端服务：`cd backend && npm run start:dev`
3. 访问前端区块链管理页面：`http://localhost:3000/blockchain`

## 故障排除

如果仍然遇到问题：

1. **检查Docker版本**：确保Docker版本 >= 20.10
2. **检查磁盘空间**：确保有足够的磁盘空间
3. **检查端口占用**：确保7050、7051、8051、5984、6984端口未被占用
4. **查看日志**：`docker logs <container_name>` 查看具体错误

## 联系支持

如果问题仍然存在，请提供：
- Docker版本信息
- 操作系统版本
- 网络环境描述
- 错误日志详情




