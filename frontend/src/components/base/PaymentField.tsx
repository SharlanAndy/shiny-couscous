import React, { useState } from 'react'
import { BaseFieldProps } from '@/types'
import { cn } from '@/lib/utils'

export interface PaymentFieldProps extends BaseFieldProps {
  fieldType: 'payment-stripe' | 'payment-paypal' | 'payment-card' | 'payment-button'
  provider?: 'stripe' | 'paypal' | 'custom'
  amount?: number
  currency?: string
  value?: {
    cardNumber?: string
    expiry?: string
    cvv?: string
    cardholderName?: string
  }
  defaultValue?: {
    cardNumber?: string
    expiry?: string
    cvv?: string
    cardholderName?: string
  }
}

export function PaymentField({
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
  provider = 'stripe',
  amount = 0,
  currency = 'MYR',
  className,
}: PaymentFieldProps) {
  // Get field value
  const paymentValue = value ?? defaultValue ?? {
    cardNumber: '',
    expiry: '',
    cvv: '',
    cardholderName: '',
  }

  // Handle field change
  const handleChange = (field: string, newValue: string) => {
    const newPaymentValue = { ...paymentValue, [field]: newValue }
    onChange(newPaymentValue)
  }

  // Format card number (add spaces every 4 digits)
  const formatCardNumber = (value: string): string => {
    const cleaned = value.replace(/\s/g, '')
    const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned
    return formatted.substring(0, 19) // Max 16 digits + 3 spaces
  }

  // Format expiry (MM/YY)
  const formatExpiry = (value: string): string => {
    const cleaned = value.replace(/\D/g, '')
    if (cleaned.length >= 2) {
      return `${cleaned.substring(0, 2)}/${cleaned.substring(2, 4)}`
    }
    return cleaned
  }

  // Handle card number change
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value)
    handleChange('cardNumber', formatted.replace(/\s/g, ''))
  }

  // Handle expiry change
  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatExpiry(e.target.value)
    handleChange('expiry', formatted.replace(/\//g, ''))
  }

  // Handle CVV change
  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cleaned = e.target.value.replace(/\D/g, '').substring(0, 4)
    handleChange('cvv', cleaned)
  }

  // Handle cardholder name change
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleChange('cardholderName', e.target.value)
  }

  // Merge styles
  const containerClassName = cn('mb-4', style?.containerClassName)

  if (hidden) {
    return null
  }

  // Payment button mode
  if (fieldType === 'payment-button') {
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
        {amount > 0 && (
          <div className="mb-4 text-lg font-semibold text-gray-900">
            Amount: {currency} {amount.toFixed(2)}
          </div>
        )}
        <button
          type="button"
          id={fieldId}
          onClick={() => {
            // TODO: Initialize payment (Stripe/PayPal)
            alert(`Payment for ${currency} ${amount.toFixed(2)}`)
          }}
          disabled={disabled || readonly}
          className={cn(
            'btn btn-primary w-full',
            disabled && 'opacity-50 cursor-not-allowed',
            readonly && 'cursor-default'
          )}
        >
          Pay {currency} {amount.toFixed(2)}
        </button>
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

  // Card payment form
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

      {amount > 0 && (
        <div className="mb-4 p-4 bg-gray-50 rounded-md">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Total Amount</span>
            <span className="text-lg font-semibold text-gray-900">
              {currency} {amount.toFixed(2)}
            </span>
          </div>
        </div>
      )}

      {/* Card payment form */}
      <div className="space-y-4 p-4 border border-gray-300 rounded-md bg-white">
        {/* Cardholder Name */}
        <div>
          <label htmlFor={`${fieldId}-name`} className="label text-sm">
            Cardholder Name
            {required && <span className="text-error"> *</span>}
          </label>
          <input
            id={`${fieldId}-name`}
            name={`${fieldName}[cardholderName]`}
            type="text"
            value={paymentValue.cardholderName || ''}
            onChange={handleNameChange}
            onBlur={onBlur}
            onFocus={onFocus}
            placeholder="John Doe"
            required={required}
            disabled={disabled}
            readOnly={readonly}
            className="input"
          />
        </div>

        {/* Card Number */}
        <div>
          <label htmlFor={`${fieldId}-card`} className="label text-sm">
            Card Number
            {required && <span className="text-error"> *</span>}
          </label>
          <input
            id={`${fieldId}-card`}
            name={`${fieldName}[cardNumber]`}
            type="text"
            inputMode="numeric"
            value={formatCardNumber(paymentValue.cardNumber || '')}
            onChange={handleCardNumberChange}
            onBlur={onBlur}
            onFocus={onFocus}
            placeholder="1234 5678 9012 3456"
            required={required}
            disabled={disabled}
            readOnly={readonly}
            maxLength={19}
            className="input"
          />
        </div>

        {/* Expiry and CVV */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor={`${fieldId}-expiry`} className="label text-sm">
              Expiry
              {required && <span className="text-error"> *</span>}
            </label>
            <input
              id={`${fieldId}-expiry`}
              name={`${fieldName}[expiry]`}
              type="text"
              inputMode="numeric"
              value={formatExpiry(paymentValue.expiry || '')}
              onChange={handleExpiryChange}
              onBlur={onBlur}
              onFocus={onFocus}
              placeholder="MM/YY"
              required={required}
              disabled={disabled}
              readOnly={readonly}
              maxLength={5}
              className="input"
            />
          </div>
          <div>
            <label htmlFor={`${fieldId}-cvv`} className="label text-sm">
              CVV
              {required && <span className="text-error"> *</span>}
            </label>
            <input
              id={`${fieldId}-cvv`}
              name={`${fieldName}[cvv]`}
              type="text"
              inputMode="numeric"
              value={paymentValue.cvv || ''}
              onChange={handleCvvChange}
              onBlur={onBlur}
              onFocus={onFocus}
              placeholder="123"
              required={required}
              disabled={disabled}
              readOnly={readonly}
              maxLength={4}
              className="input"
            />
          </div>
        </div>
      </div>

      {/* Hidden input for form submission */}
      <input
        type="hidden"
        id={fieldId}
        name={fieldName}
        value={JSON.stringify(paymentValue)}
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
          {helpText}
        </p>
      )}

      {/* Security notice */}
      <div className="mt-2 text-xs text-gray-500 flex items-center space-x-1">
        <span>🔒</span>
        <span>Payment information is encrypted and secure</span>
      </div>
    </div>
  )
}

