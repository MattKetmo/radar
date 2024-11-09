'use client'

import { useEffect } from "react"
import { usePathname, useSearchParams } from 'next/navigation'

export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Save the latest seen page to a cookie
  useEffect(() => {
    const path = `${pathname}${searchParams.toString() !== '' ? '?' + searchParams : ''}`
    document.cookie = `latest_page=${path}; path=/;`
  }, [pathname, searchParams])

  return children
}
