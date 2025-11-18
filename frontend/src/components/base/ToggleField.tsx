import { BaseFieldProps } from '@/types'
import { cn } from '@/lib/utils'

export interface ToggleFieldProps extends BaseFieldProps {
  fieldType: 'toggle' | 'switch'
  value?: boolean
  defaultValue?: boolean
}

export function ToggleField({
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
  className,
}: ToggleFieldProps) {
  // Get field value
  const fieldValue = value ?? defaultValue ?? false

  // Handle change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.checked)
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
        className={cn(
          'flex items-center justify-between cursor-pointer',
          disabled && 'opacity-50 cursor-not-allowed',
          style?.labelClassName
        )}
      >
        <div className="flex items-center gap-2 sm:space-x-2">
          <span className={cn('label text-xs sm:text-sm', required && 'label-required')}>
            {label}
            {tooltip && (
              <span className="ml-1 text-gray-400" title={tooltip}>
                ℹ️
              </span>
            )}
          </span>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={fieldValue}
          aria-labelledby={fieldId}
          aria-invalid={!!error}
          disabled={disabled || readonly}
          onClick={() => !disabled && !readonly && onChange(!fieldValue)}
          onBlur={onBlur}
          onFocus={onFocus}
          className={cn(
            'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
            fieldValue ? 'bg-primary' : 'bg-gray-200',
            disabled && 'opacity-50 cursor-not-allowed',
            readonly && 'cursor-default'
          )}
        >
          <span
            className={cn(
              'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
              fieldValue ? 'translate-x-5' : 'translate-x-0'
            )}
          />
        </button>
      </label>
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

