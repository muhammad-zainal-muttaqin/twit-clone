"use client"

import { useState, useEffect } from "react"
import { MainLayout } from "@/components/main-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { ArrowLeft, User, Bell, Shield, Palette, SettingsIcon, Trash2 } from "lucide-react"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useRouter } from "next/navigation"

interface Profile {
  id: string
  username: string
  display_name: string
  bio?: string
  location?: string
  website?: string
  avatar_url?: string
  verified: boolean
}

const sections = [
  { id: "account", icon: User, label: "Account" },
  { id: "notifications", icon: Bell, label: "Notifications" },
  { id: "privacy", icon: Shield, label: "Privacy" },
  { id: "display", icon: Palette, label: "Display" },
]

export default function SettingsPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [activeSection, setActiveSection] = useState("account")
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteConfirmation, setDeleteConfirmation] = useState("")
  const [displayName, setDisplayName] = useState("")
  const [bio, setBio] = useState("")
  const [location, setLocation] = useState("")
  const [website, setWebsite] = useState("")
  const [emailNotifications, setEmailNotifications] = useState(false)
  const [pushNotifications, setPushNotifications] = useState(false)
  const [privateAccount, setPrivateAccount] = useState(false)
  const [darkMode, setDarkMode] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch("/api/profile")
        if (response.ok) {
          const data = await response.json()
          const profileData = data.profile
          setProfile(profileData)
          setDisplayName(profileData.display_name || "")
          setBio(profileData.bio || "")
          setLocation(profileData.location || "")
          setWebsite(profileData.website || "")
          setEmailNotifications(profileData.email_notifications || false)
          setPushNotifications(profileData.push_notifications || false)
          setPrivateAccount(profileData.private_account || false)
          setDarkMode(profileData.dark_mode || false)
        }
      } catch (error) {
        console.error("Error fetching profile:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProfile()
  }, [])

  const handleSaveProfile = async () => {
    if (!profile) return

    setIsSaving(true)
    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          display_name: displayName,
          bio,
          location,
          website,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setProfile(data.profile)
        // Show success message (you could add a toast here)
      }
    } catch (error) {
      console.error("Error updating profile:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== "DELETE") {
      return
    }

    setIsDeleting(true)
    try {
      const response = await fetch("/api/account/delete", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        const data = await response.json()
        alert("Account deleted successfully. You will be redirected to the login page.")
        window.location.href = data.redirect || "/auth/login?message=account_deleted"
      } else {
        alert("Failed to delete account. Please try again.")
        console.error("Error deleting account")
      }
    } catch (error) {
      alert("An error occurred while deleting your account. Please try again.")
      console.error("Error deleting account:", error)
    } finally {
      setIsDeleting(false)
    }
  }

  if (isLoading) {
    return (
      <MainLayout>
        <div className="max-w-[525px] mx-auto">
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground mt-2">Loading settings...</p>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="max-w-[525px] mx-auto">
        {/* Header */}
        <div className="sticky top-0 bg-background/80 backdrop-blur-md border-b border-border p-4">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm" className="p-2">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <SettingsIcon className="h-6 w-6" />
              <h1 className="text-xl font-bold text-foreground">Settings</h1>
            </div>
          </div>
        </div>

        <div className="flex">
          {/* Sidebar */}
          <div className="w-80 border-r border-border p-4">
            <nav className="space-y-2">
              {sections.map((section) => (
                <Button
                  key={section.id}
                  variant="ghost"
                  className={`w-full justify-start gap-3 ${activeSection === section.id ? "bg-muted" : ""}`}
                  onClick={() => setActiveSection(section.id)}
                >
                  <section.icon className="h-5 w-5" />
                  {section.label}
                </Button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 p-6">
            {activeSection === "account" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">Account information</h2>
                  <p className="text-muted-foreground">Update your account details and profile information.</p>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Profile</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Profile Picture */}
                    <div className="flex items-center gap-4">
                      <Avatar className="h-20 w-20">
                        <AvatarImage src={profile?.avatar_url || "/placeholder.svg"} />
                        <AvatarFallback className="bg-muted text-muted-foreground text-xl">
                          {profile?.display_name?.charAt(0) || profile?.username?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <Button variant="outline" size="sm">
                          Change photo
                        </Button>
                        <p className="text-sm text-muted-foreground mt-1">JPG, GIF or PNG. Max size of 2MB.</p>
                      </div>
                    </div>

                    <Separator />

                    {/* Form Fields */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="username">Username</Label>
                        <Input id="username" value={profile?.username || ""} disabled className="bg-muted" />
                        <p className="text-sm text-muted-foreground">Username cannot be changed</p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="displayName">Display name</Label>
                        <Input
                          id="displayName"
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          placeholder="Your display name"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder="Tell us about yourself"
                        rows={3}
                      />
                      <p className="text-sm text-muted-foreground">{bio.length}/160</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="location">Location</Label>
                        <Input
                          id="location"
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                          placeholder="Where are you located?"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="website">Website</Label>
                        <Input
                          id="website"
                          value={website}
                          onChange={(e) => setWebsite(e.target.value)}
                          placeholder="https://yourwebsite.com"
                        />
                      </div>
                    </div>

                    <Button onClick={handleSaveProfile} disabled={isSaving}>
                      {isSaving ? "Saving..." : "Save changes"}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeSection === "notifications" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">Notifications</h2>
                  <p className="text-muted-foreground">Manage how you receive notifications.</p>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Email notifications</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Email notifications</p>
                        <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                      </div>
                      <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Push notifications</p>
                        <p className="text-sm text-muted-foreground">Receive push notifications in your browser</p>
                      </div>
                      <Switch checked={pushNotifications} onCheckedChange={setPushNotifications} />
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeSection === "privacy" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">Privacy and safety</h2>
                  <p className="text-muted-foreground">Control who can see your content and interact with you.</p>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Account privacy</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Private account</p>
                        <p className="text-sm text-muted-foreground">Only approved followers can see your tweets</p>
                      </div>
                      <Switch checked={privateAccount} onCheckedChange={setPrivateAccount} />
                    </div>
                  </CardContent>
                </Card>

                {/* Danger Zone Card for Account Deletion */}
                <Card className="border-destructive/50">
                  <CardHeader>
                    <CardTitle className="text-destructive flex items-center gap-2">
                      <Trash2 className="h-5 w-5" />
                      Danger Zone
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="font-medium text-destructive">Delete Account</p>
                      <p className="text-sm text-muted-foreground mb-4">
                        Permanently delete your account and all associated data. This action cannot be undone.
                      </p>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm">
                            Delete Account
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription className="space-y-2">
                              <p>
                                This action cannot be undone. This will permanently delete your account and remove all
                                your data from our servers.
                              </p>
                              <p>This includes:</p>
                              <ul className="list-disc list-inside text-sm space-y-1">
                                <li>All your tweets and replies</li>
                                <li>Your profile information</li>
                                <li>Your followers and following lists</li>
                                <li>All your messages and conversations</li>
                                <li>Your bookmarks and likes</li>
                              </ul>
                              <p className="font-medium mt-4">Type "DELETE" to confirm:</p>
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <div className="my-4">
                            <Input
                              placeholder="Type DELETE to confirm"
                              value={deleteConfirmation}
                              onChange={(e) => setDeleteConfirmation(e.target.value)}
                            />
                          </div>
                          <AlertDialogFooter>
                            <AlertDialogCancel onClick={() => setDeleteConfirmation("")}>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={handleDeleteAccount}
                              disabled={deleteConfirmation !== "DELETE" || isDeleting}
                              className="bg-destructive hover:bg-destructive/90"
                            >
                              {isDeleting ? "Deleting..." : "Delete Account"}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeSection === "display" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">Display</h2>
                  <p className="text-muted-foreground">Customize how Twitter looks for you.</p>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Appearance</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Dark mode</p>
                        <p className="text-sm text-muted-foreground">Use dark theme</p>
                      </div>
                      <Switch checked={darkMode} onCheckedChange={setDarkMode} />
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
