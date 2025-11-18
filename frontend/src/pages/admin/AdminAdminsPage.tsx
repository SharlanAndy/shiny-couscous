import React, { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import apiClient from '@/api/client'
import { useToast } from '@/components/ui/ToastProvider'
import { useConfirmDialog } from '@/components/ui/ConfirmDialog'
import { cn } from '@/lib/utils'

interface Admin {
  id: string
  email: string
  name: string
  role: string
  isActive: boolean
  createdAt: string
}

export function AdminAdminsPage() {
  const navigate = useNavigate()
  const { showSuccess, showError } = useToast()
  const { showConfirm } = useConfirmDialog()
  const queryClient = useQueryClient()
  const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null)
  const [editForm, setEditForm] = useState({ name: '', email: '', isActive: true, password: '' })
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [createForm, setCreateForm] = useState({ name: '', email: '', password: '' })
  const [showPasswordField, setShowPasswordField] = useState(false)
  const [isSuperAdmin, setIsSuperAdmin] = useState(false)

  // Get current admin info
  const currentAdminStr = localStorage.getItem('user')
  const currentAdmin = currentAdminStr ? JSON.parse(currentAdminStr) : null
  const currentAdminId = currentAdmin?.id || null
  const currentAdminRole = localStorage.getItem('userRole') || 'admin'

  // Check if current admin is superAdmin
  useEffect(() => {
    setIsSuperAdmin(currentAdminRole === 'superAdmin')
  }, [currentAdminRole])

  // Fetch admins
  const { data: admins = [], isLoading, error } = useQuery<Admin[]>({
    queryKey: ['admin-admins'],
    queryFn: () => apiClient.getAdminAdmins(),
  })

  // Create admin mutation
  const createMutation = useMutation({
    mutationFn: (data: { email: string; password: string; name?: string }) =>
      apiClient.createAdmin(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-admins'] })
      showSuccess('Admin created successfully', 'Admin Created')
      setShowCreateForm(false)
      setCreateForm({ name: '', email: '', password: '' })
    },
    onError: (error: any) => {
      showError(error.response?.data?.detail || error.message || 'Failed to create admin', 'Create Failed')
    },
  })

  // Update admin mutation
  const updateMutation = useMutation({
    mutationFn: ({ adminId, data }: { adminId: string; data: { name?: string; email?: string; is_active?: boolean; password?: string } }) => {
      const apiData: { name?: string; email?: string; is_active?: boolean; password?: string } = {}
      if (data.name !== undefined) apiData.name = data.name
      if (data.email !== undefined) apiData.email = data.email
      if (data.is_active !== undefined) apiData.is_active = data.is_active
      if (data.password !== undefined && data.password !== '') apiData.password = data.password
      return apiClient.updateAdminAdmin(adminId, apiData)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-admins'] })
      showSuccess('Admin updated successfully', 'Admin Updated')
      setEditingAdmin(null)
    },
    onError: (error: any) => {
      showError(error.response?.data?.detail || error.message || 'Failed to update admin', 'Update Failed')
    },
  })

  // Delete admin mutation
  const deleteMutation = useMutation({
    mutationFn: (adminId: string) => apiClient.deleteAdmin(adminId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-admins'] })
      showSuccess('Admin deleted successfully', 'Admin Deleted')
    },
    onError: (error: any) => {
      showError(error.response?.data?.detail || error.message || 'Failed to delete admin', 'Delete Failed')
    },
  })

  const handleEdit = (admin: Admin) => {
    // Check permissions: non-superAdmin can only edit their own account
    if (!isSuperAdmin && admin.id !== currentAdminId) {
      showError('You can only edit your own account. Only superAdmin can edit other admins.', 'Permission Denied')
      return
    }
    
    setEditingAdmin(admin)
    setEditForm({
      name: admin.name,
      email: admin.email,
      isActive: admin.isActive,
      password: '',
    })
    setShowPasswordField(false)
  }

  const handleSave = () => {
    if (!editingAdmin) return

    // Check permissions: non-superAdmin can only edit their own account
    if (!isSuperAdmin && editingAdmin.id !== currentAdminId) {
      showError('You can only edit your own account. Only superAdmin can edit other admins.', 'Permission Denied')
      return
    }

    // Non-superAdmin can only change password and email for their own account
    const updateData: { name?: string; email?: string; is_active?: boolean; password?: string } = {}
    
    if (isSuperAdmin) {
      // superAdmin can edit everything
      updateData.name = editForm.name
      updateData.email = editForm.email
      updateData.is_active = editForm.isActive
      if (showPasswordField && editForm.password) {
        updateData.password = editForm.password
      }
    } else {
      // Regular admin can only edit email and password for their own account
      updateData.email = editForm.email
      if (showPasswordField && editForm.password) {
        if (editForm.password.length < 6) {
          showError('Password must be at least 6 characters long', 'Validation Error')
          return
        }
        updateData.password = editForm.password
      }
    }

    updateMutation.mutate({
      adminId: editingAdmin.id,
      data: updateData,
    })
  }

  const handleCancel = () => {
    setEditingAdmin(null)
    setEditForm({ name: '', email: '', isActive: true, password: '' })
    setShowPasswordField(false)
  }

  const handleCreate = () => {
    if (!createForm.email || !createForm.password) {
      showError('Email and password are required', 'Validation Error')
      return
    }

    createMutation.mutate({
      email: createForm.email,
      password: createForm.password,
      name: createForm.name || undefined,
    })
  }

  const handleDelete = (admin: Admin) => {
    if (admin.id === currentAdminId) {
      showError('Cannot delete your own admin account', 'Delete Failed')
      return
    }

    showConfirm({
      title: 'Confirm Deletion',
      message: `Are you sure you want to delete admin "${admin.name}" (${admin.email})? This action cannot be undone.`,
      confirmText: 'Delete',
      confirmButtonClass: 'btn-error',
      onConfirm: () => {
        deleteMutation.mutate(admin.id)
      },
    })
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
          <p className="mt-4 text-gray-600">Loading admins...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Error loading admins. Please try again.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Management</h1>
          <p className="text-gray-600">Manage admin accounts and privileges</p>
        </div>
        {isSuperAdmin && (
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="btn btn-primary"
          >
            + Create New Admin
          </button>
        )}
      </div>

      {/* Create Admin Form */}
      {showCreateForm && (
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Create New Admin</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={createForm.name}
                onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                className="input w-full"
                placeholder="Admin name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={createForm.email}
                onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                className="input w-full"
                placeholder="admin@example.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                value={createForm.password}
                onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                className="input w-full"
                placeholder="Password"
                required
              />
            </div>
          </div>
          <div className="flex justify-end space-x-3 mt-4">
            <button
              onClick={() => {
                setShowCreateForm(false)
                setCreateForm({ name: '', email: '', password: '' })
              }}
              className="btn btn-secondary"
              disabled={createMutation.isPending}
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              disabled={createMutation.isPending}
              className="btn btn-primary"
            >
              {createMutation.isPending ? 'Creating...' : 'Create Admin'}
            </button>
          </div>
        </div>
      )}

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Admin
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
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
              {admins.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    No admins found
                  </td>
                </tr>
              ) : (
                admins.map((admin) => (
                  <tr key={admin.id} className={cn(editingAdmin?.id === admin.id && 'bg-blue-50')}>
                    {editingAdmin?.id === admin.id ? (
                      <>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="text"
                            value={editForm.name}
                            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                            className="input w-full"
                            placeholder="Name"
                            disabled={!isSuperAdmin}
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
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                            {admin.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={editForm.isActive}
                              onChange={(e) => setEditForm({ ...editForm, isActive: e.target.checked })}
                              className="rounded border-gray-300 text-primary focus:ring-primary"
                              disabled={!isSuperAdmin}
                            />
                            <span className="ml-2 text-sm text-gray-700">
                              {editForm.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </label>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(admin.createdAt)}
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
                          <div className="text-sm font-medium text-gray-900">{admin.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{admin.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                            {admin.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={cn(
                              'px-2 py-1 text-xs font-medium rounded-full',
                              admin.isActive
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            )}
                          >
                            {admin.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(admin.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEdit(admin)}
                              className="text-primary hover:text-primary-dark"
                              disabled={!isSuperAdmin && admin.id !== currentAdminId}
                              title={!isSuperAdmin && admin.id !== currentAdminId ? 'You can only edit your own account' : ''}
                            >
                              Edit
                            </button>
                            {isSuperAdmin && admin.id !== currentAdminId && (
                              <button
                                onClick={() => handleDelete(admin)}
                                disabled={deleteMutation.isPending}
                                className="text-red-600 hover:text-red-900 disabled:opacity-50"
                              >
                                {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
                              </button>
                            )}
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
        Total admins: {admins.length}
      </div>
    </div>
  )
}

