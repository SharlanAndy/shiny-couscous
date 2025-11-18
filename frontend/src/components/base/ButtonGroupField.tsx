import React from 'react'
import { BaseFieldProps, SelectOption } from '@/types'
import { cn } from '@/lib/utils'

export interface ButtonGroupFieldProps extends BaseFieldProps {
  fieldType: 'button-group' | 'button-group-field'
  options: SelectOption[]
  value?: string
  defaultValue?: string
  multiple?: boolean
  orientation?: 'horizontal' | 'vertical'
}

export function ButtonGroupField({
  fieldId,
  fieldName,
  fieldType,
  label,
  options,
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
  multiple = false,
  orientation = 'horizontal',
  className,
}: ButtonGroupFieldProps) {
  // Get field value
  const fieldValue = value ?? defaultValue ?? (multiple ? [] : '')

  // Handle change
  const handleClick = (optionValue: string) => {
    if (readonly || disabled) return

    if (multiple) {
      const currentValues = Array.isArray(fieldValue) ? fieldValue : []
      const newValues = currentValues.includes(optionValue)
        ? currentValues.filter((v) => v !== optionValue)
        : [...currentValues, optionValue]
      onChange(newValues)
    } else {
      onChange(optionValue)
    }
  }

  // Check if option is selected
  const isSelected = (optionValue: string): boolean => {
    if (multiple) {
      return Array.isArray(fieldValue) && fieldValue.includes(optionValue)
    }
    return fieldValue === optionValue
  }

  // Merge styles
  const containerClassName = cn('mb-4', style?.containerClassName)
  const buttonGroupClassName = cn(
    'flex gap-1.5 sm:gap-2',
    orientation === 'horizontal' ? 'flex-row flex-wrap' : 'flex-col',
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
        className={cn('label text-xs sm:text-sm', required && 'label-required', style?.labelClassName)}
      >
        {label}
        {tooltip && (
          <span className="ml-1 text-gray-400" title={tooltip}>
            ℹ️
          </span>
        )}
      </label>
      <div className={buttonGroupClassName} role="group" aria-label={label}>
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => handleClick(option.value)}
            onBlur={onBlur}
            onFocus={onFocus}
            disabled={disabled || option.disabled}
            className={cn(
              'px-3 sm:px-4 py-1.5 sm:py-2 rounded-md font-medium text-xs sm:text-sm transition-colors whitespace-nowrap',
              isSelected(option.value)
                ? 'bg-primary text-white hover:bg-primary-dark'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
              disabled && 'opacity-50 cursor-not-allowed',
              readonly && 'cursor-default'
            )}
            aria-pressed={isSelected(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
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
      {/* Hidden input for form submission */}
      <input
        type="hidden"
        id={fieldId}
        name={fieldName}
        value={multiple ? JSON.stringify(fieldValue) : String(fieldValue || '')}
        required={required && !fieldValue}
        aria-invalid={!!error}
      />
    </div>
  )
}

