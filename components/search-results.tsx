"use client"

import { useState, useEffect } from "react"
import { TweetCard } from "./tweet-card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"

interface Tweet {
  id: string
  content: string
  created_at: string
  like_count: number
  retweet_count: number
  reply_count: number
  profiles: {
    id: string
    username: string
    display_name: string
    avatar_url?: string
    verified: boolean
  }
}

interface User {
  id: string
  username: string
  display_name: string
  bio?: string
  avatar_url?: string
  verified: boolean
  follower_count: number
}

interface SearchResultsProps {
  query: string
  activeTab: string
}

export function SearchResults({ query, activeTab }: SearchResultsProps) {
  const [tweets, setTweets] = useState<Tweet[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const searchContent = async () => {
      if (!query.trim()) {
        setTweets([])
        setUsers([])
        return
      }

      setIsLoading(true)
      try {
        const params = new URLSearchParams({
          q: query,
          type: activeTab === "all" ? "all" : activeTab,
        })

        const response = await fetch(`/api/search?${params}`)
        if (response.ok) {
          const data = await response.json()
          setTweets(data.tweets || [])
          setUsers(data.users || [])
        }
      } catch (error) {
        console.error("Error searching:", error)
      } finally {
        setIsLoading(false)
      }
    }

    const debounceTimer = setTimeout(searchContent, 800) // Increased debounce from 300ms to 800ms to reduce API calls
    return () => clearTimeout(debounceTimer)
  }, [query, activeTab])

  if (isLoading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="text-muted-foreground mt-2">Searching...</p>
      </div>
    )
  }

  if (!query.trim()) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">Enter a search term to find tweets and users.</p>
      </div>
    )
  }

  const showTweets = activeTab === "all" || activeTab === "tweets"
  const showUsers = activeTab === "all" || activeTab === "users"

  return (
    <div>
      {/* Users Results */}
      {showUsers && users.length > 0 && (
        <div className="border-b border-border">
          <div className="p-4 border-b border-border">
            <h3 className="font-semibold text-foreground">People</h3>
          </div>
          {users.map((user) => (
            <div key={user.id} className="p-4 hover:bg-card/50 transition-colors border-b border-border">
              <div className="flex items-center justify-between">
                <Link href={`/${user.username}`} className="flex items-center gap-3 flex-1">
                  <Avatar>
                    <AvatarImage src={user.avatar_url || "/placeholder.svg"} />
                    <AvatarFallback className="bg-muted text-muted-foreground">
                      {user.display_name?.charAt(0) || user.username?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground">{user.display_name}</span>
                      {user.verified && (
                        <div className="h-4 w-4 rounded-full bg-primary flex items-center justify-center">
                          <span className="text-xs text-primary-foreground">✓</span>
                        </div>
                      )}
                    </div>
                    <p className="text-muted-foreground">@{user.username}</p>
                    {user.bio && <p className="text-sm text-muted-foreground mt-1">{user.bio}</p>}
                    <p className="text-sm text-muted-foreground">{user.follower_count} followers</p>
                  </div>
                </Link>
                <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-4">
                  Follow
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tweets Results */}
      {showTweets && tweets.length > 0 && (
        <div>
          {showUsers && users.length > 0 && (
            <div className="p-4 border-b border-border">
              <h3 className="font-semibold text-foreground">Tweets</h3>
            </div>
          )}
          <div className="divide-y divide-border">
            {tweets.map((tweet) => (
              <TweetCard key={tweet.id} tweet={tweet} />
            ))}
          </div>
        </div>
      )}

      {/* No Results */}
      {tweets.length === 0 && users.length === 0 && (
        <div className="p-8 text-center">
          <p className="text-muted-foreground">No results found for "{query}"</p>
          <p className="text-sm text-muted-foreground mt-2">Try searching for something else.</p>
        </div>
      )}
    </div>
  )
}
