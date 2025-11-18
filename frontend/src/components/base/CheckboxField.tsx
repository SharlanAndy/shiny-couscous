import React from 'react'
import { BaseFieldProps, SelectOption } from '@/types'
import { cn } from '@/lib/utils'

export interface CheckboxFieldProps extends BaseFieldProps {
  fieldType: 'checkbox' | 'checkbox-group'
  options?: SelectOption[]
  value?: string[] | boolean
  defaultValue?: string[] | boolean
  allowOther?: boolean
  otherOptionLabel?: string
  otherInputPlaceholder?: string
}

export function CheckboxField({
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
  allowOther = false,
  otherOptionLabel = 'Other',
  otherInputPlaceholder = 'Please specify',
  className,
}: CheckboxFieldProps) {
  // For single checkbox (boolean value)
  const isSingleCheckbox = fieldType === 'checkbox' && options.length === 0
  const singleCheckboxValue = isSingleCheckbox
    ? (value ?? defaultValue ?? false)
    : false

  // For checkbox group (array of values)
  const checkboxGroupValue = isSingleCheckbox
    ? []
    : (value ?? defaultValue ?? [])

  const [showOtherInput, setShowOtherInput] = React.useState(false)
  const [otherValue, setOtherValue] = React.useState('')

  // Handle single checkbox change
  const handleSingleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.checked)
  }

  // Handle checkbox group change
  const handleGroupChange = (optionValue: string) => {
    const currentValues = Array.isArray(checkboxGroupValue) ? checkboxGroupValue : []
    const newValues = currentValues.includes(optionValue)
      ? currentValues.filter((v) => v !== optionValue)
      : [...currentValues, optionValue]

    onChange(newValues)

    // Handle "Other" option
    if (allowOther && optionValue === '__other__') {
      setShowOtherInput(true)
    } else if (allowOther && optionValue !== '__other__') {
      setShowOtherInput(false)
    }
  }

  // Handle other input change
  const handleOtherChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setOtherValue(newValue)
    const currentValues = Array.isArray(checkboxGroupValue) ? checkboxGroupValue : []
    const otherIndex = currentValues.indexOf('__other__')
    
    if (otherIndex >= 0) {
      const newValues = [...currentValues]
      newValues[otherIndex] = newValue || '__other__'
      onChange(newValues)
    } else if (newValue) {
      onChange([...currentValues, newValue])
    }
  }

  // Merge styles
  const containerClassName = cn('mb-4', style?.containerClassName)

  if (hidden) {
    return null
  }

  // Single checkbox
  if (isSingleCheckbox) {
    return (
      <div className={containerClassName}>
        <label
          htmlFor={fieldId}
          className={cn(
            'flex items-center space-x-2 cursor-pointer',
            disabled && 'opacity-50 cursor-not-allowed',
            style?.labelClassName
          )}
        >
          <input
            id={fieldId}
            name={fieldName}
            type="checkbox"
            checked={singleCheckboxValue as boolean}
            onChange={handleSingleChange}
            onBlur={onBlur}
            onFocus={onFocus}
            required={required}
            disabled={disabled}
            readOnly={readonly}
            className={cn('h-4 w-4 text-primary focus:ring-primary', className)}
            aria-invalid={!!error}
            aria-describedby={error ? `${fieldId}-error` : helpText ? `${fieldId}-help` : undefined}
          />
          <span className={cn('label', required && 'label-required')}>
            {label}
            {tooltip && (
              <span className="ml-1 text-gray-400" title={tooltip}>
                ℹ️
              </span>
            )}
          </span>
        </label>
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

  // Checkbox group
  return (
    <div className={containerClassName}>
      <fieldset>
        <legend
          className={cn(
            'label mb-2',
            required && 'label-required',
            style?.labelClassName
          )}
        >
          {label}
          {tooltip && (
            <span className="ml-1 text-gray-400" title={tooltip}>
              ℹ️
            </span>
          )}
        </legend>
        <div className="space-y-2 sm:space-y-3">
          {options.map((option) => (
            <label
              key={option.value}
              htmlFor={`${fieldId}-${option.value}`}
              className={cn(
                'flex items-start sm:items-center gap-2 sm:space-x-2 cursor-pointer',
                disabled && 'opacity-50 cursor-not-allowed',
                option.disabled && 'opacity-50 cursor-not-allowed'
              )}
            >
              <input
                id={`${fieldId}-${option.value}`}
                name={fieldName}
                type="checkbox"
                value={option.value}
                checked={Array.isArray(checkboxGroupValue) && checkboxGroupValue.includes(option.value)}
                onChange={() => handleGroupChange(option.value)}
                onBlur={onBlur}
                onFocus={onFocus}
                disabled={disabled || option.disabled}
                readOnly={readonly}
                className={cn('h-4 w-4 text-primary focus:ring-primary flex-shrink-0 mt-0.5 sm:mt-0', className)}
                aria-invalid={!!error}
              />
              <span className="text-xs sm:text-sm text-gray-700 break-words">
                {option.label}
                {option.description && (
                  <span className="ml-1 text-gray-500">({option.description})</span>
                )}
              </span>
            </label>
          ))}
          {allowOther && (
            <>
              <label
                htmlFor={`${fieldId}-other`}
                className={cn(
                  'flex items-start sm:items-center gap-2 sm:space-x-2 cursor-pointer',
                  disabled && 'opacity-50 cursor-not-allowed'
                )}
              >
                <input
                  id={`${fieldId}-other`}
                  name={fieldName}
                  type="checkbox"
                  value="__other__"
                  checked={Array.isArray(checkboxGroupValue) && checkboxGroupValue.includes('__other__')}
                  onChange={() => handleGroupChange('__other__')}
                  onBlur={onBlur}
                  onFocus={onFocus}
                  disabled={disabled}
                  readOnly={readonly}
                  className={cn('h-4 w-4 text-primary focus:ring-primary flex-shrink-0 mt-0.5 sm:mt-0', className)}
                />
                <span className="text-xs sm:text-sm text-gray-700 break-words">{otherOptionLabel}</span>
              </label>
              {showOtherInput && (
                <input
                  type="text"
                  value={otherValue}
                  onChange={handleOtherChange}
                  placeholder={otherInputPlaceholder}
                  className="input mt-2 ml-4 sm:ml-6 text-xs sm:text-sm"
                  required={required && showOtherInput}
                  disabled={disabled}
                />
              )}
            </>
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
      </fieldset>
    </div>
  )
}

