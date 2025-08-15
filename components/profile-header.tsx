"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Calendar, MapPin, LinkIcon, Loader2 } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { useRouter } from "next/navigation"

interface Profile {
  id: string
  username: string
  display_name: string
  bio?: string
  avatar_url?: string
  banner_url?: string
  location?: string
  website?: string
  verified: boolean
  follower_count: number
  following_count: number
  tweet_count: number
  created_at: string
  isFollowing?: boolean
  isCurrentUser?: boolean
}

interface ProfileHeaderProps {
  profile: Profile
}

export function ProfileHeader({ profile }: ProfileHeaderProps) {
  const [isFollowing, setIsFollowing] = useState(profile.isFollowing || false)
  const [followerCount, setFollowerCount] = useState(profile.follower_count)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleFollowToggle = async () => {
    if (isLoading) return

    setIsLoading(true)
    const previousFollowing = isFollowing
    const previousCount = followerCount

    // Optimistic update
    setIsFollowing(!isFollowing)
    setFollowerCount(isFollowing ? followerCount - 1 : followerCount + 1)

    try {
      const response = await fetch(`/api/users/${profile.username}/follow`, {
        method: "POST",
      })

      if (!response.ok) {
        // Revert on error
        setIsFollowing(previousFollowing)
        setFollowerCount(previousCount)
      } else {
        router.refresh()
      }
    } catch (error) {
      // Revert on error
      setIsFollowing(previousFollowing)
      setFollowerCount(previousCount)
      console.error("Error following/unfollowing user:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const joinedDate = formatDistanceToNow(new Date(profile.created_at), { addSuffix: true })

  return (
    <div className="bg-card border-b border-border">
      {/* Banner */}
      <div className="h-48 bg-gradient-to-r from-primary/20 to-accent/20 relative">
        {profile.banner_url && (
          <img
            src={profile.banner_url || "/placeholder.svg"}
            alt="Profile banner"
            className="w-full h-full object-cover"
          />
        )}
      </div>

      {/* Profile Info */}
      <div className="px-4 pb-4">
        <div className="flex justify-between items-start -mt-16 mb-4">
          <Avatar className="h-32 w-32 border-4 border-card">
            <AvatarImage src={profile.avatar_url || "/placeholder.svg"} />
            <AvatarFallback className="bg-muted text-muted-foreground text-2xl">
              {profile.display_name?.charAt(0) || profile.username?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>

          <div className="mt-16">
            {profile.isCurrentUser ? (
              <Button variant="outline" className="rounded-full px-6 bg-transparent">
                Edit profile
              </Button>
            ) : (
              <Button
                onClick={handleFollowToggle}
                disabled={isLoading}
                className={`rounded-full px-6 ${
                  isFollowing
                    ? "bg-transparent border border-border text-foreground hover:bg-destructive hover:text-destructive-foreground hover:border-destructive"
                    : "bg-primary hover:bg-primary/90 text-primary-foreground"
                }`}
                variant={isFollowing ? "outline" : "default"}
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : isFollowing ? "Unfollow" : "Follow"}
              </Button>
            )}
          </div>
        </div>

        {/* User Info */}
        <div className="space-y-3">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-card-foreground">{profile.display_name}</h1>
              {profile.verified && (
                <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                  <span className="text-xs text-primary-foreground">✓</span>
                </div>
              )}
            </div>
            <p className="text-muted-foreground">@{profile.username}</p>
          </div>

          {profile.bio && <p className="text-card-foreground font-serif">{profile.bio}</p>}

          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            {profile.location && (
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span>{profile.location}</span>
              </div>
            )}
            {profile.website && (
              <div className="flex items-center gap-1">
                <LinkIcon className="h-4 w-4" />
                <a
                  href={profile.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  {profile.website.replace(/^https?:\/\//, "")}
                </a>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>Joined {joinedDate}</span>
            </div>
          </div>

          <div className="flex gap-6 text-sm">
            <div>
              <span className="font-semibold text-card-foreground">{profile.following_count}</span>
              <span className="text-muted-foreground ml-1">Following</span>
            </div>
            <div>
              <span className="font-semibold text-card-foreground">{followerCount}</span>
              <span className="text-muted-foreground ml-1">Followers</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
