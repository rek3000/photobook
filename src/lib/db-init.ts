import { createClient } from '@supabase/supabase-js'

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_URL')
if (!process.env.SUPABASE_SERVICE_ROLE_KEY) throw new Error('Missing env.SUPABASE_SERVICE_ROLE_KEY')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function initializeDatabase() {
  try {
    // Create RLS policies for storage
    const { error: policyError } = await supabase.rpc('create_storage_policies')

    if (policyError) {
      console.error('Error creating storage policies:', policyError)
      throw policyError
    }

    console.log('Database initialization completed successfully')
  } catch (error) {
    console.error('Error initializing database:', error)
    throw error
  }
}

export default initializeDatabase
