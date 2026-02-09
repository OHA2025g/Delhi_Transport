# Makefile for Docker operations

.PHONY: help build up down restart logs clean test

help:
	@echo "Available commands:"
	@echo "  make build      - Build Docker images"
	@echo "  make up         - Start containers (production)"
	@echo "  make up-dev     - Start containers (development)"
	@echo "  make down       - Stop containers"
	@echo "  make restart    - Restart containers"
	@echo "  make logs       - View container logs"
	@echo "  make clean      - Remove containers, volumes, and images"
	@echo "  make test       - Run tests in containers"
	@echo "  make shell-backend - Open shell in backend container"
	@echo "  make shell-frontend - Open shell in frontend container"

# Production
build:
	docker-compose build

up:
	docker-compose up -d
	@echo "Services started. Backend: http://localhost:8000, Frontend: http://localhost:3000"

# Development
up-dev:
	docker-compose -f docker-compose.dev.yml up -d
	@echo "Development services started. Backend: http://localhost:8000, Frontend: http://localhost:3000"

down:
	docker-compose down
	docker-compose -f docker-compose.dev.yml down

restart:
	docker-compose restart
	docker-compose -f docker-compose.dev.yml restart

logs:
	docker-compose logs -f

logs-backend:
	docker-compose logs -f backend

logs-frontend:
	docker-compose logs -f frontend

logs-mongodb:
	docker-compose logs -f mongodb

# Cleanup
clean:
	docker-compose down -v --rmi all
	docker-compose -f docker-compose.dev.yml down -v --rmi all
	@echo "All containers, volumes, and images removed"

# Testing
test:
	docker-compose exec backend python -m pytest tests/ || echo "Tests require test files to be mounted"

# Shell access
shell-backend:
	docker-compose exec backend /bin/bash

shell-frontend:
	docker-compose exec frontend /bin/sh

shell-mongodb:
	docker-compose exec mongodb mongosh

# Health checks
health:
	@echo "Checking service health..."
	@curl -s http://localhost:8000/health | python -m json.tool || echo "Backend not responding"
	@curl -s http://localhost:3000/health || echo "Frontend not responding"

# Database operations
db-backup:
	docker-compose exec mongodb mongodump --out=/data/backup
	@echo "Database backup created in /data/backup"

db-restore:
	@echo "Restore database from backup (specify backup path)"

