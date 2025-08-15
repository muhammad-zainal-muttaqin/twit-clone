"use client"

import { useEffect, useState } from "react"
import { TweetCard } from "./tweet-card"

interface Tweet {
  id: string
  content: string
  created_at: string
  like_count: number
  retweet_count: number
  reply_count: number
  user_liked?: boolean
  user_retweeted?: boolean
  profiles: {
    id: string
    username: string
    display_name: string
    avatar_url?: string
    verified: boolean
  }
}

export function Timeline() {
  const [tweets, setTweets] = useState<Tweet[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchTweets = async () => {
    try {
      const response = await fetch("/api/tweets")
      if (response.ok) {
        const data = await response.json()
        setTweets(data.tweets || [])
      }
    } catch (error) {
      console.error("Error fetching tweets:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchTweets()
  }, [])

  const handleTweetInteraction = () => {
    // Refresh tweets after interaction
    fetchTweets()
  }

  if (isLoading) {
    return (
      <div className="divide-y divide-border">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="p-4 animate-pulse">
            <div className="flex gap-3">
              <div className="h-10 w-10 rounded-full bg-muted"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted rounded w-1/4"></div>
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (tweets.length === 0) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">No tweets yet. Be the first to tweet!</p>
      </div>
    )
  }

  return (
    <div className="divide-y divide-border">
      {tweets.map((tweet) => (
        <TweetCard key={tweet.id} tweet={tweet} onInteraction={handleTweetInteraction} />
      ))}
    </div>
  )
}
