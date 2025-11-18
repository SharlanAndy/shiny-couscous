import React, { useState } from 'react'
import { BaseFieldProps } from '@/types'
import { cn } from '@/lib/utils'
import { useToast } from '@/components/ui/ToastProvider'

export interface FormAttachmentFieldProps extends BaseFieldProps {
  fieldType: 'upload-attachment' | 'form-attachment'
  value?: string[] // Array of uploaded file IDs
  defaultValue?: string[]
  maxFileSize?: number // Maximum file size in bytes (default: 10MB)
  allowedExtensions?: string[] // If empty, all file types allowed
  multiple?: boolean
  attachmentTypes?: string[] // e.g., ['supporting-document', 'evidence', 'reference']
}

const DEFAULT_ALLOWED_EXTENSIONS: string[] = [] // Empty = all types allowed

export function FormAttachmentField({
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
  maxFileSize = 10 * 1024 * 1024, // 10MB default
  allowedExtensions = DEFAULT_ALLOWED_EXTENSIONS,
  multiple = true,
  attachmentTypes,
  className,
}: FormAttachmentFieldProps) {
  const [uploadedFiles, setUploadedFiles] = useState<string[]>(value ?? defaultValue ?? [])
  const [uploading, setUploading] = useState(false)
  const [selectedAttachmentType, setSelectedAttachmentType] = useState<string>(
    attachmentTypes?.[0] || ''
  )
  const { showError } = useToast()

  // Handle file selection
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const fileArray = Array.from(files)
    const newFiles: string[] = []

    for (const file of fileArray) {
      // Validate file type
      if (allowedExtensions.length > 0) {
        const extension = '.' + file.name.split('.').pop()?.toLowerCase()
        if (!allowedExtensions.includes(extension)) {
          showError(`File ${file.name} has invalid format. Allowed formats: ${allowedExtensions.join(', ')}`, 'Invalid File Format')
          continue
        }
      }

      // Validate file size
      if (file.size > maxFileSize) {
        showError(`File ${file.name} exceeds maximum size of ${(maxFileSize / 1024 / 1024).toFixed(0)}MB`, 'File Too Large')
        continue
      }

      setUploading(true)
      try {
        // TODO: Replace with actual API endpoint
        // const response = await apiClient.uploadFile(file, fieldName, {
        //   attachmentType: selectedAttachmentType,
        // })
        // Simulate upload
        const fileId = `attachment-${Date.now()}-${file.name}`
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

  // Get file name from ID (in real app, would fetch from API)
  const getFileName = (fileId: string): string => {
    // Extract filename from ID if possible
    const match = fileId.match(/-([^/]+)$/)
    return match ? match[1] : fileId
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

      {/* Attachment Type Selector */}
      {attachmentTypes && attachmentTypes.length > 0 && (
        <div className="mb-3">
          <select
            value={selectedAttachmentType}
            onChange={(e) => setSelectedAttachmentType(e.target.value)}
            disabled={disabled}
            className="input"
          >
            {attachmentTypes.map((type) => (
              <option key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1).replace(/-/g, ' ')}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Uploaded files */}
      {uploadedFiles.length > 0 && (
        <div className="mb-4 space-y-2">
          {uploadedFiles.map((fileId) => (
            <div
              key={fileId}
              className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-md"
            >
              <div className="flex items-center space-x-3">
                <span className="text-gray-600 text-lg">📎</span>
                <div>
                  <div className="text-sm font-medium text-gray-900">{getFileName(fileId)}</div>
                  {selectedAttachmentType && (
                    <div className="text-xs text-gray-500">{selectedAttachmentType}</div>
                  )}
                </div>
              </div>
              {!readonly && (
                <button
                  type="button"
                  onClick={() => handleRemoveFile(fileId)}
                  disabled={disabled}
                  className="text-sm text-error hover:text-red-700 font-medium"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* File input */}
      {!readonly && (
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
            accept={allowedExtensions.length > 0 ? allowedExtensions.join(',') : undefined}
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
              <span className="text-gray-600">Uploading attachment... Please wait</span>
            ) : (
              <>
                <span className="text-lg">📎</span>
                <div className="mt-2 text-sm text-gray-600">
                  {placeholder || 'Click to upload attachment or drag and drop'}
                </div>
                {allowedExtensions.length > 0 && (
                  <div className="mt-1 text-xs text-gray-500">
                    Allowed formats: {allowedExtensions.join(', ').toUpperCase()}
                  </div>
                )}
                <div className="mt-1 text-xs text-gray-500">
                  Maximum file size: {(maxFileSize / 1024 / 1024).toFixed(0)}MB
                </div>
                {multiple && (
                  <div className="mt-1 text-xs text-gray-500">You can upload multiple files</div>
                )}
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
          {helpText || 'Upload any supporting documents or attachments. All file types are accepted unless specified.'}
        </p>
      )}
    </div>
  )
}

