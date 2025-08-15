-- Function to automatically create profile when user signs up
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

-- Trigger to create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to update tweet counts
CREATE OR REPLACE FUNCTION update_tweet_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Increment tweets count
    UPDATE profiles SET tweets_count = tweets_count + 1 WHERE id = NEW.user_id;
    
    -- If it's a reply, increment replies count on original tweet
    IF NEW.reply_to IS NOT NULL THEN
      UPDATE tweets SET replies_count = replies_count + 1 WHERE id = NEW.reply_to;
    END IF;
    
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    -- Decrement tweets count
    UPDATE profiles SET tweets_count = tweets_count - 1 WHERE id = OLD.user_id;
    
    -- If it was a reply, decrement replies count on original tweet
    IF OLD.reply_to IS NOT NULL THEN
      UPDATE tweets SET replies_count = replies_count - 1 WHERE id = OLD.reply_to;
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
    UPDATE tweets SET likes_count = likes_count + 1 WHERE id = NEW.tweet_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE tweets SET likes_count = likes_count - 1 WHERE id = OLD.tweet_id;
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
    UPDATE tweets SET retweets_count = retweets_count + 1 WHERE id = NEW.tweet_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE tweets SET retweets_count = retweets_count - 1 WHERE id = OLD.tweet_id;
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

-- Function to update follow counts
CREATE OR REPLACE FUNCTION update_follow_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE profiles SET following_count = following_count + 1 WHERE id = NEW.follower_id;
    UPDATE profiles SET followers_count = followers_count + 1 WHERE id = NEW.following_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE profiles SET following_count = following_count - 1 WHERE id = OLD.follower_id;
    UPDATE profiles SET followers_count = followers_count - 1 WHERE id = OLD.following_id;
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

-- Function to create notifications
CREATE OR REPLACE FUNCTION create_notification()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Create notification for likes
    IF TG_TABLE_NAME = 'likes' THEN
      INSERT INTO notifications (user_id, type, from_user_id, tweet_id)
      SELECT t.user_id, 'like', NEW.user_id, NEW.tweet_id
      FROM tweets t
      WHERE t.id = NEW.tweet_id AND t.user_id != NEW.user_id;
    
    -- Create notification for retweets
    ELSIF TG_TABLE_NAME = 'retweets' THEN
      INSERT INTO notifications (user_id, type, from_user_id, tweet_id)
      SELECT t.user_id, 'retweet', NEW.user_id, NEW.tweet_id
      FROM tweets t
      WHERE t.id = NEW.tweet_id AND t.user_id != NEW.user_id;
    
    -- Create notification for follows
    ELSIF TG_TABLE_NAME = 'follows' THEN
      INSERT INTO notifications (user_id, type, from_user_id)
      VALUES (NEW.following_id, 'follow', NEW.follower_id);
    
    -- Create notification for replies
    ELSIF TG_TABLE_NAME = 'tweets' AND NEW.reply_to IS NOT NULL THEN
      INSERT INTO notifications (user_id, type, from_user_id, tweet_id)
      SELECT t.user_id, 'reply', NEW.user_id, NEW.id
      FROM tweets t
      WHERE t.id = NEW.reply_to AND t.user_id != NEW.user_id;
    END IF;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers for notifications
DROP TRIGGER IF EXISTS notification_likes_trigger ON likes;
CREATE TRIGGER notification_likes_trigger
  AFTER INSERT ON likes
  FOR EACH ROW EXECUTE FUNCTION create_notification();

DROP TRIGGER IF EXISTS notification_retweets_trigger ON retweets;
CREATE TRIGGER notification_retweets_trigger
  AFTER INSERT ON retweets
  FOR EACH ROW EXECUTE FUNCTION create_notification();

DROP TRIGGER IF EXISTS notification_follows_trigger ON follows;
CREATE TRIGGER notification_follows_trigger
  AFTER INSERT ON follows
  FOR EACH ROW EXECUTE FUNCTION create_notification();

DROP TRIGGER IF EXISTS notification_replies_trigger ON tweets;
CREATE TRIGGER notification_replies_trigger
  AFTER INSERT ON tweets
  FOR EACH ROW EXECUTE FUNCTION create_notification();
