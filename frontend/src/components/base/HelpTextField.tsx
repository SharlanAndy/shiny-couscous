import React from 'react'
import { BaseFieldProps } from '@/types'
import { cn } from '@/lib/utils'

export interface HelpTextFieldProps extends BaseFieldProps {
  fieldType: 'help-text' | 'help-text-field'
  content: string // Help text content (supports HTML)
  format?: 'plain' | 'html' | 'markdown'
  icon?: string
  position?: 'above' | 'below' | 'inline'
}

export function HelpTextField({
  fieldId,
  fieldName,
  fieldType,
  label,
  content,
  format = 'plain',
  icon = 'ℹ️',
  position = 'below',
  helpText,
  tooltip,
  error,
  style,
  hidden,
  className,
}: HelpTextFieldProps) {
  // Merge styles
  const containerClassName = cn('mb-4', style?.containerClassName)
  const helpClassName = cn(
    'text-sm text-gray-600 flex items-start space-x-2',
    position === 'inline' && 'inline-flex',
    style?.className,
    className
  )

  if (hidden || !content) {
    return null
  }

  // Render content based on format
  const renderContent = () => {
    switch (format) {
      case 'html':
        return <div dangerouslySetInnerHTML={{ __html: content }} />
      case 'markdown':
        // TODO: Add markdown rendering library if needed
        return <div>{content}</div>
      default:
        return <div>{content}</div>
    }
  }

  return (
    <div className={containerClassName}>
      {label && position === 'above' && (
        <label
          htmlFor={fieldId}
          className={cn(
            'label font-bold text-lg mb-3',
            label === 'IMPORTANT NOTES' && 'text-red-600',
            style?.labelClassName
          )}
        >
          {label}
          {tooltip && (
            <span className="ml-1 text-gray-400" title={tooltip}>
              ℹ️
            </span>
          )}
        </label>
      )}
      <div className={helpClassName} id={fieldId}>
        {icon && <span className="text-gray-400 flex-shrink-0">{icon}</span>}
        <div className="flex-1">{renderContent()}</div>
      </div>
      {label && position === 'below' && (
        <label
          htmlFor={fieldId}
          className={cn(
            'label mt-2 font-bold',
            label === 'IMPORTANT NOTES' && 'text-red-600',
            style?.labelClassName
          )}
        >
          {label}
        </label>
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

