import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import apiClient from '@/api/client'
import { SubmissionResponse } from '@/types'
import { StatusTracker, ApplicationStatus } from '@/components/labuan-fsa/StatusTracker'

export function SubmissionDetailPage() {
  const { submissionId } = useParams<{ submissionId: string }>()

  const { data: submission, isLoading, error } = useQuery<SubmissionResponse>({
    queryKey: ['submission', submissionId],
    queryFn: () => {
      if (!submissionId) throw new Error('Submission ID is required')
      return apiClient.getSubmission(submissionId)
    },
    enabled: !!submissionId,
  })

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
    <div className="space-y-6">
      <div>
        <Link
          to="/submissions"
          className="text-sm text-gray-600 hover:text-gray-900 mb-4 inline-block"
        >
          ← Back to Submissions
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Submission Details</h1>
        <p className="text-gray-600">Submission ID: {submission.submissionId}</p>
      </div>

      {/* Status Tracker */}
      <div className="bg-white rounded-lg shadow-sm p-6">
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

      <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
        <div>
          <h2 className="text-lg font-semibold mb-4">Submission Information</h2>
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            <h3 className="text-md font-semibold mb-2">Review Notes</h3>
            <p className="text-sm text-gray-700 bg-gray-50 p-4 rounded-md">
              {submission.reviewNotes}
            </p>
          </div>
        )}

        {submission.requestedInfo && (
          <div>
            <h3 className="text-md font-semibold mb-2">Requested Information</h3>
            <p className="text-sm text-gray-700 bg-yellow-50 p-4 rounded-md whitespace-pre-wrap">
              {submission.requestedInfo}
            </p>
          </div>
        )}

        {/* Submission Data */}
        <div>
          <h3 className="text-md font-semibold mb-2">Submitted Data</h3>
          <div className="bg-gray-50 p-4 rounded-md overflow-x-auto">
            <pre className="text-sm text-gray-700">
              {JSON.stringify(submission.submittedData, null, 2)}
            </pre>
          </div>
        </div>

        {/* Actions */}
        {submission.status === 'rejected' && (
          <div className="pt-4 border-t border-gray-200">
            <Link
              to={`/forms/${submission.formId}`}
              className="btn btn-primary"
            >
              Resubmit Application
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

