import React, { useState, useEffect } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { FormSchemaResponse, SubmissionData, ValidationResponse } from '@/types'
import apiClient from '@/api/client'
import { FormRenderer } from './FormRenderer'

interface DynamicFormProps {
  formId: string
  onSubmit: (data: SubmissionData) => Promise<void>
  onSaveDraft?: (data: SubmissionData) => Promise<void>
  initialData?: SubmissionData
}

/**
 * DynamicForm - Main form component that fetches schema and renders form dynamically
 */
export function DynamicForm({
  formId,
  onSubmit,
  onSaveDraft,
  initialData,
}: DynamicFormProps) {
  const [formData, setFormData] = useState<SubmissionData>(initialData || {})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [currentStep, setCurrentStep] = useState(0)

  // Fetch form schema
  const { data: schema, isLoading, error } = useQuery<FormSchemaResponse>({
    queryKey: ['form-schema', formId],
    queryFn: () => apiClient.getFormSchema(formId),
    enabled: !!formId,
  })

  // Validation mutation
  const validateMutation = useMutation<ValidationResponse, Error, SubmissionData>({
    mutationFn: (data) => apiClient.validateSubmission(formId, data),
    onSuccess: (response) => {
      if (!response.valid) {
        const errorMap: Record<string, string> = {}
        response.errors.forEach((err) => {
          const key = err.stepId ? `${err.stepId}.${err.fieldName}` : err.fieldName
          errorMap[key] = err.error
        })
        setErrors(errorMap)
      } else {
        setErrors({})
      }
    },
  })

  // Handle field change
  const handleFieldChange = (stepId: string, fieldName: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [stepId]: {
        ...prev[stepId],
        [fieldName]: value,
      },
    }))
    // Clear error for this field
    const errorKey = `${stepId}.${fieldName}`
    if (errors[errorKey]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[errorKey]
        return newErrors
      })
    }
  }

  // Handle field blur (validate on blur)
  const handleFieldBlur = (stepId: string, fieldName: string) => {
    // Optionally validate individual field
    // For now, just validate on submit
  }

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate form
    const validationResult = await validateMutation.mutateAsync(formData)
    if (!validationResult.valid) {
      return
    }

    // Submit form
    try {
      await onSubmit(formData)
    } catch (error) {
      console.error('Form submission error:', error)
    }
  }

  // Handle save draft
  const handleSaveDraft = async () => {
    if (onSaveDraft) {
      try {
        await onSaveDraft(formData)
      } catch (error) {
        console.error('Save draft error:', error)
      }
    }
  }

  // Handle next step
  const handleNext = () => {
    if (schema && currentStep < schema.steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  // Handle previous step
  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="mt-4 text-sm text-gray-500">Loading form...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <p className="text-sm text-red-800">Error loading form: {error.message}</p>
      </div>
    )
  }

  if (!schema) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
        <p className="text-sm text-yellow-800">Form schema not found</p>
      </div>
    )
  }

  const steps = schema.steps
  const isMultiStep = steps.length > 1
  const currentStepData = steps[currentStep]

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Step indicator (for multi-step forms) */}
      {isMultiStep && (
        <div className="mb-6">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.stepId} className="flex items-center">
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full ${
                    index === currentStep
                      ? 'bg-primary text-white'
                      : index < currentStep
                      ? 'bg-success text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {index + 1}
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`w-16 h-1 mx-2 ${
                      index < currentStep ? 'bg-success' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="mt-2 text-center">
            <p className="text-sm text-gray-600">
              Step {currentStep + 1} of {steps.length}: {currentStepData.stepName}
            </p>
          </div>
        </div>
      )}

      {/* Form fields */}
      <FormRenderer
        steps={isMultiStep ? [currentStepData] : steps}
        formData={formData}
        errors={errors}
        onChange={handleFieldChange}
        onBlur={handleFieldBlur}
      />

      {/* Form actions */}
      <div className="flex items-center justify-between pt-6 border-t">
        <div>
          {isMultiStep && currentStep > 0 && (
            <button
              type="button"
              onClick={handlePrevious}
              className="btn btn-secondary"
            >
              Previous
            </button>
          )}
        </div>
        <div className="flex items-center space-x-4">
          {onSaveDraft && (
            <button
              type="button"
              onClick={handleSaveDraft}
              className="btn btn-secondary"
            >
              Save Draft
            </button>
          )}
          {isMultiStep && currentStep < steps.length - 1 ? (
            <button
              type="button"
              onClick={handleNext}
              className="btn btn-primary"
            >
              Next
            </button>
          ) : (
            <button
              type="submit"
              disabled={validateMutation.isPending}
              className="btn btn-primary"
            >
              {validateMutation.isPending ? 'Submitting...' : schema.submitButton?.label || 'Submit'}
            </button>
          )}
        </div>
      </div>
    </form>
  )
}

