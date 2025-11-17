import React from 'react'
import { BaseFieldProps } from '@/types'
import { cn } from '@/lib/utils'

export type MessageType = 'error' | 'warning' | 'success' | 'info'

export interface MessageDisplayProps {
  fieldId: string
  type: MessageType
  message: string
  title?: string
  dismissible?: boolean
  onDismiss?: () => void
  style?: BaseFieldProps['style']
  hidden?: boolean
}

export function MessageDisplay({
  fieldId,
  type,
  message,
  title,
  dismissible = false,
  onDismiss,
  style,
  hidden,
}: MessageDisplayProps) {
  if (hidden || !message) return null

  const typeStyles = {
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    success: 'bg-green-50 border-green-200 text-green-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
  }

  const icons = {
    error: '❌',
    warning: '⚠️',
    success: '✅',
    info: 'ℹ️',
  }

  return (
    <div
      id={fieldId}
      className={cn(
        'mb-4 p-4 border rounded-md',
        typeStyles[type],
        style?.className
      )}
      style={style?.style}
      role="alert"
      aria-live={type === 'error' ? 'assertive' : 'polite'}
    >
      <div className="flex items-start">
        <div className="flex-shrink-0 mr-3 text-lg">{icons[type]}</div>
        <div className="flex-1">
          {title && (
            <div className="font-semibold mb-1">{title}</div>
          )}
          <div className="text-sm">{message}</div>
        </div>
        {dismissible && onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            className="flex-shrink-0 ml-3 text-gray-400 hover:text-gray-600"
            aria-label="Dismiss"
          >
            ×
          </button>
        )}
      </div>
    </div>
  )
}

