import React, { useState } from 'react'
import { BaseFieldProps, FormField } from '@/types'
import { cn } from '@/lib/utils'
import { FormRenderer } from '@/components/forms/FormRenderer'

export interface RepeaterFieldProps extends BaseFieldProps {
  fieldType: 'repeater' | 'repeater-field'
  itemSchema?: FormField[] // Schema for each repeated item
  value?: any[] // Array of repeated items
  defaultValue?: any[]
  minItems?: number
  maxItems?: number
  addButtonLabel?: string
  removeButtonLabel?: string
  cloneEnabled?: boolean // Allow cloning items
}

export function RepeaterField({
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
  itemSchema = [],
  minItems = 0,
  maxItems,
  addButtonLabel = 'Add Item',
  removeButtonLabel = 'Remove',
  cloneEnabled = true,
  className,
}: RepeaterFieldProps) {
  // Get field value
  const repeaterValue = value ?? defaultValue ?? []

  // Handle add item
  const handleAddItem = () => {
    if (maxItems && repeaterValue.length >= maxItems) return

    // Create new item with default values
    const newItem: Record<string, any> = {}
    itemSchema.forEach((field) => {
      newItem[field.fieldName] = field.defaultValue ?? null
    })

    const newArray = [...repeaterValue, newItem]
    onChange(newArray)
  }

  // Handle remove item
  const handleRemoveItem = (index: number) => {
    if (minItems && repeaterValue.length <= minItems) return
    if (readonly || disabled) return

    const newArray = repeaterValue.filter((_, i) => i !== index)
    onChange(newArray)
  }

  // Handle clone item
  const handleCloneItem = (index: number) => {
    if (maxItems && repeaterValue.length >= maxItems) return
    if (readonly || disabled || !cloneEnabled) return

    const itemToClone = repeaterValue[index]
    const newArray = [...repeaterValue, { ...itemToClone }]
    onChange(newArray)
  }

  // Handle item change
  const handleItemChange = (index: number, fieldName: string, fieldValue: any) => {
    const newArray = repeaterValue.map((item, i) =>
      i === index ? { ...item, [fieldName]: fieldValue } : item
    )
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

      {/* Repeater items */}
      <div className="space-y-4">
        {repeaterValue.map((item, index) => (
          <div
            key={index}
            className="p-4 border border-gray-300 rounded-md bg-gray-50 relative"
          >
            {/* Item header */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-gray-700">
                Item {index + 1}
              </span>
              <div className="flex items-center space-x-2">
                {cloneEnabled && !readonly && (
                  <button
                    type="button"
                    onClick={() => handleCloneItem(index)}
                    disabled={disabled || (maxItems ? repeaterValue.length >= maxItems : false)}
                    className={cn(
                      'text-sm text-primary hover:text-primary-dark font-medium',
                      disabled && 'opacity-50 cursor-not-allowed'
                    )}
                    title="Clone this item"
                  >
                    📋 Clone
                  </button>
                )}
                {!readonly && (
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(index)}
                    disabled={disabled || (minItems ? repeaterValue.length <= minItems : false)}
                    className={cn(
                      'text-sm text-error hover:text-red-700 font-medium',
                      disabled && 'opacity-50 cursor-not-allowed'
                    )}
                  >
                    {removeButtonLabel}
                  </button>
                )}
              </div>
            </div>

            {/* Item content */}
            {itemSchema.length > 0 && (
              <FormRenderer
                steps={[
                  {
                    stepId: `repeater-${fieldId}-${index}`,
                    stepName: `Item ${index + 1}`,
                    stepOrder: 0,
                    fields: itemSchema.map((field) => ({
                      ...field,
                      fieldId: `${field.fieldId}-${index}`,
                      fieldName: field.fieldName,
                    })),
                  },
                ]}
                formData={{
                  [`repeater-${fieldId}-${index}`]: item,
                }}
                errors={{}}
                onChange={(stepId, fieldName, fieldValue) =>
                  handleItemChange(index, fieldName, fieldValue)
                }
              />
            )}
          </div>
        ))}

        {/* Add item button */}
        {!readonly && (!maxItems || repeaterValue.length < maxItems) && (
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
        {repeaterValue.length === 0 && (
          <div className="text-center py-8 text-gray-500 text-sm border border-gray-300 rounded-md bg-gray-50">
            No items. Click "{addButtonLabel}" to add one.
          </div>
        )}
      </div>

      {/* Hidden input for form submission */}
      <input
        type="hidden"
        id={fieldId}
        name={fieldName}
        value={JSON.stringify(repeaterValue)}
        required={required && repeaterValue.length >= minItems}
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

