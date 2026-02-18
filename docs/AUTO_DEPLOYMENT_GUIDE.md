# Automated Deployment Using Docker

This guide explains how to use Docker to automate the entire deployment process.

## Overview

We've created Docker-based solutions that automate all deployment steps:
1. Pulling latest code
2. Rebuilding Docker images
3. Restarting containers
4. Verifying deployment

## Option 1: Using Dockerfile.auto-deploy (Recommended)

This is the simplest and most automated approach.

### Step 1: Build the Deployment Image

```bash
docker build -f Dockerfile.auto-deploy -t auto-deploy .
```

### Step 2: Run the Deployment

```bash
docker run --rm \
  -v $(pwd):/workspace \
  -v /var/run/docker.sock:/var/run/docker.sock \
  auto-deploy
```

### One-Liner (Complete Process)

```bash
docker build -f Dockerfile.auto-deploy -t auto-deploy . && \
docker run --rm \
  -v $(pwd):/workspace \
  -v /var/run/docker.sock:/var/run/docker.sock \
  auto-deploy
```

## Option 2: Using Docker Compose

### Step 1: Run Deployment

```bash
docker compose -f docker-compose.deploy.yml up --build
```

This will:
- Build the deployment container
- Run the deployment script
- Automatically clean up after completion

## Option 3: Using Dockerfile.deploy

### Step 1: Build the Image

```bash
docker build -f Dockerfile.deploy -t delhi-transport-deploy .
```

### Step 2: Run Deployment

```bash
docker run --rm \
  -v $(pwd):/workspace \
  -v /var/run/docker.sock:/var/run/docker.sock \
  delhi-transport-deploy
```

## What Gets Automated

The Docker deployment automatically:

1. ✅ **Pulls Latest Code** from GitHub main branch
2. ✅ **Rebuilds Backend** Docker image with `--no-cache`
3. ✅ **Rebuilds Frontend** Docker image with `--no-cache`
4. ✅ **Restarts Containers** using docker-compose
5. ✅ **Waits for Services** to be healthy (15 seconds)
6. ✅ **Verifies Deployment** by checking:
   - Backend health endpoint
   - API response for new KPI fields
   - Container status
7. ✅ **Displays Results** with colored output

## Prerequisites

1. **Docker** installed on the server
2. **Docker Compose** installed
3. **Git** repository access
4. **Docker socket** accessible (for controlling host Docker)

## Usage Examples

### Example 1: Basic Deployment

```bash
# Navigate to project directory
cd /path/to/delhi_vehicle_portal

# Run automated deployment
docker build -f Dockerfile.auto-deploy -t auto-deploy . && \
docker run --rm \
  -v $(pwd):/workspace \
  -v /var/run/docker.sock:/var/run/docker.sock \
  auto-deploy
```

### Example 2: With Logging

```bash
docker run --rm \
  -v $(pwd):/workspace \
  -v /var/run/docker.sock:/var/run/docker.sock \
  auto-deploy 2>&1 | tee deployment-$(date +%Y%m%d-%H%M%S).log
```

### Example 3: Using Docker Compose

```bash
docker compose -f docker-compose.deploy.yml up --build
```

## Expected Output

```
==========================================
Automated Deployment - Delhi Transport Portal
==========================================

Step 1: Pulling latest code from main branch...
✅ Code pulled successfully

Step 2: Rebuilding backend Docker image...
✅ Backend image rebuilt successfully

Step 3: Rebuilding frontend Docker image...
✅ Frontend image rebuilt successfully

Step 4: Restarting containers...
✅ Containers restarted successfully

Step 5: Waiting for services to be healthy...

Step 6: Verifying deployment...
✅ Backend is healthy
✅ revenue_collected field present
✅ tax_defaulter_count field present
✅ accidents field present

New KPI Values:
  Revenue Collected: ₹2,780,010,483.45
  Tax Defaulter Count: 3,336
  Accidents: 11,330

Container Status:
NAME                     STATUS
delhi_vehicle_backend    Up (healthy)
delhi_vehicle_frontend   Up (healthy)

==========================================
Deployment Complete!
==========================================
```

## Troubleshooting

### Issue: Permission Denied on Docker Socket

**Solution:**
```bash
# Add user to docker group
sudo usermod -aG docker $USER
# Logout and login again
```

### Issue: Cannot Access Docker Socket

**Solution:**
```bash
# Check Docker socket permissions
ls -la /var/run/docker.sock

# If needed, fix permissions
sudo chmod 666 /var/run/docker.sock
```

### Issue: Workspace Not Mounted

**Error:** `Error: /workspace directory not mounted`

**Solution:** Ensure you're mounting the current directory:
```bash
docker run --rm \
  -v $(pwd):/workspace \
  -v /var/run/docker.sock:/var/run/docker.sock \
  auto-deploy
```

### Issue: Git Pull Fails

The deployment will continue even if git pull fails (it will use existing code).

### Issue: Build Fails

Check Docker logs:
```bash
docker compose logs backend
docker compose logs frontend
```

## Advantages of Docker-Based Deployment

1. **Consistency**: Same deployment process everywhere
2. **Isolation**: Doesn't affect host system
3. **Reproducibility**: Can be run multiple times
4. **Automation**: All steps automated
5. **Verification**: Built-in health checks
6. **Logging**: Easy to capture output

## Comparison: Manual vs Docker Deployment

| Feature | Manual | Docker |
|---------|--------|--------|
| Time | 10-15 min | 5-10 min |
| Steps | 6+ manual | 1 command |
| Error Handling | Manual | Automatic |
| Verification | Manual | Automatic |
| Reproducibility | Low | High |
| Logging | Manual | Automatic |

## Best Practices

1. **Always test locally first** before deploying to production
2. **Keep deployment logs** for troubleshooting
3. **Verify after deployment** by checking the dashboard
4. **Monitor container logs** if issues occur
5. **Use version tags** for deployment images

## Quick Reference

```bash
# Build and deploy in one command
docker build -f Dockerfile.auto-deploy -t auto-deploy . && \
docker run --rm \
  -v $(pwd):/workspace \
  -v /var/run/docker.sock:/var/run/docker.sock \
  auto-deploy

# Or using docker-compose
docker compose -f docker-compose.deploy.yml up --build
```

## Support

If you encounter issues:
1. Check Docker is running: `docker ps`
2. Check Docker Compose: `docker compose version`
3. Check logs: `docker compose logs backend`
4. Verify permissions: `ls -la /var/run/docker.sock`

