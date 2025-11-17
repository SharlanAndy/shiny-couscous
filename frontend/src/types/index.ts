/**
 * Type definitions for the Labuan FSA E-Submission System
 */

// Form Schema Types
export interface FormStep {
  stepId: string
  stepName: string
  stepOrder: number
  stepDescription?: string
  fields: FormField[]
}

export interface FormField {
  fieldId: string
  fieldType: string
  inputType?: string
  fieldName: string
  label: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
  readonly?: boolean
  hidden?: boolean
  defaultValue?: any
  validation?: FieldValidation
  style?: FieldStyle
  helpText?: string
  tooltip?: string
  conditionalDisplay?: ConditionalDisplay
  options?: SelectOption[]
  [key: string]: any // Allow additional properties for flexibility
}

export interface FieldValidation {
  minLength?: number
  maxLength?: number
  min?: number
  max?: number
  pattern?: string
  errorMessage?: string
  required?: boolean
  type?: string
}

export interface FieldStyle {
  className?: string
  containerClassName?: string
  labelClassName?: string
  style?: React.CSSProperties
  containerStyle?: React.CSSProperties
}

export interface ConditionalDisplay {
  when: string
  equals?: any
  show: boolean
}

export interface SelectOption {
  value: string
  label: string
  description?: string
  disabled?: boolean
  showInput?: boolean // For "Other" option
}

// Form Schema Response
export interface FormSchemaResponse {
  formId: string
  formName: string
  version: string
  steps: FormStep[]
  estimatedTime?: string
  submitButton?: {
    label?: string
    className?: string
  }
}

// Form Response
export interface FormResponse {
  id: string
  formId: string
  name: string
  description?: string
  category?: string
  version: string
  isActive: boolean
  requiresAuth: boolean
  estimatedTime?: string
  createdAt: string
  updatedAt: string
}

// Submission Types
export interface SubmissionData {
  [stepId: string]: {
    [fieldName: string]: any
  }
}

export interface SubmissionCreateRequest {
  data: SubmissionData
  files?: FileUploadReference[]
}

export interface FileUploadReference {
  fieldName: string
  fileId: string
  fileName: string
}

export interface SubmissionResponse {
  id: string
  formId: string
  submissionId: string
  status: 'draft' | 'submitted' | 'reviewing' | 'approved' | 'rejected' | 'cancelled'
  submittedBy?: string
  submittedAt?: string
  reviewedBy?: string
  reviewedAt?: string
  reviewNotes?: string
  requestedInfo?: string
  createdAt: string
  updatedAt: string
}

export interface SubmissionCreateResponse {
  formId: string
  submissionId: string
  status: string
  message: string
  submittedAt: string
  estimatedReviewTime?: string
}

// Validation Types
export interface ValidationError {
  fieldId: string
  fieldName: string
  stepId?: string
  error: string
  errorCode: string
}

export interface ValidationResponse {
  valid: boolean
  errors: ValidationError[]
}

// File Upload Types
export interface FileUploadResponse {
  id: string
  fileId: string
  fieldName: string
  fileName: string
  filePath: string
  fileSize: number
  mimeType?: string
  storageLocation: string
  storageUrl?: string
  uploadedAt: string
  uploadedBy?: string
}

// Component Props Types
export interface BaseFieldProps {
  fieldId: string
  fieldName: string
  fieldType: string
  label: string
  value?: any
  defaultValue?: any
  onChange: (value: any) => void
  onBlur?: () => void
  onFocus?: () => void
  required?: boolean
  disabled?: boolean
  readonly?: boolean
  hidden?: boolean
  placeholder?: string
  helpText?: string
  tooltip?: string
  validation?: FieldValidation
  error?: string
  style?: FieldStyle
  conditionalDisplay?: ConditionalDisplay
  className?: string
}

