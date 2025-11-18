import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import apiClient from '@/api/client'
import type { SubmissionResponse, FormSchemaResponse } from '@/types'
import { cn } from '@/lib/utils'
import { StatusTracker, ApplicationStatus } from '@/components/labuan-fsa/StatusTracker'
import { useToast } from '@/components/ui/ToastProvider'
import { FormRenderer } from '@/components/forms/FormRenderer'

export function AdminSubmissionReviewPage() {
  const { submissionId } = useParams<{ submissionId: string }>()
  const navigate = useNavigate()
  const { showSuccess, showError } = useToast()
  const [submission, setSubmission] = useState<SubmissionResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [reviewing, setReviewing] = useState(false)
  const [reviewData, setReviewData] = useState({
    status: '',
    reviewNotes: '',
    requestedInfo: '',
  })

  // Load submission
  useEffect(() => {
    if (submissionId) {
      loadSubmission()
    }
  }, [submissionId])

  const loadSubmission = async () => {
    setLoading(true)
    try {
      const data = await apiClient.getSubmission(submissionId!)
      setSubmission(data)
      setReviewData({
        status: data.status || '',
        reviewNotes: data.reviewNotes || '',
        requestedInfo: data.requestedInfo || '',
      })
    } catch (error) {
      console.error('Error loading submission:', error)
    } finally {
      setLoading(false)
    }
  }

  // Fetch form schema to render fields properly
  const { data: formSchema, isLoading: isLoadingSchema } = useQuery<FormSchemaResponse>({
    queryKey: ['form-schema', submission?.formId],
    queryFn: () => {
      if (!submission?.formId) throw new Error('Form ID is required')
      return apiClient.getFormSchema(submission.formId)
    },
    enabled: !!submission?.formId,
  })

  const handleReview = async () => {
    if (!submissionId || !reviewData.status) {
      showError('Please select a status', 'Validation Error')
      return
    }

    setReviewing(true)
    try {
      await apiClient.reviewSubmission(submissionId, reviewData)
      showSuccess('Submission has been reviewed successfully.', 'Review Complete')
      setTimeout(() => navigate('/admin/submissions'), 1500)
    } catch (error: any) {
      console.error('Error reviewing submission:', error)
      showError(
        error.response?.data?.detail || error.message || 'Failed to review submission',
        'Review Failed'
      )
    } finally {
      setReviewing(false)
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

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      case 'reviewing':
      case 'under-review':
        return 'bg-yellow-100 text-yellow-800'
      case 'submitted':
        return 'bg-blue-100 text-blue-800'
      case 'draft':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500">Loading submission...</div>
      </div>
    )
  }

  if (!submission) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600">Submission not found</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <button
          onClick={() => navigate('/admin/submissions')}
          className="text-sm text-gray-600 hover:text-gray-900 mb-4"
        >
          ← Back to Submissions
        </button>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Review Submission</h1>
        <p className="text-gray-600">Submission ID: {submission.submissionId}</p>
      </div>

      {/* Status Tracker */}
      <div className="bg-white shadow rounded-lg p-6">
        <StatusTracker
          fieldId="status-tracker"
          fieldName="status"
          fieldType="status-tracker"
          label="Application Status"
          currentStatus={mapSubmissionStatusToApplicationStatus(submission.status)}
          applicationId={submission.submissionId}
          submittedDate={submission.submittedAt}
          onChange={() => {}} // Status tracker is read-only in review page
        />
      </div>

      {/* Submission Details */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Submission Details</h2>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Form ID</label>
            <p className="text-sm text-gray-900">{submission.formId}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Status</label>
            <p>
              <span
                className={cn(
                  'px-2 inline-flex text-xs leading-5 font-semibold rounded-full',
                  getStatusColor(submission.status)
                )}
              >
                {submission.status}
              </span>
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Submitted By</label>
            <p className="text-sm text-gray-900">{submission.submittedBy || '-'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Submitted At</label>
            <p className="text-sm text-gray-900">
              {submission.submittedAt
                ? new Date(submission.submittedAt).toLocaleString()
                : '-'}
            </p>
          </div>
        </div>

        {/* Submission Data */}
        <div className="mt-6">
          <label className="text-sm font-medium text-gray-700 mb-4 block">Submitted Data</label>
          {isLoadingSchema ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                <p className="mt-2 text-sm text-gray-500">Loading form schema...</p>
              </div>
            </div>
          ) : formSchema && submission.submittedData ? (
            <div className="space-y-6">
              {formSchema.steps.map((step) => (
                <div key={step.stepId} className="bg-gray-50 rounded-lg p-4 sm:p-6 border border-gray-200">
                  <h4 className="text-base font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-300">
                    {step.stepName || step.stepId}
                  </h4>
                  {step.stepDescription && (
                    <p className="text-sm text-gray-600 mb-4">{step.stepDescription}</p>
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
            <div className="bg-gray-50 p-4 rounded-md overflow-x-auto">
              <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                {JSON.stringify(submission.submittedData, null, 2)}
              </pre>
              <p className="mt-2 text-xs text-gray-500">Note: Form schema not available. Showing raw data.</p>
            </div>
          )}
        </div>
      </div>

      {/* Review Form */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Review Submission</h2>
        <div className="space-y-4">
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
              Decision <span className="text-red-500">*</span>
            </label>
            <select
              id="status"
              value={reviewData.status}
              onChange={(e) => setReviewData({ ...reviewData, status: e.target.value })}
              className="input w-full"
              required
            >
              <option value="">Select status...</option>
              <option value="under-review">Under Review</option>
              <option value="approved">Approve</option>
              <option value="rejected">Reject</option>
              <option value="additional-info-required">Request Additional Information</option>
            </select>
          </div>

          <div>
            <label htmlFor="reviewNotes" className="block text-sm font-medium text-gray-700 mb-1">
              Review Notes
            </label>
            <textarea
              id="reviewNotes"
              value={reviewData.reviewNotes}
              onChange={(e) => setReviewData({ ...reviewData, reviewNotes: e.target.value })}
              rows={4}
              className="input w-full"
              placeholder="Add review notes..."
            />
          </div>

          <div>
            <label htmlFor="requestedInfo" className="block text-sm font-medium text-gray-700 mb-1">
              Requested Information
            </label>
            <textarea
              id="requestedInfo"
              value={reviewData.requestedInfo}
              onChange={(e) => setReviewData({ ...reviewData, requestedInfo: e.target.value })}
              rows={4}
              className="input w-full"
              placeholder="List any additional information required..."
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              onClick={handleReview}
              disabled={reviewing || !reviewData.status}
              className={cn(
                'btn btn-primary',
                (reviewing || !reviewData.status) && 'opacity-50 cursor-not-allowed'
              )}
            >
              {reviewing ? 'Processing...' : 'Submit Review'}
            </button>
            <button
              onClick={() => navigate('/admin/submissions')}
              className="btn btn-secondary"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>

      {/* Previous Review Notes */}
      {submission.reviewNotes && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Previous Review Notes</h2>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{submission.reviewNotes}</p>
          {submission.reviewedBy && (
            <p className="text-xs text-gray-500 mt-2">
              Reviewed by: {submission.reviewedBy} on{' '}
              {submission.reviewedAt
                ? new Date(submission.reviewedAt).toLocaleString()
                : 'Unknown date'}
            </p>
          )}
        </div>
      )}

      {/* Requested Information */}
      {submission.requestedInfo && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Requested Information</h2>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{submission.requestedInfo}</p>
        </div>
      )}
    </div>
  )
}

