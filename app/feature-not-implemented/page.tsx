"use client"

import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Construction, Zap, List, Users, Crown, BadgeCheck, MoreHorizontal } from "lucide-react"
import Link from "next/link"

const featureIcons: Record<string, any> = {
  "Grok": Zap,
  "Lists": List,
  "Communities": Users,
  "Premium": Crown,
  "Verified Orgs": BadgeCheck,
  "More": MoreHorizontal,
}

export default function FeatureNotImplementedPage() {
  const searchParams = useSearchParams()
  const featureName = searchParams.get("feature") || "Feature"
  const IconComponent = featureIcons[featureName] || Construction

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-30 flex items-center gap-4 p-4 bg-background/80 backdrop-blur-md border-b border-border">
        <Link href="/">
          <Button variant="ghost" size="sm" className="p-2">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
            <IconComponent className="h-4 w-4" />
          </div>
          <span className="font-bold text-foreground">{featureName}</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto p-8">
        <div className="text-center space-y-6">
          {/* Icon */}
          <div className="flex justify-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-muted/20">
              <IconComponent className="h-12 w-12 text-muted-foreground" />
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-foreground">
              {featureName} is coming soon!
            </h1>
            <p className="text-lg text-muted-foreground">
              This feature is currently under development and will be available soon.
            </p>
          </div>

          {/* Description */}
          <div className="max-w-md mx-auto space-y-4 text-sm text-muted-foreground">
            {featureName === "Grok" && (
              <p>
                Grok is an AI-powered feature that will provide intelligent insights and assistance. 
                Stay tuned for updates!
              </p>
            )}
            {featureName === "Lists" && (
              <p>
                Create and manage lists to organize the people and topics you care about. 
                This feature will help you stay organized and focused.
              </p>
            )}
            {featureName === "Communities" && (
              <p>
                Join communities to connect with people who share your interests. 
                Build meaningful connections around topics you love.
              </p>
            )}
            {featureName === "Premium" && (
              <p>
                Unlock exclusive features and benefits with Premium. 
                Get early access to new features and enhanced functionality.
              </p>
            )}
            {featureName === "Verified Orgs" && (
              <p>
                Verified Organizations will have special badges and features to help 
                establish credibility and trust on the platform.
              </p>
            )}
            {featureName === "More" && (
              <p>
                Additional features and settings will be available here. 
                We're constantly working to improve your experience.
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-6">
                Go back to Home
              </Button>
            </Link>
            <Button variant="outline" className="rounded-full px-6">
              Get notified when available
            </Button>
          </div>

          {/* Progress Indicator */}
          <div className="pt-8">
            <div className="max-w-xs mx-auto space-y-2">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Development Progress</span>
                <span>25%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-primary h-2 rounded-full" style={{ width: "25%" }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
