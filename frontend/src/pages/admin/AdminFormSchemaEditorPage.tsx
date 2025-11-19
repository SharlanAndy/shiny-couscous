import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import apiClient from '@/api/client'
import type { FormResponse, FormSchemaResponse } from '@/types'
import { cn } from '@/lib/utils'
import { useToast } from '@/components/ui/ToastProvider'
import { FormRenderer } from '@/components/forms/FormRenderer'
import { VisualFormBuilder } from '@/components/admin/VisualFormBuilder'

export function AdminFormSchemaEditorPage() {
  const { formId } = useParams<{ formId: string }>()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { showSuccess, showError } = useToast()
  
  // Initialize activeTab from URL query parameter, default to 'visual'
  const tabParam = searchParams.get('tab') as 'visual' | 'json' | 'preview' | null
  const [activeTab, setActiveTab] = useState<'visual' | 'json' | 'preview'>(
    tabParam && ['visual', 'json', 'preview'].includes(tabParam) ? tabParam : 'visual'
  )
  const [jsonSchema, setJsonSchema] = useState<string>('')
  const [isValidJson, setIsValidJson] = useState(true)
  const [previewSchema, setPreviewSchema] = useState<FormSchemaResponse | null>(null)
  const [previewFormData, setPreviewFormData] = useState<Record<string, any>>({})
  const [visualMode, setVisualMode] = useState<'builder' | 'preview'>('builder')

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

  // Update activeTab when URL query parameter changes
  useEffect(() => {
    const tabParam = searchParams.get('tab') as 'visual' | 'json' | 'preview' | null
    if (tabParam && ['visual', 'json', 'preview'].includes(tabParam)) {
      setActiveTab(tabParam)
    }
  }, [searchParams])

  // Handler to change tab and update URL
  const handleTabChange = (tab: 'visual' | 'json' | 'preview') => {
    setActiveTab(tab)
    navigate(`/admin/forms/${formId}/schema?tab=${tab}`, { replace: true })
  }

  // Update JSON schema when schema loads
  useEffect(() => {
    if (schema) {
      setJsonSchema(JSON.stringify(schema, null, 2))
      setPreviewSchema(schema)
    }
  }, [schema])

  // Update preview schema when JSON changes (debounced)
  useEffect(() => {
    if (jsonSchema && isValidJson) {
      try {
        const parsed = JSON.parse(jsonSchema)
        setPreviewSchema(parsed as FormSchemaResponse)
      } catch {
        // Invalid JSON, keep previous preview
      }
    }
  }, [jsonSchema, isValidJson])

  // Handle preview field change (readonly preview, but we track changes for display)
  const handlePreviewFieldChange = (stepId: string, fieldName: string, value: any) => {
    setPreviewFormData((prev) => ({
      ...prev,
      [stepId]: {
        ...prev[stepId],
        [fieldName]: value,
      },
    }))
  }

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
      if (!formId) throw new Error('Form ID is required')
      return await apiClient.updateFormSchema(formId, schemaData)
    },
    onSuccess: () => {
      showSuccess('Form schema has been saved successfully.', 'Schema Saved')
      // Refetch schema to get latest version
      setTimeout(() => window.location.reload(), 1000)
    },
    onError: (error: any) => {
      showError(
        error.response?.data?.detail || error.message || 'Failed to save schema',
        'Save Failed'
      )
    },
  })

  // Handle visual builder schema change
  const handleVisualSchemaChange = (updatedSchema: FormSchemaResponse) => {
    setPreviewSchema(updatedSchema)
    setJsonSchema(JSON.stringify(updatedSchema, null, 2))
    setIsValidJson(true)
  }

  // Handle save
  const handleSave = () => {
    if (!isValidJson) {
      showError('Invalid JSON. Please fix errors before saving.', 'Validation Error')
      return
    }

    try {
      const parsedSchema = previewSchema || JSON.parse(jsonSchema)
      saveMutation.mutate(parsedSchema)
    } catch (error: any) {
      showError('Error parsing JSON schema', 'Parse Error')
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
            onClick={() => handleTabChange('visual')}
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
            onClick={() => handleTabChange('json')}
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
            onClick={() => handleTabChange('preview')}
            className={cn(
              'py-4 px-1 border-b-2 font-medium text-sm',
              activeTab === 'preview'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            )}
          >
            Preview Form
          </button>
        </nav>
      </div>

      {/* Editor Content */}
      <div className="bg-white shadow rounded-lg">
        {activeTab === 'visual' ? (
          <div className="flex flex-col h-[calc(100vh-300px)]">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Visual Form Builder</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setVisualMode('builder')}
                  className={cn(
                    'px-3 py-1 text-sm rounded-md',
                    visualMode === 'builder'
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  )}
                >
                  Builder
                </button>
                <button
                  onClick={() => setVisualMode('preview')}
                  className={cn(
                    'px-3 py-1 text-sm rounded-md',
                    visualMode === 'preview'
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  )}
                >
                  Preview
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-hidden">
              {visualMode === 'builder' && schema ? (
                <VisualFormBuilder
                  initialSchema={schema}
                  onChange={handleVisualSchemaChange}
                />
              ) : (
                <div className="p-4 sm:p-6 h-full overflow-y-auto">
                  {previewSchema && previewSchema.steps && previewSchema.steps.length > 0 ? (
                    <div className="border border-gray-200 rounded-lg p-4 sm:p-6 bg-gray-50 max-h-full overflow-y-auto">
                      <FormRenderer
                        steps={previewSchema.steps}
                        formData={previewFormData}
                        errors={{}}
                        onChange={handlePreviewFieldChange}
                        onBlur={() => {}}
                        readonly={true}
                      />
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <p className="mb-2 sm:mb-4 text-sm sm:text-base">No form preview available</p>
                      <p className="text-xs sm:text-sm">
                        Please ensure the JSON schema is valid and contains at least one step with fields.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : activeTab === 'preview' ? (
          <div className="p-4 sm:p-6">
            <div className="mb-4 sm:mb-6">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3">Form Preview</h3>
              <p className="text-xs sm:text-sm text-gray-600">
                This is how the form will appear to users. Make changes in the JSON Editor and save to update.
              </p>
            </div>
            
            {previewSchema && previewSchema.steps && previewSchema.steps.length > 0 ? (
              <div className="border border-gray-200 rounded-lg p-4 sm:p-6 bg-white">
                <FormRenderer
                  steps={previewSchema.steps}
                  formData={previewFormData}
                  errors={{}}
                  onChange={handlePreviewFieldChange}
                  onBlur={() => {}}
                  readonly={true}
                />
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <p className="mb-2 sm:mb-4 text-sm sm:text-base">No form preview available</p>
                <p className="text-xs sm:text-sm">
                  Please ensure the JSON schema is valid and contains at least one step with fields.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="p-4 sm:p-6">
            <div className="mb-3 sm:mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
              <label className="block text-sm sm:text-base font-medium text-gray-700">
                Form Schema (JSON)
              </label>
              {!isValidJson && (
                <span className="text-xs sm:text-sm text-red-600 font-medium">Invalid JSON</span>
              )}
            </div>
            <textarea
              value={jsonSchema}
              onChange={(e) => handleJsonChange(e.target.value)}
              className={cn(
                'w-full h-96 font-mono text-xs sm:text-sm border rounded-md p-3 sm:p-4 resize-y',
                isValidJson ? 'border-gray-300' : 'border-red-300 bg-red-50'
              )}
              spellCheck={false}
              placeholder='{"formId": "...", "formName": "...", "steps": [...]}'
            />
            <div className="mt-3 sm:mt-4 text-xs sm:text-sm text-gray-500">
              <p>Edit the JSON schema directly. Changes will be validated before saving. Switch to Visual Editor or Preview to see your changes.</p>
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

