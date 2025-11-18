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
    <div className="space-y-8 sm:space-y-10 lg:space-y-12">
      {/* Hero Section */}
      <div className="text-center py-8 sm:py-10 lg:py-12 px-2">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
          Labuan FSA E-Submission System
        </h1>
        <p className="text-base sm:text-lg lg:text-xl text-gray-600 mb-6 sm:mb-8 px-2">
          Submit forms online, anytime, anywhere
        </p>
        <div className="flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-4 px-4">
          <Link to="/forms" className="btn btn-primary text-base sm:text-lg px-6 sm:px-8 py-2.5 sm:py-3 w-full sm:w-auto">
            Get Started
          </Link>
          <Link to="/submissions" className="btn btn-secondary text-base sm:text-lg px-6 sm:px-8 py-2.5 sm:py-3 w-full sm:w-auto">
            My Submissions
          </Link>
        </div>
      </div>

      {/* Features Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mt-8 sm:mt-10 lg:mt-12">
        <div className="bg-white p-4 sm:p-5 lg:p-6 rounded-lg shadow-sm">
          <div className="text-2xl sm:text-3xl mb-3 sm:mb-4">⚡</div>
          <h3 className="text-lg sm:text-xl font-semibold mb-2">Fast Processing</h3>
          <p className="text-sm sm:text-base text-gray-600">
            Submit your applications quickly and efficiently with our streamlined process.
          </p>
        </div>
        <div className="bg-white p-4 sm:p-5 lg:p-6 rounded-lg shadow-sm">
          <div className="text-2xl sm:text-3xl mb-3 sm:mb-4">✅</div>
          <h3 className="text-lg sm:text-xl font-semibold mb-2">Easy to Use</h3>
          <p className="text-sm sm:text-base text-gray-600">
            Simple and intuitive interface designed for all users.
          </p>
        </div>
        <div className="bg-white p-4 sm:p-5 lg:p-6 rounded-lg shadow-sm sm:col-span-2 lg:col-span-1">
          <div className="text-2xl sm:text-3xl mb-3 sm:mb-4">🔒</div>
          <h3 className="text-lg sm:text-xl font-semibold mb-2">Secure Platform</h3>
          <p className="text-sm sm:text-base text-gray-600">
            Your data is protected with industry-standard security measures.
          </p>
        </div>
      </div>

      {/* Available Forms Section */}
      <div className="mt-8 sm:mt-10 lg:mt-12">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-2 sm:gap-0">
          <h2 className="text-xl sm:text-2xl font-semibold">Available Forms</h2>
          <Link to="/forms" className="text-sm sm:text-base text-primary hover:text-primary-dark font-medium whitespace-nowrap">
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

