import React, { useState, useEffect } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { FormSchemaResponse, SubmissionData, ValidationResponse } from '@/types'
import apiClient from '@/api/client'
import { FormRenderer } from './FormRenderer'
import { shouldDisplayField } from '@/lib/utils'
import { useToast } from '@/components/ui/ToastProvider'

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
  const { showError, showWarning } = useToast()
  const [formData, setFormData] = useState<SubmissionData>(initialData || {})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [currentStep, setCurrentStep] = useState(0)

  // Update formData when initialData changes (e.g., when draft loads)
  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      setFormData(initialData)
    }
  }, [initialData])

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

    // DEBUG: Log formData before submission
    console.log('Form submission - formData:', JSON.stringify(formData, null, 2))

    try {
      // Validate form
      const validationResult = await validateMutation.mutateAsync(formData)
      if (!validationResult.valid) {
        // Show error notification
        const errorCount = validationResult.errors?.length || 0
        showWarning(
          `Please fix ${errorCount} error${errorCount > 1 ? 's' : ''} before submitting. The form has been scrolled to the first error.`,
          'Validation Failed'
        )
        
        // Find first step with errors and navigate to it
        if (validationResult.errors && validationResult.errors.length > 0) {
          const firstError = validationResult.errors[0]
          if (firstError.stepId && schema) {
            const stepIndex = schema.steps.findIndex(step => step.stepId === firstError.stepId)
            if (stepIndex !== -1) {
              setCurrentStep(stepIndex)
              // Scroll to first error field after step change
              setTimeout(() => {
                const errorElement = document.querySelector(`[data-field-id="${firstError.fieldName}"]`) ||
                                    document.querySelector(`[id="${firstError.fieldName}"]`) ||
                                    document.querySelector(`input[name="${firstError.fieldName}"], select[name="${firstError.fieldName}"], textarea[name="${firstError.fieldName}"]`)
                if (errorElement) {
                  errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
                }
              }, 200)
            }
          }
        }
        return
      }

      // Submit form
      await onSubmit(formData)
    } catch (error) {
      console.error('Form submission error:', error)
      // Error is already handled by mutation onError
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

  // Validate current step's required fields
  const validateCurrentStep = (): boolean => {
    if (!schema) return false
    
    const currentStepData = schema.steps[currentStep]
    const stepId = currentStepData.stepId
    
    const stepFormData = formData[stepId] || {}
    const stepErrors: Record<string, string> = {}
    let isValid = true

    // Check all required fields in current step
    currentStepData.fields.forEach((field) => {
      // Skip hidden or conditionally hidden fields
      if (field.hidden || (field.conditionalDisplay && !shouldDisplayField(field.conditionalDisplay, formData))) {
        return
      }

      if (field.required) {
        let fieldValue = stepFormData[field.fieldName]
        const errorKey = `${stepId}.${field.fieldName}`
        let isEmpty = false
        
        // For select fields, check DOM value if formData value is missing (handles default selected values)
        if ((field.fieldType === 'select' || field.fieldType === 'select-single' || 
             field.fieldType === 'select-multi' || field.fieldType === 'select-other') &&
            (fieldValue === undefined || fieldValue === null || fieldValue === '')) {
          const selectElement = document.querySelector(`select[name="${field.fieldName}"]`) as HTMLSelectElement
          if (selectElement && selectElement.value && selectElement.value !== '') {
            fieldValue = selectElement.value // Use DOM value as fallback
          }
        }
        
        // Special handling for supportingDocuments: skip initial empty check if checklist is complete
        let shouldSkipValidation = false
        if (field.fieldName === 'supportingDocuments' && (field.fieldType === 'file-upload' || field.fieldType === 'upload')) {
          const checklistField = currentStepData.fields.find((f: any) => 
            (f.fieldType === 'document-checklist' || f.fieldType === 'labuan-document-checklist')
          )
          if (checklistField) {
            const checklistValue = stepFormData[checklistField.fieldName]
            if (checklistValue && typeof checklistValue === 'object') {
              const documents = checklistField.documents || []
              const requiredDocuments = documents.filter((doc: any) => doc.required === true)
              if (requiredDocuments.length > 0) {
                shouldSkipValidation = requiredDocuments.every((doc: any) => {
                  const docStatus = checklistValue[doc.id]
                  return docStatus && docStatus.uploaded === true
                })
              }
            }
          }
        }

        // Check if field is empty based on field type (skip if supportingDocuments and checklist is complete)
        if (!shouldSkipValidation) {
          if (fieldValue === undefined || fieldValue === null || fieldValue === '') {
            isEmpty = true
          } else if (Array.isArray(fieldValue) && fieldValue.length === 0) {
            isEmpty = true
          } else if (typeof fieldValue === 'object' && Object.keys(fieldValue).length === 0) {
            isEmpty = true
          }
        }
        
        if (field.fieldType === 'checkbox' || field.fieldType === 'checkbox-group') {
          // For checkboxes, false or empty array means not checked
          if (fieldValue === false || (Array.isArray(fieldValue) && fieldValue.length === 0)) {
            isEmpty = true
          }
        } else if (field.fieldType === 'radio' || field.fieldType === 'radio-group') {
          // For radios, empty string or undefined means not selected
          if (fieldValue === '' || fieldValue === undefined || fieldValue === null) {
            isEmpty = true
          }
        } else if (field.fieldType === 'select' || field.fieldType === 'select-single' || 
                   field.fieldType === 'select-multi' || field.fieldType === 'select-other') {
          // For select fields, empty string or undefined means not selected
          if (fieldValue === '' || fieldValue === undefined || fieldValue === null) {
            isEmpty = true
          } else if (Array.isArray(fieldValue) && fieldValue.length === 0) {
            isEmpty = true
          }
        } else if (field.fieldType === 'file-upload' || field.fieldType === 'upload') {
          // For file uploads, empty array or no files means not uploaded
          // Special case: If there's a complete document-checklist in the same step, 
          // the supportingDocuments file-upload field is optional
          
          // Check if this is the supportingDocuments field and if checklist is complete
          if (field.fieldName === 'supportingDocuments') {
            // Check if there's a document-checklist field in this step that is complete
            let hasCompleteChecklist = false
            
            const checklistField = currentStepData.fields.find((f: any) => 
              (f.fieldType === 'document-checklist' || f.fieldType === 'labuan-document-checklist')
            )
            
            if (checklistField) {
              const checklistValue = stepFormData[checklistField.fieldName]
              if (checklistValue && typeof checklistValue === 'object') {
                const documents = checklistField.documents || []
                const requiredDocuments = documents.filter((doc: any) => doc.required === true)
                
                if (requiredDocuments.length > 0) {
                  // Check if all required documents are uploaded
                  hasCompleteChecklist = requiredDocuments.every((doc: any) => {
                    const docStatus = checklistValue[doc.id]
                    return docStatus && docStatus.uploaded === true
                  })
                }
              }
            }
            
            // If checklist is complete, skip validation for supportingDocuments (make it optional)
            if (hasCompleteChecklist) {
              isEmpty = false // Don't require supportingDocuments if checklist is complete
            } else if (!shouldSkipValidation) {
              // Checklist not complete, so supportingDocuments is still required
              if (!fieldValue || (Array.isArray(fieldValue) && fieldValue.length === 0)) {
                isEmpty = true
              }
            }
          } else if (!shouldSkipValidation) {
            // For other file-upload fields, check if empty
            if (!fieldValue || (Array.isArray(fieldValue) && fieldValue.length === 0)) {
              isEmpty = true
            }
          }
        } else if (field.fieldType === 'document-checklist' || field.fieldType === 'labuan-document-checklist') {
          // For document checklist, check if all required documents are uploaded
          // Value is Record<string, { uploaded: boolean; fileId?: string }>
          // Field has documents array with required flag
          if (!fieldValue || typeof fieldValue !== 'object') {
            isEmpty = true
          } else {
            // Check if field has documents configuration
            const documents = field.documents || []
            const requiredDocuments = documents.filter((doc: any) => doc.required === true)
            
            if (requiredDocuments.length > 0) {
              // Check if all required documents are uploaded
              const allRequiredUploaded = requiredDocuments.every((doc: any) => {
                const docStatus = fieldValue[doc.id]
                return docStatus && docStatus.uploaded === true
              })
              
              if (!allRequiredUploaded) {
                isEmpty = true
              }
            } else if (field.required) {
              // If field is required but no documents config, check if any document is uploaded
              const hasAnyUpload = Object.values(fieldValue).some((doc: any) => doc && doc.uploaded === true)
              if (!hasAnyUpload) {
                isEmpty = true
              }
            }
          }
        } else if (field.fieldType === 'signature') {
          // For signature, empty string or no data means not signed
          if (!fieldValue || fieldValue === '' || (typeof fieldValue === 'object' && !fieldValue.dataUrl)) {
            isEmpty = true
          }
        }
        
        if (isEmpty) {
          stepErrors[errorKey] = `${field.label} is required`
          isValid = false
        }
      }
    })

    // Update errors
    if (Object.keys(stepErrors).length > 0) {
      setErrors((prev) => ({ ...prev, ...stepErrors }))
      // Scroll to first error
      const firstErrorKey = Object.keys(stepErrors)[0]
      const [stepIdForError, fieldNameForError] = firstErrorKey.split('.')
      const errorElement = document.querySelector(`[data-field-id="${fieldNameForError}"]`) ||
                          document.querySelector(`[id="${fieldNameForError}"]`) ||
                          document.querySelector(`input[name="${fieldNameForError}"], select[name="${fieldNameForError}"], textarea[name="${fieldNameForError}"]`)
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }

    return isValid
  }


  // Handle next step
  const handleNext = async () => {
    if (!schema || currentStep >= schema.steps.length - 1) return

    // Validate current step's required fields before allowing navigation
    const isValid = validateCurrentStep()
    if (!isValid) {
      // Validation failed - errors are already set, don't navigate
      return
    }

    // Validation passed - proceed to next step
    setCurrentStep(currentStep + 1)
    
    // Scroll to top of form on step change
    window.scrollTo({ top: 0, behavior: 'smooth' })
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
    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
      {/* Step indicator (for multi-step forms) */}
      {isMultiStep && (
        <div className="mb-4 sm:mb-6">
          {/* Desktop Step Indicator */}
          <div className="hidden sm:flex items-center justify-between overflow-x-auto pb-2">
            {steps.map((step, index) => (
              <div key={step.stepId} className="flex items-center flex-shrink-0">
                <div
                  className={`flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full text-xs sm:text-sm font-medium ${
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
                    className={`hidden md:block w-12 lg:w-16 h-1 mx-2 ${
                      index < currentStep ? 'bg-success' : 'bg-gray-200'
                    }`}
                  />
                )}
                {index < steps.length - 1 && (
                  <div
                    className={`md:hidden w-8 h-1 mx-1 ${
                      index < currentStep ? 'bg-success' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          {/* Mobile Step Indicator (Simplified) */}
          <div className="sm:hidden flex items-center justify-center gap-2 mb-2">
            {steps.map((step, index) => (
              <div
                key={step.stepId}
                className={`w-2 h-2 rounded-full ${
                  index === currentStep
                    ? 'bg-primary'
                    : index < currentStep
                    ? 'bg-success'
                    : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
          <div className="mt-2 text-center">
            <p className="text-xs sm:text-sm text-gray-600">
              Step {currentStep + 1} of {steps.length}: <span className="font-medium">{currentStepData.stepName}</span>
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
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 pt-4 sm:pt-6 border-t">
        <div className="w-full sm:w-auto">
          {isMultiStep && currentStep > 0 && (
            <button
              type="button"
              onClick={handlePrevious}
              className="btn btn-secondary w-full sm:w-auto text-sm sm:text-base px-4 sm:px-6 py-2 sm:py-2.5"
            >
              ← Previous
            </button>
          )}
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 w-full sm:w-auto">
          {onSaveDraft && (
            <button
              type="button"
              onClick={handleSaveDraft}
              className="btn btn-secondary w-full sm:w-auto text-sm sm:text-base px-4 sm:px-6 py-2 sm:py-2.5 order-2 sm:order-1"
            >
              Save Draft
            </button>
          )}
          {isMultiStep && currentStep < steps.length - 1 ? (
            <button
              type="button"
              onClick={handleNext}
              className="btn btn-primary w-full sm:w-auto text-sm sm:text-base px-4 sm:px-6 py-2 sm:py-2.5 order-1 sm:order-2"
            >
              Next →
            </button>
          ) : (
            <button
              type="submit"
              disabled={validateMutation.isPending}
              className="btn btn-primary w-full sm:w-auto text-sm sm:text-base px-4 sm:px-6 py-2 sm:py-2.5 order-1 sm:order-2"
            >
              {validateMutation.isPending ? 'Submitting...' : schema.submitButton?.label || 'Submit'}
            </button>
          )}
        </div>
      </div>
    </form>
  )
}

