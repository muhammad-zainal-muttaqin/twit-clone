import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Heart, Repeat2, UserPlus, MessageCircle } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import Link from "next/link"

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

interface NotificationItemProps {
  notification: Notification
}

export function NotificationItem({ notification }: NotificationItemProps) {
  const getNotificationIcon = () => {
    switch (notification.type) {
      case "like":
        return <Heart className="h-8 w-8 text-red-500 fill-current" />
      case "retweet":
        return <Repeat2 className="h-8 w-8 text-accent" />
      case "follow":
        return <UserPlus className="h-8 w-8 text-primary" />
      case "reply":
        return <MessageCircle className="h-8 w-8 text-primary" />
      default:
        return <Heart className="h-8 w-8 text-muted-foreground" />
    }
  }

  const getNotificationText = () => {
    const userName = notification.from_user?.display_name || notification.from_user?.username || "Someone"

    switch (notification.type) {
      case "like":
        return `${userName} liked your tweet`
      case "retweet":
        return `${userName} retweeted your tweet`
      case "follow":
        return `${userName} followed you`
      case "reply":
        return `${userName} replied to your tweet`
      default:
        return "New notification"
    }
  }

  const timeAgo = formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })

  return (
    <div
      className={`p-4 border-b border-border hover:bg-card/50 transition-colors ${
        !notification.read ? "bg-primary/5" : ""
      }`}
    >
      <div className="flex gap-3">
        <div className="flex-shrink-0">{getNotificationIcon()}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-3">
            {notification.from_user && (
              <Link href={`/${notification.from_user.username}`}>
                <Avatar className="h-8 w-8">
                  <AvatarImage src={notification.from_user.avatar_url || "/placeholder.svg"} />
                  <AvatarFallback className="bg-muted text-muted-foreground text-sm">
                    {notification.from_user.display_name?.charAt(0) ||
                      notification.from_user.username?.charAt(0) ||
                      "U"}
                  </AvatarFallback>
                </Avatar>
              </Link>
            )}
            <div className="flex-1">
              <p className="text-card-foreground font-medium">{getNotificationText()}</p>
              <p className="text-sm text-muted-foreground">{timeAgo}</p>
              {notification.tweet && (
                <div className="mt-2 p-3 bg-muted/30 rounded-lg">
                  <p className="text-sm text-muted-foreground line-clamp-2">{notification.tweet.content}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
