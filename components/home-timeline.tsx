"use client"

import { useState } from "react"
import { TweetComposer } from "./tweet-composer"
import { FeedTabs } from "./feed-tabs"
import { EnhancedTimeline } from "./enhanced-timeline"

interface HomeTimelineProps {
  user: {
    email?: string
    user_metadata?: {
      avatar_url?: string
      full_name?: string
    }
  }
}

export function HomeTimeline({ user }: HomeTimelineProps) {
  const [activeTab, setActiveTab] = useState("for-you")

  return (
    <>
      {/* Feed Tabs */}
      <FeedTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Tweet Composer */}
      <TweetComposer user={user} />

      {/* Enhanced Timeline */}
      <EnhancedTimeline feedType={activeTab} />
    </>
  )
}
