# Docker Setup Guide

This guide explains how to set up and run the Delhi Vehicle Portal using Docker.

## Prerequisites

- Docker Engine 20.10+
- Docker Compose 2.0+
- 4GB+ RAM available
- 10GB+ disk space

## Quick Start

### Production Mode

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

Services will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs
- MongoDB: localhost:27017

### Development Mode

```bash
# Start development services with hot-reload
docker-compose -f docker-compose.dev.yml up -d

# View logs
docker-compose -f docker-compose.dev.yml logs -f

# Stop services
docker-compose -f docker-compose.dev.yml down
```

## Using Makefile

For convenience, use the provided Makefile:

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

# Check health
make health
```

## Docker Services

### 1. MongoDB
- **Image**: mongo:7.0
- **Port**: 27017
- **Volume**: Persistent data storage
- **Health Check**: Automatic ping check

### 2. Backend (FastAPI)
- **Port**: 8000
- **Environment Variables**:
  - `MONGO_URL`: MongoDB connection string
  - `DB_NAME`: Database name
  - `RATE_LIMIT_ENABLED`: Enable/disable rate limiting
  - `RATE_LIMIT_RPM`: Requests per minute limit
- **Volumes**:
  - `./data` → `/app/data` (read-only)
  - `./backend` → `/app` (development mode only)

### 3. Frontend (React + Nginx)
- **Port**: 3000 (production) or 3000 (development)
- **Environment Variables**:
  - `REACT_APP_BACKEND_URL`: Backend API URL
- **Volumes**:
  - `./frontend/src` → `/app/src` (development mode only)

## Configuration

### Environment Variables

Create `.env` file in project root (optional):

```env
# MongoDB
MONGO_URL=mongodb://mongodb:27017
DB_NAME=citizen_assistance

# Backend
RATE_LIMIT_ENABLED=false
RATE_LIMIT_RPM=100

# Frontend
REACT_APP_BACKEND_URL=http://localhost:8000
```

### Data Files

Place Excel data files in `data/excel/`:
- `Vahan1.xlsx`
- `Tickets.xlsx`
- `Parivahan_Dashboard_extra_KPI.xlsx`
- `transport_extra_kpi_mock_data_FY2025_26.xlsx`

These will be automatically loaded on first startup.

## Common Operations

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mongodb
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

### Restart Services

```bash
# Restart all
docker-compose restart

# Restart specific service
docker-compose restart backend
```

### Database Backup

```bash
# Create backup
docker-compose exec mongodb mongodump --out=/data/backup

# Copy backup from container
docker cp delhi_vehicle_mongodb:/data/backup ./backup
```

### Database Restore

```bash
# Copy backup to container
docker cp ./backup delhi_vehicle_mongodb:/data/backup

# Restore
docker-compose exec mongodb mongorestore /data/backup
```

## Troubleshooting

### Services Not Starting

1. Check logs: `docker-compose logs`
2. Verify ports are not in use: `lsof -i :8000` or `lsof -i :3000`
3. Check Docker resources: `docker system df`

### Backend Not Connecting to MongoDB

1. Verify MongoDB is healthy: `docker-compose ps`
2. Check MongoDB logs: `docker-compose logs mongodb`
3. Verify connection string in backend environment

### Frontend Not Loading

1. Check if backend is running: `curl http://localhost:8000/health`
2. Verify frontend build: `docker-compose logs frontend`
3. Check browser console for errors

### Data Not Loading

1. Verify Excel files are in `data/excel/`
2. Check backend logs for data loading messages
3. Verify file permissions: `ls -la data/excel/`

### Clean Start

```bash
# Remove everything and start fresh
make clean
docker-compose up -d --build
```

## Production Deployment

### Build for Production

```bash
# Build optimized images
docker-compose build --no-cache

# Tag for registry (optional)
docker tag delhi_vehicle_backend:latest your-registry/backend:latest
docker tag delhi_vehicle_frontend:latest your-registry/frontend:latest
```

### Environment-Specific Configuration

Create `docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  backend:
    environment:
      - RATE_LIMIT_ENABLED=true
      - RATE_LIMIT_RPM=100
    # Add production-specific settings
```

Run with:
```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

## Security Considerations

1. **Change default passwords** (if MongoDB auth is enabled)
2. **Use secrets management** for sensitive data
3. **Enable rate limiting** in production
4. **Use HTTPS** in production (configure reverse proxy)
5. **Limit container resources** (CPU, memory)
6. **Regular security updates** of base images

## Performance Optimization

1. **Use multi-stage builds** (already implemented)
2. **Enable caching** for faster rebuilds
3. **Optimize image sizes** (use alpine images)
4. **Configure resource limits** in docker-compose
5. **Use volume mounts** for persistent data

## Monitoring

### Health Checks

All services include health checks:
- Backend: `http://localhost:8000/health`
- Frontend: `http://localhost:3000/health`
- MongoDB: Automatic ping check

### Resource Usage

```bash
# View resource usage
docker stats

# View disk usage
docker system df
```

## Next Steps

1. Configure production environment variables
2. Set up reverse proxy (nginx/traefik) for HTTPS
3. Configure monitoring and logging
4. Set up CI/CD pipeline
5. Configure backup strategy

---

For more information, see:
- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Project README](../README.md)

