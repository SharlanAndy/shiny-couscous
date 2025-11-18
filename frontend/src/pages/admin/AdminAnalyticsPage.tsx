import React, { useState, useEffect } from 'react'
import apiClient from '@/api/client'
import { cn } from '@/lib/utils'

interface AnalyticsData {
  totalSubmissions: number
  submissionsByStatus: Record<string, number>
  submissionsByForm: Array<{ formId: string; count: number }>
  submissionsByDate: Array<{ date: string; count: number }>
  averageProcessingTime: number
}

export function AdminAnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d')

  // Load analytics data
  useEffect(() => {
    loadAnalytics()
  }, [dateRange])

  const loadAnalytics = async () => {
    setLoading(true)
    try {
      // TODO: Implement actual analytics API endpoint
      // const data = await apiClient.client.get('/api/admin/analytics', { params: { dateRange } })
      
      // Simulate analytics data
      const submissions = await apiClient.getAdminSubmissions()
      const forms = await apiClient.getForms()

      const submissionsByStatus: Record<string, number> = {}
      const submissionsByForm: Record<string, number> = {}
      
      submissions.forEach((sub) => {
        submissionsByStatus[sub.status] = (submissionsByStatus[sub.status] || 0) + 1
        submissionsByForm[sub.formId] = (submissionsByForm[sub.formId] || 0) + 1
      })

      // Calculate average processing time (days between submittedAt and reviewedAt for approved/rejected)
      let totalProcessingDays = 0
      let processedCount = 0
      
      submissions.forEach((sub) => {
        if (sub.submittedAt && sub.reviewedAt && (sub.status === 'approved' || sub.status === 'rejected')) {
          const submittedDate = new Date(sub.submittedAt)
          const reviewedDate = new Date(sub.reviewedAt)
          const daysDiff = (reviewedDate.getTime() - submittedDate.getTime()) / (1000 * 60 * 60 * 24)
          if (daysDiff > 0) {
            totalProcessingDays += daysDiff
            processedCount++
          }
        }
      })
      
      const averageProcessingTime = processedCount > 0 ? Math.round((totalProcessingDays / processedCount) * 10) / 10 : 0

      const analyticsData: AnalyticsData = {
        totalSubmissions: submissions.length,
        submissionsByStatus,
        submissionsByForm: Object.entries(submissionsByForm).map(([formId, count]) => ({
          formId,
          count,
        })),
        submissionsByDate: [], // TODO: Calculate from submission dates
        averageProcessingTime,
      }

      setAnalytics(analyticsData)
    } catch (error) {
      console.error('Error loading analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="text-center py-12 text-gray-500">Loading analytics...</div>
    )
  }

  if (!analytics) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <p className="text-sm text-red-800">Error loading analytics data</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics</h1>
          <p className="text-gray-600">View system analytics and reports</p>
        </div>
        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value as any)}
          className="input"
        >
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
          <option value="all">All time</option>
        </select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
                <span className="text-2xl">📊</span>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Submissions</dt>
                  <dd className="text-lg font-medium text-gray-900">{analytics.totalSubmissions}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-yellow-100 rounded-md p-3">
                <span className="text-2xl">⏳</span>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Pending</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {analytics.submissionsByStatus['reviewing'] || 0}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
                <span className="text-2xl">✅</span>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Approved</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {analytics.submissionsByStatus['approved'] || 0}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-purple-100 rounded-md p-3">
                <span className="text-2xl">⏱️</span>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Avg. Processing</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {analytics.averageProcessingTime > 0
                      ? `${analytics.averageProcessingTime} days`
                      : 'N/A'}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Submissions by Status</h2>
          <div className="space-y-3">
            {Object.entries(analytics.submissionsByStatus).map(([status, count]) => {
              const percentage = analytics.totalSubmissions > 0
                ? (count / analytics.totalSubmissions) * 100
                : 0

              return (
                <div key={status}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700 capitalize">
                      {status.replace('-', ' ')}
                    </span>
                    <span className="text-sm text-gray-500">
                      {count} ({percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={cn(
                        'h-2 rounded-full transition-all',
                        status === 'approved' && 'bg-green-500',
                        status === 'rejected' && 'bg-red-500',
                        status === 'reviewing' && 'bg-yellow-500',
                        status === 'submitted' && 'bg-blue-500',
                        'bg-gray-500'
                      )}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Submissions by Form */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Submissions by Form</h2>
          {analytics.submissionsByForm.length > 0 ? (
            <div className="space-y-3">
              {analytics.submissionsByForm
                .sort((a, b) => b.count - a.count)
                .slice(0, 5)
                .map((item) => {
                  const percentage = analytics.totalSubmissions > 0
                    ? (item.count / analytics.totalSubmissions) * 100
                    : 0

                  return (
                    <div key={item.formId}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700 truncate">
                          {item.formId}
                        </span>
                        <span className="text-sm text-gray-500">
                          {item.count} ({percentage.toFixed(1)}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No data available</p>
          )}
        </div>
      </div>

      {/* Export Section */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Export Reports</h2>
        <div className="flex space-x-3">
          <button className="btn btn-secondary">Export CSV</button>
          <button className="btn btn-secondary">Export Excel</button>
          <button className="btn btn-secondary">Export PDF</button>
        </div>
        <p className="text-sm text-gray-500 mt-2">
          Export analytics data for the selected date range
        </p>
      </div>
    </div>
  )
}
