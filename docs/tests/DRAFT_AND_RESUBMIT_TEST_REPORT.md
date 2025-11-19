# Draft Editing and Resubmission Test Report

**Date**: 2025-11-19  
**Status**: ⚠️ **NEEDS VERIFICATION**

## Test Scenarios

### 1. Draft Editing - Load Existing Form Data

**Test Case**: When a user clicks "Continue Editing" on a draft submission, the form should load with all previously saved data pre-filled.

**Expected Behavior**:
- Form should display "Editing draft: SUB-XXXXX" banner
- All form fields should be pre-filled with existing data from the draft
- User can modify any field and save as draft again
- URL should contain `?draftId=SUB-XXXXX` parameter

**Code Implementation** (from `FormPage.tsx`):
```typescript
// Load draft data if editing existing draft
const { data: draftData, isLoading: isLoadingDraft } = useQuery({
  queryKey: ['submission', draftId],
  queryFn: () => {
    if (!draftId) return null
    return apiClient.getSubmission(draftId)
  },
  enabled: !!draftId,
})

// Extract initial data from draft
let initialData: SubmissionData | undefined = undefined
if (draftData?.submittedData) {
  initialData = draftData.submittedData
}
```

**Potential Issue**: The `DynamicForm` component uses `useState(initialData || {})` which only sets initial state once. If `initialData` changes after component mount (e.g., when draft data loads asynchronously), the form won't update. However, since `FormPage` waits for data to load before rendering `DynamicForm`, this should be fine.

**Test Result**: ⚠️ **NEEDS MANUAL VERIFICATION**
- Need to verify that all form fields are correctly pre-filled when editing a draft
- Need to verify that saving the draft updates the existing draft (not creates a new one)

---

### 2. Rejected Form Resubmission - Auto-populate and Create New Entry

**Test Case**: When a user clicks "Resubmit Application" on a rejected submission, the form should:
1. Auto-populate with all data from the rejected submission
2. Reset signature date fields
3. Allow user to modify and resubmit
4. Create a NEW submission entry (not update the old one)

**Expected Behavior**:
- Form should display "Resubmitting application: Previous submission data has been pre-filled..." banner
- All form fields should be pre-filled with data from rejected submission
- Signature date fields should be empty (reset)
- URL should contain `?resubmitId=SUB-XXXXX` parameter
- When submitted, should create a NEW submission with a new ID

**Code Implementation** (from `FormPage.tsx`):
```typescript
// Load rejected submission data if resubmitting
const { data: resubmitData, isLoading: isLoadingResubmit } = useQuery({
  queryKey: ['submission', resubmitId],
  queryFn: () => {
    if (!resubmitId) return null
    return apiClient.getSubmission(resubmitId)
  },
  enabled: !!resubmitId,
})

// Extract initial data from resubmit
if (resubmitData?.submittedData) {
  // For resubmit, copy all data but reset signature date
  initialData = JSON.parse(JSON.stringify(resubmitData.submittedData))
  
  // Reset signature date in all steps
  const resetSignatureDate = (obj: any): any => {
    // ... recursive function to reset signatureDate fields
  }
  
  Object.keys(initialData).forEach((stepKey) => {
    if (initialData[stepKey] && typeof initialData[stepKey] === 'object') {
      initialData[stepKey] = resetSignatureDate(initialData[stepKey])
    }
  })
}
```

**Submission Logic** (from `FormPage.tsx`):
```typescript
const submitMutation = useMutation({
  mutationFn: (data: SubmissionData) => {
    if (!formId) throw new Error('Form ID is required')
    return apiClient.submitForm(formId, { data })  // Creates NEW submission
  },
  // ...
})
```

**Test Result**: ⚠️ **NEEDS MANUAL VERIFICATION**
- Need to verify that all form fields are correctly pre-filled when resubmitting
- Need to verify that signature dates are reset
- Need to verify that submitting creates a NEW submission entry (not updates the old one)
- Need to verify that the old rejected submission remains unchanged

---

## Code Analysis

### DynamicForm Component

**File**: `frontend/src/components/forms/DynamicForm.tsx`

**Current Implementation**:
```typescript
const [formData, setFormData] = useState<SubmissionData>(initialData || {})
```

**Potential Issue**: If `initialData` prop changes after component mount, `formData` state won't update. However, this is likely fine because:
1. `FormPage` waits for draft/resubmit data to load before rendering `DynamicForm`
2. The component is re-mounted when navigating to a different draft/resubmit

**Recommendation**: Add a `useEffect` to sync `formData` with `initialData` if needed:
```typescript
useEffect(() => {
  if (initialData) {
    setFormData(initialData)
  }
}, [initialData])
```

### Submission Creation vs Update

**Draft Update** (from `FormPage.tsx`):
```typescript
const saveDraftMutation = useMutation({
  mutationFn: (data: SubmissionData) => {
    if (!formId) throw new Error('Form ID is required')
    // If editing existing draft, update it; otherwise create new
    if (draftId) {
      return apiClient.updateDraft(draftId, { data })  // Updates existing
    }
    return apiClient.saveDraft(formId, { data })  // Creates new
  },
})
```

**Resubmission** (from `FormPage.tsx`):
```typescript
const submitMutation = useMutation({
  mutationFn: (data: SubmissionData) => {
    if (!formId) throw new Error('Form ID is required')
    return apiClient.submitForm(formId, { data })  // Always creates NEW
  },
})
```

**Analysis**: ✅ **CORRECT**
- Draft editing uses `updateDraft` which updates the existing draft
- Resubmission uses `submitForm` which always creates a new submission
- The old rejected submission remains unchanged

---

## Testing Checklist

### Draft Editing
- [ ] Navigate to submissions page
- [ ] Click "View" on a draft submission
- [ ] Click "Continue Editing" button
- [ ] Verify "Editing draft: SUB-XXXXX" banner appears
- [ ] Verify URL contains `?draftId=SUB-XXXXX`
- [ ] Verify all form fields are pre-filled with existing data
- [ ] Modify some fields
- [ ] Click "Save Draft"
- [ ] Verify draft is updated (not a new draft created)
- [ ] Verify updated data is saved correctly

### Rejected Form Resubmission
- [ ] Navigate to submissions page
- [ ] Click "View" on a rejected submission
- [ ] Click "Resubmit Application" button
- [ ] Verify "Resubmitting application..." banner appears
- [ ] Verify URL contains `?resubmitId=SUB-XXXXX`
- [ ] Verify all form fields are pre-filled with old data
- [ ] Verify signature date fields are empty (reset)
- [ ] Modify some fields
- [ ] Submit the form
- [ ] Verify a NEW submission is created (new ID)
- [ ] Verify the old rejected submission remains unchanged
- [ ] Verify both submissions appear in submissions list

---

## Recommendations

1. **Add useEffect to DynamicForm**: Consider adding a `useEffect` to sync `formData` with `initialData` if the prop changes, though this may not be necessary if the component is always re-mounted.

2. **Add Loading States**: Ensure proper loading states are shown while draft/resubmit data is being fetched.

3. **Add Error Handling**: Handle cases where draft/resubmit data fails to load.

4. **Add Visual Indicators**: Make it clear to users that they're editing a draft or resubmitting (banners are already implemented).

5. **Test File Uploads**: Verify that file uploads from rejected submissions are handled correctly during resubmission (may need to re-upload files).

---

## Next Steps

1. **Manual Testing**: Perform manual testing of both scenarios to verify behavior
2. **Fix Issues**: Address any issues found during testing
3. **Update Test Plan**: Update `FULL_FLOW_TEST_PLAN.md` with detailed test results
4. **Documentation**: Update user documentation with instructions for editing drafts and resubmitting rejected forms

---

**Status**: ⚠️ **AWAITING MANUAL VERIFICATION**

