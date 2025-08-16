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
    { id: "ai", label: "AI" },
    { id: "rumors", label: "Rumors & Insights" },
    { id: "build", label: "Build in Public" },
  ]

  return (
    <div className="border-b border-border bg-background/95 backdrop-blur-md sticky top-0 z-20">
      <div className="max-w-[525px] mr-auto">
        <div className="flex overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => (
            <Button
              key={tab.id}
              variant="ghost"
              className={`rounded-none border-b-2 py-4 font-medium px-4 whitespace-nowrap ${
                activeTab === tab.id
                  ? "border-primary text-primary font-semibold"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/20"
              }`}
              onClick={() => onTabChange(tab.id)}
            >
              {tab.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}
