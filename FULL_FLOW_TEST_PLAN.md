# Full Flow Test Plan

## 1. User Frontend Flow
- [x] Register new user
- [x] Login as user
- [x] Fill form (all required and optional fields)
- [x] Save draft
- [x] Navigate to submissions page
- [x] Re-edit draft from submissions page
- [x] Fill all form fields completely
- [x] Submit form
- [x] Verify submission appears in submissions page with all fields
- [x] Verify three entries exist: draft, submitted, and re-edited rejected submission

## 2. Admin Backend Flow
- [x] Login as admin
- [x] View user drafts
- [x] View user submissions
- [x] Edit form schema
- [x] Create new form
- [x] Delete user draft (using standardized confirmation dialog)
- [x] Approve user submitted form
- [x] Reject user submitted form

## 3. Auth Flow Verification
- [x] Login as admin
- [x] Manually change URL to user frontend route (e.g., /submissions)
- [x] Verify admin session is NOT shown (redirects to /admin)
- [x] Verify cannot access user pages (should redirect to /admin)
- [x] Login as user
- [x] Manually change URL to admin backend route (e.g., /admin)
- [x] Verify user session is NOT shown (redirects to /admin/login)
- [x] Verify cannot access admin pages (should redirect to /admin/login)

## 4. Verification in submissions.json
- [x] All submissions saved correctly
- [x] All deletions reflected in JSON
- [x] All approvals reflected in JSON
- [x] All rejections reflected in JSON
- [x] All form fields stored correctly

