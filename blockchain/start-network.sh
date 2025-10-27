#!/bin/bash

# Hyperledger Fabric网络启动脚本
# EyeHealth Platform Blockchain Network

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查Docker是否运行
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        log_error "Docker is not running. Please start Docker first."
        exit 1
    fi
    log_success "Docker is running"
}

# 检查必要的工具
check_tools() {
    local tools=("docker" "docker-compose" "curl")
    for tool in "${tools[@]}"; do
        if ! command -v $tool &> /dev/null; then
            log_error "$tool is not installed"
            exit 1
        fi
    done
    log_success "All required tools are available"
}

# 清理之前的网络
cleanup() {
    log_info "Cleaning up previous network..."
    
    # 停止并删除容器
    docker-compose -f network/docker-compose.yaml down --volumes --remove-orphans
    
    # 删除链码容器
    docker rm -f $(docker ps -aq --filter name=dev-peer) 2>/dev/null || true
    
    # 清理网络
    docker network prune -f
    
    log_success "Cleanup completed"
}

# 生成加密材料
generate_crypto() {
    log_info "Generating cryptographic materials..."
    
    if [ ! -d "crypto-config" ]; then
        # 这里需要cryptogen工具，如果没有则使用Docker
        if command -v cryptogen &> /dev/null; then
            cryptogen generate --config=crypto-config.yaml
        else
            log_warning "cryptogen not found, using Docker to generate crypto materials"
            docker run --rm -v $(pwd):/workspace hyperledger/fabric-tools:latest \
                cryptogen generate --config=/workspace/crypto-config.yaml --output=/workspace/crypto-config
        fi
        log_success "Cryptographic materials generated"
    else
        log_info "Cryptographic materials already exist"
    fi
}

# 生成创世区块和通道配置
generate_artifacts() {
    log_info "Generating genesis block and channel artifacts..."
    
    if [ ! -d "channel-artifacts" ]; then
        mkdir -p channel-artifacts
    fi
    
    # 生成创世区块
    if [ ! -f "channel-artifacts/genesis.block" ]; then
        if command -v configtxgen &> /dev/null; then
            configtxgen -profile TwoOrgsOrdererGenesis -channelID system-channel -outputBlock channel-artifacts/genesis.block
        else
            log_warning "configtxgen not found, using Docker"
            docker run --rm -v $(pwd):/workspace hyperledger/fabric-tools:latest \
                configtxgen -profile TwoOrgsOrdererGenesis -channelID system-channel -outputBlock /workspace/channel-artifacts/genesis.block
        fi
        log_success "Genesis block generated"
    fi
    
    # 生成通道配置
    if [ ! -f "channel-artifacts/eyehealth-channel.tx" ]; then
        if command -v configtxgen &> /dev/null; then
            configtxgen -profile TwoOrgsChannel -channelID eyehealth-channel -outputCreateChannelTx channel-artifacts/eyehealth-channel.tx
        else
            docker run --rm -v $(pwd):/workspace hyperledger/fabric-tools:latest \
                configtxgen -profile TwoOrgsChannel -channelID eyehealth-channel -outputCreateChannelTx /workspace/channel-artifacts/eyehealth-channel.tx
        fi
        log_success "Channel configuration generated"
    fi
}

# 启动网络
start_network() {
    log_info "Starting Hyperledger Fabric network..."
    
    # 启动基础网络
    docker-compose -f network/docker-compose.yaml up -d
    
    # 等待服务启动
    log_info "Waiting for services to start..."
    sleep 10
    
    # 检查服务状态
    check_services
}

# 检查服务状态
check_services() {
    log_info "Checking service status..."
    
    local services=("orderer.example.com" "peer0.org1.example.com" "peer1.org1.example.com" "couchdb0" "couchdb1")
    
    for service in "${services[@]}"; do
        if docker ps --format "table {{.Names}}" | grep -q "$service"; then
            log_success "$service is running"
        else
            log_error "$service is not running"
        fi
    done
}

# 创建通道
create_channel() {
    log_info "Creating channel..."
    
    # 等待orderer启动
    sleep 5
    
    # 创建通道
    docker exec cli peer channel create -o orderer.example.com:7050 -c eyehealth-channel -f /opt/gopath/src/github.com/hyperledger/fabric/peer/channel-artifacts/eyehealth-channel.tx
    
    log_success "Channel created"
}

# 加入通道
join_channel() {
    log_info "Joining peers to channel..."
    
    # Peer0加入通道
    docker exec cli peer channel join -b eyehealth-channel.block
    
    # Peer1加入通道
    docker exec -e CORE_PEER_ADDRESS=peer1.org1.example.com:8051 cli peer channel join -b eyehealth-channel.block
    
    log_success "Peers joined channel"
}

# 安装链码
install_chaincode() {
    log_info "Installing chaincode..."
    
    # 打包链码
    docker exec cli peer lifecycle chaincode package producttrace.tar.gz --path /opt/gopath/src/github.com/hyperledger/fabric/peer/chaincode --lang golang --label producttrace_1.0
    
    # 安装到Peer0
    docker exec cli peer lifecycle chaincode install producttrace.tar.gz
    
    # 安装到Peer1
    docker exec -e CORE_PEER_ADDRESS=peer1.org1.example.com:8051 cli peer lifecycle chaincode install producttrace.tar.gz
    
    log_success "Chaincode installed"
}

# 批准链码
approve_chaincode() {
    log_info "Approving chaincode..."
    
    # 获取包ID
    PACKAGE_ID=$(docker exec cli peer lifecycle chaincode queryinstalled | grep -o "Package ID: [^,]*" | cut -d' ' -f3)
    
    # 批准链码定义
    docker exec cli peer lifecycle chaincode approveformyorg -o orderer.example.com:7050 --channelID eyehealth-channel --name producttrace --version 1.0 --package-id $PACKAGE_ID --sequence 1
    
    log_success "Chaincode approved"
}

# 提交链码
commit_chaincode() {
    log_info "Committing chaincode..."
    
    docker exec cli peer lifecycle chaincode commit -o orderer.example.com:7050 --channelID eyehealth-channel --name producttrace --version 1.0 --sequence 1
    
    log_success "Chaincode committed"
}

# 测试链码
test_chaincode() {
    log_info "Testing chaincode..."
    
    # 创建测试产品
    docker exec cli peer chaincode invoke -o orderer.example.com:7050 -C eyehealth-channel -n producttrace -c '{"function":"CreateProduct","Args":["{\"sku\":\"TEST001\",\"name\":\"Test Product\",\"manufacturerId\":\"MAN001\",\"manufacturerName\":\"Test Manufacturer\"}"]}'
    
    # 查询产品
    docker exec cli peer chaincode query -C eyehealth-channel -n producttrace -c '{"function":"GetProductBySKU","Args":["TEST001"]}'
    
    log_success "Chaincode test completed"
}

# 显示网络信息
show_network_info() {
    log_info "Network Information:"
    echo "Orderer: orderer.example.com:7050"
    echo "Peer0: peer0.org1.example.com:7051"
    echo "Peer1: peer1.org1.example.com:8051"
    echo "CouchDB0: localhost:5984"
    echo "CouchDB1: localhost:6984"
    echo "Channel: eyehealth-channel"
    echo "Chaincode: producttrace"
}

# 主函数
main() {
    log_info "Starting EyeHealth Platform Blockchain Network Setup..."
    
    # 检查环境
    check_docker
    check_tools
    
    # 清理旧网络
    cleanup
    
    # 生成配置
    generate_crypto
    generate_artifacts
    
    # 启动网络
    start_network
    
    # 配置网络
    create_channel
    join_channel
    
    # 部署链码
    install_chaincode
    approve_chaincode
    commit_chaincode
    
    # 测试
    test_chaincode
    
    # 显示信息
    show_network_info
    
    log_success "Hyperledger Fabric network is ready!"
    log_info "You can now use the blockchain services in your application."
}

# 错误处理
trap 'log_error "Script failed at line $LINENO"' ERR

# 运行主函数
main "$@"



