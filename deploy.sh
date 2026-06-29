#!/usr/bin/env bash
set -euo pipefail

# PMGT Deployment Script
# One-command deployment for the Project Management Tool

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log() { echo -e "${GREEN}[INFO]${NC} $1"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
MODE="${1:-docker}"

print_banner() {
    echo -e "${BLUE}"
    echo "╔═══════════════════════════════════════╗"
    echo "║     PMGT - Project Management Tool    ║"
    echo "║           Deployment Script           ║"
    echo "╚═══════════════════════════════════════╝"
    echo -e "${NC}"
}

setup_env() {
    log "Setting up environment files..."

    if [ ! -f "$PROJECT_DIR/backend/.env" ]; then
        cp "$PROJECT_DIR/backend/.env.example" "$PROJECT_DIR/backend/.env"
        log "Created backend/.env from .env.example"
        warn "⚠ Edit backend/.env with your settings before running in production!"
    else
        log "backend/.env already exists, skipping"
    fi
}

deploy_docker() {
    log "Deploying with Docker Compose..."

    if ! command -v docker &> /dev/null; then
        error "Docker is not installed. Please install Docker first: https://docs.docker.com/get-docker/"
    fi

    if ! command -v docker compose &> /dev/null; then
        error "Docker Compose is not installed. Please install Docker Compose first."
    fi

    setup_env

    # Generate secure JWT secret if not set
    if ! grep -q "JWT_SECRET=" "$PROJECT_DIR/backend/.env" 2>/dev/null || grep -q "change-this-to-a-random-secret" "$PROJECT_DIR/backend/.env" 2>/dev/null; then
        JWT_SECRET=$(openssl rand -hex 32 2>/dev/null || node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
        warn "Generating secure JWT_SECRET..."
        echo "JWT_SECRET=$JWT_SECRET" >> "$PROJECT_DIR/backend/.env"
    fi

    log "Building and starting containers..."
    cd "$PROJECT_DIR"
    docker compose up -d --build

    log "Waiting for services to be healthy..."
    sleep 5

    log "Running database migrations..."
    docker compose exec -T backend npx prisma migrate deploy 2>/dev/null || true

    log "Deployment complete!"
    echo ""
    echo -e "${GREEN}✅ PMGT is now running!${NC}"
    echo ""
    echo "   Frontend:  http://localhost:${FRONTEND_PORT:-8080}"
    echo "   Backend:   http://localhost:5000"
    echo "   Health:    http://localhost:5000/health"
    echo ""
    echo "   Default login:"
    echo "   Email:    admin@example.com"
    echo "   Password: password123"
    echo ""
    echo -e "${YELLOW}⚠  IMPORTANT: Change the default admin password after first login!${NC}"
}

deploy_dev() {
    log "Setting up development environment..."

    setup_env

    # Install dependencies
    log "Installing backend dependencies..."
    cd "$PROJECT_DIR/backend"
    npm install

    log "Setting up database..."
    npx prisma migrate dev --name init 2>/dev/null || npx prisma migrate deploy

    log "Seeding database with sample data..."
    npm run seed

    log "Installing frontend dependencies..."
    cd "$PROJECT_DIR/frontend"
    npm install

    log "Development setup complete!"
    echo ""
    echo -e "${GREEN}✅ Ready for development!${NC}"
    echo ""
    echo "   Start backend:  cd backend && npm run dev"
    echo "   Start frontend: cd frontend && npm run dev"
    echo ""
    echo "   Frontend: http://localhost:5173"
    echo "   Backend:  http://localhost:5000"
    echo ""
    echo "   Default login:"
    echo "   Email:    admin@example.com"
    echo "   Password: password123"
}

deploy_production() {
    log "Setting up production deployment..."

    if [ ! -f "$PROJECT_DIR/backend/.env" ]; then
        setup_env
    fi

    warn "⚠ Ensure you have PostgreSQL running and DATABASE_URL configured in backend/.env"
    warn "⚠ Ensure you have set a strong JWT_SECRET in backend/.env"
    warn "⚠ Set NODE_ENV=production in backend/.env"

    read -p "Continue? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        error "Deployment cancelled"
    fi

    # Backend
    log "Building backend..."
    cd "$PROJECT_DIR/backend"
    npm install --production

    log "Running database migrations..."
    npx prisma migrate deploy
    npx prisma generate

    log "Starting backend with PM2..."
    if command -v pm2 &> /dev/null; then
        pm2 start src/server.js --name pmgt-backend
        pm2 save
        log "Backend started with PM2"
    else
        warn "PM2 not installed. Install with: npm install -g pm2"
        warn "Starting with nohup instead..."
        nohup node src/server.js > /tmp/pmgt-backend.log 2>&1 &
        log "Backend started in background (PID: $!)"
    fi

    # Frontend
    log "Building frontend..."
    cd "$PROJECT_DIR/frontend"
    npm install
    npm run build

    log "Frontend built to frontend/dist/"
    echo ""
    echo -e "${YELLOW}Serve the frontend/dist directory with nginx or any static file server.${NC}"
    echo "Example nginx config: frontend/nginx.conf"
}

# Main
print_banner

case "$MODE" in
    docker)
        deploy_docker
        ;;
    dev|development)
        deploy_dev
        ;;
    prod|production)
        deploy_production
        ;;
    *)
        echo "Usage: $0 {docker|dev|prod}"
        echo ""
        echo "  docker  - Deploy with Docker Compose (recommended)"
        echo "  dev     - Set up local development environment"
        echo "  prod    - Set up for traditional production deployment"
        exit 1
        ;;
esac
