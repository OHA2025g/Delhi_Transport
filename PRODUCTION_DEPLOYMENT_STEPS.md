# Production Deployment Steps

## Prerequisites
- SSH access to production server
- Docker and Docker Compose installed on production server
- Git access to the repository

## Production Server Details
- **URL**: https://delhitransport.demo.agrayianailabs.com
- **Backend Port**: 8003
- **Frontend Port**: 3003
- **MongoDB**: mongodb://mongo:1146976700ffa55c4d27@31.97.207.166:27018/?tls=false

## Deployment Steps

### Step 1: SSH to Production Server
```bash
ssh user@production-server
cd /path/to/delhi_vehicle_portal
```

### Step 2: Pull Latest Code
```bash
git pull origin main
```

### Step 3: Rebuild Containers
```bash
# Rebuild backend
docker compose -f docker-compose.production.yml build --no-cache backend

# Rebuild frontend
docker compose -f docker-compose.production.yml build --no-cache frontend
```

### Step 4: Restart Services
```bash
docker compose -f docker-compose.production.yml up -d
```

### Step 5: Verify Deployment
```bash
# Check container status
docker compose -f docker-compose.production.yml ps

# Check backend health
curl http://localhost:8003/api/health

# Verify new features
curl http://localhost:8003/api/dashboard/executive-summary | grep -E "(revenue_collected|tax_defaulter_count|accidents)"
```

## Automated Deployment (Using Script)

If the `deploy-production.sh` script is available on the server:

```bash
./deploy-production.sh
```

## What's Being Deployed

### Code Changes
- ✅ Comprehensive testing suite
- ✅ Modal styling fixes (blue background, white text)
- ✅ Enhanced Executive Dashboard features
- ✅ Report generation functionality
- ✅ KPI settings functionality
- ✅ CSV download functionality
- ✅ Updated backend with latest fixes

### Database
- ✅ Already pushed to production MongoDB server
- ✅ 12,115 documents across 18 collections

## Verification Checklist

After deployment, verify:

- [ ] Backend health check returns 200
- [ ] Frontend is accessible
- [ ] Executive Dashboard loads correctly
- [ ] Modal styling is correct (blue background, white text)
- [ ] Report generation works
- [ ] KPI settings work
- [ ] CSV download works
- [ ] All API endpoints respond correctly

## Rollback (If Needed)

If deployment fails:

```bash
# Stop containers
docker compose -f docker-compose.production.yml down

# Checkout previous version
git checkout <previous-commit-hash>

# Rebuild and restart
docker compose -f docker-compose.production.yml build --no-cache
docker compose -f docker-compose.production.yml up -d
```

## Monitoring

After deployment, monitor:

```bash
# View logs
docker compose -f docker-compose.production.yml logs -f

# Check resource usage
docker stats

# Monitor specific service
docker compose -f docker-compose.production.yml logs -f backend
docker compose -f docker-compose.production.yml logs -f frontend
```

