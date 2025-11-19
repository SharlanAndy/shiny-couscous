/**
 * Role utility functions for checking admin roles dynamically
 */

import { getGitHubClient } from '@/api/github-client'

// Cache for admin roles to avoid repeated API calls
let adminRolesCache: { roles: Array<{ name: string; isActive: boolean }>; timestamp: number } | null = null
const ADMIN_ROLES_CACHE_TTL = 5 * 60 * 1000 // 5 minutes

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

    // Fetch from GitHub
    const github = getGitHubClient()
    const { data } = await github.readJsonFile<{ version: string; lastUpdated: string; roles: Array<{ name: string; isActive: boolean }> }>(
      'backend/data/admin_roles.json'
    )

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
    const { data } = await github.readJsonFile<{ version: string; lastUpdated: string; roles: Array<{ name: string; isActive: boolean; permissions?: string[] }> }>(
      'backend/data/admin_roles.json'
    )

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
    const { data } = await github.readJsonFile<{ version: string; lastUpdated: string; roles: Array<{ name: string; isActive: boolean; permissions?: string[] }> }>(
      'backend/data/admin_roles.json'
    )

    const role = data.roles?.find((r) => r.name === roleName && r.isActive)
    return role?.permissions || []
  } catch (error) {
    console.error('Error getting role permissions:', error)
    return []
  }
}

