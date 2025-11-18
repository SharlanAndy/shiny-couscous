import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import apiClient from '@/api/client'
import { SubmissionResponse } from '@/types'

export function SubmissionListPage() {
  const { data: submissions, isLoading, error } = useQuery<SubmissionResponse[]>({
    queryKey: ['submissions'],
    queryFn: () => apiClient.getSubmissions(),
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="mt-4 text-sm text-gray-500">Loading submissions...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <p className="text-sm text-red-800">Error loading submissions: {error.message}</p>
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

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">My Submissions</h1>
        <p className="text-sm sm:text-base text-gray-600">View and track your form submissions</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {submissions && submissions.length > 0 ? (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Submission ID
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Form ID
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Submitted At
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {submissions.map((submission) => (
                    <tr key={submission.id} className="hover:bg-gray-50">
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {submission.submissionId}
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {submission.formId}
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(
                            submission.status
                          )}`}
                        >
                          {submission.status}
                        </span>
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {submission.submittedAt
                          ? new Date(submission.submittedAt).toLocaleDateString()
                          : '-'}
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Link
                          to={`/submissions/${submission.submissionId}`}
                          className="text-primary hover:text-primary-dark"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden divide-y divide-gray-200">
              {submissions.map((submission) => (
                <Link
                  key={submission.id}
                  to={`/submissions/${submission.submissionId}`}
                  className="block p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {submission.submissionId}
                      </p>
                      <p className="text-xs text-gray-500 mt-1 truncate">
                        Form: {submission.formId}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {submission.submittedAt
                          ? new Date(submission.submittedAt).toLocaleDateString()
                          : '-'}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full whitespace-nowrap ${getStatusBadgeColor(
                          submission.status
                        )}`}
                      >
                        {submission.status}
                      </span>
                      <span className="text-primary text-xs font-medium">View →</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-8 sm:py-12 px-4">
            <p className="text-sm sm:text-base text-gray-500">No submissions found</p>
          </div>
        )}
      </div>
    </div>
  )
}

