import React, { useState } from 'react'
import { BaseFieldProps } from '@/types'
import { cn } from '@/lib/utils'

export interface CurrencyFieldProps extends BaseFieldProps {
  fieldType: 'currency' | 'input-currency'
  currency?: string
  locale?: string
  showSymbol?: boolean
}

export function CurrencyField({
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
  currency = 'MYR',
  locale = 'en-MY',
  showSymbol = true,
  className,
}: CurrencyFieldProps) {
  // Get field value
  const fieldValue = value ?? defaultValue ?? ''

  // Format currency for display
  const formatCurrency = (val: number | string): string => {
    if (!val) return ''
    const numValue = typeof val === 'string' ? parseFloat(val.replace(/[^\d.-]/g, '')) : val
    if (isNaN(numValue)) return ''
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numValue)
  }

  // Parse currency from display value
  const parseCurrency = (val: string): number => {
    const cleaned = val.replace(/[^\d.-]/g, '')
    const parsed = parseFloat(cleaned)
    return isNaN(parsed) ? 0 : parsed
  }

  const [displayValue, setDisplayValue] = useState<string>(
    fieldValue ? formatCurrency(fieldValue) : ''
  )
  const [focused, setFocused] = useState(false)

  // Handle change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value
    setDisplayValue(inputValue)
    
    // Parse and update actual value
    const parsedValue = parseCurrency(inputValue)
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
    // Format currency when blurred
    if (fieldValue) {
      setDisplayValue(formatCurrency(fieldValue))
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
        {showSymbol && !focused && (
          <div className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-xs sm:text-sm font-medium">
            {currency === 'MYR' ? 'RM' : currency}
          </div>
        )}
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
          min={validation?.min}
          max={validation?.max}
          className={cn(
            inputClassName,
            showSymbol && 'pl-8 sm:pl-10'
          )}
          style={style?.style}
          aria-invalid={!!error}
          aria-describedby={error ? `${fieldId}-error` : helpText ? `${fieldId}-help` : undefined}
        />
      </div>
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

