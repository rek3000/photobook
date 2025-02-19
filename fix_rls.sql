-- First, check if RLS is enabled
ALTER TABLE public.images ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can insert their own images" ON public.images;
DROP POLICY IF EXISTS "Users can view their own images" ON public.images;
DROP POLICY IF EXISTS "Users can update their own images" ON public.images;
DROP POLICY IF EXISTS "Users can delete their own images" ON public.images;

-- Create new policies with proper checks
CREATE POLICY "Users can insert their own images"
ON public.images
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own images"
ON public.images
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own images"
ON public.images
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own images"
ON public.images
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Verify the current user has the correct role
SELECT rolname FROM pg_roles WHERE rolname = current_user;

-- Show all policies for the images table
SELECT * FROM pg_policies WHERE tablename = 'images';
