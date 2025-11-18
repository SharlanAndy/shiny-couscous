import React, { useState } from 'react'
import { BaseFieldProps } from '@/types'
import { cn } from '@/lib/utils'
import { useToast } from '@/components/ui/ToastProvider'

export interface CloudUploadFieldProps extends BaseFieldProps {
  fieldType: 'upload-cloud' | 'cloud-upload'
  value?: string[] // Array of uploaded file URLs
  defaultValue?: string[]
  maxFileSize?: number // Maximum file size in bytes
  allowedExtensions?: string[]
  multiple?: boolean
  storageProvider?: 's3' | 'azure' | 'gcp' | 'auto'
  bucketName?: string
}

export function CloudUploadField({
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
  maxFileSize = 100 * 1024 * 1024, // 100MB default
  allowedExtensions = [],
  multiple = false,
  storageProvider = 'auto',
  bucketName,
  className,
}: CloudUploadFieldProps) {
  const [uploadedFiles, setUploadedFiles] = useState<string[]>(value ?? defaultValue ?? [])
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({})
  const { showError } = useToast()

  // Handle file selection
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const fileArray = Array.from(files)

    for (const file of fileArray) {
      // Validate file size
      if (file.size > maxFileSize) {
        showError(`File ${file.name} exceeds maximum size of ${(maxFileSize / 1024 / 1024).toFixed(0)}MB`, 'File Too Large')
        continue
      }

      // Validate extension
      const extension = '.' + file.name.split('.').pop()?.toLowerCase()
      if (allowedExtensions.length > 0 && !allowedExtensions.includes(extension)) {
        showError(`File ${file.name} has invalid extension. Allowed: ${allowedExtensions.join(', ')}`, 'Invalid File Extension')
        continue
      }

      // Upload to cloud storage
      await uploadToCloud(file)
    }

    // Reset input
    if (e.target) {
      e.target.value = ''
    }
  }

  // Upload file to cloud storage
  const uploadToCloud = async (file: File) => {
    setUploading(true)
    const fileId = `${Date.now()}-${file.name}`

    try {
      // TODO: Replace with actual cloud storage API
      // For now, simulate cloud upload with progress
      const formData = new FormData()
      formData.append('file', file)
      formData.append('storageProvider', storageProvider)
      if (bucketName) {
        formData.append('bucketName', bucketName)
      }

      // Simulate upload progress
      for (let progress = 0; progress <= 100; progress += 20) {
        setUploadProgress((prev) => ({ ...prev, [fileId]: progress }))
        await new Promise((resolve) => setTimeout(resolve, 300))
      }

      // TODO: Get actual cloud URL from response
      // const response = await apiClient.client.post('/api/files/upload-cloud', formData)
      // const cloudUrl = response.data.url

      const cloudUrl = `https://storage.${storageProvider}.com/${bucketName || 'default'}/${file.name}`
      const newFiles = multiple ? [...uploadedFiles, cloudUrl] : [cloudUrl]
      setUploadedFiles(newFiles)
      onChange(newFiles)
      setUploadProgress((prev) => {
        const updated = { ...prev }
        delete updated[fileId]
        return updated
      })
    } catch (error) {
      console.error('Error uploading to cloud:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      showError(`Error uploading file ${file.name} to cloud storage: ${errorMessage}`, 'Cloud Upload Failed')
    } finally {
      setUploading(false)
    }
  }

  // Handle remove file
  const handleRemoveFile = (fileUrl: string) => {
    if (readonly || disabled) return
    const newFiles = uploadedFiles.filter((url) => url !== fileUrl)
    setUploadedFiles(newFiles)
    onChange(newFiles)
  }

  // Get file name from URL
  const getFileName = (url: string): string => {
    try {
      return decodeURIComponent(url.split('/').pop() || 'file')
    } catch {
      return 'file'
    }
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
          {uploadedFiles.map((fileUrl, index) => {
            const fileName = getFileName(fileUrl)
            const progress = uploadProgress[fileUrl] || 100

            return (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-md"
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-blue-600 text-lg">☁️</span>
                    <div>
                      <div className="text-sm font-medium text-gray-900">{fileName}</div>
                      <div className="text-xs text-blue-600">{fileUrl}</div>
                    </div>
                  </div>
                  {progress < 100 && (
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <div className="text-xs text-gray-500 mt-1">{progress}% uploaded</div>
                    </div>
                  )}
                </div>
                {!readonly && (
                  <div className="ml-4 flex items-center space-x-2">
                    <a
                      href={fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:text-primary-dark font-medium"
                    >
                      View
                    </a>
                    <button
                      type="button"
                      onClick={() => handleRemoveFile(fileUrl)}
                      disabled={disabled}
                      className="text-sm text-error hover:text-red-700 font-medium"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>
            )
          })}
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
            accept={allowedExtensions.join(',')}
            className="hidden"
            aria-invalid={!!error}
            aria-describedby={error ? `${fieldId}-error` : helpText ? `${fieldId}-help` : undefined}
          />
          <label
            htmlFor={fieldId}
            className={cn(
              'block w-full p-4 border-2 border-dashed border-blue-300 rounded-md text-center cursor-pointer hover:border-blue-400 transition-colors bg-blue-50',
              disabled && 'opacity-50 cursor-not-allowed',
              uploading && 'cursor-wait'
            )}
          >
            {uploading ? (
              <span className="text-gray-600">Uploading to cloud... Please wait</span>
            ) : (
              <>
                <span className="text-lg">☁️</span>
                <div className="mt-2 text-sm text-gray-600">
                  {placeholder || 'Click to upload to cloud storage or drag and drop'}
                </div>
                <div className="mt-1 text-xs text-gray-500">
                  Storage: {storageProvider.toUpperCase()} {bucketName && `(${bucketName})`}
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
          {helpText || 'Files will be uploaded directly to cloud storage (S3, Azure, or GCP).'}
        </p>
      )}
    </div>
  )
}

