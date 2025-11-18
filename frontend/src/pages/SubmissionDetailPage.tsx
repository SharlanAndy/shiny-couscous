import { useParams, Link, useLocation } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import apiClient from '@/api/client'
import { SubmissionResponse } from '@/types'
import { StatusTracker, ApplicationStatus } from '@/components/labuan-fsa/StatusTracker'
import { useToast } from '@/components/ui/ToastProvider'
import { FormRenderer } from '@/components/forms/FormRenderer'
import { FormSchema } from '@/types'

export function SubmissionDetailPage() {
  const { submissionId } = useParams<{ submissionId: string }>()
  const location = useLocation()
  const { showSuccess } = useToast()
  const [showSuccessBanner, setShowSuccessBanner] = useState(false)

  const { data: submission, isLoading, error } = useQuery<SubmissionResponse>({
    queryKey: ['submission', submissionId],
    queryFn: () => {
      if (!submissionId) throw new Error('Submission ID is required')
      return apiClient.getSubmission(submissionId)
    },
    enabled: !!submissionId,
  })

  // Fetch form schema to render fields properly
  const { data: formSchema, isLoading: isLoadingSchema } = useQuery<FormSchema>({
    queryKey: ['formSchema', submission?.formId],
    queryFn: () => {
      if (!submission?.formId) throw new Error('Form ID is required')
      return apiClient.getFormSchema(submission.formId)
    },
    enabled: !!submission?.formId,
  })

  // Check if we're coming from a successful submission
  useEffect(() => {
    const state = location.state as { success?: boolean; message?: string } | null
    if (state?.success) {
      setShowSuccessBanner(true)
      if (state.message) {
        showSuccess(state.message, 'Submission Complete')
      }
      // Clear the state so banner doesn't show on refresh
      window.history.replaceState({}, document.title)
    }
  }, [location.state, showSuccess])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="mt-4 text-sm text-gray-500">Loading submission...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <p className="text-sm text-red-800">Error loading submission: {error.message}</p>
      </div>
    )
  }

  if (!submission) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
        <p className="text-sm text-yellow-800">Submission not found</p>
      </div>
    )
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-success text-white'
      case 'rejected':
        return 'bg-error text-white'
      case 'reviewing':
        return 'bg-warning text-white'
      case 'submitted':
        return 'bg-info text-white'
      case 'draft':
        return 'bg-gray-400 text-white'
      default:
        return 'bg-gray-400 text-white'
    }
  }

  // Map submission status to application status
  const mapSubmissionStatusToApplicationStatus = (status: string): ApplicationStatus => {
    switch (status) {
      case 'reviewing':
        return 'under-review'
      case 'draft':
        return 'draft'
      case 'submitted':
        return 'submitted'
      case 'pending-payment':
        return 'pending-payment'
      case 'approved':
        return 'approved'
      case 'rejected':
        return 'rejected'
      case 'cancelled':
        return 'rejected'
      default:
        return 'draft'
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Success Banner */}
      {showSuccessBanner && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 sm:p-6">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 sm:h-6 sm:w-6 text-green-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="ml-2 sm:ml-3 flex-1 min-w-0">
              <h3 className="text-base sm:text-lg font-medium text-green-800">Submission Successful!</h3>
              <p className="mt-1 text-xs sm:text-sm text-green-700">
                Your application has been submitted successfully. You can track its status below.
                We will notify you once your application has been reviewed.
              </p>
              <div className="mt-3 sm:mt-4">
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                  <Link
                    to="/submissions"
                    className="text-xs sm:text-sm font-medium text-green-800 hover:text-green-900 underline"
                  >
                    View All Submissions
                  </Link>
                  <Link
                    to="/forms"
                    className="text-xs sm:text-sm font-medium text-green-800 hover:text-green-900 underline"
                  >
                    Submit Another Form
                  </Link>
                </div>
              </div>
            </div>
            <div className="ml-2 sm:ml-4 flex-shrink-0">
              <button
                type="button"
                onClick={() => setShowSuccessBanner(false)}
                className="inline-flex text-green-400 hover:text-green-500 focus:outline-none"
              >
                <span className="sr-only">Dismiss</span>
                <svg className="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      <div>
        <Link
          to="/submissions"
          className="text-xs sm:text-sm text-gray-600 hover:text-gray-900 mb-3 sm:mb-4 inline-block"
        >
          ← Back to Submissions
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">Submission Details</h1>
        <p className="text-xs sm:text-sm text-gray-600 break-words">Submission ID: {submission.submissionId}</p>
      </div>

      {/* Status Tracker */}
      <div className="bg-white rounded-lg shadow-sm p-4 sm:p-5 lg:p-6 overflow-x-auto">
        <StatusTracker
          fieldId="status-tracker"
          fieldName="status"
          fieldType="status-tracker"
          label="Application Status"
          currentStatus={mapSubmissionStatusToApplicationStatus(submission.status)}
          applicationId={submission.submissionId}
          submittedDate={submission.submittedAt}
          onChange={() => {}} // Read-only
        />
      </div>

      <div className="bg-white rounded-lg shadow-sm p-4 sm:p-5 lg:p-6 space-y-4 sm:space-y-6">
        <div>
          <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Submission Information</h2>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <dt className="text-sm font-medium text-gray-500">Form ID</dt>
              <dd className="mt-1 text-sm text-gray-900">{submission.formId}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Status</dt>
              <dd className="mt-1">
                <span
                  className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(
                    submission.status
                  )}`}
                >
                  {submission.status}
                </span>
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Submitted By</dt>
              <dd className="mt-1 text-sm text-gray-900">{submission.submittedBy || '-'}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Submitted At</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {submission.submittedAt
                  ? new Date(submission.submittedAt).toLocaleString()
                  : '-'}
              </dd>
            </div>
            {submission.reviewedBy && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Reviewed By</dt>
                <dd className="mt-1 text-sm text-gray-900">{submission.reviewedBy}</dd>
              </div>
            )}
            {submission.reviewedAt && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Reviewed At</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {new Date(submission.reviewedAt).toLocaleString()}
                </dd>
              </div>
            )}
          </dl>
        </div>

        {submission.reviewNotes && (
          <div>
            <h3 className="text-sm sm:text-base font-semibold mb-2">Review Notes</h3>
            <p className="text-xs sm:text-sm text-gray-700 bg-gray-50 p-3 sm:p-4 rounded-md break-words">
              {submission.reviewNotes}
            </p>
          </div>
        )}

        {submission.requestedInfo && (
          <div>
            <h3 className="text-sm sm:text-base font-semibold mb-2">Requested Information</h3>
            <p className="text-xs sm:text-sm text-gray-700 bg-yellow-50 p-3 sm:p-4 rounded-md whitespace-pre-wrap break-words">
              {submission.requestedInfo}
            </p>
          </div>
        )}

        {/* Submission Data */}
        <div>
          <h3 className="text-sm sm:text-base font-semibold mb-3 sm:mb-4">Submitted Data</h3>
          {isLoadingSchema ? (
            <div className="flex items-center justify-center py-6 sm:py-8">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-5 w-5 sm:h-6 sm:w-6 border-b-2 border-primary"></div>
                <p className="mt-2 text-xs sm:text-sm text-gray-500">Loading form schema...</p>
              </div>
            </div>
          ) : formSchema && submission.submittedData ? (
            <div className="space-y-4 sm:space-y-6">
              {formSchema.steps.map((step) => (
                <div key={step.stepId} className="bg-gray-50 rounded-lg p-4 sm:p-5 lg:p-6 border border-gray-200">
                  <h4 className="text-sm sm:text-base font-semibold text-gray-900 mb-3 sm:mb-4 pb-2 border-b border-gray-300">
                    {step.stepName || step.stepId}
                  </h4>
                  {step.stepDescription && (
                    <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">{step.stepDescription}</p>
                  )}
                  <FormRenderer
                    steps={[step]}
                    formData={submission.submittedData || {}}
                    errors={{}}
                    onChange={() => {}} // Read-only - no-op
                    onBlur={() => {}} // Read-only - no-op
                    readonly={true} // Make all fields readonly/disabled
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-gray-50 p-3 sm:p-4 rounded-md overflow-x-auto">
              <pre className="text-xs sm:text-sm text-gray-700 whitespace-pre-wrap break-words">
                {JSON.stringify(submission.submittedData, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="pt-3 sm:pt-4 border-t border-gray-200">
          {submission.status === 'draft' && (
            <Link
              to={`/forms/${submission.formId}?draftId=${submission.submissionId}`}
              className="btn btn-primary text-xs sm:text-sm px-4 sm:px-6 py-2 sm:py-2.5 w-full sm:w-auto inline-block text-center"
            >
              Continue Editing
            </Link>
          )}
          {submission.status === 'rejected' && (
            <Link
              to={`/forms/${submission.formId}?resubmitId=${submission.submissionId}`}
              className="btn btn-primary text-xs sm:text-sm px-4 sm:px-6 py-2 sm:py-2.5 w-full sm:w-auto inline-block text-center"
            >
              Resubmit Application
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}

