# Form Testing Guide

## Overview

This guide provides a comprehensive testing plan for the 23 forms that have been added to the system. All forms are currently **INACTIVE** and need to be tested and activated through the admin panel.

## Testing Prerequisites

1. **GitHub Pages Deployment**: Ensure the latest code is deployed to GitHub Pages
2. **Admin Access**: Have admin credentials ready
3. **User Account**: Have a test user account ready
4. **GitHub API Access**: Ensure `GH_PAT` secret is configured in GitHub Actions

## Testing Phases

### Phase 1: Admin Panel - Form Management Testing

#### 1.1 View All Forms

**Steps:**
1. Navigate to: `https://clkhoo5211.github.io/shiny-couscous/admin/login`
2. Login with admin credentials
3. Navigate to "Forms" section
4. Verify all 23 forms are listed

**Expected Results:**
- ✅ All 23 forms visible in the forms list
- ✅ Forms show correct names, categories, and status (Inactive)
- ✅ Forms can be filtered by category
- ✅ Forms can be searched by name

**Test Checklist:**
- [ ] All 23 forms appear in the list
- [ ] Form names match expected names
- [ ] Categories are correctly assigned
- [ ] Status shows "Inactive" for all forms
- [ ] Search functionality works
- [ ] Filter by category works

#### 1.2 View Form Details

**Steps:**
1. Click on any form from the list
2. View form details page

**Expected Results:**
- ✅ Form metadata displays correctly (name, description, category, version)
- ✅ Form schema is visible
- ✅ Form steps are listed
- ✅ Form fields are visible in each step

**Test Checklist:**
- [ ] Form details page loads correctly
- [ ] All form metadata displays
- [ ] Schema structure is correct
- [ ] Steps are numbered correctly
- [ ] Fields are visible in each step
- [ ] Field types are correct (text-input, radio, checkbox, file-upload, etc.)

#### 1.3 Edit Form Schema (Optional)

**Steps:**
1. Click "Edit" on a form
2. Modify form schema (if needed)
3. Save changes

**Expected Results:**
- ✅ Form schema can be edited
- ✅ Changes are saved to GitHub
- ✅ Changes reflect immediately in the form view

**Test Checklist:**
- [ ] Edit form opens correctly
- [ ] Schema editor works
- [ ] Changes can be saved
- [ ] Changes persist after page refresh

#### 1.4 Activate Forms

**Steps:**
1. Select a form to activate (start with a simple one like "Complaint Form")
2. Click "Activate" or toggle "isActive" to true
3. Save changes

**Expected Results:**
- ✅ Form status changes to "Active"
- ✅ Form becomes visible in user frontend
- ✅ Changes are saved to GitHub

**Test Checklist:**
- [ ] Form can be activated
- [ ] Status updates correctly
- [ ] Active forms appear in user frontend
- [ ] Inactive forms do not appear in user frontend

**Recommended Activation Order:**
1. **Complaint Form - Labuan FSA** (simplest, may not require auth)
2. **Application for Surrender of Licence** (simple, 3 steps)
3. **Application for Cessation of Labuan Leasing Company** (simple, 2 steps)
4. **Re-assessment for the Appointment of Principal Officer** (simple, 3 steps)
5. Then proceed with more complex forms

---

### Phase 2: User Frontend - Form Rendering Testing

#### 2.1 View Available Forms

**Steps:**
1. Navigate to: `https://clkhoo5211.github.io/shiny-couscous/login`
2. Login with user credentials
3. Navigate to "Forms" or "Submissions" section
4. View list of available forms

**Expected Results:**
- ✅ Only **ACTIVE** forms are visible
- ✅ Forms show correct names and descriptions
- ✅ Forms can be filtered by category
- ✅ Forms can be searched

**Test Checklist:**
- [ ] Only active forms appear
- [ ] Inactive forms do not appear
- [ ] Form names and descriptions are correct
- [ ] Category filters work
- [ ] Search functionality works

#### 2.2 Open Form for Filling

**Steps:**
1. Click on an active form
2. Form should open in the dynamic form renderer

**Expected Results:**
- ✅ Form loads correctly
- ✅ All steps are visible
- ✅ Step navigation works (Next/Previous buttons)
- ✅ Progress indicator shows current step
- ✅ Form fields render correctly

**Test Checklist:**
- [ ] Form opens without errors
- [ ] All steps are visible
- [ ] Step navigation works
- [ ] Progress indicator is accurate
- [ ] Fields render with correct types
- [ ] Required fields are marked
- [ ] Field labels are correct
- [ ] Placeholders are shown where applicable

#### 2.3 Test Form Field Types

**For each form, test all field types:**

**Text Input Fields:**
- [ ] Text input accepts text
- [ ] Email input validates email format
- [ ] Tel input accepts phone numbers
- [ ] Required fields show validation errors
- [ ] Placeholders display correctly

**Radio Buttons:**
- [ ] Only one option can be selected
- [ ] Selection is saved when navigating steps
- [ ] Required radio fields show validation errors

**Checkboxes:**
- [ ] Multiple options can be selected
- [ ] Selections are saved when navigating steps
- [ ] Required checkbox fields show validation errors

**Select/Dropdown:**
- [ ] Dropdown opens correctly
- [ ] Options are selectable
- [ ] Selected value is displayed
- [ ] Required select fields show validation errors

**Textarea:**
- [ ] Textarea accepts multi-line text
- [ ] Text is saved when navigating steps
- [ ] Required textarea fields show validation errors

**Date Picker:**
- [ ] Date picker opens correctly
- [ ] Date can be selected
- [ ] Selected date is displayed
- [ ] Required date fields show validation errors

**File Upload:**
- [ ] File upload button works
- [ ] Files can be selected
- [ ] File size validation works (10MB limit)
- [ ] File type validation works (PDF, DOC, DOCX, JPG, PNG)
- [ ] Multiple files can be uploaded (where applicable)
- [ ] Uploaded files are displayed
- [ ] Files can be removed

**Help Text:**
- [ ] Help text displays correctly
- [ ] Formatting is preserved (line breaks, etc.)
- [ ] Styling is applied correctly

**Conditional Display:**
- [ ] Fields show/hide based on conditions
- [ ] Conditional logic works correctly
- [ ] Hidden fields are not submitted

**Test Checklist per Form:**
- [ ] All field types render correctly
- [ ] Field validation works
- [ ] Required fields are enforced
- [ ] Conditional fields work
- [ ] Data persists when navigating between steps

---

### Phase 3: Form Submission Testing

#### 3.1 Fill Out Form

**Steps:**
1. Open an active form
2. Fill out all required fields
3. Navigate through all steps
4. Upload supporting documents (if required)
5. Review form before submission

**Expected Results:**
- ✅ Form data is saved as draft (auto-save)
- ✅ All steps can be completed
- ✅ Form validation works
- ✅ File uploads work
- ✅ Review page shows all entered data

**Test Checklist:**
- [ ] Can fill out all required fields
- [ ] Can navigate through all steps
- [ ] Draft is auto-saved
- [ ] File uploads work
- [ ] Review page shows correct data
- [ ] Can go back and edit previous steps

#### 3.2 Submit Form

**Steps:**
1. Complete all required fields
2. Click "Submit" button
3. Confirm submission

**Expected Results:**
- ✅ Form submits successfully
- ✅ Success message is displayed
- ✅ Submission is saved to GitHub (`backend/data/submissions.json`)
- ✅ Submission ID is generated
- ✅ Submission status is "submitted"
- ✅ User is redirected to submissions page

**Test Checklist:**
- [ ] Form submits without errors
- [ ] Success message appears
- [ ] Submission is saved to GitHub
- [ ] Submission appears in user's submissions list
- [ ] Submission has correct status
- [ ] Submission ID is unique

#### 3.3 Verify Submission in GitHub

**Steps:**
1. Check GitHub repository: `backend/data/submissions.json`
2. Verify submission was saved

**Expected Results:**
- ✅ Submission JSON is added to `submissions.json`
- ✅ All form data is present
- ✅ File references are correct
- ✅ Timestamps are correct
- ✅ User ID is correct

**Test Checklist:**
- [ ] Submission exists in `submissions.json`
- [ ] All form data is present
- [ ] File references are correct
- [ ] Metadata is correct (timestamp, user ID, form ID)

---

### Phase 4: Admin Panel - Submission Review Testing

#### 4.1 View Submissions

**Steps:**
1. Login to admin panel
2. Navigate to "Submissions" section
3. View list of submissions

**Expected Results:**
- ✅ All submissions are visible
- ✅ Submissions can be filtered by form, status, date
- ✅ Submission details are displayed

**Test Checklist:**
- [ ] Submissions list loads
- [ ] All submissions are visible
- [ ] Filtering works
- [ ] Sorting works
- [ ] Pagination works (if many submissions)

#### 4.2 Review Submission

**Steps:**
1. Click on a submission
2. View submission details
3. Review form data
4. Download attached files (if any)

**Expected Results:**
- ✅ Submission details page loads
- ✅ All form data is displayed correctly
- ✅ Files can be downloaded
- ✅ Submission status is visible
- ✅ User information is visible

**Test Checklist:**
- [ ] Submission details page loads
- [ ] All form data is displayed
- [ ] File downloads work
- [ ] Status is correct
- [ ] User information is correct

#### 4.3 Approve/Reject Submission

**Steps:**
1. Review a submission
2. Click "Approve" or "Reject"
3. Add comments (if required)
4. Confirm action

**Expected Results:**
- ✅ Submission status updates
- ✅ Status change is saved to GitHub
- ✅ User is notified (if notification system exists)
- ✅ Comments are saved

**Test Checklist:**
- [ ] Can approve submission
- [ ] Can reject submission
- [ ] Status updates correctly
- [ ] Comments are saved
- [ ] Changes persist after page refresh

---

### Phase 5: Error Handling Testing

#### 5.1 Test Error Scenarios

**Network Errors:**
- [ ] Form handles GitHub API errors gracefully
- [ ] Error messages are user-friendly
- [ ] Form data is not lost on error
- [ ] Retry mechanism works (if implemented)

**Validation Errors:**
- [ ] Required fields show errors
- [ ] Invalid email format shows error
- [ ] File size limit shows error
- [ ] Invalid file type shows error
- [ ] Date validation works

**Edge Cases:**
- [ ] Very long text in text fields
- [ ] Special characters in text fields
- [ ] Large file uploads (>10MB)
- [ ] Multiple file uploads
- [ ] Form submission with missing required fields
- [ ] Form submission with invalid data

**Test Checklist:**
- [ ] All error scenarios are handled
- [ ] Error messages are clear
- [ ] User can recover from errors
- [ ] Form data is preserved on errors

---

### Phase 6: Performance Testing

#### 6.1 Form Loading Performance

**Steps:**
1. Open multiple forms
2. Measure load times
3. Test with slow network (throttle in browser DevTools)

**Expected Results:**
- ✅ Forms load within 2-3 seconds
- ✅ Forms work on slow networks
- ✅ Large forms (many steps) load correctly

**Test Checklist:**
- [ ] Forms load quickly
- [ ] Forms work on slow networks
- [ ] No performance issues with large forms

#### 6.2 Submission Performance

**Steps:**
1. Submit forms with large file uploads
2. Measure submission time
3. Test multiple simultaneous submissions

**Expected Results:**
- ✅ Submissions complete within reasonable time
- ✅ Large file uploads work
- ✅ Multiple submissions don't cause issues

**Test Checklist:**
- [ ] Submissions complete quickly
- [ ] Large file uploads work
- [ ] Multiple submissions work

---

## Testing Checklist Summary

### Admin Panel Testing
- [ ] View all 23 forms
- [ ] View form details
- [ ] Edit form schema (optional)
- [ ] Activate forms (start with simple ones)
- [ ] View submissions
- [ ] Review submissions
- [ ] Approve/reject submissions

### User Frontend Testing
- [ ] View available (active) forms
- [ ] Open form for filling
- [ ] Test all field types
- [ ] Fill out form completely
- [ ] Submit form
- [ ] Verify submission in GitHub
- [ ] View submission in user dashboard

### Error Handling
- [ ] Network errors
- [ ] Validation errors
- [ ] Edge cases

### Performance
- [ ] Form loading
- [ ] Form submission
- [ ] File uploads

---

## Recommended Testing Order

### Week 1: Basic Forms
1. **Complaint Form - Labuan FSA** (simplest, 3 steps)
2. **Application for Surrender of Licence** (3 steps)
3. **Application for Cessation of Labuan Leasing Company** (2 steps)
4. **Re-assessment for the Appointment of Principal Officer** (3 steps)

### Week 2: Medium Complexity Forms
5. **Application for Change of Shareholder** (4 steps)
6. **Application for Establishment of Office** (4 steps)
7. **Application for Surrender of Licence** (3 steps)

### Week 3: Complex Forms
8. **Application Form - Payment System Operator** (3 steps, but complex fields)
9. **Application for Appointment of Director, PO, TO and Other Officers** (5 steps)
10. **Application for Approval to Conduct Subsequent Leasing** (7 steps)
11. **Application for Establishment of Islamic Window** (5 steps)

### Week 4: Large Business Forms
12. **Form LBB - Labuan Banking Business** (3 steps, basic version)
13. **Form LFB - Labuan Leasing Business** (3 steps, basic version)
14. **Form LIB - Labuan Insurance Business** (3 steps, basic version)
15. Continue with remaining forms...

---

## Testing Tools

### Browser DevTools
- **Network Tab**: Monitor API calls to GitHub
- **Console Tab**: Check for JavaScript errors
- **Application Tab**: Check localStorage for drafts
- **Performance Tab**: Measure load times

### GitHub Repository
- **Check `backend/data/forms.json`**: Verify forms are stored correctly
- **Check `backend/data/submissions.json`**: Verify submissions are saved
- **Check GitHub Actions**: Verify deployments are successful

### Test Data
- **Test User Account**: Create a dedicated test user
- **Test Admin Account**: Use admin credentials
- **Test Files**: Prepare sample PDFs, images for upload testing

---

## Common Issues and Solutions

### Issue: Form not appearing in user frontend
**Solution**: Check if form is activated (`isActive: true`) in admin panel

### Issue: Form submission fails
**Solution**: 
- Check GitHub API token (`GH_PAT`) is configured
- Check browser console for errors
- Verify form data is valid JSON

### Issue: File upload fails
**Solution**:
- Check file size (must be <10MB)
- Check file type (must be PDF, DOC, DOCX, JPG, PNG)
- Check GitHub API token has write permissions

### Issue: Form fields not rendering
**Solution**:
- Check form schema is valid JSON
- Check browser console for errors
- Verify field types are supported

---

## Reporting Issues

When reporting issues, include:
1. **Form Name**: Which form has the issue
2. **Step Number**: Which step in the form
3. **Field Name**: Which field has the issue
4. **Error Message**: Exact error message (if any)
5. **Browser**: Browser and version
6. **Steps to Reproduce**: Detailed steps to reproduce the issue
7. **Screenshots**: Screenshots of the issue
8. **Console Logs**: Browser console errors

---

## Next Steps After Testing

1. **Fix Issues**: Address any bugs or issues found during testing
2. **Enhance Forms**: Add additional sections/fields to forms as needed
3. **Activate Forms**: Activate forms that pass testing
4. **User Training**: Provide training to users on how to use the forms
5. **Documentation**: Update user documentation with form-specific instructions

---

**Last Updated**: 2025-11-19
**Maintained By**: Development Team

