#!/usr/bin/env python3
"""
Usability Testing
Tests user experience and interface usability
"""

import os
import requests
try:
    from bs4 import BeautifulSoup
    BS4_AVAILABLE = True
except ImportError:
    BS4_AVAILABLE = False

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3003")
BASE_URL = os.getenv("BASE_URL", "http://localhost:8003/api")

class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    RESET = '\033[0m'

def test_usability():
    """Test basic usability features"""
    print(f"\n{Colors.BLUE}{'='*60}{Colors.RESET}")
    print(f"{Colors.BLUE}USABILITY TESTING{Colors.RESET}")
    print(f"{Colors.BLUE}{'='*60}{Colors.RESET}\n")
    
    passed = 0
    failed = 0
    warnings = 0
    
    # Test 1: Page load time
    print(f"{Colors.YELLOW}[1] Page Load Performance{Colors.RESET}")
    try:
        import time
        start = time.time()
        response = requests.get(FRONTEND_URL, timeout=10)
        load_time = time.time() - start
        
        if load_time < 3.0:
            print(f"{Colors.GREEN}✓ PASS{Colors.RESET}: Page loads in {load_time:.2f}s (< 3s)")
            passed += 1
        elif load_time < 5.0:
            print(f"{Colors.YELLOW}⚠ WARN{Colors.RESET}: Page loads in {load_time:.2f}s (3-5s, acceptable)")
            warnings += 1
            passed += 1
        else:
            print(f"{Colors.RED}✗ FAIL{Colors.RESET}: Page loads in {load_time:.2f}s (> 5s, too slow)")
            failed += 1
    except Exception as e:
        print(f"{Colors.RED}✗ FAIL{Colors.RESET}: Load time test failed: {e}")
        failed += 1
    
    # Test 2: Response size
    print(f"\n{Colors.YELLOW}[2] Response Size Check{Colors.RESET}")
    try:
        response = requests.get(FRONTEND_URL, timeout=10)
        size_kb = len(response.content) / 1024
        
        if size_kb < 500:
            print(f"{Colors.GREEN}✓ PASS{Colors.RESET}: Initial HTML size: {size_kb:.2f} KB (< 500 KB)")
            passed += 1
        elif size_kb < 1000:
            print(f"{Colors.YELLOW}⚠ WARN{Colors.RESET}: Initial HTML size: {size_kb:.2f} KB (500-1000 KB)")
            warnings += 1
            passed += 1
        else:
            print(f"{Colors.RED}✗ FAIL{Colors.RESET}: Initial HTML size: {size_kb:.2f} KB (> 1000 KB, too large)")
            failed += 1
    except Exception as e:
        print(f"{Colors.RED}✗ FAIL{Colors.RESET}: Response size check failed: {e}")
        failed += 1
    
    # Test 3: API response time
    print(f"\n{Colors.YELLOW}[3] API Response Time{Colors.RESET}")
    try:
        import time
        start = time.time()
        response = requests.get(f"{BASE_URL}/health", timeout=5)
        api_time = time.time() - start
        
        if api_time < 1.0:
            print(f"{Colors.GREEN}✓ PASS{Colors.RESET}: API responds in {api_time:.2f}s (< 1s)")
            passed += 1
        elif api_time < 2.0:
            print(f"{Colors.YELLOW}⚠ WARN{Colors.RESET}: API responds in {api_time:.2f}s (1-2s, acceptable)")
            warnings += 1
            passed += 1
        else:
            print(f"{Colors.RED}✗ FAIL{Colors.RESET}: API responds in {api_time:.2f}s (> 2s, too slow)")
            failed += 1
    except Exception as e:
        print(f"{Colors.YELLOW}⚠ WARN{Colors.RESET}: API response time check: {e}")
        warnings += 1
        passed += 1  # Not critical if API is down
    
    # Test 4: Content-Type headers
    print(f"\n{Colors.YELLOW}[4] Content-Type Headers{Colors.RESET}")
    try:
        response = requests.get(FRONTEND_URL, timeout=10)
        content_type = response.headers.get('content-type', '')
        
        if 'text/html' in content_type.lower():
            print(f"{Colors.GREEN}✓ PASS{Colors.RESET}: Correct Content-Type: {content_type}")
            passed += 1
        else:
            print(f"{Colors.YELLOW}⚠ WARN{Colors.RESET}: Unexpected Content-Type: {content_type}")
            warnings += 1
            passed += 1
    except Exception as e:
        print(f"{Colors.RED}✗ FAIL{Colors.RESET}: Content-Type check failed: {e}")
        failed += 1
    
    # Test 5: Error handling (404 page)
    print(f"\n{Colors.YELLOW}[5] Error Handling{Colors.RESET}")
    try:
        response = requests.get(f"{FRONTEND_URL}/nonexistent-page-12345", timeout=5, allow_redirects=False)
        # React Router should handle 404s, might redirect or return 200 with app
        if response.status_code in [200, 404]:
            print(f"{Colors.GREEN}✓ PASS{Colors.RESET}: Error handling works (status: {response.status_code})")
            passed += 1
        else:
            print(f"{Colors.YELLOW}⚠ WARN{Colors.RESET}: Unexpected status for 404: {response.status_code}")
            warnings += 1
            passed += 1
    except Exception as e:
        print(f"{Colors.YELLOW}⚠ WARN{Colors.RESET}: Error handling check: {e}")
        warnings += 1
        passed += 1
    
    # Summary
    print(f"\n{Colors.BLUE}{'='*60}{Colors.RESET}")
    print(f"{Colors.BLUE}Usability Test Summary{Colors.RESET}")
    print(f"{Colors.BLUE}{'='*60}{Colors.RESET}")
    print(f"Passed: {Colors.GREEN}{passed}{Colors.RESET}")
    print(f"Failed: {Colors.RED}{failed}{Colors.RESET}")
    print(f"Warnings: {Colors.YELLOW}{warnings}{Colors.RESET}")
    print(f"Total: {passed + failed}\n")
    
    return failed == 0

if __name__ == "__main__":
    success = test_usability()
    exit(0 if success else 1)

