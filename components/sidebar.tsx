"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Home, Search, Bell, Mail, Bookmark, User, Settings, MoreHorizontal, Feather, LogOut, X } from "lucide-react"
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

  // Update profile navigation link
  const updatedNavigation = navigation.map((item) =>
    item.name === "Profile" && profile?.profile ? { ...item, href: `/${profile.profile.username}` } : item,
  )

  const handleNavClick = () => {
    if (isMobile && onClose) {
      onClose()
    }
  }

  return (
    <div
      className={cn(
        "flex h-screen flex-col bg-sidebar border-r border-sidebar-border",
        isMobile ? "w-64" : "w-16 sm:w-64",
      )}
    >
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
      <div
        className={cn("flex items-center border-b border-sidebar-border", isMobile ? "h-16 px-6" : "h-16 px-3 sm:px-6")}
      >
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
            <Feather className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className={cn("text-xl font-bold text-sidebar-foreground font-sans", !isMobile && "hidden sm:block")}>
            Twitter
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-2 sm:px-3 py-4">
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
                  isMobile ? "justify-start px-3 py-6" : "justify-center sm:justify-start px-2 sm:px-3 py-4 sm:py-6",
                )}
              >
                <div className="relative flex-shrink-0">
                  <item.icon className="h-6 w-6" />
                  {item.showBadge && item.name === "Notifications" && <NotificationBadge count={unreadCount} />}
                </div>
                <span className={cn(!isMobile && "hidden sm:block")}>{item.name}</span>
              </Button>
            </Link>
          )
        })}
      </nav>

      {/* Tweet Button */}
      <div className="p-2 sm:p-4">
        <Button
          className={cn(
            "bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-full",
            isMobile ? "w-full py-3" : "w-12 h-12 sm:w-full sm:py-3",
          )}
        >
          <span className={cn(!isMobile && "hidden sm:block")}>Tweet</span>
          <Feather className={cn("h-5 w-5", !isMobile && "sm:hidden")} />
        </Button>
      </div>

      {/* User Profile */}
      <div className="border-t border-sidebar-border p-2 sm:p-4">
        {profile?.profile ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div
                className={cn(
                  "flex items-center hover:bg-sidebar-accent rounded-lg p-2 transition-colors cursor-pointer",
                  isMobile ? "gap-3" : "gap-0 sm:gap-3 justify-center sm:justify-start",
                )}
              >
                <Avatar className="h-10 w-10 flex-shrink-0">
                  <AvatarImage src={profile.profile.avatar_url || "/placeholder.svg"} />
                  <AvatarFallback className="bg-muted text-muted-foreground">
                    {profile.profile.display_name?.charAt(0) || profile.profile.username?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className={cn("flex-1 min-w-0", !isMobile && "hidden sm:block")}>
                  <p className="text-sm font-medium text-sidebar-foreground truncate">{profile.profile.display_name}</p>
                  <p className="text-sm text-muted-foreground truncate">@{profile.profile.username}</p>
                </div>
                <MoreHorizontal
                  className={cn("h-5 w-5 text-muted-foreground flex-shrink-0", !isMobile && "hidden sm:block")}
                />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem asChild>
                <Link
                  href={`/${profile.profile.username}`}
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
