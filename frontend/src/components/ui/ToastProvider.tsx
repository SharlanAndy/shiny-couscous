import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { Toast, ToastType } from './Toast'
import { ToastContainer } from './ToastContainer'

interface ToastContextType {
  showToast: (type: ToastType, message: string, title?: string, duration?: number) => void
  showSuccess: (message: string, title?: string, duration?: number) => void
  showError: (message: string, title?: string, duration?: number) => void
  showWarning: (message: string, title?: string, duration?: number) => void
  showInfo: (message: string, title?: string, duration?: number) => void
  dismissToast: (id: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const showToast = useCallback(
    (type: ToastType, message: string, title?: string, duration?: number) => {
      const id = `toast-${Date.now()}-${Math.random()}`
      const newToast: Toast = {
        id,
        type,
        message,
        title,
        duration: duration ?? 5000,
      }
      setToasts((prev) => [...prev, newToast])
    },
    []
  )

  const showSuccess = useCallback(
    (message: string, title?: string, duration?: number) => {
      showToast('success', message, title, duration)
    },
    [showToast]
  )

  const showError = useCallback(
    (message: string, title?: string, duration?: number) => {
      showToast('error', message, title, duration ?? 7000) // Errors stay longer
    },
    [showToast]
  )

  const showWarning = useCallback(
    (message: string, title?: string, duration?: number) => {
      showToast('warning', message, title, duration)
    },
    [showToast]
  )

  const showInfo = useCallback(
    (message: string, title?: string, duration?: number) => {
      showToast('info', message, title, duration)
    },
    [showToast]
  )

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  return (
    <ToastContext.Provider
      value={{
        showToast,
        showSuccess,
        showError,
        showWarning,
        showInfo,
        dismissToast,
      }}
    >
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

