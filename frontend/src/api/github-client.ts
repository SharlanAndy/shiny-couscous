/**
 * GitHub API Client
 * 
 * Handles all GitHub API operations for reading/writing JSON files
 * in the repository. This replaces the FastAPI backend.
 */

import {
  splitDataIntoChunks,
  mergeChunksIntoData,
  getSplitFilePaths,
  isSplitFile,
  getBasePathFromSplit,
  estimateJsonSize,
  MAX_FILE_SIZE,
} from './github-client-split'

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
      'User-Agent': 'Labuan-FSA-E-Submission-System', // GitHub API requires User-Agent
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
   * Automatically handles split files (e.g., forms.0.json, forms.1.json)
   */
  async readJsonFile<T = any>(path: string, useCache = true): Promise<{ data: T; sha: string }> {
    // Check cache first
    if (useCache) {
      const cached = this.cache.get(path)
      if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
        return { data: cached.data, sha: cached.sha }
      }
    }

    // Check if this is a split file - if so, read all chunks and merge
    if (isSplitFile(path)) {
      return this.readSplitFile<T>(path, useCache)
    }

    // Try to read the main file first
    try {
      return await this.readSingleFile<T>(path, useCache)
    } catch (error) {
      // If main file doesn't exist (404), check if split files exist
      if (error instanceof GitHubAPIError && error.status === 404) {
        // Check if split files exist for this base path
        const splitPaths = getSplitFilePaths(path, 100)
        const existingSplitFiles: Array<{ path: string; data: T; sha: string }> = []
        
        // Try to read split files (forms.0.json, forms.1.json, etc.)
        for (const splitPath of splitPaths) {
          try {
            const result = await this.readSingleFile<T>(splitPath)
            existingSplitFiles.push({ path: splitPath, ...result })
          } catch (splitError) {
            // File doesn't exist, stop checking
            break
          }
        }

        // If we found split files, merge them
        if (existingSplitFiles.length > 0) {
          const merged = mergeChunksIntoData<T>(existingSplitFiles.map(f => ({ path: f.path, data: f.data })))
          const firstSha = existingSplitFiles[0].sha // Use first chunk's SHA for cache
          
          if (useCache) {
            this.cache.set(path, { data: merged, sha: firstSha, timestamp: Date.now() })
          }
          
          return { data: merged, sha: firstSha }
        }
      }
      
      // Re-throw the original error if no split files found
      throw error
    }
  }

  /**
   * Read a single JSON file (internal method)
   */
  private async readSingleFile<T = any>(path: string, useCache = true): Promise<{ data: T; sha: string }> {
    // Check cache first
    if (useCache) {
      const cached = this.cache.get(path)
      if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
        return { data: cached.data, sha: cached.sha }
      }
    }

    try {
      const url = `${this.baseURL}/repos/${this.owner}/${this.repo}/contents/${path}`
      
      // Get metadata (includes SHA) using JSON accept header
      // GitHub API returns: { sha, content (base64), encoding, size, name, path, url, ... }
      const metaResponse = await fetch(url, {
        headers: this.getHeaders(false),
      })

      if (!metaResponse.ok) {
        if (metaResponse.status === 404) {
          // File doesn't exist, return empty structure
          return { data: {} as T, sha: '' }
        }
        await this.handleError(metaResponse)
      }

      // Parse metadata response
      const metaText = await metaResponse.text()
      let meta: any
      
      try {
        meta = JSON.parse(metaText)
      } catch (parseError) {
        console.error(`Failed to parse metadata response for ${path}:`, parseError)
        console.error('Raw response:', metaText.substring(0, 500))
        throw new GitHubAPIError(500, `Invalid metadata response format for: ${path}`)
      }
      
      // Check if response is the file content (parsed JSON) instead of metadata
      // This happens when GitHub returns the file content directly
      if (!('sha' in meta) && !('content' in meta) && !Array.isArray(meta)) {
        // This looks like file content, not metadata
        // We need to get SHA from a different endpoint or use Git API
        console.warn(`[GitHub Client] Response appears to be file content, not metadata. Using Git API to get SHA.`)
        
        // Use Git Trees API to get SHA
        // First, get the latest commit SHA
        const commitsUrl = `${this.baseURL}/repos/${this.owner}/${this.repo}/commits?path=${encodeURIComponent(path)}&per_page=1`
        const commitsResponse = await fetch(commitsUrl, {
          headers: this.getHeaders(false),
        })
        
        if (commitsResponse.ok) {
          const commits = await commitsResponse.json()
          if (commits && commits.length > 0) {
            const commit = commits[0]
            // Get tree SHA from commit
            const treeUrl = `${this.baseURL}/repos/${this.owner}/${this.repo}/git/trees/${commit.commit.tree.sha}?recursive=1`
            const treeResponse = await fetch(treeUrl, {
              headers: this.getHeaders(false),
            })
            
            if (treeResponse.ok) {
              const tree = await treeResponse.json()
              const fileEntry = tree.tree?.find((entry: any) => entry.path === path)
              if (fileEntry && fileEntry.sha) {
                // Use the file content we already have and the SHA from tree
                const data = meta as T
                return { data, sha: fileEntry.sha }
              }
            }
          }
        }
        
        // Fallback: try to get SHA from the file's blob
        throw new GitHubAPIError(500, `Could not retrieve SHA for file: ${path}. Response appears to be file content, not metadata.`)
      }
      
      // Normal case: metadata response with sha and content
      const sha = meta.sha || ''
      
      if (!sha) {
        console.error(`File exists but SHA is missing in metadata for ${path}`)
        console.error('Metadata response keys:', Object.keys(meta))
        throw new GitHubAPIError(500, `Could not retrieve SHA for existing file: ${path}`)
      }

      // Decode base64 content from metadata
      let data: T
      
      // GitHub API doesn't return content for files > 1MB
      // Check if content is missing or if file is too large
      if (!meta.content || meta.encoding === 'none' || (meta.size && meta.size > 1000000)) {
        // File is too large or content not in metadata - use Git Data API to get blob
        // This avoids CORS issues with raw.githubusercontent.com
        const blobUrl = `${this.baseURL}/repos/${this.owner}/${this.repo}/git/blobs/${sha}`
        const blobResponse = await fetch(blobUrl, {
          headers: this.getHeaders(false),
        })
        
        if (!blobResponse.ok) {
          throw new GitHubAPIError(blobResponse.status, `Failed to get file blob: ${path}`)
        }
        
        const blobData = await blobResponse.json()
        
        // Decode base64 content
        let text: string
        if (blobData.encoding === 'base64') {
          text = atob(blobData.content.replace(/\s/g, ''))
        } else {
          text = blobData.content
        }
        
        if (text.trim() === '') {
          data = {} as T
        } else {
          try {
            data = JSON.parse(text) as T
          } catch (parseError) {
            console.error(`Failed to parse JSON from ${path}:`, parseError)
            throw new GitHubAPIError(422, `Invalid JSON in file: ${path}`)
          }
        }
        
        // Update cache and return
        if (useCache) {
          this.cache.set(path, { data, sha, timestamp: Date.now() })
        }
        
        return { data, sha }
      }
      
      // Fallback: try raw URL if blob API fails (shouldn't happen, but just in case)
      if (!meta.content || meta.encoding === 'none') {
        const rawUrl = `https://raw.githubusercontent.com/${this.owner}/${this.repo}/main/${path}`
        const contentResponse = await fetch(rawUrl, {
          headers: this.getHeaders(true),
        })
        
        if (!contentResponse.ok) {
          throw new GitHubAPIError(contentResponse.status, `Failed to get file content: ${path}`)
        }

        const text = await contentResponse.text()
        
        if (text.trim() === '') {
          data = {} as T
        } else {
          try {
            data = JSON.parse(text) as T
          } catch (parseError) {
            console.error(`Failed to parse JSON from ${path}:`, parseError)
            throw new GitHubAPIError(422, `Invalid JSON in file: ${path}`)
          }
        }
      } else if (meta.content && meta.encoding === 'base64') {
        try {
          const decodedContent = atob(meta.content.replace(/\s/g, ''))
          data = JSON.parse(decodedContent) as T
        } catch (parseError) {
          console.error(`Failed to decode/parse content from metadata for ${path}:`, parseError)
          throw new GitHubAPIError(422, `Invalid JSON in file: ${path}`)
        }
      } else {
        // Fallback: get content using raw endpoint
        const contentResponse = await fetch(url, {
          headers: this.getHeaders(true),
        })
        
        if (!contentResponse.ok) {
          throw new GitHubAPIError(contentResponse.status, `Failed to get file content: ${path}`)
        }

        const text = await contentResponse.text()
        
        if (text.trim() === '') {
          data = {} as T
        } else {
          try {
            data = JSON.parse(text) as T
          } catch (parseError) {
            console.error(`Failed to parse JSON from ${path}:`, parseError)
            throw new GitHubAPIError(422, `Invalid JSON in file: ${path}`)
          }
        }
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
   * Read a split file (when path is already a split file like forms.0.json)
   */
  private async readSplitFile<T = any>(path: string, useCache = true): Promise<{ data: T; sha: string }> {
    const basePath = getBasePathFromSplit(path)
    return this.readJsonFile<T>(basePath, useCache)
  }

  /**
   * Write/Update a JSON file in GitHub repository
   * Automatically splits large files into chunks if they exceed size limit
   */
  async writeJsonFile<T = any>(
    path: string,
    content: T,
    message: string,
    sha?: string,
    retries = 3
  ): Promise<void> {
    // Check if file needs to be split
    const estimatedSize = estimateJsonSize(content)
    const needsSplit = estimatedSize > MAX_FILE_SIZE

    if (needsSplit) {
      // Split into chunks
      const chunks = splitDataIntoChunks(content, path)
      
      if (chunks.length > 1) {
        // Write chunks sequentially to avoid SHA conflicts
        // When writing in parallel, SHAs can change between read and write
        for (let i = 0; i < chunks.length; i++) {
          const chunk = chunks[i]
          const chunkMessage = `${message} (chunk ${(chunk.chunkIndex ?? i) + 1}/${chunks.length})`
          
          // Read current SHA right before writing (don't cache, use fresh SHA)
          let chunkSha: string | undefined
          try {
            const existing = await this.readSingleFile(chunk.path, false)
            chunkSha = existing.sha
          } catch (error) {
            // Chunk doesn't exist yet, that's fine - will create new file
            chunkSha = undefined
          }
          
          // Write chunk with current SHA
          await this.writeSingleFile(chunk.path, chunk.data, chunkMessage, chunkSha, retries)
        }

        // Delete old main file if it exists (to avoid confusion)
        try {
          const current = await this.readSingleFile(path, false)
          if (current.sha) {
            await this.deleteJsonFile(path, `Remove old file after splitting into ${chunks.length} chunks`)
          }
        } catch (error) {
          // File doesn't exist, that's fine
        }

        // Delete any old split files beyond the new count
        const splitPaths = getSplitFilePaths(path, 100)
        for (let i = chunks.length; i < splitPaths.length; i++) {
          try {
            await this.deleteJsonFile(splitPaths[i], `Remove old split chunk ${i} after resplitting`)
          } catch (error) {
            // File doesn't exist, that's fine
          }
        }

        // Invalidate cache
        this.cache.delete(path)
        chunks.forEach((chunk: { path: string; data: T }) => this.cache.delete(chunk.path))
        
        return
      }
    }

    // File doesn't need splitting or is single chunk, write normally
    // But first check if old split files exist and delete them
    const splitPaths = getSplitFilePaths(path, 100)
    for (const splitPath of splitPaths) {
      try {
        await this.deleteJsonFile(splitPath, `Remove split files after consolidating into single file`)
      } catch (error) {
        // File doesn't exist, that's fine
      }
    }

    await this.writeSingleFile(path, content, message, sha, retries)
  }

  /**
   * Write a single JSON file (internal method)
   */
  private async writeSingleFile<T = any>(
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
        const current = await this.readSingleFile(path, false)
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

    // Include SHA ONLY for updates (required by GitHub API)
    // For new files, do NOT include sha field at all
    if (currentSha && currentSha.trim() !== '') {
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
          const current = await this.readSingleFile(path, false)
          return this.writeSingleFile(path, content, message, current.sha, retries - 1)
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
 * Check if GitHub API is configured
 */
export function isGitHubConfigured(): boolean {
  const owner = import.meta.env.VITE_GITHUB_OWNER || ''
  const repo = import.meta.env.VITE_GITHUB_REPO || ''
  const token = import.meta.env.VITE_GITHUB_TOKEN || ''
  return !!(owner && repo && token)
}

/**
 * Create GitHub client instance
 * Returns null if not configured (for local development mode)
 */
export function createGitHubClient(): GitHubClient | null {
  const owner = import.meta.env.VITE_GITHUB_OWNER || ''
  const repo = import.meta.env.VITE_GITHUB_REPO || ''
  const token = import.meta.env.VITE_GITHUB_TOKEN || ''

  // If not configured, return null (will use local backend API instead)
  if (!owner || !repo || !token) {
    if (import.meta.env.DEV) {
      console.warn('[GitHub Client] GitHub API not configured. Using local backend API mode.')
      console.warn('[GitHub Client] To use GitHub API, set: VITE_GITHUB_OWNER, VITE_GITHUB_REPO, VITE_GITHUB_TOKEN')
    }
    return null
  }

  return new GitHubClient(owner, repo, token)
}

// Singleton instance
let githubClientInstance: GitHubClient | null = null

/**
 * Get or create GitHub client singleton
 * Returns null if GitHub is not configured (for local development)
 */
export function getGitHubClient(): GitHubClient | null {
  if (githubClientInstance === null && isGitHubConfigured()) {
    githubClientInstance = createGitHubClient()
  }
  return githubClientInstance
}

