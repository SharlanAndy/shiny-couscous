import React, { useState } from 'react'
import { BaseFieldProps } from '@/types'
import { cn } from '@/lib/utils'

export interface DocumentRequirement {
  id: string
  name: string
  description?: string
  required: boolean
  uploaded?: boolean
  fileId?: string
}

export interface DocumentChecklistProps extends BaseFieldProps {
  fieldType: 'document-checklist' | 'labuan-document-checklist'
  documents?: DocumentRequirement[]
  value?: Record<string, { uploaded: boolean; fileId?: string }>
  defaultValue?: Record<string, { uploaded: boolean; fileId?: string }>
  allowUpload?: boolean
  onUpload?: (documentId: string, fileId: string) => void
}

// Default Labuan FSA document requirements (example)
const DEFAULT_DOCUMENTS: DocumentRequirement[] = [
  {
    id: 'business-plan',
    name: 'Business Plan',
    description: 'Detailed business plan including objectives, strategies, and financial projections',
    required: true,
  },
  {
    id: 'memorandum-articles',
    name: 'Memorandum and Articles of Association',
    description: 'Certified copies of Memorandum and Articles of Association',
    required: true,
  },
  {
    id: 'board-resolution',
    name: 'Board Resolution',
    description: 'Board resolution approving the application',
    required: true,
  },
  {
    id: 'financial-statements',
    name: 'Audited Financial Statements',
    description: 'Latest audited financial statements (if applicable)',
    required: true,
  },
  {
    id: 'fit-proper',
    name: 'Fit and Proper Declaration',
    description: 'Fit and proper declarations for directors and key personnel',
    required: true,
  },
  {
    id: 'compliance-manual',
    name: 'Compliance Manual',
    description: 'Internal compliance and risk management manual',
    required: false,
  },
  {
    id: 'other-documents',
    name: 'Other Supporting Documents',
    description: 'Any other documents as may be required',
    required: false,
  },
]

export function DocumentChecklist({
  fieldId,
  fieldName,
  fieldType,
  label,
  documents = DEFAULT_DOCUMENTS,
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
  allowUpload = true,
  onUpload,
  className,
}: DocumentChecklistProps) {
  // Get field value
  const checklistValue = value ?? defaultValue ?? {}

  // Update document status
  const updateDocumentStatus = (documentId: string, uploaded: boolean, fileId?: string) => {
    const newValue = {
      ...checklistValue,
      [documentId]: { uploaded, fileId },
    }
    onChange(newValue)
  }

  // Handle file upload
  const handleFileUpload = (documentId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // TODO: Upload file and get file ID
    // For now, simulate file upload
    const fileId = `file-${Date.now()}-${file.name}`
    updateDocumentStatus(documentId, true, fileId)
    if (onUpload) {
      onUpload(documentId, fileId)
    }
  }

  // Handle remove document
  const handleRemoveDocument = (documentId: string) => {
    if (readonly || disabled) return
    updateDocumentStatus(documentId, false)
  }

  // Check completion status
  const requiredDocuments = documents.filter((doc) => doc.required)
  const uploadedRequired = requiredDocuments.filter(
    (doc) => checklistValue[doc.id]?.uploaded === true
  )
  const isComplete = requiredDocuments.length > 0 && uploadedRequired.length === requiredDocuments.length

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
        {label || 'Required Documents'}
        {tooltip && (
          <span className="ml-1 text-gray-400" title={tooltip}>
            ℹ️
          </span>
        )}
      </label>

      {/* Progress indicator */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600">
            Documents uploaded: {uploadedRequired.length} / {requiredDocuments.length}
          </span>
          <span
            className={cn(
              'text-sm font-medium',
              isComplete ? 'text-green-600' : 'text-orange-600'
            )}
          >
            {isComplete ? '✓ Complete' : 'Incomplete'}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={cn(
              'h-2 rounded-full transition-all duration-300',
              isComplete ? 'bg-green-500' : 'bg-orange-500'
            )}
            style={{
              width: `${requiredDocuments.length > 0 ? (uploadedRequired.length / requiredDocuments.length) * 100 : 0}%`,
            }}
          />
        </div>
      </div>

      {/* Document checklist */}
      <div className="space-y-2 sm:space-y-3">
        {documents.map((document) => {
          const isUploaded = checklistValue[document.id]?.uploaded === true
          const fileId = checklistValue[document.id]?.fileId
          const isImage = fileId?.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)
          const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'
          const downloadUrl = fileId ? `${apiBaseUrl}/api/files/${fileId}/download` : null
          const previewUrl = readonly && isImage && fileId ? downloadUrl : null

          return (
            <div
              key={document.id}
              className={cn(
                'p-3 sm:p-4 border rounded-md',
                isUploaded
                  ? 'bg-green-50 border-green-200'
                  : document.required
                    ? 'bg-orange-50 border-orange-200'
                    : 'bg-gray-50 border-gray-200'
              )}
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-2 sm:gap-3">
                    <div className="flex-shrink-0 mt-0.5 sm:mt-1">
                      {isUploaded ? (
                        <span className="text-green-600 text-base sm:text-lg">✓</span>
                      ) : (
                        <span className="text-gray-400 text-base sm:text-lg">○</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm sm:text-base font-medium text-gray-900 break-words">
                        {document.name}
                        {document.required && (
                          <span className="ml-1 sm:ml-2 text-xs sm:text-sm text-error">*</span>
                        )}
                      </div>
                      {document.description && (
                        <div className="text-xs sm:text-sm text-gray-600 mt-1 break-words">{document.description}</div>
                      )}
                      {isUploaded && fileId && (
                        <div className="text-[10px] sm:text-xs text-green-600 mt-1 break-all">
                          Uploaded: {fileId}
                        </div>
                      )}
                      
                      {/* Image preview for readonly mode */}
                      {readonly && isUploaded && isImage && previewUrl && (
                        <div className="mt-2 sm:mt-3">
                          <img
                            src={previewUrl}
                            alt={document.name || 'Uploaded document'}
                            className="max-w-full max-h-24 sm:max-h-32 rounded-md border border-gray-300 object-contain bg-white"
                            onError={(e) => {
                              // Hide image if it fails to load
                              e.currentTarget.style.display = 'none'
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Actions */}
                <div className="flex items-center gap-2 sm:gap-3 sm:ml-4 flex-shrink-0 sm:flex-nowrap flex-wrap">
                  {readonly && isUploaded && fileId ? (
                    // Readonly mode: show preview and download links
                    <>
                      {isImage && previewUrl && (
                        <a
                          href={previewUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs sm:text-sm text-primary hover:text-primary-dark font-medium px-2 py-1 rounded hover:bg-primary/10 whitespace-nowrap"
                          title="View document"
                        >
                          View
                        </a>
                      )}
                      {downloadUrl && (
                        <a
                          href={downloadUrl}
                          download={fileId}
                          className="text-xs sm:text-sm text-primary hover:text-primary-dark font-medium px-2 py-1 rounded hover:bg-primary/10 whitespace-nowrap"
                          title="Download document"
                        >
                          📥 Download
                        </a>
                      )}
                    </>
                  ) : allowUpload && !readonly ? (
                    // Editable mode: show upload/remove buttons
                    <>
                      {isUploaded ? (
                        <button
                          type="button"
                          onClick={() => handleRemoveDocument(document.id)}
                          disabled={disabled}
                          className="text-xs sm:text-sm text-error hover:text-red-700 font-medium whitespace-nowrap"
                        >
                          Remove
                        </button>
                      ) : (
                        <label
                          htmlFor={`${fieldId}-${document.id}`}
                          className={cn(
                            'btn btn-secondary btn-sm cursor-pointer text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 whitespace-nowrap',
                            disabled && 'opacity-50 cursor-not-allowed'
                          )}
                        >
                          Upload
                        </label>
                      )}
                      <input
                        id={`${fieldId}-${document.id}`}
                        type="file"
                        onChange={(e) => handleFileUpload(document.id, e)}
                        onBlur={onBlur}
                        onFocus={onFocus}
                        disabled={disabled}
                        className="hidden"
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      />
                    </>
                  ) : null}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Hidden input for form submission */}
      <input
        type="hidden"
        id={fieldId}
        name={fieldName}
        value={JSON.stringify(checklistValue)}
        required={required && !isComplete}
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
          {helpText || 'Please upload all required documents. Documents should be in PDF, DOC, DOCX, JPG, or PNG format.'}
        </p>
      )}
    </div>
  )
}

