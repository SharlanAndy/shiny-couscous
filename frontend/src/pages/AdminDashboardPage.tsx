import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import apiClient from '@/api/client'
import { StatisticsCards } from '@/components/admin/StatisticsCards'
import { RecentActivity } from '@/components/admin/RecentActivity'
import { getRolePermissions } from '@/lib/role-utils'

export function AdminDashboardPage() {
  const [statistics, setStatistics] = useState({
    totalSubmissions: 0,
    pendingSubmissions: 0,
    approvedSubmissions: 0,
    rejectedSubmissions: 0,
    totalForms: 0,
    recentActivity: [] as Array<{
      id: string
      type: string
      description: string
      timestamp: string
    }>,
  })
  const [loading, setLoading] = useState(true)
  const [permissions, setPermissions] = useState<string[]>([])

  // Load statistics and permissions
  useEffect(() => {
    loadStatistics()
    loadPermissions()
  }, [])

  const loadPermissions = async () => {
    const userRole = localStorage.getItem('userRole')
    if (userRole && userRole !== 'user') {
      const userPerms = await getRolePermissions(userRole)
      setPermissions(userPerms)
    }
  }

  const loadStatistics = async () => {
    setLoading(true)
    try {
      // Try to get statistics from API first, fallback to manual calculation
      try {
        const stats = await apiClient.getAdminStatistics()
        setStatistics(stats)
      } catch (apiError) {
        // Fallback: calculate statistics from submissions
        console.warn('Statistics API not available, calculating from submissions:', apiError)
        const [submissions, forms] = await Promise.all([
          apiClient.getAdminSubmissions(),
          apiClient.getForms(),
        ])

        const stats = {
          totalSubmissions: submissions.length,
          pendingSubmissions: submissions.filter((s) => s.status === 'reviewing' || s.status === 'under-review').length,
          approvedSubmissions: submissions.filter((s) => s.status === 'approved').length,
          rejectedSubmissions: submissions.filter((s) => s.status === 'rejected').length,
          totalForms: forms.length,
          recentActivity: submissions
            .slice(0, 10)
            .map((sub) => ({
              id: sub.submissionId,
              type: 'submission',
              description: `New submission ${sub.submissionId} for form ${sub.formId}`,
              timestamp: sub.submittedAt || sub.createdAt,
            })),
        }

        setStatistics(stats)
      }
    } catch (error) {
      console.error('Error loading statistics:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
            <p className="text-gray-600">Overview of forms and submissions</p>
          </div>

          {/* Quick Actions - Filtered by permissions */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {permissions.includes('review_submissions') && (
              <Link
                to="/admin/submissions"
                className="bg-white shadow rounded-lg p-4 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
                    <span className="text-2xl">📝</span>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-gray-900">View All Submissions</h3>
                    <p className="text-xs text-gray-500">Manage and review submissions</p>
                  </div>
                </div>
              </Link>
            )}
            {permissions.includes('manage_forms') && (
              <Link
                to="/admin/forms"
                className="bg-white shadow rounded-lg p-4 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-purple-100 rounded-md p-3">
                    <span className="text-2xl">📋</span>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-gray-900">Manage Forms</h3>
                    <p className="text-xs text-gray-500">Create and edit form schemas</p>
                  </div>
                </div>
              </Link>
            )}
            {permissions.includes('view_analytics') && (
              <Link
                to="/admin/analytics"
                className="bg-white shadow rounded-lg p-4 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
                    <span className="text-2xl">📈</span>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-gray-900">View Analytics</h3>
                    <p className="text-xs text-gray-500">Reports and statistics</p>
                  </div>
                </div>
              </Link>
            )}
          </div>

          {/* Statistics Cards */}
          {loading ? (
            <div className="text-center py-12 text-gray-500">Loading statistics...</div>
          ) : (
            <StatisticsCards statistics={statistics} />
          )}

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RecentActivity activities={statistics.recentActivity} />
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Links</h3>
              <div className="space-y-3">
                {permissions.includes('review_submissions') && (
                  <Link
                    to="/admin/submissions?status=pending"
                    className="block p-3 bg-yellow-50 border border-yellow-200 rounded-md hover:bg-yellow-100 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900">
                        Pending Reviews ({statistics.pendingSubmissions})
                      </span>
                      <span>→</span>
                    </div>
                  </Link>
                )}
                {permissions.includes('manage_forms') && (
                  <Link
                    to="/admin/forms"
                    className="block p-3 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900">
                        Manage Forms ({statistics.totalForms})
                      </span>
                      <span>→</span>
                    </div>
                  </Link>
                )}
                {permissions.includes('view_analytics') && (
                  <Link
                    to="/admin/analytics"
                    className="block p-3 bg-green-50 border border-green-200 rounded-md hover:bg-green-100 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900">View Analytics</span>
                      <span>→</span>
                    </div>
                  </Link>
                )}
                {permissions.length === 0 && (
                  <p className="text-sm text-gray-500">No quick links available for your role.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

