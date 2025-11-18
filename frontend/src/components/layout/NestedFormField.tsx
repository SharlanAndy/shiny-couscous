import { BaseFieldProps, FormStep } from '@/types'
import { cn } from '@/lib/utils'
import { FormRenderer } from '@/components/forms/FormRenderer'

export interface NestedFormFieldProps extends BaseFieldProps {
  fieldType: 'nested-form' | 'form-nested'
  steps?: FormStep[] // Form schema for nested form
  schema?: FormStep[] // Alias for steps
  value?: Record<string, any> // Form data organized by step
  defaultValue?: Record<string, any>
  onChange?: (stepId: string, fieldName: string, value: any) => void
}

export function NestedFormField({
  fieldId,
  fieldName,
  fieldType,
  label,
  value,
  defaultValue,
  onChange,
  onBlur,
  onFocus,
  required,
  disabled,
  readonly,
  hidden,
  helpText,
  tooltip,
  validation,
  error,
  style,
  steps = [],
  schema = [],
  className,
}: NestedFormFieldProps) {
  // Get field value
  const formValue = value ?? defaultValue ?? {}

  // Use steps or schema (schema is alias)
  const formSteps = steps.length > 0 ? steps : schema

  // Handle field change within nested form
  const handleFieldChange = (stepId: string, fieldName: string, fieldValue: any) => {
    if (onChange) {
      onChange(stepId, fieldName, fieldValue)
    }
  }

  // Merge styles
  const containerClassName = cn('mb-4', style?.containerClassName)

  if (hidden) {
    return null
  }

  return (
    <div className={containerClassName}>
      <label
        htmlFor={fieldId}
        className={cn('label', required && 'label-required', style?.labelClassName)}
      >
        {label}
        {tooltip && (
          <span className="ml-1 text-gray-400" title={tooltip}>
            ℹ️
          </span>
        )}
      </label>

      {/* Nested form content */}
      <div className="p-4 border border-gray-300 rounded-md bg-gray-50">
        <FormRenderer
          steps={formSteps}
          formData={formValue}
          errors={{}}
          onChange={handleFieldChange}
          onBlur={onBlur}
        />
      </div>

      {/* Hidden input for form submission */}
      <input
        type="hidden"
        name={fieldName}
        value={JSON.stringify(formValue)}
        required={required}
      />

      {error && (
        <p id={`${fieldId}-error`} className="error-message mt-1" role="alert">
          {error}
        </p>
      )}
      {helpText && !error && (
        <p id={`${fieldId}-help`} className="help-text">
          {helpText}
        </p>
      )}
    </div>
  )
}

