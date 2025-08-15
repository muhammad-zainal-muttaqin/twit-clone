"use client"

import { useEffect, useState } from "react"
import { NotificationItem } from "./notification-item"
import { Button } from "@/components/ui/button"
import { Loader2, CheckCheck } from "lucide-react"

interface Notification {
  id: string
  type: string
  read: boolean
  created_at: string
  from_user?: {
    id: string
    username: string
    display_name: string
    avatar_url?: string
    verified: boolean
  }
  tweet?: {
    id: string
    content: string
  }
}

export function NotificationsTimeline() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [isMarkingRead, setIsMarkingRead] = useState(false)
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)

  const fetchNotifications = async (cursor?: string) => {
    try {
      if (cursor) {
        setIsLoadingMore(true)
      } else {
        setIsLoading(true)
      }

      const params = new URLSearchParams({
        limit: "20",
      })

      if (cursor) {
        params.append("cursor", cursor)
      }

      const response = await fetch(`/api/notifications?${params}`)
      if (response.ok) {
        const data = await response.json()

        if (cursor) {
          setNotifications((prev) => [...prev, ...(data.notifications || [])])
        } else {
          setNotifications(data.notifications || [])
        }

        setNextCursor(data.nextCursor)
        setHasMore(data.hasMore)
      }
    } catch (error) {
      console.error("Error fetching notifications:", error)
    } finally {
      setIsLoading(false)
      setIsLoadingMore(false)
    }
  }

  const markAllAsRead = async () => {
    setIsMarkingRead(true)
    try {
      const response = await fetch("/api/notifications", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "mark_all_read" }),
      })

      if (response.ok) {
        setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })))
      }
    } catch (error) {
      console.error("Error marking notifications as read:", error)
    } finally {
      setIsMarkingRead(false)
    }
  }

  const handleLoadMore = () => {
    if (nextCursor && hasMore && !isLoadingMore) {
      fetchNotifications(nextCursor)
    }
  }

  useEffect(() => {
    fetchNotifications()
  }, []) // Added empty dependency array to prevent infinite calls

  if (isLoading) {
    return (
      <div className="divide-y divide-border">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="p-4 animate-pulse">
            <div className="flex gap-3">
              <div className="h-8 w-8 rounded-full bg-muted"></div>
              <div className="h-8 w-8 rounded-full bg-muted"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <div>
      {/* Mark all as read button */}
      {unreadCount > 0 && (
        <div className="border-b border-border p-4">
          <Button
            onClick={markAllAsRead}
            disabled={isMarkingRead}
            variant="outline"
            size="sm"
            className="bg-transparent"
          >
            {isMarkingRead ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Marking as read...
              </>
            ) : (
              <>
                <CheckCheck className="h-4 w-4 mr-2" />
                Mark all as read ({unreadCount})
              </>
            )}
          </Button>
        </div>
      )}

      {/* Notifications */}
      {notifications.length === 0 ? (
        <div className="p-8 text-center">
          <p className="text-muted-foreground">No notifications yet.</p>
        </div>
      ) : (
        <div>
          {notifications.map((notification) => (
            <NotificationItem key={notification.id} notification={notification} />
          ))}
        </div>
      )}

      {/* Load more */}
      {hasMore && notifications.length > 0 && (
        <div className="p-4 border-t border-border">
          <Button
            onClick={handleLoadMore}
            disabled={isLoadingMore}
            variant="outline"
            className="w-full rounded-full bg-transparent"
          >
            {isLoadingMore ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Loading more...
              </>
            ) : (
              "Load more notifications"
            )}
          </Button>
        </div>
      )}
    </div>
  )
}
