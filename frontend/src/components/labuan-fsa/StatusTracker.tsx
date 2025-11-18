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
    status: 'pending-payment',
    label: 'Payment',
    description: 'Payment processing required',
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
      'pending-payment',
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
        <div className="mb-3 sm:mb-4 text-xs sm:text-sm text-gray-600 break-words">
          Application ID: <span className="font-medium text-gray-900">{applicationId}</span>
        </div>
      )}

      {submittedDate && (
        <div className="mb-3 sm:mb-4 text-xs sm:text-sm text-gray-600">
          Submitted: <span className="font-medium text-gray-900">{submittedDate}</span>
        </div>
      )}

      <div className="relative overflow-x-auto -mx-2 sm:mx-0 px-2 sm:px-0">
        {/* Progress line */}
        <div className="absolute top-3 sm:top-4 left-2 sm:left-0 right-2 sm:right-0 h-0.5 sm:h-1 bg-gray-300">
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
        <div className="relative flex justify-between min-w-[600px] sm:min-w-0">
          {steps.map((step, index) => (
            <div key={step.status} className="flex flex-col items-center flex-1 min-w-0 px-1 sm:px-0">
              {/* Step circle */}
              <div
                className={cn(
                  'relative z-10 flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 transition-colors flex-shrink-0',
                  getStatusColor(step)
                )}
              >
                {step.completed ? (
                  <span className="text-xs sm:text-sm font-bold">✓</span>
                ) : (
                  <span className="text-xs sm:text-sm font-bold">{index + 1}</span>
                )}
              </div>

              {/* Step label */}
              <div className="mt-1.5 sm:mt-2 text-center max-w-[80px] sm:max-w-[120px] min-w-0">
                <div
                  className={cn(
                    'text-[10px] sm:text-xs font-medium truncate w-full',
                    step.current ? 'text-primary' : step.completed ? 'text-gray-900' : 'text-gray-500'
                  )}
                  title={step.label}
                >
                  {step.label}
                </div>
                {step.description && (
                  <div className="mt-0.5 sm:mt-1 text-[9px] sm:text-xs text-gray-500 line-clamp-2 hidden sm:block">{step.description}</div>
                )}
                {step.date && (
                  <div className="mt-0.5 sm:mt-1 text-[9px] sm:text-xs text-gray-400 hidden sm:block">{step.date}</div>
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

