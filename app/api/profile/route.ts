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

    const { data: allProfiles, error: checkError } = await supabase.from("profiles").select("*").eq("id", user.id)

    if (checkError) {
      console.error("[v0] Profile lookup error:", checkError)
      return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 })
    }

    console.log("[v0] Found", allProfiles?.length || 0, "profiles for user:", user.id)

    let profile = null

    if (allProfiles && allProfiles.length > 1) {
      console.log("[v0] Multiple profiles found, using the first one and cleaning up duplicates")
      profile = allProfiles[0]

      // Delete duplicate profiles (keep the first one)
      const duplicateIds = allProfiles.slice(1).map((p) => p.id)
      if (duplicateIds.length > 0) {
        await supabase.from("profiles").delete().in("id", duplicateIds)
        console.log("[v0] Cleaned up", duplicateIds.length, "duplicate profiles")
      }
    } else if (allProfiles && allProfiles.length === 1) {
      profile = allProfiles[0]
    }

    // If profile doesn't exist, create it
    if (!profile) {
      console.log("[v0] Profile doesn't exist, creating new profile for user:", user.id)

      const { data: newProfile, error: createError } = await supabase
        .from("profiles")
        .upsert(
          {
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
          },
          {
            onConflict: "id",
            ignoreDuplicates: false,
          },
        )
        .select()
        .single()

      if (createError) {
        console.error("[v0] Error creating profile:", createError)

        // Try to fetch the profile that might have been created by another concurrent request
        const { data: existingProfile, error: fetchError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single()

        if (fetchError || !existingProfile) {
          console.error("[v0] Failed to fetch existing profile after create error:", fetchError)
          return NextResponse.json({ error: "Failed to create profile" }, { status: 500 })
        }

        profile = existingProfile
        console.log("[v0] Using existing profile created by concurrent request")
      } else {
        profile = newProfile
      }
    }

    return NextResponse.json({ profile })
  } catch (error) {
    console.error("[v0] Error in GET /api/profile:", error)
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
