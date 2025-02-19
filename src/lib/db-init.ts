import { createClient } from '@supabase/supabase-js'
import { initializeStorage } from './storage-init'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function initializeDatabase() {
  try {
    // Initialize storage first
    await initializeStorage()

    // Create a function to apply storage RLS policies
    const { error: functionError } = await supabase.rpc('create_rls_function', {
      function_definition: `
        CREATE OR REPLACE FUNCTION apply_storage_rls(bucket_name text, policy text)
        RETURNS void
        LANGUAGE plpgsql
        SECURITY DEFINER
        AS $$
        BEGIN
          EXECUTE policy;
        END;
        $$;
      `
    })

    if (functionError) {
      throw functionError
    }

    // Create images table
    const { error: tableError } = await supabase.query(`
      CREATE TABLE IF NOT EXISTS images (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
        name TEXT NOT NULL,
        storage_path TEXT NOT NULL,
        url TEXT,
        size INTEGER,
        type TEXT,
        user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
        UNIQUE(storage_path, user_id)
      );
    `)

    if (tableError) {
      console.error('Error creating images table:', tableError)
      throw tableError
    }

    // Enable Row Level Security
    const { error: rlsError } = await supabase.query(`
      ALTER TABLE images ENABLE ROW LEVEL SECURITY;
    `)

    if (rlsError) {
      console.error('Error enabling RLS:', rlsError)
      throw rlsError
    }

    // Create RLS policies
    const { error: policyError } = await supabase.query(`
      -- Policy for viewing own images
      CREATE POLICY "Users can view own images"
      ON images FOR SELECT
      USING (auth.uid() = user_id);

      -- Policy for inserting own images
      CREATE POLICY "Users can insert own images"
      ON images FOR INSERT
      WITH CHECK (auth.uid() = user_id);

      -- Policy for updating own images
      CREATE POLICY "Users can update own images"
      ON images FOR UPDATE
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);

      -- Policy for deleting own images
      CREATE POLICY "Users can delete own images"
      ON images FOR DELETE
      USING (auth.uid() = user_id);
    `)

    if (policyError) {
      console.error('Error creating RLS policies:', policyError)
      throw policyError
    }

    console.log('Database initialization completed successfully')
  } catch (error) {
    console.error('Error initializing database:', error)
    throw error
  }
}
