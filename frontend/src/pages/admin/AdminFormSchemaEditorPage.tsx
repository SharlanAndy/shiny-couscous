import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import apiClient from '@/api/client'
import type { FormResponse, FormSchemaResponse } from '@/types'
import { cn } from '@/lib/utils'

export function AdminFormSchemaEditorPage() {
  const { formId } = useParams<{ formId: string }>()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<'visual' | 'json'>('visual')
  const [jsonSchema, setJsonSchema] = useState<string>('')
  const [isValidJson, setIsValidJson] = useState(true)

  // Load form
  const { data: form, isLoading: formLoading } = useQuery<FormResponse>({
    queryKey: ['form', formId],
    queryFn: () => {
      if (!formId) throw new Error('Form ID is required')
      return apiClient.getForm(formId)
    },
    enabled: !!formId,
  })

  // Load form schema
  const { data: schema, isLoading: schemaLoading } = useQuery<FormSchemaResponse>({
    queryKey: ['form-schema', formId],
    queryFn: () => {
      if (!formId) throw new Error('Form ID is required')
      return apiClient.getFormSchema(formId)
    },
    enabled: !!formId,
  })

  // Update JSON schema when schema loads
  useEffect(() => {
    if (schema) {
      setJsonSchema(JSON.stringify(schema, null, 2))
    }
  }, [schema])

  // Validate JSON
  const validateJson = (jsonString: string): boolean => {
    try {
      JSON.parse(jsonString)
      return true
    } catch {
      return false
    }
  }

  // Handle JSON change
  const handleJsonChange = (value: string) => {
    setJsonSchema(value)
    setIsValidJson(validateJson(value))
  }

  // Save schema mutation
  const saveMutation = useMutation({
    mutationFn: async (schemaData: FormSchemaResponse) => {
      // TODO: Implement API endpoint for saving schema
      // await apiClient.client.put(`/api/admin/forms/${formId}/schema`, schemaData)
      await new Promise((resolve) => setTimeout(resolve, 500))
      return schemaData
    },
    onSuccess: () => {
      alert('Form schema saved successfully')
    },
  })

  // Handle save
  const handleSave = () => {
    if (!isValidJson) {
      alert('Invalid JSON. Please fix errors before saving.')
      return
    }

    try {
      const parsedSchema = JSON.parse(jsonSchema)
      saveMutation.mutate(parsedSchema)
    } catch (error) {
      alert('Error parsing JSON schema')
    }
  }

  if (formLoading || schemaLoading) {
    return (
      <div className="text-center py-12 text-gray-500">Loading form schema...</div>
    )
  }

  if (!form || !schema) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <p className="text-sm text-red-800">Form not found</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <button
          onClick={() => navigate('/admin/forms')}
          className="text-sm text-gray-600 hover:text-gray-900 mb-4"
        >
          ← Back to Forms
        </button>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Form Schema</h1>
        <p className="text-gray-600">Form: {form.name} (ID: {form.formId})</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('visual')}
            className={cn(
              'py-4 px-1 border-b-2 font-medium text-sm',
              activeTab === 'visual'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            )}
          >
            Visual Editor
          </button>
          <button
            onClick={() => setActiveTab('json')}
            className={cn(
              'py-4 px-1 border-b-2 font-medium text-sm',
              activeTab === 'json'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            )}
          >
            JSON Editor
          </button>
          <button
            onClick={() => window.open(`/forms/${formId}`, '_blank')}
            className="py-4 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 font-medium text-sm"
          >
            Preview Form
          </button>
        </nav>
      </div>

      {/* Editor Content */}
      <div className="bg-white shadow rounded-lg">
        {activeTab === 'visual' ? (
          <div className="p-6">
            <div className="text-center py-12 text-gray-500">
              <p className="mb-4">Visual form builder coming soon...</p>
              <p className="text-sm">
                For now, please use the JSON Editor to modify the form schema.
              </p>
            </div>
          </div>
        ) : (
          <div className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-700">
                Form Schema (JSON)
              </label>
              {!isValidJson && (
                <span className="text-sm text-red-600">Invalid JSON</span>
              )}
            </div>
            <textarea
              value={jsonSchema}
              onChange={(e) => handleJsonChange(e.target.value)}
              className={cn(
                'w-full h-96 font-mono text-sm border rounded-md p-4',
                isValidJson ? 'border-gray-300' : 'border-red-300 bg-red-50'
              )}
              spellCheck={false}
            />
            <div className="mt-4 text-sm text-gray-500">
              <p>Edit the JSON schema directly. Changes will be validated before saving.</p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
          <button
            onClick={() => navigate('/admin/forms')}
            className="btn btn-secondary"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!isValidJson || saveMutation.isPending}
            className={cn(
              'btn btn-primary',
              (!isValidJson || saveMutation.isPending) && 'opacity-50 cursor-not-allowed'
            )}
          >
            {saveMutation.isPending ? 'Saving...' : 'Save Schema'}
          </button>
        </div>
      </div>
    </div>
  )
}

