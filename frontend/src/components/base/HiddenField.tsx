import React from 'react'
import { BaseFieldProps } from '@/types'

export interface HiddenFieldProps extends BaseFieldProps {
  fieldType: 'hidden' | 'input-hidden'
  value?: any
  defaultValue?: any
}

export function HiddenField({
  fieldId,
  fieldName,
  fieldType,
  value,
  defaultValue,
  onChange,
  required,
  hidden = true,
}: HiddenFieldProps) {
  // Get field value
  const fieldValue = value ?? defaultValue ?? ''

  // Hidden fields are always rendered (just not visible)
  return (
    <input
      type="hidden"
      id={fieldId}
      name={fieldName}
      value={typeof fieldValue === 'string' ? fieldValue : JSON.stringify(fieldValue)}
      required={required}
      onChange={(e) => onChange && onChange(e.target.value)}
    />
  )
}

