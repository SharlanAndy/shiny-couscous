import React, { useState, useEffect, useRef } from 'react'
import { BaseFieldProps, SelectOption } from '@/types'
import { cn } from '@/lib/utils'

export interface AsyncSelectFieldProps extends BaseFieldProps {
  fieldType: 'select-async' | 'async-select'
  loadOptions?: (query: string) => Promise<SelectOption[]>
  defaultOptions?: SelectOption[]
  cacheOptions?: boolean
  debounce?: number
  minInputLength?: number
  value?: string | string[]
  defaultValue?: string | string[]
  multiple?: boolean
}

export function AsyncSelectField({
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
  loadOptions,
  defaultOptions = [],
  cacheOptions = true,
  debounce = 300,
  minInputLength = 0,
  multiple = false,
  className,
}: AsyncSelectFieldProps) {
  // Get field value
  const fieldValue = value ?? defaultValue ?? (multiple ? [] : '')
  const [options, setOptions] = useState<SelectOption[]>(defaultOptions)
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showOptions, setShowOptions] = useState(false)
  const [selectedOptions, setSelectedOptions] = useState<SelectOption[]>([])
  const debounceTimerRef = useRef<NodeJS.Timeout>()
  const optionsCacheRef = useRef<Map<string, SelectOption[]>>(new Map())
  const selectRef = useRef<HTMLDivElement>(null)

  // Load options when input changes
  useEffect(() => {
    if (!loadOptions) return

    // Clear previous timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    // Check minimum input length
    if (inputValue.length < minInputLength) {
      setOptions(defaultOptions)
      setShowOptions(false)
      return
    }

    // Check cache
    if (cacheOptions && optionsCacheRef.current.has(inputValue)) {
      setOptions(optionsCacheRef.current.get(inputValue) || [])
      setShowOptions(true)
      return
    }

    // Debounce API call
    setIsLoading(true)
    debounceTimerRef.current = setTimeout(async () => {
      try {
        const loadedOptions = await loadOptions(inputValue)
        setOptions(loadedOptions)

        // Cache options
        if (cacheOptions) {
          optionsCacheRef.current.set(inputValue, loadedOptions)
        }

        setShowOptions(true)
      } catch (error) {
        console.error('Error loading async options:', error)
        setOptions([])
      } finally {
        setIsLoading(false)
      }
    }, debounce)
  }, [inputValue, loadOptions, minInputLength, cacheOptions, defaultOptions])

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

  // Get selected option labels
  useEffect(() => {
    if (multiple) {
      const values = Array.isArray(fieldValue) ? fieldValue : []
      const selected = [...defaultOptions, ...options].filter((opt) => values.includes(opt.value))
      setSelectedOptions(selected)
    } else {
      const selected = [...defaultOptions, ...options].find((opt) => opt.value === fieldValue)
      setSelectedOptions(selected ? [selected] : [])
    }
  }, [fieldValue, options, defaultOptions, multiple])

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
    if (e.target.value.length >= minInputLength) {
      setShowOptions(true)
    }
  }

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
      setInputValue(option.label)
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
        <div className="flex flex-wrap gap-2 mb-2">
          {selectedOptions.map((option) => (
            <span
              key={option.value}
              className="inline-flex items-center px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium"
            >
              {option.label}
              {!readonly && (
                <button
                  type="button"
                  onClick={() => handleRemoveSelected(option.value)}
                  disabled={disabled}
                  className="ml-2 text-primary hover:text-primary-dark"
                  aria-label={`Remove ${option.label}`}
                >
                  ×
                </button>
              )}
            </span>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="relative">
        <input
          id={fieldId}
          name={fieldName}
          type="text"
          value={!multiple ? (showOptions ? inputValue : displayValue) : inputValue}
          onChange={handleInputChange}
          onBlur={() => {
            setTimeout(() => setShowOptions(false), 200)
            if (onBlur) onBlur()
          }}
          onFocus={() => {
            if (inputValue.length >= minInputLength || options.length > 0) {
              setShowOptions(true)
            }
            if (onFocus) onFocus()
          }}
          placeholder={placeholder || 'Type to search...'}
          required={required && !multiple}
          disabled={disabled}
          readOnly={readonly}
          className={inputClassName}
          style={style?.style}
          aria-invalid={!!error}
          aria-autocomplete="list"
          aria-expanded={showOptions}
          aria-describedby={error ? `${fieldId}-error` : helpText ? `${fieldId}-help` : undefined}
        />

        {/* Loading indicator */}
        {isLoading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
          </div>
        )}
      </div>

      {/* Options dropdown */}
      {showOptions && (options.length > 0 || isLoading) && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {isLoading ? (
            <div className="px-4 py-2 text-sm text-gray-500">Loading...</div>
          ) : (
            options.map((option, index) => {
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
                    'w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors',
                    isSelected && 'bg-primary/10 text-primary font-medium',
                    option.disabled && 'opacity-50 cursor-not-allowed',
                    !option.disabled && 'cursor-pointer'
                  )}
                  role="option"
                  aria-selected={isSelected}
                >
                  <div className="font-medium">{option.label}</div>
                  {option.description && (
                    <div className="text-xs text-gray-500 mt-1">{option.description}</div>
                  )}
                </button>
              )
            })
          )}
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

