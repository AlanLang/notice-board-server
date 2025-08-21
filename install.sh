#!/bin/bash

# Notice Board 一键安装脚本
# 适用于 x86_64 Linux 系统

set -e

REPO="AlanLang/notice-board-server"
INSTALL_DIR="/etc/notice-board"
SERVICE_NAME="notice-board"
BINARY_NAME="notice-board"
USER="$(logname 2>/dev/null || echo $SUDO_USER)"
GROUP="$(id -gn $USER 2>/dev/null || echo $USER)"

# 颜色输出
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

# 检查是否为 root 用户
check_root() {
    if [[ $EUID -ne 0 ]]; then
        log_error "此脚本需要 root 权限运行"
        log_info "请使用: sudo $0"
        exit 1
    fi
}

# 检测系统架构
check_arch() {
    local arch=$(uname -m)
    if [[ "$arch" != "x86_64" ]]; then
        log_error "不支持的系统架构: $arch"
        log_error "目前只支持 x86_64 Linux 系统"
        exit 1
    fi
}

# 检查必要工具
check_dependencies() {
    local deps=("curl" "systemctl" "tar")
    local missing=()
    
    for dep in "${deps[@]}"; do
        if ! command -v "$dep" &> /dev/null; then
            missing+=("$dep")
        fi
    done
    
    if [[ ${#missing[@]} -gt 0 ]]; then
        log_error "缺少必要工具: ${missing[*]}"
        log_info "请先安装这些工具，例如: apt-get install ${missing[*]} 或 yum install ${missing[*]}"
        exit 1
    fi
}

# 获取最新版本号（内部函数，不输出日志）
_get_latest_version_silent() {
    local api_url="https://api.github.com/repos/$REPO/releases/latest"
    local version=$(curl -s "$api_url" | grep '"tag_name":' | sed -E 's/.*"([^"]+)".*/\1/')
    
    if [[ -z "$version" ]]; then
        return 1
    fi
    
    echo "$version"
}

# 获取最新版本号
get_latest_version() {
    log_info "获取最新版本信息..." >&2
    local version=$(_get_latest_version_silent)
    
    if [[ -z "$version" ]]; then
        log_error "无法获取最新版本信息" >&2
        exit 1
    fi
    
    echo "$version"
}

# 检查当前安装版本
get_installed_version() {
    if [[ -f "$INSTALL_DIR/$BINARY_NAME" ]]; then
        local version=$($INSTALL_DIR/$BINARY_NAME --version 2>/dev/null | grep -o 'v[0-9.]*' || echo "")
        echo "$version"
    else
        echo ""
    fi
}

# 检查用户权限
check_user() {
    if [[ -z "$USER" ]]; then
        log_error "无法获取当前用户信息"
        exit 1
    fi
    
    log_info "将使用用户: $USER"
    log_info "将使用用户组: $GROUP"
}

# 下载并安装二进制文件
install_binary() {
    local version="$1"
    local download_url="https://github.com/$REPO/releases/download/$version/notice-board-$version-x86_64-unknown-linux-gnu.tar.gz"
    local temp_dir=$(mktemp -d)
    local tar_file="$temp_dir/notice-board.tar.gz"
    
    log_info "下载 Notice Board $version..."
    curl -L -o "$tar_file" "$download_url" || {
        log_error "下载失败"
        rm -rf "$temp_dir"
        exit 1
    }
    
    # 创建安装目录
    mkdir -p "$INSTALL_DIR"
    
    # 解压
    log_info "解压文件..."
    tar -xzf "$tar_file" -C "$temp_dir" || {
        log_error "解压失败"
        rm -rf "$temp_dir"
        exit 1
    }
    
    # 复制二进制文件
    cp "$temp_dir/$BINARY_NAME" "$INSTALL_DIR/" || {
        log_error "安装二进制文件失败"
        rm -rf "$temp_dir"
        exit 1
    }
    
    # 创建数据目录
    mkdir -p "$INSTALL_DIR/data" || {
        log_warning "创建数据目录失败"
    }
    
    # 设置权限
    chmod +x "$INSTALL_DIR/$BINARY_NAME"
    
    # 清理临时文件
    rm -rf "$temp_dir"
    
    log_success "二进制文件安装完成"
}

# 创建配置和数据目录
create_config() {
    log_info "设置数据目录..."
    
    # 确保数据目录存在
    mkdir -p "$INSTALL_DIR/data"
    
    # 创建初始数据文件（如果不存在）
    local data_file="$INSTALL_DIR/data/data.json"
    if [[ ! -f "$data_file" ]]; then
        cat > "$data_file" << 'EOF'
{
  "messages": {},
  "clients": {},
  "last_updated": "2025-08-21T00:00:00Z"
}
EOF
        log_info "创建初始数据文件"
    fi
    
    # 设置文件权限
    chown -R "$USER:$GROUP" "$INSTALL_DIR"
    
    log_success "数据目录设置完成"
    log_info "数据将保存在: $INSTALL_DIR/data/data.json"
}


# 创建 systemd 服务文件
create_service() {
    local service_file="/etc/systemd/system/$SERVICE_NAME.service"
    
    log_info "创建 systemd 服务..."
    
    cat > "$service_file" << EOF
[Unit]
Description=Notice Board Family Message System
After=network.target
StartLimitIntervalSec=0

[Service]
Type=simple
Restart=always
RestartSec=1
User=$USER
Group=$GROUP
WorkingDirectory=$INSTALL_DIR
ExecStart=$INSTALL_DIR/$BINARY_NAME
Environment=RUST_LOG=info
Environment=DATA_DIR=$INSTALL_DIR/data

# 安全设置
NoNewPrivileges=true
ProtectSystem=strict
ReadWritePaths=$INSTALL_DIR/data
PrivateTmp=true

[Install]
WantedBy=multi-user.target
EOF
    
    # 重新加载 systemd
    systemctl daemon-reload
    
    log_success "systemd 服务创建完成"
}

# 启动服务
start_service() {
    log_info "启动 Notice Board 服务..."
    
    systemctl enable "$SERVICE_NAME"
    systemctl start "$SERVICE_NAME"
    
    # 等待服务启动
    sleep 2
    
    if systemctl is-active --quiet "$SERVICE_NAME"; then
        log_success "Notice Board 服务启动成功"
        log_info "服务状态: $(systemctl is-active $SERVICE_NAME)"
        log_info "访问地址: http://localhost:3003"
        log_info "现在可以开始使用家庭留言板系统"
    else
        log_error "Notice Board 服务启动失败"
        log_info "查看日志: journalctl -u $SERVICE_NAME -f"
        exit 1
    fi
}

# 停止服务
stop_service() {
    if systemctl is-active --quiet "$SERVICE_NAME"; then
        log_info "停止 Notice Board 服务..."
        systemctl stop "$SERVICE_NAME"
    fi
}

# 主安装函数
install_notice_board() {
    log_info "开始安装 Notice Board..."
    
    local latest_version=$(get_latest_version)
    local installed_version=$(get_installed_version)
    
    if [[ -n "$installed_version" ]]; then
        if [[ "$installed_version" == "$latest_version" ]]; then
            log_info "Notice Board $installed_version 已是最新版本"
            return
        else
            log_info "发现新版本: $latest_version (当前: $installed_version)"
            log_info "开始更新..."
            stop_service
        fi
    else
        log_info "检测到新安装，版本: $latest_version"
    fi
    
    check_user
    install_binary "$latest_version"
    create_config
    create_service
    start_service
    
    log_success "Notice Board 安装/更新完成！"
}

# 卸载函数
uninstall_notice_board() {
    log_info "开始卸载 Notice Board..."
    
    # 停止并禁用服务
    if systemctl is-enabled --quiet "$SERVICE_NAME" 2>/dev/null; then
        systemctl disable "$SERVICE_NAME"
    fi
    
    if systemctl is-active --quiet "$SERVICE_NAME"; then
        systemctl stop "$SERVICE_NAME"
    fi
    
    # 删除服务文件
    rm -f "/etc/systemd/system/$SERVICE_NAME.service"
    systemctl daemon-reload
    
    # 删除安装目录
    if [[ -d "$INSTALL_DIR" ]]; then
        rm -rf "$INSTALL_DIR"
    fi
    
    log_success "Notice Board 卸载完成"
}

# 显示状态
show_status() {
    log_info "Notice Board 状态信息："
    
    if [[ -f "$INSTALL_DIR/$BINARY_NAME" ]]; then
        local version=$(get_installed_version)
        echo "安装版本: ${version:-"未知"}"
        echo "安装目录: $INSTALL_DIR"
        echo "数据文件: $INSTALL_DIR/data/data.json"
        echo "服务状态: $(systemctl is-active $SERVICE_NAME 2>/dev/null || echo "未安装")"
        
        if systemctl is-active --quiet "$SERVICE_NAME"; then
            echo "访问地址: http://localhost:3003"
        fi
    else
        echo "未安装"
    fi
}

# 显示帮助信息
show_help() {
    echo "Notice Board 一键安装脚本"
    echo ""
    echo "使用方法:"
    echo "  sudo $0 [命令]"
    echo ""
    echo "命令:"
    echo "  install   安装或更新 Notice Board (默认)"
    echo "  uninstall 卸载 Notice Board"
    echo "  status    显示状态信息"
    echo "  help      显示此帮助信息"
    echo ""
    echo "示例:"
    echo "  sudo $0              # 安装或更新"
    echo "  sudo $0 install      # 安装或更新"
    echo "  sudo $0 uninstall    # 卸载"
    echo "  $0 status            # 显示状态（无需 root）"
    echo ""
}

# 主函数
main() {
    local command="${1:-install}"
    
    case "$command" in
        install)
            check_root
            check_arch
            check_dependencies
            install_notice_board
            ;;
        uninstall)
            check_root
            uninstall_notice_board
            ;;
        status)
            show_status
            ;;
        help|--help|-h)
            show_help
            ;;
        *)
            log_error "未知命令: $command"
            show_help
            exit 1
            ;;
    esac
}

# 运行主函数
main "$@"
