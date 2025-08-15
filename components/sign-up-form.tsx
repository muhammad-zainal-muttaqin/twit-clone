"use client"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Feather } from "lucide-react"
import Link from "next/link"
import { signUp } from "@/lib/actions"

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button
      type="submit"
      disabled={pending}
      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-6 text-lg font-medium rounded-full h-[60px]"
    >
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Signing up...
        </>
      ) : (
        "Sign Up"
      )}
    </Button>
  )
}

export default function SignUpForm() {
  // Initialize with null as the initial state
  const [state, formAction] = useActionState(signUp, null)

  return (
    <Card className="w-full max-w-md bg-card border-border">
      <CardHeader className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary">
            <Feather className="h-7 w-7 text-primary-foreground" />
          </div>
        </div>
        <CardTitle className="text-3xl font-bold text-card-foreground">Create an account</CardTitle>
        <p className="text-muted-foreground">Sign up to get started</p>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-6">
          {state?.error && (
            <div className="bg-destructive/10 border border-destructive/50 text-destructive px-4 py-3 rounded-lg">
              {state.error}
            </div>
          )}

          {state?.success && (
            <div className="bg-accent/10 border border-accent/50 text-accent px-4 py-3 rounded-lg">{state.success}</div>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-card-foreground">
                Email
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                required
                className="bg-input border-border text-card-foreground placeholder:text-muted-foreground"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-card-foreground">
                Password
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                className="bg-input border-border text-card-foreground"
              />
            </div>
          </div>

          <SubmitButton />

          <div className="text-center text-muted-foreground">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-primary hover:underline font-medium">
              Log in
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
