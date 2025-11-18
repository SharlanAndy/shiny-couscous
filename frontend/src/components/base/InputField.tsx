import { BaseFieldProps } from '@/types'
import { cn } from '@/lib/utils'

export interface InputFieldProps extends BaseFieldProps {
  inputType?: 'text' | 'number' | 'email' | 'password' | 'tel' | 'url' | 'search' | 'color'
  type?: 'input-text' | 'input-number' | 'input-email' | 'input-password' | 'input-tel' | 'input-url' | 'input-search' | 'input-color'
}

export function InputField({
  fieldId,
  fieldName,
  fieldType,
  inputType,
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
  className,
}: InputFieldProps) {
  // Determine HTML input type
  const htmlInputType = inputType || fieldType?.replace('input-', '') || 'text'

  // Get field value
  const fieldValue = value ?? defaultValue ?? ''

  // Handle change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = htmlInputType === 'number' ? parseFloat(e.target.value) : e.target.value
    onChange(newValue)
  }

  // Merge styles
  const inputClassName = cn(
    'input',
    error && 'input-error',
    disabled && 'opacity-50 cursor-not-allowed',
    readonly && 'bg-gray-100 cursor-default',
    style?.className,
    className
  )

  if (hidden) {
    return null
  }

  return (
    <div className={cn('mb-4', style?.containerClassName)}>
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
      <input
        id={fieldId}
        name={fieldName}
        type={htmlInputType}
        value={fieldValue}
        onChange={handleChange}
        onBlur={onBlur}
        onFocus={onFocus}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        readOnly={readonly}
        min={validation?.min}
        max={validation?.max}
        minLength={validation?.minLength}
        maxLength={validation?.maxLength}
        pattern={validation?.pattern}
        className={inputClassName}
        style={style?.style}
        aria-invalid={!!error}
        aria-describedby={error ? `${fieldId}-error` : helpText ? `${fieldId}-help` : undefined}
      />
      {error && (
        <p id={`${fieldId}-error`} className="error-message" role="alert">
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

