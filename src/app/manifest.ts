import { MetadataRoute } from 'next'

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  return {
    name: 'Radar',
    short_name: 'Radar',
    description: 'Dashboard for AlertManager Prometheus',
    start_url: '/',
    display: 'standalone',
    icons: [
      {
        src: '/app-icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      }
    ]
  }
}
