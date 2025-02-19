import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function initializeStorage() {
  try {
    // Create a new bucket if it doesn't exist
    const { data: bucket, error: bucketError } = await supabase
      .storage
      .createBucket('images', {
        public: true,
        fileSizeLimit: 5242880, // 5MB
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
      })

    if (bucketError && bucketError.message !== 'Bucket already exists') {
      throw bucketError
    }

    // Set up bucket policies
    const { error: policyError } = await supabase.storage.from('images').createPolicy(
      'give users access to own folder',
      {
        name: 'User Folder Access',
        definition: {
          object_eq: { 'owner_id': '{{auth.id}}' }
        }
      }
    )

    if (policyError) {
      throw policyError
    }

    // Set up RLS policies for the storage bucket
    const { error: rlsError } = await supabase.rpc('apply_storage_rls', {
      bucket_name: 'images',
      policy: `
        CREATE POLICY "Users can upload to their own folder" ON storage.objects
          FOR INSERT TO authenticated
          WITH CHECK (
            bucket_id = 'images' AND
            (storage.foldername(name))[1] = auth.uid()
          );

        CREATE POLICY "Users can update their own folder" ON storage.objects
          FOR UPDATE TO authenticated
          USING (
            bucket_id = 'images' AND
            (storage.foldername(name))[1] = auth.uid()
          );

        CREATE POLICY "Users can delete from their own folder" ON storage.objects
          FOR DELETE TO authenticated
          USING (
            bucket_id = 'images' AND
            (storage.foldername(name))[1] = auth.uid()
          );

        CREATE POLICY "Anyone can view public images" ON storage.objects
          FOR SELECT
          USING (bucket_id = 'images');
      `
    })

    if (rlsError) {
      throw rlsError
    }

    console.log('Storage initialization completed successfully')
  } catch (error) {
    console.error('Error initializing storage:', error)
    throw error
  }
}
