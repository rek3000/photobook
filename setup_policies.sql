-- Enable RLS
ALTER TABLE public.images ENABLE ROW LEVEL SECURITY;

-- Create policies for images table
CREATE POLICY "Users can insert their own images"
ON public.images FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own images"
ON public.images FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own images"
ON public.images FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own images"
ON public.images FOR DELETE
USING (auth.uid() = user_id);

-- Storage bucket policies
CREATE POLICY "Users can upload to their own folder"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own files"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view all files in images bucket"
ON storage.objects FOR SELECT
USING (bucket_id = 'images');
