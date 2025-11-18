import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import apiClient from '@/api/client'
import type { FormResponse } from '@/types'
import { cn } from '@/lib/utils'

export function AdminFormsPage() {
  const navigate = useNavigate()
  const [forms, setForms] = useState<FormResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  // Load forms
  useEffect(() => {
    loadForms()
  }, [])

  const loadForms = async () => {
    setLoading(true)
    try {
      const data = await apiClient.getForms()
      setForms(data)
    } catch (error) {
      console.error('Error loading forms:', error)
    } finally {
      setLoading(false)
    }
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
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{form.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">ID: {form.formId}</p>
                </div>
                <span
                  className={cn(
                    'px-2 py-1 text-xs font-semibold rounded-full',
                    form.isActive
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  )}
                >
                  {form.isActive ? 'Active' : 'Inactive'}
                </span>
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
                  to={`/forms/${form.formId}`}
                  className="btn btn-primary btn-sm flex-1 text-center"
                >
                  Preview
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

