#!/usr/bin/env python3
"""
Compatibility Testing Script
Tests API compatibility across different scenarios
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

def test_compatibility():
    print(f"\n{Colors.BLUE}{'='*60}{Colors.RESET}")
    print(f"{Colors.BLUE}COMPATIBILITY TESTING{Colors.RESET}")
    print(f"{Colors.BLUE}{'='*60}{Colors.RESET}\n")
    
    passed = 0
    failed = 0
    warnings = 0
    
    # Test 1: HTTP Method Compatibility
    print(f"{Colors.YELLOW}[1] HTTP Method Compatibility Test{Colors.RESET}")
    try:
        # Test GET (should work)
        response = requests.get(f"{BASE_URL}/health", timeout=5)
        if response.status_code == 200:
            print(f"{Colors.GREEN}✓ PASS{Colors.RESET}: GET method supported")
            passed += 1
        else:
            print(f"{Colors.RED}✗ FAIL{Colors.RESET}: GET method returned {response.status_code}")
            failed += 1
        
        # Test POST (should return 405 or handle gracefully)
        response = requests.post(f"{BASE_URL}/health", timeout=5)
        if response.status_code in [200, 405, 422]:
            print(f"{Colors.GREEN}✓ PASS{Colors.RESET}: POST method handled gracefully")
            passed += 1
        else:
            print(f"{Colors.YELLOW}⚠ WARN{Colors.RESET}: POST method returned {response.status_code}")
            warnings += 1
    except Exception as e:
        print(f"{Colors.RED}✗ FAIL{Colors.RESET}: HTTP method test error: {e}")
        failed += 1
    
    # Test 2: Content-Type Compatibility
    print(f"\n{Colors.YELLOW}[2] Content-Type Compatibility Test{Colors.RESET}")
    try:
        # Test with different Accept headers
        headers = [
            {"Accept": "application/json"},
            {"Accept": "*/*"},
            {},  # No Accept header
        ]
        
        all_work = True
        for header in headers:
            response = requests.get(f"{BASE_URL}/health", headers=header, timeout=5)
            if response.status_code != 200:
                all_work = False
                break
        
        if all_work:
            print(f"{Colors.GREEN}✓ PASS{Colors.RESET}: Content-Type handling compatible")
            passed += 1
        else:
            print(f"{Colors.RED}✗ FAIL{Colors.RESET}: Content-Type handling incompatible")
            failed += 1
    except Exception as e:
        print(f"{Colors.RED}✗ FAIL{Colors.RESET}: Content-Type test error: {e}")
        failed += 1
    
    # Test 3: Parameter Encoding Compatibility
    print(f"\n{Colors.YELLOW}[3] Parameter Encoding Compatibility Test{Colors.RESET}")
    try:
        # Test with URL-encoded parameters
        params = {"state": "Delhi", "month": "2024-01"}
        response = requests.get(f"{BASE_URL}/kpi/drilldown/state/breakdown", params=params, timeout=10)
        
        if response.status_code in [200, 400, 422]:
            print(f"{Colors.GREEN}✓ PASS{Colors.RESET}: Parameter encoding compatible")
            passed += 1
        else:
            print(f"{Colors.RED}✗ FAIL{Colors.RESET}: Parameter encoding returned {response.status_code}")
            failed += 1
    except Exception as e:
        print(f"{Colors.RED}✗ FAIL{Colors.RESET}: Parameter encoding test error: {e}")
        failed += 1
    
    # Test 4: Response Format Compatibility
    print(f"\n{Colors.YELLOW}[4] Response Format Compatibility Test{Colors.RESET}")
    try:
        response = requests.get(f"{BASE_URL}/health", timeout=5)
        if response.status_code == 200:
            # Check if response is valid JSON
            try:
                data = response.json()
                if isinstance(data, dict):
                    print(f"{Colors.GREEN}✓ PASS{Colors.RESET}: Response format compatible (JSON)")
                    passed += 1
                else:
                    print(f"{Colors.RED}✗ FAIL{Colors.RESET}: Response format incompatible")
                    failed += 1
            except json.JSONDecodeError:
                print(f"{Colors.RED}✗ FAIL{Colors.RESET}: Response is not valid JSON")
                failed += 1
        else:
            print(f"{Colors.RED}✗ FAIL{Colors.RESET}: Response status {response.status_code}")
            failed += 1
    except Exception as e:
        print(f"{Colors.RED}✗ FAIL{Colors.RESET}: Response format test error: {e}")
        failed += 1
    
    # Test 5: CORS Compatibility
    print(f"\n{Colors.YELLOW}[5] CORS Compatibility Test{Colors.RESET}")
    try:
        # Test OPTIONS request (CORS preflight)
        response = requests.options(f"{BASE_URL}/health", headers={"Origin": "http://localhost:3000"}, timeout=5)
        cors_headers = {
            "Access-Control-Allow-Origin": response.headers.get("Access-Control-Allow-Origin"),
            "Access-Control-Allow-Methods": response.headers.get("Access-Control-Allow-Methods"),
        }
        
        if cors_headers["Access-Control-Allow-Origin"]:
            print(f"{Colors.GREEN}✓ PASS{Colors.RESET}: CORS headers present")
            passed += 1
        else:
            print(f"{Colors.YELLOW}⚠ WARN{Colors.RESET}: CORS headers not configured")
            warnings += 1
    except Exception as e:
        print(f"{Colors.YELLOW}⚠ WARN{Colors.RESET}: CORS test warning: {e}")
        warnings += 1
    
    # Summary
    print(f"\n{Colors.BLUE}{'='*60}{Colors.RESET}")
    print(f"{Colors.BLUE}COMPATIBILITY TEST SUMMARY{Colors.RESET}")
    print(f"{Colors.BLUE}{'='*60}{Colors.RESET}\n")
    print(f"Total Tests: {passed + failed + warnings}")
    print(f"{Colors.GREEN}Passed: {passed}{Colors.RESET}")
    print(f"{Colors.RED}Failed: {failed}{Colors.RESET}")
    print(f"{Colors.YELLOW}Warnings: {warnings}{Colors.RESET}\n")
    
    return failed == 0

if __name__ == "__main__":
    import sys
    result = test_compatibility()
    sys.exit(0 if result else 1)

