import React, { useState } from 'react'
import { BaseFieldProps } from '@/types'
import { cn } from '@/lib/utils'

export interface RangeSliderFieldProps extends BaseFieldProps {
  fieldType: 'range-slider' | 'slider'
  min?: number
  max?: number
  step?: number
  unit?: string
  showValue?: boolean
  value?: number
  defaultValue?: number
}

export function RangeSliderField({
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
  min = 0,
  max = 100,
  step = 1,
  unit = '',
  showValue = true,
  className,
}: RangeSliderFieldProps) {
  // Get field value
  const fieldValue = value ?? defaultValue ?? min

  // Handle change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value)
    onChange(newValue)
  }

  // Merge styles
  const containerClassName = cn('mb-4', style?.containerClassName)
  const sliderClassName = cn(
    'w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer',
    'accent-primary',
    disabled && 'opacity-50 cursor-not-allowed',
    readonly && 'cursor-default',
    style?.className,
    className
  )

  // Calculate percentage for visual feedback
  const percentage = ((fieldValue - min) / (max - min)) * 100

  if (hidden) {
    return null
  }

  return (
    <div className={containerClassName}>
      <label
        htmlFor={fieldId}
        className={cn('label text-xs sm:text-sm', required && 'label-required', style?.labelClassName)}
      >
        {label}
        {showValue && (
          <span className="ml-1 sm:ml-2 text-primary font-medium text-xs sm:text-sm whitespace-nowrap">
            {fieldValue}
            {unit}
          </span>
        )}
        {tooltip && (
          <span className="ml-1 text-gray-400" title={tooltip}>
            ℹ️
          </span>
        )}
      </label>
      <div className="relative">
        <input
          id={fieldId}
          name={fieldName}
          type="range"
          min={validation?.min ?? min}
          max={validation?.max ?? max}
          step={step}
          value={fieldValue}
          onChange={handleChange}
          onBlur={onBlur}
          onFocus={onFocus}
          required={required}
          disabled={disabled}
          readOnly={readonly}
          className={sliderClassName}
          style={style?.style}
          aria-invalid={!!error}
          aria-describedby={error ? `${fieldId}-error` : helpText ? `${fieldId}-help` : undefined}
        />
        {/* Value indicators */}
        <div className="flex justify-between text-[10px] sm:text-xs text-gray-500 mt-1">
          <span className="whitespace-nowrap">{min}{unit}</span>
          <span className="whitespace-nowrap">{max}{unit}</span>
        </div>
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

