#!/usr/bin/env python3
"""
Smoke/Sanity Testing
Quick, shallow tests to ensure the service is stable enough for deeper testing
"""

import requests

BASE_URL = "http://localhost:8000/api"
FRONTEND_URL = "http://localhost:3000"

class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    RESET = '\033[0m'

def test_smoke():
    print(f"\n{Colors.BLUE}{'='*60}{Colors.RESET}")
    print(f"{Colors.BLUE}SMOKE/SANITY TESTING{Colors.RESET}")
    print(f"{Colors.BLUE}{'='*60}{Colors.RESET}\n")
    
    passed = 0
    failed = 0
    
    # Test 1: Backend is running
    print(f"{Colors.YELLOW}[1] Backend Server Check{Colors.RESET}")
    try:
        response = requests.get(f"{BASE_URL}/health", timeout=5)
        if response.status_code == 200:
            print(f"{Colors.GREEN}✓ PASS{Colors.RESET}: Backend server is running")
            passed += 1
        else:
            print(f"{Colors.RED}✗ FAIL{Colors.RESET}: Backend returned {response.status_code}")
            failed += 1
    except Exception as e:
        print(f"{Colors.RED}✗ FAIL{Colors.RESET}: Backend not accessible: {e}")
        failed += 1
    
    # Test 2: Frontend is running
    print(f"\n{Colors.YELLOW}[2] Frontend Server Check{Colors.RESET}")
    try:
        response = requests.get(FRONTEND_URL, timeout=5)
        if response.status_code == 200:
            print(f"{Colors.GREEN}✓ PASS{Colors.RESET}: Frontend server is running")
            passed += 1
        else:
            print(f"{Colors.RED}✗ FAIL{Colors.RESET}: Frontend returned {response.status_code}")
            failed += 1
    except Exception as e:
        print(f"{Colors.RED}✗ FAIL{Colors.RESET}: Frontend not accessible: {e}")
        failed += 1
    
    # Test 3: Critical endpoints respond
    print(f"\n{Colors.YELLOW}[3] Critical Endpoints Check{Colors.RESET}")
    critical_endpoints = [
        ("/health", "Health check"),
        ("/dashboard/heatmap-data", "Heatmap data"),
        ("/kpi/summary", "KPI summary"),
    ]
    
    for path, name in critical_endpoints:
        try:
            response = requests.get(f"{BASE_URL}{path}", timeout=10)
            if response.status_code == 200:
                print(f"{Colors.GREEN}✓ PASS{Colors.RESET}: {name} endpoint working")
                passed += 1
            else:
                print(f"{Colors.RED}✗ FAIL{Colors.RESET}: {name} returned {response.status_code}")
                failed += 1
        except Exception as e:
            print(f"{Colors.RED}✗ FAIL{Colors.RESET}: {name} error: {e}")
            failed += 1
    
    # Test 4: Database connection
    print(f"\n{Colors.YELLOW}[4] Database Connection Check{Colors.RESET}")
    try:
        response = requests.get(f"{BASE_URL}/health", timeout=5)
        if response.status_code == 200:
            data = response.json()
            if data.get("mongodb", {}).get("status") == "connected":
                print(f"{Colors.GREEN}✓ PASS{Colors.RESET}: Database connection working")
                passed += 1
            else:
                print(f"{Colors.RED}✗ FAIL{Colors.RESET}: Database not connected")
                failed += 1
        else:
            print(f"{Colors.RED}✗ FAIL{Colors.RESET}: Cannot check database status")
            failed += 1
    except Exception as e:
        print(f"{Colors.RED}✗ FAIL{Colors.RESET}: Database check error: {e}")
        failed += 1
    
    # Summary
    print(f"\n{Colors.BLUE}{'='*60}{Colors.RESET}")
    print(f"{Colors.BLUE}SMOKE TEST SUMMARY{Colors.RESET}")
    print(f"{Colors.BLUE}{'='*60}{Colors.RESET}\n")
    print(f"Total Tests: {passed + failed}")
    print(f"{Colors.GREEN}Passed: {passed}{Colors.RESET}")
    print(f"{Colors.RED}Failed: {failed}{Colors.RESET}\n")
    
    if failed == 0:
        print(f"{Colors.GREEN}✅ Service is stable and ready for deeper testing{Colors.RESET}\n")
    else:
        print(f"{Colors.RED}❌ Service has critical issues - fix before proceeding{Colors.RESET}\n")
    
    return failed == 0

if __name__ == "__main__":
    import sys
    result = test_smoke()
    sys.exit(0 if result else 1)

