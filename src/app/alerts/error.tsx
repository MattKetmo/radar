'use client'

import { Button } from "@/components/ui/button"

export default function AlertsError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground px-4">
      <div className="max-w-md w-full rounded-lg shadow-lg border border-border p-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Failed to load alerts</h1>
        <p className="text-sm text-muted-foreground mb-6 break-words">
          {error.message || "An error occurred while loading alerts"}
        </p>
        <Button onClick={reset} className="w-full">
          Try again
        </Button>
      </div>
    </div>
  )
}
