'use client'

import { Button } from "@/components/ui/button"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="en">
      <body>
        <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground px-4">
          <div className="max-w-md w-full rounded-lg shadow-lg border border-border p-8 text-center">
            <h1 className="text-2xl font-bold mb-4">Something went wrong</h1>
            <p className="text-sm text-muted-foreground mb-6 break-words">
              {error.message || "An unexpected error occurred"}
            </p>
            <Button onClick={reset} className="w-full">
              Try again
            </Button>
          </div>
        </div>
      </body>
    </html>
  )
}
