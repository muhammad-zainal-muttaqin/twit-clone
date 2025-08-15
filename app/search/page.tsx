"use client"

import { useState } from "react"
import { useSearchParams } from "next/navigation"
import { MainLayout } from "@/components/main-layout"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, ArrowLeft } from "lucide-react"
import { SearchResults } from "@/components/search-results"
import Link from "next/link"

export default function SearchPage() {
  const searchParams = useSearchParams()
  const initialQuery = searchParams.get("q") || ""

  const [query, setQuery] = useState(initialQuery)
  const [activeTab, setActiveTab] = useState("all")

  const tabs = [
    { id: "all", label: "All" },
    { id: "tweets", label: "Tweets" },
    { id: "users", label: "People" },
  ]

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
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search Twitter"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-10 bg-card border-border"
                autoFocus
              />
            </div>
          </div>
        </div>

        {/* Search Tabs */}
        <div className="border-b border-border">
          <div className="flex">
            {tabs.map((tab) => (
              <Button
                key={tab.id}
                variant="ghost"
                className={`flex-1 rounded-none border-b-2 py-4 font-medium ${
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

        {/* Search Results */}
        <SearchResults query={query} activeTab={activeTab} />
      </div>
    </MainLayout>
  )
}
