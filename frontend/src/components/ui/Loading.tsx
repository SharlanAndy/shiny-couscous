import React from 'react'
import { cn } from '@/lib/utils'

export interface LoadingProps {
  /**
   * Loading message to display
   */
  message?: string
  /**
   * Size of the spinner: 'sm', 'md', 'lg'
   */
  size?: 'sm' | 'md' | 'lg'
  /**
   * Whether to show the message
   */
  showMessage?: boolean
  /**
   * Additional CSS classes
   */
  className?: string
  /**
   * Whether to show as inline (for buttons, etc.)
   */
  inline?: boolean
  /**
   * Whether to show full page overlay
   */
  overlay?: boolean
}

/**
 * Reusable Loading component for both user and admin frontends
 * 
 * Usage examples:
 * - Full page: <Loading message="Loading forms..." />
 * - Inline: <Loading inline size="sm" />
 * - Overlay: <Loading overlay message="Saving..." />
 */
export function Loading({
  message = 'Loading...',
  size = 'md',
  showMessage = true,
  className,
  inline = false,
  overlay = false,
}: LoadingProps) {
  const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-2',
    lg: 'h-12 w-12 border-4',
  }

  const spinner = (
    <div
      className={cn(
        'animate-spin rounded-full border-gray-300 border-t-blue-600',
        sizeClasses[size],
        className
      )}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">{message}</span>
    </div>
  )

  if (inline) {
    return (
      <span className="inline-flex items-center gap-2">
        {spinner}
        {showMessage && <span className="text-sm text-gray-600">{message}</span>}
      </span>
    )
  }

  if (overlay) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white rounded-lg p-6 shadow-xl flex flex-col items-center gap-4 min-w-[200px]">
          {spinner}
          {showMessage && <p className="text-gray-700 font-medium">{message}</p>}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-12">
      {spinner}
      {showMessage && <p className="text-gray-600">{message}</p>}
    </div>
  )
}

/**
 * Loading spinner for buttons and inline use
 */
export function LoadingSpinner({ size = 'sm', className }: { size?: 'sm' | 'md' | 'lg'; className?: string }) {
  return <Loading inline size={size} showMessage={false} className={className} />
}

