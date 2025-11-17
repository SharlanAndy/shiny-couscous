import React, { useState } from 'react'
import { BaseFieldProps } from '@/types'
import { cn } from '@/lib/utils'

export interface PercentageFieldProps extends BaseFieldProps {
  fieldType: 'percentage' | 'input-percentage'
  value?: number
  defaultValue?: number
  min?: number
  max?: number
  step?: number
  showSymbol?: boolean
}

export function PercentageField({
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
  min = 0,
  max = 100,
  step = 0.01,
  showSymbol = true,
  className,
}: PercentageFieldProps) {
  // Get field value
  const fieldValue = value ?? defaultValue ?? 0

  // Format percentage for display
  const formatPercentage = (val: number): string => {
    if (isNaN(val)) return ''
    return String(val)
  }

  // Parse percentage from display value
  const parsePercentage = (val: string): number => {
    const cleaned = val.replace(/[^\d.-]/g, '')
    const parsed = parseFloat(cleaned)
    return isNaN(parsed) ? 0 : Math.max(min, Math.min(max, parsed))
  }

  const [displayValue, setDisplayValue] = useState<string>(
    fieldValue ? formatPercentage(fieldValue) : ''
  )
  const [focused, setFocused] = useState(false)

  // Handle change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value
    setDisplayValue(inputValue)
    
    // Parse and update actual value
    const parsedValue = parsePercentage(inputValue)
    onChange(parsedValue)
  }

  // Handle focus
  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setFocused(true)
    // Show raw number when focused
    if (fieldValue) {
      setDisplayValue(String(fieldValue))
    }
    if (onFocus) onFocus()
  }

  // Handle blur
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setFocused(false)
    // Format percentage when blurred
    if (fieldValue) {
      setDisplayValue(formatPercentage(fieldValue))
    }
    if (onBlur) onBlur()
  }

  // Merge styles
  const containerClassName = cn('mb-4', style?.containerClassName)
  const inputClassName = cn(
    'input',
    error && 'input-error',
    disabled && 'opacity-50 cursor-not-allowed',
    readonly && 'bg-gray-100 cursor-default',
    showSymbol && 'pr-10',
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
      <div className="relative">
        <input
          id={fieldId}
          name={fieldName}
          type="text"
          inputMode="decimal"
          value={displayValue}
          onChange={handleChange}
          onBlur={handleBlur}
          onFocus={handleFocus}
          placeholder={placeholder || '0.00'}
          required={required}
          disabled={disabled}
          readOnly={readonly}
          min={validation?.min ?? min}
          max={validation?.max ?? max}
          step={step}
          className={inputClassName}
          style={style?.style}
          aria-invalid={!!error}
          aria-describedby={error ? `${fieldId}-error` : helpText ? `${fieldId}-help` : undefined}
        />
        {showSymbol && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm font-medium pointer-events-none">
            %
          </div>
        )}
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
    </div>
  )
}

