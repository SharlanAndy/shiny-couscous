import React, { useState, useRef, useEffect } from 'react'
import { BaseFieldProps } from '@/types'
import { cn } from '@/lib/utils'

export interface CameraCaptureFieldProps extends BaseFieldProps {
  fieldType: 'upload-camera' | 'camera-capture'
  value?: string // Base64 image or file URL
  defaultValue?: string
  maxFileSize?: number // Maximum file size in bytes
  imageQuality?: number // 0-1 for compression
}

export function CameraCaptureField({
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
  maxFileSize = 5 * 1024 * 1024, // 5MB default
  imageQuality = 0.8,
  className,
}: CameraCaptureFieldProps) {
  const [isStreaming, setIsStreaming] = useState(false)
  const [capturedImage, setCapturedImage] = useState<string | null>(value ?? defaultValue ?? null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  // Start camera
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }, // Use rear camera on mobile
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setIsStreaming(true)
      }
    } catch (error) {
      console.error('Error accessing camera:', error)
      alert('Unable to access camera. Please ensure camera permissions are granted.')
    }
  }

  // Stop camera
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    setIsStreaming(false)
  }

  // Capture photo
  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')

    if (!context) return

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    // Draw video frame to canvas
    context.drawImage(video, 0, 0)

    // Convert to blob and compress
    canvas.toBlob(
      (blob) => {
        if (!blob) return

        // Check file size
        if (blob.size > maxFileSize) {
          alert(`Image size (${(blob.size / 1024 / 1024).toFixed(2)}MB) exceeds maximum size (${(maxFileSize / 1024 / 1024).toFixed(0)}MB)`)
          return
        }

        // Convert to base64
        const reader = new FileReader()
        reader.onloadend = () => {
          const base64 = reader.result as string
          setCapturedImage(base64)
          onChange(base64)
          stopCamera()
        }
        reader.readAsDataURL(blob)
      },
      'image/jpeg',
      imageQuality
    )
  }

  // Handle file input (fallback if camera not available)
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }

    if (file.size > maxFileSize) {
      alert(`File size (${(file.size / 1024 / 1024).toFixed(2)}MB) exceeds maximum size (${(maxFileSize / 1024 / 1024).toFixed(0)}MB)`)
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      const base64 = reader.result as string
      setCapturedImage(base64)
      onChange(base64)
    }
    reader.readAsDataURL(file)
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [])

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

      {/* Captured image preview */}
      {capturedImage && !isStreaming && (
        <div className="mb-4 relative">
          <img
            src={capturedImage}
            alt="Captured"
            className="w-full max-w-md mx-auto border border-gray-300 rounded-md"
          />
          {!readonly && (
            <button
              type="button"
              onClick={() => {
                setCapturedImage(null)
                onChange('')
              }}
              disabled={disabled}
              className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
              aria-label="Remove image"
            >
              ×
            </button>
          )}
        </div>
      )}

      {/* Camera video */}
      {isStreaming && (
        <div className="mb-4 relative">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full max-w-md mx-auto border border-gray-300 rounded-md"
          />
          <canvas ref={canvasRef} className="hidden" />
          <div className="flex justify-center mt-4 space-x-2">
            <button
              type="button"
              onClick={capturePhoto}
              disabled={disabled}
              className="btn btn-primary"
            >
              📷 Capture Photo
            </button>
            <button
              type="button"
              onClick={stopCamera}
              disabled={disabled}
              className="btn btn-secondary"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Controls */}
      {!readonly && !capturedImage && !isStreaming && (
        <div className="space-y-2">
          <button
            type="button"
            onClick={startCamera}
            disabled={disabled}
            className={cn(
              'btn btn-primary w-full',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
          >
            📷 Open Camera
          </button>
          <div className="text-center text-sm text-gray-500">or</div>
          <input
            id={`${fieldId}-file`}
            type="file"
            accept="image/*"
            onChange={handleFileInput}
            onBlur={onBlur}
            onFocus={onFocus}
            disabled={disabled}
            className="input"
          />
        </div>
      )}

      {/* Hidden input for form submission */}
      <input
        type="hidden"
        id={fieldId}
        name={fieldName}
        value={capturedImage || ''}
        required={required && !capturedImage}
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

