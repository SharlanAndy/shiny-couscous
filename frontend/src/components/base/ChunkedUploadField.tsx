import React, { useState, useRef } from 'react'
import { BaseFieldProps } from '@/types'
import { cn } from '@/lib/utils'

export interface ChunkedUploadFieldProps extends BaseFieldProps {
  fieldType: 'upload-chunked' | 'chunked-upload'
  chunkSize?: number // Size in bytes (default: 1MB)
  maxFileSize?: number // Maximum file size in bytes
  allowedExtensions?: string[]
  value?: string[] // Array of uploaded file IDs
  defaultValue?: string[]
  multiple?: boolean
}

export function ChunkedUploadField({
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
  chunkSize = 1024 * 1024, // 1MB default
  maxFileSize = 100 * 1024 * 1024, // 100MB default
  allowedExtensions = [],
  multiple = false,
  className,
}: ChunkedUploadFieldProps) {
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({})
  const [uploadedFiles, setUploadedFiles] = useState<string[]>(value ?? defaultValue ?? [])
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Handle file selection
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const fileArray = Array.from(files)

    for (const file of fileArray) {
      // Validate file size
      if (file.size > maxFileSize) {
        alert(`File ${file.name} exceeds maximum size of ${(maxFileSize / 1024 / 1024).toFixed(0)}MB`)
        continue
      }

      // Validate extension
      const extension = '.' + file.name.split('.').pop()?.toLowerCase()
      if (allowedExtensions.length > 0 && !allowedExtensions.includes(extension)) {
        alert(`File ${file.name} has invalid extension. Allowed: ${allowedExtensions.join(', ')}`)
        continue
      }

      // Upload file in chunks
      await uploadFileInChunks(file)
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Upload file in chunks
  const uploadFileInChunks = async (file: File) => {
    setUploading(true)
    const fileId = `${Date.now()}-${file.name}`
    const totalChunks = Math.ceil(file.size / chunkSize)
    const chunks: Blob[] = []

    // Split file into chunks
    for (let i = 0; i < totalChunks; i++) {
      const start = i * chunkSize
      const end = Math.min(start + chunkSize, file.size)
      chunks.push(file.slice(start, end))
    }

    // Upload each chunk
    try {
      for (let i = 0; i < chunks.length; i++) {
        const formData = new FormData()
        formData.append('file', chunks[i])
        formData.append('fileId', fileId)
        formData.append('chunkIndex', String(i))
        formData.append('totalChunks', String(totalChunks))
        formData.append('fileName', file.name)
        formData.append('fileSize', String(file.size))

        // TODO: Replace with actual API endpoint
        // const response = await fetch('/api/files/upload-chunk', {
        //   method: 'POST',
        //   body: formData,
        // })

        // Simulate upload progress
        const progress = ((i + 1) / totalChunks) * 100
        setUploadProgress((prev) => ({ ...prev, [fileId]: progress }))

        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 500))
      }

      // File uploaded successfully
      const newFiles = [...uploadedFiles, fileId]
      setUploadedFiles(newFiles)
      onChange(multiple ? newFiles : [fileId])
      setUploadProgress((prev) => {
        const updated = { ...prev }
        delete updated[fileId]
        return updated
      })
    } catch (error) {
      console.error('Error uploading file:', error)
      alert(`Error uploading file ${file.name}`)
    } finally {
      setUploading(false)
    }
  }

  // Handle remove file
  const handleRemoveFile = (fileId: string) => {
    if (readonly || disabled) return
    const newFiles = uploadedFiles.filter((id) => id !== fileId)
    setUploadedFiles(newFiles)
    onChange(newFiles)
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

      {/* Uploaded files */}
      {uploadedFiles.length > 0 && (
        <div className="mb-4 space-y-2">
          {uploadedFiles.map((fileId) => (
            <div
              key={fileId}
              className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-md"
            >
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900">{fileId}</div>
                {uploadProgress[fileId] !== undefined && (
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress[fileId]}%` }}
                      />
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {uploadProgress[fileId].toFixed(0)}% uploaded
                    </div>
                  </div>
                )}
              </div>
              {!readonly && (
                <button
                  type="button"
                  onClick={() => handleRemoveFile(fileId)}
                  disabled={disabled || uploading}
                  className={cn(
                    'ml-3 text-sm text-error hover:text-red-700 font-medium',
                    disabled && 'opacity-50 cursor-not-allowed'
                  )}
                >
                  Remove
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* File input */}
      {!readonly && (!multiple || uploadedFiles.length === 0) && (
        <div>
          <input
            ref={fileInputRef}
            id={fieldId}
            name={fieldName}
            type="file"
            onChange={handleFileSelect}
            onBlur={onBlur}
            onFocus={onFocus}
            required={required && uploadedFiles.length === 0}
            disabled={disabled || uploading}
            multiple={multiple}
            accept={allowedExtensions.join(',')}
            className="hidden"
            aria-invalid={!!error}
            aria-describedby={error ? `${fieldId}-error` : helpText ? `${fieldId}-help` : undefined}
          />
          <label
            htmlFor={fieldId}
            className={cn(
              'block w-full p-4 border-2 border-dashed border-gray-300 rounded-md text-center cursor-pointer hover:border-primary transition-colors',
              disabled && 'opacity-50 cursor-not-allowed',
              uploading && 'cursor-wait'
            )}
          >
            {uploading ? (
              <span className="text-gray-600">Uploading... Please wait</span>
            ) : (
              <>
                <span className="text-lg">📁</span>
                <div className="mt-2 text-sm text-gray-600">
                  {placeholder || 'Click to upload or drag and drop'}
                </div>
                <div className="mt-1 text-xs text-gray-500">
                  Maximum file size: {(maxFileSize / 1024 / 1024).toFixed(0)}MB
                </div>
              </>
            )}
          </label>
        </div>
      )}

      {/* Hidden input for form submission */}
      <input
        type="hidden"
        name={fieldName}
        value={JSON.stringify(uploadedFiles)}
        required={required && uploadedFiles.length === 0}
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

