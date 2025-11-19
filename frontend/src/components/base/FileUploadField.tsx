import React, { useState, useRef, useCallback } from 'react'
import { BaseFieldProps } from '@/types'
import { cn, formatFileSize } from '@/lib/utils'
import apiClient from '@/api/client'
import { useToast } from '@/components/ui/ToastProvider'

export interface FileUploadFieldProps extends BaseFieldProps {
  fieldType: 'upload-document' | 'upload-image' | 'upload-file'
  multiple?: boolean
  accept?: string[]
  maxSize?: number // in bytes
  maxFiles?: number
  dragDrop?: boolean
  preview?: boolean
  progress?: boolean
}

export function FileUploadField({
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
  multiple = false,
  accept = [],
  maxSize = 10 * 1024 * 1024, // 10MB default
  maxFiles = 1,
  dragDrop = true,
  preview = true,
  progress = true,
  className,
}: FileUploadFieldProps) {
  console.log('[FileUploadField] Component rendered with fieldId:', fieldId, 'disabled:', disabled, 'readonly:', readonly, 'dragDrop:', dragDrop)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({})
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { showError, showWarning, showSuccess } = useToast()

  // Get current files (from value or defaultValue)
  const currentFiles = value ?? defaultValue ?? (multiple ? [] : null)
  const fileList = Array.isArray(currentFiles) ? currentFiles : currentFiles ? [currentFiles] : []

  // Handle file selection
  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return

    const fileArray = Array.from(files)

    // Validate number of files
    if (!multiple && fileArray.length > 1) {
      showError('Please select only one file', 'File Selection Error')
      return
    }

    if (fileArray.length + fileList.length > maxFiles) {
      showError(`Maximum ${maxFiles} file(s) allowed`, 'File Limit Exceeded')
      return
    }

    // Validate file types and sizes
    const validFiles: File[] = []
    for (const file of fileArray) {
      // Check file type
      if (accept.length > 0) {
        const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase()
        if (!accept.includes(fileExtension)) {
          showError(`File type not allowed for ${file.name}. Allowed types: ${accept.join(', ')}`, 'Invalid File Type')
          continue
        }
      }

      // Check file size
      if (file.size > maxSize) {
        showError(`File ${file.name} is too large. Maximum size: ${formatFileSize(maxSize)}`, 'File Too Large')
        continue
      }

      validFiles.push(file)
    }

    if (validFiles.length === 0) return

    // Upload files
    setUploading(true)
    const uploadedFiles: any[] = []

    for (const file of validFiles) {
      try {
        const fileId = `${Date.now()}-${file.name}`
        setUploadProgress((prev) => ({ ...prev, [fileId]: 0 }))

        const uploadResponse = await apiClient.uploadFile(
          file,
          fieldName,
          (progress) => {
            setUploadProgress((prev) => ({ ...prev, [fileId]: progress }))
          }
        )

        uploadedFiles.push({
          fileId: uploadResponse.id || uploadResponse.fileId,
          fileName: file.name,
          fileSize: file.size,
          fileUrl: uploadResponse.storageUrl || uploadResponse.file_path,
        })

        setUploadProgress((prev) => {
          const newPrev = { ...prev }
          delete newPrev[fileId]
          return newPrev
        })
      } catch (error) {
        console.error('File upload error:', error)
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
        showError(`Failed to upload ${file.name}: ${errorMessage}`, 'Upload Failed')
      }
    }

    // Update value
    if (multiple) {
      onChange([...fileList, ...uploadedFiles])
    } else {
      onChange(uploadedFiles[0] || null)
    }

    setUploading(false)
    if (onBlur) onBlur()
  }

  // Handle drag and drop
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setDragActive(false)

      if (disabled || readonly) return

      const files = e.dataTransfer.files
      handleFileSelect(files)
    },
    [disabled, readonly]
  )

  // Handle file input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files)
  }

  // Handle remove file
  const handleRemoveFile = (index: number) => {
    if (multiple) {
      const newFiles = [...fileList]
      newFiles.splice(index, 1)
      onChange(newFiles)
    } else {
      onChange(null)
    }
  }

  // Handle click on upload area
  const handleClick = () => {
    console.log('[FileUploadField] Upload area clicked')
    console.log('[FileUploadField] Disabled:', disabled, 'Readonly:', readonly)
    console.log('[FileUploadField] File input ref:', fileInputRef.current)
    console.log('[FileUploadField] File input disabled attribute:', fileInputRef.current?.disabled)
    
    if (!disabled && !readonly && fileInputRef.current && !fileInputRef.current.disabled) {
      console.log('[FileUploadField] Attempting to click file input...')
      // Click must happen synchronously within user interaction event
      try {
        // Ensure file input is in the DOM and accessible
        if (fileInputRef.current.isConnected) {
          fileInputRef.current.click()
          console.log('[FileUploadField] File input click() called successfully')
        } else {
          console.error('[FileUploadField] File input is not connected to DOM')
        }
      } catch (error) {
        console.error('[FileUploadField] Error clicking file input:', error)
      }
    } else {
      console.warn('[FileUploadField] Cannot click file input - conditions not met')
    }
  }

  // Merge styles
  const containerClassName = cn('mb-4', style?.containerClassName)
  const uploadAreaClassName = cn(
    'border-2 border-dashed rounded-lg p-4 sm:p-5 lg:p-6 text-center cursor-pointer transition-colors',
    dragActive ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-primary hover:bg-gray-50',
    disabled && 'opacity-50 cursor-not-allowed',
    readonly && 'bg-gray-100 cursor-default'
  )

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

      {/* File input (hidden) */}
      <input
        ref={fileInputRef}
        id={fieldId}
        name={fieldName}
        type="file"
        multiple={multiple}
        accept={accept.join(',')}
        onChange={handleInputChange}
        onBlur={onBlur}
        onFocus={onFocus}
        required={required && fileList.length === 0}
        disabled={disabled || readonly}
        style={{ position: 'absolute', width: 0, height: 0, opacity: 0 }}
        aria-invalid={!!error}
        aria-describedby={error ? `${fieldId}-error` : helpText ? `${fieldId}-help` : undefined}
      />

      {/* Upload area - only show if not readonly or no files */}
      {!readonly && (fileList.length === 0 || (multiple && fileList.length < maxFiles)) && (
        dragDrop ? (
          <div
            className={uploadAreaClassName}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={(e) => {
              console.log('[FileUploadField] Div onClick triggered (before handleClick)')
              handleClick()
            }}
            onMouseDown={(e) => {
              console.log('[FileUploadField] Div onMouseDown triggered')
            }}
          >
            <div className="space-y-2">
              <div className="text-2xl sm:text-3xl lg:text-4xl">📎</div>
              <div>
                <span className="text-primary font-medium">Click to upload</span> or drag and drop
              </div>
              <div className="text-sm text-gray-500">
                {accept.length > 0 && `Allowed types: ${accept.join(', ')}`}
                {maxSize && ` • Max size: ${formatFileSize(maxSize)}`}
                {multiple && maxFiles > 1 && ` • Max files: ${maxFiles}`}
              </div>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleClick}
            disabled={disabled || readonly}
            className={cn(
              'btn btn-secondary',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
          >
            Choose File{multiple ? 's' : ''}
          </button>
        )
      )}

      {/* Readonly message if no files */}
      {readonly && fileList.length === 0 && (
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-md text-center text-sm text-gray-500">
          No files uploaded
        </div>
      )}

      {/* Upload progress */}
      {uploading && progress && Object.keys(uploadProgress).length > 0 && (
        <div className="mt-4 space-y-2">
          {Object.entries(uploadProgress).map(([fileId, progress]) => (
            <div key={fileId}>
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Uploading...</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* File list with preview */}
      {fileList.length > 0 && (
        <div className="mt-4 space-y-3">
          {fileList.map((file: any, index: number) => {
            const isImage = file.fileName?.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)
            const isBase64 = typeof file === 'string' && file.startsWith('data:image')
            // Get API base URL for file download/preview
            const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'
            
            // Handle different file data structures
            let fileUrl: string | null = null
            let downloadUrl: string | null = null
            let fileName = file.fileName || file.name || file.fileId || `File ${index + 1}`
            let fileSize = file.fileSize || file.size
            
            // If file is a base64 string (for images)
            if (isBase64) {
              fileUrl = file
              downloadUrl = file // Can download base64 as data URL
            } else if (typeof file === 'object') {
              // Normalize file object structure
              fileUrl = file.fileUrl || file.url || (file.fileId ? `${apiBaseUrl}/api/files/${file.fileId}/download` : null)
              downloadUrl = file.fileId ? `${apiBaseUrl}/api/files/${file.fileId}/download` : fileUrl || file.fileUrl
            } else if (typeof file === 'string') {
              // If file is just a fileId string
              fileUrl = `${apiBaseUrl}/api/files/${file}/download`
              downloadUrl = fileUrl
              fileName = file
            }

            return (
              <div
                key={file.fileId || index}
                className="p-4 bg-gray-50 border border-gray-200 rounded-md"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    {/* Image preview for readonly mode */}
                    {(readonly || preview) && isImage && (fileUrl || isBase64) && (
                      <div className="mb-3">
                        <img
                          src={fileUrl || (typeof file === 'string' ? file : '')}
                          alt={fileName || 'Uploaded image'}
                          className="max-w-full max-h-48 rounded-md border border-gray-300 object-contain bg-white"
                          onError={(e) => {
                            // Fallback: hide image if it fails to load
                            e.currentTarget.style.display = 'none'
                          }}
                        />
                      </div>
                    )}
                    
                    <div className="flex items-center space-x-3">
                      {preview && fileName && (
                        <div className="text-2xl flex-shrink-0">
                          {isImage ? '🖼️' : '📄'}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium text-gray-900 truncate" title={fileName}>
                          {fileName}
                        </div>
                        {fileSize && (
                          <div className="text-xs text-gray-500">{formatFileSize(fileSize)}</div>
                        )}
                        {file.fileId && !readonly && (
                          <div className="text-xs text-gray-400 mt-1">ID: {file.fileId}</div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex items-center space-x-2 flex-shrink-0">
                    {readonly ? (
                      // Readonly mode: show preview and download
                      <>
                        {isImage && (fileUrl || isBase64) && (
                          <a
                            href={fileUrl || (typeof file === 'string' ? file : '#')}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-primary hover:text-primary-dark font-medium px-2 py-1 rounded hover:bg-primary/10"
                            title="View full size"
                          >
                            View
                          </a>
                        )}
                        {downloadUrl && (
                          <button
                            type="button"
                            onClick={async () => {
                              try {
                                // Get auth token
                                const token = localStorage.getItem('token')
                                const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'
                                
                                // Extract fileId from downloadUrl or use the file object
                                let fileIdToDownload = file.fileId || file.id || file
                                if (typeof fileIdToDownload === 'string' && fileIdToDownload.includes('/api/files/')) {
                                  // Extract fileId from URL
                                  const match = fileIdToDownload.match(/\/api\/files\/([^/]+)\/download/)
                                  fileIdToDownload = match ? match[1] : fileIdToDownload
                                }
                                
                                // Create download URL with auth
                                const url = `${apiBaseUrl}/api/files/${fileIdToDownload}/download`
                                
                                // Fetch with auth headers
                                const response = await fetch(url, {
                                  headers: {
                                    'Authorization': `Bearer ${token}`,
                                  },
                                })
                                
                                if (!response.ok) {
                                  throw new Error('Failed to download file')
                                }
                                
                                // Get blob and create download link
                                const blob = await response.blob()
                                const blobUrl = window.URL.createObjectURL(blob)
                                const link = document.createElement('a')
                                link.href = blobUrl
                                link.download = fileName || 'download'
                                document.body.appendChild(link)
                                link.click()
                                document.body.removeChild(link)
                                window.URL.revokeObjectURL(blobUrl)
                              } catch (error) {
                                console.error('Error downloading file:', error)
                                alert('Failed to download file. Please try again.')
                              }
                            }}
                            className="text-sm text-primary hover:text-primary-dark font-medium px-2 py-1 rounded hover:bg-primary/10"
                            title="Download file"
                          >
                            📥 Download
                          </button>
                        )}
                      </>
                    ) : (
                      // Editable mode: show remove button
                      <button
                        type="button"
                        onClick={() => handleRemoveFile(index)}
                        disabled={disabled}
                        className="text-error hover:text-red-700 text-sm font-medium"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

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

