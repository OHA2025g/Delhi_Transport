# Compliance Alerts - Detailed Explanation

## Overview

**Compliance Alerts** in the Vehicle Analytics dashboard represents the count of vehicle registrations that require attention due to compliance issues. This metric helps identify vehicles that are either **expiring soon** or **already expired** in terms of their registration validity.

---

## What Does "Compliance Alerts" Mean?

The Compliance Alerts KPI card displays the number of vehicles that have compliance issues related to:

1. **Registration Expiry** (`regn_upto` field)
   - Registrations that are **expiring within 30 days**
   - Registrations that are **already expired** (past their `regn_upto` date)

2. **Fitness Expiry** (`fit_upto` field)
   - Vehicles with fitness certificates **expiring within 30 days**
   - Vehicles that are **unfit** (fitness certificate expired)

---

## Current Implementation

### KPI Card Display
- **Location**: Vehicle Analytics Dashboard → Compliance Alerts Card
- **Current Value**: The card currently shows a **random number between 50-200** (mock data)
- **Label**: "Expiring soon" (shown below the number)
- **Icon**: Warning triangle in teal color

### Detailed Drilldown
When you click on the Compliance Alerts card, it opens a modal that shows:

1. **Reference Date**: The date used for calculating expiry (uses `op_dt` from records or current date)

2. **Registration Expiry Breakdown**:
   - **Expired Registrations**: Count of vehicles where `regn_upto < reference_date`
   - **Expiring Soon (≤30 days)**: Count where `regn_upto` is within 30 days of reference date
   - **Expiring Soon (≤60 days)**: Count where `regn_upto` is within 60 days
   - **Expiring Soon (≤90 days)**: Count where `regn_upto` is within 90 days
   - **Bucket Distribution**: Visual breakdown by time buckets (Expired, 0-30, 31-60, 61-90, >90 days)

3. **Fitness Expiry Breakdown**:
   - **Unfit Vehicles**: Count of vehicles where `fit_upto < reference_date`
   - **Fitness Expiry Risk (≤30/60/90 days)**: Similar breakdown as registrations
   - **Bucket Distribution**: Visual breakdown by time buckets

4. **Missing Dates**: Count of records where `regn_upto` or `fit_upto` fields are missing

---

## Data Source

### Database Collection
- **Collection**: `vahan_data`
- **Database**: `citizen_assistance`

### Key Fields Used
- `regn_upto`: Registration validity expiry date
- `fit_upto`: Fitness certificate expiry date
- `op_dt`: Operation date (used as reference date if available)

### API Endpoint
- **Endpoint**: `GET /api/dashboard/vahan/compliance-validity`
- **Parameters**: 
  - `state_cd` (optional): Filter by state code
  - `c_district` (optional): Filter by district
  - `city` (optional): Filter by city

---

## Calculation Logic

The compliance calculation works as follows:

1. **Reference Date Determination**:
   ```python
   # Uses per-record op_dt if available, otherwise uses current date
   reference_date = record.op_dt if exists else datetime.now()
   ```

2. **Expiry Status Calculation**:
   ```python
   days_until_expiry = (expiry_date - reference_date).days
   
   if days_until_expiry < 0:
       status = "Expired"
   elif days_until_expiry <= 30:
       status = "Expiring Soon (≤30 days)"
   elif days_until_expiry <= 60:
       status = "Expiring Soon (≤60 days)"
   elif days_until_expiry <= 90:
       status = "Expiring Soon (≤90 days)"
   else:
       status = "Valid (>90 days)"
   ```

3. **Compliance Alerts Count**:
   - Currently: **Random number (50-200)** - This is mock data
   - **Should be**: Sum of vehicles with `days_until_expiry <= 30` OR `days_until_expiry < 0`

---

## Business Purpose

Compliance Alerts helps transport department officials:

1. **Proactive Management**: Identify vehicles that need renewal attention before they expire
2. **Enforcement Planning**: Prioritize enforcement actions on expired registrations
3. **Resource Allocation**: Allocate RTO inspection capacity for fitness renewals
4. **Compliance Campaigns**: Run targeted campaigns for expiring/expired segments
5. **Risk Assessment**: Monitor compliance health across states/districts/cities

---

## Recommendations for Action

Based on the compliance data, the system suggests:

1. **Automate Reminders**: Send automated SMS/email reminders for registrations expiring within 30/60/90 days
2. **Enforcement Priority**: Focus enforcement on expired + unfit vehicle segments
3. **Daily Lists**: Generate daily expiring/expired lists per RTO and assign follow-up owners
4. **Fitness Renewal Drives**: Run weekly fitness renewal drives for high-risk buckets
5. **Capacity Planning**: Coordinate with RTO inspection capacity for handling renewals

---

## Current Limitation

⚠️ **Note**: The Compliance Alerts number shown on the KPI card is currently using **mock/random data** (random number between 50-200). 

The detailed drilldown modal shows **real data** from the database, but the card itself needs to be updated to calculate the actual count from the compliance-validity endpoint.

### Recommended Fix

The `compliance_alerts` value in `/api/dashboard/vahan/kpis` should be calculated as:

```python
# Instead of: compliance_alerts = random.randint(50, 200)
# Should be:
compliance_data = await get_vahan_compliance_validity(state_cd, c_district, city)
compliance_alerts = (
    compliance_data["expired_registrations"] + 
    compliance_data["registrations_expiring_soon"]["le_30"] +
    compliance_data["unfit_vehicles"] +
    compliance_data["fitness_expiry_risk"]["le_30"]
)
```

---

## Related Features

- **Compliance & Validity Drilldown**: Click the Compliance Alerts card to see detailed breakdown
- **Geo Filtering**: Compliance alerts respect state/district/city filters
- **Insights & Recommendations**: AI-generated insights based on compliance data
- **Action Items**: System suggests specific actions based on compliance metrics

---

**Last Updated**: 2026-02-18  
**Status**: Card shows mock data; drilldown shows real data  
**Priority**: Medium - Should update card to show real compliance count

