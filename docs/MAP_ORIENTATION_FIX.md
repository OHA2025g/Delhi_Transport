# India Map Orientation Fix - Technical Documentation

## Root Cause Analysis

### Issue Identified
The India map was displaying with a visible tilt/rotation, not matching the reference orange map orientation.

### Root Causes
1. **Default Projection**: React Simple Maps uses `geoEqualEarth` as the default projection, which may introduce slight distortions or rotations for India's geographic location.

2. **Center Coordinates**: The previous center coordinates `[78.5, 22]` were approximate. India's geographic center is more precisely `[78.9629, 20.5937]`.

3. **Projection Type**: For a front-facing, north-aligned view of India, `geoMercator` (Mercator projection) is more appropriate as it:
   - Provides a standard, familiar orientation
   - Renders equatorial regions (like India) with minimal distortion
   - Aligns with common map visualization standards

## Solution Implemented

### Changes Made to `frontend/src/components/IndiaHeatMap.jsx`

**Before:**
```javascript
<ComposableMap
  projectionConfig={{
    scale: 1000,
    center: [78.5, 22],
    rotate: [0, 0, 0],
  }}
  ...
>
```

**After:**
```javascript
<ComposableMap
  projection="geoMercator"
  projectionConfig={{
    scale: 1000,
    center: [78.9629, 20.5937],
    rotate: [0, 0, 0],
  }}
  style={{ 
    ...
    transform: "none"
  }}
  ...
>
```

### Key Changes:
1. **Explicit Projection**: Set `projection="geoMercator"` to use Mercator projection
2. **Precise Center**: Updated center to `[78.9629, 20.5937]` (India's geographic center)
3. **No Rotation**: Maintained `rotate: [0, 0, 0]` to ensure no tilt
4. **CSS Transform**: Added `transform: "none"` to prevent any CSS-based rotations

## Testing Instructions

### Visual Validation Steps

1. **Access the Map**:
   - Navigate to: `http://localhost:3000`
   - Scroll to the "India State-wise Analytics" section

2. **Visual Comparison Checklist**:
   - [ ] Map is front-facing (no tilt)
   - [ ] North is pointing upward
   - [ ] Coastlines align horizontally
   - [ ] State boundaries appear straight (not rotated)
   - [ ] Overall orientation matches the orange reference map

3. **Screenshot Comparison**:
   - Take a screenshot of the rendered map
   - Compare side-by-side with the orange reference map
   - Verify:
     - Same north alignment
     - Same coastline angles
     - Same boundary orientations
     - No visible rotation or tilt

### Expected Result
The map should render with:
- ✅ North pointing straight up
- ✅ No visible tilt or rotation
- ✅ States properly aligned
- ✅ Visual match with orange reference map

## Alternative Configurations (If Needed)

If `geoMercator` doesn't provide the exact match, try these alternatives:

### Option 1: geoAlbers (Conic Projection)
```javascript
projection="geoAlbers"
projectionConfig={{
  scale: 1000,
  center: [78.9629, 20.5937],
  rotate: [0, 0, 0],
  parallels: [8, 37], // Standard parallels for India
}}
```

### Option 2: geoEqualEarth (Default, with adjustments)
```javascript
projection="geoEqualEarth"
projectionConfig={{
  scale: 1000,
  center: [78.9629, 20.5937],
  rotate: [0, 0, 0],
}}
```

## Technical Details

### Projection Types Explained
- **geoMercator**: Standard Mercator projection, good for equatorial regions
- **geoAlbers**: Conic projection, preserves area relationships
- **geoEqualEarth**: Equal-area projection, default in react-simple-maps

### Coordinate System
- **CRS**: WGS84 (EPSG:4326) - standard for GeoJSON
- **Center**: [Longitude, Latitude] format
- **India Center**: [78.9629, 20.5937] (New Delhi area)

## Next Steps

1. **Test the current implementation** (geoMercator)
2. **Take screenshot** and compare with reference
3. **If not matching**, try alternative projections listed above
4. **Iterate** until visual match is achieved

## Notes

- No CSS/SVG rotation hacks were used - fix is at the projection level
- The solution addresses the root cause (projection configuration), not symptoms
- All changes are in the projection configuration, ensuring data accuracy

