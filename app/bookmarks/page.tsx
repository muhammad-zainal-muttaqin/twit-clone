"use client"

import { useState, useEffect } from "react"
import { MainLayout } from "@/components/main-layout"
import { TweetCard } from "@/components/tweet-card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Bookmark } from "lucide-react"
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

export default function BookmarksPage() {
  const [bookmarkedTweets, setBookmarkedTweets] = useState<Tweet[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchBookmarks = async () => {
      try {
        const response = await fetch("/api/bookmarks")
        if (response.ok) {
          const data = await response.json()
          setBookmarkedTweets(data.tweets || [])
        }
      } catch (error) {
        console.error("Error fetching bookmarks:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchBookmarks()
  }, [])

  if (isLoading) {
    return (
      <MainLayout>
        <div className="max-w-2xl mx-auto">
          <div className="sticky top-0 bg-background/80 backdrop-blur-md border-b border-border p-4">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm" className="p-2">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-bold text-foreground">Bookmarks</h1>
                <p className="text-sm text-muted-foreground">Loading...</p>
              </div>
            </div>
          </div>
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground mt-2">Loading bookmarks...</p>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="sticky top-0 bg-background/80 backdrop-blur-md border-b border-border p-4">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm" className="p-2">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold text-foreground">Bookmarks</h1>
              <p className="text-sm text-muted-foreground">
                {bookmarkedTweets.length} {bookmarkedTweets.length === 1 ? "tweet" : "tweets"}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        {bookmarkedTweets.length > 0 ? (
          <div className="divide-y divide-border">
            {bookmarkedTweets.map((tweet) => (
              <TweetCard key={tweet.id} tweet={tweet} />
            ))}
          </div>
        ) : (
          <div className="p-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                <Bookmark className="h-8 w-8 text-muted-foreground" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Save Tweets for later</h2>
            <p className="text-muted-foreground max-w-sm mx-auto">
              Don't let the good ones fly away! Bookmark Tweets to easily find them again in the future.
            </p>
          </div>
        )}
      </div>
    </MainLayout>
  )
}
