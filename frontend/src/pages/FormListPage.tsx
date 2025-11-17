import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import apiClient from '@/api/client'
import { FormResponse } from '@/types'

export function FormListPage() {
  const { data: forms, isLoading, error } = useQuery<FormResponse[]>({
    queryKey: ['forms'],
    queryFn: () => apiClient.getForms({ status: 'active' }),
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="mt-4 text-sm text-gray-500">Loading forms...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <p className="text-sm text-red-800">Error loading forms: {error.message}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Available Forms</h1>
        <p className="text-gray-600">Select a form to begin your submission</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {forms && forms.length > 0 ? (
          forms.map((form) => (
            <Link
              key={form.id}
              to={`/forms/${form.formId}`}
              className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <h3 className="text-lg font-semibold mb-2">{form.name}</h3>
              {form.description && (
                <p className="text-gray-600 text-sm mb-4">{form.description}</p>
              )}
              <div className="flex items-center justify-between">
                {form.estimatedTime && (
                  <span className="text-gray-500 text-xs">
                    ⏱️ {form.estimatedTime}
                  </span>
                )}
                <span className="text-primary text-sm font-medium">Start Form →</span>
              </div>
            </Link>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-500">No forms available at this time</p>
          </div>
        )}
      </div>
    </div>
  )
}

