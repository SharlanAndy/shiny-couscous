import React, { useState, useRef, useEffect } from 'react'
import { BaseFieldProps } from '@/types'
import { cn } from '@/lib/utils'

export interface ColorPickerFieldProps extends BaseFieldProps {
  fieldType: 'color-picker' | 'color-palette'
  palette?: string[]
  showInput?: boolean
}

export function ColorPickerField({
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
  palette,
  showInput = true,
  className,
}: ColorPickerFieldProps) {
  // Get field value
  const fieldValue = value ?? defaultValue ?? '#000000'
  const [showPalette, setShowPalette] = useState(false)
  const paletteRef = useRef<HTMLDivElement>(null)

  // Default color palette
  const defaultPalette = [
    '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF',
    '#FFFF00', '#FF00FF', '#00FFFF', '#808080', '#FFA500',
    '#800080', '#FFC0CB', '#A52A2A', '#000080', '#008000',
  ]

  const colorPalette = palette || defaultPalette

  // Handle color change
  const handleColorChange = (color: string) => {
    onChange(color)
    setShowPalette(false)
  }

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value)
  }

  // Close palette when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (paletteRef.current && !paletteRef.current.contains(event.target as Node)) {
        setShowPalette(false)
      }
    }

    if (showPalette) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showPalette])

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
      <div className="flex items-center space-x-2">
        {/* Color preview button */}
        <button
          type="button"
          onClick={() => !disabled && !readonly && setShowPalette(!showPalette)}
          disabled={disabled || readonly}
          className={cn(
            'w-12 h-12 border-2 border-gray-300 rounded-md cursor-pointer hover:border-primary transition-colors',
            disabled && 'opacity-50 cursor-not-allowed',
            readonly && 'cursor-default'
          )}
          style={{ backgroundColor: fieldValue }}
          aria-label="Select color"
        />

        {/* Color input */}
        {showInput && (
          <input
            id={fieldId}
            name={fieldName}
            type="color"
            value={fieldValue}
            onChange={handleInputChange}
            onBlur={onBlur}
            onFocus={onFocus}
            required={required}
            disabled={disabled}
            readOnly={readonly}
            className={cn(
              'input h-12 w-32 cursor-pointer',
              disabled && 'opacity-50 cursor-not-allowed',
              readonly && 'cursor-default',
              style?.className,
              className
            )}
            style={style?.style}
            aria-invalid={!!error}
            aria-describedby={error ? `${fieldId}-error` : helpText ? `${fieldId}-help` : undefined}
          />
        )}

        {/* Hex value display */}
        {showInput && (
          <input
            type="text"
            value={fieldValue}
            onChange={(e) => {
              // Validate hex color
              const hexPattern = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/
              if (hexPattern.test(e.target.value)) {
                onChange(e.target.value)
              }
            }}
            onBlur={onBlur}
            onFocus={onFocus}
            placeholder="#000000"
            disabled={disabled}
            readOnly={readonly}
            className="input w-24"
            maxLength={7}
          />
        )}

        {/* Color palette dropdown */}
        {showPalette && (
          <div
            ref={paletteRef}
            className="absolute z-10 mt-2 p-4 bg-white border border-gray-200 rounded-lg shadow-lg"
            style={{ marginTop: '3rem' }}
          >
            <div className="grid grid-cols-5 gap-2">
              {colorPalette.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => handleColorChange(color)}
                  className={cn(
                    'w-8 h-8 rounded border-2 border-gray-300 hover:border-primary hover:scale-110 transition-transform',
                    fieldValue === color && 'border-primary ring-2 ring-primary ring-offset-1'
                  )}
                  style={{ backgroundColor: color }}
                  aria-label={`Select color ${color}`}
                />
              ))}
            </div>
          </div>
        )}
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

