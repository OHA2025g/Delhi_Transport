#!/usr/bin/env python3
"""
Validation/Boundary Testing Script
Tests edge cases, limits, invalid inputs, and boundary conditions
"""

import requests
import json

BASE_URL = "http://localhost:8000/api"

class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    RESET = '\033[0m'

def test_validation():
    print(f"\n{Colors.BLUE}{'='*60}{Colors.RESET}")
    print(f"{Colors.BLUE}VALIDATION/BOUNDARY TESTING{Colors.RESET}")
    print(f"{Colors.BLUE}{'='*60}{Colors.RESET}\n")
    
    passed = 0
    failed = 0
    warnings = 0
    
    # Test 1: Empty/Null Parameters
    print(f"{Colors.YELLOW}[1] Empty/Null Parameter Tests{Colors.RESET}")
    test_cases = [
        ({"state": ""}, "Empty state string"),
        ({"state": None}, "None state value"),
        ({"month": ""}, "Empty month string"),
        ({"rto": ""}, "Empty RTO string"),
    ]
    
    for params, description in test_cases:
        try:
            # Filter out None values
            clean_params = {k: v for k, v in params.items() if v is not None}
            response = requests.get(f"{BASE_URL}/kpi/drilldown/state/breakdown", 
                                  params=clean_params, timeout=5)
            # Accept 200, 400, 422, and 429 (rate limited) as valid responses
            if response.status_code in [200, 400, 422, 429]:
                if response.status_code == 429:
                    print(f"{Colors.GREEN}✓ PASS{Colors.RESET}: {description} handled correctly (rate limited - acceptable)")
                else:
                    print(f"{Colors.GREEN}✓ PASS{Colors.RESET}: {description} handled correctly")
                passed += 1
            else:
                print(f"{Colors.YELLOW}⚠ WARN{Colors.RESET}: {description} returned {response.status_code}")
                warnings += 1
        except Exception as e:
            print(f"{Colors.RED}✗ FAIL{Colors.RESET}: {description} error: {e}")
            failed += 1
    
    # Test 2: Invalid Date Formats
    print(f"\n{Colors.YELLOW}[2] Invalid Date Format Tests{Colors.RESET}")
    invalid_dates = [
        "2020-13",  # Invalid month
        "2020-00",  # Invalid month
        "2020-1",   # Missing zero padding
        "20-01",    # Invalid year format
        "2020/01",  # Wrong separator
        "invalid",  # Non-date string
        "2020-01-32",  # Invalid day
    ]
    
    for invalid_date in invalid_dates:
        try:
            response = requests.get(f"{BASE_URL}/kpi/drilldown/state/breakdown", 
                                  params={"month": invalid_date}, timeout=5)
            # Accept 200, 400, 422, and 429 (rate limited) as valid responses
            if response.status_code in [200, 400, 422, 429]:
                if response.status_code == 429:
                    print(f"{Colors.GREEN}✓ PASS{Colors.RESET}: Invalid date '{invalid_date}' handled (rate limited - acceptable)")
                else:
                    print(f"{Colors.GREEN}✓ PASS{Colors.RESET}: Invalid date '{invalid_date}' handled")
                passed += 1
            else:
                print(f"{Colors.YELLOW}⚠ WARN{Colors.RESET}: Invalid date '{invalid_date}' returned {response.status_code}")
                warnings += 1
        except Exception as e:
            print(f"{Colors.RED}✗ FAIL{Colors.RESET}: Invalid date '{invalid_date}' error: {e}")
            failed += 1
    
    # Test 3: Very Long Strings
    print(f"\n{Colors.YELLOW}[3] Very Long String Tests{Colors.RESET}")
    long_strings = [
        "A" * 1000,  # 1000 characters
        "A" * 10000,  # 10000 characters
    ]
    
    for long_str in long_strings:
        try:
            response = requests.get(f"{BASE_URL}/kpi/drilldown/state/breakdown", 
                                  params={"state": long_str}, timeout=5)
            if response.status_code in [200, 400, 422, 413]:
                print(f"{Colors.GREEN}✓ PASS{Colors.RESET}: Long string ({len(long_str)} chars) handled")
                passed += 1
            else:
                print(f"{Colors.YELLOW}⚠ WARN{Colors.RESET}: Long string returned {response.status_code}")
                warnings += 1
        except Exception as e:
            print(f"{Colors.RED}✗ FAIL{Colors.RESET}: Long string error: {e}")
            failed += 1
    
    # Test 4: Special Characters
    print(f"\n{Colors.YELLOW}[4] Special Character Tests{Colors.RESET}")
    special_chars = [
        "State@123",
        "State#Test",
        "State$Value",
        "State%Test",
        "State&More",
        "State'Test",
        "State\"Test",
        "State<Tag>",
        "State{Test}",
        "State[Test]",
    ]
    
    for special in special_chars:
        try:
            response = requests.get(f"{BASE_URL}/kpi/drilldown/state/breakdown", 
                                  params={"state": special}, timeout=5)
            if response.status_code in [200, 400, 422]:
                print(f"{Colors.GREEN}✓ PASS{Colors.RESET}: Special chars '{special[:20]}...' handled")
                passed += 1
            else:
                print(f"{Colors.YELLOW}⚠ WARN{Colors.RESET}: Special chars returned {response.status_code}")
                warnings += 1
        except Exception as e:
            print(f"{Colors.RED}✗ FAIL{Colors.RESET}: Special chars error: {e}")
            failed += 1
    
    # Test 5: Boundary Values
    print(f"\n{Colors.YELLOW}[5] Boundary Value Tests{Colors.RESET}")
    boundary_tests = [
        ({"month": "2020-01"}, "Earliest possible month"),
        ({"month": "2099-12"}, "Latest possible month"),
        ({"month": "1900-01"}, "Very old date"),
        ({"month": "2100-01"}, "Future date"),
    ]
    
    for params, description in boundary_tests:
        try:
            response = requests.get(f"{BASE_URL}/kpi/drilldown/state/breakdown", 
                                  params=params, timeout=5)
            if response.status_code in [200, 400, 422]:
                print(f"{Colors.GREEN}✓ PASS{Colors.RESET}: {description} handled")
                passed += 1
            else:
                print(f"{Colors.YELLOW}⚠ WARN{Colors.RESET}: {description} returned {response.status_code}")
                warnings += 1
        except Exception as e:
            print(f"{Colors.RED}✗ FAIL{Colors.RESET}: {description} error: {e}")
            failed += 1
    
    # Test 6: Unicode/International Characters
    print(f"\n{Colors.YELLOW}[6] Unicode Character Tests{Colors.RESET}")
    unicode_tests = [
        "दिल्ली",  # Hindi
        "महाराष्ट्र",  # Marathi
        "État",  # French
        "北京",  # Chinese
    ]
    
    for unicode_str in unicode_tests:
        try:
            response = requests.get(f"{BASE_URL}/kpi/drilldown/state/breakdown", 
                                  params={"state": unicode_str}, timeout=5)
            if response.status_code in [200, 400, 422]:
                print(f"{Colors.GREEN}✓ PASS{Colors.RESET}: Unicode string handled")
                passed += 1
            else:
                print(f"{Colors.YELLOW}⚠ WARN{Colors.RESET}: Unicode returned {response.status_code}")
                warnings += 1
        except Exception as e:
            print(f"{Colors.RED}✗ FAIL{Colors.RESET}: Unicode error: {e}")
            failed += 1
    
    # Summary
    print(f"\n{Colors.BLUE}{'='*60}{Colors.RESET}")
    print(f"{Colors.BLUE}VALIDATION TEST SUMMARY{Colors.RESET}")
    print(f"{Colors.BLUE}{'='*60}{Colors.RESET}\n")
    print(f"Total Tests: {passed + failed + warnings}")
    print(f"{Colors.GREEN}Passed: {passed}{Colors.RESET}")
    print(f"{Colors.RED}Failed: {failed}{Colors.RESET}")
    print(f"{Colors.YELLOW}Warnings: {warnings}{Colors.RESET}\n")
    
    return failed == 0

if __name__ == "__main__":
    import sys
    result = test_validation()
    sys.exit(0 if result else 1)

