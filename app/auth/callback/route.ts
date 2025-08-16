import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const type = requestUrl.searchParams.get("type")

  if (code) {
    const supabase = createClient()

    try {
      const { error } = await supabase.auth.exchangeCodeForSession(code)

      if (error) {
        console.error("[v0] Auth callback error:", error)
        const errorMessage = error.message.includes("email") ? "email_confirmation_failed" : "callback_error"
        return NextResponse.redirect(new URL(`/auth/login?error=${errorMessage}`, requestUrl.origin))
      }

      console.log("[v0] Auth callback successful, redirecting to home")
      if (type === "signup") {
        return NextResponse.redirect(new URL("/?message=email_confirmed", requestUrl.origin))
      }
      return NextResponse.redirect(new URL("/", requestUrl.origin))
    } catch (error) {
      console.error("[v0] Auth callback exception:", error)
      return NextResponse.redirect(new URL("/auth/login?error=callback_error", requestUrl.origin))
    }
  }

  // If no code parameter, redirect to login
  console.log("[v0] No auth code found in callback, redirecting to login")
  return NextResponse.redirect(new URL("/auth/login", requestUrl.origin))
}
