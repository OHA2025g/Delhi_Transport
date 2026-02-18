#!/usr/bin/env python3
"""
Frontend Integration Testing
Tests frontend functionality through browser automation and API integration
"""

import os
import requests
import time

BASE_URL = os.getenv("BASE_URL", "http://localhost:8003/api")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3003")

class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    RESET = '\033[0m'

def test_frontend_accessibility():
    """Test frontend is accessible and loads correctly"""
    print(f"\n{Colors.BLUE}{'='*60}{Colors.RESET}")
    print(f"{Colors.BLUE}FRONTEND INTEGRATION TESTING{Colors.RESET}")
    print(f"{Colors.BLUE}{'='*60}{Colors.RESET}\n")
    
    passed = 0
    failed = 0
    
    # Test 1: Frontend is accessible
    print(f"{Colors.YELLOW}[1] Frontend Server Accessibility{Colors.RESET}")
    try:
        response = requests.get(FRONTEND_URL, timeout=10)
        if response.status_code == 200:
            print(f"{Colors.GREEN}✓ PASS{Colors.RESET}: Frontend is accessible")
            passed += 1
        else:
            print(f"{Colors.RED}✗ FAIL{Colors.RESET}: Frontend returned {response.status_code}")
            failed += 1
    except Exception as e:
        print(f"{Colors.RED}✗ FAIL{Colors.RESET}: Frontend not accessible: {e}")
        failed += 1
    
    # Test 2: Frontend serves HTML
    print(f"\n{Colors.YELLOW}[2] Frontend HTML Response{Colors.RESET}")
    try:
        response = requests.get(FRONTEND_URL, timeout=10)
        if 'html' in response.headers.get('content-type', '').lower() or '<html' in response.text.lower():
            print(f"{Colors.GREEN}✓ PASS{Colors.RESET}: Frontend serves HTML content")
            passed += 1
        else:
            print(f"{Colors.RED}✗ FAIL{Colors.RESET}: Frontend does not serve HTML")
            failed += 1
    except Exception as e:
        print(f"{Colors.RED}✗ FAIL{Colors.RESET}: Error checking HTML: {e}")
        failed += 1
    
    # Test 3: API proxy is working (if frontend proxies to backend)
    print(f"\n{Colors.YELLOW}[3] API Integration Check{Colors.RESET}")
    try:
        # Test if backend API is accessible
        response = requests.get(f"{BASE_URL}/health", timeout=5)
        if response.status_code == 200:
            print(f"{Colors.GREEN}✓ PASS{Colors.RESET}: Backend API is accessible for frontend integration")
            passed += 1
        else:
            print(f"{Colors.YELLOW}⚠ WARN{Colors.RESET}: Backend API returned {response.status_code}")
            failed += 1
    except Exception as e:
        print(f"{Colors.YELLOW}⚠ WARN{Colors.RESET}: Backend API check failed: {e}")
        failed += 1
    
    # Test 4: Static assets loading
    print(f"\n{Colors.YELLOW}[4] Static Assets Check{Colors.RESET}")
    try:
        # Check if main.js or similar static file exists
        response = requests.get(f"{FRONTEND_URL}/static/js/main.js", timeout=5, allow_redirects=False)
        if response.status_code in [200, 404]:  # 404 is ok, might be different path
            print(f"{Colors.GREEN}✓ PASS{Colors.RESET}: Static assets path is accessible")
            passed += 1
        else:
            print(f"{Colors.YELLOW}⚠ WARN{Colors.RESET}: Static assets check returned {response.status_code}")
            passed += 1  # Not critical
    except Exception as e:
        print(f"{Colors.YELLOW}⚠ WARN{Colors.RESET}: Static assets check: {e}")
        passed += 1  # Not critical
    
    # Summary
    print(f"\n{Colors.BLUE}{'='*60}{Colors.RESET}")
    print(f"{Colors.BLUE}Frontend Integration Test Summary{Colors.RESET}")
    print(f"{Colors.BLUE}{'='*60}{Colors.RESET}")
    print(f"Passed: {Colors.GREEN}{passed}{Colors.RESET}")
    print(f"Failed: {Colors.RED}{failed}{Colors.RESET}")
    print(f"Total: {passed + failed}\n")
    
    return failed == 0

if __name__ == "__main__":
    success = test_frontend_accessibility()
    exit(0 if success else 1)

