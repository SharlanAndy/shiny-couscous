import { NavLink, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'

interface NavItem {
  path: string
  label: string
  icon: string
}

const navItems: NavItem[] = [
  { path: '/admin', label: 'Dashboard', icon: '📊' },
  { path: '/admin/submissions', label: 'Submissions', icon: '📝' },
  { path: '/admin/forms', label: 'Forms', icon: '📋' },
  { path: '/admin/analytics', label: 'Analytics', icon: '📈' },
  { path: '/admin/settings', label: 'Settings', icon: '⚙️' },
]

export function AdminNavigation() {
  const location = useLocation()

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-8">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/')

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={cn(
                  'flex items-center px-3 py-4 text-sm font-medium border-b-2 transition-colors',
                  isActive
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                )}
              >
                <span className="mr-2">{item.icon}</span>
                {item.label}
              </NavLink>
            )
          })}
        </div>
      </div>
    </nav>
  )
}

