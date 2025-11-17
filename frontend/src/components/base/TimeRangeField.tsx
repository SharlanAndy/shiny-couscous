import React from 'react'
import { BaseFieldProps } from '@/types'
import { cn } from '@/lib/utils'

export interface TimeRangeFieldProps extends BaseFieldProps {
  fieldType: 'time-range' | 'time-range-picker'
  value?: { start: string; end: string }
  defaultValue?: { start: string; end: string }
  min?: string
  max?: string
}

export function TimeRangeField({
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
}: TimeRangeFieldProps) {
  // Get field value
  const rangeValue = value ?? defaultValue ?? { start: '', end: '' }

  // Handle start time change
  const handleStartChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = { ...rangeValue, start: e.target.value }
    onChange(newValue)
  }

  // Handle end time change
  const handleEndChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = { ...rangeValue, end: e.target.value }
    onChange(newValue)
  }

  // Calculate min/max for end time (end >= start)
  const endMin = rangeValue.start || min
  const endMax = max

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

      {/* Time range inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor={`${fieldId}-start`} className="label text-sm">
            Start Time
            {required && <span className="text-error"> *</span>}
          </label>
          <input
            id={`${fieldId}-start`}
            name={`${fieldName}[start]`}
            type="time"
            value={rangeValue.start}
            onChange={handleStartChange}
            onBlur={onBlur}
            onFocus={onFocus}
            required={required}
            disabled={disabled}
            readOnly={readonly}
            min={min}
            max={max || rangeValue.end}
            className={cn(
              'input',
              error && 'input-error',
              disabled && 'opacity-50 cursor-not-allowed',
              readonly && 'bg-gray-100 cursor-default',
              style?.className,
              className
            )}
          />
        </div>
        <div>
          <label htmlFor={`${fieldId}-end`} className="label text-sm">
            End Time
            {required && <span className="text-error"> *</span>}
          </label>
          <input
            id={`${fieldId}-end`}
            name={`${fieldName}[end]`}
            type="time"
            value={rangeValue.end}
            onChange={handleEndChange}
            onBlur={onBlur}
            onFocus={onFocus}
            required={required}
            disabled={disabled}
            readOnly={readonly}
            min={endMin}
            max={endMax}
            className={cn(
              'input',
              error && 'input-error',
              disabled && 'opacity-50 cursor-not-allowed',
              readonly && 'bg-gray-100 cursor-default',
              style?.className,
              className
            )}
          />
        </div>
      </div>

      {/* Hidden input for form submission */}
      <input
        type="hidden"
        id={fieldId}
        name={fieldName}
        value={JSON.stringify(rangeValue)}
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

