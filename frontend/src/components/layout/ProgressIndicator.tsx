import React from 'react'
import { BaseFieldProps } from '@/types'
import { cn } from '@/lib/utils'

export interface ProgressIndicatorProps {
  fieldId: string
  label?: string
  steps: Array<{ id: string; label: string; completed?: boolean; active?: boolean }>
  currentStep?: number
  orientation?: 'horizontal' | 'vertical'
  style?: BaseFieldProps['style']
  hidden?: boolean
}

export function ProgressIndicator({
  fieldId,
  label,
  steps = [],
  currentStep,
  orientation = 'horizontal',
  style,
  hidden,
}: ProgressIndicatorProps) {
  if (hidden || steps.length === 0) return null

  // Determine current step if not provided
  const activeStepIndex =
    currentStep !== undefined
      ? currentStep
      : steps.findIndex((step) => step.active) >= 0
        ? steps.findIndex((step) => step.active)
        : 0

  // Merge styles
  const containerClassName = cn('mb-4', style?.containerClassName)

  if (orientation === 'vertical') {
    return (
      <div className={containerClassName}>
        {label && (
          <label className={cn('label', style?.labelClassName)}>{label}</label>
        )}
        <div className="space-y-4">
          {steps.map((step, index) => {
            const isCompleted = step.completed || index < activeStepIndex
            const isActive = step.active || index === activeStepIndex
            const isPast = index < activeStepIndex

            return (
              <div key={step.id} className="flex items-start">
                {/* Step connector line */}
                {index < steps.length - 1 && (
                  <div
                    className={cn(
                      'absolute left-4 w-0.5',
                      isPast ? 'bg-primary' : 'bg-gray-300',
                      index === 0 ? 'top-8' : index === steps.length - 1 ? 'bottom-8' : ''
                    )}
                    style={{ height: 'calc(100% - 2rem)' }}
                  />
                )}

                {/* Step circle */}
                <div
                  className={cn(
                    'relative z-10 flex items-center justify-center w-8 h-8 rounded-full border-2 transition-colors',
                    isCompleted
                      ? 'bg-primary border-primary text-white'
                      : isActive
                        ? 'bg-white border-primary text-primary'
                        : 'bg-white border-gray-300 text-gray-500'
                  )}
                >
                  {isCompleted ? (
                    <span className="text-sm font-bold">✓</span>
                  ) : (
                    <span className="text-sm font-bold">{index + 1}</span>
                  )}
                </div>

                {/* Step label */}
                <div className="ml-4 pt-1">
                  <div
                    className={cn(
                      'text-sm font-medium',
                      isActive ? 'text-primary' : isCompleted ? 'text-gray-900' : 'text-gray-500'
                    )}
                  >
                    {step.label}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  // Horizontal orientation
  return (
    <div className={containerClassName}>
      {label && (
        <label className={cn('label', style?.labelClassName)}>{label}</label>
      )}
      <div className="relative">
        {/* Progress bar */}
        <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-300">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${(activeStepIndex / (steps.length - 1)) * 100}%` }}
          />
        </div>

        {/* Steps */}
        <div className="relative flex justify-between">
          {steps.map((step, index) => {
            const isCompleted = step.completed || index < activeStepIndex
            const isActive = step.active || index === activeStepIndex

            return (
              <div key={step.id} className="flex flex-col items-center flex-1">
                {/* Step circle */}
                <div
                  className={cn(
                    'relative z-10 flex items-center justify-center w-8 h-8 rounded-full border-2 transition-colors',
                    isCompleted
                      ? 'bg-primary border-primary text-white'
                      : isActive
                        ? 'bg-white border-primary text-primary'
                        : 'bg-white border-gray-300 text-gray-500'
                  )}
                >
                  {isCompleted ? (
                    <span className="text-sm font-bold">✓</span>
                  ) : (
                    <span className="text-sm font-bold">{index + 1}</span>
                  )}
                </div>

                {/* Step label */}
                <div
                  className={cn(
                    'mt-2 text-xs font-medium text-center max-w-[100px]',
                    isActive ? 'text-primary' : isCompleted ? 'text-gray-900' : 'text-gray-500'
                  )}
                >
                  {step.label}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

