import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import apiClient from '@/api/client'
import { FormResponse } from '@/types'

export function HomePage() {
  const { data: forms, isLoading } = useQuery<FormResponse[]>({
    queryKey: ['home-forms'],
    queryFn: () => apiClient.getForms({ status: 'active' }),
  })

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <div className="text-center py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Labuan FSA E-Submission System
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Submit forms online, anytime, anywhere
        </p>
        <div className="flex justify-center space-x-4">
          <Link to="/forms" className="btn btn-primary text-lg px-8 py-3">
            Get Started
          </Link>
          <Link to="/submissions" className="btn btn-secondary text-lg px-8 py-3">
            My Submissions
          </Link>
        </div>
      </div>

      {/* Features Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="text-3xl mb-4">⚡</div>
          <h3 className="text-xl font-semibold mb-2">Fast Processing</h3>
          <p className="text-gray-600">
            Submit your applications quickly and efficiently with our streamlined process.
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="text-3xl mb-4">✅</div>
          <h3 className="text-xl font-semibold mb-2">Easy to Use</h3>
          <p className="text-gray-600">
            Simple and intuitive interface designed for all users.
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="text-3xl mb-4">🔒</div>
          <h3 className="text-xl font-semibold mb-2">Secure Platform</h3>
          <p className="text-gray-600">
            Your data is protected with industry-standard security measures.
          </p>
        </div>
      </div>

      {/* Available Forms Section */}
      <div className="mt-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold">Available Forms</h2>
          <Link to="/forms" className="text-primary hover:text-primary-dark font-medium">
            View All →
          </Link>
        </div>
        {isLoading ? (
          <div className="text-center py-12 text-gray-500">Loading forms...</div>
        ) : forms && forms.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {forms.slice(0, 6).map((form) => (
              <Link
                key={form.id}
                to={`/forms/${form.formId}`}
                className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                <h3 className="text-lg font-semibold mb-2">{form.name}</h3>
                {form.description && (
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{form.description}</p>
                )}
                <div className="flex items-center justify-between">
                  {form.estimatedTime && (
                    <span className="text-gray-500 text-xs">⏱️ {form.estimatedTime}</span>
                  )}
                  <span className="text-primary text-sm font-medium">Start Form →</span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <p>No forms available at this time</p>
          </div>
        )}
      </div>
    </div>
  )
}

