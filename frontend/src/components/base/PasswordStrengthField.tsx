import React, { useState } from 'react'
import { BaseFieldProps } from '@/types'
import { cn } from '@/lib/utils'

export interface PasswordStrengthFieldProps extends BaseFieldProps {
  fieldType: 'password-strength' | 'password-with-strength'
  value?: string
  defaultValue?: string
  showStrengthIndicator?: boolean
  minLength?: number
  requireUppercase?: boolean
  requireLowercase?: boolean
  requireNumbers?: boolean
  requireSpecialChars?: boolean
}

type PasswordStrength = 'weak' | 'fair' | 'good' | 'strong'

export function PasswordStrengthField({
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
  showStrengthIndicator = true,
  minLength = 8,
  requireUppercase = false,
  requireLowercase = false,
  requireNumbers = false,
  requireSpecialChars = false,
  className,
}: PasswordStrengthFieldProps) {
  // Get field value
  const passwordValue = value ?? defaultValue ?? ''

  // Calculate password strength
  const calculateStrength = (password: string): PasswordStrength => {
    if (!password) return 'weak'

    let score = 0

    // Length
    if (password.length >= minLength) score++
    if (password.length >= minLength + 4) score++

    // Character variety
    if (requireUppercase && /[A-Z]/.test(password)) score++
    if (requireLowercase && /[a-z]/.test(password)) score++
    if (requireNumbers && /\d/.test(password)) score++
    if (requireSpecialChars && /[!@#$%^&*(),.?":{}|<>]/.test(password)) score++

    // Determine strength
    if (score <= 2) return 'weak'
    if (score <= 4) return 'fair'
    if (score <= 6) return 'good'
    return 'strong'
  }

  const strength = calculateStrength(passwordValue)

  // Get strength color
  const getStrengthColor = (strength: PasswordStrength): string => {
    switch (strength) {
      case 'weak':
        return 'bg-red-500'
      case 'fair':
        return 'bg-yellow-500'
      case 'good':
        return 'bg-blue-500'
      case 'strong':
        return 'bg-green-500'
    }
  }

  // Get strength label
  const getStrengthLabel = (strength: PasswordStrength): string => {
    switch (strength) {
      case 'weak':
        return 'Weak'
      case 'fair':
        return 'Fair'
      case 'good':
        return 'Good'
      case 'strong':
        return 'Strong'
    }
  }

  // Get strength percentage
  const getStrengthPercentage = (strength: PasswordStrength): number => {
    switch (strength) {
      case 'weak':
        return 25
      case 'fair':
        return 50
      case 'good':
        return 75
      case 'strong':
        return 100
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
      <input
        id={fieldId}
        name={fieldName}
        type="password"
        value={passwordValue}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        onFocus={onFocus}
        placeholder={placeholder || 'Enter password...'}
        required={required}
        disabled={disabled}
        readOnly={readonly}
        minLength={minLength}
        className={cn(
          'input',
          error && 'input-error',
          disabled && 'opacity-50 cursor-not-allowed',
          readonly && 'bg-gray-100 cursor-default',
          style?.className,
          className
        )}
        style={style?.style}
        aria-invalid={!!error}
        aria-describedby={error ? `${fieldId}-error` : helpText ? `${fieldId}-help` : undefined}
      />

      {/* Strength indicator */}
      {showStrengthIndicator && passwordValue && (
        <div className="mt-2">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-600">Password strength:</span>
            <span
              className={cn(
                'text-xs font-medium',
                strength === 'weak' && 'text-red-600',
                strength === 'fair' && 'text-yellow-600',
                strength === 'good' && 'text-blue-600',
                strength === 'strong' && 'text-green-600'
              )}
            >
              {getStrengthLabel(strength)}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={cn('h-2 rounded-full transition-all duration-300', getStrengthColor(strength))}
              style={{ width: `${getStrengthPercentage(strength)}%` }}
            />
          </div>
        </div>
      )}

      {/* Requirements */}
      {(requireUppercase || requireLowercase || requireNumbers || requireSpecialChars) && (
        <div className="mt-2 text-xs text-gray-600 space-y-1">
          <div>Requirements:</div>
          <ul className="list-disc list-inside space-y-1 ml-2">
            {minLength > 0 && (
              <li className={passwordValue.length >= minLength ? 'text-green-600' : 'text-gray-500'}>
                At least {minLength} characters
              </li>
            )}
            {requireUppercase && (
              <li className={/[A-Z]/.test(passwordValue) ? 'text-green-600' : 'text-gray-500'}>
                At least one uppercase letter
              </li>
            )}
            {requireLowercase && (
              <li className={/[a-z]/.test(passwordValue) ? 'text-green-600' : 'text-gray-500'}>
                At least one lowercase letter
              </li>
            )}
            {requireNumbers && (
              <li className={/\d/.test(passwordValue) ? 'text-green-600' : 'text-gray-500'}>
                At least one number
              </li>
            )}
            {requireSpecialChars && (
              <li className={/[!@#$%^&*(),.?":{}|<>]/.test(passwordValue) ? 'text-green-600' : 'text-gray-500'}>
                At least one special character
              </li>
            )}
          </ul>
        </div>
      )}

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

