import { createClient } from '@supabase/supabase-js'

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_URL')
if (!process.env.SUPABASE_SERVICE_ROLE_KEY) throw new Error('Missing env.SUPABASE_SERVICE_ROLE_KEY')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function initializeStorage() {
  try {
    // Create a new bucket if it doesn't exist
    const { error: bucketError } = await supabase
      .storage
      .createBucket('images', {
        public: false,
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
        fileSizeLimit: 5242880 // 5MB in bytes
      })

    if (bucketError) {
      // Ignore if bucket already exists
      if (bucketError.message !== 'Bucket already exists') {
        console.error('Error creating bucket:', bucketError)
        throw bucketError
      }
    }

    // Update bucket settings
    const { error: updateError } = await supabase
      .storage
      .updateBucket('images', {
        public: false,
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
        fileSizeLimit: 5242880 // 5MB in bytes
      })

    if (updateError) {
      console.error('Error updating bucket:', updateError)
      throw updateError
    }

    console.log('Storage initialization completed successfully')
  } catch (error) {
    console.error('Error initializing storage:', error)
    throw error
  }
}
