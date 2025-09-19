
-- Create a bucket for admin-uploaded images
INSERT INTO storage.buckets (id, name, public)
VALUES ('admin-images', 'admin-images', true)
ON CONFLICT (id) DO NOTHING;

-- Set public policies for the 'admin-images' bucket to allow public access
CREATE POLICY "Admin images are publicly accessible."
  ON storage.objects FOR SELECT
  USING ( bucket_id = 'admin-images' );

CREATE POLICY "Anyone can upload to admin-images."
  ON storage.objects FOR INSERT
  WITH CHECK ( bucket_id = 'admin-images' );

CREATE POLICY "Anyone can update their own admin-images."
  ON storage.objects FOR UPDATE
  USING ( auth.uid() = owner )
  WITH CHECK ( bucket_id = 'admin-images' );

CREATE POLICY "Anyone can delete their own admin-images."
  ON storage.objects FOR DELETE
  USING ( auth.uid() = owner );
