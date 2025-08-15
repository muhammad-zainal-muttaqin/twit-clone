"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { MainLayout } from "@/components/main-layout"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Search } from "lucide-react"
import { useRouter } from "next/navigation"
import { TweetCard } from "@/components/tweet-card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"

interface TrendingTopic {
  topic: string
  posts: string
  category: string
}

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

const whoToFollow = [
  { name: "Vercel", username: "vercel", verified: true, bio: "Develop. Preview. Ship." },
  { name: "Next.js", username: "nextjs", verified: true, bio: "The React Framework for Production" },
  { name: "Supabase", username: "supabase", verified: true, bio: "The open source Firebase alternative" },
  { name: "Tailwind CSS", username: "tailwindcss", verified: true, bio: "A utility-first CSS framework" },
]

export default function ExplorePage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("for-you")
  const [trendingTopics, setTrendingTopics] = useState<TrendingTopic[]>([])
  const [popularTweets, setPopularTweets] = useState<Tweet[]>([])
  const router = useRouter()

  const tabs = [
    { id: "for-you", label: "For you" },
    { id: "trending", label: "Trending" },
    { id: "news", label: "News" },
    { id: "sports", label: "Sports" },
    { id: "entertainment", label: "Entertainment" },
  ]

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const response = await fetch("/api/trending")
        if (response.ok) {
          const data = await response.json()
          setTrendingTopics(data.trends || [])
        }
      } catch (error) {
        console.error("Error fetching trending topics:", error)
      }
    }

    const fetchPopularTweets = async () => {
      try {
        const response = await fetch("/api/tweets?popular=true")
        if (response.ok) {
          const data = await response.json()
          setPopularTweets(data.tweets || [])
        }
      } catch (error) {
        console.error("Error fetching popular tweets:", error)
      }
    }

    fetchTrending()
    fetchPopularTweets()
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto">
        {/* Header with Search */}
        <div className="sticky top-0 bg-background/80 backdrop-blur-md border-b border-border p-4">
          <form onSubmit={handleSearch}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search Twitter"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-card border-border rounded-full"
              />
            </div>
          </form>
        </div>

        {/* Tabs */}
        <div className="border-b border-border">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => (
              <Button
                key={tab.id}
                variant="ghost"
                className={`flex-shrink-0 rounded-none border-b-2 px-4 py-4 font-medium ${
                  activeTab === tab.id
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="space-y-6 p-4">
          {/* Trending Topics */}
          {(activeTab === "for-you" || activeTab === "trending") && (
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-card-foreground">What's happening</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {trendingTopics.slice(0, 5).map((trend, index) => (
                  <div key={index} className="cursor-pointer hover:bg-muted/50 p-3 rounded transition-colors">
                    <p className="text-sm text-muted-foreground">Trending in {trend.category}</p>
                    <p className="font-semibold text-card-foreground">{trend.topic}</p>
                    <p className="text-sm text-muted-foreground">{trend.posts} Tweets</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Who to Follow */}
          {activeTab === "for-you" && (
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-card-foreground">Who to follow</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {whoToFollow.map((user, index) => (
                  <div key={index} className="flex items-start justify-between">
                    <Link href={`/${user.username}`} className="flex items-start gap-3 flex-1">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={`/abstract-geometric-shapes.png?height=48&width=48&query=${user.name}`} />
                        <AvatarFallback className="bg-muted text-muted-foreground">
                          {user.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-1">
                          <p className="font-semibold text-card-foreground">{user.name}</p>
                          {user.verified && (
                            <div className="h-4 w-4 rounded-full bg-primary flex items-center justify-center">
                              <span className="text-xs text-primary-foreground">✓</span>
                            </div>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">@{user.username}</p>
                        <p className="text-sm text-muted-foreground mt-1">{user.bio}</p>
                      </div>
                    </Link>
                    <Button
                      size="sm"
                      className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-4"
                    >
                      Follow
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Popular Tweets */}
          {activeTab === "for-you" && popularTweets.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-foreground mb-4">Popular tweets</h2>
              <div className="space-y-0 border border-border rounded-lg overflow-hidden">
                {popularTweets.slice(0, 3).map((tweet, index) => (
                  <div key={tweet.id} className={index > 0 ? "border-t border-border" : ""}>
                    <TweetCard tweet={tweet} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Category-specific content */}
          {activeTab !== "for-you" && activeTab !== "trending" && (
            <div className="text-center py-12">
              <h3 className="text-xl font-semibold text-foreground mb-2">
                {tabs.find((tab) => tab.id === activeTab)?.label} content
              </h3>
              <p className="text-muted-foreground">
                Discover the latest in {activeTab}. This section will be populated with relevant content.
              </p>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  )
}
