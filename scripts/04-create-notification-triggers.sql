-- Function to create notifications for likes
CREATE OR REPLACE FUNCTION create_like_notification()
RETURNS TRIGGER AS $$
BEGIN
  -- Don't create notification if user likes their own tweet
  IF NEW.user_id != (SELECT user_id FROM tweets WHERE id = NEW.tweet_id) THEN
    INSERT INTO notifications (user_id, type, from_user_id, tweet_id)
    VALUES (
      (SELECT user_id FROM tweets WHERE id = NEW.tweet_id),
      'like',
      NEW.user_id,
      NEW.tweet_id
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create notifications for retweets
CREATE OR REPLACE FUNCTION create_retweet_notification()
RETURNS TRIGGER AS $$
BEGIN
  -- Don't create notification if user retweets their own tweet
  IF NEW.user_id != (SELECT user_id FROM tweets WHERE id = NEW.tweet_id) THEN
    INSERT INTO notifications (user_id, type, from_user_id, tweet_id)
    VALUES (
      (SELECT user_id FROM tweets WHERE id = NEW.tweet_id),
      'retweet',
      NEW.user_id,
      NEW.tweet_id
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create notifications for follows
CREATE OR REPLACE FUNCTION create_follow_notification()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notifications (user_id, type, from_user_id)
  VALUES (NEW.following_id, 'follow', NEW.follower_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create notifications for replies
CREATE OR REPLACE FUNCTION create_reply_notification()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create notification for replies (not original tweets)
  IF NEW.reply_to_id IS NOT NULL THEN
    -- Don't create notification if user replies to their own tweet
    IF NEW.user_id != (SELECT user_id FROM tweets WHERE id = NEW.reply_to_id) THEN
      INSERT INTO notifications (user_id, type, from_user_id, tweet_id)
      VALUES (
        (SELECT user_id FROM tweets WHERE id = NEW.reply_to_id),
        'reply',
        NEW.user_id,
        NEW.id
      );
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers
DROP TRIGGER IF EXISTS like_notification_trigger ON likes;
CREATE TRIGGER like_notification_trigger
  AFTER INSERT ON likes
  FOR EACH ROW EXECUTE FUNCTION create_like_notification();

DROP TRIGGER IF EXISTS retweet_notification_trigger ON retweets;
CREATE TRIGGER retweet_notification_trigger
  AFTER INSERT ON retweets
  FOR EACH ROW EXECUTE FUNCTION create_retweet_notification();

DROP TRIGGER IF EXISTS follow_notification_trigger ON follows;
CREATE TRIGGER follow_notification_trigger
  AFTER INSERT ON follows
  FOR EACH ROW EXECUTE FUNCTION create_follow_notification();

DROP TRIGGER IF EXISTS reply_notification_trigger ON tweets;
CREATE TRIGGER reply_notification_trigger
  AFTER INSERT ON tweets
  FOR EACH ROW EXECUTE FUNCTION create_reply_notification();
