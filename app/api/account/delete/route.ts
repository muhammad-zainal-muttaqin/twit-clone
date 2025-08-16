import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function DELETE(request: NextRequest) {
  try {
    const cookieStore = cookies()

    // Create Supabase client for authentication check
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
      console.log("[v0] Unauthorized deletion attempt")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log("[v0] Starting account deletion for user:", user.id)

    const adminSupabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
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

    console.log("[v0] Deleting user data...")

    // 1. Delete messages
    const { error: messagesError } = await adminSupabase.from("messages").delete().eq("sender_id", user.id)
    if (messagesError) console.log("[v0] Error deleting messages:", messagesError)

    // 2. Delete conversations where user is participant
    const { error: conversationsError } = await adminSupabase
      .from("conversations")
      .delete()
      .or(`participant1_id.eq.${user.id},participant2_id.eq.${user.id}`)
    if (conversationsError) console.log("[v0] Error deleting conversations:", conversationsError)

    // 3. Delete bookmarks
    const { error: bookmarksError } = await adminSupabase.from("bookmarks").delete().eq("user_id", user.id)
    if (bookmarksError) console.log("[v0] Error deleting bookmarks:", bookmarksError)

    // 4. Delete notifications (sent and received)
    const { error: notificationsError } = await adminSupabase
      .from("notifications")
      .delete()
      .or(`user_id.eq.${user.id},from_user_id.eq.${user.id}`)
    if (notificationsError) console.log("[v0] Error deleting notifications:", notificationsError)

    // 5. Delete follows (following and followers)
    const { error: followsError } = await adminSupabase
      .from("follows")
      .delete()
      .or(`follower_id.eq.${user.id},following_id.eq.${user.id}`)
    if (followsError) console.log("[v0] Error deleting follows:", followsError)

    // 6. Delete likes
    const { error: likesError } = await adminSupabase.from("likes").delete().eq("user_id", user.id)
    if (likesError) console.log("[v0] Error deleting likes:", likesError)

    // 7. Delete retweets
    const { error: retweetsError } = await adminSupabase.from("retweets").delete().eq("user_id", user.id)
    if (retweetsError) console.log("[v0] Error deleting retweets:", retweetsError)

    // 8. Delete tweets
    const { error: tweetsError } = await adminSupabase.from("tweets").delete().eq("user_id", user.id)
    if (tweetsError) console.log("[v0] Error deleting tweets:", tweetsError)

    // 9. Delete profile
    const { error: profileError } = await adminSupabase.from("profiles").delete().eq("id", user.id)
    if (profileError) console.log("[v0] Error deleting profile:", profileError)

    console.log("[v0] User data deletion completed")

    await supabase.auth.signOut()
    console.log("[v0] User signed out")

    // 10. Finally, delete the auth user using admin client
    const { error: deleteError } = await adminSupabase.auth.admin.deleteUser(user.id)

    if (deleteError) {
      console.error("[v0] Error deleting auth user:", deleteError)
      return NextResponse.json({ error: "Failed to delete account completely" }, { status: 500 })
    }

    console.log("[v0] Auth user deletion completed successfully")

    return NextResponse.json({
      message: "Account deleted successfully",
      redirect: "/auth/login?message=account_deleted",
    })
  } catch (error) {
    console.error("[v0] Account deletion error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
