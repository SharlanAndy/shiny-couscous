import React, { useState, KeyboardEvent } from 'react'
import { BaseFieldProps } from '@/types'
import { cn } from '@/lib/utils'

export interface TagsFieldProps extends BaseFieldProps {
  fieldType: 'tags' | 'tags-input'
  value?: string[]
  defaultValue?: string[]
  placeholder?: string
  maxTags?: number
  suggestions?: string[]
}

export function TagsField({
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
  placeholder = 'Type and press Enter',
  helpText,
  tooltip,
  validation,
  error,
  style,
  maxTags,
  suggestions = [],
  className,
}: TagsFieldProps) {
  // Get field value
  const tags = value ?? defaultValue ?? []
  const [inputValue, setInputValue] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)

  // Filter suggestions
  const filteredSuggestions = suggestions.filter(
    (suggestion) =>
      suggestion.toLowerCase().includes(inputValue.toLowerCase()) &&
      !tags.includes(suggestion)
  )

  // Handle add tag
  const addTag = (tag: string) => {
    if (!tag.trim()) return
    if (maxTags && tags.length >= maxTags) return
    if (tags.includes(tag.trim())) return

    const newTags = [...tags, tag.trim()]
    onChange(newTags)
    setInputValue('')
    setShowSuggestions(false)
  }

  // Handle remove tag
  const removeTag = (tagToRemove: string) => {
    const newTags = tags.filter((tag) => tag !== tagToRemove)
    onChange(newTags)
  }

  // Handle input key down
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault()
      addTag(inputValue)
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      removeTag(tags[tags.length - 1])
    }
  }

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
    if (suggestions.length > 0) {
      setShowSuggestions(true)
    }
  }

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: string) => {
    addTag(suggestion)
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

      {/* Tags container */}
      <div
        className={cn(
          'flex flex-wrap items-center gap-2 p-2 border border-gray-300 rounded-md min-h-[42px]',
          'focus-within:ring-2 focus-within:ring-primary focus-within:border-transparent',
          error && 'border-error',
          disabled && 'opacity-50 cursor-not-allowed bg-gray-50',
          readonly && 'bg-gray-50 cursor-default',
          style?.className,
          className
        )}
        onClick={() => !disabled && !readonly && document.getElementById(fieldId)?.focus()}
      >
        {/* Tags */}
        {tags.map((tag, index) => (
          <span
            key={index}
            className="inline-flex items-center px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium"
          >
            {tag}
            {!readonly && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  removeTag(tag)
                }}
                disabled={disabled}
                className="ml-2 text-primary hover:text-primary-dark"
                aria-label={`Remove ${tag}`}
              >
                ×
              </button>
            )}
          </span>
        ))}

        {/* Input */}
        <input
          id={fieldId}
          name={fieldName}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onBlur={() => {
            setTimeout(() => setShowSuggestions(false), 200) // Delay to allow click on suggestion
            if (onBlur) onBlur()
          }}
          onFocus={() => {
            if (suggestions.length > 0) setShowSuggestions(true)
            if (onFocus) onFocus()
          }}
          placeholder={tags.length === 0 ? placeholder : ''}
          disabled={disabled}
          readOnly={readonly}
          className="flex-1 min-w-[120px] outline-none bg-transparent"
          aria-invalid={!!error}
          aria-describedby={error ? `${fieldId}-error` : helpText ? `${fieldId}-help` : undefined}
        />
      </div>

      {/* Suggestions dropdown */}
      {showSuggestions && filteredSuggestions.length > 0 && (
        <div className="mt-1 border border-gray-200 rounded-md shadow-lg bg-white max-h-48 overflow-y-auto z-10">
          {filteredSuggestions.map((suggestion, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleSuggestionClick(suggestion)}
              className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}

      {/* Hidden input for form submission */}
      <input type="hidden" name={fieldName} value={JSON.stringify(tags)} />

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

