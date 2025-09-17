-- Create Items-images bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('Items-images', 'Items-images', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Admins can upload to Items-images" ON storage.objects;
DROP POLICY IF EXISTS "Items images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update Items images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete Items images" ON storage.objects;

-- Storage policies for Items-images bucket
CREATE POLICY "Admins can upload to Items-images" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'Items-images' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Items images are publicly accessible" ON storage.objects
    FOR SELECT USING (bucket_id = 'Items-images');

CREATE POLICY "Admins can update Items images" ON storage.objects
    FOR UPDATE USING (bucket_id = 'Items-images' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete Items images" ON storage.objects
    FOR DELETE USING (bucket_id = 'Items-images' AND public.has_role(auth.uid(), 'admin'));
