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

    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q")
    const type = searchParams.get("type") || "all" // 'all', 'tweets', 'users'

    if (!query || query.trim().length === 0) {
      return NextResponse.json({ tweets: [], users: [] })
    }

    const searchTerm = query.trim()
    let tweets = []
    let users = []

    // Search tweets
    if (type === "all" || type === "tweets") {
      const { data: tweetResults } = await supabase
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
        .ilike("content", `%${searchTerm}%`)
        .is("reply_to", null)
        .order("created_at", { ascending: false })
        .limit(20)

      const processedTweets = tweetResults?.map((tweet) => ({
        ...tweet,
        like_count: tweet.likes_count,
        retweet_count: tweet.retweets_count,
        reply_count: tweet.replies_count,
        user_liked: false,
        user_retweeted: false,
      }))

      tweets = processedTweets || []
    }

    // Search users
    if (type === "all" || type === "users") {
      const { data: userResults } = await supabase
        .from("profiles")
        .select("*")
        .or(`username.ilike.%${searchTerm}%,display_name.ilike.%${searchTerm}%`)
        .limit(20)

      users = userResults || []
    }

    return NextResponse.json({ tweets, users })
  } catch (error) {
    console.error("Error in GET /api/search:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
