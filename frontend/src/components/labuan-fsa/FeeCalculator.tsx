import React, { useState, useEffect } from 'react'
import { BaseFieldProps } from '@/types'
import { cn } from '@/lib/utils'

export interface FeeStructure {
  licenseType: string
  baseFee: number
  annualFee?: number
  processingFee?: number
  additionalFees?: Array<{ name: string; amount: number; condition?: string }>
}

export interface FeeCalculatorProps extends BaseFieldProps {
  fieldType: 'fee-calculator' | 'labuan-fee-calculator'
  licenseType?: string // Linked to license type field
  feeStructure?: FeeStructure[]
  value?: { totalFee: number; breakdown: Record<string, number> }
  defaultValue?: { totalFee: number; breakdown: Record<string, number> }
  currency?: string
}

// Default Labuan FSA fee structure (example - should match actual fee schedule)
const DEFAULT_FEE_STRUCTURE: FeeStructure[] = [
  {
    licenseType: 'banking',
    baseFee: 50000,
    annualFee: 30000,
    processingFee: 5000,
  },
  {
    licenseType: 'insurance',
    baseFee: 30000,
    annualFee: 20000,
    processingFee: 3000,
  },
  {
    licenseType: 'insurance-broker',
    baseFee: 10000,
    annualFee: 5000,
    processingFee: 1000,
  },
  {
    licenseType: 'takaful',
    baseFee: 30000,
    annualFee: 20000,
    processingFee: 3000,
  },
  {
    licenseType: 'takaful-broker',
    baseFee: 10000,
    annualFee: 5000,
    processingFee: 1000,
  },
  {
    licenseType: 'investment-bank',
    baseFee: 40000,
    annualFee: 25000,
    processingFee: 4000,
  },
  {
    licenseType: 'investment-dealer',
    baseFee: 15000,
    annualFee: 10000,
    processingFee: 2000,
  },
  {
    licenseType: 'fund-manager',
    baseFee: 20000,
    annualFee: 15000,
    processingFee: 2500,
  },
  {
    licenseType: 'trust-company',
    baseFee: 15000,
    annualFee: 10000,
    processingFee: 1500,
  },
  {
    licenseType: 'leasing',
    baseFee: 10000,
    annualFee: 5000,
    processingFee: 1000,
  },
]

export function FeeCalculator({
  fieldId,
  fieldName,
  fieldType,
  label,
  licenseType,
  feeStructure = DEFAULT_FEE_STRUCTURE,
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
  currency = 'MYR',
  className,
}: FeeCalculatorProps) {
  const [calculatedFees, setCalculatedFees] = useState<{
    totalFee: number
    breakdown: Record<string, number>
  }>(value ?? defaultValue ?? { totalFee: 0, breakdown: {} })

  // Calculate fees based on license type
  useEffect(() => {
    if (!licenseType) {
      setCalculatedFees({ totalFee: 0, breakdown: {} })
      onChange({ totalFee: 0, breakdown: {} })
      return
    }

    const structure = feeStructure.find((f) => f.licenseType === licenseType)
    if (!structure) {
      setCalculatedFees({ totalFee: 0, breakdown: {} })
      onChange({ totalFee: 0, breakdown: {} })
      return
    }

    const breakdown: Record<string, number> = {}
    let total = 0

    // Base fee
    if (structure.baseFee) {
      breakdown['Base License Fee'] = structure.baseFee
      total += structure.baseFee
    }

    // Annual fee
    if (structure.annualFee) {
      breakdown['Annual License Fee'] = structure.annualFee
      total += structure.annualFee
    }

    // Processing fee
    if (structure.processingFee) {
      breakdown['Processing Fee'] = structure.processingFee
      total += structure.processingFee
    }

    // Additional fees
    if (structure.additionalFees) {
      structure.additionalFees.forEach((fee) => {
        breakdown[fee.name] = fee.amount
        total += fee.amount
      })
    }

    const newFees = { totalFee: total, breakdown }
    setCalculatedFees(newFees)
    onChange(newFees)
  }, [licenseType, feeStructure, onChange])

  // Merge styles
  const containerClassName = cn('mb-4', style?.containerClassName)

  if (hidden) {
    return null
  }

  return (
    <div className={containerClassName}>
      <label
        htmlFor={fieldId}
        className={cn('label', required && 'label-required', style?.labelClassName)}
      >
        {label || 'Fee Calculation'}
        {tooltip && (
          <span className="ml-1 text-gray-400" title={tooltip}>
            ℹ️
          </span>
        )}
      </label>

      <div className="p-4 bg-gray-50 border border-gray-300 rounded-md">
        {!licenseType ? (
          <div className="text-sm text-gray-500 text-center py-4">
            Please select a license type to calculate fees
          </div>
        ) : calculatedFees.totalFee === 0 ? (
          <div className="text-sm text-gray-500 text-center py-4">
            No fee structure available for selected license type
          </div>
        ) : (
          <>
            {/* Fee breakdown */}
            <div className="space-y-2 mb-4">
              {Object.entries(calculatedFees.breakdown).map(([name, amount]) => (
                <div key={name} className="flex justify-between text-sm">
                  <span className="text-gray-600">{name}:</span>
                  <span className="font-medium text-gray-900">
                    {currency} {amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="pt-3 border-t border-gray-300 flex justify-between items-center">
              <span className="text-base font-semibold text-gray-900">Total Fee:</span>
              <span className="text-lg font-bold text-primary">
                {currency} {calculatedFees.totalFee.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </>
        )}
      </div>

      {/* Hidden input for form submission */}
      <input
        type="hidden"
        id={fieldId}
        name={fieldName}
        value={JSON.stringify(calculatedFees)}
        required={required}
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
          {helpText || 'Fees are calculated based on the selected license type. Please refer to the Labuan FSA Fee Schedule for detailed information.'}
        </p>
      )}
    </div>
  )
}

