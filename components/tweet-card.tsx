"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Heart, MessageCircle, Repeat2, Share, MoreHorizontal, Copy, ExternalLink, Bookmark, BarChart2 } from "lucide-react"
import { formatDistanceToNow, differenceInMinutes, differenceInHours, differenceInDays } from "date-fns"
import { cn } from "@/lib/utils"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface Tweet {
  id: string
  content: string
  created_at: string
  like_count: number
  retweet_count: number
  reply_count: number
  views_count?: number
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
  const [analyticsOpen, setAnalyticsOpen] = useState(false)

  // Compact number formatter (e.g., 16.2K, 3.4M)
  const formatCount = (n?: number) => {
    if (typeof n !== "number") return undefined
    if (n < 1000) return `${n}`
    if (n < 1_000_000) return `${(n / 1000).toFixed(n % 1000 >= 100 ? 1 : 0)}K`
    return `${(n / 1_000_000).toFixed(n % 1_000_000 >= 100_000 ? 1 : 0)}M`
  }

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
        // Validate share data before attempting to share
        const shareData = {
          title: `Tweet by ${tweet.profiles.display_name}`,
          text: tweet.content,
          url: tweetUrl,
        }

        // Check if the share data is valid
        if (navigator.canShare && !navigator.canShare(shareData)) {
          console.log("Share data not supported, falling back to copy link")
          handleCopyLink(e)
          return
        }

        await navigator.share(shareData)
      } catch (error: any) {
        console.error("Error sharing:", error)

        // Handle specific error cases
        if (error.name === "AbortError") {
          // User cancelled the share, do nothing
          return
        } else if (error.name === "NotAllowedError" || error.message?.includes("Permission denied")) {
          // Permission denied or not allowed, fallback to copy link
          console.log("Share permission denied, falling back to copy link")
          handleCopyLink(e)
        } else {
          // Other errors, also fallback to copy link
          console.log("Share failed, falling back to copy link")
          handleCopyLink(e)
        }
      }
    } else {
      // Fallback to copy link
      handleCopyLink(e)
    }
  }

  const handleShareToTwitter = (e: React.MouseEvent) => {
    e.preventDefault()
    const tweetUrl = `${window.location.origin}/${tweet.profiles.username}/status/${tweet.id}`
    const shareText = `Check out this post by ${tweet.profiles.display_name}: ${tweet.content}`
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(tweetUrl)}`
    window.open(twitterUrl, "_blank", "noopener,noreferrer")
  }

  const timeAgo = formatDistanceToNow(new Date(tweet.created_at), { addSuffix: true })
  const shortTime = (() => {
    const d = new Date(tweet.created_at)
    const now = new Date()
    const mins = differenceInMinutes(now, d)
    if (mins < 1) return "now"
    if (mins < 60) return `${mins}m`
    const hrs = differenceInHours(now, d)
    if (hrs < 24) return `${hrs}h`
    const days = differenceInDays(now, d)
    if (days < 7) return `${days}d`
    // fallback to relative like "about 2 months ago" simplified via formatDistanceToNow
    return formatDistanceToNow(d, { addSuffix: false })
  })()

  return (
    <div className="border-b border-l border-r border-border hover:bg-card/20 transition-colors cursor-pointer">
      <div className="p-3">
        <div className="flex gap-3">
          <Link href={`/${tweet.profiles.username}`}>
            <Avatar className="hover:opacity-80 transition-opacity h-10 w-10">
              <AvatarImage src={tweet.profiles.avatar_url || "/placeholder.svg"} />
              <AvatarFallback className="bg-muted text-muted-foreground text-xs">
                {tweet.profiles.display_name?.charAt(0) || tweet.profiles.username?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
          </Link>
          <div className="flex-1 min-w-0 max-w-[525px]">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1">
                <Link href={`/${tweet.profiles.username}`} className="hover:underline min-w-0">
                  <span className="font-bold text-card-foreground text-[15px] leading-5 truncate">
                    {tweet.profiles.display_name}
                  </span>
                </Link>
                {tweet.profiles.verified && (
                  <div className="h-4 w-4 rounded-full bg-primary/90 text-primary-foreground flex items-center justify-center flex-shrink-0">
                    <span className="text-[10px]">✓</span>
                  </div>
                )}
                <Link href={`/${tweet.profiles.username}`} className="min-w-0 hidden sm:block">
                  <span className="text-muted-foreground text-[13px] leading-5 truncate">@{tweet.profiles.username}</span>
                </Link>
                <span className="text-muted-foreground hidden sm:inline">·</span>
                <span title={timeAgo} className="text-muted-foreground text-[13px] leading-5 flex-shrink-0">
                  {shortTime}
                </span>
              </div>
              <div className="flex-shrink-0 ml-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full hover:bg-muted/50">
                      <MoreHorizontal className="h-4 w-4" />
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
            {/* Analytics Modal */}
            <Dialog open={analyticsOpen} onOpenChange={setAnalyticsOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Tweet analytics</DialogTitle>
                  <DialogDescription>Coming soon. This is a placeholder analytics view.</DialogDescription>
                </DialogHeader>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Views</span>
                    <span className="font-medium">{formatCount(tweet.views_count) ?? "—"}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Likes</span>
                    <span className="font-medium">{formatCount(likeCount) ?? 0}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Retweets</span>
                    <span className="font-medium">{formatCount(retweetCount) ?? 0}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Replies</span>
                    <span className="font-medium">{formatCount(tweet.reply_count) ?? 0}</span>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <div className="sm:hidden mb-1">
              <Link href={`/${tweet.profiles.username}`} className="hover:underline">
                <span className="text-muted-foreground text-[13px]">@{tweet.profiles.username}</span>
              </Link>
            </div>

            <p className="text-card-foreground mb-2 whitespace-pre-wrap text-[15px] leading-6">
              {tweet.content}
            </p>

            <div className="pt-1 text-muted-foreground select-none">
              <div className="mx-auto w-full max-w-[525px] flex items-center justify-between">
                {/* Reply */}
                <button
                  className="group inline-flex items-center gap-1 rounded-full px-1.5 py-1 hover:bg-primary/10 hover:text-primary"
                  onClick={(e) => e.preventDefault()}
                >
                  <MessageCircle className="h-4 w-4" />
                  {tweet.reply_count > 0 && <span className="text-xs">{formatCount(tweet.reply_count)}</span>}
                </button>

                {/* Retweet */}
                <button
                  className={cn(
                    "group inline-flex items-center gap-1 rounded-full px-1.5 py-1 hover:bg-emerald-500/10 hover:text-emerald-500",
                    isRetweeted && "text-emerald-500",
                  )}
                  onClick={handleRetweet}
                  disabled={isLoading}
                >
                  <Repeat2 className="h-4 w-4" />
                  {retweetCount > 0 && <span className="text-xs">{formatCount(retweetCount)}</span>}
                </button>

                {/* Like */}
                <button
                  className={cn(
                    "group inline-flex items-center gap-1 rounded-full px-1.5 py-1 hover:bg-rose-500/10 hover:text-rose-500",
                    isLiked && "text-rose-500",
                  )}
                  onClick={handleLike}
                  disabled={isLoading}
                >
                  <Heart className={cn("h-4 w-4", isLiked && "fill-current")} />
                  {likeCount > 0 && <span className="text-xs">{formatCount(likeCount)}</span>}
                </button>

                {/* Views */}
                <button
                  className="group inline-flex items-center gap-1 rounded-full px-1.5 py-1 hover:bg-primary/10 hover:text-primary"
                  onClick={(e) => {
                    e.preventDefault()
                    setAnalyticsOpen(true)
                  }}
                  title="Views"
                >
                  <BarChart2 className="h-4 w-4" />
                  {typeof tweet.views_count === "number" && tweet.views_count > 0 && (
                    <span className="text-xs">{formatCount(tweet.views_count)}</span>
                  )}
                </button>

                {/* Bookmark + Share (grouped as one slot) */}
                <div className="inline-flex items-center gap-2">
                  <button
                    onClick={handleBookmark}
                    disabled={isLoading}
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full px-1.5 py-1 hover:bg-primary/10",
                      isBookmarked ? "text-primary" : "text-muted-foreground hover:text-primary",
                    )}
                    aria-pressed={isBookmarked}
                    aria-label={isBookmarked ? "Remove bookmark" : "Bookmark"}
                  >
                    <Bookmark className={cn("h-4 w-4", isBookmarked && "fill-current")} />
                  </button>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="inline-flex items-center gap-1 rounded-full px-1.5 py-1 hover:bg-primary/10 hover:text-primary">
                        <Share className="h-4 w-4" />
                      </button>
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
          </div>
        </div>
      </div>
    </div>
  )
}
