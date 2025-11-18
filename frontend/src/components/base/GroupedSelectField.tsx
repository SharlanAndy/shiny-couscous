import { BaseFieldProps, SelectOption } from '@/types'
import { cn } from '@/lib/utils'

export interface GroupedSelectFieldProps extends BaseFieldProps {
  fieldType: 'select-grouped' | 'grouped-select'
  optionGroups: Array<{
    label: string
    options: SelectOption[]
  }>
  value?: string
  defaultValue?: string
}

export function GroupedSelectField({
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
  optionGroups = [],
  className,
}: GroupedSelectFieldProps) {
  // Get field value
  const fieldValue = value ?? defaultValue ?? ''

  // Handle change
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(e.target.value)
  }

  // Merge styles
  const containerClassName = cn('mb-4', style?.containerClassName)
  const selectClassName = cn(
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
      <select
        id={fieldId}
        name={fieldName}
        value={fieldValue}
        onChange={handleChange}
        onBlur={onBlur}
        onFocus={onFocus}
        required={required}
        disabled={disabled}
        readOnly={readonly}
        className={selectClassName}
        style={style?.style}
        aria-invalid={!!error}
        aria-describedby={error ? `${fieldId}-error` : helpText ? `${fieldId}-help` : undefined}
      >
        {placeholder && (
          <option value="">{placeholder}</option>
        )}
        {optionGroups.map((group, groupIndex) => (
          <optgroup key={groupIndex} label={group.label}>
            {group.options.map((option) => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
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

