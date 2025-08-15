"use server"

import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

async function createAuthServerClient() {
  const cookieStore = await cookies()

  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        } catch {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
    },
  })
}

export async function signIn(prevState: any, formData: FormData) {
  // Check if formData is valid
  if (!formData) {
    return { error: "Form data is missing" }
  }

  const email = formData.get("email")
  const password = formData.get("password")

  // Validate required fields
  if (!email || !password) {
    return { error: "Email and password are required" }
  }

  const supabase = await createAuthServerClient()

  try {
    console.log("[v0] Starting login process for:", email)

    const { error } = await supabase.auth.signInWithPassword({
      email: email.toString(),
      password: password.toString(),
    })

    if (error) {
      console.log("[v0] Login error details:", {
        message: error.message,
        status: error.status,
        code: error.code,
      })

      if (error.message === "Invalid login credentials") {
        return {
          error:
            "Invalid email or password. If you just signed up, please check your email and confirm your account first.",
        }
      }

      return { error: error.message }
    }

    console.log("[v0] Login successful")
  } catch (error) {
    console.error("Login error:", error)
    return { error: "An unexpected error occurred. Please try again." }
  }

  redirect("/")
}

export async function signUp(prevState: any, formData: FormData) {
  // Check if formData is valid
  if (!formData) {
    return { error: "Form data is missing" }
  }

  const email = formData.get("email")
  const password = formData.get("password")

  // Validate required fields
  if (!email || !password) {
    return { error: "Email and password are required" }
  }

  const supabase = await createAuthServerClient()

  try {
    console.log("[v0] Starting signup process for:", email)

    const { data, error } = await supabase.auth.signUp({
      email: email.toString(),
      password: password.toString(),
      options: {
        emailRedirectTo:
          process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
      },
    })

    if (error) {
      console.log("[v0] Supabase signup error details:", {
        message: error.message,
        status: error.status,
        code: error.code,
        details: error.details,
        hint: error.hint,
      })
      return { error: error.message }
    }

    console.log("[v0] Supabase signup response:", { data, error })

    if (data.user) {
      console.log("[v0] User created successfully:", data.user.id)
      return { success: "Check your email to confirm your account before signing in." }
    }

    return { error: "Failed to create user account" }
  } catch (error) {
    console.error("[v0] Unexpected signup error:", error)
    return { error: "An unexpected error occurred. Please try again." }
  }
}

export async function signOut() {
  const supabase = await createAuthServerClient()

  await supabase.auth.signOut()
  redirect("/auth/login")
}
