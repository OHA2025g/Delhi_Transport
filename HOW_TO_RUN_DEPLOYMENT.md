# How to Run Deployment Script on Production Server

## Prerequisites

1. **SSH Access**: You need SSH access to the production server
2. **Server Details**: Know the server IP/hostname and your credentials
3. **Project Location**: Know where the project is located on the server

## Step-by-Step Instructions

### Step 1: Connect to Production Server

```bash
# Replace with your actual server details
ssh username@delhitransport.demo.agrayianailabs.com

# OR if using IP address
ssh username@<server-ip-address>

# OR if using a specific SSH key
ssh -i /path/to/your/key.pem username@<server-ip-address>
```

### Step 2: Navigate to Project Directory

```bash
# Common locations (adjust based on your setup):
cd /var/www/delhi_vehicle_portal
# OR
cd /home/username/delhi_vehicle_portal
# OR
cd /opt/delhi_vehicle_portal
# OR wherever your project is located
```

### Step 3: Pull Latest Code (if script doesn't exist yet)

```bash
# Pull the latest code including the deployment script
git pull origin main
```

### Step 4: Make Script Executable

```bash
# Make the script executable
chmod +x deploy-production.sh

# Verify it's executable
ls -la deploy-production.sh
# Should show: -rwxr-xr-x (x means executable)
```

### Step 5: Run the Deployment Script

```bash
# Run the script
./deploy-production.sh

# OR if you want to see all output in real-time
bash deploy-production.sh

# OR if you want to save output to a log file
./deploy-production.sh 2>&1 | tee deployment.log
```

### Step 6: Monitor the Process

The script will:
1. Pull latest code from GitHub
2. Rebuild backend Docker image
3. Rebuild frontend Docker image
4. Restart containers
5. Verify deployment
6. Show KPI field status

**Expected Output:**
```
==========================================
Production Deployment Script
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

==========================================
Deployment Complete!
==========================================
```

## Alternative: Manual Execution (if script fails)

If the script doesn't work, you can run commands manually:

```bash
# 1. Pull code
git pull origin main

# 2. Rebuild backend
docker compose build --no-cache backend

# 3. Rebuild frontend
docker compose build --no-cache frontend

# 4. Restart services
docker compose up -d

# 5. Wait for services
sleep 15

# 6. Verify
curl http://localhost:8003/api/dashboard/executive-summary | \
  python3 -m json.tool | grep -E "(revenue_collected|tax_defaulter_count|accidents)"
```

## Troubleshooting

### Issue: Permission Denied
```bash
# Solution: Make script executable
chmod +x deploy-production.sh
```

### Issue: Script Not Found
```bash
# Solution: Check you're in the right directory
pwd
ls -la deploy-production.sh

# If file doesn't exist, pull latest code
git pull origin main
```

### Issue: Docker Permission Denied
```bash
# Solution: Add user to docker group (requires sudo)
sudo usermod -aG docker $USER
# Then logout and login again
```

### Issue: Git Pull Fails
```bash
# Solution: Check git status
git status

# If there are uncommitted changes, stash them
git stash
git pull origin main
```

### Issue: Docker Compose Not Found
```bash
# Solution: Use docker-compose (with hyphen) instead
docker-compose build --no-cache backend
docker-compose up -d
```

## Verification After Deployment

### 1. Check API Response
```bash
curl https://delhitransport.demo.agrayianailabs.com/api/dashboard/executive-summary | \
  python3 -m json.tool | grep -E "(revenue_collected|tax_defaulter_count|accidents)"
```

### 2. Check Container Status
```bash
docker compose ps
```

### 3. Check Backend Logs
```bash
docker compose logs backend | tail -50
```

### 4. Check Frontend Logs
```bash
docker compose logs frontend | tail -50
```

### 5. Verify Dashboard
Open in browser: `https://delhitransport.demo.agrayianailabs.com/dashboard`

You should see:
- ✅ Revenue Collected card
- ✅ Tax Defaulter Count card
- ✅ Accident card

## Quick Reference Commands

```bash
# Connect to server
ssh username@server-ip

# Navigate to project
cd /path/to/delhi_vehicle_portal

# Pull latest code
git pull origin main

# Make script executable
chmod +x deploy-production.sh

# Run deployment
./deploy-production.sh

# Check status
docker compose ps

# View logs
docker compose logs -f backend
```

## Need Help?

If you encounter issues:
1. Check the script output for error messages
2. Review container logs: `docker compose logs backend`
3. Verify Docker is running: `docker ps`
4. Check disk space: `df -h`
5. Check memory: `free -h`

