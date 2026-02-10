-- Backfill profiles for any existing auth users who don't have one
INSERT INTO public.profiles (id, name)
SELECT 
  id,
  COALESCE(raw_user_meta_data->>'name', 'PLAYER')
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles)
ON CONFLICT (id) DO NOTHING;
