"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
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

interface Profile {
  id: string
  username: string
  display_name: string
  isCurrentUser?: boolean
}

interface ProfileTabsProps {
  profile: Profile
  tweets: Tweet[]
}

export function ProfileTabs({ profile, tweets }: ProfileTabsProps) {
  const [activeTab, setActiveTab] = useState("tweets")

  const tabs = [
    { id: "tweets", label: "Tweets", count: tweets.length },
    { id: "replies", label: "Tweets & replies", count: 0 },
    { id: "media", label: "Media", count: 0 },
    { id: "likes", label: "Likes", count: 0 },
  ]

  const activeIndex = tabs.findIndex((t) => t.id === activeTab)

  return (
    <div>
      {/* Tab Navigation */}
      <div className="border-b border-border">
        <div className="relative">
          <div className="flex">
            {tabs.map((tab) => (
              <Button
                key={tab.id}
                variant="ghost"
                className={`flex-1 rounded-none py-4 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                onClick={() => setActiveTab(tab.id)}
                aria-pressed={activeTab === tab.id}
              >
                <span>{tab.label}</span>
                {tab.count > 0 && <span className="ml-1 text-xs text-muted-foreground">{tab.count}</span>}
              </Button>
            ))}
          </div>
          {/* Active indicator */}
          <span
            className="pointer-events-none absolute bottom-0 left-0 h-0.5 bg-primary transition-transform duration-300"
            style={{ width: `${100 / tabs.length}%`, transform: `translateX(${activeIndex * 100}%)` }}
          />
        </div>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === "tweets" && (
          <div>
            {tweets.length === 0 ? (
              <div className="p-10 text-center">
                <p className="text-muted-foreground">
                  {profile.isCurrentUser ? "You haven't tweeted yet." : `@${profile.username} hasn't tweeted yet.`}
                </p>
                {profile.isCurrentUser && (
                  <div className="mt-4">
                    <Button className="rounded-full">Compose your first post</Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="divide-y divide-border">
                {tweets.map((tweet) => (
                  <TweetCard key={tweet.id} tweet={tweet} />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "replies" && (
          <div className="p-8 text-center">
            <p className="text-muted-foreground">Replies feature coming soon!</p>
          </div>
        )}

        {activeTab === "media" && (
          <div className="p-8 text-center">
            <p className="text-muted-foreground">Media feature coming soon!</p>
          </div>
        )}

        {activeTab === "likes" && (
          <div className="p-8 text-center">
            <p className="text-muted-foreground">Likes feature coming soon!</p>
          </div>
        )}
      </div>
    </div>
  )
}
