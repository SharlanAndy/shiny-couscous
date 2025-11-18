import React, { useState } from 'react'
import { BaseFieldProps, FormField } from '@/types'
import { cn } from '@/lib/utils'
import { FormRenderer } from '@/components/forms/FormRenderer'

export interface ArrayFieldProps extends BaseFieldProps {
  fieldType: 'array' | 'array-field'
  itemSchema?: FormField // Schema for each array item
  value?: any[]
  defaultValue?: any[]
  minItems?: number
  maxItems?: number
  addButtonLabel?: string
  removeButtonLabel?: string
}

export function ArrayField({
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
  itemSchema,
  minItems = 0,
  maxItems,
  addButtonLabel = 'Add Item',
  removeButtonLabel = 'Remove',
  className,
}: ArrayFieldProps) {
  // Get field value
  const arrayValue = value ?? defaultValue ?? []

  // Handle add item
  const handleAddItem = () => {
    if (maxItems && arrayValue.length >= maxItems) return

    const newItem = itemSchema?.defaultValue ?? null
    const newArray = [...arrayValue, newItem]
    onChange(newArray)
  }

  // Handle remove item
  const handleRemoveItem = (index: number) => {
    if (minItems && arrayValue.length <= minItems) return
    if (readonly || disabled) return

    const newArray = arrayValue.filter((_, i) => i !== index)
    onChange(newArray)
  }

  // Handle item change
  const handleItemChange = (index: number, newValue: any) => {
    const newArray = [...arrayValue]
    newArray[index] = newValue
    onChange(newArray)
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

      {/* Array items */}
      <div className="space-y-3 sm:space-y-4">
        {arrayValue.map((item, index) => (
          <div
            key={index}
            className="p-3 sm:p-4 border border-gray-300 rounded-md bg-gray-50 relative"
          >
            {/* Item index */}
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <span className="text-xs sm:text-sm font-medium text-gray-700">
                Item {index + 1}
              </span>
              {!readonly && (
                <button
                  type="button"
                  onClick={() => handleRemoveItem(index)}
                  disabled={disabled || (minItems ? arrayValue.length <= minItems : false)}
                  className={cn(
                    'text-xs sm:text-sm text-error hover:text-red-700 font-medium whitespace-nowrap',
                    disabled && 'opacity-50 cursor-not-allowed'
                  )}
                >
                  {removeButtonLabel}
                </button>
              )}
            </div>

            {/* Item content */}
            {itemSchema ? (
              <FormRenderer
                steps={[
                  {
                    stepId: `array-${fieldId}-${index}`,
                    stepName: '',
                    stepOrder: 0,
                    fields: [{ ...itemSchema, fieldId: `${itemSchema.fieldId}-${index}`, fieldName: `${itemSchema.fieldName}-${index}` }],
                  },
                ]}
                readonly={readonly || disabled} // Pass readonly prop to nested FormRenderer
                formData={{
                  [`array-${fieldId}-${index}`]: { [itemSchema.fieldName]: item },
                }}
                errors={{}}
                onChange={(stepId, fieldName, newValue) => handleItemChange(index, newValue)}
              />
            ) : (
              <input
                type="text"
                value={item ?? ''}
                onChange={(e) => handleItemChange(index, e.target.value)}
                onBlur={onBlur}
                onFocus={onFocus}
                disabled={disabled}
                readOnly={readonly}
                placeholder={`Item ${index + 1}`}
                className="input"
              />
            )}
          </div>
        ))}

        {/* Add item button */}
        {!readonly && (!maxItems || arrayValue.length < maxItems) && (
          <button
            type="button"
            onClick={handleAddItem}
            disabled={disabled}
            className={cn(
              'btn btn-secondary',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
          >
            + {addButtonLabel}
          </button>
        )}

        {/* Empty state */}
        {arrayValue.length === 0 && (
          <div className="text-center py-6 sm:py-8 text-gray-500 text-xs sm:text-sm border border-gray-300 rounded-md bg-gray-50 px-3 sm:px-4">
            No items. Click "{addButtonLabel}" to add one.
          </div>
        )}
      </div>

      {/* Hidden input for form submission */}
      <input type="hidden" name={fieldName} value={JSON.stringify(arrayValue)} required={required && arrayValue.length >= minItems} />

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

