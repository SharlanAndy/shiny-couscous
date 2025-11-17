import React from 'react'
import { BaseFieldProps } from '@/types'
import { cn } from '@/lib/utils'

export interface QuarterPickerFieldProps extends BaseFieldProps {
  fieldType: 'quarter' | 'quarter-picker'
  value?: { year: number; quarter: 1 | 2 | 3 | 4 }
  defaultValue?: { year: number; quarter: 1 | 2 | 3 | 4 }
  minYear?: number
  maxYear?: number
}

export function QuarterPickerField({
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
  minYear = 2000,
  maxYear = new Date().getFullYear() + 10,
  className,
}: QuarterPickerFieldProps) {
  // Get field value
  const quarterValue = value ?? defaultValue ?? {
    year: new Date().getFullYear(),
    quarter: Math.floor(new Date().getMonth() / 3) + 1 as 1 | 2 | 3 | 4,
  }

  // Generate year options
  const years = Array.from({ length: maxYear - minYear + 1 }, (_, i) => minYear + i)
  
  // Quarter options
  const quarters = [
    { value: 1, label: 'Q1 (Jan - Mar)' },
    { value: 2, label: 'Q2 (Apr - Jun)' },
    { value: 3, label: 'Q3 (Jul - Sep)' },
    { value: 4, label: 'Q4 (Oct - Dec)' },
  ] as const

  // Handle year change
  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newYear = parseInt(e.target.value)
    onChange({ ...quarterValue, year: newYear })
  }

  // Handle quarter change
  const handleQuarterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newQuarter = parseInt(e.target.value) as 1 | 2 | 3 | 4
    onChange({ ...quarterValue, quarter: newQuarter })
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

      {/* Year and Quarter selectors */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor={`${fieldId}-year`} className="label text-sm">
            Year
            {required && <span className="text-error"> *</span>}
          </label>
          <select
            id={`${fieldId}-year`}
            name={`${fieldName}[year]`}
            value={quarterValue.year || ''}
            onChange={handleYearChange}
            onBlur={onBlur}
            onFocus={onFocus}
            required={required}
            disabled={disabled}
            readOnly={readonly}
            className={cn(
              'input',
              error && 'input-error',
              disabled && 'opacity-50 cursor-not-allowed',
              readonly && 'bg-gray-100 cursor-default',
              style?.className,
              className
            )}
          >
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor={`${fieldId}-quarter`} className="label text-sm">
            Quarter
            {required && <span className="text-error"> *</span>}
          </label>
          <select
            id={`${fieldId}-quarter`}
            name={`${fieldName}[quarter]`}
            value={quarterValue.quarter || ''}
            onChange={handleQuarterChange}
            onBlur={onBlur}
            onFocus={onFocus}
            required={required}
            disabled={disabled}
            readOnly={readonly}
            className={cn(
              'input',
              error && 'input-error',
              disabled && 'opacity-50 cursor-not-allowed',
              readonly && 'bg-gray-100 cursor-default',
              style?.className,
              className
            )}
          >
            {quarters.map((q) => (
              <option key={q.value} value={q.value}>
                {q.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Display selected quarter */}
      {quarterValue.year && quarterValue.quarter && (
        <div className="mt-2 text-sm text-gray-600">
          Selected: {quarters.find((q) => q.value === quarterValue.quarter)?.label} {quarterValue.year}
        </div>
      )}

      {/* Hidden input for form submission */}
      <input
        type="hidden"
        id={fieldId}
        name={fieldName}
        value={JSON.stringify(quarterValue)}
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

