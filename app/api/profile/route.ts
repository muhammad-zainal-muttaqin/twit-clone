import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

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

    let { data: profile, error: profileError } = await supabase.from("profiles").select("*").eq("id", user.id).single()

    // If profile doesn't exist, create it
    if (profileError && profileError.code === "PGRST116") {
      console.log("[v0] Profile doesn't exist, creating new profile for user:", user.id)

      const { data: newProfile, error: createError } = await supabase
        .from("profiles")
        .insert({
          id: user.id,
          username: user.email?.split("@")[0] || `user_${user.id.slice(0, 8)}`,
          display_name: user.user_metadata?.full_name || user.email?.split("@")[0] || "User",
          bio: null,
          avatar_url: user.user_metadata?.avatar_url || null,
          banner_url: null,
          website: null,
          location: null,
          verified: false,
          tweets_count: 0,
          following_count: 0,
          followers_count: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (createError) {
        console.error("Error creating profile:", createError)
        return NextResponse.json({ error: "Failed to create profile" }, { status: 500 })
      }

      profile = newProfile
    } else if (profileError) {
      console.error("Error fetching profile:", profileError)
      return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 })
    }

    return NextResponse.json({ profile })
  } catch (error) {
    console.error("Error in GET /api/profile:", error)
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

    const { display_name, bio, location, website } = await request.json()

    // Update profile
    const { data: profile, error } = await supabase
      .from("profiles")
      .update({
        display_name,
        bio,
        location,
        website,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id)
      .select()
      .single()

    if (error) {
      console.error("Error updating profile:", error)
      return NextResponse.json({ error: "Failed to update profile" }, { status: 500 })
    }

    return NextResponse.json({ profile })
  } catch (error) {
    console.error("Error in PUT /api/profile:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
