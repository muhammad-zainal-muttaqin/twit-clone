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
    const cursor = searchParams.get("cursor")
    const limit = Number.parseInt(searchParams.get("limit") || "20")

    let query = supabase
      .from("notifications")
      .select(
        `
        *,
        from_user:from_user_id (
          id,
          username,
          display_name,
          avatar_url,
          verified
        ),
        tweet:tweet_id (
          id,
          content
        )
      `,
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(limit)

    if (cursor) {
      query = query.lt("created_at", cursor)
    }

    const { data: notifications, error } = await query

    if (error) {
      console.error("Error fetching notifications:", error)
      return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 })
    }

    // Get next cursor
    const nextCursor =
      notifications && notifications.length === limit ? notifications[notifications.length - 1].created_at : null

    return NextResponse.json({
      notifications: notifications || [],
      nextCursor,
      hasMore: notifications && notifications.length === limit,
    })
  } catch (error) {
    console.error("Error in GET /api/notifications:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
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

    const { action } = await request.json()

    if (action === "mark_all_read") {
      // Mark all notifications as read
      const { error } = await supabase
        .from("notifications")
        .update({ read: true })
        .eq("user_id", user.id)
        .eq("read", false)

      if (error) {
        console.error("Error marking notifications as read:", error)
        return NextResponse.json({ error: "Failed to mark notifications as read" }, { status: 500 })
      }

      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (error) {
    console.error("Error in PUT /api/notifications:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
