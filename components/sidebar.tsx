"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Home, Search, Bell, Mail, Bookmark, User, Settings, MoreHorizontal, Feather, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { NotificationBadge } from "./notification-badge"
import { useRealtimeNotifications } from "@/hooks/use-realtime"
import { useApiCache } from "@/hooks/use-api-cache"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { signOut } from "@/lib/actions"

const navigation = [
  { name: "Home", href: "/", icon: Home },
  { name: "Explore", href: "/explore", icon: Search },
  { name: "Notifications", href: "/notifications", icon: Bell, showBadge: true },
  { name: "Messages", href: "/messages", icon: Mail },
  { name: "Bookmarks", href: "/bookmarks", icon: Bookmark },
  { name: "Profile", href: "/profile", icon: User },
  { name: "Settings", href: "/settings", icon: Settings },
]

interface Profile {
  id: string
  username: string
  display_name: string
  avatar_url?: string
}

export function Sidebar() {
  const pathname = usePathname()

  const { data: profile } = useApiCache<{ profile: Profile }>(
    "user-profile",
    async () => {
      const response = await fetch("/api/profile")
      if (!response.ok) throw new Error("Failed to fetch profile")
      return response.json()
    },
    { ttl: 60000 }, // Cache for 1 minute
  )

  const { unreadCount } = useRealtimeNotifications(profile?.profile?.id || "")

  // Update profile navigation link
  const updatedNavigation = navigation.map((item) =>
    item.name === "Profile" && profile?.profile ? { ...item, href: `/${profile.profile.username}` } : item,
  )

  return (
    <div className="flex h-screen w-64 flex-col bg-sidebar border-r border-sidebar-border">
      {/* Logo */}
      <div className="flex h-16 items-center px-6">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
            <Feather className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-sidebar-foreground font-sans">Twitter</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {updatedNavigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link key={item.name} href={item.href}>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-3 px-3 py-6 text-base font-medium relative",
                  "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  isActive && "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary",
                )}
              >
                <div className="relative">
                  <item.icon className="h-6 w-6" />
                  {item.showBadge && item.name === "Notifications" && <NotificationBadge count={unreadCount} />}
                </div>
                {item.name}
              </Button>
            </Link>
          )
        })}
      </nav>

      {/* Tweet Button */}
      <div className="p-4">
        <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 rounded-full">
          Tweet
        </Button>
      </div>

      {/* User Profile */}
      <div className="border-t border-sidebar-border p-4">
        {profile?.profile ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex items-center gap-3 hover:bg-sidebar-accent rounded-lg p-2 transition-colors cursor-pointer">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={profile.profile.avatar_url || "/placeholder.svg"} />
                  <AvatarFallback className="bg-muted text-muted-foreground">
                    {profile.profile.display_name?.charAt(0) || profile.profile.username?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-sidebar-foreground truncate">{profile.profile.display_name}</p>
                  <p className="text-sm text-muted-foreground truncate">@{profile.profile.username}</p>
                </div>
                <MoreHorizontal className="h-5 w-5 text-muted-foreground" />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem asChild>
                <Link href={`/${profile.profile.username}`} className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  View Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => signOut()}
                className="flex items-center gap-2 text-red-600 focus:text-red-600"
              >
                <LogOut className="h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
              <User className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">Loading...</p>
              <p className="text-sm text-muted-foreground truncate">@username</p>
            </div>
            <MoreHorizontal className="h-5 w-5 text-muted-foreground" />
          </div>
        )}
      </div>
    </div>
  )
}
