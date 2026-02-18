# Remote Production Deployment Guide

## Overview
This guide provides instructions for deploying the latest code to the production server at `https://delhitransport.demo.agrayianailabs.com`.

## Prerequisites
- SSH access to the production server
- Docker and Docker Compose installed on production server
- Git repository access

## Quick Deployment (Automated)

### Option 1: Using Deployment Script (Recommended)

1. **SSH to Production Server**
   ```bash
   ssh user@production-server-ip
   cd /path/to/delhi_vehicle_portal
   ```

2. **Run Deployment Script**
   ```bash
   chmod +x deploy-production.sh
   ./deploy-production.sh
   ```

The script will automatically:
- Pull latest code from GitHub
- Rebuild backend and frontend containers
- Restart services
- Verify deployment

### Option 2: Manual Deployment

1. **SSH to Production Server**
   ```bash
   ssh user@production-server-ip
   cd /path/to/delhi_vehicle_portal
   ```

2. **Pull Latest Code**
   ```bash
   git pull origin main
   ```

3. **Rebuild Containers**
   ```bash
   # Backend
   docker compose -f docker-compose.production.yml build --no-cache backend
   
   # Frontend
   docker compose -f docker-compose.production.yml build --no-cache frontend
   ```

4. **Restart Services**
   ```bash
   docker compose -f docker-compose.production.yml up -d
   ```

5. **Verify Deployment**
   ```bash
   # Check container status
   docker compose -f docker-compose.production.yml ps
   
   # Check backend health
   curl http://localhost:8003/api/health
   
   # Verify new features
   curl http://localhost:8003/api/dashboard/executive-summary | grep -E "(revenue_collected|tax_defaulter_count|accidents)"
   ```

## What's Being Deployed

### Latest Code Changes (Already Pushed to GitHub)
- ✅ Comprehensive testing suite (13 test suites, 139 tests)
- ✅ Modal styling fixes (blue background with white text)
- ✅ Enhanced Executive Dashboard features:
  - Report generation functionality
  - KPI settings functionality
  - CSV download functionality
- ✅ Updated backend with latest fixes
- ✅ Frontend test templates
- ✅ Updated test runner

### Database (Already Pushed)
- ✅ 12,115 documents across 18 collections
- ✅ All data synchronized to production MongoDB server

## Production Configuration

### Environment Variables
- **MongoDB URL**: `mongodb://mongo:1146976700ffa55c4d27@31.97.207.166:27018/?tls=false`
- **Database Name**: `citizen_assistance`
- **Backend Port**: 8003
- **Frontend Port**: 3003
- **CORS Origins**: `https://delhitransport.demo.agrayianailabs.com`

### Services
- **Backend**: FastAPI on port 8003
- **Frontend**: React + Nginx on port 3003
- **Network**: `delhi_vehicle_network`

## Verification Checklist

After deployment, verify:

- [ ] **Backend Health**
  ```bash
  curl https://delhitransport.demo.agrayianailabs.com/api/health
  ```
  Should return: `{"status":"ok","server":"running",...}`

- [ ] **Frontend Accessibility**
  ```bash
  curl -I https://delhitransport.demo.agrayianailabs.com
  ```
  Should return: `200 OK`

- [ ] **New Features**
  - Executive Dashboard loads correctly
  - Modal styling is correct (blue background, white text)
  - Report generation works
  - KPI settings work
  - CSV download works

- [ ] **API Endpoints**
  ```bash
  curl https://delhitransport.demo.agrayianailabs.com/api/dashboard/executive-summary
  ```
  Should include: `revenue_collected`, `tax_defaulter_count`, `accidents`

## Monitoring

### View Logs
```bash
# All services
docker compose -f docker-compose.production.yml logs -f

# Backend only
docker compose -f docker-compose.production.yml logs -f backend

# Frontend only
docker compose -f docker-compose.production.yml logs -f frontend
```

### Check Container Status
```bash
docker compose -f docker-compose.production.yml ps
```

### Resource Usage
```bash
docker stats
```

## Rollback Procedure

If deployment fails or issues occur:

1. **Stop Containers**
   ```bash
   docker compose -f docker-compose.production.yml down
   ```

2. **Checkout Previous Version**
   ```bash
   git log --oneline -10  # View recent commits
   git checkout <previous-commit-hash>
   ```

3. **Rebuild and Restart**
   ```bash
   docker compose -f docker-compose.production.yml build --no-cache
   docker compose -f docker-compose.production.yml up -d
   ```

## Troubleshooting

### Issue: Containers won't start
```bash
# Check logs
docker compose -f docker-compose.production.yml logs

# Check Docker status
docker ps -a

# Restart Docker (if needed)
sudo systemctl restart docker
```

### Issue: Backend not responding
```bash
# Check backend logs
docker compose -f docker-compose.production.yml logs backend

# Restart backend
docker compose -f docker-compose.production.yml restart backend

# Check MongoDB connection
docker compose -f docker-compose.production.yml exec backend python3 -c "from pymongo import MongoClient; client = MongoClient('mongodb://mongo:1146976700ffa55c4d27@31.97.207.166:27018/?tls=false'); print(client.server_info())"
```

### Issue: Frontend not loading
```bash
# Check frontend logs
docker compose -f docker-compose.production.yml logs frontend

# Restart frontend
docker compose -f docker-compose.production.yml restart frontend

# Check nginx configuration
docker compose -f docker-compose.production.yml exec frontend nginx -t
```

## Post-Deployment Testing

1. **Smoke Tests**
   ```bash
   # Backend health
   curl https://delhitransport.demo.agrayianailabs.com/api/health
   
   # Frontend
   curl -I https://delhitransport.demo.agrayianailabs.com
   ```

2. **Functional Tests**
   - Open https://delhitransport.demo.agrayianailabs.com/dashboard
   - Verify all KPI cards are visible
   - Test report generation
   - Test KPI settings
   - Test CSV download

3. **API Tests**
   ```bash
   curl https://delhitransport.demo.agrayianailabs.com/api/dashboard/executive-summary | jq .
   ```

## Support

If issues persist:
1. Check container logs
2. Verify MongoDB connection
3. Check network connectivity
4. Review recent code changes in GitHub

---

**Last Updated**: 2026-02-18  
**Deployment Script Version**: 1.0  
**Production URL**: https://delhitransport.demo.agrayianailabs.com

