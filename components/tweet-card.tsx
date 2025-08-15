"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Heart, MessageCircle, Repeat2, Share, MoreHorizontal, Copy, ExternalLink, Bookmark } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { cn } from "@/lib/utils"

interface Tweet {
  id: string
  content: string
  created_at: string
  like_count: number
  retweet_count: number
  reply_count: number
  user_liked?: boolean
  user_retweeted?: boolean
  user_bookmarked?: boolean
  profiles: {
    id: string
    username: string
    display_name: string
    avatar_url?: string
    verified: boolean
  }
}

interface TweetCardProps {
  tweet: Tweet
  onInteraction?: () => void
}

export function TweetCard({ tweet, onInteraction }: TweetCardProps) {
  const [isLiked, setIsLiked] = useState(tweet.user_liked || false)
  const [isRetweeted, setIsRetweeted] = useState(tweet.user_retweeted || false)
  const [isBookmarked, setIsBookmarked] = useState(tweet.user_bookmarked || false)
  const [likeCount, setLikeCount] = useState(tweet.like_count)
  const [retweetCount, setRetweetCount] = useState(tweet.retweet_count)
  const [isLoading, setIsLoading] = useState(false)

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault()
    if (isLoading) return

    setIsLoading(true)
    const previousLiked = isLiked
    const previousCount = likeCount

    // Optimistic update
    setIsLiked(!isLiked)
    setLikeCount(isLiked ? likeCount - 1 : likeCount + 1)

    try {
      const response = await fetch(`/api/tweets/${tweet.id}/like`, {
        method: "POST",
      })

      if (!response.ok) {
        // Revert on error
        setIsLiked(previousLiked)
        setLikeCount(previousCount)
      } else {
        onInteraction?.()
      }
    } catch (error) {
      // Revert on error
      setIsLiked(previousLiked)
      setLikeCount(previousCount)
      console.error("Error liking tweet:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRetweet = async (e: React.MouseEvent) => {
    e.preventDefault()
    if (isLoading) return

    setIsLoading(true)
    const previousRetweeted = isRetweeted
    const previousCount = retweetCount

    // Optimistic update
    setIsRetweeted(!isRetweeted)
    setRetweetCount(isRetweeted ? retweetCount - 1 : retweetCount + 1)

    try {
      const response = await fetch(`/api/tweets/${tweet.id}/retweet`, {
        method: "POST",
      })

      if (!response.ok) {
        // Revert on error
        setIsRetweeted(previousRetweeted)
        setRetweetCount(previousCount)
      } else {
        onInteraction?.()
      }
    } catch (error) {
      // Revert on error
      setIsRetweeted(previousRetweeted)
      setRetweetCount(previousCount)
      console.error("Error retweeting:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleBookmark = async (e: React.MouseEvent) => {
    e.preventDefault()
    if (isLoading) return

    setIsLoading(true)
    const previousBookmarked = isBookmarked

    // Optimistic update
    setIsBookmarked(!isBookmarked)

    try {
      const response = await fetch("/api/bookmarks", {
        method: isBookmarked ? "DELETE" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: isBookmarked ? undefined : JSON.stringify({ tweetId: tweet.id }),
      })

      if (!response.ok) {
        // Revert on error
        setIsBookmarked(previousBookmarked)
      } else {
        onInteraction?.()
      }
    } catch (error) {
      // Revert on error
      setIsBookmarked(previousBookmarked)
      console.error("Error bookmarking tweet:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopyLink = async (e: React.MouseEvent) => {
    e.preventDefault()
    const tweetUrl = `${window.location.origin}/${tweet.profiles.username}/status/${tweet.id}`

    try {
      await navigator.clipboard.writeText(tweetUrl)
      // You could add a toast notification here
      console.log("Tweet link copied to clipboard")
    } catch (error) {
      console.error("Failed to copy link:", error)
    }
  }

  const handleNativeShare = async (e: React.MouseEvent) => {
    e.preventDefault()
    const tweetUrl = `${window.location.origin}/${tweet.profiles.username}/status/${tweet.id}`

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Tweet by ${tweet.profiles.display_name}`,
          text: tweet.content,
          url: tweetUrl,
        })
      } catch (error) {
        console.error("Error sharing:", error)
      }
    } else {
      // Fallback to copy link
      handleCopyLink(e)
    }
  }

  const handleShareToTwitter = (e: React.MouseEvent) => {
    e.preventDefault()
    const tweetUrl = `${window.location.origin}/${tweet.profiles.username}/status/${tweet.id}`
    const shareText = `Check out this tweet by ${tweet.profiles.display_name}: ${tweet.content}`
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(tweetUrl)}`
    window.open(twitterUrl, "_blank", "noopener,noreferrer")
  }

  const timeAgo = formatDistanceToNow(new Date(tweet.created_at), { addSuffix: true })

  return (
    <Card className="border-0 rounded-none bg-card hover:bg-card/80 transition-colors cursor-pointer">
      <CardContent className="p-3 sm:p-4">
        <div className="flex gap-2 sm:gap-3">
          <Link href={`/${tweet.profiles.username}`}>
            <Avatar className="hover:opacity-80 transition-opacity h-8 w-8 sm:h-10 sm:w-10">
              <AvatarImage src={tweet.profiles.avatar_url || "/placeholder.svg"} />
              <AvatarFallback className="bg-muted text-muted-foreground text-xs sm:text-sm">
                {tweet.profiles.display_name?.charAt(0) || tweet.profiles.username?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
          </Link>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-1">
              <div className="flex items-center gap-1 sm:gap-2 min-w-0 flex-1">
                <Link href={`/${tweet.profiles.username}`} className="hover:underline min-w-0">
                  <span className="font-semibold text-card-foreground text-sm sm:text-base truncate">
                    {tweet.profiles.display_name}
                  </span>
                </Link>
                {tweet.profiles.verified && (
                  <div className="h-3 w-3 sm:h-4 sm:w-4 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                    <span className="text-xs text-primary-foreground">✓</span>
                  </div>
                )}
                <Link href={`/${tweet.profiles.username}`} className="hover:underline min-w-0 hidden sm:block">
                  <span className="text-muted-foreground text-sm truncate">@{tweet.profiles.username}</span>
                </Link>
                <span className="text-muted-foreground hidden sm:inline">·</span>
                <span className="text-muted-foreground text-xs sm:text-sm flex-shrink-0">{timeAgo}</span>
              </div>
              <div className="flex-shrink-0 ml-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-6 w-6 sm:h-8 sm:w-8 p-0">
                      <MoreHorizontal className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={handleBookmark}>
                      <Bookmark className={cn("h-4 w-4 mr-2", isBookmarked && "fill-current")} />
                      {isBookmarked ? "Remove from Bookmarks" : "Bookmark"}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleCopyLink}>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy link to Tweet
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <div className="sm:hidden mb-1">
              <Link href={`/${tweet.profiles.username}`} className="hover:underline">
                <span className="text-muted-foreground text-xs">@{tweet.profiles.username}</span>
              </Link>
            </div>

            <p className="text-card-foreground mb-3 font-serif whitespace-pre-wrap text-sm sm:text-base leading-relaxed">
              {tweet.content}
            </p>

            <div className="flex items-center justify-between max-w-xs sm:max-w-md">
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-1 sm:gap-2 text-muted-foreground hover:text-primary p-1 sm:p-2"
                onClick={(e) => e.preventDefault()}
              >
                <MessageCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="text-xs sm:text-sm">{tweet.reply_count}</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "flex items-center gap-1 sm:gap-2 text-muted-foreground hover:text-accent p-1 sm:p-2",
                  isRetweeted && "text-accent",
                )}
                onClick={handleRetweet}
                disabled={isLoading}
              >
                <Repeat2 className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="text-xs sm:text-sm">{retweetCount}</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "flex items-center gap-1 sm:gap-2 text-muted-foreground hover:text-red-500 p-1 sm:p-2",
                  isLiked && "text-red-500",
                )}
                onClick={handleLike}
                disabled={isLoading}
              >
                <Heart className={cn("h-3 w-3 sm:h-4 sm:w-4", isLiked && "fill-current")} />
                <span className="text-xs sm:text-sm">{likeCount}</span>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary p-1 sm:p-2">
                    <Share className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleNativeShare}>
                    <Share className="h-4 w-4 mr-2" />
                    Share Tweet
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleCopyLink}>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy link to Tweet
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleShareToTwitter}>
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Share via Twitter
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
