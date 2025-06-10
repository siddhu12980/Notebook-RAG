#!/bin/bash

# 🎨 Enhanced color palette and formatting
BOLD='\033[1m'
DIM='\033[2m'
RESET='\033[0m'
BLINK='\033[5m'

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'

# Background colors
BG_GREEN='\033[42m'
BG_RED='\033[41m'
BG_YELLOW='\033[43m'
BG_BLUE='\033[44m'

# 🚀 ASCII Art Banner
print_banner() {
    echo -e "${CYAN}${BOLD}"
    cat << "EOF"
    ╔══════════════════════════════════════════════════════════════╗
    ║  ██████╗  █████╗  ██████╗     ██████╗  █████╗  ██████╗██╗  ██╗║
    ║  ██╔══██╗██╔══██╗██╔════╝     ██╔══██╗██╔══██╗██╔════╝██║ ██╔╝║
    ║  ██████╔╝███████║██║  ███╗    ██████╔╝███████║██║     █████╔╝ ║
    ║  ██╔══██╗██╔══██║██║   ██║    ██╔══██╗██╔══██║██║     ██╔═██╗ ║
    ║  ██║  ██║██║  ██║╚██████╔╝    ██████╔╝██║  ██║╚██████╗██║  ██╗║
    ║  ╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝     ╚═════╝ ╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝║
    ║                                                              ║
    ║              🚀 BACKEND DEPLOYMENT SCRIPT 🚀                 ║
    ╚══════════════════════════════════════════════════════════════╝
EOF
    echo -e "${RESET}"
}

# 📊 Progress bar function
progress_bar() {
    local current=$1
    local total=$2
    local description=$3
    local width=40
    local percentage=$((current * 100 / total))
    local completed=$((width * current / total))
    local remaining=$((width - completed))
    
    printf "\r${BLUE}${BOLD}[${RESET}"
    printf "%*s" $completed | tr ' ' '█'
    printf "%*s" $remaining | tr ' ' '░'
    printf "${BLUE}${BOLD}] ${percentage}%% ${GREEN}${description}${RESET}"
}

# ✨ Fancy step indicator
print_step() {
    local step_num=$1
    local description=$2
    local icon=$3
    echo -e "\n${BG_BLUE}${WHITE}${BOLD} STEP ${step_num} ${RESET} ${icon} ${BOLD}${description}${RESET}"
    echo -e "${DIM}────────────────────────────────────────────────────${RESET}"
}

# 🎯 Status indicators
success() {
    echo -e "${GREEN}${BOLD}✅ SUCCESS:${RESET} $1"
}

warning() {
    echo -e "${YELLOW}${BOLD}⚠️  WARNING:${RESET} $1"
}

error() {
    echo -e "${RED}${BOLD}❌ ERROR:${RESET} $1"
}

info() {
    echo -e "${CYAN}${BOLD}ℹ️  INFO:${RESET} $1"
}

# 🎮 Interactive spinner
spinner() {
    local pid=$1
    local delay=0.1
    local spinstr='⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏'
    while [ "$(ps a | awk '{print $1}' | grep $pid)" ]; do
        local temp=${spinstr#?}
        printf " [${MAGENTA}%c${RESET}]  " "$spinstr"
        local spinstr=$temp${spinstr%"$temp"}
        sleep $delay
        printf "\b\b\b\b\b\b"
    done
    printf "    \b\b\b\b"
}

# 🎊 Celebration animation
celebration() {
    echo -e "\n${YELLOW}${BOLD}"
    for i in {1..3}; do
        echo -e "🎉 🎊 🚀 ✨ 🎯 🎉 🎊 🚀 ✨ 🎯"
        sleep 0.3
        echo -e "   🎊 🚀 ✨ 🎯 🎉 🎊 🚀 ✨ 🎯"
        sleep 0.3
    done
    echo -e "${RESET}"
}

# 📋 System info display
show_system_info() {
    echo -e "\n${BG_YELLOW}${WHITE}${BOLD} SYSTEM INFORMATION ${RESET}"
    echo -e "${DIM}┌─────────────────────────────────────────────────────┐${RESET}"
    echo -e "${DIM}│${RESET} 🖥️  OS: $(uname -s) $(uname -r)"
    echo -e "${DIM}│${RESET} 🐳 Docker: $(docker --version 2>/dev/null || echo 'Not installed')"
    echo -e "${DIM}│${RESET} 📅 Date: $(date)"
    echo -e "${DIM}│${RESET} 👤 User: $(whoami)"
    echo -e "${DIM}└─────────────────────────────────────────────────────┘${RESET}"
}

# 🔧 Environment check with style
check_environment() {
    print_step "1" "Environment Check" "🔍"
    
    # Check for .env file
    if [ ! -f .env ]; then
        warning ".env file not found!"
        if [ -f .env.example ]; then
            info "Creating .env from .env.example template..."
            cp .env.example .env
            echo -e "\n${BG_RED}${WHITE}${BOLD} ATTENTION REQUIRED ${RESET}"
            echo -e "${RED}${BOLD}Please edit the .env file with your actual credentials!${RESET}"
            echo -e "${YELLOW}Configuration items to update:${RESET}"
            echo -e "  • Database credentials"
            echo -e "  • API keys"
            echo -e "  • Service URLs"
            echo -e "\n${CYAN}Press ${BOLD}[ENTER]${RESET}${CYAN} after editing, or ${BOLD}[Ctrl+C]${RESET}${CYAN} to cancel${RESET}"
            read -p "► "
        else
            error ".env.example file not found!"
            echo -e "${RED}Please create a .env file manually with required configuration.${RESET}"
            exit 1
        fi
    else
        success ".env file found!"
    fi
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        error "Docker is not installed or not in PATH!"
        exit 1
    else
        success "Docker is available!"
    fi
    
    # Check Docker Compose
    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        error "Docker Compose is not available!"
        exit 1
    else
        success "Docker Compose is available!"
    fi
}

# 📦 Enhanced image pulling
pull_images() {
    print_step "2" "Pulling Latest Backend Image" "📦"
    
    image="siddjuugi/rag-notebook-backend:latest"
    
    echo -e "\n${CYAN}Pulling ${BOLD}${image}${RESET}..."
    
    # Show progress
    for j in {1..20}; do
        progress_bar $j 20 "Downloading..."
        sleep 0.1
    done
    echo
    
    if docker pull "${image}" > /dev/null 2>&1; then
        success "Successfully pulled ${image}"
    else
        error "Failed to pull ${image}"
        exit 1
    fi
}

# 🛑 Graceful shutdown
shutdown_existing() {
    print_step "3" "Graceful Shutdown" "🛑"
    
    info "Stopping existing containers..."
    if docker compose -f docker-compose.prod.yaml down > /dev/null 2>&1; then
        success "Existing deployment stopped successfully!"
    else
        warning "No existing deployment found or failed to stop"
    fi
}

# 🚀 Launch deployment
deploy_services() {
    print_step "4" "Launching Backend Service" "🚀"
    
    info "Starting production deployment..."
    echo -e "${DIM}This may take a few moments...${RESET}\n"
    
    if docker compose -f docker-compose.prod.yaml up -d --build > /dev/null 2>&1; then
        success "Backend service launched successfully!"
    else
        error "Failed to start backend service!"
        exit 1
    fi
}

# 🔍 Health check with fancy display
health_check() {
    print_step "5" "Health Check" "🔍"
    
    info "Waiting for backend service to initialize..."
    for i in {1..10}; do
        progress_bar $i 10 "Checking backend service..."
        sleep 0.5
    done
    echo
    
    echo -e "\n${BG_GREEN}${WHITE}${BOLD} BACKEND SERVICE STATUS ${RESET}"
    docker compose -f docker-compose.prod.yaml ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}"
}

# 🎯 Final summary
show_summary() {
    echo -e "\n${BG_GREEN}${WHITE}${BOLD} DEPLOYMENT SUMMARY ${RESET}"
    echo -e "${DIM}┌─────────────────────────────────────────────────────┐${RESET}"
    echo -e "${DIM}│${RESET} 🌐 Backend API:  ${GREEN}${BOLD}http://localhost:3000${RESET}"
    echo -e "${DIM}│${RESET} 📊 Status:      ${GREEN}${BOLD}Running${RESET}"
    echo -e "${DIM}│${RESET} ⏰ Deployed:    ${GREEN}${BOLD}$(date)${RESET}"
    echo -e "${DIM}└─────────────────────────────────────────────────────┘${RESET}"
    
    echo -e "\n${CYAN}${BOLD}🎯 Quick Commands:${RESET}"
    echo -e "  • View logs:     ${YELLOW}docker compose -f docker-compose.prod.yaml logs -f${RESET}"
    echo -e "  • Stop service:  ${YELLOW}docker compose -f docker-compose.prod.yaml down${RESET}"
    echo -e "  • Restart:       ${YELLOW}docker compose -f docker-compose.prod.yaml restart${RESET}"
    echo -e "  • Prisma migrate: ${YELLOW}docker compose -f docker-compose.prod.yaml exec backend npx prisma migrate dev${RESET}"
    
    echo -e "\n${CYAN}${BOLD}🔗 API Endpoints:${RESET}"
    echo -e "  • Health check:  ${YELLOW}curl http://localhost:3000/health${RESET}"
}

# 🎬 Main execution flow
main() {
    clear
    print_banner
    show_system_info
    
    # Execute deployment steps
    check_environment
    pull_images
    shutdown_existing
    deploy_services
    health_check
    
    # Celebrate success!
    celebration
    echo -e "\n${GREEN}${BOLD}🎉 BACKEND DEPLOYMENT COMPLETED SUCCESSFULLY! 🎉${RESET}"
    show_summary
    
    echo -e "\n${GREEN}${BOLD}Happy coding! 🚀✨${RESET}\n"
}

# 🚨 Error handling
trap 'echo -e "\n${RED}${BOLD}❌ Deployment interrupted!${RESET}"; exit 1' INT TERM

# Start the show!
main "$@"