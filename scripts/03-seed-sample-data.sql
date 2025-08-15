-- Insert sample profiles (these will be created automatically when users sign up)
-- This script is for demonstration purposes

-- Sample tweets (you can run this after creating some user accounts)
-- Note: Replace the user_id values with actual user IDs from your auth.users table

-- First, let's create a function to get a sample user ID
DO $$
DECLARE
    sample_user_id UUID;
BEGIN
    -- Get the first user from auth.users (you may need to adjust this)
    SELECT id INTO sample_user_id FROM auth.users LIMIT 1;
    
    -- Only insert sample tweets if we have a user
    IF sample_user_id IS NOT NULL THEN
        -- Insert sample tweets
        INSERT INTO tweets (user_id, content, created_at) VALUES
        (sample_user_id, 'Just shipped a new feature using Next.js 15! The app router is incredible for building modern web applications. 🚀', NOW() - INTERVAL '2 hours'),
        (sample_user_id, 'Working on a new design system with Tailwind CSS. The utility-first approach makes prototyping so much faster!', NOW() - INTERVAL '4 hours'),
        (sample_user_id, 'Breaking: New JavaScript framework announced at the conference today. Promises to revolutionize how we build web apps.', NOW() - INTERVAL '6 hours'),
        (sample_user_id, 'The future of web development is looking bright with all these amazing tools and frameworks being released!', NOW() - INTERVAL '8 hours'),
        (sample_user_id, 'Just discovered this amazing new CSS feature that makes responsive design so much easier. Web development keeps getting better!', NOW() - INTERVAL '12 hours');
        
        RAISE NOTICE 'Sample tweets inserted successfully!';
    ELSE
        RAISE NOTICE 'No users found. Please create a user account first, then run this script.';
    END IF;
END $$;
