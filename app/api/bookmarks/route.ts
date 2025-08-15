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

    // Get bookmarked tweets with user profiles
    const { data: bookmarks, error } = await supabase
      .from("bookmarks")
      .select(`
        created_at,
        tweets!inner (
          id,
          content,
          created_at,
          likes_count,
          retweets_count,
          replies_count,
          profiles!tweets_user_id_fkey (
            id,
            username,
            display_name,
            avatar_url,
            verified
          )
        )
      `)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching bookmarks:", error)
      return NextResponse.json({ error: "Failed to fetch bookmarks" }, { status: 500 })
    }

    // Transform the data to match expected format
    const tweets =
      bookmarks?.map((bookmark: any) => ({
        id: bookmark.tweets.id,
        content: bookmark.tweets.content,
        created_at: bookmark.tweets.created_at,
        like_count: bookmark.tweets.likes_count,
        retweet_count: bookmark.tweets.retweets_count,
        reply_count: bookmark.tweets.replies_count,
        profiles: bookmark.tweets.profiles,
      })) || []

    return NextResponse.json({ tweets })
  } catch (error) {
    console.error("Error in GET /api/bookmarks:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
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

    const { tweetId } = await request.json()

    if (!tweetId) {
      return NextResponse.json({ error: "Tweet ID is required" }, { status: 400 })
    }

    // Add bookmark
    const { error } = await supabase.from("bookmarks").insert({
      user_id: user.id,
      tweet_id: tweetId,
    })

    if (error) {
      if (error.code === "23505") {
        // Unique constraint violation
        return NextResponse.json({ error: "Tweet already bookmarked" }, { status: 409 })
      }
      console.error("Error creating bookmark:", error)
      return NextResponse.json({ error: "Failed to bookmark tweet" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in POST /api/bookmarks:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
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
    const tweetId = searchParams.get("tweetId")

    if (!tweetId) {
      return NextResponse.json({ error: "Tweet ID is required" }, { status: 400 })
    }

    // Remove bookmark
    const { error } = await supabase.from("bookmarks").delete().eq("user_id", user.id).eq("tweet_id", tweetId)

    if (error) {
      console.error("Error removing bookmark:", error)
      return NextResponse.json({ error: "Failed to remove bookmark" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in DELETE /api/bookmarks:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
