# Error Troubleshooting Guide

## Errors Reported

1. **`ERR_BLOCKED_BY_CLIENT`** - Browser extension blocking (ad blocker, privacy tool)
2. **WebSocket connection failures** - React DevTools trying to connect (non-critical)
3. **500 Internal Server Error** on `/api/dashboard/heatmap-data` and `/api/dashboard/executive-summary`

## Status

✅ **Backend endpoints are working correctly** when tested directly:
- `/api/dashboard/heatmap-data` - Returns data successfully
- `/api/dashboard/executive-summary` - Returns data successfully

## Fixes Applied

### 1. Enhanced Error Handling
- Added better error logging with tracebacks
- Added try-catch around field value extraction
- Added type conversion safety checks

### 2. Improved Data Extraction
- Wrapped field extraction in try-catch to handle edge cases
- Added float conversion with fallback to 0
- Added warning logs for problematic records

## Troubleshooting Steps

### Step 1: Clear Browser Cache
1. Open browser DevTools (F12)
2. Right-click on refresh button
3. Select "Empty Cache and Hard Reload"

### Step 2: Check Browser Extensions
1. Disable ad blockers temporarily
2. Disable privacy extensions
3. Try in incognito/private mode

### Step 3: Verify Backend is Running
```bash
curl http://localhost:8000/api/health
```

### Step 4: Verify Frontend Proxy
Check `frontend/package.json`:
```json
"proxy": "http://127.0.0.1:8000"
```

### Step 5: Restart Services
```bash
# Kill existing processes
lsof -ti:8000 | xargs kill -9
lsof -ti:3000 | xargs kill -9

# Restart backend
cd backend && python3 -m uvicorn server:app --host 0.0.0.0 --port 8000 --reload

# Restart frontend (in new terminal)
cd frontend && npm start
```

### Step 6: Check Browser Console
1. Open DevTools (F12)
2. Go to Network tab
3. Filter by "Failed" or "500"
4. Click on failed request
5. Check "Response" tab for error details

## Expected Behavior

After fixes:
- ✅ Map should load with state-wise data
- ✅ Heat map should display correctly
- ✅ No 500 errors in console
- ✅ Data should be visible on the map

## If Issues Persist

1. **Check backend logs** for detailed error messages
2. **Check MongoDB connection** - Ensure MongoDB is running
3. **Verify data exists** - Check if `kpi_state_general` collection has data
4. **Test endpoints directly**:
   ```bash
   curl http://localhost:8000/api/dashboard/heatmap-data
   curl http://localhost:8000/api/dashboard/executive-summary
   ```

## Notes

- WebSocket errors are from React DevTools - can be ignored
- `ERR_BLOCKED_BY_CLIENT` is from browser extensions - disable temporarily
- 500 errors should be resolved with the enhanced error handling

