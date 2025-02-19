-- Create the images table with proper schema
CREATE TABLE IF NOT EXISTS public.images (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    name TEXT NOT NULL,
    url TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    size BIGINT NOT NULL,
    type TEXT NOT NULL
);
