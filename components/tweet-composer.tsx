"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

import { ImageIcon, Smile, Calendar, MapPin, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

interface TweetComposerProps {
  user: {
    email?: string
    user_metadata?: {
      avatar_url?: string
      full_name?: string
    }
  }
  onTweetPosted?: () => void
}

export function TweetComposer({ user, onTweetPosted }: TweetComposerProps) {
  const [content, setContent] = useState("")
  const [isPosting, setIsPosting] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!content.trim() || isPosting) return

    setIsPosting(true)

    try {
      const response = await fetch("/api/tweets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: content.trim(),
        }),
      })

      if (response.ok) {
        setContent("")
        onTweetPosted?.()
        router.refresh()
      } else {
        const error = await response.json()
        console.error("Failed to post tweet:", error)
      }
    } catch (error) {
      console.error("Error posting tweet:", error)
    } finally {
      setIsPosting(false)
    }
  }

  const remainingChars = 280 - content.length
  const isOverLimit = remainingChars < 0

  return (
    <div className="border-b border-border bg-background">
      <div className="p-4">
        <form onSubmit={handleSubmit}>
          <div className="flex gap-3">
            <Avatar>
              <AvatarImage src={user.user_metadata?.avatar_url || "/placeholder.svg"} />
              <AvatarFallback className="bg-primary text-primary-foreground">
                {user.email?.charAt(0).toUpperCase() || user.user_metadata?.full_name?.charAt(0).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="What's happening?"
                className="w-full bg-transparent text-xl placeholder:text-muted-foreground resize-none border-none outline-none min-h-[120px]"
                disabled={isPosting}
              />
              <div className="flex justify-between items-center mt-4">
                <div className="flex gap-4 text-primary">
                  <Button type="button" variant="ghost" size="sm" className="p-2 h-auto">
                    <ImageIcon className="h-5 w-5" />
                  </Button>
                  <Button type="button" variant="ghost" size="sm" className="p-2 h-auto">
                    <Smile className="h-5 w-5" />
                  </Button>
                  <Button type="button" variant="ghost" size="sm" className="p-2 h-auto">
                    <Calendar className="h-5 w-5" />
                  </Button>
                  <Button type="button" variant="ghost" size="sm" className="p-2 h-auto">
                    <MapPin className="h-5 w-5" />
                  </Button>
                </div>
                <div className="flex items-center gap-3">
                  {content.length > 0 && (
                    <span
                      className={`text-sm ${
                        isOverLimit
                          ? "text-destructive"
                          : remainingChars <= 20
                            ? "text-yellow-500"
                            : "text-muted-foreground"
                      }`}
                    >
                      {remainingChars}
                    </span>
                  )}
                  <Button
                    type="submit"
                    disabled={!content.trim() || isOverLimit || isPosting}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-6"
                  >
                    {isPosting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Posting...
                      </>
                    ) : (
                      "Post"
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
