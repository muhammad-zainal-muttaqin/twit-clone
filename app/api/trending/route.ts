import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
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

    // Get trending topics based on tweet content from the last 24 hours
    const { data: recentTweets } = await supabase
      .from("tweets")
      .select("content")
      .gte("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .limit(1000)

    // Extract hashtags and mentions from tweets
    const hashtags: { [key: string]: number } = {}
    const mentions: { [key: string]: number } = {}

    recentTweets?.forEach((tweet) => {
      const content = tweet.content.toLowerCase()

      // Extract hashtags
      const hashtagMatches = content.match(/#\w+/g)
      hashtagMatches?.forEach((hashtag) => {
        hashtags[hashtag] = (hashtags[hashtag] || 0) + 1
      })

      // Extract mentions
      const mentionMatches = content.match(/@\w+/g)
      mentionMatches?.forEach((mention) => {
        mentions[mention] = (mentions[mention] || 0) + 1
      })
    })

    // Get top trending hashtags
    const trendingHashtags = Object.entries(hashtags)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([hashtag, count]) => ({
        topic: hashtag,
        posts: `${count}`,
        category: "Trending",
      }))

    // Add some static trending topics for demonstration
    const staticTrends = [
      { topic: "Next.js", posts: "125K", category: "Technology" },
      { topic: "React", posts: "89K", category: "Technology" },
      { topic: "TypeScript", posts: "67K", category: "Technology" },
      { topic: "Supabase", posts: "45K", category: "Technology" },
      { topic: "Tailwind CSS", posts: "34K", category: "Technology" },
    ]

    // Combine and limit results
    const allTrends = [...trendingHashtags, ...staticTrends].slice(0, 10)

    return NextResponse.json({ trends: allTrends })
  } catch (error) {
    console.error("Error in GET /api/trending:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
