"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Home, Search, Bell, Mail, Bookmark, User, Settings, MoreHorizontal, LogOut, X, Zap, List, Users, Crown, BadgeCheck } from "lucide-react"
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
  { name: "Home", href: "/", icon: Home, implemented: true },
  { name: "Explore", href: "/explore", icon: Search, implemented: true },
  { name: "Notifications", href: "/notifications", icon: Bell, showBadge: true, implemented: true },
  { name: "Messages", href: "/messages", icon: Mail, implemented: true },
  { name: "Grok", href: "/grok", icon: Zap, implemented: false },
  { name: "Lists", href: "/lists", icon: List, implemented: false },
  { name: "Bookmarks", href: "/bookmarks", icon: Bookmark, implemented: true },
  { name: "Communities", href: "/communities", icon: Users, implemented: false },
  { name: "Premium", href: "/premium", icon: Crown, implemented: false },
  { name: "Verified Orgs", href: "/verified-orgs", icon: BadgeCheck, implemented: false },
  { name: "Profile", href: "/profile", icon: User, implemented: true },
  { name: "More", href: "/more", icon: MoreHorizontal, implemented: false },
]

interface Profile {
  id: string
  username: string
  display_name: string
  avatar_url?: string
}

interface SidebarProps {
  isMobile?: boolean
  onClose?: () => void
}

export function Sidebar({ isMobile, onClose }: SidebarProps) {
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

  const updatedNavigation = navigation.map((item) => {
    if (item.name === "Profile" && profile?.profile && item.implemented) {
      // Use username if it exists and is valid, otherwise use user ID
      const profilePath =
        profile.profile.username && profile.profile.username.length > 0 ? `/${profile.profile.username}` : `/profile`
      return { ...item, href: profilePath }
    }
    if (!item.implemented) {
      return { ...item, href: `/feature-not-implemented?feature=${encodeURIComponent(item.name)}` }
    }
    return item
  })

  const handleNavClick = () => {
    if (isMobile && onClose) {
      onClose()
    }
  }

  return (
    <div className={cn("flex h-screen flex-col bg-sidebar border-r border-sidebar-border overflow-y-auto scrollbar-hide", isMobile ? "w-72" : "w-20 xl:w-[275px]")}>
      {/* Mobile Close Button */}
      {isMobile && (
        <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
          <span className="text-lg font-semibold text-sidebar-foreground">Menu</span>
          <Button variant="ghost" size="sm" onClick={onClose} className="p-2">
            <X className="h-5 w-5" />
          </Button>
        </div>
      )}

      {/* Logo */}
      <div className={cn("flex items-center border-b border-sidebar-border", isMobile ? "h-16 px-6" : "h-16 px-3 xl:px-6")}>
        <div className="flex items-center justify-center">
          <div className="flex h-9 w-9 items-center justify-center rounded-full">
            <span className="text-2xl leading-none">𝕏</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-2 xl:px-3 py-4">
        {updatedNavigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link key={item.name} href={item.href} onClick={handleNavClick}>
              <Button
                variant="ghost"
                className={cn(
                  "w-full gap-3 text-base font-medium relative",
                  "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  isActive && "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary",
                  !item.implemented && "opacity-60",
                  isMobile
                    ? "justify-start px-3 py-4"
                    : "justify-center xl:justify-start px-2 xl:px-3 py-3 xl:py-3.5",
                )}
              >
                <div className="relative flex-shrink-0">
                  <item.icon className="h-6 w-6" />
                  {item.showBadge && item.name === "Notifications" && <NotificationBadge count={unreadCount} />}
                  {!item.implemented && (
                    <div className="absolute -top-1 -right-1 h-2 w-2 bg-muted-foreground rounded-full"></div>
                  )}
                </div>
                <span className={cn(!isMobile && "hidden xl:block")}> 
                  {item.name}
                  {!item.implemented && (
                    <span className="ml-2 text-xs text-muted-foreground">(Coming Soon)</span>
                  )}
                </span>
              </Button>
            </Link>
          )
        })}
      </nav>

      {/* Post Button */}
      <div className="p-3 xl:p-4">
        <Button
          className={cn(
            "bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-full",
            isMobile ? "w-full py-3.5" : "w-12 h-12 xl:w-full xl:py-3.5",
          )}
        >
          <span className={cn(!isMobile && "hidden xl:block")}>Post</span>
          <span className={cn("text-base", !isMobile && "xl:hidden")}>𝕏</span>
        </Button>
      </div>

      {/* User Profile */}
      <div className="border-t border-sidebar-border p-2 xl:p-4">
        {profile?.profile ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div
                className={cn(
                  "flex items-center hover:bg-sidebar-accent rounded-lg p-2 transition-colors cursor-pointer",
                  isMobile ? "gap-3" : "gap-0 xl:gap-3 justify-center xl:justify-start",
                )}
              >
                <Avatar className="h-10 w-10 flex-shrink-0">
                  <AvatarImage src={profile.profile.avatar_url || "/placeholder.svg"} />
                  <AvatarFallback className="bg-muted text-muted-foreground">
                    {profile.profile.display_name?.charAt(0) || profile.profile.username?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className={cn("flex-1 min-w-0", !isMobile && "hidden xl:block")}>
                  <p className="text-sm font-medium text-sidebar-foreground truncate">{profile.profile.display_name}</p>
                  <p className="text-sm text-muted-foreground truncate">@{profile.profile.username}</p>
                </div>
                <MoreHorizontal className={cn("h-5 w-5 text-muted-foreground flex-shrink-0", !isMobile && "hidden xl:block")} />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem asChild>
                <Link
                  href={
                    profile.profile.username && profile.profile.username.length > 0
                      ? `/${profile.profile.username}`
                      : `/profile`
                  }
                  className="flex items-center gap-2"
                  onClick={handleNavClick}
                >
                  <User className="h-4 w-4" />
                  View Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings" className="flex items-center gap-2" onClick={handleNavClick}>
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
          <div
            className={cn("flex items-center", isMobile ? "gap-3" : "gap-0 sm:gap-3 justify-center sm:justify-start")}
          >
            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
              <User className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className={cn("flex-1 min-w-0", !isMobile && "hidden sm:block")}>
              <p className="text-sm font-medium text-sidebar-foreground truncate">Loading...</p>
              <p className="text-sm text-muted-foreground truncate">@username</p>
            </div>
            <MoreHorizontal
              className={cn("h-5 w-5 text-muted-foreground flex-shrink-0", !isMobile && "hidden sm:block")}
            />
          </div>
        )}
      </div>
    </div>
  )
}
