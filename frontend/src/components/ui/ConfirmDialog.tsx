import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface ConfirmDialogOptions {
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  confirmButtonClass?: string
  onConfirm: () => void
  onCancel?: () => void
}

interface ConfirmDialogContextType {
  showConfirm: (options: ConfirmDialogOptions) => void
}

const ConfirmDialogContext = createContext<ConfirmDialogContextType | undefined>(undefined)

export function ConfirmDialogProvider({ children }: { children: ReactNode }) {
  const [dialog, setDialog] = useState<ConfirmDialogOptions | null>(null)

  const showConfirm = useCallback((options: ConfirmDialogOptions) => {
    setDialog(options)
  }, [])

  const handleConfirm = () => {
    if (dialog) {
      dialog.onConfirm()
      setDialog(null)
    }
  }

  const handleCancel = () => {
    if (dialog) {
      if (dialog.onCancel) {
        dialog.onCancel()
      }
      setDialog(null)
    }
  }

  return (
    <ConfirmDialogContext.Provider value={{ showConfirm }}>
      {children}
      {dialog && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
            onClick={handleCancel}
          />
          
          {/* Dialog */}
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              {/* Title */}
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {dialog.title}
              </h3>
              
              {/* Message */}
              <p className="text-sm text-gray-600 mb-6">
                {dialog.message}
              </p>
              
              {/* Actions */}
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                  {dialog.cancelText || 'Cancel'}
                </button>
                <button
                  type="button"
                  onClick={handleConfirm}
                  className={cn(
                    'px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500',
                    dialog.confirmButtonClass || 'bg-red-600 hover:bg-red-700'
                  )}
                >
                  {dialog.confirmText || 'Confirm'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </ConfirmDialogContext.Provider>
  )
}

export function useConfirmDialog() {
  const context = useContext(ConfirmDialogContext)
  if (context === undefined) {
    throw new Error('useConfirmDialog must be used within a ConfirmDialogProvider')
  }
  return context
}

