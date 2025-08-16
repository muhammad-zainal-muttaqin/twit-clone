"use client"

import type React from "react"
import { useState } from "react"
import { Sidebar } from "./sidebar"
import { TrendingSidebar } from "./trending-sidebar"
import { useIsMobile } from "@/hooks/use-mobile"
import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"

interface MainLayoutProps {
  children: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const isMobile = useIsMobile()

  return (
    <div className="flex min-h-screen bg-background">
      {/* Mobile Menu Overlay */}
      {isMobile && isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      {/* Centered app container */}
      <div className="mx-auto w-full max-w-[1265px] flex">
        {/* Left Sidebar - Desktop: Always visible, Mobile: Drawer */}
        <div
          className={`
          ${
            isMobile
              ? `fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out ${
                  isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
                }`
              : "sticky top-0 h-screen"
          }
        `}
        >
          <Sidebar isMobile={isMobile} onClose={() => setIsMobileMenuOpen(false)} />
        </div>

        {/* Main Content */}
        <main className="flex-1 border-r border-border min-w-0">
          {/* Mobile Header with Menu Button */}
          {isMobile && (
            <div className="sticky top-0 z-30 flex items-center justify-between p-4 bg-background/80 backdrop-blur-md border-b border-border">
              <Button variant="ghost" size="sm" onClick={() => setIsMobileMenuOpen(true)} className="p-2">
                <Menu className="h-5 w-5" />
              </Button>
              <div className="flex items-center gap-2">
                <span className="font-bold text-foreground">Home</span>
              </div>
              <div className="w-9" /> {/* Spacer for centering */}
            </div>
          )}

          {children}
        </main>

        {/* Right Sidebar - show earlier (lg+) since left rail is compact */}
        <aside className="hidden lg:block w-[350px] sticky top-0 h-screen">
          <TrendingSidebar />
        </aside>
      </div>
    </div>
  )
}
