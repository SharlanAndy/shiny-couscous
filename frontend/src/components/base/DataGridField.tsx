import React, { useState } from 'react'
import { BaseFieldProps } from '@/types'
import { cn } from '@/lib/utils'

export interface DataGridColumn {
  name: string
  label: string
  type?: 'text' | 'number' | 'date' | 'select' | 'boolean'
  width?: number | string
  sortable?: boolean
  editable?: boolean
  options?: Array<{ value: string; label: string }>
}

export interface DataGridFieldProps extends BaseFieldProps {
  fieldType: 'data-grid' | 'data-table-advanced'
  columns: DataGridColumn[]
  value?: any[]
  defaultValue?: any[]
  pagination?: boolean
  pageSize?: number
  sortable?: boolean
  filterable?: boolean
  allowAddRows?: boolean
  allowRemoveRows?: boolean
  allowEdit?: boolean
}

export function DataGridField({
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
  columns = [],
  pagination = false,
  pageSize = 10,
  sortable = true,
  filterable = false,
  allowAddRows = true,
  allowRemoveRows = true,
  allowEdit = true,
  className,
}: DataGridFieldProps) {
  // Get field value
  const gridValue = value ?? defaultValue ?? []
  const [currentPage, setCurrentPage] = useState(1)
  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [filters, setFilters] = useState<Record<string, string>>({})

  // Handle cell change
  const handleCellChange = (rowIndex: number, columnName: string, newValue: any) => {
    if (readonly || disabled || !allowEdit) return

    const newGrid = gridValue.map((row, rIdx) =>
      rIdx === rowIndex ? { ...row, [columnName]: newValue } : row
    )
    onChange(newGrid)
  }

  // Handle add row
  const handleAddRow = () => {
    if (disabled || readonly) return

    const newRow: Record<string, any> = {}
    columns.forEach((col) => {
      newRow[col.name] = col.type === 'boolean' ? false : ''
    })
    onChange([...gridValue, newRow])
  }

  // Handle remove row
  const handleRemoveRow = (rowIndex: number) => {
    if (disabled || readonly || !allowRemoveRows) return

    const newGrid = gridValue.filter((_, idx) => idx !== rowIndex)
    onChange(newGrid)
  }

  // Handle sort
  const handleSort = (columnName: string) => {
    if (!sortable || disabled || readonly) return

    const newDirection =
      sortColumn === columnName && sortDirection === 'asc' ? 'desc' : 'asc'
    setSortColumn(columnName)
    setSortDirection(newDirection)

    // Sort data
    const sortedData = [...gridValue].sort((a, b) => {
      const aVal = a[columnName]
      const bVal = b[columnName]

      if (aVal === bVal) return 0

      const comparison = aVal > bVal ? 1 : -1
      return newDirection === 'asc' ? comparison : -comparison
    })

    onChange(sortedData)
  }

  // Paginate data
  const paginatedData = pagination
    ? gridValue.slice((currentPage - 1) * pageSize, currentPage * pageSize)
    : gridValue

  const totalPages = pagination ? Math.ceil(gridValue.length / pageSize) : 1

  // Merge styles
  const containerClassName = cn('mb-4', style?.containerClassName)

  if (hidden) {
    return null
  }

  return (
    <div className={containerClassName}>
      <div className="flex items-center justify-between mb-2">
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
        {allowAddRows && !readonly && (
          <button
            type="button"
            onClick={handleAddRow}
            disabled={disabled}
            className={cn(
              'btn btn-secondary btn-sm',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
          >
            + Add Row
          </button>
        )}
      </div>

      {/* Data grid */}
      <div className="overflow-x-auto border border-gray-300 rounded-md">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.name}
                  className={cn(
                    'px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider',
                    sortable && !readonly && 'cursor-pointer hover:bg-gray-100',
                    column.width && `w-[${column.width}]`
                  )}
                  onClick={() => handleSort(column.name)}
                >
                  <div className="flex items-center space-x-1">
                    <span>{column.label}</span>
                    {sortable && sortColumn === column.name && (
                      <span>{sortDirection === 'asc' ? '▲' : '▼'}</span>
                    )}
                  </div>
                </th>
              ))}
              {allowRemoveRows && !readonly && (
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedData.map((row, rowIndex) => {
              const actualIndex = pagination
                ? (currentPage - 1) * pageSize + rowIndex
                : rowIndex

              return (
                <tr key={actualIndex} className="hover:bg-gray-50">
                  {columns.map((column) => (
                    <td key={column.name} className="px-4 py-3 whitespace-nowrap">
                      {allowEdit && column.editable !== false && !readonly ? (
                        column.type === 'select' ? (
                          <select
                            value={row[column.name] || ''}
                            onChange={(e) => handleCellChange(actualIndex, column.name, e.target.value)}
                            onBlur={onBlur}
                            onFocus={onFocus}
                            disabled={disabled}
                            className="input input-sm w-full min-w-[120px]"
                          >
                            <option value="">Select...</option>
                            {column.options?.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                        ) : column.type === 'boolean' ? (
                          <input
                            type="checkbox"
                            checked={row[column.name] || false}
                            onChange={(e) => handleCellChange(actualIndex, column.name, e.target.checked)}
                            onBlur={onBlur}
                            onFocus={onFocus}
                            disabled={disabled}
                            className="input"
                          />
                        ) : (
                          <input
                            type={column.type || 'text'}
                            value={row[column.name] || ''}
                            onChange={(e) => handleCellChange(actualIndex, column.name, e.target.value)}
                            onBlur={onBlur}
                            onFocus={onFocus}
                            disabled={disabled}
                            className="input input-sm w-full min-w-[120px]"
                          />
                        )
                      ) : (
                        <span className="text-sm text-gray-900">
                          {column.type === 'boolean'
                            ? row[column.name]
                              ? 'Yes'
                              : 'No'
                            : row[column.name]}
                        </span>
                      )}
                    </td>
                  ))}
                  {allowRemoveRows && !readonly && (
                    <td className="px-4 py-3 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => handleRemoveRow(actualIndex)}
                        disabled={disabled}
                        className={cn(
                          'text-sm text-error hover:text-red-700 font-medium',
                          disabled && 'opacity-50 cursor-not-allowed'
                        )}
                      >
                        Remove
                      </button>
                    </td>
                  )}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-gray-700">
            Showing {(currentPage - 1) * pageSize + 1} to{' '}
            {Math.min(currentPage * pageSize, gridValue.length)} of {gridValue.length} entries
          </div>
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1 || disabled}
              className={cn(
                'btn btn-secondary btn-sm',
                (currentPage === 1 || disabled) && 'opacity-50 cursor-not-allowed'
              )}
            >
              Previous
            </button>
            <button
              type="button"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages || disabled}
              className={cn(
                'btn btn-secondary btn-sm',
                (currentPage === totalPages || disabled) && 'opacity-50 cursor-not-allowed'
              )}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Hidden input for form submission */}
      <input
        type="hidden"
        id={fieldId}
        name={fieldName}
        value={JSON.stringify(gridValue)}
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
    </div>
  )
}

