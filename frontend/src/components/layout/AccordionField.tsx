import React, { useState } from 'react'
import { BaseFieldProps, FormField } from '@/types'
import { cn } from '@/lib/utils'
import { FormRenderer } from '@/components/forms/FormRenderer'

export interface AccordionFieldProps extends BaseFieldProps {
  fieldType: 'accordion' | 'accordion-field'
  sections: Array<{ id: string; label: string; description?: string; fields: FormField[] }>
  value?: Record<string, any> // Data organized by section ID
  defaultValue?: Record<string, any>
  multiple?: boolean // Allow multiple sections open at once
  onChange?: (sectionId: string, fieldName: string, value: any) => void
}

export function AccordionField({
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
  sections = [],
  multiple = false,
  className,
}: AccordionFieldProps) {
  const [openSections, setOpenSections] = useState<string[]>([sections[0]?.id || ''])

  // Get field value
  const accordionValue = value ?? defaultValue ?? {}

  // Handle section toggle
  const toggleSection = (sectionId: string) => {
    if (disabled || readonly) return

    setOpenSections((prev) => {
      if (multiple) {
        return prev.includes(sectionId)
          ? prev.filter((id) => id !== sectionId)
          : [...prev, sectionId]
      } else {
        return prev.includes(sectionId) ? [] : [sectionId]
      }
    })
  }

  // Handle field change within section
  const handleFieldChange = (sectionId: string, fieldName: string, fieldValue: any) => {
    if (onChange) {
      onChange(sectionId, fieldName, fieldValue)
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

      {/* Accordion sections */}
      <div className="space-y-2">
        {sections.map((section) => {
          const isOpen = openSections.includes(section.id)

          return (
            <div key={section.id} className="border border-gray-300 rounded-md">
              {/* Section header */}
              <button
                type="button"
                onClick={() => toggleSection(section.id)}
                disabled={disabled || readonly}
                className={cn(
                  'w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-50 transition-colors',
                  isOpen && 'bg-gray-50',
                  disabled && 'opacity-50 cursor-not-allowed',
                  readonly && 'cursor-default'
                )}
              >
                <div>
                  <div className="font-medium text-gray-900">{section.label}</div>
                  {section.description && (
                    <div className="text-sm text-gray-500 mt-1">{section.description}</div>
                  )}
                </div>
                <span
                  className={cn(
                    'transform transition-transform',
                    isOpen ? 'rotate-180' : 'rotate-0'
                  )}
                >
                  ▼
                </span>
              </button>

              {/* Section content */}
              {isOpen && (
                <div className="px-4 py-4 border-t border-gray-200">
                  <FormRenderer
                    steps={[
                      {
                        stepId: `accordion-${section.id}`,
                        stepName: section.label,
                        stepOrder: 0,
                        fields: section.fields,
                      },
                    ]}
                    formData={{
                      [`accordion-${section.id}`]: accordionValue[section.id] || {},
                    }}
                    errors={{}}
                    onChange={(stepId, fieldName, fieldValue) =>
                      handleFieldChange(section.id, fieldName, fieldValue)
                    }
                    onBlur={onBlur}
                  />
                </div>
              )}
            </div>
          )
        })}
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
    </div>
  )
}

