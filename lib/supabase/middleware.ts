import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

// Check if Supabase environment variables are available
export const isSupabaseConfigured =
  typeof process.env.NEXT_PUBLIC_SUPABASE_URL === "string" &&
  process.env.NEXT_PUBLIC_SUPABASE_URL.length > 0 &&
  typeof process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY === "string" &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.length > 0

export async function updateSession(request: NextRequest) {
  // If Supabase is not configured, just continue without auth
  if (!isSupabaseConfigured) {
    return NextResponse.next({
      request,
    })
  }

  const supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
            supabaseResponse.cookies.set(name, value, options)
          })
        },
      },
    },
  )

  // Check if this is an auth callback
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")

  if (code) {
    // Exchange the code for a session
    await supabase.auth.exchangeCodeForSession(code)
    // Redirect to home page after successful auth
    return NextResponse.redirect(new URL("/", request.url))
  }

  console.log("[v0] Middleware checking route:", request.nextUrl.pathname)

  // Protected routes - redirect to login if not authenticated
  const isAuthRoute =
    request.nextUrl.pathname.startsWith("/auth/login") ||
    request.nextUrl.pathname.startsWith("/auth/sign-up") ||
    request.nextUrl.pathname === "/auth/callback"

  if (!isAuthRoute) {
    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser()

      console.log(
        "[v0] Middleware user check:",
        user ? "authenticated" : "not authenticated",
        error ? `error: ${error.message}` : "",
      )

      if (!user && (!error || error.message !== "Invalid Refresh Token: Refresh Token Not Found")) {
        console.log("[v0] Redirecting to login from:", request.nextUrl.pathname)
        const redirectUrl = new URL("/auth/login", request.url)
        return NextResponse.redirect(redirectUrl)
      }

      if (error && error.message === "Invalid Refresh Token: Refresh Token Not Found") {
        console.log("[v0] Refresh token error, but allowing request to continue")
        // Don't redirect immediately, let the app handle the session refresh
      }
    } catch (error) {
      console.log("[v0] Middleware auth error:", error)
      if (error instanceof Error && !error.message.includes("refresh_token_not_found")) {
        const redirectUrl = new URL("/auth/login", request.url)
        return NextResponse.redirect(redirectUrl)
      }
    }
  }

  return supabaseResponse
}
