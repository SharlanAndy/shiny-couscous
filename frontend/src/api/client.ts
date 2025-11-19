/**
 * API Client for Labuan FSA E-Submission System
 * 
 * REFACTORED VERSION: Uses GitHub API instead of FastAPI backend
 * 
 * This file maintains the same interface as the original client.ts
 * but implements all operations using GitHub API to read/write JSON files.
 */

import { getGitHubClient, GitHubAPIError, isGitHubConfigured } from './github-client'
import { loginUser, registerUser, getUserById, updateUserPassword, verifyJWT } from '@/lib/github-auth'
import CryptoJS from 'crypto-js'
import axios, { AxiosInstance } from 'axios'
import type {
  FormResponse,
  FormSchemaResponse,
  SubmissionCreateRequest,
  SubmissionCreateResponse,
  SubmissionResponse,
  ValidationResponse,
} from '@/types'

// Helper to generate submission ID
function generateSubmissionId(): string {
  const date = new Date()
  const dateStr = date.toISOString().split('T')[0].replace(/-/g, '')
  const random = Math.floor(Math.random() * 1000000).toString().padStart(6, '0')
  return `SUB-${dateStr}-${random}`
}

// Import role checking utilities
import { isAdminRole, getRolePermissions } from '@/lib/role-utils'

// Helper to filter array based on params
function filterArray<T extends { [key: string]: any }>(
  items: T[],
  params?: { [key: string]: any }
): T[] {
  if (!params) return items

  return items.filter((item) => {
    if (params.status && item.status !== params.status) return false
    if (params.category && item.category !== params.category) return false
    if (params.formId && item.formId !== params.formId) return false
    if (params.search) {
      const searchLower = params.search.toLowerCase()
      const searchableFields = ['name', 'description', 'formId', 'email']
      const matches = searchableFields.some((field) => {
        const value = item[field]
        return value && String(value).toLowerCase().includes(searchLower)
      })
      if (!matches) return false
    }
    return true
  })
}

// Helper to paginate array
function paginateArray<T>(items: T[], page?: number, pageSize?: number): T[] {
  if (!page && !pageSize) return items
  const start = page && pageSize ? (page - 1) * pageSize : 0
  const end = pageSize ? start + pageSize : undefined
  return items.slice(start, end)
}

/**
 * API Client Class - GitHub Implementation with Backend API Fallback
 */
class APIClient {
  // Keep client property for backward compatibility (components may use it)
  public client: {
    get: (url: string, config?: any) => Promise<any>
    post: (url: string, data?: any, config?: any) => Promise<any>
    put: (url: string, data?: any) => Promise<any>
    delete: (url: string) => Promise<any>
  }
  private token: string | null = null
  private backendClient: AxiosInstance | null = null
  private useBackendAPI: boolean = false

  constructor() {
    // Check if we should use backend API (when GitHub is not configured)
    this.useBackendAPI = !isGitHubConfigured()
    
    if (this.useBackendAPI) {
      // Create backend API client
      const apiURL = import.meta.env.VITE_API_URL || 'http://localhost:8000'
      this.backendClient = axios.create({
        baseURL: apiURL,
        timeout: 30000,
        headers: {
          'Content-Type': 'application/json',
        },
      })

      // Add auth interceptor for backend API
      this.backendClient.interceptors.request.use((config) => {
        const token = this.getToken()
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      })

      // Use backend client for direct calls
      this.client = {
        get: (url: string, config?: any) => this.backendClient!.get(url, config),
        post: (url: string, data?: any, config?: any) => this.backendClient!.post(url, data, config),
        put: (url: string, data?: any) => this.backendClient!.put(url, data),
        delete: (url: string) => this.backendClient!.delete(url),
      }
    } else {
      // Create mock axios-like client for backward compatibility (GitHub mode)
      this.client = {
        get: async (url: string) => {
          throw new Error(`Direct client.get() calls are not supported. Use API methods instead. URL: ${url}`)
        },
        post: async (url: string) => {
          throw new Error(`Direct client.post() calls are not supported. Use API methods instead. URL: ${url}`)
        },
        put: async (url: string) => {
          throw new Error(`Direct client.put() calls are not supported. Use API methods instead. URL: ${url}`)
        },
        delete: async (url: string) => {
          throw new Error(`Direct client.delete() calls are not supported. Use API methods instead. URL: ${url}`)
        },
      }
    }
  }

  setToken(token: string | null) {
    this.token = token
    if (token) {
      localStorage.setItem('token', token)
    } else {
      localStorage.removeItem('token')
    }
  }

  getToken(): string | null {
    if (!this.token) {
      this.token = localStorage.getItem('token')
    }
    return this.token
  }

  // Helper to verify authentication
  private verifyAuth(): { id: string; email: string; role: string } {
    const token = this.getToken()
    if (!token) {
      throw new Error('Authentication required')
    }
    const payload = verifyJWT(token)
    if (!payload) {
      this.setToken(null)
      throw new Error('Invalid or expired token')
    }
    return payload
  }

  // Helper to check if user has required permission
  private async checkPermission(requiredPermission: string): Promise<void> {
    const auth = this.verifyAuth()
    const isAdmin = await isAdminRole(auth.role)
    if (!isAdmin) {
      throw new Error('Admin access required')
    }
    
    const permissions = await getRolePermissions(auth.role)
    if (!permissions.includes(requiredPermission)) {
      throw new Error(`Permission denied: ${requiredPermission} required`)
    }
  }

  // Helper to get GitHub client (throws if not available and not using backend API)
  private getGitHubClientOrThrow() {
    if (this.useBackendAPI) {
      return null // Will use backend API instead
    }
    const github = getGitHubClient()
    if (!github) {
      throw new Error('No API client available. Please configure GitHub API or start backend server.')
    }
    return github
  }

  // Forms API
  async getForms(params?: {
    status?: string
    category?: string
    search?: string
    page?: number
    pageSize?: number
    includeInactive?: boolean // New parameter to include inactive forms
  }): Promise<FormResponse[]> {
    // Use backend API if GitHub is not configured
    if (this.useBackendAPI && this.backendClient) {
      const response = await this.backendClient.get('/api/forms', { params })
      return response.data
    }

    // Use GitHub API
    const github = this.getGitHubClientOrThrow()
    if (!github) {
      throw new Error('No API client available')
    }
    
    const { data } = await github.readJsonFile<{ version: string; lastUpdated: string; items: FormResponse[] }>(
      'backend/data/forms.json'
    )

    let forms = data.items || []
    
    // Filter active forms by default for user frontend (unless includeInactive is true or status is specified)
    // Admin panel should pass includeInactive: true to see all forms
    if (!params?.includeInactive && !params?.status) {
      forms = forms.filter((f) => f.isActive)
    }

    // Apply filters
    forms = filterArray(forms, params)
    
    // Apply pagination
    forms = paginateArray(forms, params?.page, params?.pageSize)

    return forms
  }

  async getForm(formId: string): Promise<FormResponse> {
    // Use backend API if GitHub is not configured
    if (this.useBackendAPI && this.backendClient) {
      const response = await this.backendClient.get(`/api/forms/${formId}`)
      return response.data
    }

    // Use GitHub API
    const github = this.getGitHubClientOrThrow()
    if (!github) {
      throw new Error('No API client available')
    }
    
    const { data } = await github.readJsonFile<{ version: string; lastUpdated: string; items: any[] }>(
      'backend/data/forms.json'
    )

    const form = data.items?.find((f) => f.formId === formId || f.id === formId)
    if (!form) {
      throw new Error(`Form not found: ${formId}`)
    }

    // Return form with schemaData preserved (even though it's not in FormResponse type)
    return form as FormResponse
  }

  async getFormSchema(formId: string): Promise<FormSchemaResponse> {
    // Use backend API if GitHub is not configured
    if (this.useBackendAPI && this.backendClient) {
      const response = await this.backendClient.get(`/api/forms/${formId}/schema`)
      return response.data
    }

    // Use GitHub API
    const github = this.getGitHubClientOrThrow()
    if (!github) {
      throw new Error('No API client available')
    }
    
    const { data } = await github.readJsonFile<{ version: string; lastUpdated: string; items: any[] }>(
      'backend/data/forms.json'
    )

    const form = data.items?.find((f) => f.formId === formId || f.id === formId)
    if (!form) {
      throw new Error(`Form not found: ${formId}`)
    }
    
    // Extract schema from form's schemaData (stored in JSON but not in type definition)
    if (!form.schemaData) {
      throw new Error(`Schema not found for form: ${formId}`)
    }

    return form.schemaData as FormSchemaResponse
  }

  async createForm(formData: {
    form_id: string
    name: string
    description?: string
    category?: string
    version: string
    schema_data: any
    is_active: boolean
    requires_auth: boolean
    estimated_time?: string
  }): Promise<FormResponse> {
    await this.checkPermission('manage_forms')

    const github = getGitHubClient()
    const { data } = await github.readJsonFile<{ version: string; lastUpdated: string; items: FormResponse[] }>(
      'backend/data/forms.json'
    )

    // Check if form already exists
    const existing = data.items?.find((f) => f.formId === formData.form_id)
    if (existing) {
      throw new Error(`Form with ID ${formData.form_id} already exists`)
    }

    const newForm: FormResponse = {
      id: `form-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      formId: formData.form_id,
      name: formData.name,
      description: formData.description,
      category: formData.category,
      version: formData.version,
      isActive: formData.is_active,
      requiresAuth: formData.requires_auth,
      estimatedTime: formData.estimated_time,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    // Add schemaData to form (stored separately in JSON)
    ;(newForm as any).schemaData = formData.schema_data

    data.items = [...(data.items || []), newForm]
    data.lastUpdated = new Date().toISOString()

    await github.writeJsonFile('backend/data/forms.json', data, `Create form: ${formData.name}`)

    return newForm
  }

  async updateForm(formId: string, formData: Partial<{
    name: string
    description?: string
    category?: string
    version: string
    schema_data: any
    is_active: boolean
    requires_auth: boolean
    estimated_time?: string
  }>): Promise<FormResponse> {
    await this.checkPermission('manage_forms')

    const github = getGitHubClient()
    const { data } = await github.readJsonFile<{ version: string; lastUpdated: string; items: FormResponse[] }>(
      'backend/data/forms.json'
    )

    const index = data.items?.findIndex((f) => f.formId === formId || f.id === formId) ?? -1
    if (index === -1) {
      throw new Error(`Form not found: ${formId}`)
    }

    const form = data.items![index]
    const updatedForm: FormResponse = {
      ...form,
      ...(formData.name && { name: formData.name }),
      ...(formData.description !== undefined && { description: formData.description }),
      ...(formData.category !== undefined && { category: formData.category }),
      ...(formData.version && { version: formData.version }),
      ...(formData.is_active !== undefined && { isActive: formData.is_active }),
      ...(formData.requires_auth !== undefined && { requiresAuth: formData.requires_auth }),
      ...(formData.estimated_time !== undefined && { estimatedTime: formData.estimated_time }),
      updatedAt: new Date().toISOString(),
    }

    // Update schemaData if provided
    if (formData.schema_data) {
      ;(updatedForm as any).schemaData = formData.schema_data
    }

    data.items![index] = updatedForm
    data.lastUpdated = new Date().toISOString()

    await github.writeJsonFile('backend/data/forms.json', data, `Update form: ${formId}`)

    return updatedForm
  }

  async updateFormSchema(formId: string, schemaData: FormSchemaResponse): Promise<FormSchemaResponse> {
    await this.updateForm(formId, {
      schema_data: {
        formId: schemaData.formId,
        formName: schemaData.formName,
        version: schemaData.version,
        steps: schemaData.steps,
        submitButton: schemaData.submitButton,
      },
    })
    return schemaData
  }

  async deleteForm(formId: string): Promise<void> {
    await this.checkPermission('manage_forms')

    const github = getGitHubClient()
    const { data } = await github.readJsonFile<{ version: string; lastUpdated: string; items: FormResponse[] }>(
      'backend/data/forms.json'
    )

    const index = data.items?.findIndex((f) => f.formId === formId || f.id === formId) ?? -1
    if (index === -1) {
      throw new Error(`Form not found: ${formId}`)
    }

    data.items!.splice(index, 1)
    data.lastUpdated = new Date().toISOString()

    await github.writeJsonFile('backend/data/forms.json', data, `Delete form: ${formId}`)
  }

  // Submissions API
  async validateSubmission(
    formId: string,
    data: Record<string, any>,
    stepId?: string
  ): Promise<ValidationResponse> {
    // Client-side validation - this is a simplified version
    // In production, you might want to implement more comprehensive validation
    const errors: any[] = []

    // Basic validation - can be enhanced
    // This is a placeholder - implement actual validation logic based on form schema

    return {
      valid: errors.length === 0,
      errors,
    }
  }

  async submitForm(
    formId: string,
    request: SubmissionCreateRequest
  ): Promise<SubmissionCreateResponse> {
    const auth = this.verifyAuth()
    const github = getGitHubClient()

    // Get form to verify it exists
    await this.getForm(formId)

    // Read submissions
    const { data } = await github.readJsonFile<{ version: string; lastUpdated: string; items: SubmissionResponse[] }>(
      'backend/data/submissions.json'
    )

    const submissionId = generateSubmissionId()
    const now = new Date().toISOString()

    const newSubmission: SubmissionResponse = {
      id: submissionId,
      formId,
      submissionId,
      status: 'submitted',
      submittedBy: auth.id,
      submittedAt: now,
      createdAt: now,
      updatedAt: now,
      ...(request as any), // Include submittedData, files, etc.
    }

    data.items = [...(data.items || []), newSubmission]
    data.lastUpdated = now

    await github.writeJsonFile(
      'backend/data/submissions.json',
      data,
      `Submit form: ${formId} - ${submissionId}`
    )

    return {
      formId,
      submissionId,
      status: 'submitted',
      message: 'Submission successful',
      submittedAt: now,
    }
  }

  async saveDraft(
    formId: string,
    request: SubmissionCreateRequest
  ): Promise<SubmissionResponse> {
    const auth = this.verifyAuth()
    const github = getGitHubClient()

    const { data } = await github.readJsonFile<{ version: string; lastUpdated: string; items: SubmissionResponse[] }>(
      'backend/data/submissions.json'
    )

    const submissionId = generateSubmissionId()
    const now = new Date().toISOString()

    const draft: SubmissionResponse = {
      id: submissionId,
      formId,
      submissionId,
      status: 'draft',
      submittedBy: auth.id,
      createdAt: now,
      updatedAt: now,
      ...(request as any),
    }

    data.items = [...(data.items || []), draft]
    data.lastUpdated = now

    await github.writeJsonFile(
      'backend/data/submissions.json',
      data,
      `Save draft: ${formId} - ${submissionId}`
    )

    return draft
  }

  async updateDraft(
    submissionId: string,
    request: SubmissionCreateRequest
  ): Promise<SubmissionResponse> {
    const auth = this.verifyAuth()
    const github = getGitHubClient()

    const { data } = await github.readJsonFile<{ version: string; lastUpdated: string; items: SubmissionResponse[] }>(
      'backend/data/submissions.json'
    )

    const index = data.items?.findIndex((s) => s.submissionId === submissionId || s.id === submissionId) ?? -1
    if (index === -1) {
      throw new Error(`Submission not found: ${submissionId}`)
    }

    const submission = data.items![index]
    
    // Verify ownership (users can only update their own drafts)
    const isAdmin = await isAdminRole(auth.role)
    if (submission.submittedBy !== auth.id && !isAdmin) {
      throw new Error('Unauthorized to update this submission')
    }

    const updated: SubmissionResponse = {
      ...submission,
      ...(request as any),
      updatedAt: new Date().toISOString(),
    }

    data.items![index] = updated
    data.lastUpdated = new Date().toISOString()

    await github.writeJsonFile(
      'backend/data/submissions.json',
      data,
      `Update draft: ${submissionId}`
    )

    return updated
  }

  async getSubmissions(params?: {
    formId?: string
    status?: string
    page?: number
    pageSize?: number
  }): Promise<SubmissionResponse[]> {
    const auth = this.verifyAuth()
    
    // Use backend API if GitHub is not configured
    if (this.useBackendAPI && this.backendClient) {
      const response = await this.backendClient.get('/api/submissions', { params })
      return response.data
    }

    const github = getGitHubClient()
    if (!github) {
      throw new Error('No API client available. Please configure GitHub API or start backend server.')
    }

    const { data } = await github.readJsonFile<{ version: string; lastUpdated: string; items: SubmissionResponse[] }>(
      'backend/data/submissions.json'
    )

    let submissions = data.items || []

    // Filter by user (non-admins only see their own)
    const isAdmin = await isAdminRole(auth.role)
    if (!isAdmin) {
      submissions = submissions.filter((s) => s.submittedBy === auth.id)
    }

    // Apply filters
    submissions = filterArray(submissions, params)
    
    // Apply pagination
    submissions = paginateArray(submissions, params?.page, params?.pageSize)

    return submissions
  }

  async getSubmission(submissionId: string): Promise<SubmissionResponse> {
    const auth = this.verifyAuth()
    
    // Use backend API if GitHub is not configured
    if (this.useBackendAPI && this.backendClient) {
      const response = await this.backendClient.get(`/api/submissions/${submissionId}`)
      return response.data
    }

    const github = getGitHubClient()
    if (!github) {
      throw new Error('No API client available. Please configure GitHub API or start backend server.')
    }

    const { data } = await github.readJsonFile<{ version: string; lastUpdated: string; items: SubmissionResponse[] }>(
      'backend/data/submissions.json'
    )

    const submission = data.items?.find((s) => s.submissionId === submissionId || s.id === submissionId)
    if (!submission) {
      throw new Error(`Submission not found: ${submissionId}`)
    }

    // Verify access
    const isAdmin = await isAdminRole(auth.role)
    if (submission.submittedBy !== auth.id && !isAdmin) {
      throw new Error('Unauthorized to view this submission')
    }

    return submission
  }

  // File Upload API
  async uploadFile(
    file: File,
    fieldName: string,
    onProgress?: (progress: number) => void
  ): Promise<any> {
    this.verifyAuth()

    // For files < 1MB, use GitHub Content API
    // For files > 1MB, use GitHub Releases API (not implemented here - see note)
    
    if (file.size > 1024 * 1024) {
      throw new Error('Files larger than 1MB are not yet supported. Please use GitHub Releases API.')
    }

    const github = getGitHubClient()
    
    // Convert file to base64
    const reader = new FileReader()
    const base64Promise = new Promise<string>((resolve, reject) => {
      reader.onload = () => {
        const result = reader.result as string
        const base64 = result.split(',')[1] // Remove data:type;base64, prefix
        resolve(base64)
      }
      reader.onerror = reject
    })
    reader.readAsDataURL(file)

    const base64Content = await base64Promise

    // Store file in backend/uploads/ directory
    const fileName = `${fieldName}_${Date.now()}_${file.name}`
    const filePath = `backend/uploads/${fileName}`

    try {
      await github.writeJsonFile(
        filePath,
        { content: base64Content, fileName: file.name, size: file.size, mimeType: file.type },
        `Upload file: ${fileName}`
      )

      // Also update files.json with metadata
      const { data: filesData } = await github.readJsonFile<{ files: any[] }>('backend/data/files.json')
      const fileRecord = {
        id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        fileId: fileName,
        fieldName,
        fileName: file.name,
        filePath,
        fileSize: file.size,
        mimeType: file.type,
        storageLocation: 'github',
        uploadedAt: new Date().toISOString(),
      }

      filesData.files = [...(filesData.files || []), fileRecord]
      await github.writeJsonFile('backend/data/files.json', filesData, `Add file record: ${fileName}`)

      if (onProgress) {
        onProgress(100)
      }

      return fileRecord
    } catch (error) {
      if (error instanceof GitHubAPIError && error.status === 409) {
        // File path conflict, try with different name
        const newFileName = `${fieldName}_${Date.now()}_${Math.random().toString(36).substr(2, 6)}_${file.name}`
        return this.uploadFile(new File([file], newFileName, { type: file.type }), fieldName, onProgress)
      }
      throw error
    }
  }

  // Admin API
  async getAdminSubmissions(params?: {
    formId?: string
    status?: string
    page?: number
    pageSize?: number
  }): Promise<SubmissionResponse[]> {
    await this.checkPermission('review_submissions')
    const auth = this.verifyAuth()

    // Use backend API if GitHub is not configured
    if (this.useBackendAPI && this.backendClient) {
      const response = await this.backendClient.get('/api/admin/submissions', { params })
      return response.data
    }

    // Same as getSubmissions but without user filter
    const github = getGitHubClient()
    if (!github) {
      throw new Error('No API client available. Please configure GitHub API or start backend server.')
    }
    
    const { data } = await github.readJsonFile<{ version: string; lastUpdated: string; items: SubmissionResponse[] }>(
      'backend/data/submissions.json'
    )

    let submissions = data.items || []
    submissions = filterArray(submissions, params)
    submissions = paginateArray(submissions, params?.page, params?.pageSize)

    return submissions
  }

  async reviewSubmission(
    submissionId: string,
    updateData: {
      status?: string
      reviewNotes?: string
      requestedInfo?: string
    }
  ): Promise<SubmissionResponse> {
    await this.checkPermission('review_submissions')
    const auth = this.verifyAuth()

    const github = getGitHubClient()
    const { data } = await github.readJsonFile<{ version: string; lastUpdated: string; items: SubmissionResponse[] }>(
      'backend/data/submissions.json'
    )

    const index = data.items?.findIndex((s) => s.submissionId === submissionId || s.id === submissionId) ?? -1
    if (index === -1) {
      throw new Error(`Submission not found: ${submissionId}`)
    }

    const submission = data.items![index]
    const updated: SubmissionResponse = {
      ...submission,
      ...(updateData.status && { status: updateData.status as SubmissionResponse['status'] }),
      ...(updateData.reviewNotes && { reviewNotes: updateData.reviewNotes }),
      ...(updateData.requestedInfo && { requestedInfo: updateData.requestedInfo }),
      reviewedBy: auth.id,
      reviewedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    data.items![index] = updated
    data.lastUpdated = new Date().toISOString()

    await github.writeJsonFile(
      'backend/data/submissions.json',
      data,
      `Review submission: ${submissionId} - ${updateData.status}`
    )

    return updated
  }

  async deleteSubmission(submissionId: string): Promise<void> {
    await this.checkPermission('review_submissions')
    const auth = this.verifyAuth()

    const github = getGitHubClient()
    const { data } = await github.readJsonFile<{ version: string; lastUpdated: string; items: SubmissionResponse[] }>(
      'backend/data/submissions.json'
    )

    const index = data.items?.findIndex((s) => s.submissionId === submissionId || s.id === submissionId) ?? -1
    if (index === -1) {
      throw new Error(`Submission not found: ${submissionId}`)
    }

    data.items!.splice(index, 1)
    data.lastUpdated = new Date().toISOString()

    await github.writeJsonFile(
      'backend/data/submissions.json',
      data,
      `Delete submission: ${submissionId}`
    )
  }

  async getAdminStatistics(): Promise<{
    totalSubmissions: number
    pendingSubmissions: number
    approvedSubmissions: number
    rejectedSubmissions: number
    totalForms: number
    recentActivity: Array<{
      id: string
      type: string
      description: string
      timestamp: string
    }>
  }> {
    await this.checkPermission('view_analytics')
    const auth = this.verifyAuth()

    // Use backend API if GitHub is not configured
    if (this.useBackendAPI && this.backendClient) {
      const response = await this.backendClient.get('/api/admin/statistics')
      return response.data
    }

    const github = getGitHubClient()
    if (!github) {
      throw new Error('No API client available. Please configure GitHub API or start backend server.')
    }
    
    // Read submissions and forms
    const [submissionsData, formsData] = await Promise.all([
      github.readJsonFile<{ items: SubmissionResponse[] }>('backend/data/submissions.json'),
      github.readJsonFile<{ items: FormResponse[] }>('backend/data/forms.json'),
    ])

    const submissions = submissionsData.data.items || []
    const forms = formsData.data.items || []

    // Calculate statistics
    const totalSubmissions = submissions.length
    const pendingSubmissions = submissions.filter((s) => s.status === 'submitted' || s.status === 'reviewing').length
    const approvedSubmissions = submissions.filter((s) => s.status === 'approved').length
    const rejectedSubmissions = submissions.filter((s) => s.status === 'rejected').length
    const totalForms = forms.filter((f) => f.isActive).length

    // Generate recent activity (simplified - based on recent submissions)
    const recentActivity = submissions
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 10)
      .map((s) => ({
        id: s.id,
        type: 'submission',
        description: `Submission ${s.submissionId} - ${s.status}`,
        timestamp: s.updatedAt,
      }))

    return {
      totalSubmissions,
      pendingSubmissions,
      approvedSubmissions,
      rejectedSubmissions,
      totalForms,
      recentActivity,
    }
  }

  // Auth API
  async login(email: string, password: string, role: 'user' | 'admin' = 'user'): Promise<{
    token: string
    user: {
      id: string
      email: string
      name: string
    }
    role: string
  }> {
    const result = await loginUser(email, password, role)
    this.setToken(result.token)
    return result
  }

  async register(email: string, password: string, name?: string, role: 'user' | 'admin' = 'user'): Promise<{
    token: string
    user: {
      id: string
      email: string
      name: string
    }
    role: string
  }> {
    const result = await registerUser(email, password, name, role)
    this.setToken(result.token)
    return result
  }

  async logout(): Promise<void> {
    this.setToken(null)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('userRole')
    localStorage.removeItem('rememberMe')
  }

  async getCurrentUser(): Promise<{
    id: string
    email: string
    name: string
    role: string
    isActive: boolean
    createdAt: string
  }> {
    const auth = this.verifyAuth()
    const user = await getUserById(auth.id, auth.role as 'user' | 'admin')
    
    if (!user) {
      throw new Error('User not found')
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
    }
  }

  async updateProfile(data: { name?: string; email?: string }): Promise<{
    id: string
    email: string
    name: string
    role: string
    isActive: boolean
    createdAt: string
    emailChanged?: boolean
  }> {
    const auth = this.verifyAuth()
    const github = getGitHubClient()

    // Determine which file to update
    const isAdmin = await isAdminRole(auth.role)
    const authFile = isAdmin 
      ? 'backend/data/admins_auth.json' 
      : 'backend/data/users_auth.json'
    
    const { data: authData } = await github.readJsonFile<{ users?: any[]; admins?: any[] }>(authFile)
    const users = isAdmin ? authData.admins || [] : authData.users || []
    const index = users.findIndex((u: any) => u.id === auth.id)

    if (index === -1) {
      throw new Error('User not found')
    }

    const user = users[index]
    const emailChanged = !!(data.email && data.email !== user.email)

    // Check if email already exists
    if (data.email && data.email !== user.email) {
      const allUsers = [...(authData.users || []), ...(authData.admins || [])]
      if (allUsers.some((u: any) => u.email.toLowerCase() === data.email!.toLowerCase() && u.id !== auth.id)) {
        throw new Error('Email already in use')
      }
    }

    const updated = {
      ...user,
      ...(data.name && { name: data.name }),
      ...(data.email && { email: data.email.toLowerCase() }),
      updatedAt: new Date().toISOString(),
    }

    users[index] = updated

    if (isAdmin) {
      authData.admins = users
    } else {
      authData.users = users
    }

    await github.writeJsonFile(authFile, authData, `Update profile: ${user.email}`)

    return {
      id: updated.id,
      email: updated.email,
      name: updated.name,
      role: updated.role,
      isActive: updated.isActive,
      createdAt: updated.createdAt,
      emailChanged,
    }
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<{ message: string }> {
    const auth = this.verifyAuth()
    await updateUserPassword(auth.id, currentPassword, newPassword, auth.role as 'user' | 'admin')
    return { message: 'Password updated successfully' }
  }

  async deleteAccount(password: string): Promise<{ message: string }> {
    const auth = this.verifyAuth()
    
    // Verify password
    try {
      await loginUser(auth.email, password, auth.role as 'user' | 'admin')
    } catch {
      throw new Error('Invalid password')
    }

    const github = getGitHubClient()
    const isAdmin = await isAdminRole(auth.role)
    const authFile = isAdmin 
      ? 'backend/data/admins_auth.json' 
      : 'backend/data/users_auth.json'
    
    const { data: authData } = await github.readJsonFile<{ users?: any[]; admins?: any[] }>(authFile)
    const users = isAdmin ? authData.admins || [] : authData.users || []
    const filtered = users.filter((u: any) => u.id !== auth.id)

    if (isAdmin) {
      authData.admins = filtered
    } else {
      authData.users = filtered
    }

    await github.writeJsonFile(authFile, authData, `Delete account: ${auth.email}`)
    
    // Logout
    await this.logout()

    return { message: 'Account deleted successfully' }
  }

  // Admin User Management API
  async getAdminUsers(): Promise<Array<{
    id: string
    email: string
    name: string
    role: string
    isActive: boolean
    createdAt: string
  }>> {
    await this.checkPermission('manage_users')
    const auth = this.verifyAuth()

    const github = getGitHubClient()
    const { data } = await github.readJsonFile<{ users: any[] }>('backend/data/users_auth.json')

    return (data.users || []).map((u) => ({
      id: u.id,
      email: u.email,
      name: u.name,
      role: u.role,
      isActive: u.isActive,
      createdAt: u.createdAt,
    }))
  }

  async getAdminUser(userId: string): Promise<{
    id: string
    email: string
    name: string
    role: string
    isActive: boolean
    createdAt: string
  }> {
    await this.checkPermission('manage_users')
    const auth = this.verifyAuth()

    const user = await getUserById(userId)
    if (!user) {
      throw new Error('User not found')
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
    }
  }

  async updateAdminUser(
    userId: string,
    data: { name?: string; email?: string; role?: string; is_active?: boolean; password?: string }
  ): Promise<{
    id: string
    email: string
    name: string
    role: string
    isActive: boolean
    createdAt: string
  }> {
    const auth = this.verifyAuth()
    const isAdmin = await isAdminRole(auth.role)
    if (!isAdmin) {
      throw new Error('Admin access required')
    }

    const github = getGitHubClient()
    const user = await getUserById(userId)
    if (!user) {
      throw new Error('User not found')
    }

    // Determine old and new roles
    const oldRole = user.role
    const newRole = data.role || oldRole
    const isRoleChange = data.role && data.role !== oldRole

    // Check if roles are admin roles
    const oldIsAdmin = await isAdminRole(oldRole)
    const newIsAdmin = await isAdminRole(newRole)

    // Check permissions: if updating admin or changing role, need manage_admins; otherwise need manage_users
    if (oldIsAdmin || newIsAdmin || isRoleChange) {
      await this.checkPermission('manage_admins')
    } else {
      await this.checkPermission('manage_users')
    }

    // Determine which files to use
    const oldAuthFile = oldIsAdmin 
      ? 'backend/data/admins_auth.json' 
      : 'backend/data/users_auth.json'
    const newAuthFile = newIsAdmin
      ? 'backend/data/admins_auth.json'
      : 'backend/data/users_auth.json'

    // Read old file
    const { data: oldAuthData, sha: oldSha } = await github.readJsonFile<{ users?: any[]; admins?: any[] }>(oldAuthFile)
    const oldUsers = oldIsAdmin ? oldAuthData.admins || [] : oldAuthData.users || []
    const index = oldUsers.findIndex((u: any) => u.id === userId)

    if (index === -1) {
      throw new Error('User not found')
    }

    // Build updated user object
    const updated = {
      ...oldUsers[index],
      ...(data.name && { name: data.name }),
      ...(data.email && { email: data.email.toLowerCase() }),
      ...(data.role && { role: data.role }),
      ...(data.is_active !== undefined && { isActive: data.is_active }),
      ...(data.password && { 
        passwordHash: CryptoJS.SHA256(data.password).toString() 
      }),
      updatedAt: new Date().toISOString(),
    }

    // If role changed, move user between files
    if (isRoleChange && oldAuthFile !== newAuthFile) {
      // Remove from old file
      oldUsers.splice(index, 1)
      if (oldIsAdmin) {
        oldAuthData.admins = oldUsers
      } else {
        oldAuthData.users = oldUsers
      }
      await github.writeJsonFile(oldAuthFile, oldAuthData, `Admin update user: removed ${user.email} (role change)`, oldSha)

      // Add to new file
      const { data: newAuthData, sha: newSha } = await github.readJsonFile<{ users?: any[]; admins?: any[] }>(newAuthFile)
      const newUsers = newIsAdmin ? newAuthData.admins || [] : newAuthData.users || []
      newUsers.push(updated)
      if (newIsAdmin) {
        newAuthData.admins = newUsers
      } else {
        newAuthData.users = newUsers
      }
      await github.writeJsonFile(newAuthFile, newAuthData, `Admin update user: added ${user.email} (role change to ${newRole})`, newSha)
    } else {
      // Update in same file
      oldUsers[index] = updated
      if (oldIsAdmin) {
        oldAuthData.admins = oldUsers
      } else {
        oldAuthData.users = oldUsers
      }
      await github.writeJsonFile(oldAuthFile, oldAuthData, `Admin update user: ${user.email}`, oldSha)
    }

    return {
      id: updated.id,
      email: updated.email,
      name: updated.name,
      role: updated.role,
      isActive: updated.isActive,
      createdAt: updated.createdAt,
    }
  }

  // Admin Management API
  async getAdminAdmins(): Promise<Array<{
    id: string
    email: string
    name: string
    role: string
    isActive: boolean
    createdAt: string
  }>> {
    await this.checkPermission('manage_admins')
    const auth = this.verifyAuth()

    const github = getGitHubClient()
    const { data } = await github.readJsonFile<{ admins: any[] }>('backend/data/admins_auth.json')

    return (data.admins || []).map((u) => ({
      id: u.id,
      email: u.email,
      name: u.name,
      role: u.role,
      isActive: u.isActive,
      createdAt: u.createdAt,
    }))
  }

  async getAdminAdmin(adminId: string): Promise<{
    id: string
    email: string
    name: string
    role: string
    isActive: boolean
    createdAt: string
  }> {
    await this.checkPermission('manage_admins')
    const auth = this.verifyAuth()

    const user = await getUserById(adminId, 'admin')
    if (!user) {
      throw new Error('Admin not found')
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
    }
  }

  async createAdmin(data: { email: string; password: string; name?: string; role?: string }): Promise<{
    id: string
    email: string
    name: string
    role: string
    isActive: boolean
    createdAt: string
  }> {
    await this.checkPermission('manage_admins')
    const auth = this.verifyAuth()

    // Use provided role or default to 'admin'
    const role = data.role || 'admin'
    const result = await registerUser(data.email, data.password, data.name, role)
    const user = await getUserById(result.user.id, 'admin')
    
    if (!user) {
      throw new Error('Failed to create admin')
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
    }
  }

  async updateAdminAdmin(
    adminId: string,
    data: { name?: string; email?: string; role?: string; is_active?: boolean; password?: string }
  ): Promise<{
    id: string
    email: string
    name: string
    role: string
    isActive: boolean
    createdAt: string
  }> {
    // updateAdminAdmin always requires manage_admins permission (updating an admin)
    await this.checkPermission('manage_admins')
    return this.updateAdminUser(adminId, data)
  }

  async deleteAdmin(adminId: string): Promise<void> {
    await this.checkPermission('manage_admins')
    const auth = this.verifyAuth()

    if (auth.id === adminId) {
      throw new Error('Cannot delete your own account')
    }

    const github = getGitHubClient()
    const { data: authData } = await github.readJsonFile<{ admins: any[] }>('backend/data/admins_auth.json')
    
    authData.admins = (authData.admins || []).filter((u: any) => u.id !== adminId)

    await github.writeJsonFile('backend/data/admins_auth.json', authData, `Delete admin: ${adminId}`)
  }

  async getAdminSettings(): Promise<{
    siteName: string
    siteUrl: string
    maintenanceMode: boolean
    allowRegistration: boolean
    requireEmailVerification: boolean
    maxFileSize: number
    allowedFileTypes: string[]
    sessionTimeout: number
  }> {
    await this.checkPermission('manage_settings')
    const auth = this.verifyAuth()

    const github = getGitHubClient()
    const { data } = await github.readJsonFile('backend/data/settings.json')

    return data
  }

  async updateAdminSettings(data: {
    siteName?: string
    siteUrl?: string
    maintenanceMode?: boolean
    allowRegistration?: boolean
    requireEmailVerification?: boolean
    maxFileSize?: number
    allowedFileTypes?: string[]
    sessionTimeout?: number
  }): Promise<{
    siteName: string
    siteUrl: string
    maintenanceMode: boolean
    allowRegistration: boolean
    requireEmailVerification: boolean
    maxFileSize: number
    allowedFileTypes: string[]
    sessionTimeout: number
  }> {
    await this.checkPermission('manage_settings')
    const auth = this.verifyAuth()

    const github = getGitHubClient()
    const { data: settings } = await github.readJsonFile('backend/data/settings.json')

    const updated = {
      ...settings,
      ...data,
      updatedAt: new Date().toISOString(),
    }

    await github.writeJsonFile('backend/data/settings.json', updated, 'Update admin settings')

    return updated
  }

  // Admin Roles Management API
  async getAdminRoles(): Promise<Array<{
    id: string
    name: string
    displayName: string
    description: string
    permissions: string[]
    isSystem: boolean
    isActive: boolean
    createdAt: string
  }>> {
    await this.checkPermission('manage_roles')
    const auth = this.verifyAuth()

    const github = getGitHubClient()
    const { data } = await github.readJsonFile<{ version: string; lastUpdated: string; roles: any[] }>(
      'backend/data/admin_roles.json'
    )

    return data.roles || []
  }

  async createAdminRole(data: {
    name: string
    displayName: string
    description: string
    permissions: string[]
    isActive: boolean
  }): Promise<{
    id: string
    name: string
    displayName: string
    description: string
    permissions: string[]
    isSystem: boolean
    isActive: boolean
    createdAt: string
  }> {
    await this.checkPermission('manage_roles')
    const auth = this.verifyAuth()

    const github = getGitHubClient()
    const { data: rolesData, sha } = await github.readJsonFile<{ version: string; lastUpdated: string; roles: any[] }>(
      'backend/data/admin_roles.json'
    )

    const roles = rolesData.roles || []

    // Check if role name already exists
    if (roles.some((r: any) => r.name === data.name)) {
      throw new Error('Role with this name already exists')
    }

    // Generate role ID
    const roleId = `role-${data.name}`
    const newRole = {
      id: roleId,
      name: data.name,
      displayName: data.displayName,
      description: data.description || '',
      permissions: data.permissions || [],
      isSystem: false,
      isActive: data.isActive,
      createdAt: new Date().toISOString(),
    }

    roles.push(newRole)
    rolesData.roles = roles
    rolesData.lastUpdated = new Date().toISOString()

    await github.writeJsonFile(
      'backend/data/admin_roles.json',
      rolesData,
      `Create admin role: ${data.name}`,
      sha
    )

    return newRole
  }

  async updateAdminRole(
    roleId: string,
    data: { displayName?: string; description?: string; permissions?: string[]; isActive?: boolean }
  ): Promise<{
    id: string
    name: string
    displayName: string
    description: string
    permissions: string[]
    isSystem: boolean
    isActive: boolean
    createdAt: string
  }> {
    await this.checkPermission('manage_roles')
    const auth = this.verifyAuth()

    const github = getGitHubClient()
    const { data: rolesData, sha } = await github.readJsonFile<{ version: string; lastUpdated: string; roles: any[] }>(
      'backend/data/admin_roles.json'
    )

    const roles = rolesData.roles || []
    const index = roles.findIndex((r: any) => r.id === roleId)

    if (index === -1) {
      throw new Error('Role not found')
    }

    const role = roles[index]
    if (role.isSystem) {
      throw new Error('System roles cannot be fully edited')
    }

    const updated = {
      ...role,
      ...(data.displayName && { displayName: data.displayName }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.permissions && { permissions: data.permissions }),
      ...(data.isActive !== undefined && { isActive: data.isActive }),
    }

    roles[index] = updated
    rolesData.roles = roles
    rolesData.lastUpdated = new Date().toISOString()

    await github.writeJsonFile(
      'backend/data/admin_roles.json',
      rolesData,
      `Update admin role: ${role.name}`,
      sha
    )

    return updated
  }

  async deleteAdminRole(roleId: string): Promise<void> {
    await this.checkPermission('manage_roles')
    const auth = this.verifyAuth()

    const github = getGitHubClient()
    const { data: rolesData, sha } = await github.readJsonFile<{ version: string; lastUpdated: string; roles: any[] }>(
      'backend/data/admin_roles.json'
    )

    const roles = rolesData.roles || []
    const index = roles.findIndex((r: any) => r.id === roleId)

    if (index === -1) {
      throw new Error('Role not found')
    }

    const role = roles[index]
    if (role.isSystem) {
      throw new Error('System roles cannot be deleted')
    }

    roles.splice(index, 1)
    rolesData.roles = roles
    rolesData.lastUpdated = new Date().toISOString()

    await github.writeJsonFile(
      'backend/data/admin_roles.json',
      rolesData,
      `Delete admin role: ${role.name}`,
      sha
    )
  }
}

// Create singleton instance
const apiClient = new APIClient()

// Load token from localStorage on initialization
apiClient.setToken(apiClient.getToken())

export default apiClient

