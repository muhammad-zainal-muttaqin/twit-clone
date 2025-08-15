import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { username: string } }) {
  const supabase = await createClient()

  try {
    const username = params.username

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("username", username)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Get current user to check if following
    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser()

    let isFollowing = false
    if (currentUser) {
      const { data: followData } = await supabase
        .from("follows")
        .select("id")
        .eq("follower_id", currentUser.id)
        .eq("following_id", profile.id)
        .single()

      isFollowing = !!followData
    }

    // Get user's tweets
    const { data: tweets, error: tweetsError } = await supabase
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
      .eq("user_id", profile.id)
      .is("reply_to", null)
      .order("created_at", { ascending: false })
      .limit(20)

    if (tweetsError) {
      console.error("Error fetching user tweets:", tweetsError)
    }

    const processedTweets = tweets?.map((tweet) => ({
      ...tweet,
      like_count: tweet.likes_count,
      retweet_count: tweet.retweets_count,
      reply_count: tweet.replies_count,
      user_liked: false, // TODO: Add user interaction check
      user_retweeted: false, // TODO: Add user interaction check
    }))

    return NextResponse.json({
      profile: {
        ...profile,
        isFollowing,
        isCurrentUser: currentUser?.id === profile.id,
      },
      tweets: processedTweets || [],
    })
  } catch (error) {
    console.error("Error in GET /api/users/[username]:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
