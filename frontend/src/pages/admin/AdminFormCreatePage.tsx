import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import apiClient from '@/api/client'
import { cn } from '@/lib/utils'
import { useToast } from '@/components/ui/ToastProvider'
import { VisualFormBuilder } from '@/components/admin/VisualFormBuilder'
import type { FormSchemaResponse } from '@/types'

interface FormCreateData {
  form_id: string
  name: string
  description?: string
  category?: string
  version: string
  schema_data: any
  is_active: boolean
  requires_auth: boolean
  estimated_time?: string
}

export function AdminFormCreatePage() {
  const navigate = useNavigate()
  const { showError, showSuccess } = useToast()
  const [step, setStep] = useState<'basic' | 'schema'>('basic')
  const [formData, setFormData] = useState<FormCreateData>({
    form_id: '',
    name: '',
    description: '',
    category: '',
    version: '1.0.0',
    schema_data: {
      formId: '',
      formName: '',
      version: '1.0.0',
      steps: [],
    },
    is_active: false,
    requires_auth: false,
    estimated_time: '',
  })
  const [schemaJson, setSchemaJson] = useState<string>('')
  const [schemaError, setSchemaError] = useState('')
  const [schemaMode, setSchemaMode] = useState<'visual' | 'json'>('visual')

  // Create form mutation
  const createMutation = useMutation({
    mutationFn: async (data: FormCreateData) => {
      return await apiClient.createForm(data)
    },
    onSuccess: (response) => {
      showSuccess('Form created successfully. You can now edit the schema.', 'Form Created')
      navigate(`/admin/forms/${response.formId}/schema`)
    },
    onError: (error: any) => {
      showError(
        error.response?.data?.detail || error.message || 'Failed to create form',
        'Creation Failed'
      )
    },
  })

  // Handle basic info change
  const handleBasicInfoChange = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value })
    // Update schema_data formId and formName when basic info changes
    if (field === 'form_id' || field === 'name') {
      setFormData((prev) => ({
        ...prev,
        schema_data: {
          ...prev.schema_data,
          formId: field === 'form_id' ? value : prev.form_id,
          formName: field === 'name' ? value : prev.name,
          version: prev.version,
        },
      }))
    }
  }

  // Handle visual builder schema change
  const handleVisualSchemaChange = (schema: FormSchemaResponse) => {
    setFormData((prev) => ({
      ...prev,
      schema_data: schema,
    }))
    setSchemaJson(JSON.stringify(schema, null, 2))
    setSchemaError('')
  }

  // Validate and parse schema JSON
  const handleSchemaChange = (value: string) => {
    setSchemaJson(value)
    try {
      const parsed = JSON.parse(value)
      setFormData((prev) => ({
        ...prev,
        schema_data: parsed,
      }))
      setSchemaError('')
    } catch (error) {
      setSchemaError('Invalid JSON format')
    }
  }

  // Generate default schema
  const generateDefaultSchema = () => {
    const defaultSchema = {
      formId: formData.form_id || 'new-form',
      formName: formData.name || 'New Form',
      version: formData.version,
      steps: [
        {
          stepId: 'step-1',
          stepName: 'Step 1',
          stepOrder: 1,
          fields: [
            {
              fieldId: 'field-1',
              fieldType: 'text-input',
              fieldName: 'example_field',
              label: 'Example Field',
              placeholder: 'Enter value',
              required: false,
            },
          ],
        },
      ],
    }
    setSchemaJson(JSON.stringify(defaultSchema, null, 2))
    setFormData((prev) => ({
      ...prev,
      schema_data: defaultSchema,
    }))
    setSchemaError('')
  }

  // Handle save (create form)
  const handleSave = () => {
    if (!formData.form_id || !formData.name) {
      showError('Please fill in Form ID and Name', 'Validation Error')
      return
    }

    if (!formData.schema_data || !formData.schema_data.steps || formData.schema_data.steps.length === 0) {
      showError('Please provide a valid form schema with at least one step', 'Validation Error')
      return
    }

    if (schemaError) {
      showError('Please fix schema JSON errors before saving', 'Validation Error')
      return
    }

    createMutation.mutate(formData)
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Form</h1>
        <p className="text-gray-600">Set up a new form for submission</p>
      </div>

      {/* Progress Steps */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setStep('basic')}
            className={cn(
              'flex-1 py-3 px-4 rounded-md text-sm font-medium transition-colors',
              step === 'basic'
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            )}
          >
            1. Basic Information
          </button>
          <div className="w-8 h-0.5 bg-gray-300" />
          <button
            onClick={() => setStep('schema')}
            className={cn(
              'flex-1 py-3 px-4 rounded-md text-sm font-medium transition-colors',
              step === 'schema'
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            )}
          >
            2. Form Schema
          </button>
        </div>
      </div>

      {/* Step 1: Basic Information */}
      {step === 'basic' && (
        <div className="bg-white shadow rounded-lg p-6 space-y-6">
          <h2 className="text-lg font-medium text-gray-900">Basic Information</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="form_id" className="block text-sm font-medium text-gray-700 mb-1">
                Form ID <span className="text-red-500">*</span>
              </label>
              <input
                id="form_id"
                type="text"
                value={formData.form_id}
                onChange={(e) => handleBasicInfoChange('form_id', e.target.value)}
                className="input w-full"
                placeholder="e.g., form-business-license"
                required
              />
              <p className="mt-1 text-xs text-gray-500">
                Unique identifier (lowercase, hyphens only)
              </p>
            </div>

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Form Name <span className="text-red-500">*</span>
              </label>
              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => handleBasicInfoChange('name', e.target.value)}
                className="input w-full"
                placeholder="e.g., Business License Application"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="description"
                value={formData.description || ''}
                onChange={(e) => handleBasicInfoChange('description', e.target.value)}
                className="input w-full"
                rows={3}
                placeholder="Brief description of the form..."
              />
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <input
                id="category"
                type="text"
                value={formData.category || ''}
                onChange={(e) => handleBasicInfoChange('category', e.target.value)}
                className="input w-full"
                placeholder="e.g., Licensing, Registration"
              />
            </div>

            <div>
              <label htmlFor="version" className="block text-sm font-medium text-gray-700 mb-1">
                Version
              </label>
              <input
                id="version"
                type="text"
                value={formData.version}
                onChange={(e) => handleBasicInfoChange('version', e.target.value)}
                className="input w-full"
                placeholder="1.0.0"
              />
            </div>

            <div>
              <label htmlFor="estimated_time" className="block text-sm font-medium text-gray-700 mb-1">
                Estimated Completion Time
              </label>
              <input
                id="estimated_time"
                type="text"
                value={formData.estimated_time || ''}
                onChange={(e) => handleBasicInfoChange('estimated_time', e.target.value)}
                className="input w-full"
                placeholder="e.g., 10-15 minutes"
              />
            </div>

            <div className="md:col-span-2 space-y-3">
              <div className="flex items-center">
                <input
                  id="requires_auth"
                  type="checkbox"
                  checked={formData.requires_auth}
                  onChange={(e) => handleBasicInfoChange('requires_auth', e.target.checked)}
                  className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                />
                <label htmlFor="requires_auth" className="ml-2 block text-sm text-gray-900">
                  Requires Authentication
                </label>
              </div>

              <div className="flex items-center">
                <input
                  id="is_active"
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => handleBasicInfoChange('is_active', e.target.checked)}
                  className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                />
                <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
                  Active (visible to users)
                </label>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button onClick={() => navigate('/admin/forms')} className="btn btn-secondary">
              Cancel
            </button>
            <button onClick={() => setStep('schema')} className="btn btn-primary">
              Next: Form Schema →
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Form Schema */}
      {step === 'schema' && (
        <div className="bg-white shadow rounded-lg p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">Form Schema</h2>
            <div className="flex items-center gap-2">
              <div className="border border-gray-200 rounded-md flex">
                <button
                  onClick={() => setSchemaMode('visual')}
                  className={cn(
                    'px-4 py-2 text-sm font-medium rounded-l-md',
                    schemaMode === 'visual'
                      ? 'bg-primary text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  )}
                >
                  Visual Builder
                </button>
                <button
                  onClick={() => setSchemaMode('json')}
                  className={cn(
                    'px-4 py-2 text-sm font-medium rounded-r-md',
                    schemaMode === 'json'
                      ? 'bg-primary text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  )}
                >
                  JSON Editor
                </button>
              </div>
              {schemaMode === 'json' && (
                <button onClick={generateDefaultSchema} className="btn btn-secondary btn-sm">
                  Generate Default
                </button>
              )}
            </div>
          </div>

          {schemaMode === 'visual' ? (
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <VisualFormBuilder
                initialSchema={
                  formData.schema_data?.steps?.length > 0
                    ? (formData.schema_data as FormSchemaResponse)
                    : {
                        formId: formData.form_id || 'new-form',
                        formName: formData.name || 'New Form',
                        version: formData.version,
                        steps: [
                          {
                            stepId: 'step-1',
                            stepName: 'Step 1',
                            stepOrder: 0,
                            fields: [],
                          },
                        ],
                      }
                }
                onChange={handleVisualSchemaChange}
              />
            </div>
          ) : (
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-700">
                  Schema JSON <span className="text-red-500">*</span>
                </label>
                {schemaError && <span className="text-sm text-red-600">{schemaError}</span>}
              </div>
              <textarea
                value={schemaJson || JSON.stringify(formData.schema_data, null, 2)}
                onChange={(e) => handleSchemaChange(e.target.value)}
                className={cn(
                  'w-full h-96 font-mono text-sm border rounded-md p-4',
                  schemaError ? 'border-red-300 bg-red-50' : 'border-gray-300'
                )}
                spellCheck={false}
                placeholder='{"formId": "form-id", "formName": "Form Name", "steps": [...]}'
              />
              <p className="mt-2 text-sm text-gray-500">
                Enter the complete form schema in JSON format. Use "Generate Default Schema" to get started.
              </p>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> After creating the form, you'll be redirected to the schema editor where you can
              further customize and test the form before making it active.
            </p>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button onClick={() => setStep('basic')} className="btn btn-secondary">
              ← Back
            </button>
            <button
              onClick={handleSave}
              disabled={createMutation.isPending || !!schemaError || !formData.schema_data?.steps?.length}
              className={cn(
                'btn btn-primary',
                (createMutation.isPending || !!schemaError || !formData.schema_data?.steps?.length) &&
                  'opacity-50 cursor-not-allowed'
              )}
            >
              {createMutation.isPending ? 'Creating...' : 'Create Form'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

