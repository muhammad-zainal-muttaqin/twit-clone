import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import { MainLayout } from "@/components/main-layout"
import { ProfileHeader } from "@/components/profile-header"
import { ProfileTabs } from "@/components/profile-tabs"

interface ProfilePageProps {
  params: {
    username: string
  }
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  // Get the current user
  const supabase = await createClient()
  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser()

  // If no user, redirect to login
  if (!currentUser) {
    redirect("/auth/login")
  }

  // Get profile data
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", params.username)
    .single()

  if (profileError || !profile) {
    notFound()
  }

  // Check if current user is following this profile
  let isFollowing = false
  if (currentUser.id !== profile.id) {
    const { data: followData } = await supabase
      .from("follows")
      .select("id")
      .eq("follower_id", currentUser.id)
      .eq("following_id", profile.id)
      .single()

    isFollowing = !!followData
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

  const processedTweets = tweets?.map((tweet) => ({
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
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="sticky top-0 bg-background/80 backdrop-blur-md border-b border-border p-4">
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
}
