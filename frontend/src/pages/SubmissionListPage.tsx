import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import apiClient from '@/api/client'
import { SubmissionResponse } from '@/types'
import { useState } from 'react'

export function SubmissionListPage() {
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState<string>('')

  const { data: submissions, isLoading, error } = useQuery<SubmissionResponse[]>({
    queryKey: ['submissions'],
    queryFn: () => apiClient.getSubmissions(),
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
          <p className="mt-4 text-sm font-medium text-gray-600">Loading submissions...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-red-900">Error Loading Submissions</h3>
            <p className="text-sm text-red-700 mt-1">{error.message}</p>
          </div>
        </div>
      </div>
    )
  }

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'approved':
        return {
          color: 'bg-green-100 text-green-800 border-green-200',
          icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          label: 'Approved'
        }
      case 'rejected':
        return {
          color: 'bg-red-100 text-red-800 border-red-200',
          icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          label: 'Rejected'
        }
      case 'reviewing':
        return {
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          label: 'Reviewing'
        }
      case 'submitted':
        return {
          color: 'bg-blue-100 text-blue-800 border-blue-200',
          icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          ),
          label: 'Submitted'
        }
      case 'draft':
        return {
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          ),
          label: 'Draft'
        }
      default:
        return {
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: null,
          label: status
        }
    }
  }

  // Filter submissions
  const filteredSubmissions = submissions?.filter(submission => {
    const matchesStatus = filterStatus === 'all' || submission.status === filterStatus
    const matchesSearch = submission.submissionId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         submission.formId.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesStatus && matchesSearch
  }) || []

  // Count by status
  const statusCounts = {
    all: submissions?.length || 0,
    approved: submissions?.filter(s => s.status === 'approved').length || 0,
    reviewing: submissions?.filter(s => s.status === 'reviewing').length || 0,
    submitted: submissions?.filter(s => s.status === 'submitted').length || 0,
    rejected: submissions?.filter(s => s.status === 'rejected').length || 0,
    draft: submissions?.filter(s => s.status === 'draft').length || 0,
  }

  return (
    <div className="space-y-6 -m-6 p-6 lg:p-8 min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header Section - Enhanced */}
      <div className="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl shadow-2xl overflow-hidden p-8 sm:p-10">
        {/* Decorative Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white rounded-full blur-3xl"></div>
          <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-white rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative z-10 flex items-center justify-between flex-wrap gap-6">
          <div>
            <h1 className="text-white text-4xl sm:text-5xl font-black mb-3 tracking-tight">My Submissions</h1>
            <p className="text-blue-100 text-base sm:text-lg font-medium">Track and manage all your form submissions in one place</p>
          </div>
          <div className="flex items-center gap-4 bg-white/20 backdrop-blur-xl rounded-2xl px-6 py-4 border-2 border-white/30 shadow-xl">
            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-lg">
              <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <p className="text-3xl font-black text-white">{submissions?.length || 0}</p>
              <p className="text-sm text-blue-100 font-bold">Total Submissions</p>
            </div>
          </div>
        </div>
      </div>

      {/* Status Filter Tabs + Search (row on desktop, stacked on mobile) */}
      <div className="flex flex-col lg:flex-row gap-5">
        <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-5 overflow-x-auto lg:flex-1">
          <div className="flex gap-2.5 min-w-max">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-5 py-3 rounded-xl font-bold text-sm transition-all duration-300 whitespace-nowrap ${
                filterStatus === 'all'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xl scale-105'
                  : 'bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 hover:from-gray-100 hover:to-gray-200 hover:shadow-md'
              }`}
            >
              All ({statusCounts.all})
            </button>
            <button
              onClick={() => setFilterStatus('submitted')}
              className={`px-5 py-3 rounded-xl font-bold text-sm transition-all duration-300 whitespace-nowrap ${
                filterStatus === 'submitted'
                  ? 'bg-blue-500 text-white shadow-xl scale-105'
                  : 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 hover:from-blue-100 hover:to-blue-200 hover:shadow-md'
              }`}
            >
              Submitted ({statusCounts.submitted})
            </button>
            <button
              onClick={() => setFilterStatus('reviewing')}
              className={`px-5 py-3 rounded-xl font-bold text-sm transition-all duration-300 whitespace-nowrap ${
                filterStatus === 'reviewing'
                  ? 'bg-yellow-500 text-white shadow-xl scale-105'
                  : 'bg-gradient-to-r from-yellow-50 to-yellow-100 text-yellow-700 hover:from-yellow-100 hover:to-yellow-200 hover:shadow-md'
              }`}
            >
              Reviewing ({statusCounts.reviewing})
            </button>
            <button
              onClick={() => setFilterStatus('approved')}
              className={`px-5 py-3 rounded-xl font-bold text-sm transition-all duration-300 whitespace-nowrap ${
                filterStatus === 'approved'
                  ? 'bg-green-500 text-white shadow-xl scale-105'
                  : 'bg-gradient-to-r from-green-50 to-green-100 text-green-700 hover:from-green-100 hover:to-green-200 hover:shadow-md'
              }`}
            >
              Approved ({statusCounts.approved})
            </button>
            <button
              onClick={() => setFilterStatus('rejected')}
              className={`px-5 py-3 rounded-xl font-bold text-sm transition-all duration-300 whitespace-nowrap ${
                filterStatus === 'rejected'
                  ? 'bg-red-500 text-white shadow-xl scale-105'
                  : 'bg-gradient-to-r from-red-50 to-red-100 text-red-700 hover:from-red-100 hover:to-red-200 hover:shadow-md'
              }`}
            >
              Rejected ({statusCounts.rejected})
            </button>
            <button
              onClick={() => setFilterStatus('draft')}
              className={`px-5 py-3 rounded-xl font-bold text-sm transition-all duration-300 whitespace-nowrap ${
                filterStatus === 'draft'
                  ? 'bg-gray-500 text-white shadow-xl scale-105'
                  : 'bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 hover:from-gray-100 hover:to-gray-200 hover:shadow-md'
              }`}
            >
              Draft ({statusCounts.draft})
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-5 lg:w-1/3">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search by Submission ID or Form ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-14 pr-5 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-semibold transition-all"
            />
          </div>
        </div>
      </div>

      {/* Submissions Grid/List */}
      {filteredSubmissions.length > 0 ? (
        <div className="grid grid-cols-1 gap-5">
          {filteredSubmissions.map((submission) => {
            const statusConfig = getStatusConfig(submission.status)
            return (
              <Link
                key={submission.id}
                to={`/submissions/${submission.submissionId}`}
                className="group bg-white rounded-2xl shadow-lg border-2 border-gray-100 hover:shadow-2xl hover:border-blue-300 transition-all duration-300 overflow-hidden hover:-translate-y-1"
              >
                <div className="p-6 sm:p-7">
                  <div className="flex items-start justify-between gap-5 flex-wrap">
                    {/* Left Section */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center text-white font-bold shadow-xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-xl font-black text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                            {submission.submissionId}
                          </h3>
                          <p className="text-sm text-gray-600 truncate mt-1 font-semibold">Form ID: {submission.formId}</p>
                        </div>
                      </div>

                      {/* Meta Info */}
                      <div className="flex flex-wrap gap-5 text-sm">
                        <div className="flex items-center gap-2 text-gray-700 bg-gray-50 px-3 py-2 rounded-lg">
                          <svg className="w-5 h-5 flex-shrink-0 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span className="font-semibold">
                            {submission.submittedAt
                              ? new Date(submission.submittedAt).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric'
                                })
                              : 'Not submitted yet'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right Section - Status & Action */}
                    <div className="flex flex-col items-end gap-4">
                      <span className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-black border-2 shadow-md ${statusConfig.color}`}>
                        {statusConfig.icon}
                        {statusConfig.label}
                      </span>
                      <span className="inline-flex items-center gap-2 text-base font-bold text-blue-600 group-hover:gap-3 transition-all">
                        View Details
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                        </svg>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Progress Bar (Optional - based on status) */}
                <div className="h-2 bg-gray-100">
                  <div
                    className={`h-full transition-all duration-500 ${
                      submission.status === 'approved' ? 'bg-gradient-to-r from-green-500 to-emerald-500 w-full' :
                      submission.status === 'rejected' ? 'bg-gradient-to-r from-red-500 to-rose-500 w-full' :
                      submission.status === 'reviewing' ? 'bg-gradient-to-r from-yellow-500 to-orange-500 w-2/3' :
                      submission.status === 'submitted' ? 'bg-gradient-to-r from-blue-500 to-indigo-500 w-1/3' :
                      'bg-gradient-to-r from-gray-400 to-gray-500 w-1/6'
                    }`}
                  />
                </div>
              </Link>
            )
          })}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No submissions found</h3>
          <p className="text-sm text-gray-500 mb-6">
            {searchQuery || filterStatus !== 'all' 
              ? 'Try adjusting your filters or search query' 
              : "You haven't submitted any forms yet"}
          </p>
          <Link
            to="/forms"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create New Submission
          </Link>
        </div>
      )}
    </div>
  )
}

