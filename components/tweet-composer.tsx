"use client"

import type React from "react"

import { useEffect, useMemo, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

import { ImageIcon, Smile, Calendar, MapPin, Loader2, Globe, X } from "lucide-react"
import { useRouter } from "next/navigation"

interface TweetComposerProps {
  user: {
    email?: string
    user_metadata?: {
      avatar_url?: string
      full_name?: string
    }
  }
  onTweetPosted?: () => void
  replyToUsername?: string | null
}

export function TweetComposer({ user, onTweetPosted, replyToUsername }: TweetComposerProps) {
  const [content, setContent] = useState("")
  const [isPosting, setIsPosting] = useState(false)
  const [files, setFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!content.trim() || isPosting) return

    setIsPosting(true)

    try {
      const response = await fetch("/api/tweets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: content.trim(),
        }),
      })

      if (response.ok) {
        setContent("")
        onTweetPosted?.()
        router.refresh()
      } else {
        const error = await response.json()
        console.error("Failed to post tweet:", error)
      }
    } catch (error) {
      console.error("Error posting tweet:", error)
    } finally {
      setIsPosting(false)
    }
  }

  const remainingChars = 280 - content.length
  const isOverLimit = remainingChars < 0
  const progress = useMemo(() => {
    const used = Math.min(280, Math.max(0, content.length))
    return used / 280
  }, [content.length])

  // Auto-grow textarea up to a max height
  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = "auto"
    const max = 200 // px
    el.style.height = Math.min(max, el.scrollHeight) + "px"
    el.style.overflowY = el.scrollHeight > max ? "auto" : "hidden"
  }, [content])

  // Manage preview URLs for attachments
  useEffect(() => {
    // Revoke old URLs
    return () => {
      previews.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [previews])

  const handlePickImages = () => fileInputRef.current?.click()

  const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = Array.from(e.target.files || [])
    if (f.length === 0) return
    const next = [...files, ...f].slice(0, 4) // limit to 4 like X
    setFiles(next)
    const urls = next.map((file) => URL.createObjectURL(file))
    setPreviews(urls)
  }

  const removeImageAt = (idx: number) => {
    const next = files.filter((_, i) => i !== idx)
    const nextUrls = previews.filter((_, i) => i !== idx)
    // Revoke removed one
    URL.revokeObjectURL(previews[idx])
    setFiles(next)
    setPreviews(nextUrls)
  }

  return (
    <div className="border-b border-l border-r border-border bg-card/50 hover:bg-card/70 transition-colors">
      <div className="p-4">
        <form onSubmit={handleSubmit}>
          <div className="flex gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user.user_metadata?.avatar_url || "/placeholder.svg"} />
              <AvatarFallback className="bg-primary text-primary-foreground">
                {user.email?.charAt(0).toUpperCase() || user.user_metadata?.full_name?.charAt(0).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              {/* Textarea */}
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onKeyDown={(e) => {
                  if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
                    if (!isOverLimit && content.trim() && !isPosting) {
                      handleSubmit(e as unknown as React.FormEvent)
                    }
                  }
                }}
                placeholder="What's happening?"
                ref={textareaRef}
                className="w-full bg-transparent text-[17px] leading-6 placeholder:text-muted-foreground/70 resize-none border-none outline-none min-h-[56px] pt-2"
                disabled={isPosting}
              />

              {/* Reply / Audience placeholders */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                <Button type="button" variant="ghost" size="sm" className="h-7 rounded-full px-2.5 text-muted-foreground hover:text-foreground hover:bg-foreground/10">
                  <Globe className="h-3.5 w-3.5 mr-1" /> Everyone
                </Button>
                {replyToUsername && (
                  <span className="truncate">Replying to <span className="text-primary">@{replyToUsername}</span></span>
                )}
              </div>

              {/* Attachments thumbnails */}
              {previews.length > 0 && (
                <div className="mt-3 grid grid-cols-2 gap-2 rounded-2xl overflow-hidden border border-border/60">
                  {previews.map((src, i) => (
                    <div key={i} className="relative group bg-muted/20">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={src} alt={`attachment-${i}`} className="w-full h-36 object-cover" />
                      <button
                        type="button"
                        onClick={() => removeImageAt(i)}
                        className="absolute top-2 right-2 inline-flex items-center justify-center h-7 w-7 rounded-full bg-background/80 hover:bg-background text-foreground shadow-sm"
                        aria-label="Remove image"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex justify-between items-center mt-3 pt-3 border-t border-border/60">
                <div className="flex gap-1.5 text-primary/80">
                  <Button
                    type="button"
                    onClick={handlePickImages}
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 rounded-full text-primary/70 hover:bg-primary/10 hover:text-primary"
                  >
                    <ImageIcon className="h-5 w-5" />
                  </Button>
                  <Button type="button" variant="ghost" size="icon" className="h-9 w-9 rounded-full text-primary/70 hover:bg-primary/10 hover:text-primary">
                    <Smile className="h-5 w-5" />
                  </Button>
                  <Button type="button" variant="ghost" size="icon" className="h-9 w-9 rounded-full text-primary/70 hover:bg-primary/10 hover:text-primary">
                    <Calendar className="h-5 w-5" />
                  </Button>
                  <Button type="button" variant="ghost" size="icon" className="h-9 w-9 rounded-full text-primary/70 hover:bg-primary/10 hover:text-primary">
                    <MapPin className="h-5 w-5" />
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleFilesSelected}
                  />
                </div>
                <div className="flex items-center gap-3">
                  {/* Progress ring + centered counter */}
                  {content.length > 0 && (
                    <div className="relative w-8 h-8 mr-1 shrink-0">
                      <svg viewBox="0 0 36 36" className="absolute inset-0 -rotate-90">
                        <circle cx="18" cy="18" r="15" className="stroke-muted-foreground/20" strokeWidth="3" fill="none" />
                        <circle
                          cx="18"
                          cy="18"
                          r="15"
                          className={isOverLimit ? "stroke-destructive" : remainingChars <= 20 ? "stroke-yellow-500" : "stroke-sky-500"}
                          strokeWidth="3"
                          fill="none"
                          strokeDasharray={Math.PI * 2 * 15}
                          strokeDashoffset={(1 - progress) * Math.PI * 2 * 15}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-content-center justify-center">
                        <span className={`text-[10px] ${isOverLimit ? "text-destructive" : remainingChars <= 20 ? "text-yellow-500" : "text-muted-foreground"}`}>
                          {remainingChars}
                        </span>
                      </div>
                    </div>
                  )}
                  {/* Post button */}
                  <Button
                    type="submit"
                    disabled={!content.trim() || isOverLimit || isPosting}
                    className="bg-sky-500 hover:bg-sky-500/90 text-white rounded-full px-4 py-1.5 disabled:opacity-60"
                  >
                    {isPosting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Posting...
                      </>
                    ) : (
                      "Post"
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
