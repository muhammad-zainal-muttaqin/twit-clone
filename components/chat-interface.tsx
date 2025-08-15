"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Send, MoreHorizontal } from "lucide-react"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"

interface Message {
  id: string
  content: string
  created_at: string
  sender_id: string
  sender: {
    id: string
    username: string
    display_name: string
    avatar_url?: string
  }
}

interface ChatInterfaceProps {
  conversationId: string
}

export function ChatInterface({ conversationId }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [currentUserId, setCurrentUserId] = useState<string>("")
  const [otherParticipant, setOtherParticipant] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  useEffect(() => {
    fetchMessages()

    // Set up real-time subscription
    const channel = supabase
      .channel(`conversation-${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "direct_messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          // Fetch the complete message with sender info
          fetchNewMessage(payload.new.id)
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [conversationId])

  useEffect(() => {
    fetchProfile()
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const fetchProfile = async () => {
    try {
      const response = await fetch("/api/profile")
      if (response.ok) {
        const data = await response.json()
        setCurrentUserId(data.profile.id)
      }
    } catch (error) {
      console.error("Error fetching profile:", error)
    }
  }

  const fetchMessages = async () => {
    try {
      const response = await fetch(`/api/messages?conversation_id=${conversationId}`)
      if (response.ok) {
        const data = await response.json()
        setMessages(data.messages || [])

        // Get other participant info from first message
        if (data.messages?.length > 0) {
          const firstMessage = data.messages[0]
          const otherUser = firstMessage.sender.id !== currentUserId ? firstMessage.sender : null
          if (otherUser) {
            setOtherParticipant(otherUser)
          }
        }
      }
    } catch (error) {
      console.error("Error fetching messages:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchNewMessage = async (messageId: string) => {
    try {
      const { data, error } = await supabase
        .from("direct_messages")
        .select(`
          *,
          sender:profiles!direct_messages_sender_id_fkey(id, username, display_name, avatar_url)
        `)
        .eq("id", messageId)
        .single()

      if (error) throw error

      setMessages((prev) => {
        // Check if message already exists
        if (prev.some((msg) => msg.id === data.id)) {
          return prev
        }
        return [...prev, data]
      })

      // Set other participant if not set
      if (!otherParticipant && data.sender.id !== currentUserId) {
        setOtherParticipant(data.sender)
      }
    } catch (error) {
      console.error("Error fetching new message:", error)
    }
  }

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || sending) return

    setSending(true)
    const messageContent = newMessage.trim()
    setNewMessage("")

    try {
      // Get recipient ID from messages or conversation
      let recipientId = otherParticipant?.id

      if (!recipientId && messages.length > 0) {
        const firstMessage = messages[0]
        recipientId =
          firstMessage.sender.id === currentUserId
            ? messages.find((m) => m.sender.id !== currentUserId)?.sender.id
            : firstMessage.sender.id
      }

      const response = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipient_id: recipientId,
          content: messageContent,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to send message")
      }

      // Message will be added via real-time subscription
    } catch (error) {
      console.error("Error sending message:", error)
      setNewMessage(messageContent) // Restore message on error
    } finally {
      setSending(false)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-muted-foreground">Loading messages...</div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      {otherParticipant && (
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={otherParticipant.avatar_url || "/placeholder.svg"} />
              <AvatarFallback className="bg-muted text-muted-foreground">
                {otherParticipant.display_name?.charAt(0) || otherParticipant.username?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="font-semibold">{otherParticipant.display_name}</h2>
              <p className="text-sm text-muted-foreground">@{otherParticipant.username}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="h-5 w-5" />
          </Button>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">No messages yet. Start the conversation!</div>
        ) : (
          messages.map((message) => {
            const isOwn = message.sender_id === currentUserId
            return (
              <div key={message.id} className={cn("flex gap-3", isOwn ? "justify-end" : "justify-start")}>
                {!isOwn && (
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={message.sender.avatar_url || "/placeholder.svg"} />
                    <AvatarFallback className="bg-muted text-muted-foreground text-xs">
                      {message.sender.display_name?.charAt(0) || message.sender.username?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                )}

                <div className={cn("max-w-xs lg:max-w-md", isOwn && "order-first")}>
                  <div
                    className={cn(
                      "rounded-2xl px-4 py-2 text-sm",
                      isOwn ? "bg-primary text-primary-foreground" : "bg-muted text-foreground",
                    )}
                  >
                    {message.content}
                  </div>
                  <div className={cn("text-xs text-muted-foreground mt-1", isOwn && "text-right")}>
                    {formatTime(message.created_at)}
                  </div>
                </div>
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-border">
        <form onSubmit={sendMessage} className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Start a new message"
            className="flex-1"
            disabled={sending}
          />
          <Button type="submit" disabled={!newMessage.trim() || sending}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  )
}
