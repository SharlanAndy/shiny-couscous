import { Navigate, useLocation } from 'react-router-dom'
import { ReactNode } from 'react'

interface ProtectedRouteProps {
  children: ReactNode
  requireAuth?: boolean
  requireAdmin?: boolean
}

export function ProtectedRoute({ 
  children, 
  requireAuth = true,
  requireAdmin = false 
}: ProtectedRouteProps) {
  const location = useLocation()
  
  // Get auth state from localStorage
  const token = localStorage.getItem('token')
  const userStr = localStorage.getItem('user')
  const userRole = localStorage.getItem('userRole')
  
  let user: { id: string; email: string; name: string } | null = null
  try {
    if (userStr) {
      user = JSON.parse(userStr)
    }
  } catch (e) {
    console.error('Error parsing user data:', e)
  }
  
  const isAuthenticated = !!(token && user)
  // Any role that is not 'user' is considered an admin role (e.g., 'admin', 'superAdmin', 'test', etc.)
  const isAdmin = userRole && userRole !== 'user'
  const isUser = userRole === 'user'
  
  // Check if route matches user role
  const isAdminRoute = location.pathname.startsWith('/admin')
  const isUserRoute = !isAdminRoute && location.pathname !== '/login' && location.pathname !== '/register' && location.pathname !== '/forgot-password' && location.pathname !== '/admin/login'
  
  // If authentication is required but user is not authenticated
  if (requireAuth && !isAuthenticated) {
    // Redirect to appropriate login page
    const loginPath = requireAdmin ? '/admin/login' : '/login'
    return <Navigate to={loginPath} state={{ from: location }} replace />
  }
  
  // If admin is required but user is not admin
  if (requireAdmin && (!isAuthenticated || !isAdmin)) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />
  }
  
  // Prevent admin from accessing user routes
  if (isAuthenticated && isAdmin && isUserRoute && requireAuth) {
    // Admin trying to access user route - redirect to admin dashboard
    return <Navigate to="/admin" replace />
  }
  
  // Prevent user from accessing admin routes
  if (isAuthenticated && isUser && isAdminRoute) {
    // User trying to access admin route - redirect to user dashboard
    return <Navigate to="/dashboard" replace />
  }
  
  // User is authenticated and authorized
  return <>{children}</>
}

