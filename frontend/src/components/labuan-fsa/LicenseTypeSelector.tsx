import { BaseFieldProps, SelectOption } from '@/types'
import { cn } from '@/lib/utils'

export interface LicenseTypeSelectorProps extends BaseFieldProps {
  fieldType: 'license-type-selector' | 'labuan-license-type'
  value?: string
  defaultValue?: string
  licenseTypes?: SelectOption[]
}

// Labuan FSA License Types (based on typical Labuan FSA categories)
const DEFAULT_LICENSE_TYPES: SelectOption[] = [
  { value: 'banking', label: 'Banking License' },
  { value: 'insurance', label: 'Insurance License' },
  { value: 'insurance-broker', label: 'Insurance Broker License' },
  { value: 'takaful', label: 'Takaful License' },
  { value: 'takaful-broker', label: 'Takaful Broker License' },
  { value: 'investment-bank', label: 'Investment Bank License' },
  { value: 'investment-dealer', label: 'Investment Dealer License' },
  { value: 'fund-manager', label: 'Fund Manager License' },
  { value: 'trust-company', label: 'Trust Company License' },
  { value: 'leasing', label: 'Leasing License' },
  { value: 'money-broker', label: 'Money Broker License' },
  { value: 'money-lender', label: 'Money Lender License' },
  { value: 'labuan-company', label: 'Labuan Company Registration' },
  { value: 'foundation', label: 'Labuan Foundation' },
  { value: 'limited-partnership', label: 'Limited Partnership' },
  { value: 'other', label: 'Other (Please specify)' },
]

export function LicenseTypeSelector({
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
  licenseTypes = DEFAULT_LICENSE_TYPES,
  className,
}: LicenseTypeSelectorProps) {
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
        {label || 'License Type'}
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
          <option value="">{placeholder || 'Select License Type...'}</option>
        )}
        {licenseTypes.map((option) => (
          <option key={option.value} value={option.value} disabled={option.disabled}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p id={`${fieldId}-error`} className="error-message mt-1" role="alert">
          {error}
        </p>
      )}
      {helpText && !error && (
        <p id={`${fieldId}-help`} className="help-text">
          {helpText || 'Select the type of license or registration you wish to apply for.'}
        </p>
      )}
    </div>
  )
}

