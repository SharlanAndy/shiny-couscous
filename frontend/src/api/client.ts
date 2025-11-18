import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios'
import type {
  FormResponse,
  FormSchemaResponse,
  SubmissionCreateRequest,
  SubmissionCreateResponse,
  SubmissionResponse,
  ValidationResponse,
} from '@/types'

/**
 * API Client for Labuan FSA E-Submission System
 */
class APIClient {
  public client: AxiosInstance
  private token: string | null = null

  constructor(baseURL: string) {
    this.client = axios.create({
      baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Request interceptor for auth token
    this.client.interceptors.request.use(
      (config) => {
        // Always check localStorage in case token was updated
        const token = this.getToken()
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => Promise.reject(error)
    )

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Handle unauthorized - redirect to login or clear token
          this.setToken(null)
          // window.location.href = '/login'
        }
        return Promise.reject(error)
      }
    )
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

  // Forms API
  async getForms(params?: {
    status?: string
    category?: string
    search?: string
    page?: number
    pageSize?: number
  }): Promise<FormResponse[]> {
    const response = await this.client.get<FormResponse[]>('/api/forms', { params })
    return response.data
  }

  async getForm(formId: string): Promise<FormResponse> {
    const response = await this.client.get<FormResponse>(`/api/forms/${formId}`)
    return response.data
  }

  async getFormSchema(formId: string): Promise<FormSchemaResponse> {
    const response = await this.client.get<FormSchemaResponse>(`/api/forms/${formId}/schema`)
    return response.data
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
    const response = await this.client.post<FormResponse>('/api/forms', formData)
    return response.data
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
    const response = await this.client.put<FormResponse>(`/api/forms/${formId}`, formData)
    return response.data
  }

  async updateFormSchema(formId: string, schemaData: FormSchemaResponse): Promise<FormSchemaResponse> {
    // First update the form with the schema data
    // Get form to ensure it exists
    await this.getForm(formId)
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
    await this.client.delete(`/api/admin/forms/${formId}`)
  }

  // Submissions API
  async validateSubmission(
    formId: string,
    data: Record<string, any>,
    stepId?: string
  ): Promise<ValidationResponse> {
    const response = await this.client.post<ValidationResponse>(
      `/api/forms/${formId}/validate`,
      { data, stepId }
    )
    return response.data
  }

  async submitForm(
    formId: string,
    request: SubmissionCreateRequest
  ): Promise<SubmissionCreateResponse> {
    const response = await this.client.post<SubmissionCreateResponse>(
      `/api/forms/${formId}/submit`,
      request
    )
    return response.data
  }

  async saveDraft(
    formId: string,
    request: SubmissionCreateRequest
  ): Promise<SubmissionResponse> {
    const response = await this.client.post<SubmissionResponse>(
      `/api/forms/${formId}/draft`,
      request
    )
    return response.data
  }

  async updateDraft(
    submissionId: string,
    request: SubmissionCreateRequest
  ): Promise<SubmissionResponse> {
    const response = await this.client.put<SubmissionResponse>(
      `/api/submissions/${submissionId}/draft`,
      request
    )
    return response.data
  }

  async getSubmissions(params?: {
    formId?: string
    status?: string
    page?: number
    pageSize?: number
  }): Promise<SubmissionResponse[]> {
    const response = await this.client.get<SubmissionResponse[]>('/api/submissions', { params })
    return response.data
  }

  async getSubmission(submissionId: string): Promise<SubmissionResponse> {
    const response = await this.client.get<SubmissionResponse>(
      `/api/submissions/${submissionId}`
    )
    return response.data
  }

  // File Upload API
  async uploadFile(
    file: File,
    fieldName: string,
    onProgress?: (progress: number) => void
  ): Promise<any> {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('fieldName', fieldName)

    const config: AxiosRequestConfig = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = (progressEvent.loaded / progressEvent.total) * 100
          onProgress(progress)
        }
      },
    }

    const response = await this.client.post('/api/files/upload', formData, config)
    return response.data
  }

  // Admin API
  async getAdminSubmissions(params?: {
    formId?: string
    status?: string
    page?: number
    pageSize?: number
  }): Promise<SubmissionResponse[]> {
    const response = await this.client.get<SubmissionResponse[]>('/api/admin/submissions', {
      params,
    })
    return response.data
  }

  async reviewSubmission(
    submissionId: string,
    updateData: {
      status?: string
      reviewNotes?: string
      requestedInfo?: string
    }
  ): Promise<SubmissionResponse> {
    const response = await this.client.put<SubmissionResponse>(
      `/api/admin/submissions/${submissionId}`,
      updateData
    )
    return response.data
  }

  async deleteSubmission(submissionId: string): Promise<void> {
    await this.client.delete(`/api/admin/submissions/${submissionId}`)
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
    const response = await this.client.get('/api/admin/statistics')
    return response.data
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
    const response = await this.client.post('/api/auth/login', {
      email,
      password,
      role,
    })
    return response.data
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
    const response = await this.client.post('/api/auth/register', {
      email,
      password,
      name,
      role,
    })
    return response.data
  }

  async logout(): Promise<void> {
    try {
      await this.client.post('/api/auth/logout')
    } catch (e) {
      // Ignore logout errors - still clear local storage
      console.error('Logout API error:', e)
    } finally {
      this.setToken(null)
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      localStorage.removeItem('userRole')
      localStorage.removeItem('rememberMe')
    }
  }

  async getCurrentUser(): Promise<{
    id: string
    email: string
    name: string
    role: string
    isActive: boolean
    createdAt: string
  }> {
    const response = await this.client.get<{
      id: string
      email: string
      name: string
      role: string
      isActive: boolean
      createdAt: string
    }>('/api/auth/me')
    return response.data
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
    const response = await this.client.put<{
      id: string
      email: string
      name: string
      role: string
      isActive: boolean
      createdAt: string
      emailChanged?: boolean
    }>('/api/auth/profile', data)
    return response.data
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<{ message: string }> {
    const response = await this.client.post<{ message: string }>('/api/auth/change-password', {
      current_password: currentPassword,
      new_password: newPassword,
    })
    return response.data
  }

  async deleteAccount(password: string): Promise<{ message: string }> {
    const response = await this.client.post<{ message: string }>('/api/auth/account/delete', {
      password,
    })
    return response.data
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
    const response = await this.client.get<Array<{
      id: string
      email: string
      name: string
      role: string
      isActive: boolean
      createdAt: string
    }>>('/api/admin/users')
    return response.data
  }

  async getAdminUser(userId: string): Promise<{
    id: string
    email: string
    name: string
    role: string
    isActive: boolean
    createdAt: string
  }> {
    const response = await this.client.get<{
      id: string
      email: string
      name: string
      role: string
      isActive: boolean
      createdAt: string
    }>(`/api/admin/users/${userId}`)
    return response.data
  }

  async updateAdminUser(
    userId: string,
    data: { name?: string; email?: string; is_active?: boolean; password?: string }
  ): Promise<{
    id: string
    email: string
    name: string
    role: string
    isActive: boolean
    createdAt: string
  }> {
    const response = await this.client.put<{
      id: string
      email: string
      name: string
      role: string
      isActive: boolean
      createdAt: string
    }>(`/api/admin/users/${userId}`, data)
    return response.data
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
    const response = await this.client.get<Array<{
      id: string
      email: string
      name: string
      role: string
      isActive: boolean
      createdAt: string
    }>>('/api/admin/admins')
    return response.data
  }

  async getAdminAdmin(adminId: string): Promise<{
    id: string
    email: string
    name: string
    role: string
    isActive: boolean
    createdAt: string
  }> {
    const response = await this.client.get<{
      id: string
      email: string
      name: string
      role: string
      isActive: boolean
      createdAt: string
    }>(`/api/admin/admins/${adminId}`)
    return response.data
  }

  async createAdmin(data: { email: string; password: string; name?: string }): Promise<{
    id: string
    email: string
    name: string
    role: string
    isActive: boolean
    createdAt: string
  }> {
    const response = await this.client.post<{
      id: string
      email: string
      name: string
      role: string
      isActive: boolean
      createdAt: string
    }>('/api/admin/admins', data)
    return response.data
  }

  async updateAdminAdmin(
    adminId: string,
    data: { name?: string; email?: string; is_active?: boolean; password?: string }
  ): Promise<{
    id: string
    email: string
    name: string
    role: string
    isActive: boolean
    createdAt: string
  }> {
    const response = await this.client.put<{
      id: string
      email: string
      name: string
      role: string
      isActive: boolean
      createdAt: string
    }>(`/api/admin/admins/${adminId}`, data)
    return response.data
  }

  async deleteAdmin(adminId: string): Promise<void> {
    await this.client.delete(`/api/admin/admins/${adminId}`)
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
    const response = await this.client.get<{
      siteName: string
      siteUrl: string
      maintenanceMode: boolean
      allowRegistration: boolean
      requireEmailVerification: boolean
      maxFileSize: number
      allowedFileTypes: string[]
      sessionTimeout: number
    }>('/api/admin/settings')
    return response.data
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
    const response = await this.client.put<{
      siteName: string
      siteUrl: string
      maintenanceMode: boolean
      allowRegistration: boolean
      requireEmailVerification: boolean
      maxFileSize: number
      allowedFileTypes: string[]
      sessionTimeout: number
    }>('/api/admin/settings', data)
    return response.data
  }
}

// Create singleton instance
const apiClient = new APIClient(
  import.meta.env.VITE_API_URL || 'http://localhost:8000'
)

// Load token from localStorage on initialization
apiClient.setToken(apiClient.getToken())

export default apiClient

