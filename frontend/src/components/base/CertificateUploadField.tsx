import React, { useState } from 'react'
import { BaseFieldProps } from '@/types'
import { cn } from '@/lib/utils'
import { useToast } from '@/components/ui/ToastProvider'

export interface CertificateUploadFieldProps extends BaseFieldProps {
  fieldType: 'upload-certificate' | 'certificate-upload'
  value?: string[] // Array of uploaded file IDs
  defaultValue?: string[]
  maxFileSize?: number // Maximum file size in bytes (default: 5MB)
  allowedFormats?: string[] // Default: ['pdf', 'jpg', 'jpeg', 'png']
  multiple?: boolean
}

const DEFAULT_ALLOWED_FORMATS = ['pdf', 'jpg', 'jpeg', 'png']

export function CertificateUploadField({
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
  maxFileSize = 5 * 1024 * 1024, // 5MB default
  allowedFormats = DEFAULT_ALLOWED_FORMATS,
  multiple = false,
  className,
}: CertificateUploadFieldProps) {
  const [uploadedFiles, setUploadedFiles] = useState<string[]>(value ?? defaultValue ?? [])
  const [uploading, setUploading] = useState(false)
  const { showError } = useToast()

  // Handle file selection
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const fileArray = Array.from(files)
    const newFiles: string[] = []

    for (const file of fileArray) {
      // Validate file type
      const extension = file.name.split('.').pop()?.toLowerCase() || ''
      if (!allowedFormats.includes(extension)) {
        showError(`File ${file.name} has invalid format. Allowed formats: ${allowedFormats.join(', ')}`, 'Invalid File Format')
        continue
      }

      // Validate file size
      if (file.size > maxFileSize) {
        showError(`File ${file.name} exceeds maximum size of ${(maxFileSize / 1024 / 1024).toFixed(0)}MB`, 'File Too Large')
        continue
      }

      setUploading(true)
      try {
        // TODO: Replace with actual API endpoint
        // const response = await apiClient.uploadFile(file, fieldName)
        // Simulate upload
        const fileId = `cert-${Date.now()}-${file.name}`
        newFiles.push(fileId)
      } catch (error) {
        console.error('Error uploading file:', error)
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
        showError(`Error uploading file ${file.name}: ${errorMessage}`, 'Upload Failed')
      } finally {
        setUploading(false)
      }
    }

    const updatedFiles = multiple ? [...uploadedFiles, ...newFiles] : newFiles
    setUploadedFiles(updatedFiles)
    onChange(updatedFiles)

    // Reset input
    if (e.target) {
      e.target.value = ''
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
              className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-md"
            >
              <div className="flex items-center space-x-3">
                <span className="text-green-600 text-lg">📜</span>
                <div>
                  <div className="text-sm font-medium text-gray-900">{fileId}</div>
                  <div className="text-xs text-gray-500">Certificate uploaded</div>
                </div>
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
            id={fieldId}
            name={fieldName}
            type="file"
            onChange={handleFileSelect}
            onBlur={onBlur}
            onFocus={onFocus}
            required={required && uploadedFiles.length === 0}
            disabled={disabled || uploading}
            multiple={multiple}
            accept={allowedFormats.map((f) => `.${f}`).join(',')}
            className="hidden"
            aria-invalid={!!error}
            aria-describedby={error ? `${fieldId}-error` : helpText ? `${fieldId}-help` : undefined}
          />
          <label
            htmlFor={fieldId}
            className={cn(
              'block w-full p-4 border-2 border-dashed border-green-300 rounded-md text-center cursor-pointer hover:border-green-400 transition-colors bg-green-50',
              disabled && 'opacity-50 cursor-not-allowed',
              uploading && 'cursor-wait'
            )}
          >
            {uploading ? (
              <span className="text-gray-600">Uploading certificate... Please wait</span>
            ) : (
              <>
                <span className="text-lg">📜</span>
                <div className="mt-2 text-sm text-gray-600">
                  {placeholder || 'Click to upload certificate or drag and drop'}
                </div>
                <div className="mt-1 text-xs text-gray-500">
                  Allowed formats: {allowedFormats.join(', ').toUpperCase()}
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
          {helpText || 'Upload certificates in PDF, JPG, or PNG format. Maximum file size is 5MB.'}
        </p>
      )}
    </div>
  )
}

