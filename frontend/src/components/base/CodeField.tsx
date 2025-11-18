import React, { useState } from 'react'
import { BaseFieldProps } from '@/types'
import { cn } from '@/lib/utils'

export interface CodeFieldProps extends BaseFieldProps {
  fieldType: 'code' | 'code-editor'
  language?: string // Programming language (javascript, python, etc.)
  value?: string
  defaultValue?: string
  height?: number
  theme?: 'light' | 'dark'
}

export function CodeField({
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
  language = 'text',
  theme = 'light',
  height = 300,
  className,
}: CodeFieldProps) {
  // Get field value
  const codeValue = value ?? defaultValue ?? ''

  // Handle change
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value)
  }

  // Handle tab key for indentation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault()
      const textarea = e.currentTarget
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const newValue = codeValue.substring(0, start) + '  ' + codeValue.substring(end)
      
      onChange(newValue)
      
      // Reset cursor position
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2
      }, 0)
    }
  }

  // Merge styles
  const containerClassName = cn('mb-4', style?.containerClassName)
  const textareaClassName = cn(
    'input font-mono text-sm',
    theme === 'dark' && 'bg-gray-900 text-gray-100 border-gray-700',
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
    <div className={containerClassName}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 mb-2 sm:mb-3">
        <label
          htmlFor={fieldId}
          className={cn('label text-xs sm:text-sm', required && 'label-required', style?.labelClassName)}
        >
          {label}
          {tooltip && (
            <span className="ml-1 text-gray-400" title={tooltip}>
              ℹ️
            </span>
          )}
        </label>
        {language && language !== 'text' && (
          <span className="text-[10px] sm:text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded whitespace-nowrap self-start sm:self-auto">
            {language}
          </span>
        )}
      </div>
      <textarea
        id={fieldId}
        name={fieldName}
        value={codeValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onBlur={onBlur}
        onFocus={onFocus}
        placeholder={placeholder || `Enter ${language} code...`}
        required={required}
        disabled={disabled}
        readOnly={readonly}
        rows={Math.ceil(height / 24)}
        className={cn(textareaClassName, 'text-xs sm:text-sm')}
        style={{ minHeight: `${Math.max(height, 150)}px`, ...style?.style }}
        spellCheck={false}
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

