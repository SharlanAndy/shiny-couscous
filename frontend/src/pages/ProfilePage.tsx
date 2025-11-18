import React, { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import apiClient from '@/api/client'
import { useToast } from '@/components/ui/ToastProvider'
import { useConfirmDialog } from '@/components/ui/ConfirmDialog'
import { cn } from '@/lib/utils'

interface UserProfile {
  id: string
  email: string
  name: string
  role: string
  isActive: boolean
  createdAt: string
}

export function ProfilePage() {
  const navigate = useNavigate()
  const { showSuccess, showError } = useToast()
  const { showConfirm } = useConfirmDialog()
  const queryClient = useQueryClient()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({ name: '', email: '' })
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [showDeleteForm, setShowDeleteForm] = useState(false)
  const [deletePassword, setDeletePassword] = useState('')

  // Fetch current user profile
  const { data: user, isLoading, error } = useQuery<UserProfile>({
    queryKey: ['user-profile'],
    queryFn: () => apiClient.getCurrentUser(),
  })

  // Update profile mutation
  const updateMutation = useMutation({
    mutationFn: (data: { name?: string; email?: string }) => apiClient.updateProfile(data),
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(['user-profile'], updatedUser)
      
      // Check if email was changed
      if (updatedUser.emailChanged) {
        // Email changed - kick user out
        showSuccess('Email updated successfully. Please login again with your new email.', 'Email Updated')
        // Clear session and redirect to login
        setTimeout(() => {
          apiClient.logout()
          localStorage.clear()
          navigate('/login')
        }, 2000)
        return
      }
      
      // Update localStorage user data
      const userStr = localStorage.getItem('user')
      if (userStr) {
        try {
          const userObj = JSON.parse(userStr)
          userObj.name = updatedUser.name
          userObj.email = updatedUser.email
          localStorage.setItem('user', JSON.stringify(userObj))
        } catch (e) {
          console.error('Error updating localStorage:', e)
        }
      }
      showSuccess('Profile updated successfully', 'Profile Updated')
      setIsEditing(false)
    },
    onError: (error: any) => {
      showError(error.response?.data?.detail || error.message || 'Failed to update profile', 'Update Failed')
    },
  })

  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: (data: { currentPassword: string; newPassword: string }) => 
      apiClient.changePassword(data.currentPassword, data.newPassword),
    onSuccess: () => {
      showSuccess('Password changed successfully', 'Password Changed')
      setShowPasswordForm(false)
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    },
    onError: (error: any) => {
      showError(error.response?.data?.detail || error.message || 'Failed to change password', 'Change Password Failed')
    },
  })

  // Delete account mutation
  const deleteAccountMutation = useMutation({
    mutationFn: (password: string) => apiClient.deleteAccount(password),
    onSuccess: () => {
      showSuccess('Account deleted successfully', 'Account Deleted')
      // Clear session and redirect to login
      setTimeout(() => {
        apiClient.logout()
        localStorage.clear()
        navigate('/login')
      }, 2000)
    },
    onError: (error: any) => {
      showError(error.response?.data?.detail || error.message || 'Failed to delete account', 'Delete Failed')
    },
  })

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
      })
    }
  }, [user])

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleCancel = () => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
      })
    }
    setIsEditing(false)
  }

  const handleSave = () => {
    if (!formData.name.trim() || !formData.email.trim()) {
      showError('Name and email are required', 'Validation Error')
      return
    }

    updateMutation.mutate({
      name: formData.name.trim(),
      email: formData.email.trim(),
    })
  }

  const handleChangePassword = () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      showError('All password fields are required', 'Validation Error')
      return
    }

    if (passwordForm.newPassword.length < 6) {
      showError('New password must be at least 6 characters long', 'Validation Error')
      return
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showError('New passwords do not match', 'Validation Error')
      return
    }

    changePasswordMutation.mutate({
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword,
    })
  }

  const handleDeleteAccount = () => {
    if (!deletePassword) {
      showError('Password is required to delete account', 'Validation Error')
      return
    }

    showConfirm({
      title: 'Delete Account',
      message: 'Are you sure you want to delete your account? This action cannot be undone. All your data will be permanently deleted.',
      confirmText: 'Delete Account',
      confirmButtonClass: 'bg-red-600 hover:bg-red-700',
      onConfirm: () => {
        deleteAccountMutation.mutate(deletePassword)
      },
    })
  }

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
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
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (error || !user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Error loading profile. Please try again.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Profile</h1>
        <p className="text-gray-600">Manage your profile information</p>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <div className="border-b border-gray-200 pb-4 mb-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Basic Information</h2>
            {!isEditing && (
              <button
                onClick={handleEdit}
                className="btn btn-primary"
              >
                Edit Profile
              </button>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name <span className="text-red-500">*</span>
            </label>
            {isEditing ? (
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input w-full"
                placeholder="Enter your full name"
                required
              />
            ) : (
              <div className="text-gray-900 py-2">{user.name || 'Not set'}</div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address <span className="text-red-500">*</span>
            </label>
            {isEditing ? (
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="input w-full"
                placeholder="Enter your email address"
                required
              />
            ) : (
              <div className="text-gray-900 py-2">{user.email}</div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Account Status</label>
            <div className="py-2">
              <span
                className={cn(
                  'px-3 py-1 text-sm font-medium rounded-full',
                  user.isActive
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                )}
              >
                {user.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Member Since</label>
            <div className="text-gray-900 py-2">{formatDate(user.createdAt)}</div>
          </div>

          {isEditing && (
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                onClick={handleCancel}
                className="btn btn-secondary"
                disabled={updateMutation.isPending}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={updateMutation.isPending}
                className="btn btn-primary"
              >
                {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Change Password Section */}
      <div className="bg-white shadow rounded-lg p-6 mt-6">
        <div className="border-b border-gray-200 pb-4 mb-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Change Password</h2>
            {!showPasswordForm && (
              <button
                onClick={() => setShowPasswordForm(true)}
                className="btn btn-secondary"
              >
                Change Password
              </button>
            )}
          </div>
        </div>

        {showPasswordForm && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                className="input w-full"
                placeholder="Enter current password"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                New Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                className="input w-full"
                placeholder="Enter new password (min 6 characters)"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm New Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                className="input w-full"
                placeholder="Confirm new password"
                required
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowPasswordForm(false)
                  setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
                }}
                className="btn btn-secondary"
                disabled={changePasswordMutation.isPending}
              >
                Cancel
              </button>
              <button
                onClick={handleChangePassword}
                disabled={changePasswordMutation.isPending}
                className="btn btn-primary"
              >
                {changePasswordMutation.isPending ? 'Changing...' : 'Change Password'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Account Section */}
      <div className="bg-white shadow rounded-lg p-6 mt-6 border-2 border-red-200">
        <div className="border-b border-red-200 pb-4 mb-6">
          <h2 className="text-xl font-semibold text-red-900">Delete Account</h2>
          <p className="text-sm text-red-700 mt-2">
            Once you delete your account, there is no going back. Please be certain.
          </p>
        </div>

        {!showDeleteForm ? (
          <button
            onClick={() => setShowDeleteForm(true)}
            className="btn bg-red-600 hover:bg-red-700 text-white"
          >
            Delete My Account
          </button>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Enter Password to Confirm <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                className="input w-full"
                placeholder="Enter your password to confirm deletion"
                required
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowDeleteForm(false)
                  setDeletePassword('')
                }}
                className="btn btn-secondary"
                disabled={deleteAccountMutation.isPending}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteAccountMutation.isPending}
                className="btn bg-red-600 hover:bg-red-700 text-white"
              >
                {deleteAccountMutation.isPending ? 'Deleting...' : 'Delete Account'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

