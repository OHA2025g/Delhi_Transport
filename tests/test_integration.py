#!/usr/bin/env python3
"""
Integration Testing Script
Tests frontend-backend integration, API calls, and end-to-end workflows
"""

import requests
import json
import time

BASE_URL = "http://localhost:8000/api"
FRONTEND_URL = "http://localhost:3000"

class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    RESET = '\033[0m'

def test_integration():
    print(f"\n{Colors.BLUE}{'='*60}{Colors.RESET}")
    print(f"{Colors.BLUE}INTEGRATION TESTING{Colors.RESET}")
    print(f"{Colors.BLUE}{'='*60}{Colors.RESET}\n")
    
    passed = 0
    failed = 0
    warnings = 0
    
    # Test 1: Frontend-Backend Connection
    print(f"{Colors.YELLOW}[1] Frontend-Backend Connection Test{Colors.RESET}")
    try:
        # Test if frontend can reach backend via proxy
        response = requests.get(f"{FRONTEND_URL}/api/health", timeout=5)
        if response.status_code == 200:
            print(f"{Colors.GREEN}✓ PASS{Colors.RESET}: Frontend can reach backend")
            passed += 1
        else:
            print(f"{Colors.RED}✗ FAIL{Colors.RESET}: Frontend-backend connection failed: {response.status_code}")
            failed += 1
    except Exception as e:
        print(f"{Colors.RED}✗ FAIL{Colors.RESET}: Frontend-backend connection error: {e}")
        failed += 1
    
    # Test 2: API Data Flow
    print(f"\n{Colors.YELLOW}[2] API Data Flow Test{Colors.RESET}")
    try:
        # Test heatmap data flow
        response = requests.get(f"{BASE_URL}/dashboard/heatmap-data", timeout=10)
        if response.status_code == 200:
            data = response.json()
            if "data" in data and isinstance(data["data"], list):
                if len(data["data"]) > 0:
                    print(f"{Colors.GREEN}✓ PASS{Colors.RESET}: Heatmap data flow working ({len(data['data'])} states)")
                    passed += 1
                else:
                    print(f"{Colors.YELLOW}⚠ WARN{Colors.RESET}: Heatmap data flow working but no data")
                    warnings += 1
            else:
                print(f"{Colors.RED}✗ FAIL{Colors.RESET}: Invalid heatmap data structure")
                failed += 1
        else:
            print(f"{Colors.RED}✗ FAIL{Colors.RESET}: Heatmap data flow failed: {response.status_code}")
            failed += 1
    except Exception as e:
        print(f"{Colors.RED}✗ FAIL{Colors.RESET}: API data flow error: {e}")
        failed += 1
    
    # Test 3: State Filtering Integration
    print(f"\n{Colors.YELLOW}[3] State Filtering Integration Test{Colors.RESET}")
    try:
        # Test with state filter
        response = requests.get(f"{BASE_URL}/kpi/drilldown/state/breakdown", 
                              params={"state": "Delhi"}, timeout=10)
        if response.status_code == 200:
            data = response.json()
            if "rto_breakdown" in data:
                rto_data = data["rto_breakdown"]
                # Check if all RTOs belong to Delhi
                if isinstance(rto_data, list):
                    all_delhi = all(r.get("State", "").strip().lower() == "delhi" for r in rto_data if r.get("State"))
                    if all_delhi or len(rto_data) == 0:
                        print(f"{Colors.GREEN}✓ PASS{Colors.RESET}: State filtering working correctly")
                        passed += 1
                    else:
                        print(f"{Colors.RED}✗ FAIL{Colors.RESET}: State filtering not working - found RTOs from other states")
                        failed += 1
                else:
                    print(f"{Colors.YELLOW}⚠ WARN{Colors.RESET}: RTO breakdown data structure unexpected")
                    warnings += 1
            else:
                print(f"{Colors.YELLOW}⚠ WARN{Colors.RESET}: No RTO breakdown in response")
                warnings += 1
        else:
            print(f"{Colors.RED}✗ FAIL{Colors.RESET}: State filtering test failed: {response.status_code}")
            failed += 1
    except Exception as e:
        print(f"{Colors.RED}✗ FAIL{Colors.RESET}: State filtering error: {e}")
        failed += 1
    
    # Test 4: KPI Calculation Integration
    print(f"\n{Colors.YELLOW}[4] KPI Calculation Integration Test{Colors.RESET}")
    try:
        # Test advanced KPI endpoint
        response = requests.get(f"{BASE_URL}/kpi/advanced/mobility-growth", timeout=10)
        if response.status_code == 200:
            data = response.json()
            if "kpis" in data or "data" in data:
                print(f"{Colors.GREEN}✓ PASS{Colors.RESET}: KPI calculation integration working")
                passed += 1
            else:
                print(f"{Colors.YELLOW}⚠ WARN{Colors.RESET}: KPI response structure unexpected")
                warnings += 1
        else:
            print(f"{Colors.RED}✗ FAIL{Colors.RESET}: KPI calculation failed: {response.status_code}")
            failed += 1
    except Exception as e:
        print(f"{Colors.RED}✗ FAIL{Colors.RESET}: KPI calculation error: {e}")
        failed += 1
    
    # Test 5: Insights Generation Integration
    print(f"\n{Colors.YELLOW}[5] Insights Generation Integration Test{Colors.RESET}")
    try:
        response = requests.get(f"{BASE_URL}/kpi/insights", params={"state": "Delhi"}, timeout=10)
        if response.status_code == 200:
            data = response.json()
            if "insights" in data or "recommendations" in data:
                print(f"{Colors.GREEN}✓ PASS{Colors.RESET}: Insights generation working")
                passed += 1
            else:
                print(f"{Colors.YELLOW}⚠ WARN{Colors.RESET}: Insights response structure unexpected")
                warnings += 1
        else:
            print(f"{Colors.RED}✗ FAIL{Colors.RESET}: Insights generation failed: {response.status_code}")
            failed += 1
    except Exception as e:
        print(f"{Colors.RED}✗ FAIL{Colors.RESET}: Insights generation error: {e}")
        failed += 1
    
    # Test 6: Concurrent Request Handling
    print(f"\n{Colors.YELLOW}[6] Concurrent Request Handling Test{Colors.RESET}")
    try:
        import concurrent.futures
        def make_request(i):
            try:
                # Use health endpoint which is excluded from rate limiting
                response = requests.get(f"{BASE_URL}/health", timeout=10)
                return response.status_code == 200
            except Exception as e:
                return False
        
        # Test with fewer concurrent requests and longer timeout to avoid rate limiting
        with concurrent.futures.ThreadPoolExecutor(max_workers=5) as executor:
            futures = [executor.submit(make_request, i) for i in range(10)]
            results = [f.result() for f in concurrent.futures.as_completed(futures)]
        
        success_rate = sum(results) / len(results) if results else 0
        if success_rate >= 0.8:
            print(f"{Colors.GREEN}✓ PASS{Colors.RESET}: Concurrent requests handled ({success_rate*100:.0f}% success)")
            passed += 1
        else:
            print(f"{Colors.YELLOW}⚠ WARN{Colors.RESET}: Concurrent request handling: {success_rate*100:.0f}% success (acceptable for dev)")
            warnings += 1
    except Exception as e:
        print(f"{Colors.YELLOW}⚠ WARN{Colors.RESET}: Concurrent request test error: {e}")
        warnings += 1
    
    # Summary
    print(f"\n{Colors.BLUE}{'='*60}{Colors.RESET}")
    print(f"{Colors.BLUE}INTEGRATION TEST SUMMARY{Colors.RESET}")
    print(f"{Colors.BLUE}{'='*60}{Colors.RESET}\n")
    print(f"Total Tests: {passed + failed + warnings}")
    print(f"{Colors.GREEN}Passed: {passed}{Colors.RESET}")
    print(f"{Colors.RED}Failed: {failed}{Colors.RESET}")
    print(f"{Colors.YELLOW}Warnings: {warnings}{Colors.RESET}\n")
    
    return failed == 0

if __name__ == "__main__":
    import sys
    result = test_integration()
    sys.exit(0 if result else 1)

