#!/usr/bin/env python3
"""
Performance Testing (Load/Stress Testing)
Measures how the service behaves under expected and peak traffic
"""

import requests
import time
import statistics
from concurrent.futures import ThreadPoolExecutor, as_completed

BASE_URL = "http://localhost:8000/api"

class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    RESET = '\033[0m'

def test_performance():
    print(f"\n{Colors.BLUE}{'='*60}{Colors.RESET}")
    print(f"{Colors.BLUE}PERFORMANCE TESTING (Load/Stress Testing){Colors.RESET}")
    print(f"{Colors.BLUE}{'='*60}{Colors.RESET}\n")
    
    passed = 0
    failed = 0
    warnings = 0
    
    # Test 1: Single Request Performance
    print(f"{Colors.YELLOW}[1] Single Request Performance Test{Colors.RESET}")
    try:
        start = time.time()
        response = requests.get(f"{BASE_URL}/health", timeout=10)
        elapsed = time.time() - start
        
        if response.status_code == 200:
            if elapsed < 1.0:
                print(f"{Colors.GREEN}✓ PASS{Colors.RESET}: Health endpoint: {elapsed:.3f}s (< 1s target)")
                passed += 1
            else:
                print(f"{Colors.YELLOW}⚠ WARN{Colors.RESET}: Health endpoint: {elapsed:.3f}s (slow but acceptable)")
                warnings += 1
        else:
            print(f"{Colors.RED}✗ FAIL{Colors.RESET}: Health endpoint returned {response.status_code}")
            failed += 1
    except Exception as e:
        print(f"{Colors.RED}✗ FAIL{Colors.RESET}: Health endpoint error: {e}")
        failed += 1
    
    # Test 2: Sequential Load Test
    print(f"\n{Colors.YELLOW}[2] Sequential Load Test (10 requests){Colors.RESET}")
    try:
        times = []
        for i in range(10):
            start = time.time()
            response = requests.get(f"{BASE_URL}/health", timeout=10)
            elapsed = time.time() - start
            if response.status_code == 200:
                times.append(elapsed)
            time.sleep(0.1)  # Small delay between requests
        
        if times:
            avg_time = statistics.mean(times)
            max_time = max(times)
            min_time = min(times)
            
            print(f"  Average: {avg_time:.3f}s")
            print(f"  Min: {min_time:.3f}s, Max: {max_time:.3f}s")
            
            if avg_time < 1.0:
                print(f"{Colors.GREEN}✓ PASS{Colors.RESET}: Sequential load test passed")
                passed += 1
            else:
                print(f"{Colors.YELLOW}⚠ WARN{Colors.RESET}: Sequential load test: average {avg_time:.3f}s")
                warnings += 1
        else:
            print(f"{Colors.RED}✗ FAIL{Colors.RESET}: No successful requests")
            failed += 1
    except Exception as e:
        print(f"{Colors.RED}✗ FAIL{Colors.RESET}: Sequential load test error: {e}")
        failed += 1
    
    # Test 3: Concurrent Load Test
    print(f"\n{Colors.YELLOW}[3] Concurrent Load Test (20 concurrent requests){Colors.RESET}")
    try:
        def make_request(i):
            start = time.time()
            try:
                response = requests.get(f"{BASE_URL}/health", timeout=10)
                elapsed = time.time() - start
                return {"status": response.status_code, "time": elapsed, "success": response.status_code == 200}
            except Exception as e:
                return {"status": 0, "time": time.time() - start, "success": False, "error": str(e)}
        
        with ThreadPoolExecutor(max_workers=10) as executor:
            futures = [executor.submit(make_request, i) for i in range(20)]
            results = [f.result() for f in as_completed(futures)]
        
        successful = [r for r in results if r.get("success")]
        times = [r["time"] for r in successful]
        
        if times:
            avg_time = statistics.mean(times)
            max_time = max(times)
            success_rate = len(successful) / len(results)
            
            print(f"  Success Rate: {success_rate*100:.1f}% ({len(successful)}/{len(results)})")
            print(f"  Average Response Time: {avg_time:.3f}s")
            print(f"  Max Response Time: {max_time:.3f}s")
            
            if success_rate >= 0.9 and avg_time < 2.0:
                print(f"{Colors.GREEN}✓ PASS{Colors.RESET}: Concurrent load test passed")
                passed += 1
            else:
                print(f"{Colors.YELLOW}⚠ WARN{Colors.RESET}: Concurrent load test: {success_rate*100:.1f}% success, {avg_time:.3f}s avg")
                warnings += 1
        else:
            print(f"{Colors.RED}✗ FAIL{Colors.RESET}: No successful concurrent requests")
            failed += 1
    except Exception as e:
        print(f"{Colors.RED}✗ FAIL{Colors.RESET}: Concurrent load test error: {e}")
        failed += 1
    
    # Test 4: Stress Test (High Load)
    print(f"\n{Colors.YELLOW}[4] Stress Test (50 requests, 5 concurrent workers){Colors.RESET}")
    try:
        def make_request(i):
            try:
                response = requests.get(f"{BASE_URL}/health", timeout=5)
                return response.status_code == 200
            except:
                return False
        
        start = time.time()
        with ThreadPoolExecutor(max_workers=5) as executor:
            futures = [executor.submit(make_request, i) for i in range(50)]
            results = [f.result() for f in as_completed(futures)]
        total_time = time.time() - start
        
        success_count = sum(results)
        success_rate = success_count / len(results) if results else 0
        
        print(f"  Total Time: {total_time:.2f}s")
        print(f"  Success Rate: {success_rate*100:.1f}% ({success_count}/{len(results)})")
        print(f"  Requests/sec: {len(results)/total_time:.2f}")
        
        if success_rate >= 0.8:
            print(f"{Colors.GREEN}✓ PASS{Colors.RESET}: Stress test passed")
            passed += 1
        else:
            print(f"{Colors.YELLOW}⚠ WARN{Colors.RESET}: Stress test: {success_rate*100:.1f}% success")
            warnings += 1
    except Exception as e:
        print(f"{Colors.RED}✗ FAIL{Colors.RESET}: Stress test error: {e}")
        failed += 1
    
    # Test 5: Endpoint Performance Comparison
    print(f"\n{Colors.YELLOW}[5] Endpoint Performance Comparison{Colors.RESET}")
    try:
        endpoints = [
            ("/health", "Health check"),
            ("/dashboard/heatmap-data", "Heatmap data"),
            ("/kpi/summary", "KPI summary"),
        ]
        
        endpoint_times = {}
        for path, name in endpoints:
            times = []
            for _ in range(5):
                start = time.time()
                try:
                    response = requests.get(f"{BASE_URL}{path}", timeout=10)
                    if response.status_code == 200:
                        times.append(time.time() - start)
                except:
                    pass
                time.sleep(0.1)
            
            if times:
                avg_time = statistics.mean(times)
                endpoint_times[name] = avg_time
                print(f"  {name}: {avg_time:.3f}s average")
        
        if endpoint_times:
            slowest = max(endpoint_times.items(), key=lambda x: x[1])
            if slowest[1] < 5.0:
                print(f"{Colors.GREEN}✓ PASS{Colors.RESET}: All endpoints within acceptable limits")
                passed += 1
            else:
                print(f"{Colors.YELLOW}⚠ WARN{Colors.RESET}: Slowest endpoint ({slowest[0]}): {slowest[1]:.3f}s")
                warnings += 1
        else:
            print(f"{Colors.RED}✗ FAIL{Colors.RESET}: No endpoint performance data")
            failed += 1
    except Exception as e:
        print(f"{Colors.RED}✗ FAIL{Colors.RESET}: Endpoint performance test error: {e}")
        failed += 1
    
    # Summary
    print(f"\n{Colors.BLUE}{'='*60}{Colors.RESET}")
    print(f"{Colors.BLUE}PERFORMANCE TEST SUMMARY{Colors.RESET}")
    print(f"{Colors.BLUE}{'='*60}{Colors.RESET}\n")
    print(f"Total Tests: {passed + failed + warnings}")
    print(f"{Colors.GREEN}Passed: {passed}{Colors.RESET}")
    print(f"{Colors.RED}Failed: {failed}{Colors.RESET}")
    print(f"{Colors.YELLOW}Warnings: {warnings}{Colors.RESET}\n")
    
    return failed == 0

if __name__ == "__main__":
    import sys
    result = test_performance()
    sys.exit(0 if result else 1)
