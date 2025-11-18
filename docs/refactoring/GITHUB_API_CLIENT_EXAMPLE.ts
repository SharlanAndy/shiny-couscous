/**
 * Example GitHub API Client Implementation
 * 
 * This is a reference implementation showing how to interact with GitHub API
 * to read/write JSON files in the repository.
 */

// GitHub API Configuration
const GITHUB_OWNER = import.meta.env.VITE_GITHUB_OWNER || 'clkhoo5211'
const GITHUB_REPO = import.meta.env.VITE_GITHUB_REPO || 'shiny-couscous'
const GITHUB_BRANCH = import.meta.env.VITE_GITHUB_BRANCH || 'main'
const GITHUB_TOKEN = import.meta.env.VITE_GITHUB_TOKEN || ''

const GITHUB_API_BASE = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}`

/**
 * Read a JSON file from GitHub repository
 */
async function readJsonFile(path: string): Promise<any> {
  const url = `${GITHUB_API_BASE}/contents/${path}?ref=${GITHUB_BRANCH}`
  
  const response = await fetch(url, {
    headers: {
      'Authorization': `token ${GITHUB_TOKEN}`,
      'Accept': 'application/vnd.github.v3.raw', // Get raw content, not JSON metadata
    },
  })
  
  if (!response.ok) {
    if (response.status === 404) {
      // File doesn't exist, return default value
      return null
    }
    throw new Error(`Failed to read file: ${response.statusText}`)
  }
  
  const text = await response.text()
  try {
    return JSON.parse(text)
  } catch (e) {
    // Handle case where file has metadata wrapper
    const json = JSON.parse(text)
    if (json.items) return json.items
    if (json.data) return json.data
    return json
  }
}

/**
 * Get file SHA (required for updates)
 */
async function getFileSha(path: string): Promise<string | null> {
  const url = `${GITHUB_API_BASE}/contents/${path}?ref=${GITHUB_BRANCH}`
  
  const response = await fetch(url, {
    headers: {
      'Authorization': `token ${GITHUB_TOKEN}`,
      'Accept': 'application/vnd.github.v3+json',
    },
  })
  
  if (!response.ok) {
    if (response.status === 404) {
      return null // File doesn't exist
    }
    throw new Error(`Failed to get file SHA: ${response.statusText}`)
  }
  
  const data = await response.json()
  return data.sha
}

/**
 * Write a JSON file to GitHub repository (creates a commit)
 */
async function writeJsonFile(
  path: string,
  content: any,
  message: string,
  retryCount: number = 0
): Promise<void> {
  const maxRetries = 3
  
  try {
    // Get current file SHA (required for updates)
    const sha = await getFileSha(path)
    
    // Encode content to base64
    const jsonString = JSON.stringify(content, null, 2)
    const encodedContent = btoa(unescape(encodeURIComponent(jsonString)))
    
    // Create/Update file via GitHub API
    const url = `${GITHUB_API_BASE}/contents/${path}`
    const body: any = {
      message: message,
      content: encodedContent,
      branch: GITHUB_BRANCH,
    }
    
    // Include SHA for updates (required to avoid conflicts)
    if (sha) {
      body.sha = sha
    }
    
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.github.v3+json',
      },
      body: JSON.stringify(body),
    })
    
    if (!response.ok) {
      if (response.status === 409 && retryCount < maxRetries) {
        // Conflict - file changed, retry with new SHA
        console.log(`Conflict detected, retrying (${retryCount + 1}/${maxRetries})...`)
        await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1))) // Exponential backoff
        return writeJsonFile(path, content, message, retryCount + 1)
      }
      
      const error = await response.json()
      throw new Error(`Failed to write file: ${error.message || response.statusText}`)
    }
    
    return
  } catch (error: any) {
    if (error.message.includes('409') && retryCount < maxRetries) {
      // Retry on conflict
      await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)))
      return writeJsonFile(path, content, message, retryCount + 1)
    }
    throw error
  }
}

/**
 * Update an entry in a JSON array file
 */
async function updateJsonArrayEntry(
  filePath: string,
  entryId: string,
  idField: string,
  updateFn: (entry: any) => any,
  commitMessage: string
): Promise<any> {
  // Read current file
  const fileData = await readJsonFile(filePath)
  const items = fileData?.items || fileData?.data || (Array.isArray(fileData) ? fileData : [])
  
  // Find and update entry
  const index = items.findIndex((item: any) => item[idField] === entryId)
  if (index === -1) {
    throw new Error(`Entry not found: ${entryId}`)
  }
  
  // Update entry
  items[index] = updateFn(items[index])
  
  // Save updated file
  const updatedData = {
    version: fileData?.version || '1.0.0',
    lastUpdated: new Date().toISOString(),
    items: items,
  }
  
  await writeJsonFile(filePath, updatedData, commitMessage)
  return items[index]
}

/**
 * Add an entry to a JSON array file
 */
async function addJsonArrayEntry(
  filePath: string,
  newEntry: any,
  commitMessage: string
): Promise<any> {
  // Read current file
  const fileData = await readJsonFile(filePath)
  const items = fileData?.items || fileData?.data || (Array.isArray(fileData) ? fileData : [])
  
  // Add new entry
  items.push(newEntry)
  
  // Save updated file
  const updatedData = {
    version: fileData?.version || '1.0.0',
    lastUpdated: new Date().toISOString(),
    items: items,
  }
  
  await writeJsonFile(filePath, updatedData, commitMessage)
  return newEntry
}

/**
 * Remove an entry from a JSON array file
 */
async function removeJsonArrayEntry(
  filePath: string,
  entryId: string,
  idField: string,
  commitMessage: string
): Promise<void> {
  // Read current file
  const fileData = await readJsonFile(filePath)
  const items = fileData?.items || fileData?.data || (Array.isArray(fileData) ? fileData : [])
  
  // Remove entry
  const filteredItems = items.filter((item: any) => item[idField] !== entryId)
  
  if (filteredItems.length === items.length) {
    throw new Error(`Entry not found: ${entryId}`)
  }
  
  // Save updated file
  const updatedData = {
    version: fileData?.version || '1.0.0',
    lastUpdated: new Date().toISOString(),
    items: filteredItems,
  }
  
  await writeJsonFile(filePath, updatedData, commitMessage)
}

/**
 * Example: Read forms.json
 */
async function getForms(): Promise<any[]> {
  const data = await readJsonFile('backend/data/forms.json')
  return data?.items || data?.data || (Array.isArray(data) ? data : [])
}

/**
 * Example: Add a submission
 */
async function addSubmission(submission: any): Promise<any> {
  return addJsonArrayEntry(
    'backend/data/submissions.json',
    submission,
    `Add submission: ${submission.submissionId}`
  )
}

/**
 * Example: Update a submission
 */
async function updateSubmission(
  submissionId: string,
  updates: any
): Promise<any> {
  return updateJsonArrayEntry(
    'backend/data/submissions.json',
    submissionId,
    'submissionId',
    (entry) => ({ ...entry, ...updates, updatedAt: new Date().toISOString() }),
    `Update submission: ${submissionId}`
  )
}

/**
 * Example: Delete a submission
 */
async function deleteSubmission(submissionId: string): Promise<void> {
  return removeJsonArrayEntry(
    'backend/data/submissions.json',
    submissionId,
    'submissionId',
    `Delete submission: ${submissionId}`
  )
}

export {
  readJsonFile,
  writeJsonFile,
  getFileSha,
  updateJsonArrayEntry,
  addJsonArrayEntry,
  removeJsonArrayEntry,
  getForms,
  addSubmission,
  updateSubmission,
  deleteSubmission,
}

