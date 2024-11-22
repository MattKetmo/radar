'use client'

import { useTheme } from "next-themes"
import { useEffect } from "react"

const THEME_COLOR_DARK = '#020217'
const THEME_COLOR_LIGHT = '#FAFAFA'

// Set the theme color meta tag based on the current theme
export function AppThemeColor() {
  const { resolvedTheme } = useTheme()

  useEffect(() => {
    let themeColorMeta = document.querySelector(
      'meta[name="theme-color"]',
    ) as HTMLMetaElement

    if (!themeColorMeta) {
      themeColorMeta = document.createElement('meta')
      themeColorMeta.name = 'theme-color'
      document.head.appendChild(themeColorMeta)
    }

    themeColorMeta.content = resolvedTheme === 'dark' ? THEME_COLOR_DARK : THEME_COLOR_LIGHT
  }, [resolvedTheme])

  return null
}
