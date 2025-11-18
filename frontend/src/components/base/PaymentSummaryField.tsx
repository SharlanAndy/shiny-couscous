import { BaseFieldProps } from '@/types'
import { cn } from '@/lib/utils'

export interface PaymentItem {
  label: string
  amount: number
  description?: string
}

export interface PaymentSummaryFieldProps extends BaseFieldProps {
  fieldType: 'payment-summary' | 'payment-summary-field'
  items?: PaymentItem[]
  subtotal?: number
  tax?: number
  discount?: number
  total?: number
  currency?: string
  value?: {
    items: PaymentItem[]
    subtotal: number
    tax: number
    discount: number
    total: number
  }
}

export function PaymentSummaryField({
  fieldId,
  fieldName,
  fieldType,
  label,
  items = [],
  subtotal = 0,
  tax = 0,
  discount = 0,
  total = 0,
  currency = 'MYR',
  value,
  helpText,
  tooltip,
  error,
  style,
  hidden,
  className,
}: PaymentSummaryFieldProps) {
  // Use value prop if provided, otherwise use individual props
  const summaryData = value || {
    items,
    subtotal,
    tax,
    discount,
    total,
  }

  // Calculate totals if not provided
  const calculatedSubtotal =
    summaryData.subtotal || summaryData.items.reduce((sum, item) => sum + item.amount, 0)
  const calculatedTax = summaryData.tax || 0
  const calculatedDiscount = summaryData.discount || 0
  const calculatedTotal = summaryData.total || calculatedSubtotal + calculatedTax - calculatedDiscount

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
          {label}
          {tooltip && (
            <span className="ml-1 text-gray-400" title={tooltip}>
              ℹ️
            </span>
          )}
        </label>
      )}

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        {/* Payment Items */}
        {summaryData.items.length > 0 && (
          <div className="space-y-3 mb-4">
            {summaryData.items.map((item, index) => (
              <div key={index} className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{item.label}</div>
                  {item.description && (
                    <div className="text-sm text-gray-600 mt-1">{item.description}</div>
                  )}
                </div>
                <div className="ml-4 text-right">
                  <div className="font-medium text-gray-900">
                    {currency} {item.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Summary Totals */}
        <div className="border-t border-gray-300 pt-4 space-y-2">
          {calculatedSubtotal > 0 && (
            <div className="flex justify-between text-sm text-gray-700">
              <span>Subtotal:</span>
              <span>
                {currency} {calculatedSubtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          )}
          {calculatedTax > 0 && (
            <div className="flex justify-between text-sm text-gray-700">
              <span>Tax:</span>
              <span>
                {currency} {calculatedTax.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          )}
          {calculatedDiscount > 0 && (
            <div className="flex justify-between text-sm text-green-600">
              <span>Discount:</span>
              <span>
                - {currency} {calculatedDiscount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          )}
          <div className="flex justify-between items-center pt-2 border-t border-gray-300">
            <span className="text-base font-semibold text-gray-900">Total:</span>
            <span className="text-lg font-bold text-primary">
              {currency} {calculatedTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>

      {/* Hidden input for form submission */}
      <input
        type="hidden"
        id={fieldId}
        name={fieldName}
        value={JSON.stringify(summaryData)}
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
          {helpText}
        </p>
      )}
    </div>
  )
}

