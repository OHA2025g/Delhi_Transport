# Troubleshooting Guide - Data Not Loading

## Quick Diagnosis

1. **Check Backend Server Status**
   ```bash
   curl http://localhost:8001/health
   # or
   curl http://localhost:8001/api/health
   ```

2. **Check MongoDB Connection**
   - Ensure MongoDB is running: `mongod` or `brew services start mongodb-community`
   - Test connection: `mongosh mongodb://localhost:27017`

3. **Check Frontend Connection**
   - Open browser console (F12)
   - Look for API errors
   - Check Network tab for failed requests

## Common Issues & Solutions

### Issue 1: MongoDB Not Running
**Symptoms:** Health check shows `"mongodb": {"status": "disconnected"}`

**Solution:**
```bash
# Start MongoDB (macOS)
brew services start mongodb-community

# Or start manually
mongod --dbpath /usr/local/var/mongodb
```

### Issue 2: Backend Server Not Running
**Symptoms:** Frontend shows "Failed to fetch" errors

**Solution:**
```bash
cd backend
python3 -m uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

### Issue 3: Data Files Missing
**Symptoms:** Collections exist but have 0 records

**Solution:**
- Ensure these files exist in project root or `data/` folder:
  - `Vahan1.xlsx`
  - `Tickets.xlsx`
  - `transport_extra_kpi_mock_data_FY2025_26.xlsx`

### Issue 4: Environment Variables Not Set
**Symptoms:** Using default MongoDB URL but connection fails

**Solution:**
Create `backend/.env` file:
```env
MONGO_URL=mongodb://localhost:27017
DB_NAME=citizen_assistance
CORS_ORIGINS=*
```

### Issue 5: CORS Issues
**Symptoms:** Browser console shows CORS errors

**Solution:**
- Check `CORS_ORIGINS` in backend `.env`
- Ensure frontend proxy is configured in `frontend/package.json`: `"proxy": "http://127.0.0.1:8001"`

## Health Check Endpoint

The backend now includes a health check endpoint:
- `GET /health` - Root health check
- `GET /api/health` - API health check

Response includes:
- Server status
- MongoDB connection status
- Collection data counts
- Any errors

## Restart Instructions

1. **Stop all processes:**
   ```bash
   # Kill backend (if running)
   pkill -f "uvicorn server:app"
   
   # Kill frontend (if running)
   pkill -f "react-scripts"
   ```

2. **Start MongoDB:**
   ```bash
   brew services start mongodb-community
   ```

3. **Start Backend:**
   ```bash
   cd backend
   python3 -m uvicorn server:app --host 0.0.0.0 --port 8001 --reload
   ```

4. **Start Frontend:**
   ```bash
   cd frontend
   npm start
   ```

5. **Verify:**
   - Backend: http://localhost:8001/health
   - Frontend: http://localhost:3000

## Debugging Steps

1. Check backend logs for MongoDB connection errors
2. Check browser console for API errors
3. Use health check endpoint to verify database status
4. Verify data files exist and are readable
5. Check network tab in browser DevTools for failed requests

