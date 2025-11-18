import React, { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface Toast {
  id: string
  type: ToastType
  title?: string
  message: string
  duration?: number
}

interface ToastProps {
  toast: Toast
  onDismiss: (id: string) => void
}

export function ToastComponent({ toast, onDismiss }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [progress, setProgress] = useState(100)

  useEffect(() => {
    // Trigger animation
    setIsVisible(true)

    // Auto-dismiss timer
    const duration = toast.duration ?? 5000
    const startTime = Date.now()
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100)
      setProgress(remaining)

      if (remaining === 0) {
        handleDismiss()
      }
    }, 50)

    return () => clearInterval(interval)
  }, [toast.duration])

  const handleDismiss = () => {
    setIsVisible(false)
    setTimeout(() => onDismiss(toast.id), 300) // Wait for animation
  }

  const typeStyles = {
    success: {
      container: 'bg-white border-green-200 shadow-green-100',
      icon: 'bg-green-100 text-green-600',
      title: 'text-green-900',
      message: 'text-green-700',
      progress: 'bg-green-500',
    },
    error: {
      container: 'bg-white border-red-200 shadow-red-100',
      icon: 'bg-red-100 text-red-600',
      title: 'text-red-900',
      message: 'text-red-700',
      progress: 'bg-red-500',
    },
    warning: {
      container: 'bg-white border-yellow-200 shadow-yellow-100',
      icon: 'bg-yellow-100 text-yellow-600',
      title: 'text-yellow-900',
      message: 'text-yellow-700',
      progress: 'bg-yellow-500',
    },
    info: {
      container: 'bg-white border-blue-200 shadow-blue-100',
      icon: 'bg-blue-100 text-blue-600',
      title: 'text-blue-900',
      message: 'text-blue-700',
      progress: 'bg-blue-500',
    },
  }

  const icons = {
    success: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    ),
    error: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
    warning: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
    info: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  }

  const styles = typeStyles[toast.type]

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-lg border shadow-lg transition-all duration-300 ease-in-out',
        styles.container,
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      )}
      role="alert"
      aria-live={toast.type === 'error' ? 'assertive' : 'polite'}
    >
      <div className="flex items-start p-4">
        {/* Icon */}
        <div className={cn('flex-shrink-0 rounded-full p-2', styles.icon)}>
          {icons[toast.type]}
        </div>

        {/* Content */}
        <div className="ml-3 flex-1 min-w-0">
          {toast.title && (
            <p className={cn('text-sm font-semibold mb-1', styles.title)}>
              {toast.title}
            </p>
          )}
          <p className={cn('text-sm', styles.message)}>
            {toast.message}
          </p>
        </div>

        {/* Close Button */}
        <button
          type="button"
          onClick={handleDismiss}
          className={cn(
            'ml-4 flex-shrink-0 rounded-md p-1 transition-colors',
            'hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2',
            toast.type === 'success' && 'focus:ring-green-500',
            toast.type === 'error' && 'focus:ring-red-500',
            toast.type === 'warning' && 'focus:ring-yellow-500',
            toast.type === 'info' && 'focus:ring-blue-500'
          )}
          aria-label="Dismiss"
        >
          <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Progress Bar */}
      {toast.duration !== 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-100">
          <div
            className={cn('h-full transition-all duration-50 ease-linear', styles.progress)}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  )
}

