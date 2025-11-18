import React, { useState, useRef, useEffect } from 'react'
import { BaseFieldProps, SelectOption } from '@/types'
import { cn } from '@/lib/utils'

export interface SearchableSelectFieldProps extends BaseFieldProps {
  fieldType: 'select-searchable' | 'searchable-select'
  options: SelectOption[]
  value?: string
  defaultValue?: string
  multiple?: boolean
  searchPlaceholder?: string
  minChars?: number
}

export function SearchableSelectField({
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
  options = [],
  multiple = false,
  searchPlaceholder = 'Search options...',
  minChars = 0,
  className,
}: SearchableSelectFieldProps) {
  // Get field value
  const fieldValue = value ?? defaultValue ?? (multiple ? [] : '')
  const [searchQuery, setSearchQuery] = useState('')
  const [showOptions, setShowOptions] = useState(false)
  const [selectedOptions, setSelectedOptions] = useState<SelectOption[]>([])
  const selectRef = useRef<HTMLDivElement>(null)

  // Filter options based on search
  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    option.value.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Get selected option labels
  useEffect(() => {
    if (multiple) {
      const values = Array.isArray(fieldValue) ? fieldValue : []
      const selected = options.filter((opt) => values.includes(opt.value))
      setSelectedOptions(selected)
    } else {
      const selected = options.find((opt) => opt.value === fieldValue)
      setSelectedOptions(selected ? [selected] : [])
    }
  }, [fieldValue, options, multiple])

  // Close options when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setShowOptions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Handle option select
  const handleOptionSelect = (option: SelectOption) => {
    if (multiple) {
      const values = Array.isArray(fieldValue) ? fieldValue : []
      if (values.includes(option.value)) {
        // Deselect
        onChange(values.filter((v) => v !== option.value))
      } else {
        // Select
        onChange([...values, option.value])
      }
    } else {
      onChange(option.value)
      setShowOptions(false)
    }
  }

  // Handle remove selected (multiple mode)
  const handleRemoveSelected = (valueToRemove: string) => {
    if (!multiple) return
    const values = Array.isArray(fieldValue) ? fieldValue : []
    onChange(values.filter((v) => v !== valueToRemove))
  }

  // Merge styles
  const containerClassName = cn('mb-4 relative', style?.containerClassName)

  if (hidden) {
    return null
  }

  // Display value for single select
  const displayValue = !multiple && selectedOptions.length > 0 ? selectedOptions[0].label : ''

  return (
    <div className={containerClassName} ref={selectRef}>
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

      {/* Selected items (multiple mode) */}
      {multiple && selectedOptions.length > 0 && (
        <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-2">
          {selectedOptions.map((option) => (
            <span
              key={option.value}
              className="inline-flex items-center px-2 sm:px-3 py-0.5 sm:py-1 bg-primary/10 text-primary rounded-full text-xs sm:text-sm font-medium break-words max-w-full"
            >
              <span className="truncate">{option.label}</span>
              {!readonly && (
                <button
                  type="button"
                  onClick={() => handleRemoveSelected(option.value)}
                  disabled={disabled}
                  className="ml-1 sm:ml-2 text-primary hover:text-primary-dark flex-shrink-0 text-base sm:text-lg leading-none"
                  aria-label={`Remove ${option.label}`}
                >
                  ×
                </button>
              )}
            </span>
          ))}
        </div>
      )}

      {/* Search input / Display value */}
      <div className="relative">
        <input
          id={fieldId}
          name={fieldName}
          type="text"
          value={showOptions ? searchQuery : displayValue}
          onChange={(e) => {
            setSearchQuery(e.target.value)
            setShowOptions(true)
          }}
          onBlur={() => {
            setTimeout(() => setShowOptions(false), 200)
            if (onBlur) onBlur()
          }}
          onFocus={() => {
            setShowOptions(true)
            if (onFocus) onFocus()
          }}
          placeholder={placeholder || (multiple ? searchPlaceholder : 'Select option...')}
          required={required && !multiple}
          disabled={disabled}
          readOnly={readonly}
          className={cn(
            'input text-xs sm:text-sm',
            error && 'input-error',
            disabled && 'opacity-50 cursor-not-allowed',
            readonly && 'bg-gray-100 cursor-default',
            style?.className,
            className
          )}
          style={style?.style}
          aria-invalid={!!error}
          aria-autocomplete="list"
          aria-expanded={showOptions}
          aria-describedby={error ? `${fieldId}-error` : helpText ? `${fieldId}-help` : undefined}
        />

        {/* Dropdown arrow */}
        {!readonly && (
          <div className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        )}
      </div>

      {/* Options dropdown */}
      {showOptions && filteredOptions.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {filteredOptions.map((option, index) => {
            const isSelected = multiple
              ? Array.isArray(fieldValue) && fieldValue.includes(option.value)
              : fieldValue === option.value

            return (
              <button
                key={index}
                type="button"
                onClick={() => handleOptionSelect(option)}
                disabled={option.disabled}
                className={cn(
                  'w-full text-left px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm hover:bg-gray-50 transition-colors',
                  isSelected && 'bg-primary/10 text-primary font-medium',
                  option.disabled && 'opacity-50 cursor-not-allowed',
                  !option.disabled && 'cursor-pointer'
                )}
                role="option"
                aria-selected={isSelected}
              >
                <div className="font-medium break-words">{option.label}</div>
                {option.description && (
                  <div className="text-[10px] sm:text-xs text-gray-500 mt-0.5 sm:mt-1 break-words">{option.description}</div>
                )}
              </button>
            )
          })}
        </div>
      )}

      {/* No results */}
      {showOptions && searchQuery.length >= minChars && filteredOptions.length === 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg p-3 sm:p-4 text-xs sm:text-sm text-gray-500">
          No options found
        </div>
      )}

      {/* Hidden input for form submission */}
      <input
        type="hidden"
        name={fieldName}
        value={multiple ? JSON.stringify(fieldValue) : fieldValue}
        required={required}
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

