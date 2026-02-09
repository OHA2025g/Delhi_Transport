"""
Helper utility functions.
"""
import math
from typing import Optional, Any, Dict
from datetime import datetime
from dateutil import parser as date_parser

def clean_nan_values(obj: Any) -> Any:
    """Replace NaN and Inf values with None for JSON serialization"""
    if isinstance(obj, dict):
        return {k: clean_nan_values(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [clean_nan_values(item) for item in obj]
    elif isinstance(obj, float):
        if math.isnan(obj) or math.isinf(obj):
            return None
        return obj
    return obj

def _as_float(v: Any) -> Optional[float]:
    """Convert value to float, handling None, NaN, and invalid values."""
    try:
        if v is None:
            return None
        if isinstance(v, bool):
            return float(int(v))
        if isinstance(v, (int, float)):
            if isinstance(v, float) and (math.isnan(v) or math.isinf(v)):
                return None
            return float(v)
        s = str(v).strip()
        if not s or s.lower() in {"nan", "none"}:
            return None
        return float(s)
    except Exception:
        return None

def _safe_parse_date(date_str: Optional[str]) -> Optional[datetime]:
    """Safely parse a date string."""
    if not date_str:
        return None
    try:
        return date_parser.parse(str(date_str))
    except Exception:
        return None

def _median(values: list[float]) -> float:
    """Calculate median of a list of values."""
    if not values:
        return 0.0
    sorted_vals = sorted([v for v in values if v is not None])
    if not sorted_vals:
        return 0.0
    n = len(sorted_vals)
    if n % 2 == 0:
        return (sorted_vals[n // 2 - 1] + sorted_vals[n // 2]) / 2.0
    return sorted_vals[n // 2]

def _pct(numerator: float, denominator: float, default: float = 0.0) -> float:
    """Calculate percentage, handling division by zero."""
    if denominator == 0:
        return default
    return (numerator / denominator) * 100.0

def _get_field_value(record: Dict[str, Any], field_name: str) -> Optional[float]:
    """
    Robustly extract a numeric value from a record by trying multiple field name variations.
    
    Args:
        record: The MongoDB record/dictionary
        field_name: The base field name to search for
        
    Returns:
        The numeric value if found, None otherwise
    """
    # Try exact match first
    if field_name in record:
        val = _as_float(record[field_name])
        if val is not None:
            return val
    
    # Try variations: with trailing space, without spaces, with underscore
    variations = [
        f"{field_name} ",
        field_name.replace(" ", ""),
        field_name.replace(" ", "_"),
        field_name.replace("-", " "),
        field_name.replace("-", "_"),
    ]
    
    for variant in variations:
        if variant in record:
            val = _as_float(record[variant])
            if val is not None:
                return val
    
    return None

