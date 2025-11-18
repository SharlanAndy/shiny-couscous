import React from 'react'
import { BaseFieldProps, FormField } from '@/types'
import { cn } from '@/lib/utils'
import { FormRenderer } from '@/components/forms/FormRenderer'

export interface ObjectFieldProps extends BaseFieldProps {
  fieldType: 'object' | 'object-field' | 'field-group'
  fields?: FormField[] // Nested fields
  schema?: FormField[] // Alias for fields
  value?: Record<string, any> // Object data
  defaultValue?: Record<string, any>
  collapsible?: boolean // Allow collapsing/expanding
  defaultCollapsed?: boolean
}

export function ObjectField({
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
  fields = [],
  schema = [],
  collapsible = false,
  defaultCollapsed = false,
  className,
}: ObjectFieldProps) {
  const [isCollapsed, setIsCollapsed] = React.useState(defaultCollapsed)

  // Get field value
  const objectValue = value ?? defaultValue ?? {}

  // Use fields or schema (schema is alias)
  const objectFields = fields.length > 0 ? fields : schema

  // Handle field change within object
  const handleFieldChange = (fieldName: string, fieldValue: any) => {
    if (onChange) {
      const newValue = { ...objectValue, [fieldName]: fieldValue }
      onChange(newValue)
    }
  }

  // Merge styles
  const containerClassName = cn('mb-4', style?.containerClassName)

  if (hidden) {
    return null
  }

  return (
    <div className={containerClassName}>
      {/* Object header */}
      <div className="flex items-center justify-between mb-2 sm:mb-3">
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
        {collapsible && (
          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-xs sm:text-sm text-gray-500 hover:text-gray-700 flex-shrink-0 ml-2"
            aria-label={isCollapsed ? 'Expand' : 'Collapse'}
          >
            {isCollapsed ? '▼' : '▲'}
          </button>
        )}
      </div>

      {/* Object content */}
      {!isCollapsed && objectFields.length > 0 && (
        <div className="p-3 sm:p-4 lg:p-6 border border-gray-300 rounded-md bg-gray-50 space-y-3 sm:space-y-4">
          <FormRenderer
            steps={[
              {
                stepId: `object-${fieldId}`,
                stepName: label,
                stepOrder: 0,
                fields: objectFields,
              },
            ]}
            formData={{
              [`object-${fieldId}`]: objectValue,
            }}
            errors={{}}
            onChange={(stepId, fieldName, fieldValue) =>
              handleFieldChange(fieldName, fieldValue)
            }
            onBlur={onBlur}
            readonly={readonly || disabled} // Pass readonly prop to nested FormRenderer
          />
        </div>
      )}

      {/* Hidden input for form submission */}
      <input
        type="hidden"
        id={fieldId}
        name={fieldName}
        value={JSON.stringify(objectValue)}
        required={required}
        aria-invalid={!!error}
        aria-describedby={error ? `${fieldId}-error` : helpText ? `${fieldId}-help` : undefined}
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

