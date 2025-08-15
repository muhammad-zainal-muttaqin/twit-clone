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

    // Check if already liked
    const { data: existingLike } = await supabase
      .from("likes")
      .select("id")
      .eq("user_id", user.id)
      .eq("tweet_id", tweetId)
      .single()

    if (existingLike) {
      // Unlike
      const { error } = await supabase.from("likes").delete().eq("user_id", user.id).eq("tweet_id", tweetId)

      if (error) {
        return NextResponse.json({ error: "Failed to unlike tweet" }, { status: 500 })
      }

      return NextResponse.json({ liked: false })
    } else {
      // Like
      const { error } = await supabase.from("likes").insert({
        user_id: user.id,
        tweet_id: tweetId,
      })

      if (error) {
        return NextResponse.json({ error: "Failed to like tweet" }, { status: 500 })
      }

      return NextResponse.json({ liked: true })
    }
  } catch (error) {
    console.error("Error in POST /api/tweets/[id]/like:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
