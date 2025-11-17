import React, { useState, useEffect } from 'react'
import { BaseFieldProps, SelectOption } from '@/types'
import { cn } from '@/lib/utils'

export interface CascadingSelectFieldProps extends BaseFieldProps {
  fieldType: 'select-cascade' | 'cascading-select'
  cascadeConfig: {
    [key: string]: SelectOption[] // Options for each cascade level
  }
  parentField?: string // Parent field name (if in same form)
  value?: Record<string, string> // Values for each cascade level
  defaultValue?: Record<string, string>
}

export function CascadingSelectField({
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
  cascadeConfig = {},
  parentField,
  className,
}: CascadingSelectFieldProps) {
  // Get field value
  const cascadeValue = value ?? defaultValue ?? {}

  // Get cascade levels
  const levels = Object.keys(cascadeConfig)
  const [currentValues, setCurrentValues] = useState<Record<string, string>>(cascadeValue)

  // Handle level change
  const handleLevelChange = (level: string, newValue: string) => {
    const newValues = { ...currentValues, [level]: newValue }

    // Clear dependent levels when parent changes
    const currentLevelIndex = levels.indexOf(level)
    if (currentLevelIndex >= 0) {
      for (let i = currentLevelIndex + 1; i < levels.length; i++) {
        delete newValues[levels[i]]
      }
    }

    setCurrentValues(newValues)
    onChange(newValues)
  }

  // Get options for a level based on parent selection
  const getOptionsForLevel = (level: string): SelectOption[] => {
    const levelIndex = levels.indexOf(level)

    // First level always shows all options
    if (levelIndex === 0) {
      return cascadeConfig[level] || []
    }

    // Subsequent levels depend on parent selection
    const parentLevel = levels[levelIndex - 1]
    const parentValue = currentValues[parentLevel]

    if (!parentValue) {
      return [] // No options until parent is selected
    }

    // Filter options based on parent (if cascadeConfig supports it)
    // For now, return all options for the level
    return cascadeConfig[level] || []
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

      {/* Cascade levels */}
      <div className="space-y-4">
        {levels.map((level, index) => {
          const options = getOptionsForLevel(level)
          const levelValue = currentValues[level] || ''
          const isEnabled = index === 0 || !!currentValues[levels[index - 1]]

          return (
            <div key={level}>
              <label htmlFor={`${fieldId}-${level}`} className="label">
                {level.charAt(0).toUpperCase() + level.slice(1)}
                {required && index === 0 && <span className="text-error"> *</span>}
              </label>
              <select
                id={`${fieldId}-${level}`}
                name={`${fieldName}[${level}]`}
                value={levelValue}
                onChange={(e) => handleLevelChange(level, e.target.value)}
                onBlur={onBlur}
                onFocus={onFocus}
                required={required && index === 0}
                disabled={disabled || !isEnabled || readonly}
                className={cn(
                  'input',
                  error && 'input-error',
                  !isEnabled && 'opacity-50 cursor-not-allowed',
                  disabled && 'opacity-50 cursor-not-allowed',
                  readonly && 'bg-gray-100 cursor-default',
                  style?.className,
                  className
                )}
              >
                <option value="">{placeholder || `Select ${level}...`}</option>
                {options.map((option) => (
                  <option key={option.value} value={option.value} disabled={option.disabled}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          )
        })}
      </div>

      {/* Hidden input for form submission */}
      <input
        type="hidden"
        id={fieldId}
        name={fieldName}
        value={JSON.stringify(currentValues)}
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

