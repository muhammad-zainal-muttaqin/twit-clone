"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { useRouter } from "next/navigation"
import { useApiCache } from "@/hooks/use-api-cache"

interface TrendingTopic {
  topic: string
  posts: string
  category: string
}

const whoToFollow = [
  { name: "Vercel", username: "@vercel", verified: true },
  { name: "Next.js", username: "@nextjs", verified: true },
  { name: "Supabase", username: "@supabase", verified: true },
]

export function TrendingSidebar() {
  const [searchQuery, setSearchQuery] = useState("")
  const router = useRouter()

  const { data: trendingData } = useApiCache<{ trends: TrendingTopic[] }>(
    "trending-topics",
    async () => {
      const response = await fetch("/api/trending")
      if (!response.ok) throw new Error("Failed to fetch trending")
      return response.json()
    },
    { ttl: 300000 }, // Cache for 5 minutes since trending topics change slowly
  )

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  return (
    <div className="w-80 space-y-4 p-4 h-screen overflow-y-auto">
      {/* Search */}
      <div className="sticky top-0 bg-background pb-4">
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

      {/* Trending */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-card-foreground">What's happening</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {(trendingData?.trends || []).map((trend, index) => (
            <div key={index} className="cursor-pointer hover:bg-muted/50 p-2 rounded transition-colors">
              <p className="text-sm text-muted-foreground">Trending in {trend.category}</p>
              <p className="font-semibold text-card-foreground">{trend.topic}</p>
              <p className="text-sm text-muted-foreground">{trend.posts} Tweets</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Who to follow */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-card-foreground">Who to follow</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {whoToFollow.map((user, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-medium text-muted-foreground">{user.name.charAt(0)}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1">
                    <p className="font-semibold text-card-foreground truncate">{user.name}</p>
                    {user.verified && (
                      <div className="h-4 w-4 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                        <span className="text-xs text-primary-foreground">✓</span>
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground truncate">{user.username}</p>
                </div>
              </div>
              <Button
                size="sm"
                className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-4 flex-shrink-0 ml-2"
              >
                Follow
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
