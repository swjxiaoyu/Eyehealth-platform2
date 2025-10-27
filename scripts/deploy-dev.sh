#!/bin/bash

# 去中心化眼健康管理平台 - 部署脚本
# 版本: 1.0.0

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

# 检查依赖
check_dependencies() {
    log_info "检查依赖..."
    
    # 检查Docker
    if ! command -v docker &> /dev/null; then
        log_error "Docker未安装，请先安装Docker"
        exit 1
    fi
    
    # 检查Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose未安装，请先安装Docker Compose"
        exit 1
    fi
    
    # 检查Node.js
    if ! command -v node &> /dev/null; then
        log_error "Node.js未安装，请先安装Node.js"
        exit 1
    fi
    
    # 检查Python
    if ! command -v python3 &> /dev/null; then
        log_error "Python3未安装，请先安装Python3"
        exit 1
    fi
    
    log_success "依赖检查完成"
}

# 创建必要的目录
create_directories() {
    log_info "创建必要的目录..."
    
    mkdir -p logs
    mkdir -p data/postgres
    mkdir -p data/redis
    mkdir -p data/minio
    mkdir -p data/milvus
    mkdir -p data/ipfs
    mkdir -p data/ai-models
    
    log_success "目录创建完成"
}

# 复制环境变量文件
setup_env_files() {
    log_info "设置环境变量文件..."
    
    # 前端环境变量
    if [ ! -f "frontend/.env.local" ]; then
        cp frontend/env.example frontend/.env.local
        log_info "已创建 frontend/.env.local"
    fi
    
    # 后端环境变量
    if [ ! -f "backend/.env" ]; then
        cp backend/env.example backend/.env
        log_info "已创建 backend/.env"
    fi
    
    # AI服务环境变量
    if [ ! -f "ai-service/.env" ]; then
        cp ai-service/env.example ai-service/.env
        log_info "已创建 ai-service/.env"
    fi
    
    log_success "环境变量文件设置完成"
}

# 安装前端依赖
install_frontend_deps() {
    log_info "安装前端依赖..."
    
    cd frontend
    npm install
    cd ..
    
    log_success "前端依赖安装完成"
}

# 安装后端依赖
install_backend_deps() {
    log_info "安装后端依赖..."
    
    cd backend
    npm install
    cd ..
    
    log_success "后端依赖安装完成"
}

# 安装AI服务依赖
install_ai_deps() {
    log_info "安装AI服务依赖..."
    
    cd ai-service
    pip install -r requirements.txt
    cd ..
    
    log_success "AI服务依赖安装完成"
}

# 启动基础设施服务
start_infrastructure() {
    log_info "启动基础设施服务..."
    
    docker-compose -f docker-compose.dev.yml up -d postgres redis minio milvus etcd ipfs
    
    # 等待服务启动
    log_info "等待服务启动..."
    sleep 30
    
    log_success "基础设施服务启动完成"
}

# 启动应用服务
start_application() {
    log_info "启动应用服务..."
    
    # 启动后端服务
    log_info "启动后端服务..."
    cd backend
    npm run start:dev &
    BACKEND_PID=$!
    cd ..
    
    # 启动AI服务
    log_info "启动AI服务..."
    cd ai-service
    python main.py &
    AI_PID=$!
    cd ..
    
    # 启动前端服务
    log_info "启动前端服务..."
    cd frontend
    npm run dev &
    FRONTEND_PID=$!
    cd ..
    
    # 保存进程ID
    echo $BACKEND_PID > .backend.pid
    echo $AI_PID > .ai.pid
    echo $FRONTEND_PID > .frontend.pid
    
    log_success "应用服务启动完成"
}

# 检查服务状态
check_services() {
    log_info "检查服务状态..."
    
    # 检查Docker服务
    docker-compose -f docker-compose.dev.yml ps
    
    # 检查端口
    log_info "检查端口占用..."
    netstat -tulpn | grep -E ":(3000|3001|5432|6379|8000|9000|19530)" || true
    
    log_success "服务状态检查完成"
}

# 显示访问信息
show_access_info() {
    log_success "部署完成！"
    echo ""
    echo "访问信息："
    echo "前端应用: http://localhost:3000"
    echo "后端API: http://localhost:3001"
    echo "AI服务: http://localhost:8000"
    echo "MinIO控制台: http://localhost:9001"
    echo "Grafana: http://localhost:3000 (admin/admin)"
    echo "Prometheus: http://localhost:9090"
    echo ""
    echo "数据库连接信息："
    echo "PostgreSQL: localhost:5432 (postgres/password)"
    echo "Redis: localhost:6379"
    echo "MinIO: localhost:9000 (minioadmin/minioadmin)"
    echo ""
}

# 停止服务
stop_services() {
    log_info "停止服务..."
    
    # 停止应用进程
    if [ -f ".backend.pid" ]; then
        kill $(cat .backend.pid) 2>/dev/null || true
        rm .backend.pid
    fi
    
    if [ -f ".ai.pid" ]; then
        kill $(cat .ai.pid) 2>/dev/null || true
        rm .ai.pid
    fi
    
    if [ -f ".frontend.pid" ]; then
        kill $(cat .frontend.pid) 2>/dev/null || true
        rm .frontend.pid
    fi
    
    # 停止Docker服务
    docker-compose -f docker-compose.dev.yml down
    
    log_success "服务已停止"
}

# 清理数据
clean_data() {
    log_warning "这将删除所有数据，确定要继续吗？(y/N)"
    read -r response
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        log_info "清理数据..."
        docker-compose -f docker-compose.dev.yml down -v
        docker system prune -f
        log_success "数据清理完成"
    else
        log_info "取消清理"
    fi
}

# 主函数
main() {
    case "${1:-deploy}" in
        "deploy")
            log_info "开始部署去中心化眼健康管理平台..."
            check_dependencies
            create_directories
            setup_env_files
            install_frontend_deps
            install_backend_deps
            install_ai_deps
            start_infrastructure
            start_application
            check_services
            show_access_info
            ;;
        "stop")
            stop_services
            ;;
        "restart")
            stop_services
            sleep 5
            main deploy
            ;;
        "clean")
            clean_data
            ;;
        "status")
            check_services
            ;;
        *)
            echo "用法: $0 {deploy|stop|restart|clean|status}"
            echo ""
            echo "命令说明："
            echo "  deploy  - 部署整个平台 (默认)"
            echo "  stop    - 停止所有服务"
            echo "  restart - 重启所有服务"
            echo "  clean   - 清理所有数据"
            echo "  status  - 检查服务状态"
            exit 1
            ;;
    esac
}

# 执行主函数
main "$@"






