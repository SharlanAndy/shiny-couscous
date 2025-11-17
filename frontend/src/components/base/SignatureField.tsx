import React, { useRef, useState, useEffect } from 'react'
import { BaseFieldProps } from '@/types'
import { cn } from '@/lib/utils'

export interface SignatureFieldProps extends BaseFieldProps {
  fieldType: 'signature' | 'signature-pad'
  width?: number
  height?: number
  backgroundColor?: string
  penColor?: string
  showClear?: boolean
  value?: string // Base64 image data
  defaultValue?: string
}

export function SignatureField({
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
  width = 400,
  height = 200,
  backgroundColor = '#FFFFFF',
  penColor = '#000000',
  showClear = true,
  className,
}: SignatureFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [hasSignature, setHasSignature] = useState(false)

  // Get field value
  const signatureValue = value ?? defaultValue ?? ''

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    canvas.width = width
    canvas.height = height

    // Set background
    ctx.fillStyle = backgroundColor
    ctx.fillRect(0, 0, width, height)

    // Load existing signature if present
    if (signatureValue) {
      const img = new Image()
      img.onload = () => {
        ctx.drawImage(img, 0, 0, width, height)
        setHasSignature(true)
      }
      img.src = signatureValue
    }
  }, [signatureValue, width, height, backgroundColor])

  // Start drawing
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (disabled || readonly) return

    setIsDrawing(true)
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top

    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.strokeStyle = penColor
    ctx.lineWidth = 2
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    if (onFocus) onFocus()
  }

  // Draw
  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || disabled || readonly) return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top

    ctx.lineTo(x, y)
    ctx.stroke()

    // Convert to base64 and update
    const base64 = canvas.toDataURL('image/png')
    onChange(base64)
    setHasSignature(true)
  }

  // Stop drawing
  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false)
      if (onBlur) onBlur()
    }
  }

  // Clear signature
  const clearSignature = () => {
    if (disabled || readonly) return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.fillStyle = backgroundColor
    ctx.fillRect(0, 0, width, height)

    onChange('')
    setHasSignature(false)
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
      <div className="relative inline-block border-2 border-gray-300 rounded-md overflow-hidden">
        <canvas
          ref={canvasRef}
          id={fieldId}
          width={width}
          height={height}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className={cn(
            'cursor-crosshair',
            disabled && 'opacity-50 cursor-not-allowed',
            readonly && 'cursor-default'
          )}
          style={{ backgroundColor, touchAction: 'none' }}
          aria-label="Signature pad"
          aria-invalid={!!error}
        />
        {showClear && hasSignature && !readonly && (
          <button
            type="button"
            onClick={clearSignature}
            disabled={disabled}
            className="absolute top-2 right-2 px-3 py-1 bg-white border border-gray-300 rounded-md text-sm hover:bg-gray-50 disabled:opacity-50"
          >
            Clear
          </button>
        )}
      </div>
      <input
        type="hidden"
        name={fieldName}
        value={signatureValue}
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

