import React, { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import apiClient from '@/api/client'
import { useToast } from '@/components/ui/ToastProvider'
import { useConfirmDialog } from '@/components/ui/ConfirmDialog'
import { cn } from '@/lib/utils'

interface AdminRole {
  id: string
  name: string
  displayName: string
  description: string
  permissions: string[]
  isSystem: boolean
  isActive: boolean
  createdAt: string
}

const AVAILABLE_PERMISSIONS = [
  { id: 'view_dashboard', label: 'View Dashboard' },
  { id: 'manage_forms', label: 'Manage Forms' },
  { id: 'review_submissions', label: 'Review Submissions' },
  { id: 'manage_users', label: 'Manage Users' },
  { id: 'manage_admins', label: 'Manage Admins' },
  { id: 'manage_roles', label: 'Manage Roles' },
  { id: 'view_analytics', label: 'View Analytics' },
  { id: 'manage_settings', label: 'Manage Settings' },
]

export function AdminRolesPage() {
  const navigate = useNavigate()
  const { showSuccess, showError } = useToast()
  const { showConfirm } = useConfirmDialog()
  const queryClient = useQueryClient()
  const [editingRole, setEditingRole] = useState<AdminRole | null>(null)
  const [editForm, setEditForm] = useState({ 
    name: '', 
    displayName: '', 
    description: '', 
    permissions: [] as string[],
    isActive: true 
  })
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [createForm, setCreateForm] = useState({ 
    name: '', 
    displayName: '', 
    description: '', 
    permissions: [] as string[],
    isActive: true 
  })

  // Fetch roles
  const { data: roles = [], isLoading, error } = useQuery<AdminRole[]>({
    queryKey: ['admin-roles'],
    queryFn: () => apiClient.getAdminRoles(),
  })

  // Create role mutation
  const createMutation = useMutation({
    mutationFn: (data: { name: string; displayName: string; description: string; permissions: string[]; isActive: boolean }) =>
      apiClient.createAdminRole(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-roles'] })
      showSuccess('Role created successfully', 'Role Created')
      setShowCreateForm(false)
      setCreateForm({ name: '', displayName: '', description: '', permissions: [], isActive: true })
    },
    onError: (error: any) => {
      showError(error.response?.data?.detail || error.message || 'Failed to create role', 'Create Failed')
    },
  })

  // Update role mutation
  const updateMutation = useMutation({
    mutationFn: ({ roleId, data }: { roleId: string; data: { displayName?: string; description?: string; permissions?: string[]; isActive?: boolean } }) =>
      apiClient.updateAdminRole(roleId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-roles'] })
      showSuccess('Role updated successfully', 'Role Updated')
      setEditingRole(null)
    },
    onError: (error: any) => {
      showError(error.response?.data?.detail || error.message || 'Failed to update role', 'Update Failed')
    },
  })

  // Delete role mutation
  const deleteMutation = useMutation({
    mutationFn: (roleId: string) => apiClient.deleteAdminRole(roleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-roles'] })
      showSuccess('Role deleted successfully', 'Role Deleted')
    },
    onError: (error: any) => {
      showError(error.response?.data?.detail || error.message || 'Failed to delete role', 'Delete Failed')
    },
  })

  const handleEdit = (role: AdminRole) => {
    if (role.isSystem) {
      showError('System roles cannot be edited. You can only modify permissions and status.', 'Edit Restricted')
      return
    }
    setEditingRole(role)
    setEditForm({
      name: role.name,
      displayName: role.displayName,
      description: role.description,
      permissions: [...role.permissions],
      isActive: role.isActive,
    })
  }

  const handleSave = () => {
    if (!editingRole) return

    updateMutation.mutate({
      roleId: editingRole.id,
      data: {
        displayName: editForm.displayName,
        description: editForm.description,
        permissions: editForm.permissions,
        isActive: editForm.isActive,
      },
    })
  }

  const handleCancel = () => {
    setEditingRole(null)
    setEditForm({ name: '', displayName: '', description: '', permissions: [], isActive: true })
  }

  const handleCreate = () => {
    if (!createForm.name || !createForm.displayName) {
      showError('Name and Display Name are required', 'Validation Error')
      return
    }

    // Validate name format (lowercase, no spaces)
    if (!/^[a-z0-9-]+$/.test(createForm.name)) {
      showError('Role name must be lowercase, alphanumeric, and can contain hyphens', 'Validation Error')
      return
    }

    createMutation.mutate({
      name: createForm.name,
      displayName: createForm.displayName,
      description: createForm.description,
      permissions: createForm.permissions,
      isActive: createForm.isActive,
    })
  }

  const handleDelete = (role: AdminRole) => {
    if (role.isSystem) {
      showError('System roles cannot be deleted', 'Delete Restricted')
      return
    }

    showConfirm({
      title: 'Confirm Deletion',
      message: `Are you sure you want to delete role "${role.displayName}"? This action cannot be undone.`,
      confirmText: 'Delete',
      confirmButtonClass: 'btn-error',
      onConfirm: () => {
        deleteMutation.mutate(role.id)
      },
    })
  }

  const togglePermission = (permissionId: string, isCreate: boolean) => {
    if (isCreate) {
      setCreateForm({
        ...createForm,
        permissions: createForm.permissions.includes(permissionId)
          ? createForm.permissions.filter(p => p !== permissionId)
          : [...createForm.permissions, permissionId],
      })
    } else {
      setEditForm({
        ...editForm,
        permissions: editForm.permissions.includes(permissionId)
          ? editForm.permissions.filter(p => p !== permissionId)
          : [...editForm.permissions, permissionId],
      })
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading roles...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Error loading roles. Please try again.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Roles Management</h1>
          <p className="text-gray-600">Create and manage admin roles with custom permissions</p>
        </div>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="btn btn-primary"
        >
          + Create New Role
        </button>
      </div>

      {/* Create Role Form */}
      {showCreateForm && (
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Create New Role</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role Name (ID) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={createForm.name}
                onChange={(e) => setCreateForm({ ...createForm, name: e.target.value.toLowerCase() })}
                className="input w-full"
                placeholder="e.g., moderator, reviewer"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Lowercase, alphanumeric, hyphens allowed</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Display Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={createForm.displayName}
                onChange={(e) => setCreateForm({ ...createForm, displayName: e.target.value })}
                className="input w-full"
                placeholder="e.g., Moderator, Reviewer"
                required
              />
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={createForm.description}
              onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
              className="input w-full"
              rows={3}
              placeholder="Describe the role's purpose and responsibilities"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Permissions
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {AVAILABLE_PERMISSIONS.map((perm) => (
                <label key={perm.id} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={createForm.permissions.includes(perm.id)}
                    onChange={() => togglePermission(perm.id, true)}
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <span className="text-sm text-gray-700">{perm.label}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="mb-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={createForm.isActive}
                onChange={(e) => setCreateForm({ ...createForm, isActive: e.target.checked })}
                className="rounded border-gray-300 text-primary focus:ring-primary"
              />
              <span className="ml-2 text-sm text-gray-700">Active</span>
            </label>
          </div>
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => {
                setShowCreateForm(false)
                setCreateForm({ name: '', displayName: '', description: '', permissions: [], isActive: true })
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
              {createMutation.isPending ? 'Creating...' : 'Create Role'}
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
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Permissions
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {roles.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    No roles found
                  </td>
                </tr>
              ) : (
                roles.map((role) => (
                  <tr key={role.id} className={cn(editingRole?.id === role.id && 'bg-blue-50')}>
                    {editingRole?.id === role.id ? (
                      <>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{role.name}</div>
                          <div className="text-xs text-gray-500">{role.displayName}</div>
                        </td>
                        <td className="px-6 py-4">
                          <textarea
                            value={editForm.description}
                            onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                            className="input w-full text-sm"
                            rows={2}
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                            {AVAILABLE_PERMISSIONS.map((perm) => (
                              <label key={perm.id} className="flex items-center space-x-1 cursor-pointer text-xs">
                                <input
                                  type="checkbox"
                                  checked={editForm.permissions.includes(perm.id)}
                                  onChange={() => togglePermission(perm.id, false)}
                                  className="rounded border-gray-300 text-primary focus:ring-primary"
                                />
                                <span className="text-gray-700">{perm.label}</span>
                              </label>
                            ))}
                          </div>
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
                              {editForm.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </label>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
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
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{role.displayName}</div>
                          <div className="text-xs text-gray-500">{role.name}</div>
                          {role.isSystem && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 mt-1">
                              System
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-500">{role.description}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1">
                            {role.permissions.slice(0, 3).map((perm) => {
                              const permLabel = AVAILABLE_PERMISSIONS.find(p => p.id === perm)?.label || perm
                              return (
                                <span
                                  key={perm}
                                  className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
                                >
                                  {permLabel}
                                </span>
                              )
                            })}
                            {role.permissions.length > 3 && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                +{role.permissions.length - 3} more
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={cn(
                              'px-2 py-1 text-xs font-medium rounded-full',
                              role.isActive
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            )}
                          >
                            {role.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEdit(role)}
                              className="text-primary hover:text-primary-dark"
                              disabled={role.isSystem}
                              title={role.isSystem ? 'System roles cannot be fully edited' : 'Edit role'}
                            >
                              Edit
                            </button>
                            {!role.isSystem && (
                              <button
                                onClick={() => handleDelete(role)}
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
        Total roles: {roles.length}
      </div>
    </div>
  )
}

