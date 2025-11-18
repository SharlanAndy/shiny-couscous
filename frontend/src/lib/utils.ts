import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Utility function to merge Tailwind CSS classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Check if a field should be displayed based on conditional logic
 */
export function shouldDisplayField(field: any, formData: any): boolean {
  if (!field.conditional || !field.conditional.field) {
    return true
  }

  const { field: conditionalField, operator, value } = field.conditional
  const fieldValue = formData[conditionalField]

  switch (operator) {
    case 'equals':
      return fieldValue === value
    case 'not_equals':
      return fieldValue !== value
    case 'contains':
      return Array.isArray(fieldValue) && fieldValue.includes(value)
    case 'not_contains':
      return Array.isArray(fieldValue) && !fieldValue.includes(value)
    case 'greater_than':
      return Number(fieldValue) > Number(value)
    case 'less_than':
      return Number(fieldValue) < Number(value)
    case 'is_empty':
      return !fieldValue || fieldValue === ''
    case 'is_not_empty':
      return !!fieldValue && fieldValue !== ''
    default:
      return true
  }
}

/**
 * Format file size to human-readable string
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

/**
 * Validate phone number
 */
export function isValidPhone(phone: string): boolean {
  // Basic phone validation - can be enhanced
  const phoneRegex = /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/
  return phoneRegex.test(phone.replace(/\s/g, ''))
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

/**
 * Throttle function
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}
