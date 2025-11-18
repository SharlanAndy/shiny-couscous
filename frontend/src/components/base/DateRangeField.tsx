import React, { useState } from 'react'
import { BaseFieldProps } from '@/types'
import { cn } from '@/lib/utils'

export interface DateRangeFieldProps extends BaseFieldProps {
  fieldType: 'date-range' | 'date-range-picker'
  value?: { start: string; end: string }
  defaultValue?: { start: string; end: string }
  min?: string
  max?: string
}

export function DateRangeField({
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
}: DateRangeFieldProps) {
  // Get field value
  const rangeValue = value ?? defaultValue ?? { start: '', end: '' }

  // Handle start date change
  const handleStartChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = { ...rangeValue, start: e.target.value }
    onChange(newValue)
  }

  // Handle end date change
  const handleEndChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = { ...rangeValue, end: e.target.value }
    onChange(newValue)
  }

  // Calculate min/max for end date (end >= start)
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

      {/* Date range inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div>
          <label htmlFor={`${fieldId}-start`} className="label text-xs sm:text-sm">
            Start Date
            {required && <span className="text-error"> *</span>}
          </label>
          <input
            id={`${fieldId}-start`}
            name={`${fieldName}[start]`}
            type="date"
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
              'input text-xs sm:text-sm',
              error && 'input-error',
              disabled && 'opacity-50 cursor-not-allowed',
              readonly && 'bg-gray-100 cursor-default',
              style?.className,
              className
            )}
          />
        </div>
        <div>
          <label htmlFor={`${fieldId}-end`} className="label text-xs sm:text-sm">
            End Date
            {required && <span className="text-error"> *</span>}
          </label>
          <input
            id={`${fieldId}-end`}
            name={`${fieldName}[end]`}
            type="date"
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
              'input text-xs sm:text-sm',
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

