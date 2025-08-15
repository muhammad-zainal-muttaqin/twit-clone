"use client"

import { useState, useEffect, useCallback } from "react"
import { apiCache } from "@/lib/api-cache"

interface UseApiCacheOptions {
  ttl?: number
  enabled?: boolean
}

export function useApiCache<T>(key: string, fetcher: () => Promise<T>, options: UseApiCacheOptions = {}) {
  const { ttl = 30000, enabled = true } = options
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const fetchData = useCallback(
    async (force = false) => {
      if (!enabled) return

      // Check cache first
      if (!force) {
        const cached = apiCache.get<T>(key)
        if (cached) {
          setData(cached)
          return cached
        }
      }

      setLoading(true)
      setError(null)

      try {
        const result = await fetcher()
        apiCache.set(key, result, ttl)
        setData(result)
        return result
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Unknown error")
        setError(error)
        throw error
      } finally {
        setLoading(false)
      }
    },
    [key, fetcher, ttl, enabled],
  )

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const invalidate = useCallback(() => {
    apiCache.delete(key)
    fetchData(true)
  }, [key, fetchData])

  return { data, loading, error, refetch: fetchData, invalidate }
}
