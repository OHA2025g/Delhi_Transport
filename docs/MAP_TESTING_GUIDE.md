# India Map Orientation - Testing & Validation Guide

## Current Configuration

**File**: `frontend/src/components/IndiaHeatMap.jsx`  
**Projection**: Default (geoEqualEarth)  
**Center**: `[78.5, 22]`  
**Rotation**: `[0, 0, 0]`  
**Scale**: `1000`

## Testing Steps

### 1. Access the Map
- Open: `http://localhost:3000`
- Navigate to the "India State-wise Analytics" section on the landing page

### 2. Visual Inspection Checklist

Compare the rendered map with the orange reference map:

- [ ] **North Alignment**: North should point straight up (no tilt)
- [ ] **Coastline Alignment**: Western and eastern coastlines should be vertical
- [ ] **State Boundaries**: All state boundaries should appear straight (not rotated)
- [ ] **Overall Shape**: Map shape should match the orange reference exactly
- [ ] **No Rotation**: Map should not appear tilted or rotated

### 3. Screenshot Comparison

1. Take a screenshot of the current map
2. Place it side-by-side with the orange reference map
3. Compare:
   - Orientation alignment
   - Boundary angles
   - Coastline positions
   - Overall visual match

## Alternative Configurations to Test

If the current configuration doesn't match, try these alternatives by editing `IndiaHeatMap.jsx`:

### Configuration 1: geoMercator
```javascript
<ComposableMap
  projection="geoMercator"
  projectionConfig={{
    scale: 1000,
    center: [78.9629, 20.5937],
    rotate: [0, 0, 0],
  }}
  ...
>
```

### Configuration 2: geoAlbers (Conic)
```javascript
<ComposableMap
  projection="geoAlbers"
  projectionConfig={{
    scale: 1000,
    center: [78.5, 22],
    rotate: [0, 0, 0],
    parallels: [8, 37],
  }}
  ...
>
```

### Configuration 3: Default with Adjusted Center
```javascript
<ComposableMap
  projectionConfig={{
    scale: 1000,
    center: [78.9629, 20.5937],
    rotate: [0, 0, 0],
  }}
  ...
>
```

### Configuration 4: Default with Different Scale
```javascript
<ComposableMap
  projectionConfig={{
    scale: 1200,
    center: [78.5, 22],
    rotate: [0, 0, 0],
  }}
  ...
>
```

## How to Test Each Configuration

1. Edit `frontend/src/components/IndiaHeatMap.jsx`
2. Replace the `ComposableMap` configuration with one of the alternatives above
3. Save the file (auto-reload should occur)
4. Refresh the browser
5. Take a screenshot
6. Compare with the orange reference map
7. Document which configuration matches best

## Expected Result

The map should:
- ✅ Display front-facing (no tilt)
- ✅ Have north pointing upward
- ✅ Match the orange reference map orientation exactly
- ✅ Show all states with proper boundaries
- ✅ Be clickable and interactive

## Reporting Results

After testing, report:
1. Which configuration (if any) matches the orange reference
2. Screenshot comparison results
3. Any remaining orientation issues
4. Visual differences observed

## Notes

- The GeoJSON data is in WGS84 (EPSG:4326) format - standard and correct
- All configurations use `rotate: [0, 0, 0]` to prevent rotation
- Center coordinates are India's approximate geographic center
- No CSS transforms or hacks are used - all fixes are at the projection level

