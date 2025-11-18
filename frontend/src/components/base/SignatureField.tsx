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

    // Set canvas size (responsive)
    const containerWidth = canvas.parentElement?.clientWidth || width
    const responsiveWidth = Math.min(containerWidth - 32, width) // Account for padding
    const responsiveHeight = Math.round((responsiveWidth / width) * height)
    canvas.width = responsiveWidth
    canvas.height = responsiveHeight

    // Set background
    ctx.fillStyle = backgroundColor
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Load existing signature if present
    if (signatureValue) {
      const img = new Image()
      img.onload = () => {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        setHasSignature(true)
      }
      img.src = signatureValue
    }
  }, [signatureValue, width, height, backgroundColor])
  
  // Handle window resize for responsive canvas
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current
      if (!canvas) return

      const ctx = canvas.getContext('2d')
      if (!ctx) return

      const containerWidth = canvas.parentElement?.clientWidth || width
      const responsiveWidth = Math.min(containerWidth - 32, width)
      const responsiveHeight = Math.round((responsiveWidth / width) * height)
      
      if (canvas.width !== responsiveWidth || canvas.height !== responsiveHeight) {
        const currentImage = canvas.toDataURL('image/png')
        canvas.width = responsiveWidth
        canvas.height = responsiveHeight
        
        ctx.fillStyle = backgroundColor
        ctx.fillRect(0, 0, responsiveWidth, responsiveHeight)
        
        if (currentImage && currentImage !== canvas.toDataURL('image/png')) {
          const img = new Image()
          img.onload = () => {
            ctx.drawImage(img, 0, 0, responsiveWidth, responsiveHeight)
          }
          img.src = currentImage
        }
      }
    }
    
    window.addEventListener('resize', handleResize)
    handleResize() // Initial resize
    return () => window.removeEventListener('resize', handleResize)
  }, [width, height, backgroundColor])

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
    ctx.fillRect(0, 0, canvas.width, canvas.height)

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
      <div className="relative inline-block w-full border-2 border-gray-300 rounded-md overflow-hidden">
        <canvas
          ref={canvasRef}
          id={fieldId}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className={cn(
            'block w-full cursor-crosshair touch-none',
            disabled && 'opacity-50 cursor-not-allowed',
            readonly && 'cursor-default'
          )}
          style={{
            maxWidth: '100%',
            height: 'auto',
            minHeight: '150px',
            touchAction: 'none',
            backgroundColor,
            ...style?.style,
          }}
          aria-label="Signature pad"
          aria-invalid={!!error}
        />
        {showClear && hasSignature && !readonly && (
          <button
            type="button"
            onClick={clearSignature}
            disabled={disabled}
            className="absolute top-1.5 sm:top-2 right-1.5 sm:right-2 px-2 py-1 bg-white border border-gray-300 rounded-md text-[10px] sm:text-xs hover:bg-gray-50 disabled:opacity-50 whitespace-nowrap"
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

