#!/bin/bash

# Production Deployment Script
# This script updates the production server with the latest code

set -e  # Exit on error

echo "=========================================="
echo "Production Deployment Script"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Pull latest code
echo -e "${YELLOW}Step 1: Pulling latest code from main branch...${NC}"
git pull origin main
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Code pulled successfully${NC}"
else
    echo -e "${RED}❌ Failed to pull code${NC}"
    exit 1
fi

# Step 2: Rebuild backend Docker image
echo ""
echo -e "${YELLOW}Step 2: Rebuilding backend Docker image...${NC}"
docker compose build --no-cache backend
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Backend image rebuilt successfully${NC}"
else
    echo -e "${RED}❌ Failed to rebuild backend image${NC}"
    exit 1
fi

# Step 3: Rebuild frontend Docker image (optional, but recommended)
echo ""
echo -e "${YELLOW}Step 3: Rebuilding frontend Docker image...${NC}"
docker compose build --no-cache frontend
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Frontend image rebuilt successfully${NC}"
else
    echo -e "${RED}❌ Failed to rebuild frontend image${NC}"
    exit 1
fi

# Step 4: Restart containers
echo ""
echo -e "${YELLOW}Step 4: Restarting containers...${NC}"
docker compose up -d
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Containers restarted successfully${NC}"
else
    echo -e "${RED}❌ Failed to restart containers${NC}"
    exit 1
fi

# Step 5: Wait for services to be healthy
echo ""
echo -e "${YELLOW}Step 5: Waiting for services to be healthy...${NC}"
sleep 10

# Step 6: Verify deployment
echo ""
echo -e "${YELLOW}Step 6: Verifying deployment...${NC}"

# Check backend health
BACKEND_HEALTH=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8003/health || echo "000")
if [ "$BACKEND_HEALTH" = "200" ]; then
    echo -e "${GREEN}✅ Backend is healthy${NC}"
else
    echo -e "${RED}❌ Backend health check failed (HTTP $BACKEND_HEALTH)${NC}"
fi

# Check if new KPI fields are present
echo ""
echo -e "${YELLOW}Checking for new KPI fields in API response...${NC}"
API_RESPONSE=$(curl -s http://localhost:8003/api/dashboard/executive-summary)

if echo "$API_RESPONSE" | grep -q "revenue_collected"; then
    echo -e "${GREEN}✅ revenue_collected field present${NC}"
else
    echo -e "${RED}❌ revenue_collected field missing${NC}"
fi

if echo "$API_RESPONSE" | grep -q "tax_defaulter_count"; then
    echo -e "${GREEN}✅ tax_defaulter_count field present${NC}"
else
    echo -e "${RED}❌ tax_defaulter_count field missing${NC}"
fi

if echo "$API_RESPONSE" | grep -q "accidents"; then
    echo -e "${GREEN}✅ accidents field present${NC}"
else
    echo -e "${RED}❌ accidents field missing${NC}"
fi

# Display KPI values
echo ""
echo -e "${YELLOW}New KPI Values:${NC}"
echo "$API_RESPONSE" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    print(f\"  Revenue Collected: ₹{data.get('revenue_collected', 0):,.2f}\")
    print(f\"  Tax Defaulter Count: {data.get('tax_defaulter_count', 0):,.0f}\")
    print(f\"  Accidents: {data.get('accidents', 0):,.0f}\")
except:
    print('  Could not parse API response')
"

echo ""
echo "=========================================="
echo -e "${GREEN}Deployment Complete!${NC}"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Verify the dashboard at: https://delhitransport.demo.agrayianailabs.com/dashboard"
echo "2. Check that Revenue Collected, Tax Defaulter Count, and Accident cards are visible"
echo "3. Monitor logs: docker compose logs -f backend"

