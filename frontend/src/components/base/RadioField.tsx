import React from 'react'
import { BaseFieldProps, SelectOption } from '@/types'
import { cn } from '@/lib/utils'

export interface RadioFieldProps extends BaseFieldProps {
  fieldType: 'radio' | 'radio-group'
  options: SelectOption[]
  allowOther?: boolean
  otherOptionLabel?: string
  otherInputPlaceholder?: string
}

export function RadioField({
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
  options,
  allowOther = false,
  otherOptionLabel = 'Other',
  otherInputPlaceholder = 'Please specify',
  className,
}: RadioFieldProps) {
  const fieldValue = value ?? defaultValue ?? ''
  const [showOtherInput, setShowOtherInput] = React.useState(false)
  const [otherValue, setOtherValue] = React.useState('')

  // Handle radio change
  const handleChange = (optionValue: string) => {
    if (allowOther && optionValue === '__other__') {
      setShowOtherInput(true)
      onChange(otherValue || '__other__')
    } else {
      setShowOtherInput(false)
      onChange(optionValue)
    }
  }

  // Handle other input change
  const handleOtherChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setOtherValue(newValue)
    onChange(newValue || '__other__')
  }

  // Check if "Other" option is selected
  React.useEffect(() => {
    if (allowOther && fieldValue && !options.some((opt) => opt.value === fieldValue)) {
      setShowOtherInput(true)
      setOtherValue(fieldValue === '__other__' ? '' : fieldValue)
    }
  }, [fieldValue, options, allowOther])

  // Merge styles
  const containerClassName = cn('mb-4', style?.containerClassName)

  if (hidden) {
    return null
  }

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
                type="radio"
                value={option.value}
                checked={fieldValue === option.value}
                onChange={() => handleChange(option.value)}
                onBlur={onBlur}
                onFocus={onFocus}
                required={required}
                disabled={disabled || option.disabled}
                readOnly={readonly}
                className={cn('h-4 w-4 text-primary focus:ring-primary flex-shrink-0 mt-0.5 sm:mt-0', className)}
                aria-invalid={!!error}
                aria-describedby={error ? `${fieldId}-error` : helpText ? `${fieldId}-help` : undefined}
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
                  type="radio"
                  value="__other__"
                  checked={fieldValue === '__other__' || (fieldValue && !options.some((opt) => opt.value === fieldValue))}
                  onChange={() => handleChange('__other__')}
                  onBlur={onBlur}
                  onFocus={onFocus}
                  required={required}
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

