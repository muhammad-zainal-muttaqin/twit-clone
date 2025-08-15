"use client"

import { useEffect, useState, useCallback, useMemo } from "react"
import { TweetCard } from "./tweet-card"
import { Button } from "@/components/ui/button"
import { Loader2, RefreshCw } from "lucide-react"
import { useRealtimeTweets } from "@/hooks/use-realtime"
import { apiCache } from "@/lib/api-cache"

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

interface EnhancedTimelineProps {
  feedType: string
}

export function EnhancedTimeline({ feedType }: EnhancedTimelineProps) {
  const [tweets, setTweets] = useState<Tweet[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const { newTweetCount, resetNewTweetCount } = useRealtimeTweets()

  const cacheKey = useMemo(() => `feed-${feedType}`, [feedType])

  const fetchTweets = useCallback(
    async (cursor?: string, refresh = false) => {
      try {
        if (refresh) {
          setIsRefreshing(true)
          apiCache.delete(cacheKey)
        } else if (cursor) {
          setIsLoadingMore(true)
        } else {
          setIsLoading(true)
          const cached = apiCache.get<{ tweets: Tweet[]; nextCursor: string | null; hasMore: boolean }>(cacheKey)
          if (cached && !refresh) {
            setTweets(cached.tweets)
            setNextCursor(cached.nextCursor)
            setHasMore(cached.hasMore)
            setIsLoading(false)
            return
          }
        }

        const params = new URLSearchParams({
          type: feedType,
          limit: "20",
        })

        if (cursor) {
          params.append("cursor", cursor)
        }

        const response = await fetch(`/api/feed?${params}`)
        if (response.ok) {
          const data = await response.json()

          if (refresh || !cursor) {
            setTweets(data.tweets || [])
            resetNewTweetCount()
            if (!cursor) {
              apiCache.set(
                cacheKey,
                {
                  tweets: data.tweets || [],
                  nextCursor: data.nextCursor,
                  hasMore: data.hasMore,
                },
                30000,
              ) // Cache for 30 seconds
            }
          } else {
            setTweets((prev) => [...prev, ...(data.tweets || [])])
          }

          setNextCursor(data.nextCursor)
          setHasMore(data.hasMore)
        }
      } catch (error) {
        console.error("Error fetching tweets:", error)
      } finally {
        setIsLoading(false)
        setIsLoadingMore(false)
        setIsRefreshing(false)
      }
    },
    [feedType, cacheKey, resetNewTweetCount],
  )

  useEffect(() => {
    fetchTweets()
  }, [feedType]) // Keep only feedType dependency to prevent infinite loops

  const handleLoadMore = useCallback(() => {
    if (nextCursor && hasMore && !isLoadingMore) {
      fetchTweets(nextCursor)
    }
  }, [nextCursor, hasMore, isLoadingMore, fetchTweets])

  const handleRefresh = useCallback(() => {
    fetchTweets(undefined, true)
  }, [fetchTweets])

  const handleTweetInteraction = useCallback(() => {
    setTimeout(() => {
      fetchTweets(undefined, true)
    }, 1000)
  }, [fetchTweets])

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
      <div className="p-8 text-center space-y-4">
        <p className="text-muted-foreground">
          {feedType === "following"
            ? "No tweets from people you follow. Try following some users or switch to 'For you' feed."
            : "No tweets yet. Be the first to tweet!"}
        </p>
        <Button onClick={handleRefresh} variant="outline" className="rounded-full bg-transparent">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>
    )
  }

  return (
    <div>
      {/* New tweets indicator */}
      {newTweetCount > 0 && (
        <div className="border-b border-border p-4">
          <Button onClick={handleRefresh} variant="outline" size="sm" className="w-full bg-primary/10 border-primary">
            <RefreshCw className="h-4 w-4 mr-2" />
            Show {newTweetCount} new tweet{newTweetCount > 1 ? "s" : ""}
          </Button>
        </div>
      )}

      {/* Refresh button */}
      <div className="border-b border-border p-4">
        <Button onClick={handleRefresh} disabled={isRefreshing} variant="ghost" size="sm" className="w-full">
          {isRefreshing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Refreshing...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4 mr-2" />
              Show new tweets
            </>
          )}
        </Button>
      </div>

      {/* Timeline */}
      <div className="divide-y divide-border">
        {tweets.map((tweet) => (
          <TweetCard key={tweet.id} tweet={tweet} onInteraction={handleTweetInteraction} />
        ))}
      </div>

      {/* Load more */}
      {hasMore && (
        <div className="p-4 border-t border-border">
          <Button
            onClick={handleLoadMore}
            disabled={isLoadingMore}
            variant="outline"
            className="w-full rounded-full bg-transparent"
          >
            {isLoadingMore ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Loading more...
              </>
            ) : (
              "Load more tweets"
            )}
          </Button>
        </div>
      )}
    </div>
  )
}
