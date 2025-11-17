import React, { useState } from 'react'
import { BaseFieldProps } from '@/types'
import { cn } from '@/lib/utils'

export interface ListFieldProps extends BaseFieldProps {
  fieldType: 'list' | 'list-field'
  value?: string[]
  defaultValue?: string[]
  minItems?: number
  maxItems?: number
  allowDuplicates?: boolean
  itemType?: 'text' | 'number' | 'email' | 'url'
}

export function ListField({
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
  minItems = 0,
  maxItems,
  allowDuplicates = false,
  itemType = 'text',
  className,
}: ListFieldProps) {
  // Get field value
  const listValue = value ?? defaultValue ?? []
  const [inputValue, setInputValue] = useState('')

  // Handle add item
  const handleAddItem = () => {
    if (!inputValue.trim()) return
    if (maxItems && listValue.length >= maxItems) return
    if (!allowDuplicates && listValue.includes(inputValue.trim())) return

    const newList = [...listValue, inputValue.trim()]
    onChange(newList)
    setInputValue('')
  }

  // Handle remove item
  const handleRemoveItem = (index: number) => {
    if (minItems && listValue.length <= minItems) return
    if (readonly || disabled) return

    const newList = listValue.filter((_, i) => i !== index)
    onChange(newList)
  }

  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddItem()
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

      {/* List items */}
      {listValue.length > 0 && (
        <div className="mb-2 space-y-2">
          {listValue.map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-2 bg-gray-50 border border-gray-200 rounded-md"
            >
              <span className="text-sm text-gray-900">{item}</span>
              {!readonly && (
                <button
                  type="button"
                  onClick={() => handleRemoveItem(index)}
                  disabled={disabled || (minItems ? listValue.length <= minItems : false)}
                  className={cn(
                    'text-sm text-error hover:text-red-700 font-medium ml-2',
                    disabled && 'opacity-50 cursor-not-allowed'
                  )}
                  aria-label={`Remove ${item}`}
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Input for adding items */}
      {!readonly && (!maxItems || listValue.length < maxItems) && (
        <div className="flex gap-2">
          <input
            type={itemType}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            onBlur={onBlur}
            onFocus={onFocus}
            placeholder={placeholder || 'Enter item and press Enter...'}
            disabled={disabled}
            className={cn(
              'input flex-1',
              error && 'input-error',
              disabled && 'opacity-50 cursor-not-allowed',
              style?.className,
              className
            )}
            style={style?.style}
          />
          <button
            type="button"
            onClick={handleAddItem}
            disabled={disabled || !inputValue.trim() || (maxItems ? listValue.length >= maxItems : false)}
            className={cn(
              'btn btn-secondary',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
          >
            Add
          </button>
        </div>
      )}

      {/* Empty state */}
      {listValue.length === 0 && readonly && (
        <div className="text-sm text-gray-500 italic">No items</div>
      )}

      {/* Hidden input for form submission */}
      <input
        type="hidden"
        id={fieldId}
        name={fieldName}
        value={JSON.stringify(listValue)}
        required={required && listValue.length >= minItems}
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

