import React, { useState, useRef, useEffect } from 'react'
import { BaseFieldProps, SelectOption } from '@/types'
import { cn } from '@/lib/utils'

export interface AutocompleteFieldProps extends BaseFieldProps {
  fieldType: 'autocomplete' | 'input-autocomplete'
  options?: SelectOption[] // Static options
  asyncOptions?: (query: string) => Promise<SelectOption[]> // Async options loader
  minChars?: number // Minimum characters before showing suggestions
  debounce?: number // Debounce delay for async options
  multiple?: boolean // Allow multiple selections
  value?: string | string[]
  defaultValue?: string | string[]
}

export function AutocompleteField({
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
  asyncOptions,
  minChars = 1,
  debounce = 300,
  multiple = false,
  className,
}: AutocompleteFieldProps) {
  // Get field value
  const fieldValue = value ?? defaultValue ?? (multiple ? [] : '')
  const [inputValue, setInputValue] = useState(multiple ? '' : String(fieldValue))
  const [suggestions, setSuggestions] = useState<SelectOption[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)
  const debounceTimerRef = useRef<NodeJS.Timeout>()

  // Filter static options
  const filterOptions = (query: string): SelectOption[] => {
    if (!query || query.length < minChars) return []
    return options.filter((opt) =>
      opt.label.toLowerCase().includes(query.toLowerCase()) ||
      opt.value.toLowerCase().includes(query.toLowerCase())
    )
  }

  // Load async options
  const loadAsyncOptions = async (query: string) => {
    if (!asyncOptions || query.length < minChars) {
      setSuggestions([])
      return
    }

    setIsLoading(true)
    try {
      const results = await asyncOptions(query)
      setSuggestions(results)
    } catch (error) {
      console.error('Error loading async options:', error)
      setSuggestions([])
    } finally {
      setIsLoading(false)
    }
  }

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value
    setInputValue(query)

    // Clear debounce timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    if (asyncOptions) {
      // Debounce async options
      debounceTimerRef.current = setTimeout(() => {
        loadAsyncOptions(query)
      }, debounce)
    } else {
      // Filter static options immediately
      const filtered = filterOptions(query)
      setSuggestions(filtered)
    }

    setShowSuggestions(true)
  }

  // Handle suggestion select
  const handleSuggestionSelect = (option: SelectOption) => {
    if (multiple) {
      const currentValues = Array.isArray(fieldValue) ? fieldValue : []
      if (!currentValues.includes(option.value)) {
        onChange([...currentValues, option.value])
      }
      setInputValue('')
    } else {
      onChange(option.value)
      setInputValue(option.label)
    }
    setShowSuggestions(false)
  }

  // Handle remove selected (multiple mode)
  const handleRemoveSelected = (valueToRemove: string) => {
    const currentValues = Array.isArray(fieldValue) ? fieldValue : []
    onChange(currentValues.filter((v) => v !== valueToRemove))
  }

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Get selected labels for display
  const getSelectedLabels = (): string[] => {
    if (!multiple) return []
    const selectedValues = Array.isArray(fieldValue) ? fieldValue : []
    return selectedValues
      .map((val) => {
        const option = [...options, ...suggestions].find((opt) => opt.value === val)
        return option?.label || val
      })
      .filter(Boolean) as string[]
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

  const selectedLabels = getSelectedLabels()

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

      {/* Selected items (multiple mode) */}
      {multiple && selectedLabels.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {selectedLabels.map((label, index) => {
            const value = Array.isArray(fieldValue) ? fieldValue[index] : ''
            return (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium"
              >
                {label}
                {!readonly && (
                  <button
                    type="button"
                    onClick={() => handleRemoveSelected(value)}
                    disabled={disabled}
                    className="ml-2 text-primary hover:text-primary-dark"
                    aria-label={`Remove ${label}`}
                  >
                    ×
                  </button>
                )}
              </span>
            )
          })}
        </div>
      )}

      {/* Input */}
      <div className="relative">
        <input
          ref={inputRef}
          id={fieldId}
          name={fieldName}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onBlur={() => {
            setTimeout(() => setShowSuggestions(false), 200)
            if (onBlur) onBlur()
          }}
          onFocus={() => {
            if (inputValue.length >= minChars || suggestions.length > 0) {
              setShowSuggestions(true)
            }
            if (onFocus) onFocus()
          }}
          placeholder={placeholder}
          required={required && !multiple}
          disabled={disabled}
          readOnly={readonly}
          className={inputClassName}
          style={style?.style}
          aria-invalid={!!error}
          aria-autocomplete="list"
          aria-expanded={showSuggestions}
          aria-describedby={error ? `${fieldId}-error` : helpText ? `${fieldId}-help` : undefined}
        />

        {/* Loading indicator */}
        {isLoading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
          </div>
        )}
      </div>

      {/* Suggestions dropdown */}
      {showSuggestions && (suggestions.length > 0 || isLoading) && (
        <div
          ref={suggestionsRef}
          className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto"
          role="listbox"
        >
          {isLoading ? (
            <div className="px-4 py-2 text-sm text-gray-500">Loading...</div>
          ) : (
            suggestions.map((option, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleSuggestionSelect(option)}
                disabled={option.disabled}
                className={cn(
                  'w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors',
                  option.disabled && 'opacity-50 cursor-not-allowed',
                  !option.disabled && 'cursor-pointer'
                )}
                role="option"
              >
                <div className="font-medium text-gray-900">{option.label}</div>
                {option.description && (
                  <div className="text-xs text-gray-500 mt-1">{option.description}</div>
                )}
              </button>
            ))
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

