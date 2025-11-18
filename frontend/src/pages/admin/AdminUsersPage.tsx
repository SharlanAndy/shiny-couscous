import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import apiClient from '@/api/client'
import { useToast } from '@/components/ui/ToastProvider'
import { useConfirmDialog } from '@/components/ui/ConfirmDialog'
import { cn } from '@/lib/utils'

interface User {
  id: string
  email: string
  name: string
  role: string
  isActive: boolean
  createdAt: string
}

export function AdminUsersPage() {
  const navigate = useNavigate()
  const { showSuccess, showError } = useToast()
  const { showConfirm } = useConfirmDialog()
  const queryClient = useQueryClient()
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [editForm, setEditForm] = useState({ name: '', email: '', isActive: true, password: '' })
  const [showPasswordField, setShowPasswordField] = useState(false)

  // Fetch users
  const { data: users = [], isLoading, error } = useQuery<User[]>({
    queryKey: ['admin-users'],
    queryFn: () => apiClient.getAdminUsers(),
  })

  // Update user mutation
  const updateMutation = useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: { name?: string; email?: string; is_active?: boolean; password?: string } }) => {
      // Convert isActive to is_active for API
      const apiData: { name?: string; email?: string; is_active?: boolean; password?: string } = {}
      if (data.name !== undefined) apiData.name = data.name
      if (data.email !== undefined) apiData.email = data.email
      if (data.is_active !== undefined) apiData.is_active = data.is_active
      if (data.password !== undefined && data.password !== '') apiData.password = data.password
      return apiClient.updateAdminUser(userId, apiData)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      showSuccess('User updated successfully', 'User Updated')
      setEditingUser(null)
    },
    onError: (error: any) => {
      showError(error.response?.data?.detail || error.message || 'Failed to update user', 'Update Failed')
    },
  })

  const handleEdit = (user: User) => {
    setEditingUser(user)
    setEditForm({
      name: user.name,
      email: user.email,
      isActive: user.isActive,
      password: '',
    })
    setShowPasswordField(false)
  }

  const handleSave = () => {
    if (!editingUser) return

    if (showPasswordField && editForm.password && editForm.password.length < 6) {
      showError('Password must be at least 6 characters long', 'Validation Error')
      return
    }

    updateMutation.mutate({
      userId: editingUser.id,
      data: {
        name: editForm.name,
        email: editForm.email,
        is_active: editForm.isActive,
        password: showPasswordField && editForm.password ? editForm.password : undefined,
      },
    })
  }

  const handleCancel = () => {
    setEditingUser(null)
    setEditForm({ name: '', email: '', isActive: true, password: '' })
    setShowPasswordField(false)
  }

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    } catch {
      return dateString
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading users...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Error loading users. Please try again.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">User Management</h1>
        <p className="text-gray-600">Manage user accounts and profile information</p>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created At
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className={cn(editingUser?.id === user.id && 'bg-blue-50')}>
                    {editingUser?.id === user.id ? (
                      <>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="text"
                            value={editForm.name}
                            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                            className="input w-full"
                            placeholder="Name"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="email"
                            value={editForm.email}
                            onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                            className="input w-full"
                            placeholder="Email"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={editForm.isActive}
                              onChange={(e) => setEditForm({ ...editForm, isActive: e.target.checked })}
                              className="rounded border-gray-300 text-primary focus:ring-primary"
                            />
                            <span className="ml-2 text-sm text-gray-700">
                              {editForm.isActive ? 'Active' : 'Frozen'}
                            </span>
                          </label>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(user.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="space-y-2">
                            <div className="flex space-x-2">
                              <button
                                onClick={handleSave}
                                disabled={updateMutation.isPending}
                                className="text-green-600 hover:text-green-900 disabled:opacity-50"
                              >
                                {updateMutation.isPending ? 'Saving...' : 'Save'}
                              </button>
                              <button
                                onClick={handleCancel}
                                className="text-gray-600 hover:text-gray-900"
                              >
                                Cancel
                              </button>
                            </div>
                            <div>
                              <button
                                type="button"
                                onClick={() => setShowPasswordField(!showPasswordField)}
                                className="text-xs text-primary hover:text-primary-dark"
                              >
                                {showPasswordField ? 'Hide' : 'Change Password'}
                              </button>
                            </div>
                            {showPasswordField && (
                              <div className="mt-2">
                                <input
                                  type="password"
                                  value={editForm.password}
                                  onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                                  className="input w-full text-xs"
                                  placeholder="New password"
                                />
                              </div>
                            )}
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={cn(
                              'px-2 py-1 text-xs font-medium rounded-full',
                              user.isActive
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            )}
                          >
                            {user.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(user.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEdit(user)}
                              className="text-primary hover:text-primary-dark"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => {
                                showConfirm({
                                  title: user.isActive ? 'Freeze User' : 'Activate User',
                                  message: `Are you sure you want to ${user.isActive ? 'freeze' : 'activate'} user "${user.name}"? ${user.isActive ? 'They will not be able to login.' : 'They will be able to login again.'}`,
                                  confirmText: user.isActive ? 'Freeze' : 'Activate',
                                  confirmButtonClass: user.isActive ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700',
                                  onConfirm: () => {
                                    updateMutation.mutate({
                                      userId: user.id,
                                      data: { is_active: !user.isActive },
                                    })
                                  },
                                })
                              }}
                              className={cn(
                                'text-xs',
                                user.isActive ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'
                              )}
                            >
                              {user.isActive ? 'Freeze' : 'Activate'}
                            </button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-4 text-sm text-gray-500">
        Total users: {users.length}
      </div>
    </div>
  )
}

