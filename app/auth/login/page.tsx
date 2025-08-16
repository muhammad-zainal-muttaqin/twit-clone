import { createClient, isSupabaseConfigured } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import LoginForm from "@/components/login-form"

interface LoginPageProps {
  searchParams: { [key: string]: string | string[] | undefined }
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  // If Supabase is not configured, show setup message directly
  if (!isSupabaseConfigured) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <h1 className="text-2xl font-bold mb-4 text-foreground">Connect Supabase to get started</h1>
      </div>
    )
  }

  // Check if user is already logged in
  const supabase = await createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // If user is logged in, redirect to home page
  if (session) {
    redirect("/")
  }

  const message = searchParams.message as string
  const error = searchParams.error as string

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-4">
        {message === "email_confirmed" && (
          <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-md">
            Email confirmed successfully! You can now log in.
          </div>
        )}
        {message === "account_deleted" && (
          <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-md">
            Your account has been deleted successfully.
          </div>
        )}

        {error === "callback_error" && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md">
            Authentication failed. Please try logging in again.
          </div>
        )}
        {error === "email_confirmation_failed" && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md">
            Email confirmation failed. Please check your email and try again.
          </div>
        )}

        <LoginForm />
      </div>
    </div>
  )
}
