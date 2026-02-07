
#!/bin/bash

# Health Connect Deployment Script
# This script handles deployment with load balancing and auto-scaling

set -e

# Configuration
PROJECT_NAME="health-connect"
DOCKER_COMPOSE_FILE="infrastructure/docker-compose.yml"
ENV_FILE=".env"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
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

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."

    # Check if Docker is installed
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed. Please install Docker first."
        exit 1
    fi

    # Check if Docker Compose is installed
    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        log_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi

    # Check if .env file exists
    if [ ! -f "$ENV_FILE" ]; then
        log_warning ".env file not found. Creating from template..."
        cp .env.example .env 2>/dev/null || log_warning "No .env.example found. Please create .env manually."
    fi

    log_success "Prerequisites check passed"
}

# Pre-deployment checks
pre_deployment_checks() {
    log_info "Running pre-deployment checks..."

    # Check environment variables
    required_vars=("DATABASE_URL" "JWT_SECRET")
    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ] && ! grep -q "^${var}=" .env 2>/dev/null; then
            log_warning "Required environment variable ${var} is not set"
        fi
    done

    # Check if ports are available
    ports=(80 443 3000 3001 3002 3003 3004 3005 5432 6379 9090 3100)
    for port in "${ports[@]}"; do
        if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
            log_warning "Port $port is already in use"
        fi
    done

    log_success "Pre-deployment checks completed"
}

# Build and deploy
deploy() {
    log_info "Starting deployment..."

    # Create necessary directories
    mkdir -p infrastructure/nginx/logs
    mkdir -p infrastructure/nginx/ssl
    mkdir -p infrastructure/monitoring/grafana/provisioning

    # Build the application
    log_info "Building application..."
    docker-compose -f $DOCKER_COMPOSE_FILE build --parallel

    # Start services
    log_info "Starting services..."
    docker-compose -f $DOCKER_COMPOSE_FILE up -d

    # Wait for services to be healthy
    log_info "Waiting for services to be healthy..."
    sleep 30

    # Check service health
    check_services_health

    log_success "Deployment completed successfully"
}

# Check service health
check_services_health() {
    log_info "Checking service health..."

    services=("nginx" "app" "db" "redis" "prometheus" "grafana")

    for service in "${services[@]}"; do
        if docker-compose -f $DOCKER_COMPOSE_FILE ps $service | grep -q "Up"; then
            log_success "$service is running"
        else
            log_error "$service failed to start"
        fi
    done
}

# Scale application instances
scale_app() {
    local instances=$1
    log_info "Scaling application to $instances instances..."

    docker-compose -f $DOCKER_COMPOSE_FILE up -d --scale app=$instances

    # Update nginx configuration if needed
    update_nginx_upstream $instances

    log_success "Application scaled to $instances instances"
}

# Update nginx upstream configuration
update_nginx_upstream() {
    local instances=$1
    log_info "Updating nginx upstream configuration..."

    # This would dynamically update nginx config for new instances
