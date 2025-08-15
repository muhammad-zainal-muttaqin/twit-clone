import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const supabase = await createClient()

  try {
    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: tweets, error } = await supabase
      .from("tweets")
      .select(
        `
        *,
        profiles:user_id (
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
      .limit(20)

    if (error) {
      console.error("Error fetching tweets:", error)
      return NextResponse.json({ error: "Failed to fetch tweets" }, { status: 500 })
    }

    const tweetIds = tweets?.map((t) => t.id) || []

    const { data: userLikes } = await supabase
      .from("likes")
      .select("tweet_id")
      .eq("user_id", user.id)
      .in("tweet_id", tweetIds)

    const { data: userRetweets } = await supabase
      .from("retweets")
      .select("tweet_id")
      .eq("user_id", user.id)
      .in("tweet_id", tweetIds)

    const likedTweetIds = new Set(userLikes?.map((l) => l.tweet_id) || [])
    const retweetedTweetIds = new Set(userRetweets?.map((r) => r.tweet_id) || [])

    const processedTweets = tweets?.map((tweet) => ({
      ...tweet,
      like_count: tweet.likes_count,
      retweet_count: tweet.retweets_count,
      reply_count: tweet.replies_count,
      user_liked: likedTweetIds.has(tweet.id),
      user_retweeted: retweetedTweetIds.has(tweet.id),
    }))

    return NextResponse.json({ tweets: processedTweets })
  } catch (error) {
    console.error("Error in GET /api/tweets:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()

  try {
    console.log("[v0] Tweet POST request received")

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      console.log("[v0] Tweet POST: User not authenticated", userError)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log("[v0] Tweet POST: User authenticated", user.id)

    const { content, reply_to, media_urls } = await request.json()
    console.log("[v0] Tweet POST: Content received", { content, reply_to, media_urls })

    // Validate content
    if (!content || content.trim().length === 0) {
      console.log("[v0] Tweet POST: Empty content")
      return NextResponse.json({ error: "Tweet content is required" }, { status: 400 })
    }

    if (content.length > 280) {
      console.log("[v0] Tweet POST: Content too long")
      return NextResponse.json({ error: "Tweet content must be 280 characters or less" }, { status: 400 })
    }

    console.log("[v0] Tweet POST: Inserting tweet into database")
    const { data: tweet, error } = await supabase
      .from("tweets")
      .insert({
        user_id: user.id,
        content: content.trim(),
        reply_to: reply_to || null,
        media_urls: media_urls || [],
      })
      .select(
        `
        *,
        profiles:user_id (
          id,
          username,
          display_name,
          avatar_url,
          verified
        )
      `,
      )
      .single()

    if (error) {
      console.error("[v0] Tweet POST: Database error", error)
      return NextResponse.json({ error: "Failed to create tweet" }, { status: 500 })
    }

    console.log("[v0] Tweet POST: Tweet created successfully", tweet.id)

    const processedTweet = {
      ...tweet,
      like_count: tweet.likes_count,
      retweet_count: tweet.retweets_count,
      reply_count: tweet.replies_count,
      user_liked: false,
      user_retweeted: false,
    }

    return NextResponse.json({ tweet: processedTweet }, { status: 201 })
  } catch (error) {
    console.error("[v0] Tweet POST: Unexpected error", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
