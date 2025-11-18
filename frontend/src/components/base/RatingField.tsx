import React, { useState } from 'react'
import { BaseFieldProps } from '@/types'
import { cn } from '@/lib/utils'

export interface RatingFieldProps extends BaseFieldProps {
  fieldType: 'rating' | 'star-rating'
  max?: number
  size?: 'sm' | 'md' | 'lg'
  value?: number
  defaultValue?: number
}

export function RatingField({
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
  max = 5,
  size = 'md',
  className,
}: RatingFieldProps) {
  // Get field value
  const fieldValue = value ?? defaultValue ?? 0
  const [hoverValue, setHoverValue] = useState<number | null>(null)

  // Handle star click
  const handleStarClick = (starValue: number) => {
    if (!disabled && !readonly) {
      onChange(starValue)
    }
  }

  // Handle star hover
  const handleStarHover = (starValue: number) => {
    if (!disabled && !readonly) {
      setHoverValue(starValue)
    }
  }

  // Handle mouse leave
  const handleMouseLeave = () => {
    setHoverValue(null)
  }

  // Size classes
  const sizeClasses = {
    sm: 'w-4 h-4 text-sm',
    md: 'w-6 h-6 text-base',
    lg: 'w-8 h-8 text-lg',
  }

  // Merge styles
  const containerClassName = cn('mb-4', style?.containerClassName)
  const ratingValue = hoverValue ?? fieldValue

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
      <div
        className={cn(
          'flex items-center gap-1 sm:space-x-1',
          disabled && 'opacity-50 cursor-not-allowed',
          readonly && 'cursor-default'
        )}
        onMouseLeave={handleMouseLeave}
      >
        {Array.from({ length: max }, (_, index) => {
          const starValue = index + 1
          const isFilled = starValue <= ratingValue
          const isHalfFilled = starValue === Math.ceil(ratingValue) && ratingValue % 1 !== 0

          return (
            <button
              key={starValue}
              type="button"
              onClick={() => handleStarClick(starValue)}
              onMouseEnter={() => handleStarHover(starValue)}
              onFocus={onFocus}
              onBlur={onBlur}
              disabled={disabled || readonly}
              className={cn(
                sizeClasses[size],
                'transition-colors duration-150 flex-shrink-0',
                !disabled && !readonly && 'cursor-pointer hover:scale-110',
                disabled && 'cursor-not-allowed',
                readonly && 'cursor-default'
              )}
              aria-label={`Rate ${starValue} out of ${max}`}
              aria-invalid={!!error}
            >
              {isFilled ? (
                <span className="text-warning">★</span>
              ) : isHalfFilled ? (
                <span className="text-warning">☆</span>
              ) : (
                <span className="text-gray-300">☆</span>
              )}
            </button>
          )
        })}
        {ratingValue > 0 && (
          <span className="ml-1 sm:ml-2 text-xs sm:text-sm text-gray-600 whitespace-nowrap">
            {ratingValue}/{max}
          </span>
        )}
      </div>
      <input
        type="hidden"
        id={fieldId}
        name={fieldName}
        value={fieldValue}
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

