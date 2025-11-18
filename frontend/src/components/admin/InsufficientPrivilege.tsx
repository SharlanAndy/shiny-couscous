import React from 'react'
import { useNavigate } from 'react-router-dom'

interface InsufficientPrivilegeProps {
  message?: string
  requiredPermission?: string
}

export function InsufficientPrivilege({ 
  message = "You don't have sufficient privileges to access this resource.",
  requiredPermission 
}: InsufficientPrivilegeProps) {
  const navigate = useNavigate()

  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center max-w-md mx-auto p-8">
        <div className="mb-6">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100">
            <svg
              className="h-8 w-8 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Insufficient Privileges</h2>
        <p className="text-gray-600 mb-4">{message}</p>
        {requiredPermission && (
          <p className="text-sm text-gray-500 mb-6">
            Required permission: <span className="font-semibold">{requiredPermission}</span>
          </p>
        )}
        <div className="flex space-x-3 justify-center">
          <button
            onClick={() => navigate('/admin')}
            className="btn btn-primary"
          >
            Go to Dashboard
          </button>
          <button
            onClick={() => navigate(-1)}
            className="btn btn-secondary"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  )
}

