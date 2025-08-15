import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  console.log("[v0] Feed API called")
  const supabase = await createClient()

  try {
    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      console.log("[v0] Feed API: User not authenticated", userError)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log("[v0] Feed API: User authenticated", user.id)

    const { searchParams } = new URL(request.url)
    const feedType = searchParams.get("type") || "following"
    const cursor = searchParams.get("cursor")
    const limit = Number.parseInt(searchParams.get("limit") || "20")

    console.log("[v0] Feed API: Query params", { feedType, cursor, limit })

    let query = supabase
      .from("tweets")
      .select(
        `
        *,
        profiles!tweets_user_id_fkey (
          id,
          username,
          display_name,
          avatar_url,
          verified
        )
      `,
      )
      .is("reply_to", null)
      .order("created_at", { ascending: false })
      .limit(limit)

    if (feedType === "following") {
      // Get users that the current user follows
      const { data: following } = await supabase.from("follows").select("following_id").eq("follower_id", user.id)

      const followingIds = following?.map((f) => f.following_id) || []
      followingIds.push(user.id)

      console.log("[v0] Feed API: Following IDs", followingIds)

      if (followingIds.length > 0) {
        query = query.in("user_id", followingIds)
      } else {
        query = query.eq("user_id", user.id)
      }
    }

    if (cursor) {
      query = query.lt("created_at", cursor)
    }

    console.log("[v0] Feed API: Executing query")
    const { data: tweets, error } = await query

    if (error) {
      console.error("[v0] Feed API: Query error", error)
      return NextResponse.json({ error: "Failed to fetch feed" }, { status: 500 })
    }

    console.log("[v0] Feed API: Query result", tweets?.length, "tweets")

    const tweetIds = tweets?.map((t) => t.id) || []

    let userLikes = []
    let userRetweets = []

    if (tweetIds.length > 0) {
      const { data: likes } = await supabase
        .from("likes")
        .select("tweet_id")
        .eq("user_id", user.id)
        .in("tweet_id", tweetIds)

      const { data: retweets } = await supabase
        .from("retweets")
        .select("tweet_id")
        .eq("user_id", user.id)
        .in("tweet_id", tweetIds)

      userLikes = likes || []
      userRetweets = retweets || []
    }

    const likedTweetIds = new Set(userLikes.map((l) => l.tweet_id))
    const retweetedTweetIds = new Set(userRetweets.map((r) => r.tweet_id))

    const processedTweets = tweets?.map((tweet) => ({
      ...tweet,
      like_count: tweet.likes_count || 0,
      retweet_count: tweet.retweets_count || 0,
      reply_count: tweet.replies_count || 0,
      user_liked: likedTweetIds.has(tweet.id),
      user_retweeted: retweetedTweetIds.has(tweet.id),
    }))

    const nextCursor = tweets && tweets.length === limit ? tweets[tweets.length - 1].created_at : null

    console.log("[v0] Feed API: Returning", processedTweets?.length, "processed tweets")

    return NextResponse.json({
      tweets: processedTweets || [],
      nextCursor,
      hasMore: tweets && tweets.length === limit,
    })
  } catch (error) {
    console.error("[v0] Feed API: Unexpected error", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
