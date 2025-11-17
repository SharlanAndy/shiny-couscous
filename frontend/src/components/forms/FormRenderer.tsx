import React from 'react'
import { FormField, FormStep } from '@/types'
import { InputField } from '@/components/base/InputField'
import { SelectField } from '@/components/base/SelectField'
import { TextAreaField } from '@/components/base/TextAreaField'
import { CheckboxField } from '@/components/base/CheckboxField'
import { RadioField } from '@/components/base/RadioField'
import { DatePickerField } from '@/components/base/DatePickerField'
import { FileUploadField } from '@/components/base/FileUploadField'
import { ToggleField } from '@/components/base/ToggleField'
import { RangeSliderField } from '@/components/base/RangeSliderField'
import { RatingField } from '@/components/base/RatingField'
import { PhoneField } from '@/components/base/PhoneField'
import { CurrencyField } from '@/components/base/CurrencyField'
import { AddressField } from '@/components/base/AddressField'
import { ColorPickerField } from '@/components/base/ColorPickerField'
import { SignatureField } from '@/components/base/SignatureField'
import { TagsField } from '@/components/base/TagsField'
import { shouldDisplayField } from '@/lib/utils'

interface FormRendererProps {
  steps: FormStep[]
  formData: Record<string, any>
  errors: Record<string, string>
  onChange: (stepId: string, fieldName: string, value: any) => void
  onBlur?: (stepId: string, fieldName: string) => void
}

/**
 * FormRenderer - Dynamically renders form fields based on API schema
 */
export function FormRenderer({
  steps,
  formData,
  errors,
  onChange,
  onBlur,
}: FormRendererProps) {
  const handleFieldChange = (stepId: string, fieldName: string, value: any) => {
    onChange(stepId, fieldName, value)
  }

  const handleFieldBlur = (stepId: string, fieldName: string) => {
    if (onBlur) {
      onBlur(stepId, fieldName)
    }
  }

  const renderField = (field: FormField, stepId: string) => {
    // Check conditional display
    if (field.conditionalDisplay && !shouldDisplayField(field.conditionalDisplay, formData)) {
      return null
    }

    // Get field value from form data
    const fieldValue = formData[stepId]?.[field.fieldName]
    const fieldError = errors[`${stepId}.${field.fieldName}`]

    // Common props
    const commonProps = {
      fieldId: field.fieldId,
      fieldName: field.fieldName,
      fieldType: field.fieldType,
      label: field.label,
      value: fieldValue,
      defaultValue: field.defaultValue,
      onChange: (value: any) => handleFieldChange(stepId, field.fieldName, value),
      onBlur: () => handleFieldBlur(stepId, field.fieldName),
      required: field.required,
      disabled: field.disabled,
      readonly: field.readonly,
      hidden: field.hidden,
      placeholder: field.placeholder,
      helpText: field.helpText,
      tooltip: field.tooltip,
      validation: field.validation,
      error: fieldError || (field.validation?.errorMessage && fieldError),
      style: field.style,
    }

    // Render based on field type
    switch (field.fieldType) {
      case 'input-text':
      case 'input-number':
      case 'input-email':
      case 'input-password':
      case 'input-tel':
      case 'input-url':
      case 'input-search':
      case 'input-color':
        return <InputField {...commonProps} inputType={field.inputType} />

      case 'textarea':
        return <TextAreaField {...commonProps} />

      case 'select-single':
      case 'select-multi':
      case 'select-other':
        return (
          <SelectField
            {...commonProps}
            options={field.options || []}
            multiple={field.fieldType === 'select-multi'}
            allowOther={field.fieldType === 'select-other'}
            searchable={field.searchable}
          />
        )

      case 'checkbox':
      case 'checkbox-group':
        return (
          <CheckboxField
            {...commonProps}
            options={field.options || []}
            allowOther={field.allowOther}
            otherOptionLabel={field.otherOptionLabel}
            otherInputPlaceholder={field.otherInputPlaceholder}
          />
        )

      case 'radio':
      case 'radio-group':
        return (
          <RadioField
            {...commonProps}
            options={field.options || []}
            allowOther={field.allowOther}
            otherOptionLabel={field.otherOptionLabel}
            otherInputPlaceholder={field.otherInputPlaceholder}
          />
        )

      case 'date':
      case 'time':
      case 'datetime-local':
      case 'month':
      case 'week':
      case 'year':
        return (
          <DatePickerField
            {...commonProps}
            min={field.min}
            max={field.max}
          />
        )

      case 'upload-document':
      case 'upload-image':
      case 'upload-file':
        return (
          <FileUploadField
            {...commonProps}
            multiple={field.multiple}
            accept={field.accept}
            maxSize={field.maxSize}
            maxFiles={field.maxFiles}
            dragDrop={field.dragDrop}
            preview={field.preview}
            progress={field.progress}
          />
        )

      case 'toggle':
      case 'switch':
        return <ToggleField {...commonProps} />

      case 'range-slider':
      case 'slider':
        return (
          <RangeSliderField
            {...commonProps}
            min={field.min}
            max={field.max}
            step={field.step}
            unit={field.unit}
            showValue={field.showValue}
          />
        )

      case 'rating':
      case 'star-rating':
        return (
          <RatingField
            {...commonProps}
            max={field.max}
            size={field.size}
          />
        )

      case 'phone':
      case 'input-tel':
        return (
          <PhoneField
            {...commonProps}
            countryCode={field.countryCode}
            international={field.international}
          />
        )

      case 'currency':
      case 'input-currency':
        return (
          <CurrencyField
            {...commonProps}
            currency={field.currency}
            locale={field.locale}
            showSymbol={field.showSymbol}
          />
        )

      case 'address':
      case 'address-complete':
        return (
          <AddressField
            {...commonProps}
            fields={field.fields}
            value={fieldValue}
            defaultValue={field.defaultValue}
          />
        )

      case 'color-picker':
      case 'color-palette':
        return (
          <ColorPickerField
            {...commonProps}
            palette={field.palette}
            showInput={field.showInput}
          />
        )

      case 'signature':
      case 'signature-pad':
        return (
          <SignatureField
            {...commonProps}
            width={field.width}
            height={field.height}
            backgroundColor={field.backgroundColor}
            penColor={field.penColor}
            showClear={field.showClear}
            value={fieldValue}
            defaultValue={field.defaultValue}
          />
        )

      case 'tags':
      case 'tags-input':
        return (
          <TagsField
            {...commonProps}
            value={fieldValue}
            defaultValue={field.defaultValue}
            placeholder={field.placeholder}
            maxTags={field.maxTags}
            suggestions={field.suggestions}
          />
        )

      // TODO: Add more field types (rich text, markdown, etc.)
      default:
        console.warn(`Unsupported field type: ${field.fieldType}`)
        return (
          <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-sm text-yellow-800">
              Field type "{field.fieldType}" is not yet implemented
            </p>
          </div>
        )
    }
  }

  return (
    <div className="space-y-8">
      {steps.map((step) => (
        <div key={step.stepId} className="form-step">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-gray-900">{step.stepName}</h2>
            {step.stepDescription && (
              <p className="mt-1 text-sm text-gray-500">{step.stepDescription}</p>
            )}
          </div>
          <div className="space-y-4">
            {step.fields.map((field) => (
              <div key={field.fieldId}>{renderField(field, step.stepId)}</div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

