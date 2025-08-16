import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { MainLayout } from "@/components/main-layout"
import { ProfileHeader } from "@/components/profile-header"
import { ProfileTabs } from "@/components/profile-tabs"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ProfilePageProps {
  params: Promise<{
    username: string
  }>
}

function ProfileNotFound({ username }: { username: string }) {
  return (
    <MainLayout>
      <div className="max-w-[525px] mx-auto">
        <div className="sticky top-0 bg-background/80 backdrop-blur-md border-b border-border p-4">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm" className="rounded-full">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h1 className="text-xl font-bold text-foreground">Profile</h1>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center py-16 px-4">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground mb-2">This account doesn't exist</h2>
            <p className="text-muted-foreground mb-6">Try searching for another profile.</p>
            <Link href="/">
              <Button>Go back to Home</Button>
            </Link>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { username } = await params
  try {
    // Get the current user
    const supabase = await createClient()
    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser()

    // If no user, redirect to login
    if (!currentUser) {
      redirect("/auth/login")
    }

    if (!username || username.trim() === "") {
      return <ProfileNotFound username={username} />
    }

    // Get profile data
    const { data: profiles, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("username", username.trim())

    if (profileError) {
      console.log("[v0] Profile lookup error:", profileError.message)
      return <ProfileNotFound username={username} />
    }

    if (!profiles || profiles.length === 0) {
      console.log("[v0] Profile not found for username:", username)
      return <ProfileNotFound username={username} />
    }

    // Use the first profile if multiple exist
    const profile = profiles[0]

    // Check if current user is following this profile
    let isFollowing = false
    if (currentUser.id !== profile.id) {
      const { data: followData } = await supabase
        .from("follows")
        .select("id")
        .eq("follower_id", currentUser.id)
        .eq("following_id", profile.id)
        .limit(1)

      isFollowing = followData && followData.length > 0
    }

    // Get user's tweets
    const { data: tweets } = await supabase
      .from("tweets")
      .select(
        `
        *,
        profiles:user_id (
          id,
          username,
          display_name,
          avatar_url,
          verified
        )
      `,
      )
      .eq("user_id", profile.id)
      .is("reply_to", null)
      .order("created_at", { ascending: false })
      .limit(20)

    // Types for tweets returned from Supabase and UI-augmented tweets
    type DBTweet = {
      id: string
      user_id: string
      content: string
      created_at: string
      likes_count: number
      retweets_count: number
      replies_count: number
      reply_to?: string | null
      profiles: {
        id: string
        username: string
        display_name: string
        avatar_url?: string
        verified: boolean
      }
    }

    type UITweet = DBTweet & {
      like_count: number
      retweet_count: number
      reply_count: number
      user_liked: boolean
      user_retweeted: boolean
    }

    const processedTweets: UITweet[] | undefined = tweets?.map((tweet: DBTweet) => ({
      ...tweet,
      like_count: tweet.likes_count,
      retweet_count: tweet.retweets_count,
      reply_count: tweet.replies_count,
      user_liked: false, // TODO: Add user interaction check
      user_retweeted: false, // TODO: Add user interaction check
    }))

    const profileData = {
      ...profile,
      isFollowing,
      isCurrentUser: currentUser.id === profile.id,
    }

    return (
      <MainLayout>
        <div className="max-w-[525px] mx-auto">
          {/* Header */}
          <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-transparent p-4">
            <div>
              <h1 className="text-xl font-bold text-foreground">{profile.display_name || profile.username}</h1>
              <p className="text-sm text-muted-foreground">{profile.tweets_count} Tweets</p>
            </div>
          </div>

          {/* Profile Header */}
          <ProfileHeader profile={profileData} />

          {/* Profile Tabs */}
          <ProfileTabs profile={profileData} tweets={processedTweets || []} />
        </div>
      </MainLayout>
    )
  } catch (error) {
    console.log("[v0] ProfilePage error:", error)
    return <ProfileNotFound username={username} />
  }
}
