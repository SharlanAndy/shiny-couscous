import React, { useState } from 'react'
import { BaseFieldProps, FormField } from '@/types'
import { cn } from '@/lib/utils'

export interface TableFieldProps extends BaseFieldProps {
  fieldType: 'table' | 'data-table'
  columns?: Array<{ name: string; label: string; type?: string; required?: boolean }>
  value?: any[][]
  defaultValue?: any[][]
  minRows?: number
  maxRows?: number
  allowAddRows?: boolean
  allowRemoveRows?: boolean
}

export function TableField({
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
  columns = [{ name: 'col1', label: 'Column 1' }],
  minRows = 0,
  maxRows,
  allowAddRows = true,
  allowRemoveRows = true,
  className,
}: TableFieldProps) {
  // Get field value
  const tableValue = value ?? defaultValue ?? []

  // Initialize with empty row if empty
  React.useEffect(() => {
    if (tableValue.length === 0 && minRows > 0) {
      const initialRows = Array.from({ length: minRows }, () =>
        columns.map(() => '')
      )
      onChange(initialRows)
    }
  }, [])

  // Handle cell change
  const handleCellChange = (rowIndex: number, colIndex: number, newValue: any) => {
    const newTable = tableValue.map((row, rIdx) =>
      rIdx === rowIndex
        ? row.map((cell, cIdx) => (cIdx === colIndex ? newValue : cell))
        : row
    )
    onChange(newTable)
  }

  // Handle add row
  const handleAddRow = () => {
    if (maxRows && tableValue.length >= maxRows) return

    const newRow = columns.map(() => '')
    onChange([...tableValue, newRow])
  }

  // Handle remove row
  const handleRemoveRow = (rowIndex: number) => {
    if (minRows && tableValue.length <= minRows) return
    if (readonly || disabled) return

    const newTable = tableValue.filter((_, idx) => idx !== rowIndex)
    onChange(newTable)
  }

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
        {label}
        {tooltip && (
          <span className="ml-1 text-gray-400" title={tooltip}>
            ℹ️
          </span>
        )}
      </label>

      {/* Table */}
      <div className="overflow-x-auto border border-gray-300 rounded-md -mx-2 sm:mx-0">
        <div className="inline-block min-w-full align-middle">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {columns.map((column, colIndex) => (
                  <th
                    key={colIndex}
                    className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    <span className="truncate block">{column.label}</span>
                    {column.required && <span className="text-error"> *</span>}
                  </th>
                ))}
                {allowRemoveRows && !readonly && (
                  <th className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider w-16 sm:w-20">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tableValue.map((row, rowIndex) => (
                <tr key={rowIndex} className="hover:bg-gray-50">
                  {columns.map((column, colIndex) => (
                    <td key={colIndex} className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3">
                      <input
                        type={column.type || 'text'}
                        value={row[colIndex] ?? ''}
                        onChange={(e) => handleCellChange(rowIndex, colIndex, e.target.value)}
                        onBlur={onBlur}
                        onFocus={onFocus}
                        required={column.required}
                        disabled={disabled}
                        readOnly={readonly}
                        placeholder={column.label}
                        className="input w-full min-w-[100px] sm:min-w-[120px] text-xs sm:text-sm"
                      />
                    </td>
                  ))}
                  {allowRemoveRows && !readonly && (
                    <td className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3">
                      <button
                        type="button"
                        onClick={() => handleRemoveRow(rowIndex)}
                        disabled={disabled || (minRows ? tableValue.length <= minRows : false)}
                        className={cn(
                          'text-xs sm:text-sm text-error hover:text-red-700 font-medium whitespace-nowrap',
                          disabled && 'opacity-50 cursor-not-allowed'
                        )}
                      >
                        Remove
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add row button */}
      {allowAddRows && !readonly && (!maxRows || tableValue.length < maxRows) && (
        <button
          type="button"
          onClick={handleAddRow}
          disabled={disabled}
          className={cn(
            'btn btn-secondary mt-2',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        >
          + Add Row
        </button>
      )}

      {/* Hidden input for form submission */}
      <input type="hidden" name={fieldName} value={JSON.stringify(tableValue)} required={required && tableValue.length >= minRows} />

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

