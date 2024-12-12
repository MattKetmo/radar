'use client'

import { useAlerts } from "@/contexts/alerts";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export function LogoutDetectedDialog() {
  const { logoutDetected } = useAlerts()

  return (
    <AlertDialog open={logoutDetected}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Looks like you've are logged out!
          </AlertDialogTitle>
          <AlertDialogDescription>
            App was unable to fetch alerts because you've been logged out.
            <br />
            Please refresh the page to log back in.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={() => window.location.reload()}>
            Refresh
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
