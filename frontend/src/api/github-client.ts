/**
 * GitHub API Client
 * 
 * Handles all GitHub API operations for reading/writing JSON files
 * in the repository. This replaces the FastAPI backend.
 */

export interface GitHubFileResponse {
  sha: string
  content: string
  encoding: string
  size: number
  name: string
  path: string
  url: string
}

export interface GitHubError {
  message: string
  documentation_url?: string
}

export class GitHubAPIError extends Error {
  constructor(
    public status: number,
    public message: string,
    public response?: any
  ) {
    super(message)
    this.name = 'GitHubAPIError'
  }
}

/**
 * GitHub API Client Class
 */
export class GitHubClient {
  private owner: string
  private repo: string
  private token: string
  private baseURL = 'https://api.github.com'
  private cache: Map<string, { data: any; sha: string; timestamp: number }> = new Map()
  private cacheTTL = 5 * 60 * 1000 // 5 minutes

  constructor(owner: string, repo: string, token: string) {
    this.owner = owner
    this.repo = repo
    this.token = token
  }

  /**
   * Get headers for GitHub API requests
   */
  private getHeaders(acceptRaw = false): HeadersInit {
    const headers: HeadersInit = {
      'Authorization': `token ${this.token}`,
      'Accept': acceptRaw 
        ? 'application/vnd.github.v3.raw' 
        : 'application/vnd.github.v3+json',
    }
    return headers
  }

  /**
   * Handle GitHub API errors
   */
  private async handleError(response: Response): Promise<never> {
    let errorData: GitHubError
    try {
      errorData = await response.json()
    } catch {
      errorData = { message: response.statusText }
    }

    throw new GitHubAPIError(
      response.status,
      errorData.message || response.statusText,
      errorData
    )
  }

  /**
   * Read a JSON file from GitHub repository
   */
  async readJsonFile<T = any>(path: string, useCache = true): Promise<{ data: T; sha: string }> {
    // Check cache first
    if (useCache) {
      const cached = this.cache.get(path)
      if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
        return { data: cached.data, sha: cached.sha }
      }
    }

    try {
      const url = `${this.baseURL}/repos/${this.owner}/${this.repo}/contents/${path}`
      const response = await fetch(url, {
        headers: this.getHeaders(true),
      })

      if (!response.ok) {
        if (response.status === 404) {
          // File doesn't exist, return empty structure
          return { data: {} as T, sha: '' }
        }
        await this.handleError(response)
      }

      const text = await response.text()
      let data: T
      
      if (text.trim() === '') {
        data = {} as T
      } else {
        try {
          data = JSON.parse(text)
        } catch (parseError) {
          console.error(`Failed to parse JSON from ${path}:`, parseError)
          throw new GitHubAPIError(422, `Invalid JSON in file: ${path}`)
        }
      }

      // Get SHA from metadata endpoint (needed for updates)
      const metaResponse = await fetch(url, {
        headers: this.getHeaders(false),
      })
      
      let sha = ''
      if (metaResponse.ok) {
        const meta: GitHubFileResponse = await metaResponse.json()
        sha = meta.sha
      }

      // Update cache
      if (useCache) {
        this.cache.set(path, { data, sha, timestamp: Date.now() })
      }

      return { data, sha }
    } catch (error) {
      if (error instanceof GitHubAPIError) {
        throw error
      }
      throw new GitHubAPIError(500, `Failed to read file: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Write/Update a JSON file in GitHub repository
   */
  async writeJsonFile<T = any>(
    path: string,
    content: T,
    message: string,
    sha?: string,
    retries = 3
  ): Promise<void> {
    // If no SHA provided, get current file SHA
    let currentSha = sha
    if (!currentSha) {
      try {
        const current = await this.readJsonFile(path, false)
        currentSha = current.sha
      } catch (error) {
        if (error instanceof GitHubAPIError && error.status === 404) {
          currentSha = '' // New file
        } else {
          throw error
        }
      }
    }

    // Encode content to base64
    const jsonString = JSON.stringify(content, null, 2)
    const encodedContent = btoa(unescape(encodeURIComponent(jsonString)))

    const url = `${this.baseURL}/repos/${this.owner}/${this.repo}/contents/${path}`
    const body: any = {
      message,
      content: encodedContent,
    }

    // Include SHA for updates (required by GitHub API)
    if (currentSha) {
      body.sha = currentSha
    }

    try {
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          ...this.getHeaders(false),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        if (response.status === 409 && retries > 0) {
          // Conflict - file changed, retry with new SHA
          console.warn(`Conflict writing ${path}, retrying... (${retries} retries left)`)
          await this.delay(1000) // Wait 1 second before retry
          const current = await this.readJsonFile(path, false)
          return this.writeJsonFile(path, content, message, current.sha, retries - 1)
        }
        await this.handleError(response)
      }

      // Invalidate cache
      this.cache.delete(path)
    } catch (error) {
      if (error instanceof GitHubAPIError) {
        throw error
      }
      throw new GitHubAPIError(500, `Failed to write file: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Delete a file from GitHub repository
   */
  async deleteJsonFile(path: string, message: string, retries = 3): Promise<void> {
    // Get current file SHA (required for deletion)
    let sha: string
    try {
      const current = await this.readJsonFile(path, false)
      sha = current.sha
      if (!sha) {
        throw new GitHubAPIError(404, `File not found: ${path}`)
      }
    } catch (error) {
      if (error instanceof GitHubAPIError && error.status === 404) {
        // File already doesn't exist
        return
      }
      throw error
    }

    const url = `${this.baseURL}/repos/${this.owner}/${this.repo}/contents/${path}`
    
    try {
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          ...this.getHeaders(false),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          sha,
        }),
      })

      if (!response.ok) {
        if (response.status === 409 && retries > 0) {
          // Conflict - file changed, retry with new SHA
          console.warn(`Conflict deleting ${path}, retrying... (${retries} retries left)`)
          await this.delay(1000)
          return this.deleteJsonFile(path, message, retries - 1)
        }
        await this.handleError(response)
      }

      // Invalidate cache
      this.cache.delete(path)
    } catch (error) {
      if (error instanceof GitHubAPIError) {
        throw error
      }
      throw new GitHubAPIError(500, `Failed to delete file: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * List files in a directory
   */
  async listFiles(path: string): Promise<GitHubFileResponse[]> {
    const url = `${this.baseURL}/repos/${this.owner}/${this.repo}/contents/${path}`
    
    try {
      const response = await fetch(url, {
        headers: this.getHeaders(false),
      })

      if (!response.ok) {
        if (response.status === 404) {
          return []
        }
        await this.handleError(response)
      }

      const files = await response.json()
      return Array.isArray(files) ? files : []
    } catch (error) {
      if (error instanceof GitHubAPIError) {
        throw error
      }
      throw new GitHubAPIError(500, `Failed to list files: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Clear cache for a specific file or all files
   */
  clearCache(path?: string): void {
    if (path) {
      this.cache.delete(path)
    } else {
      this.cache.clear()
    }
  }

  /**
   * Delay helper for retries
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * Handle rate limiting with exponential backoff
   */
  async handleRateLimit(retryAfter?: number): Promise<void> {
    const delay = retryAfter 
      ? retryAfter * 1000 
      : Math.min(60000, Math.pow(2, 3) * 1000) // Max 60 seconds
    
    console.warn(`Rate limit hit, waiting ${delay}ms...`)
    await this.delay(delay)
  }
}

/**
 * Create GitHub client instance
 */
export function createGitHubClient(): GitHubClient {
  const owner = import.meta.env.VITE_GITHUB_OWNER || ''
  const repo = import.meta.env.VITE_GITHUB_REPO || ''
  const token = import.meta.env.VITE_GITHUB_TOKEN || ''

  // Better error message with details about what's missing
  const missing: string[] = []
  if (!owner) missing.push('VITE_GITHUB_OWNER')
  if (!repo) missing.push('VITE_GITHUB_REPO')
  if (!token) missing.push('VITE_GITHUB_TOKEN')

  if (missing.length > 0) {
    const errorMsg = `GitHub configuration missing: ${missing.join(', ')}. ` +
      `Please ensure these environment variables are set in your GitHub Actions workflow. ` +
      `Current values: OWNER=${owner ? '***' : 'MISSING'}, REPO=${repo ? '***' : 'MISSING'}, TOKEN=${token ? '***' : 'MISSING'}`
    console.error('[GitHub Client]', errorMsg)
    throw new Error(errorMsg)
  }

  return new GitHubClient(owner, repo, token)
}

// Singleton instance
let githubClientInstance: GitHubClient | null = null

/**
 * Get or create GitHub client singleton
 */
export function getGitHubClient(): GitHubClient {
  if (!githubClientInstance) {
    githubClientInstance = createGitHubClient()
  }
  return githubClientInstance
}

