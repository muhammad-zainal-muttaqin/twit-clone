import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function DELETE(request: NextRequest) {
  try {
    const cookieStore = cookies()

    // Create Supabase client
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            cookieStore.set({ name, value, ...options })
          },
          remove(name: string, options: any) {
            cookieStore.set({ name, value: "", ...options })
          },
        },
      },
    )

    // Get the current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log("[v0] Starting account deletion for user:", user.id)

    // Delete user data in the correct order (respecting foreign key constraints)

    // 1. Delete messages
    await supabase.from("messages").delete().eq("sender_id", user.id)

    // 2. Delete conversations where user is participant
    await supabase.from("conversations").delete().or(`participant1_id.eq.${user.id},participant2_id.eq.${user.id}`)

    // 3. Delete bookmarks
    await supabase.from("bookmarks").delete().eq("user_id", user.id)

    // 4. Delete notifications (sent and received)
    await supabase.from("notifications").delete().or(`user_id.eq.${user.id},from_user_id.eq.${user.id}`)

    // 5. Delete follows (following and followers)
    await supabase.from("follows").delete().or(`follower_id.eq.${user.id},following_id.eq.${user.id}`)

    // 6. Delete likes
    await supabase.from("likes").delete().eq("user_id", user.id)

    // 7. Delete retweets
    await supabase.from("retweets").delete().eq("user_id", user.id)

    // 8. Delete tweets
    await supabase.from("tweets").delete().eq("user_id", user.id)

    // 9. Delete profile
    await supabase.from("profiles").delete().eq("id", user.id)

    // 10. Finally, delete the auth user
    const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id)

    if (deleteError) {
      console.error("[v0] Error deleting auth user:", deleteError)
      return NextResponse.json({ error: "Failed to delete account" }, { status: 500 })
    }

    console.log("[v0] Account deletion completed successfully")

    // Sign out the user
    await supabase.auth.signOut()

    return NextResponse.json({ message: "Account deleted successfully" })
  } catch (error) {
    console.error("[v0] Account deletion error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
