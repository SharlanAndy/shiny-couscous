/**
 * GitHub Authentication Helper
 * 
 * Handles authentication by reading auth JSON files from GitHub
 * and validating credentials client-side.
 */

import { getGitHubClient } from '@/api/github-client'
// Note: Install crypto-js: npm install crypto-js @types/crypto-js
import CryptoJS from 'crypto-js'

export interface AuthUser {
  id: string
  email: string
  name: string
  role: string
  isActive: boolean
  createdAt: string
  updatedAt?: string
}

export interface LoginResponse {
  token: string
  user: {
    id: string
    email: string
    name: string
  }
  role: string
}

/**
 * Hash password using SHA256 (matching backend implementation)
 */
function hashPassword(password: string): string {
  return CryptoJS.SHA256(password).toString()
}

/**
 * Generate JWT token (simple implementation)
 * In production, use a proper JWT library like 'jsonwebtoken'
 */
function generateJWT(payload: { id: string; email: string; role: string }): string {
  const secret = import.meta.env.VITE_JWT_SECRET || 'default-secret-change-in-production'
  
  // Simple JWT encoding (base64)
  // For production, use a proper JWT library
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const payloadEncoded = btoa(JSON.stringify({
    ...payload,
    exp: Math.floor(Date.now() / 1000) + (60 * 60), // 1 hour expiration
    iat: Math.floor(Date.now() / 1000),
  }))
  
  // Simple signature (in production, use HMAC)
  const signature = btoa(CryptoJS.HmacSHA256(`${header}.${payloadEncoded}`, secret).toString())
  
  return `${header}.${payloadEncoded}.${signature}`
}

/**
 * Verify JWT token
 */
export function verifyJWT(token: string): { id: string; email: string; role: string } | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null

    const payload = JSON.parse(atob(parts[1]))
    
    // Check expiration
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null
    }

    return {
      id: payload.id,
      email: payload.email,
      role: payload.role,
    }
  } catch {
    return null
  }
}

/**
 * Login user by validating credentials against GitHub JSON files
 */
export async function loginUser(
  email: string,
  password: string,
  role: 'user' | 'admin' = 'user'
): Promise<LoginResponse> {
  const github = getGitHubClient()
  const passwordHash = hashPassword(password)

  try {
    // Read appropriate auth file
    const authFile = role === 'admin' ? 'backend/data/admins_auth.json' : 'backend/data/users_auth.json'
    const { data } = await github.readJsonFile<{ users?: AuthUser[]; admins?: AuthUser[] }>(authFile)

    // Find user by email
    const users = role === 'admin' ? data.admins || [] : data.users || []
    const user = users.find((u: AuthUser) => u.email.toLowerCase() === email.toLowerCase())

    if (!user) {
      throw new Error('Invalid email or password')
    }

    // Check if user is active
    if (!user.isActive) {
      throw new Error('Account is inactive. Please contact administrator.')
    }

    // Verify password
    if (user.passwordHash !== passwordHash) {
      throw new Error('Invalid email or password')
    }

    // Generate JWT token
    const token = generateJWT({
      id: user.id,
      email: user.email,
      role: user.role,
    })

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      role: user.role,
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Authentication failed')
  }
}

/**
 * Register new user
 */
export async function registerUser(
  email: string,
  password: string,
  name?: string,
  role: string = 'user'
): Promise<LoginResponse> {
  let github
  try {
    github = getGitHubClient()
  } catch (error) {
    // Re-throw GitHub client initialization errors with more context
    if (error instanceof Error) {
      console.error('[Register] GitHub client initialization failed:', error.message)
      throw new Error(`Configuration error: ${error.message}`)
    }
    throw error
  }
  
  const passwordHash = hashPassword(password)

  try {
    // Read appropriate auth file (any role other than 'user' goes to admins_auth.json)
    const isAdminRole = role !== 'user'
    const authFile = isAdminRole ? 'backend/data/admins_auth.json' : 'backend/data/users_auth.json'
    let { data, sha } = await github.readJsonFile<{ users?: AuthUser[]; admins?: AuthUser[] }>(authFile)

    // Initialize empty structure if file doesn't exist
    if (!data || Object.keys(data).length === 0) {
      data = isAdminRole ? { admins: [] } : { users: [] }
      sha = '' // No SHA for new files
    }

    // Ensure arrays exist
    if (isAdminRole && !data.admins) {
      data.admins = []
    }
    if (!isAdminRole && !data.users) {
      data.users = []
    }

    // Check if user already exists
    const users = isAdminRole ? data.admins || [] : data.users || []
    const existingUser = users.find((u: AuthUser) => u.email.toLowerCase() === email.toLowerCase())

    if (existingUser) {
      throw new Error('User with this email already exists')
    }

    // Generate user ID (simple implementation - in production use UUID)
    const userId = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    // Create new user
    const newUser: AuthUser = {
      id: userId,
      email: email.toLowerCase(),
      passwordHash,
      name: name || email.split('@')[0],
      role,
      isActive: true,
      createdAt: new Date().toISOString(),
    }

    // Add user to array
    if (isAdminRole) {
      data.admins = [...(data.admins || []), newUser]
    } else {
      data.users = [...(data.users || []), newUser]
    }

    // Write back to GitHub - pass SHA if file exists (for updates)
    await github.writeJsonFile(
      authFile,
      data,
      `Add new ${role}: ${email}`,
      sha || undefined // Pass SHA only if it exists (for updates)
    )

    // Generate JWT token
    const token = generateJWT({
      id: newUser.id,
      email: newUser.email,
      role: newUser.role,
    })

    return {
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
      },
      role: newUser.role,
    }
  } catch (error) {
    // Log the full error for debugging
    console.error('[Register] Registration error:', error)
    
    if (error instanceof Error) {
      // Check if it's a GitHub API error
      if (error.message.includes('GitHub configuration missing')) {
        throw error // Re-throw config errors as-is
      }
      if (error.message.includes('404') || error.message.includes('Not Found')) {
        throw new Error('Authentication file not found. Please ensure backend/data/users_auth.json exists in the repository.')
      }
      if (error.message.includes('401') || error.message.includes('Unauthorized')) {
        throw new Error('GitHub authentication failed. Please check your GitHub token permissions.')
      }
      if (error.message.includes('403') || error.message.includes('Forbidden')) {
        throw new Error('GitHub access denied. Please check your token has write permissions to the repository.')
      }
      // Re-throw other errors with original message
      throw error
    }
    throw new Error('Registration failed. Please check the console for details.')
  }
}

/**
 * Get user by ID from GitHub auth files
 */
export async function getUserById(userId: string, role?: 'user' | 'admin'): Promise<AuthUser | null> {
  const github = getGitHubClient()

  try {
    // If role is specified, only check that file
    if (role) {
      const authFile = role === 'admin' ? 'backend/data/admins_auth.json' : 'backend/data/users_auth.json'
      const { data } = await github.readJsonFile<{ users?: AuthUser[]; admins?: AuthUser[] }>(authFile)
      const users = role === 'admin' ? data.admins || [] : data.users || []
      return users.find((u: AuthUser) => u.id === userId) || null
    }

    // Check both files if role not specified
    const [usersData, adminsData] = await Promise.all([
      github.readJsonFile<{ users?: AuthUser[] }>('backend/data/users_auth.json'),
      github.readJsonFile<{ admins?: AuthUser[] }>('backend/data/admins_auth.json'),
    ])

    const user = usersData.data.users?.find((u: AuthUser) => u.id === userId)
    if (user) return user

    const admin = adminsData.data.admins?.find((u: AuthUser) => u.id === userId)
    return admin || null
  } catch {
    return null
  }
}

/**
 * Update user password
 */
export async function updateUserPassword(
  userId: string,
  currentPassword: string,
  newPassword: string,
  role?: 'user' | 'admin'
): Promise<void> {
  const github = getGitHubClient()
  const currentPasswordHash = hashPassword(currentPassword)
  const newPasswordHash = hashPassword(newPassword)

  try {
    // Determine which file to check
    let authFile: string
    let user: AuthUser | null = null

    if (role) {
      authFile = role === 'admin' ? 'backend/data/admins_auth.json' : 'backend/data/users_auth.json'
      const { data } = await github.readJsonFile<{ users?: AuthUser[]; admins?: AuthUser[] }>(authFile)
      const users = role === 'admin' ? data.admins || [] : data.users || []
      user = users.find((u: AuthUser) => u.id === userId) || null
    } else {
      // Check both files
      const [usersData, adminsData] = await Promise.all([
        github.readJsonFile<{ users?: AuthUser[] }>('backend/data/users_auth.json'),
        github.readJsonFile<{ admins?: AuthUser[] }>('backend/data/admins_auth.json'),
      ])

      user = usersData.data.users?.find((u: AuthUser) => u.id === userId) ||
             adminsData.data.admins?.find((u: AuthUser) => u.id === userId) || null

      if (user) {
        authFile = usersData.data.users?.some((u: AuthUser) => u.id === userId)
          ? 'backend/data/users_auth.json'
          : 'backend/data/admins_auth.json'
      }
    }

    if (!user) {
      throw new Error('User not found')
    }

    // Verify current password
    if (user.passwordHash !== currentPasswordHash) {
      throw new Error('Current password is incorrect')
    }

    // Update password
    user.passwordHash = newPasswordHash
    user.updatedAt = new Date().toISOString()

    // Write back to GitHub
    const { data } = await github.readJsonFile<{ users?: AuthUser[]; admins?: AuthUser[] }>(authFile)
    if (role === 'admin' || authFile.includes('admins')) {
      const admins = data.admins || []
      const index = admins.findIndex((u: AuthUser) => u.id === userId)
      if (index >= 0) {
        admins[index] = user
        data.admins = admins
      }
    } else {
      const users = data.users || []
      const index = users.findIndex((u: AuthUser) => u.id === userId)
      if (index >= 0) {
        users[index] = user
        data.users = users
      }
    }

    await github.writeJsonFile(authFile, data, `Update password for user: ${user.email}`)
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Failed to update password')
  }
}

