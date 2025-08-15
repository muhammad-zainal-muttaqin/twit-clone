"use client"

import { useEffect, useState, useCallback } from "react" // Added useCallback import
import { createClient } from "@/lib/supabase/client"

export function useRealtimeNotifications(userId: string) {
  const [unreadCount, setUnreadCount] = useState(0)
  const supabase = createClient()

  useEffect(() => {
    // Fetch initial count
    const fetchCount = async () => {
      try {
        const response = await fetch("/api/notifications/count")
        if (response.ok) {
          const data = await response.json()
          setUnreadCount(data.count)
        }
      } catch (error) {
        console.error("Error fetching notification count:", error)
      }
    }

    fetchCount()

    // Subscribe to real-time notifications
    const channel = supabase
      .channel("notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        () => {
          setUnreadCount((prev) => prev + 1)
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          // If notification was marked as read, decrease count
          if (payload.new.read && !payload.old.read) {
            setUnreadCount((prev) => Math.max(0, prev - 1))
          }
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId, supabase])

  return { unreadCount, setUnreadCount }
}

export function useRealtimeTweets() {
  const [newTweetCount, setNewTweetCount] = useState(0)
  const supabase = createClient()

  useEffect(() => {
    // Subscribe to new tweets
    const channel = supabase
      .channel("tweets")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "tweets",
        },
        () => {
          setNewTweetCount((prev) => prev + 1)
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  const resetNewTweetCount = useCallback(() => setNewTweetCount(0), [])

  return { newTweetCount, resetNewTweetCount }
}
