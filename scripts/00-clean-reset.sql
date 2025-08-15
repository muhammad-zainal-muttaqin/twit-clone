-- Clean reset script to remove any conflicting database objects
-- This will allow us to start fresh with basic Supabase auth

-- Drop all custom tables (keep auth schema intact)
DROP TABLE IF EXISTS public.bookmarks CASCADE;
DROP TABLE IF EXISTS public.direct_messages CASCADE;
DROP TABLE IF EXISTS public.follows CASCADE;
DROP TABLE IF EXISTS public.likes CASCADE;
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.retweets CASCADE;
DROP TABLE IF EXISTS public.tweets CASCADE;

-- Drop any custom functions that might interfere with auth
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- Drop any custom triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- This will leave only the basic Supabase auth system
-- which should work with our simplified signup process
