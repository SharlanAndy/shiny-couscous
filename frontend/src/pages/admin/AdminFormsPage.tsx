import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import apiClient from '@/api/client'
import type { FormResponse } from '@/types'
import { cn } from '@/lib/utils'
import { useToast } from '@/components/ui/ToastProvider'
import { useConfirmDialog } from '@/components/ui/ConfirmDialog'

export function AdminFormsPage() {
  const navigate = useNavigate()
  const { showSuccess, showError } = useToast()
  const { showConfirm } = useConfirmDialog()
  const queryClient = useQueryClient()
  const [forms, setForms] = useState<FormResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [togglingFormId, setTogglingFormId] = useState<string | null>(null)
  const [deletingFormId, setDeletingFormId] = useState<string | null>(null)

  // Load forms
  useEffect(() => {
    loadForms()
  }, [])

  const loadForms = async () => {
    setLoading(true)
    try {
      // Admin panel should show ALL forms (active and inactive)
      const data = await apiClient.getForms({ includeInactive: true })
      setForms(data)
    } catch (error) {
      console.error('Error loading forms:', error)
    } finally {
      setLoading(false)
    }
  }

  // Toggle form active status mutation
  const toggleActiveMutation = useMutation({
    mutationFn: async ({ formId, isActive }: { formId: string; isActive: boolean }) => {
      return await apiClient.updateForm(formId, { is_active: isActive })
    },
    onSuccess: (updatedForm) => {
      // Update local state
      setForms((prevForms) =>
        prevForms.map((form) =>
          form.formId === updatedForm.formId ? updatedForm : form
        )
      )
      queryClient.invalidateQueries({ queryKey: ['forms'] })
      showSuccess(
        `Form ${updatedForm.isActive ? 'activated' : 'deactivated'} successfully`,
        'Status Updated'
      )
      setTogglingFormId(null)
    },
    onError: (error: any) => {
      showError(
        error.response?.data?.detail || error.message || 'Failed to update form status',
        'Update Failed'
      )
      setTogglingFormId(null)
    },
  })

  const handleToggleActive = (form: FormResponse) => {
    setTogglingFormId(form.formId)
    toggleActiveMutation.mutate({
      formId: form.formId,
      isActive: !form.isActive,
    })
  }

  // Delete form mutation
  const deleteFormMutation = useMutation({
    mutationFn: async (formId: string) => {
      return await apiClient.deleteForm(formId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forms'] })
      loadForms() // Reload forms list
      showSuccess('Form deleted successfully', 'Form Deleted')
      setDeletingFormId(null)
    },
    onError: (error: any) => {
      showError(
        error.response?.data?.detail || error.message || 'Failed to delete form',
        'Delete Failed'
      )
      setDeletingFormId(null)
    },
  })

  const handleDelete = (form: FormResponse) => {
    showConfirm({
      title: 'Delete Form',
      message: `Are you sure you want to delete "${form.name}"? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      confirmButtonClass: 'bg-red-600 hover:bg-red-700',
      onConfirm: () => {
        setDeletingFormId(form.formId)
        deleteFormMutation.mutate(form.formId)
      },
    })
  }

  const filteredForms = forms.filter(
    (form) =>
      form.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      form.formId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      form.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Forms</h1>
          <p className="text-gray-600">Manage form schemas and configurations</p>
        </div>
        <button onClick={() => navigate('/admin/forms/create')} className="btn btn-primary">
          + Create New Form
        </button>
      </div>

      {/* Search */}
      <div className="bg-white shadow rounded-lg p-6">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search forms..."
          className="input w-full"
        />
      </div>

      {/* Forms Grid */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading forms...</div>
      ) : filteredForms.length === 0 ? (
        <div className="text-center py-12 text-gray-500">No forms found</div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredForms.map((form) => (
            <div key={form.id} className="bg-white shadow rounded-lg p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">{form.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">ID: {form.formId}</p>
                </div>
                <div className="flex items-center space-x-2 ml-4">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.isActive}
                      onChange={() => handleToggleActive(form)}
                      disabled={togglingFormId === form.formId}
                      className="sr-only"
                    />
                    <div
                      className={cn(
                        'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                        form.isActive ? 'bg-green-500' : 'bg-gray-300',
                        togglingFormId === form.formId && 'opacity-50 cursor-not-allowed'
                      )}
                    >
                      <span
                        className={cn(
                          'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                          form.isActive ? 'translate-x-6' : 'translate-x-1'
                        )}
                      />
                    </div>
                    <span className="ml-2 text-xs text-gray-600">
                      {form.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </label>
                </div>
              </div>

              {form.description && (
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{form.description}</p>
              )}

              <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                <span>Version: {form.version}</span>
                {form.category && <span>{form.category}</span>}
              </div>

              <div className="flex space-x-2">
                <Link
                  to={`/admin/forms/${form.formId}/schema`}
                  className="btn btn-secondary btn-sm flex-1 text-center"
                >
                  Edit Schema
                </Link>
                <Link
                  to={`/admin/forms/${form.formId}/schema?tab=preview`}
                  className="btn btn-primary btn-sm flex-1 text-center"
                >
                  Preview
                </Link>
                <button
                  onClick={() => handleDelete(form)}
                  disabled={deletingFormId === form.formId}
                  className={cn(
                    'btn bg-red-600 hover:bg-red-700 text-white btn-sm',
                    deletingFormId === form.formId && 'opacity-50 cursor-not-allowed'
                  )}
                  title="Delete form"
                >
                  {deletingFormId === form.formId ? 'Deleting...' : '🗑️'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

