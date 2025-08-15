import type React from "react"
import { Sidebar } from "./sidebar"
import { TrendingSidebar } from "./trending-sidebar"

interface MainLayoutProps {
  children: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex min-h-screen bg-background">
      {/* Left Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 border-r border-border">{children}</main>

      {/* Right Sidebar */}
      <aside className="hidden lg:block">
        <TrendingSidebar />
      </aside>
    </div>
  )
}
