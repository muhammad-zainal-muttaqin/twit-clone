"use server"

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

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

  const supabase = await createClient()

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

  const supabase = await createClient()

  try {
    console.log("[v0] Starting signup process for:", email)

    const { data, error } = await supabase.auth.signUp({
      email: email.toString(),
      password: password.toString(),
      options: {
        emailRedirectTo:
          process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ||
          `${process.env.NEXT_PUBLIC_SITE_URL || "https://v0-twitter-clone-gold.vercel.app"}/auth/callback`,
      },
    })

    console.log("[v0] Supabase signup response:", { data, error })

    if (error) {
      console.log("[v0] Supabase signup error details:", {
        message: error.message,
        status: error.status,
        code: error.code,
        details: error.details,
        hint: error.hint,
      })
      return { error: `Signup failed: ${error.message}` }
    }

    console.log("[v0] Signup successful, user created:", data.user?.id)
    return { success: "Check your email to confirm your account." }
  } catch (error) {
    console.error("[v0] Unexpected signup error:", error)
    return { error: "An unexpected error occurred. Please try again." }
  }
}

export async function signOut() {
  const supabase = await createClient()

  await supabase.auth.signOut()
  redirect("/auth/login")
}
