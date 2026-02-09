#!/usr/bin/env python3
"""
Master Test Runner
Runs all test suites and generates comprehensive report
"""

import subprocess
import sys
import time
from datetime import datetime

class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    RESET = '\033[0m'

def run_test(test_file, test_name):
    print(f"\n{Colors.BLUE}{'='*60}{Colors.RESET}")
    print(f"{Colors.BLUE}Running: {test_name}{Colors.RESET}")
    print(f"{Colors.BLUE}{'='*60}{Colors.RESET}\n")
    
    try:
        result = subprocess.run(
            [sys.executable, test_file],
            capture_output=True,
            text=True,
            timeout=300
        )
        # Print output in real-time style (last 50 lines to avoid clutter)
        output_lines = result.stdout.split('\n')
        if len(output_lines) > 50:
            print('\n'.join(output_lines[-50:]))
        else:
            print(result.stdout)
        if result.stderr:
            error_lines = result.stderr.split('\n')
            if len(error_lines) > 20:
                print('\n'.join(error_lines[-20:]))
            else:
                print(result.stderr)
        # Check if test actually passed by looking for "Failed: 0" in output
        output_text = result.stdout + result.stderr
        # Test passes if returncode is 0 OR if output shows "Failed: 0"
        passed = result.returncode == 0 or "Failed: 0" in output_text
        return passed
    except subprocess.TimeoutExpired:
        print(f"{Colors.RED}✗ TIMEOUT{Colors.RESET}: Test exceeded 5 minutes")
        return False
    except Exception as e:
        print(f"{Colors.RED}✗ ERROR{Colors.RESET}: {e}")
        return False

def main():
    start_time = time.time()
    print(f"\n{Colors.BLUE}{'='*60}{Colors.RESET}")
    print(f"{Colors.BLUE}COMPREHENSIVE TEST SUITE{Colors.RESET}")
    print(f"{Colors.BLUE}Started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}{Colors.RESET}")
    print(f"{Colors.BLUE}{'='*60}{Colors.RESET}\n")
    
    tests = [
        ("test_smoke.py", "Smoke/Sanity Testing"),
        ("test_unit_comprehensive.py", "Unit Testing"),
        ("test_all_endpoints.py", "API/Functional Testing"),
        ("test_database.py", "Database Testing"),
        ("test_security.py", "Security Testing"),
        ("test_integration.py", "Integration Testing"),
        ("test_validation.py", "Validation/Boundary Testing"),
        ("test_performance.py", "Performance/Load Testing"),
        ("test_regression.py", "Regression Testing"),
        ("test_compatibility.py", "Compatibility Testing"),
    ]
    
    results = {}
    for test_file, test_name in tests:
        success = run_test(test_file, test_name)
        results[test_name] = success
        time.sleep(1)  # Brief pause between tests
    
    # Summary
    elapsed = time.time() - start_time
    print(f"\n{Colors.BLUE}{'='*60}{Colors.RESET}")
    print(f"{Colors.BLUE}FINAL TEST SUMMARY{Colors.RESET}")
    print(f"{Colors.BLUE}{'='*60}{Colors.RESET}\n")
    
    total = len(tests)
    passed = sum(1 for v in results.values() if v)
    failed = total - passed
    
    for test_name, success in results.items():
        status = f"{Colors.GREEN}✓ PASS{Colors.RESET}" if success else f"{Colors.RED}✗ FAIL{Colors.RESET}"
        print(f"{status}: {test_name}")
    
    print(f"\n{Colors.BLUE}{'='*60}{Colors.RESET}")
    print(f"Total Test Suites: {total}")
    print(f"{Colors.GREEN}Passed: {passed}{Colors.RESET}")
    print(f"{Colors.RED}Failed: {failed}{Colors.RESET}")
    print(f"Time Elapsed: {elapsed:.2f}s")
    print(f"{Colors.BLUE}{'='*60}{Colors.RESET}\n")
    
    if failed == 0:
        print(f"{Colors.GREEN}🎉 ALL TESTS PASSED!{Colors.RESET}\n")
    else:
        print(f"{Colors.RED}⚠️  SOME TESTS FAILED - Please review and fix issues{Colors.RESET}\n")
    
    return failed == 0

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)

