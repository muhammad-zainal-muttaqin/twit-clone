import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
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

    const tweetId = params.id

    // Check if already retweeted
    const { data: existingRetweet } = await supabase
      .from("retweets")
      .select("id")
      .eq("user_id", user.id)
      .eq("tweet_id", tweetId)
      .single()

    if (existingRetweet) {
      // Unretweet
      const { error } = await supabase.from("retweets").delete().eq("user_id", user.id).eq("tweet_id", tweetId)

      if (error) {
        return NextResponse.json({ error: "Failed to unretweet" }, { status: 500 })
      }

      return NextResponse.json({ retweeted: false })
    } else {
      // Retweet
      const { error } = await supabase.from("retweets").insert({
        user_id: user.id,
        tweet_id: tweetId,
      })

      if (error) {
        return NextResponse.json({ error: "Failed to retweet" }, { status: 500 })
      }

      return NextResponse.json({ retweeted: true })
    }
  } catch (error) {
    console.error("Error in POST /api/tweets/[id]/retweet:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
