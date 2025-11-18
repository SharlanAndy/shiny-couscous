import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import apiClient from '@/api/client'
import type { SubmissionResponse, FormResponse } from '@/types'
import { cn } from '@/lib/utils'

export function UserDashboardPage() {
  const [recentSubmissions, setRecentSubmissions] = useState<SubmissionResponse[]>([])
  const [statistics, setStatistics] = useState({
    totalSubmissions: 0,
    pendingSubmissions: 0,
    approvedSubmissions: 0,
    rejectedSubmissions: 0,
  })

  // Load user submissions
  const { data: submissions, isLoading: submissionsLoading } = useQuery<SubmissionResponse[]>({
    queryKey: ['user-submissions'],
    queryFn: () => apiClient.getSubmissions(),
  })

  // Load available forms
  const { data: forms } = useQuery<FormResponse[]>({
    queryKey: ['forms'],
    queryFn: () => apiClient.getForms({ status: 'active' }),
  })

  // Update statistics and recent submissions
  useEffect(() => {
    if (submissions) {
      setRecentSubmissions(submissions.slice(0, 5))
      setStatistics({
        totalSubmissions: submissions.length,
        pendingSubmissions: submissions.filter((s) => s.status === 'reviewing' || s.status === 'under-review').length,
        approvedSubmissions: submissions.filter((s) => s.status === 'approved').length,
        rejectedSubmissions: submissions.filter((s) => s.status === 'rejected').length,
      })
    }
  }, [submissions])

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

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">My Dashboard</h1>
        <p className="text-sm sm:text-base text-gray-600">Welcome back! Here's an overview of your submissions</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-4 sm:p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-100 rounded-md p-2 sm:p-3">
                <span className="text-xl sm:text-2xl">📊</span>
              </div>
              <div className="ml-3 sm:ml-5 w-0 flex-1 min-w-0">
                <dl>
                  <dt className="text-xs sm:text-sm font-medium text-gray-500 truncate">Total Submissions</dt>
                  <dd className="text-base sm:text-lg font-medium text-gray-900">{statistics.totalSubmissions}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-4 sm:p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-yellow-100 rounded-md p-2 sm:p-3">
                <span className="text-xl sm:text-2xl">⏳</span>
              </div>
              <div className="ml-3 sm:ml-5 w-0 flex-1 min-w-0">
                <dl>
                  <dt className="text-xs sm:text-sm font-medium text-gray-500 truncate">Pending Review</dt>
                  <dd className="text-base sm:text-lg font-medium text-gray-900">{statistics.pendingSubmissions}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-4 sm:p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-100 rounded-md p-2 sm:p-3">
                <span className="text-xl sm:text-2xl">✅</span>
              </div>
              <div className="ml-3 sm:ml-5 w-0 flex-1 min-w-0">
                <dl>
                  <dt className="text-xs sm:text-sm font-medium text-gray-500 truncate">Approved</dt>
                  <dd className="text-base sm:text-lg font-medium text-gray-900">{statistics.approvedSubmissions}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-4 sm:p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-red-100 rounded-md p-2 sm:p-3">
                <span className="text-xl sm:text-2xl">❌</span>
              </div>
              <div className="ml-3 sm:ml-5 w-0 flex-1 min-w-0">
                <dl>
                  <dt className="text-xs sm:text-sm font-medium text-gray-500 truncate">Rejected</dt>
                  <dd className="text-base sm:text-lg font-medium text-gray-900">{statistics.rejectedSubmissions}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        <Link
          to="/forms"
          className="bg-white shadow rounded-lg p-4 sm:p-5 lg:p-6 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-primary rounded-md p-2 sm:p-3">
              <span className="text-xl sm:text-2xl text-white">📝</span>
            </div>
            <div className="ml-3 sm:ml-4 min-w-0 flex-1">
              <h3 className="text-sm sm:text-base font-medium text-gray-900">Start New Application</h3>
              <p className="text-xs text-gray-500">Submit a new form</p>
            </div>
          </div>
        </Link>
        <Link
          to="/submissions"
          className="bg-white shadow rounded-lg p-4 sm:p-5 lg:p-6 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-blue-100 rounded-md p-2 sm:p-3">
              <span className="text-xl sm:text-2xl">📋</span>
            </div>
            <div className="ml-3 sm:ml-4 min-w-0 flex-1">
              <h3 className="text-sm sm:text-base font-medium text-gray-900">View All Submissions</h3>
              <p className="text-xs text-gray-500">See all your submissions</p>
            </div>
          </div>
        </Link>
        {forms && forms.length > 0 && (
          <Link
            to={`/forms/${forms[0].formId}`}
            className="bg-white shadow rounded-lg p-4 sm:p-5 lg:p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-100 rounded-md p-2 sm:p-3">
                <span className="text-xl sm:text-2xl">⚡</span>
              </div>
              <div className="ml-3 sm:ml-4 min-w-0 flex-1">
                <h3 className="text-sm sm:text-base font-medium text-gray-900">Quick Start</h3>
                <p className="text-xs text-gray-500 truncate">{forms[0].name}</p>
              </div>
            </div>
          </Link>
        )}
      </div>

      {/* Recent Submissions */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-200">
          <h2 className="text-base sm:text-lg font-medium text-gray-900">Recent Submissions</h2>
        </div>
        {submissionsLoading ? (
          <div className="p-4 sm:p-6 text-center text-sm sm:text-base text-gray-500">Loading submissions...</div>
        ) : recentSubmissions.length === 0 ? (
          <div className="p-4 sm:p-6 text-center text-sm sm:text-base text-gray-500">
            <p className="mb-3 sm:mb-4">No submissions yet</p>
            <Link to="/forms" className="btn btn-primary text-sm sm:text-base px-4 sm:px-6 py-2 sm:py-2.5">
              Start Your First Application
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {recentSubmissions.map((submission) => (
              <Link
                key={submission.id}
                to={`/submissions/${submission.submissionId}`}
                className="block px-4 sm:px-6 py-3 sm:py-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start sm:items-center space-x-2 sm:space-x-3">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">
                          {submission.submissionId}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-500 truncate">Form: {submission.formId}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end space-x-2 sm:space-x-4">
                    <span
                      className={cn(
                        'px-2 py-1 inline-flex text-xs leading-4 sm:leading-5 font-semibold rounded-full whitespace-nowrap',
                        getStatusColor(submission.status)
                      )}
                    >
                      {submission.status}
                    </span>
                    <span className="hidden sm:inline text-xs sm:text-sm text-gray-500 whitespace-nowrap">
                      {submission.submittedAt
                        ? new Date(submission.submittedAt).toLocaleDateString()
                        : '-'}
                    </span>
                    <span className="hidden sm:inline text-gray-400">→</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
        {recentSubmissions.length > 0 && (
          <div className="px-4 sm:px-6 py-3 sm:py-4 bg-gray-50 border-t border-gray-200">
            <Link
              to="/submissions"
              className="text-xs sm:text-sm font-medium text-primary hover:text-primary-dark"
            >
              View all submissions →
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

