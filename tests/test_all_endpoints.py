#!/usr/bin/env python3
"""
Comprehensive API Testing Script
Tests all endpoints for functionality, error handling, and data validation
"""

import requests
import json
import time
from typing import Dict, List, Tuple
from datetime import datetime

BASE_URL = "http://localhost:8000/api"
FRONTEND_URL = "http://localhost:3000"

class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    RESET = '\033[0m'

class APITester:
    def __init__(self):
        self.results = {
            "passed": [],
            "failed": [],
            "warnings": []
        }
        self.start_time = time.time()
    
    def log_pass(self, test_name: str, details: str = ""):
        self.results["passed"].append((test_name, details))
        print(f"{Colors.GREEN}✓ PASS{Colors.RESET}: {test_name}")
        if details:
            print(f"  {details}")
    
    def log_fail(self, test_name: str, error: str):
        self.results["failed"].append((test_name, error))
        print(f"{Colors.RED}✗ FAIL{Colors.RESET}: {test_name}")
        print(f"  Error: {error}")
    
    def log_warning(self, test_name: str, warning: str):
        self.results["warnings"].append((test_name, warning))
        print(f"{Colors.YELLOW}⚠ WARN{Colors.RESET}: {test_name}")
        print(f"  {warning}")
    
    def test_endpoint(self, method: str, path: str, expected_status: int = 200, 
                     params: Dict = None, data: Dict = None, description: str = None, timeout: int = 10) -> Tuple[bool, Dict]:
        """Test a single endpoint"""
        test_name = description or f"{method} {path}"
        url = f"{BASE_URL}{path}"
        
        try:
            if method.upper() == "GET":
                response = requests.get(url, params=params, timeout=timeout)
            elif method.upper() == "POST":
                response = requests.post(url, json=data, params=params, timeout=10)
            elif method.upper() == "PUT":
                response = requests.put(url, json=data, params=params, timeout=10)
            elif method.upper() == "DELETE":
                response = requests.delete(url, params=params, timeout=10)
            else:
                self.log_fail(test_name, f"Unsupported method: {method}")
                return False, {}
            
            # Check status code
            if response.status_code != expected_status:
                self.log_fail(test_name, 
                    f"Expected status {expected_status}, got {response.status_code}. "
                    f"Response: {response.text[:200]}")
                return False, {}
            
            # Try to parse JSON
            try:
                json_data = response.json()
            except:
                json_data = {"raw": response.text}
            
            # Check response time
            response_time = response.elapsed.total_seconds()
            if response_time > 5:
                self.log_warning(test_name, f"Slow response: {response_time:.2f}s")
            
            self.log_pass(test_name, f"Status: {response.status_code}, Time: {response_time:.2f}s")
            return True, json_data
            
        except requests.exceptions.Timeout:
            self.log_fail(test_name, "Request timeout (>10s)")
            return False, {}
        except requests.exceptions.ConnectionError:
            self.log_fail(test_name, "Connection error - is backend running?")
            return False, {}
        except Exception as e:
            self.log_fail(test_name, f"Unexpected error: {str(e)}")
            return False, {}
    
    def run_all_tests(self):
        print(f"\n{Colors.BLUE}{'='*60}{Colors.RESET}")
        print(f"{Colors.BLUE}COMPREHENSIVE API TESTING{Colors.RESET}")
        print(f"{Colors.BLUE}{'='*60}{Colors.RESET}\n")
        
        # 1. Health & Status Checks
        print(f"\n{Colors.YELLOW}[1] Health & Status Checks{Colors.RESET}")
        self.test_endpoint("GET", "/health", description="Health check endpoint", timeout=30)
        self.test_endpoint("GET", "/", description="Root endpoint")
        
        # 2. Dashboard Endpoints
        print(f"\n{Colors.YELLOW}[2] Dashboard Endpoints{Colors.RESET}")
        self.test_endpoint("GET", "/dashboard/heatmap-data", description="Heatmap data")
        self.test_endpoint("GET", "/dashboard/executive-summary", description="Executive summary", timeout=30)
        self.test_endpoint("GET", "/dashboard/geo/states", description="Get states", timeout=30)
        self.test_endpoint("GET", "/dashboard/vahan/kpis", description="Vahan KPIs", timeout=30)
        
        # 3. KPI Endpoints
        print(f"\n{Colors.YELLOW}[3] KPI Endpoints{Colors.RESET}")
        self.test_endpoint("GET", "/kpi/summary", description="KPI summary")
        self.test_endpoint("GET", "/kpi/national/summary", description="National KPI summary")
        self.test_endpoint("GET", "/kpi/state/general", description="State general KPIs")
        self.test_endpoint("GET", "/kpi/state/service-delivery", description="State service delivery")
        self.test_endpoint("GET", "/kpi/rto/general", description="RTO general KPIs")
        self.test_endpoint("GET", "/kpi/executive/summary", description="Executive KPI summary")
        
        # 4. Advanced KPI Endpoints
        print(f"\n{Colors.YELLOW}[4] Advanced KPI Endpoints{Colors.RESET}")
        self.test_endpoint("GET", "/kpi/advanced/mobility-growth", description="Mobility growth KPIs")
        self.test_endpoint("GET", "/kpi/advanced/digital-governance", description="Digital governance KPIs")
        self.test_endpoint("GET", "/kpi/advanced/revenue-intelligence", description="Revenue intelligence KPIs")
        self.test_endpoint("GET", "/kpi/advanced/enforcement-safety", description="Enforcement safety KPIs")
        self.test_endpoint("GET", "/kpi/advanced/policy-effectiveness", description="Policy effectiveness KPIs")
        self.test_endpoint("GET", "/kpi/advanced/rto-performance", description="RTO performance KPIs")
        self.test_endpoint("GET", "/kpi/advanced/internal-efficiency", description="Internal efficiency KPIs")
        self.test_endpoint("GET", "/kpi/advanced/fleet-compliance", description="Fleet compliance KPIs")
        self.test_endpoint("GET", "/kpi/advanced/driver-risk", description="Driver risk KPIs")
        
        # 5. Drill-down Endpoints
        print(f"\n{Colors.YELLOW}[5] Drill-down Endpoints{Colors.RESET}")
        self.test_endpoint("GET", "/kpi/drilldown/national/vehicle-registration", description="National vehicle registration drill-down")
        self.test_endpoint("GET", "/kpi/drilldown/national/revenue", description="National revenue drill-down")
        self.test_endpoint("GET", "/kpi/drilldown/state/breakdown", params={"state": "Delhi"}, description="State breakdown drill-down")
        self.test_endpoint("GET", "/kpi/drilldown/service-delivery", params={"state": "Delhi"}, description="Service delivery drill-down")
        self.test_endpoint("GET", "/kpi/drilldown/revenue-trend", params={"state": "Delhi"}, description="Revenue trend drill-down")
        self.test_endpoint("GET", "/kpi/drilldown/enforcement", params={"state": "Delhi"}, description="Enforcement drill-down")
        self.test_endpoint("GET", "/kpi/drilldown/fleet-vehicles", params={"state": "Delhi"}, description="Fleet vehicles drill-down")
        
        # 6. Insights Endpoints
        print(f"\n{Colors.YELLOW}[6] Insights Endpoints{Colors.RESET}")
        self.test_endpoint("GET", "/kpi/insights", params={"state": "Delhi"}, description="KPI insights")
        self.test_endpoint("GET", "/kpi/advanced/insights", params={"state": "Delhi", "section": "mobility_growth"}, description="Advanced KPI insights")
        
        # 7. Error Handling Tests
        print(f"\n{Colors.YELLOW}[7] Error Handling & Validation Tests{Colors.RESET}")
        self.test_endpoint("GET", "/kpi/drilldown/state/breakdown", params={"state": "InvalidState123"}, 
                          description="Invalid state parameter")
        self.test_endpoint("GET", "/kpi/drilldown/state/breakdown", params={"month": "2020-99"}, 
                          description="Invalid month format")
        self.test_endpoint("GET", "/nonexistent/endpoint", expected_status=404, 
                          description="Non-existent endpoint (should return 404)")
        
        # 8. Performance Tests
        print(f"\n{Colors.YELLOW}[8] Performance Tests{Colors.RESET}")
        start = time.time()
        for i in range(10):
            self.test_endpoint("GET", "/dashboard/heatmap-data", description=f"Load test {i+1}/10")
        total_time = time.time() - start
        avg_time = total_time / 10
        if avg_time > 1:
            self.log_warning("Performance", f"Average response time: {avg_time:.2f}s (target: <1s)")
        else:
            self.log_pass("Performance", f"Average response time: {avg_time:.2f}s")
        
        # Print Summary
        self.print_summary()
    
    def print_summary(self):
        elapsed = time.time() - self.start_time
        print(f"\n{Colors.BLUE}{'='*60}{Colors.RESET}")
        print(f"{Colors.BLUE}TEST SUMMARY{Colors.RESET}")
        print(f"{Colors.BLUE}{'='*60}{Colors.RESET}\n")
        
        total = len(self.results["passed"]) + len(self.results["failed"])
        passed = len(self.results["passed"])
        failed = len(self.results["failed"])
        warnings = len(self.results["warnings"])
        
        print(f"Total Tests: {total}")
        print(f"{Colors.GREEN}Passed: {passed}{Colors.RESET}")
        print(f"{Colors.RED}Failed: {failed}{Colors.RESET}")
        print(f"{Colors.YELLOW}Warnings: {warnings}{Colors.RESET}")
        print(f"Time Elapsed: {elapsed:.2f}s\n")
        
        if failed > 0:
            print(f"{Colors.RED}Failed Tests:{Colors.RESET}")
            for test_name, error in self.results["failed"]:
                print(f"  - {test_name}: {error}")
        
        if warnings > 0:
            print(f"\n{Colors.YELLOW}Warnings:{Colors.RESET}")
            for test_name, warning in self.results["warnings"]:
                print(f"  - {test_name}: {warning}")
        
        print(f"\n{Colors.BLUE}{'='*60}{Colors.RESET}\n")
        
        return failed == 0

if __name__ == "__main__":
    tester = APITester()
    success = tester.run_all_tests()
    exit(0 if success else 1)

