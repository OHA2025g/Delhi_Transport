# KPI Data Sources - Database Collections

This document details which database collections and fields are used for the three KPI cards on the Executive Dashboard.

## Database Name
**Database:** `citizen_assistance`

---

## 1. Revenue Collected

### Collection
- **Collection Name:** `kpi_state_general`

### Field Name
- **Primary Field:** `"Revenue - Total"`
- **Alternative Field Names (handled by code):**
  - `"Revenue - Total "` (with trailing space)
  - `"RevenueTotal"`
  - `"Revenue_Total"`

### Calculation
- Sums all `"Revenue - Total"` values from records matching the **latest month** in the collection
- Uses the latest month found in `kpi_state_general` collection
- Aggregates across all states for that month

### Code Location
- **File:** `backend/server.py`
- **Lines:** 4543-4558
- **Function:** `get_executive_summary()`

### Sample Data
```json
{
  "Revenue - Total": 270246246.97,
  "Revenue - Taxes": 196343352.75,
  "Revenue - Fees": 49251286.59,
  "Revenue - Penalties": 24651607.63
}
```

---

## 2. Tax Defaulter Count

### Collection
- **Collection Name:** `kpi_rto_performance`

### Field Name
- **Primary Field:** `"Tax Defaulter - Count"`
- **Note:** Exact field name (with dash, no trailing space)

### Calculation
- Sums all `"Tax Defaulter - Count"` values from records matching the **latest month** in the collection
- Uses the latest month found in `kpi_rto_performance` collection (may differ from `kpi_state_general`)
- Aggregates across all RTOs for that month

### Code Location
- **File:** `backend/server.py`
- **Lines:** 4560-4577
- **Function:** `get_executive_summary()`

### Sample Data
```json
{
  "Tax Defaulter - Count": 19,
  "Tax Defaulter - Amount": 275997.27
}
```

---

## 3. Accidents

### Collection
- **Collection Name:** `kpi_state_general`

### Field Name
- **Primary Field:** `"Road Accidents"`
- **Alternative Field Names (handled by code):**
  - `"Road Accidents "` (with trailing space)
  - `"RoadAccidents"`
  - `"Road_Accidents"`

### Calculation
- Sums all `"Road Accidents"` values from records matching the **latest month** in the collection
- Uses the latest month found in `kpi_state_general` collection
- Aggregates across all states for that month

### Code Location
- **File:** `backend/server.py`
- **Lines:** 4579-4594
- **Function:** `get_executive_summary()`

### Sample Data
```json
{
  "Road Accidents": 633,
  "Road Fatalities": 93
}
```

---

## Summary Table

| KPI Card | Database Collection | Field Name | Month Source |
|----------|---------------------|------------|--------------|
| **Revenue Collected** | `kpi_state_general` | `"Revenue - Total"` | Latest month from `kpi_state_general` |
| **Tax Defaulter Count** | `kpi_rto_performance` | `"Tax Defaulter - Count"` | Latest month from `kpi_rto_performance` |
| **Accidents** | `kpi_state_general` | `"Road Accidents"` | Latest month from `kpi_state_general` |

---

## Data Flow

1. **API Endpoint:** `GET /api/dashboard/executive-summary`
2. **Function:** `get_executive_summary()` in `backend/server.py`
3. **Process:**
   - Finds latest month in respective collections
   - Queries all records for that month
   - Sums the relevant field values
   - Returns aggregated totals

## Notes

- **Month Selection:** Each collection may have different latest months, so the code finds the latest month separately for each collection
- **Field Name Variations:** The code handles multiple field name variations using the `_get_field_value()` helper function
- **Error Handling:** All calculations are wrapped in try-except blocks with logging
- **Data Aggregation:** Values are summed across all states/RTOs for the latest month

---

**Last Updated:** 2026-02-18  
**Database:** `citizen_assistance`  
**Collections Used:** `kpi_state_general`, `kpi_rto_performance`

