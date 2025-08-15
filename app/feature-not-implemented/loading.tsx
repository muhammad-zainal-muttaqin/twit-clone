import { ArrowLeft, Construction } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

export default function FeatureNotImplementedLoading() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-30 flex items-center gap-4 p-4 bg-background/80 backdrop-blur-md border-b border-border">
        <Button variant="ghost" size="sm" className="p-2" disabled>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
            <Construction className="h-4 w-4" />
          </div>
          <Skeleton className="h-6 w-24" />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto p-8">
        <div className="text-center space-y-6">
          {/* Icon */}
          <div className="flex justify-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-muted/20">
              <Construction className="h-12 w-12 text-muted-foreground" />
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Skeleton className="h-9 w-64 mx-auto" />
            <Skeleton className="h-6 w-80 mx-auto" />
          </div>

          {/* Description */}
          <div className="max-w-md mx-auto space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4 mx-auto" />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Skeleton className="h-10 w-40" />
            <Skeleton className="h-10 w-48" />
          </div>

          {/* Progress Indicator */}
          <div className="pt-8">
            <div className="max-w-xs mx-auto space-y-2">
              <div className="flex justify-between">
                <Skeleton className="h-3 w-32" />
                <Skeleton className="h-3 w-8" />
              </div>
              <Skeleton className="w-full h-2 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
