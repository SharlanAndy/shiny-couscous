import { ReactNode, useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'
import apiClient from '@/api/client'
import { isAdminRole, preloadAdminRoles, isAdminRoleSync, getRolePermissions } from '@/lib/role-utils'

interface LayoutProps {
  children: ReactNode
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const navRef = useRef<HTMLElement>(null)
  const activeLinkRef = useRef<HTMLAnchorElement>(null)
  
  // Get user info from localStorage
  const [user, setUser] = useState<{id: string; email: string; name: string} | null>(null)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userPermissions, setUserPermissions] = useState<string[]>([])

  // Check if current route is an admin route
  const isAdminRoute = location.pathname.startsWith('/admin')

  // Load user info on mount and when location changes
  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    const storedRole = localStorage.getItem('userRole')
    const token = localStorage.getItem('token')
    
    // Separate admin and user sessions based on route
    if (isAdminRoute) {
      // On admin routes, check if role is an admin role dynamically
      if (storedUser && token && storedRole && storedRole !== 'user') {
        // Preload roles and check if it's an admin role
        preloadAdminRoles().then(() => {
          isAdminRole(storedRole).then((isAdmin) => {
            if (isAdmin) {
              try {
                setUser(JSON.parse(storedUser))
                setUserRole(storedRole)
                setIsAuthenticated(true)
                // Load permissions for this role
                getRolePermissions(storedRole).then(setUserPermissions)
              } catch (e) {
                console.error('Error parsing user data:', e)
                setUser(null)
                setUserRole(null)
                setIsAuthenticated(false)
                setUserPermissions([])
              }
            } else {
              // Not an admin role, clear session
              setUser(null)
              setUserRole(null)
              setIsAuthenticated(false)
              setUserPermissions([])
            }
          })
        })
        // For immediate check, use sync version (may be false if cache not loaded yet)
        if (isAdminRoleSync(storedRole)) {
          try {
            setUser(JSON.parse(storedUser))
            setUserRole(storedRole)
            setIsAuthenticated(true)
          } catch (e) {
            console.error('Error parsing user data:', e)
          }
        }
      } else {
        // Clear user session if not admin on admin route
        setUser(null)
        setUserRole(null)
        setIsAuthenticated(false)
      }
    } else {
      // On user routes, only show user session (not admin)
      if (storedUser && token && storedRole === 'user') {
        try {
          setUser(JSON.parse(storedUser))
          setUserRole(storedRole)
          setIsAuthenticated(true)
        } catch (e) {
          console.error('Error parsing user data:', e)
          setUser(null)
          setUserRole(null)
          setIsAuthenticated(false)
        }
      } else {
        // Clear admin session if on user route
        setUser(null)
        setUserRole(null)
        setIsAuthenticated(false)
      }
    }
  }, [location.pathname, isAdminRoute])

  // Handle logout
  const handleLogout = async () => {
    try {
      await apiClient.logout()
    } catch (e) {
      console.error('Logout error:', e)
    } finally {
      // Get role before clearing state
      const currentRole = userRole
      setUser(null)
      setUserRole(null)
      setIsAuthenticated(false)
      // Redirect to appropriate login page based on role (not just route)
      if ((currentRole && currentRole !== 'user') || isAdminRoute) {
        navigate('/admin/login')
      } else {
        navigate('/login')
      }
    }
  }

  // User navigation links
  const userNavLinks = [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/forms', label: 'Forms' },
    { to: '/submissions', label: 'My Submissions' },
    { to: '/profile', label: 'Profile' },
  ]

  // Admin navigation links with required permissions
  const adminNavLinks = [
    { to: '/admin', label: 'Dashboard', permission: 'view_dashboard' },
    { to: '/admin/submissions', label: 'Submissions', permission: 'review_submissions' },
    { to: '/admin/forms', label: 'Forms', permission: 'manage_forms' },
    { to: '/admin/users', label: 'Users', permission: 'manage_users' },
    { to: '/admin/admins', label: 'Admins', permission: 'manage_admins' },
    { to: '/admin/roles', label: 'Roles', permission: 'manage_roles' },
    { to: '/admin/analytics', label: 'Analytics', permission: 'view_analytics' },
    { to: '/admin/settings', label: 'Settings', permission: 'manage_settings' },
  ]

  // Filter admin nav links based on user permissions
  const filteredAdminNavLinks = isAdminRoute && userPermissions.length > 0
    ? adminNavLinks.filter(link => !link.permission || userPermissions.includes(link.permission))
    : adminNavLinks

  // Use appropriate navigation links based on route
  const navLinks = isAdminRoute ? filteredAdminNavLinks : userNavLinks

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === path
    if (path === '/admin') return location.pathname === '/admin' // Exact match for /admin
    return location.pathname.startsWith(path)
  }

  // Center active menu item when clicked/selected
  useEffect(() => {
    if (activeLinkRef.current && navRef.current) {
      const nav = navRef.current
      const activeLink = activeLinkRef.current
      
      // Calculate scroll position to center the active link
      const navRect = nav.getBoundingClientRect()
      const linkRect = activeLink.getBoundingClientRect()
      const navWidth = navRect.width
      const linkWidth = linkRect.width
      const linkOffsetLeft = activeLink.offsetLeft
      
      // Center the link in the visible area
      const scrollLeft = linkOffsetLeft - (navWidth / 2) + (linkWidth / 2)
      
      // Use requestAnimationFrame to ensure DOM is ready
      requestAnimationFrame(() => {
        nav.scrollTo({
          left: Math.max(0, scrollLeft),
          behavior: 'smooth'
        })
      })
    }
  }, [location.pathname])
  
  // Handle click to ensure centering happens on click as well
  const handleLinkClick = (linkTo: string) => {
    // Small delay to allow React Router to update location
    setTimeout(() => {
      if (activeLinkRef.current && navRef.current) {
        const nav = navRef.current
        const activeLink = activeLinkRef.current
        
        const navRect = nav.getBoundingClientRect()
        const linkRect = activeLink.getBoundingClientRect()
        const navWidth = navRect.width
        const linkWidth = linkRect.width
        const linkOffsetLeft = activeLink.offsetLeft
        
        const scrollLeft = linkOffsetLeft - (navWidth / 2) + (linkWidth / 2)
        
        nav.scrollTo({
          left: Math.max(0, scrollLeft),
          behavior: 'smooth'
        })
      }
    }, 50)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
          <div className="flex items-center py-3 sm:py-4 min-h-[56px] sm:min-h-[64px] gap-1 sm:gap-2">
            {/* Logo - Compact, minimal space */}
            <Link to="/" className="flex items-center space-x-1.5 sm:space-x-2 flex-shrink-0">
              {/* Icon - Smaller on mobile */}
              <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-primary rounded-lg flex-shrink-0">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              {/* Title - Hidden on very small screens */}
              <div className="hidden sm:flex sm:flex-col sm:items-start">
                <h1 className="text-lg sm:text-xl font-bold text-primary truncate leading-tight">Labuan FSA</h1>
                <span className="text-xs text-gray-500 hidden md:inline">E-Submission</span>
              </div>
            </Link>
            
            {/* Horizontal Navigation - Scrollable, takes maximum space */}
            <nav 
              ref={navRef}
              className="flex items-center gap-1.5 sm:gap-2 md:gap-3 overflow-x-auto scrollbar-hide flex-1 min-w-0 justify-start px-1 sm:px-2 h-full relative z-10"
              style={{ 
                scrollbarWidth: 'none', 
                msOverflowStyle: 'none',
                WebkitOverflowScrolling: 'touch',
                flexBasis: 0,
                overflowY: 'hidden',
                touchAction: 'pan-x',
                WebkitTapHighlightColor: 'transparent'
              }}
            >
              {navLinks.map((link) => {
                const active = isActive(link.to)
                return (
                  <Link
                    key={link.to}
                    ref={active ? activeLinkRef : null}
                    to={link.to}
                    onClick={() => handleLinkClick(link.to)}
                    className={cn(
                      'text-xs sm:text-sm md:text-base text-gray-700 hover:text-primary transition-colors px-2 sm:px-3 py-1.5 sm:py-2 rounded-md whitespace-nowrap flex-shrink-0 font-medium cursor-pointer relative z-10',
                      active && 'text-primary font-semibold bg-primary/10'
                    )}
                    style={{ pointerEvents: 'auto', touchAction: 'manipulation' }}
                  >
                    {link.label}
                  </Link>
                )
              })}
            </nav>
            
            {/* User Profile & Logout - Minimal space, compact */}
            <div className="flex items-center gap-1 flex-shrink-0 ml-1">
              {isAuthenticated && user ? (
                <div className="flex items-center gap-1">
                  {/* User Profile - Hidden on small screens */}
                  <div className="hidden lg:flex flex-col items-end">
                    <span className="text-xs font-medium text-gray-900 truncate max-w-[100px]">
                      {user.name || user.email.split('@')[0]}
                    </span>
                  </div>
                  
                  {/* User Avatar - Smaller */}
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary text-white flex items-center justify-center text-xs font-semibold flex-shrink-0">
                    {(user.name || user.email).charAt(0).toUpperCase()}
                  </div>
                  
                  {/* Logout Button - Compact */}
                  <button
                    onClick={handleLogout}
                    className="px-2 py-1.5 text-xs sm:text-sm font-medium text-gray-700 hover:text-primary hover:bg-gray-100 rounded-md transition-colors whitespace-nowrap flex-shrink-0"
                    title="Logout"
                  >
                    <span className="hidden sm:inline">Logout</span>
                    <span className="sm:hidden">Out</span>
                  </button>
                </div>
              ) : (
                <Link
                  to={isAdminRoute ? '/admin/login' : '/login'}
                  className="px-2 py-1.5 text-xs sm:text-sm font-medium text-primary hover:bg-primary/10 rounded-md transition-colors whitespace-nowrap flex-shrink-0"
                >
                  <span className="hidden sm:inline">Login</span>
                  <span className="sm:hidden">In</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {children}
      </main>
      <footer className="bg-white border-t mt-8 sm:mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <p className="text-center text-xs sm:text-sm text-gray-500">
            © 2025 Labuan FSA. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}

