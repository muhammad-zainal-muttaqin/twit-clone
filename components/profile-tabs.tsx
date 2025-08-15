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

  return (
    <div>
      {/* Tab Navigation */}
      <div className="border-b border-border">
        <div className="flex">
          {tabs.map((tab) => (
            <Button
              key={tab.id}
              variant="ghost"
              className={`flex-1 rounded-none border-b-2 py-4 ${
                activeTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="font-medium">{tab.label}</span>
              {tab.count > 0 && <span className="ml-1 text-sm">({tab.count})</span>}
            </Button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === "tweets" && (
          <div>
            {tweets.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-muted-foreground">
                  {profile.isCurrentUser ? "You haven't tweeted yet." : `@${profile.username} hasn't tweeted yet.`}
                </p>
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
