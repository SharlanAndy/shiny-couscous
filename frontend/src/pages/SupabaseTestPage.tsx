/**
 * Supabase Connection Test Page
 * 
 * This page tests the Supabase connection using the credentials from .env.local
 * Based on Supabase React quickstart: https://supabase.com/docs/guides/getting-started/quickstarts/reactjs
 */

import { useEffect, useState } from 'react'
import { supabase, testSupabaseConnection } from '@/lib/supabase'

export function SupabaseTestPage() {
  const [connectionStatus, setConnectionStatus] = useState<{
    loading: boolean
    success: boolean | null
    message: string
    data?: any
  }>({
    loading: true,
    success: null,
    message: 'Testing connection...',
  })

  const [envVars, setEnvVars] = useState<{
    url: string
    anonKey: string
  } | null>(null)

  useEffect(() => {
    // Get environment variables (partial display for security)
    const url = import.meta.env.VITE_SUPABASE_URL
    const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

    setEnvVars({
      url: url || 'Not set',
      anonKey: anonKey ? `${anonKey.substring(0, 20)}...` : 'Not set',
    })

    // Test connection
    testSupabaseConnection().then((result) => {
      setConnectionStatus({
        loading: false,
        success: result.success,
        message: result.message,
        data: result.data,
      })
    })
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Supabase Connection Test
          </h1>

          {/* Environment Variables */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-3">
              Environment Variables
            </h2>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div>
                <span className="font-mono text-sm text-gray-600">
                  VITE_SUPABASE_URL:
                </span>
                <span className="ml-2 font-mono text-sm text-gray-900">
                  {envVars?.url || 'Loading...'}
                </span>
              </div>
              <div>
                <span className="font-mono text-sm text-gray-600">
                  VITE_SUPABASE_ANON_KEY:
                </span>
                <span className="ml-2 font-mono text-sm text-gray-900">
                  {envVars?.anonKey || 'Loading...'}
                </span>
              </div>
            </div>
          </div>

          {/* Connection Status */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-3">
              Connection Status
            </h2>
            <div
              className={`rounded-lg p-4 ${
                connectionStatus.loading
                  ? 'bg-yellow-50 border-2 border-yellow-200'
                  : connectionStatus.success
                  ? 'bg-green-50 border-2 border-green-200'
                  : 'bg-red-50 border-2 border-red-200'
              }`}
            >
              {connectionStatus.loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-yellow-600 mr-3"></div>
                  <span className="text-yellow-800">{connectionStatus.message}</span>
                </div>
              ) : (
                <div>
                  <p
                    className={`font-medium ${
                      connectionStatus.success ? 'text-green-800' : 'text-red-800'
                    }`}
                  >
                    {connectionStatus.message}
                  </p>
                  {connectionStatus.data && (
                    <pre className="mt-3 text-xs bg-white p-3 rounded overflow-auto">
                      {JSON.stringify(connectionStatus.data, null, 2)}
                    </pre>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Supabase Client Info */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-3">
              Supabase Client
            </h2>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-2">
                Client initialized: {supabase ? '✅ Yes' : '❌ No (not configured)'}
              </p>
              {supabase ? (
                <div className="mt-3 space-y-1">
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold">Supabase URL:</span>{' '}
                    <span className="font-mono">{supabase.supabaseUrl}</span>
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold">Client Type:</span> JavaScript/TypeScript
                  </p>
                </div>
              ) : (
                <div className="mt-3 space-y-1">
                  <p className="text-sm text-yellow-600">
                    ⚠️ Supabase not configured - features disabled
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to enable
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Test Query */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-3">
              Test Query
            </h2>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-3">
                Testing query to verify connection...
              </p>
              <button
                onClick={async () => {
                  setConnectionStatus({
                    loading: true,
                    success: null,
                    message: 'Testing connection...',
                  })
                  const result = await testSupabaseConnection()
                  setConnectionStatus({
                    loading: false,
                    success: result.success,
                    message: result.message,
                    data: result.data,
                  })
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Retest Connection
              </button>
            </div>
          </div>

          {/* Instructions */}
          <div className="border-t pt-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-3">
              Next Steps
            </h2>
            <ul className="list-disc list-inside space-y-2 text-sm text-gray-600">
              <li>
                If connection is successful, you can start using Supabase in your app
              </li>
              <li>
                Create tables in Supabase Dashboard → Table Editor
              </li>
              <li>
                Add Row Level Security (RLS) policies for your tables
              </li>
              <li>
                Use <code className="bg-gray-100 px-1 rounded">supabase.from('table_name').select()</code> to query data
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

