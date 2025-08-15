"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, MessageCircle, Edit, ArrowLeft } from "lucide-react"
import { ConversationList } from "@/components/conversation-list"
import { ChatInterface } from "@/components/chat-interface"
import { NewMessageDialog } from "@/components/new-message-dialog"
import Link from "next/link"

interface Conversation {
  id: string
  participant1: {
    id: string
    username: string
    display_name: string
    avatar_url?: string
  }
  participant2: {
    id: string
    username: string
    display_name: string
    avatar_url?: string
  }
  last_message?: {
    content: string
    created_at: string
    sender_id: string
  }[]
  updated_at: string
}

export default function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [showNewMessage, setShowNewMessage] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchConversations()
  }, [])

  const fetchConversations = async () => {
    try {
      const response = await fetch("/api/messages")
      if (response.ok) {
        const data = await response.json()
        setConversations(data.conversations || [])
      }
    } catch (error) {
      console.error("Error fetching conversations:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredConversations = conversations.filter((conv) => {
    const otherParticipant =
      conv.participant1.id !== conv.participant2.id
        ? conv.participant1.username !== searchQuery
          ? conv.participant1
          : conv.participant2
        : conv.participant1

    return (
      otherParticipant.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      otherParticipant.username.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })

  const handleNewConversation = (conversationId: string) => {
    setSelectedConversation(conversationId)
    setShowNewMessage(false)
    fetchConversations()
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Conversations Sidebar */}
      <div className="w-80 border-r border-border flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Link href="/">
                <Button variant="ghost" size="sm" className="rounded-full p-2">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <h1 className="text-xl font-bold font-sans">Messages</h1>
            </div>
            <Button size="sm" onClick={() => setShowNewMessage(true)} className="rounded-full">
              <Edit className="h-4 w-4" />
            </Button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search Direct Messages"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-muted/50"
            />
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-muted-foreground">Loading conversations...</div>
          ) : filteredConversations.length > 0 ? (
            <ConversationList
              conversations={filteredConversations}
              selectedConversation={selectedConversation}
              onSelectConversation={setSelectedConversation}
            />
          ) : (
            <div className="p-8 text-center">
              <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold mb-2">No conversations yet</h3>
              <p className="text-sm text-muted-foreground mb-4">Start a conversation by sending a message</p>
              <Button onClick={() => setShowNewMessage(true)}>Send a message</Button>
            </div>
          )}
        </div>
      </div>

      {/* Chat Interface */}
      <div className="flex-1">
        {selectedConversation ? (
          <ChatInterface conversationId={selectedConversation} />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <MessageCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Select a message</h2>
              <p className="text-muted-foreground">
                Choose from your existing conversations, start a new one, or just keep swimming.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* New Message Dialog */}
      <NewMessageDialog
        open={showNewMessage}
        onOpenChange={setShowNewMessage}
        onConversationCreated={handleNewConversation}
      />
    </div>
  )
}
