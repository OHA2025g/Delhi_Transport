# Build Verification - New KPI Features

## Backend Verification

After building the backend image, verify the new KPI fields are included:

```bash
# Build backend
docker build -f backend/Dockerfile -t delhi-backend-test .

# Run container
docker run -d --name test-backend -p 8004:8000 \
  -e MONGO_URL="mongodb://mongo:1146976700ffa55c4d27@31.97.207.166:27018/?tls=false" \
  delhi-backend-test

# Wait for startup
sleep 10

# Verify KPI fields
curl http://localhost:8004/api/dashboard/executive-summary | \
  python3 -m json.tool | grep -E "(revenue_collected|tax_defaulter_count|accidents)"

# Expected output:
# "revenue_collected": 2780010483.45,
# "tax_defaulter_count": 3336.0,
# "accidents": 11330.0,

# Cleanup
docker stop test-backend && docker rm test-backend
```

## Frontend Verification

After building the frontend image, verify the new KPI cards are included:

```bash
# Build frontend
docker build -f frontend/Dockerfile -t delhi-frontend-test ./frontend

# Run container
docker run -d --name test-frontend -p 3004:80 delhi-frontend-test

# Check if cards are in the build
docker exec test-frontend grep -r "Revenue Collected" /usr/share/nginx/html/static/js/
docker exec test-frontend grep -r "Tax Defaulter Count" /usr/share/nginx/html/static/js/
docker exec test-frontend grep -r "title.*Accident" /usr/share/nginx/html/static/js/

# Cleanup
docker stop test-frontend && docker rm test-frontend
```

## Full Stack Verification

```bash
# Build and start all services
docker compose -f docker-compose.production.yml build
docker compose -f docker-compose.production.yml up -d

# Wait for services
sleep 15

# Verify backend
curl http://localhost:8003/api/dashboard/executive-summary | \
  python3 -m json.tool | grep -E "(revenue_collected|tax_defaulter_count|accidents)"

# Verify frontend
curl http://localhost:3003/ | grep -q "Revenue Collected" && echo "✅ Frontend includes new cards"

# Check container status
docker compose -f docker-compose.production.yml ps
```

## KPI Features Checklist

- [ ] Backend includes `revenue_collected` field in API response
- [ ] Backend includes `tax_defaulter_count` field in API response
- [ ] Backend includes `accidents` field in API response
- [ ] Frontend displays "Revenue Collected" card
- [ ] Frontend displays "Tax Defaulter Count" card
- [ ] Frontend displays "Accident" card
- [ ] All cards show correct data from API
- [ ] Dashboard loads without errors
