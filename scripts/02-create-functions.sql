-- Function to handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, username, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user registration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to update follower/following counts
CREATE OR REPLACE FUNCTION update_follow_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Increment following count for follower
    UPDATE profiles SET following_count = following_count + 1 WHERE id = NEW.follower_id;
    -- Increment follower count for following
    UPDATE profiles SET follower_count = follower_count + 1 WHERE id = NEW.following_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    -- Decrement following count for follower
    UPDATE profiles SET following_count = following_count - 1 WHERE id = OLD.follower_id;
    -- Decrement follower count for following
    UPDATE profiles SET follower_count = follower_count - 1 WHERE id = OLD.following_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for follow counts
DROP TRIGGER IF EXISTS follow_counts_trigger ON follows;
CREATE TRIGGER follow_counts_trigger
  AFTER INSERT OR DELETE ON follows
  FOR EACH ROW EXECUTE FUNCTION update_follow_counts();

-- Function to update tweet counts
CREATE OR REPLACE FUNCTION update_tweet_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Increment tweet count for user
    UPDATE profiles SET tweet_count = tweet_count + 1 WHERE id = NEW.user_id;
    -- If it's a reply, increment reply count on original tweet
    IF NEW.reply_to_id IS NOT NULL THEN
      UPDATE tweets SET reply_count = reply_count + 1 WHERE id = NEW.reply_to_id;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    -- Decrement tweet count for user
    UPDATE profiles SET tweet_count = tweet_count - 1 WHERE id = OLD.user_id;
    -- If it's a reply, decrement reply count on original tweet
    IF OLD.reply_to_id IS NOT NULL THEN
      UPDATE tweets SET reply_count = reply_count - 1 WHERE id = OLD.reply_to_id;
    END IF;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for tweet counts
DROP TRIGGER IF EXISTS tweet_counts_trigger ON tweets;
CREATE TRIGGER tweet_counts_trigger
  AFTER INSERT OR DELETE ON tweets
  FOR EACH ROW EXECUTE FUNCTION update_tweet_counts();

-- Function to update like counts
CREATE OR REPLACE FUNCTION update_like_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE tweets SET like_count = like_count + 1 WHERE id = NEW.tweet_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE tweets SET like_count = like_count - 1 WHERE id = OLD.tweet_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for like counts
DROP TRIGGER IF EXISTS like_counts_trigger ON likes;
CREATE TRIGGER like_counts_trigger
  AFTER INSERT OR DELETE ON likes
  FOR EACH ROW EXECUTE FUNCTION update_like_counts();

-- Function to update retweet counts
CREATE OR REPLACE FUNCTION update_retweet_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE tweets SET retweet_count = retweet_count + 1 WHERE id = NEW.tweet_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE tweets SET retweet_count = retweet_count - 1 WHERE id = OLD.tweet_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for retweet counts
DROP TRIGGER IF EXISTS retweet_counts_trigger ON retweets;
CREATE TRIGGER retweet_counts_trigger
  AFTER INSERT OR DELETE ON retweets
  FOR EACH ROW EXECUTE FUNCTION update_retweet_counts();
