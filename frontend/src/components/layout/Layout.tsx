import { ReactNode } from 'react'
import { Link } from 'react-router-dom'

interface LayoutProps {
  children: ReactNode
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link to="/" className="flex items-center space-x-2">
              <h1 className="text-2xl font-bold text-primary">Labuan FSA</h1>
              <span className="text-sm text-gray-500">E-Submission</span>
            </Link>
            <nav className="flex items-center space-x-4">
              <Link
                to="/forms"
                className="text-gray-700 hover:text-primary transition-colors"
              >
                Forms
              </Link>
              <Link
                to="/submissions"
                className="text-gray-700 hover:text-primary transition-colors"
              >
                My Submissions
              </Link>
              <Link
                to="/admin"
                className="text-gray-700 hover:text-primary transition-colors"
              >
                Admin
              </Link>
            </nav>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-gray-500">
            © 2025 Labuan FSA. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}

