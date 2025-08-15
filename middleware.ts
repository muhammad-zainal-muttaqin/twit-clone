import { updateSession } from "@/lib/supabase/middleware"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  const reservedRoutes = [
    "messages",
    "api",
    "auth",
    "explore",
    "notifications",
    "bookmarks",
    "settings",
    "search",
    "home",
  ]

  const pathname = request.nextUrl.pathname
  const pathSegment = pathname.split("/")[1] // Get first path segment

  // If this is a reserved route, let it pass through to static routes
  if (reservedRoutes.includes(pathSegment)) {
    console.log(`[v0] Reserved route detected: ${pathname}, allowing static route handling`)
    return await updateSession(request)
  }

  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - Reserved static routes (messages, explore, notifications, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|messages|api|auth|explore|notifications|bookmarks|settings|search|home|.*.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
