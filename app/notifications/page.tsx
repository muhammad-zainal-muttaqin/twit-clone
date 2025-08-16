import { createClient, isSupabaseConfigured } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { MainLayout } from "@/components/main-layout"
import { NotificationsTimeline } from "@/components/notifications-timeline"

export default async function NotificationsPage() {
  // If Supabase is not configured, show setup message
  if (!isSupabaseConfigured) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <h1 className="text-2xl font-bold mb-4 text-foreground">Connect Supabase to get started</h1>
      </div>
    )
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // If no user, redirect to login
  if (!user) {
    redirect("/auth/login")
  }

  return (
    <MainLayout>
      <div className="max-w-[525px] mx-auto">
        {/* Header */}
        <div className="sticky top-0 bg-background/80 backdrop-blur-md border-b border-border p-4">
          <h1 className="text-xl font-bold text-foreground">Notifications</h1>
        </div>

        {/* Notifications Timeline */}
        <NotificationsTimeline />
      </div>
    </MainLayout>
  )
}
