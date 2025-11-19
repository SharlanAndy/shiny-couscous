/**
 * Role utility functions for checking admin roles dynamically
 */

import { getGitHubClient, isGitHubConfigured } from '@/api/github-client'
import axios from 'axios'

// Cache for admin roles to avoid repeated API calls
let adminRolesCache: { roles: Array<{ name: string; isActive: boolean; permissions?: string[] }>; timestamp: number } | null = null
const ADMIN_ROLES_CACHE_TTL = 5 * 60 * 1000 // 5 minutes

/**
 * Read admin_roles.json from backend API (for local development)
 */
async function readAdminRolesFromBackend(): Promise<{ version: string; lastUpdated: string; roles: Array<{ name: string; isActive: boolean; permissions?: string[] }> }> {
  const apiURL = import.meta.env.VITE_API_URL || 'http://localhost:8000'
  
  try {
    // Use the backend API endpoint for admin roles
    const response = await axios.get(`${apiURL}/api/admin/roles`, {
      timeout: 5000,
      headers: {
        'Content-Type': 'application/json',
      },
    })
    
    if (response.data) {
      return response.data
    }
  } catch (error: any) {
    console.warn('[role-utils] Could not read admin_roles.json from backend:', error.message)
    if (error.response?.status === 404) {
      console.warn('[role-utils] Admin roles endpoint not found. Make sure backend is running and endpoint exists.')
    }
  }
  
  // Fallback: return empty roles structure
  return {
    version: '1.0.0',
    lastUpdated: new Date().toISOString(),
    roles: [],
  }
}

/**
 * Check if a role is an admin role by reading admin_roles.json
 * Returns true if the role exists in admin_roles.json and is active
 */
export async function isAdminRole(roleName: string | null | undefined): Promise<boolean> {
  if (!roleName || roleName === 'user') {
    return false
  }

  try {
    // Check cache first
    const now = Date.now()
    if (adminRolesCache && (now - adminRolesCache.timestamp) < ADMIN_ROLES_CACHE_TTL) {
      return adminRolesCache.roles.some((r) => r.name === roleName && r.isActive)
    }

    // Fetch from GitHub or backend API
    const github = getGitHubClient()
    let data: { version: string; lastUpdated: string; roles: Array<{ name: string; isActive: boolean; permissions?: string[] }> }
    
    if (!github) {
      // GitHub client not available (local development mode) - use backend API
      if (import.meta.env.DEV) {
        console.log('[role-utils] Using backend API to read admin_roles.json')
      }
      data = await readAdminRolesFromBackend()
    } else {
      // Use GitHub API
      const result = await github.readJsonFile<{ version: string; lastUpdated: string; roles: Array<{ name: string; isActive: boolean; permissions?: string[] }> }>(
        'backend/data/admin_roles.json'
      )
      data = result.data
    }

    // Update cache
    adminRolesCache = {
      roles: data.roles || [],
      timestamp: now,
    }

    // Check if role exists and is active
    return adminRolesCache.roles.some((r) => r.name === roleName && r.isActive)
  } catch (error) {
    console.error('Error checking admin role:', error)
    // Fallback: if we can't read roles, assume any non-user role is admin
    return roleName !== 'user'
  }
}

/**
 * Synchronous version that uses cache (may return false if cache is empty)
 * Use this for client-side checks where async is not possible
 */
export function isAdminRoleSync(roleName: string | null | undefined): boolean {
  if (!roleName || roleName === 'user') {
    return false
  }

  // If cache exists and is valid, use it
  if (adminRolesCache) {
    const now = Date.now()
    if ((now - adminRolesCache.timestamp) < ADMIN_ROLES_CACHE_TTL) {
      return adminRolesCache.roles.some((r) => r.name === roleName && r.isActive)
    }
  }

  // Cache miss - return false and let async version handle it
  // This is a fallback for synchronous contexts
  return false
}

/**
 * Preload admin roles cache (useful for React components)
 */
export async function preloadAdminRoles(): Promise<void> {
  if (adminRolesCache) {
    const now = Date.now()
    if ((now - adminRolesCache.timestamp) < ADMIN_ROLES_CACHE_TTL) {
      return // Cache is still valid
    }
  }

  try {
    const github = getGitHubClient()
    let data: { version: string; lastUpdated: string; roles: Array<{ name: string; isActive: boolean; permissions?: string[] }> }
    
    if (!github) {
      // GitHub client not available (local development mode) - use backend API
      if (import.meta.env.DEV) {
        console.log('[role-utils] Using backend API to preload admin_roles.json')
      }
      data = await readAdminRolesFromBackend()
    } else {
      // Use GitHub API
      const result = await github.readJsonFile<{ version: string; lastUpdated: string; roles: Array<{ name: string; isActive: boolean; permissions?: string[] }> }>(
        'backend/data/admin_roles.json'
      )
      data = result.data
    }

    adminRolesCache = {
      roles: data.roles || [],
      timestamp: Date.now(),
    }
  } catch (error) {
    console.error('Error preloading admin roles:', error)
  }
}

/**
 * Get permissions for a specific role
 */
export async function getRolePermissions(roleName: string | null | undefined): Promise<string[]> {
  if (!roleName || roleName === 'user') {
    return []
  }

  try {
    // Ensure cache is loaded
    await preloadAdminRoles()

    if (adminRolesCache) {
      const role = adminRolesCache.roles.find((r) => r.name === roleName && r.isActive)
      return (role as any)?.permissions || []
    }

    // If cache not available, fetch directly
    const github = getGitHubClient()
    let data: { version: string; lastUpdated: string; roles: Array<{ name: string; isActive: boolean; permissions?: string[] }> }
    
    if (!github) {
      // GitHub client not available (local development mode) - use backend API
      if (import.meta.env.DEV) {
        console.log('[role-utils] Using backend API to read admin_roles.json for permissions')
      }
      data = await readAdminRolesFromBackend()
    } else {
      // Use GitHub API
      const result = await github.readJsonFile<{ version: string; lastUpdated: string; roles: Array<{ name: string; isActive: boolean; permissions?: string[] }> }>(
        'backend/data/admin_roles.json'
      )
      data = result.data
    }

    const role = data.roles?.find((r) => r.name === roleName && r.isActive)
    return role?.permissions || []
  } catch (error) {
    console.error('Error getting role permissions:', error)
    return []
  }
}

