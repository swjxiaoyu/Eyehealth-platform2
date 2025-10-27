@echo off
chcp 65001 > nul
echo ========================================
echo   生成加密材料和配置
echo   Generate Crypto Materials and Config
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

REM 检查fabric-tools镜像
echo [INFO] 检查fabric-tools镜像...
docker images | findstr "hyperledger/fabric-tools" > nul
if %errorlevel% neq 0 (
    echo [ERROR] 未找到fabric-tools镜像，请先运行 download-images.bat
    pause
    exit /b 1
)
echo [SUCCESS] fabric-tools镜像已存在
echo.

REM 生成加密材料
echo [INFO] 生成加密材料...
if exist "crypto-config" (
    echo [INFO] 加密材料已存在，跳过生成
) else (
    echo [INFO] 使用Docker生成加密材料...
    docker run --rm -v %cd%:/workspace hyperledger/fabric-tools:latest cryptogen generate --config=/workspace/crypto-config.yaml --output=/workspace/crypto-config
    if %errorlevel% neq 0 (
        echo [ERROR] 加密材料生成失败
        pause
        exit /b 1
    )
    echo [SUCCESS] 加密材料生成完成
)
echo.

REM 生成创世区块和通道配置
echo [INFO] 生成创世区块和通道配置...
if not exist "channel-artifacts" mkdir channel-artifacts

if exist "channel-artifacts\genesis.block" (
    echo [INFO] 创世区块已存在，跳过生成
) else (
    echo [INFO] 生成创世区块...
    docker run --rm -v %cd%:/workspace -e FABRIC_CFG_PATH=/workspace/config hyperledger/fabric-tools:latest configtxgen -profile TwoOrgsOrdererGenesis -channelID system-channel -outputBlock /workspace/channel-artifacts/genesis.block
    if %errorlevel% neq 0 (
        echo [ERROR] 创世区块生成失败
        pause
        exit /b 1
    )
    echo [SUCCESS] 创世区块生成完成
)

if exist "channel-artifacts\eyehealth-channel.tx" (
    echo [INFO] 通道配置已存在，跳过生成
) else (
    echo [INFO] 生成通道配置...
    docker run --rm -v %cd%:/workspace -e FABRIC_CFG_PATH=/workspace/config hyperledger/fabric-tools:latest configtxgen -profile TwoOrgsChannel -channelID eyehealth-channel -outputCreateChannelTx /workspace/channel-artifacts/eyehealth-channel.tx
    if %errorlevel% neq 0 (
        echo [ERROR] 通道配置生成失败
        pause
        exit /b 1
    )
    echo [SUCCESS] 通道配置生成完成
)
echo.

echo [SUCCESS] 加密材料和配置生成完成！
echo.
echo [INFO] 生成的文件:
echo - crypto-config/ (加密材料目录)
echo - channel-artifacts/genesis.block (创世区块)
echo - channel-artifacts/eyehealth-channel.tx (通道配置)
echo.
echo [INFO] 现在可以运行 start-network-offline.bat 来启动网络
echo.
pause
