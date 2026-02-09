#!/usr/bin/env python3
"""
Database Testing Script
Validates data consistency, integrity, and MongoDB connections
"""

from motor.motor_asyncio import AsyncIOMotorClient
import asyncio
from datetime import datetime
import sys

MONGO_URL = "mongodb://localhost:27017"
DB_NAME = "citizen_assistance"

class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    RESET = '\033[0m'

async def test_database():
    print(f"\n{Colors.BLUE}{'='*60}{Colors.RESET}")
    print(f"{Colors.BLUE}DATABASE TESTING{Colors.RESET}")
    print(f"{Colors.BLUE}{'='*60}{Colors.RESET}\n")
    
    passed = 0
    failed = 0
    
    try:
        # Connect to MongoDB
        client = AsyncIOMotorClient(MONGO_URL, serverSelectionTimeoutMS=5000)
        db = client[DB_NAME]
        
        # Test 1: Connection
        print(f"{Colors.YELLOW}[1] Connection Test{Colors.RESET}")
        try:
            await client.admin.command('ping')
            print(f"{Colors.GREEN}✓ PASS{Colors.RESET}: MongoDB connection successful")
            passed += 1
        except Exception as e:
            print(f"{Colors.RED}✗ FAIL{Colors.RESET}: MongoDB connection failed: {e}")
            failed += 1
            return
        
        # Test 2: Collection Existence
        print(f"\n{Colors.YELLOW}[2] Collection Existence Test{Colors.RESET}")
        required_collections = [
            "vahan_data", "kpi_state_general", "kpi_state_service", 
            "kpi_rto_general", "kpi_fleet_vehicles", "tickets"
        ]
        for coll_name in required_collections:
            try:
                count = await db[coll_name].count_documents({})
                print(f"{Colors.GREEN}✓ PASS{Colors.RESET}: Collection '{coll_name}' exists with {count} documents")
                passed += 1
            except Exception as e:
                print(f"{Colors.RED}✗ FAIL{Colors.RESET}: Collection '{coll_name}' error: {e}")
                failed += 1
        
        # Test 3: Data Integrity - Check for required fields
        print(f"\n{Colors.YELLOW}[3] Data Integrity Test{Colors.RESET}")
        
        # Check kpi_state_general
        try:
            sample = await db["kpi_state_general"].find_one({})
            if sample:
                required_fields = ["State", "Month"]
                missing = [f for f in required_fields if f not in sample]
                if missing:
                    print(f"{Colors.YELLOW}⚠ WARN{Colors.RESET}: Missing fields in kpi_state_general: {missing}")
                else:
                    print(f"{Colors.GREEN}✓ PASS{Colors.RESET}: kpi_state_general has required fields")
                    passed += 1
            else:
                print(f"{Colors.YELLOW}⚠ WARN{Colors.RESET}: kpi_state_general is empty")
        except Exception as e:
            print(f"{Colors.RED}✗ FAIL{Colors.RESET}: kpi_state_general integrity check failed: {e}")
            failed += 1
        
        # Test 4: Data Consistency - Check for duplicate months
        print(f"\n{Colors.YELLOW}[4] Data Consistency Test{Colors.RESET}")
        try:
            pipeline = [
                {"$group": {"_id": {"State": "$State", "Month": "$Month"}, "count": {"$sum": 1}}},
                {"$match": {"count": {"$gt": 1}}}
            ]
            duplicates = await db["kpi_state_general"].aggregate(pipeline).to_list(100)
            if duplicates:
                print(f"{Colors.YELLOW}⚠ WARN{Colors.RESET}: Found {len(duplicates)} duplicate state-month combinations")
            else:
                print(f"{Colors.GREEN}✓ PASS{Colors.RESET}: No duplicate state-month combinations")
                passed += 1
        except Exception as e:
            print(f"{Colors.RED}✗ FAIL{Colors.RESET}: Consistency check failed: {e}")
            failed += 1
        
        # Test 5: Data Types Validation
        print(f"\n{Colors.YELLOW}[5] Data Types Validation{Colors.RESET}")
        try:
            sample = await db["kpi_state_general"].find_one({})
            if sample:
                numeric_fields = ["Vehicle Registration", "Revenue - Total"]
                errors = []
                for field in numeric_fields:
                    value = sample.get(field)
                    if value is not None and not isinstance(value, (int, float)):
                        errors.append(f"{field} is not numeric: {type(value)}")
                if errors:
                    print(f"{Colors.YELLOW}⚠ WARN{Colors.RESET}: Data type issues: {errors}")
                else:
                    print(f"{Colors.GREEN}✓ PASS{Colors.RESET}: Numeric fields have correct types")
                    passed += 1
        except Exception as e:
            print(f"{Colors.RED}✗ FAIL{Colors.RESET}: Data type validation failed: {e}")
            failed += 1
        
        # Test 6: Index Check
        print(f"\n{Colors.YELLOW}[6] Index Check{Colors.RESET}")
        try:
            indexes = await db["kpi_state_general"].index_information()
            if indexes:
                print(f"{Colors.GREEN}✓ PASS{Colors.RESET}: Indexes exist: {list(indexes.keys())}")
                passed += 1
            else:
                print(f"{Colors.YELLOW}⚠ WARN{Colors.RESET}: No indexes found")
        except Exception as e:
            print(f"{Colors.RED}✗ FAIL{Colors.RESET}: Index check failed: {e}")
            failed += 1
        
        client.close()
        
    except Exception as e:
        print(f"{Colors.RED}✗ FAIL{Colors.RESET}: Database test failed: {e}")
        failed += 1
    
    # Summary
    print(f"\n{Colors.BLUE}{'='*60}{Colors.RESET}")
    print(f"{Colors.BLUE}DATABASE TEST SUMMARY{Colors.RESET}")
    print(f"{Colors.BLUE}{'='*60}{Colors.RESET}\n")
    print(f"Total Tests: {passed + failed}")
    print(f"{Colors.GREEN}Passed: {passed}{Colors.RESET}")
    print(f"{Colors.RED}Failed: {failed}{Colors.RESET}\n")
    
    return failed == 0

if __name__ == "__main__":
    result = asyncio.run(test_database())
    sys.exit(0 if result else 1)

