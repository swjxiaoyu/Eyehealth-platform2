@echo off
chcp 65001 > nul
echo ========================================
echo   Hyperledger Fabric 网络离线部署
echo   EyeHealth Platform Blockchain Network
echo ========================================
echo.

REM 检查Docker是否运行
echo [INFO] 检查Docker状态...
docker info > nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Docker未运行，请先启动Docker
    pause
    exit /b 1
)
echo [SUCCESS] Docker正在运行
echo.

REM 进入blockchain目录
cd blockchain

REM 检查是否已有镜像
echo [INFO] 检查Fabric镜像...
docker images | findstr "hyperledger/fabric" > nul
if %errorlevel% neq 0 (
    echo [WARNING] 未找到Fabric镜像，尝试下载...
    echo [INFO] 如果网络连接有问题，请手动下载镜像或使用离线镜像包
    echo.
    echo 请运行以下命令下载必要的镜像：
    echo docker pull hyperledger/fabric-tools:2.4
    echo docker pull hyperledger/fabric-peer:2.4
    echo docker pull hyperledger/fabric-orderer:2.4
    echo docker pull couchdb:3.1.1
    echo.
    pause
    exit /b 1
)

REM 清理之前的网络
echo [INFO] 清理之前的网络...
docker-compose -f network/docker-compose.yaml down --volumes --remove-orphans > nul 2>&1
docker rm -f $(docker ps -aq --filter name=dev-peer) > nul 2>&1
docker network prune -f > nul 2>&1
echo [SUCCESS] 清理完成
echo.

REM 检查加密材料
echo [INFO] 检查加密材料...
if not exist "crypto-config" (
    echo [ERROR] 加密材料不存在，请先运行 generate-crypto.bat
    pause
    exit /b 1
)
echo [SUCCESS] 加密材料已存在
echo.

REM 检查通道配置
echo [INFO] 检查通道配置...
if not exist "channel-artifacts" mkdir channel-artifacts

if not exist "channel-artifacts\genesis.block" (
    echo [INFO] 生成创世区块...
    docker run --rm -v %cd%:/workspace -e FABRIC_CFG_PATH=/workspace/config hyperledger/fabric-tools:latest configtxgen -profile TwoOrgsOrdererGenesis -channelID system-channel -outputBlock /workspace/channel-artifacts/genesis.block
    if %errorlevel% neq 0 (
        echo [ERROR] 创世区块生成失败
        pause
        exit /b 1
    )
)

if not exist "channel-artifacts\eyehealth-channel.tx" (
    echo [INFO] 生成通道配置...
    docker run --rm -v %cd%:/workspace -e FABRIC_CFG_PATH=/workspace/config hyperledger/fabric-tools:latest configtxgen -profile TwoOrgsChannel -channelID eyehealth-channel -outputCreateChannelTx /workspace/channel-artifacts/eyehealth-channel.tx
    if %errorlevel% neq 0 (
        echo [ERROR] 通道配置生成失败
        pause
        exit /b 1
    )
)
echo [SUCCESS] 通道配置已存在
echo.

REM 启动网络
echo [INFO] 启动Hyperledger Fabric网络...
docker-compose -f network/docker-compose.yaml up -d
if %errorlevel% neq 0 (
    echo [ERROR] 网络启动失败
    pause
    exit /b 1
)

echo [INFO] 等待服务启动...
timeout /t 15 /nobreak > nul

REM 检查服务状态
echo [INFO] 检查服务状态...
set services=orderer.example.com peer0.org1.example.com peer1.org1.example.com couchdb0 couchdb1 cli
for %%s in (%services%) do (
    docker ps --format "table {{.Names}}" | findstr "%%s" > nul
    if %errorlevel% equ 0 (
        echo [SUCCESS] %%s 正在运行
    ) else (
        echo [ERROR] %%s 未运行
    )
)
echo.

REM 等待CLI容器完全启动
echo [INFO] 等待CLI容器完全启动...
timeout /t 10 /nobreak > nul

REM 创建通道
echo [INFO] 创建通道...
docker exec cli peer channel create -o orderer.example.com:7050 -c eyehealth-channel -f /opt/gopath/src/github.com/hyperledger/fabric/peer/channel-artifacts/eyehealth-channel.tx
if %errorlevel% neq 0 (
    echo [ERROR] 通道创建失败
    pause
    exit /b 1
)
echo [SUCCESS] 通道创建完成
echo.

REM 加入通道
echo [INFO] 加入对等节点到通道...
docker exec cli peer channel join -b eyehealth-channel.block
if %errorlevel% neq 0 (
    echo [ERROR] Peer0加入通道失败
    pause
    exit /b 1
)

docker exec -e CORE_PEER_ADDRESS=peer1.org1.example.com:8051 cli peer channel join -b eyehealth-channel.block
if %errorlevel% neq 0 (
    echo [ERROR] Peer1加入通道失败
    pause
    exit /b 1
)
echo [SUCCESS] 对等节点已加入通道
echo.

REM 安装链码
echo [INFO] 安装链码...
docker exec cli peer lifecycle chaincode package producttrace.tar.gz --path /opt/gopath/src/github.com/hyperledger/fabric/peer/chaincode --lang golang --label producttrace_1.0
if %errorlevel% neq 0 (
    echo [ERROR] 链码打包失败
    pause
    exit /b 1
)

docker exec cli peer lifecycle chaincode install producttrace.tar.gz
if %errorlevel% neq 0 (
    echo [ERROR] Peer0链码安装失败
    pause
    exit /b 1
)

docker exec -e CORE_PEER_ADDRESS=peer1.org1.example.com:8051 cli peer lifecycle chaincode install producttrace.tar.gz
if %errorlevel% neq 0 (
    echo [ERROR] Peer1链码安装失败
    pause
    exit /b 1
)
echo [SUCCESS] 链码安装完成
echo.

REM 批准链码
echo [INFO] 批准链码...
for /f "tokens=3" %%i in ('docker exec cli peer lifecycle chaincode queryinstalled ^| findstr "Package ID"') do set PACKAGE_ID=%%i
if "%PACKAGE_ID%"=="" (
    echo [ERROR] 无法获取包ID
    pause
    exit /b 1
)

docker exec cli peer lifecycle chaincode approveformyorg -o orderer.example.com:7050 --channelID eyehealth-channel --name producttrace --version 1.0 --package-id %PACKAGE_ID% --sequence 1
if %errorlevel% neq 0 (
    echo [ERROR] 链码批准失败
    pause
    exit /b 1
)
echo [SUCCESS] 链码批准完成
echo.

REM 提交链码
echo [INFO] 提交链码...
docker exec cli peer lifecycle chaincode commit -o orderer.example.com:7050 --channelID eyehealth-channel --name producttrace --version 1.0 --sequence 1
if %errorlevel% neq 0 (
    echo [ERROR] 链码提交失败
    pause
    exit /b 1
)
echo [SUCCESS] 链码提交完成
echo.

REM 测试链码
echo [INFO] 测试链码...
docker exec cli peer chaincode invoke -o orderer.example.com:7050 -C eyehealth-channel -n producttrace -c "{\"function\":\"CreateProduct\",\"Args\":[\"{\\\"sku\\\":\\\"TEST001\\\",\\\"name\\\":\\\"Test Product\\\",\\\"manufacturerId\\\":\\\"MAN001\\\",\\\"manufacturerName\\\":\\\"Test Manufacturer\\\"}\"]}"
if %errorlevel% neq 0 (
    echo [WARNING] 链码测试失败，但网络可能仍然可用
) else (
    echo [SUCCESS] 链码测试完成
)
echo.

REM 显示网络信息
echo [INFO] 网络信息:
echo Orderer: orderer.example.com:7050
echo Peer0: peer0.org1.example.com:7051
echo Peer1: peer1.org1.example.com:8051
echo CouchDB0: localhost:5984
echo CouchDB1: localhost:6984
echo Channel: eyehealth-channel
echo Chaincode: producttrace
echo.

echo [SUCCESS] Hyperledger Fabric网络部署完成！
echo [INFO] 您现在可以在应用程序中使用区块链服务。
echo [INFO] 请运行 enroll-admin.js 来注册管理员用户。
echo.
pause
