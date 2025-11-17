import React from 'react'
import { BaseFieldProps } from '@/types'
import { cn } from '@/lib/utils'

export type ApplicationStatus =
  | 'draft'
  | 'submitted'
  | 'under-review'
  | 'additional-info-required'
  | 'approved'
  | 'rejected'
  | 'pending-payment'
  | 'completed'

export interface StatusStep {
  status: ApplicationStatus
  label: string
  description?: string
  completed: boolean
  current: boolean
  date?: string
}

export interface StatusTrackerProps extends BaseFieldProps {
  fieldType: 'status-tracker' | 'labuan-status-tracker'
  currentStatus?: ApplicationStatus
  statusHistory?: StatusStep[]
  applicationId?: string
  submittedDate?: string
}

const DEFAULT_STATUSES: StatusStep[] = [
  {
    status: 'draft',
    label: 'Draft',
    description: 'Application is being prepared',
    completed: false,
    current: false,
  },
  {
    status: 'submitted',
    label: 'Submitted',
    description: 'Application has been submitted',
    completed: false,
    current: false,
  },
  {
    status: 'under-review',
    label: 'Under Review',
    description: 'Application is being reviewed by Labuan FSA',
    completed: false,
    current: false,
  },
  {
    status: 'additional-info-required',
    label: 'Additional Information Required',
    description: 'Labuan FSA has requested additional information',
    completed: false,
    current: false,
  },
  {
    status: 'approved',
    label: 'Approved',
    description: 'Application has been approved',
    completed: false,
    current: false,
  },
  {
    status: 'completed',
    label: 'Completed',
    description: 'License has been issued',
    completed: false,
    current: false,
  },
]

export function StatusTracker({
  fieldId,
  fieldName,
  fieldType,
  label,
  currentStatus = 'draft',
  statusHistory,
  applicationId,
  submittedDate,
  helpText,
  tooltip,
  error,
  style,
  hidden,
  className,
}: StatusTrackerProps) {
  // Use provided history or generate from current status
  const getStatusSteps = (): StatusStep[] => {
    if (statusHistory && statusHistory.length > 0) {
      return statusHistory
    }

    const statusOrder: ApplicationStatus[] = [
      'draft',
      'submitted',
      'under-review',
      'additional-info-required',
      'approved',
      'completed',
    ]

    const currentIndex = statusOrder.indexOf(currentStatus)

    return DEFAULT_STATUSES.map((step, index) => {
      const isCompleted = index <= currentIndex
      const isCurrent = index === currentIndex

      return {
        ...step,
        completed: isCompleted,
        current: isCurrent,
      }
    })
  }

  const steps = getStatusSteps()

  // Get status color
  const getStatusColor = (step: StatusStep): string => {
    if (step.completed) return 'bg-green-500 border-green-500 text-white'
    if (step.current) return 'bg-primary border-primary text-white'
    return 'bg-gray-200 border-gray-300 text-gray-500'
  }

  // Merge styles
  const containerClassName = cn('mb-4', style?.containerClassName)

  if (hidden) {
    return null
  }

  return (
    <div className={containerClassName}>
      {label && (
        <label
          htmlFor={fieldId}
          className={cn('label', style?.labelClassName)}
        >
          {label || 'Application Status'}
          {tooltip && (
            <span className="ml-1 text-gray-400" title={tooltip}>
              ℹ️
            </span>
          )}
        </label>
      )}

      {applicationId && (
        <div className="mb-4 text-sm text-gray-600">
          Application ID: <span className="font-medium text-gray-900">{applicationId}</span>
        </div>
      )}

      {submittedDate && (
        <div className="mb-4 text-sm text-gray-600">
          Submitted: <span className="font-medium text-gray-900">{submittedDate}</span>
        </div>
      )}

      <div className="relative">
        {/* Progress line */}
        <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-300">
          {steps.some((s) => s.completed) && (
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{
                width: `${(steps.filter((s) => s.completed).length / (steps.length - 1)) * 100}%`,
              }}
            />
          )}
        </div>

        {/* Status steps */}
        <div className="relative flex justify-between">
          {steps.map((step, index) => (
            <div key={step.status} className="flex flex-col items-center flex-1">
              {/* Step circle */}
              <div
                className={cn(
                  'relative z-10 flex items-center justify-center w-8 h-8 rounded-full border-2 transition-colors',
                  getStatusColor(step)
                )}
              >
                {step.completed ? (
                  <span className="text-sm font-bold">✓</span>
                ) : (
                  <span className="text-sm font-bold">{index + 1}</span>
                )}
              </div>

              {/* Step label */}
              <div className="mt-2 text-center max-w-[120px]">
                <div
                  className={cn(
                    'text-xs font-medium',
                    step.current ? 'text-primary' : step.completed ? 'text-gray-900' : 'text-gray-500'
                  )}
                >
                  {step.label}
                </div>
                {step.description && (
                  <div className="mt-1 text-xs text-gray-500">{step.description}</div>
                )}
                {step.date && (
                  <div className="mt-1 text-xs text-gray-400">{step.date}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Hidden input for form submission */}
      <input
        type="hidden"
        id={fieldId}
        name={fieldName}
        value={currentStatus}
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
          {helpText || 'Track the status of your application through each stage of the review process.'}
        </p>
      )}
    </div>
  )
}

