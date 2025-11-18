import { ReactNode, useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'

interface LayoutProps {
  children: ReactNode
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation()
  const navRef = useRef<HTMLNavElement>(null)
  const activeLinkRef = useRef<HTMLAnchorElement>(null)

  // Check if current route is an admin route
  const isAdminRoute = location.pathname.startsWith('/admin')

  // User navigation links
  const userNavLinks = [
    { to: '/forms', label: 'Forms' },
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/submissions', label: 'My Submissions' },
    { to: '/settings', label: 'Settings' }, // Temporary menu for testing
    { to: '/reports', label: 'Reports & Analytics' }, // Temporary menu for testing
  ]

  // Admin navigation links
  const adminNavLinks = [
    { to: '/admin', label: 'Dashboard' },
    { to: '/admin/submissions', label: 'Submissions' },
    { to: '/admin/forms', label: 'Forms' },
    { to: '/admin/analytics', label: 'Analytics' },
    { to: '/admin/settings', label: 'Settings' },
  ]

  // Use appropriate navigation links based on route
  const navLinks = isAdminRoute ? adminNavLinks : userNavLinks

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
          <div className="flex justify-between items-center py-4 sm:py-5 lg:py-6 min-h-[60px] sm:min-h-[70px] gap-2 sm:gap-4">
            <Link to="/" className="flex items-center space-x-2 min-w-0 flex-shrink-0 md:flex-shrink-0">
              {/* Icon - Always visible */}
              <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-primary rounded-lg flex-shrink-0">
                <svg className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              {/* Title - Hidden on mobile, visible on desktop */}
              <div className="hidden md:flex md:flex-col md:items-start">
                <h1 className="text-xl lg:text-2xl xl:text-3xl font-bold text-primary truncate leading-tight">Labuan FSA</h1>
                <span className="text-xs lg:text-sm text-gray-500">E-Submission</span>
              </div>
            </Link>
            
            {/* Horizontal Navigation - Scrollable with auto-centering */}
            <nav 
              ref={navRef}
              className="flex items-center gap-2 sm:gap-3 md:gap-4 lg:gap-6 overflow-x-auto scrollbar-hide flex-1 justify-start md:justify-center px-2 sm:px-4 h-full min-w-0 snap-x snap-mandatory"
              style={{ 
                scrollbarWidth: 'none', 
                msOverflowStyle: 'none',
                WebkitOverflowScrolling: 'touch'
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
                      'text-sm sm:text-base lg:text-lg text-gray-700 hover:text-primary transition-colors px-3 sm:px-4 lg:px-5 py-2 sm:py-2.5 lg:py-3 rounded-md whitespace-nowrap flex-shrink-0 font-medium snap-center',
                      active && 'text-primary font-semibold bg-primary/10'
                    )}
                  >
                    {link.label}
                  </Link>
                )
              })}
              {/* Admin link hidden from public navigation - accessible via direct URL: /admin */}
            </nav>
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

