import { BaseFieldProps } from '@/types'
import { cn } from '@/lib/utils'

export interface DatePickerFieldProps extends BaseFieldProps {
  fieldType: 'date' | 'time' | 'datetime-local' | 'month' | 'week' | 'year'
  min?: string
  max?: string
}

export function DatePickerField({
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
  placeholder,
  helpText,
  tooltip,
  validation,
  error,
  style,
  min,
  max,
  className,
}: DatePickerFieldProps) {
  // Get field value
  const fieldValue = value ?? defaultValue ?? ''

  // Determine HTML input type
  const inputType = fieldType === 'datetime-local' ? 'datetime-local' : fieldType

  // Format value for HTML input
  const formatValue = (val: any): string => {
    if (!val) return ''
    
    if (fieldType === 'date' || fieldType === 'datetime-local') {
      // Format as YYYY-MM-DD or YYYY-MM-DDTHH:mm
      if (val instanceof Date) {
        if (fieldType === 'datetime-local') {
          return val.toISOString().slice(0, 16) // Remove seconds and timezone
        }
        return val.toISOString().slice(0, 10)
      }
      if (typeof val === 'string') {
        // Try to parse and format
        const date = new Date(val)
        if (!isNaN(date.getTime())) {
          if (fieldType === 'datetime-local') {
            return date.toISOString().slice(0, 16)
          }
          return date.toISOString().slice(0, 10)
        }
      }
      return val
    }

    if (fieldType === 'time') {
      // Format as HH:mm
      if (val instanceof Date) {
        return val.toTimeString().slice(0, 5)
      }
      if (typeof val === 'string') {
        const date = new Date(`2000-01-01T${val}`)
        if (!isNaN(date.getTime())) {
          return date.toTimeString().slice(0, 5)
        }
      }
      return val
    }

    if (fieldType === 'month') {
      // Format as YYYY-MM
      if (val instanceof Date) {
        return `${val.getFullYear()}-${String(val.getMonth() + 1).padStart(2, '0')}`
      }
      if (typeof val === 'string') {
        const date = new Date(val)
        if (!isNaN(date.getTime())) {
          return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
        }
      }
      return val
    }

    if (fieldType === 'week') {
      // Format as YYYY-Www (e.g., 2025-W03)
      if (val instanceof Date) {
        const year = val.getFullYear()
        const week = getWeekNumber(val)
        return `${year}-W${String(week).padStart(2, '0')}`
      }
      return val
    }

    if (fieldType === 'year') {
      // Format as YYYY
      if (val instanceof Date) {
        return String(val.getFullYear())
      }
      if (typeof val === 'string') {
        const date = new Date(val)
        if (!isNaN(date.getTime())) {
          return String(date.getFullYear())
        }
      }
      return val
    }

    return val
  }

  const formattedValue = formatValue(fieldValue)

  // Handle change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    onChange(newValue)
  }

  // Merge styles
  const inputClassName = cn(
    'input',
    error && 'input-error',
    disabled && 'opacity-50 cursor-not-allowed',
    readonly && 'bg-gray-100 cursor-default',
    style?.className,
    className
  )

  // Get min/max from validation or props
  const minValue = min || validation?.min?.toString()
  const maxValue = max || validation?.max?.toString()

  if (hidden) {
    return null
  }

  // Helper function to get week number
  function getWeekNumber(date: Date): number {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
    const dayNum = d.getUTCDay() || 7
    d.setUTCDate(d.getUTCDate() + 4 - dayNum)
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
    return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
  }

  return (
    <div className={cn('mb-4', style?.containerClassName)}>
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
      <input
        id={fieldId}
        name={fieldName}
        type={inputType}
        value={formattedValue}
        onChange={handleChange}
        onBlur={onBlur}
        onFocus={onFocus}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        readOnly={readonly}
        min={minValue}
        max={maxValue}
        className={inputClassName}
        style={style?.style}
        aria-invalid={!!error}
        aria-describedby={error ? `${fieldId}-error` : helpText ? `${fieldId}-help` : undefined}
      />
      {error && (
        <p id={`${fieldId}-error`} className="error-message" role="alert">
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

