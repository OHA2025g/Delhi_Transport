# KPI Calculations Documentation

This document provides a comprehensive list of all KPIs that are derived using calculations across all dashboards in the system.

## Table of Contents
- [Executive Dashboard](#executive-dashboard)
- [Vehicle Analytics](#vehicle-analytics)
- [Fleet Analytics](#fleet-analytics)
- [Advanced KPI Dashboard](#advanced-kpi-dashboard)

---

## Executive Dashboard

### Main Tab

| KPI | Calculation | Description |
|-----|-------------|-------------|
| **Total Registrations** | `SUM("Vehicle Registration" field) FROM kpi_state_general WHERE Month = latest_month` | Total number of vehicle registrations aggregated from the latest month's KPI data. Falls back to `COUNT(*) FROM vahan_data` if KPI data is unavailable. |
| **Revenue Collected** | `SUM("Revenue - Total" field) FROM kpi_state_general WHERE Month = latest_month` | Total revenue collected across all states for the latest month. Handles field name variations: "Revenue - Total", "Revenue - Total ", "RevenueTotal", "Revenue_Total". |
| **Avg Registration Delay** | `AVG(ABS(regn_dt - purchase_dt)) WHERE regn_dt IS NOT NULL AND purchase_dt IS NOT NULL` | Average number of days between vehicle purchase date and registration date. Calculated from `vahan_data` collection, limited to 10,000 records for performance. |
| **Tax Defaulter Count** | `SUM("Tax Defaulter - Count" field) FROM kpi_rto_performance WHERE Month = latest_month` | Total count of tax defaulters aggregated from RTO performance data for the latest month. |
| **Total Tickets** | `COUNT(*) FROM tickets_data` | Total number of tickets in the system across all statuses. |
| **Accidents** | `SUM("Road Accidents" field) FROM kpi_state_general WHERE Month = latest_month` | Total number of road accidents reported for the latest month. Handles field name variations: "Road Accidents", "Road Accidents ", "RoadAccidents", "Road_Accidents". |
| **Avg Resolution Time** | `AVG(Closed - Created) WHERE Status = 'Closed' AND Created IS NOT NULL AND Closed IS NOT NULL` | Average number of days taken to resolve closed tickets. Calculated from `tickets_data` collection. |
| **Data Quality Score** | `(SUM(completeness_per_field) / total_fields) * 100` | Percentage score based on completeness of key fields: `state_cd`, `off_cd`, `regn_no`, `regn_dt`, `fuel`, `vch_catg`, `vh_class`, `norms`, `body_type`. Each field's completeness is calculated as: `(non-null_count / total_count) * 100`. Final score is the average of all field completeness percentages. |

### Additional Calculated Metrics (Not displayed as KPI cards)

| Metric | Calculation | Description |
|--------|-------------|-------------|
| **Monthly Growth Percent** | `((current_month_count - previous_month_count) / previous_month_count) * 100` | Month-over-month growth percentage calculated from `regn_dt` field grouped by YYYY-MM. |
| **Median Vehicle Value** | `MEDIAN(sale_amt) WHERE sale_amt > 0 AND sale_amt IS NOT NULL` | Median value of vehicles from `sale_amt` field in `vahan_data`. Filters out invalid values (NaN, Inf, <= 0). |
| **Active Registrations Percent** | `(active_count / total_registrations) * 100` | Percentage of registrations that are still active (not expired). Active = `regn_upto >= current_date`. |
| **Compliance Risk Count** | `COUNT(*) WHERE regn_upto < current_date OR regn_upto <= current_date + 30 days` | Count of registrations that are expired or expiring within 30 days. |
| **Ticket Closure Rate** | `(closed_tickets / total_tickets) * 100` | Percentage of tickets that have been closed. Closed tickets = `Status = 'Closed'`. |
| **Stale Ticket Percent** | `(stale_tickets / open_tickets) * 100` | Percentage of open tickets that are older than 30 days. Stale = `Status != 'Closed' AND Created < current_date - 30 days`. |

---

## Vehicle Analytics

### Main Tab

| KPI | Calculation | Description |
|-----|-------------|-------------|
| **Total Registrations** | `COUNT(*) FROM vahan_data WHERE [geo_filters]` | Total count of vehicle registration records in `vahan_data` collection, filtered by state/district/city if specified. |
| **Unique Vehicles** | `COUNT(DISTINCT regn_no) FROM vahan_data WHERE [geo_filters]` | Count of unique vehicle registration numbers, indicating the number of distinct vehicles registered. |
| **Avg Vehicle Value** | `AVG(sale_amt) WHERE sale_amt > 0 AND sale_amt IS NOT NULL` | Average sale amount of vehicles. Filters out invalid values (NaN, Inf, <= 0). |
| **Median Vehicle Value** | `MEDIAN(sale_amt) WHERE sale_amt > 0 AND sale_amt IS NOT NULL` | Median sale amount of vehicles. Uses proper median calculation that handles even/odd length arrays correctly. |
| **Compliance Alerts** | `Random(50, 200)` (Currently mock data) | **Note:** Currently returns random value. Real calculation should be: `COUNT(*) WHERE (regn_upto < current_date OR regn_upto <= current_date + 30) OR (fit_upto < current_date OR fit_upto <= current_date + 30)`. |
| **Data Quality Score** | `Random(85, 98)` (Currently mock data) | **Note:** Currently returns random value. Should use same calculation as Executive Dashboard Data Quality Score. |

### Registration Delay Statistics (Drilldown)

| Metric | Calculation | Description |
|--------|-------------|-------------|
| **Avg Delay Days** | `AVG(regn_dt - purchase_dt) WHERE regn_dt IS NOT NULL AND purchase_dt IS NOT NULL AND (regn_dt - purchase_dt) >= 0` | Average delay in days between purchase and registration. |
| **Median Delay Days** | `MEDIAN(regn_dt - purchase_dt) WHERE conditions same as above` | Median delay in days. |
| **P90 Delay Days** | `PERCENTILE(90, regn_dt - purchase_dt) WHERE conditions same as above` | 90th percentile delay, indicating that 90% of registrations are completed within this many days. |
| **Delayed Percentage** | `(COUNT(*) WHERE delay > 30 days) / total_count * 100` | Percentage of registrations that took more than 30 days to complete. |
| **Delay Buckets** | `COUNT(*) GROUP BY delay_bucket WHERE buckets: 0-7 days, 8-30 days, 31-90 days, >90 days` | Distribution of registration delays across predefined time buckets. |

---

## Fleet Analytics

### Compliance Tab

| KPI | Calculation | Description |
|-----|-------------|-------------|
| **Vehicles Owned** | `SUM("Vehicles Owned" field) FROM kpi_fleet_vehicles WHERE Month = selected_month` | Total number of vehicles owned in the fleet for the selected month. |
| **Tax Due Count** | `SUM("Tax Due - Count" field) FROM kpi_fleet_vehicles WHERE Month = selected_month` | Count of vehicles with tax due. |
| **Insurance Due Count** | `SUM("Insurance Due - Count" field) FROM kpi_fleet_vehicles WHERE Month = selected_month` | Count of vehicles with insurance due. |
| **PUCC Due Count** | `SUM("PUCC Due - Count" field) FROM kpi_fleet_vehicles WHERE Month = selected_month` | Count of vehicles with Pollution Under Control Certificate (PUCC) due. |
| **Fitness Due Count** | `SUM("Fitness Due - Count" field) FROM kpi_fleet_vehicles WHERE Month = selected_month` | Count of vehicles with fitness certificate due. |

**Note:** Fleet Analytics KPIs are sourced from the `kpi_fleet_vehicles` collection and aggregated by month and state.

---

## Advanced KPI Dashboard

### Mobility Growth Tab

| KPI | Calculation | Description |
|-----|-------------|-------------|
| **Vehicle Registration Growth** | `((current_month - previous_month) / previous_month) * 100` | Month-over-month growth in vehicle registrations. |
| **Revenue Growth** | `((current_month_revenue - previous_month_revenue) / previous_month_revenue) * 100` | Month-over-month growth in revenue. |

**Note:** Advanced KPI Dashboard endpoints fetch data from various KPI collections (`kpi_state_general`, `kpi_state_service`, `kpi_state_policy`, `kpi_rto_general`, `kpi_rto_performance`, etc.) and perform aggregations based on the specific KPI type.

---

## Process Efficiency KPIs

### Available via `/dashboard/vahan/process-efficiency` endpoint

| Metric | Calculation | Description |
|--------|-------------|-------------|
| **Avg Delay Days** | `AVG(regn_dt - purchase_dt) WHERE regn_dt IS NOT NULL AND purchase_dt IS NOT NULL AND (regn_dt - purchase_dt) >= 0` | Average registration delay in days. |
| **Median Delay Days** | `MEDIAN(regn_dt - purchase_dt) WHERE conditions same as above` | Median registration delay. |
| **P95 Delay Days** | `PERCENTILE(95, regn_dt - purchase_dt) WHERE conditions same as above` | 95th percentile delay. |
| **Delayed Percent (GT 30)** | `(COUNT(*) WHERE delay > 30) / total_count * 100` | Percentage of registrations delayed more than 30 days. |
| **Delayed Percent (GT 60)** | `(COUNT(*) WHERE delay > 60) / total_count * 100` | Percentage of registrations delayed more than 60 days. |
| **Delayed Percent (GT 90)** | `(COUNT(*) WHERE delay > 90) / total_count * 100` | Percentage of registrations delayed more than 90 days. |
| **Invalid Date Sequence Count** | `COUNT(*) WHERE regn_dt < purchase_dt` | Count of records where registration date is before purchase date (data quality issue). |
| **Lag Buckets** | `COUNT(*) GROUP BY bucket: 0-30, 31-60, 61-90, >90 days` | Distribution of delays across time buckets. |

---

## Compliance & Validity KPIs

### Available via `/dashboard/vahan/compliance-validity` endpoint

| Metric | Calculation | Description |
|--------|-------------|-------------|
| **Expired Registrations** | `COUNT(*) WHERE regn_upto < reference_date` | Count of registrations that have expired. |
| **Registrations Expiring Soon (≤30 days)** | `COUNT(*) WHERE regn_upto >= reference_date AND regn_upto <= reference_date + 30` | Count of registrations expiring within 30 days. |
| **Registrations Expiring Soon (≤60 days)** | `COUNT(*) WHERE regn_upto >= reference_date AND regn_upto <= reference_date + 60` | Count of registrations expiring within 60 days. |
| **Registrations Expiring Soon (≤90 days)** | `COUNT(*) WHERE regn_upto >= reference_date AND regn_upto <= reference_date + 90` | Count of registrations expiring within 90 days. |
| **Unfit Vehicles** | `COUNT(*) WHERE fit_upto < reference_date` | Count of vehicles with expired fitness certificates. |
| **Fitness Expiry Risk (≤30 days)** | `COUNT(*) WHERE fit_upto >= reference_date AND fit_upto <= reference_date + 30` | Count of vehicles with fitness expiring within 30 days. |
| **Fitness Expiry Risk (≤60 days)** | `COUNT(*) WHERE fit_upto >= reference_date AND fit_upto <= reference_date + 60` | Count of vehicles with fitness expiring within 60 days. |
| **Fitness Expiry Risk (≤90 days)** | `COUNT(*) WHERE fit_upto >= reference_date AND fit_upto <= reference_date + 90` | Count of vehicles with fitness expiring within 90 days. |

**Note:** Reference date is either `op_dt` from the record (if available) or current date.

---

## Value & Revenue KPIs

### Available via `/dashboard/vahan/value/drilldown` endpoint

| Metric | Calculation | Description |
|--------|-------------|-------------|
| **Total Transaction Value** | `SUM(sale_amt) WHERE sale_amt > 0` | Total value of all vehicle transactions. |
| **Avg Vehicle Value** | `AVG(sale_amt) WHERE sale_amt > 0` | Average vehicle sale amount. |
| **Median Vehicle Value** | `MEDIAN(sale_amt) WHERE sale_amt > 0` | Median vehicle sale amount. |
| **P95 Vehicle Value** | `PERCENTILE(95, sale_amt) WHERE sale_amt > 0` | 95th percentile vehicle value. |
| **High Value Vehicle Count** | `COUNT(*) WHERE sale_amt >= P95(sale_amt)` | Count of vehicles with sale amount at or above the 95th percentile. |
| **Revenue Share by State** | `(SUM(sale_amt) BY state / total_transaction_value) * 100` | Percentage of total revenue contributed by each state. |
| **Revenue Share by Category** | `(SUM(sale_amt) BY vch_catg / total_transaction_value) * 100` | Percentage of total revenue contributed by each vehicle category. |

---

## OEM & Manufacturer KPIs

### Available via `/dashboard/vahan/oem/summary` endpoint

| Metric | Calculation | Description |
|--------|-------------|-------------|
| **Top Manufacturers by Volume** | `COUNT(regn_no) GROUP BY maker ORDER BY count DESC` | Count of registrations grouped by manufacturer code. |
| **OEM Revenue Share** | `(SUM(sale_amt) BY maker / market_total_value) * 100` | Percentage of total market revenue for each OEM. |
| **Avg Price per OEM** | `AVG(sale_amt) BY maker` | Average vehicle price for each manufacturer. |
| **Market Total Value** | `SUM(sale_amt) FROM vahan_data` | Total value of all vehicle transactions in the market. |

---

## Registration Drilldown KPIs

### Available via `/dashboard/vahan/registrations/drilldown` endpoint

| Metric | Calculation | Description |
|--------|-------------|-------------|
| **Unique Vehicles Registered** | `COUNT(DISTINCT regn_no)` | Count of unique registration numbers. |
| **Vehicle Category Mix** | `COUNT(*) GROUP BY vch_catg` | Distribution of registrations by vehicle category. |
| **Fuel Type Penetration** | `COUNT(*) GROUP BY fuel` | Distribution of registrations by fuel type. |
| **Emission Norm Compliance** | `COUNT(*) GROUP BY norms` | Distribution of registrations by emission norms. |
| **Monthly Registration Trend** | `COUNT(*) GROUP BY MONTH(regn_dt)` | Monthly count of registrations over time. |
| **YoY Registration Growth** | `((current_year - previous_year) / previous_year) * 100` | Year-over-year growth percentage. |
| **Peak Registration Month** | `MAX(COUNT(*) BY month)` | Month with the highest number of registrations. |
| **Registration Volatility Index** | `(STDDEV(monthly_counts) / AVG(monthly_counts))` | Coefficient of variation indicating volatility in monthly registrations. |

---

## Ticket KPIs

### Available via `/api/tickets/kpis` endpoint

| Metric | Calculation | Description |
|--------|-------------|-------------|
| **Total Tickets** | `COUNT(*) FROM tickets_data` | Total number of tickets in the system. |
| **Open Tickets** | `COUNT(*) WHERE Status IN ('New', 'In Progress')` | Count of tickets that are not yet closed. |
| **Closed Tickets** | `COUNT(*) WHERE Status = 'Closed'` | Count of tickets that have been closed. |
| **Closure Rate** | `(closed_tickets / total_tickets) * 100` | Percentage of tickets that have been closed. |
| **Avg Resolution Days** | `AVG(Closed - Created) WHERE Status = 'Closed'` | Average number of days to resolve tickets. Currently returns random value (mock). |
| **Tickets by Priority** | `COUNT(*) GROUP BY Priority` | Distribution of tickets by priority level. |
| **Tickets by Status** | `COUNT(*) GROUP BY Status` | Distribution of tickets by status. |
| **Sentiment Distribution** | `COUNT(*) GROUP BY sentiment` | Distribution of tickets by sentiment (positive, neutral, negative). |

---

## Common Calculation Functions

### Helper Functions Used in Calculations

1. **`_median(values)`**: Calculates median value from a list of numbers. Handles both even and odd length arrays correctly.

2. **`_quantile(values, q)`**: Calculates the q-th quantile (e.g., 0.95 for 95th percentile) from a sorted list of values.

3. **`_pct(numerator, denominator)`**: Calculates percentage: `(numerator / denominator) * 100` with safe division (returns 0 if denominator is 0).

4. **`_stddev_pop(values)`**: Calculates population standard deviation.

5. **`_safe_parse_date(date_value)`**: Safely parses date values from various formats (datetime objects, strings, etc.) and returns a datetime object or None.

6. **`_get_field_value(record, *field_names)`**: Extracts field value from a record, trying multiple possible field name variations (handles trailing spaces, underscores, etc.).

7. **`_aggregate_kpi_field(records, *field_names)`**: Aggregates a field value across multiple records, handling field name variations.

---

## Data Sources

### Collections Used

- **`vahan_data`**: Primary vehicle registration data
- **`kpi_state_general`**: State-level general KPIs
- **`kpi_state_service`**: State-level service delivery KPIs
- **`kpi_state_policy`**: State-level policy implementation KPIs
- **`kpi_rto_general`**: RTO-level general KPIs
- **`kpi_rto_performance`**: RTO-level performance KPIs
- **`kpi_fleet_vehicles`**: Fleet-level vehicle KPIs
- **`tickets_data`**: Ticket/grievance data

---

## Notes

1. **Performance Optimizations**: Many calculations limit the number of records processed (e.g., 10,000 records for delay calculations) to ensure acceptable response times.

2. **Data Quality Handling**: Calculations filter out invalid values (NaN, Inf, None, empty strings) before performing aggregations.

3. **Field Name Variations**: The system handles multiple field name variations (e.g., "Revenue - Total", "Revenue - Total ", "RevenueTotal", "Revenue_Total") to accommodate data inconsistencies.

4. **Geo Filtering**: Most KPIs support filtering by `state_cd`, `c_district`, and `city` parameters.

5. **Month Filtering**: Many KPIs can be filtered by month, defaulting to the latest available month if not specified.

6. **Mock Data**: Some KPIs (e.g., Compliance Alerts in Vehicle Analytics, Avg Resolution Days in Tickets) currently return mock/random data and should be replaced with real calculations.

---

## Last Updated

This document was last updated based on code analysis of the system as of the current date. For the most up-to-date calculations, refer to the source code in `backend/server.py`.

