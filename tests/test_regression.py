#!/usr/bin/env python3
"""
Regression Testing Script
Ensures new code changes haven't broken existing functionality
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

def test_regression():
    print(f"\n{Colors.BLUE}{'='*60}{Colors.RESET}")
    print(f"{Colors.BLUE}REGRESSION TESTING{Colors.RESET}")
    print(f"{Colors.BLUE}{'='*60}{Colors.RESET}\n")
    
    passed = 0
    failed = 0
    
    # Test 1: Critical Endpoints Still Work
    print(f"{Colors.YELLOW}[1] Critical Endpoints Test{Colors.RESET}")
    critical_endpoints = [
        ("/health", "Health check"),
        ("/", "Root endpoint"),
        ("/api/health", "API health"),
        ("/dashboard/heatmap-data", "Heatmap data"),
        ("/kpi/summary", "KPI summary"),
    ]
    
    for endpoint, name in critical_endpoints:
        try:
            response = requests.get(f"{BASE_URL}{endpoint}", timeout=10)
            if response.status_code == 200:
                print(f"{Colors.GREEN}✓ PASS{Colors.RESET}: {name} working")
                passed += 1
            else:
                print(f"{Colors.RED}✗ FAIL{Colors.RESET}: {name} returned {response.status_code}")
                failed += 1
        except Exception as e:
            print(f"{Colors.RED}✗ FAIL{Colors.RESET}: {name} error: {e}")
            failed += 1
    
    # Test 2: Data Structure Consistency
    print(f"\n{Colors.YELLOW}[2] Data Structure Consistency Test{Colors.RESET}")
    try:
        response = requests.get(f"{BASE_URL}/dashboard/heatmap-data", timeout=10)
        if response.status_code == 200:
            data = response.json()
            # Check expected structure
            if "data" in data and isinstance(data["data"], list):
                if len(data["data"]) > 0:
                    sample = data["data"][0]
                    required_fields = ["state", "vehicle_registration", "accidents", "revenue", "challans"]
                    missing = [f for f in required_fields if f not in sample]
                    if not missing:
                        print(f"{Colors.GREEN}✓ PASS{Colors.RESET}: Data structure consistent")
                        passed += 1
                    else:
                        print(f"{Colors.RED}✗ FAIL{Colors.RESET}: Missing fields: {missing}")
                        failed += 1
                else:
                    print(f"{Colors.YELLOW}⚠ WARN{Colors.RESET}: No data returned (acceptable)")
                    passed += 1
            else:
                print(f"{Colors.RED}✗ FAIL{Colors.RESET}: Invalid data structure")
                failed += 1
        except Exception as e:
            print(f"{Colors.RED}✗ FAIL{Colors.RESET}: Data structure test error: {e}")
            failed += 1
    
    # Test 3: KPI Calculation Consistency
    print(f"\n{Colors.YELLOW}[3] KPI Calculation Consistency Test{Colors.RESET}")
    try:
        response = requests.get(f"{BASE_URL}/kpi/advanced/mobility-growth", timeout=10)
        if response.status_code == 200:
            data = response.json()
            # Check if response has expected structure
            if "kpis" in data or "data" in data:
                print(f"{Colors.GREEN}✓ PASS{Colors.RESET}: KPI calculation structure consistent")
                passed += 1
            else:
                print(f"{Colors.RED}✗ FAIL{Colors.RESET}: KPI response structure changed")
                failed += 1
        except Exception as e:
            print(f"{Colors.RED}✗ FAIL{Colors.RESET}: KPI calculation test error: {e}")
            failed += 1
    
    # Test 4: Error Handling Consistency
    print(f"\n{Colors.YELLOW}[4] Error Handling Consistency Test{Colors.RESET}")
    try:
        # Test 404 handling
        response = requests.get(f"{BASE_URL}/nonexistent/endpoint", timeout=5)
        if response.status_code == 404:
            print(f"{Colors.GREEN}✓ PASS{Colors.RESET}: 404 error handling consistent")
            passed += 1
        else:
            print(f"{Colors.RED}✗ FAIL{Colors.RESET}: 404 handling changed: {response.status_code}")
            failed += 1
    except Exception as e:
        print(f"{Colors.RED}✗ FAIL{Colors.RESET}: Error handling test error: {e}")
        failed += 1
    
    # Test 5: Response Format Consistency
    print(f"\n{Colors.YELLOW}[5] Response Format Consistency Test{Colors.RESET}")
    try:
        endpoints = [
            "/kpi/summary",
            "/kpi/state/general",
            "/kpi/rto/general",
        ]
        
        all_consistent = True
        for endpoint in endpoints:
            try:
                response = requests.get(f"{BASE_URL}{endpoint}", timeout=10)
                if response.status_code == 200:
                    # Try to parse as JSON
                    data = response.json()
                    if not isinstance(data, (dict, list)):
                        all_consistent = False
                        break
                else:
                    all_consistent = False
                    break
            except:
                all_consistent = False
                break
        
        if all_consistent:
            print(f"{Colors.GREEN}✓ PASS{Colors.RESET}: Response format consistent")
            passed += 1
        else:
            print(f"{Colors.RED}✗ FAIL{Colors.RESET}: Response format inconsistent")
            failed += 1
    except Exception as e:
        print(f"{Colors.RED}✗ FAIL{Colors.RESET}: Response format test error: {e}")
        failed += 1
    
    # Summary
    print(f"\n{Colors.BLUE}{'='*60}{Colors.RESET}")
    print(f"{Colors.BLUE}REGRESSION TEST SUMMARY{Colors.RESET}")
    print(f"{Colors.BLUE}{'='*60}{Colors.RESET}\n")
    print(f"Total Tests: {passed + failed}")
    print(f"{Colors.GREEN}Passed: {passed}{Colors.RESET}")
    print(f"{Colors.RED}Failed: {failed}{Colors.RESET}\n")
    
    return failed == 0

if __name__ == "__main__":
    import sys
    result = test_regression()
    sys.exit(0 if result else 1)

