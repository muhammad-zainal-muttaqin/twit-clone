-- Fix the profiles RLS policy to allow trigger-based insertions
-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;

-- Create a new policy that allows both user insertions and trigger insertions
CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (
    auth.uid() = id OR 
    auth.uid() IS NULL  -- Allow insertions when no user context (triggers)
  );

-- Alternative: Create a more specific policy for system insertions
-- This allows insertions during signup triggers when auth context isn't available
CREATE POLICY "System can insert profiles during signup" ON profiles
  FOR INSERT WITH CHECK (
    -- Allow if user matches or if this is a system operation (no auth context)
    auth.uid() = id OR 
    (auth.uid() IS NULL AND current_setting('role', true) = 'authenticator')
  );
