import React, { useState } from 'react'
import { BaseFieldProps } from '@/types'
import { cn, isValidPhone } from '@/lib/utils'

export interface PhoneFieldProps extends BaseFieldProps {
  fieldType: 'phone' | 'input-tel'
  countryCode?: string
  international?: boolean
}

export function PhoneField({
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
  countryCode = '+60',
  international = true,
  className,
}: PhoneFieldProps) {
  // Get field value
  const fieldValue = value ?? defaultValue ?? ''

  // Handle change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = e.target.value

    // Format phone number
    if (international && !newValue.startsWith('+')) {
      // Auto-add country code if not present
      if (newValue.length > 0 && !newValue.startsWith(countryCode)) {
        newValue = countryCode + newValue.replace(/^\+/, '')
      }
    }

    // Remove non-numeric characters except +
    if (international) {
      newValue = newValue.replace(/[^\d+]/g, '')
    } else {
      newValue = newValue.replace(/\D/g, '')
    }

    onChange(newValue)
  }

  // Validate on blur
  const handleBlur = () => {
    if (onBlur) {
      onBlur()
    }

    // Validate phone number
    if (fieldValue && validation?.pattern && !isValidPhone(fieldValue)) {
      // Validation error will be shown via error prop
    }
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

  if (hidden) {
    return null
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
      <div className="relative">
        {international && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
            {countryCode}
          </div>
        )}
        <input
          id={fieldId}
          name={fieldName}
          type="tel"
          value={fieldValue}
          onChange={handleChange}
          onBlur={handleBlur}
          onFocus={onFocus}
          placeholder={placeholder || (international ? `${countryCode} 12 345 6789` : '123 456 7890')}
          required={required}
          disabled={disabled}
          readOnly={readonly}
          pattern={validation?.pattern || (international ? '^\\+?[0-9]{10,15}$' : '^[0-9]{10,15}$')}
          minLength={validation?.minLength}
          maxLength={validation?.maxLength}
          className={cn(
            inputClassName,
            international && 'pl-16'
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

