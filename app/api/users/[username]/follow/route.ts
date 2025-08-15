import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest, { params }: { params: { username: string } }) {
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

    const username = params.username

    // Get target user profile
    const { data: targetProfile, error: profileError } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", username)
      .single()

    if (profileError || !targetProfile) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Can't follow yourself
    if (targetProfile.id === user.id) {
      return NextResponse.json({ error: "Cannot follow yourself" }, { status: 400 })
    }

    // Check if already following
    const { data: existingFollow } = await supabase
      .from("follows")
      .select("id")
      .eq("follower_id", user.id)
      .eq("following_id", targetProfile.id)
      .single()

    if (existingFollow) {
      // Unfollow
      const { error } = await supabase
        .from("follows")
        .delete()
        .eq("follower_id", user.id)
        .eq("following_id", targetProfile.id)

      if (error) {
        return NextResponse.json({ error: "Failed to unfollow user" }, { status: 500 })
      }

      return NextResponse.json({ following: false })
    } else {
      // Follow
      const { error } = await supabase.from("follows").insert({
        follower_id: user.id,
        following_id: targetProfile.id,
      })

      if (error) {
        return NextResponse.json({ error: "Failed to follow user" }, { status: 500 })
      }

      return NextResponse.json({ following: true })
    }
  } catch (error) {
    console.error("Error in POST /api/users/[username]/follow:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
