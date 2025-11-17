import React, { useState, useEffect } from 'react'
import { BaseFieldProps } from '@/types'
import { cn } from '@/lib/utils'

export interface FormulaFieldProps extends BaseFieldProps {
  fieldType: 'formula' | 'calculated-field'
  formula?: string // Formula expression (e.g., "${field1} + ${field2}")
  dependencies?: string[] // Field names this formula depends on
  value?: number | string
  defaultValue?: number | string
  readOnly?: boolean // Usually read-only
  precision?: number // Decimal places for numeric results
}

export function FormulaField({
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
  formula = '',
  dependencies = [],
  precision = 2,
  readOnly = true,
  className,
}: FormulaFieldProps) {
  // Get field value (calculated)
  const fieldValue = value ?? defaultValue ?? ''

  // Calculate value from formula (simplified implementation)
  const calculateValue = (formulaStr: string, formData: Record<string, any>): any => {
    if (!formulaStr) return ''

    try {
      // Replace field references with actual values
      let expression = formulaStr
      
      // Replace ${fieldName} with actual values
      const fieldPattern = /\$\{([^}]+)\}/g
      expression = expression.replace(fieldPattern, (match, fieldName) => {
        const fieldValue = formData[fieldName] || 0
        return String(fieldValue)
      })

      // Evaluate expression (CAUTION: Using eval is not recommended in production)
      // In production, use a proper formula parser
      // For now, simple arithmetic operations
      if (/^[\d\s+\-*/().]+$/.test(expression)) {
        // eslint-disable-next-line no-eval
        const result = eval(expression)
        return typeof result === 'number' ? Number(result.toFixed(precision)) : result
      }

      return expression
    } catch (error) {
      console.error('Formula calculation error:', error)
      return ''
    }
  }

  // This would typically receive formData from parent, but for now just display
  const calculatedValue = fieldValue

  // Merge styles
  const containerClassName = cn('mb-4', style?.containerClassName)
  const inputClassName = cn(
    'input',
    error && 'input-error',
    'bg-gray-50 cursor-default', // Read-only styling
    disabled && 'opacity-50 cursor-not-allowed',
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
        {formula && (
          <span className="ml-2 text-xs text-gray-500 font-normal">
            ({formula})
          </span>
        )}
      </label>
      <input
        id={fieldId}
        name={fieldName}
        type="text"
        value={calculatedValue}
        onChange={() => {}} // No-op for read-only
        onBlur={onBlur}
        onFocus={onFocus}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        readOnly={readonly || readOnly}
        className={inputClassName}
        style={style?.style}
        aria-invalid={!!error}
        aria-describedby={error ? `${fieldId}-error` : helpText ? `${fieldId}-help` : undefined}
        aria-readonly="true"
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

