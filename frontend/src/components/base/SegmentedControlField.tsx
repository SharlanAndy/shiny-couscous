import React from 'react'
import { BaseFieldProps, SelectOption } from '@/types'
import { cn } from '@/lib/utils'

export interface SegmentedControlFieldProps extends BaseFieldProps {
  fieldType: 'segmented-control' | 'button-group'
  options: SelectOption[]
  value?: string
  defaultValue?: string
}

export function SegmentedControlField({
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
  options = [],
  className,
}: SegmentedControlFieldProps) {
  // Get field value
  const fieldValue = value ?? defaultValue ?? (options[0]?.value || '')

  // Handle option change
  const handleOptionChange = (optionValue: string) => {
    if (!disabled && !readonly) {
      onChange(optionValue)
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

      {/* Segmented control */}
      <div
        className={cn(
          'inline-flex rounded-lg border border-gray-300 bg-white p-1',
          disabled && 'opacity-50 cursor-not-allowed',
          readonly && 'bg-gray-50 cursor-default',
          style?.className,
          className
        )}
        role="group"
        aria-labelledby={fieldId}
        style={style?.style}
      >
        {options.map((option, index) => {
          const isSelected = fieldValue === option.value

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => handleOptionChange(option.value)}
              onBlur={onBlur}
              onFocus={onFocus}
              disabled={disabled || option.disabled || readonly}
              className={cn(
                'px-4 py-2 text-sm font-medium rounded-md transition-colors',
                'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1',
                isSelected
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50',
                disabled && 'opacity-50 cursor-not-allowed',
                readonly && 'cursor-default'
              )}
              aria-pressed={isSelected}
              aria-label={option.label}
            >
              {option.label}
            </button>
          )
        })}
      </div>

      {/* Hidden input for form submission */}
      <input
        type="hidden"
        id={fieldId}
        name={fieldName}
        value={fieldValue}
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

