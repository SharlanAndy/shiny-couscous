import React from 'react'
import { BaseFieldProps } from '@/types'
import { cn } from '@/lib/utils'

export interface AddressFieldProps extends BaseFieldProps {
  fieldType: 'address' | 'address-complete'
  fields?: {
    line1?: boolean
    line2?: boolean
    city?: boolean
    state?: boolean
    postalCode?: boolean
    country?: boolean
  }
  value?: {
    line1?: string
    line2?: string
    city?: string
    state?: string
    postalCode?: string
    country?: string
  }
  defaultValue?: {
    line1?: string
    line2?: string
    city?: string
    state?: string
    postalCode?: string
    country?: string
  }
}

export function AddressField({
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
  fields = {
    line1: true,
    line2: true,
    city: true,
    state: true,
    postalCode: true,
    country: false,
  },
  className,
}: AddressFieldProps) {
  // Get field value
  const addressValue = value ?? defaultValue ?? {
    line1: '',
    line2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'Malaysia',
  }

  // Handle sub-field change
  const handleSubFieldChange = (subField: string, subValue: string) => {
    const newValue = {
      ...addressValue,
      [subField]: subValue,
    }
    onChange(newValue)
  }

  // Merge styles
  const containerClassName = cn('mb-4', style?.containerClassName)

  if (hidden) {
    return null
  }

  return (
    <div className={containerClassName}>
      <fieldset>
        <legend
          className={cn('label mb-2 sm:mb-3', required && 'label-required', style?.labelClassName)}
        >
          {label}
          {tooltip && (
            <span className="ml-1 text-gray-400" title={tooltip}>
              ℹ️
            </span>
          )}
        </legend>
        <div className="space-y-3 sm:space-y-4">
          {fields.line1 && (
            <div>
              <label htmlFor={`${fieldId}-line1`} className="label">
                Address Line 1
                {required && <span className="text-error"> *</span>}
              </label>
              <input
                id={`${fieldId}-line1`}
                name={`${fieldName}.line1`}
                type="text"
                value={addressValue.line1 || ''}
                onChange={(e) => handleSubFieldChange('line1', e.target.value)}
                onBlur={onBlur}
                onFocus={onFocus}
                placeholder="Street address"
                required={required}
                disabled={disabled}
                readOnly={readonly}
                className="input"
              />
            </div>
          )}

          {fields.line2 && (
            <div>
              <label htmlFor={`${fieldId}-line2`} className="label">
                Address Line 2
              </label>
              <input
                id={`${fieldId}-line2`}
                name={`${fieldName}.line2`}
                type="text"
                value={addressValue.line2 || ''}
                onChange={(e) => handleSubFieldChange('line2', e.target.value)}
                onBlur={onBlur}
                onFocus={onFocus}
                placeholder="Apartment, suite, etc."
                disabled={disabled}
                readOnly={readonly}
                className="input"
              />
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {fields.city && (
              <div>
                <label htmlFor={`${fieldId}-city`} className="label">
                  City
                  {required && <span className="text-error"> *</span>}
                </label>
                <input
                  id={`${fieldId}-city`}
                  name={`${fieldName}.city`}
                  type="text"
                  value={addressValue.city || ''}
                  onChange={(e) => handleSubFieldChange('city', e.target.value)}
                  onBlur={onBlur}
                  onFocus={onFocus}
                  placeholder="City"
                  required={required}
                  disabled={disabled}
                  readOnly={readonly}
                  className="input"
                />
              </div>
            )}

            {fields.state && (
              <div>
                <label htmlFor={`${fieldId}-state`} className="label">
                  State
                  {required && <span className="text-error"> *</span>}
                </label>
                <input
                  id={`${fieldId}-state`}
                  name={`${fieldName}.state`}
                  type="text"
                  value={addressValue.state || ''}
                  onChange={(e) => handleSubFieldChange('state', e.target.value)}
                  onBlur={onBlur}
                  onFocus={onFocus}
                  placeholder="State"
                  required={required}
                  disabled={disabled}
                  readOnly={readonly}
                  className="input"
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {fields.postalCode && (
              <div>
                <label htmlFor={`${fieldId}-postalCode`} className="label">
                  Postal Code
                  {required && <span className="text-error"> *</span>}
                </label>
                <input
                  id={`${fieldId}-postalCode`}
                  name={`${fieldName}.postalCode`}
                  type="text"
                  value={addressValue.postalCode || ''}
                  onChange={(e) => handleSubFieldChange('postalCode', e.target.value)}
                  onBlur={onBlur}
                  onFocus={onFocus}
                  placeholder="Postal code"
                  required={required}
                  disabled={disabled}
                  readOnly={readonly}
                  className="input"
                />
              </div>
            )}

            {fields.country && (
              <div>
                <label htmlFor={`${fieldId}-country`} className="label">
                  Country
                  {required && <span className="text-error"> *</span>}
                </label>
                <input
                  id={`${fieldId}-country`}
                  name={`${fieldName}.country`}
                  type="text"
                  value={addressValue.country || ''}
                  onChange={(e) => handleSubFieldChange('country', e.target.value)}
                  onBlur={onBlur}
                  onFocus={onFocus}
                  placeholder="Country"
                  required={required}
                  disabled={disabled}
                  readOnly={readonly}
                  className="input"
                />
              </div>
            )}
          </div>
        </div>
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
      </fieldset>
    </div>
  )
}

