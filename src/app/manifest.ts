import { MetadataRoute } from 'next'

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  return {
    name: 'Radar',
    short_name: 'Radar',
    description: 'Dashboard for AlertManager Prometheus',
    background_color: "#000000",
    display: 'standalone',
    display_override: [
      "window-controls-overlay"
    ],
    file_handlers: [],
    id: '/',
    launch_handler: {
      client_mode: "focus-existing"
    },
    prefer_related_applications: false,
    scope: '/',
    start_url: '/',
    theme_color: "#000000",
    icons: [
      {
        purpose: 'any',
        sizes: '192x192',
        src: 'icons/manifest-any-192x192.png',
        type: 'image/png',
      },
      {
        purpose: 'any',
        sizes: '256x256',
        src: 'icons/manifest-any-256x256.png',
        type: 'image/png',
      },
      {
        purpose: 'any',
        sizes: '384x384',
        src: 'icons/manifest-any-384x384.png',
        type: 'image/png',
      },
      {
        purpose: 'any',
        sizes: '512x512',
        src: 'icons/manifest-any-512x512.png',
        type: 'image/png',
      },
      {
        purpose: 'any',
        sizes: '1024x1024',
        src: 'icons/manifest-any-1024x1024.png',
        type: 'image/png',
      },
      {
        purpose: 'maskable',
        sizes: '192x192',
        src: 'icons/manifest-maskable-192x192.png',
        type: 'image/png',
      },
      {
        purpose: 'maskable',
        sizes: '256x256',
        src: 'icons/manifest-maskable-256x256.png',
        type: 'image/png',
      },
      {
        purpose: 'maskable',
        sizes: '384x384',
        src: 'icons/manifest-maskable-384x384.png',
        type: 'image/png',
      },
      {
        purpose: 'maskable',
        sizes: '512x512',
        src: 'icons/manifest-maskable-512x512.png',
        type: 'image/png',
      },
      {
        purpose: 'maskable',
        sizes: '1024x1024',
        src: 'icons/manifest-maskable-1024x1024.png',
        type: 'image/png',
      }
    ]
  }
}
