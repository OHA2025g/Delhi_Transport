# Docker Quick Start Guide

## 🐳 Quick Start with Docker

### Prerequisites
- Docker Engine 20.10+
- Docker Compose 2.0+
- 4GB+ RAM available

### One-Command Start

```bash
# Production mode
docker-compose up -d

# Development mode (with hot-reload)
docker-compose -f docker-compose.dev.yml up -d
```

### Using Makefile (Recommended)

```bash
# Build images
make build

# Start production services
make up

# Start development services
make up-dev

# View logs
make logs

# Stop services
make down

# Clean everything
make clean
```

## 📍 Service URLs

After starting, services are available at:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health
- **MongoDB**: localhost:27017

## 🔧 Common Commands

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mongodb
```

### Restart Services
```bash
# Restart all
docker-compose restart

# Restart specific service
docker-compose restart backend
```

### Access Container Shell
```bash
# Backend
docker-compose exec backend /bin/bash

# Frontend
docker-compose exec frontend /bin/sh

# MongoDB
docker-compose exec mongodb mongosh
```

### Health Check
```bash
# Check all services
make health

# Or manually
curl http://localhost:8000/health
curl http://localhost:3000/health
```

## 📁 Data Files

Place Excel data files in `data/excel/`:
- `Vahan1.xlsx`
- `Tickets.xlsx`
- `Parivahan_Dashboard_extra_KPI.xlsx`
- `transport_extra_kpi_mock_data_FY2025_26.xlsx`

These will be automatically loaded on first startup.

## 🛠️ Troubleshooting

### Services Not Starting
```bash
# Check logs
docker-compose logs

# Check if ports are in use
lsof -i :8000
lsof -i :3000
```

### Clean Start
```bash
# Remove everything and start fresh
make clean
docker-compose up -d --build
```

### View Resource Usage
```bash
docker stats
```

## 📚 More Information

For detailed Docker setup, see [Docker Setup Guide](docs/DOCKER_SETUP.md)

