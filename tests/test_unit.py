#!/usr/bin/env python3
"""
Unit Testing Script
Tests individual methods and functions in isolation
"""

import sys
import os
# Add parent directory and backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

from server import (
    _as_float, _get_field_value, _safe_parse_date, _median, _pct,
    clean_nan_values
)
from datetime import datetime
import math

class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    RESET = '\033[0m'

def test_unit():
    print(f"\n{Colors.BLUE}{'='*60}{Colors.RESET}")
    print(f"{Colors.BLUE}UNIT TESTING{Colors.RESET}")
    print(f"{Colors.BLUE}{'='*60}{Colors.RESET}\n")
    
    passed = 0
    failed = 0
    
    # Test 1: _as_float function
    print(f"{Colors.YELLOW}[1] Testing _as_float function{Colors.RESET}")
    test_cases = [
        (123, 123.0),
        ("123", 123.0),
        ("123.45", 123.45),
        (None, None),
        ("", None),
        ("invalid", None),
        (True, 1.0),
        (False, 0.0),
    ]
    
    for input_val, expected in test_cases:
        try:
            result = _as_float(input_val)
            if result == expected or (math.isnan(result) and math.isnan(expected)) if expected is not None else result == expected:
                print(f"{Colors.GREEN}✓ PASS{Colors.RESET}: _as_float({input_val}) = {result}")
                passed += 1
            else:
                print(f"{Colors.RED}✗ FAIL{Colors.RESET}: _as_float({input_val}) = {result}, expected {expected}")
                failed += 1
        except Exception as e:
            print(f"{Colors.RED}✗ FAIL{Colors.RESET}: _as_float({input_val}) raised {e}")
            failed += 1
    
    # Test 2: _get_field_value function
    print(f"\n{Colors.YELLOW}[2] Testing _get_field_value function{Colors.RESET}")
    test_record = {
        "Vehicle Registration": 1000,
        "Revenue - Total": 50000.5,
        "Missing Field": None,
    }
    
    test_cases = [
        (test_record, ["Vehicle Registration"], 1000.0),
        (test_record, ["Revenue - Total"], 50000.5),
        (test_record, ["Missing Field", "Vehicle Registration"], 1000.0),
        (test_record, ["Non Existent"], None),
    ]
    
    for record, field_names, expected in test_cases:
        try:
            result = _get_field_value(record, *field_names)
            if result == expected:
                print(f"{Colors.GREEN}✓ PASS{Colors.RESET}: _get_field_value with {field_names} = {result}")
                passed += 1
            else:
                print(f"{Colors.RED}✗ FAIL{Colors.RESET}: _get_field_value with {field_names} = {result}, expected {expected}")
                failed += 1
        except Exception as e:
            print(f"{Colors.RED}✗ FAIL{Colors.RESET}: _get_field_value raised {e}")
            failed += 1
    
    # Test 3: _safe_parse_date function
    print(f"\n{Colors.YELLOW}[3] Testing _safe_parse_date function{Colors.RESET}")
    test_cases = [
        ("2024-01-15", datetime(2024, 1, 15)),
        ("2024-01-15T10:30:00", datetime(2024, 1, 15, 10, 30)),
        (None, None),
        ("", None),
        ("invalid", None),
    ]
    
    for input_val, expected in test_cases:
        try:
            result = _safe_parse_date(input_val)
            if result == expected or (result is None and expected is None):
                print(f"{Colors.GREEN}✓ PASS{Colors.RESET}: _safe_parse_date('{input_val}') = {result}")
                passed += 1
            else:
                print(f"{Colors.RED}✗ FAIL{Colors.RESET}: _safe_parse_date('{input_val}') = {result}, expected {expected}")
                failed += 1
        except Exception as e:
            print(f"{Colors.RED}✗ FAIL{Colors.RESET}: _safe_parse_date('{input_val}') raised {e}")
            failed += 1
    
    # Test 4: _median function
    print(f"\n{Colors.YELLOW}[4] Testing _median function{Colors.RESET}")
    test_cases = [
        ([1, 2, 3, 4, 5], 3.0),
        ([1, 2, 3, 4], 2.5),
        ([5], 5.0),
        ([], 0.0),  # _median returns 0.0 for empty list (as per implementation)
    ]
    
    for input_val, expected in test_cases:
        try:
            result = _median(input_val)
            if result == expected:
                print(f"{Colors.GREEN}✓ PASS{Colors.RESET}: _median({input_val}) = {result}")
                passed += 1
            else:
                print(f"{Colors.RED}✗ FAIL{Colors.RESET}: _median({input_val}) = {result}, expected {expected}")
                failed += 1
        except Exception as e:
            print(f"{Colors.RED}✗ FAIL{Colors.RESET}: _median({input_val}) raised {e}")
            failed += 1
    
    # Test 5: _pct function
    print(f"\n{Colors.YELLOW}[5] Testing _pct function{Colors.RESET}")
    test_cases = [
        (50, 100, 50.0),
        (25, 100, 25.0),
        (0, 100, 0.0),
        (100, 0, 0.0),  # Division by zero should return 0
    ]
    
    for numerator, denominator, expected in test_cases:
        try:
            result = _pct(numerator, denominator)
            if abs(result - expected) < 0.01:
                print(f"{Colors.GREEN}✓ PASS{Colors.RESET}: _pct({numerator}, {denominator}) = {result}")
                passed += 1
            else:
                print(f"{Colors.RED}✗ FAIL{Colors.RESET}: _pct({numerator}, {denominator}) = {result}, expected {expected}")
                failed += 1
        except Exception as e:
            print(f"{Colors.RED}✗ FAIL{Colors.RESET}: _pct({numerator}, {denominator}) raised {e}")
            failed += 1
    
    # Test 6: clean_nan_values function
    print(f"\n{Colors.YELLOW}[6] Testing clean_nan_values function{Colors.RESET}")
    test_cases = [
        ({"key": float('nan')}, {"key": None}),
        ({"key": float('inf')}, {"key": None}),
        ({"key": 123}, {"key": 123}),
        ([float('nan'), 1, 2], [None, 1, 2]),
    ]
    
    for input_val, expected in test_cases:
        try:
            result = clean_nan_values(input_val)
            # Compare results (handling NaN/None)
            if isinstance(result, dict) and isinstance(expected, dict):
                match = all(
                    (result.get(k) == expected.get(k)) or 
                    (result.get(k) is None and expected.get(k) is None)
                    for k in set(list(result.keys()) + list(expected.keys()))
                )
            elif isinstance(result, list) and isinstance(expected, list):
                match = len(result) == len(expected) and all(
                    (r == e) or (r is None and e is None)
                    for r, e in zip(result, expected)
                )
            else:
                match = result == expected
            
            if match:
                print(f"{Colors.GREEN}✓ PASS{Colors.RESET}: clean_nan_values({input_val})")
                passed += 1
            else:
                print(f"{Colors.RED}✗ FAIL{Colors.RESET}: clean_nan_values({input_val}) = {result}, expected {expected}")
                failed += 1
        except Exception as e:
            print(f"{Colors.RED}✗ FAIL{Colors.RESET}: clean_nan_values raised {e}")
            failed += 1
    
    # Summary
    print(f"\n{Colors.BLUE}{'='*60}{Colors.RESET}")
    print(f"{Colors.BLUE}UNIT TEST SUMMARY{Colors.RESET}")
    print(f"{Colors.BLUE}{'='*60}{Colors.RESET}\n")
    print(f"Total Tests: {passed + failed}")
    print(f"{Colors.GREEN}Passed: {passed}{Colors.RESET}")
    print(f"{Colors.RED}Failed: {failed}{Colors.RESET}\n")
    
    return failed == 0

if __name__ == "__main__":
    result = test_unit()
    sys.exit(0 if result else 1)

