import { BaseFieldProps } from '@/types'
import { cn } from '@/lib/utils'

export interface ReadonlyFieldProps extends BaseFieldProps {
  fieldType: 'readonly' | 'readonly-field'
  value?: any
  defaultValue?: any
  format?: 'text' | 'number' | 'currency' | 'date' | 'datetime'
  displayComponent?: React.ReactNode
}

export function ReadonlyField({
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
  readonly = true,
  hidden,
  helpText,
  tooltip,
  validation,
  error,
  style,
  format = 'text',
  displayComponent,
  className,
}: ReadonlyFieldProps) {
  // Get field value
  const fieldValue = value ?? defaultValue ?? ''

  // Format value based on format type
  const formatValue = (val: any): string => {
    if (!val) return ''

    switch (format) {
      case 'number':
        return typeof val === 'number' ? val.toLocaleString() : String(val)
      case 'currency':
        return typeof val === 'number' ? `$${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : String(val)
      case 'date':
        return val instanceof Date ? val.toLocaleDateString() : String(val)
      case 'datetime':
        return val instanceof Date ? val.toLocaleString() : String(val)
      default:
        return String(val)
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
      {displayComponent ? (
        <div className="p-3 bg-gray-50 border border-gray-300 rounded-md">
          {displayComponent}
        </div>
      ) : (
        <div
          id={fieldId}
          className={cn(
            'p-3 bg-gray-50 border border-gray-300 rounded-md text-gray-900',
            disabled && 'opacity-50',
            style?.className,
            className
          )}
          style={style?.style}
        >
          {formatValue(fieldValue)}
        </div>
      )}

      {/* Hidden input for form submission */}
      <input
        type="hidden"
        name={fieldName}
        value={typeof fieldValue === 'string' ? fieldValue : JSON.stringify(fieldValue)}
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

