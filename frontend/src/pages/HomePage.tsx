import { Link } from 'react-router-dom'

export function HomePage() {
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
        <Link to="/forms" className="btn btn-primary text-lg px-8 py-3">
          Get Started
        </Link>
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
        <h2 className="text-2xl font-semibold mb-6">Available Forms</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Placeholder form cards */}
          <Link
            to="/forms/form-a"
            className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
            <h3 className="text-lg font-semibold mb-2">Form A: Business License</h3>
            <p className="text-gray-600 text-sm mb-4">
              Application for new business license
            </p>
            <span className="text-primary text-sm font-medium">Start Form →</span>
          </Link>
        </div>
      </div>
    </div>
  )
}

