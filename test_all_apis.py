#!/usr/bin/env python3
"""
Comprehensive API test script with timeouts.
Tests all GET and POST endpoints for both frontend and backend.
"""

import asyncio
import json
import sys
from typing import Dict, List, Any
import aiohttp
from datetime import datetime

BASE_URL = "http://localhost:8000"
TIMEOUT = 5  # 5 second timeout for each request

# Test results storage
results: Dict[str, Any] = {
    "timestamp": datetime.now().isoformat(),
    "passed": [],
    "failed": [],
    "skipped": []
}

async def test_endpoint(session: aiohttp.ClientSession, method: str, url: str, 
                       data: Dict = None, description: str = "") -> Dict[str, Any]:
    """Test a single endpoint with timeout."""
    try:
        timeout = aiohttp.ClientTimeout(total=TIMEOUT)
        start_time = datetime.now()
        
        if method.upper() == "GET":
            async with session.get(url, timeout=timeout) as response:
                elapsed = (datetime.now() - start_time).total_seconds()
                try:
                    response_data = await response.json()
                except:
                    response_data = await response.text()
                
                return {
                    "method": method,
                    "url": url,
                    "description": description,
                    "status": response.status,
                    "elapsed": f"{elapsed:.2f}s",
                    "success": 200 <= response.status < 300,
                    "data": response_data if isinstance(response_data, dict) else None,
                    "error": None
                }
        elif method.upper() == "POST":
            async with session.post(url, json=data, timeout=timeout) as response:
                elapsed = (datetime.now() - start_time).total_seconds()
                try:
                    response_data = await response.json()
                except:
                    response_data = await response.text()
                
                return {
                    "method": method,
                    "url": url,
                    "description": description,
                    "status": response.status,
                    "elapsed": f"{elapsed:.2f}s",
                    "success": 200 <= response.status < 400,
                    "data": response_data if isinstance(response_data, dict) else None,
                    "error": None
                }
        elif method.upper() == "PUT":
            async with session.put(url, json=data, timeout=timeout) as response:
                elapsed = (datetime.now() - start_time).total_seconds()
                try:
                    response_data = await response.json()
                except:
                    response_data = await response.text()
                
                return {
                    "method": method,
                    "url": url,
                    "description": description,
                    "status": response.status,
                    "elapsed": f"{elapsed:.2f}s",
                    "success": 200 <= response.status < 400,
                    "data": response_data if isinstance(response_data, dict) else None,
                    "error": None
                }
    except asyncio.TimeoutError:
        return {
            "method": method,
            "url": url,
            "description": description,
            "status": None,
            "elapsed": f">{TIMEOUT}s",
            "success": False,
            "data": None,
            "error": f"Timeout after {TIMEOUT} seconds"
        }
    except Exception as e:
        return {
            "method": method,
            "url": url,
            "description": description,
            "status": None,
            "elapsed": "0s",
            "success": False,
            "data": None,
            "error": str(e)
        }

async def run_all_tests():
    """Run all API tests."""
    print("🧪 Starting comprehensive API tests...")
    print(f"⏱️  Timeout: {TIMEOUT} seconds per request\n")
    
    async with aiohttp.ClientSession() as session:
        # Test endpoints list
        tests = [
            # Forms API - GET
            ("GET", f"{BASE_URL}/api/forms", None, "List all forms"),
            ("GET", f"{BASE_URL}/api/forms?status=active", None, "List active forms"),
            ("GET", f"{BASE_URL}/api/forms/labuan-company-management-license", None, "Get form by ID"),
            ("GET", f"{BASE_URL}/api/forms/labuan-company-management-license/schema", None, "Get form schema"),
            
            # Submissions API - GET
            ("GET", f"{BASE_URL}/api/submissions", None, "List all submissions"),
            
            # Admin API - GET
            ("GET", f"{BASE_URL}/api/admin/submissions", None, "Admin: List all submissions"),
            ("GET", f"{BASE_URL}/api/admin/submissions?status=draft", None, "Admin: List draft submissions"),
            ("GET", f"{BASE_URL}/api/admin/statistics", None, "Admin: Get statistics"),
            
            # Forms API - POST (Create form)
            ("POST", f"{BASE_URL}/api/forms", {
                "form_id": "test-form-123",
                "name": "Test Form",
                "description": "Test form for API testing",
                "category": "Testing",
                "version": "1.0.0",
                "schema_data": {
                    "formId": "test-form-123",
                    "formName": "Test Form",
                    "version": "1.0.0",
                    "steps": [
                        {
                            "stepId": "step-1",
                            "stepName": "Step 1",
                            "stepOrder": 1,
                            "fields": [
                                {
                                    "fieldId": "field-1",
                                    "fieldType": "text",
                                    "fieldName": "test_field",
                                    "label": "Test Field",
                                    "required": False
                                }
                            ]
                        }
                    ]
                },
                "is_active": False,
                "requires_auth": False,
                "estimated_time": "5 minutes"
            }, "Create new form"),
            
            # Submissions API - POST (Submit form)
            ("POST", f"{BASE_URL}/api/forms/labuan-company-management-license/submit", {
                "data": {
                    "test": "data"
                }
            }, "Submit form"),
            
            # Submissions API - POST (Save draft)
            ("POST", f"{BASE_URL}/api/forms/labuan-company-management-license/draft", {
                "data": {
                    "draft": "data"
                }
            }, "Save draft submission"),
            
            # Admin API - POST (Seed sample form)
            ("POST", f"{BASE_URL}/api/admin/seed-sample-form", None, "Admin: Seed sample form"),
        ]
        
        # Run all tests
        for method, url, data, description in tests:
            print(f"Testing: {method} {url}")
            result = await test_endpoint(session, method, url, data, description)
            
            if result["success"]:
                results["passed"].append(result)
                print(f"  ✅ PASSED ({result['elapsed']}) - Status: {result['status']}")
            else:
                results["failed"].append(result)
                error_msg = result.get("error", f"Status: {result['status']}")
                print(f"  ❌ FAILED ({result['elapsed']}) - {error_msg}")
            print()
        
        # Test PUT endpoints (need existing submission ID)
        # First, get submissions to find an ID
        print("Testing PUT endpoints...")
        get_submissions_result = await test_endpoint(
            session, "GET", f"{BASE_URL}/api/submissions", None, "Get submissions for PUT test"
        )
        
        if get_submissions_result["success"] and get_submissions_result.get("data"):
            submissions = get_submissions_result["data"]
            if isinstance(submissions, list) and len(submissions) > 0:
                submission_id = submissions[0].get("submissionId") or submissions[0].get("id")
                if submission_id:
                    # Test update draft
                    put_result = await test_endpoint(
                        session, "PUT", 
                        f"{BASE_URL}/api/submissions/{submission_id}/draft",
                        {"data": {"updated": "data"}},
                        "Update draft submission"
                    )
                    if put_result["success"]:
                        results["passed"].append(put_result)
                        print(f"  ✅ PUT draft PASSED ({put_result['elapsed']})")
                    else:
                        results["failed"].append(put_result)
                        print(f"  ❌ PUT draft FAILED - {put_result.get('error', 'Unknown error')}")
                    
                    # Test admin review submission
                    admin_put_result = await test_endpoint(
                        session, "PUT",
                        f"{BASE_URL}/api/admin/submissions/{submission_id}",
                        {"status": "under-review", "review_notes": "Test review"},
                        "Admin: Review submission"
                    )
                    if admin_put_result["success"]:
                        results["passed"].append(admin_put_result)
                        print(f"  ✅ Admin PUT PASSED ({admin_put_result['elapsed']})")
                    else:
                        results["failed"].append(admin_put_result)
                        print(f"  ❌ Admin PUT FAILED - {admin_put_result.get('error', 'Unknown error')}")
                else:
                    print("  ⚠️  SKIPPED: No submission ID found")
                    results["skipped"].append({
                        "reason": "No submission ID found for PUT tests",
                        "url": "PUT endpoints"
                    })
            else:
                print("  ⚠️  SKIPPED: No submissions available for PUT tests")
                results["skipped"].append({
                    "reason": "No submissions available",
                    "url": "PUT endpoints"
                })
        else:
            print("  ⚠️  SKIPPED: Could not fetch submissions for PUT tests")
            results["skipped"].append({
                "reason": "Could not fetch submissions",
                "url": "PUT endpoints"
            })
    
    # Print summary
    print("\n" + "="*60)
    print("📊 TEST SUMMARY")
    print("="*60)
    print(f"✅ Passed: {len(results['passed'])}")
    print(f"❌ Failed: {len(results['failed'])}")
    print(f"⚠️  Skipped: {len(results['skipped'])}")
    print(f"📈 Success Rate: {len(results['passed'])/(len(results['passed'])+len(results['failed']))*100:.1f}%")
    
    if results['failed']:
        print("\n❌ FAILED TESTS:")
        for test in results['failed']:
            print(f"  - {test['method']} {test['url']}")
            print(f"    Error: {test.get('error', f'Status {test.get("status")}')}")
    
    if results['skipped']:
        print("\n⚠️  SKIPPED TESTS:")
        for test in results['skipped']:
            print(f"  - {test.get('url', 'Unknown')}: {test.get('reason', 'Unknown reason')}")
    
    # Save results to file
    with open("test_results.json", "w") as f:
        json.dump(results, f, indent=2)
    
    print(f"\n📄 Detailed results saved to: test_results.json")
    
    # Exit with error code if any tests failed
    sys.exit(0 if len(results['failed']) == 0 else 1)

if __name__ == "__main__":
    asyncio.run(run_all_tests())

