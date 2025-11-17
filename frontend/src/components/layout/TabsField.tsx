import React, { useState } from 'react'
import { BaseFieldProps, FormField } from '@/types'
import { cn } from '@/lib/utils'
import { FormRenderer } from '@/components/forms/FormRenderer'

export interface TabsFieldProps extends BaseFieldProps {
  fieldType: 'tabs' | 'tabs-field'
  tabs: Array<{ id: string; label: string; fields: FormField[] }>
  value?: Record<string, any> // Data organized by tab ID
  defaultValue?: Record<string, any>
  onChange?: (tabId: string, fieldName: string, value: any) => void
  onTabChange?: (tabId: string) => void
}

export function TabsField({
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
  tabs = [],
  onTabChange,
  className,
}: TabsFieldProps) {
  const [activeTab, setActiveTab] = useState(tabs[0]?.id || '')

  // Get field value
  const tabValue = value ?? defaultValue ?? {}

  // Handle tab change
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId)
    if (onTabChange) onTabChange(tabId)
  }

  // Handle field change within tab
  const handleFieldChange = (tabId: string, fieldName: string, fieldValue: any) => {
    if (onChange) {
      onChange(tabId, fieldName, fieldValue)
    }
  }

  // Merge styles
  const containerClassName = cn('mb-4', style?.containerClassName)

  if (hidden) {
    return null
  }

  const activeTabData = tabs.find((tab) => tab.id === activeTab)

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

      {/* Tabs */}
      <div className="border-b border-gray-300">
        <nav className="flex space-x-8" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleTabChange(tab.id)}
              disabled={disabled}
              className={cn(
                'py-4 px-1 border-b-2 font-medium text-sm transition-colors',
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
                disabled && 'opacity-50 cursor-not-allowed'
              )}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab content */}
      {activeTabData && (
        <div className="mt-4">
          <FormRenderer
            steps={[
              {
                stepId: `tab-${activeTabData.id}`,
                stepName: activeTabData.label,
                stepOrder: 0,
                fields: activeTabData.fields,
              },
            ]}
            formData={{
              [`tab-${activeTabData.id}`]: tabValue[activeTabData.id] || {},
            }}
            errors={{}}
            onChange={(stepId, fieldName, fieldValue) =>
              handleFieldChange(activeTabData.id, fieldName, fieldValue)
            }
            onBlur={onBlur}
          />
        </div>
      )}

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

