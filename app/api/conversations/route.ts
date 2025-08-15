import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function POST(request: NextRequest) {
  const cookieStore = cookies()
  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
    },
  })

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { username } = await request.json()

    if (!username) {
      return NextResponse.json({ error: "Username is required" }, { status: 400 })
    }

    // Find the user by username
    const { data: recipient, error: userError } = await supabase
      .from("profiles")
      .select("id, username, display_name, avatar_url")
      .eq("username", username)
      .single()

    if (userError || !recipient) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    if (recipient.id === user.id) {
      return NextResponse.json({ error: "Cannot message yourself" }, { status: 400 })
    }

    // Check if conversation already exists
    const { data: existingConv } = await supabase
      .from("conversations")
      .select("id")
      .or(
        `and(participant1_id.eq.${user.id},participant2_id.eq.${recipient.id}),and(participant1_id.eq.${recipient.id},participant2_id.eq.${user.id})`,
      )
      .single()

    if (existingConv) {
      return NextResponse.json({ conversation_id: existingConv.id, recipient })
    }

    // Create new conversation
    const { data: conversation, error: convError } = await supabase
      .from("conversations")
      .insert({
        participant1_id: user.id,
        participant2_id: recipient.id,
      })
      .select()
      .single()

    if (convError) throw convError

    return NextResponse.json({ conversation_id: conversation.id, recipient })
  } catch (error) {
    console.error("Error creating conversation:", error)
    return NextResponse.json({ error: "Failed to create conversation" }, { status: 500 })
  }
}
