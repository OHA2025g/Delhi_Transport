# Production Deployment Guide - KPI Fields Fix

## Issue Summary

The production server at `https://delhitransport.demo.agrayianailabs.com` is missing three KPI fields in the Executive Dashboard:
- `revenue_collected`
- `tax_defaulter_count`
- `accidents`

## Root Cause

The production server is running an **older version** of the backend code that doesn't include these fields. The latest code has been pushed to the `main` branch but hasn't been deployed to production yet.

## Verification

### Current Status

**Local Backend (localhost:8003):**
- ✅ Returns `revenue_collected`
- ✅ Returns `tax_defaulter_count`
- ✅ Returns `accidents`

**Production Backend (delhitransport.demo.agrayianailabs.com):**
- ❌ Missing `revenue_collected`
- ❌ Missing `tax_defaulter_count`
- ❌ Missing `accidents`

### Code Status

- ✅ Backend code includes all three fields (lines 4122-4124 in `backend/server.py`)
- ✅ Frontend code expects all three fields (lines 104, 128, 144 in `frontend/src/pages/ExecutiveDashboard.jsx`)
- ✅ Code is committed and pushed to `main` branch

## Deployment Steps

### Option 1: Using Deployment Script (Recommended)

1. SSH to the production server
2. Navigate to the project directory
3. Run the deployment script:
   ```bash
   ./deploy-production.sh
   ```

### Option 2: Manual Deployment

1. SSH to the production server
2. Navigate to the project directory:
   ```bash
   cd /path/to/delhi_vehicle_portal
   ```

3. Pull the latest code:
   ```bash
   git pull origin main
   ```

4. Rebuild the backend Docker image:
   ```bash
   docker compose build --no-cache backend
   ```

5. Rebuild the frontend Docker image (optional but recommended):
   ```bash
   docker compose build --no-cache frontend
   ```

6. Restart the containers:
   ```bash
   docker compose up -d
   ```

7. Wait for services to be healthy (about 10-15 seconds)

8. Verify the deployment:
   ```bash
   curl https://delhitransport.demo.agrayianailabs.com/api/dashboard/executive-summary | grep -E "(revenue_collected|tax_defaulter_count|accidents)"
   ```

## Verification Checklist

After deployment, verify:

- [ ] Backend health check: `curl https://delhitransport.demo.agrayianailabs.com/health`
- [ ] API returns `revenue_collected` field
- [ ] API returns `tax_defaulter_count` field
- [ ] API returns `accidents` field
- [ ] Dashboard displays "Revenue Collected" card
- [ ] Dashboard displays "Tax Defaulter Count" card
- [ ] Dashboard displays "Accident" card

## Expected API Response

After successful deployment, the `/api/dashboard/executive-summary` endpoint should return:

```json
{
    "total_registrations": 9536,
    "monthly_growth_percent": 0.0,
    "median_vehicle_value": 157097.0,
    "avg_registration_delay": 23.1,
    "active_registrations_percent": 96.2,
    "compliance_risk_count": 408,
    "total_tickets": 275,
    "ticket_closure_rate": 60.0,
    "avg_resolution_time": 32.8,
    "stale_ticket_percent": 100.0,
    "data_quality_score": 99.0,
    "revenue_collected": 2780010483.45,
    "tax_defaulter_count": 3336.0,
    "accidents": 11330.0,
    "ai_insights": [...]
}
```

## Troubleshooting

If the fields are still missing after deployment:

1. Check backend logs:
   ```bash
   docker compose logs backend | tail -50
   ```

2. Verify the backend code version:
   ```bash
   docker compose exec backend grep -A 3 "revenue_collected.*round" /app/backend/server.py
   ```

3. Restart the backend container:
   ```bash
   docker compose restart backend
   ```

4. Clear browser cache and hard refresh the dashboard page

## Support

If issues persist, check:
- Docker container status: `docker compose ps`
- Backend logs: `docker compose logs -f backend`
- Frontend logs: `docker compose logs -f frontend`

