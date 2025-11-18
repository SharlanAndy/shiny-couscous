/**
 * Supabase Client Setup
 * 
 * Creates and exports a Supabase client instance for local development.
 * Follows Supabase React quickstart guide: https://supabase.com/docs/guides/getting-started/quickstarts/reactjs
 */

import { createClient } from '@supabase/supabase-js'

// Get Supabase configuration from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Only create Supabase client if both URL and key are provided
// This allows the app to work even if Supabase is not configured (e.g., only using backend API)
let supabase: ReturnType<typeof createClient> | null = null

if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey)
} else {
  // Log warning in development, but don't throw error
  if (import.meta.env.DEV) {
    console.warn('⚠️  Supabase not configured: VITE_SUPABASE_URL and/or VITE_SUPABASE_ANON_KEY missing')
    console.warn('   The app will work, but Supabase features will be disabled')
  }
}

// Export Supabase client (may be null if not configured)
export { supabase }

// Test connection helper
export async function testSupabaseConnection(): Promise<{ success: boolean; message: string; data?: any }> {
  if (!supabase) {
    return {
      success: false,
      message: '❌ Supabase not configured (missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY)',
    }
  }
  
  try {
    // Test connection by querying a simple endpoint
    const { data, error } = await supabase.from('forms').select('count').limit(1)
    
    if (error) {
      // If table doesn't exist, connection still works
      if (error.code === 'PGRST116') {
        return {
          success: true,
          message: '✅ Supabase connection successful! (Table "forms" does not exist yet)',
        }
      }
      
      return {
        success: false,
        message: `❌ Supabase connection error: ${error.message}`,
        data: error,
      }
    }
    
    return {
      success: true,
      message: '✅ Supabase connection successful!',
      data,
    }
  } catch (err: any) {
    return {
      success: false,
      message: `❌ Supabase connection failed: ${err.message}`,
      data: err,
    }
  }
}

