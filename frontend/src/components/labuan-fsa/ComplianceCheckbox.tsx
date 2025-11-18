import { BaseFieldProps } from '@/types'
import { cn } from '@/lib/utils'

export interface ComplianceCheckboxProps extends BaseFieldProps {
  fieldType: 'compliance-checkbox' | 'labuan-compliance-checkbox'
  value?: boolean
  defaultValue?: boolean
  complianceText?: string
  linkToPolicy?: string
}

const DEFAULT_COMPLIANCE_TEXT = `I hereby declare that:
1. All information provided in this application is true and accurate to the best of my knowledge.
2. I understand that any false or misleading information may result in the rejection of this application or revocation of any license granted.
3. I agree to comply with all applicable Labuan FSA laws, regulations, and guidelines.
4. I authorize Labuan FSA to conduct any necessary background checks and verification.
5. I understand that the processing fee is non-refundable regardless of the application outcome.`

export function ComplianceCheckbox({
  fieldId,
  fieldName,
  fieldType,
  label,
  value,
  defaultValue,
  onChange,
  onBlur,
  onFocus,
  required = true,
  disabled,
  readonly,
  hidden,
  helpText,
  tooltip,
  validation,
  error,
  style,
  complianceText = DEFAULT_COMPLIANCE_TEXT,
  linkToPolicy,
  className,
}: ComplianceCheckboxProps) {
  // Get field value
  const isChecked = value ?? defaultValue ?? false

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
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
        <div className="flex items-start space-x-3">
          <input
            id={fieldId}
            name={fieldName}
            type="checkbox"
            checked={isChecked}
            onChange={handleChange}
            onBlur={onBlur}
            onFocus={onFocus}
            required={required}
            disabled={disabled}
            readOnly={readonly}
            className={cn(
              'mt-1 h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary',
              error && 'border-error',
              disabled && 'opacity-50 cursor-not-allowed',
              readonly && 'cursor-default',
              style?.className,
              className
            )}
            style={style?.style}
            aria-invalid={!!error}
            aria-describedby={error ? `${fieldId}-error` : helpText ? `${fieldId}-help` : undefined}
          />
          <div className="flex-1">
            <label
              htmlFor={fieldId}
              className={cn(
                'text-sm font-medium text-gray-900 cursor-pointer',
                disabled && 'cursor-not-allowed',
                readonly && 'cursor-default'
              )}
            >
              {label || 'Compliance Declaration'}
              {required && <span className="text-error ml-1">*</span>}
              {tooltip && (
                <span className="ml-1 text-gray-400" title={tooltip}>
                  ℹ️
                </span>
              )}
            </label>
            <div className="mt-2 text-sm text-gray-700 whitespace-pre-line">
              {complianceText}
            </div>
            {linkToPolicy && (
              <div className="mt-2">
                <a
                  href={linkToPolicy}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline"
                >
                  View Full Terms and Conditions →
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      {error && (
        <p id={`${fieldId}-error`} className="error-message mt-1" role="alert">
          {error}
        </p>
      )}
      {helpText && !error && (
        <p id={`${fieldId}-help`} className="help-text">
          {helpText || 'You must accept the compliance declaration to proceed with your application.'}
        </p>
      )}
    </div>
  )
}

