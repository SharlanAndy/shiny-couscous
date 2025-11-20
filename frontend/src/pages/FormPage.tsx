import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { useMutation, useQuery } from '@tanstack/react-query'
import { DynamicForm } from '@/components/forms/DynamicForm'
import apiClient from '@/api/client'
import { SubmissionData } from '@/types'
import { useToast } from '@/components/ui/ToastProvider'

export function FormPage() {
  const { formId } = useParams<{ formId: string }>()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const draftId = searchParams.get('draftId')
  const resubmitId = searchParams.get('resubmitId')
  const { showSuccess, showError } = useToast()

  // Load draft data if editing existing draft
  const { data: draftData, isLoading: isLoadingDraft } = useQuery({
    queryKey: ['submission', draftId],
    queryFn: () => {
      if (!draftId) return null
      return apiClient.getSubmission(draftId)
    },
    enabled: !!draftId,
  })

  // Load rejected submission data if resubmitting
  const { data: resubmitData, isLoading: isLoadingResubmit } = useQuery({
    queryKey: ['submission', resubmitId],
    queryFn: () => {
      if (!resubmitId) return null
      return apiClient.getSubmission(resubmitId)
    },
    enabled: !!resubmitId,
  })

  const submitMutation = useMutation({
    mutationFn: (data: SubmissionData) => {
      if (!formId) throw new Error('Form ID is required')
      return apiClient.submitForm(formId, { data })
    },
    onSuccess: (response) => {
      showSuccess(response.message || 'Form submitted successfully', 'Submission Complete')
      navigate(`/submissions/${response.submissionId}`, {
        state: { success: true, message: response.message },
      })
    },
    onError: (error: any) => {
      showError(
        error.response?.data?.detail || error.message || 'Failed to submit form',
        'Submission Failed'
      )
    },
  })

  const saveDraftMutation = useMutation({
    mutationFn: (data: SubmissionData) => {
      if (!formId) throw new Error('Form ID is required')
      // If editing existing draft, update it; otherwise create new
      if (draftId) {
        return apiClient.updateDraft(draftId, { data })
      }
      return apiClient.saveDraft(formId, { data })
    },
    onSuccess: (response) => {
      showSuccess('Your draft has been saved successfully. You can continue editing later.', 'Draft Saved')
      // If this was a new draft, update URL to include draftId
      if (!draftId && response.submissionId) {
        navigate(`/forms/${formId}?draftId=${response.submissionId}`, { replace: true })
      }
    },
    onError: (error: any) => {
      showError(
        error.response?.data?.detail || error.message || 'Failed to save draft',
        'Save Failed'
      )
    },
  })

  const handleSubmit = async (data: SubmissionData) => {
    await submitMutation.mutateAsync(data)
  }

  const handleSaveDraft = async (data: SubmissionData) => {
    await saveDraftMutation.mutateAsync(data)
  }

  if (!formId) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <p className="text-sm text-red-800">Form ID is required</p>
      </div>
    )
  }

  if (isLoadingDraft || isLoadingResubmit) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="mt-4 text-sm text-gray-500">
            {isLoadingDraft ? 'Loading draft...' : 'Loading previous submission...'}
          </p>
        </div>
      </div>
    )
  }

  // Extract initial data from draft or resubmit
  let initialData: SubmissionData | undefined = undefined
  // Support both submittedData and data fields (for backward compatibility)
  const getSubmissionData = (submission: any): SubmissionData | undefined => {
    return submission?.submittedData || submission?.data
  }
  
  if (resubmitData) {
    const resubmitFormData = getSubmissionData(resubmitData)
    if (resubmitFormData) {
      // For resubmit, copy all data but reset signature date
      // Deep clone to avoid mutating the original
      initialData = JSON.parse(JSON.stringify(resubmitFormData))
      
      // Find and reset signature date in all steps (handle nested objects and arrays)
      const resetSignatureDate = (obj: any): any => {
        if (obj === null || typeof obj !== 'object') {
          return obj
        }
        
        if (Array.isArray(obj)) {
          return obj.map(resetSignatureDate)
        }
        
        const result: any = {}
        for (const key in obj) {
          if (key === 'signatureDate') {
            result[key] = ''
          } else {
            result[key] = resetSignatureDate(obj[key])
          }
        }
        return result
      }
      
      // Reset signature date in all steps
      Object.keys(initialData).forEach((stepKey) => {
        if (initialData[stepKey] && typeof initialData[stepKey] === 'object') {
          initialData[stepKey] = resetSignatureDate(initialData[stepKey])
        }
      })
    }
  } else if (draftData) {
    initialData = getSubmissionData(draftData)
  }

  return (
    <div className="w-full">
      {draftId && (
        <div className="mb-3 sm:mb-4 bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
          <p className="text-xs sm:text-sm text-blue-800">
            <strong>Editing draft:</strong> {draftData?.submissionId}
          </p>
        </div>
      )}
      {resubmitId && (
        <div className="mb-3 sm:mb-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3 sm:p-4">
          <p className="text-xs sm:text-sm text-yellow-800">
            <strong>Resubmitting application:</strong> Previous submission data has been pre-filled. Please review and update as needed. Signature date has been reset.
          </p>
        </div>
      )}
      <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 lg:p-8">
        <DynamicForm
          formId={formId}
          onSubmit={handleSubmit}
          onSaveDraft={handleSaveDraft}
          initialData={initialData}
        />
      </div>
    </div>
  )
}

