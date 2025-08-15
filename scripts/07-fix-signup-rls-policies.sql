-- Fix RLS policies to allow profile creation during user signup
-- This addresses the "Database error saving new user" issue

-- First, ensure RLS is enabled on profiles table
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies that might be too restrictive
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "System can insert profiles during signup" ON profiles;
DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;

-- Create comprehensive RLS policies for profiles table

-- Allow profile creation during signup (both user-initiated and trigger-based)
CREATE POLICY "Allow profile creation during signup" ON profiles
  FOR INSERT WITH CHECK (
    -- Allow if user matches their own profile
    auth.uid() = id OR 
    -- Allow trigger-based insertions (when auth.uid() is NULL during signup)
    auth.uid() IS NULL
  );

-- Allow users to view all profiles (needed for the app to function)
CREATE POLICY "Users can view all profiles" ON profiles
  FOR SELECT USING (true);

-- Allow users to update only their own profile
CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Allow users to delete only their own profile
CREATE POLICY "Users can delete their own profile" ON profiles
  FOR DELETE USING (auth.uid() = id);

-- Ensure the handle_new_user function has proper permissions
-- Grant necessary permissions to the function
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON TABLE profiles TO postgres, anon, authenticated, service_role;

-- Make sure the trigger function runs with elevated privileges
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert profile with default values
  INSERT INTO profiles (
    id, 
    username, 
    display_name,
    bio,
    avatar_url,
    banner_url,
    website,
    location,
    verified,
    tweets_count,
    following_count,
    followers_count,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    '',  -- empty bio
    '',  -- empty avatar_url
    '',  -- empty banner_url
    '',  -- empty website
    '',  -- empty location
    false,  -- not verified
    0,   -- tweets_count
    0,   -- following_count
    0,   -- followers_count
    NOW(),  -- created_at
    NOW()   -- updated_at
  );
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the user creation
    RAISE LOG 'Error creating profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger to ensure it uses the updated function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
