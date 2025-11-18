import React, { useState, useEffect } from 'react'
import { FormField, FieldValidation, FieldStyle } from '@/types'
import { cn } from '@/lib/utils'

interface FieldPropertyEditorProps {
  field: FormField
  fieldTypes: Array<{ id: string; type: string; name: string; icon: string }>
  onUpdate: (field: FormField) => void
}

export function FieldPropertyEditor({ field, fieldTypes, onUpdate }: FieldPropertyEditorProps) {
  const [localField, setLocalField] = useState<FormField>(field)

  useEffect(() => {
    setLocalField(field)
  }, [field])

  const updateField = (updates: Partial<FormField>) => {
    const updated = { ...localField, ...updates }
    setLocalField(updated)
    onUpdate(updated)
  }

  const updateValidation = (updates: Partial<FieldValidation>) => {
    const validation = { ...localField.validation, ...updates } as FieldValidation
    updateField({ validation })
  }

  const updateStyle = (updates: Partial<FieldStyle>) => {
    const style = { ...localField.style, ...updates } as FieldStyle
    updateField({ style })
  }

  const addOption = () => {
    const options = [...(localField.options || []), { value: '', label: '' }]
    updateField({ options })
  }

  const updateOption = (index: number, updates: Partial<{ value: string; label: string }>) => {
    const options = [...(localField.options || [])]
    options[index] = { ...options[index], ...updates }
    updateField({ options })
  }

  const removeOption = (index: number) => {
    const options = localField.options?.filter((_, i) => i !== index) || []
    updateField({ options })
  }

  const fieldTypeInfo = fieldTypes.find((f) => f.type === localField.fieldType)

  return (
    <div className="space-y-4 text-sm">
      {/* Basic Properties */}
      <div className="space-y-3">
        <h4 className="text-xs font-semibold text-gray-700 uppercase">Basic</h4>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Field Type</label>
          <select
            value={localField.fieldType}
            onChange={(e) => updateField({ fieldType: e.target.value })}
            className="input w-full text-xs"
          >
            {fieldTypes.map((ft) => (
              <option key={ft.type} value={ft.type}>
                {ft.icon} {ft.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Field Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={localField.fieldName}
            onChange={(e) => updateField({ fieldName: e.target.value })}
            className="input w-full text-xs"
            placeholder="field_name"
          />
          <p className="text-xs text-gray-500 mt-1">Used as data key (snake_case)</p>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Label <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={localField.label}
            onChange={(e) => updateField({ label: e.target.value })}
            className="input w-full text-xs"
            placeholder="Field Label"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Placeholder</label>
          <input
            type="text"
            value={localField.placeholder || ''}
            onChange={(e) => updateField({ placeholder: e.target.value })}
            className="input w-full text-xs"
            placeholder="Enter placeholder text..."
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Help Text</label>
          <textarea
            value={localField.helpText || ''}
            onChange={(e) => updateField({ helpText: e.target.value })}
            className="input w-full text-xs"
            rows={2}
            placeholder="Additional help text..."
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Tooltip</label>
          <input
            type="text"
            value={localField.tooltip || ''}
            onChange={(e) => updateField({ tooltip: e.target.value })}
            className="input w-full text-xs"
            placeholder="Tooltip text..."
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Default Value</label>
          <input
            type="text"
            value={localField.defaultValue || ''}
            onChange={(e) => updateField({ defaultValue: e.target.value })}
            className="input w-full text-xs"
            placeholder="Default value..."
          />
        </div>
      </div>

      {/* Options */}
      {['select', 'radio', 'checkbox'].includes(localField.fieldType) && (
        <div className="space-y-3 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-semibold text-gray-700 uppercase">Options</h4>
            <button
              onClick={addOption}
              className="text-xs text-primary hover:text-primary-dark"
            >
              + Add Option
            </button>
          </div>
          {localField.options?.map((option, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                value={option.value}
                onChange={(e) => updateOption(index, { value: e.target.value })}
                className="input flex-1 text-xs"
                placeholder="Value"
              />
              <input
                type="text"
                value={option.label}
                onChange={(e) => updateOption(index, { label: e.target.value })}
                className="input flex-1 text-xs"
                placeholder="Label"
              />
              <button
                onClick={() => removeOption(index)}
                className="text-red-600 hover:text-red-700 text-xs px-2"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {/* File Upload Properties */}
      {(localField.fieldType === 'file-upload' || localField.fieldType.startsWith('upload-')) && (
        <div className="space-y-3 pt-4 border-t border-gray-200">
          <h4 className="text-xs font-semibold text-gray-700 uppercase">Upload Settings</h4>

          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={localField.multiple || false}
                onChange={(e) => updateField({ multiple: e.target.checked })}
                className="checkbox"
              />
              <span className="text-xs text-gray-700">Allow Multiple Files</span>
            </label>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Accepted File Types</label>
            <input
              type="text"
              value={Array.isArray(localField.accept) ? localField.accept.join(', ') : (localField.accept || '')}
              onChange={(e) => {
                const accept = e.target.value.split(',').map((s) => s.trim()).filter(Boolean)
                updateField({ accept })
              }}
              className="input w-full text-xs"
              placeholder="image/*, video/*, .pdf"
            />
            <p className="text-xs text-gray-500 mt-1">e.g., image/*, video/*, .pdf, .doc</p>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Max File Size (MB)</label>
            <input
              type="number"
              value={localField.maxSize ? localField.maxSize / (1024 * 1024) : 10}
              onChange={(e) => updateField({ maxSize: parseFloat(e.target.value) * 1024 * 1024 })}
              className="input w-full text-xs"
              placeholder="10"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Max Files</label>
            <input
              type="number"
              value={localField.maxFiles || 1}
              onChange={(e) => updateField({ maxFiles: parseInt(e.target.value) || 1 })}
              className="input w-full text-xs"
              placeholder="1"
            />
          </div>
        </div>
      )}

      {/* Validation */}
      <div className="space-y-3 pt-4 border-t border-gray-200">
        <h4 className="text-xs font-semibold text-gray-700 uppercase">Validation</h4>

        <div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={localField.required || false}
              onChange={(e) => updateField({ required: e.target.checked })}
              className="checkbox"
            />
            <span className="text-xs text-gray-700">Required</span>
          </label>
        </div>

        {['input-text', 'input-email', 'textarea'].includes(localField.fieldType) && (
          <>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Min Length</label>
              <input
                type="number"
                value={localField.validation?.minLength || ''}
                onChange={(e) => updateValidation({ minLength: parseInt(e.target.value) || undefined })}
                className="input w-full text-xs"
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Max Length</label>
              <input
                type="number"
                value={localField.validation?.maxLength || ''}
                onChange={(e) => updateValidation({ maxLength: parseInt(e.target.value) || undefined })}
                className="input w-full text-xs"
                placeholder="255"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Pattern (Regex)</label>
              <input
                type="text"
                value={localField.validation?.pattern || ''}
                onChange={(e) => updateValidation({ pattern: e.target.value || undefined })}
                className="input w-full text-xs font-mono"
                placeholder="^[A-Za-z]+$"
              />
            </div>
          </>
        )}

        {['input-number', 'currency'].includes(localField.fieldType) && (
          <>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Min Value</label>
              <input
                type="number"
                value={localField.validation?.min || ''}
                onChange={(e) => updateValidation({ min: parseFloat(e.target.value) || undefined })}
                className="input w-full text-xs"
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Max Value</label>
              <input
                type="number"
                value={localField.validation?.max || ''}
                onChange={(e) => updateValidation({ max: parseFloat(e.target.value) || undefined })}
                className="input w-full text-xs"
                placeholder="100"
              />
            </div>
          </>
        )}

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Error Message</label>
          <input
            type="text"
            value={localField.validation?.errorMessage || ''}
            onChange={(e) => updateValidation({ errorMessage: e.target.value || undefined })}
            className="input w-full text-xs"
            placeholder="Custom error message..."
          />
        </div>
      </div>

      {/* Display Settings */}
      <div className="space-y-3 pt-4 border-t border-gray-200">
        <h4 className="text-xs font-semibold text-gray-700 uppercase">Display</h4>

        <div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={localField.disabled || false}
              onChange={(e) => updateField({ disabled: e.target.checked })}
              className="checkbox"
            />
            <span className="text-xs text-gray-700">Disabled</span>
          </label>
        </div>

        <div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={localField.readonly || false}
              onChange={(e) => updateField({ readonly: e.target.checked })}
              className="checkbox"
            />
            <span className="text-xs text-gray-700">Read Only</span>
          </label>
        </div>

        <div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={localField.hidden || false}
              onChange={(e) => updateField({ hidden: e.target.checked })}
              className="checkbox"
            />
            <span className="text-xs text-gray-700">Hidden</span>
          </label>
        </div>
      </div>

      {/* CSS Styling */}
      <div className="space-y-3 pt-4 border-t border-gray-200">
        <h4 className="text-xs font-semibold text-gray-700 uppercase">CSS Classes</h4>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Container Class</label>
          <input
            type="text"
            value={localField.style?.containerClassName || ''}
            onChange={(e) => updateStyle({ containerClassName: e.target.value || undefined })}
            className="input w-full text-xs font-mono"
            placeholder="mb-4 custom-class"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Label Class</label>
          <input
            type="text"
            value={localField.style?.labelClassName || ''}
            onChange={(e) => updateStyle({ labelClassName: e.target.value || undefined })}
            className="input w-full text-xs font-mono"
            placeholder="font-bold text-lg"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Input Class</label>
          <input
            type="text"
            value={localField.style?.className || ''}
            onChange={(e) => updateStyle({ className: e.target.value || undefined })}
            className="input w-full text-xs font-mono"
            placeholder="w-full border-2"
          />
        </div>
      </div>
    </div>
  )
}

