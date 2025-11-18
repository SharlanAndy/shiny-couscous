import { BaseFieldProps } from '@/types'
import { cn } from '@/lib/utils'

export interface YearPickerFieldProps extends BaseFieldProps {
  fieldType: 'year' | 'year-picker'
  value?: number
  defaultValue?: number
  minYear?: number
  maxYear?: number
  format?: 'full' | 'short' // full = 2024, short = 24
}

export function YearPickerField({
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
  minYear = 1900,
  maxYear = new Date().getFullYear() + 50,
  format = 'full',
  className,
}: YearPickerFieldProps) {
  // Get field value
  const yearValue = value ?? defaultValue ?? new Date().getFullYear()

  // Generate year options
  const years = Array.from({ length: maxYear - minYear + 1 }, (_, i) => minYear + i)

  // Format year for display
  const formatYear = (year: number): string => {
    return format === 'short' ? String(year).slice(-2) : String(year)
  }

  // Handle change
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedYear = parseInt(e.target.value)
    onChange(selectedYear)
  }

  // Merge styles
  const containerClassName = cn('mb-4', style?.containerClassName)
  const selectClassName = cn(
    'input',
    error && 'input-error',
    disabled && 'opacity-50 cursor-not-allowed',
    readonly && 'bg-gray-100 cursor-default',
    style?.className,
    className
  )

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
      <select
        id={fieldId}
        name={fieldName}
        value={yearValue || ''}
        onChange={handleChange}
        onBlur={onBlur}
        onFocus={onFocus}
        required={required}
        disabled={disabled}
        readOnly={readonly}
        className={selectClassName}
        style={style?.style}
        aria-invalid={!!error}
        aria-describedby={error ? `${fieldId}-error` : helpText ? `${fieldId}-help` : undefined}
      >
        {placeholder && (
          <option value="">{placeholder}</option>
        )}
        {years.map((year) => (
          <option key={year} value={year}>
            {formatYear(year)}
          </option>
        ))}
      </select>
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

