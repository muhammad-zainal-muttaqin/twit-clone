"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search } from "lucide-react"

interface User {
  id: string
  username: string
  display_name: string
  avatar_url?: string
}

interface NewMessageDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConversationCreated: (conversationId: string) => void
}

export function NewMessageDialog({ open, onOpenChange, onConversationCreated }: NewMessageDialogProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [creating, setCreating] = useState(false)

  const searchUsers = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([])
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}&type=users`)
      if (response.ok) {
        const data = await response.json()
        setSearchResults(data.users || [])
      }
    } catch (error) {
      console.error("Error searching users:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value
    setSearchQuery(query)
    searchUsers(query)
  }

  const startConversation = async (username: string) => {
    setCreating(true)
    try {
      const response = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      })

      if (response.ok) {
        const data = await response.json()
        onConversationCreated(data.conversation_id)
        setSearchQuery("")
        setSearchResults([])
      }
    } catch (error) {
      console.error("Error starting conversation:", error)
    } finally {
      setCreating(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Start a new message</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search people" value={searchQuery} onChange={handleSearch} className="pl-10" />
          </div>

          {/* Search Results */}
          <div className="max-h-60 overflow-y-auto">
            {loading ? (
              <div className="text-center py-4 text-muted-foreground">Searching...</div>
            ) : searchResults.length > 0 ? (
              <div className="space-y-2">
                {searchResults.map((user) => (
                  <div
                    key={user.id}
                    onClick={() => startConversation(user.username)}
                    className="flex items-center gap-3 p-3 hover:bg-muted rounded-lg cursor-pointer transition-colors"
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.avatar_url || "/placeholder.svg"} />
                      <AvatarFallback className="bg-muted text-muted-foreground">
                        {user.display_name?.charAt(0) || user.username?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">{user.display_name}</p>
                      <p className="text-muted-foreground text-sm truncate">@{user.username}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : searchQuery.trim() ? (
              <div className="text-center py-4 text-muted-foreground">No users found</div>
            ) : (
              <div className="text-center py-4 text-muted-foreground">Search for people to start a conversation</div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
