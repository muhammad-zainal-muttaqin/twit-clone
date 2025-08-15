import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function GET(request: NextRequest) {
  const cookieStore = cookies()
  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
    },
  })

  const { searchParams } = new URL(request.url)
  const conversationId = searchParams.get("conversation_id")
  const page = Number.parseInt(searchParams.get("page") || "1")
  const limit = Number.parseInt(searchParams.get("limit") || "50")
  const offset = (page - 1) * limit

  try {
    if (conversationId) {
      // Get messages for a specific conversation
      const { data: messages, error } = await supabase
        .from("messages")
        .select(`
          *,
          sender:profiles!messages_sender_id_fkey(id, username, display_name, avatar_url)
        `)
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true })
        .range(offset, offset + limit - 1)

      if (error) throw error

      return NextResponse.json({ messages })
    } else {
      // Get user's conversations
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      }

      const { data: conversations, error } = await supabase
        .from("conversations")
        .select(`
          *,
          participant1:profiles!conversations_participant1_id_fkey(id, username, display_name, avatar_url),
          participant2:profiles!conversations_participant2_id_fkey(id, username, display_name, avatar_url),
          last_message:messages(content, created_at, sender_id)
        `)
        .or(`participant1_id.eq.${user.id},participant2_id.eq.${user.id}`)
        .order("updated_at", { ascending: false })

      if (error) throw error

      return NextResponse.json({ conversations })
    }
  } catch (error) {
    console.error("Error fetching messages:", error)
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 })
  }
}

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

    const { recipient_id, content } = await request.json()

    if (!recipient_id || !content?.trim()) {
      return NextResponse.json({ error: "Recipient and content are required" }, { status: 400 })
    }

    // Find or create conversation
    let { data: conversation, error: convError } = await supabase
      .from("conversations")
      .select("*")
      .or(
        `and(participant1_id.eq.${user.id},participant2_id.eq.${recipient_id}),and(participant1_id.eq.${recipient_id},participant2_id.eq.${user.id})`,
      )
      .single()

    if (convError && convError.code === "PGRST116") {
      // Create new conversation
      const { data: newConv, error: createError } = await supabase
        .from("conversations")
        .insert({
          participant1_id: user.id,
          participant2_id: recipient_id,
        })
        .select()
        .single()

      if (createError) throw createError
      conversation = newConv
    } else if (convError) {
      throw convError
    }

    // Send message
    const { data: message, error: messageError } = await supabase
      .from("messages")
      .insert({
        conversation_id: conversation.id,
        sender_id: user.id,
        content: content.trim(),
      })
      .select(`
        *,
        sender:profiles!messages_sender_id_fkey(id, username, display_name, avatar_url)
      `)
      .single()

    if (messageError) throw messageError

    // Update conversation timestamp
    await supabase.from("conversations").update({ updated_at: new Date().toISOString() }).eq("id", conversation.id)

    return NextResponse.json({ message })
  } catch (error) {
    console.error("Error sending message:", error)
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 })
  }
}
