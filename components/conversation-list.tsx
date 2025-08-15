"use client"

import { useEffect, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

interface Profile {
  id: string
  username: string
  display_name: string
  avatar_url?: string
}

interface Conversation {
  id: string
  participant1: Profile
  participant2: Profile
  last_message?: {
    content: string
    created_at: string
    sender_id: string
  }[]
  updated_at: string
}

interface ConversationListProps {
  conversations: Conversation[]
  selectedConversation: string | null
  onSelectConversation: (id: string) => void
}

export function ConversationList({ conversations, selectedConversation, onSelectConversation }: ConversationListProps) {
  const [currentUserId, setCurrentUserId] = useState<string>("")

  useEffect(() => {
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

    fetchProfile()
  }, [])

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    } else if (diffInHours < 168) {
      // 7 days
      return date.toLocaleDateString([], { weekday: "short" })
    } else {
      return date.toLocaleDateString([], { month: "short", day: "numeric" })
    }
  }

  return (
    <div className="divide-y divide-border">
      {conversations.map((conversation) => {
        const otherParticipant =
          conversation.participant1.id === currentUserId ? conversation.participant2 : conversation.participant1

        const lastMessage = conversation.last_message?.[0]
        const isSelected = selectedConversation === conversation.id

        return (
          <div
            key={conversation.id}
            onClick={() => onSelectConversation(conversation.id)}
            className={cn("p-4 hover:bg-muted/50 cursor-pointer transition-colors", isSelected && "bg-muted")}
          >
            <div className="flex items-start gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={otherParticipant.avatar_url || "/placeholder.svg"} />
                <AvatarFallback className="bg-muted text-muted-foreground">
                  {otherParticipant.display_name?.charAt(0) || otherParticipant.username?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm truncate">{otherParticipant.display_name}</span>
                    <span className="text-muted-foreground text-sm truncate">@{otherParticipant.username}</span>
                  </div>
                  {lastMessage && (
                    <span className="text-xs text-muted-foreground">{formatTime(lastMessage.created_at)}</span>
                  )}
                </div>

                {lastMessage && (
                  <p className="text-sm text-muted-foreground truncate">
                    {lastMessage.sender_id === currentUserId ? "You: " : ""}
                    {lastMessage.content}
                  </p>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
