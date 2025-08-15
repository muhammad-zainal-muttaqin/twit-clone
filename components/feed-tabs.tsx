"use client"
import { Button } from "@/components/ui/button"

interface FeedTabsProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

export function FeedTabs({ activeTab, onTabChange }: FeedTabsProps) {
  const tabs = [
    { id: "for-you", label: "For you" },
    { id: "following", label: "Following" },
  ]

  return (
    <div className="border-b border-border bg-background/80 backdrop-blur-md">
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
            onClick={() => onTabChange(tab.id)}
          >
            {tab.label}
          </Button>
        ))}
      </div>
    </div>
  )
}
