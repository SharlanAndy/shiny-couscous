import React, { useState, useEffect } from 'react'
import { BaseFieldProps, SelectOption } from '@/types'
import { cn } from '@/lib/utils'

export interface SelectFieldProps extends BaseFieldProps {
  fieldType: 'select-single' | 'select-multi' | 'select-other'
  options: SelectOption[]
  multiple?: boolean
  searchable?: boolean
  allowOther?: boolean
  otherOptionLabel?: string
  otherInputPlaceholder?: string
}

export function SelectField({
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
  options,
  multiple = false,
  searchable = false,
  allowOther = false,
  otherOptionLabel = 'Other',
  otherInputPlaceholder = 'Please specify',
  className,
}: SelectFieldProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [showOtherInput, setShowOtherInput] = useState(false)
  const [otherValue, setOtherValue] = useState('')

  // Get field value
  let fieldValue = value ?? defaultValue ?? (multiple ? [] : '')
  
  // If no value/defaultValue and not multiple, initialize with first option's value
  // This ensures the field has a value even if user doesn't explicitly select
  if (!multiple && !fieldValue && options.length > 0 && !placeholder) {
    fieldValue = options[0].value
  }

  // Filter options based on search
  const filteredOptions = searchable
    ? options.filter((opt) =>
        opt.label.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : options
  
  // Initialize field value on mount if it has a value but onChange hasn't been called
  useEffect(() => {
    if (!multiple && fieldValue && (!value && !defaultValue) && options.length > 0 && !placeholder) {
      // If we have a fieldValue (first option) but it's not in formData yet, trigger onChange
      // Use a small timeout to avoid calling onChange during render
      const timer = setTimeout(() => {
        onChange(fieldValue)
      }, 0)
      return () => clearTimeout(timer)
    }
  }, []) // Only on mount - eslint-disable-line react-hooks/exhaustive-deps

  // Handle change
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (multiple) {
      const selectedValues = Array.from(e.target.selectedOptions, (opt) => opt.value)
      onChange(selectedValues)
    } else {
      const selectedValue = e.target.value
      if (allowOther && selectedValue === '__other__') {
        setShowOtherInput(true)
        onChange(otherValue)
      } else {
        setShowOtherInput(false)
        onChange(selectedValue)
      }
    }
  }

  // Handle other input change
  const handleOtherChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setOtherValue(newValue)
    onChange(newValue)
  }

  // Merge styles
  const selectClassName = cn(
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
      {searchable && (
        <input
          type="text"
          placeholder="Search options..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input mb-2 text-xs sm:text-sm"
        />
      )}
      <select
        id={fieldId}
        name={fieldName}
        value={multiple ? undefined : fieldValue}
        onChange={handleChange}
        onBlur={onBlur}
        onFocus={onFocus}
        required={required}
        disabled={disabled}
        multiple={multiple}
        className={cn(selectClassName, 'text-xs sm:text-sm')}
        style={style?.style}
        aria-invalid={!!error}
        aria-describedby={error ? `${fieldId}-error` : helpText ? `${fieldId}-help` : undefined}
      >
        {!multiple && placeholder && (
          <option value="">{placeholder}</option>
        )}
        {filteredOptions.map((option) => (
          <option
            key={option.value}
            value={option.value}
            disabled={option.disabled}
          >
            {option.label}
          </option>
        ))}
        {allowOther && !multiple && (
          <option value="__other__">{otherOptionLabel}</option>
        )}
      </select>
      {showOtherInput && allowOther && (
        <input
          type="text"
          value={otherValue}
          onChange={handleOtherChange}
          placeholder={otherInputPlaceholder}
          className="input mt-2 text-xs sm:text-sm"
          required={required}
        />
      )}
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

