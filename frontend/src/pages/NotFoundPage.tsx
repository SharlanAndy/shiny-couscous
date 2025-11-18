import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="max-w-md w-full">
        {/* 404 Icon */}
        <div className="mb-6 sm:mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 lg:w-32 lg:h-32 bg-primary/10 rounded-full">
            <svg
              className="w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 text-primary"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        </div>

        {/* 404 Text */}
        <h1 className="text-6xl sm:text-7xl lg:text-8xl font-bold text-gray-900 mb-2 sm:mb-4">
          404
        </h1>
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-gray-800 mb-3 sm:mb-4">
          Page Not Found
        </h2>
        <p className="text-sm sm:text-base lg:text-lg text-gray-600 mb-6 sm:mb-8">
          Sorry, we couldn't find the page you're looking for. The page might have been moved,
          deleted, or doesn't exist.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
          <Link
            to="/"
            className="btn btn-primary w-full sm:w-auto text-sm sm:text-base px-6 sm:px-8 py-2.5 sm:py-3"
          >
            Go to Homepage
          </Link>
          <button
            onClick={() => window.history.back()}
            className="btn btn-secondary w-full sm:w-auto text-sm sm:text-base px-6 sm:px-8 py-2.5 sm:py-3"
          >
            Go Back
          </button>
        </div>

        {/* Helpful Links */}
        <div className="mt-8 sm:mt-10 pt-6 sm:pt-8 border-t border-gray-200">
          <p className="text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4">You might be looking for:</p>
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
            <Link
              to="/forms"
              className="text-xs sm:text-sm text-primary hover:text-primary-dark hover:underline"
            >
              Forms
            </Link>
            <span className="text-gray-300">•</span>
            <Link
              to="/dashboard"
              className="text-xs sm:text-sm text-primary hover:text-primary-dark hover:underline"
            >
              Dashboard
            </Link>
            <span className="text-gray-300">•</span>
            <Link
              to="/submissions"
              className="text-xs sm:text-sm text-primary hover:text-primary-dark hover:underline"
            >
              My Submissions
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

