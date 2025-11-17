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
  private client: AxiosInstance
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
        if (this.token) {
          config.headers.Authorization = `Bearer ${this.token}`
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
}

// Create singleton instance
const apiClient = new APIClient(
  import.meta.env.VITE_API_URL || 'http://localhost:8000'
)

// Load token from localStorage on initialization
apiClient.setToken(apiClient.getToken())

export default apiClient

